'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
  autoplay?: boolean
  onLoadStart?: () => void
  onError?: (error: any) => void
  onCanPlay?: () => void
  onTimeout?: () => void
}

export default function VideoPlayer({
  src,
  poster,
  className = '',
  autoplay = true,
  onLoadStart,
  onError,
  onCanPlay,
  onTimeout
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(false)
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) {
      console.log('VideoPlayer: No video element or source provided')
      setError('No video source available')
      setIsLoading(false)
      return
    }

    // Check if the source is a valid URL
    if (!src.startsWith('http://') && !src.startsWith('https://')) {
      console.log('VideoPlayer: Invalid source URL:', src)
      setError('Invalid video source')
      setIsLoading(false)
      return
    }

    // Reset state for new src
    setIsLoading(true)
    setError(null)
    setHasTimedOut(false)
    retryCountRef.current = 0

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set timeout for HLS loading (60 seconds)
    timeoutRef.current = setTimeout(() => {
      console.log('VideoPlayer: HLS loading timeout reached')
      setHasTimedOut(true)
      setIsLoading(false)
      setError('Stream transcoding unavailable. Switching to live view...')
      if (onTimeout) {
        onTimeout()
      }
    }, 60000)

    if (onLoadStart) {
      onLoadStart()
    }

    if (Hls.isSupported()) {
      // Use HLS.js for browsers that support MSE
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 3,
        maxFragLookUpTolerance: 0.25,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10
      })

      hlsRef.current = hls

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Clear timeout on successful load
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setIsLoading(false)
        setError(null)
        if (autoplay) {
          video.play().catch(console.error)
        }
        if (onCanPlay) {
          onCanPlay()
        }
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('HLS Error (expected during setup):', data.details)
        if (data.fatal && !hasTimedOut) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (data.details === 'manifestLoadError') {
                retryCountRef.current += 1
                if (retryCountRef.current <= 5) {
                  setError('Video transcoding in progress. Please wait...')
                  // Retry with exponential backoff
                  const retryDelay = Math.min(3000 * retryCountRef.current, 15000)
                  setTimeout(() => {
                    if (!hasTimedOut && hlsRef.current) {
                      console.log(`Retrying HLS manifest load... (attempt ${retryCountRef.current + 1})`)
                      hls.startLoad()
                    }
                  }, retryDelay)
                } else {
                  console.log('Max retry attempts reached for HLS manifest')
                  setError('Stream transcoding taking longer than expected. Switching to live view...')
                  if (onTimeout) {
                    onTimeout()
                  }
                }
              } else {
                setError('Stream is not ready yet. Please wait for the streamer to start broadcasting.')
                setTimeout(() => {
                  if (!hasTimedOut && hlsRef.current) {
                    hls.startLoad()
                  }
                }, 5000)
              }
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error occurred while playing stream')
              hls.recoverMediaError()
              break
            default:
              setError('Stream is setting up. Please wait a moment...')
              hls.destroy()
              break
          }
          // Don't call onError for expected manifest load errors during setup
          if (onError && data.details !== 'manifestLoadError') {
            onError(data)
          }
        }
      })

      // Handle video events
      video.addEventListener('loadstart', () => setIsLoading(true))
      video.addEventListener('canplay', () => {
        setIsLoading(false)
        if (onCanPlay) {
          onCanPlay()
        }
      })
      video.addEventListener('play', () => setIsPlaying(true))
      video.addEventListener('pause', () => setIsPlaying(false))
      video.addEventListener('volumechange', () => {
        setVolume(video.volume)
        setIsMuted(video.muted)
      })

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        hls.destroy()
        hlsRef.current = null
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Use native HLS support (Safari)
      video.src = src
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false)
        if (autoplay) {
          video.play().catch(console.error)
        }
        if (onCanPlay) {
          onCanPlay()
        }
      })
    } else {
      setError('HLS is not supported in this browser')
      if (onError) {
        onError(new Error('HLS not supported'))
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [src, autoplay, onLoadStart, onError, onCanPlay, onTimeout, hasTimedOut])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().catch(console.error)
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
  }

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current
    if (!video) return

    video.volume = newVolume
    if (newVolume === 0) {
      video.muted = true
    } else if (video.muted) {
      video.muted = false
    }
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen().catch(console.error)
    }
  }

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        playsInline
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white p-4">
            <p className="text-lg font-medium mb-2">Stream Error</p>
            <p className="text-sm opacity-75">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Reload Stream
            </Button>
          </div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isLoading && !error && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button
            variant="ghost"
            size="lg"
            className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-4"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </Button>
        </div>
      )}

      {/* Controls */}
      {!isLoading && !error && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-200 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={toggleFullscreen}
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Live indicator */}
      {!isLoading && !error && (
        <div className="absolute top-4 left-4">
          <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>
      )}
    </div>
  )
}