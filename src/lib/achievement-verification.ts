import { createServerClient } from '@/lib/supabase'
import { gamingAPIManager, AchievementProof } from '@/lib/gaming-apis'
import { ethers } from 'ethers'

export interface PendingReward {
  id: string
  userId: string
  gameId: string
  achievementId: string
  achievementName: string
  rewardAmount: string
  proof: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  processedAt?: string
  txHash?: string
  errorMessage?: string
}

export interface VerificationJob {
  id: string
  userId: string
  platform: string
  platformUserId: string
  gameId: string
  achievementId: string
  status: 'pending' | 'verifying' | 'verified' | 'failed'
  createdAt: string
  completedAt?: string
  proof?: any
  errorMessage?: string
}

export class AchievementVerificationService {
  private supabase = createServerClient()
  private skillRewardsContract?: ethers.Contract
  private oracleWallet?: ethers.Wallet

  constructor() {
    this.initializeContracts()
  }

  private async initializeContracts() {
    try {
      const contractAddress = process.env.NEXT_PUBLIC_SKILL_REWARDS_CONTRACT
      const oraclePrivateKey = process.env.ORACLE_PRIVATE_KEY
      const rpcUrl = process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network/'

      if (!contractAddress || !oraclePrivateKey) {
        console.log('Smart contract or oracle not configured for achievement verification')
        return
      }

      // Initialize provider and wallet
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      this.oracleWallet = new ethers.Wallet(oraclePrivateKey, provider)

      // Contract ABI (simplified version)
      const abi = [
        'function verifyAchievement(address user, string gameId, string achievementId, bytes proof) external',
        'function getAchievement(string gameId, string achievementId) external view returns (uint256, bool, string, string, uint256, uint256)',
        'event AchievementUnlocked(address indexed user, bytes32 indexed achievementKey, string gameId, string achievementId, uint256 rewardAmount, bytes32 proofHash)'
      ]

      this.skillRewardsContract = new ethers.Contract(contractAddress, abi, this.oracleWallet)

      console.log('Achievement verification service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize achievement verification service:', error)
    }
  }

  // Link a gaming platform account to a user
  async linkGamingAccount(
    userId: string,
    platform: string,
    platformUserId: string,
    accessToken?: string
  ): Promise<void> {
    try {
      // Verify the platform account exists and is valid
      if (gamingAPIManager.isConfigured(platform)) {
        await gamingAPIManager.getUserProfile(platform, platformUserId)
      }

      // Store the integration
      const { error } = await this.supabase
        .from('game_integrations')
        .upsert({
          user_id: userId,
          platform,
          platform_user_id: platformUserId,
          access_token: accessToken,
          verified: true
        }, {
          onConflict: 'user_id,platform'
        })

      if (error) {
        throw new Error(`Failed to link ${platform} account: ${error.message}`)
      }

      console.log(`Successfully linked ${platform} account for user ${userId}`)
    } catch (error) {
      console.error('Failed to link gaming account:', error)
      throw error
    }
  }

  // Create a verification job for an achievement
  async requestAchievementVerification(
    userId: string,
    platform: string,
    gameId: string,
    achievementId: string
  ): Promise<string> {
    try {
      // Check if user has linked this platform
      const { data: integration } = await this.supabase
        .from('game_integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single()

      if (!integration) {
        throw new Error(`No ${platform} account linked`)
      }

      // Check if achievement was already verified
      const { data: existingAchievement } = await this.supabase
        .from('gaming_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .eq('achievement_id', achievementId)
        .single()

      if (existingAchievement) {
        throw new Error('Achievement already verified')
      }

      // Create verification job (in a real system, this would go to a queue)
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2)}`

      // Process immediately for demo (in production, use a job queue)
      this.processVerificationJob(
        jobId,
        userId,
        platform,
        integration.platform_user_id,
        gameId,
        achievementId
      ).catch(error => {
        console.error(`Verification job ${jobId} failed:`, error)
      })

      return jobId
    } catch (error) {
      console.error('Failed to request achievement verification:', error)
      throw error
    }
  }

  // Process a verification job
  private async processVerificationJob(
    jobId: string,
    userId: string,
    platform: string,
    platformUserId: string,
    gameId: string,
    achievementId: string
  ): Promise<void> {
    try {
      console.log(`Processing verification job ${jobId}`)

      // Verify achievement with gaming platform API
      const proof = await gamingAPIManager.verifyAchievement(
        platform,
        platformUserId,
        gameId,
        achievementId
      )

      if (!proof || !proof.proof.unlocked) {
        throw new Error('Achievement not unlocked')
      }

      // Get achievement details from smart contract
      if (!this.skillRewardsContract) {
        throw new Error('Smart contract not initialized')
      }

      const [rewardAmount, isActive, title, description] = await this.skillRewardsContract.getAchievement(gameId, achievementId)

      if (!isActive) {
        throw new Error('Achievement rewards are not active')
      }

      // Store achievement in database
      const { data: achievement, error: dbError } = await this.supabase
        .from('gaming_achievements')
        .insert({
          user_id: userId,
          game_id: gameId,
          achievement_id: achievementId,
          achievement_name: title || achievementId,
          description: description || '',
          reward_amount: ethers.formatEther(rewardAmount),
          verified_at: new Date().toISOString(),
          proof_data: proof
        })
        .select()
        .single()

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`)
      }

      // Trigger blockchain reward (in production, this would be queued)
      this.triggerBlockchainReward(userId, gameId, achievementId, proof).catch(error => {
        console.error('Blockchain reward failed:', error)
      })

      console.log(`Verification job ${jobId} completed successfully`)
    } catch (error) {
      console.error(`Verification job ${jobId} failed:`, error)
      throw error
    }
  }

  // Trigger blockchain reward
  private async triggerBlockchainReward(
    userId: string,
    gameId: string,
    achievementId: string,
    proof: AchievementProof
  ): Promise<void> {
    try {
      if (!this.skillRewardsContract || !this.oracleWallet) {
        throw new Error('Blockchain components not initialized')
      }

      // Get user's wallet address
      const { data: user } = await this.supabase
        .from('users')
        .select('wallet_address')
        .eq('id', userId)
        .single()

      if (!user?.wallet_address) {
        throw new Error('User wallet address not found')
      }

      // Encode proof for blockchain
      const proofBytes = ethers.toUtf8Bytes(JSON.stringify(proof))

      // Call smart contract to verify and reward
      const tx = await this.skillRewardsContract.verifyAchievement(
        user.wallet_address,
        gameId,
        achievementId,
        proofBytes
      )

      const receipt = await tx.wait()

      // Update database with transaction hash
      await this.supabase
        .from('gaming_achievements')
        .update({
          tx_hash: receipt.hash
        })
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .eq('achievement_id', achievementId)

      console.log(`Blockchain reward sent: ${receipt.hash}`)
    } catch (error) {
      console.error('Blockchain reward failed:', error)

      // Mark achievement as having blockchain error
      await this.supabase
        .from('gaming_achievements')
        .update({
          tx_hash: null // Could add error field
        })
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .eq('achievement_id', achievementId)

      throw error
    }
  }

  // Get user's verified achievements
  async getUserAchievements(userId: string): Promise<any[]> {
    try {
      const { data: achievements, error } = await this.supabase
        .from('gaming_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('verified_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch achievements: ${error.message}`)
      }

      return achievements || []
    } catch (error) {
      console.error('Failed to get user achievements:', error)
      throw error
    }
  }

  // Get user's linked gaming accounts
  async getLinkedAccounts(userId: string): Promise<any[]> {
    try {
      const { data: integrations, error } = await this.supabase
        .from('game_integrations')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to fetch linked accounts: ${error.message}`)
      }

      return integrations || []
    } catch (error) {
      console.error('Failed to get linked accounts:', error)
      throw error
    }
  }

  // Check available achievements for verification
  async checkAvailableAchievements(userId: string): Promise<any[]> {
    try {
      const linkedAccounts = await this.getLinkedAccounts(userId)
      const availableAchievements: any[] = []

      for (const account of linkedAccounts) {
        if (!gamingAPIManager.isConfigured(account.platform)) {
          continue
        }

        try {
          // Get popular games for this platform (hardcoded for demo)
          const popularGames = this.getPopularGames(account.platform)

          for (const gameId of popularGames) {
            const achievements = await gamingAPIManager.getUserAchievements(
              account.platform,
              account.platform_user_id,
              gameId
            )

            const unlockedAchievements = achievements.filter(a => a.unlocked)

            for (const achievement of unlockedAchievements) {
              // Check if already verified
              const { data: existingVerification } = await this.supabase
                .from('gaming_achievements')
                .select('id')
                .eq('user_id', userId)
                .eq('game_id', achievement.gameId)
                .eq('achievement_id', achievement.achievementId)
                .single()

              if (!existingVerification) {
                availableAchievements.push({
                  ...achievement,
                  platform: account.platform,
                  canVerify: true
                })
              }
            }
          }
        } catch (error) {
          console.error(`Failed to check achievements for ${account.platform}:`, error)
        }
      }

      return availableAchievements
    } catch (error) {
      console.error('Failed to check available achievements:', error)
      throw error
    }
  }

  private getPopularGames(platform: string): string[] {
    // Hardcoded popular games for demo
    switch (platform) {
      case 'steam':
        return [
          'steam_730',    // CS:GO
          'steam_440',    // TF2
          'steam_271590', // GTA V
          'steam_570',    // Dota 2
          'steam_292030'  // The Witcher 3
        ]
      case 'epic':
        return [
          'epic_fortnite',
          'epic_rocketleague'
        ]
      default:
        return []
    }
  }

  // Get supported platforms
  getSupportedPlatforms(): string[] {
    return gamingAPIManager.getSupportedPlatforms()
  }
}

// Singleton instance
export const achievementVerificationService = new AchievementVerificationService()