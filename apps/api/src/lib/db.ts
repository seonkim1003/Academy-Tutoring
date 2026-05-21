import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";
import type { Env, AppDb } from "../types";

export function getDb(env: Env): AppDb {
  return drizzle(env.DB, { schema });
}
