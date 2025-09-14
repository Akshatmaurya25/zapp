'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'pink'
  trend?: {
    value: number
    label: string
  }
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  trend 
}: StatsCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-400 bg-blue-500/20',
    green: 'from-green-500 to-green-600 text-green-400 bg-green-500/20',
    purple: 'from-purple-500 to-purple-600 text-purple-400 bg-purple-500/20',
    yellow: 'from-yellow-500 to-yellow-600 text-yellow-400 bg-yellow-500/20',
    red: 'from-red-500 to-red-600 text-red-400 bg-red-500/20',
    pink: 'from-pink-500 to-pink-600 text-pink-400 bg-pink-500/20',
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
              {trend && (
                <div className="flex items-center gap-1">
                  <span className={`text-xs ${trend.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend.value > 0 ? '+' : ''}{trend.value}%
                  </span>
                  <span className="text-xs text-gray-500">{trend.label}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className={`p-3 rounded-xl ${colorClasses[color].split(' ')[2]}`}>
            <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[1]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}