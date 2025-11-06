'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePoolData } from './usePoolData'

// 通过流动性池计算代币价格
export function useTokenPrice(token0, token1, poolAddress, token1Price = 1) {
  const { reserve0, reserve1 } = usePoolData(poolAddress)

  const token0Price = useMemo(() => {
    if (!reserve0 || !reserve1 || Number(reserve0) === 0) return '0'

    // token0 价格 = (reserve1 / reserve0) * token1Price
    const price = (Number(reserve1) / Number(reserve0)) * token1Price

    return price.toFixed(4)
  }, [reserve0, reserve1, token1Price])

  return token0Price
}

// 或者从外部 API 获取价格（例如 CoinGecko）
export function useTokenPriceFromAPI(tokenSymbol) {
  const [price, setPrice] = useState('0')

  useEffect(() => {
    // 简化示例，实际应使用 API
    const mockPrices = {
      ETH: '2000',
      USDT: '1',
      USDC: '1',
    }

    setPrice(mockPrices[tokenSymbol] || '0')
  }, [tokenSymbol])

  return price
}
