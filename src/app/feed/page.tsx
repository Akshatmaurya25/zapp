"use client";

import { DashboardLayout } from "@/components/layout/AppLayout";
import { PostFeed } from "@/components/post/PostFeed";
import { Container, Section, Stack } from "@/components/ui/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  Gamepad2,
  Flame,
  Filter,
} from "lucide-react";
import { useState } from "react";

export default function FeedPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [feedType, setFeedType] = useState<"latest" | "trending" | "following">(
    "latest"
  );

  const gameCategories = [
    "All",
    "General Gaming",
    "Valorant",
    "PUBG",
    "Fortnite",
    "League of Legends",
    "Metaverse Games",
    "Other",
  ];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === "All" ? undefined : category);
  };

  const handleFeedTypeChange = (type: "latest" | "trending" | "following") => {
    setFeedType(type);
  };

  return (
    <DashboardLayout>
      <Stack gap="xl" className="animate-slideUp">
        {/* Feed Header */}
        <Section spacing="lg">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-gray-700">
              <Flame className="h-4 w-4 text-blue-500" />
              <span className="text-gray-300 text-sm font-medium">
                Gaming Community Feed
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gradient leading-tight">
              Discover Gaming Content
            </h1>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Stay connected with the gaming community. Share your victories,
              discover new strategies, and connect with fellow gamers.
            </p>
          </div>
        </Section>

        {/* Feed Controls */}
        <Section>
          <Card className="border-gray-700 bg-gray-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Filter className="h-5 w-5 text-blue-500" />
                </div>
                Feed Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Feed Type Selector */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Feed Type</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFeedTypeChange("latest")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                      feedType === "latest"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    Latest Posts
                  </button>
                  <button
                    onClick={() => handleFeedTypeChange("trending")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                      feedType === "trending"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </button>
                  <button
                    onClick={() => handleFeedTypeChange("following")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                      feedType === "following"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Following
                  </button>
                </div>
              </div>

              {/* Game Category Filter */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Game Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {gameCategories.map((category) => (
                    <Badge
                      key={category}
                      variant={
                        selectedCategory === category ||
                        (category === "All" && !selectedCategory)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer transition-colors hover:bg-blue-500/20"
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Feed Stats */}
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gradient">2.1K</div>
                  <div className="text-gray-400 text-sm">Active Posts</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gradient">856</div>
                  <div className="text-gray-400 text-sm">Active Gamers</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gradient">12.5K</div>
                  <div className="text-gray-400 text-sm">
                    Total Interactions
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Main Feed */}
        <Section>
          <PostFeed
            showCreatePost={false}
            initialFilter={{
              game_category: selectedCategory,
              following_only: feedType === "following",
            }}
          />
        </Section>
      </Stack>
    </DashboardLayout>
  );
}
