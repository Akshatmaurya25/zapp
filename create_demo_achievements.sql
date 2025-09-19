-- Create demo achievements for testing NFT minting
-- Replace YOUR_USER_ID with your actual user ID from the users table

-- First, let's find your user ID (replace with your wallet address)
-- SELECT id, username, wallet_address FROM users WHERE wallet_address = 'your_wallet_address_here';

-- Create some user metrics to make achievements eligible
-- Replace the user_id with your actual user ID
INSERT INTO user_platform_metrics (
  user_id,
  total_posts,
  total_likes_given,
  total_comments_made,
  followers_count,
  consecutive_active_days,
  gaming_posts,
  screenshot_posts,
  total_active_days,
  last_activity_date,
  last_updated
) VALUES (
  'YOUR_USER_ID', -- Replace with your user ID
  5,  -- 5 posts
  20, -- 20 likes given
  10, -- 10 comments made
  3,  -- 3 followers
  7,  -- 7 consecutive active days
  3,  -- 3 gaming posts
  2,  -- 2 screenshot posts
  10, -- 10 total active days
  CURRENT_DATE,
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  total_posts = 5,
  total_likes_given = 20,
  total_comments_made = 10,
  followers_count = 3,
  consecutive_active_days = 7,
  gaming_posts = 3,
  screenshot_posts = 2,
  total_active_days = 10,
  last_activity_date = CURRENT_DATE,
  last_updated = NOW();

-- Now create some achievements based on these metrics
-- First Post Achievement
INSERT INTO user_achievements (
  user_id,
  achievement_type_id,
  achieved_at,
  metric_value,
  metadata
)
SELECT
  'YOUR_USER_ID', -- Replace with your user ID
  id,
  NOW() - INTERVAL '2 days',
  1,
  jsonb_build_object(
    'achievement_name', name,
    'awarded_automatically', true,
    'demo_data', true
  )
FROM nft_achievement_types
WHERE name = 'first_post'
ON CONFLICT (user_id, achievement_type_id) DO NOTHING;

-- Gaming Explorer Achievement
INSERT INTO user_achievements (
  user_id,
  achievement_type_id,
  achieved_at,
  metric_value,
  metadata
)
SELECT
  'YOUR_USER_ID', -- Replace with your user ID
  id,
  NOW() - INTERVAL '3 days',
  1,
  jsonb_build_object(
    'achievement_name', name,
    'awarded_automatically', true,
    'demo_data', true
  )
FROM nft_achievement_types
WHERE name = 'gaming_explorer'
ON CONFLICT (user_id, achievement_type_id) DO NOTHING;

-- Generous Heart Achievement (for 20 likes given)
INSERT INTO user_achievements (
  user_id,
  achievement_type_id,
  achieved_at,
  metric_value,
  metadata
)
SELECT
  'YOUR_USER_ID', -- Replace with your user ID
  id,
  NOW() - INTERVAL '1 day',
  20,
  jsonb_build_object(
    'achievement_name', name,
    'awarded_automatically', true,
    'demo_data', true
  )
FROM nft_achievement_types
WHERE name = 'generous_heart'
ON CONFLICT (user_id, achievement_type_id) DO NOTHING;

-- Week Warrior Achievement (for 7 consecutive days)
INSERT INTO user_achievements (
  user_id,
  achievement_type_id,
  achieved_at,
  metric_value,
  metadata
)
SELECT
  'YOUR_USER_ID', -- Replace with your user ID
  id,
  NOW(),
  7,
  jsonb_build_object(
    'achievement_name', name,
    'awarded_automatically', true,
    'demo_data', true
  )
FROM nft_achievement_types
WHERE name = 'week_warrior'
ON CONFLICT (user_id, achievement_type_id) DO NOTHING;

-- Storyteller Achievement (for 5 posts)
INSERT INTO user_achievements (
  user_id,
  achievement_type_id,
  achieved_at,
  metric_value,
  metadata
)
SELECT
  'YOUR_USER_ID', -- Replace with your user ID
  id,
  NOW() - INTERVAL '12 hours',
  5,
  jsonb_build_object(
    'achievement_name', name,
    'awarded_automatically', true,
    'demo_data', true
  )
FROM nft_achievement_types
WHERE name = 'storyteller'
ON CONFLICT (user_id, achievement_type_id) DO NOTHING;

-- Check what achievements were created
SELECT
  ua.id,
  ua.achieved_at,
  ua.metric_value,
  ua.is_nft_minted,
  nat.display_name,
  nat.description,
  nat.category,
  nat.rarity_level,
  nat.color_scheme,
  nat.badge_icon
FROM user_achievements ua
JOIN nft_achievement_types nat ON ua.achievement_type_id = nat.id
WHERE ua.user_id = 'YOUR_USER_ID' -- Replace with your user ID
ORDER BY ua.achieved_at DESC;