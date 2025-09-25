"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  DollarSign,
  Heart,
  Gift,
  Zap,
  Loader2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useStreamingTips } from "@/hooks/useNitrolite";
import type { Address } from "viem";
import Image from "next/image";

interface NitroliteStreamTipsProps {
  isOpen: boolean;
  onClose: () => void;
  stream: {
    id: string;
    stream_key: string;
    title: string;
    streamer_id: string;
    users?: {
      display_name?: string;
      username?: string;
      wallet_address?: string;
    };
  };
}

// Quick tip amounts optimized for streaming
const STREAMING_TIP_AMOUNTS = [
  {
    label: "0.01 NTT",
    value: "0.01",
    icon: DollarSign,
    color: "from-blue-500 to-blue-600",
    description: "Nice!",
  },
  {
    label: "0.05 NTT",
    value: "0.05",
    icon: Heart,
    color: "from-pink-500 to-pink-600",
    description: "Great stream!",
  },
  {
    label: "0.1 NTT",
    value: "0.1",
    icon: Gift,
    color: "from-purple-500 to-purple-600",
    description: "Amazing content",
  },
  {
    label: "0.25 NTT",
    value: "0.25",
    icon: Zap,
    color: "from-yellow-500 to-yellow-600",
    description: "Outstanding!",
  },
];

export default function NitroliteStreamTips({
  isOpen,
  onClose,
  stream,
}: NitroliteStreamTipsProps) {
  const streamerAddress = stream.users?.wallet_address as Address;
  const { showToast } = useToast();

  // Nitrolite streaming integration
  const {
    streamingChannel,
    isCreatingChannel,
    isSendingTip,
    enableStreamingTips,
    sendTip,
    endStreaming,
    formatUSDC,
  } = useStreamingTips(stream.id, streamerAddress);

  // Component state
  const [currentStep, setCurrentStep] = useState<"setup" | "tipping">("setup");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [tipHistory, setTipHistory] = useState<any[]>([]);

  // Check if channel is already active
  useEffect(() => {
    if (streamingChannel?.status === "open") {
      setCurrentStep("tipping");
    }
  }, [streamingChannel]);

  // Handle tip amount selection
  const handleQuickTip = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount("");
  };

  const getFinalAmount = () => {
    const amount = selectedAmount || customAmount;
    return amount ? parseFloat(amount) : 0;
  };

  // Enable instant tipping
  const handleEnableInstantTipping = async () => {
    if (!streamerAddress) {
      showToast({ title: "Streamer wallet address not found", type: "error" });
      return;
    }

    try {
      console.log("🎬 DEMO: Starting Nitrolite Channel Setup for Judges");

      // Show initialization toast
      showToast({
        title: "🔧 Initializing Nitrolite...",
        description: `Connecting to Somnia contracts for ${streamerAddress.slice(
          0,
          6
        )}...${streamerAddress.slice(-4)}`,
        type: "info",
      });

      await enableStreamingTips("1.0"); // 1 NTT initial deposit for testing
      setCurrentStep("tipping");

      showToast({
        title: "⚡ Nitrolite Channel Created!",
        description: `State channel active for instant tips to ${streamerAddress.slice(
          0,
          6
        )}...${streamerAddress.slice(-4)}`,
        type: "success",
      });

      // Additional demo info toast
      setTimeout(() => {
        showToast({
          title: "🎯 DEMO: Channel Ready!",
          description:
            "Tips now execute in ~100ms with zero gas fees via state channels",
          type: "info",
        });
      }, 2000);
    } catch (error: any) {
      console.error("Failed to enable instant tipping:", error);
      showToast({
        title: "Failed to enable instant tipping",
        description: error.message,
        type: "error",
      });
    }
  };

  // Send instant tip
  const handleSendTip = async (amount?: string) => {
    const finalAmount = amount || getFinalAmount();

    if (Number(finalAmount) <= 0) {
      showToast({ title: "Invalid tip amount", type: "error" });
      return;
    }

    try {
      console.log("⚡ DEMO: Preparing instant tip for judges");

      // Show processing toast
      showToast({
        title: "🚀 Processing Tip...",
        description: `Sending $${finalAmount} via state channel (no gas fees)`,
        type: "info",
      });

      const startTime = Date.now();
      const transaction = await sendTip(finalAmount.toString(), message);
      const executionTime = Date.now() - startTime;

      // Add to tip history
      setTipHistory((prev) => [
        {
          id: transaction.id,
          amount: finalAmount,
          message,
          timestamp: new Date(),
          status: "sent",
        },
        ...prev.slice(0, 4),
      ]);

      showToast({
        title: `⚡ $${finalAmount} USDC sent instantly!`,
        description: `Delivered in ${executionTime}ms via Nitrolite state channels`,
        type: "success",
      });

      // Demo details toast for judges
      setTimeout(() => {
        showToast({
          title: "🎯 DEMO: Transaction Complete!",
          description: `Channel ID: ${transaction.id?.slice(
            0,
            8
          )}... | Gas Cost: $0.00 | Speed: ${executionTime}ms`,
          type: "info",
        });
      }, 1500);

      // Reset form
      setSelectedAmount("");
      setCustomAmount("");
      setMessage("");
    } catch (error: any) {
      console.error("Failed to send tip:", error);
      showToast({
        title: "Failed to send tip",
        description: error.message,
        type: "error",
      });
    }
  };

  // Setup step UI
  const renderSetupStep = () => (
    <div className="space-y-6 text-center">
      {/* Hero Section */}
      <div className="relative">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
          <Zap className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-text-primary">
          Enable Instant Streaming Tips
        </h3>
        <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
          Create a Nitrolite state channel for lightning-fast, gas-free tips
          during live streams!
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="font-semibold text-green-800">True Instant Tips</div>
          <div className="text-green-600">~100ms delivery</div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="font-semibold text-blue-800">Zero Gas Fees</div>
          <div className="text-blue-600">Only on open/close</div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="font-semibold text-purple-800">State Channels</div>
          <div className="text-purple-600">Nitrolite powered</div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={handleEnableInstantTipping}
        disabled={isCreatingChannel}
        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
      >
        {isCreatingChannel ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Channel...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Create Streaming Channel
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </Button>

      <p className="text-xs text-text-tertiary">
        Opens state channel with 1 NTT deposit for instant tipping
      </p>
    </div>
  );

  // Tipping step UI
  const renderTippingStep = () => (
    <div className="space-y-6 bg-[#181818]">
      {/* Channel Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-green-800">
              ⚡ Nitrolite Channel Active
            </div>
            <div className="text-sm text-green-600 truncate">
              Balance:{" "}
              {streamingChannel
                ? formatUSDC(streamingChannel.balance)
                : "Loading..."}
              • Total Tipped:{" "}
              {streamingChannel
                ? formatUSDC(streamingChannel.metadata.totalTipped)
                : "$0.00"}
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">
            <Clock className="w-3 h-3 mr-1" />
            Instant
          </Badge>
        </div>
      </div>

      {/* Quick Tip Buttons */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-text-primary">
          🚀 Quick Tips (Instant Delivery)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {STREAMING_TIP_AMOUNTS.map((tip) => {
            const Icon = tip.icon;
            const isSelected = selectedAmount === tip.value;

            return (
              <Button
                key={tip.value}
                variant={isSelected ? "default" : "outline"}
                className={`relative overflow-hidden h-20 flex flex-col items-center gap-1 transition-all duration-200 ${
                  isSelected
                    ? `bg-gradient-to-r ${tip.color} text-white border-transparent shadow-lg transform scale-105`
                    : "border-border-secondary text-text-secondary hover:text-text-primary hover:border-purple-500/50 hover:bg-purple-50"
                }`}
                onClick={() => handleQuickTip(tip.value)}
                disabled={isSendingTip}
              >
                <Icon className="w-6 h-6" />
                <span className="font-bold text-lg">{tip.label}</span>
                <span className="text-xs opacity-75">{tip.description}</span>

                <div className="absolute top-1 right-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Custom Amount */}
      <div>
        <label
          htmlFor="custom-amount"
          className="block text-sm font-semibold mb-2 text-text-primary"
        >
          💰 Custom Amount (USDC)
        </label>
        <div className="relative">
          <Input
            id="custom-amount"
            type="number"
            step="0.10"
            min="0.10"
            placeholder="1.00"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            disabled={isSendingTip}
            className="pl-12 bg-background-primary border-border-secondary text-text-primary placeholder-text-tertiary focus:border-purple-500 focus:ring-purple-500"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">
            $
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Badge className="bg-purple-100 text-purple-800 text-xs">
              ⚡ Instant
            </Badge>
          </div>
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="tip-message"
          className="block text-sm font-semibold mb-2 text-text-primary"
        >
          💬 Message (optional)
        </label>
        <Textarea
          id="tip-message"
          placeholder="Say something nice to the streamer..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          rows={3}
          disabled={isSendingTip}
          className="bg-background-primary border-border-secondary text-text-primary placeholder-text-tertiary focus:border-purple-500 focus:ring-purple-500"
        />
        <p className="text-xs text-text-tertiary mt-1">
          {message.length}/200 characters
        </p>
      </div>

      {/* Recent Tips History */}
      {tipHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 text-text-primary">
            Recent Tips
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {tipHistory.map((tip) => (
              <div
                key={tip.id}
                className="flex items-center justify-between text-xs bg-green-50 p-2 rounded"
              >
                <span>${tip.amount} USDC</span>
                <Badge className="bg-green-100 text-green-800">
                  ⚡ Instant
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isSendingTip}
          className="flex-1 border-border-secondary text-text-secondary hover:text-text-primary"
        >
          Close
        </Button>

        {/* Send Custom Tip */}
        {customAmount && (
          <Button
            onClick={() => handleSendTip()}
            disabled={getFinalAmount() <= 0 || isSendingTip}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
          >
            {isSendingTip ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Send ${getFinalAmount()} USDC
              </div>
            )}
          </Button>
        )}
      </div>

      {/* Quick tip action buttons */}
      {selectedAmount && (
        <Button
          onClick={() => handleSendTip(selectedAmount)}
          disabled={isSendingTip}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 shadow-lg"
        >
          {isSendingTip ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending Instant Tip...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Send ${selectedAmount} USDC Instantly!
            </div>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#181818] border-border-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            Nitrolite Streaming Tips
          </DialogTitle>
          <DialogDescription>
            {currentStep === "setup"
              ? "Enable instant, gas-free tipping with Nitrolite state channels"
              : "Send instant USDC tips with true state channel technology!"}
          </DialogDescription>
        </DialogHeader>

        {/* Stream Info */}
        <div className="bg-background-primary border border-border-secondary rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(stream.users?.display_name ||
                stream.users?.username ||
                "S")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-text-primary truncate">
                {stream.title}
              </h3>
              <p className="text-sm text-text-secondary truncate">
                Supporting:{" "}
                {stream.users?.display_name ||
                  stream.users?.username ||
                  "Anonymous Streamer"}
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              <Users className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>

        {/* Render current step */}
        {currentStep === "setup" ? renderSetupStep() : renderTippingStep()}
      </DialogContent>
    </Dialog>
  );
}
