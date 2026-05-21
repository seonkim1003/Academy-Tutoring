import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { nanoid } from "nanoid";
import { adminLoginSchema, SUBJECTS } from "@academy/shared";
import {
  admins,
  adminSessions,
  requests,
  tutors,
  tutees,
  matches,
  auditLog,
} from "../schema";
import { requireAdmin } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimit";
import { sendEmail, emailEnvTag } from "../lib/email";
import { MatchConfirmationTutor } from "../emails/MatchConfirmation";
import { findMatchingSuggestions } from "../lib/matching";
import { createToken } from "../lib/tokens";
import {
  getMatchNotificationContext,
  listAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notifyMatchCreated,
  notifyMatchExpiredOrCancelled,
} from "../lib/notifications";
import type { HonoContext } from "../types";

const admin = new Hono<HonoContext>();

// ── Auth ──────────────────────────────────────────────────────────────────────

admin.post(
  "/login",
  rateLimit({
    limit: 5,
    windowSeconds: 60 * 60,
    keyFn: (c) => `admin-login:${c.req.header("cf-connecting-ip") ?? "unknown"}`,
  }),
  zValidator("json", adminLoginSchema),
  async (c) => {
    const db = c.get("db");
    const { email } = c.req.valid("json");

    const [adminRow] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    // Always return 200 to prevent email enumeration
    if (!adminRow) {
      return c.json({ success: true });
    }

    const token = nanoid(32);
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + 15 * 60; // 15 minutes

    await db.insert(adminSessions).values({
      token,
      adminId: adminRow.id,
      expiresAt,
    });

    const magicLink = `${c.env.WEB_URL}/admin/verify?token=${token}`;

    // Import email template lazily to avoid circular deps
    const { MagicLinkEmail } = await import("../emails/MagicLinkEmail");
    await sendEmail(
      c.env.RESEND_API_KEY,
      c.env.FROM_EMAIL,
      c.env.ADMIN_NOTIFICATION_EMAIL,
      {
        to: email,
        subject: "Your Academy Tutoring admin login link",
        template: MagicLinkEmail({ adminName: adminRow.name, magicLink }),
      },
      emailEnvTag(c.env.WEB_URL)
    );

    return c.json({ success: true });
  }
);

admin.get("/verify", async (c) => {
  const token = c.req.query("token");
  if (!token) return c.json({ success: false, error: "Missing token" }, 400);

  const db = c.get("db");
  const now = Math.floor(Date.now() / 1000);

  const [session] = await db
    .select()
    .from(adminSessions)
    .where(eq(adminSessions.token, token))
    .limit(1);

  if (!session || session.expiresAt < now) {
    return c.json({ success: false, error: "Link expired or invalid." }, 401);
  }

  // Rotate: create a fresh 7-day session, delete the magic-link one
  const sessionToken = nanoid(48);
  await db
    .update(adminSessions)
    .set({
      token: sessionToken,
      expiresAt: now + 7 * 24 * 60 * 60,
    })
    .where(eq(adminSessions.token, token));

  await db
    .update(admins)
    .set({ lastLoginAt: now })
    .where(eq(admins.id, session.adminId));

  c.header(
    "Set-Cookie",
    `admin_session=${sessionToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  );

  return c.json({ success: true });
});

admin.post("/logout", requireAdmin, async (c) => {
  const db = c.get("db");
  const adminId = c.get("adminId")!;

  // Delete all sessions for this admin
  await db.delete(adminSessions).where(eq(adminSessions.adminId, adminId));

  c.header(
    "Set-Cookie",
    "admin_session=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0"
  );
  return c.json({ success: true });
});

// ── Requests ──────────────────────────────────────────────────────────────────

admin.get("/requests", requireAdmin, async (c) => {
  const db = c.get("db");
  const status = c.req.query("status") ?? undefined;

  const rows = await db
    .select({
      id: requests.id,
      status: requests.status,
      classLevel: requests.classLevel,
      currentGradePct: requests.currentGradePct,
      needsDescription: requests.needsDescription,
      createdAt: requests.createdAt,
      subjectId: requests.subjectId,
      tuteeName: tutees.name,
      tuteeEmail: tutees.email,
    })
    .from(requests)
    .leftJoin(tutees, eq(requests.tuteeId, tutees.id))
    .orderBy(desc(requests.createdAt))
    .limit(200);

  const filtered = status ? rows.filter((r) => r.status === status) : rows;
  return c.json({ success: true, data: filtered });
});

admin.get("/requests/:id/suggestions", requireAdmin, async (c) => {
  const db = c.get("db");
  const requestId = Number(c.req.param("id"));

  const [req] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId))
    .limit(1);

  if (!req) return c.json({ success: false, error: "Request not found" }, 404);

  const suggestions = await findMatchingSuggestions(
    db,
    requestId,
    req.subjectId,
    req.classLevel
  );

  return c.json({ success: true, data: suggestions });
});

// ── Tutors ────────────────────────────────────────────────────────────────────

admin.get("/tutors", requireAdmin, async (c) => {
  const db = c.get("db");
  const rows = await db
    .select()
    .from(tutors)
    .orderBy(desc(tutors.createdAt));

  return c.json({ success: true, data: rows });
});

admin.patch(
  "/tutors/:id",
  requireAdmin,
  zValidator("json", z.object({ active: z.boolean() })),
  async (c) => {
    const db = c.get("db");
    const id = Number(c.req.param("id"));
    const { active } = c.req.valid("json");

    await db.update(tutors).set({ active }).where(eq(tutors.id, id));
    return c.json({ success: true });
  }
);

// ── Matches ───────────────────────────────────────────────────────────────────

admin.get("/matches", requireAdmin, async (c) => {
  const db = c.get("db");
  const rows = await db
    .select({
      id: matches.id,
      status: matches.status,
      proposedDayOfWeek: matches.proposedDayOfWeek,
      proposedStartMinute: matches.proposedStartMinute,
      proposedEndMinute: matches.proposedEndMinute,
      createdAt: matches.createdAt,
      respondedAt: matches.respondedAt,
      tutorName: tutors.name,
      tutorEmail: tutors.email,
      requestId: matches.requestId,
    })
    .from(matches)
    .leftJoin(tutors, eq(matches.tutorId, tutors.id))
    .orderBy(desc(matches.createdAt))
    .limit(200);

  return c.json({ success: true, data: rows });
});

const createMatchSchema = z.object({
  requestId: z.number().int(),
  tutorId: z.number().int(),
  proposedDayOfWeek: z.number().int().min(0).max(6).optional(),
  proposedStartMinute: z.number().int().optional(),
  proposedEndMinute: z.number().int().optional(),
});

admin.post(
  "/matches",
  requireAdmin,
  zValidator("json", createMatchSchema),
  async (c) => {
    const db = c.get("db");
    const adminId = c.get("adminId")!;
    const body = c.req.valid("json");

    // Fetch tutor + request + tutee data needed for emails
    const [[tutorRow], [requestRow]] = await Promise.all([
      db.select().from(tutors).where(eq(tutors.id, body.tutorId)).limit(1),
      db
        .select({
          id: requests.id,
          subjectId: requests.subjectId,
          tuteeId: requests.tuteeId,
        })
        .from(requests)
        .where(eq(requests.id, body.requestId))
        .limit(1),
    ]);

    if (!tutorRow || !requestRow) {
      return c.json({ success: false, error: "Tutor or request not found." }, 404);
    }

    const [tuteeRow] = await db
      .select()
      .from(tutees)
      .where(eq(tutees.id, requestRow.tuteeId))
      .limit(1);

    if (!tuteeRow) {
      return c.json({ success: false, error: "Tutee not found." }, 404);
    }

    const subjectName =
      SUBJECTS.find((s) => s.id === requestRow.subjectId)?.name ??
      requestRow.subjectId;

    // Insert the match
    const [match] = await db
      .insert(matches)
      .values({
        requestId: body.requestId,
        tutorId: body.tutorId,
        proposedDayOfWeek: body.proposedDayOfWeek,
        proposedStartMinute: body.proposedStartMinute,
        proposedEndMinute: body.proposedEndMinute,
      })
      .returning();

    // Mark request as matched
    await db
      .update(requests)
      .set({ status: "matched" })
      .where(eq(requests.id, body.requestId));

    // Create accept/decline tokens for the tutor
    const [acceptToken, declineToken] = await Promise.all([
      createToken(db, "match_accept", match.id),
      createToken(db, "match_decline", match.id),
    ]);

    // Build one-click links
    const acceptLink = `${c.env.WEB_URL}/actions/${acceptToken}/accept`;
    const declineLink = `${c.env.WEB_URL}/actions/${declineToken}/decline`;

    // In-app notifications (fire-and-forget)
    c.executionCtx.waitUntil(
      notifyMatchCreated(db, {
        matchId: match.id,
        requestId: body.requestId,
        subjectName,
        tuteeName: tuteeRow.name,
        tutorUserId: tutorRow.userId,
      }).catch((err) => console.error("Notification create failed:", err))
    );

    // Email tutor only — tutee is notified after tutor accepts
    c.executionCtx.waitUntil(
      sendEmail(
        c.env.RESEND_API_KEY,
        c.env.FROM_EMAIL,
        c.env.ADMIN_NOTIFICATION_EMAIL,
        {
          to: tutorRow.email,
          subject: `You've been matched for tutoring — ${subjectName}`,
          template: MatchConfirmationTutor({
            tutorName: tutorRow.name,
            tuteeName: tuteeRow.name,
            tuteeGradeLevel: tuteeRow.gradeLevel,
            subject: subjectName,
            acceptLink,
            declineLink,
            adminEmail: c.env.ADMIN_NOTIFICATION_EMAIL,
          }),
        },
        emailEnvTag(c.env.WEB_URL)
      ).catch((err) => console.error("Email send failed:", err))
    );

    // Audit
    await db.insert(auditLog).values({
      adminId,
      action: "create_match",
      targetTable: "matches",
      targetId: match.id,
      metadata: JSON.stringify({ ...body, tutorEmail: tutorRow.email, tuteeEmail: tuteeRow.email }),
    });

    return c.json({ success: true, data: { matchId: match.id } }, 201);
  }
);

admin.post("/matches/:id/cancel", requireAdmin, async (c) => {
  const db = c.get("db");
  const adminId = c.get("adminId")!;
  const matchId = Number(c.req.param("id"));
  if (!Number.isFinite(matchId)) {
    return c.json({ success: false, error: "Invalid id" }, 400);
  }

  const [existing] = await db
    .select({ id: matches.id, status: matches.status })
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1);

  if (!existing) {
    return c.json({ success: false, error: "Match not found" }, 404);
  }
  if (existing.status === "cancelled" || existing.status === "completed") {
    return c.json(
      { success: false, error: `Match is already ${existing.status}` },
      409
    );
  }

  await db
    .update(matches)
    .set({ status: "cancelled", respondedAt: Math.floor(Date.now() / 1000) })
    .where(eq(matches.id, matchId));

  const ctx = await getMatchNotificationContext(db, matchId);
  if (ctx) {
    const tuteeUserId =
      existing.status === "accepted" ? ctx.tuteeUserId : null;
    c.executionCtx.waitUntil(
      notifyMatchExpiredOrCancelled(db, {
        type: "match_cancelled",
        matchId: ctx.matchId,
        requestId: ctx.requestId,
        subjectName: ctx.subjectName,
        tutorUserId: ctx.tutorUserId,
        tuteeUserId,
      }).catch((err) => console.error("Notification create failed:", err))
    );
  }

  await db.insert(auditLog).values({
    adminId,
    action: "cancel_match",
    targetTable: "matches",
    targetId: matchId,
  });

  return c.json({ success: true });
});

// ── Notifications ───────────────────────────────────────────────────────────────

admin.get("/notifications", requireAdmin, async (c) => {
  const db = c.get("db");
  const adminId = c.get("adminId")!;
  const cursor = c.req.query("cursor");
  const limit = c.req.query("limit")
    ? Number(c.req.query("limit"))
    : undefined;

  const data = await listAdminNotifications(db, adminId, { cursor, limit });
  return c.json({ success: true, data });
});

admin.post("/notifications/read-all", requireAdmin, async (c) => {
  const db = c.get("db");
  const adminId = c.get("adminId")!;
  await markAllNotificationsRead(db, { adminId });
  return c.json({ success: true });
});

admin.post("/notifications/:id/read", requireAdmin, async (c) => {
  const db = c.get("db");
  const adminId = c.get("adminId")!;
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) {
    return c.json({ success: false, error: "Invalid id" }, 400);
  }
  await markNotificationRead(db, id, { adminId });
  return c.json({ success: true });
});

// ── Analytics (Phase 1 basics) ────────────────────────────────────────────────

admin.get("/analytics/overview", requireAdmin, async (c) => {
  const db = c.get("db");

  const [
    pendingRequests,
    activeTutors,
    totalMatches,
  ] = await Promise.all([
    db.select().from(requests).where(eq(requests.status, "pending")),
    db.select().from(tutors).where(eq(tutors.active, true)),
    db.select().from(matches),
  ]);

  return c.json({
    success: true,
    data: {
      pendingRequests: pendingRequests.length,
      activeTutors: activeTutors.length,
      totalMatches: totalMatches.length,
      acceptedMatches: totalMatches.filter((m) => m.status === "accepted").length,
    },
  });
});

export default admin;
