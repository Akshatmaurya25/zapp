-- Achievement Definitions Seed Data
-- Based on the comprehensive NFT achievement system specification

-- Clear existing data (be careful in production)
-- DELETE FROM platform_nfts;
-- DELETE FROM user_achievements;
-- DELETE FROM achievement_progress;
-- DELETE FROM nft_achievement_types;

-- 1. Platform Journey NFTs (Onboarding & First Experiences)
INSERT INTO nft_achievement_types (name, display_name, description, category, rarity_level, requirements, color_scheme, badge_icon, sort_order) VALUES

('gaming_explorer', 'Gaming Explorer', 'Account created and wallet connected', 'journey', 1, '{"account_created": [1]}', '#4F46E5', '🎮', 10),
('profile_pioneer', 'Profile Pioneer', 'Complete profile with gaming interests and bio', 'journey', 1, '{"profile_completed": [1]}', '#059669', '👤', 20),
('first_post', 'First Post', 'Share your first gaming moment, screenshot, or story', 'journey', 1, '{"total_posts": [1]}', '#DC2626', '📝', 30),
('community_joiner', 'Community Joiner', 'Follow your first 5 users', 'journey', 1, '{"following_count": [5]}', '#7C3AED', '👥', 40),
('first_liker', 'First Liker', 'Give your first like to another post', 'journey', 1, '{"total_likes_given": [1]}', '❤️', '#EC4899', 50),
('first_commenter', 'First Commenter', 'Leave your first meaningful comment', 'journey', 1, '{"total_comments_made": [1]}', '#F59E0B', '💬', 60),
('conversation_starter', 'Conversation Starter', 'Your first post gets 5+ comments and likes combined', 'journey', 2, '{"first_popular_post": [1]}', '#8B5CF6', '🔥', 70),
('early_bird', 'Early Bird', 'Active for 7 consecutive days after signup', 'journey', 2, '{"consecutive_active_days": [7]}', '#06B6D4', '🌅', 80),

-- 2. Content Creator NFTs (Posting & Content Creation)
('storyteller', 'Storyteller', 'Post 10 gaming stories and moments', 'creator', 2, '{"total_posts": [10]}', '#10B981', '📖', 110),
('screenshot_warrior', 'Screenshot Warrior', 'Share 25 gaming screenshots', 'creator', 2, '{"screenshot_posts": [25]}', '#F97316', '📸', 120),
('gaming_guide_creator', 'Gaming Guide Creator', 'Post 5 helpful gaming tips, guides, or tutorials', 'creator', 3, '{"guide_posts": [5]}', '#8B5CF6', '📚', 130),
('consistent_creator', 'Consistent Creator', 'Post daily for 7 consecutive days', 'creator', 3, '{"daily_posting_streak": [7]}', '#DC2626', '⚡', 140),
('weekly_warrior', 'Weekly Warrior', 'Post weekly for 8 consecutive weeks', 'creator', 3, '{"weekly_posting_streak": [8]}', '#7C3AED', '🗓️', 150),
('viral_creator', 'Viral Creator', 'Single post reaches 100+ likes', 'creator', 4, '{"single_post_likes": [100]}', '#F59E0B', '🚀', 160),
('popular_creator', 'Popular Creator', 'Average 50+ likes per post (last 10 posts)', 'creator', 4, '{"average_post_engagement": [50]}', '#EC4899', '⭐', 170),
('multi_genre_master', 'Multi-Genre Master', 'Post about 5+ different game genres', 'creator', 3, '{"gaming_genres_count": [5]}', '#06B6D4', '🎯', 180),

-- Content Quality Recognition
('community_favorite', 'Community Favorite', 'Post gets featured or highlighted by platform', 'creator', 4, '{"featured_posts": [1]}', '#FBBF24', '🏆', 190),
('helpful_gamer', 'Helpful Gamer', 'Posts consistently get helpful and useful reactions', 'creator', 3, '{"helpful_reactions_received": [25]}', '#10B981', '🤝', 200),
('original_creator', 'Original Creator', 'Create unique, high-quality gaming content consistently', 'creator', 4, '{"original_content_score": [80]}', '#8B5CF6', '✨', 210),
('review_master', 'Review Master', 'Write 10+ detailed, helpful game reviews', 'creator', 3, '{"review_posts": [10]}', '#F97316', '⭐', 220),

-- 3. Social Engagement NFTs (Community Interaction)
('generous_heart', 'Generous Heart', 'Give 100+ likes to other users', 'social', 2, '{"total_likes_given": [100]}', '#EC4899', '💝', 310),
('thoughtful_commenter', 'Thoughtful Commenter', 'Leave 50+ meaningful comments', 'social', 2, '{"total_comments_made": [50]}', '#059669', '💭', 320),
('discussion_starter', 'Discussion Starter', 'Start 10 conversations that get 20+ replies each', 'social', 3, '{"conversations_started": [10]}', '#DC2626', '🗣️', 330),
('community_helper', 'Community Helper', 'Help newcomers (measured by helpful reactions)', 'social', 3, '{"newcomer_help_score": [20]}', '#10B981', '🆘', 340),
('social_butterfly', 'Social Butterfly', 'Interact with 100+ different users', 'social', 3, '{"unique_users_interacted": [100]}', '#F59E0B', '🦋', 350),
('popular_member', 'Popular Member', 'Get followed by 50+ users', 'social', 3, '{"followers_count": [50]}', '#8B5CF6', '📈', 360),
('networking_pro', 'Networking Pro', 'Active community engagement with balanced following ratio', 'social', 4, '{"networking_score": [75]}', '#06B6D4', '🌐', 370),

-- Community Leadership
('mentor', 'Mentor', 'Help 10+ new users get started on platform', 'social', 4, '{"mentorship_score": [10]}', '#FBBF24', '🎓', 380),
('positive_vibes', 'Positive Vibes', 'Consistently positive, encouraging comments', 'social', 3, '{"positive_sentiment_score": [85]}', '#EC4899', '☀️', 390),
('bridge_builder', 'Bridge Builder', 'Connect different gaming communities on platform', 'social', 4, '{"community_bridge_score": [15]}', '#10B981', '🌉', 400),
('community_moderator', 'Community Moderator', 'Trusted member who helps maintain platform quality', 'social', 5, '{"moderation_trust_score": [90]}', '#7C3AED', '🛡️', 410),

-- 4. Platform Loyalty NFTs (Long-term Engagement)
('week_warrior', 'Week Warrior', 'Active for 7 consecutive days', 'loyalty', 1, '{"consecutive_active_days": [7]}', '#059669', '📅', 510),
('monthly_regular', 'Monthly Regular', 'Active for 30 consecutive days', 'loyalty', 2, '{"consecutive_active_days": [30]}', '#DC2626', '🗓️', 520),
('platform_veteran', 'Platform Veteran', 'Member for 6+ months with consistent activity', 'loyalty', 3, '{"total_active_days": [180]}', '#F59E0B', '🏅', 530),
('daily_gamer', 'Daily Gamer', 'Log in daily for 30 consecutive days', 'loyalty', 3, '{"daily_login_streak": [30]}', '#8B5CF6', '🎮', 540),
('streak_master', 'Streak Master', 'Maintain 100-day activity streak', 'loyalty', 4, '{"consecutive_active_days": [100]}', '#EC4899', '🔥', 550),
('anniversary_member', 'Anniversary Member', 'Active during platform anniversaries', 'loyalty', 3, '{"anniversary_participation": [1]}', '#06B6D4', '🎉', 560),

-- Participation Rewards
('event_participant', 'Event Participant', 'Join 5+ platform events and challenges', 'loyalty', 2, '{"event_participation": [5]}', '#10B981', '🎪', 570),
('feature_tester', 'Feature Tester', 'Among first to try new platform features', 'loyalty', 3, '{"beta_tester_score": [5]}', '#F97316', '🧪', 580),
('feedback_provider', 'Feedback Provider', 'Give valuable feedback that improves platform', 'loyalty', 4, '{"feedback_value_score": [10]}', '#8B5CF6', '💡', 590),
('beta_legend', 'Beta Legend', 'Participated in platform beta testing', 'loyalty', 4, '{"beta_participation": [1]}', '#FBBF24', '🚀', 600),

-- 5. Gaming Content Specialist NFTs (Gaming-Focused Achievements)
('setup_showcase', 'Setup Showcase', 'Share impressive gaming setup and collection posts', 'gaming', 2, '{"setup_posts": [5]}', '#DC2626', '⚙️', 710),
('gaming_news_curator', 'Gaming News Curator', 'Regularly share and discuss gaming news', 'gaming', 3, '{"news_posts": [15]}', '#059669', '📰', 720),
('screenshot_artist', 'Screenshot Artist', 'Gaming screenshots consistently get high engagement', 'gaming', 3, '{"screenshot_engagement": [500]}', '#F59E0B', '🎨', 730),
('gaming_collector', 'Gaming Collector', 'Showcase gaming collection and merchandise', 'gaming', 3, '{"collection_posts": [10]}', '#8B5CF6', '🏆', 740),
('retro_gamer', 'Retro Gamer', 'Focus on classic and vintage gaming content', 'gaming', 3, '{"retro_posts": [20]}', '#EC4899', '👾', 750),
('indie_game_champion', 'Indie Game Champion', 'Promote and discover indie games', 'gaming', 4, '{"indie_promotion_score": [25]}', '#06B6D4', '💎', 760),

-- Gaming Community Building
('game_discoverer', 'Game Discoverer', 'Introduce community to 10+ new games', 'gaming', 4, '{"games_introduced": [10]}', '#10B981', '🔍', 770),
('gaming_group_leader', 'Gaming Group Leader', 'Create and maintain active gaming discussion groups', 'gaming', 4, '{"group_leadership_score": [15]}', '#F97316', '👑', 780),
('tournament_organizer', 'Tournament Organizer', 'Organize community gaming events and competitions', 'gaming', 5, '{"tournaments_organized": [3]}', '#8B5CF6', '🏁', 790),
('gaming_mentor', 'Gaming Mentor', 'Help others improve their gaming skills and knowledge', 'gaming', 4, '{"gaming_mentorship": [20]}', '#FBBF24', '🎯', 800),
('cross_platform_expert', 'Cross-Platform Expert', 'Active across multiple gaming platforms', 'gaming', 3, '{"platforms_active": [5]}', '#DC2626', '🌐', 810),

-- 6. Special Edition & Elite NFTs (Rare & Exclusive)
-- Limited Edition (Time-Sensitive)
('platform_pioneer', 'Platform Pioneer', 'Among the first 1000 users ever', 'special', 5, '{"user_rank": [1000]}', '#FFD700', '🥇', 910),
('launch_week_legend', 'Launch Week Legend', 'Highly active during platform launch week', 'special', 5, '{"launch_week_score": [100]}', '#FF6B35', '🚀', 920),
('holiday_special', 'Holiday Special', 'Active during special platform events', 'special', 4, '{"holiday_participation": [3]}', '#DC2626', '🎄', 930),
('milestone_witness', 'Milestone Witness', 'Present for major platform milestones', 'special', 4, '{"milestone_witness": [1]}', '#8B5CF6', '👁️', 940),

-- Achievement Combinations (Elite Tier)
('triple_threat', 'Triple Threat', 'High scores in content creation, social engagement, and loyalty', 'special', 5, '{"triple_excellence": [1]}', '#EC4899', '⚡', 950),
('complete_gamer', 'Complete Gamer', 'Achieved top tier in all gaming content categories', 'special', 5, '{"gaming_mastery": [1]}', '#10B981', '🎮', 960),
('platform_champion', 'Platform Champion', 'Top 1% users in multiple achievement categories', 'special', 5, '{"champion_status": [1]}', '#F59E0B', '🏆', 970),
('legendary_contributor', 'Legendary Contributor', 'Exceptional impact on platform growth and community', 'special', 5, '{"legendary_impact": [1]}', '#8B5CF6', '⭐', 980),

-- Ultra-Rare (Top 0.1% Users)
('platform_architect', 'Platform Architect', 'Significantly influenced platform development and direction', 'special', 5, '{"architect_influence": [1]}', '#FBBF24', '🏗️', 990),
('community_legend', 'Community Legend', 'Universally respected community member', 'special', 5, '{"legend_status": [1]}', '#EC4899', '👑', 995),
('gaming_icon', 'Gaming Icon', 'Recognized gaming authority on the platform', 'special', 5, '{"icon_status": [1]}', '#DC2626', '🌟', 999);

-- Set limited edition flags and max recipients for special achievements
UPDATE nft_achievement_types SET
  is_limited_edition = true,
  max_recipients = 1000
WHERE name IN ('platform_pioneer', 'launch_week_legend');

UPDATE nft_achievement_types SET
  is_limited_edition = true,
  max_recipients = 100
WHERE name IN ('triple_threat', 'complete_gamer', 'platform_champion', 'legendary_contributor');

UPDATE nft_achievement_types SET
  is_limited_edition = true,
  max_recipients = 10
WHERE name IN ('platform_architect', 'community_legend', 'gaming_icon');