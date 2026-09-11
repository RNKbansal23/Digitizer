-- Migration for Parent Login Feature

-- Add student_id to profiles table so we can link parent logins to specific students
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE CASCADE;

-- Update the check constraint on the role column to allow 'parent'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('principal', 'teacher', 'superadmin', 'parent'));
