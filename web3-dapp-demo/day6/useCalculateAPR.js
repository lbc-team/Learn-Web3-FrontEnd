'use client'

import { useMemo } from 'react'
import { usePoolData } from './usePoolData'

export function useCalculateAPR(poolAddress, rewardPerBlock, rewardTokenPrice, lpTokenPrice) {
  const { totalSupply } = usePoolData(poolAddress)

  const apr = useMemo(() => {
    if (!totalSupply || !rewardPerBlock || !rewardTokenPrice || !lpTokenPrice) {
      return '0'
    }

    try {
      // 假设每年有 2,628,000 个区块（15秒一个块）
      const blocksPerYear = 2628000
      const yearlyReward = Number(rewardPerBlock) * blocksPerYear
      const yearlyRewardValue = yearlyReward * Number(rewardTokenPrice)
      const totalStakedValue = Number(totalSupply) * Number(lpTokenPrice)

      if (totalStakedValue === 0) return '0'

      const aprValue = (yearlyRewardValue / totalStakedValue) * 100

      return aprValue.toFixed(2)
    } catch (err) {
      console.error('APR calculation error:', err)
      return '0'
    }
  }, [totalSupply, rewardPerBlock, rewardTokenPrice, lpTokenPrice])

  return apr
}
