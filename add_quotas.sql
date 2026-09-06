-- Run this query in your Supabase SQL Editor to add quota fields to the schools table
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS max_teachers INTEGER DEFAULT 10;
