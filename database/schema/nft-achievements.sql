-- Enhanced NFT Achievement System Database Schema
-- Extends existing achievement system for comprehensive platform-native NFT rewards

-- User platform metrics tracking (extends existing users table)
CREATE TABLE user_platform_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,

  -- Content creation metrics
  total_posts INTEGER DEFAULT 0,
  gaming_posts INTEGER DEFAULT 0,
  screenshot_posts INTEGER DEFAULT 0,
  guide_posts INTEGER DEFAULT 0,
  review_posts INTEGER DEFAULT 0,

  -- Social engagement metrics
  total_likes_given INTEGER DEFAULT 0,
  total_comments_made INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  total_comments_received INTEGER DEFAULT 0,
  helpful_reactions_received INTEGER DEFAULT 0,

  -- Community metrics
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  unique_users_interacted INTEGER DEFAULT 0,
  conversations_started INTEGER DEFAULT 0,

  -- Activity metrics
  consecutive_active_days INTEGER DEFAULT 0,
  total_active_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- Gaming-specific metrics
  gaming_genres_posted JSONB DEFAULT '[]'::jsonb,
  gaming_platforms_mentioned JSONB DEFAULT '[]'::jsonb,
  games_discussed INTEGER DEFAULT 0,

  -- Quality metrics
  average_post_engagement DECIMAL DEFAULT 0,
  featured_posts INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Achievement definitions and requirements
CREATE TABLE nft_achievement_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL, -- 'journey', 'creator', 'social', 'loyalty', 'gaming', 'special'
  rarity_level INTEGER NOT NULL, -- 1=Common, 2=Uncommon, 3=Rare, 4=Epic, 5=Legendary
  requirements JSONB NOT NULL, -- Conditions that must be met
  image_template VARCHAR, -- Template for NFT image generation
  color_scheme VARCHAR DEFAULT '#808080',
  badge_icon VARCHAR, -- Icon/emoji for the achievement
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_limited_edition BOOLEAN DEFAULT false,
  max_recipients INTEGER, -- For limited edition NFTs
  current_recipients INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User achievements tracking (enhanced version of existing achievements table)
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_type_id UUID REFERENCES nft_achievement_types(id),
  achieved_at TIMESTAMP DEFAULT NOW(),
  metric_value INTEGER, -- The value that triggered achievement (e.g., post count when unlocked)
  metadata JSONB, -- Additional context about the achievement
  is_nft_minted BOOLEAN DEFAULT false,
  nft_mint_requested_at TIMESTAMP,
  UNIQUE(user_id, achievement_type_id)
);

-- NFT minting records
CREATE TABLE platform_nfts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_id UUID REFERENCES user_achievements(id),
  token_id VARCHAR, -- Blockchain token ID
  contract_address VARCHAR,
  metadata_uri VARCHAR, -- IPFS or hosted metadata URL
  metadata JSONB, -- Cached metadata for quick access
  tx_hash VARCHAR, -- Minting transaction hash
  minted_at TIMESTAMP DEFAULT NOW(),
  blockchain_network VARCHAR DEFAULT 'somnia'
);

-- Achievement progress tracking (for complex achievements)
CREATE TABLE achievement_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_type_id UUID REFERENCES nft_achievement_types(id),
  progress_data JSONB, -- Current progress toward achievement
  percentage_complete INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_type_id)
);

-- Indexes for performance
CREATE INDEX idx_user_metrics_user_id ON user_platform_metrics(user_id);
CREATE INDEX idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_achievements_type ON user_achievements(achievement_type_id);
CREATE INDEX idx_nfts_user_id ON platform_nfts(user_id);
CREATE INDEX idx_progress_user_id ON achievement_progress(user_id);
CREATE INDEX idx_achievement_types_category ON nft_achievement_types(category);
CREATE INDEX idx_achievement_types_active ON nft_achievement_types(is_active);

-- Functions to automatically update user metrics
CREATE OR REPLACE FUNCTION update_user_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_platform_metrics (user_id, last_activity_date, last_updated)
  VALUES (NEW.user_id, CURRENT_DATE, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    last_activity_date = CURRENT_DATE,
    last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_user_posts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_platform_metrics (user_id, total_posts, last_updated)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_posts = user_platform_metrics.total_posts + 1,
    last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_user_likes_given()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_platform_metrics (user_id, total_likes_given, last_updated)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_likes_given = user_platform_metrics.total_likes_given + 1,
    last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_user_comments()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_platform_metrics (user_id, total_comments_made, last_updated)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_comments_made = user_platform_metrics.total_comments_made + 1,
    last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically track user activity
CREATE TRIGGER trigger_update_last_activity_posts
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_activity();

CREATE TRIGGER trigger_increment_posts
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION increment_user_posts();

CREATE TRIGGER trigger_increment_likes
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_user_likes_given();

-- Comments trigger (when comments table exists)
-- CREATE TRIGGER trigger_increment_comments
--   AFTER INSERT ON comments
--   FOR EACH ROW
--   EXECUTE FUNCTION increment_user_comments();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_metrics RECORD;
  achievement_type RECORD;
  requirements_met BOOLEAN;
BEGIN
  -- Get user metrics
  SELECT * INTO user_metrics
  FROM user_platform_metrics
  WHERE user_id = target_user_id;

  -- If no metrics record exists, create one
  IF user_metrics IS NULL THEN
    INSERT INTO user_platform_metrics (user_id) VALUES (target_user_id);
    SELECT * INTO user_metrics FROM user_platform_metrics WHERE user_id = target_user_id;
  END IF;

  -- Check each active achievement type
  FOR achievement_type IN
    SELECT * FROM nft_achievement_types
    WHERE is_active = true
    ORDER BY sort_order, created_at
  LOOP
    -- Check if user already has this achievement
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements
      WHERE user_id = target_user_id
      AND achievement_type_id = achievement_type.id
    ) THEN
      -- Check if requirements are met
      requirements_met := check_achievement_requirements(user_metrics, achievement_type.requirements);

      -- Award achievement if requirements met
      IF requirements_met THEN
        INSERT INTO user_achievements (
          user_id,
          achievement_type_id,
          metric_value,
          metadata
        ) VALUES (
          target_user_id,
          achievement_type.id,
          COALESCE(
            CASE achievement_type.name
              WHEN 'first_post' THEN user_metrics.total_posts
              WHEN 'social_butterfly' THEN user_metrics.total_likes_given
              ELSE 1
            END, 1
          ),
          jsonb_build_object(
            'awarded_automatically', true,
            'metric_snapshot', row_to_json(user_metrics)
          )
        );

        -- Update limited edition counter if applicable
        IF achievement_type.is_limited_edition THEN
          UPDATE nft_achievement_types
          SET current_recipients = current_recipients + 1
          WHERE id = achievement_type.id;
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if achievement requirements are met
CREATE OR REPLACE FUNCTION check_achievement_requirements(
  user_metrics user_platform_metrics,
  requirements JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  req_key TEXT;
  req_value JSONB;
  user_value INTEGER;
BEGIN
  -- Iterate through each requirement
  FOR req_key, req_value IN SELECT * FROM jsonb_each(requirements)
  LOOP
    -- Get the user's current value for this metric
    user_value := CASE req_key
      WHEN 'total_posts' THEN user_metrics.total_posts
      WHEN 'total_likes_given' THEN user_metrics.total_likes_given
      WHEN 'total_comments_made' THEN user_metrics.total_comments_made
      WHEN 'followers_count' THEN user_metrics.followers_count
      WHEN 'consecutive_active_days' THEN user_metrics.consecutive_active_days
      WHEN 'total_active_days' THEN user_metrics.total_active_days
      WHEN 'gaming_posts' THEN user_metrics.gaming_posts
      WHEN 'screenshot_posts' THEN user_metrics.screenshot_posts
      WHEN 'unique_users_interacted' THEN user_metrics.unique_users_interacted
      ELSE 0
    END;

    -- Check if requirement is met
    IF user_value < (req_value->>0)::INTEGER THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically check achievements after metrics update
CREATE OR REPLACE FUNCTION trigger_check_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievements(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_check_achievements
  AFTER INSERT OR UPDATE ON user_platform_metrics
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements();