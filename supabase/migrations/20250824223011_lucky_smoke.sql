/*
  # Add AI insight column to journal entries

  1. Changes
    - Add `ai_insight` column to `journal_entries` table to store AI-generated insights
    - Column is nullable to support existing entries without insights
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'ai_insight'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN ai_insight text;
  END IF;
END $$;