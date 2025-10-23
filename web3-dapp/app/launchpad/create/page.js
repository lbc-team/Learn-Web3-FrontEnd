'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { parseUnits } from '@/lib/utils/units'
import { useRouter } from 'next/navigation'

/**
 * CreateSale Page - Project parties create token sales
 *
 * Features:
 * - Create new token + sale automatically
 * - Configure all sale parameters
 * - Integration with TokenFactory
 */

export default function CreateSalePage() {
  const { address } = useAccount()
  const chainId = useChainId()
  const router = useRouter()

  const launchpadAddress = process.env.NEXT_PUBLIC_LAUNCHPAD_ADDRESS
  const paymentTokenAddress = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS

  // Form state
  const [formData, setFormData] = useState({
    // Token info
    tokenName: '',
    tokenSymbol: '',
    decimals: '18',
    totalSupply: '',
    // Sale info
    saleAmount: '',
    price: '',
    startTime: '',
    endTime: '',
    minPurchase: '',
    maxPurchase: ''
  })

  // Create sale transaction
  const { data: createHash, writeContract: createSale, isPending: isCreating, error: createError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, error: confirmError } = useWaitForTransactionReceipt({
    hash: createHash
  })

  // Combined error
  const error = createError || confirmError

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!launchpadAddress || !address) return

    try {
      // Convert values to wei
      const totalSupplyWei = parseUnits(formData.totalSupply, parseInt(formData.decimals))
      const saleAmountWei = parseUnits(formData.saleAmount, parseInt(formData.decimals))
      const priceWei = parseUnits(formData.price, 18) // Price is always in USDC (18 decimals)
      const minPurchaseWei = parseUnits(formData.minPurchase, parseInt(formData.decimals))
      const maxPurchaseWei = parseUnits(formData.maxPurchase, parseInt(formData.decimals))

      // Convert times to timestamps
      const startTimestamp = Math.floor(new Date(formData.startTime).getTime() / 1000)
      const endTimestamp = Math.floor(new Date(formData.endTime).getTime() / 1000)
      const currentTimestamp = Math.floor(Date.now() / 1000)

      // Validate timestamps
      if (startTimestamp <= currentTimestamp) {
        alert('开始时间必须在未来！请选择一个未来的时间。')
        return
      }

      if (endTimestamp <= startTimestamp) {
        alert('结束时间必须晚于开始时间！')
        return
      }

      createSale({
        address: launchpadAddress,
        abi: [
          {
            "inputs": [
              {"internalType": "string", "name": "_name", "type": "string"},
              {"internalType": "string", "name": "_symbol", "type": "string"},
              {"internalType": "uint8", "name": "_decimals", "type": "uint8"},
              {"internalType": "uint256", "name": "_initialSupply", "type": "uint256"},
              {"internalType": "address", "name": "_paymentToken", "type": "address"},
              {"internalType": "uint256", "name": "_price", "type": "uint256"},
              {"internalType": "uint256", "name": "_saleAmount", "type": "uint256"},
              {"internalType": "uint256", "name": "_startTime", "type": "uint256"},
              {"internalType": "uint256", "name": "_endTime", "type": "uint256"},
              {"internalType": "uint256", "name": "_minPurchase", "type": "uint256"},
              {"internalType": "uint256", "name": "_maxPurchase", "type": "uint256"}
            ],
            "name": "createTokenAndSale",
            "outputs": [
              {"internalType": "uint256", "name": "saleId", "type": "uint256"},
              {"internalType": "address", "name": "tokenAddress", "type": "address"}
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'createTokenAndSale',
        args: [
          formData.tokenName,
          formData.tokenSymbol,
          parseInt(formData.decimals),
          totalSupplyWei,
          paymentTokenAddress,
          priceWei,
          saleAmountWei,
          BigInt(startTimestamp),
          BigInt(endTimestamp),
          minPurchaseWei,
          maxPurchaseWei
        ],
        gas: 5000000n // Set explicit gas limit to avoid Sepolia cap
      })
    } catch (error) {
      console.error('Error creating sale:', error)
      alert('创建失败: ' + error.message)
    }
  }

  if (!address) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">请先连接钱包</h2>
            <p className="text-gray-600">需要连接钱包才能创建代币销售</p>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 销售创建成功！</h2>
            <p className="text-gray-600 mb-6">您的代币已自动部署，销售已创建</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">交易哈希</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${createHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {createHash}
              </a>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/launchpad')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                查看所有项目
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                创建新项目
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">创建代币销售</h1>
          <p className="text-gray-600">自动部署ERC20代币并启动销售</p>
        </div>

        {/* Info Card */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-blue-800 mb-1">如何使用</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 填写代币信息，系统将自动部署ERC20合约</li>
                <li>• 配置销售参数（价格、时间、购买限额等）</li>
                <li>• 平台收取2%手续费</li>
                <li>• 销售结束后可finalize提取资金</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {/* Token Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">代币信息</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  代币名称 *
                </label>
                <input
                  type="text"
                  name="tokenName"
                  value={formData.tokenName}
                  onChange={handleInputChange}
                  placeholder="例如: My Awesome Token"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  代币符号 *
                </label>
                <input
                  type="text"
                  name="tokenSymbol"
                  value={formData.tokenSymbol}
                  onChange={handleInputChange}
                  placeholder="例如: MAT"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    精度 *
                  </label>
                  <input
                    type="number"
                    name="decimals"
                    value={formData.decimals}
                    onChange={handleInputChange}
                    placeholder="18"
                    min="0"
                    max="18"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">通常为18</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    总供应量 *
                  </label>
                  <input
                    type="number"
                    name="totalSupply"
                    value={formData.totalSupply}
                    onChange={handleInputChange}
                    placeholder="1000000"
                    min="0"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sale Configuration */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">销售配置</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    销售数量 *
                  </label>
                  <input
                    type="number"
                    name="saleAmount"
                    value={formData.saleAmount}
                    onChange={handleInputChange}
                    placeholder="500000"
                    min="0"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">用于销售的代币数量</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    价格 (USDC) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.1"
                    min="0"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">每个代币的USDC价格</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    开始时间 *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    结束时间 *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    最小购买量 *
                  </label>
                  <input
                    type="number"
                    name="minPurchase"
                    value={formData.minPurchase}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="0"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    最大购买量 *
                  </label>
                  <input
                    type="number"
                    name="maxPurchase"
                    value={formData.maxPurchase}
                    onChange={handleInputChange}
                    placeholder="10000"
                    min="0"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fee Info */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">平台手续费：</span>销售金额的 2%
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-800 mb-1">❌ 创建失败</p>
              <p className="text-xs text-red-700">
                {error.message || error.toString()}
              </p>
              {error.cause && (
                <p className="text-xs text-red-600 mt-1">
                  详情: {error.cause.message || error.cause.toString()}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating || isConfirming}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            {isCreating || isConfirming ? '创建中...' : '🚀 创建销售'}
          </button>
        </form>
      </div>
    </div>
  )
}
