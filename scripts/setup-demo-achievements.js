require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDemoAchievements() {
  console.log('🎯 Setting up demo achievements for NFT minting...\n')

  try {
    // Find the first user (or get all users to let you choose)
    console.log('📋 Finding users in database...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, display_name, wallet_address')
      .limit(5)

    if (usersError || !users || users.length === 0) {
      console.error('❌ No users found or error:', usersError)
      console.log('💡 Create a user first by connecting your wallet in the app')
      process.exit(1)
    }

    console.log('👥 Found users:')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username || 'No username'} (${user.display_name || 'No display name'})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Wallet: ${user.wallet_address}`)
      console.log('')
    })

    // Use the first user for demo
    const targetUser = users[0]
    console.log(`🎯 Setting up achievements for: ${targetUser.username || targetUser.display_name || 'User'}`)
    console.log(`📍 User ID: ${targetUser.id}\n`)

    // Create user metrics
    console.log('📊 Creating user platform metrics...')
    const { error: metricsError } = await supabase
      .from('user_platform_metrics')
      .upsert({
        user_id: targetUser.id,
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
      })

    if (metricsError) {
      console.error('❌ Error creating metrics:', metricsError)
    } else {
      console.log('✅ User metrics created successfully')
    }

    // Get achievement types for creating achievements
    const { data: achievementTypes, error: typesError } = await supabase
      .from('nft_achievement_types')
      .select('id, name, display_name, description')
      .in('name', ['first_post', 'gaming_explorer', 'generous_heart', 'week_warrior', 'storyteller'])

    if (typesError) {
      console.error('❌ Error fetching achievement types:', typesError)
      process.exit(1)
    }

    console.log('\n🏆 Creating achievements...')

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
          user_id: targetUser.id,
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
      }
    }

    // Verify achievements were created
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
      .eq('user_id', targetUser.id)
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
    }

    console.log('🚀 Demo setup complete!')
    console.log(`\n📱 Now visit: http://localhost:3001/achievements`)
    console.log('🎯 You should see eligible achievements ready to mint as NFTs!')
    console.log('\n💡 To test the full flow:')
    console.log('1. Visit the achievements page')
    console.log('2. Click "Mint NFT" on any achievement')
    console.log('3. Confirm the transaction')
    console.log('4. See your NFT in the collection!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupDemoAchievements()