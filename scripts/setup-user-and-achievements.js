require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupUserAndAchievements() {
  console.log('🎯 Setting up user and demo achievements for NFT minting...\n')

  try {
    // First, let's check if we have any existing users
    console.log('📋 Checking existing users...')
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id, username, display_name, wallet_address')
      .limit(5)

    if (usersError) {
      console.error('❌ Error checking users:', usersError)
    }

    console.log('Found users:', existingUsers?.length || 0)

    let targetUser = null

    // If no users exist, create one
    if (!existingUsers || existingUsers.length === 0) {
      console.log('📝 Creating demo user...')

      const demoWalletAddress = '0xe81032a865dd45bf39e8430f72b9fa8f2e2cb030'

      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([{
          username: 'akshat',
          display_name: 'Akshat Maurya',
          wallet_address: demoWalletAddress,
          bio: 'Demo user for NFT achievement testing',
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (createUserError) {
        console.error('❌ Error creating user:', createUserError)
        process.exit(1)
      }

      targetUser = newUser
      console.log('✅ Created demo user:', targetUser.username)
    } else {
      targetUser = existingUsers[0]
      console.log('✅ Using existing user:', targetUser.username || targetUser.display_name)
    }

    console.log(`🎯 Setting up achievements for: ${targetUser.username || targetUser.display_name}`)
    console.log(`📍 User ID: ${targetUser.id}\n`)

    // Create user platform metrics
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

    // Also create some sample posts for the user
    console.log('\n📝 Creating sample posts...')
    const samplePosts = [
      {
        content: 'Just started my gaming journey on this amazing platform! 🎮',
        content_type: 'text',
        visibility: 'public',
        tags: ['gaming', 'intro']
      },
      {
        content: 'Check out this epic screenshot from my latest gaming session! The graphics are incredible 🔥',
        content_type: 'image',
        visibility: 'public',
        tags: ['gaming', 'screenshot']
      },
      {
        content: 'Love the community here! Everyone is so supportive ❤️',
        content_type: 'text',
        visibility: 'public',
        tags: ['community']
      }
    ]

    for (const post of samplePosts) {
      const { error: postError } = await supabase
        .from('posts')
        .insert([{
          user_id: targetUser.id,
          ...post,
          likes_count: Math.floor(Math.random() * 10) + 1,
          comments_count: Math.floor(Math.random() * 5),
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (postError) {
        console.log(`❌ Error creating post:`, postError.message)
      } else {
        console.log(`✅ Created sample post`)
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
    console.log(`\n📱 Now visit: http://localhost:3000/achievements`)
    console.log('🎯 You should see eligible achievements ready to mint as NFTs!')
    console.log('\n💡 To test the full flow:')
    console.log('1. Visit the achievements page')
    console.log('2. Click "Mint NFT" on any achievement')
    console.log('3. Confirm the transaction')
    console.log('4. See your NFT in the collection!')

    // Return user info for testing
    return {
      userId: targetUser.id,
      username: targetUser.username,
      walletAddress: targetUser.wallet_address
    }

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupUserAndAchievements()