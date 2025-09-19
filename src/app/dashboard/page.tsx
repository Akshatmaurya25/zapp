'use client'

import { DashboardLayout } from '@/components/layout/AppLayout'
import { useUser } from '@/contexts/UserContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PostFeed } from '@/components/post'
import { GridContainer, Section, Stack } from '@/components/ui/Container'
import {
  MessageSquare,
  Heart,
  Trophy,
  Users,
  Coins,
  TrendingUp,
  Zap,
  Sparkles
} from 'lucide-react'

function DashboardContent() {
  const { user } = useUser()

  return (
    <Stack gap="xl" className="animate-slideUp">
      {/* Welcome Hero Section */}
      <Section spacing="lg" className="text-center relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-secondary-500/15 to-success-500/15 rounded-full blur-3xl animate-glow-pulse delay-1000" />
        </div>

        <Stack gap="lg" align="center" className="relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-glass-card rounded-full border border-primary-500/30 shadow-glow-sm">
              <Sparkles className="h-4 w-4 text-primary-400 animate-spin-slow" />
              <span className="text-primary-200 text-sm font-medium tracking-wide">
                ⚡ Web3 Gaming Social Platform ⚡
              </span>
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-gradient leading-tight animate-gradient-shift">
                Welcome back{user?.display_name ? `, ${user.display_name}` : ''}!
              </h1>

              {/* Subtitle with enhanced styling */}
              <div className="max-w-4xl mx-auto space-y-2">
                <p className="text-gray-200 text-xl md:text-2xl font-semibold">
                  Ready to dominate the gaming social space?
                </p>
                <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
                  Share your victories • Connect with legends • Earn your place in Web3 gaming history
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Network Status Badge */}
          <div className="cyber-card inline-flex items-center gap-3 px-6 py-4 shadow-glow-sm hover-lift">
            <div className="relative">
              <div className="w-3 h-3 bg-success-400 rounded-full shadow-glow-sm"></div>
              <div className="w-3 h-3 bg-success-400 rounded-full absolute top-0 left-0 animate-ping"></div>
            </div>
            <span className="text-success-400 font-medium">Connected to Somnia Network</span>
            <Zap className="h-4 w-4 text-success-400" />
          </div>
        </Stack>
      </Section>

      {/* Stats Grid - 2x2 Layout */}
      <Section>
        <GridContainer cols="2" gap="lg" className="max-w-4xl mx-auto">
          <StatsCard
            title="Posts Created"
            value={user?.posts_count || 0}
            subtitle="Total content shared"
            icon={MessageSquare}
            color="blue"
            trend={{ value: 12, label: "this week" }}
          />
          <StatsCard
            title="Likes Received"
            value={user?.total_likes_received || 0}
            subtitle="Community appreciation"
            icon={Heart}
            color="red"
            trend={{ value: 8, label: "this week" }}
          />
          <StatsCard
            title="Achievements"
            value={user?.achievements_count || 0}
            subtitle="NFTs earned"
            icon={Trophy}
            color="yellow"
          />
          <StatsCard
            title="SOMI Earned"
            value={user?.total_donations_received || "0"}
            subtitle="Token rewards"
            icon={Coins}
            color="green"
            trend={{ value: 25, label: "this month" }}
          />
        </GridContainer>
      </Section>

      {/* Quick Actions */}
      <Section>
        <QuickActions />
      </Section>

      {/* Network Stats */}
      <Section>
        <Card variant="elevated" hover="glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-secondary-500/10 rounded-lg">
                <Users className="h-5 w-5 text-secondary-500" />
              </div>
              Your Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GridContainer cols="2" gap="lg" className="text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gradient">
                  {user?.followers_count || 0}
                </div>
                <div className="text-text-tertiary text-sm">Followers</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gradient">
                  {user?.following_count || 0}
                </div>
                <div className="text-text-tertiary text-sm">Following</div>
              </div>
            </GridContainer>

            <div className="mt-6 pt-6 border-t border-border-primary text-center">
              <p className="text-text-muted text-xs mb-2">Network Growth</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-success-500/10 rounded-full">
                <TrendingUp className="h-4 w-4 text-success-400" />
                <span className="text-sm text-success-400 font-medium">+15% this week</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Post Feed */}
      <Section>
        <PostFeed showCreatePost={true} />
      </Section>
    </Stack>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  )
}