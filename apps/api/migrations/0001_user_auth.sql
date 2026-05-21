-- Google OAuth accounts + per-user dashboards.
-- Adds users + user_sessions tables and nullable user_id FKs on tutors/tutees.

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  picture TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS user_sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- SQLite can't add a UNIQUE constraint inline via ALTER TABLE; partial unique
-- index on non-null rows enforces the same one-to-one invariant.
ALTER TABLE tutors ADD COLUMN user_id INTEGER REFERENCES users(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tutors_user_id ON tutors(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE tutees ADD COLUMN user_id INTEGER REFERENCES users(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tutees_user_id ON tutees(user_id) WHERE user_id IS NOT NULL;
