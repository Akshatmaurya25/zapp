import { Address, Hash } from 'viem'

export interface SomniaNetwork {
  id: number
  name: string
  network: string
  nativeCurrency: {
    decimals: number
    name: string
    symbol: string
  }
  rpcUrls: {
    default: {
      http: string[]
    }
    public: {
      http: string[]
    }
  }
  blockExplorers: {
    default: {
      name: string
      url: string
    }
  }
  testnet?: boolean
}

export interface WalletConnection {
  address: Address | undefined
  isConnected: boolean
  isConnecting: boolean
  isReconnecting: boolean
  chain: {
    id: number
    name: string
    unsupported?: boolean
  } | undefined
}

export interface TransactionResult {
  hash: Hash
  blockNumber?: bigint
  blockHash?: Hash
  status: 'success' | 'reverted'
  gasUsed?: bigint
}

export interface ContractInteraction {
  address: Address
  abi: any[]
  functionName: string
  args?: any[]
  value?: bigint
}

export interface TokenBalance {
  address: Address
  symbol: string
  decimals: number
  formatted: string
  value: bigint
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  external_url?: string
}

export interface Web3Error {
  code: number
  message: string
  data?: any
}

export interface NetworkSwitchRequest {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}