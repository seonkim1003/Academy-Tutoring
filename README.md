# Academy Tutoring Program

A website to centralize and automate the peer tutoring program — request intake, tutor signup, matching, email notifications, session tracking, feedback, and analytics.

Built with: React + Vite + Tailwind (frontend) · Hono + Cloudflare Workers (backend) · Cloudflare D1 (database) · Resend (email)

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A Cloudflare account (free)
- A Resend account (free) — [resend.com](https://resend.com)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set up Cloudflare resources (one-time)
```bash
# Log in to Cloudflare
pnpm wrangler login

# Create the D1 database
pnpm wrangler d1 create academy-tutoring-db
# → Paste the database_id into apps/api/wrangler.toml

# Create the KV namespace
pnpm wrangler kv:namespace create academy-tutoring-kv
# → Paste the id into apps/api/wrangler.toml

# Set secrets
pnpm wrangler secret put RESEND_API_KEY         # from resend.com/api-keys
pnpm wrangler secret put SESSION_COOKIE_SECRET  # run: openssl rand -hex 32
```

### 3. Update wrangler.toml
In `apps/api/wrangler.toml`, replace all placeholder values:
- `REPLACE_WITH_D1_DATABASE_ID`
- `REPLACE_WITH_KV_NAMESPACE_ID`
- `yourschool.org` → your actual school email domain
- `tutoring@yourdomain.org` → your verified Resend sender
- `leadership@yourschool.org` → where reply-to emails go
- `https://yourdomain.org` → your site URL (use `http://localhost:5173` for local dev)

### 4. Run the database migration
```bash
cd apps/api
pnpm wrangler d1 migrations apply academy-tutoring-db --local
cd ../..
```

### 5. Seed subjects and dev data
```bash
pnpm wrangler d1 execute academy-tutoring-db --local --file scripts/seed-subjects.sql
pnpm wrangler d1 execute academy-tutoring-db --local --file scripts/seed-dev.sql
```
> Edit `scripts/seed-dev.sql` first — replace the admin email with your own school email.

### 6. Run locally
```bash
pnpm dev
```
- Web app: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:8787](http://localhost:8787)

---

## Project Structure

```
ACADEMY_WEBSITE/
├── apps/
│   ├── web/          # React + Vite frontend (Cloudflare Pages)
│   └── api/          # Hono Worker backend (Cloudflare Workers + D1)
├── packages/
│   └── shared/       # Zod schemas + constants shared by both apps
└── scripts/          # SQL seed files + future export scripts
```

## Deploy to Production

```bash
# 1. Apply migration to production D1
cd apps/api && pnpm wrangler d1 migrations apply academy-tutoring-db && cd ../..

# 2. Seed subjects in production
pnpm wrangler d1 execute academy-tutoring-db --file scripts/seed-subjects.sql

# 3. Add your admin account in production
pnpm wrangler d1 execute academy-tutoring-db \
  --command "INSERT INTO admins (name, email) VALUES ('Your Name', 'you@yourschool.org')"

# 4. Deploy API
cd apps/api && pnpm deploy && cd ../..

# 5. Deploy web
cd apps/web && pnpm deploy && cd ../..
```

## Adding a New Admin

```bash
pnpm wrangler d1 execute academy-tutoring-db \
  --command "INSERT INTO admins (name, email) VALUES ('New Leader', 'them@yourschool.org')"
```

## Backing Up the Database

```bash
pnpm wrangler d1 export academy-tutoring-db --output backup-$(date +%Y%m%d).sql
```

Run this at the end of each semester and save to the club Google Drive.
