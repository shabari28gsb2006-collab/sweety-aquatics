# Sweety Aquatics — GitHub Push & Vercel Deployment

## Included
- Full frontend and backend source, API function, `vercel.json`, lockfiles, Prisma schema/migrations and seed data (including demo products).
- `.env.example` templates only.

## Security
- Real `.env*` files, credentials, keys, dependency folders, build output, and `.vercel` state are excluded.
- Never commit production secrets. Add them in **Vercel → Project → Settings → Environment Variables**.

## Push to GitHub
1. Extract this ZIP.
2. Open the extracted project root (the folder containing `vercel.json` and `package.json`).
3. Create/open your GitHub repository and upload the project files/folders from this root, or run `git init`, `git add .`, `git commit -m "Prepare Sweety Aquatics for deployment"`, then add your repository as `origin` and push.
4. Confirm `vercel.json` is at the repository root.

## Vercel
- Import the GitHub repository as a **single project** with Root Directory set to the repository root.
- The frontend defaults to same-origin `/api` in production; do not set a localhost API URL in Vercel.
- Attach both domains to the same Vercel project: `https://sweety-aquatics.elzo.in` and `https://sweety-aquatics.vercel.app`.
- Configure production environment variables using the root/backend `.env.example` templates and your own real credentials.
- Confirm the Neon database is reachable and migrations have been applied before testing live admin, products, care tips, and analytics.

## Demo products
The Prisma seed catalog is retained. Seed data does not automatically overwrite an existing production database unless you run the seed command.
