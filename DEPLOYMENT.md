# Production deployment

## Recommended topology

- Storefront: `https://sweety-aquatics.elzo.in`
- API: `https://api.sweety-aquatics.elzo.in`
- PostgreSQL: managed PostgreSQL with TLS, encrypted storage, automated backups and connection pooling
- Product images: Cloudinary or another durable private-account object store

The frontend and backend Dockerfiles are production multi-stage builds. `docker-compose.production.yml` is the deployment definition. The API container runs pending Prisma migrations before starting.

## Required configuration

Copy `backend/.env.example` to a secret environment configuration in the hosting platform. Never commit `.env` files.

Required production values include:

- `NODE_ENV=production`
- `FRONTEND_URL=https://sweety-aquatics.elzo.in`
- `DATABASE_URL` with PostgreSQL TLS enabled (`sslmode=require` when supported)
- separate 32+ character `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- `APP_ENCRYPTION_KEY` generated with `openssl rand -hex 32`
- production SMTP credentials for OTP delivery
- durable image storage configuration
- `COOKIE_SAME_SITE=lax` for same-site ELZO subdomains

Set build arguments:

- `VITE_API_BASE_URL=https://api.sweety-aquatics.elzo.in/api`
- `VITE_WHATSAPP_NUMBER` to the business WhatsApp number

## First deployment

1. Provision PostgreSQL with TLS, encryption at rest, backups and least-privilege credentials.
2. Configure all backend secrets in the host's secret manager.
3. Build and deploy the API container. Migrations and the safe 205-PIN courier import run automatically. Existing seller-controlled PIN status is preserved.
4. Run `npm run db:seed` once from a trusted deployment console only if the initial catalog, articles, contact settings or administrator must also be created. Do not run the full seed automatically on every release.
5. Build the frontend with the production API URL and deploy it.
6. Configure DNS and managed HTTPS for both subdomains.
7. Run `SMOKE_API_URL=https://api.sweety-aquatics.elzo.in SMOKE_WEB_URL=https://sweety-aquatics.elzo.in node scripts/production-smoke.mjs`.

## Release process

Every release must pass the included CI workflow: locked dependency installation, Prisma validation/client generation, TypeScript checks, production builds, dependency audits and courier-data verification. Take a database backup before schema changes and test restore procedures regularly.

## Security operations

- Enable database and hosting audit logs, alerts for elevated 4xx/5xx rates, and uptime monitoring on `/api/health/ready`.
- Rotate JWT, encryption, SMTP, database and storage credentials periodically and immediately after suspected exposure.
- Restrict production database/network access to the API service only.
- Never request or store UPI PINs, card PINs, CVVs, bank passwords, OTPs from banking apps or complete banking credentials.
- Payment screenshots are encrypted by the API with AES-256-GCM before database storage. Protect and back up `APP_ENCRYPTION_KEY` separately from the database.
- Retain unsuccessful payment audit records only as long as operationally and legally necessary.
