import { defineChain } from 'viem'

export const somniaMainnet = defineChain({
  id: 5031,
  name: 'Somnia Mainnet',
  network: 'somnia',
  nativeCurrency: {
    decimals: 18,
    name: 'SOMI',
    symbol: 'SOMI',
  },
  rpcUrls: {
    default: {
      http: ['https://api.infra.mainnet.somnia.network/'],
    },
    public: {
      http: ['https://api.infra.mainnet.somnia.network/'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Somnia Explorer', 
      url: 'https://explorer.somnia.network' 
    },
  },
})

export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Shannon Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network/'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network/'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Somnia Testnet Explorer', 
      url: 'https://shannon-explorer.somnia.network/' 
    },
  },
  testnet: true,
})

export const supportedChains = [somniaMainnet, somniaTestnet] as const

export const defaultChain = somniaMainnet

// Network switching helpers
export const getSomniaNetworkParams = (isTestnet = false) => {
  const chain = isTestnet ? somniaTestnet : somniaMainnet
  return {
    chainId: `0x${chain.id.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: [chain.rpcUrls.default.http[0]],
    blockExplorerUrls: [chain.blockExplorers.default.url],
  }
}