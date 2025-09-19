-- Safe Migration for NFT Achievement System
-- This script checks for existing objects before creating them

-- Create user_platform_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_platform_metrics (
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

-- Create nft_achievement_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS nft_achievement_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL,
  rarity_level INTEGER NOT NULL,
  requirements JSONB NOT NULL,
  image_template VARCHAR,
  color_scheme VARCHAR DEFAULT '#808080',
  badge_icon VARCHAR,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_limited_edition BOOLEAN DEFAULT false,
  max_recipients INTEGER,
  current_recipients INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_type_id UUID REFERENCES nft_achievement_types(id),
  achieved_at TIMESTAMP DEFAULT NOW(),
  metric_value INTEGER,
  metadata JSONB,
  is_nft_minted BOOLEAN DEFAULT false,
  nft_mint_requested_at TIMESTAMP
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_achievements_user_id_achievement_type_id_key'
  ) THEN
    ALTER TABLE user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_type_id_key
    UNIQUE(user_id, achievement_type_id);
  END IF;
END $$;

-- Create platform_nfts table if it doesn't exist
CREATE TABLE IF NOT EXISTS platform_nfts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_id UUID REFERENCES user_achievements(id),
  token_id VARCHAR,
  contract_address VARCHAR,
  metadata_uri VARCHAR,
  metadata JSONB,
  tx_hash VARCHAR,
  minted_at TIMESTAMP DEFAULT NOW(),
  blockchain_network VARCHAR DEFAULT 'somnia'
);

-- Create achievement_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS achievement_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_type_id UUID REFERENCES nft_achievement_types(id),
  progress_data JSONB,
  percentage_complete INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'achievement_progress_user_id_achievement_type_id_key'
  ) THEN
    ALTER TABLE achievement_progress
    ADD CONSTRAINT achievement_progress_user_id_achievement_type_id_key
    UNIQUE(user_id, achievement_type_id);
  END IF;
END $$;

-- Create indexes only if they don't exist
DO $$
BEGIN
  -- Check and create indexes for user_platform_metrics
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_metrics_user_id') THEN
    CREATE INDEX idx_user_metrics_user_id ON user_platform_metrics(user_id);
  END IF;

  -- Check and create indexes for user_achievements
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_achievements_user_id') THEN
    CREATE INDEX idx_achievements_user_id ON user_achievements(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_achievements_type') THEN
    CREATE INDEX idx_achievements_type ON user_achievements(achievement_type_id);
  END IF;

  -- Check and create indexes for platform_nfts
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_nfts_user_id') THEN
    CREATE INDEX idx_nfts_user_id ON platform_nfts(user_id);
  END IF;

  -- Check and create indexes for achievement_progress
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_progress_user_id') THEN
    CREATE INDEX idx_progress_user_id ON achievement_progress(user_id);
  END IF;

  -- Check and create indexes for nft_achievement_types
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_achievement_types_category') THEN
    CREATE INDEX idx_achievement_types_category ON nft_achievement_types(category);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_achievement_types_active') THEN
    CREATE INDEX idx_achievement_types_active ON nft_achievement_types(is_active);
  END IF;
END $$;

-- Create or replace functions (these can be safely replaced)
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
              WHEN 'generous_heart' THEN user_metrics.total_likes_given
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

CREATE OR REPLACE FUNCTION trigger_check_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievements(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers only if they don't exist
DO $$
BEGIN
  -- Check and create trigger for posts
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_last_activity_posts') THEN
    CREATE TRIGGER trigger_update_last_activity_posts
      AFTER INSERT ON posts
      FOR EACH ROW
      EXECUTE FUNCTION update_user_last_activity();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_increment_posts') THEN
    CREATE TRIGGER trigger_increment_posts
      AFTER INSERT ON posts
      FOR EACH ROW
      EXECUTE FUNCTION increment_user_posts();
  END IF;

  -- Check and create trigger for likes
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_increment_likes') THEN
    CREATE TRIGGER trigger_increment_likes
      AFTER INSERT ON likes
      FOR EACH ROW
      EXECUTE FUNCTION increment_user_likes_given();
  END IF;

  -- Check and create trigger for achievement checking
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_check_achievements') THEN
    CREATE TRIGGER trigger_auto_check_achievements
      AFTER INSERT OR UPDATE ON user_platform_metrics
      FOR EACH ROW
      EXECUTE FUNCTION trigger_check_achievements();
  END IF;
END $$;

-- Add comments trigger if comments table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_increment_comments') THEN
      CREATE TRIGGER trigger_increment_comments
        AFTER INSERT ON comments
        FOR EACH ROW
        EXECUTE FUNCTION increment_user_comments();
    END IF;
  END IF;
END $$;