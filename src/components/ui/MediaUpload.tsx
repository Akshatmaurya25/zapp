'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useIPFS } from '@/hooks/useIPFS'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Upload, X, Image, Video, Loader2, AlertCircle } from 'lucide-react'
import { MediaUpload as MediaUploadType } from '@/types'

interface MediaUploadProps {
  onFilesUploaded?: (uploads: MediaUploadType[]) => void
  maxFiles?: number
  accept?: 'images' | 'videos' | 'all'
  className?: string
}

export function MediaUpload({ 
  onFilesUploaded, 
  maxFiles = 4,
  accept = 'all',
  className = ''
}: MediaUploadProps) {
  const { uploadMultipleFiles, uploads, isUploading, removeUpload } = useIPFS()
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({})

  const acceptedTypes = {
    images: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    videos: { 'video/*': ['.mp4', '.webm', '.mov'] },
    all: { 
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov']
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    try {
      const results = await uploadMultipleFiles(
        acceptedFiles.slice(0, maxFiles),
        (fileIndex, progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileIndex]: progress.percentage
          }))
        }
      )

      // Clear progress
      setUploadProgress({})
      
      // Callback with successful uploads
      const successfulUploads = results.filter(r => r.upload_status === 'success')
      if (successfulUploads.length > 0) {
        onFilesUploaded?.(successfulUploads)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }, [uploadMultipleFiles, maxFiles, onFilesUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes[accept],
    maxFiles,
    disabled: isUploading
  })

  const pendingUploads = uploads.filter(u => 
    u.upload_status === 'uploading' || u.upload_status === 'pending'
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <Card 
        {...getRootProps()} 
        className={`
          p-6 border-2 border-dashed cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50/10' : 'border-gray-600'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500'}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            {isUploading ? (
              <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          {isDragActive ? (
            <p className="text-blue-400">Drop files here...</p>
          ) : isUploading ? (
            <p className="text-gray-400">Uploading to IPFS...</p>
          ) : (
            <div className="space-y-1">
              <p className="text-gray-300">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                {accept === 'images' && 'Images only: JPEG, PNG, GIF, WebP'}
                {accept === 'videos' && 'Videos only: MP4, WebM, MOV'}
                {accept === 'all' && 'Images and videos supported'}
              </p>
              <p className="text-xs text-gray-600">
                Max {maxFiles} files, 50MB each
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Upload progress */}
      {pendingUploads.length > 0 && (
        <div className="space-y-2">
          {pendingUploads.map((upload, index) => (
            <Card key={upload.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {upload.type.startsWith('image/') ? (
                    <Image className="h-6 w-6 text-blue-400" />
                  ) : (
                    <Video className="h-6 w-6 text-purple-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {upload.file.name}
                  </p>
                  
                  {upload.upload_status === 'uploading' && (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress[index] || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[index] || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {upload.upload_status === 'error' && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span className="text-xs text-red-400">Upload failed</span>
                    </div>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeUpload(upload.id)}
                  disabled={upload.upload_status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Media preview component
interface MediaPreviewProps {
  ipfsHash: string
  type: string // Accept MIME type string
  alt?: string
  className?: string
}

export function MediaPreview({ ipfsHash, type, alt, className = '' }: MediaPreviewProps) {
  const { getOptimalUrl, createErrorHandler } = useIPFS()
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    getOptimalUrl(ipfsHash).then(url => {
      setCurrentUrl(url)
      setIsLoading(false)
    })
  }, [ipfsHash, getOptimalUrl])

  const handleError = createErrorHandler(ipfsHash)

  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (type.startsWith('image/')) {
    return (
      <img
        src={currentUrl}
        alt={alt}
        className={`rounded-lg object-cover ${className}`}
        onError={(e) => handleError(e.currentTarget)}
      />
    )
  }

  if (type.startsWith('video/')) {
    return (
      <video
        src={currentUrl}
        className={`rounded-lg object-cover ${className}`}
        controls
        preload="metadata"
        onError={(e) => handleError(e.currentTarget)}
      >
        Your browser does not support the video tag.
      </video>
    )
  }

  return null
}