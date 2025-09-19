'use client'

import { DashboardLayout } from '@/components/layout/AppLayout'
import { Section, Stack } from '@/components/ui/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import {
  Users,
  Calendar,
  Trophy,
  TrendingUp,
  Plus,
  Gamepad2
} from 'lucide-react'
import { useState } from 'react'

export default function CommunityPage() {
  const [selectedTab, setSelectedTab] = useState<'groups' | 'events' | 'leaderboard'>('groups')

  const gameGroups = [
    {
      id: 1,
      name: 'Valorant Legends',
      description: 'Elite Valorant players discussing strategies, sharing clips, and organizing tournaments.',
      members: 1247,
      category: 'Valorant',
      isJoined: false,
      avatar: '🎯',
      activity: 'Very Active'
    },
    {
      id: 2,
      name: 'PUBG Champions',
      description: 'Battle Royale enthusiasts sharing tips, tricks, and epic wins.',
      members: 892,
      category: 'PUBG',
      isJoined: true,
      avatar: '🏆',
      activity: 'Active'
    },
    {
      id: 3,
      name: 'Web3 Gaming Hub',
      description: 'Exploring the future of gaming with blockchain, NFTs, and decentralized gaming.',
      members: 2156,
      category: 'Web3 Gaming',
      isJoined: false,
      avatar: '🚀',
      activity: 'Very Active'
    },
    {
      id: 4,
      name: 'Esports Arena',
      description: 'Competitive gaming discussions, tournament announcements, and pro player insights.',
      members: 3421,
      category: 'Esports',
      isJoined: true,
      avatar: '⚡',
      activity: 'Extremely Active'
    }
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: 'Valorant Tournament Finals',
      description: 'Watch the best teams compete for the championship title and NFT prizes.',
      date: '2024-02-15',
      time: '18:00 UTC',
      participants: 156,
      type: 'Tournament',
      game: 'Valorant'
    },
    {
      id: 2,
      title: 'Web3 Gaming Workshop',
      description: 'Learn about blockchain gaming, NFT achievements, and earning in the metaverse.',
      date: '2024-02-18',
      time: '20:00 UTC',
      participants: 89,
      type: 'Workshop',
      game: 'General'
    },
    {
      id: 3,
      title: 'PUBG Squad Battle',
      description: 'Form teams and compete in intense squad battles with SOMI token rewards.',
      date: '2024-02-20',
      time: '16:00 UTC',
      participants: 234,
      type: 'Competition',
      game: 'PUBG'
    }
  ]

  const leaderboard = [
    {
      rank: 1,
      user: { username: 'gaming_legend', display_name: 'Gaming Legend', avatar_ipfs: null },
      points: 15420,
      achievements: 45,
      badges: ['Champion', 'Verified', 'Top Contributor']
    },
    {
      rank: 2,
      user: { username: 'pro_gamer_x', display_name: 'Pro Gamer X', avatar_ipfs: null },
      points: 12890,
      achievements: 38,
      badges: ['Elite', 'Tournament Winner']
    },
    {
      rank: 3,
      user: { username: 'web3_warrior', display_name: 'Web3 Warrior', avatar_ipfs: null },
      points: 11250,
      achievements: 42,
      badges: ['NFT Hunter', 'Early Adopter']
    },
    {
      rank: 4,
      user: { username: 'esports_star', display_name: 'Esports Star', avatar_ipfs: null },
      points: 10890,
      achievements: 35,
      badges: ['Professional', 'Streamer']
    },
    {
      rank: 5,
      user: { username: 'crypto_champion', display_name: 'Crypto Champion', avatar_ipfs: null },
      points: 9760,
      achievements: 33,
      badges: ['Blockchain Expert']
    }
  ]

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'groups':
        return (
          <div className="space-y-4">
            {gameGroups.map((group) => (
              <Card key={group.id} className="border-gray-700 bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{group.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-200">{group.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            <Gamepad2 className="h-3 w-3 mr-1" />
                            {group.category}
                          </Badge>
                        </div>
                        <p className="text-gray-400 mb-3 leading-relaxed">{group.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{group.members.toLocaleString()} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{group.activity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={group.isJoined ? "outline" : "default"}
                      size="sm"
                    >
                      {group.isJoined ? 'Joined' : 'Join Group'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )

      case 'events':
        return (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="border-gray-700 bg-gray-900/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-200">{event.title}</h3>
                        <Badge variant={event.type === 'Tournament' ? 'default' : 'outline'} className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-gray-400 mb-3">{event.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{event.participants} participants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gamepad2 className="h-4 w-4" />
                          <span>{event.game}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm">
                      Join Event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )

      case 'leaderboard':
        return (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <Card key={entry.rank} className="border-gray-700 bg-gray-900/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        entry.rank === 1 ? 'bg-yellow-500 text-black' :
                        entry.rank === 2 ? 'bg-gray-400 text-black' :
                        entry.rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {entry.rank}
                      </div>

                      <Avatar className="h-10 w-10">
                        {entry.user.avatar_ipfs ? (
                          <AvatarImage src={`https://gateway.pinata.cloud/ipfs/${entry.user.avatar_ipfs}`} />
                        ) : (
                          <AvatarFallback>
                            {entry.user.display_name[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div>
                        <div className="font-medium text-gray-200">{entry.user.display_name}</div>
                        <div className="text-sm text-gray-400">@{entry.user.username}</div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {entry.badges.map((badge) => (
                          <Badge key={badge} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-gray-200">{entry.points.toLocaleString()} pts</div>
                      <div className="text-sm text-gray-400">{entry.achievements} achievements</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
    }
  }

  return (
    <DashboardLayout>
      <Stack gap="xl" className="animate-slideUp">
        {/* Header */}
        <Section spacing="lg">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-gray-700">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-gray-300 text-sm font-medium">
                Gaming Community
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gradient leading-tight">
              Connect & Compete
            </h1>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Join gaming groups, participate in events, and climb the leaderboard in the ultimate Web3 gaming community.
            </p>
          </div>
        </Section>

        {/* Community Stats */}
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center border-gray-700 bg-gray-900/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gradient">24</div>
                  <div className="text-gray-400 text-sm">Active Groups</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center border-gray-700 bg-gray-900/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gradient">8.5K</div>
                  <div className="text-gray-400 text-sm">Community Members</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center border-gray-700 bg-gray-900/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gradient">156</div>
                  <div className="text-gray-400 text-sm">Upcoming Events</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center border-gray-700 bg-gray-900/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gradient">2.3K</div>
                  <div className="text-gray-400 text-sm">Active Competitors</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Navigation Tabs */}
        <Section>
          <Card className="border-gray-700 bg-gray-900/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                  Community Hub
                </CardTitle>
                <Button size="sm" className="bg-gradient-to-r from-primary-500 to-secondary-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant={selectedTab === 'groups' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTab('groups')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Groups
                </Button>
                <Button
                  variant={selectedTab === 'events' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTab('events')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </Button>
                <Button
                  variant={selectedTab === 'leaderboard' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTab('leaderboard')}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
            </CardContent>
          </Card>
        </Section>
      </Stack>
    </DashboardLayout>
  )
}