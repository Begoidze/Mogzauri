# Mogzauri Production Runbook

## Required Environment Separation

- Use separate Neon projects or separate databases for `staging` and `production`.
- Never point local development or preview deployments at the production database.
- Store secrets only in the deployment provider environment settings.
- Required backend secrets:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET` once webhooks are enabled
  - `TURNSTILE_SECRET_KEY` if CAPTCHA is enabled
- Required frontend secrets:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` if CAPTCHA is enabled

## Database Backups And PITR

- Enable Neon point-in-time restore for the production project before accepting orders.
- Confirm daily backup retention and recovery window with the database plan.
- Test restore into a separate staging database before launch.
- Rotate the database password if it has ever been shared locally or exposed in logs.

## Migrations

- Development may use `prisma migrate dev`.
- Production deploys must use:

```bash
npm run db:migrate:deploy
```

- Run migrations against staging first.
- Take or verify a recent production restore point before running production migrations.
- Do not use `prisma db push` in production.

## Alcohol Compliance

- Age gate and checkout age confirmation are technical controls only.
- Terms, privacy, shipping, and refund policies must be reviewed by qualified legal counsel before production sales begin.
- Confirm where wine can legally be sold and shipped before enabling checkout for any region.
- Delivery workflow must require age verification where legally required.

## Security Operations

- Use a strong random `JWT_SECRET`; the backend refuses the placeholder secret.
- Keep `NODE_ENV=production` in production so cookies are marked `Secure`.
- Use HTTPS only.
- Review logs for authentication throttling and suspicious checkout attempts.
- Back auth throttling with Redis or provider edge rate limits if running more than one backend instance.
