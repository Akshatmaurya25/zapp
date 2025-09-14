'use client'

import { DashboardLayout } from '@/components/layout/AppLayout'
import { useUser } from '@/contexts/UserContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PostFeed } from '@/components/post'
import { Container, GridContainer, Section, Stack } from '@/components/ui/Container'
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
      <Section spacing="lg" className="text-center">
        <Stack gap="lg" align="center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background-elevated rounded-full border border-border-primary">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span className="text-text-secondary text-sm font-medium">
                Web3 Gaming Social Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gradient leading-tight">
              Welcome back{user?.display_name ? `, ${user.display_name}` : ''}!
            </h1>

            <p className="text-text-tertiary text-lg md:text-xl max-w-3xl leading-relaxed">
              Ready to dominate the gaming social space? Share your victories, connect with legends, and earn your place in Web3 gaming history.
            </p>
          </div>

          {/* Network Status Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-success-500/10 border border-success-500/20 rounded-full">
            <div className="relative">
              <div className="w-2 h-2 bg-success-400 rounded-full"></div>
              <div className="w-2 h-2 bg-success-400 rounded-full absolute top-0 left-0 animate-ping"></div>
            </div>
            <span className="text-success-400 font-medium">Connected to Somnia Network</span>
            <Zap className="h-4 w-4 text-success-400" />
          </div>
        </Stack>
      </Section>

      {/* Stats Grid */}
      <Section>
        <GridContainer cols="4" gap="lg">
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