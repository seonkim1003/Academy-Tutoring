import { createMiddleware } from "hono/factory";
import type { HonoContext } from "../types";

type Options = {
  limit: number;
  windowSeconds: number;
  keyFn?: (c: Parameters<Parameters<typeof createMiddleware>[0]>[0]) => string;
};

export function rateLimit({ limit, windowSeconds, keyFn }: Options) {
  return createMiddleware<HonoContext>(async (c, next) => {
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";
    const key = keyFn ? keyFn(c) : `rl:${c.req.path}:${ip}`;

    const raw = await c.env.KV.get(key);
    const count = raw ? parseInt(raw, 10) : 0;

    if (count >= limit) {
      return c.json(
        { success: false, error: "Too many requests. Please wait before trying again." },
        429
      );
    }

    await c.env.KV.put(key, String(count + 1), { expirationTtl: windowSeconds });
    await next();
  });
}
