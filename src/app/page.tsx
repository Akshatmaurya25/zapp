'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WalletGuard } from '@/components/auth/WalletGuard'
import { Loader2 } from 'lucide-react'

function DashboardContent() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to dashboard once wallet is connected
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex items-center gap-2 text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading Zapp...</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <WalletGuard>
      <DashboardContent />
    </WalletGuard>
  )
}
