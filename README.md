# @marinecloudex/backend

SMIVORA / MarineCloudeX REST API — **NestJS + TypeORM + PostgreSQL**.

The **only** application permitted to talk to the database. `apps/frontend` and
`apps/admin` reach it over HTTP.

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:3001  (GET / and GET /health return the envelope)
```

For production deployment troubleshooting (PostgreSQL permissions, schema creation, migrations, and seeds), see [PRODUCTION_TROUBLESHOOTING.md](./PRODUCTION_TROUBLESHOOTING.md).

Self-contained: own `package.json`, lockfile, tsconfig and lint config. Nothing
imports from outside this folder. The shared wire contract is a committed copy at
`src/contracts/` (regenerated from the repo root with `npm run sync:contracts`).

## Structure (target — see `docs/monorepo-migration-plan.md`)

```
src/
├─ entities/     TypeORM entities (28), by domain
├─ modules/      auth · leads · contacts · tasks · crm · cms · media · conversations · reports · audit
├─ common/       guards · interceptors · filters · pipes · decorators
├─ database/     data-source.ts · migrations/ · seeds/
├─ config/       app · database · auth · storage
├─ app.module.ts
└─ main.ts
```

Currently a bare bootstrap (Phase 2). Envelope interceptor, validation pipe,
exception filter and CORS/helmet arrive in Phase 4; entities in Phase 5.
