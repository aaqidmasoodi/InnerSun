/*
  # Add dashboard insights storage

  1. New Tables
    - `user_insights` - stores AI-generated dashboard insights for users
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `total_entries` (integer)
      - `average_mood` (decimal)
      - `streak` (integer)
      - `common_themes` (jsonb array)
      - `sentiment_distribution` (jsonb object)
      - `ai_summary` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_insights` table
    - Add policies for users to manage their own insights
*/

CREATE TABLE IF NOT EXISTS user_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_entries integer NOT NULL DEFAULT 0,
  average_mood decimal(3,2) NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  common_themes jsonb DEFAULT '[]'::jsonb,
  sentiment_distribution jsonb DEFAULT '{}'::jsonb,
  ai_summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own insights"
  ON user_insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON user_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON user_insights
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON user_insights
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create unique constraint for one insight record per user
CREATE UNIQUE INDEX IF NOT EXISTS user_insights_user_id_idx 
ON user_insights(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_insights_updated_at
  BEFORE UPDATE ON user_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();