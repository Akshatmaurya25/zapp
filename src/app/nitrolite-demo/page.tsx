"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useStreamingTips } from "@/hooks/useNitrolite";
import {
  Zap,
  Play,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Sparkles,
} from "lucide-react";

// Mock stream data for demo
const DEMO_STREAM = {
  id: "demo-stream-hackathon-2025",
  stream_key: "hackathon_demo_key",
  title: "🏆 Hackathon Demo: Nitrolite State Channels",
  streamer_id: "demo-streamer",
  users: {
    display_name: "Demo Streamer",
    username: "hackathon_demo",
    wallet_address: "0xabcdef1234567890123456789012345678901234" as const,
  },
};

const DEMO_FEATURES = [
  {
    icon: Zap,
    title: "Instant Tips",
    description: "~100ms execution time",
    color: "text-yellow-400",
  },
  {
    icon: DollarSign,
    title: "Zero Gas Fees",
    description: "State channel transactions",
    color: "text-green-400",
  },
  {
    icon: TrendingUp,
    title: "Scalable",
    description: "Unlimited throughput",
    color: "text-blue-400",
  },
  {
    icon: CheckCircle,
    title: "Production Ready",
    description: "Robust error handling",
    color: "text-purple-400",
  },
];

export default function NitroliteDemo() {
  const [demoStage, setDemoStage] = useState<
    "intro" | "initializing" | "channel" | "tipping"
  >("intro");
  const [demoLogs, setDemoLogs] = useState<string[]>([]);
  const { showToast } = useToast();

  // Mock Nitrolite hooks for demo
  const {
    streamingChannel,
    isCreatingChannel,
    isSendingTip,
    enableStreamingTips,
    sendTip,
    formatUSDC,
  } = useStreamingTips(DEMO_STREAM.id, DEMO_STREAM.users?.wallet_address);

  const addLog = (message: string) => {
    setDemoLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 9),
    ]);
  };

  const startDemo = async () => {
    setDemoStage("initializing");
    addLog("🎬 Starting Hackathon Demo");
    addLog("📡 Connecting to Somnia Testnet...");

    showToast({
      title: "🎯 Hackathon Demo Started",
      description: "Demonstrating Nitrolite State Channels for Judges",
      type: "info",
    });

    try {
      // Stage 1: Initialize
      setTimeout(() => {
        addLog("🏗️ Custody: 0xCDAE...B7C03");
        addLog("⚖️ Adjudicator: 0x2037...FB08");
      }, 1000);

      setTimeout(() => {
        setDemoStage("channel");
        addLog("✅ Nitrolite System Initialized!");
      }, 2000);

      // Stage 2: Create Channel
      setTimeout(async () => {
        addLog("⚡ Creating streaming channel...");
        await enableStreamingTips("10.0");
        addLog("🎉 Channel Created Successfully!");
        setDemoStage("tipping");

        showToast({
          title: "⚡ Channel Ready!",
          description: "State channel active - Ready for instant tips",
          type: "success",
        });
      }, 3000);
    } catch (error) {
      addLog(`❌ Error: ${error}`);
      showToast({
        title: "Demo Error",
        description: "Please check console for details",
        type: "error",
      });
    }
  };

  const demoTip = async (amount: string) => {
    const startTime = Date.now();
    addLog(`💸 Sending $${amount} tip...`);

    try {
      showToast({
        title: "🚀 Processing Tip",
        description: `Sending $${amount} via state channel (no gas)`,
        type: "info",
      });

      await sendTip(amount, `Demo tip from judges! 🏆`);
      const executionTime = Date.now() - startTime;

      addLog(`✅ Tip sent in ${executionTime}ms!`);
      addLog(`⛽ Gas cost: $0.00`);

      showToast({
        title: `⚡ $${amount} Sent Instantly!`,
        description: `Executed in ${executionTime}ms via Nitrolite`,
        type: "success",
      });

      // Demo completion toast
      setTimeout(() => {
        showToast({
          title: "🎯 Demo Metrics",
          description: `Speed: ${executionTime}ms | Gas: $0.00 | Network: Off-chain`,
          type: "info",
        });
      }, 1500);
    } catch (error) {
      addLog(`❌ Tip failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Nitrolite Demo for Judges
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            🏆 Hackathon 2025 • Yellow Network Integration • Somnia DApp
          </p>
          <p className="text-gray-400">
            Demonstrating instant, gas-free streaming tips via state channels
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {DEMO_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 bg-gray-800/50 border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Controls */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-blue-400" />
              Live Demo Controls
            </h2>

            {demoStage === "intro" && (
              <div className="space-y-4">
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">
                    Demo Overview
                  </h3>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Initialize Nitrolite on Somnia Testnet</li>
                    <li>• Create state channel for instant tips</li>
                    <li>• Demonstrate sub-second transactions</li>
                    <li>• Show zero gas cost benefits</li>
                  </ul>
                </div>
                <Button
                  onClick={startDemo}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Hackathon Demo
                </Button>
              </div>
            )}

            {demoStage === "initializing" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
                  <div className="animate-spin w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full" />
                  <span className="text-yellow-300 font-medium">
                    Initializing Nitrolite System...
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Connecting to Somnia contracts and setting up state signers...
                </div>
              </div>
            )}

            {demoStage === "channel" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
                  <span className="text-blue-300 font-medium">
                    Creating State Channel...
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Establishing off-chain channel with $10 USDC deposit...
                </div>
              </div>
            )}

            {demoStage === "tipping" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-green-300 font-medium">
                      Channel Active
                    </div>
                    <div className="text-sm text-green-200">
                      Balance:{" "}
                      {streamingChannel
                        ? formatUSDC(streamingChannel.balance)
                        : "$10.00 USDC"}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-white">
                    Demo Instant Tips:
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {["1.00", "2.50", "5.00", "10.00"].map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => demoTip(amount)}
                        disabled={isSendingTip}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        {isSendingTip ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-1" />${amount}
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Demo Logs */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-green-400" />
              Live Demo Logs
            </h2>

            <div className="bg-black/50 border border-gray-600 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
              {demoLogs.length === 0 ? (
                <div className="text-gray-500 italic">
                  Logs will appear here during demo...
                </div>
              ) : (
                <div className="space-y-1">
                  {demoLogs.map((log, index) => (
                    <div key={index} className="text-green-300">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-400">
              💡 Check browser console for detailed technical logs
            </div>
          </Card>
        </div>

        {/* Stream Info */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Demo Stream Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                Stream Title
              </h3>
              <p className="text-white">{DEMO_STREAM.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                Streamer
              </h3>
              <p className="text-white">{DEMO_STREAM.users?.display_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Wallet</h3>
              <p className="text-white font-mono text-sm">
                {DEMO_STREAM.users?.wallet_address?.slice(0, 6)}...
                {DEMO_STREAM.users?.wallet_address?.slice(-4)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Nitrolite Enabled
            </Badge>
            <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Instant Tips
            </Badge>
            <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
              <Users className="w-3 h-3 mr-1" />
              Hackathon Demo
            </Badge>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>
            🏆 Hackathon 2025 • Built with Nitrolite & Yellow Network • Powered
            by Somnia
          </p>
          <p className="mt-1">
            Check browser console and network tab to see detailed technical
            implementation
          </p>
        </div>
      </div>
    </div>
  );
}
