-- Add language preference to user profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language ON profiles(preferred_language);
