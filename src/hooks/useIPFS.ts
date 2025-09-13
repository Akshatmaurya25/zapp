'use client'

import { useState, useCallback } from 'react'
import { ipfsGateway, ipfsUpload } from '@/lib/ipfs'
import { MediaUpload, IPFSUploadProgress } from '@/types'

export function useIPFS() {
  const [uploads, setUploads] = useState<Map<string, MediaUpload>>(new Map())
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = useCallback(async (
    file: File,
    onProgress?: (progress: IPFSUploadProgress) => void
  ): Promise<MediaUpload> => {
    const uploadId = `${file.name}-${Date.now()}`
    const preview = URL.createObjectURL(file)
    const type = file.type.startsWith('image/') ? 'image' : 'video'

    // Create initial upload state
    const initialUpload: MediaUpload = {
      file,
      preview,
      type,
      upload_status: 'pending'
    }

    setUploads(prev => new Map(prev).set(uploadId, initialUpload))

    try {
      setIsUploading(true)

      // Update status to uploading
      setUploads(prev => new Map(prev).set(uploadId, {
        ...initialUpload,
        upload_status: 'uploading'
      }))

      // Simulate progress for better UX
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30
        if (progress > 90) progress = 90
        
        onProgress?.({
          loaded: progress,
          total: 100,
          percentage: progress
        })
      }, 500)

      // Upload to IPFS via API
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()

      // Complete progress
      onProgress?.({
        loaded: 100,
        total: 100,
        percentage: 100
      })

      // Update with success
      const successUpload: MediaUpload = {
        ...initialUpload,
        ipfs_hash: result.hash,
        upload_status: 'success'
      }

      setUploads(prev => new Map(prev).set(uploadId, successUpload))
      return successUpload

    } catch (error) {
      console.error('Upload failed:', error)

      // Update with error
      const errorUpload: MediaUpload = {
        ...initialUpload,
        upload_status: 'error'
      }

      setUploads(prev => new Map(prev).set(uploadId, errorUpload))
      throw error

    } finally {
      setIsUploading(false)
    }
  }, [])

  const uploadMultipleFiles = useCallback(async (
    files: File[],
    onProgress?: (fileIndex: number, progress: IPFSUploadProgress) => void
  ): Promise<MediaUpload[]> => {
    const results: MediaUpload[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const result = await uploadFile(file, (progress) => {
          onProgress?.(i, progress)
        })
        results.push(result)
      } catch (error) {
        console.error(`Failed to upload file ${i}:`, error)
        // Continue with other files even if one fails
      }
    }

    return results
  }, [uploadFile])

  const getOptimalUrl = useCallback(async (ipfsHashOrUrl: string): Promise<string> => {
    try {
      return await ipfsGateway.getOptimalUrl(ipfsHashOrUrl, true)
    } catch (error) {
      console.warn('Failed to get optimal IPFS URL:', error)
      return ipfsHashOrUrl
    }
  }, [])

  const getFallbackUrls = useCallback((ipfsHashOrUrl: string): string[] => {
    return ipfsGateway.getFallbackUrls(ipfsHashOrUrl, true)
  }, [])

  const createErrorHandler = useCallback((ipfsHashOrUrl: string) => {
    return ipfsGateway.createErrorHandler(ipfsHashOrUrl)
  }, [])

  const removeUpload = useCallback((uploadId: string) => {
    setUploads(prev => {
      const newMap = new Map(prev)
      const upload = newMap.get(uploadId)
      if (upload?.preview) {
        URL.revokeObjectURL(upload.preview)
      }
      newMap.delete(uploadId)
      return newMap
    })
  }, [])

  const clearAllUploads = useCallback(() => {
    uploads.forEach(upload => {
      if (upload.preview) {
        URL.revokeObjectURL(upload.preview)
      }
    })
    setUploads(new Map())
  }, [uploads])

  return {
    // Upload functions
    uploadFile,
    uploadMultipleFiles,
    
    // URL functions
    getOptimalUrl,
    getFallbackUrls,
    createErrorHandler,
    
    // State
    uploads: Array.from(uploads.entries()).map(([id, upload]) => ({ id, ...upload })),
    isUploading,
    
    // Management
    removeUpload,
    clearAllUploads,
  }
}