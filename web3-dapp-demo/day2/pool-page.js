'use client'

import { useState } from 'react'

export default function PoolPage() {
  const [activeTab, setActiveTab] = useState('add') // 'add' or 'remove'
  const [token0, setToken0] = useState('ETH')
  const [token1, setToken1] = useState('USDT')
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')

  const tokens = ['ETH', 'USDT', 'USDC', 'DAI']

  // 模拟流动性池数据
  const mockPools = [
    { pair: 'ETH/USDT', liquidity: '$1,234,567', apr: '12.5%', myShare: '0.05%' },
    { pair: 'ETH/USDC', liquidity: '$987,654', apr: '8.3%', myShare: '0.00%' },
    { pair: 'USDT/USDC', liquidity: '$543,210', apr: '5.2%', myShare: '0.00%' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* 标题 */}
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Liquidity Pools
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* 左侧：添加/移除流动性 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">

            {/* Tab 切换 */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setActiveTab('add')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'add'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Add Liquidity
              </button>
              <button
                onClick={() => setActiveTab('remove')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'remove'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Remove Liquidity
              </button>
            </div>

            {activeTab === 'add' ? (
              <>
                {/* Token 0 输入 */}
                <div className="mb-4">
                  <label className="text-white/70 text-sm mb-2 block">Token 1</label>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <select
                        value={token0}
                        onChange={(e) => setToken0(e.target.value)}
                        className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {tokens.map(token => (
                          <option key={token} value={token} className="bg-gray-800">
                            {token}
                          </option>
                        ))}
                      </select>
                      <span className="text-white/50 text-sm">Balance: 0.00</span>
                    </div>
                    <input
                      type="number"
                      value={amount0}
                      onChange={(e) => setAmount0(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-transparent text-white text-2xl font-semibold focus:outline-none placeholder-white/30"
                    />
                  </div>
                </div>

                {/* Plus 图标 */}
                <div className="flex justify-center my-4">
                  <div className="bg-white/10 rounded-full p-3 border border-white/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>

                {/* Token 1 输入 */}
                <div className="mb-6">
                  <label className="text-white/70 text-sm mb-2 block">Token 2</label>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <select
                        value={token1}
                        onChange={(e) => setToken1(e.target.value)}
                        className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {tokens.map(token => (
                          <option key={token} value={token} className="bg-gray-800">
                            {token}
                          </option>
                        ))}
                      </select>
                      <span className="text-white/50 text-sm">Balance: 0.00</span>
                    </div>
                    <input
                      type="number"
                      value={amount1}
                      onChange={(e) => setAmount1(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-transparent text-white text-2xl font-semibold focus:outline-none placeholder-white/30"
                    />
                  </div>
                </div>

                {/* 流动性信息 */}
                <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Share of Pool</span>
                    <span className="text-white">0.05%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">LP Tokens</span>
                    <span className="text-white">0.001 LP</span>
                  </div>
                </div>

                {/* 添加流动性按钮 */}
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/50">
                  Connect Wallet to Add
                </button>
              </>
            ) : (
              <>
                {/* 移除流动性界面 */}
                <div className="mb-6">
                  <label className="text-white/70 text-sm mb-2 block">
                    Amount to Remove
                  </label>
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="text-center mb-4">
                      <div className="text-5xl font-bold text-white mb-2">25%</div>
                      <div className="text-white/50 text-sm">of your liquidity</div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="25"
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between mt-2 text-xs text-white/50">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* 预计收到 */}
                <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-3">
                  <div className="text-white/70 text-sm mb-2">You will receive:</div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">0.025 ETH</span>
                    <span className="text-white/50 text-sm">~$50.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">50 USDT</span>
                    <span className="text-white/50 text-sm">~$50.00</span>
                  </div>
                </div>

                {/* 移除流动性按钮 */}
                <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-red-500/50">
                  Connect Wallet to Remove
                </button>
              </>
            )}
          </div>

          {/* 右侧：流动性池列表 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Your Liquidity</h2>

            <div className="space-y-4">
              {mockPools.map((pool, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-white font-semibold text-lg">{pool.pair}</div>
                      <div className="text-white/50 text-sm">Liquidity: {pool.liquidity}</div>
                    </div>
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {pool.apr} APR
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">My Share:</span>
                    <span className="text-white font-semibold">{pool.myShare}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 空状态提示 */}
            <div className="mt-6 text-center text-white/50 text-sm">
              <p>Connect wallet to see your liquidity positions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
