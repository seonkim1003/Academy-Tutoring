import { Hono, type Context } from "hono";
import { eq, and, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users, userSessions, tutors, tutees } from "../schema";
import { rateLimit } from "../middleware/rateLimit";
import { requireUser } from "../middleware/userAuth";
import type { HonoContext } from "../types";

const auth = new Hono<HonoContext>();

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const STATE_TTL_SECONDS = 600;
const SESSION_COOKIE_NAME = "user_session";

function cookieAttrs(c: Context<HonoContext>, maxAgeSeconds: number): string {
  const apiPublic = c.env.API_PUBLIC_URL?.replace(/\/$/, "");
  // Proxied local dev: same-site cookie on the Vite origin (http://localhost:5173)
  if (apiPublic?.startsWith("http://localhost")) {
    return `HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
  }
  return `HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${maxAgeSeconds}`;
}

function redirectUri(c: Context<HonoContext>): string {
  const apiPublic = c.env.API_PUBLIC_URL?.replace(/\/$/, "");
  if (apiPublic) return `${apiPublic}/api/auth/google/callback`;
  const url = new URL(c.req.url);
  return `${url.protocol}//${url.host}/api/auth/google/callback`;
}

// ── PKCE helpers (Web Crypto, Workers-safe) ───────────────────────────────────

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function randomB64url(byteLen = 32): string {
  const arr = new Uint8Array(byteLen);
  crypto.getRandomValues(arr);
  return b64urlEncode(arr);
}

async function sha256B64url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return b64urlEncode(digest);
}

// ── GET /google — kick off OAuth ──────────────────────────────────────────────

auth.get(
  "/google",
  rateLimit({ limit: 10, windowSeconds: 60 }),
  async (c) => {
    const state = randomB64url(16);
    const codeVerifier = randomB64url(32);
    const codeChallenge = await sha256B64url(codeVerifier);
    const next = c.req.query("next") || "/dashboard";

    await c.env.KV.put(
      `oauth_state:${state}`,
      JSON.stringify({ codeVerifier, next }),
      { expirationTtl: STATE_TTL_SECONDS }
    );

    const params = new URLSearchParams({
      client_id: c.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri(c),
      response_type: "code",
      scope: "openid email profile",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      access_type: "online",
      prompt: "select_account",
    });
    return c.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
  }
);

// ── GET /google/callback ──────────────────────────────────────────────────────

auth.get("/google/callback", async (c) => {
  const webUrl = c.env.WEB_URL;
  const fail = (code: string) =>
    c.redirect(`${webUrl}/login?error=${encodeURIComponent(code)}`);

  const errParam = c.req.query("error");
  if (errParam) return fail(errParam);

  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code || !state) return fail("missing_params");

  const stashedRaw = await c.env.KV.get(`oauth_state:${state}`);
  if (!stashedRaw) return fail("invalid_state");
  await c.env.KV.delete(`oauth_state:${state}`);
  const { codeVerifier, next } = JSON.parse(stashedRaw) as {
    codeVerifier: string;
    next?: string;
  };

  // Exchange code → tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(c),
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
  });
  if (!tokenRes.ok) return fail("token_exchange_failed");
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  // Fetch userinfo
  const uiRes = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  if (!uiRes.ok) return fail("userinfo_failed");
  const profile = (await uiRes.json()) as {
    sub: string;
    email: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!profile.email_verified) return fail("email_unverified");
  const email = profile.email.toLowerCase();

  const db = c.get("db");
  const now = Math.floor(Date.now() / 1000);

  // Find-or-create user (match on googleSub first, then check email collision)
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.googleSub, profile.sub))
    .limit(1);
  let newlyCreated = false;

  if (!user) {
    const [emailCollision] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (emailCollision) return fail("email_already_linked_to_other_google_account");

    const [inserted] = await db
      .insert(users)
      .values({
        googleSub: profile.sub,
        email,
        name: profile.name ?? email,
        picture: profile.picture ?? null,
        lastLoginAt: now,
      })
      .returning();
    user = inserted;
    newlyCreated = true;
  } else {
    await db
      .update(users)
      .set({
        email,
        name: profile.name ?? user.name,
        picture: profile.picture ?? user.picture,
        lastLoginAt: now,
      })
      .where(eq(users.id, user.id));
  }

  // Issue session
  const sessionToken = nanoid(48);
  await db.insert(userSessions).values({
    token: sessionToken,
    userId: user.id,
    expiresAt: now + SESSION_TTL_SECONDS,
  });
  c.header(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${sessionToken}; ${cookieAttrs(c, SESSION_TTL_SECONDS)}`
  );

  // Decide redirect destination
  let dest = next || "/dashboard";
  if (newlyCreated) {
    const [unclaimedTutor] = await db
      .select({ id: tutors.id })
      .from(tutors)
      .where(and(eq(tutors.email, email), isNull(tutors.userId)))
      .limit(1);
    const [unclaimedTutee] = await db
      .select({ id: tutees.id })
      .from(tutees)
      .where(and(eq(tutees.email, email), isNull(tutees.userId)))
      .limit(1);

    if (unclaimedTutor || unclaimedTutee) {
      dest = "/onboarding/claim";
    } else {
      dest = "/onboarding/role";
    }
  }
  return c.redirect(`${webUrl}${dest}`);
});

// ── POST /logout ──────────────────────────────────────────────────────────────

auth.post("/logout", requireUser, async (c) => {
  const db = c.get("db");
  const userId = c.get("userId")!;
  await db.delete(userSessions).where(eq(userSessions.userId, userId));
  c.header("Set-Cookie", `${SESSION_COOKIE_NAME}=; ${cookieAttrs(c, 0)}`);
  return c.json({ success: true });
});

// ── GET /me ───────────────────────────────────────────────────────────────────

auth.get("/me", requireUser, async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;

  const [tutorRow] = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(eq(tutors.userId, user.id))
    .limit(1);
  const [tuteeRow] = await db
    .select({ id: tutees.id })
    .from(tutees)
    .where(eq(tutees.userId, user.id))
    .limit(1);

  // Pending claim only matters if user has not yet linked the corresponding role.
  const [unclaimedTutor] = tutorRow
    ? [null]
    : await db
        .select({ id: tutors.id })
        .from(tutors)
        .where(and(eq(tutors.email, user.email), isNull(tutors.userId)))
        .limit(1);
  const [unclaimedTutee] = tuteeRow
    ? [null]
    : await db
        .select({ id: tutees.id })
        .from(tutees)
        .where(and(eq(tutees.email, user.email), isNull(tutees.userId)))
        .limit(1);

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      roles: {
        isTutor: !!tutorRow,
        isTutee: !!tuteeRow,
      },
      pendingClaim: !!(unclaimedTutor || unclaimedTutee),
    },
  });
});

export default auth;
