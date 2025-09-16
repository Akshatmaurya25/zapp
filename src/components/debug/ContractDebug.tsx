'use client'

import React from 'react'
import { usePostContract } from '@/hooks/usePostContract'

export function ContractDebug() {
  const {
    isContractAvailable,
    postFee,
    totalPosts,
    recentPostIds
  } = usePostContract()

  const contractAddress = process.env.NEXT_PUBLIC_POST_REGISTRY_ADDRESS

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">🔍 Contract Debug Info</h3>
      <div className="space-y-1">
        <div>
          <strong>Contract Address:</strong>
          <br />
          <span className="text-green-400">{contractAddress || 'Not set'}</span>
        </div>
        <div>
          <strong>Is Available:</strong>
          <span className={isContractAvailable ? 'text-green-400' : 'text-red-400'}>
            {isContractAvailable ? ' ✅ Yes' : ' ❌ No'}
          </span>
        </div>
        <div>
          <strong>Post Fee:</strong>
          <span className="text-blue-400">{postFee} STT</span>
        </div>
        <div>
          <strong>Total Posts:</strong>
          <span className="text-yellow-400">{totalPosts}</span>
        </div>
        <div>
          <strong>Recent Posts:</strong>
          <span className="text-purple-400">{recentPostIds?.length || 0}</span>
        </div>
      </div>
    </div>
  )
}