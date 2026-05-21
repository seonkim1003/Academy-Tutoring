import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { SUBJECTS } from "@academy/shared";
import { actionTokens } from "../schema";
import { consumeToken } from "../lib/tokens";
import {
  handleMatchAccepted,
  handleMatchDeclined,
} from "../lib/matchActions";
import type { HonoContext } from "../types";

const pub = new Hono<HonoContext>();

// ── GET /subjects — dropdown data for forms ───────────────────────────────────
pub.get("/subjects", (c) => {
  return c.json({ success: true, data: SUBJECTS });
});

// NOTE: anonymous POST /requests and POST /tutors have been removed.
// Submissions now go through the authenticated /api/me/* routes after
// Google sign-in. See apps/api/src/routes/me.ts.

// ── GET /actions/:token — validate a token and return its purpose ─────────────
pub.get("/actions/:token", async (c) => {
  const db = c.get("db");
  const token = c.req.param("token");
  const now = Math.floor(Date.now() / 1000);

  const [row] = await db
    .select()
    .from(actionTokens)
    .where(eq(actionTokens.token, token))
    .limit(1);

  if (!row || row.expiresAt < now) {
    return c.json({ success: false, error: "This link has expired or is invalid." }, 404);
  }
  if (row.consumedAt) {
    return c.json({ success: false, error: "This link has already been used." }, 410);
  }

  return c.json({ success: true, data: { purpose: row.purpose, targetId: row.targetId } });
});

// ── POST /actions/:token/match-accept ─────────────────────────────────────────
pub.post("/actions/:token/match-accept", async (c) => {
  const db = c.get("db");
  const token = c.req.param("token");

  const row = await consumeToken(db, token, "match_accept");
  if (!row) {
    return c.json({ success: false, error: "Invalid or expired link." }, 400);
  }

  await handleMatchAccepted(db, c.env, c.executionCtx, row.targetId);

  return c.json({ success: true });
});

// ── POST /actions/:token/match-decline ────────────────────────────────────────
pub.post("/actions/:token/match-decline", async (c) => {
  const db = c.get("db");
  const token = c.req.param("token");

  const row = await consumeToken(db, token, "match_decline");
  if (!row) {
    return c.json({ success: false, error: "Invalid or expired link." }, 400);
  }

  await handleMatchDeclined(db, c.executionCtx, row.targetId);

  return c.json({ success: true });
});

export default pub;
