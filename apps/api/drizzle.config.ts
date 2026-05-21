import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "sqlite",
  // For local dev (no driver needed — generates plain SQL migrations)
  // When deploying to prod, apply via: wrangler d1 migrations apply academy-tutoring-db
} satisfies Config;
