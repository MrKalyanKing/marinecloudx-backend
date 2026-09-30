# AWS Lambda Deployment Guide (Linux x86_64)

This guide documents deploying the **MarineCloudX NestJS Backend** to **AWS Lambda**.

---

## 1. Lambda Function Configuration

In the [AWS Lambda Console](https://console.aws.amazon.com/lambda):

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Runtime** | `Node.js 22.x` (or `Node.js 20.x`) | Matches engine requirement `>=22.13.0` |
| **Architecture** | `x86_64` | **Required** for standard Linux x64 binaries |
| **Handler** | `dist/lambda.handler` | Points to exported handler in `dist/lambda.js` |
| **Timeout** | `30 seconds` | Allows cold-starts and long database transactions |
| **Memory** | `1024 MB` – `2048 MB` | 1024MB+ provides proportional CPU allocation for quick cold starts |
| **Ephemeral Storage** | `512 MB` (default) | Sufficient |

---

## 2. Environment Variables

Set the following environment variables in the AWS Lambda configuration (**Configuration** → **Environment variables**):

| Variable | Required | Example / Description |
| :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` |
| `NODE_OPTIONS` | **Yes (Crucial)** | `--experimental-require-module` (Allows CommonJS to load NestJS 12 ESM modules) |
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon, RDS, Supabase, etc.) |
| `AUTH_SECRET` | Yes | Minimum 32-byte secret (`openssl rand -base64 32`) |
| `AUTH_COOKIE_NAME`| Optional | Default: `mcx_session` |
| `CORS_ORIGINS` | Yes | Allowed web origins, e.g. `https://marinecloudx.in,https://admin.marinecloudx.in` |
| `DB_POOL_MAX` | Optional | Default is `2` on Lambda to avoid exhausting connection pools |
| `DISABLE_SWAGGER`| Optional | Set to `true` if you do not need Swagger UI on Lambda (further reduces cold start) |
| `AWS_S3_BUCKET` | For Media | S3 bucket name for CMS uploads |
| `AWS_S3_PUBLIC_URL`| For Media | CDN or public bucket URL |

---

## 3. Creating the Deployment Package for Linux x86_64

Because native dependencies (like `sharp`) require Linux ELF binaries:

### Option A: GitHub Actions (Recommended — Native Linux Runner)
A pre-configured GitHub Actions workflow is located at:
[`.github/workflows/build-lambda.yml`](file:///.github/workflows/build-lambda.yml)

- Runs on official `ubuntu-latest` (native Linux x86_64).
- Compiles the TypeScript project and packages production dependencies.
- Generates `lambda-build-linux-x64.zip` as a downloadable workflow artifact.
- (Optional) If you add `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_LAMBDA_FUNCTION_NAME` to your GitHub repository secrets, it will automatically deploy the code directly to your Lambda function on every push to `main`!

### Option B: Cross-Platform Packaging Script (Local)
You can also run:
```bash
npm run package:lambda
```
This runs [`scripts/package-lambda.mjs`](file:///scripts/package-lambda.mjs), which:
1. Compiles the TypeScript backend into `dist/`.
2. Downloads production dependencies targeting `--os=linux --cpu=x64 --libc=glibc` (including `@img/sharp-linux-x64`).
3. Creates `lambda-build-linux-x64.zip` with explicit POSIX (0o755 / 0o644) file permissions.

---

## 4. Trigger Configuration (API Gateway / Function URL)

### HTTP API (API Gateway v2) — Recommended
1. Add Trigger → **API Gateway**.
2. Select **HTTP API**.
3. Security: **Open** (the NestJS app handles authentication & authorization via guards).
4. Default route: `$default` (routes all requests to the Lambda function).

### Lambda Function URL
1. Under **Configuration** → **Function URL** → **Create function URL**.
2. Auth type: `NONE`.
3. Configure CORS: Allow methods (`GET`, `POST`, `PATCH`, `PUT`, `DELETE`, `OPTIONS`), Allow headers (`*`), Allow credentials (`true`).

---

## 5. Local Development vs Lambda

- **Local Development**: Run `npm run dev`. It boots `dist/main.js` on `http://localhost:3000` with live reload.
- **AWS Lambda**: AWS calls `dist/lambda.handler`. The application instance is cached across invocations so subsequent calls respond with sub-millisecond overhead.
