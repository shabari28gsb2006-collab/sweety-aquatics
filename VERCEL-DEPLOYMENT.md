# Sweety Aquatics — Single Vercel Project

This repository is structured for one Vercel project at the **repository root**. Do not set the Root Directory to `frontend`; doing so excludes the root API function from the normal project build.

1. Import `shabari28gsb2006-collab/sweety-aquatics` from GitHub.
2. Keep Root Directory blank (`./`) and Framework Preset auto-detected/Other if needed.
3. Keep the checked-in `vercel.json` build and install commands. It builds the frontend and backend TypeScript; `api/[...path].ts` exports the Express app for `/api/*`. The API function's native route handles API requests; the rewrite is only the SPA fallback.
4. Configure environment variables from `backend/.env.example` in Vercel. Never add actual secrets to GitHub.
5. Use a reachable PostgreSQL database and run `npx prisma migrate deploy` against it from a trusted terminal. Seed only when appropriate.
6. Set `FRONTEND_URL` to the exact deployed HTTPS origin, production-strength unique JWT secrets, a 64-character hex encryption key, SMTP values, and Cloudinary credentials.
7. Deploy, then test `/api/health`, customer login, admin login, care articles, and image upload.

## Care Guide Images
Admin Console → **Care Guide Images**. Upload JPG/PNG/WebP up to 5 MB each. Recommended 1200 × 750 px (16:10). Upload stages the image; click **Save Image** to publish the new URL to the care article.

## Important
A successful Vercel build does not prove the database, mail, or external image service is reachable. Validate each in the deployed environment.
