import { createConfig, http } from 'wagmi'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'
import { somniaMainnet, somniaTestnet } from '@/constants/networks'

// Web3 configuration
export const wagmiConfig = createConfig({
  chains: [somniaMainnet, somniaTestnet],
  connectors: [
    injected(),
    walletConnect({ 
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id'
    }),
    coinbaseWallet({ 
      appName: 'Zapp - Next Gen Social Platform',
      appLogoUrl: '/logo.png'
    }),
  ],
  transports: {
    [somniaMainnet.id]: http(),
    [somniaTestnet.id]: http(),
  },
})

// Network switching utility
export const switchToSomniaNetwork = async (isTestnet = false) => {
  try {
    const networkParams = {
      chainId: isTestnet ? '0xc478' : '0x13a7', // 50312 : 5031
      chainName: isTestnet ? 'Somnia Shannon Testnet' : 'Somnia Mainnet',
      nativeCurrency: {
        name: isTestnet ? 'STT' : 'SOMI',
        symbol: isTestnet ? 'STT' : 'SOMI',
        decimals: 18,
      },
      rpcUrls: [
        isTestnet 
          ? 'https://dream-rpc.somnia.network/' 
          : 'https://api.infra.mainnet.somnia.network/'
      ],
      blockExplorerUrls: [
        isTestnet 
          ? 'https://shannon-explorer.somnia.network/' 
          : 'https://explorer.somnia.network'
      ],
    }

    if (typeof window !== 'undefined' && window.ethereum) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkParams],
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to switch network:', error)
    return false
  }
}

// Check if user is on Somnia network
export const isOnSomniaNetwork = (chainId?: number) => {
  return chainId === somniaMainnet.id || chainId === somniaTestnet.id
}

// Format address for display
export const formatAddress = (address: string, length = 4) => {
  if (!address) return ''
  return `${address.slice(0, 2 + length)}...${address.slice(-length)}`
}

// Format token amount
export const formatTokenAmount = (amount: bigint, decimals = 18, precision = 4) => {
  const divisor = 10n ** BigInt(decimals)
  const beforeDecimal = amount / divisor
  const afterDecimal = amount % divisor
  
  if (afterDecimal === 0n) {
    return beforeDecimal.toString()
  }
  
  const afterDecimalStr = afterDecimal.toString().padStart(decimals, '0')
  const trimmed = afterDecimalStr.slice(0, precision).replace(/0+$/, '')
  
  return trimmed ? `${beforeDecimal}.${trimmed}` : beforeDecimal.toString()
}