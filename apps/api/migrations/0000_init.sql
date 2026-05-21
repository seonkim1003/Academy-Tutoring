-- Academy Tutoring Program — initial schema
-- Generated for Cloudflare D1 (SQLite)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tutees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  grade_level INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_tutees_email ON tutees(email);

CREATE TABLE IF NOT EXISTS tutors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  grade_level INTEGER,
  bio TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tutor_subjects (
  tutor_id INTEGER NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  max_level TEXT NOT NULL CHECK (max_level IN ('regular','honors','ap')),
  PRIMARY KEY (tutor_id, subject_id)
);

CREATE TABLE IF NOT EXISTS tutor_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tutor_id INTEGER NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_minute INTEGER NOT NULL,
  end_minute INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tutor_avail_tutor ON tutor_availability(tutor_id);

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tutee_id INTEGER NOT NULL REFERENCES tutees(id),
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  class_level TEXT NOT NULL CHECK (class_level IN ('regular','honors','ap')),
  current_grade_pct REAL,
  needs_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','matched','cancelled','expired')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_tutee ON requests(tutee_id);

CREATE TABLE IF NOT EXISTS request_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_minute INTEGER NOT NULL,
  end_minute INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_req_avail_req ON request_availability(request_id);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL REFERENCES requests(id),
  tutor_id INTEGER NOT NULL REFERENCES tutors(id),
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed','accepted','declined','expired','cancelled','completed')),
  proposed_day_of_week INTEGER,
  proposed_start_minute INTEGER,
  proposed_end_minute INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  responded_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_tutor ON matches(tutor_id);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL REFERENCES matches(id),
  scheduled_at INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','completed','no_show','cancelled')),
  reminder_sent_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

CREATE TABLE IF NOT EXISTS session_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL UNIQUE REFERENCES sessions(id),
  topics_covered TEXT NOT NULL,
  notes TEXT,
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL UNIQUE REFERENCES sessions(id),
  helpfulness INTEGER NOT NULL CHECK (helpfulness BETWEEN 1 AND 5),
  comfort INTEGER NOT NULL CHECK (comfort BETWEEN 1 AND 5),
  satisfaction INTEGER NOT NULL CHECK (satisfaction BETWEEN 1 AND 5),
  updated_grade_pct REAL,
  comments TEXT,
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS action_tokens (
  token TEXT PRIMARY KEY,
  purpose TEXT NOT NULL CHECK (purpose IN ('feedback','session_log','match_accept','match_decline')),
  target_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_tokens_target ON action_tokens(purpose, target_id);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login_at INTEGER
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id),
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER REFERENCES admins(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id INTEGER,
  metadata TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
