#!/usr/bin/env bash
# Automated checks for Google auth wiring (no browser). Run from repo root.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

API_LOCAL="${API_LOCAL:-http://localhost:8787}"
WEB_LOCAL="${WEB_LOCAL:-http://localhost:5173}"
WORKER_PROD="${WORKER_PROD:-https://academy-tutoring-api.seonkim1003.workers.dev}"

pass() { echo "PASS: $*"; }
fail() { echo "FAIL: $*"; exit 1; }
skip() { echo "SKIP: $*"; }

echo "=== D1 tables (local) ==="
pnpm --filter api exec wrangler d1 execute academy-tutoring-db --local \
  --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users','user_sessions');" \
  | grep -q users && pass "users table exists" || fail "users table missing — run db:migrate:local"

echo "=== OAuth start redirect (local API) ==="
if curl -sf -o /dev/null -w "%{http_code}" "$API_LOCAL/api/auth/google" 2>/dev/null | grep -q 302; then
  LOC=$(curl -sI "$API_LOCAL/api/auth/google" | tr -d '\r' | grep -i '^location:' | cut -d' ' -f2-)
  echo "  Location: $LOC"
  echo "$LOC" | grep -q 'accounts.google.com' && pass "redirects to Google" || fail "unexpected redirect"
  echo "$LOC" | grep -q 'REPLACE_ME' && skip "GOOGLE_CLIENT_ID still REPLACE_ME — set .dev.vars before live OAuth test"
else
  skip "API not running at $API_LOCAL — start with pnpm dev"
fi

echo "=== Session + /auth/me (synthetic, local) ==="
TOKEN="verify_test_$(date +%s)"
pnpm --filter api exec wrangler d1 execute academy-tutoring-db --local --command \
  "INSERT INTO users (google_sub, email, name) VALUES ('verify-sub-$TOKEN', 'verify+$TOKEN@test.local', 'Verify User');
   INSERT INTO user_sessions (token, user_id, expires_at)
   SELECT '$TOKEN', id, unixepoch()+86400 FROM users WHERE google_sub='verify-sub-$TOKEN';" >/dev/null

CODE=$(curl -s -o /tmp/me.json -w "%{http_code}" \
  -H "Cookie: user_session=$TOKEN" "$API_LOCAL/api/auth/me")
if [ "$CODE" = "200" ]; then
  pass "/api/auth/me returns 200 with test cookie"
  grep -q verify+$TOKEN@test.local /tmp/me.json && pass "response includes test user email"
else
  fail "/api/auth/me returned $CODE (expected 200)"
fi

echo "=== Logout clears session (local) ==="
curl -s -X POST -H "Cookie: user_session=$TOKEN" "$API_LOCAL/api/auth/logout" | grep -q '"success":true' \
  && pass "logout ok" || fail "logout failed"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Cookie: user_session=$TOKEN" "$API_LOCAL/api/auth/me")
[ "$CODE" = "401" ] && pass "me returns 401 after logout" || fail "session still valid after logout ($CODE)"

pnpm --filter api exec wrangler d1 execute academy-tutoring-db --local --command \
  "DELETE FROM user_sessions WHERE token='$TOKEN';
   DELETE FROM users WHERE google_sub='verify-sub-$TOKEN';" >/dev/null

echo "=== Prod health ==="
curl -sf "$WORKER_PROD/" | grep -q '"ok":true' && pass "prod API health" || skip "prod API unreachable"

echo "Done."
