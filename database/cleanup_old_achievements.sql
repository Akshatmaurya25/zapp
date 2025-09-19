-- DANGER: This script removes the old achievement system
-- Only run this if you want to completely start fresh
-- Make sure to backup your data first!

-- WARNING: This will delete all existing achievement data
-- Uncomment the lines below only if you're sure you want to proceed

/*
-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_auto_check_achievements ON user_platform_metrics;
DROP TRIGGER IF EXISTS trigger_increment_comments ON comments;
DROP TRIGGER IF EXISTS trigger_increment_likes ON likes;
DROP TRIGGER IF EXISTS trigger_increment_posts ON posts;
DROP TRIGGER IF EXISTS trigger_update_last_activity_posts ON posts;

-- Drop functions
DROP FUNCTION IF EXISTS trigger_check_achievements();
DROP FUNCTION IF EXISTS check_achievement_requirements(user_platform_metrics, JSONB);
DROP FUNCTION IF EXISTS check_and_award_achievements(UUID);
DROP FUNCTION IF EXISTS increment_user_comments();
DROP FUNCTION IF EXISTS increment_user_likes_given();
DROP FUNCTION IF EXISTS increment_user_posts();
DROP FUNCTION IF EXISTS update_user_last_activity();

-- Drop tables in dependency order
DROP TABLE IF EXISTS platform_nfts;
DROP TABLE IF EXISTS achievement_progress;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS nft_achievement_types;
DROP TABLE IF EXISTS user_platform_metrics;

-- Drop old achievements table if it exists
DROP TABLE IF EXISTS achievements;
*/

-- Instead, just show what would be deleted
SELECT 'This script would delete the following objects:' as warning;

SELECT 'TABLE: ' || table_name as objects_to_delete
FROM information_schema.tables
WHERE table_name IN (
  'achievements',
  'user_platform_metrics',
  'nft_achievement_types',
  'user_achievements',
  'platform_nfts',
  'achievement_progress'
)

UNION ALL

SELECT 'INDEX: ' || indexname
FROM pg_indexes
WHERE indexname LIKE '%achievement%'
   OR indexname LIKE '%nft%'
   OR indexname LIKE '%metric%'

UNION ALL

SELECT 'TRIGGER: ' || trigger_name
FROM information_schema.triggers
WHERE trigger_name LIKE '%achievement%'
   OR trigger_name LIKE '%post%'
   OR trigger_name LIKE '%like%'
   OR trigger_name LIKE '%comment%'

UNION ALL

SELECT 'FUNCTION: ' || routine_name
FROM information_schema.routines
WHERE routine_name LIKE '%achievement%'
   OR routine_name LIKE '%user%'
   OR routine_name LIKE '%metric%';

SELECT '⚠️  To actually delete these objects, uncomment the code in this file' as instructions;