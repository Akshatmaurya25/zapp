const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env.local' });

async function applyStreamingMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🚀 Applying streaming migration...');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '005_create_live_streams_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // If the RPC function doesn't exist, try direct SQL execution
      console.log('Trying direct SQL execution...');

      // Split SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          const { error: execError } = await supabase.rpc('exec', { query: statement });

          if (execError) {
            console.error('SQL execution error:', execError);
            console.log('Statement:', statement);
          }
        }
      }
    }

    console.log('✅ Migration applied successfully!');

    // Verify the tables were created
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['live_streams', 'stream_tips']);

    if (tableError) {
      console.error('Error checking tables:', tableError);
    } else {
      console.log('📋 Created tables:', tables.map(t => t.table_name));
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative manual approach if the above doesn't work
async function manualMigration() {
  console.log('📝 Manual migration approach...');
  console.log('Please execute the following SQL in your Supabase SQL editor:');
  console.log('=' * 60);

  const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '005_create_live_streams_table.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log(migrationSQL);

  console.log('=' * 60);
  console.log('Copy and paste the above SQL into Supabase SQL Editor and run it.');
}

if (require.main === module) {
  applyStreamingMigration().catch(error => {
    console.error('Migration failed, showing manual approach...');
    manualMigration();
  });
}

module.exports = { applyStreamingMigration, manualMigration };