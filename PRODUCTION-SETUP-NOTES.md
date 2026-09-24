# Production setup notes (read before deploying)

## Frontend/API
The previous production build incorrectly defaulted to `http://localhost:4000/api`. That points to each visitor's own device and causes the browser loopback/CORS error. Production code now defaults to same-origin `/api` instead; for a separately hosted backend, set `VITE_API_BASE_URL` in Vercel to the backend's public HTTPS API URL ending in `/api`, then redeploy. The backend must be deployed and reachable; this ZIP cannot provide a live backend URL or credentials.

## Email to admin
Set `BUSINESS_EMAIL` to the admin inbox and configure valid `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and verified `SMTP_FROM` on the backend host. Payment-verification email is routed to `BUSINESS_EMAIL`. Email delivery cannot be verified until real SMTP credentials are configured and a live test is sent.

## Secrets
Do not commit `.env` files, database credentials, JWT secrets, SMTP passwords, or Cloudinary secrets to GitHub. Only `.env.example` templates are included. Add real values directly in the deployment provider's Environment Variables. Rotate any credentials that were previously committed or shared.

## Guppy care content
The care hub now has built-in article fallback content, so existing guides remain visible if the API is temporarily unavailable. Server-managed articles will replace the built-in list when the API responds with articles.
