'use client'

import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'

// 示例 Pool ABI（根据实际合约调整）
const POOL_ABI = [
  {
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      {"name": "reserve0", "type": "uint112"},
      {"name": "reserve1", "type": "uint112"},
      {"name": "blockTimestampLast", "type": "uint32"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

export function usePoolData(poolAddress) {
  const { data: reserves } = useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'getReserves',
    enabled: !!poolAddress,
    watch: true,
  })

  const { data: totalSupply } = useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'totalSupply',
    enabled: !!poolAddress,
    watch: true,
  })

  return {
    reserve0: reserves?.[0] ? formatUnits(reserves[0], 18) : '0',
    reserve1: reserves?.[1] ? formatUnits(reserves[1], 18) : '0',
    totalSupply: totalSupply ? formatUnits(totalSupply, 18) : '0',
    rawReserves: reserves,
    rawTotalSupply: totalSupply,
  }
}
