'use client'

import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import ERC20ABI from '@/lib/abis/ERC20ABI.json'

export function useTokenBalance(tokenAddress, userAddress) {
  const { data: balance, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    enabled: !!userAddress && !!tokenAddress,
    watch: true,
  })

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'decimals',
    enabled: !!tokenAddress,
  })

  const formattedBalance = balance && decimals
    ? formatUnits(balance, decimals)
    : '0'

  return {
    balance: formattedBalance,
    rawBalance: balance,
    decimals,
    isLoading,
    refetch,
  }
}
