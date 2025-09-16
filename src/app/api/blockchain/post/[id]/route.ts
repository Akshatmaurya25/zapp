import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'

// Somnia testnet configuration
const somniaTestnet = {
  id: 50312,
  name: 'Somnia Testnet',
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
}

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_POST_REGISTRY_ADDRESS as `0x${string}`
const POST_REGISTRY_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
    "name": "getPost",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "address", "name": "author", "type": "address"},
          {"internalType": "string", "name": "content", "type": "string"},
          {"internalType": "string", "name": "mediaIpfs", "type": "string"},
          {"internalType": "string", "name": "gameCategory", "type": "string"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "bool", "name": "isDeleted", "type": "bool"},
          {"internalType": "uint256", "name": "likesCount", "type": "uint256"},
          {"internalType": "uint256", "name": "commentsCount", "type": "uint256"}
        ],
        "internalType": "struct PostRegistry.Post",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    if (!postId || isNaN(Number(postId))) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    if (!CONTRACT_ADDRESS) {
      return NextResponse.json({ error: 'Contract not configured' }, { status: 500 })
    }

    // Create public client for reading from blockchain
    const publicClient = createPublicClient({
      chain: somniaTestnet,
      transport: http(),
    })

    // Read post data from contract
    const postData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: POST_REGISTRY_ABI,
      functionName: 'getPost',
      args: [BigInt(postId)],
    })

    // Check if post exists (id should be > 0)
    if (!postData || postData.id === 0n) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Format the response - convert BigInt values to strings for JSON serialization
    const formattedPost = {
      id: postData.id.toString(),
      author: postData.author,
      content: postData.content,
      mediaIpfs: postData.mediaIpfs,
      gameCategory: postData.gameCategory,
      timestamp: postData.timestamp.toString(),
      isDeleted: postData.isDeleted,
      likesCount: postData.likesCount.toString(),
      commentsCount: postData.commentsCount.toString(),
    }

    return NextResponse.json(formattedPost)
  } catch (error) {
    console.error('Error fetching blockchain post:', error)

    if (error instanceof Error && error.message.includes('Invalid post ID')) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch post from blockchain' },
      { status: 500 }
    )
  }
}