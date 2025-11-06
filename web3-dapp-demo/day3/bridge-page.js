'use client'

import { useState } from 'react'

export default function BridgePage() {
  const [fromChain, setFromChain] = useState('Ethereum')
  const [toChain, setToChain] = useState('Polygon')
  const [selectedToken, setSelectedToken] = useState('USDT')
  const [amount, setAmount] = useState('')

  const chains = [
    { name: 'Ethereum', icon: '🔷', color: 'from-blue-500 to-purple-500' },
    { name: 'Polygon', icon: '🟣', color: 'from-purple-500 to-pink-500' },
    { name: 'BSC', icon: '🟡', color: 'from-yellow-500 to-orange-500' },
    { name: 'Arbitrum', icon: '🔵', color: 'from-blue-400 to-cyan-400' },
    { name: 'Optimism', icon: '🔴', color: 'from-red-500 to-pink-500' },
  ]

  const tokens = ['USDT', 'USDC', 'ETH', 'WBTC']

  const handleSwapChains = () => {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
  }

  // 模拟历史记录
  const bridgeHistory = [
    {
      from: 'Ethereum',
      to: 'Polygon',
      token: 'USDT',
      amount: '1,000',
      status: 'completed',
      time: '2 hours ago'
    },
    {
      from: 'BSC',
      to: 'Ethereum',
      token: 'USDC',
      amount: '500',
      status: 'pending',
      time: '5 hours ago'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🌉 Cross-Chain Bridge
          </h1>
          <p className="text-white/70 text-lg">
            Transfer assets securely across different blockchains
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 左侧：跨链桥接口 */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">

              {/* From Chain */}
              <div className="mb-6">
                <label className="text-white/70 text-sm mb-3 block">From Chain</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {chains.map((chain) => (
                    <button
                      key={chain.name}
                      onClick={() => setFromChain(chain.name)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        fromChain === chain.name
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-3xl mb-2">{chain.icon}</div>
                      <div className="text-white font-semibold text-sm">{chain.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 金额输入 */}
              <div className="mb-6">
                <label className="text-white/70 text-sm mb-2 block">Amount</label>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {tokens.map(token => (
                        <option key={token} value={token} className="bg-gray-800">
                          {token}
                        </option>
                      ))}
                    </select>
                    <span className="text-white/50 text-sm">Balance: 10,000.00</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 bg-transparent text-white text-3xl font-semibold focus:outline-none placeholder-white/30"
                    />
                    <button className="text-blue-400 text-sm font-semibold hover:text-blue-300 ml-3">
                      MAX
                    </button>
                  </div>
                </div>
              </div>

              {/* 交换方向按钮 */}
              <div className="flex justify-center my-6">
                <button
                  onClick={handleSwapChains}
                  className="bg-white/10 hover:bg-white/20 rounded-full p-4 border border-white/20 transition-all"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              {/* To Chain */}
              <div className="mb-6">
                <label className="text-white/70 text-sm mb-3 block">To Chain</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {chains.map((chain) => (
                    <button
                      key={chain.name}
                      onClick={() => setToChain(chain.name)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        toChain === chain.name
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-3xl mb-2">{chain.icon}</div>
                      <div className="text-white font-semibold text-sm">{chain.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 桥接信息 */}
              <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
                <h3 className="text-white font-semibold mb-3">Bridge Details</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">You will receive</span>
                  <span className="text-white font-semibold">{amount || '0.00'} {selectedToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Bridge Fee</span>
                  <span className="text-white">~$5.00 (0.5%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Estimated Time</span>
                  <span className="text-white">~5-15 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Network Fee</span>
                  <span className="text-white">~$2.50</span>
                </div>
              </div>

              {/* Bridge 按钮 */}
              <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/50">
                Connect Wallet to Bridge
              </button>

              {/* 安全提示 */}
              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <div className="text-yellow-400 font-semibold text-sm mb-1">Security Notice</div>
                    <div className="text-white/70 text-xs">
                      Always double-check the destination chain and address. Bridge transactions cannot be reversed.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：桥接历史 */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 sticky top-4">
              <h2 className="text-xl font-bold text-white mb-6">Bridge History</h2>

              <div className="space-y-4">
                {bridgeHistory.map((record, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">🔷</span>
                        <span className="text-white font-semibold text-sm">{record.from}</span>
                      </div>
                      <span className="text-white/50">→</span>
                      <div className="flex items-center">
                        <span className="text-lg mr-2">🟣</span>
                        <span className="text-white font-semibold text-sm">{record.to}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70">Amount</span>
                        <span className="text-white font-semibold">
                          {record.amount} {record.token}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70">Status</span>
                        <span className={`font-semibold ${
                          record.status === 'completed' ? 'text-green-400' :
                          record.status === 'pending' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {record.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-white/50 text-xs">{record.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 支持的链 */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white/70 text-sm mb-3">Supported Chains</h3>
                <div className="flex flex-wrap gap-2">
                  {chains.map((chain) => (
                    <div
                      key={chain.name}
                      className="bg-white/5 px-3 py-1 rounded-full text-xs text-white/70 flex items-center"
                    >
                      <span className="mr-1">{chain.icon}</span>
                      {chain.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
