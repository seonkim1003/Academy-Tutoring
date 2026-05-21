import { nanoid } from "nanoid";
import { eq, and, gt } from "drizzle-orm";
import { actionTokens } from "../schema";
import type { AppDb } from "../types";

type TokenPurpose = typeof actionTokens.$inferInsert["purpose"];

const TTL = {
  feedback: 7 * 24 * 60 * 60,      // 7 days
  session_log: 7 * 24 * 60 * 60,
  match_accept: 48 * 60 * 60,       // 48 hours
  match_decline: 48 * 60 * 60,
} satisfies Record<TokenPurpose, number>;

export async function createToken(
  db: AppDb,
  purpose: TokenPurpose,
  targetId: number
): Promise<string> {
  const token = nanoid(24);
  const now = Math.floor(Date.now() / 1000);
  await db.insert(actionTokens).values({
    token,
    purpose,
    targetId,
    expiresAt: now + TTL[purpose],
    createdAt: now,
  });
  return token;
}

export async function consumeToken(
  db: AppDb,
  token: string,
  purpose: TokenPurpose
) {
  const now = Math.floor(Date.now() / 1000);
  const [row] = await db
    .select()
    .from(actionTokens)
    .where(
      and(
        eq(actionTokens.token, token),
        eq(actionTokens.purpose, purpose),
        gt(actionTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!row) return null;
  if (row.consumedAt) return null; // already used

  await db
    .update(actionTokens)
    .set({ consumedAt: now })
    .where(eq(actionTokens.token, token));

  return row;
}
