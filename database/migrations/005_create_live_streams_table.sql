    -- Create live_streams table for streaming functionality
    -- Migration: 005_create_live_streams_table.sql

    -- ============================================================================
    -- LIVE STREAMS TABLE
    -- ============================================================================
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
        viewer_count INTEGER DEFAULT 0,
        total_tips DECIMAL(78, 18) DEFAULT 0,

        -- Stream metadata
        started_at TIMESTAMP WITH TIME ZONE,
        ended_at TIMESTAMP WITH TIME ZONE,

        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Indexes for live_streams table
    CREATE INDEX IF NOT EXISTS idx_live_streams_streamer_id ON live_streams(streamer_id);
    CREATE INDEX IF NOT EXISTS idx_live_streams_stream_key ON live_streams(stream_key);
    CREATE INDEX IF NOT EXISTS idx_live_streams_is_active ON live_streams(is_active);
    CREATE INDEX IF NOT EXISTS idx_live_streams_created_at ON live_streams(created_at DESC);

    -- ============================================================================
    -- STREAM TIPS TABLE (for tipping functionality)
    -- ============================================================================
    CREATE TABLE IF NOT EXISTS stream_tips (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
        from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        -- Tip details
        amount DECIMAL(78, 18) NOT NULL,
        token_symbol TEXT NOT NULL DEFAULT 'SOMI',
        token_address TEXT,
        tx_hash TEXT NOT NULL UNIQUE,

        -- Message
        message TEXT,

        -- Status
        status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, failed

        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        confirmed_at TIMESTAMP WITH TIME ZONE
    );

    -- Indexes for stream_tips table
    CREATE INDEX IF NOT EXISTS idx_stream_tips_stream_id ON stream_tips(stream_id);
    CREATE INDEX IF NOT EXISTS idx_stream_tips_from_user ON stream_tips(from_user_id);
    CREATE INDEX IF NOT EXISTS idx_stream_tips_to_user ON stream_tips(to_user_id);
    CREATE INDEX IF NOT EXISTS idx_stream_tips_tx_hash ON stream_tips(tx_hash);
    CREATE INDEX IF NOT EXISTS idx_stream_tips_created_at ON stream_tips(created_at DESC);

    -- ============================================================================
    -- ROW LEVEL SECURITY POLICIES
    -- ============================================================================

    -- Enable RLS on live_streams table
    ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

    -- Anyone can view active streams
    CREATE POLICY "Anyone can view active streams" ON live_streams
    FOR SELECT USING (is_active = true);

    -- Users can view their own streams (active or inactive)
    CREATE POLICY "Users can view own streams" ON live_streams
    FOR SELECT USING (
        streamer_id IN (
            SELECT id FROM users
            WHERE wallet_address = LOWER(current_setting('request.headers.x-wallet-address', true))
        )
    );

    -- Users can create their own streams
    CREATE POLICY "Users can create own streams" ON live_streams
    FOR INSERT WITH CHECK (
        streamer_id IN (
            SELECT id FROM users
            WHERE wallet_address = LOWER(current_setting('request.headers.x-wallet-address', true))
        )
    );

    -- Users can update their own streams
    CREATE POLICY "Users can update own streams" ON live_streams
    FOR UPDATE USING (
        streamer_id IN (
            SELECT id FROM users
            WHERE wallet_address = LOWER(current_setting('request.headers.x-wallet-address', true))
        )
    );

    -- Users can delete their own streams
    CREATE POLICY "Users can delete own streams" ON live_streams
    FOR DELETE USING (
        streamer_id IN (
            SELECT id FROM users
            WHERE wallet_address = LOWER(current_setting('request.headers.x-wallet-address', true))
        )
    );

    -- Enable RLS on stream_tips table
    ALTER TABLE stream_tips ENABLE ROW LEVEL SECURITY;

    -- Users can view tips for streams they're involved in
    CREATE POLICY "Users can view related stream tips" ON stream_tips
    FOR SELECT USING (
        from_user_id IN (
            SELECT id FROM users
            WHERE wallet_address = LOWER(current_setting('request.headers.x-wallet-address', true))
        ) OR
        to_user_id IN (
            SELECT id FROM users
            WHERE wallet_address = LOWER(current_setting('request.headers.x-wallet-address', true))
        )
    );

    -- Users can create tips
    CREATE POLICY "Users can create tips" ON stream_tips
    FOR INSERT WITH CHECK (
        from_user_id IN (
            SELECT id FROM users
            WHERE wallet_address = LOWER(current_setting('request.headers.x-wallet-address', true))
        )
    );

    -- ============================================================================
    -- TRIGGERS FOR UPDATED_AT
    -- ============================================================================

    -- Trigger for live_streams updated_at
    CREATE TRIGGER update_live_streams_updated_at
        BEFORE UPDATE ON live_streams
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- ============================================================================
    -- FUNCTIONS FOR STREAM STATS
    -- ============================================================================

    -- Function to update stream tip totals
    CREATE OR REPLACE FUNCTION update_stream_tip_totals()
    RETURNS TRIGGER AS $$
    BEGIN
        IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
            UPDATE live_streams
            SET total_tips = total_tips + NEW.amount
            WHERE id = NEW.stream_id;
            RETURN NEW;
        ELSIF TG_OP = 'UPDATE' AND OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
            UPDATE live_streams
            SET total_tips = total_tips + NEW.amount
            WHERE id = NEW.stream_id;
            RETURN NEW;
        ELSIF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
            UPDATE live_streams
            SET total_tips = total_tips - OLD.amount
            WHERE id = NEW.stream_id;
            RETURN NEW;
        END IF;
        RETURN NULL;
    END;
    $$ language 'plpgsql';

    -- Trigger for stream tip totals
    CREATE TRIGGER update_stream_tip_totals_trigger
        AFTER INSERT OR UPDATE ON stream_tips
        
        FOR EACH ROW EXECUTE FUNCTION update_stream_tip_totals();