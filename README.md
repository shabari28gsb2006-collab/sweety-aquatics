
> **Vercel single-project note:** import this repository with Framework Preset `Other` and Root Directory blank (`./`). The root `vercel.json` builds `frontend/` and routes `/api/*` to the Express function in `api/[...path].ts`. See [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) for exact setup and environment variables.

# Sweety Birds & Fishes — Full-stack Phase 1

This package combines the existing **Premium V2.5.1 frontend** with a new backend foundation.

## Structure

```text
sweety-fullstack-phase1/
├── frontend/   # existing React + Vite frontend
├── backend/    # Node.js + Express + TypeScript + Prisma API
├── docker-compose.yml
└── README.md
```

## What Phase 1 includes

- Node.js + Express + TypeScript backend
- PostgreSQL + Prisma
- Environment validation with Zod
- Helmet, CORS, JSON limits and rate limiting
- Central error handling
- Database health check
- Public product endpoints
- Tamil Nadu serviceable-PIN lookup foundation
- Full relational schema for users, products, carts, orders, payments, shipments, reviews, notifications, My Aquarium, reminders and support tickets
- Seller contact settings seeded with current business contact details
- Optional admin seed using environment variables
- No fake products and no invented courier PIN-code coverage

## 1. Start PostgreSQL

### Option A — Docker (recommended for local development)

From the project root:

```powershell
docker compose up -d
```

### Option B — Existing PostgreSQL / Neon / Supabase

Use your PostgreSQL connection string in `backend/.env`.

## 2. Configure backend

```powershell
cd backend
copy .env.example .env
```

Open `.env` and update `DATABASE_URL` if needed.

## 3. Install + initialize backend

```powershell
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Backend:

```text
http://localhost:4000
```

Health endpoint:

```text
http://localhost:4000/api/health
```

Expected success response:

```json
{
  "success": true,
  "message": "Sweety Birds & Fishes API is running",
  "data": {
    "api": "ok",
    "database": "ok"
  }
}
```

Products:

```text
GET http://localhost:4000/api/products
GET http://localhost:4000/api/products/:slug
```

PIN-code check:

```text
GET http://localhost:4000/api/serviceability/626125
```

The API startup imports the 205 verified Tamil Nadu Professional Couriers Pro EX PIN codes after migrations. The import is idempotent and preserves seller changes to existing records. Courier Pro EX coverage does not independently guarantee acceptance of live fish, so operational confirmation with the booking branch is still required.

## 4. Run frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

The frontend continues to use mock/localStorage services in Phase 1. We will migrate each service to the backend gradually instead of breaking the existing UI.

## Next phase

Phase 2 should implement:

1. Customer registration
2. Email OTP generation + verification
3. Login
4. Access + refresh tokens
5. Admin authentication
6. Role guards
7. Connect frontend authentication service to the API

## Important security notes

- Never commit `.env`.
- Payments use manual UPI verification; no payment-gateway keys are stored in the project.
- Email OTPs must be hashed before storage.
- Admin credentials are never embedded in frontend source.
- Courier serviceability must come from seller-verified data, not guessed PIN codes.


## SEO, favicon & custom storefront categories
- The frontend includes PNG favicons (16, 32, 48 px), multi-size ICO, Apple touch icon, Android icons, a web manifest, social sharing metadata, PetStore structured data, robots.txt and route-aware browser titles/descriptions.
- The source logo is exported as a 48 × 48 PNG favicon; the high-resolution brand mark remains available at `/sweety-brand-mark.png`.
- Seller custom categories are managed under **Admin → Store & Contact Settings → Create premium categories**. Upload a 1600 × 1000 px image, choose the existing product group to display, then **Save & Publish Categories**. Custom collections are stored in the ContactSettings JSON field and shown on the homepage.
- Apply the new `20260921100000_custom_store_categories` migration in production using the normal Prisma deployment step (`npx prisma migrate deploy` from `backend`).
- This is a client-rendered SPA: route-aware metadata improves browser/share context, but fully indexable per-product SEO at scale benefits from prerendering or SSR after the production domain is finalized.
