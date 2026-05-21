# Google Auth Verification Report

**Date:** 2026-05-21  
**Environment tested:** Local (`localhost:8787` + Vite proxy `localhost:5173`) and Production (Worker + Pages)

## Executive summary

| Area | Result | Notes |
|------|--------|-------|
| D1 schema (local) | **PASS** | `users`, `user_sessions` tables; migration `0001_user_auth.sql` applied |
| D1 schema (prod) | **PASS** | Applied via `wrangler d1 migrations apply --remote` |
| API auth routes (prod) | **PASS** | Deployed; `/api/auth/google` returns 302 to Google |
| Session + `/api/auth/me` | **PASS** | Synthetic session test (local) |
| Logout | **PASS** | Clears session; `/me` returns 401 after |
| Vite proxy + cookies (local) | **PASS** | `user_session` sent to `localhost:5173/api/auth/me` → 200 |
| OAuth redirect URI (local) | **PASS** | Uses `http://localhost:5173/api/auth/google/callback` when `API_PUBLIC_URL` set |
| Error redirects | **PASS** | `invalid_state`, `access_denied` → `/login?error=...` |
| Orphan claim detection | **PASS** | `pendingClaim: true` + `/api/me/claim-candidates` |
| **Live Google sign-in** | **BLOCKED** | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` still placeholders |
| Prod Google OAuth completion | **BLOCKED** | Requires real credentials in wrangler + `.dev.vars` |

## 1. Google Cloud OAuth audit

- **Client ID in repo:** `REPLACE_ME.apps.googleusercontent.com` in [apps/api/wrangler.toml](../apps/api/wrangler.toml)
- **Worker secrets (`wrangler secret list`):** `RESEND_API_KEY`, `SESSION_COOKIE_SECRET` only — **`GOOGLE_CLIENT_SECRET` not set**
- **Local `.dev.vars`:** Placeholders added; real values still needed
- **Setup guide:** [docs/GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

### Required redirect URIs (register all in Google Cloud Console)

1. `http://localhost:8787/api/auth/google/callback`
2. `http://localhost:5173/api/auth/google/callback` (Vite proxy)
3. `https://academy-tutoring-api.seonkim1003.workers.dev/api/auth/google/callback`

## 2. Code / config changes made during verification

1. **`API_PUBLIC_URL`** — optional env; local dev uses `http://localhost:5173` so OAuth callback and cookies are same-origin via Vite proxy.
2. **Cookie attributes** — `SameSite=Lax` (no `Secure`) when `API_PUBLIC_URL` is `http://localhost:*`.
3. **`apps/web/.env.local`** — leaves `VITE_API_ORIGIN` unset so `/api` uses Vite proxy.
4. **`db:migrate:prod`** — fixed to use `--remote` (was applying to local DB only).
5. **`apps/web` deploy script** — project name corrected to `academy-tutoring`.
6. **`scripts/verify-google-auth.sh`** — automated checks (no browser).

## 3. Local test results

### Automated (`bash scripts/verify-google-auth.sh`)

```
PASS: users table exists
PASS: redirects to Google
SKIP: GOOGLE_CLIENT_ID still REPLACE_ME
PASS: /api/auth/me returns 200 with test cookie
PASS: logout ok
PASS: me returns 401 after logout
PASS: prod API health
```

### OAuth start (manual curl)

```
GET http://localhost:8787/api/auth/google
→ Location: accounts.google.com?client_id=REPLACE_ME...&redirect_uri=http://localhost:5173/api/auth/google/callback
```

### Proxy cookie (Vite :5173)

```
Cookie: user_session=<test>
GET http://localhost:5173/api/auth/me → 200, user email in JSON
```

### Negative cases

| Test | Expected | Actual |
|------|----------|--------|
| `callback?code=x&state=bad` | `login?error=invalid_state` | PASS |
| `callback?error=access_denied` | `login?error=access_denied` | PASS |
| Logout after session | 401 on `/me` | PASS |
| Orphan tutor same email | `pendingClaim: true` | PASS |
| Email collision (full OAuth) | `email_already_linked...` | Not run — needs real Google token exchange |

### Live Google sign-in (browser)

**Not executed** — Google rejects `REPLACE_ME` client ID. After adding credentials to `.dev.vars`:

1. `pnpm dev`
2. Incognito → `http://localhost:5173/login` → Sign in with Google
3. Expect redirect to `/onboarding/role` (new user) or `/onboarding/claim` (orphan email)
4. DevTools → Application → Cookies → `localhost` → `user_session`
5. `wrangler d1 execute ... --local --command "SELECT * FROM users"`

## 4. Production test results

### Deployments performed

- **API:** `academy-tutoring-api` deployed (version `c2c02b6a-...`)
- **D1:** `0001_user_auth.sql` applied on remote
- **Pages:** `academy-tutoring` project — login route in bundle (`Sign in with Google`, `auth/google`)

### Prod OAuth start

```
GET https://academy-tutoring-api.seonkim1003.workers.dev/api/auth/google
→ 302, redirect_uri=https://academy-tutoring-api.seonkim1003.workers.dev/api/auth/google/callback
→ client_id=REPLACE_ME.apps.googleusercontent.com
```

### Prod error redirects

| Test | Result |
|------|--------|
| `access_denied` | `https://academy-tutoring.pages.dev/login?error=access_denied` |
| `invalid_state` | `https://academy-tutoring.pages.dev/login?error=invalid_state` |

### Prod D1 tables

```sql
SELECT name FROM sqlite_master WHERE name IN ('users','user_sessions');
-- users, user_sessions ✓
```

### Cross-origin cookies (prod)

Web: `academy-tutoring.pages.dev`  
API: `academy-tutoring-api.seonkim1003.workers.dev`  

Session cookie uses `SameSite=None; Secure` — should work with `credentials: 'include'` and CORS (configured in [apps/api/src/index.ts](../apps/api/src/index.ts)). **Confirm in browser after Google credentials are wired.**

### Pages env

`apps/web/.env.production` sets:

```
VITE_API_ORIGIN=https://academy-tutoring-api.seonkim1003.workers.dev
```

Verify this is set in Cloudflare Pages → **academy-tutoring** → Settings → Environment variables for Production.

## 5. Action required to unblock live Google sign-in

1. Create OAuth Web Client (see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)).
2. **Local:** paste Client ID + Secret into `apps/api/.dev.vars`.
3. **Prod:**
   - Set `GOOGLE_CLIENT_ID` in `wrangler.toml` (or `[vars]` in dashboard)
   - `cd apps/api && pnpm exec wrangler secret put GOOGLE_CLIENT_SECRET`
   - `pnpm --filter api run deploy`
4. Re-run browser test on prod: `https://academy-tutoring.pages.dev/login`

## 6. Re-run verification

```bash
pnpm dev   # in one terminal
bash scripts/verify-google-auth.sh
```

After Google credentials are configured, add a manual browser checklist to this doc with pass/fail.
