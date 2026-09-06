# Production Setup & Troubleshooting Guide

This guide documents the root causes and exact solutions for the production issues encountered during deployment of the **MarineCloudX Backend** and **Frontend**.

---

## Table of Contents

1. [Issue 1: PostgreSQL `permission denied for schema public` (Error 42501)](#issue-1-postgresql-permission-denied-for-schema-public-error-42501)
2. [Issue 2: `Cannot find module .../src/database/data-source.ts` in Production](#issue-2-cannot-find-module-srcdatabasedata-sourcets-in-production)
3. [Issue 3: `relation "Role" does not exist` on Fresh Database](#issue-3-relation-role-does-not-exist-on-fresh-database)
4. [Issue 4: Frontend 500 Error & `Minified React error #441`](#issue-4-frontend-500-error--minified-react-error-441)
5. [Issue 5: Swagger UI Blocked by Helmet CSP in Production](#issue-5-swagger-ui-blocked-by-helmet-csp-in-production)
6. [Complete Production Deployment Runbook](#complete-production-deployment-runbook)

---

## Issue 1: PostgreSQL `permission denied for schema public` (Error 42501)

### Symptom
```
QueryFailedError: permission denied for schema public
code: '42501'
query: CREATE TABLE "_migrations" ...
```

### Root Cause
In PostgreSQL 15+, non-superuser database users no longer receive automatic `CREATE` permissions on the `public` schema. When TypeORM attempts to create the `_migrations` table or entities, PostgreSQL rejects the query.

### Solution
Connect as the `postgres` superuser on the server and grant schema ownership and table privileges to the application database user:

```bash
sudo -u postgres psql -d marinecloudx_prod -c "
GRANT ALL ON SCHEMA public TO marinecloudx_prod_user;
GRANT USAGE, CREATE ON SCHEMA public TO marinecloudx_prod_user;
ALTER SCHEMA public OWNER TO marinecloudx_prod_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO marinecloudx_prod_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO marinecloudx_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO marinecloudx_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO marinecloudx_prod_user;
"
```

---

## Issue 2: `Cannot find module .../src/database/data-source.ts` in Production

### Symptom
```
Error: Unable to open file: "/var/www/marinecloudx/prod/src/database/data-source.ts". Cannot find module ...
```

### Root Cause
Production deployments only contain compiled JavaScript (`dist/`) and omit TypeScript sources (`src/`) and `devDependencies` (`tsx`). The default `npm run migration:run` command points to `./src/database/data-source.ts`.

### Solution
Run migrations against the compiled JavaScript file `data-source.js` using Node:

```bash
# If running inside /var/www/marinecloudx/prod:
node ./node_modules/typeorm/cli.js migration:run -d ./database/data-source.js

# Or if dist/ directory is present:
node ./node_modules/typeorm/cli.js migration:run -d ./dist/database/data-source.js
```

In `package.json`, production-specific scripts are available:
- `npm run migration:run:prod`
- `npm run migration:show:prod`
- `npm run seed:prod`

---

## Issue 3: `relation "Role" does not exist` on Fresh Database

### Symptom
```
QueryFailedError: relation "Role" does not exist
SELECT "RoleEntity"."id" ... FROM "Role" ...
```

### Root Cause
The `Baseline1786000000000` migration is a no-op migration designed to adopt an existing schema. On a **brand new, empty database**, no tables exist yet.

### Solution
Run the TypeORM synchronization command to create all 34 tables (entities + join tables) directly from the compiled entity metadata:

```bash
node -e "
const { AppDataSource } = require('./database/data-source.js');
async function sync() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  console.log('Creating all tables in PostgreSQL...');
  await AppDataSource.synchronize(false);
  console.log('All 34 tables created successfully!');
  await AppDataSource.destroy();
}
sync().catch(err => { console.error(err); process.exit(1); });
"
```

Followed by seeding system data:
```bash
node database/seeds/run.js
```

---

## Issue 4: Frontend 500 Error & `Minified React error #441`

### Symptom
- Browser console: `Error: Minified React error #441; visit https://react.dev/errors/441`
- Network tab: `GET https://marinecloudx.in/ 500 (Internal Server Error)`

### Root Cause
React Error #441 occurs when an **uncaught Promise rejection** happens during React Server Component (RSC) rendering. If backend API queries fail (e.g. database returning 500 or unreachable), the frontend content service threw an unhandled exception, causing Next.js to crash the entire server-side render.

### Solution
In `marineCloudX-frontend/src/features/content/services/content.ts`:
- Wrapped API fetch calls with `try/catch`.
- Provided graceful fallback data (e.g. empty arrays `[]`) instead of throwing uncaught exceptions.
- The marketing pages now render with empty states even if the backend is temporarily offline or undergoing maintenance.

---

## Issue 5: Swagger UI Blocked by Helmet CSP in Production

### Symptom
- Swagger docs (`/api/docs`) returning 404 in production, or Swagger UI assets failing to load due to Content Security Policy restrictions.

### Root Cause
1. `src/main.ts` previously had `if (appCfg.env !== "production")` wrapping `setupSwagger()`, disabling Swagger in production.
2. Helmet default CSP was active in production, which blocked Swagger UI's external styles (cdnjs) and custom search script.

### Solution
In `marineCloudX-backend/src/main.ts`:
```typescript
// 1. Relax CSP for Swagger UI assets
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// 2. Mount Swagger in all environments
setupSwagger(app, appCfg.port);
```

---

## Complete Production Deployment Runbook

### Step 1: Environment Variables (`.env`)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://marinecloudx_prod_user:<PASSWORD>@localhost:5432/marinecloudx_prod
DATABASE_SYNCHRONIZE=false
AUTH_SECRET=<YOUR_SECURE_AUTH_SECRET>
AUTH_COOKIE_NAME=mcx_session
CORS_ORIGINS=https://marinecloudx.in,https://www.marinecloudx.in,https://admin.marinecloudx.in
```

### Step 2: Grant PostgreSQL Permissions
```bash
sudo -u postgres psql -d marinecloudx_prod -c "
GRANT ALL ON SCHEMA public TO marinecloudx_prod_user;
GRANT USAGE, CREATE ON SCHEMA public TO marinecloudx_prod_user;
ALTER SCHEMA public OWNER TO marinecloudx_prod_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO marinecloudx_prod_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO marinecloudx_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO marinecloudx_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO marinecloudx_prod_user;
"
```

### Step 3: Schema Initialization & Migrations (One-Time for Fresh DB)
```bash
# 1. Create tables from entities
node -e "
const { AppDataSource } = require('./database/data-source.js');
async function sync() {
  await AppDataSource.initialize();
  await AppDataSource.synchronize(false);
  await AppDataSource.destroy();
}
sync().then(() => console.log('Schema ready'));
"

# 2. Register migration baseline
node ./node_modules/typeorm/cli.js migration:run -d ./database/data-source.js

# 3. Seed initial system data
node database/seeds/run.js
```

### Step 4: Start / Restart Backend
```bash
pm2 restart marinecloudx-prod
# OR
pm2 restart all
```

### Step 5: Verify Endpoints
```bash
# Health check
curl -i https://api.marinecloudx.in/health

# Swagger Docs
curl -i https://api.marinecloudx.in/api/docs

# Public Content API
curl -i https://api.marinecloudx.in/services
```
