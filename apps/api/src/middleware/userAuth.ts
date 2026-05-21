import { createMiddleware } from "hono/factory";
import { eq } from "drizzle-orm";
import { users, userSessions } from "../schema";
import type { HonoContext } from "../types";

export const requireUser = createMiddleware<HonoContext>(async (c, next) => {
  const sessionToken = getCookie(c.req.raw, "user_session");
  if (!sessionToken) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  const db = c.get("db");
  const now = Math.floor(Date.now() / 1000);

  const [session] = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.token, sessionToken))
    .limit(1);

  if (!session || session.expiresAt < now) {
    return c.json({ success: false, error: "Session expired" }, 401);
  }

  const [u] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!u) return c.json({ success: false, error: "User missing" }, 401);

  c.set("userId", u.id);
  c.set("user", u);
  await next();
});

function getCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie") ?? "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}
