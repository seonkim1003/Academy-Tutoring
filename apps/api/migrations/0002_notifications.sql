-- In-app notifications for users and admins

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN (
      'match_created',
      'match_accepted',
      'match_expired',
      'match_cancelled',
      'request_submitted'
    )
  ),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata TEXT,
  target_url TEXT NOT NULL,
  read_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications(user_id, read_at, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_admin
  ON notifications(admin_id, read_at, created_at);
