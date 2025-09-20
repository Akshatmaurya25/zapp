const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createStreamsTable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🚀 Creating live_streams table...');

    // First, check if table exists
    const { data: existingTables } = await supabase
      .from('live_streams')
      .select('id')
      .limit(1);

    if (existingTables !== null) {
      console.log('✅ live_streams table already exists!');
    } else {
      console.log('❌ Table does not exist, needs to be created manually.');
      console.log('\n📝 Please run this SQL in your Supabase SQL Editor:');
      console.log('=' * 80);
      console.log(`
-- Create live_streams table
CREATE TABLE IF NOT EXISTS live_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    streamer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stream_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT 'Gaming Stream',
    game_name TEXT,

    -- Stream URLs
    rtmp_url TEXT,
    hls_url TEXT,

    -- Stream status
    is_active BOOLEAN DEFAULT FALSE,
    is_live BOOLEAN DEFAULT FALSE,
    viewer_count INTEGER DEFAULT 0,
    total_tips DECIMAL(78, 18) DEFAULT 0,

    -- Stream metadata
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_live_streams_streamer_id ON live_streams(streamer_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_stream_key ON live_streams(stream_key);
CREATE INDEX IF NOT EXISTS idx_live_streams_is_active ON live_streams(is_active);
CREATE INDEX IF NOT EXISTS idx_live_streams_created_at ON live_streams(created_at DESC);

-- Enable RLS
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active streams" ON live_streams
FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own streams" ON live_streams
FOR SELECT USING (
    streamer_id IN (
        SELECT id FROM users
        WHERE wallet_address = LOWER(current_setting('request.headers.x-wallet-address', true))
    )
);

CREATE POLICY "Users can create own streams" ON live_streams
FOR INSERT WITH CHECK (
    streamer_id IN (
        SELECT id FROM users
        WHERE wallet_address = LOWER(current_setting('request.headers.x-wallet-address', true))
    )
);

CREATE POLICY "Users can update own streams" ON live_streams
FOR UPDATE USING (
    streamer_id IN (
        SELECT id FROM users
        WHERE wallet_address = LOWER(current_setting('request.headers.x-wallet-address', true))
    )
);
      `);
      console.log('=' * 80);
    }

    // Test the foreign key relationship
    console.log('\n🔍 Testing foreign key relationship...');
    const { data: testQuery, error: testError } = await supabase
      .from('live_streams')
      .select(`
        id,
        title,
        users!streamer_id (
          id,
          username,
          display_name
        )
      `)
      .limit(1);

    if (testError) {
      console.error('❌ Foreign key relationship test failed:', testError);
      console.log('\n💡 This means the table may not be created yet or the relationship is not properly configured.');
    } else {
      console.log('✅ Foreign key relationship working correctly!');
      console.log('📊 Test query result:', testQuery);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

if (require.main === module) {
  createStreamsTable();
}

module.exports = { createStreamsTable };