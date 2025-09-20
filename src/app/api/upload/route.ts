import { NextRequest, NextResponse } from 'next/server'
import { ipfsUpload } from '@/lib/ipfs'

// Configure route timeout for large file uploads
export const maxDuration = 300 // 5 minutes for large video uploads

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/mov'
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and videos are allowed.' },
        { status: 400 }
      )
    }

    // Upload to IPFS with progress logging for large files
    console.log(`🚀 Starting upload for ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    const result = await ipfsUpload.uploadFile(file)

    return NextResponse.json({
      success: true,
      hash: result.hash,
      url: result.url,
      size: file.size,
      type: file.type,
      name: file.name
    })

  } catch (error) {
    console.error('Upload error:', error)

    // Handle specific error types with user-friendly messages
    let errorMessage = 'Failed to upload file'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Upload timeout'
        errorDetails = 'The file upload took too long. This often happens with large video files or slow internet connections. Please try again or use a smaller file.'
      } else if (error.message.includes('Network error')) {
        errorMessage = 'Network error'
        errorDetails = 'There was a problem connecting to the upload service. Please check your internet connection and try again.'
      } else if (error.message.includes('PINATA_JWT not configured')) {
        errorMessage = 'Service configuration error'
        errorDetails = 'The upload service is not properly configured. Please contact support.'
      } else if (error.message.includes('Failed to upload to IPFS')) {
        errorMessage = 'IPFS upload failed'
        errorDetails = 'The decentralized storage service is experiencing issues. Please try again in a few moments.'
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        type: error instanceof Error && error.message.includes('timeout') ? 'timeout' : 'error'
      },
      { status: error instanceof Error && error.message.includes('timeout') ? 408 : 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}