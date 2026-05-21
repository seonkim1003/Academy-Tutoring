# What Still Needs to Be Done

This document tracks everything remaining from the build plan, organized by priority.
Complete Phase 1 before moving to later phases — it's shippable on its own.

> **Last updated:** Migration SQL written ✓ · Seed scripts written ✓ · Email wiring complete ✓ · Accept/decline routes complete ✓ · README + HANDOFF written ✓

---

## Immediate: Before Anything Runs

These are blockers. The project won't install or run without them.

### 1. Install dependencies
```bash
npm install -g pnpm        # if you don't have pnpm
pnpm install               # run from ACADEMY_WEBSITE root
```

### 2. Create Cloudflare resources (one-time setup)

You need a free Cloudflare account. Then:

```bash
# Install wrangler globally
pnpm add -g wrangler
wrangler login

# Create the D1 database
wrangler d1 create academy-tutoring-db
# → Copy the database_id it prints into apps/api/wrangler.toml

# Create the KV namespace
wrangler kv:namespace create academy-tutoring-kv
# → Copy the id it prints into apps/api/wrangler.toml

# Set secrets (run each of these and paste the value when prompted)
wrangler secret put RESEND_API_KEY          # from resend.com/api-keys
wrangler secret put SESSION_COOKIE_SECRET  # run: openssl rand -hex 32
```

### 3. Update wrangler.toml placeholders
In `apps/api/wrangler.toml`, replace:
- `REPLACE_WITH_D1_DATABASE_ID` with your actual D1 id
- `REPLACE_WITH_KV_NAMESPACE_ID` with your actual KV id
- `yourschool.org` with your actual school email domain
- `tutoring@yourdomain.org` with the email you'll send from
- `leadership@yourschool.org` with the admin reply-to address
- `https://yourdomain.org` with your actual site URL (or `http://localhost:5173` for local dev)

### 4. Run the database migration
The migration SQL file was never written — it needs to be generated from the Drizzle schema:

```bash
cd apps/api
pnpm db:generate        # generates migrations/0000_init.sql from src/schema/index.ts
pnpm db:migrate:local   # applies to local D1 (for dev)
```

### 5. Seed an admin account
No admin can log in until there's a row in the `admins` table. Run this once:

```bash
wrangler d1 execute academy-tutoring-db --local \
  --command "INSERT INTO admins (name, email, created_at) VALUES ('Your Name', 'you@yourschool.org', unixepoch())"
```

### 6. Fix the missing `drizzle-kit` D1 config
`apps/api/drizzle.config.ts` uses `driver: "d1-http"` which requires credentials for remote generation.
For local dev, change it to just:
```ts
dialect: "sqlite",
// remove driver line
```
Then re-add it when deploying to prod.

---

## Phase 1 Remaining Work

### Email integration (required for matching to be useful)
Right now `apps/api/src/routes/admin.ts` creates a match and generates tokens, but **never actually sends the confirmation emails** to the tutor and tutee. The comment says "TODO Phase 2" but it should be Phase 1.

You need to:
1. Sign up at [resend.com](https://resend.com) — free tier
2. Verify your domain (adds SPF/DKIM DNS records in Cloudflare)
3. In `apps/api/src/routes/admin.ts`, find the `POST /admin/matches` handler and replace the TODO comment with:

```ts
// Send to tutor
await sendEmail(c.env.RESEND_API_KEY, c.env.FROM_EMAIL, c.env.ADMIN_NOTIFICATION_EMAIL, {
  to: tutor.email,
  subject: `You've been matched for tutoring — ${subjectName}`,
  template: MatchConfirmationTutor({
    tutorName: tutor.name,
    tuteeName: tutee.name,
    subject: subjectName,
    acceptLink: `${c.env.WEB_URL}/actions/${acceptToken}/accept`,
    declineLink: `${c.env.WEB_URL}/actions/${declineToken}/decline`,
    adminEmail: c.env.ADMIN_NOTIFICATION_EMAIL,
  }),
});

// Send to tutee
await sendEmail(c.env.RESEND_API_KEY, c.env.FROM_EMAIL, c.env.ADMIN_NOTIFICATION_EMAIL, {
  to: tutee.email,
  subject: `You've been matched with a tutor!`,
  template: MatchConfirmationTutee({
    tuteeName: tutee.name,
    tutorName: tutor.name,
    subject: subjectName,
    adminEmail: c.env.ADMIN_NOTIFICATION_EMAIL,
  }),
});
```

You'll also need to JOIN to the tutee/tutor tables in that route to get their names/emails.

### One-click accept/decline frontend pages
The token links in emails point to `/actions/:token/accept` and `/actions/:token/decline` — these frontend routes don't exist yet.

Create `apps/web/src/routes/actions/accept.tsx` and `decline.tsx`:
- On load, call `POST /api/actions/:token/match-accept` (or decline)
- Show success or error message
- No form needed — just a confirmation screen

Add them to the router in `apps/web/src/App.tsx`.

### Subject seeding in the database
The `subjects` table is empty until you seed it. The subject list lives in `packages/shared/src/constants.ts`. Create a seed script:

```bash
# scripts/seed-subjects.ts — generate INSERT statements from constants.ts
# then run: wrangler d1 execute academy-tutoring-db --local --file seed-subjects.sql
```

Or run the inserts manually via wrangler CLI.

### Admin: send match emails needs tutor/tutee info
The `POST /admin/matches` route in `apps/api/src/routes/admin.ts` only has `tutorId` and `requestId`. Before sending emails it needs to look up:
- Tutor name + email from `tutors`
- Tutee name + email by joining `requests → tutees`
- Subject name from `SUBJECTS` constants

Add those queries before the email sending code.

### Local dev test run
Once the above is done:
```bash
pnpm dev   # from ACADEMY_WEBSITE root — starts both web (5173) and api (8787)
```
Submit a test request, sign up as a tutor, log in as admin, and click Match.

---

## Phase 2 (After Phase 1 is stable)

- **Sessions table**: Admin UI to schedule a session (date/time) for an accepted match
- **Session reminder cron**: Fill in `apps/api/src/cron/reminders.ts` — query sessions scheduled tomorrow, send reminder emails, update `reminder_sent_at`
- **Post-session feedback form**: Create `apps/web/src/routes/feedback.$token.tsx` — calls `POST /api/actions/:token/feedback`
- **Session log form**: Create `apps/web/src/routes/log-session.$token.tsx` — tutor submits topics covered
- **Feedback email**: After a session is marked complete, send the tutee a feedback-request email with a token link
- **Analytics**: Session counts per tutee, helpfulness averages — add endpoints + admin UI chart

---

## Phase 3 (Automation)

- **Auto-matcher**: When a request is submitted, automatically call `findMatchingSuggestions`, pick the top suggestion, create a match, and email the tutor — without admin action. Add a toggle in admin settings to enable/disable auto-matching.
- **Follow-up cron**: Fill in `apps/api/src/cron/followups.ts` — query matches in `proposed` status older than 48h and send a follow-up nudge to the tutor, notify admin if still no response at 96h
- **Decline fallback**: When a tutor declines, auto-try the next suggestion from `findMatchingSuggestions`

---

## Phase 4 (Analytics + Polish)

- **Grade improvement view**: Chart `current_grade_pct` vs `updated_grade_pct` per student, correlated with session count
- **Topic frequency**: Aggregate `topics_covered` from `session_logs` to find most-requested help areas
- **Year-over-year CSV export**: `scripts/export-csv.ts` — dump key tables to CSV for handoff
- **Public impact page** (optional): Anonymized stats page students can see

---

## Infrastructure / Deploy (when ready to go live)

1. **Register a domain** via Cloudflare Registrar (~$10/yr for `.org`)
2. **Create Cloudflare Pages project**: `wrangler pages project create academy-tutoring-web`
3. **Deploy API**: `pnpm deploy` from `apps/api`
4. **Deploy web**: `pnpm deploy` from `apps/web`
5. **Update `WEB_URL`** in `wrangler.toml` to the real domain
6. **Set up Resend domain verification** (SPF/DKIM/DMARC DNS records in Cloudflare)
7. **Run prod migration**: `pnpm db:migrate:prod` from `apps/api`
8. **Seed prod admin**: same INSERT command against prod (no `--local` flag)
9. **Warm up email sender**: send a test email to your school inbox before announcing

---

## Nice-to-Haves (not in the plan, but worth noting)

- **`scripts/seed-dev.ts`**: seed fake tutors/tutees/requests for local testing so you don't have to fill out forms manually every time
- **Error boundary** in React app — currently an unhandled API error crashes the whole page
- **Loading skeletons** instead of plain "Loading…" text in admin pages
- **Pagination** on admin lists — currently hard-capped at 200 rows
- **`HANDOFF.md`** doc — start writing it now, not at year-end (accounts list, deployment steps, how to rotate admin access)
