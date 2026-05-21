import { createMiddleware } from "hono/factory";
import { getDb } from "../lib/db";
import type { HonoContext } from "../types";

export const dbMiddleware = createMiddleware<HonoContext>(async (c, next) => {
  c.set("db", getDb(c.env));
  await next();
});
