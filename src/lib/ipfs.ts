class RequestThrottler {
  private requestCounts = new Map<string, { count: number; resetTime: number }>()
  private readonly maxRequests = 10 // Max requests per minute per gateway
  private readonly windowMs = 60 * 1000 // 1 minute window

  canMakeRequest(gateway: string): boolean {
    const now = Date.now()
    const data = this.requestCounts.get(gateway)

    if (!data || now > data.resetTime) {
      this.requestCounts.set(gateway, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    if (data.count < this.maxRequests) {
      data.count++
      return true
    }

    return false
  }

  getNextAvailableTime(gateway: string): number {
    const data = this.requestCounts.get(gateway)
    return data ? data.resetTime : Date.now()
  }

  reset(gateway: string): void {
    this.requestCounts.delete(gateway)
  }
}

export class IPFSGatewayService {
  private throttler = new RequestThrottler()
  private cache = new Map<string, { url: string; timestamp: number }>()
  private readonly cacheTTL = 5 * 60 * 1000 // 5 minutes

  // Prioritized gateway list - fastest and most reliable first
  private readonly gateways = [
    { url: 'https://dweb.link', priority: 1, name: 'IPFS.tech' },
    { url: 'https://ipfs.io', priority: 2, name: 'IPFS.io' },
    { url: 'https://cloudflare-ipfs.com', priority: 3, name: 'CloudFlare' },
    { url: 'https://gateway.pinata.cloud', priority: 4, name: 'Pinata' },
  ]

  async getOptimalUrl(ipfsHashOrUrl: string, useProxy = true): Promise<string> {
    const hash = this.extractIPFSHash(ipfsHashOrUrl)
    if (!hash) return ipfsHashOrUrl

    const cacheKey = `optimal:${hash}:${useProxy ? 'proxy' : 'direct'}`
    const cached = this.cache.get(cacheKey)

    // Return cached URL if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.url
    }

    // Try parallel requests to find fastest gateway
    const fastestUrl = await this.findFastestGateway(hash, useProxy)
    
    // Cache the successful URL
    this.cache.set(cacheKey, { url: fastestUrl, timestamp: Date.now() })
    
    return fastestUrl
  }

  private async findFastestGateway(hash: string, useProxy: boolean): Promise<string> {
    const availableGateways = this.gateways.filter(gateway => 
      this.throttler.canMakeRequest(gateway.url)
    )

    if (availableGateways.length === 0) {
      // All gateways throttled, use highest priority
      const fallbackGateway = this.gateways[0]
      const directUrl = `${fallbackGateway.url}/ipfs/${hash}`
      console.warn(`⚠️ All gateways throttled, using ${fallbackGateway.name} as fallback`)
      return useProxy 
        ? `/api/proxy/media?url=${encodeURIComponent(directUrl)}`
        : directUrl
    }

    // Race condition: test multiple gateways simultaneously
    const racePromises = availableGateways.map(async (gateway) => {
      const directUrl = `${gateway.url}/ipfs/${hash}`
      const testUrl = useProxy 
        ? `/api/proxy/media?url=${encodeURIComponent(directUrl)}`
        : directUrl

      try {
        const startTime = performance.now()
        
        // Quick HEAD request to test availability and speed
        const response = await fetch(testUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(2000) // 2 second timeout for speed test
        })
        
        const responseTime = performance.now() - startTime

        if (response.ok) {
          console.log(`🚀 Gateway ${gateway.name} responded in ${responseTime.toFixed(0)}ms`)
          return { url: testUrl, gateway: gateway.name, responseTime }
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        console.warn(`❌ Gateway ${gateway.name} failed speed test:`, error)
        throw error
      }
    })

    try {
      // Use Promise.race to get the fastest responding gateway
      const fastest = await Promise.race(racePromises)
      console.log(`⚡ Fastest gateway: ${fastest.gateway} (${fastest.responseTime.toFixed(0)}ms)`)
      return fastest.url
    } catch {
      // If all parallel requests fail, fall back to first available
      const fallbackGateway = availableGateways[0]
      const directUrl = `${fallbackGateway.url}/ipfs/${hash}`
      console.warn(`⚠️ All gateways failed speed test, using ${fallbackGateway.name} as fallback`)
      return useProxy 
        ? `/api/proxy/media?url=${encodeURIComponent(directUrl)}`
        : directUrl
    }
  }

  getFallbackUrls(ipfsHashOrUrl: string, includeProxy = true): string[] {
    const hash = this.extractIPFSHash(ipfsHashOrUrl)
    if (!hash) return [ipfsHashOrUrl]

    const directUrls = this.gateways.map(gateway => `${gateway.url}/ipfs/${hash}`)
    
    if (!includeProxy) {
      return directUrls
    }

    // Include proxied versions for better CORS handling
    const proxiedUrls = directUrls.map(url => `/api/proxy/media?url=${encodeURIComponent(url)}`)
    
    // Interleave direct and proxied URLs (try proxy first for better reliability)
    const fallbacks: string[] = []
    for (let i = 0; i < directUrls.length; i++) {
      fallbacks.push(proxiedUrls[i]) // Proxy first
      fallbacks.push(directUrls[i])  // Then direct
    }
    
    return fallbacks
  }

  createErrorHandler(originalUrl: string) {
    const fallbacks = this.getFallbackUrls(originalUrl)
    let currentIndex = 0

    return (element: HTMLVideoElement | HTMLImageElement) => {
      currentIndex++
      if (currentIndex < fallbacks.length) {
        const nextUrl = fallbacks[currentIndex]
        const gatewayName = this.gateways[currentIndex]?.name || 'Unknown'
        
        console.log(`🔄 IPFS: Switching to ${gatewayName} gateway`)
        element.src = nextUrl
        
        // Reset throttling for failed gateway
        const failedGateway = this.gateways[currentIndex - 1]
        if (failedGateway) {
          this.throttler.reset(failedGateway.url)
        }
      } else {
        console.error('❌ IPFS: All gateways failed for:', originalUrl)
        element.onerror = null // Prevent infinite retry loop
      }
    }
  }

  private extractIPFSHash(input: string): string | null {
    if (!input) return null

    // Direct hash
    if (input.match(/^(Qm[a-zA-Z0-9]{44}|bafy[a-zA-Z0-9]+)$/)) {
      return input
    }

    // Extract from URL
    const hashMatch = input.match(/\/ipfs\/([a-zA-Z0-9]+)/)
    return hashMatch ? hashMatch[1] : null
  }

  clearExpiredCache(): number {
    const now = Date.now()
    let cleared = 0

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.cacheTTL) {
        this.cache.delete(key)
        cleared++
      }
    }

    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} expired IPFS cache entries`)
    }

    return cleared
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      cacheTTL: this.cacheTTL,
      gatewayCount: this.gateways.length,
      throttledGateways: Array.from(this.throttler['requestCounts'].keys()).length
    }
  }
}

// Upload service for IPFS
export class IPFSUploadService {
  private pinataJWT: string | undefined
  private pinataEndpoint = 'https://api.pinata.cloud'

  constructor() {
    this.pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT
  }

  async uploadFile(file: File): Promise<{ hash: string; url: string }> {
    if (!this.pinataJWT) {
      throw new Error('PINATA_JWT not configured')
    }

    const formData = new FormData()
    formData.append('file', file)

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedBy: 'zapp-social',
        timestamp: new Date().toISOString(),
        fileType: file.type,
        fileSize: file.size.toString()
      }
    })
    formData.append('pinataMetadata', metadata)

    const options = JSON.stringify({
      cidVersion: 1,
    })
    formData.append('pinataOptions', options)

    // Calculate timeout based on file size - more time for larger files
    const baseTimeout = 30000 // 30 seconds base
    const sizeMultiplier = Math.max(1, file.size / (10 * 1024 * 1024)) // Extra time per 10MB
    const calculatedTimeout = Math.min(baseTimeout * sizeMultiplier, 300000) // Max 5 minutes

    console.log(`📤 Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) with ${(calculatedTimeout / 1000).toFixed(0)}s timeout`)

    // Create AbortController for timeout
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => {
      abortController.abort()
    }, calculatedTimeout)

    try {
      const response = await fetch(`${this.pinataEndpoint}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
        },
        body: formData,
        signal: abortController.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to upload to IPFS: ${error}`)
      }

      const result = await response.json()
      const hash = result.IpfsHash
      const url = `https://gateway.pinata.cloud/ipfs/${hash}`

      console.log(`✅ Upload successful: ${hash}`)
      return { hash, url }
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle specific timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Upload timeout after ${(calculatedTimeout / 1000).toFixed(0)} seconds. Please try uploading a smaller file or check your internet connection.`)
      }

      // Handle network errors more gracefully
      if (error instanceof Error && error.message.includes('fetch failed')) {
        throw new Error('Network error during upload. Please check your internet connection and try again.')
      }

      throw error
    }
  }

  async uploadJSON(data: object): Promise<{ hash: string; url: string }> {
    if (!this.pinataJWT) {
      throw new Error('PINATA_JWT not configured')
    }

    const response = await fetch(`${this.pinataEndpoint}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.pinataJWT}`,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: `zapp-metadata-${Date.now()}`,
          keyvalues: {
            uploadedBy: 'zapp-social',
            timestamp: new Date().toISOString(),
            dataType: 'json'
          }
        },
        pinataOptions: {
          cidVersion: 1,
        }
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to upload JSON to IPFS: ${error}`)
    }

    const result = await response.json()
    const hash = result.IpfsHash
    const url = `https://gateway.pinata.cloud/ipfs/${hash}`

    return { hash, url }
  }

  async deleteFile(hash: string): Promise<boolean> {
    if (!this.pinataJWT) {
      throw new Error('PINATA_JWT not configured')
    }

    try {
      const response = await fetch(`${this.pinataEndpoint}/pinning/unpin/${hash}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error('Failed to delete IPFS file:', error)
      return false
    }
  }
}

// Export singleton instances
export const ipfsGateway = new IPFSGatewayService()
export const ipfsUpload = new IPFSUploadService()

// Backward compatibility exports
export const getReliableIPFSUrl = async (url: string) => {
  try {
    return await ipfsGateway.getOptimalUrl(url, true) // Use proxy by default
  } catch (error) {
    console.warn('Failed to get optimal URL, using fallback:', error)
    return url
  }
}

export const getIPFSFallbacks = (url: string) => ipfsGateway.getFallbackUrls(url)
export const createIPFSErrorHandler = (url: string) => ipfsGateway.createErrorHandler(url)

// Background cache cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    ipfsGateway.clearExpiredCache()
  }, 60 * 1000) // Every minute
}