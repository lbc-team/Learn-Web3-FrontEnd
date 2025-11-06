'use client'

import { useAccount } from 'wagmi'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { useFarmData } from '@/hooks/useFarmData'
import { CONTRACTS } from '@/lib/constants/contracts'

export default function DashboardPageWithRealData() {
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
