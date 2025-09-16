import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseAbi } from 'viem'

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
const POST_REGISTRY_ABI = parseAbi([
  'function getPost(uint256 _postId) external view returns (tuple(uint256 id, address author, string content, string mediaIpfs, string gameCategory, uint256 timestamp, bool isDeleted, uint256 likesCount, uint256 commentsCount))',
])

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

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

    // Format the response - convert BigInt values to strings for JSON serialization
    const formattedPost = {
      id: postData[0].toString(),
      author: postData[1],
      content: postData[2],
      mediaIpfs: postData[3],
      gameCategory: postData[4],
      timestamp: postData[5].toString(),
      isDeleted: postData[6],
      likesCount: postData[7].toString(),
      commentsCount: postData[8].toString(),
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