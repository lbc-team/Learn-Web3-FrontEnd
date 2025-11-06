'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import FarmABI from '@/lib/abis/FarmABI.json'
import { CONTRACTS } from '@/lib/constants/contracts'

export function useFarm() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const stake = async (poolId, amount) => {
    try {
      const amountWei = parseUnits(amount.toString(), 18)

      await writeContract({
        address: CONTRACTS.FARM,
        abi: FarmABI,
        functionName: 'stake',
        args: [poolId, amountWei],
      })
    } catch (err) {
      console.error('Stake failed:', err)
      throw err
    }
  }

  const unstake = async (poolId, amount) => {
    try {
      const amountWei = parseUnits(amount.toString(), 18)

      await writeContract({
        address: CONTRACTS.FARM,
        abi: FarmABI,
        functionName: 'unstake',
        args: [poolId, amountWei],
      })
    } catch (err) {
      console.error('Unstake failed:', err)
      throw err
    }
  }

  const harvest = async (poolId) => {
    try {
      await writeContract({
        address: CONTRACTS.FARM,
        abi: FarmABI,
        functionName: 'harvest',
        args: [poolId],
      })
    } catch (err) {
      console.error('Harvest failed:', err)
      throw err
    }
  }

  return {
    stake,
    unstake,
    harvest,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
