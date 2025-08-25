/*
  # Remove unique constraint to allow multiple entries per day

  1. Changes
    - Drop the unique constraint that prevents multiple entries per user per date
    - This allows users to create multiple journal entries on the same date
    - Each entry will have its own unique ID and AI insights
*/

-- Drop the unique constraint if it exists
DROP INDEX IF EXISTS journal_entries_user_date_idx;

-- Create a regular index for performance (without uniqueness)
CREATE INDEX IF NOT EXISTS journal_entries_user_date_performance_idx 
ON journal_entries(user_id, date DESC);