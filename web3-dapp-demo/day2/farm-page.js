'use client'

import { useState } from 'react'

export default function FarmPage() {
  const [activeTab, setActiveTab] = useState('stake') // 'stake' or 'unstake'
  const [amount, setAmount] = useState('')

  // 模拟农场数据
  const mockFarms = [
    {
      name: 'ETH/USDT LP',
      apr: '45.6%',
      tvl: '$2,345,678',
      earned: '12.5',
      staked: '1.23',
      rewardToken: 'REWARD'
    },
    {
      name: 'ETH/USDC LP',
      apr: '32.1%',
      tvl: '$1,876,543',
      earned: '0.00',
      staked: '0.00',
      rewardToken: 'REWARD'
    },
    {
      name: 'USDT/USDC LP',
      apr: '18.9%',
      tvl: '$987,654',
      earned: '0.00',
      staked: '0.00',
      rewardToken: 'REWARD'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* 标题和统计 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Yield Farms
          </h1>
          <p className="text-white/70 text-lg">
            Stake LP tokens to earn rewards
          </p>

          {/* 总览统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-white/70 text-sm mb-2">Total Value Locked</div>
              <div className="text-3xl font-bold text-white">$5,209,875</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-white/70 text-sm mb-2">My Total Staked</div>
              <div className="text-3xl font-bold text-white">$123.45</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-white/70 text-sm mb-2">Total Earned</div>
              <div className="text-3xl font-bold text-green-400">12.5 REWARD</div>
            </div>
          </div>
        </div>

        {/* 农场列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockFarms.map((farm, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 hover:border-green-400/50 transition-all"
            >
              {/* 农场头部 */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{farm.name}</h3>
                  <div className="text-white/50 text-sm">Earn {farm.rewardToken}</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold">
                  {farm.apr} APR
                </div>
              </div>

              {/* 农场信息 */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">TVL</span>
                  <span className="text-white font-semibold">{farm.tvl}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Your Staked</span>
                  <span className="text-white font-semibold">{farm.staked} LP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Earned</span>
                  <span className="text-green-400 font-semibold">{farm.earned} {farm.rewardToken}</span>
                </div>
              </div>

              {/* 已赚取奖励 */}
              {parseFloat(farm.earned) > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white/70 text-xs mb-1">Rewards Available</div>
                      <div className="text-green-400 font-bold text-lg">{farm.earned} {farm.rewardToken}</div>
                    </div>
                    <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-all">
                      Harvest
                    </button>
                  </div>
                </div>
              )}

              {/* 质押/取消质押 */}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setActiveTab('stake')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'stake'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Stake
                  </button>
                  <button
                    onClick={() => setActiveTab('unstake')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'unstake'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Unstake
                  </button>
                </div>

                <div className="flex items-center bg-white/5 rounded-lg px-3 py-2 mb-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-white focus:outline-none placeholder-white/30"
                  />
                  <button className="text-green-400 text-sm font-semibold hover:text-green-300">
                    MAX
                  </button>
                </div>

                <div className="text-white/50 text-xs mb-3">
                  Available: 0.00 LP
                </div>

                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-green-500/50">
                  {activeTab === 'stake' ? 'Stake LP Tokens' : 'Unstake LP Tokens'}
                </button>
              </div>

              {/* 详情链接 */}
              <button className="w-full text-white/70 hover:text-white text-sm font-semibold transition-all">
                View Contract ↗
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
