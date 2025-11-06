'use client'

import { useState } from 'react'

export default function DashboardPage() {
  // 模拟用户数据
  const userData = {
    totalBalance: '12,345.67',
    totalValue: '24,691.34',
    profitLoss: '+45.6%',
    profitLossValue: '+$5,234.12'
  }

  // 模拟资产列表
  const assets = [
    { symbol: 'ETH', name: 'Ethereum', balance: '5.2345', value: '$10,469.00', change: '+3.2%', changePositive: true },
    { symbol: 'USDT', name: 'Tether', balance: '8,500', value: '$8,500.00', change: '0.0%', changePositive: true },
    { symbol: 'USDC', name: 'USD Coin', balance: '3,200', value: '$3,200.00', change: '0.0%', changePositive: true },
    { symbol: 'DPX', name: 'DeFi Protocol X', balance: '1,250', value: '$2,500.00', change: '+12.5%', changePositive: true },
  ]

  // 模拟流动性仓位
  const liquidityPositions = [
    { pair: 'ETH/USDT', value: '$1,234.56', share: '0.05%', earned: '$45.67' },
    { pair: 'ETH/USDC', value: '$987.65', share: '0.03%', earned: '$23.45' },
  ]

  // 模拟质押仓位
  const stakingPositions = [
    { pool: 'ETH/USDT LP', staked: '1.23 LP', value: '$1,234.56', apr: '45.6%', earned: '12.5 REWARD' },
    { pool: 'ETH/USDC LP', staked: '0.98 LP', value: '$987.65', apr: '32.1%', earned: '8.3 REWARD' },
  ]

  // 模拟交易历史
  const transactions = [
    { type: 'Swap', description: 'Swapped 1.5 ETH for 3000 USDT', time: '2 hours ago', status: 'success' },
    { type: 'Add Liquidity', description: 'Added ETH/USDT liquidity', time: '5 hours ago', status: 'success' },
    { type: 'Stake', description: 'Staked 1.23 ETH/USDT LP', time: '1 day ago', status: 'success' },
    { type: 'Harvest', description: 'Harvested 12.5 REWARD tokens', time: '2 days ago', status: 'success' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* 页面标题 */}
        <h1 className="text-4xl font-bold text-white mb-8">
          Dashboard
        </h1>

        {/* 总览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Total Balance</div>
            <div className="text-3xl font-bold text-white mb-1">${userData.totalBalance}</div>
            <div className="text-white/50 text-xs">Wallet Balance</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Portfolio Value</div>
            <div className="text-3xl font-bold text-white mb-1">${userData.totalValue}</div>
            <div className="text-green-400 text-xs font-semibold">{userData.profitLoss}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Total Profit/Loss</div>
            <div className="text-3xl font-bold text-green-400 mb-1">{userData.profitLossValue}</div>
            <div className="text-white/50 text-xs">All time</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Staking Rewards</div>
            <div className="text-3xl font-bold text-purple-400 mb-1">20.8</div>
            <div className="text-white/50 text-xs">REWARD tokens</div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 左侧：资产列表 + 流动性 */}
          <div className="lg:col-span-2 space-y-8">

            {/* 我的资产 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">My Assets</h2>
              <div className="space-y-3">
                {assets.map((asset, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mr-3 flex items-center justify-center text-white font-bold">
                          {asset.symbol[0]}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{asset.symbol}</div>
                          <div className="text-white/50 text-sm">{asset.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{asset.value}</div>
                        <div className="text-white/70 text-sm">{asset.balance} {asset.symbol}</div>
                      </div>
                      <div className={`text-sm font-semibold ${asset.changePositive ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 流动性仓位 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Liquidity Positions</h2>
              <div className="space-y-3">
                {liquidityPositions.map((position, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-white font-semibold text-lg">{position.pair}</div>
                      <div className="text-white font-semibold">{position.value}</div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Pool Share: {position.share}</span>
                      <span className="text-green-400 font-semibold">Earned: {position.earned}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 质押仓位 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Staking Positions</h2>
              <div className="space-y-3">
                {stakingPositions.map((position, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-white font-semibold text-lg">{position.pool}</div>
                        <div className="text-white/50 text-sm">{position.staked}</div>
                      </div>
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                        {position.apr} APR
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Value: {position.value}</span>
                      <span className="text-green-400 font-semibold">Earned: {position.earned}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：交易历史 */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 sticky top-4">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm mb-1">{tx.type}</div>
                        <div className="text-white/70 text-xs">{tx.description}</div>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full ml-2 mt-1"></div>
                    </div>
                    <div className="text-white/50 text-xs">{tx.time}</div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold py-3 rounded-lg transition-all">
                View All Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
