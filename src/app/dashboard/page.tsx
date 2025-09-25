"use client";

import { DashboardLayout } from "@/components/layout/AppLayout";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PostFeed } from "@/components/post";
import { GridContainer, Section, Stack } from "@/components/ui/Container";
import {
  MessageSquare,
  Heart,
  Trophy,
  Users,
  Coins,
  TrendingUp,
  Zap,
  Sparkles,
} from "lucide-react";

function DashboardContent() {
  const { user } = useUser();

  return (
    <Stack gap="xl" className="animate-slideUp">
      {/* Enhanced Welcome Hero Section */}
      <Section spacing="xl" className="relative overflow-hidden">
        {/* Advanced Background Effects */}
        {/* <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-primary-500/30 to-secondary-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-tl from-secondary-500/25 to-success-500/20 rounded-full blur-3xl animate-glow-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-success-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div> */}

        {/* Main Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto">
          <GridContainer
            cols="2"
            gap="xl"
            className="items-center min-h-[500px]"
          >
            {/* Left Column - Welcome Content */}
            <div className="space-y-8">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-glass-card rounded-full border border-primary-500/30 shadow-glow-sm">
                <Sparkles className="h-4 w-4 text-primary-400 animate-spin-slow" />
                <span className="text-primary-200 text-sm font-medium tracking-wide">
                  Web3 Gaming Social Platform
                </span>
                <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
              </div>

              {/* Main Heading */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-medium text-gray-300">
                    Welcome Back,
                  </h2>
                  <h1 className="text-4xl md:text-6xl font-black text-gradient leading-tight animate-gradient-shift">
                    {user?.display_name || "Gamer"}
                  </h1>
                </div>

                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  Ready to dominate the gaming social space? Share your
                  victories and connect with legends.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button className="relative overflow-hidden cyber-card px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-semibold rounded-lg shadow-glow-sm hover-lift transition-all duration-300 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Create Post
                </button>
                <button className="relative overflow-hidden cyber-card px-6 py-3 bg-glass-card hover:bg-white/10 text-white font-medium rounded-lg border border-white/20 hover-lift transition-all duration-300 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Explore Feed
                </button>
              </div>

              {/* Network Status */}
              <div className="cyber-card inline-flex items-center gap-3 px-4 py-3 bg-success-500/10 rounded-lg border border-success-500/30">
                <div className="relative">
                  <div className="w-3 h-3 bg-success-400 rounded-full shadow-glow-sm"></div>
                  <div className="w-3 h-3 bg-success-400 rounded-full absolute top-0 left-0 animate-ping"></div>
                </div>
                <span className="text-success-400 font-medium text-sm">
                  Connected to Somnia Network
                </span>
                <Zap className="h-4 w-4 text-success-400" />
              </div>
            </div>

            {/* Right Column - Interactive Dashboard Cards */}
            <div className="space-y-6">
              {/* Quick Stats Preview */}
              <div className="relative overflow-hidden cyber-card p-6 bg-glass-card rounded-xl border border-white/10 shadow-glow-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-400" />
                  Your Progress
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-gradient">
                      {user?.posts_count || 0}
                    </div>
                    <div className="text-xs text-gray-400">Posts</div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-gradient">
                      {user?.total_likes_received || 0}
                    </div>
                    <div className="text-xs text-gray-400">Likes</div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-gradient">
                      {user?.achievements_count || 0}
                    </div>
                    <div className="text-xs text-gray-400">NFTs</div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-gradient">
                      {user?.total_donations_received || "0"}
                    </div>
                    <div className="text-xs text-gray-400">SOMI</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Level Progress</span>
                    <span>67%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                      style={{ width: "67%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Achievement Spotlight */}
              <div className="relative overflow-hidden cyber-card p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30 shadow-glow-sm">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Latest Achievement
                </h3>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      First Post Creator
                    </div>
                    <div className="text-sm text-gray-400">
                      Earned 2 days ago
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Shortcuts */}
              <div className="grid grid-cols-2 gap-4">
                <button className="relative overflow-hidden cyber-card p-4 bg-glass-card hover:bg-white/10 rounded-lg border border-white/10 hover-lift transition-all duration-300 text-left">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                    <Heart className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-sm font-medium text-white">Stream</div>
                  <div className="text-xs text-gray-400">Go Live</div>
                </button>

                <button className="relative overflow-hidden cyber-card p-4 bg-glass-card hover:bg-white/10 rounded-lg border border-white/10 hover-lift transition-all duration-300 text-left">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                    <Coins className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-sm font-medium text-white">Earn</div>
                  <div className="text-xs text-gray-400">View Rewards</div>
                </button>
              </div>
            </div>
          </GridContainer>
        </div>
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
                <span className="text-sm text-success-400 font-medium">
                  +15% this week
                </span>
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
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
