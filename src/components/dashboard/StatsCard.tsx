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
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]'
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      text: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]'
    },
    purple: {
      gradient: 'from-purple-500 to-pink-500',
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      glow: 'shadow-[0_0_20px_rgba(147,51,234,0.3)]'
    },
    yellow: {
      gradient: 'from-yellow-500 to-orange-500',
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]'
    },
    red: {
      gradient: 'from-red-500 to-pink-500',
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
    },
    pink: {
      gradient: 'from-pink-500 to-rose-500',
      text: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
      glow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]'
    }
  }

  const styles = colorClasses[color]

  return (
    <Card className={`relative overflow-hidden cyber-card border-2 ${styles.border} ${styles.glow} hover-lift group`}>
      {/* Scan line effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-50 animate-pulse" />

      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-sm text-gray-300 font-medium tracking-wide uppercase">
              {title}
            </p>
            <div className="space-y-2">
              <p className={`text-3xl font-black ${styles.text} tracking-tight`}>
                {value}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
              )}
              {trend && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${trend.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend.value > 0 ? '↗' : '↘'} {trend.value > 0 ? '+' : ''}{trend.value}%
                  </span>
                  <span className="text-xs text-gray-500">{trend.label}</span>
                </div>
              )}
            </div>
          </div>

          <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${styles.gradient} ${styles.bg} border ${styles.border} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-7 w-7 text-white drop-shadow-lg`} />
            {/* Glow effect on icon */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${styles.gradient} opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-300`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}