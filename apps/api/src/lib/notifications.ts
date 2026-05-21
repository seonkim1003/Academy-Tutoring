import { and, count, desc, eq, isNull, lt } from "drizzle-orm";
import { SUBJECTS } from "@academy/shared";
import {
  admins,
  matches,
  notifications,
  requests,
  tutees,
  tutors,
} from "../schema";
import type { AppDb } from "../types";

export type NotificationType =
  | "match_created"
  | "match_accepted"
  | "match_expired"
  | "match_cancelled"
  | "match_declined"
  | "request_submitted";

type NotificationPayload = {
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  targetUrl: string;
};

export async function createUserNotification(
  db: AppDb,
  params: NotificationPayload & { userId: number }
) {
  const { userId, type, title, body, metadata, targetUrl } = params;
  await db.insert(notifications).values({
    userId,
    type,
    title,
    body,
    metadata: metadata ? JSON.stringify(metadata) : null,
    targetUrl,
  });
}

export async function createAdminNotification(
  db: AppDb,
  params: NotificationPayload & { adminId: number }
) {
  const { adminId, type, title, body, metadata, targetUrl } = params;
  await db.insert(notifications).values({
    adminId,
    type,
    title,
    body,
    metadata: metadata ? JSON.stringify(metadata) : null,
    targetUrl,
  });
}

export async function notifyAllAdmins(db: AppDb, payload: NotificationPayload) {
  const adminRows = await db.select({ id: admins.id }).from(admins);
  if (adminRows.length === 0) return;
  await db.insert(notifications).values(
    adminRows.map((a) => ({
      adminId: a.id,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
      targetUrl: payload.targetUrl,
    }))
  );
}

export async function notifyMatchCreated(
  db: AppDb,
  params: {
    matchId: number;
    requestId: number;
    subjectName: string;
    tuteeName: string;
    tutorUserId: number | null;
  }
) {
  const { matchId, requestId, subjectName, tuteeName, tutorUserId } = params;
  if (!tutorUserId) return;

  await createUserNotification(db, {
    userId: tutorUserId,
    type: "match_created",
    title: "New tutoring match",
    body: `You've been matched with ${tuteeName} for ${subjectName}. Review and accept the match on your dashboard.`,
    metadata: { matchId, requestId },
    targetUrl: "/dashboard/tutor",
  });
}

export async function notifyMatchDeclined(
  db: AppDb,
  params: {
    matchId: number;
    requestId: number;
    subjectName: string;
    tutorName: string;
  }
) {
  const { matchId, requestId, subjectName, tutorName } = params;
  await notifyAllAdmins(db, {
    type: "match_declined",
    title: "Match declined",
    body: `${tutorName} declined the match for ${subjectName}. The request has been reopened.`,
    metadata: { matchId, requestId },
    targetUrl: "/admin/requests",
  });
}

export async function notifyMatchAccepted(
  db: AppDb,
  params: {
    matchId: number;
    requestId: number;
    subjectName: string;
    tutorName: string;
    tuteeUserId: number | null;
  }
) {
  const { matchId, requestId, subjectName, tutorName, tuteeUserId } = params;
  if (!tuteeUserId) return;
  await createUserNotification(db, {
    userId: tuteeUserId,
    type: "match_accepted",
    title: "Match confirmed",
    body: `${tutorName} accepted your tutoring match for ${subjectName}.`,
    metadata: { matchId, requestId },
    targetUrl: "/dashboard/tutee",
  });
}

export async function notifyMatchExpiredOrCancelled(
  db: AppDb,
  params: {
    type: "match_expired" | "match_cancelled";
    matchId: number;
    requestId: number;
    subjectName: string;
    tutorUserId: number | null;
    tuteeUserId: number | null;
  }
) {
  const { type, matchId, requestId, subjectName, tutorUserId, tuteeUserId } = params;
  const isExpired = type === "match_expired";
  const title = isExpired ? "Match expired" : "Match cancelled";
  const body = isExpired
    ? `Your proposed match for ${subjectName} expired without a response.`
    : `Your match for ${subjectName} was cancelled.`;
  const meta = { matchId, requestId };
  const tasks: Promise<void>[] = [];

  for (const userId of [tutorUserId, tuteeUserId]) {
    if (!userId) continue;
    tasks.push(
      createUserNotification(db, {
        userId,
        type,
        title,
        body,
        metadata: meta,
        targetUrl: userId === tutorUserId ? "/dashboard/tutor" : "/dashboard/tutee",
      })
    );
  }
  await Promise.all(tasks);
}

export async function notifyRequestSubmitted(
  db: AppDb,
  params: {
    requestId: number;
    tuteeName: string;
    subjectName: string;
  }
) {
  const { requestId, tuteeName, subjectName } = params;
  await notifyAllAdmins(db, {
    type: "request_submitted",
    title: "New tutoring request",
    body: `${tuteeName} submitted a request for ${subjectName}.`,
    metadata: { requestId },
    targetUrl: "/admin/requests",
  });
}

const DEFAULT_LIMIT = 20;

export type NotificationRow = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  targetUrl: string;
  readAt: number | null;
  createdAt: number;
};

function mapRow(row: typeof notifications.$inferSelect): NotificationRow {
  let metadata: Record<string, unknown> | null = null;
  if (row.metadata) {
    try {
      metadata = JSON.parse(row.metadata) as Record<string, unknown>;
    } catch {
      metadata = null;
    }
  }
  return {
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    metadata,
    targetUrl: row.targetUrl,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

async function listForRecipient(
  db: AppDb,
  recipient: { userId: number } | { adminId: number },
  opts: { cursor?: string; limit?: number }
) {
  const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, 50);
  const recipientCond =
    "userId" in recipient
      ? eq(notifications.userId, recipient.userId)
      : eq(notifications.adminId, recipient.adminId);

  const conditions = [recipientCond];
  if (opts.cursor) {
    const cursorId = Number(opts.cursor);
    if (Number.isFinite(cursorId)) {
      conditions.push(lt(notifications.id, cursorId));
    }
  }

  const rows = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? String(page[page.length - 1].id) : null;

  const unreadFilter = and(recipientCond, isNull(notifications.readAt));
  const [{ value: unreadCount }] = await db
    .select({ value: count() })
    .from(notifications)
    .where(unreadFilter);

  return {
    items: page.map(mapRow),
    unreadCount: Number(unreadCount),
    nextCursor,
  };
}

export function listUserNotifications(
  db: AppDb,
  userId: number,
  opts: { cursor?: string; limit?: number }
) {
  return listForRecipient(db, { userId }, opts);
}

export function listAdminNotifications(
  db: AppDb,
  adminId: number,
  opts: { cursor?: string; limit?: number }
) {
  return listForRecipient(db, { adminId }, opts);
}

export async function markNotificationRead(
  db: AppDb,
  id: number,
  recipient: { userId: number } | { adminId: number }
) {
  const now = Math.floor(Date.now() / 1000);
  const recipientCond =
    "userId" in recipient
      ? eq(notifications.userId, recipient.userId)
      : eq(notifications.adminId, recipient.adminId);

  await db
    .update(notifications)
    .set({ readAt: now })
    .where(and(eq(notifications.id, id), recipientCond, isNull(notifications.readAt)));
}

export async function markAllNotificationsRead(
  db: AppDb,
  recipient: { userId: number } | { adminId: number }
) {
  const now = Math.floor(Date.now() / 1000);
  const recipientCond =
    "userId" in recipient
      ? eq(notifications.userId, recipient.userId)
      : eq(notifications.adminId, recipient.adminId);

  await db
    .update(notifications)
    .set({ readAt: now })
    .where(and(recipientCond, isNull(notifications.readAt)));
}

/** Load tutor/tutee user ids and subject for a match (for notification hooks). */
export async function getMatchNotificationContext(db: AppDb, matchId: number) {
  const [row] = await db
    .select({
      matchId: matches.id,
      requestId: matches.requestId,
      subjectId: requests.subjectId,
      tutorUserId: tutors.userId,
      tuteeUserId: tutees.userId,
      tutorName: tutors.name,
      tuteeName: tutees.name,
    })
    .from(matches)
    .innerJoin(requests, eq(matches.requestId, requests.id))
    .innerJoin(tutors, eq(matches.tutorId, tutors.id))
    .innerJoin(tutees, eq(requests.tuteeId, tutees.id))
    .where(eq(matches.id, matchId))
    .limit(1);

  if (!row) return null;

  const subjectName =
    SUBJECTS.find((s) => s.id === row.subjectId)?.name ?? row.subjectId;

  return {
    matchId: row.matchId,
    requestId: row.requestId,
    subjectName,
    tutorUserId: row.tutorUserId,
    tuteeUserId: row.tuteeUserId,
    tutorName: row.tutorName,
    tuteeName: row.tuteeName,
  };
}
