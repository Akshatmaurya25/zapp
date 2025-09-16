import { Address } from 'viem'

// Contract addresses on Somnia networks
export const CONTRACTS = {
  mainnet: {
    // Add contract addresses when deployed
    ACHIEVEMENT_NFT: '0x' as Address,
    DONATION_MANAGER: '0x' as Address,
    // Somnia standard contracts
    MULTICALL_V3: '0x5e44F178E8cF9B2F5409B6f18ce936aB817C5a11' as Address,
    WSOMI: '0x046EDe9564A72571df6F5e44d0405360c0f4dCab' as Address,
    USDC: '0x28BEc7E30E6faee657a03e19Bf1128AaD7632A00' as Address,
    WETH: '0x936Ab8C674bcb567CD5dEB85D8A216494704E9D8' as Address,
    USDT: '0x67B302E35Aef5EEE8c32D934F5856869EF428330' as Address,
  },
  testnet: {
    // Add testnet contract addresses when deployed
    ACHIEVEMENT_NFT: '0x' as Address,
    DONATION_MANAGER: '0x' as Address,
    // Somnia testnet standard contracts
    MULTICALL_V3: '0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223' as Address,
    WSOMI: '0x046EDe9564A72571df6F5e44d0405360c0f4dCab' as Address,
    USDC: '0x28BEc7E30E6faee657a03e19Bf1128AaD7632A00' as Address,
    WETH: '0x936Ab8C674bcb567CD5dEB85D8A216494704E9D8' as Address,
    USDT: '0x67B302E35Aef5EEE8c32D934F5856869EF428330' as Address,
    ENTRY_POINT: '0x0000000071727De22E5E9d8BAf0edAc6f37da032' as Address,
    FACTORY: '0x4bE0ddfebcA9A5A4a617dee4DeCe99E7c862dceb' as Address,
  }
} as const

// ABI definitions (add when contracts are developed)
export const ACHIEVEMENT_NFT_ABI = [] as const
export const DONATION_MANAGER_ABI = [] as const

// Contract interaction helpers
export const getContractAddress = (contractName: keyof typeof CONTRACTS.mainnet, isTestnet = false) => {
  const network = isTestnet ? CONTRACTS.testnet : CONTRACTS.mainnet
  return network[contractName]
}

export const isContractDeployed = (contractName: keyof typeof CONTRACTS.mainnet, isTestnet = false) => {
  const address = getContractAddress(contractName, isTestnet)
  return address && address !== '0x'
}