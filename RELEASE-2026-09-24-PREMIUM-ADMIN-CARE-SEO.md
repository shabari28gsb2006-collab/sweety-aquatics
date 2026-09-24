# Sweety Aquatics — September 24, 2026 update

## Included
- Added a visible **Guppy Care Tips** tab in the admin console. It supports editing existing article title, subtitle, category, read time, summary, full JSON content, publication state, and banner image; save publishes updates to the API/database.
- Expanded backend admin care-article update endpoint with validation.
- Fixed analytics preflight configuration to permit `Cache-Control`/`Pragma` headers and removed the unnecessary custom no-cache request header from the analytics client.
- Refreshed the admin product catalog with a premium aquatic-gradient header and live catalog counts.
- Added canonical/social metadata, robots.txt, and sitemap.xml.
- Added reduced-motion-aware smooth scrolling and touch-action tuning; reduced admin notification polling frequency to limit background requests.
- Kept the single Vercel project structure with frontend build + Express API function.

## Deployment notes
- Vercel build requires root directory `./`, the repository root, with the root `vercel.json` settings.
- Configure all backend production environment variables from `.env.example` in Vercel. Set `FRONTEND_URL` to `https://sweety-aquatics.elzo.in` and `DATABASE_URL` to the working Neon connection string.
- Run Prisma migrations against the production database before expecting admin analytics/care article data to load.
- Analytics still requires reachable PostgreSQL and a valid authenticated admin session. The previous `P1001` Neon connectivity failure cannot be fixed by frontend code alone.
- Full remote deployment was not run from this package build environment; verify on Vercel after environment variables and database connectivity are confirmed.
