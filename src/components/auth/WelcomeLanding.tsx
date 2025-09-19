"use client";

import React, { useEffect, useState } from "react";
import { WalletSelector } from "./WalletSelector";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import {
  Zap,
  Users,
  Trophy,
  Coins,
  Gamepad2,
  MessageSquare,
  TrendingUp,
  Star,
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  Globe,
  Lock,
  Rocket,
  ChevronDown,
  Activity,
  Layers,
  BarChart3,
  Brain,
  Wallet,
  Gift,
} from "lucide-react";

interface WelcomeLandingProps {
  onConnect?: () => void;
}

export function WelcomeLanding({ onConnect }: WelcomeLandingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 4000);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 5000);

    return () => {
      clearInterval(featureInterval);
      clearInterval(testimonialInterval);
    };
  }, []);

  const features = [
    {
      text: "Share Epic Gaming Moments",
      icon: Gamepad2,
      color: "from-blue-500 to-cyan-500",
      desc: "Capture and share your best gameplay moments",
    },
    {
      text: "Earn SOMI Rewards",
      icon: Coins,
      color: "from-yellow-500 to-orange-500",
      desc: "Get rewarded for quality content and engagement",
    },
    {
      text: "Collect NFT Achievements",
      icon: Trophy,
      color: "from-purple-500 to-pink-500",
      desc: "Unlock exclusive NFTs for your gaming milestones",
    },
  ];

  const testimonials = [
    {
      text: "Zapp revolutionized how I share my gaming content!",
      author: "ProGamer_2024",
      game: "Valorant Champion",
    },
    {
      text: "Earning SOMI tokens while building my community is amazing!",
      author: "StreamMaster",
      game: "Twitch Streamer",
    },
    {
      text: "My NFT achievement collection is growing every day!",
      author: "CryptoGamer",
      game: "Web3 Enthusiast",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

        {/* Multiple Floating Orbs with different animations */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute top-10 right-1/3 w-64 h-64 bg-gradient-to-r from-green-500/15 to-emerald-500/15 rounded-full blur-3xl animate-pulse delay-3000" />
        <div className="absolute bottom-32 left-1/3 w-56 h-56 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-4000" />

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* Navigation Header */}
        <nav className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo size="lg" href="#" className="text-white" />
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-gray-300 hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#community"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Community
              </a>
              <Button variant="gradientOutline" size="sm">
                Launch App
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-8 pb-12">
          <div
            className={cn(
              "text-center space-y-6 max-w-5xl mx-auto transition-all duration-1000",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            )}
          >
            {/* Main Hero Content */}
            <div className="space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">
                  The Future of Gaming Social
                </span>
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>

              {/* Main Title */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black">
                  <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent tracking-tight">
                    Share, Earn,
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                    Achieve
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Join the ultimate Web3 gaming social platform. Connect with
                  millions of gamers, earn crypto rewards, and collect NFT
                  achievements—all on Somnia's lightning-fast blockchain.
                </p>
              </div>

              {/* Dynamic Feature Showcase */}
              <div className="py-6">
                <div className="relative h-20 flex items-center justify-center">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={index}
                        className={cn(
                          "absolute flex flex-col items-center gap-3 transition-all duration-700",
                          currentFeature === index
                            ? "opacity-100 translate-y-0 scale-100"
                            : "opacity-0 translate-y-4 scale-95"
                        )}
                      >
                        <div
                          className={cn(
                            "p-4 rounded-2xl bg-gradient-to-r shadow-xl",
                            feature.color
                          )}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {feature.text}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Feature Indicators */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        currentFeature === index
                          ? "bg-blue-400 w-8"
                          : "bg-gray-600 hover:bg-gray-500"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="space-y-4">
                <div className="max-w-2xl mx-auto">
                  <WalletSelector onConnect={onConnect} />
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="gradientOutline"
                    size="lg"
                    className="min-w-[180px]"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Watch Demo
                  </Button>
                </div>
                <p className="text-sm text-gray-400">
                  🎉 Free to join • No gas fees for basic features • 100%
                  decentralized
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Network Performance Stats */}
        <section className="bg-black border-y border-slate-800/50">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Powered by Somnia Network
                </h2>
                <p className="text-gray-400">
                  Experience lightning-fast blockchain performance
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="glass" className="group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Activity className="h-8 w-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                    1M+
                  </div>
                  <div className="text-xs text-gray-400 font-medium">TPS</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Lightning Fast
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Coins className="h-8 w-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                    &lt;$0.01
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    Gas Fees
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Ultra Low Cost
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                    &lt;1s
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    Finality
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Instant Confirm
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 text-orange-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-1">
                    100%
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    EVM Compatible
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Full Support</div>
                </CardContent>
              </Card>
            </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm mb-6">
              <Star className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                Why Choose Zapp?
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The Complete Gaming
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {" "}
                Social Experience
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to connect, create, and earn in the gaming
              community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card variant="gaming" hover="lift" className="group relative">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl w-fit shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-110">
                    <Gamepad2 className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  Gaming Community
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  Connect with millions of gamers worldwide. Share epic moments,
                  strategies, and build lasting friendships in a dedicated
                  gaming environment.
                </p>
                <div className="mt-6 flex items-center text-blue-400 text-sm font-medium">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Join the community
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card variant="gaming" hover="lift" className="group relative">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl w-fit shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-110">
                    <Coins className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                  Earn SOMI Rewards
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  Get rewarded for creating quality content and engaging with
                  the community. Turn your gaming passion into real crypto
                  earnings.
                </p>
                <div className="mt-6 flex items-center text-purple-400 text-sm font-medium">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Start earning
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card variant="gaming" hover="lift" className="group relative">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl w-fit shadow-lg shadow-yellow-500/25 group-hover:shadow-yellow-500/40 transition-all duration-300 group-hover:scale-110">
                    <Trophy className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors">
                  Achievement NFTs
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  Unlock exclusive NFT achievements for milestones and special
                  actions. Build your digital trophy collection and showcase
                  your skills.
                </p>
                <div className="mt-6 flex items-center text-yellow-400 text-sm font-medium">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Collect NFTs
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card variant="gaming" hover="lift" className="group relative">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl w-fit shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300 group-hover:scale-110">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors">
                  Blockchain Security
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  Your content is secure and verifiable on the Somnia
                  blockchain. True ownership of your digital assets with
                  complete transparency.
                </p>
                <div className="mt-6 flex items-center text-green-400 text-sm font-medium">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Learn more
                </div>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card variant="gaming" hover="lift" className="group relative">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl w-fit shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/40 transition-all duration-300 group-hover:scale-110">
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-300 transition-colors">
                  Smart Discovery
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  Discover trending content and connect with gamers who share
                  your interests through AI-powered recommendations.
                </p>
                <div className="mt-6 flex items-center text-pink-400 text-sm font-medium">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Explore content
                </div>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card variant="gaming" hover="lift" className="group relative">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl w-fit shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-110">
                    <Globe className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">
                  Decentralized Storage
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  Share images, videos, and stories with IPFS-powered
                  decentralized storage. Your content is preserved forever,
                  truly yours.
                </p>
                <div className="mt-6 flex items-center text-indigo-400 text-sm font-medium">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Store content
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Community Testimonials */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 backdrop-blur-sm mb-6">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                Community Love
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              What Gamers Are Saying
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative h-40 flex items-center justify-center">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={cn(
                    "absolute w-full transition-all duration-700",
                    currentTestimonial === index
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  )}
                >
                  <Card variant="glass" className="p-8 text-center">
                    <CardContent className="space-y-4">
                      <p className="text-xl text-gray-300 italic">
                        "{testimonial.text}"
                      </p>
                      <div className="space-y-1">
                        <p className="font-bold text-white">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-gray-400">
                          {testimonial.game}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    currentTestimonial === index
                      ? "bg-green-400 scale-125"
                      : "bg-gray-600 hover:bg-gray-500"
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Call to Action Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/30 to-pink-900/20" />

          <div className="container mx-auto px-4 py-24 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30 backdrop-blur-sm">
                  <Rocket className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-300">
                    Ready to Level Up?
                  </span>
                  <Sparkles className="h-5 w-5 text-orange-400" />
                </div>

                {/* Main CTA Content */}
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                    Join the Gaming
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {" "}
                      Revolution
                    </span>
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Be part of the first Web3 social platform built specifically
                    for the gaming community. Connect, earn, and achieve on
                    Somnia's ultra-fast blockchain.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <div className="flex-shrink-0">
                    <WalletSelector onConnect={onConnect} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="gradientOutline"
                      size="lg"
                      className="min-w-[160px] group"
                    >
                      <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Watch Demo
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="min-w-[160px] group"
                    >
                      <MessageSquare className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Join Discord
                    </Button>
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50">
                    <Gift className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-gray-300 font-medium">
                      Free to join
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50">
                    <Zap className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-gray-300 font-medium">
                      No gas fees for basics
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50">
                    <Shield className="h-5 w-5 text-purple-400" />
                    <span className="text-sm text-gray-300 font-medium">
                      100% decentralized
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="border-t border-slate-700/30 bg-slate-950/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-16">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {/* Brand Section */}
              <div className="space-y-4">
                <Logo size="lg" href="#" className="text-white" />
                <p className="text-gray-400 text-sm leading-relaxed">
                  The ultimate Web3 gaming social platform. Connect, earn, and
                  achieve with the global gaming community.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span>Built on Somnia Network</span>
                </div>
              </div>

              {/* Product Links */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Achievements
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      SOMI Rewards
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      NFT Marketplace
                    </a>
                  </li>
                </ul>
              </div>

              {/* Community Links */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Community</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Discord
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Reddit
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Telegram
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support Links */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Support</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Bug Reports
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-slate-700/30 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-400 text-sm">
                  © 2024 Zapp - The Ultimate Web3 Gaming Social Platform. All
                  rights reserved.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs">
                      Somnia Network Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
