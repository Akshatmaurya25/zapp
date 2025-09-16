"use client";

import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { usePosts } from "@/hooks/usePosts";
import { usePostContract } from "@/hooks/usePostContract";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { MediaUpload } from "@/components/ui/MediaUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Flex, Stack } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import {
  Send,
  Image,
  Video,
  Gamepad2,
  Zap,
  Coins,
  Shield,
  Database,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
} from "lucide-react";
import { MediaUpload as MediaUploadType } from "@/types";

interface BlockchainPostCreateProps {
  onSuccess?: () => void;
  className?: string;
}

const gameCategories = [
  { value: "general", label: "General Gaming", icon: "🎮" },
  { value: "valorant", label: "Valorant", icon: "🎯" },
  { value: "pubg", label: "PUBG", icon: "🏆" },
  { value: "fortnite", label: "Fortnite", icon: "⚡" },
  { value: "league", label: "League of Legends", icon: "⚔️" },
  { value: "metaverse", label: "Metaverse Games", icon: "🌐" },
  { value: "other", label: "Other", icon: "🎲" },
];

type PostMode = "free" | "blockchain";

export function BlockchainPostCreate({
  onSuccess,
  className,
}: BlockchainPostCreateProps) {
  const { user } = useUser();
  const { createPost: createOffChainPost, isCreating: isCreatingOffChain } =
    usePosts();
  const {
    createPost: createBlockchainPost,
    isCreating: isCreatingBlockchain,
    postFee,
    isContractAvailable,
  } = usePostContract();

  const [content, setContent] = useState("");
  const [gameCategory, setGameCategory] = useState<string>("general");
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType[]>([]);
  const [postMode, setPostMode] = useState<PostMode>("free");
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const isCreating = isCreatingOffChain || isCreatingBlockchain;

  const handleMediaUpload = (uploads: MediaUploadType[]) => {
    setMediaFiles((prev) => [...prev, ...uploads]);
    setError(null);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a post");
      return;
    }

    try {
      const postData = {
        content: content.trim(),
        media_ipfs:
          mediaFiles.length > 0 && mediaFiles[0].ipfs_hash
            ? [mediaFiles[0].ipfs_hash]
            : undefined,
        game_category: gameCategory || "general",
      };

      if (postMode === "blockchain" && isContractAvailable) {
        // Create blockchain post
        await createBlockchainPost({
          content: postData.content,
          mediaIpfs: postData.media_ipfs?.[0] || "",
          gameCategory: postData.game_category,
        });
      } else {
        // Create traditional post
        await createOffChainPost(postData);
      }

      // Reset form
      setContent("");
      setGameCategory("general");
      setMediaFiles([]);
      setShowPreview(false);
      onSuccess?.();
    } catch (err) {
      console.error("Post creation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  const selectedCategory = gameCategories.find(
    (cat) => cat.value === gameCategory
  );

  return (
    <Card className={cn("w-full", className)} variant="elevated">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Send className="h-5 w-5 text-primary-500" />
          </div>
          Create a Post
          {isContractAvailable && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1 px-2 py-1 bg-success-500/10 rounded-full">
                <Zap className="h-3 w-3 text-success-400" />
                <span className="text-xs text-success-400 font-medium">
                  Blockchain Ready
                </span>
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Mode Selection */}
          {isContractAvailable && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-text-primary">
                Post Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPostMode("free")}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                    postMode === "free"
                      ? "border-primary-500 bg-primary-500/5"
                      : "border-border-primary hover:border-border-secondary"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-primary-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-text-primary">
                        Free Post
                      </h4>
                      <p className="text-sm text-text-tertiary">
                        Store in database only. Quick and free.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPostMode("blockchain")}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                    postMode === "blockchain"
                      ? "border-primary-500 bg-primary-500/5"
                      : "border-border-primary hover:border-border-secondary"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-secondary-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-text-primary">
                        Blockchain Post
                      </h4>
                      <p className="text-sm text-text-tertiary">
                        Store on-chain. Verified and permanent.
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Coins className="h-3 w-3 text-warning-400" />
                        <span className="text-xs text-warning-400 font-medium">
                          Fee: {postFee} STT
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {postMode === "blockchain" && (
                <div className="flex items-start gap-3 p-4 bg-info-500/10 border border-info-500/20 rounded-lg">
                  <Info className="h-5 w-5 text-info-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-info-400">
                    <p className="font-medium">Blockchain Post Benefits:</p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>Permanent storage on Somnia network</li>
                      <li>Cryptographic verification</li>
                      <li>Cannot be censored or deleted by others</li>
                      <li>Earns you blockchain reputation</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Input */}
          <Textarea
            label="What's on your mind?"
            placeholder="Share your gaming experience, achievements, or thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
            maxLength={2000}
            helperText={`${content.length}/2000 characters`}
            required
          />

          {/* Game Category Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-primary">
              Game Category
            </label>
            <Select value={gameCategory} onValueChange={setGameCategory}>
              <SelectTrigger className="h-12">
                <SelectValue>
                  {selectedCategory && (
                    <div className="flex items-center gap-2">
                      <span>{selectedCategory.icon}</span>
                      <span>{selectedCategory.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {gameCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-primary">
              Media (Optional)
            </label>
            <MediaUpload
              accept="images"
              maxFiles={4}
              onFilesUploaded={handleMediaUpload}
              className="border-2 border-dashed border-border-primary hover:border-border-secondary transition-colors"
            />

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mediaFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square bg-background-tertiary rounded-lg overflow-hidden"
                  >
                    {file.ipfs_hash && (
                      <img
                        src={`https://gateway.pinata.cloud/ipfs/${file.ipfs_hash}`}
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMediaFile(index)}
                      className="absolute top-2 right-2 p-1 bg-error-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-error-500/10 border border-error-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-error-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-error-400">
                  Post Creation Failed
                </p>
                <p className="text-sm text-error-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <Flex
            gap="md"
            justify="end"
            className="pt-4 border-t border-border-primary"
          >
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setContent("");
                setMediaFiles([]);
                setError(null);
              }}
              disabled={isCreating}
            >
              Clear
            </Button>

            <Button
              type="submit"
              loading={isCreating}
              disabled={!content.trim() || isCreating}
              className="min-w-[120px]"
            >
              {isCreating ? (
                postMode === "blockchain" ? (
                  "Publishing to Blockchain..."
                ) : (
                  "Creating Post..."
                )
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {postMode === "blockchain"
                    ? "Publish to Blockchain"
                    : "Create Post"}
                </>
              )}
            </Button>
          </Flex>
        </form>
      </CardContent>
    </Card>
  );
}
