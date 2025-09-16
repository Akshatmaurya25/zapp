'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { Section, Stack } from '@/components/ui/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BlockchainPostCreate } from '@/components/post/BlockchainPostCreate'
import {
  ArrowLeft,
  Sparkles,
  Shield,
  Database,
  Zap
} from 'lucide-react'
import Link from 'next/link'

const gameCategories: { value: GameCategory; label: string; emoji: string }[] = [
  { value: 'general', label: 'General Gaming', emoji: '🎮' },
  { value: 'valorant', label: 'Valorant', emoji: '🎯' },
  { value: 'pubg', label: 'PUBG', emoji: '🔫' },
  { value: 'fortnite', label: 'Fortnite', emoji: '🏗️' },
  { value: 'league_of_legends', label: 'League of Legends', emoji: '⚔️' },
  { value: 'metaverse', label: 'Metaverse Games', emoji: '🌐' },
  { value: 'esports', label: 'Esports', emoji: '🏆' },
  { value: 'other', label: 'Other', emoji: '🕹️' }
]

export default function CreatePostPage() {
  const [content, setContent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('general')
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [privacy, setPrivacy] = useState<'public' | 'followers'>('public')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { createPost, isCreating } = usePosts()
  const { user } = useUser()

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file under 5MB',
          variant: 'destructive'
        })
        return
      }

      setSelectedMedia(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMedia = () => {
    setSelectedMedia(null)
    setMediaPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadMediaToIPFS = async (file: File): Promise<string> => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload media')
      }

      const data = await response.json()
      return data.ipfsHash
    } catch (error) {
      console.error('Error uploading to IPFS:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !selectedMedia) {
      toast({
        title: 'Empty post',
        description: 'Please add some content or media to your post',
        variant: 'destructive'
      })
      return
    }

    try {
      let mediaIPFS = null

      if (selectedMedia) {
        mediaIPFS = await uploadMediaToIPFS(selectedMedia)
      }

      await createPost({
        content: content.trim(),
        game_category: selectedCategory,
        media_ipfs: mediaIPFS
      })

      toast({
        title: 'Post created!',
        description: 'Your post has been shared with the community',
        variant: 'default'
      })

      router.push('/feed')
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: 'Failed to create post',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    }
  }

  const isSubmitDisabled = isCreating || isUploading || (!content.trim() && !selectedMedia)

  return (
    <DashboardLayout>
      <Stack gap="xl" className="animate-slideUp max-w-3xl mx-auto">
        {/* Header */}
        <Section spacing="lg">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-gray-700">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-gray-300 text-sm font-medium">
                Create Content
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gradient leading-tight">
              Share Your Gaming Moment
            </h1>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Share your victories, strategies, and gaming experiences with the community.
            </p>
          </div>
        </Section>

        {/* Create Post Form */}
        <Section>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-gray-700 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Gamepad2 className="h-5 w-5 text-blue-500" />
                  </div>
                  Create New Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user?.display_name?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-200">{user?.display_name}</div>
                    <div className="text-sm text-gray-400">@{user?.username}</div>
                  </div>
                </div>

                {/* Content Textarea */}
                <div className="space-y-2">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's happening in your gaming world?"
                    className="w-full min-h-[120px] p-4 bg-gray-800 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-200 placeholder-gray-400"
                    maxLength={2000}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Share your gaming moments, strategies, or thoughts</span>
                    <span>{content.length}/2000</span>
                  </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-4">
                  {mediaPreview && (
                    <div className="relative">
                      <img
                        src={mediaPreview}
                        alt="Post media preview"
                        className="w-full max-h-96 object-contain rounded-lg border border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={removeMedia}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaSelect}
                    className="hidden"
                  />

                  {!mediaPreview && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition-colors group"
                    >
                      <div className="text-center space-y-2">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto group-hover:text-gray-300" />
                        <p className="text-gray-400 group-hover:text-gray-300">
                          Click to upload image or video
                        </p>
                        <p className="text-xs text-gray-500">
                          Maximum file size: 5MB
                        </p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Game Category Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Game Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {gameCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setSelectedCategory(category.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          selectedCategory === category.value
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                            : 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        <span>{category.emoji}</span>
                        <span className="text-sm">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Who can see this post?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPrivacy('public')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        privacy === 'public'
                          ? 'border-green-500 bg-green-500/20 text-green-300'
                          : 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">Everyone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrivacy('followers')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        privacy === 'followers'
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                          : 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Followers Only</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-gray-600 text-gray-400 hover:text-gray-200"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating || isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isUploading ? 'Uploading...' : 'Posting...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Share Post
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Section>

        {/* Tips Card */}
        <Section>
          <Card className="border-gray-700 bg-gradient-to-r from-green-900/20 to-blue-900/20">
            <CardHeader>
              <CardTitle className="text-lg">Pro Tips for Great Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                <ul className="space-y-2">
                  <li>• Share your gaming victories and achievements</li>
                  <li>• Include screenshots or clips of epic moments</li>
                  <li>• Use relevant game categories for better discovery</li>
                </ul>
                <ul className="space-y-2">
                  <li>• Ask questions to engage the community</li>
                  <li>• Share tips and strategies with other gamers</li>
                  <li>• Tag relevant games and tournaments</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </Section>
      </Stack>
    </DashboardLayout>
  )
}