-- Development seed — fake tutors, tutees, and requests for local testing.
-- Run AFTER seed-subjects.sql:
-- wrangler d1 execute academy-tutoring-db --local --file scripts/seed-dev.sql

-- Seed an admin (replace with your own email)
INSERT OR IGNORE INTO admins (name, email) VALUES
  ('Seonho Kim', 'seonho@yourschool.org'),
  ('Ani',        'ani@yourschool.org');

-- Fake tutors
INSERT OR IGNORE INTO tutors (name, email, grade_level, bio) VALUES
  ('Alex Chen',   'alex@yourschool.org',   12, 'Senior, loves math and physics.'),
  ('Maya Patel',  'maya@yourschool.org',   11, 'Junior, strong in English and history.'),
  ('Jordan Kim',  'jordan@yourschool.org', 12, 'Senior, can help with most sciences.');

-- Tutor subjects
INSERT OR IGNORE INTO tutor_subjects (tutor_id, subject_id, max_level) VALUES
  (1, 'calculus',   'ap'),
  (1, 'algebra-2',  'honors'),
  (1, 'physics',    'honors'),
  (2, 'ap-lang',    'ap'),
  (2, 'ap-lit',     'ap'),
  (2, 'us-history', 'honors'),
  (3, 'chemistry',  'ap'),
  (3, 'biology',    'honors'),
  (3, 'physics',    'regular');

-- Tutor availability (Mon/Wed/Fri afternoons for Alex, Tue/Thu for Maya and Jordan)
INSERT OR IGNORE INTO tutor_availability (tutor_id, day_of_week, start_minute, end_minute) VALUES
  (1, 1, 900, 1020),   -- Alex: Mon 3–5pm
  (1, 3, 900, 1020),   -- Alex: Wed 3–5pm
  (1, 5, 900, 1020),   -- Alex: Fri 3–5pm
  (2, 2, 870, 990),    -- Maya: Tue 2:30–4:30pm
  (2, 4, 870, 990),    -- Maya: Thu 2:30–4:30pm
  (3, 2, 900, 1080),   -- Jordan: Tue 3–6pm
  (3, 4, 900, 1080);   -- Jordan: Thu 3–6pm

-- Fake tutees
INSERT OR IGNORE INTO tutees (name, email, grade_level) VALUES
  ('Sam Rivera',  'sam@yourschool.org',   10),
  ('Jamie Lee',   'jamie@yourschool.org', 11),
  ('Taylor Brown','taylor@yourschool.org',10);

-- Tutee requests
INSERT OR IGNORE INTO requests (tutee_id, subject_id, class_level, current_grade_pct, needs_description) VALUES
  (1, 'calculus',   'ap',     72.0, 'Struggling with integration by parts and u-substitution.'),
  (2, 'ap-lang',    'ap',     81.5, 'Need help with rhetorical analysis essays before the exam.'),
  (3, 'chemistry',  'honors', 68.0, 'Confused about stoichiometry and balancing equations.');

-- Request availability (Mon/Wed afternoons for Sam, Tue/Thu for Jamie and Taylor)
INSERT OR IGNORE INTO request_availability (request_id, day_of_week, start_minute, end_minute) VALUES
  (1, 1, 900, 1020),
  (1, 3, 900, 1020),
  (2, 2, 870, 990),
  (2, 4, 870, 990),
  (3, 2, 900, 1080),
  (3, 4, 900, 1080);
