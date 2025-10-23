'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { parseUnits, formatUnits, formatUSD } from '@/lib/utils/units'
import { formatRelativeTime, formatDate } from '@/lib/utils/format'
import ApproveButton from '@/components/ApproveButton'
import { TOKENS, getTokenAddress, getProtocolAddress } from '@/lib/constants'
import { LAUNCHPAD_ABI, ERC20_ABI } from '@/lib/abis'

/**
 * LaunchPad 页面（代币发行平台）
 *
 * 功能：
 * - 展示所有项目列表及详情
 * - 实时倒计时（距离开始/结束）
 * - 进度条显示募集进度
 * - buy/claim 操作与合约交互
 * - 支持 Mock 模式
 */

// 项目卡片组件
function ProjectCard({ project, launchpadAddress, userAddress, isMockMode, chainId }) {
  const [amount, setAmount] = useState('')
  const [countdown, setCountdown] = useState('')

  // 读取用户购买信息
  const { data: userPurchase } = useReadContract({
    address: launchpadAddress,
    abi: LAUNCHPAD_ABI,
    functionName: 'getUserInfo',
    args: userAddress ? [BigInt(project.id), userAddress] : undefined,
    enabled: Boolean(launchpadAddress && userAddress && !isMockMode)
  })

  // Buy 交易
  const { data: buyHash, writeContract: buy, isPending: isBuying } = useWriteContract()
  const { isLoading: isBuyConfirming, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash
  })

  // Claim 交易
  const { data: claimHash, writeContract: claim, isPending: isClaiming } = useWriteContract()
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash
  })

  const userPurchased = userPurchase ? formatUnits(userPurchase[0], 18, 4) : '0'
  const userClaimed = userPurchase ? (userPurchase[1] > 0n) : false

  // 计算进度百分比
  const progress = project.goal > 0 ? (project.raised / project.goal) * 100 : 0

  // 倒计时更新
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now()
      const startTime = new Date(project.startTime).getTime()
      const endTime = new Date(project.endTime).getTime()

      if (now < startTime) {
        setCountdown(`开始于 ${formatRelativeTime(startTime)}`)
      } else if (now < endTime) {
        setCountdown(`结束于 ${formatRelativeTime(endTime)}`)
      } else {
        setCountdown('已结束')
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [project.startTime, project.endTime])

  // 获取状态样式
  const getStatusStyle = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'ended':
        return 'bg-gray-100 text-gray-800'
      case 'success':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return '即将开始'
      case 'active':
        return '进行中'
      case 'ended':
        return '已结束'
      case 'success':
        return '成功'
      default:
        return status
    }
  }

  const handleBuy = () => {
    if (!launchpadAddress || !amount) return
    const amountWei = parseUnits(amount, 18)
    buy({
      address: launchpadAddress,
      abi: LAUNCHPAD_ABI,
      functionName: 'buy',
      args: [BigInt(project.id), amountWei]
    })
  }

  const handleClaim = () => {
    if (!launchpadAddress) return
    claim({
      address: launchpadAddress,
      abi: LAUNCHPAD_ABI,
      functionName: 'claim',
      args: [BigInt(project.id)]
    })
  }

  const canBuy = project.status === 'active' && !isMockMode
  const canClaim = project.status === 'ended' && parseFloat(userPurchased) > 0 && !userClaimed && !isMockMode

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 项目头部 */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(project.status)}`}>
            {getStatusText(project.status)}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold mb-1">{project.name}</h3>
          <p className="text-sm opacity-90">{project.symbol}</p>
        </div>
      </div>

      <div className="p-6">
        {/* 项目描述 */}
        <p className="text-gray-600 mb-4">{project.description}</p>

        {/* 时间信息 */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">⏰ {countdown}</span>
            <span className="text-gray-500">
              {formatDate(new Date(project.startTime).getTime())} - {formatDate(new Date(project.endTime).getTime())}
            </span>
          </div>
        </div>

        {/* 募集进度 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">募集进度</span>
            <span className="font-semibold">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-600">已募集: {formatUSD(project.raised)}</span>
            <span className="text-gray-600">目标: {formatUSD(project.goal)}</span>
          </div>
        </div>

        {/* 项目详情 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">代币价格</div>
            <div className="text-lg font-semibold">${project.price}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">总供应量</div>
            <div className="text-lg font-semibold">{project.totalSupply || 'N/A'}</div>
          </div>
        </div>

        {/* 用户购买信息 */}
        {userAddress && parseFloat(userPurchased) > 0 && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">您已购买</div>
            <div className="text-xl font-bold text-purple-600">{userPurchased} {project.symbol}</div>
            {userClaimed && (
              <div className="text-xs text-green-600 mt-1">✓ 已领取</div>
            )}
          </div>
        )}

        {/* 购买/领取操作 */}
        {!userAddress ? (
          <button className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg">
            连接钱包
          </button>
        ) : isMockMode ? (
          <button
            disabled
            className="w-full bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
          >
            {project.status === 'active' ? '购买' : '领取'} (模拟模式 - 合约未部署)
          </button>
        ) : canClaim ? (
          <button
            onClick={handleClaim}
            disabled={isClaiming || isClaimConfirming}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isClaiming || isClaimConfirming ? '领取中...' : '领取代币'}
          </button>
        ) : canBuy ? (
          <>
            {/* 购买金额输入 */}
            <div className="mb-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-600">购买数量</label>
                  <span className="text-sm text-gray-600">价格: ${project.price}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 text-xl font-semibold bg-transparent outline-none"
                  />
                  <div className="bg-white border rounded-lg px-3 py-2 font-semibold text-sm">
                    {project.symbol}
                  </div>
                </div>
                {amount && (
                  <div className="text-sm text-gray-600 mt-2">
                    需支付: ${(parseFloat(amount) * parseFloat(project.price)).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* 购买按钮（带 approve 流程） */}
            <ApproveButton
              tokenAddress={project.paymentToken}
              spenderAddress={launchpadAddress}
              amount={amount ? parseUnits((parseFloat(amount) * parseFloat(project.price)).toString(), 18) : 0n}
              disabled={!amount || isBuying || isBuyConfirming}
            >
              <button
                onClick={handleBuy}
                disabled={!amount || isBuying || isBuyConfirming}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isBuying || isBuyConfirming ? '购买中...' : '购买'}
              </button>
            </ApproveButton>
          </>
        ) : (
          <button
            disabled
            className="w-full bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
          >
            {project.status === 'upcoming' ? '尚未开始' : '已结束'}
          </button>
        )}

        {/* 成功消息 */}
        {isBuySuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-semibold">✅ 购买成功！</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${buyHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline block mb-2"
            >
              在 Etherscan 查看 →
            </a>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              刷新页面查看最新进度
            </button>
          </div>
        )}

        {isClaimSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-semibold">领取成功！</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${claimHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              在 Etherscan 查看 →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LaunchPadPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const launchpadAddress = getProtocolAddress(chainId, 'LAUNCHPAD')
  const paymentTokenAddress = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS

  // 状态
  const [projects, setProjects] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMockMode, setIsMockMode] = useState(false)
  const [mintAmount, setMintAmount] = useState('10000')

  // Read user USDC balance
  const { data: usdcBalance } = useReadContract({
    address: paymentTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: Boolean(paymentTokenAddress && address)
  })

  // Read how much user has minted
  const { data: mintedAmount } = useReadContract({
    address: paymentTokenAddress,
    abi: [
      {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "mintedByAddress",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'mintedByAddress',
    args: address ? [address] : undefined,
    enabled: Boolean(paymentTokenAddress && address)
  })

  // Mint transaction
  const { data: mintHash, writeContract: mintUSDC, isPending: isMinting } = useWriteContract()
  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: mintHash
  })

  const userBalance = usdcBalance ? formatUnits(usdcBalance, 18, 2) : '0'
  const userMinted = mintedAmount ? formatUnits(mintedAmount, 18, 2) : '0'
  const maxMint = 100000
  const canMint = parseFloat(userMinted) < maxMint

  const handleMint = () => {
    if (!paymentTokenAddress || !mintAmount) return
    const amountWei = parseUnits(mintAmount, 18)
    mintUSDC({
      address: paymentTokenAddress,
      abi: [
        {
          "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
          "name": "mint",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      functionName: 'mint',
      args: [amountWei]
    })
  }

  // 从 API 获取项目数据
  useEffect(() => {
    setIsLoading(true)
    setError(null)

    fetch('/api/launchpad/projects')
      .then(res => {
        if (!res.ok) throw new Error('获取项目数据失败')
        return res.json()
      })
      .then(data => {
        setProjects(data)
        // Check if using mock mode - only set to true if contract not deployed
        if (!launchpadAddress) {
          setIsMockMode(true)
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error('获取项目数据错误:', err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [launchpadAddress])

  // 加载状态
  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">LaunchPad</h1>
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载项目中...</p>
          </div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">LaunchPad</h1>
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-semibold text-gray-800 mb-2">加载项目数据失败</p>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 空状态
  if (!projects || !projects.projects || projects.projects.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">LaunchPad</h1>
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-xl font-semibold text-gray-800 mb-2">暂无可用项目</p>
            <p className="text-gray-600">请稍后查看新的代币发行机会</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">LaunchPad</h1>
            <p className="text-gray-600">参与早期代币发行，获取优质项目投资机会</p>
          </div>
          <a
            href="/launchpad/create"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            🚀 创建项目
          </a>
        </div>

        {/* USDC-test Mint Card */}
        <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">获取测试USDC</h2>
              <p className="text-sm opacity-90">免费铸造USDC-test用于购买项目代币</p>
            </div>
            {address && (
              <div className="text-right">
                <div className="text-sm opacity-90">您的余额</div>
                <div className="text-2xl font-bold">{userBalance} USDC</div>
              </div>
            )}
          </div>

          {!address ? (
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <p className="text-sm">请先连接钱包</p>
            </div>
          ) : !canMint ? (
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <p className="text-sm font-semibold">⚠️ 您已达到铸造上限</p>
              <p className="text-xs mt-1 opacity-90">每个地址最多可铸造 100,000 USDC-test</p>
              <p className="text-xs mt-2">已铸造: {userMinted} / {maxMint.toLocaleString()} USDC</p>
            </div>
          ) : (
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm opacity-90 mb-2 block">铸造数量</label>
                  <input
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="10000"
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white"
                  />
                </div>
                <button
                  onClick={handleMint}
                  disabled={!mintAmount || isMinting || isMintConfirming}
                  className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed transition-colors"
                >
                  {isMinting || isMintConfirming ? '铸造中...' : '免费铸造'}
                </button>
              </div>

              {isMintSuccess && (
                <div className="mt-4 bg-green-500 rounded-lg p-3">
                  <p className="text-sm font-semibold">✅ 铸造成功！</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${mintHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline hover:no-underline"
                  >
                    在 Etherscan 查看 →
                  </a>
                </div>
              )}

              <div className="mt-3 text-xs opacity-75">
                <p>💡 已铸造: {userMinted} / {maxMint.toLocaleString()} USDC (剩余: {(maxMint - parseFloat(userMinted)).toLocaleString()} USDC)</p>
              </div>
            </div>
          )}
        </div>

        {/* 模拟模式警告 */}
        {isMockMode && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-yellow-800">模拟模式已激活</p>
                <p className="text-sm text-yellow-700">
                  LaunchPad 合约未部署或不可用。正在显示模拟数据，交易功能已禁用。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 项目统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">总项目数</div>
            <div className="text-3xl font-bold">{projects.projects.length}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">进行中</div>
            <div className="text-3xl font-bold">
              {projects.projects.filter(p => p.status === 'active').length}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">已完成</div>
            <div className="text-3xl font-bold">
              {projects.projects.filter(p => p.status === 'success' || p.status === 'ended').length}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">总募集额</div>
            <div className="text-x font-bold">
              {formatUSD(projects.projects.reduce((sum, p) => sum + p.raised, 0))}
            </div>
          </div>
        </div>

        {/* 项目列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              launchpadAddress={launchpadAddress}
              userAddress={address}
              isMockMode={isMockMode}
              chainId={chainId}
            />
          ))}
        </div>

        {/* 信息提示 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">LaunchPad 使用说明</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 在项目活跃期间使用支付代币购买项目代币</li>
            <li>• 项目结束后可领取已购买的代币</li>
            <li>• 请仔细阅读项目详情和风险提示</li>
            <li>• 确保在结束时间前完成购买</li>
            <li>• 购买前需要先授权（approve）支付代币</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
