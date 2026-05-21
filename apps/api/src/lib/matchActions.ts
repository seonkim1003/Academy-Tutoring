import { eq } from "drizzle-orm";
import { SUBJECTS } from "@academy/shared";
import { matches, requests, tutees, tutors } from "../schema";
import { sendEmail, emailEnvTag } from "./email";
import { MatchAcceptedTutor, MatchAcceptedTutee } from "../emails/MatchAccepted";
import {
  getMatchNotificationContext,
  notifyMatchAccepted,
  notifyMatchDeclined,
} from "./notifications";
import type { AppDb, Env } from "../types";

async function loadMatchEmailContext(db: AppDb, matchId: number) {
  const [row] = await db
    .select({
      matchId: matches.id,
      requestId: matches.requestId,
      subjectId: requests.subjectId,
      tutorName: tutors.name,
      tutorEmail: tutors.email,
      tutorGradeLevel: tutors.gradeLevel,
      tutorPhone: tutors.phone,
      tuteeName: tutees.name,
      tuteeEmail: tutees.email,
      tuteeGradeLevel: tutees.gradeLevel,
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

  return { ...row, subjectName };
}

export async function handleMatchAccepted(
  db: AppDb,
  env: Env,
  executionCtx: ExecutionContext,
  matchId: number
) {
  const now = Math.floor(Date.now() / 1000);

  await db
    .update(matches)
    .set({ status: "accepted", respondedAt: now })
    .where(eq(matches.id, matchId));

  const ctx = await loadMatchEmailContext(db, matchId);
  if (!ctx) return;

  const notifCtx = await getMatchNotificationContext(db, matchId);

  executionCtx.waitUntil(
    Promise.all([
      sendEmail(
        env.RESEND_API_KEY,
        env.FROM_EMAIL,
        env.ADMIN_NOTIFICATION_EMAIL,
        {
          to: ctx.tutorEmail,
          subject: `Match confirmed — ${ctx.subjectName}`,
          template: MatchAcceptedTutor({
            tutorName: ctx.tutorName,
            tuteeName: ctx.tuteeName,
            tuteeGradeLevel: ctx.tuteeGradeLevel,
            tuteeEmail: ctx.tuteeEmail,
            subject: ctx.subjectName,
          }),
        },
        emailEnvTag(env.WEB_URL)
      ),
      sendEmail(
        env.RESEND_API_KEY,
        env.FROM_EMAIL,
        env.ADMIN_NOTIFICATION_EMAIL,
        {
          to: ctx.tuteeEmail,
          subject: `You have a tutor for ${ctx.subjectName}!`,
          template: MatchAcceptedTutee({
            tuteeName: ctx.tuteeName,
            tutorName: ctx.tutorName,
            tutorGradeLevel: ctx.tutorGradeLevel,
            tutorEmail: ctx.tutorEmail,
            tutorPhone: ctx.tutorPhone,
            subject: ctx.subjectName,
          }),
        },
        emailEnvTag(env.WEB_URL)
      ),
      notifCtx
        ? notifyMatchAccepted(db, {
            matchId: notifCtx.matchId,
            requestId: notifCtx.requestId,
            subjectName: notifCtx.subjectName,
            tutorName: notifCtx.tutorName,
            tuteeUserId: notifCtx.tuteeUserId,
          })
        : Promise.resolve(),
    ]).catch((err) => console.error("Match accepted follow-up failed:", err))
  );
}

export async function handleMatchDeclined(
  db: AppDb,
  executionCtx: ExecutionContext,
  matchId: number
) {
  const now = Math.floor(Date.now() / 1000);

  const [matchRow] = await db
    .select({ requestId: matches.requestId })
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1);

  if (!matchRow) return;

  await db
    .update(matches)
    .set({ status: "declined", respondedAt: now })
    .where(eq(matches.id, matchId));

  await db
    .update(requests)
    .set({ status: "pending" })
    .where(eq(requests.id, matchRow.requestId));

  const notifCtx = await getMatchNotificationContext(db, matchId);
  if (notifCtx) {
    executionCtx.waitUntil(
      notifyMatchDeclined(db, {
        matchId: notifCtx.matchId,
        requestId: notifCtx.requestId,
        subjectName: notifCtx.subjectName,
        tutorName: notifCtx.tutorName,
      }).catch((err) => console.error("Match declined notification failed:", err))
    );
  }
}
