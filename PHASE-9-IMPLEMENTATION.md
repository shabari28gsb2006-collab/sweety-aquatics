# Phase 9 — Customer Experience Backend

## Verified starting state

The uploaded archive was named Phase 8 and contained substantial Phase 1–8 backend work. Prisma already defined several intended Phase 9 tables, but there were no routes/controllers for them and the matching frontend features used localStorage or frontend-only data. The backend also had five TypeScript compilation errors in order/payment services.

Important pre-existing limitations found during inspection and corrected in the final package:

- The seller product editor used frontend localStorage. It now uses protected PostgreSQL CRUD, duplication, archive, bulk stock/status/price and seller catalog APIs.
- The seller login was a frontend-only session marker. It now calls the protected ADMIN login endpoint.
- Product file selection produced browser-only data URLs. JPG/PNG/WebP files are now validated again by the backend, limited to 5 MB, written under `backend/uploads/products`, and exposed as server image URLs.
- Care articles now have a PostgreSQL model and public API. Existing bundled articles remain as a safe editorial fallback until they are imported into a configured database.
- A real database was not supplied, so database migrations and authenticated runtime/API integration could not be executed against PostgreSQL.
- No Prisma migration history was included in the uploaded archive; it currently uses the documented `prisma db push` workflow.

## Implemented

- Fixed all five existing backend TypeScript errors.
- Added ownership-aware availability-alert create/list/remove APIs and seller alert counts.
- Added PostgreSQL-backed recently viewed history.
- Connected My Aquarium to received guppy orders with one profile per order/product.
- Added ownership-aware aquarium nickname updates.
- Added feeding/water-change/care reminder create/list/update/delete APIs.
- Added customer notification list/read/read-all APIs.
- Added customer support ticket creation/history.
- Added protected seller ticket dashboard and reply flow; customer original messages are never edited.
- Added database-backed public contact settings and protected Edit → Save seller updates.
- Added server-side Buy Again with current status/stock validation and an atomic cart update.
- Added paid-order, ownership-protected invoice data and frontend printable invoice export.
- Added a conservative arrival care guide API without unsupported business guarantees.
- Removed product-catalog localStorage persistence and connected customer/seller catalog views to backend APIs.
- Added protected seller product CRUD, bulk operations, duplication, archive and backend image upload.
- Replaced frontend-only seller login with real ADMIN authentication.
- Added the database/API foundation for care articles.
- Preserved the existing aquarium landing design and customer navigation rules.

## Verification performed

- `prisma generate`: passed
- `prisma validate`: passed
- Backend TypeScript production build: passed
- Frontend TypeScript check: passed
- Frontend Vite production build: passed

Runtime database, SMTP, cookie/CORS, and end-to-end browser tests were not run because no reachable configured PostgreSQL/database environment or production credentials were included.

## Database update required before runtime testing

Configure `backend/.env`, then apply the updated Prisma schema to a development database using the project's current workflow:

```bash
cd backend
npm run prisma:generate
npm run db:push
npm run db:seed
```

Production migration history should be introduced during Phase 11 instead of using `db push` in production.
