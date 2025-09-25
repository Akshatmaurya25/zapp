"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  Eye,
  DollarSign,
  Clock,
  Share2,
  Heart,
  Users,
  ArrowLeft,
  Gamepad2,
  Gift,
} from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import SimpleRTMPPlayer from "./SimpleRTMPPlayer";
import TipModal from "./TipModal";
import NitroliteUniversalTipModal from "@/components/tipping/NitroliteUniversalTipModal";
import WalletDebugger from "@/components/debug/WalletDebugger";
import {
  YellowTipNotifications,
  LiveTipCounter,
} from "@/components/notifications/YellowTipNotifications";
import {
  streamingService,
  Stream,
  StreamTip,
  formatViewerCount,
  formatStreamDuration,
} from "@/lib/streaming";
import { useToast } from "@/components/ui/Toast";

interface StreamPageProps {
  streamKey: string;
}

export default function StreamPage({ streamKey }: StreamPageProps) {
  const [stream, setStream] = useState<Stream | null>(null);
  const [tips, setTips] = useState<StreamTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showNitroliteModal, setShowNitroliteModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isReceivingContent, setIsReceivingContent] = useState(false);
  const [hlsFailed, setHlsFailed] = useState(false);
  const [watchTime, setWatchTime] = useState(0); // in seconds
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; user: string; message: string; timestamp: Date }>
  >([]);
  const [chatMessage, setChatMessage] = useState("");

  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchStream();
    fetchTips();

    // Start with empty chat - users can begin the conversation
    setChatMessages([]);

    // Set up real-time updates
    const socket = streamingService.connectSocket();
    streamingService.joinStream(streamKey);

    // Watch time tracking
    const watchTimeInterval = setInterval(() => {
      if (stream?.is_active && stream?.is_live) {
        setWatchTime((prev) => prev + 1);
      }
    }, 1000);

    // Check for streaming content every 5 seconds
    const checkStreamingContent = async () => {
      try {
        const response = await fetch(
          `http://localhost:9000/api/streams/${streamKey}/status`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Stream status check:", data);
          setIsReceivingContent(data.isReceivingContent || false);
        } else {
          console.warn("Stream status check failed:", response.status);
          setIsReceivingContent(false);
        }
      } catch (error) {
        console.error("Stream status check error:", error);
        // If the streaming server is down, assume no content is being received
        setIsReceivingContent(false);
      }
    };

    // Initial check
    checkStreamingContent();

    // Set up interval for content checking
    const contentCheckInterval = setInterval(checkStreamingContent, 5000);

    streamingService.onViewerCountUpdate((data) => {
      if (data.streamKey === streamKey) {
        setStream((prev) =>
          prev ? { ...prev, viewer_count: data.viewerCount } : null
        );
      }
    });

    streamingService.onNewTip((tipData) => {
      if (tipData.streamKey === streamKey) {
        setTips((prev) => [tipData.tip, ...prev]);
        setStream((prev) =>
          prev
            ? {
                ...prev,
                total_tips: (
                  parseFloat(prev.total_tips?.toString() || "0") +
                  parseFloat(tipData.tip.amount)
                ).toString(),
              }
            : null
        );

        // Show tip notification
        showToast({
          title: `💰 ${tipData.tip.tipper_wallet.slice(0, 6)}... tipped ${
            tipData.tip.amount
          } ETH!`,
          type: "success",
        });
      }
    });

    streamingService.onStreamEnded((data) => {
      if (data.streamKey === streamKey) {
        showToast({ title: "Stream has ended", type: "info" });
        setStream((prev) =>
          prev ? { ...prev, is_active: false, is_live: false } : null
        );
        setIsReceivingContent(false);
      }
    });

    return () => {
      clearInterval(contentCheckInterval);
      clearInterval(watchTimeInterval);
      streamingService.leaveStream(streamKey);
      streamingService.offViewerCountUpdate();
      streamingService.offNewTip();
      streamingService.offStreamEnded();
    };
  }, [streamKey]);

  const fetchStream = async () => {
    try {
      const streamData = await streamingService.getStream(streamKey);
      console.log("Stream data fetched:", streamData);
      console.log("HLS URL in stream data:", streamData.hls_url);
      console.log("User data in stream:", streamData.users);
      setStream(streamData);
    } catch (error) {
      console.error("Failed to fetch stream:", error);
      showToast({ title: "Stream not found", type: "error" });
      router.push("/streams");
    } finally {
      setLoading(false);
    }
  };

  const fetchTips = async () => {
    if (!stream?.id) return;

    try {
      const { tips: streamTips } = await streamingService.getStreamTips(
        stream.id,
        20
      );
      setTips(streamTips);
    } catch (error) {
      console.error("Failed to fetch tips:", error);
    }
  };

  const shareStream = async () => {
    const url = `${window.location.origin}/stream/${streamKey}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: stream?.title || "Live Stream",
          text: `Watch ${stream?.users?.display_name || "this streamer"} live!`,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast({
          title: "Stream link copied to clipboard!",
          type: "success",
        });
      } catch (error) {
        showToast({ title: "Failed to copy link", type: "error" });
      }
    }
  };

  const toggleFollow = async () => {
    // This would integrate with your existing follow system
    setIsFollowing(!isFollowing);
    showToast({
      title: isFollowing ? "Unfollowed streamer" : "Now following streamer!",
      type: "success",
    });
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      user: "You", // This would be the current user's name
      message: chatMessage.trim(),
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatMessage("");

    // Here you would emit the message to the socket
    // streamingService.sendChatMessage(streamKey, newMessage)
  };

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getNFTMilestones = () => {
    return [
      {
        time: 300,
        label: "Early Bird NFT",
        icon: "🐦",
        unlocked: watchTime >= 300,
      }, // 5 minutes
      {
        time: 900,
        label: "Dedicated Viewer NFT",
        icon: "👀",
        unlocked: watchTime >= 900,
      }, // 15 minutes
      {
        time: 1800,
        label: "Loyal Fan NFT",
        icon: "💎",
        unlocked: watchTime >= 1800,
      }, // 30 minutes
      {
        time: 3600,
        label: "Super Fan NFT",
        icon: "⭐",
        unlocked: watchTime >= 3600,
      }, // 1 hour
      {
        time: 7200,
        label: "Ultimate Supporter NFT",
        icon: "👑",
        unlocked: watchTime >= 7200,
      }, // 2 hours
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-surface-secondary rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className="aspect-video bg-surface-secondary rounded-lg"></div>
                <Card className="p-6 border-border-primary">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-surface-secondary rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-surface-secondary rounded w-2/3"></div>
                      <div className="h-4 bg-surface-secondary rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-surface-secondary rounded"
                      ></div>
                    ))}
                  </div>
                </Card>
              </div>
              <div className="space-y-4">
                <Card className="p-4 border-border-primary">
                  <div className="h-5 bg-surface-secondary rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-10 bg-surface-secondary rounded"
                      ></div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md border-border-primary bg-surface-secondary">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center">
            <Eye className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold mb-3 text-text-primary">
            Stream Not Found
          </h2>
          <p className="text-text-secondary mb-6">
            This stream may have ended or the link is invalid. Don't worry,
            there are plenty of other great streams to watch!
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/streams")}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Browse Live Streams
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full border-border-primary text-text-secondary hover:text-text-primary"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-border-primary text-text-secondary hover:text-text-primary w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Streams
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary truncate">
              {stream.title}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {stream.is_active && stream.is_live && (
                <Badge variant="destructive" className="animate-pulse text-xs">
                  🔴 LIVE
                </Badge>
              )}
              {stream.is_active && isReceivingContent && (
                <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs animate-pulse">
                  📡 Receiving OBS
                </Badge>
              )}
              {stream.is_active && isReceivingContent && hlsFailed && (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  🎥 RTMP Live
                </Badge>
              )}
              {stream.is_active && !isReceivingContent && (
                <Badge
                  variant="outline"
                  className="border-orange-500 text-orange-500 text-xs"
                >
                  ⏳ Waiting for OBS
                </Badge>
              )}
              {stream.is_active && stream.is_live && (
                <span className="text-sm text-text-secondary">
                  {formatViewerCount(stream.viewer_count || 0)} watching now
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareStream}
              className="border-border-primary text-text-secondary hover:text-text-primary"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-5 space-y-6">
            {/* Video Player */}
            <Card className="overflow-hidden border-border-primary bg-surface-secondary">
              <div className="relative">
                {stream.is_active && isReceivingContent ? (
                  <div className="relative w-full">
                    {stream.hls_url &&
                    stream.hls_url.trim() !== "" &&
                    !hlsFailed ? (
                      <VideoPlayer
                        src={stream.hls_url}
                        className="aspect-video w-full"
                        onError={() => {
                          console.log(
                            "HLS error occurred, may fall back to RTMP view"
                          );
                        }}
                        onTimeout={() => {
                          console.log("HLS timeout, falling back to RTMP view");
                          setHlsFailed(true);
                        }}
                      />
                    ) : (
                      <SimpleRTMPPlayer
                        streamKey={stream.stream_key}
                        isReceivingContent={isReceivingContent}
                        className="w-full"
                      />
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
                    {/* Live stream animation for when receiving content */}
                    {stream.is_active && isReceivingContent && (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-purple-900/30 animate-pulse" />
                    )}

                    <div className="text-center text-white p-8 relative z-10">
                      <div
                        className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center border ${
                          stream.is_active && isReceivingContent
                            ? "bg-gradient-to-r from-red-600/40 to-purple-600/40 border-red-400/30 animate-pulse"
                            : "bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-white/10"
                        }`}
                      >
                        {stream.is_active && isReceivingContent ? (
                          <div className="relative">
                            <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute -top-1 -right-1" />
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 bg-white rounded-full" />
                            </div>
                          </div>
                        ) : (
                          <Eye className="w-10 h-10 text-purple-400" />
                        )}
                      </div>

                      <h3 className="text-xl font-semibold mb-3">
                        {stream.is_active && isReceivingContent
                          ? "🔴 LIVE STREAM ACTIVE"
                          : stream.is_active
                          ? "Stream Starting Soon"
                          : "Stream Offline"}
                      </h3>

                      <p className="text-gray-300 mb-4">
                        {stream.is_active && isReceivingContent
                          ? hlsFailed
                            ? "The streamer is live! Broadcasting via RTMP protocol."
                            : "The streamer is live and broadcasting! Video transcoding for web playback is being configured."
                          : stream.is_active
                          ? "The streamer is setting up. Stream will begin shortly."
                          : "This stream has ended. Check out other live streams!"}
                      </p>

                      {stream.is_active && isReceivingContent && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-sm font-medium">
                              Receiving from OBS Studio
                            </span>
                          </div>
                          <div
                            className={`border rounded-lg p-3 text-sm ${
                              hlsFailed
                                ? "bg-blue-500/20 border-blue-500/30"
                                : "bg-green-500/20 border-green-500/30"
                            }`}
                          >
                            <p
                              className={
                                hlsFailed ? "text-blue-200" : "text-green-200"
                              }
                            >
                              <strong>Stream Status:</strong>{" "}
                              {hlsFailed
                                ? "Your OBS is connected and streaming live via RTMP protocol."
                                : "Your OBS is connected and sending video data to the RTMP server. Video transcoding to web format (HLS) will be available in a future update."}
                            </p>
                          </div>
                        </div>
                      )}

                      {!stream.is_active && (
                        <Button
                          variant="outline"
                          onClick={() => router.push("/streams")}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Browse Live Streams
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Live indicator overlay */}
                {stream.is_active && stream.is_live && (
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="destructive"
                      className="animate-pulse shadow-lg"
                    >
                      🔴 LIVE
                    </Badge>
                  </div>
                )}

                {/* OBS Content indicator overlay */}
                {stream.is_active && (
                  <div className="absolute top-4 left-20">
                    {isReceivingContent ? (
                      <>
                        <Badge className="bg-green-600/90 backdrop-blur-sm text-white shadow-lg animate-pulse mr-2">
                          📡 Receiving
                        </Badge>
                        {hlsFailed && (
                          <Badge className="bg-blue-600/90 backdrop-blur-sm text-white shadow-lg">
                            🎥 RTMP Live
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge className="bg-orange-600/90 backdrop-blur-sm text-white shadow-lg">
                        ⏳ Waiting for OBS
                      </Badge>
                    )}
                  </div>
                )}

                {/* Viewer count overlay */}
                {stream.is_active && stream.is_live && (
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {formatViewerCount(stream.viewer_count || 0)}
                  </div>
                )}
              </div>
            </Card>

            {/* Stream Info */}
            <Card className="border-border-primary bg-surface-secondary">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                  <div className="flex items-start gap-6">
                    {/* Enhanced Avatar */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                        <div className="w-full h-full rounded-full bg-surface-secondary overflow-hidden flex items-center justify-center">
                          {stream.users?.avatar_ipfs ? (
                            <img
                              src={`https://gateway.pinata.cloud/ipfs/${stream.users.avatar_ipfs}`}
                              alt="Streamer Avatar"
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                console.error(
                                  "Avatar loading failed for stream:",
                                  stream.stream_key,
                                  "IPFS hash:",
                                  stream.users?.avatar_ipfs
                                );
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget
                                  .nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                              onLoad={() => {
                                console.log(
                                  "Avatar loaded successfully for stream:",
                                  stream.stream_key
                                );
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-2xl rounded-full"
                            style={{
                              display: stream.users?.avatar_ipfs
                                ? "none"
                                : "flex",
                            }}
                          >
                            {(stream.users?.display_name ||
                              stream.users?.username ||
                              "Streamer")[0].toUpperCase()}
                          </div>
                        </div>
                      </div>
                      {/* Live indicator on avatar */}
                      {stream.is_active && stream.is_live && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-surface-secondary flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-text-primary">
                          {stream.title}
                        </h2>
                        {stream.is_active && stream.is_live && (
                          <Badge
                            variant="destructive"
                            className="animate-pulse"
                          >
                            🔴 LIVE
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-semibold text-purple-400">
                          {stream.users?.display_name ||
                            stream.users?.username ||
                            "Anonymous Streamer"}
                        </span>
                        {stream.users?.username &&
                          stream.users?.display_name && (
                            <span className="text-text-tertiary text-sm">
                              @{stream.users.username}
                            </span>
                          )}
                      </div>

                      {stream.game_name && (
                        <div className="flex items-center gap-2 mb-2">
                          <Gamepad2 className="w-4 h-4 text-purple-400" />
                          <Badge
                            variant="secondary"
                            className="text-xs bg-purple-600/20 text-purple-300 border-purple-500/30"
                          >
                            {stream.game_name}
                          </Badge>
                        </div>
                      )}

                      {/* Stream description */}
                      <p className="text-text-secondary text-sm">
                        {stream.description ||
                          "Live streaming on Zapp - Web3's premier streaming platform! 🎮✨"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Button
                      variant={isFollowing ? "default" : "outline"}
                      size="sm"
                      onClick={toggleFollow}
                      className={`${
                        isFollowing
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "border-border-primary text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 mr-2 ${
                          isFollowing ? "fill-current" : ""
                        }`}
                      />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => setShowNitroliteModal(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-md text-white font-semibold flex-1"
                      >
                        <DollarSign className="w-4 h-4 mr-1" />⚡ Nitrolite Tips
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowTipModal(true)}
                        className="border-green-600/50 text-green-400 hover:bg-green-600/10 flex-1"
                      >
                        <Gift className="w-4 h-4 mr-1" />
                        Classic Tip
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Stream Stats */}
                <div
                  className={`grid gap-4 p-4 bg-background-primary rounded-lg border border-border-secondary mb-6 ${
                    stream.is_active
                      ? "grid-cols-2 sm:grid-cols-5"
                      : "grid-cols-2 sm:grid-cols-4"
                  }`}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-semibold text-text-primary">
                      {formatViewerCount(stream.viewer_count || 0)}
                    </div>
                    <div className="text-xs text-text-tertiary">Viewers</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-semibold text-text-primary">
                      ${Number(stream.total_tips || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-text-tertiary">Total Tips</div>
                  </div>

                  {stream.started_at && stream.is_live && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="text-lg font-semibold text-text-primary">
                        {formatStreamDuration(stream.started_at)}
                      </div>
                      <div className="text-xs text-text-tertiary">Duration</div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-pink-400 mb-1">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-semibold text-text-primary">
                      {stream.is_active && stream.is_live ? "LIVE" : "OFFLINE"}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      Stream Status
                    </div>
                  </div>

                  {stream.is_active && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {isReceivingContent ? (
                          <div className="w-4 h-4 text-green-400">📡</div>
                        ) : (
                          <div className="w-4 h-4 text-orange-400">⏳</div>
                        )}
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          isReceivingContent
                            ? "text-green-400"
                            : "text-orange-400"
                        }`}
                      >
                        {isReceivingContent ? "RECEIVING" : "WAITING"}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        OBS Status
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Watch Progress & NFT Milestones - Moved Below Stream Info */}
            {stream.is_active && (
              <Card className="border-border-primary bg-surface-secondary">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-text-primary flex items-center gap-2">
                      ⏱️ Watch Progress
                    </h3>
                    <span className="text-sm font-mono text-purple-400">
                      {formatWatchTime(watchTime)}
                    </span>
                  </div>

                  {/* Progress bar with milestones */}
                  <div className="relative mb-4">
                    <div className="w-full bg-background-primary rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min((watchTime / 7200) * 100, 100)}%`,
                        }}
                      />
                    </div>

                    {/* Milestone markers */}
                    <div className="absolute top-0 w-full h-3 flex justify-between">
                      {getNFTMilestones().map((milestone, index) => (
                        <div
                          key={index}
                          className={`w-4 h-4 rounded-full border-2 -mt-0.5 relative ${
                            milestone.unlocked
                              ? "bg-green-500 border-green-400"
                              : "bg-gray-600 border-gray-500"
                          }`}
                          style={{
                            left: `${(milestone.time / 7200) * 100}%`,
                            transform: "translateX(-50%)",
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
                            <span
                              className={
                                milestone.unlocked
                                  ? "text-green-400"
                                  : "text-gray-500"
                              }
                            >
                              {milestone.icon}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* NFT Milestones Grid - Improved Design */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {getNFTMilestones().map((milestone, index) => (
                      <div
                        key={index}
                        className={`relative p-4 rounded-xl border-2 text-center transition-all transform hover:scale-105 ${
                          milestone.unlocked
                            ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/60 text-green-300 shadow-lg shadow-green-500/20"
                            : "bg-gradient-to-br from-gray-700/10 to-gray-800/10 border-gray-600/30 text-gray-400 hover:border-gray-500/50"
                        }`}
                      >
                        {/* Achievement Icon */}
                        <div
                          className={`text-2xl mb-2 transition-transform ${
                            milestone.unlocked ? "animate-bounce" : ""
                          }`}
                        >
                          {milestone.icon}
                        </div>

                        {/* Achievement Info */}
                        <div className="text-xs font-semibold mb-1 leading-tight">
                          {milestone.label.replace(" NFT", "")}
                        </div>
                        <div className="text-xs opacity-75 mb-2">
                          {Math.floor(milestone.time / 60)}min
                        </div>

                        {/* Progress indicator for locked milestones */}
                        {!milestone.unlocked && (
                          <div className="w-full bg-gray-700/30 rounded-full h-1.5 mb-2">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  (watchTime / milestone.time) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}

                        {/* Action Button */}
                        {milestone.unlocked ? (
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs h-7 rounded-lg shadow-sm"
                            onClick={() =>
                              showToast({
                                title: `${milestone.label} ready to mint! 🎉`,
                                type: "success",
                              })
                            }
                          >
                            Mint NFT
                          </Button>
                        ) : (
                          <div className="w-full text-xs text-gray-500 h-7 flex items-center justify-center">
                            {Math.floor((milestone.time - watchTime) / 60)}m
                            left
                          </div>
                        )}

                        {/* Unlock effect */}
                        {milestone.unlocked && (
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-xl animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-2 ">
            {/* Live Chat - Twitch Style */}
            <Card className="border-border-primary bg-surface-secondary">
              <div className="h-[500px] flex flex-col">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-border-secondary">
                  <h3 className="font-semibold text-text-primary flex items-center gap-2">
                    💬 Live Chat
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {chatMessages.length}
                    </Badge>
                  </h3>
                </div>

                {/* Chat Messages - Clean Twitch Style */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="flex items-start gap-3 px-2 py-2 hover:bg-background-primary/30 rounded-md text-sm transition-colors"
                      >
                        {/* User Avatar - Larger and cleaner */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                          {msg.user[0].toUpperCase()}
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-purple-400 text-sm">
                              {msg.user}
                            </span>
                            <span className="text-xs text-text-tertiary px-1">
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-text-primary text-sm break-words leading-relaxed">
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 px-4">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center">
                        💬
                      </div>
                      <h4 className="font-medium text-text-primary mb-2">
                        No messages yet
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Be the first to start the conversation!
                      </p>
                    </div>
                  )}
                </div>

                {/* Chat Input - Fixed responsive layout */}
                <div className="p-3 border-t border-border-secondary bg-background-primary/30">
                  <div className="flex items-center gap-2">
                    {/* Current user avatar for input */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      <img
                        src="https://github.com/identicons/jasonlong.png"
                        alt="Your avatar"
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <div
                        className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold rounded-full"
                        style={{ display: "none" }}
                      >
                        ZP
                      </div>
                    </div>

                    {/* Input container - properly constrained */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && sendChatMessage()
                        }
                        placeholder="Say something nice..."
                        className="flex-1 min-w-0 px-3 py-2 bg-background-primary border border-border-secondary rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
                      />
                      <Button
                        onClick={sendChatMessage}
                        disabled={!chatMessage.trim()}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-2 shadow-sm transition-all hover:shadow-md disabled:opacity-50 flex-shrink-0"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border-primary bg-surface-secondary">
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-400" />
                  Support the Streamer
                </h3>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                    onClick={() => setShowTipModal(true)}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Send Crypto Tip
                  </Button>

                  <Button
                    variant={isFollowing ? "default" : "outline"}
                    className={`w-full ${
                      isFollowing
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "border-border-primary text-text-secondary hover:text-text-primary"
                    }`}
                    onClick={toggleFollow}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${
                        isFollowing ? "fill-current" : ""
                      }`}
                    />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-border-primary text-text-secondary hover:text-text-primary"
                    onClick={shareStream}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Stream
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Tips */}
            <Card className="border-border-primary bg-surface-secondary">
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Recent Tips
                  {tips.length > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {tips.length}
                    </Badge>
                  )}
                </h3>

                {tips.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {tips.map((tip) => (
                      <div
                        key={tip.id}
                        className="bg-background-primary border border-border-secondary rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-green-400 text-sm">
                            💰 {tip.amount} ETH
                          </span>
                          <span className="text-xs text-text-tertiary">
                            {new Date(tip.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-text-secondary text-sm mb-1">
                          From:{" "}
                          <span className="font-mono text-purple-400">
                            {tip.tipper_wallet.slice(0, 6)}...
                            {tip.tipper_wallet.slice(-4)}
                          </span>
                        </div>
                        {tip.message && (
                          <div className="text-text-primary text-sm mt-2 p-2 bg-surface-secondary rounded italic border-l-2 border-green-400">
                            "{tip.message}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 px-4">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="font-medium text-text-primary mb-2">
                      No tips yet
                    </h4>
                    <p className="text-sm text-text-secondary mb-3">
                      Be the first to show your support!
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        onClick={() => setShowNitroliteModal(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold"
                      >
                        ⚡ Nitrolite Tips
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowTipModal(true)}
                        className="border-green-600/50 text-green-400 hover:bg-green-600/10"
                      >
                        Classic Tip
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Classic Tip Modal */}
      {showTipModal && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          stream={stream}
        />
      )}

      {/* Nitrolite Universal Tip Modal */}
      {showNitroliteModal && (
        <NitroliteUniversalTipModal
          isOpen={showNitroliteModal}
          onClose={() => setShowNitroliteModal(false)}
          context="streaming"
          stream={stream}
        />
      )}

      {/* Yellow Network Real-time Notifications */}
      <YellowTipNotifications />
      <LiveTipCounter />

      {/* Debug Component - Development Only */}
      <WalletDebugger stream={stream} />
    </div>
  );
}
