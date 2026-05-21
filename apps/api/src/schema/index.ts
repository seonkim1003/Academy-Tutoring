import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const now = () => sql`(unixepoch())`;

// ── Subjects ──────────────────────────────────────────────────────────────────

export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey(), // matches SUBJECT_IDS in constants.ts
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

// ── Tutees ────────────────────────────────────────────────────────────────────

export const tutees = sqliteTable(
  "tutees",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    gradeLevel: integer("grade_level"),
    userId: integer("user_id").references((): any => users.id, { onDelete: "set null" }),
    createdAt: integer("created_at").notNull().default(now()),
  },
  (t) => [index("idx_tutees_email").on(t.email)]
);

// ── Tutors ────────────────────────────────────────────────────────────────────

export const tutors = sqliteTable("tutors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  gradeLevel: integer("grade_level"),
  bio: text("bio"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  userId: integer("user_id").references((): any => users.id, { onDelete: "set null" }),
  createdAt: integer("created_at").notNull().default(now()),
});

export const tutorSubjects = sqliteTable(
  "tutor_subjects",
  {
    tutorId: integer("tutor_id")
      .notNull()
      .references(() => tutors.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    maxLevel: text("max_level", { enum: ["regular", "honors", "ap"] }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.tutorId, t.subjectId] })]
);

export const tutorAvailability = sqliteTable(
  "tutor_availability",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tutorId: integer("tutor_id")
      .notNull()
      .references(() => tutors.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(), // 0=Sun..6=Sat
    startMinute: integer("start_minute").notNull(), // minutes from midnight
    endMinute: integer("end_minute").notNull(),
  },
  (t) => [index("idx_tutor_avail_tutor").on(t.tutorId)]
);

// ── Requests ──────────────────────────────────────────────────────────────────

export const requests = sqliteTable(
  "requests",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tuteeId: integer("tutee_id")
      .notNull()
      .references(() => tutees.id),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id),
    classLevel: text("class_level", {
      enum: ["regular", "honors", "ap"],
    }).notNull(),
    currentGradePct: real("current_grade_pct"),
    needsDescription: text("needs_description").notNull(),
    status: text("status", {
      enum: ["pending", "matched", "cancelled", "expired"],
    })
      .notNull()
      .default("pending"),
    createdAt: integer("created_at").notNull().default(now()),
  },
  (t) => [
    index("idx_requests_status").on(t.status),
    index("idx_requests_tutee").on(t.tuteeId),
  ]
);

export const requestAvailability = sqliteTable(
  "request_availability",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    requestId: integer("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(),
    startMinute: integer("start_minute").notNull(),
    endMinute: integer("end_minute").notNull(),
  },
  (t) => [index("idx_req_avail_req").on(t.requestId)]
);

// ── Matches ───────────────────────────────────────────────────────────────────

export const matches = sqliteTable(
  "matches",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    requestId: integer("request_id")
      .notNull()
      .references(() => requests.id),
    tutorId: integer("tutor_id")
      .notNull()
      .references(() => tutors.id),
    status: text("status", {
      enum: ["proposed", "accepted", "declined", "expired", "cancelled", "completed"],
    })
      .notNull()
      .default("proposed"),
    proposedDayOfWeek: integer("proposed_day_of_week"),
    proposedStartMinute: integer("proposed_start_minute"),
    proposedEndMinute: integer("proposed_end_minute"),
    createdAt: integer("created_at").notNull().default(now()),
    respondedAt: integer("responded_at"),
  },
  (t) => [
    index("idx_matches_status").on(t.status),
    index("idx_matches_tutor").on(t.tutorId),
  ]
);

// ── Sessions ──────────────────────────────────────────────────────────────────

export const sessions = sqliteTable(
  "sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    matchId: integer("match_id")
      .notNull()
      .references(() => matches.id),
    scheduledAt: integer("scheduled_at").notNull(), // unix timestamp
    durationMinutes: integer("duration_minutes").notNull().default(30),
    status: text("status", {
      enum: ["scheduled", "completed", "no_show", "cancelled"],
    })
      .notNull()
      .default("scheduled"),
    reminderSentAt: integer("reminder_sent_at"),
    createdAt: integer("created_at").notNull().default(now()),
  },
  (t) => [
    index("idx_sessions_scheduled").on(t.scheduledAt),
    index("idx_sessions_status").on(t.status),
  ]
);

export const sessionLogs = sqliteTable("session_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id")
    .notNull()
    .unique()
    .references(() => sessions.id),
  topicsCovered: text("topics_covered").notNull(),
  notes: text("notes"),
  submittedAt: integer("submitted_at").notNull().default(now()),
});

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id")
    .notNull()
    .unique()
    .references(() => sessions.id),
  helpfulness: integer("helpfulness").notNull(), // 1–5
  comfort: integer("comfort").notNull(),
  satisfaction: integer("satisfaction").notNull(),
  updatedGradePct: real("updated_grade_pct"),
  comments: text("comments"),
  submittedAt: integer("submitted_at").notNull().default(now()),
});

// ── Action tokens (one-click email links, no accounts needed) ─────────────────

export const actionTokens = sqliteTable(
  "action_tokens",
  {
    token: text("token").primaryKey(), // nanoid(24)
    purpose: text("purpose", {
      enum: ["feedback", "session_log", "match_accept", "match_decline"],
    }).notNull(),
    targetId: integer("target_id").notNull(), // sessionId or matchId
    expiresAt: integer("expires_at").notNull(),
    consumedAt: integer("consumed_at"),
    createdAt: integer("created_at").notNull().default(now()),
  },
  (t) => [index("idx_tokens_target").on(t.purpose, t.targetId)]
);

// ── Admins ────────────────────────────────────────────────────────────────────

export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: integer("created_at").notNull().default(now()),
  lastLoginAt: integer("last_login_at"),
});

export const adminSessions = sqliteTable("admin_sessions", {
  token: text("token").primaryKey(),
  adminId: integer("admin_id")
    .notNull()
    .references(() => admins.id),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull().default(now()),
});

// ── End-user accounts (Google OAuth) ──────────────────────────────────────────

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    googleSub: text("google_sub").notNull().unique(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    picture: text("picture"),
    createdAt: integer("created_at").notNull().default(now()),
    lastLoginAt: integer("last_login_at"),
  },
  (t) => [index("idx_users_email").on(t.email)]
);

export const userSessions = sqliteTable("user_sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull().default(now()),
});

// ── Audit log ─────────────────────────────────────────────────────────────────

export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  adminId: integer("admin_id").references(() => admins.id),
  action: text("action").notNull(),
  targetTable: text("target_table"),
  targetId: integer("target_id"),
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at").notNull().default(now()),
});
