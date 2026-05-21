-- DESTRUCTIVE: wipes ALL data on academy-tutoring-db, including the
-- subjects reference table. Re-run scripts/seed-subjects.sql afterwards or
-- the signup forms will have nothing to pick from.
--
-- Preserves only: the admins row for seonkim1003@gmail.com.
--
-- Run order respects FK constraints: leaf tables first.

-- Sessions, feedback, logs (depend on matches/sessions)
DELETE FROM feedback;
DELETE FROM session_logs;
DELETE FROM sessions;

-- One-click email tokens (target sessions/matches)
DELETE FROM action_tokens;

-- Matches (depend on requests + tutors)
DELETE FROM matches;

-- Requests + their availability
DELETE FROM request_availability;
DELETE FROM requests;

-- Tutor profile child tables
DELETE FROM tutor_availability;
DELETE FROM tutor_subjects;

-- Profile rows
DELETE FROM tutors;
DELETE FROM tutees;

-- Reference data — must come after every table that FK-references it
-- (tutor_subjects + requests above already cleared).
DELETE FROM subjects;

-- Auth artifacts for end-users
DELETE FROM user_sessions;
DELETE FROM users;

-- Admin sessions (force re-login)
DELETE FROM admin_sessions;

-- Audit log (admin activity history)
DELETE FROM audit_log;

-- Reduce admin table to only seonkim1003@gmail.com
DELETE FROM admins WHERE email <> 'seonkim1003@gmail.com';

-- Ensure the kept admin exists (idempotent — inserts only if missing).
INSERT OR IGNORE INTO admins (name, email, created_at)
VALUES ('Seonho Kim', 'seonkim1003@gmail.com', unixepoch());

-- Reset autoincrement counters so new rows start at id=1 again.
DELETE FROM sqlite_sequence
WHERE name IN (
  'tutees', 'tutors', 'tutor_availability', 'requests',
  'request_availability', 'matches', 'sessions', 'session_logs',
  'feedback', 'users', 'audit_log'
);
