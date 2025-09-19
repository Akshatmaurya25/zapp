-- Check the actual ID formats in your database
-- Run this in Supabase SQL editor to see what's happening

-- Check posts table structure and sample data
SELECT
  id,
  pg_typeof(id) as id_type,
  user_id,
  pg_typeof(user_id) as user_id_type,
  content,
  created_at
FROM posts
LIMIT 5;

-- Check comments table structure
SELECT
  id,
  pg_typeof(id) as id_type,
  post_id,
  pg_typeof(post_id) as post_id_type,
  user_id,
  pg_typeof(user_id) as user_id_type
FROM comments
LIMIT 5;

-- Check likes table structure
SELECT
  id,
  pg_typeof(id) as id_type,
  post_id,
  pg_typeof(post_id) as post_id_type,
  user_id,
  pg_typeof(user_id) as user_id_type
FROM likes
LIMIT 5;

-- Check users table
SELECT
  id,
  pg_typeof(id) as id_type,
  username,
  display_name
FROM users
LIMIT 3;

-- Check if you have any posts with simple integer IDs
SELECT
  id,
  LENGTH(id::text) as id_length,
  id::text as id_as_text
FROM posts
ORDER BY created_at DESC
LIMIT 10;