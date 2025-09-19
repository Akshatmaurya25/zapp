require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function simpleFixAndSetup() {
  console.log('🎯 Simple fix and setup for demo achievements...\n')

  try {
    // First check what user exists
    console.log('📋 Checking existing user...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, display_name, wallet_address')
      .limit(1)

    if (usersError || !users || users.length === 0) {
      console.error('❌ No users found:', usersError)
      console.log('💡 Please connect your wallet in the app first to create a user')
      process.exit(1)
    }

    const user = users[0]
    console.log(`✅ Found user: ${user.username || user.display_name}`)
    console.log(`📍 User ID: ${user.id}`)

    // Check if tables exist by trying to query them
    console.log('\n🔍 Checking table structures...')

    // Check user_platform_metrics table
    try {
      const { data, error } = await supabase
        .from('user_platform_metrics')
        .select('user_id')
        .limit(1)

      if (error) {
        console.log('❌ user_platform_metrics table issue:', error.message)
        // If foreign key constraint error, the table exists but constraint is wrong
        if (error.message.includes('foreign key') || error.message.includes('constraint')) {
          console.log('🔧 Table exists but has wrong foreign key constraint')
        }
      } else {
        console.log('✅ user_platform_metrics table accessible')
      }
    } catch (e) {
      console.log('❌ Error accessing user_platform_metrics:', e.message)
    }

    // Let's try to insert metrics directly with error handling
    console.log('\n📊 Attempting to create user metrics...')

    const { data: metricsData, error: metricsError } = await supabase
      .from('user_platform_metrics')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!metricsData) {
      // Try to insert new metrics
      const { error: insertError } = await supabase
        .from('user_platform_metrics')
        .insert([{
          user_id: user.id,
          total_posts: 5,
          total_likes_given: 25,
          total_comments_made: 12,
          followers_count: 8,
          consecutive_active_days: 10,
          gaming_posts: 4,
          screenshot_posts: 3,
          total_active_days: 15,
          last_activity_date: new Date().toISOString().split('T')[0],
          last_updated: new Date().toISOString()
        }])

      if (insertError) {
        console.log('❌ Error inserting metrics:', insertError.message)

        // If it's a foreign key constraint error, we need to fix the schema
        if (insertError.message.includes('foreign key constraint') && insertError.message.includes('auth.users')) {
          console.log('\n🔧 Detected foreign key constraint pointing to auth.users instead of users table')
          console.log('💡 This needs to be fixed in the database schema')

          // Let's try a workaround - check if we can create achievements without the user metrics first
          console.log('\n🎯 Attempting to create achievements directly...')
          await createAchievementsDirectly(user.id)
          return
        }
      } else {
        console.log('✅ User metrics created successfully')
      }
    } else {
      console.log('✅ User metrics already exist')
    }

    // Now try to create achievements
    await createAchievementsDirectly(user.id)

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

async function createAchievementsDirectly(userId) {
  console.log('\n🏆 Creating achievements directly...')

  try {
    // Get achievement types
    const { data: achievementTypes, error: typesError } = await supabase
      .from('nft_achievement_types')
      .select('id, name, display_name, description')
      .in('name', ['first_post', 'gaming_explorer', 'generous_heart', 'week_warrior', 'storyteller'])

    if (typesError) {
      console.error('❌ Error fetching achievement types:', typesError)
      return
    }

    if (!achievementTypes || achievementTypes.length === 0) {
      console.log('❌ No achievement types found. Need to run achievement definitions first.')
      return
    }

    console.log(`📋 Found ${achievementTypes.length} achievement types`)

    // Create achievements
    const achievementsToCreate = [
      {
        type: 'gaming_explorer',
        metric_value: 1,
        days_ago: 5
      },
      {
        type: 'first_post',
        metric_value: 1,
        days_ago: 4
      },
      {
        type: 'generous_heart',
        metric_value: 25,
        days_ago: 2
      },
      {
        type: 'storyteller',
        metric_value: 5,
        days_ago: 1
      },
      {
        type: 'week_warrior',
        metric_value: 10,
        days_ago: 0
      }
    ]

    let successCount = 0

    for (const achievement of achievementsToCreate) {
      const achievementType = achievementTypes.find(t => t.name === achievement.type)
      if (!achievementType) {
        console.log(`⚠️ Achievement type ${achievement.type} not found`)
        continue
      }

      const achievedAt = new Date()
      achievedAt.setDate(achievedAt.getDate() - achievement.days_ago)

      const { error: achievementError } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: userId,
          achievement_type_id: achievementType.id,
          achieved_at: achievedAt.toISOString(),
          metric_value: achievement.metric_value,
          metadata: {
            achievement_name: achievement.type,
            awarded_automatically: true,
            demo_data: true
          },
          is_nft_minted: false
        }, {
          onConflict: 'user_id,achievement_type_id'
        })

      if (achievementError) {
        console.log(`❌ Error creating achievement ${achievement.type}:`, achievementError.message)
      } else {
        console.log(`✅ Created achievement: ${achievementType.display_name}`)
        successCount++
      }
    }

    // Verify what we created
    if (successCount > 0) {
      console.log('\n🔍 Verifying created achievements...')
      const { data: userAchievements, error: verifyError } = await supabase
        .from('user_achievements')
        .select(`
          id,
          achieved_at,
          metric_value,
          is_nft_minted,
          nft_achievement_types (
            display_name,
            description,
            category,
            rarity_level,
            color_scheme,
            badge_icon
          )
        `)
        .eq('user_id', userId)
        .eq('is_nft_minted', false)
        .order('achieved_at', { ascending: false })

      if (verifyError) {
        console.error('❌ Error verifying achievements:', verifyError)
      } else {
        console.log(`\n🎉 Success! ${userAchievements.length} achievements ready for NFT minting:`)
        userAchievements.forEach((achievement, index) => {
          const type = achievement.nft_achievement_types
          console.log(`${index + 1}. ${type.badge_icon} ${type.display_name}`)
          console.log(`   Category: ${type.category} | Rarity: ${type.rarity_level}/5`)
          console.log(`   Achieved: ${new Date(achievement.achieved_at).toLocaleDateString()}`)
          console.log('')
        })

        console.log('🚀 Demo setup complete!')
        console.log(`\n📱 Now visit: http://localhost:3000/achievements`)
        console.log('🎯 You should see eligible achievements ready to mint as NFTs!')
      }
    } else {
      console.log('\n❌ No achievements were created successfully')
    }

  } catch (error) {
    console.error('❌ Achievement creation failed:', error)
  }
}

simpleFixAndSetup()