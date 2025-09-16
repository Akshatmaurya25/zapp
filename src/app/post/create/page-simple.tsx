"use client";

import { DashboardLayout } from "@/components/layout/AppLayout";
import { Section, Stack } from "@/components/ui/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BlockchainPostCreate } from "@/components/post/BlockchainPostCreate";
import { Sparkles } from "lucide-react";

export default function CreatePostPage() {
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
              Share your victories, strategies, and gaming experiences with the
              community.
            </p>
          </div>
        </Section>

        {/* Use the proper BlockchainPostCreate component */}
        <Section>
          <BlockchainPostCreate
            onSuccess={() => {
              // Navigate to feed after successful post creation
              window.location.href = "/feed";
            }}
          />
        </Section>

        {/* Tips Card */}
        <Section>
          <Card className="border-gray-700 bg-gradient-to-r from-green-900/20 to-blue-900/20">
            <CardHeader>
              <CardTitle className="text-lg">
                Pro Tips for Great Posts
              </CardTitle>
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
  );
}
