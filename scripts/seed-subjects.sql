-- Seed the subjects table from packages/shared/src/constants.ts
-- Run: wrangler d1 execute academy-tutoring-db --local --file scripts/seed-subjects.sql
-- For production (no --local flag):
-- wrangler d1 execute academy-tutoring-db --file scripts/seed-subjects.sql

INSERT OR IGNORE INTO subjects (id, name, category) VALUES
  ('algebra-1',           'Algebra I',                   'Math'),
  ('algebra-2',           'Algebra II',                  'Math'),
  ('geometry',            'Geometry',                    'Math'),
  ('precalculus',         'Pre-Calculus',                'Math'),
  ('calculus',            'Calculus (AB/BC)',             'Math'),
  ('statistics',          'Statistics',                  'Math'),
  ('biology',             'Biology',                     'Science'),
  ('chemistry',           'Chemistry',                   'Science'),
  ('physics',             'Physics',                     'Science'),
  ('environmental-science','Environmental Science',      'Science'),
  ('english-9',           'English 9',                   'English'),
  ('english-10',          'English 10',                  'English'),
  ('english-11',          'English 11',                  'English'),
  ('english-12',          'English 12',                  'English'),
  ('ap-lang',             'AP Language & Composition',   'English'),
  ('ap-lit',              'AP Literature & Composition', 'English'),
  ('world-history',       'World History',               'History'),
  ('us-history',          'US History',                  'History'),
  ('ap-world',            'AP World History',            'History'),
  ('ap-us-history',       'AP US History',               'History'),
  ('ap-gov',              'AP Government',               'History'),
  ('spanish',             'Spanish',                     'Language'),
  ('french',              'French',                      'Language'),
  ('mandarin',            'Mandarin',                    'Language'),
  ('computer-science',    'Computer Science',            'Other'),
  ('economics',           'Economics',                   'Other');
