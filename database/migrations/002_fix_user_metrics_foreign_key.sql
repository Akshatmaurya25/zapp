-- Fix foreign key constraint in user_platform_metrics table
-- The table was referencing auth.users(id) but should reference users(id)

-- First, drop the existing foreign key constraint
ALTER TABLE user_platform_metrics
DROP CONSTRAINT IF EXISTS user_platform_metrics_user_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE user_platform_metrics
ADD CONSTRAINT user_platform_metrics_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Ensure we have proper index
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_platform_metrics(user_id);