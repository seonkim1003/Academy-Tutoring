import { Hono, type Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and, isNull, desc, inArray } from "drizzle-orm";
import { z } from "zod";
import { tutorSignupSchema, tuteeRequestSchema, SUBJECTS } from "@academy/shared";
import {
  tutors,
  tutees,
  tutorSubjects,
  tutorAvailability,
  requests,
  requestAvailability,
  matches,
} from "../schema";
import { requireUser } from "../middleware/userAuth";
import type { HonoContext } from "../types";

const me = new Hono<HonoContext>();

me.use("*", requireUser);

// ── GET /tutor — current user's tutor profile, subjects, availability ─────────

me.get("/tutor", async (c) => {
  const db = c.get("db");
  const userId = c.get("userId")!;

  const [tutor] = await db
    .select()
    .from(tutors)
    .where(eq(tutors.userId, userId))
    .limit(1);
  if (!tutor) return c.json({ success: false, error: "No tutor profile" }, 404);

  const [subjectsRows, availabilityRows] = await Promise.all([
    db.select().from(tutorSubjects).where(eq(tutorSubjects.tutorId, tutor.id)),
    db
      .select()
      .from(tutorAvailability)
      .where(eq(tutorAvailability.tutorId, tutor.id)),
  ]);

  return c.json({
    success: true,
    data: {
      tutor,
      subjects: subjectsRows.map((s) => ({
        subjectId: s.subjectId,
        maxLevel: s.maxLevel,
      })),
      availability: availabilityRows.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startMinute: a.startMinute,
        endMinute: a.endMinute,
      })),
    },
  });
});

// ── POST /tutor — become a tutor (creates row, or implicitly claims orphan) ──

me.post(
  "/tutor",
  zValidator("json", tutorSignupSchema),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user")!;
    const body = c.req.valid("json");

    // If a tutor row already exists for this user, reject (use PATCH instead).
    const [existingForUser] = await db
      .select({ id: tutors.id })
      .from(tutors)
      .where(eq(tutors.userId, user.id))
      .limit(1);
    if (existingForUser) {
      return c.json(
        { success: false, error: "Tutor profile already exists; use PATCH to update." },
        409
      );
    }

    // If an unclaimed row matches the user's email, take it over.
    const [orphan] = await db
      .select()
      .from(tutors)
      .where(and(eq(tutors.email, user.email), isNull(tutors.userId)))
      .limit(1);

    let tutorId: number;
    if (orphan) {
      tutorId = orphan.id;
      await db
        .update(tutors)
        .set({
          name: body.name,
          gradeLevel: body.gradeLevel,
          bio: body.bio,
          userId: user.id,
        })
        .where(eq(tutors.id, tutorId));
      await db.delete(tutorSubjects).where(eq(tutorSubjects.tutorId, tutorId));
      await db
        .delete(tutorAvailability)
        .where(eq(tutorAvailability.tutorId, tutorId));
    } else {
      const [inserted] = await db
        .insert(tutors)
        .values({
          name: body.name,
          email: user.email,
          gradeLevel: body.gradeLevel,
          bio: body.bio,
          userId: user.id,
        })
        .returning({ id: tutors.id });
      tutorId = inserted.id;
    }

    if (body.subjects.length > 0) {
      await db.insert(tutorSubjects).values(
        body.subjects.map((s) => ({
          tutorId,
          subjectId: s.subjectId,
          maxLevel: s.maxLevel,
        }))
      );
    }
    if (body.availability.length > 0) {
      await db.insert(tutorAvailability).values(
        body.availability.map((slot) => ({
          tutorId,
          dayOfWeek: slot.dayOfWeek,
          startMinute: slot.startMinute,
          endMinute: slot.endMinute,
        }))
      );
    }

    return c.json({ success: true, data: { tutorId } }, 201);
  }
);

// ── PATCH /tutor — update profile + replace subjects/availability ────────────

me.patch(
  "/tutor",
  zValidator("json", tutorSignupSchema),
  async (c) => {
    const db = c.get("db");
    const userId = c.get("userId")!;
    const body = c.req.valid("json");

    const [tutor] = await db
      .select()
      .from(tutors)
      .where(eq(tutors.userId, userId))
      .limit(1);
    if (!tutor) return c.json({ success: false, error: "No tutor profile" }, 404);

    await db
      .update(tutors)
      .set({
        name: body.name,
        gradeLevel: body.gradeLevel,
        bio: body.bio,
      })
      .where(eq(tutors.id, tutor.id));

    await db.delete(tutorSubjects).where(eq(tutorSubjects.tutorId, tutor.id));
    await db
      .delete(tutorAvailability)
      .where(eq(tutorAvailability.tutorId, tutor.id));

    if (body.subjects.length > 0) {
      await db.insert(tutorSubjects).values(
        body.subjects.map((s) => ({
          tutorId: tutor.id,
          subjectId: s.subjectId,
          maxLevel: s.maxLevel,
        }))
      );
    }
    if (body.availability.length > 0) {
      await db.insert(tutorAvailability).values(
        body.availability.map((slot) => ({
          tutorId: tutor.id,
          dayOfWeek: slot.dayOfWeek,
          startMinute: slot.startMinute,
          endMinute: slot.endMinute,
        }))
      );
    }

    return c.json({ success: true });
  }
);

// ── GET /tutee — tutee row + all requests + per-request availability+matches ──

me.get("/tutee", async (c) => {
  const db = c.get("db");
  const userId = c.get("userId")!;

  const [tutee] = await db
    .select()
    .from(tutees)
    .where(eq(tutees.userId, userId))
    .limit(1);
  if (!tutee) return c.json({ success: false, error: "No tutee profile" }, 404);

  const reqRows = await db
    .select()
    .from(requests)
    .where(eq(requests.tuteeId, tutee.id))
    .orderBy(desc(requests.createdAt));

  const requestIds = reqRows.map((r) => r.id);
  const [availRows, matchRows] = await Promise.all([
    requestIds.length
      ? db
          .select()
          .from(requestAvailability)
          .where(inArray(requestAvailability.requestId, requestIds))
      : Promise.resolve([] as { requestId: number; dayOfWeek: number; startMinute: number; endMinute: number; id: number }[]),
    requestIds.length
      ? db
          .select({
            id: matches.id,
            requestId: matches.requestId,
            status: matches.status,
            proposedDayOfWeek: matches.proposedDayOfWeek,
            proposedStartMinute: matches.proposedStartMinute,
            proposedEndMinute: matches.proposedEndMinute,
            createdAt: matches.createdAt,
            respondedAt: matches.respondedAt,
            tutorName: tutors.name,
            tutorEmail: tutors.email,
          })
          .from(matches)
          .leftJoin(tutors, eq(matches.tutorId, tutors.id))
          .where(inArray(matches.requestId, requestIds))
      : Promise.resolve([] as any[]),
  ]);

  const data = reqRows.map((r) => ({
    request: r,
    subjectName: SUBJECTS.find((s) => s.id === r.subjectId)?.name ?? r.subjectId,
    availability: availRows
      .filter((a) => a.requestId === r.id)
      .map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startMinute: a.startMinute,
        endMinute: a.endMinute,
      })),
    matches: matchRows.filter((m) => m.requestId === r.id),
  }));

  return c.json({ success: true, data: { tutee, requests: data } });
});

// ── POST /tutee/request — submit a new request ────────────────────────────────

me.post(
  "/tutee/request",
  zValidator("json", tuteeRequestSchema),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user")!;
    const body = c.req.valid("json");

    // Find or create tutee row owned by this user (implicitly claim orphan).
    let [tutee] = await db
      .select()
      .from(tutees)
      .where(eq(tutees.userId, user.id))
      .limit(1);

    if (!tutee) {
      const [orphan] = await db
        .select()
        .from(tutees)
        .where(and(eq(tutees.email, user.email), isNull(tutees.userId)))
        .limit(1);
      if (orphan) {
        await db
          .update(tutees)
          .set({ userId: user.id, name: body.name, gradeLevel: body.gradeLevel })
          .where(eq(tutees.id, orphan.id));
        tutee = { ...orphan, userId: user.id, name: body.name, gradeLevel: body.gradeLevel };
      } else {
        const [inserted] = await db
          .insert(tutees)
          .values({
            name: body.name,
            email: user.email,
            gradeLevel: body.gradeLevel,
            userId: user.id,
          })
          .returning();
        tutee = inserted;
      }
    }

    const [newRequest] = await db
      .insert(requests)
      .values({
        tuteeId: tutee.id,
        subjectId: body.subjectId,
        classLevel: body.classLevel,
        currentGradePct: body.currentGradePct,
        needsDescription: body.needsDescription,
      })
      .returning({ id: requests.id });

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

    return c.json({ success: true, data: { requestId: newRequest.id } }, 201);
  }
);

// ── PATCH /tutee/request/:id — update one request ─────────────────────────────

me.patch(
  "/tutee/request/:id",
  zValidator("json", tuteeRequestSchema),
  async (c) => {
    const db = c.get("db");
    const userId = c.get("userId")!;
    const body = c.req.valid("json");
    const requestId = Number(c.req.param("id"));
    if (!Number.isFinite(requestId)) {
      return c.json({ success: false, error: "Invalid id" }, 400);
    }

    const [row] = await db
      .select({
        id: requests.id,
        tuteeId: requests.tuteeId,
        tuteeUserId: tutees.userId,
      })
      .from(requests)
      .leftJoin(tutees, eq(requests.tuteeId, tutees.id))
      .where(eq(requests.id, requestId))
      .limit(1);
    if (!row || row.tuteeUserId !== userId) {
      return c.json({ success: false, error: "Not found" }, 404);
    }

    await db
      .update(requests)
      .set({
        subjectId: body.subjectId,
        classLevel: body.classLevel,
        currentGradePct: body.currentGradePct,
        needsDescription: body.needsDescription,
      })
      .where(eq(requests.id, requestId));

    await db
      .delete(requestAvailability)
      .where(eq(requestAvailability.requestId, requestId));
    if (body.availability.length > 0) {
      await db.insert(requestAvailability).values(
        body.availability.map((slot) => ({
          requestId,
          dayOfWeek: slot.dayOfWeek,
          startMinute: slot.startMinute,
          endMinute: slot.endMinute,
        }))
      );
    }

    return c.json({ success: true });
  }
);

// ── GET /matches — all matches for current user's tutor row ───────────────────

me.get("/matches", async (c) => {
  const db = c.get("db");
  const userId = c.get("userId")!;

  const [tutor] = await db
    .select({ id: tutors.id })
    .from(tutors)
    .where(eq(tutors.userId, userId))
    .limit(1);
  if (!tutor) return c.json({ success: true, data: [] });

  const rows = await db
    .select({
      id: matches.id,
      status: matches.status,
      proposedDayOfWeek: matches.proposedDayOfWeek,
      proposedStartMinute: matches.proposedStartMinute,
      proposedEndMinute: matches.proposedEndMinute,
      createdAt: matches.createdAt,
      respondedAt: matches.respondedAt,
      requestId: matches.requestId,
      subjectId: requests.subjectId,
      classLevel: requests.classLevel,
      needsDescription: requests.needsDescription,
      tuteeName: tutees.name,
      tuteeEmail: tutees.email,
    })
    .from(matches)
    .leftJoin(requests, eq(matches.requestId, requests.id))
    .leftJoin(tutees, eq(requests.tuteeId, tutees.id))
    .where(eq(matches.tutorId, tutor.id))
    .orderBy(desc(matches.createdAt));

  return c.json({
    success: true,
    data: rows.map((r) => ({
      ...r,
      subjectName: r.subjectId
        ? SUBJECTS.find((s) => s.id === r.subjectId)?.name ?? r.subjectId
        : null,
    })),
  });
});

// ── POST /matches/:id/accept | /decline ───────────────────────────────────────

async function respondToMatch(
  c: Parameters<Parameters<typeof me.post>[1]>[0],
  status: "accepted" | "declined"
) {
  const db = c.get("db");
  const userId = c.get("userId")!;
  const matchId = Number(c.req.param("id"));
  if (!Number.isFinite(matchId)) {
    return c.json({ success: false, error: "Invalid id" }, 400);
  }

  const [row] = await db
    .select({
      id: matches.id,
      status: matches.status,
      tutorUserId: tutors.userId,
    })
    .from(matches)
    .leftJoin(tutors, eq(matches.tutorId, tutors.id))
    .where(eq(matches.id, matchId))
    .limit(1);
  if (!row || row.tutorUserId !== userId) {
    return c.json({ success: false, error: "Not found" }, 404);
  }
  if (row.status !== "proposed") {
    return c.json(
      { success: false, error: `Match is already ${row.status}` },
      409
    );
  }

  await db
    .update(matches)
    .set({ status, respondedAt: Math.floor(Date.now() / 1000) })
    .where(eq(matches.id, matchId));

  return c.json({ success: true });
}

me.post("/matches/:id/accept", (c) => respondToMatch(c, "accepted"));
me.post("/matches/:id/decline", (c) => respondToMatch(c, "declined"));

// ── GET /claim-candidates — unclaimed rows matching user's email ──────────────

me.get("/claim-candidates", async (c) => {
  const db = c.get("db");
  const user = c.get("user")!;

  const [tutorCand] = await db
    .select()
    .from(tutors)
    .where(and(eq(tutors.email, user.email), isNull(tutors.userId)))
    .limit(1);
  const [tuteeCand] = await db
    .select()
    .from(tutees)
    .where(and(eq(tutees.email, user.email), isNull(tutees.userId)))
    .limit(1);

  let tuteeRequestCount = 0;
  if (tuteeCand) {
    const r = await db
      .select({ id: requests.id })
      .from(requests)
      .where(eq(requests.tuteeId, tuteeCand.id));
    tuteeRequestCount = r.length;
  }

  let tutorSubjectsList: string[] = [];
  if (tutorCand) {
    const rows = await db
      .select({ subjectId: tutorSubjects.subjectId })
      .from(tutorSubjects)
      .where(eq(tutorSubjects.tutorId, tutorCand.id));
    tutorSubjectsList = rows.map(
      (r) => SUBJECTS.find((s) => s.id === r.subjectId)?.name ?? r.subjectId
    );
  }

  return c.json({
    success: true,
    data: {
      tutor: tutorCand
        ? {
            name: tutorCand.name,
            gradeLevel: tutorCand.gradeLevel,
            bio: tutorCand.bio,
            createdAt: tutorCand.createdAt,
            subjects: tutorSubjectsList,
          }
        : null,
      tutee: tuteeCand
        ? {
            name: tuteeCand.name,
            gradeLevel: tuteeCand.gradeLevel,
            createdAt: tuteeCand.createdAt,
            requestCount: tuteeRequestCount,
          }
        : null,
    },
  });
});

// ── POST /claim — confirm linking of orphan rows ──────────────────────────────

me.post(
  "/claim",
  zValidator(
    "json",
    z.object({
      claimTutor: z.boolean().optional(),
      claimTutee: z.boolean().optional(),
    })
  ),
  async (c) => {
    const db = c.get("db");
    const user = c.get("user")!;
    const { claimTutor, claimTutee } = c.req.valid("json");

    if (claimTutor) {
      await db
        .update(tutors)
        .set({ userId: user.id })
        .where(and(eq(tutors.email, user.email), isNull(tutors.userId)));
    }
    if (claimTutee) {
      await db
        .update(tutees)
        .set({ userId: user.id })
        .where(and(eq(tutees.email, user.email), isNull(tutees.userId)));
    }

    return c.json({ success: true });
  }
);

export default me;
