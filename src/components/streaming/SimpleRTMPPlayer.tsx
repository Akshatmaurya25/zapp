'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SimpleRTMPPlayerProps {
  streamKey: string
  isReceivingContent: boolean
  className?: string
}

export default function SimpleRTMPPlayer({
  streamKey,
  isReceivingContent,
  className = ''
}: SimpleRTMPPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
      if (!isReceivingContent) {
        setError('No stream data available')
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [isReceivingContent])

  if (isLoading) {
    return (
      <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading stream...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !isReceivingContent) {
    return (
      <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center text-white p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Stream Not Available</h3>
            <p className="text-gray-300 text-sm">
              {error || 'Waiting for streamer to start broadcasting...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-black rounded-lg overflow-hidden relative ${className}`}>
      <div className="aspect-video flex items-center justify-center relative">
        {/* Animated background to show activity */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-purple-900/30 to-blue-900/30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        </div>

        {/* Live stream overlay */}
        <div className="relative z-10 text-center text-white">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center relative">
            <div className="w-4 h-4 bg-red-300 rounded-full animate-ping absolute" />
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-red-500 rounded-full" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3 text-red-400">🔴 LIVE STREAM</h2>
          <p className="text-xl mb-2">OBS Connected Successfully!</p>
          <p className="text-gray-300 mb-4">
            Your stream is broadcasting via RTMP protocol
          </p>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
            <p className="text-green-300 text-sm">
              ✅ Stream Status: Active and receiving video data
            </p>
          </div>

          {/* Instructions for viewing the stream */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4 text-left">
            <h4 className="text-blue-300 font-semibold mb-2">📺 How to watch this stream:</h4>
            <div className="text-blue-200 text-sm space-y-2">
              <p><strong>Option 1:</strong> Use VLC Media Player</p>
              <p className="ml-4 font-mono text-xs bg-black/30 p-2 rounded break-all">rtmp://localhost:1935/live{streamKey}/{streamKey}</p>

              <p><strong>Option 2:</strong> Use OBS to restream</p>
              <p className="ml-4 text-xs">Open OBS → Add Source → Media Source → Use network URL above</p>

              <p><strong>Option 3:</strong> Wait for HLS transcoding</p>
              <p className="ml-4 text-xs">Web playback will be available once video transcoding is ready</p>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Stream ID: {streamKey.slice(0, 12)}...
          </p>
        </div>

        {/* Live indicator */}
        <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 shadow-lg">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span>LIVE</span>
        </div>

        {/* Connection status */}
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded text-sm font-medium shadow-lg">
          📡 RTMP Active
        </div>

        {/* Status bar */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Broadcasting</span>
              </div>
              <div className="text-white text-sm">
                Protocol: RTMP/TCP
              </div>
            </div>
            <div className="text-gray-300 text-xs">
              Video transcoding: Coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}