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
} from "lucide-react";

interface WalletSelectorProps {
  onConnect?: () => void;
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
      }
    > = {
      "io.metamask": {
        name: "MetaMask",
        description: "Most popular Ethereum wallet",
        icon: (
          <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
        ),
        supported: true,
        popular: true,
      },
      "com.coinbase.wallet": {
        name: "Coinbase Wallet",
        description: "Secure & trusted by millions",
        icon: (
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
        ),
        supported: true,
      },
      walletconnect: {
        name: "WalletConnect",
        description: "Connect mobile wallets",
        icon: (
          <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
        ),
        supported: true,
      },
      injected: {
        name: "Browser Wallet",
        description: "Any installed wallet",
        icon: <Chrome className="w-6 h-6 text-gray-400" />,
        supported: true,
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
    <div className="max-w-sm mx-auto">
      <Card className="border-gray-700/50 bg-gray-900/80 backdrop-blur-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-blue-400" />
            Connect Your Wallet
          </CardTitle>
          <p className="text-gray-400 text-xs">
            Choose your preferred EVM-compatible wallet to get started
          </p>
        </CardHeader>

        <CardContent className="space-y-2 pt-0">
          {/* Show top 3 popular wallets */}
          {connectors
            .filter(
              (connector) =>
                connector.id !== "app.phantom" &&
                !connector.name.toLowerCase().includes("phantom")
            )
            .slice(0, 3) // Show only first 3 wallets for simplicity
            .map((connector) => {
              const walletInfo = getWalletInfo(connector.id, connector.name);
              const isSelected = selectedConnector === connector.id;
              const isConnectingWallet = isConnecting && isSelected;

              return (
                <Button
                  key={connector.id}
                  variant="outline"
                  onClick={() => !isConnecting && handleConnect(connector.id)}
                  disabled={isConnecting}
                  className={`
                    w-full justify-start h-auto p-3 border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/10
                    ${isSelected ? "border-blue-500/50 bg-blue-500/10" : ""}
                    transition-all duration-200
                  `}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">{walletInfo.icon}</div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">
                          {walletInfo.name}
                        </span>
                        {walletInfo.popular && (
                          <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {walletInfo.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      {isConnectingWallet ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-600 rounded-full group-hover:bg-blue-400 transition-colors" />
                      )}
                    </div>
                  </div>
                </Button>
              );
            })}

          {/* Error Display */}
          {error && !isConnecting && (
            <div className="p-2.5 bg-red-900/30 border border-red-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-red-400" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Info Footer */}
          <div className="text-center pt-3 border-t border-gray-700/50">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>Only EVM-compatible wallets supported</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
