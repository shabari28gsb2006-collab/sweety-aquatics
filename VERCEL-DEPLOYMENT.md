# Sweety Aquatics — Single-project Vercel deployment

## Deploy (one Vercel project)
1. Push this repository to GitHub.
2. In Vercel, **Add New → Project**, import this repository.
3. Keep the **Root Directory** as `./` (repository root).
4. Vercel uses the included `vercel.json`; do not override Build/Install commands.
5. Add the variables listed in `.env.example` under Vercel → Settings → Environment Variables. Use real production values only in Vercel. Set `FRONTEND_URL` to the deployed HTTPS domain.
6. Set `IMAGE_STORAGE_PROVIDER=cloudinary` and configure Cloudinary. Serverless filesystem uploads are not durable.
7. Deploy. API routes are served by the Express catch-all at `/api/*`; the React SPA is served for other routes. No separate backend Vercel project is needed.

## Database
Use a reachable PostgreSQL provider. From a trusted local terminal, configure `backend/.env` (never commit it), then run:
```bash
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```
Do not run destructive schema reset commands against production.

## Local development
Terminal 1: `cd backend && npm run dev`
Terminal 2: `cd frontend && npm run dev`

## GitHub safety
`.gitignore` excludes `.env*` (except `.env.example`), credentials, dependencies, build outputs, Vercel state and logs. Verify no secrets before pushing. Rotate any credential that was ever committed.

## Care guide images
Admin Console → **Care Guide Images**. Upload JPG/PNG/WebP, maximum 5 MB; recommended 1200 × 750 px (16:10). Uploaded image is staged until **Save Image** is clicked.
