require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixForeignKeys() {
  console.log('🔧 Fixing foreign key constraints...\n')

  try {
    // First, drop the existing foreign key constraints if they exist
    console.log('📋 Dropping existing foreign key constraints...')

    const dropConstraints = `
      -- Drop existing foreign key constraints
      ALTER TABLE user_platform_metrics DROP CONSTRAINT IF EXISTS user_platform_metrics_user_id_fkey;
      ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;
      ALTER TABLE platform_nfts DROP CONSTRAINT IF EXISTS platform_nfts_owner_id_fkey;
      ALTER TABLE achievement_progress DROP CONSTRAINT IF EXISTS achievement_progress_user_id_fkey;
    `

    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropConstraints })
    if (dropError) {
      console.log('⚠️ Note: Some constraints may not have existed:', dropError.message)
    } else {
      console.log('✅ Dropped existing constraints')
    }

    // Now add the correct foreign key constraints
    console.log('🔗 Adding correct foreign key constraints...')

    const addConstraints = `
      -- Add correct foreign key constraints referencing the users table (not auth.users)
      ALTER TABLE user_platform_metrics
      ADD CONSTRAINT user_platform_metrics_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

      ALTER TABLE user_achievements
      ADD CONSTRAINT user_achievements_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

      ALTER TABLE platform_nfts
      ADD CONSTRAINT platform_nfts_owner_id_fkey
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

      ALTER TABLE achievement_progress
      ADD CONSTRAINT achievement_progress_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `

    const { error: addError } = await supabase.rpc('exec_sql', { sql: addConstraints })
    if (addError) {
      console.error('❌ Error adding constraints:', addError)

      // Try individual constraint additions to see which one fails
      const constraints = [
        {
          name: 'user_platform_metrics',
          sql: 'ALTER TABLE user_platform_metrics ADD CONSTRAINT user_platform_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;'
        },
        {
          name: 'user_achievements',
          sql: 'ALTER TABLE user_achievements ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;'
        },
        {
          name: 'platform_nfts',
          sql: 'ALTER TABLE platform_nfts ADD CONSTRAINT platform_nfts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;'
        },
        {
          name: 'achievement_progress',
          sql: 'ALTER TABLE achievement_progress ADD CONSTRAINT achievement_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;'
        }
      ]

      for (const constraint of constraints) {
        const { error } = await supabase.rpc('exec_sql', { sql: constraint.sql })
        if (error) {
          console.log(`❌ Failed to add ${constraint.name} constraint:`, error.message)
        } else {
          console.log(`✅ Added ${constraint.name} constraint`)
        }
      }
    } else {
      console.log('✅ Added all foreign key constraints')
    }

    console.log('\n🎯 Foreign key fixes complete!')

  } catch (error) {
    console.error('❌ Fix failed:', error)
  }
}

// Check if exec_sql function exists, if not provide alternative
async function checkAndCreateExecFunction() {
  try {
    // Try to create the exec_sql function if it doesn't exist
    const createFunction = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' })
    if (error && error.message.includes('function exec_sql')) {
      // Function doesn't exist, create it
      const { error: createError } = await supabase
        .from('_any_table_that_exists')
        .select('*')
        .limit(0) // This will fail but lets us execute raw SQL

      // Alternative approach: use direct SQL execution
      console.log('🔧 Function exec_sql not available, using alternative approach...')
      return false
    }
    return true
  } catch (error) {
    return false
  }
}

fixForeignKeys()