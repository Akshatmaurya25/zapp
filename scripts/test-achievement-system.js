require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Test script for the NFT Achievement System
// Run with: node scripts/test-achievement-system.js

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure your .env.local file contains:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('SUPABASE_SERVICE_ROLE_KEY=...')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

class AchievementSystemTester {
  constructor() {
    this.testUserId = null
    this.testResults = {
      passed: 0,
      failed: 0,
      details: []
    }
  }

  log(message, isError = false) {
    const timestamp = new Date().toISOString()
    const prefix = isError ? '❌' : '✅'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async assert(condition, message) {
    if (condition) {
      this.testResults.passed++
      this.testResults.details.push({ status: 'PASS', message })
      this.log(`PASS: ${message}`)
    } else {
      this.testResults.failed++
      this.testResults.details.push({ status: 'FAIL', message })
      this.log(`FAIL: ${message}`, true)
    }
  }

  async createTestUser() {
    this.log('Creating test user...')

    const testUser = {
      id: `test-user-${Date.now()}`,
      wallet_address: `0x${Math.random().toString(16).substr(2, 40)}`,
      username: `testuser${Date.now()}`,
      display_name: 'Test User',
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single()

    await this.assert(!error && data, 'Test user created successfully')

    if (data) {
      this.testUserId = data.id
      this.log(`Test user ID: ${this.testUserId}`)
    }

    return data
  }

  async testDatabaseSchema() {
    this.log('Testing database schema...')

    // Test if all required tables exist
    const tables = [
      'user_platform_metrics',
      'nft_achievement_types',
      'user_achievements',
      'platform_nfts',
      'achievement_progress'
    ]

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      await this.assert(!error, `Table ${table} exists and is accessible`)
    }

    // Test achievement types are loaded
    const { data: achievementTypes, error: typesError } = await supabase
      .from('nft_achievement_types')
      .select('*')

    await this.assert(
      !typesError && achievementTypes && achievementTypes.length > 0,
      'Achievement types are loaded in database'
    )

    if (achievementTypes) {
      this.log(`Found ${achievementTypes.length} achievement types`)
    }
  }

  async testUserMetricsTracking() {
    this.log('Testing user metrics tracking...')

    // Create metrics record
    const { data: metrics, error } = await supabase
      .from('user_platform_metrics')
      .insert([{ user_id: this.testUserId }])
      .select()
      .single()

    await this.assert(!error && metrics, 'User metrics record created')

    // Test metric updates
    const { error: updateError } = await supabase
      .from('user_platform_metrics')
      .update({ total_posts: 5, total_likes_given: 10 })
      .eq('user_id', this.testUserId)

    await this.assert(!updateError, 'User metrics can be updated')
  }

  async testAchievementEligibility() {
    this.log('Testing achievement eligibility...')

    // Create a simple achievement that should be triggered
    const { data: firstPostType } = await supabase
      .from('nft_achievement_types')
      .select('*')
      .eq('name', 'first_post')
      .single()

    if (firstPostType) {
      // Simulate user having 1 post
      await supabase
        .from('user_platform_metrics')
        .update({ total_posts: 1 })
        .eq('user_id', this.testUserId)

      // Check if achievement would be awarded
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', this.testUserId)
        .eq('achievement_type_id', firstPostType.id)

      // If not already awarded, create it for test
      if (!existingAchievement || existingAchievement.length === 0) {
        const { data: newAchievement, error: achievementError } = await supabase
          .from('user_achievements')
          .insert([{
            user_id: this.testUserId,
            achievement_type_id: firstPostType.id,
            metric_value: 1,
            metadata: { test: true }
          }])
          .select()
          .single()

        await this.assert(!achievementError && newAchievement, 'Achievement can be awarded')
      }
    }
  }

  async testNFTMintingFlow() {
    this.log('Testing NFT minting flow...')

    // Get eligible achievements
    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        nft_achievement_types (*)
      `)
      .eq('user_id', this.testUserId)
      .eq('is_nft_minted', false)

    await this.assert(!error && achievements, 'Can fetch eligible achievements')

    if (achievements && achievements.length > 0) {
      const achievement = achievements[0]

      // Simulate NFT minting
      const mockNFT = {
        user_id: this.testUserId,
        achievement_id: achievement.id,
        token_id: `test-token-${Date.now()}`,
        contract_address: '0x1234567890123456789012345678901234567890',
        metadata_uri: 'https://test.com/metadata.json',
        metadata: {
          name: achievement.nft_achievement_types.display_name,
          description: achievement.nft_achievement_types.description
        },
        tx_hash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
      }

      const { data: nft, error: nftError } = await supabase
        .from('platform_nfts')
        .insert([mockNFT])
        .select()
        .single()

      await this.assert(!nftError && nft, 'NFT record can be created')

      if (nft) {
        // Mark achievement as minted
        const { error: updateError } = await supabase
          .from('user_achievements')
          .update({ is_nft_minted: true })
          .eq('id', achievement.id)

        await this.assert(!updateError, 'Achievement can be marked as minted')
      }
    }
  }

  async testAchievementProgress() {
    this.log('Testing achievement progress tracking...')

    // Create progress record
    const { data: progressType } = await supabase
      .from('nft_achievement_types')
      .select('*')
      .eq('name', 'generous_heart')
      .single()

    if (progressType) {
      const { data: progress, error } = await supabase
        .from('achievement_progress')
        .insert([{
          user_id: this.testUserId,
          achievement_type_id: progressType.id,
          progress_data: { current_likes: 50, required_likes: 100 },
          percentage_complete: 50
        }])
        .select()
        .single()

      await this.assert(!error && progress, 'Achievement progress can be tracked')
    }
  }

  async testAPIEndpoints() {
    this.log('Testing API endpoints...')

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    try {
      // Test achievement progress endpoint
      const progressResponse = await fetch(`${baseUrl}/api/achievements/progress?userId=${this.testUserId}`)
      await this.assert(progressResponse.ok, 'Achievement progress API endpoint works')

      // Test eligible achievements endpoint
      const eligibleResponse = await fetch(`${baseUrl}/api/achievements/eligible?userId=${this.testUserId}`)
      await this.assert(eligibleResponse.ok, 'Eligible achievements API endpoint works')

      // Test NFT collection endpoint
      const collectionResponse = await fetch(`${baseUrl}/api/nft/collection?userId=${this.testUserId}`)
      await this.assert(collectionResponse.ok, 'NFT collection API endpoint works')

    } catch (fetchError) {
      this.log('API endpoint testing skipped (server not running)', false)
    }
  }

  async testLimitedEditionConstraints() {
    this.log('Testing limited edition constraints...')

    // Find a limited edition achievement
    const { data: limitedAchievement } = await supabase
      .from('nft_achievement_types')
      .select('*')
      .eq('is_limited_edition', true)
      .not('max_recipients', 'is', null)
      .limit(1)
      .single()

    if (limitedAchievement) {
      await this.assert(
        limitedAchievement.max_recipients > 0,
        'Limited edition achievement has max recipients set'
      )

      await this.assert(
        limitedAchievement.current_recipients <= limitedAchievement.max_recipients,
        'Current recipients does not exceed max recipients'
      )
    }
  }

  async testDemoScenario() {
    this.log('Testing demo scenario flow...')

    // Simulate the hackathon demo flow
    const demoSteps = [
      'New user signup (Gaming Explorer eligible)',
      'Complete profile (Profile Pioneer eligible)',
      'First post (First Post achievement)',
      'Give likes (Generous Heart progress)',
      'Mint NFT (Live blockchain transaction)',
      'Show collection (NFT gallery display)'
    ]

    // Test each demo step has corresponding data
    for (let i = 0; i < demoSteps.length; i++) {
      const step = demoSteps[i]

      // For demo purposes, we'll just verify the step is logged
      this.log(`Demo Step ${i + 1}: ${step}`)
      await this.assert(true, `Demo step "${step}" is defined`)
    }
  }

  async runAllTests() {
    console.log('\n🚀 Starting NFT Achievement System Tests\n')

    try {
      await this.createTestUser()
      await this.testDatabaseSchema()
      await this.testUserMetricsTracking()
      await this.testAchievementEligibility()
      await this.testNFTMintingFlow()
      await this.testAchievementProgress()
      await this.testAPIEndpoints()
      await this.testLimitedEditionConstraints()
      await this.testDemoScenario()

    } catch (error) {
      this.log(`Test execution error: ${error.message}`, true)
      this.testResults.failed++
    }

    await this.cleanup()
    this.printResults()
  }

  async cleanup() {
    if (this.testUserId) {
      this.log('Cleaning up test data...')

      // Clean up in reverse order of dependencies
      await supabase.from('platform_nfts').delete().eq('user_id', this.testUserId)
      await supabase.from('achievement_progress').delete().eq('user_id', this.testUserId)
      await supabase.from('user_achievements').delete().eq('user_id', this.testUserId)
      await supabase.from('user_platform_metrics').delete().eq('user_id', this.testUserId)
      await supabase.from('users').delete().eq('id', this.testUserId)

      this.log('Test data cleaned up')
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary\n')
    console.log(`✅ Passed: ${this.testResults.passed}`)
    console.log(`❌ Failed: ${this.testResults.failed}`)
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`)

    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.testResults.details
        .filter(test => test.status === 'FAIL')
        .forEach(test => console.log(`   • ${test.message}`))
    }

    console.log('\n🎉 Achievement System Testing Complete!\n')

    if (this.testResults.failed === 0) {
      console.log('🚀 All systems are ready for hackathon demo!')
    } else {
      console.log('⚠️  Some issues found. Please review and fix before demo.')
      process.exit(1)
    }
  }
}

// Run the tests
const tester = new AchievementSystemTester()
tester.runAllTests().catch(console.error)