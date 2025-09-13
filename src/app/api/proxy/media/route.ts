import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return new NextResponse('URL parameter is required', { status: 400 })
  }

  try {
    // Validate that it's an IPFS URL
    if (!url.includes('/ipfs/') && !url.includes('ipfs://')) {
      return new NextResponse('Only IPFS URLs are allowed', { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Zapp Social Platform',
      },
    })

    if (!response.ok) {
      return new NextResponse(`Failed to fetch: ${response.status}`, { 
        status: response.status 
      })
    }

    // Get the content type from the original response
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // Stream the response
    const body = response.body

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new NextResponse('Failed to proxy request', { status: 500 })
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}