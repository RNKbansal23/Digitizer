-- SaaS Transformation Migration Script
-- Run this in your Supabase SQL Editor

-- 1. Create Schools Table
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('principal', 'teacher', 'superadmin')),
  class_id TEXT, -- e.g. "5A", only required for teachers
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Update Existing Tables to include school_id
-- For Students
ALTER TABLE students ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
-- For Daily Logs
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
-- For Announcements
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- 4. Create RLS Policies (For true multi-tenancy)
-- Note: You should enable RLS in production, but for testing we leave it disabled or open.
-- If you want to enable it:
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users see students of their school" ON students FOR ALL USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- For now, we will just ensure the columns exist so our app code works.
