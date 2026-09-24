# Run Sweety Aquatics locally (Windows PowerShell)

## 1. Extract the ZIP

Extract the entire ZIP. Open the extracted `SWEETY-AQUATICS` folder in VS Code.

## 2. Configure the backend environment

Copy `backend/.env.example` to `backend/.env` and fill in valid development values, especially `DATABASE_URL`. Never upload `.env` to GitHub.

## 3. Install and prepare backend (one terminal)

From the repository root:

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Keep this terminal open. If your prompt already ends in `\backend`, do not run `cd backend` again—run the commands from that folder. If Prisma reports `P1001`, it cannot reach the configured database; verify the Neon project/connection string/network, then rerun migration.

## 4. Install and run frontend (a second terminal)

Open a new terminal at the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- Backend API: `http://localhost:4000/api`
- Vite dev server: `http://localhost:3000`
- A successful `db:seed` does not mean migrations succeeded. Make sure `migrate deploy` completes before testing database-backed login, care guides, products, or admin tools.
- If a package install or build fails, copy the first actual error (not only the final summary) for troubleshooting.
