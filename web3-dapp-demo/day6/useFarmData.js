'use client'

import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import FarmABI from '@/lib/abis/FarmABI.json'
import { CONTRACTS } from '@/lib/constants/contracts'

// 扩展 Farm ABI（添加查询方法）
const FARM_READ_ABI = [
  ...FarmABI,
  {
    "inputs": [
      {"name": "poolId", "type": "uint256"},
      {"name": "user", "type": "address"}
    ],
    "name": "userInfo",
    "outputs": [
      {"name": "amount", "type": "uint256"},
      {"name": "rewardDebt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "poolId", "type": "uint256"},
      {"name": "user", "type": "address"}
    ],
    "name": "pendingReward",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "poolId", "type": "uint256"}],
    "name": "poolInfo",
    "outputs": [
      {"name": "lpToken", "type": "address"},
      {"name": "allocPoint", "type": "uint256"},
      {"name": "lastRewardBlock", "type": "uint256"},
      {"name": "accRewardPerShare", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

export function useFarmData(poolId, userAddress) {
  // 查询用户质押信息
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: CONTRACTS.FARM,
    abi: FARM_READ_ABI,
    functionName: 'userInfo',
    args: userAddress ? [poolId, userAddress] : undefined,
    enabled: !!userAddress && poolId !== undefined,
    watch: true,
  })

  // 查询待领取奖励
  const { data: pendingReward } = useReadContract({
    address: CONTRACTS.FARM,
    abi: FARM_READ_ABI,
    functionName: 'pendingReward',
    args: userAddress ? [poolId, userAddress] : undefined,
    enabled: !!userAddress && poolId !== undefined,
    watch: true,
  })

  // 查询池子信息
  const { data: poolInfo } = useReadContract({
    address: CONTRACTS.FARM,
    abi: FARM_READ_ABI,
    functionName: 'poolInfo',
    args: poolId !== undefined ? [poolId] : undefined,
    enabled: poolId !== undefined,
  })

  return {
    stakedAmount: userInfo?.[0] ? formatUnits(userInfo[0], 18) : '0',
    rewardDebt: userInfo?.[1] ? formatUnits(userInfo[1], 18) : '0',
    pendingReward: pendingReward ? formatUnits(pendingReward, 18) : '0',
    lpToken: poolInfo?.[0],
    allocPoint: poolInfo?.[1],
    rawStakedAmount: userInfo?.[0],
    rawPendingReward: pendingReward,
    refetchUserInfo,
  }
}
