-- Tutor phone (optional, shared with tutee after match accepted)
ALTER TABLE tutors ADD COLUMN phone TEXT;

-- Add match_declined notification type (SQLite CHECK requires table rebuild)
CREATE TABLE IF NOT EXISTS notifications_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN (
      'match_created',
      'match_accepted',
      'match_expired',
      'match_cancelled',
      'match_declined',
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

INSERT INTO notifications_new
  SELECT * FROM notifications;

DROP TABLE notifications;

ALTER TABLE notifications_new RENAME TO notifications;

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications(user_id, read_at, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_admin
  ON notifications(admin_id, read_at, created_at);
