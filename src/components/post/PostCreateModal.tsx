'use client'

import React, { useState, useEffect } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { usePostContract } from '@/hooks/usePostContract'
import { useWeb3, useRequireWallet } from '@/contexts/Web3Context'
import { useConnect, useAccount } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { MediaUpload } from '@/components/ui/MediaUpload'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { useToastHelpers } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import {
  Send,
  Image,
  Video,
  Gamepad2,
  X,
  Loader2,
  AlertCircle,
  Zap,
  Shield,
  Database,
  Coins,
  User,
  Sparkles,
  Wallet
} from 'lucide-react'
import { MediaUpload as MediaUploadType } from '@/types'

interface PostCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const gameCategories = [
  { value: 'general', label: 'General Gaming', icon: '🎮', color: 'from-blue-500 to-cyan-500' },
  { value: 'valorant', label: 'Valorant', icon: '🎯', color: 'from-red-500 to-pink-500' },
  { value: 'pubg', label: 'PUBG', icon: '🏆', color: 'from-orange-500 to-yellow-500' },
  { value: 'fortnite', label: 'Fortnite', icon: '⚡', color: 'from-purple-500 to-blue-500' },
  { value: 'league', label: 'League of Legends', icon: '⚔️', color: 'from-indigo-500 to-purple-500' },
  { value: 'metaverse', label: 'Metaverse Games', icon: '🌐', color: 'from-green-500 to-teal-500' },
  { value: 'other', label: 'Other', icon: '🎲', color: 'from-gray-500 to-slate-500' }
]

type PostMode = 'free' | 'blockchain'

export function PostCreateModal({ isOpen, onClose, onSuccess }: PostCreateModalProps) {
  const { user } = useUserProfile()
  // Removed off-chain posting - blockchain only
  const {
    createPost: createBlockchainPost,
    isCreating: isCreatingBlockchain,
    postFee,
    isContractAvailable
  } = usePostContract()
  const { success, error: showError } = useToastHelpers()
  const { connection, isOnSomnia, switchNetwork } = useWeb3()
  const { needsConnection, needsNetworkSwitch, isReady } = useRequireWallet()
  const { connect, connectors } = useConnect()

  const [content, setContent] = useState('')
  const [gameCategory, setGameCategory] = useState<string>('general')
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType[]>([])
  // Always use blockchain mode - no more free posts
  const postMode = 'blockchain'
  const [error, setError] = useState<string | null>(null)

  const isCreating = isCreatingBlockchain
  const maxLength = 2000
  const isValid = content.trim().length > 0 && content.length <= maxLength

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent('')
      setGameCategory('general')
      setMediaFiles([])
      setError(null)
    }
  }, [isOpen])

  const handleMediaUpload = (uploads: MediaUploadType[]) => {
    setMediaFiles(prev => [...prev, ...uploads])
    setError(null)
  }

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleConnectWallet = async () => {
    try {
      const connector = connectors.find(c => c.name === 'MetaMask') || connectors[0]
      if (connector) {
        await connect({ connector })
      }
    } catch (error) {
      showError('Connection Failed', 'Failed to connect wallet')
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork(true) // true for testnet
      success('Network Switched', 'Successfully switched to Somnia testnet')
    } catch (error) {
      showError('Network Switch Failed', 'Failed to switch to Somnia network')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('Post content is required')
      return
    }

    if (!user) {
      setError('You must be logged in to create a post')
      return
    }

    try {
      const postData = {
        content: content.trim(),
        game_category: gameCategory,
        media_ipfs: mediaFiles
          .filter(file => file.ipfs_hash)
          .map(file => file.ipfs_hash!)
      }

      // Always create blockchain posts - check wallet requirements
      if (!isContractAvailable) {
        setError('Blockchain contract not available. Please check your connection.')
        return
      }

      if (needsConnection) {
        setError('Please connect your wallet to create blockchain posts')
        return
      }

      if (needsNetworkSwitch) {
        setError('Please switch to Somnia network to create blockchain posts')
        return
      }

      if (!isReady) {
        setError('Wallet not ready for blockchain transactions')
        return
      }

      await createBlockchainPost({
        content: postData.content,
        mediaIpfs: postData.media_ipfs[0] || '',
        gameCategory: postData.game_category
      })

      success('Blockchain Post Created!', 'Your post has been published to the Somnia blockchain')
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    }
  }

  const selectedCategory = gameCategories.find(cat => cat.value === gameCategory)

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background-primary border border-border-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Create Amazing Content
            {isContractAvailable && (
              <Badge variant="outline" className="border-success-500 text-success-400">
                <Zap className="h-3 w-3 mr-1" />
                Blockchain Ready
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 p-4 bg-background-secondary rounded-xl border border-border-secondary">
              <Avatar className="h-12 w-12 border-2 border-primary-500/30">
                {user.avatar_ipfs ? (
                  <AvatarImage
                    src={`https://gateway.pinata.cloud/ipfs/${user.avatar_ipfs}`}
                    alt={user.display_name || user.username}
                  />
                ) : (
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-semibold text-text-primary">{user.display_name}</h3>
                <p className="text-sm text-text-tertiary">@{user.username}</p>
              </div>
            </div>
          )}

          {/* Blockchain Post Info */}
          {isContractAvailable && (
            <div className="p-4 bg-gradient-to-br from-secondary-500/10 to-primary-500/10 border border-secondary-500/30 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-secondary-500/20 rounded-lg">
                  <Shield className="h-5 w-5 text-secondary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">Blockchain Post</h4>
                  <p className="text-sm text-text-tertiary">
                    Your content will be stored permanently on Somnia blockchain
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="border-warning-500 text-warning-400 text-xs">
                  <Coins className="h-3 w-3 mr-1" />
                  Fee: {postFee} STT
                </Badge>
                <Badge variant="outline" className="border-success-500 text-success-400 text-xs">
                  Permanent & Verified
                </Badge>
                {needsConnection && (
                  <Badge variant="outline" className="border-red-500 text-red-400 text-xs">
                    <Wallet className="h-3 w-3 mr-1" />
                    Connect Wallet
                  </Badge>
                )}
                {needsNetworkSwitch && (
                  <Badge variant="outline" className="border-orange-500 text-orange-400 text-xs">
                    Switch Network
                  </Badge>
                )}
                {isReady && (
                  <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                    ✓ Ready
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Wallet Connection Helper */}
          {isContractAvailable && postMode === 'blockchain' && (needsConnection || needsNetworkSwitch) && (
            <div className="p-4 bg-warning-500/10 border border-warning-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-warning-400 mb-2">Wallet Setup Required</h4>
                  {needsConnection && (
                    <p className="text-sm text-text-tertiary mb-3">
                      Connect your wallet to create blockchain posts and start earning rewards.
                    </p>
                  )}
                  {needsNetworkSwitch && (
                    <p className="text-sm text-text-tertiary mb-3">
                      Switch to Somnia testnet to enable blockchain posting.
                    </p>
                  )}
                  <div className="flex gap-2">
                    {needsConnection && (
                      <Button
                        type="button"
                        onClick={handleConnectWallet}
                        size="sm"
                        className="bg-primary-500 hover:bg-primary-600"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Wallet
                      </Button>
                    )}
                    {needsNetworkSwitch && (
                      <Button
                        type="button"
                        onClick={handleSwitchNetwork}
                        size="sm"
                        variant="outline"
                        className="border-warning-500 text-warning-400 hover:bg-warning-500/10"
                      >
                        Switch to Somnia
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Category Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-primary flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Game Category
              <span className="text-error-400">*</span>
            </label>
            <Select value={gameCategory} onValueChange={setGameCategory}>
              <SelectTrigger className="h-12 bg-background-secondary border-border-primary hover:border-border-secondary transition-colors">
                <SelectValue>
                  {selectedCategory && (
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r", selectedCategory.color)}>
                        <span className="text-lg">{selectedCategory.icon}</span>
                      </div>
                      <span className="font-medium">{selectedCategory.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {gameCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-r", category.color)}>
                        <span className="text-sm">{category.icon}</span>
                      </div>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary">
                What's happening in your gaming world?
                <span className="text-error-400 ml-1">*</span>
              </label>
              <span className={cn(
                "text-sm font-medium",
                content.length > maxLength ? 'text-error-400' :
                content.length > maxLength * 0.8 ? 'text-warning-400' : 'text-text-tertiary'
              )}>
                {content.length}/{maxLength}
              </span>
            </div>
            <div className="relative">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your epic gaming moments, strategies, achievements, or thoughts..."
                rows={5}
                maxLength={maxLength}
                className="bg-background-secondary border-border-primary focus:border-primary-500 focus:ring-primary-500/20 resize-none transition-all duration-200"
              />
              <div className="absolute bottom-3 right-3 text-xs text-text-tertiary">
                {content.length > 0 && (
                  <span className="px-2 py-1 bg-background-primary rounded-full">
                    {Math.ceil(content.length / 50)} lines
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-primary flex items-center gap-2">
              <Image className="h-4 w-4" />
              Media (Optional)
            </label>

            <MediaUpload
              accept="all"
              maxFiles={4}
              onFilesUploaded={handleMediaUpload}
              className="border-2 border-dashed border-border-secondary hover:border-primary-500 transition-all duration-300 bg-background-secondary hover:bg-background-tertiary"
            />

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-background-tertiary rounded-xl overflow-hidden border border-border-secondary">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={file.preview || (file.ipfs_hash ? `https://gateway.pinata.cloud/ipfs/${file.ipfs_hash}` : '')}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-text-tertiary" />
                        </div>
                      )}

                      {/* Upload Progress */}
                      {file.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 p-1.5 bg-error-500 hover:bg-error-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>

                    {/* Media Type Badge */}
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 left-2 text-xs backdrop-blur-sm bg-background-primary/80"
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
            <div className="p-4 bg-error-500/10 border border-error-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-error-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-error-400">Failed to create post</p>
                  <p className="text-sm text-error-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isCreating}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isCreating}
              className={cn(
                "px-8 font-semibold transition-all duration-300",
                postMode === 'blockchain'
                  ? "bg-gradient-to-r from-secondary-500 to-primary-500 hover:from-secondary-600 hover:to-primary-600 shadow-lg shadow-secondary-500/25"
                  : "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
              )}
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {postMode === 'blockchain' ? 'Publishing to Blockchain...' : 'Creating Post...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {postMode === 'blockchain' ? (
                    <Shield className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>
                    {postMode === 'blockchain' ? 'Publish to Blockchain' : 'Create Post'}
                  </span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}