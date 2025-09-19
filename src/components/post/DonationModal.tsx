"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/useToast";
import { formatAddress } from "@/lib/web3";
import { formatIPFSUrl } from "@/lib/utils";
import {
  Coins,
  Gift,
  Heart,
  Star,
  User,
  Wallet,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";
import { Post } from "@/types";

interface DonationModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function DonationModal({ post, isOpen, onClose }: DonationModalProps) {
  const [donationAmount, setDonationAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { address, sendTransaction } = useWallet();
  const { toast } = useToast();

  const predefinedAmounts = ["0.01", "0.05", "0.1", "0.5", "1.0"];

  const handleDonate = async () => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to send a tip",
        variant: "destructive",
      });
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }

    // Check if we have the recipient's wallet address
    if (!post.user?.wallet_address) {
      toast({
        title: "Cannot send tip",
        description: "Recipient wallet address not available",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Convert amount to Wei (18 decimal places for Somnia network)
      const amountInWei = BigInt(Math.floor(parseFloat(donationAmount) * 1e18));

      console.log('Sending tip:', {
        to: post.user.wallet_address,
        amount: donationAmount,
        amountInWei: amountInWei.toString()
      });

      // Send the transaction
      const result = await sendTransaction({
        to: post.user.wallet_address as `0x${string}`,
        value: amountInWei,
      });

      console.log('Transaction result:', result);

      // Record the donation in the database
      try {
        await recordDonation({
          postId: post.id,
          fromUserId: address,
          toUserId: post.user_id,
          amount: donationAmount,
          message: message,
          transactionHash: result.hash || 'pending'
        });
      } catch (dbError) {
        console.warn('Failed to record donation in database:', dbError);
        // Don't fail the whole process if database recording fails
      }

      toast({
        title: "Tip sent!",
        description: `Successfully tipped ${donationAmount} SOMI to ${post.user?.display_name}`,
        variant: "default",
      });

      onClose();
      setDonationAmount("");
      setMessage("");
    } catch (error) {
      console.error("Donation failed:", error);

      let errorMessage = "Please try again";
      if (error instanceof Error) {
        if (error.message.includes('rejected')) {
          errorMessage = "Transaction was cancelled";
        } else if (error.message.includes('insufficient')) {
          errorMessage = "Insufficient balance for this transaction";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Donation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const recordDonation = async (donationData: {
    postId: string;
    fromUserId: string;
    toUserId: string;
    amount: string;
    message: string;
    transactionHash: string;
  }) => {
    const response = await fetch("/api/donations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(donationData),
    });

    if (!response.ok) {
      throw new Error("Failed to record donation");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Coins className="h-5 w-5 text-yellow-500" />
            </div>
            Send a Tip
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg">
            <Avatar
              src={formatIPFSUrl(post.user?.avatar_ipfs)}
              alt={post.user?.display_name || "User"}
              fallbackText={post.user?.display_name || post.user?.username || "U"}
              identifier={post.user?.id || post.user?.username || undefined}
              className="h-10 w-10"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-200">
                  {post.user?.display_name || "Anonymous"}
                </span>
                {post.user?.is_verified && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-400">
                @{post.user?.username}
              </div>
            </div>
          </div>

          {/* Quick Amount Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">
              Select Amount (SOMI)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDonationAmount(amount)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    donationAmount === amount
                      ? "border-yellow-500 bg-yellow-500/20 text-yellow-300"
                      : "border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Custom Amount (SOMI)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="bg-gray-800 border-gray-600"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Message (Optional)
            </label>
            <textarea
              placeholder="Say something nice to the creator..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg resize-none text-gray-200 placeholder-gray-400"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 text-right">
              {message.length}/200
            </div>
          </div>

          {/* Wallet Info */}
          {address && (
            <div className="flex items-center gap-2 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
              <Wallet className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300">
                From: {formatAddress(address, 6)}
              </span>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-orange-900/20 border border-orange-500/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-300">
              <div className="font-medium mb-1">Transaction Note</div>
              <div className="text-xs text-orange-400">
                This will send SOMI tokens directly to the creator's wallet on
                the Somnia network. Make sure you have enough balance to cover
                the tip and gas fees.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDonate}
              disabled={
                !donationAmount ||
                parseFloat(donationAmount) <= 0 ||
                isProcessing
              }
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Send Tip
                </div>
              )}
            </Button>
          </div>

          {/* Success Message */}
          {isProcessing && (
            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-300">
                Processing your tip on the Somnia network...
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
