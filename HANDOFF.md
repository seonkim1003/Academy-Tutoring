# Leadership Handoff Guide

**Read this before you graduate.** This document ensures the next Academy leadership can run the tutoring website without needing to contact you.

---

## Accounts to Transfer

Transfer ownership of all of these to the incoming leadership's shared club email.

| Service | What it's for | How to transfer |
|---|---|---|
| **Cloudflare** | Hosts the website, database, and API | Account Settings → Members → add new owner, remove yourself |
| **Resend** | Sends all program emails | Settings → Team → invite new leader, remove yourself |
| **GitHub** | Stores the code | Settings → Transfer repository to club org (or add new owner) |
| **Domain registrar** | The tutoring domain | Cloudflare Registrar → transfer or update contact info |

> **Important:** Use a shared club email for all accounts — not a personal one. Otherwise, the next leader can't recover access.

---

## How to Add a New Admin (Login Access)

Run this command (replace with the new leader's info):

```bash
pnpm wrangler d1 execute academy-tutoring-db \
  --command "INSERT INTO admins (name, email) VALUES ('New Leader Name', 'them@yourschool.org')"
```

Then remove yourself:
```bash
pnpm wrangler d1 execute academy-tutoring-db \
  --command "DELETE FROM admins WHERE email = 'you@yourschool.org'"
```

---

## Where Everything Lives

| Thing | Location |
|---|---|
| Code | GitHub repo (URL: _fill this in_) |
| Web app | Cloudflare Pages → project: `academy-tutoring-web` |
| API | Cloudflare Workers → worker: `academy-tutoring-api` |
| Database | Cloudflare D1 → database: `academy-tutoring-db` |
| Email | Resend dashboard → domain verified as `yourdomain.org` |
| DNS | Cloudflare DNS for `yourdomain.org` |

---

## Secrets (stored in Cloudflare, not in code)

These are set via `wrangler secret put` and never touch the codebase:

| Secret name | What it is |
|---|---|
| `RESEND_API_KEY` | Resend API key for sending emails |
| `SESSION_COOKIE_SECRET` | Random hex string for signing admin sessions |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (user sign-in) |

To update a secret:
```bash
pnpm wrangler secret put RESEND_API_KEY
# paste the new value when prompted
```

---

## Deploying a Code Change

1. Make your change in the code
2. Test locally: `pnpm dev`
3. Deploy:
   ```bash
   cd apps/api && pnpm deploy    # deploy the backend
   cd apps/web && pnpm deploy    # deploy the frontend
   ```
4. Visit the live site and verify the change works

---

## Rolling Back a Bad Deploy

```bash
# In Cloudflare dashboard:
# Workers → academy-tutoring-api → Deployments → click "Rollback" on a previous version
# Pages → academy-tutoring-web → Deployments → click "Rollback"
```

---

## End-of-Year Data Export

Run this before you leave to preserve program data for future analysis:

```bash
pnpm wrangler d1 export academy-tutoring-db --output backup-$(date +%Y%m%d).sql
```

Save the `.sql` file to the club's shared Google Drive folder. This lets future leadership analyze trends even if the tech changes.

---

## Updating the Subject List

Edit `packages/shared/src/constants.ts` — the `SUBJECTS` array. Then:
1. Add the new subject to the database: `INSERT INTO subjects (id, name, category) VALUES (...)`
2. Deploy the updated code

---

## "It Broke" Runbook

| Problem | Where to look |
|---|---|
| Forms not submitting | Cloudflare Workers → academy-tutoring-api → Logs |
| Emails not arriving | Resend dashboard → Logs → check for bounces/spam |
| "Session expired" on admin login | Magic link is 15 min; request a new one at `/admin/login` |
| Database error | Cloudflare D1 → academy-tutoring-db → check table structure |
| Site shows old version | Cloudflare Pages cache — force-redeploy or purge cache |

---

## Annual Checklist (do every May)

- [ ] Export database to Google Drive
- [ ] Transfer all accounts to new leadership's shared email
- [ ] Add new admin accounts, remove graduated ones
- [ ] Renew domain if it's expiring (check Cloudflare Registrar)
- [ ] Update `ADMIN_NOTIFICATION_EMAIL` in `wrangler.toml` to new leadership email
- [ ] Brief the incoming leaders — have them log in and run a test match

---

## Cost Summary

| Service | Cost |
|---|---|
| Domain | ~$10/yr (Cloudflare Registrar) |
| Hosting (Pages + Workers + D1) | $0 |
| Email (Resend) | $0 (up to 3,000/mo) |
| **Total** | **~$10/yr** |

If the program grows significantly, Resend's paid plan is $20/mo for 50,000 emails. Still well within budget.
