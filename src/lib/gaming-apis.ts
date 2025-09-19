import axios from 'axios'

export interface GameAchievement {
  gameId: string
  achievementId: string
  name: string
  description: string
  unlocked: boolean
  unlockedAt?: string
  iconUrl?: string
  rarity?: number
}

export interface GameProfile {
  platform: string
  platformUserId: string
  username: string
  profileUrl?: string
  avatarUrl?: string
  achievements: GameAchievement[]
}

export interface AchievementProof {
  platform: string
  gameId: string
  achievementId: string
  proof: any
  timestamp: string
  signature: string
}

// Steam Web API Integration
export class SteamAPI {
  private apiKey: string
  private baseUrl = 'https://api.steampowered.com'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getUserProfile(steamId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v0002/`,
        {
          params: {
            key: this.apiKey,
            steamids: steamId
          }
        }
      )
      return response.data.response.players[0]
    } catch (error) {
      console.error('Steam API getUserProfile error:', error)
      throw new Error('Failed to fetch Steam user profile')
    }
  }

  async getUserAchievements(steamId: string, appId: string): Promise<GameAchievement[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ISteamUserStats/GetPlayerAchievements/v0001/`,
        {
          params: {
            key: this.apiKey,
            steamid: steamId,
            appid: appId
          }
        }
      )

      if (!response.data.playerstats?.achievements) {
        return []
      }

      return response.data.playerstats.achievements.map((achievement: any) => ({
        gameId: `steam_${appId}`,
        achievementId: achievement.apiname,
        name: achievement.displayName || achievement.apiname,
        description: achievement.description || '',
        unlocked: achievement.achieved === 1,
        unlockedAt: achievement.unlocktime ? new Date(achievement.unlocktime * 1000).toISOString() : undefined,
        iconUrl: achievement.icon
      }))
    } catch (error) {
      console.error('Steam API getUserAchievements error:', error)
      throw new Error('Failed to fetch Steam achievements')
    }
  }

  async getGameSchema(appId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ISteamUserStats/GetSchemaForGame/v2/`,
        {
          params: {
            key: this.apiKey,
            appid: appId
          }
        }
      )
      return response.data.game
    } catch (error) {
      console.error('Steam API getGameSchema error:', error)
      throw new Error('Failed to fetch Steam game schema')
    }
  }

  async verifyAchievement(steamId: string, appId: string, achievementId: string): Promise<AchievementProof> {
    try {
      const achievements = await this.getUserAchievements(steamId, appId)
      const achievement = achievements.find(a => a.achievementId === achievementId)

      if (!achievement || !achievement.unlocked) {
        throw new Error('Achievement not found or not unlocked')
      }

      // Create cryptographic proof
      const proof = {
        steamId,
        appId,
        achievementId,
        unlocked: achievement.unlocked,
        unlockedAt: achievement.unlockedAt,
        verifiedAt: new Date().toISOString()
      }

      // In a real implementation, you'd sign this proof with a private key
      const signature = this.generateProofSignature(proof)

      return {
        platform: 'steam',
        gameId: `steam_${appId}`,
        achievementId,
        proof,
        timestamp: new Date().toISOString(),
        signature
      }
    } catch (error) {
      console.error('Steam achievement verification error:', error)
      throw error
    }
  }

  private generateProofSignature(proof: any): string {
    // In a real implementation, use actual cryptographic signing
    // For demo purposes, we'll use a simple hash
    const proofString = JSON.stringify(proof)
    return Buffer.from(proofString).toString('base64')
  }
}

// Epic Games API Integration (simplified)
export class EpicGamesAPI {
  private clientId: string
  private clientSecret: string
  private baseUrl = 'https://api.epicgames.dev'

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/auth/v1/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
      return response.data.access_token
    } catch (error) {
      console.error('Epic Games API authentication error:', error)
      throw new Error('Failed to authenticate with Epic Games API')
    }
  }

  async getUserAchievements(epicAccountId: string, productId: string): Promise<GameAchievement[]> {
    try {
      const accessToken = await this.getAccessToken()

      // This is a simplified example - Epic's actual achievement API has different endpoints
      const response = await axios.get(
        `${this.baseUrl}/achievements/v1/${productId}/users/${epicAccountId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      return response.data.achievements?.map((achievement: any) => ({
        gameId: `epic_${productId}`,
        achievementId: achievement.achievementId,
        name: achievement.name,
        description: achievement.description,
        unlocked: achievement.unlockedDateTime !== null,
        unlockedAt: achievement.unlockedDateTime,
        iconUrl: achievement.iconUrl
      })) || []
    } catch (error) {
      console.error('Epic Games API getUserAchievements error:', error)
      throw new Error('Failed to fetch Epic Games achievements')
    }
  }
}

// Gaming API Manager
export class GamingAPIManager {
  private steamAPI?: SteamAPI
  private epicAPI?: EpicGamesAPI

  constructor() {
    const steamApiKey = process.env.STEAM_API_KEY
    const epicClientId = process.env.EPIC_GAMES_CLIENT_ID
    const epicClientSecret = process.env.EPIC_GAMES_CLIENT_SECRET

    if (steamApiKey) {
      this.steamAPI = new SteamAPI(steamApiKey)
    }

    if (epicClientId && epicClientSecret) {
      this.epicAPI = new EpicGamesAPI(epicClientId, epicClientSecret)
    }
  }

  async verifyAchievement(
    platform: string,
    userId: string,
    gameId: string,
    achievementId: string
  ): Promise<AchievementProof> {
    switch (platform.toLowerCase()) {
      case 'steam':
        if (!this.steamAPI) {
          throw new Error('Steam API not configured')
        }
        // Extract app ID from gameId (format: steam_APPID)
        const appId = gameId.replace('steam_', '')
        return this.steamAPI.verifyAchievement(userId, appId, achievementId)

      case 'epic':
        if (!this.epicAPI) {
          throw new Error('Epic Games API not configured')
        }
        // For Epic, we'd need different verification logic
        throw new Error('Epic Games verification not yet implemented')

      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  async getUserAchievements(platform: string, userId: string, gameId: string): Promise<GameAchievement[]> {
    switch (platform.toLowerCase()) {
      case 'steam':
        if (!this.steamAPI) {
          throw new Error('Steam API not configured')
        }
        const appId = gameId.replace('steam_', '')
        return this.steamAPI.getUserAchievements(userId, appId)

      case 'epic':
        if (!this.epicAPI) {
          throw new Error('Epic Games API not configured')
        }
        const productId = gameId.replace('epic_', '')
        return this.epicAPI.getUserAchievements(userId, productId)

      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  async getUserProfile(platform: string, userId: string): Promise<any> {
    switch (platform.toLowerCase()) {
      case 'steam':
        if (!this.steamAPI) {
          throw new Error('Steam API not configured')
        }
        return this.steamAPI.getUserProfile(userId)

      default:
        throw new Error(`Platform ${platform} profile fetching not implemented`)
    }
  }

  isConfigured(platform: string): boolean {
    switch (platform.toLowerCase()) {
      case 'steam':
        return !!this.steamAPI
      case 'epic':
        return !!this.epicAPI
      default:
        return false
    }
  }

  getSupportedPlatforms(): string[] {
    const platforms: string[] = []
    if (this.steamAPI) platforms.push('steam')
    if (this.epicAPI) platforms.push('epic')
    return platforms
  }
}

// Singleton instance
export const gamingAPIManager = new GamingAPIManager()

// Utility functions
export function parseSteamId(input: string): string | null {
  // Handle Steam profile URLs and extract Steam ID
  const steamUrlRegex = /steamcommunity\.com\/(id|profiles)\/([^\/]+)/
  const match = input.match(steamUrlRegex)

  if (match) {
    return match[2] // This might be a custom URL or Steam ID
  }

  // If it's already a Steam ID (17 digits), return it
  if (/^\d{17}$/.test(input)) {
    return input
  }

  return null
}

export function validateGameId(platform: string, gameId: string): boolean {
  switch (platform.toLowerCase()) {
    case 'steam':
      return /^steam_\d+$/.test(gameId)
    case 'epic':
      return /^epic_[a-zA-Z0-9]+$/.test(gameId)
    default:
      return false
  }
}

export function formatAchievementId(platform: string, gameId: string, achievementId: string): string {
  return `${platform}_${gameId}_${achievementId}`
}