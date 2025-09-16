'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { formatAddress } from '@/lib/web3'
import { 
  Zap, 
  Home, 
  User, 
  MessageSquare, 
  Trophy, 
  Bell,
  Search,
  Plus,
  Wallet,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Users,
  Coins
} from 'lucide-react'

export function Navigation() {
  const { address, disconnectWallet, chain, isConnected } = useWallet()
  const { user } = useUser()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!isConnected) return null

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home', active: pathname === '/dashboard' },
    { href: '/feed', icon: TrendingUp, label: 'Feed', active: pathname === '/feed' },
    { href: '/discover', icon: Search, label: 'Discover', active: pathname === '/discover' },
    { href: '/community', icon: Users, label: 'Community', active: pathname === '/community' },
    { href: '/achievements', icon: Trophy, label: 'Achievements', active: pathname === '/achievements' },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 border-b border-border-primary bg-background-primary/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">
              Zapp
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={item.active ? "secondary" : "ghost"}
                    size="sm"
                    className={`gap-2 ${item.active ? 'bg-primary-500 text-white' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Create Post Button */}
            <Link href="/post/create">
              <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                <Plus className="h-4 w-4 mr-2" />
                Post
              </Button>
            </Link>

            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Avatar className="h-8 w-8 border border-gray-600">
                    {user.avatar_ipfs ? (
                      <AvatarImage 
                        src={`https://gateway.pinata.cloud/ipfs/${user.avatar_ipfs}`}
                        alt={user.display_name || user.username || 'User avatar'}
                      />
                    ) : (
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-sm">
                    <div className="text-text-primary font-medium">{user.display_name}</div>
                    <div className="text-text-tertiary">@{user.username}</div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 px-2 py-1 bg-background-tertiary rounded-lg text-xs">
                  <Wallet className="h-3 w-3 text-text-tertiary" />
                  <span className="text-text-secondary">{formatAddress(address || '', 4)}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                  className="text-text-secondary border-border-primary hover:bg-background-tertiary"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-border-primary bg-background-primary/95 backdrop-blur-sm">
        <div className="px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary">Zapp</span>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-text-secondary"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background-primary border-b border-border-primary shadow-lg">
            <div className="p-4 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant={item.active ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 ${item.active ? 'bg-primary-500 text-white' : 'text-text-secondary'}`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
              
              <div className="border-t border-border-secondary pt-3 mt-3">
                <Link href="/post/create" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </Link>
              </div>

              {user && (
                <div className="border-t border-border-secondary pt-3 space-y-3">
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-tertiary transition-colors">
                      <Avatar className="h-10 w-10">
                        {user.avatar_ipfs ? (
                          <AvatarImage src={`https://gateway.pinata.cloud/ipfs/${user.avatar_ipfs}`} />
                        ) : (
                          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="text-text-primary font-medium">{user.display_name}</div>
                        <div className="text-text-tertiary text-sm">@{user.username}</div>
                      </div>
                    </div>
                  </Link>
                  
                  <Button
                    variant="outline"
                    onClick={disconnectWallet}
                    className="w-full text-text-secondary border-border-primary"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect Wallet
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16" />
    </>
  )
}

// Mobile Bottom Navigation (optional)
export function MobileBottomNav() {
  const pathname = usePathname()
  const { isConnected } = useWallet()

  if (!isConnected) return null

  const bottomNavItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/feed', icon: TrendingUp, label: 'Feed' },
    { href: '/post/create', icon: Plus, label: 'Post' },
    { href: '/achievements', icon: Trophy, label: 'Awards' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background-primary/95 backdrop-blur-sm border-t border-border-primary z-40">
      <div className="grid grid-cols-5 h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center justify-center h-full transition-colors ${
                isActive
                  ? 'text-primary-400'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}>
                <Icon className={`h-5 w-5 ${item.href === '/post/create' ? 'p-1 bg-primary-500 rounded-full text-white' : ''}`} />
                <span className="text-xs mt-1">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-bottom bg-background-primary" />
    </div>
  )
}