'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { parseUnits, formatUnits } from '@/lib/utils/units'

/**
 * Bridge 页面（跨链桥）
 *
 * 功能：
 * - 源链/目标链选择
 * - 代币和数量输入
 * - 调用 /api/bridge/transfer 发起转账
 * - 实时显示转账状态（queued -> inflight -> complete）
 * - 支持 Mock 模式
 */

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH' },
  { id: 11155111, name: 'Sepolia', symbol: 'SEP' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' },
  { id: 42161, name: 'Arbitrum', symbol: 'ARB' },
  { id: 10, name: 'Optimism', symbol: 'OP' }
]

const SUPPORTED_TOKENS = [
  { symbol: 'TKA', name: 'Token A', address: process.env.NEXT_PUBLIC_TOKEN_A_ADDRESS },
  { symbol: 'TKB', name: 'Token B', address: process.env.NEXT_PUBLIC_TOKEN_B_ADDRESS },
  { symbol: 'DRT', name: 'Reward Token', address: process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS }
]

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
]

// 转账记录组件
function TransferRecord({ transfer, onStatusUpdate }) {
  const [currentStatus, setCurrentStatus] = useState(transfer.status)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (currentStatus === 'complete') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bridge/transfer?transferId=${transfer.transferId}`)
        const data = await res.json()

        if (data.success) {
          setCurrentStatus(data.status)
          setProgress(data.progress || 0)
          onStatusUpdate?.(transfer.transferId, data.status)
        }
      } catch (error) {
        console.error('查询转账状态失败:', error)
      }
    }, 3000) // 每3秒查询一次

    return () => clearInterval(interval)
  }, [currentStatus, transfer.transferId, onStatusUpdate])

  const getStatusInfo = (status) => {
    switch (status) {
      case 'queued':
        return { text: '队列中', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' }
      case 'inflight':
        return { text: '处理中', color: 'bg-blue-100 text-blue-800', icon: '🚀' }
      case 'complete':
        return { text: '已完成', color: 'bg-green-100 text-green-800', icon: '✓' }
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: '?' }
    }
  }

  const statusInfo = getStatusInfo(currentStatus)

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
              {statusInfo.icon} {statusInfo.text}
            </span>
            <span className="text-xs text-gray-500">
              预计 {transfer.estimatedTime} 分钟
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {transfer.sourceChain} → {transfer.targetChain}
          </div>
          <div className="text-lg font-semibold">
            {transfer.amount} {transfer.token}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            手续费: {transfer.fee} {transfer.token}
          </div>
        </div>
      </div>

      {/* 进度条 */}
      {currentStatus !== 'complete' && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500 font-mono">
        ID: {transfer.transferId}
      </div>
    </div>
  )
}

export default function BridgePage() {
  const { address, isConnected } = useAccount()

  // 表单状态
  const [sourceChain, setSourceChain] = useState('Sepolia')
  const [targetChain, setTargetChain] = useState('Polygon')
  const [selectedToken, setSelectedToken] = useState('TKA')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  // 转账状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [transfers, setTransfers] = useState([])

  // 读取用户代币余额
  const tokenData = SUPPORTED_TOKENS.find(t => t.symbol === selectedToken)
  const { data: balance } = useReadContract({
    address: tokenData?.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: Boolean(address && tokenData?.address)
  })

  const userBalance = balance ? formatUnits(balance, 18, 6) : '0'

  // 自动填充接收地址为当前地址
  useEffect(() => {
    if (address && !recipient) {
      setRecipient(address)
    }
  }, [address, recipient])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // 验证
    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效的转账数量')
      return
    }

    if (!recipient || !recipient.startsWith('0x')) {
      setError('请输入有效的接收地址')
      return
    }

    if (sourceChain === targetChain) {
      setError('源链和目标链不能相同')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/bridge/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceChain,
          targetChain,
          token: selectedToken,
          amount,
          recipient
        })
      })

      const data = await res.json()

      if (data.success) {
        // 添加到转账记录列表
        setTransfers(prev => [data, ...prev])
        // 清空表单
        setAmount('')
      } else {
        setError(data.error || '转账提交失败')
      }
    } catch (err) {
      console.error('转账提交错误:', err)
      setError('网络错误，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusUpdate = (transferId, newStatus) => {
    setTransfers(prev =>
      prev.map(t => t.transferId === transferId ? { ...t, status: newStatus } : t)
    )
  }

  const handleMaxAmount = () => {
    setAmount(userBalance)
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">跨链桥</h1>
          <p className="text-gray-600">在不同区块链网络之间安全转移资产</p>
        </div>

        {/* 模拟模式提示 */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-yellow-800">演示模式</p>
              <p className="text-sm text-yellow-700">
                当前为演示模式，转账状态为模拟数据。实际跨链桥需要集成 LayerZero、Wormhole 等跨链协议。
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：转账表单 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">发起跨链转账</h2>

            <form onSubmit={handleSubmit}>
              {/* 源链选择 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  源链
                </label>
                <select
                  value={sourceChain}
                  onChange={(e) => setSourceChain(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SUPPORTED_CHAINS.map(chain => (
                    <option key={chain.id} value={chain.name}>
                      {chain.name} ({chain.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* 箭头 */}
              <div className="flex justify-center -my-2 mb-2">
                <div className="bg-gray-100 rounded-full p-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              {/* 目标链选择 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目标链
                </label>
                <select
                  value={targetChain}
                  onChange={(e) => setTargetChain(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SUPPORTED_CHAINS.filter(c => c.name !== sourceChain).map(chain => (
                    <option key={chain.id} value={chain.name}>
                      {chain.name} ({chain.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* 代币选择 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  代币
                </label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SUPPORTED_TOKENS.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.name} ({token.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* 金额输入 */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    转账数量
                  </label>
                  {isConnected && (
                    <button
                      type="button"
                      onClick={handleMaxAmount}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      余额: {userBalance}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
                    {selectedToken}
                  </div>
                </div>
              </div>

              {/* 接收地址 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  接收地址
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* 提交按钮 */}
              {!isConnected ? (
                <button
                  type="button"
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg"
                >
                  连接钱包
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !amount}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {isSubmitting ? '提交中...' : '发起转账'}
                </button>
              )}
            </form>
          </div>

          {/* 右侧：转账历史 */}
          <div>
            <h2 className="text-xl font-bold mb-4">转账记录</h2>

            {transfers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">暂无转账记录</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                {transfers.map((transfer) => (
                  <TransferRecord
                    key={transfer.transferId}
                    transfer={transfer}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 信息提示 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">跨链桥使用说明</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 选择源链和目标链，确保两者不同</li>
            <li>• 输入要转账的代币数量</li>
            <li>• 确认接收地址正确（默认为当前钱包地址）</li>
            <li>• 跨链转账需要支付一定的手续费</li>
            <li>• 转账时间取决于源链和目标链的确认速度</li>
            <li>• 请勿在转账过程中关闭页面</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
