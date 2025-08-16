-- First, delete duplicate records, keeping only the most recent one per user
DELETE FROM personal_finances 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM personal_finances 
  ORDER BY user_id, updated_at DESC
);

-- Add unique constraint to prevent duplicates in the future
ALTER TABLE personal_finances 
ADD CONSTRAINT personal_finances_user_id_unique UNIQUE (user_id);