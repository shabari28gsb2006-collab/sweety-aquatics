# Sweety Aquatics — GitHub-safe source package

Prepared for pushing project source to GitHub. Local secrets and environment files are excluded.

## Push to GitHub
1. Extract this ZIP.
2. Add the extracted folder to GitHub Desktop (or open it in VS Code).
3. Review, commit, and push to your repository.
4. Add real environment variables only in your hosting provider's dashboard.

## Secret safety
Never commit `.env`, credentials, database URLs/passwords, API keys, JWT secrets, SMTP credentials, or private keys. Use `.env.example` templates as a checklist. Rotate any credential previously exposed in a public repository.

## Deployment reminder
Set the frontend production API base URL to your deployed HTTPS backend URL. A localhost API URL will not work for visitors. Email delivery requires valid backend email-provider credentials.
