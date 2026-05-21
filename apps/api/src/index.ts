import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { dbMiddleware } from "./middleware/db";
import publicRoutes from "./routes/public";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import meRoutes from "./routes/me";
import { handleReminders } from "./cron/reminders";
import { handleFollowups } from "./cron/followups";
import type { HonoContext, Env } from "./types";

const app = new Hono<HonoContext>();

app.use("*", logger());

app.use(
  "/api/*",
  cors({
    origin: (origin, c) => {
      const webUrl = (c.env as Env).WEB_URL;
      // Allow requests from the paired web app and local dev
      const allowed = [webUrl, "http://localhost:5173"];
      return allowed.includes(origin) ? origin : "";
    },
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Inject db into every request context
app.use("/api/*", dbMiddleware);

// Routes
app.route("/api", publicRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/me", meRoutes);

// Health check
app.get("/", (c) => c.json({ ok: true, service: "academy-tutoring-api" }));

// 404 fallback
app.notFound((c) => c.json({ success: false, error: "Not found" }, 404));

// Global error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ success: false, error: "Internal server error" }, 500);
});

// Cron handler — Cloudflare Workers scheduled events
const scheduled: ExportedHandlerScheduledHandler<Env> = async (event, env) => {
  switch (event.cron) {
    case "0 13 * * *":
      await handleReminders(env);
      break;
    case "0 14 * * *":
      await handleFollowups(env);
      break;
  }
};

export default {
  fetch: app.fetch,
  scheduled,
};
