"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToastHelpers } from "@/components/ui/Toast";
import { switchToSomniaNetwork } from "@/lib/web3";
import { Plus, ExternalLink, Loader2 } from "lucide-react";

interface AddNetworkButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg";
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function AddNetworkButton({
  variant = "outline",
  size = "sm",
  showIcon = true,
  className,
  children,
}: AddNetworkButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { success, error } = useToastHelpers();

  const handleAddNetwork = async () => {
    setIsAdding(true);

    try {
      const result = await switchToSomniaNetwork(true); // Add testnet by default

      if (result) {
        success(
          "Network Added Successfully!",
          "Somnia Testnet has been added to your wallet"
        );
      } else {
        throw new Error("Failed to add network - wallet not available");
      }
    } catch (err: any) {
      console.error("Failed to add network:", err);

      if (err.code === 4001) {
        error("Request Rejected", "You rejected the network addition request");
      } else if (err.code === -32002) {
        error(
          "Request Pending",
          "Please check your wallet for pending requests"
        );
      } else {
        error(
          "Failed to Add Network",
          "Please add Somnia Testnet manually to your wallet"
        );
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddNetwork}
      disabled={isAdding}
      variant={variant}
      size={size}
      className={className}
    >
      {isAdding ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : showIcon ? (
        <Plus className="h-4 w-4 mr-2" />
      ) : null}
      {children || (isAdding ? "Adding Network..." : "Add to MetaMask")}
    </Button>
  );
}

interface NetworkInfoCardProps {
  className?: string;
}

export function NetworkInfoCard({ className }: NetworkInfoCardProps) {
  return (
    <div
      className={`p-4 bg-background-elevated rounded-lg border border-border-primary space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          Somnia Testnet
        </h3>
        <AddNetworkButton />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-text-tertiary">Chain ID</div>
          <div className="text-text-primary font-mono">50312 (0xc488)</div>
        </div>

        <div>
          <div className="text-text-tertiary">Currency</div>
          <div className="text-text-primary font-medium">STT</div>
        </div>

        <div className="col-span-2">
          <div className="text-text-tertiary">RPC URL</div>
          <div className="text-text-primary font-mono text-xs break-all">
            https://dream-rpc.somnia.network/
          </div>
        </div>

        <div className="col-span-2">
          <div className="text-text-tertiary">Block Explorer</div>
          <a
            href="https://shannon-explorer.somnia.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 font-mono text-xs flex items-center gap-1"
          >
            https://shannon-explorer.somnia.network/
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="pt-3 border-t border-border-secondary">
        <p className="text-xs text-text-tertiary">
          Add this network to your wallet to interact with Somnia testnet
        </p>
      </div>
    </div>
  );
}
