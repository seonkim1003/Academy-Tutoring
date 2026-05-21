import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { InferSelectModel } from "drizzle-orm";
import type * as schema from "./schema";
import type { users } from "./schema";

export type Env = {
  // D1 database binding
  DB: D1Database;
  // KV namespace for rate limiting + admin session cache + OAuth state
  KV: KVNamespace;
  // Secrets (set via wrangler secret put)
  RESEND_API_KEY: string;
  SESSION_COOKIE_SECRET: string;
  GOOGLE_CLIENT_SECRET: string;
  // Vars (set in wrangler.toml [vars])
  SCHOOL_EMAIL_DOMAIN: string;
  FROM_EMAIL: string;
  ADMIN_NOTIFICATION_EMAIL: string;
  WEB_URL: string;
  GOOGLE_CLIENT_ID: string;
  /** When set (local dev + Vite proxy), OAuth callback uses this origin instead of req.url host */
  API_PUBLIC_URL?: string;
};

export type AppDb = DrizzleD1Database<typeof schema>;

export type UserRow = InferSelectModel<typeof users>;

export type HonoContext = {
  Bindings: Env;
  Variables: {
    db: AppDb;
    adminId?: number;
    userId?: number;
    user?: UserRow;
  };
};

// Augment Hono's Context to expose executionCtx (Cloudflare Workers)
declare module "hono" {
  interface Context {
    executionCtx: ExecutionContext;
  }
}
