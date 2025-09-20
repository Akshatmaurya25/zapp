'use client'

import { Navigation, MobileBottomNav } from '@/components/layout/Navigation'

export default function StreamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation />
      {children}
      <MobileBottomNav />
    </>
  )
}