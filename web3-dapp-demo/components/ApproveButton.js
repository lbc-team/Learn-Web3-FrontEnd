'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from '@/lib/utils/units'
import { ERC20_ABI } from '@/lib/abis'

/**
 * ApproveButton Component
 *
 * Handles ERC20 token allowance checking and approval flow
 *
 * Props:
 * - tokenAddress: Address of the ERC20 token
 * - spenderAddress: Address that will spend the tokens (e.g., router, pool)
 * - amount: Amount to approve (in wei, as bigint or string)
 * - onApproved: Callback when approval is successful
 * - children: Button label when no approval needed
 */

export default function ApproveButton({
  tokenAddress,
  spenderAddress,
  amount,
  onApproved,
  children,
  disabled = false
}) {
  const { address } = useAccount()
  const [needsApproval, setNeedsApproval] = useState(false)

  // Read current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && spenderAddress ? [address, spenderAddress] : undefined,
    enabled: Boolean(address && tokenAddress && spenderAddress && amount)
  })

  // Approve transaction
  const { data: approveHash, writeContract: approve, isPending: isApproving } = useWriteContract()

  // Wait for approve transaction
  const { isLoading: isConfirming, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveHash
  })

  // Check if approval is needed
  useEffect(() => {
    // Check if data is not yet loaded (undefined/null) or amount is not set
    if (amount === undefined || amount === null || allowance === undefined || allowance === null) {
      setNeedsApproval(false)
      return
    }

    const amountBig = typeof amount === 'bigint' ? amount : BigInt(amount || 0)
    const allowanceBig = BigInt(allowance)

    // Need approval if allowance is less than amount (including when allowance is 0)
    setNeedsApproval(allowanceBig < amountBig)
  }, [amount, allowance])

  // Refetch allowance after approval
  useEffect(() => {
    if (isApproved) {
      refetchAllowance()
      onApproved?.()
    }
  }, [isApproved, refetchAllowance, onApproved])

  const handleApprove = () => {
    if (!tokenAddress || !spenderAddress || !amount) return

    // Approve max amount for better UX (user doesn't need to approve again)
    const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

    approve({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, maxUint256]
    })
  }

  // If no approval needed, render children
  if (!needsApproval) {
    return children
  }

  return (
    <button
      onClick={handleApprove}
      disabled={disabled || isApproving || isConfirming}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
    >
      {isApproving || isConfirming ? 'Approving...' : 'Approve Token'}
    </button>
  )
}
