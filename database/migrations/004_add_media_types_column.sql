-- Migration: Add media_types column to posts table
-- This column will store MIME types corresponding to media_ipfs array

-- Add media_types column to posts table
ALTER TABLE posts
ADD COLUMN media_types TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN posts.media_types IS 'Array of MIME types corresponding to media_ipfs array (e.g., [''image/jpeg'', ''video/mp4''])';

-- Create index for media type queries (optional, for future filtering)
CREATE INDEX idx_posts_media_types ON posts USING GIN (media_types);

-- Update existing posts to have empty media_types array where media_ipfs exists
UPDATE posts
SET media_types = ARRAY[]::TEXT[]
WHERE media_ipfs IS NOT NULL AND media_types IS NULL;