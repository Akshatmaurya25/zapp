"use client";

import { DashboardLayout } from "@/components/layout/AppLayout";
import { PostFeed } from "@/components/post/PostFeed";
import { Section, Stack } from "@/components/ui/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  Users,
  Clock,
  Gamepad2,
  Flame,
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
        {/* Feed Header - Simplified for mobile */}
        <Section spacing="lg">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gray-800 rounded-full border border-gray-700">
              <Flame className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
              <span className="text-gray-300 text-xs md:text-sm font-medium">
                Gaming Community Feed
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gradient leading-tight px-4">
              Discover Gaming Content
            </h1>

            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
              Stay connected with the gaming community. Share your victories,
              discover new strategies, and connect with fellow gamers.
            </p>
          </div>
        </Section>

        {/* Feed Controls - Mobile Optimized */}
        <Section>
          <div className="space-y-4">
            {/* Feed Type Selector - Horizontal scroll on mobile */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 px-4 md:px-0">Feed Type</h4>
              <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 scrollbar-hide">
                <button
                  onClick={() => handleFeedTypeChange("latest")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                    feedType === "latest"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Latest
                </button>
                <button
                  onClick={() => handleFeedTypeChange("trending")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
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

            {/* Game Category Filter - Horizontal scroll on mobile */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2 px-4 md:px-0">
                <Gamepad2 className="h-4 w-4" />
                Game Categories
              </h4>
              <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 scrollbar-hide">
                {gameCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={
                      selectedCategory === category ||
                      (category === "All" && !selectedCategory)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer transition-colors hover:bg-blue-500/20 whitespace-nowrap"
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Feed Stats - Mobile Optimized */}
        <Section>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 px-4 md:px-0">
            <Card className="text-center">
              <CardContent className="p-3 md:pt-6">
                <div className="space-y-1 md:space-y-2">
                  <div className="text-lg md:text-2xl font-bold text-gradient">2.1K</div>
                  <div className="text-gray-400 text-xs md:text-sm">Active Posts</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3 md:pt-6">
                <div className="space-y-1 md:space-y-2">
                  <div className="text-lg md:text-2xl font-bold text-gradient">856</div>
                  <div className="text-gray-400 text-xs md:text-sm">Active Gamers</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3 md:pt-6">
                <div className="space-y-1 md:space-y-2">
                  <div className="text-lg md:text-2xl font-bold text-gradient">12.5K</div>
                  <div className="text-gray-400 text-xs md:text-sm">
                    Interactions
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
