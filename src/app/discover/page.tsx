'use client'

import { DashboardLayout } from '@/components/layout/AppLayout'
import { Section, Stack } from '@/components/ui/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import {
  Search,
  TrendingUp,
  Users,
  Hash,
  Heart,
  MessageSquare,
  Share,
  Gamepad2
} from 'lucide-react'
import { useState } from 'react'

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'posts' | 'users' | 'tags'>('posts')

  const trendingHashtags = [
    '#valorant', '#pubg', '#fortnite', '#gaming', '#web3gaming',
    '#achievement', '#nft', '#somnia', '#blockchain', '#esports'
  ]

  const trendingPosts = [
    {
      id: 1,
      user: { username: 'gaming_pro', display_name: 'Gaming Pro', avatar_ipfs: null, is_verified: true },
      content: 'Just hit Diamond rank in Valorant! The grind was real but totally worth it 🔥',
      likes_count: 234,
      comments_count: 45,
      created_at: '2 hours ago',
      game_category: 'Valorant'
    },
    {
      id: 2,
      user: { username: 'nft_hunter', display_name: 'NFT Hunter', avatar_ipfs: null, is_verified: false },
      content: 'Minted my first achievement NFT on Somnia! This platform is amazing for gamers 🚀',
      likes_count: 189,
      comments_count: 23,
      created_at: '4 hours ago',
      game_category: 'General Gaming'
    },
    {
      id: 3,
      user: { username: 'esports_star', display_name: 'Esports Star', avatar_ipfs: null, is_verified: true },
      content: 'Tournament win streak continues! Thanks to everyone who supported the team 🏆',
      likes_count: 567,
      comments_count: 89,
      created_at: '6 hours ago',
      game_category: 'Esports'
    }
  ]

  const suggestedUsers = [
    { username: 'crypto_gamer', display_name: 'Crypto Gamer', followers: 2500, is_verified: true },
    { username: 'web3_warrior', display_name: 'Web3 Warrior', followers: 1800, is_verified: false },
    { username: 'blockchain_boss', display_name: 'Blockchain Boss', followers: 3200, is_verified: true },
  ]

  return (
    <DashboardLayout>
      <Stack gap="xl" className="animate-slideUp">
        {/* Header */}
        <Section spacing="lg">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-gray-700">
              <Search className="h-4 w-4 text-blue-500" />
              <span className="text-gray-300 text-sm font-medium">
                Discover Content
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gradient leading-tight">
              Explore Gaming Community
            </h1>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Find trending posts, discover new gamers, and explore popular gaming topics.
            </p>
          </div>
        </Section>

        {/* Search Section */}
        <Section>
          <Card className="border-gray-700 bg-gray-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Search className="h-5 w-5 text-blue-500" />
                </div>
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search posts, users, or hashtags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedFilter === 'posts' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('posts')}
                  >
                    Posts
                  </Button>
                  <Button
                    variant={selectedFilter === 'users' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('users')}
                  >
                    Users
                  </Button>
                  <Button
                    variant={selectedFilter === 'tags' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter('tags')}
                  >
                    Tags
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Trending Hashtags */}
        <Section>
          <Card className="border-gray-700 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Hash className="h-5 w-5 text-green-500" />
                </div>
                Trending Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trendingHashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-500/20 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Trending Posts */}
        <Section>
          <Card className="border-gray-700 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                Trending Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {post.user.display_name[0]}
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-200">
                            {post.user.display_name}
                          </span>
                          <span className="text-gray-400 text-sm">
                            @{post.user.username}
                          </span>
                          {post.user.is_verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                          <span className="text-gray-500 text-sm">
                            {post.created_at}
                          </span>
                        </div>

                        <p className="text-gray-300 leading-relaxed">
                          {post.content}
                        </p>

                        <div className="flex items-center gap-1 mb-2">
                          <Badge variant="outline" className="text-xs">
                            <Gamepad2 className="h-3 w-3 mr-1" />
                            {post.game_category}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-6 text-gray-400">
                          <button className="flex items-center gap-1 hover:text-red-400 transition-colors">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">{post.likes_count}</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm">{post.comments_count}</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-green-400 transition-colors">
                            <Share className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Suggested Users */}
        <Section>
          <Card className="border-gray-700 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                Suggested Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestedUsers.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.display_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-200">
                            {user.display_name}
                          </span>
                          {user.is_verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>@{user.username}</span>
                          <span>•</span>
                          <span>{user.followers.toLocaleString()} followers</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Section>
      </Stack>
    </DashboardLayout>
  )
}