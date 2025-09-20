"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  Trophy,
  Gift,
  ExternalLink,
  Loader2,
  Sparkles,
  Star,
  Crown,
  Medal,
  Award,
  Zap,
  Gem,
  Target,
} from "lucide-react";
import { useToastHelpers } from "@/components/ui/Toast";
import { useUser } from "@/contexts/UserContext";
import { formatDistanceToNow } from "date-fns";
import { SimpleAchievementCard } from "./SimpleAchievementCard";

interface Achievement {
  id: string;
  user_id: string;
  achievement_type_id: string;
  achieved_at: string;
  metric_value: number;
  metadata: any;
  is_nft_minted: boolean;
  nft_achievement_types: {
    id: string;
    name: string;
    display_name: string;
    description: string;
    category: string;
    rarity_level: number;
    color_scheme: string;
    badge_icon: string;
  };
}

interface NFT {
  id: string;
  token_id: string;
  contract_address: string;
  metadata_uri: string;
  metadata: any;
  tx_hash: string;
  minted_at: string;
  user_achievements: {
    nft_achievement_types: Achievement["nft_achievement_types"];
  };
}

interface AchievementProgress {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  rarity_level: number;
  color_scheme: string;
  badge_icon: string;
  is_earned: boolean;
  progress_percent: number;
  requirements: any;
}

interface AchievementNFTSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function AchievementNFTSection({
  userId,
  isOwnProfile,
}: AchievementNFTSectionProps) {
  const [eligibleAchievements, setEligibleAchievements] = useState<
    Achievement[]
  >([]);
  const [mintedNFTs, setMintedNFTs] = useState<NFT[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<
    AchievementProgress[]
  >([]);
  const [simpleAchievements, setSimpleAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [creatingAchievements, setCreatingAchievements] = useState(false);
  const { user } = useUser();
  const { success, error } = useToastHelpers();

  const fetchEligibleAchievements = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/achievements/eligible?userId=${userId}`
      );
      const data = await response.json();
      if (response.ok) {
        setEligibleAchievements(data.eligibleAchievements || []);
      }
    } catch (err) {
      console.error("Error fetching eligible achievements:", err);
    }
  }, [userId]);

  const fetchMintedNFTs = useCallback(async () => {
    try {
      const response = await fetch(`/api/nft/collection?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setMintedNFTs(data.collection || []);
      }
    } catch (err) {
      console.error("Error fetching NFT collection:", err);
    }
  }, [userId]);

  const fetchAchievementProgress = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/achievements/progress?userId=${userId}`
      );
      const data = await response.json();
      if (response.ok) {
        setAchievementProgress(data.progress || []);
      }
    } catch (err) {
      console.error("Error fetching achievement progress:", err);
    }
  }, [userId]);

  const fetchSimpleAchievements = useCallback(async () => {
    try {
      // Try the simple achievements API first
      let response = await fetch(`/api/achievements/simple?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.achievements && data.achievements.length > 0) {
          setSimpleAchievements(data.achievements);
          return;
        }
      }

      // If no simple achievements, try the direct approach
      response = await fetch(`/api/achievements/direct?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSimpleAchievements(data.achievements || []);
      } else {
        setSimpleAchievements([]);
      }
    } catch (err) {
      console.error("Error fetching achievements:", err);
      setSimpleAchievements([]);
    }
  }, [userId]);

  const fetchAchievementData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEligibleAchievements(),
        fetchMintedNFTs(),
        fetchAchievementProgress(),
        fetchSimpleAchievements(),
      ]);
    } catch (err) {
      console.error("Error fetching achievement data:", err);
    } finally {
      setLoading(false);
    }
  }, [
    fetchEligibleAchievements,
    fetchMintedNFTs,
    fetchAchievementProgress,
    fetchSimpleAchievements,
  ]);

  useEffect(() => {
    if (userId) {
      fetchAchievementData();
    }
  }, [userId, fetchAchievementData]);

  const handleMintNFT = async (achievementId: string) => {
    if (!user?.wallet_address) {
      error("Wallet Required", "Please connect your wallet to mint NFTs");
      return;
    }

    setMintingId(achievementId);
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        error("MetaMask Not Found", "Please install MetaMask to mint NFTs");
        return;
      }

      // Ensure we're using MetaMask specifically
      let ethereum = window.ethereum;
      if (ethereum.providers) {
        // If multiple wallets are installed, find MetaMask
        ethereum =
          ethereum.providers.find((provider: any) => provider.isMetaMask) ||
          ethereum;
      }

      if (!ethereum.isMetaMask) {
        error("MetaMask Required", "Please use MetaMask wallet to mint NFTs");
        return;
      }

      // Request MetaMask connection
      try {
        await ethereum.request({ method: "eth_requestAccounts" });
      } catch (connectionError: any) {
        if (connectionError.code === 4001) {
          error("Connection Rejected", "Please connect your MetaMask wallet");
          return;
        }
        throw connectionError;
      }

      // Create ethers provider from MetaMask
      const provider = new (await import("ethers")).ethers.BrowserProvider(
        ethereum
      );
      const signer = await provider.getSigner();

      // Get connected wallet address
      const connectedAddress = await signer.getAddress();
      console.log("Connected wallet:", connectedAddress);
      console.log("Minting NFT for achievement:", achievementId);

      // Check network - switch to Somnia if needed
      const network = await provider.getNetwork();
      const somniaChainId = 50312n; // Somnia testnet

      if (network.chainId !== somniaChainId) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${somniaChainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Chain not added, add it
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${somniaChainId.toString(16)}`,
                  chainName: "Somnia Testnet",
                  rpcUrls: ["https://dream-rpc.somnia.network/"],
                  nativeCurrency: {
                    name: "STT",
                    symbol: "STT",
                    decimals: 18,
                  },
                  blockExplorerUrls: [
                    "https://shannon-explorer.somnia.network/",
                  ],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Contract details - hardcoded for direct minting
      const CONTRACT_ADDRESS = "0xf58207a53f6e3965DfF8bf17DD368F8157D88Eb9";

      const contractABI = [
        {
          inputs: [
            { internalType: "address", name: "user", type: "address" },
            { internalType: "string", name: "achievementName", type: "string" },
            { internalType: "string", name: "description", type: "string" },
            { internalType: "uint8", name: "category", type: "uint8" },
            { internalType: "uint8", name: "rarity", type: "uint8" },
            { internalType: "string", name: "metadataURI", type: "string" },
            { internalType: "bool", name: "isLimitedEdition", type: "bool" },
          ],
          name: "mintAchievement",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      const contract = new (await import("ethers")).ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      // Create simple achievement data based on achievement ID
      let achievementName = "Gaming Achievement";
      let description = "Achievement earned on Somnia Gaming Platform";
      let category = 0; // Journey
      let rarity = 0; // Common
      const metadataURI = `https://ipfs.io/ipfs/achievement-${achievementId}`;

      // Customize based on achievement type
      if (achievementId.includes("welcome")) {
        achievementName = "Welcome to Somnia";
        description = "Successfully connected to the gaming platform!";
        category = 0; // Journey
        rarity = 0; // Common
      } else if (achievementId.includes("explorer")) {
        achievementName = "Platform Explorer";
        description = "Ready to discover what the community has to offer!";
        category = 0; // Journey
        rarity = 1; // Uncommon
      } else if (achievementId.includes("gaming")) {
        achievementName = "Gaming Champion";
        description = "Achieved excellence in gaming!";
        category = 4; // Gaming
        rarity = 2; // Rare
      }

      console.log("Minting NFT with data:", {
        to: connectedAddress,
        name: achievementName,
        description,
        category,
        rarity,
      });

      // Execute the minting transaction directly
      const tx = await contract.mintAchievement(
        connectedAddress,
        achievementName,
        description,
        category,
        rarity,
        metadataURI,
        rarity >= 2 // Limited edition for rare+ items
      );

      success(
        "Transaction Sent!",
        "NFT minting transaction sent to blockchain"
      );
      console.log("Transaction hash:", tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log("NFT minted successfully! Receipt:", receipt);

        // Extract token ID from receipt
        let tokenId = Date.now().toString(); // Fallback
        try {
          // Try to extract token ID from logs
          const transferLog = receipt.logs.find(
            (log: any) =>
              log.topics[0] ===
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
          );
          if (transferLog && transferLog.topics[3]) {
            tokenId = parseInt(transferLog.topics[3], 16).toString();
          }
        } catch (logError) {
          console.warn("Could not extract token ID from logs, using fallback");
        }

        success(
          "NFT Minted Successfully!",
          `Token ID: ${tokenId} | TX: ${tx.hash.slice(0, 10)}...`
        );

        // Now update the database after successful mint
        try {
          await fetch("/api/nft/record-mint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              achievementId,
              userWalletAddress: connectedAddress,
              userId: user.id,
              txHash: tx.hash,
              tokenId: tokenId,
              contractAddress: CONTRACT_ADDRESS,
              achievementName,
              description,
              category,
              rarity,
            }),
          });
          console.log("Database updated successfully");
        } catch (dbError) {
          console.warn(
            "Failed to update database (NFT still minted successfully):",
            dbError
          );
        }

        // Refresh achievement data
        await fetchAchievementData();
      } else {
        error("Transaction Failed", "The blockchain transaction failed");
      }
    } catch (err: any) {
      console.error("NFT minting error:", err);
      if (err.code === 4001) {
        error("Transaction Cancelled", "You cancelled the transaction");
      } else if (err.code === -32602) {
        error("Invalid Parameters", "Invalid transaction parameters");
      } else if (err.message?.includes("insufficient")) {
        error("Insufficient Funds", "Not enough balance to cover gas fees");
      } else {
        error(
          "Minting Error",
          err.message || "An unexpected error occurred during minting"
        );
      }
    } finally {
      setMintingId(null);
    }
  };

  const handleMintSimpleNFT = async (achievementId: string) => {
    // Use the same wallet-based minting approach as handleMintNFT
    return handleMintNFT(achievementId);
  };

  const handleCreateAchievements = async () => {
    setCreatingAchievements(true);
    try {
      console.log("Starting achievement creation for user:", userId);

      // Try the direct approach first (most reliable)
      let response = await fetch("/api/achievements/direct-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      let data = await response.json();
      console.log("Direct achievement creation response:", data);

      if (response.ok && data.achievementsCreated?.length > 0) {
        success(
          "Achievements Created!",
          `Created ${
            data.achievementsCreated.length
          } achievements: ${data.achievementsCreated.join(", ")}`
        );
        await fetchAchievementData();
        return;
      }

      // If direct approach fails, try the simple approach
      console.log("Trying simple achievement creation...");
      response = await fetch("/api/achievements/simple-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      data = await response.json();
      console.log("Simple achievement creation response:", data);

      if (response.ok && data.achievementsCreated?.length > 0) {
        success(
          "Achievements Created!",
          `Created ${
            data.achievementsCreated.length
          } achievements: ${data.achievementsCreated.join(", ")}`
        );
        await fetchAchievementData();
        return;
      }

      // If both fail, try the complex NFT approach
      console.log("Trying complex NFT approach...");
      response = await fetch("/api/achievements/create-from-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      data = await response.json();
      console.log("NFT achievement creation response:", data);

      if (response.ok && data.achievementsFound > 0) {
        success(
          "NFT Achievements Created!",
          `Found ${data.achievementsFound} achievements for minting`
        );
        await fetchAchievementData();
      } else {
        error(
          "All Methods Failed",
          "Could not create achievements. Check console for details."
        );
        console.error("All achievement creation methods failed");
      }
    } catch (err) {
      console.error("Achievement creation error:", err);
      error("Creation Error", "An unexpected error occurred");
    } finally {
      setCreatingAchievements(false);
    }
  };

  const getRarityColor = (rarity_level: number) => {
    switch (rarity_level) {
      case 1:
        return "border-gray-500 bg-gray-500/10 text-gray-400";
      case 2:
        return "border-green-500 bg-green-500/10 text-green-400";
      case 3:
        return "border-blue-500 bg-blue-500/10 text-blue-400";
      case 4:
        return "border-purple-500 bg-purple-500/10 text-purple-400";
      case 5:
        return "border-yellow-500 bg-yellow-500/10 text-yellow-400";
      default:
        return "border-gray-500 bg-gray-500/10 text-gray-400";
    }
  };

  const getRarityName = (rarity_level: number) => {
    switch (rarity_level) {
      case 1:
        return "Common";
      case 2:
        return "Uncommon";
      case 3:
        return "Rare";
      case 4:
        return "Epic";
      case 5:
        return "Legendary";
      default:
        return "Common";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "journey":
        return <Star className="h-5 w-5" />;
      case "creator":
        return <Award className="h-5 w-5" />;
      case "social":
        return <Trophy className="h-5 w-5" />;
      case "loyalty":
        return <Medal className="h-5 w-5" />;
      case "gaming":
        return <Zap className="h-5 w-5" />;
      case "special":
        return <Crown className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <Card className="border-border-primary bg-surface-secondary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Demo Mode Banner */}
      {process.env.NODE_ENV !== "production" && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-200 mb-1">
                Demo Mode Active
              </h3>
              <p className="text-sm text-yellow-300/80 mb-3">
                NFT minting is currently in demo mode. NFTs are simulated and
                not stored on the blockchain.
              </p>
              <div className="text-xs text-yellow-400/70 space-y-1">
                <p>🔧 To enable real blockchain minting:</p>
                <p>
                  1. Run:{" "}
                  <code className="bg-black/30 px-2 py-0.5 rounded">
                    npm run setup:nft
                  </code>
                </p>
                <p>2. Restart your development server</p>
                <p>3. Mint real NFTs on Somnia testnet!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-tertiary rounded-full border border-border-primary">
          <Gem className="h-4 w-4 text-primary-500" />
          <span className="text-text-secondary text-sm font-medium">
            NFT Achievement System
          </span>
        </div>
        <h2 className="text-3xl font-bold text-text-primary">
          Gaming Achievements & NFTs
        </h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Earn NFTs by being active and engaged in our gaming community.
          Showcase your platform journey through blockchain-verified
          achievements.
        </p>
      </div>

      {/* Available to Mint */}
      {isOwnProfile && eligibleAchievements.length > 0 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Gift className="h-5 w-5" />
              Ready to Mint ({eligibleAchievements.length} available)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eligibleAchievements.map((achievement) => (
                <AchievementNFTCard
                  key={achievement.id}
                  achievement={achievement}
                  onMint={handleMintNFT}
                  isMinting={mintingId === achievement.id}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simple Achievements to Mint */}
      {isOwnProfile && simpleAchievements.length > 0 && (
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Sparkles className="h-5 w-5" />
              Your Achievements Ready to Mint ({simpleAchievements.length}{" "}
              available)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {simpleAchievements.map((achievement) => (
                <SimpleAchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onMint={handleMintSimpleNFT}
                  isMinting={mintingId === achievement.id}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Eligible Achievements - Show Create Button */}
      {isOwnProfile &&
        eligibleAchievements.length === 0 &&
        achievementProgress.some((p) => p.progress_percent === 100) && (
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Trophy className="h-5 w-5" />
                Convert Completed Achievements to NFTs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-text-secondary">
                  You have completed achievements that can be converted to
                  mintable NFTs!
                </p>
                <Button
                  onClick={handleCreateAchievements}
                  disabled={creatingAchievements}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {creatingAchievements ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Achievements...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Mintable Achievements
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Debug Section - Show what we found */}
      {isOwnProfile && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Trophy className="h-5 w-5" />
              Debug Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                Eligible Achievements (NFT System):{" "}
                {eligibleAchievements.length}
              </p>
              <p>Simple Achievements: {simpleAchievements.length}</p>
              <p>Minted NFTs: {mintedNFTs.length}</p>
              <p>Progress Items: {achievementProgress.length}</p>
              <p>
                100% Completed:{" "}
                {
                  achievementProgress.filter((p) => p.progress_percent === 100)
                    .length
                }
              </p>
              <div className="mt-4 space-y-2">
                <Button
                  onClick={async () => {
                    console.log("Testing user data access...");
                    try {
                      const response = await fetch(
                        `/api/achievements/direct?userId=${userId}`
                      );
                      const data = await response.json();
                      console.log("Direct achievements response:", data);
                      if (data.achievements?.length > 0) {
                        success(
                          "Found Achievements!",
                          `${data.achievements.length} achievements available`
                        );
                        setSimpleAchievements(data.achievements);
                      } else {
                        error(
                          "No Achievements",
                          "No achievements found or generated"
                        );
                      }
                    } catch (err) {
                      console.error("Test failed:", err);
                      error("Test Failed", "Could not access achievement data");
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Test Achievement Access
                </Button>
                <details>
                  <summary className="cursor-pointer text-blue-400 text-xs">
                    Show Achievement Data
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(simpleAchievements, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Minted NFT Collection */}
      <Card className="border-border-primary bg-surface-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary-500" />
            NFT Collection ({mintedNFTs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mintedNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mintedNFTs.map((nft) => (
                <MintedNFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <div className="text-xl mb-2 text-text-primary">No NFTs Yet</div>
              <div className="text-text-secondary">
                Start posting, engaging, and building your gaming community to
                unlock NFTs!
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Toward Next Achievements */}
      <AchievementProgress
        progress={achievementProgress}
        getCategoryIcon={getCategoryIcon}
        getRarityColor={getRarityColor}
        getRarityName={getRarityName}
      />
    </div>
  );
}

// Achievement NFT Card Component
function AchievementNFTCard({
  achievement,
  onMint,
  isMinting,
}: {
  achievement: Achievement;
  onMint: (id: string) => void;
  isMinting: boolean;
}) {
  const achievementType = achievement.nft_achievement_types;

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg border-l-4`}
      style={{ borderLeftColor: achievementType.color_scheme }}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${achievementType.color_scheme}20` }}
            >
              <span className="text-2xl">{achievementType.badge_icon}</span>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary">
                {achievementType.display_name}
              </h4>
              <span className="text-sm text-text-tertiary capitalize">
                {achievementType.category}
              </span>
            </div>
          </div>

          <p className="text-text-secondary text-sm">
            {achievementType.description}
          </p>

          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              Achieved{" "}
              {formatDistanceToNow(new Date(achievement.achieved_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          <Button
            onClick={() => onMint(achievement.id)}
            disabled={isMinting}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
          >
            {isMinting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Mint NFT
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Minted NFT Card Component
function MintedNFTCard({ nft }: { nft: NFT }) {
  const achievementType = nft.user_achievements.nft_achievement_types;

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="aspect-square bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center">
            <span className="text-4xl">{achievementType.badge_icon}</span>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary text-sm">
              {achievementType.display_name}
            </h4>
            <p className="text-xs text-text-tertiary">
              Token #{nft.token_id.slice(-8)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {achievementType.category}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `https://shannon-explorer.somnia.network/tx/${nft.tx_hash}`,
                  "_blank"
                )
              }
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Achievement Progress Component
function AchievementProgress({
  progress,
  getCategoryIcon,
  getRarityColor,
  getRarityName,
}: {
  progress: AchievementProgress[];
  getCategoryIcon: (category: string) => React.ReactNode;
  getRarityColor: (rarity_level: number) => string;
  getRarityName: (rarity_level: number) => string;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    "journey",
    "creator",
    "social",
    "loyalty",
    "gaming",
    "special",
  ];

  const filteredProgress =
    selectedCategory === "all"
      ? progress
      : progress.filter((p) => p.category === selectedCategory);

  const inProgressAchievements = filteredProgress.filter(
    (p) => !p.is_earned && p.progress_percent > 0
  );

  if (inProgressAchievements.length === 0) return null;

  return (
    <Card className="border-border-primary bg-surface-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary-500" />
          Progress Toward Next Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Progress Items */}
          <div className="space-y-4">
            {inProgressAchievements.slice(0, 6).map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      getRarityColor(item.rarity_level).split(" ")[1]
                    }`}
                  >
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-text-primary">
                        {item.display_name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getRarityName(item.rarity_level)}
                        </Badge>
                        <span className="text-sm text-text-secondary">
                          {item.progress_percent}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-text-tertiary">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Progress value={item.progress_percent} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
