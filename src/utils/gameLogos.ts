import gameLogos from '../../assets/LabelandLogo.json'

export interface GameLogoMap {
  [key: string]: string
}

// Type-safe game logo mapping
export const GAME_LOGOS: GameLogoMap = gameLogos

// Utility function to get game logo with fallback
export function getGameLogo(gameName: string): string {
  if (!gameName) return GAME_LOGOS.general || ''

  // Normalize game name for lookup
  const normalizedName = gameName.toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
    .trim()

  // Direct match
  if (GAME_LOGOS[normalizedName]) {
    return GAME_LOGOS[normalizedName]
  }

  // Partial matches for common variations
  const partialMatches: { [key: string]: string } = {
    'pubg': 'pubg',
    'playerunknown': 'pubg',
    'battlegrounds': 'pubg',
    'valorant': 'valorant',
    'fortnite': 'fornite', // Note: JSON has 'fornite' (typo in original)
    'apex': 'apexlegends',
    'legends': 'apexlegends',
    'league': 'leagueoflegends',
    'lol': 'leagueoflegends',
    'dota': 'dota2',
    'cs': 'csgo',
    'counterstrike': 'csgo',
    'counter': 'csgo',
    'minecraft': 'minecraft',
    'overwatch': 'overwatch',
    'cod': 'callofduty',
    'callofduty': 'callofduty',
    'warzone': 'callofduty',
    'meta': 'metaverse',
    'vr': 'metaverse',
    'virtual': 'metaverse'
  }

  // Check partial matches
  for (const [pattern, logoKey] of Object.entries(partialMatches)) {
    if (normalizedName.includes(pattern)) {
      return GAME_LOGOS[logoKey] || GAME_LOGOS.general
    }
  }

  // Default fallback
  return GAME_LOGOS.other || GAME_LOGOS.general || ''
}

// Get available game categories for dropdown/selection
export function getAvailableGames(): Array<{ key: string; name: string; logo: string }> {
  return [
    { key: 'pubg', name: 'PUBG', logo: GAME_LOGOS.pubg },
    { key: 'valorant', name: 'Valorant', logo: GAME_LOGOS.valorant },
    { key: 'fortnite', name: 'Fortnite', logo: GAME_LOGOS.fornite },
    { key: 'apexlegends', name: 'Apex Legends', logo: GAME_LOGOS.apexlegends },
    { key: 'leagueoflegends', name: 'League of Legends', logo: GAME_LOGOS.leagueoflegends },
    { key: 'dota2', name: 'Dota 2', logo: GAME_LOGOS.dota2 },
    { key: 'csgo', name: 'CS:GO', logo: GAME_LOGOS.csgo },
    { key: 'minecraft', name: 'Minecraft', logo: GAME_LOGOS.minecraft },
    { key: 'overwatch', name: 'Overwatch', logo: GAME_LOGOS.overwatch },
    { key: 'callofduty', name: 'Call of Duty', logo: GAME_LOGOS.callofduty },
    { key: 'metaverse', name: 'Metaverse/VR', logo: GAME_LOGOS.metaverse },
    { key: 'other', name: 'Other', logo: GAME_LOGOS.other }
  ]
}

// Category colors for different game types
export function getGameCategoryColor(gameName: string): string {
  const normalizedName = gameName.toLowerCase()

  if (normalizedName.includes('pubg') || normalizedName.includes('battle')) return 'bg-orange-500'
  if (normalizedName.includes('valorant')) return 'bg-red-500'
  if (normalizedName.includes('fortnite')) return 'bg-blue-500'
  if (normalizedName.includes('apex')) return 'bg-orange-600'
  if (normalizedName.includes('league') || normalizedName.includes('lol')) return 'bg-blue-600'
  if (normalizedName.includes('dota')) return 'bg-red-600'
  if (normalizedName.includes('cs') || normalizedName.includes('counter')) return 'bg-yellow-500'
  if (normalizedName.includes('minecraft')) return 'bg-green-500'
  if (normalizedName.includes('overwatch')) return 'bg-orange-400'
  if (normalizedName.includes('cod') || normalizedName.includes('call')) return 'bg-gray-600'
  if (normalizedName.includes('meta') || normalizedName.includes('vr')) return 'bg-purple-500'
  if (normalizedName.includes('chat')) return 'bg-purple-500'
  if (normalizedName.includes('music')) return 'bg-pink-500'
  if (normalizedName.includes('art') || normalizedName.includes('creative')) return 'bg-orange-500'

  return 'bg-blue-500'
}