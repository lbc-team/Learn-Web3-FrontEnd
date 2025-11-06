'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import PoolFactoryABI from '@/lib/abis/PoolFactoryABI.json'
import { CONTRACTS } from '@/lib/constants/contracts'

export function useLiquidity() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const addLiquidity = async (token0, token1, amount0, amount1, address, slippage = 0.5) => {
    try {
      const amount0Wei = parseUnits(amount0.toString(), 18)
      const amount1Wei = parseUnits(amount1.toString(), 18)
      const amount0Min = amount0Wei * BigInt(100 - slippage * 100) / BigInt(100)
      const amount1Min = amount1Wei * BigInt(100 - slippage * 100) / BigInt(100)
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20

      await writeContract({
        address: CONTRACTS.POOL_FACTORY,
        abi: PoolFactoryABI,
        functionName: 'addLiquidity',
        args: [
          CONTRACTS[token0],
          CONTRACTS[token1],
          amount0Wei,
          amount1Wei,
          amount0Min,
          amount1Min,
          address,
          deadline,
        ],
      })
    } catch (err) {
      console.error('Add liquidity failed:', err)
      throw err
    }
  }

  const removeLiquidity = async (token0, token1, liquidityAmount, address, slippage = 0.5) => {
    try {
      const liquidityWei = parseUnits(liquidityAmount.toString(), 18)
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20

      await writeContract({
        address: CONTRACTS.POOL_FACTORY,
        abi: PoolFactoryABI,
        functionName: 'removeLiquidity',
        args: [
          CONTRACTS[token0],
          CONTRACTS[token1],
          liquidityWei,
          0, // amountAMin (可根据实际情况调整)
          0, // amountBMin
          address,
          deadline,
        ],
      })
    } catch (err) {
      console.error('Remove liquidity failed:', err)
      throw err
    }
  }

  return {
    addLiquidity,
    removeLiquidity,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
