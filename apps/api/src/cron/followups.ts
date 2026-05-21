import { eq, and, lt } from "drizzle-orm";
import { getDb } from "../lib/db";
import {
  getMatchNotificationContext,
  notifyMatchExpiredOrCancelled,
} from "../lib/notifications";
import { matches } from "../schema";
import type { Env } from "../types";

const PROPOSED_EXPIRE_SECONDS = 48 * 60 * 60;

// Follow up on stale proposed matches (no response after 48h)
// Triggered daily at 2pm UTC via wrangler.toml cron trigger.
export async function handleFollowups(env: Env): Promise<void> {
  const db = getDb(env);
  const cutoff = Math.floor(Date.now() / 1000) - PROPOSED_EXPIRE_SECONDS;

  const stale = await db
    .select({ id: matches.id })
    .from(matches)
    .where(and(eq(matches.status, "proposed"), lt(matches.createdAt, cutoff)));

  for (const { id: matchId } of stale) {
    await db
      .update(matches)
      .set({ status: "expired", respondedAt: Math.floor(Date.now() / 1000) })
      .where(eq(matches.id, matchId));

    const ctx = await getMatchNotificationContext(db, matchId);
    if (ctx) {
      try {
        await notifyMatchExpiredOrCancelled(db, {
          type: "match_expired",
          matchId: ctx.matchId,
          requestId: ctx.requestId,
          subjectName: ctx.subjectName,
          tutorUserId: ctx.tutorUserId,
          tuteeUserId: null,
        });
      } catch (err) {
        console.error(`Expired match notification failed for ${matchId}:`, err);
      }
    }
  }

  if (stale.length > 0) {
    console.log(`Follow-ups cron: expired ${stale.length} proposed match(es)`);
  }
}
