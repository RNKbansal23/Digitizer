-- 1. Create Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  teacher_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, class_name)
);

-- 2. Create Teacher Attendance Table
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'leave')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, date)
);

-- Disable RLS for testing
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_attendance DISABLE ROW LEVEL SECURITY;
