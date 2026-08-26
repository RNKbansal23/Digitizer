-- Warning: This will delete the existing dummy data in these tables.
-- Run this block in your Supabase SQL Editor to upgrade from the old schema to the new one.

-- 1. Drop old tables to avoid type conflicts (like student_id changing from TEXT to UUID)
DROP TABLE IF EXISTS absences;
DROP TABLE IF EXISTS daily_logs;

-- 2. Create the new Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  roll INTEGER NOT NULL,
  parent_phone TEXT NOT NULL,
  class_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Re-create the Daily Logs Table
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  homework_base64 TEXT,
  class_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Re-create the Absences Table (Now with UUID for student_id)
CREATE TABLE IF NOT EXISTS absences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Leave Requests Table (For Parent sick reporting)
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Announcements Table (For Teacher broadcasting)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Disable Row Level Security (RLS) for testing
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE absences DISABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
