-- Temporarily disable the achievement trigger that's causing type casting issues
-- This allows post creation to work while we fix the underlying trigger function

-- Disable the trigger temporarily
DROP TRIGGER IF EXISTS trigger_auto_check_achievements ON user_platform_metrics;

-- Comment explaining the issue:
-- The trigger function check_achievement_requirements expects a user_platform_metrics record type
-- but gets a generic record type, causing "cannot cast type record to user_platform_metrics" error
-- We'll re-enable this after fixing the function or implementing achievement checking differently