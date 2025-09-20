"use client";

import React, { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Wallet,
  AlertCircle,
  Loader2,
  CheckCircle,
  ExternalLink,
  Shield,
  Chrome,
  Star,
  ArrowRight,
} from "lucide-react";

interface WalletSelectorProps {
  onConnect?: () => void;
}
const   walletLogo= {
  walletConnect : 'https://res.cloudinary.com/dclgy29i5/image/upload/v1758378973/v2bifsexlgtzhfo3ree0.png',
  metamask: "https://res.cloudinary.com/dclgy29i5/image/upload/v1758379011/ssous8bwuozrxibpztjh.png",
  coinbase: "https://res.cloudinary.com/dclgy29i5/image/upload/v1758379043/quohwrkwszaucnmhpp0h.png"
}
export function WalletSelector({ onConnect }: WalletSelectorProps) {
  const {
    connectWallet,
    isConnecting,
    connectors,
    error,
    connectionRejected,
    resetConnectionState,
  } = useWallet();

  const [selectedConnector, setSelectedConnector] = useState<string | null>(
    null
  );

  const handleConnect = async (connectorId: string) => {
    setSelectedConnector(connectorId);
    try {
      await connectWallet(connectorId);
      onConnect?.();
    } catch (err) {
      console.error("Connection failed:", err);
      setSelectedConnector(null);
    }
  };

  const getWalletInfo = (connectorId: string, connectorName: string) => {
    const walletInfo: Record<
      string,
      {
        name: string;
        description: string;
        icon: React.ReactNode;
        supported: boolean;
        popular?: boolean;
        gradient?: string;
      }
    > = {
      "io.metamask": {
        name: "MetaMask",
        description: "Most popular Ethereum wallet",
        icon: (
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 40 40" className="w-6 h-6">
              <path fill="#fff" d="M32.5 5L20 13.5 22.5 7z" />
              <path fill="#fff" d="M7.5 5L20 13.5 17.5 7z" />
              <path fill="#fff" d="M28.5 29L23 35 32.5 35z" />
              <path fill="#fff" d="M11.5 29L17 35 7.5 35z" />
              <path fill="#fff" d="M20 15L15.5 22.5 24.5 22.5z" />
            </svg>
          </div>
        ),
        supported: true,
        popular: true,
        gradient: "from-orange-500 to-orange-600",
      },
      "com.coinbase.wallet": {
        name: "Coinbase Wallet",
        description: "Secure & trusted by millions",
        icon: (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 40 40" className="w-6 h-6">
              <circle cx="20" cy="20" r="15" fill="#fff" />
              <rect x="15" y="15" width="10" height="10" rx="2" fill="#0052FF" />
            </svg>
          </div>
        ),
        supported: true,
        gradient: "from-blue-600 to-blue-700",
      },
      walletconnect: {
        name: "WalletConnect",
        description: "Connect 300+ mobile wallets",
        icon: (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 40 40" className="w-6 h-6">
              <path fill="#fff" d="M12 18c6-6 16-6 22 0l1-1c-7-7-17-7-24 0z" />
              <path fill="#fff" d="M8 22c8-8 20-8 28 0l1-1c-9-9-21-9-30 0z" />
              <circle cx="20" cy="28" r="3" fill="#fff" />
            </svg>
          </div>
        ),
        supported: true,
        gradient: "from-purple-600 to-purple-700",
      },
      injected: {
        name: "Browser Wallet",
        description: "Any installed wallet extension",
        icon: (
          <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Chrome className="w-6 h-6 text-white" />
          </div>
        ),
        supported: true,
        gradient: "from-gray-600 to-gray-700",
      },
    };

    return (
      walletInfo[connectorId] || {
        name: connectorName,
        description: "Connect wallet",
        icon: <Wallet className="w-6 h-6 text-gray-400" />,
        supported: false,
      }
    );
  };

  if (connectionRejected) {
    return (
      <div className="max-w-sm mx-auto">
        <Card className="border-orange-500/30 bg-orange-900/20">
          <CardContent className="p-6 text-center">
            <Shield className="h-10 w-10 text-orange-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Wallet Connection Required
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Connect your wallet to start using Zapp
            </p>
            <Button
              onClick={resetConnectionState}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="sm"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Choose Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Floating Background Elements */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-3xl blur-2xl animate-pulse" />

        <Card className="relative bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 backdrop-blur-3xl border border-white/20 shadow-2xl shadow-purple-500/20 overflow-hidden">
          {/* Animated Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardHeader className="text-center pb-8 relative">
            {/* Header Background Glow */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />

            <div className="relative space-y-4">
              {/* Animated Wallet Icon */}
              <div className="flex justify-center">
                <div className="relative group">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110">
                    <img 
                      src={walletLogo.walletConnect} 
                      alt="Wallet" 
                      className="h-10 w-10 object-contain"
                    />
                    </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Connect Your Wallet
                </CardTitle>
                <p className="text-gray-400 text-base">
                  Join the Web3 gaming revolution • Start earning
                  <span className="text-purple-400 font-semibold"> SOMI</span> instantly
                </p>
              </div>

              {/* Stats Preview */}
             
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-0 relative">
            {/* Popular Wallets Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full" />
                <h3 className="text-white font-semibold text-lg">Choose Your Wallet</h3>
              </div>

              <div className="grid gap-4">
                {connectors
                  .filter(
                    (connector) =>
                      connector.id !== "app.phantom" &&
                      !connector.name.toLowerCase().includes("phantom")
                  )
                  .slice(0, 3)
                  .map((connector, index) => {
                    const walletInfo = getWalletInfo(connector.id, connector.name);
                    const isSelected = selectedConnector === connector.id;
                    const isConnectingWallet = isConnecting && isSelected;

                    return (
                      <div key={connector.id} className="relative group">
                        {/* Hover Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg" />

                        <button
                          onClick={() => !isConnecting && handleConnect(connector.id)}
                          disabled={isConnecting}
                          className={`
                            relative w-full p-6 rounded-2xl border transition-all duration-500
                            ${isSelected
                              ? "border-purple-400/60 bg-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-xl shadow-purple-500/25"
                              : "border-white/10 bg-gradient-to-r from-white/5 to-white/10 hover:border-purple-400/40 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 hover:shadow-xl hover:shadow-purple-500/15"
                            }
                            ${isConnectingWallet ? "animate-pulse" : "hover:scale-[1.02] active:scale-[0.98]"}
                            backdrop-blur-xl
                          `}
                        >
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <div className="group-hover:scale-110 transition-transform duration-300">
                                {walletInfo.icon}
                              </div>
                              {walletInfo.popular && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                                  <Star className="h-3 w-3 text-white fill-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-white text-xl group-hover:text-purple-300 transition-colors">
                                  {walletInfo.name}
                                </span>
                                {walletInfo.popular && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30 font-bold">
                                    🏆 POPULAR
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 group-hover:text-gray-300 transition-colors text-base">
                                {walletInfo.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <span className="text-green-400 text-sm font-medium">Secure & Trusted</span>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              {isConnectingWallet ? (
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                                  <span className="text-sm text-purple-400 font-bold">Connecting...</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-10 h-10 border-3 border-gray-600 rounded-2xl group-hover:border-purple-400 transition-all duration-300 flex items-center justify-center group-hover:bg-purple-400/10">
                                    <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium">Connect</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Error Display */}
            {error && !isConnecting && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-lg" />
                <div className="relative p-6 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-500/40 rounded-2xl backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                    <div>
                      <p className="text-red-300 font-bold text-lg">Connection Failed</p>
                      <p className="text-red-400 text-sm mt-1">{error}</p>
                      <Button
                        onClick={resetConnectionState}
                        variant="outline"
                        size="sm"
                        className="mt-3 border-red-400/50 text-red-300 hover:bg-red-500/10"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

         
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
