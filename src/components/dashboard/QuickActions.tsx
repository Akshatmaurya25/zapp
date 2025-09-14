'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  Plus, 
  Users, 
  Trophy, 
  Search, 
  TrendingUp, 
  Gamepad2,
  MessageSquare,
  Coins
} from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  const actions = [
    {
      title: 'Create Post',
      description: 'Share your gaming moments',
      icon: Plus,
      href: '/post/create',
      color: 'blue',
      primary: true
    },
    {
      title: 'Discover',
      description: 'Find new content',
      icon: Search,
      href: '/discover',
      color: 'purple'
    },
    {
      title: 'Trending',
      description: 'What\'s hot now',
      icon: TrendingUp,
      href: '/trending',
      color: 'green'
    },
    {
      title: 'Gaming Hub',
      description: 'Browse by games',
      icon: Gamepad2,
      href: '/games',
      color: 'yellow'
    },
    {
      title: 'Community',
      description: 'Connect with gamers',
      icon: Users,
      href: '/community',
      color: 'pink'
    },
    {
      title: 'Achievements',
      description: 'View your NFTs',
      icon: Trophy,
      href: '/achievements',
      color: 'red'
    }
  ]

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          
          return (
            <Link key={action.href} href={action.href}>
              <div className={`
                p-4 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer
                ${action.primary 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 hover:from-blue-700 hover:to-purple-700' 
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'
                }
              `}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    action.primary ? 'bg-white/20' : 'bg-gray-700'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      action.primary ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${
                      action.primary ? 'text-white' : 'text-gray-300'
                    }`}>
                      {action.title}
                    </p>
                    <p className={`text-xs ${
                      action.primary ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}