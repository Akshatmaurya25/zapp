-- Check what achievement-related objects already exist in your database
-- Run this first to see what you already have

-- Check existing tables
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name IN (
  'achievements',
  'user_platform_metrics',
  'nft_achievement_types',
  'user_achievements',
  'platform_nfts',
  'achievement_progress'
)
ORDER BY table_name;

-- Check existing indexes
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE indexname LIKE '%achievement%'
   OR indexname LIKE '%nft%'
   OR indexname LIKE '%metric%'
ORDER BY tablename, indexname;

-- Check existing triggers
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%achievement%'
   OR trigger_name LIKE '%post%'
   OR trigger_name LIKE '%like%'
   OR trigger_name LIKE '%comment%'
ORDER BY event_object_table, trigger_name;

-- Check existing functions
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name LIKE '%achievement%'
   OR routine_name LIKE '%user%'
   OR routine_name LIKE '%metric%'
ORDER BY routine_name;

-- Check if you have any achievement data
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'achievements') THEN
    RAISE NOTICE 'Found existing achievements table with % records',
      (SELECT COUNT(*) FROM achievements);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nft_achievement_types') THEN
    RAISE NOTICE 'Found existing nft_achievement_types table with % records',
      (SELECT COUNT(*) FROM nft_achievement_types);
  END IF;
END $$;