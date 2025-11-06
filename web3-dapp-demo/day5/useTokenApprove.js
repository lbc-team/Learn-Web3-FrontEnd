'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import ERC20ABI from '@/lib/abis/ERC20ABI.json'

export function useTokenApprove() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async (tokenAddress, spenderAddress, amount, decimals = 18) => {
    try {
      const amountInWei = parseUnits(amount.toString(), decimals)

      await writeContract({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [spenderAddress, amountInWei],
      })
    } catch (err) {
      console.error('Approve failed:', err)
      throw err
    }
  }

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
