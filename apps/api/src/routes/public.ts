import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and } from "drizzle-orm";
import { tuteeRequestSchema, tutorSignupSchema } from "@academy/shared";
import { SUBJECTS } from "@academy/shared";
import {
  tutees,
  tutors,
  tutorSubjects,
  tutorAvailability,
  requests,
  requestAvailability,
  subjects,
  actionTokens,
  matches,
} from "../schema";
import { rateLimit } from "../middleware/rateLimit";
import { consumeToken } from "../lib/tokens";
import type { HonoContext } from "../types";

const pub = new Hono<HonoContext>();

// ── GET /subjects — dropdown data for forms ───────────────────────────────────
pub.get("/subjects", (c) => {
  return c.json({ success: true, data: SUBJECTS });
});

// ── POST /requests — tutee submits a tutoring request ─────────────────────────
pub.post(
  "/requests",
  rateLimit({ limit: 5, windowSeconds: 60 * 10 }), // 5 per 10 min per IP
  zValidator("json", tuteeRequestSchema),
  async (c) => {
    const db = c.get("db");
    const body = c.req.valid("json");

    // Upsert tutee by email (returning student = same row)
    const existing = await db
      .select()
      .from(tutees)
      .where(eq(tutees.email, body.email))
      .limit(1);

    let tuteeId: number;
    if (existing.length > 0) {
      tuteeId = existing[0].id;
      await db
        .update(tutees)
        .set({ name: body.name, gradeLevel: body.gradeLevel })
        .where(eq(tutees.id, tuteeId));
    } else {
      const [inserted] = await db
        .insert(tutees)
        .values({
          name: body.name,
          email: body.email,
          gradeLevel: body.gradeLevel,
        })
        .returning({ id: tutees.id });
      tuteeId = inserted.id;
    }

    // Create the request
    const [newRequest] = await db
      .insert(requests)
      .values({
        tuteeId,
        subjectId: body.subjectId,
        classLevel: body.classLevel,
        currentGradePct: body.currentGradePct,
        needsDescription: body.needsDescription,
      })
      .returning({ id: requests.id });

    // Insert availability slots
    if (body.availability.length > 0) {
      await db.insert(requestAvailability).values(
        body.availability.map((slot) => ({
          requestId: newRequest.id,
          dayOfWeek: slot.dayOfWeek,
          startMinute: slot.startMinute,
          endMinute: slot.endMinute,
        }))
      );
    }

    return c.json({ success: true }, 201);
  }
);

// ── POST /tutors — tutor signup ───────────────────────────────────────────────
pub.post(
  "/tutors",
  rateLimit({ limit: 3, windowSeconds: 60 * 60 }), // 3 signups per hour per IP
  zValidator("json", tutorSignupSchema),
  async (c) => {
    const db = c.get("db");
    const body = c.req.valid("json");

    // Check for existing tutor
    const existing = await db
      .select()
      .from(tutors)
      .where(eq(tutors.email, body.email))
      .limit(1);

    let tutorId: number;
    if (existing.length > 0) {
      tutorId = existing[0].id;
      await db
        .update(tutors)
        .set({ name: body.name, gradeLevel: body.gradeLevel, bio: body.bio })
        .where(eq(tutors.id, tutorId));
      // Remove old subjects and availability to replace with new
      await db.delete(tutorSubjects).where(eq(tutorSubjects.tutorId, tutorId));
      await db.delete(tutorAvailability).where(eq(tutorAvailability.tutorId, tutorId));
    } else {
      const [inserted] = await db
        .insert(tutors)
        .values({
          name: body.name,
          email: body.email,
          gradeLevel: body.gradeLevel,
          bio: body.bio,
        })
        .returning({ id: tutors.id });
      tutorId = inserted.id;
    }

    await db.insert(tutorSubjects).values(
      body.subjects.map((s) => ({
        tutorId,
        subjectId: s.subjectId,
        maxLevel: s.maxLevel,
      }))
    );

    await db.insert(tutorAvailability).values(
      body.availability.map((slot) => ({
        tutorId,
        dayOfWeek: slot.dayOfWeek,
        startMinute: slot.startMinute,
        endMinute: slot.endMinute,
      }))
    );

    return c.json({ success: true }, 201);
  }
);

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

  await db
    .update(matches)
    .set({ status: "accepted", respondedAt: Math.floor(Date.now() / 1000) })
    .where(eq(matches.id, row.targetId));

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

  await db
    .update(matches)
    .set({ status: "declined", respondedAt: Math.floor(Date.now() / 1000) })
    .where(eq(matches.id, row.targetId));

  return c.json({ success: true });
});

export default pub;
