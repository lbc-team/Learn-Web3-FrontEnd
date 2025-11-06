# Day 6: DAPP 交互实现（二）- 数据查询与展示

## 本节目标

实现智能合约数据查询（只读操作，无需 Gas 费）：
- **查询代币余额**
- **查询流动性池储备量**
- **查询质押信息和奖励**
- **计算 APR 和价格**
- **实现 Dashboard 实时数据**

---

## 1. 基础数据查询

### 1.1 查询代币余额

使用 `useReadContract` 查询单个合约：

```javascript
'use client'

import { useReadContract } from 'wagmi'
import ERC20ABI from '@/lib/abis/ERC20ABI.json'

function TokenBalance({ tokenAddress, userAddress }) {
  const { data: balance, isLoading } = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    enabled: !!userAddress, // 只有在有地址时才查询
    watch: true, // 自动监听变化
  })

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'decimals',
  })

  if (isLoading) return <div>Loading...</div>

  const formattedBalance = balance && decimals
    ? (Number(balance) / 10 ** Number(decimals)).toFixed(4)
    : '0.00'

  return <div>{formattedBalance}</div>
}
```

### 1.2 批量查询多个代币余额

使用 `useReadContracts` 批量查询：

```javascript
'use client'

import { useReadContracts } from 'wagmi'
import ERC20ABI from '@/lib/abis/ERC20ABI.json'
import { CONTRACTS } from '@/lib/constants/contracts'

function MultiTokenBalances({ userAddress }) {
  const tokens = ['USDT', 'USDC']

  const { data: balances } = useReadContracts({
    contracts: tokens.map(token => ({
      address: CONTRACTS[token],
      abi: ERC20ABI,
      functionName: 'balanceOf',
      args: [userAddress],
    })),
    enabled: !!userAddress,
    watch: true,
  })

  return (
    <div>
      {tokens.map((token, i) => (
        <div key={token}>
          {token}: {balances?.[i]?.result ? Number(balances[i].result) / 1e18 : '0'}
        </div>
      ))}
    </div>
  )
}
```

---

## 2. 创建数据查询 Hooks

### 2.1 代币余额 Hook

创建 `hooks/useTokenBalance.js`：

```javascript
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
```

### 2.2 流动性池数据 Hook

创建 `hooks/usePoolData.js`：

```javascript
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
```

### 2.3 Farm 质押数据 Hook

创建 `hooks/useFarmData.js`：

```javascript
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
```

---

## 3. APR 计算

### 3.1 创建 APR 计算 Hook

创建 `hooks/useCalculateAPR.js`：

```javascript
'use client'

import { useMemo } from 'react'
import { usePoolData } from './usePoolData'
import { useTokenBalance } from './useTokenBalance'

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
```

### 3.2 价格查询（简化示例）

创建 `hooks/useTokenPrice.js`：

```javascript
'use client'

import { useState, useEffect } from 'react'
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
```

---

## 4. 实现 Dashboard 实时数据

### 4.1 更新 Dashboard 页面

更新 `app/dashboard/page.js`：

```javascript
'use client'

import { useAccount } from 'wagmi'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { useFarmData } from '@/hooks/useFarmData'
import { CONTRACTS } from '@/lib/constants/contracts'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()

  // 查询各代币余额
  const { balance: ethBalance } = useTokenBalance(CONTRACTS.WETH, address)
  const { balance: usdtBalance } = useTokenBalance(CONTRACTS.USDT, address)
  const { balance: usdcBalance } = useTokenBalance(CONTRACTS.USDC, address)

  // 查询质押数据（Pool ID 0 和 1）
  const pool0Data = useFarmData(0, address)
  const pool1Data = useFarmData(1, address)

  // 计算总价值
  const calculateTotalValue = () => {
    const ethValue = Number(ethBalance) * 2000 // 假设 ETH 价格 $2000
    const usdtValue = Number(usdtBalance) * 1
    const usdcValue = Number(usdcBalance) * 1

    return (ethValue + usdtValue + usdcValue).toFixed(2)
  }

  const calculateStakingValue = () => {
    // 根据实际 LP 价格计算
    const pool0Value = Number(pool0Data.stakedAmount) * 100 // 假设 LP 价格 $100
    const pool1Value = Number(pool1Data.stakedAmount) * 95

    return (pool0Value + pool1Value).toFixed(2)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Dashboard</h1>
          <p className="text-white/70">Please connect your wallet to view your dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

        {/* 总览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Wallet Balance</div>
            <div className="text-3xl font-bold text-white mb-1">
              ${calculateTotalValue()}
            </div>
            <div className="text-white/50 text-xs">Total Assets</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Staked Value</div>
            <div className="text-3xl font-bold text-white mb-1">
              ${calculateStakingValue()}
            </div>
            <div className="text-green-400 text-xs font-semibold">In Farms</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Pending Rewards</div>
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {(Number(pool0Data.pendingReward) + Number(pool1Data.pendingReward)).toFixed(2)}
            </div>
            <div className="text-white/50 text-xs">REWARD tokens</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Portfolio Value</div>
            <div className="text-3xl font-bold text-white mb-1">
              ${(Number(calculateTotalValue()) + Number(calculateStakingValue())).toFixed(2)}
            </div>
            <div className="text-white/50 text-xs">Total</div>
          </div>
        </div>

        {/* 资产列表 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">My Assets</h2>
          <div className="space-y-3">
            {[
              { symbol: 'ETH', balance: ethBalance, price: '2000' },
              { symbol: 'USDT', balance: usdtBalance, price: '1' },
              { symbol: 'USDC', balance: usdcBalance, price: '1' },
            ].map((asset) => (
              <div
                key={asset.symbol}
                className="bg-white/5 rounded-lg p-4 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mr-3 flex items-center justify-center text-white font-bold">
                    {asset.symbol[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{asset.symbol}</div>
                    <div className="text-white/50 text-sm">{asset.balance}</div>
                  </div>
                </div>
                <div className="text-white font-semibold">
                  ${(Number(asset.balance) * Number(asset.price)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 质押仓位 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Staking Positions</h2>
          <div className="space-y-3">
            {[
              { name: 'ETH/USDT LP', data: pool0Data, poolId: 0 },
              { name: 'ETH/USDC LP', data: pool1Data, poolId: 1 },
            ].map((position) => (
              <div
                key={position.poolId}
                className="bg-white/5 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-white font-semibold text-lg">{position.name}</div>
                    <div className="text-white/50 text-sm">
                      Staked: {position.data.stakedAmount} LP
                    </div>
                  </div>
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                    45% APR
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Pending Rewards:</span>
                  <span className="text-green-400 font-semibold">
                    {position.data.pendingReward} REWARD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 5. 自动刷新和实时更新

### 5.1 使用 watch 参数

Wagmi 的 `useReadContract` 支持 `watch` 参数，自动监听链上数据变化：

```javascript
const { data: balance } = useReadContract({
  address: tokenAddress,
  abi: ERC20ABI,
  functionName: 'balanceOf',
  args: [userAddress],
  watch: true, // 自动监听变化
  // 或者指定轮询间隔
  // pollingInterval: 10000, // 每 10 秒轮询一次
})
```

### 5.2 手动刷新数据

```javascript
const { data, refetch } = useReadContract({
  address: tokenAddress,
  abi: ERC20ABI,
  functionName: 'balanceOf',
  args: [userAddress],
})

// 在交易成功后手动刷新
const handleSuccess = () => {
  refetch()
}
```

---

## 6. 本节小结

✅ **完成内容**：
- 实现代币余额查询
- 实现流动性池数据查询
- 实现质押信息和奖励查询
- 实现 APR 计算
- 实现 Dashboard 实时数据展示
- 完成整个 DAPP 的前端开发

📌 **后续优化方向**：
- 添加更完善的错误处理
- 优化数据缓存策略
- 添加加载骨架屏
- 实现交易历史记录
- 添加价格图表
- 接入真实价格 API（CoinGecko、CoinMarketCap）

💡 **性能优化建议**：
- 使用 `useReadContracts` 批量查询
- 合理设置 `enabled` 条件
- 避免过度轮询
- 使用 React Query 的缓存功能
- 考虑使用 The Graph 进行复杂查询

---

## 常见问题

**Q1: 数据不实时更新怎么办？**
A: 确保使用 `watch: true` 参数，或设置合理的 `pollingInterval`。

**Q2: 如何优化多次合约调用？**
A: 使用 `useReadContracts` 批量查询，或考虑后端 API 聚合数据。

**Q3: APR 计算不准确？**
A: 需要获取准确的代币价格和区块时间，建议使用价格预言机或 API。

**Q4: 查询速度慢怎么办？**
A: 使用更快的 RPC 节点，或实现数据缓存层。

**Q5: 如何显示历史数据？**
A: 使用 The Graph 索引链上事件，或后端存储历史数据。

**Q6: 余额显示为 0？**
A: 检查合约地址是否正确，用户是否连接钱包，网络是否正确。

---

## 🎉 恭喜完成 6 天教程！

至此，你已经掌握：
- ✅ Next.js 项目搭建
- ✅ DeFi 页面 UI 开发
- ✅ 钱包连接实现
- ✅ 智能合约交互（读写）
- ✅ 实时数据查询和展示

**下一步建议**：
1. 部署你的 DAPP 到 Vercel
2. 测试所有功能流程
3. 添加更多高级功能
4. 学习智能合约开发
5. 准备主网部署

**继续学习资源**：
- [Wagmi 官方文档](https://wagmi.sh/)
- [Viem 文档](https://viem.sh/)
- [RainbowKit 文档](https://www.rainbowkit.com/)
- [Solidity 教程](https://docs.soliditylang.org/)
- [Hardhat 开发框架](https://hardhat.org/)

祝你在 Web3 开发之路上越走越远！🚀
