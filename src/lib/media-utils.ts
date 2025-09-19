/**
 * Media utilities for detecting and handling different file types
 */

export type MediaType = 'image' | 'video' | 'unknown'

/**
 * Detect if a media file is a video based on multiple detection methods
 */
export function detectMediaType(
  hash: string,
  storedType?: string | null,
  index?: number,
  mediaTypes?: string[] | null
): MediaType {
  // Method 1: Use stored media type if available
  if (mediaTypes && index !== undefined && mediaTypes[index]) {
    const mimeType = mediaTypes[index].toLowerCase()
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('image/')) return 'image'
  }

  // Method 2: Use legacy stored type
  if (storedType) {
    const type = storedType.toLowerCase()
    if (type.startsWith('video/') || type === 'video') return 'video'
    if (type.startsWith('image/') || type === 'image') return 'image'
  }

  // Method 3: Pattern matching on hash (for legacy support)
  const hashLower = hash.toLowerCase()
  const videoPatterns = [
    'video', '.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v',
    '.flv', '.wmv', '.3gp', '.ogv', 'mp4', 'webm', 'mov'
  ]

  const imagePatterns = [
    'image', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.bmp', '.tiff', 'jpg', 'jpeg', 'png', 'gif', 'webp'
  ]

  if (videoPatterns.some(pattern => hashLower.includes(pattern))) {
    return 'video'
  }

  if (imagePatterns.some(pattern => hashLower.includes(pattern))) {
    return 'image'
  }

  return 'unknown'
}

/**
 * Get IPFS URL with fallback gateways
 */
export function getIPFSUrl(hash: string, gatewayIndex = 0): string {
  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.ipfs.io/ipfs/'
  ]

  const gateway = gateways[gatewayIndex] || gateways[0]
  return `${gateway}${hash}`
}

/**
 * Detect content type by making a HEAD request to the IPFS URL
 */
export async function detectContentTypeFromURL(hash: string): Promise<string | null> {
  try {
    const url = getIPFSUrl(hash)
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })

    if (response.ok) {
      return response.headers.get('content-type')
    }
  } catch (error) {
    console.warn('Failed to detect content type from URL:', error)
  }

  return null
}

/**
 * Check if a file is a video based on MIME type
 */
export function isVideoMimeType(mimeType: string): boolean {
  return mimeType.toLowerCase().startsWith('video/')
}

/**
 * Check if a file is an image based on MIME type
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.toLowerCase().startsWith('image/')
}

/**
 * Get video poster/thumbnail URL (placeholder implementation)
 */
export function getVideoPosterUrl(videoHash: string): string {
  // For now, return a placeholder. In the future, this could generate thumbnails
  return `https://via.placeholder.com/640x360/1a1a1a/ffffff?text=Video`
}

/**
 * Get optimized video attributes for different scenarios
 */
export function getVideoAttributes(isMainVideo: boolean = false) {
  return {
    controls: true,
    preload: isMainVideo ? 'metadata' : 'none',
    playsInline: true,
    muted: true,
    controlsList: 'nodownload',
    ...(isMainVideo ? {} : { loading: 'lazy' as const })
  }
}