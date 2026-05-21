import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "./schema";

export type Env = {
  // D1 database binding
  DB: D1Database;
  // KV namespace for rate limiting + admin session cache
  KV: KVNamespace;
  // Secrets (set via wrangler secret put)
  RESEND_API_KEY: string;
  SESSION_COOKIE_SECRET: string;
  // Vars (set in wrangler.toml [vars])
  SCHOOL_EMAIL_DOMAIN: string;
  FROM_EMAIL: string;
  ADMIN_NOTIFICATION_EMAIL: string;
  WEB_URL: string;
};

export type AppDb = DrizzleD1Database<typeof schema>;

export type HonoContext = {
  Bindings: Env;
  Variables: {
    db: AppDb;
    adminId?: number;
  };
};

// Augment Hono's Context to expose executionCtx (Cloudflare Workers)
declare module "hono" {
  interface Context {
    executionCtx: ExecutionContext;
  }
}
