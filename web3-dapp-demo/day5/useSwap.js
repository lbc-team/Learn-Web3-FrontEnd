'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import SwapRouterABI from '@/lib/abis/SwapRouterABI.json'
import { CONTRACTS } from '@/lib/constants/contracts'

export function useSwap() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const swap = async (fromToken, toToken, amountIn, address, slippage = 0.5) => {
    try {
      const amountInWei = parseUnits(amountIn.toString(), 18)
      const amountOutMin = amountInWei * BigInt(100 - slippage * 100) / BigInt(100) // 简化计算
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 分钟

      await writeContract({
        address: CONTRACTS.SWAP_ROUTER,
        abi: SwapRouterABI,
        functionName: 'swapExactTokensForTokens',
        args: [
          CONTRACTS[fromToken],
          CONTRACTS[toToken],
          amountInWei,
          amountOutMin,
          address, // to
          deadline,
        ],
      })
    } catch (err) {
      console.error('Swap failed:', err)
      throw err
    }
  }

  return {
    swap,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
