# Google OAuth setup (required for sign-in)

## Audit checklist

| Item | Status |
|------|--------|
| OAuth client type: **Web application** | Verify in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| Redirect URI: `http://localhost:8787/api/auth/google/callback` | Required for direct wrangler dev |
| Redirect URI: `http://localhost:5173/api/auth/google/callback` | Required when using Vite proxy (`API_PUBLIC_URL`) |
| Redirect URI: `https://academy-tutoring-api.seonkim1003.workers.dev/api/auth/google/callback` | Required for production |
| Authorized JavaScript origin: `https://aosm-tutoring.org` | Required for production (canonical site) |
| Authorized JavaScript origin: `https://academy-tutoring.pages.dev` | Optional fallback URL |
| `GOOGLE_CLIENT_ID` in `apps/api/wrangler.toml` | Must not be `REPLACE_ME` for prod |
| `GOOGLE_CLIENT_SECRET` via `wrangler secret put` | Not yet set on Worker (see verification report) |
| `GOOGLE_CLIENT_SECRET` in `apps/api/.dev.vars` | Required for local OAuth |

## Create credentials

1. Google Cloud Console → **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
2. Application type: **Web application**.
3. **Authorized redirect URIs** — add all three URIs listed above.
4. **Authorized JavaScript origins** — add `https://aosm-tutoring.org` and optionally `https://academy-tutoring.pages.dev`.
5. Copy **Client ID** and **Client secret**.

## Wire locally

Edit `apps/api/.dev.vars`:

```
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
WEB_URL=http://localhost:5173
API_PUBLIC_URL=http://localhost:5173
```

`apps/web/.env.local` should leave `VITE_API_ORIGIN` unset (Vite proxies `/api` to the Worker).

## Wire production

```bash
# 1. Set client ID in wrangler.toml [vars] GOOGLE_CLIENT_ID=...
# 2. Set secret (interactive)
cd apps/api && pnpm exec wrangler secret put GOOGLE_CLIENT_SECRET
# 3. Deploy
pnpm exec wrangler deploy src/index.ts
```

## OAuth consent screen

If the app is in **Testing**, only test users added under OAuth consent screen can sign in.
