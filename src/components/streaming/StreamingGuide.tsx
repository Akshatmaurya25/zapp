'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Monitor,
  Download,
  Settings,
  Play,
  Radio,
  CheckCircle,
  ExternalLink,
  Copy,
  AlertCircle,
  HelpCircle,
  Zap,
  Eye,
  DollarSign,
  Users,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

export function StreamingGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started')

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
          <Radio className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Streaming Guide</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Everything you need to know to start streaming on our platform. From setup to going live,
          we'll walk you through the entire process.
        </p>
      </div>

      {/* Quick Start */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Zap className="w-5 h-5" />
            Quick Start (5 minutes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">1</div>
              <h3 className="font-medium text-text-primary mb-2">Download OBS</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://obsproject.com/download', '_blank')}
                className="border-border-primary text-text-secondary"
              >
                <Download className="w-4 h-4 mr-1" />
                Get OBS
              </Button>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">2</div>
              <h3 className="font-medium text-text-primary mb-2">Create Stream</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/streaming/dashboard'}
                className="border-border-primary text-text-secondary"
              >
                <Play className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">3</div>
              <h3 className="font-medium text-text-primary mb-2">Configure OBS</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSection('obs-setup')}
                className="border-border-primary text-text-secondary"
              >
                <Settings className="w-4 h-4 mr-1" />
                Setup
              </Button>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">4</div>
              <h3 className="font-medium text-text-primary mb-2">Go Live</h3>
              <Button
                variant="outline"
                size="sm"
                className="border-border-primary text-text-secondary"
              >
                <Radio className="w-4 h-4 mr-1" />
                Stream
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Sections */}
      <div className="space-y-4">

        {/* Getting Started */}
        <Card className="border-border-primary bg-surface-secondary">
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('getting-started')}
          >
            <CardTitle className="flex items-center justify-between text-text-primary">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-purple-400" />
                Getting Started
              </div>
              {expandedSection === 'getting-started' ?
                <ChevronDown className="w-5 h-5" /> :
                <ChevronRight className="w-5 h-5" />
              }
            </CardTitle>
          </CardHeader>
          {expandedSection === 'getting-started' && (
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-text-primary mb-3">What You Need</h3>
                  <ul className="space-y-2 text-text-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      A computer with decent specs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Stable internet connection (5+ Mbps upload)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      OBS Studio (free streaming software)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Connected wallet on our platform
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-3">Platform Benefits</h3>
                  <ul className="space-y-2 text-text-secondary">
                    <li className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      Instant crypto tips from viewers
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      Web3 gaming community
                    </li>
                    <li className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-400" />
                      Real-time analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      97.5% revenue share
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* OBS Setup */}
        <Card className="border-border-primary bg-surface-secondary">
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('obs-setup')}
          >
            <CardTitle className="flex items-center justify-between text-text-primary">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                OBS Setup Guide
              </div>
              {expandedSection === 'obs-setup' ?
                <ChevronDown className="w-5 h-5" /> :
                <ChevronRight className="w-5 h-5" />
              }
            </CardTitle>
          </CardHeader>
          {expandedSection === 'obs-setup' && (
            <CardContent className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-200 mb-1">Important</h4>
                    <p className="text-blue-300 text-sm">
                      First create a stream in your dashboard to get your unique RTMP URL and Stream Key.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-medium text-text-primary">Open OBS Studio</h4>
                    <p className="text-text-secondary text-sm">Launch OBS and go to Settings (bottom right corner)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-medium text-text-primary">Navigate to Stream Settings</h4>
                    <p className="text-text-secondary text-sm">In Settings, click on "Stream" in the left sidebar</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-medium text-text-primary">Configure Service</h4>
                    <p className="text-text-secondary text-sm">Set Service to "Custom..." and paste your RTMP details</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-medium text-text-primary">Start Streaming</h4>
                    <p className="text-text-secondary text-sm">Click "Start Streaming" in the main OBS interface</p>
                  </div>
                </div>
              </div>

              {/* OBS Settings Example */}
              <div className="bg-background-tertiary border border-border-secondary rounded-lg p-4">
                <h4 className="font-medium text-text-primary mb-3">Example OBS Settings</h4>
                <div className="space-y-3 font-mono text-sm">
                  <div>
                    <span className="text-text-secondary">Service:</span>
                    <span className="text-text-primary ml-2">Custom...</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Server:</span>
                    <span className="text-text-primary ml-2">rtmp://localhost:1935/live/[your-stream-key]</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 px-2"
                      onClick={() => copyToClipboard('rtmp://localhost:1935/live/')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div>
                    <span className="text-text-secondary">Stream Key:</span>
                    <span className="text-text-primary ml-2">[From your dashboard]</span>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Troubleshooting */}
        <Card className="border-border-primary bg-surface-secondary">
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('troubleshooting')}
          >
            <CardTitle className="flex items-center justify-between text-text-primary">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-yellow-400" />
                Troubleshooting
              </div>
              {expandedSection === 'troubleshooting' ?
                <ChevronDown className="w-5 h-5" /> :
                <ChevronRight className="w-5 h-5" />
              }
            </CardTitle>
          </CardHeader>
          {expandedSection === 'troubleshooting' && (
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border border-border-secondary rounded-lg p-4">
                  <h4 className="font-medium text-text-primary mb-2">Stream won't start</h4>
                  <ul className="text-text-secondary text-sm space-y-1">
                    <li>• Double-check your RTMP URL and Stream Key</li>
                    <li>• Ensure your internet connection is stable</li>
                    <li>• Try reducing your bitrate in OBS settings</li>
                    <li>• Restart OBS and try again</li>
                  </ul>
                </div>

                <div className="border border-border-secondary rounded-lg p-4">
                  <h4 className="font-medium text-text-primary mb-2">Poor stream quality</h4>
                  <ul className="text-text-secondary text-sm space-y-1">
                    <li>• Check your upload speed (minimum 5 Mbps)</li>
                    <li>• Lower your bitrate (try 2500-3500 kbps)</li>
                    <li>• Use hardware encoding if available</li>
                    <li>• Close other bandwidth-heavy applications</li>
                  </ul>
                </div>

                <div className="border border-border-secondary rounded-lg p-4">
                  <h4 className="font-medium text-text-primary mb-2">Audio/Video sync issues</h4>
                  <ul className="text-text-secondary text-sm space-y-1">
                    <li>• Check your audio device settings in OBS</li>
                    <li>• Ensure your game capture is configured properly</li>
                    <li>• Try different encoding settings</li>
                    <li>• Restart your streaming software</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-200 mb-1">Still having issues?</h4>
                    <p className="text-yellow-300 text-sm">
                      Join our Discord community for real-time help from other streamers and our support team.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

      </div>

      {/* Call to Action */}
      <Card className="border-purple-500/30 bg-purple-500/5">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold text-text-primary mb-3">Ready to Start Streaming?</h3>
          <p className="text-text-secondary mb-6">
            Join thousands of streamers earning crypto while doing what they love.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => window.location.href = '/streaming/dashboard'}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Create Your First Stream
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://obsproject.com/download', '_blank')}
              className="border-border-primary text-text-secondary hover:text-text-primary"
            >
              <Download className="w-4 h-4 mr-2" />
              Download OBS Studio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}