/*
  # Fix journal entries unique constraint

  1. Changes
    - Drop the existing unique constraint that prevents multiple entries per day
    - Allow users to create multiple journal entries on the same date
    - Keep the table structure intact but remove the restrictive constraint
*/

-- Drop the unique constraint that limits one entry per user per date
DROP INDEX IF EXISTS journal_entries_user_date_idx;

-- Create a new index for performance without uniqueness constraint
CREATE INDEX IF NOT EXISTS journal_entries_user_date_performance_idx 
ON journal_entries(user_id, date DESC);