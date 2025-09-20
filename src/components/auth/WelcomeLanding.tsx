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
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  Activity,
  ChevronDown,
  Plus,
  Minus,
  Star,
  CheckCircle,
  Globe,
  Lock,
  Rocket,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";

interface WelcomeLandingProps {
  onConnect?: () => void;
}

export function WelcomeLanding({ onConnect }: WelcomeLandingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [floatingElements, setFloatingElements] = useState<Array<{x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    setIsVisible(true);

    // Generate floating elements
    const elements = Array.from({ length: 12 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setFloatingElements(elements);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 5000);

    return () => {
      clearInterval(testimonialInterval);
    };
  }, []);

  const features = [
    {
      title: "Gaming Social Hub",
      icon: Gamepad2,
      color: "from-blue-600 to-cyan-500",
      gradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
      description: "Connect with millions of gamers, share epic moments, and build your gaming legacy",
      stats: "2M+ Gamers",
    },
    {
      title: "Earn SOMI Tokens",
      icon: Coins,
      color: "from-yellow-500 to-orange-500",
      gradient: "bg-gradient-to-br from-yellow-500/20 to-orange-500/20",
      description: "Get rewarded for creating content, engaging with community, and achieving milestones",
      stats: "$1M+ Earned",
    },
    {
      title: "NFT Achievements",
      icon: Trophy,
      color: "from-purple-600 to-pink-500",
      gradient: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
      description: "Collect unique NFT badges for your gaming achievements and showcase your skills",
      stats: "50K+ NFTs",
    },
    {
      title: "Secure & Fast",
      icon: Shield,
      color: "from-emerald-600 to-green-500",
      gradient: "bg-gradient-to-br from-emerald-500/20 to-green-500/20",
      description: "Built on Somnia's lightning-fast blockchain with enterprise-grade security",
      stats: "1M+ TPS",
    },
  ];

  const testimonials = [
    {
      text: "Zapp revolutionized my gaming experience. Earning SOMI while playing is incredible!",
      author: "CryptoApe",
      role: "NFT Collector • 2.5K SOMI Earned",
      avatar: "https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149622021.jpg?semt=ais_incoming&w=740&q=80",
      rating: 5,
    },
    {
      text: "Best gaming platform ever! My NFT collection grew from 0 to 50+ in just 3 months.",
      author: "CoolCat_Gamer",
      role: "Pro Streamer • Top 100 Player",
      avatar: "https://www.expresschroma.com/wp-content/uploads/2021/11/cool-cats.webp",
      rating: 5,
    },
    {
      text: "The community is amazing and rewards are instant. Made $500+ just by being active!",
      author: "PixelMaster",
      role: "Content Creator • 50K Followers",
      avatar: "https://i.pinimg.com/736x/9b/bf/7b/9bbf7b7765d1c7f0d01c59bb4264aaf2.jpg",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "What makes Zapp different from other gaming platforms?",
      answer: "Zapp is the first Web3 gaming social platform that actually rewards you for your gaming achievements. Built on Somnia's ultra-fast blockchain, you earn real crypto (SOMI) for content creation, community engagement, and collecting NFT achievement badges.",
    },
    {
      question: "How do I start earning SOMI tokens?",
      answer: "Simply connect your wallet, complete your profile, and start sharing your gaming moments! You earn SOMI through posting content, getting likes/comments, completing achievement challenges, and participating in community events. The more active you are, the more you earn.",
    },
    {
      question: "Are there any fees I need to worry about?",
      answer: "Most features are completely free! Thanks to Somnia's advanced technology, basic actions like posting, commenting, and earning rewards have zero gas fees. Only premium features like NFT minting have minimal fees (<$0.01).",
    },
    {
      question: "What are NFT achievement badges?",
      answer: "These are unique digital collectibles you earn for reaching gaming milestones - like getting your first win streak, reaching a new rank, or completing special challenges. Each NFT is verifiably yours and can be traded or showcased in your profile.",
    },
    {
      question: "Is my gaming data and content secure?",
      answer: "Absolutely! Your content is stored on IPFS (decentralized storage) and secured by blockchain technology. You have true ownership of your data, and it can never be deleted or censored by any central authority.",
    },
    {
      question: "How do I get started today?",
      answer: "Just click 'Connect Wallet' above! We support all major wallets like MetaMask, Coinbase Wallet, and WalletConnect. Once connected, you can immediately start exploring, posting, and earning. No waiting periods or complex setup required.",
    },
  ];

  const stats = [
    { label: "Active Gamers", value: "2.1M+", icon: Users },
    { label: "SOMI Distributed", value: "$5.2M", icon: Coins },
    { label: "NFTs Minted", value: "89K+", icon: Trophy },
    { label: "Gaming Sessions", value: "12M+", icon: Play },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Simplified Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,93,250,0.05),transparent_70%)]" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="backdrop-blur-xl  sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo size="lg" href="#" className="text-white" />
              
              </div>
              <div className="hidden md:flex items-center gap-6 text-sm">
                <a href="#features" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Features</a>
                <a href="#community" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Community</a>
                <a href="#faq" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">FAQ</a>
                <Button variant="gaming" size="sm" className="animate-pulse">
                  Launch App
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Simplified */}
        <section className="min-h-screen flex items-center justify-center relative px-4 py-20">
          <div
            className={cn(
              "text-center space-y-12 max-w-4xl mx-auto transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm text-green-300">Join 2M+ Active Streamers</span>
            </div>

            {/* Main Title */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="text-white">Stream.</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Earn.</span>
                <br />
                <span className="text-white">Own.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                The Web3 platform where your streaming achievements actually pay you.
                <br />
                <span className="text-purple-400 font-medium">Earn SOMI tokens and collect NFTs.</span>
              </p>
            </div>

            {/* CTA Section */}
            <div className="space-y-8">
              <div className="max-w-lg mx-auto">
                <WalletSelector onConnect={onConnect} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button variant="gaming" size="lg" className="min-w-[200px]">
                  <Play className="h-5 w-5 mr-2" />
                  Start Streaming
                </Button>
                <Button variant="outline" size="lg" className="min-w-[200px] text-gray-300 border-gray-600">
                  <Eye className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span>Instant rewards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-400" />
                  <span>Secure blockchain</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-blue-950/30 to-purple-950/30 backdrop-blur-sm border-y border-white/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center group hover:scale-110 transition-all duration-300">
                    <div className="mb-3">
                      <Icon className="h-8 w-8 text-blue-400 mx-auto group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gradient-to-b from-transparent to-slate-950/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm mb-6">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Why Choose Zapp</span>
              </div>
              <h2 className="text-5xl font-bold text-white mb-6">
                Gaming Meets
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Web3</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                We've built the missing bridge between your gaming skills and real-world value.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="group relative overflow-hidden bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105">
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", feature.gradient)} />
                    <CardContent className="p-8 relative">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={cn("p-3 rounded-xl bg-gradient-to-r", feature.color)}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                            <span className="text-sm text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                              {feature.stats}
                            </span>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-purple-400 text-sm font-medium group-hover:text-white transition-colors">
                        <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                        Explore feature
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-900/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 backdrop-blur-sm mb-6">
                <Heart className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Loved by Gamers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Real Gamers, Real Rewards</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">See how our community is earning and thriving on Zapp</p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <Card
                    key={index}
                    className="group bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-xl border border-white/10 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                  >
                    <CardContent className="p-6">
                      {/* Avatar and Rating */}
                      <div className="flex flex-col items-center mb-6">
                        <div className="relative mb-4">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.author}
                            className="w-20 h-20 rounded-2xl border-3 border-purple-400 shadow-lg group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face&auto=format";
                            }}
                          />
                          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            ✓
                          </div>
                        </div>
                        <div className="flex gap-1 mb-3">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>

                      {/* Testimonial Text */}
                      <div className="text-center mb-6">
                        <p className="text-gray-200 leading-relaxed mb-4 italic">
                          "{testimonial.text}"
                        </p>
                      </div>

                      {/* Author Info */}
                      <div className="border-t border-white/10 pt-4 text-center">
                        <h4 className="font-bold text-white text-lg mb-1">{testimonial.author}</h4>
                        <p className="text-purple-400 text-sm font-medium">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30 backdrop-blur-sm mb-6">
                <MessageCircle className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Got Questions?</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Know</h2>
              <p className="text-xl text-gray-300">Quick answers to help you get started</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors group"
                  >
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">{faq.question}</h3>
                    <div className={cn("transition-transform duration-300", openFAQ === index ? "rotate-45" : "")}>
                      {openFAQ === index ? (
                        <Minus className="h-5 w-5 text-purple-400" />
                      ) : (
                        <Plus className="h-5 w-5 text-purple-400" />
                      )}
                    </div>
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-950/40 via-blue-950/40 to-black/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,93,250,0.1),transparent_70%)]" />
          <div className="container mx-auto px-4 text-center relative">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30 backdrop-blur-sm animate-pulse">
                <Rocket className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Ready to Level Up?</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Your Gaming Journey
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Starts Now
                </span>
              </h2>

              <p className="text-xl text-gray-300 leading-relaxed">
                Join thousands of gamers earning real rewards. No waiting, no complex setup.
                <br />
                <span className="text-purple-400 font-semibold">Connect wallet → Start earning → Build legacy</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <div className="w-full max-w-2xl">
                  <WalletSelector onConnect={onConnect} />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black border-t border-white/10">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-4">
                <Logo size="lg" href="#" className="text-white" />
                <p className="text-gray-400 text-sm leading-relaxed">
                  The Web3 gaming social platform where your skills pay the bills.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400">Somnia Network • Live</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-semibold">Platform</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="text-gray-400 hover:text-purple-400 transition-colors">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">SOMI Token</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">NFT Collection</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Leaderboards</a></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-semibold">Community</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Discord</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Twitter</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Telegram</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Reddit</a></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-semibold">Support</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#faq" className="text-gray-400 hover:text-purple-400 transition-colors">FAQ</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Contact</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Bug Reports</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-400 text-sm">© 2025 Zapp. Built for gamers, by a gamer.</p>
                <div className="flex items-center gap-4 text-sm">
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Privacy</a>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Terms</a>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Cookies</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}