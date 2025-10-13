-- Add job field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS job TEXT;