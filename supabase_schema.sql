-- Run these queries in your Supabase SQL Editor to set up the tables for School Digitizer

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  roll INTEGER NOT NULL,
  parent_phone TEXT NOT NULL,
  class_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Daily Logs Table (Homework, date)
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  homework_base64 TEXT,
  class_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Absences Table (Links student to daily log)
CREATE TABLE IF NOT EXISTS absences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Leave Requests Table (Parents reporting sick)
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Announcements Table (Holidays, PTMs)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Ensure Row Level Security (RLS) is disabled for rapid prototyping, 
-- or properly configured if going to production.
