'use client'

import React, { useState } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { usePosts } from '@/hooks/usePosts'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { MediaUpload } from '@/components/ui/MediaUpload'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import {
  Send,
  Image,
  Video,
  Gamepad2,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { MediaUpload as MediaUploadType } from '@/types'

interface PostCreateProps {
  onSuccess?: () => void
  className?: string
}

const gameCategories = [
  'General Gaming',
  'Valorant',
  'PUBG',
  'Fortnite',
  'League of Legends',
  'Metaverse Games',
  'Other'
]

export function PostCreate({ onSuccess, className }: PostCreateProps) {
  const { createPost, isCreating } = usePosts()

  const [content, setContent] = useState('')
  const [gameCategory, setGameCategory] = useState<string>('')
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleMediaUpload = (uploads: MediaUploadType[]) => {
    setMediaFiles(prev => [...prev, ...uploads])
    setError(null)
  }

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('Post content is required')
      return
    }

    if (!gameCategory) {
      setError('Please select a game category')
      return
    }

    try {
      await createPost({
        content: content.trim(),
        game_category: gameCategory,
        media_ipfs: mediaFiles
          .filter(file => file.ipfs_hash)
          .map(file => file.ipfs_hash!)
      })

      // Reset form
      setContent('')
      setGameCategory('')
      setMediaFiles([])
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    }
  }

  const maxLength = 2000
  const isValid = content.trim().length > 0 && content.length <= maxLength && gameCategory

  return (
    <Card className={`border-gray-700 bg-gray-900/70 backdrop-blur ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Send className="h-4 w-4 text-white" />
          </div>
          Create Post
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Game Category
              <span className="text-red-400">*</span>
            </label>
            <Select value={gameCategory} onValueChange={setGameCategory}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-500">
                <SelectValue placeholder="Select a game or topic" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {gameCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">
                What&apos;s happening in your gaming world?
                <span className="text-red-400 ml-1">*</span>
              </label>
              <span className={`text-sm ${
                content.length > maxLength ? 'text-red-400' : 'text-gray-400'
              }`}>
                {content.length}/{maxLength}
              </span>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your gaming moments, victories, strategies, or thoughts..."
              rows={4}
              maxLength={maxLength}
              className="bg-gray-800/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Image className="h-4 w-4" />
              Media (Optional)
            </label>

            <MediaUpload
              accept="all"
              maxFiles={4}
              onFilesUploaded={handleMediaUpload}
              className="border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors"
            />

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={file.preview || (file.ipfs_hash ? `https://gateway.pinata.cloud/ipfs/${file.ipfs_hash}` : '')}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                      )}

                      {/* Upload Progress */}
                      {file.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>

                    {/* Media Type Badge */}
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 left-2 text-xs"
                    >
                      {file.type.startsWith('image/') ? 'IMG' : 'VID'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isValid || isCreating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Posting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>Post</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}