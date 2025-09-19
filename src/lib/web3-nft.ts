import { ethers } from 'ethers'

// Force load environment variables in server environment
if (typeof window === 'undefined') {
  // Load environment variables for server-side execution
  import('dotenv').then(dotenv => dotenv.config({ path: '.env.local' }));
}

// Contract ABI for the PlatformAchievementNFT
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "string", "name": "achievementName", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint8", "name": "category", "type": "uint8" },
      { "internalType": "uint8", "name": "rarity", "type": "uint8" },
      { "internalType": "string", "name": "metadataURI", "type": "string" },
      { "internalType": "bool", "name": "isLimitedEdition", "type": "bool" }
    ],
    "name": "mintAchievement",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "string", "name": "achievementName", "type": "string" }
    ],
    "name": "hasAchievement",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
]

// Achievement Category Enum
export enum AchievementCategory {
  JOURNEY = 0,
  CREATOR = 1,
  SOCIAL = 2,
  LOYALTY = 3,
  GAMING = 4,
  SPECIAL = 5
}

// Rarity Level Enum
export enum RarityLevel {
  COMMON = 0,
  UNCOMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4
}

// Get configuration at runtime to ensure fresh values
function getConfig() {
  // Force reload environment variables
  if (typeof window === 'undefined') {
    // Dynamic import for environment variables
    import('dotenv').then(dotenv => dotenv.config({ path: '.env.local' }));
  }

  // Hardcoded values for testing (will replace with env vars once working)
  const hardcodedConfig = {
    contractAddress: '0xf58207a53f6e3965DfF8bf17DD368F8157D88Eb9',
    rpcUrl: 'https://dream-rpc.somnia.network/',
    privateKey: '20ee26979b3515b89c634b3675154051aa1a59a26717b832dabbf12177ce6ef5',
    isProduction: false
  }

  // Try to get from environment first, fallback to hardcoded
  const envConfig = {
    contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || hardcodedConfig.contractAddress,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || hardcodedConfig.rpcUrl,
    privateKey: process.env.NFT_MINTING_PRIVATE_KEY || hardcodedConfig.privateKey,
    isProduction: process.env.NODE_ENV === 'production'
  }

  console.log('🔧 Config source check:')
  console.log('  - Using env contract address:', !!process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS)
  console.log('  - Using env private key:', !!process.env.NFT_MINTING_PRIVATE_KEY)
  console.log('  - Final contract address:', envConfig.contractAddress ? envConfig.contractAddress.slice(0, 10) + '...' : 'MISSING')

  return envConfig
}

export async function mintAchievementNFT(params: {
  userWalletAddress: string
  achievementName: string
  description: string
  category: string
  rarity: number
  metadataURI: string
  isLimitedEdition?: boolean
}): Promise<{
  success: boolean
  tokenId?: string
  txHash?: string
  contractAddress?: string
  error?: string
}> {
  try {
    // Get fresh configuration
    const config = getConfig()
    const hasRequiredConfig = config.contractAddress && config.privateKey

    console.log('🔍 NFT Configuration Debug:')
    console.log('  - CONTRACT_ADDRESS:', config.contractAddress ? `${config.contractAddress.slice(0, 6)}...` : 'MISSING')
    console.log('  - PRIVATE_KEY:', config.privateKey ? 'SET' : 'MISSING')
    console.log('  - RPC_URL:', config.rpcUrl)
    console.log('  - hasRequiredConfig:', hasRequiredConfig)

    // If required configuration is missing, use mock mode
    if (!hasRequiredConfig) {
      console.warn('⚠️ NFT Configuration Missing:')
      if (!config.contractAddress) console.warn('  - NEXT_PUBLIC_NFT_CONTRACT_ADDRESS not set')
      if (!config.privateKey) console.warn('  - NFT_MINTING_PRIVATE_KEY not set')
      console.warn('  - NFT minting will use mock mode')
      console.log('🔧 Using mock NFT minting (configuration incomplete)')
      console.log('📝 To enable real blockchain minting:')
      console.log('   1. Deploy the contract: npm run deploy:testnet')
      console.log('   2. Add NEXT_PUBLIC_NFT_CONTRACT_ADDRESS to .env.local')
      console.log('   3. Add NFT_MINTING_PRIVATE_KEY to .env.local')
      return mockMintNFT(params)
    }

    console.log('🎉 Using REAL blockchain NFT minting!')

    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(config.rpcUrl)
    const signer = new ethers.Wallet(config.privateKey, provider)

    // Create contract instance
    const contract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, signer)

    console.log('🔗 Connecting to contract:', config.contractAddress)
    console.log('🌐 Using RPC:', config.rpcUrl)

    // Map category string to enum
    const categoryEnum = getCategoryEnum(params.category)
    const rarityEnum = params.rarity as RarityLevel

    // Check if user already has this achievement
    const hasAchievement = await contract.hasAchievement(
      params.userWalletAddress,
      params.achievementName
    )

    if (hasAchievement) {
      return {
        success: false,
        error: 'User already has this achievement'
      }
    }

    // Estimate gas
    const gasEstimate = await contract.mintAchievement.estimateGas(
      params.userWalletAddress,
      params.achievementName,
      params.description,
      categoryEnum,
      rarityEnum,
      params.metadataURI,
      params.isLimitedEdition || false
    )

    // Add 20% buffer to gas estimate
    const gasLimit = (gasEstimate * 120n) / 100n

    // Send transaction
    const tx = await contract.mintAchievement(
      params.userWalletAddress,
      params.achievementName,
      params.description,
      categoryEnum,
      rarityEnum,
      params.metadataURI,
      params.isLimitedEdition || false,
      { gasLimit }
    )

    console.log('NFT minting transaction sent:', tx.hash)

    // Wait for confirmation
    const receipt = await tx.wait()

    if (receipt.status !== 1) {
      throw new Error('Transaction failed')
    }

    // Extract token ID from events
    const tokenId = await extractTokenIdFromReceipt(receipt, contract)

    return {
      success: true,
      tokenId: tokenId.toString(),
      txHash: tx.hash,
      contractAddress: config.contractAddress
    }

  } catch (error) {
    console.error('NFT minting error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during minting'
    }
  }
}

function getCategoryEnum(category: string): AchievementCategory {
  switch (category.toLowerCase()) {
    case 'journey': return AchievementCategory.JOURNEY
    case 'creator': return AchievementCategory.CREATOR
    case 'social': return AchievementCategory.SOCIAL
    case 'loyalty': return AchievementCategory.LOYALTY
    case 'gaming': return AchievementCategory.GAMING
    case 'special': return AchievementCategory.SPECIAL
    default: return AchievementCategory.JOURNEY
  }
}

async function extractTokenIdFromReceipt(receipt: any, contract: ethers.Contract): Promise<bigint> {
  // Look for AchievementMinted event
  const eventFragment = contract.interface.getEvent('AchievementMinted')

  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log)
      if (parsed?.name === 'AchievementMinted') {
        return parsed.args.tokenId
      }
    } catch (e) {
      // Log parsing failed, continue
    }
  }

  // Fallback: query total supply (new token will be the latest)
  const totalSupply = await contract.totalSupply()
  return totalSupply
}

// Mock function for development/testing
function mockMintNFT(params: any): Promise<{
  success: boolean
  tokenId?: string
  txHash?: string
  contractAddress?: string
  error?: string
}> {
  return new Promise((resolve) => {
    console.log('🎭 Mock NFT Minting Started')
    console.log('   Achievement:', params.achievementName)
    console.log('   User:', params.userWalletAddress)
    console.log('   Category:', params.category)
    console.log('   Rarity:', params.rarity)

    // Simulate blockchain delay
    setTimeout(() => {
      const mockTokenId = `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`

      console.log('✅ Mock NFT Minted Successfully!')
      console.log('   Token ID:', mockTokenId)
      console.log('   TX Hash:', mockTxHash)
      console.log('   🔗 This is a demonstration - no real blockchain transaction occurred')

      const config = getConfig()
      resolve({
        success: true,
        tokenId: mockTokenId,
        txHash: mockTxHash,
        contractAddress: config.contractAddress || '0xDEMO0000000000000000000000000000000000'
      })
    }, 2000) // 2 second delay to simulate blockchain
  })
}

export async function uploadToIPFS(metadata: any): Promise<string> {
  // For now, use a mock IPFS upload
  // In production, integrate with Pinata, Web3.Storage, or similar service

  const mockCID = `Qm${Array.from({length: 44}, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      .charAt(Math.floor(Math.random() * 62))
  ).join('')}`

  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 500))

  console.log('Mock IPFS upload completed, metadata:', metadata)

  return `https://ipfs.io/ipfs/${mockCID}`
}