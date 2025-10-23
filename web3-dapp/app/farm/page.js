'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { parseUnits, formatUnits, formatUSD } from '@/lib/utils/units'
import { formatNumber } from '@/lib/utils/format'
import ApproveButton from '@/components/ApproveButton'
import { getProtocolAddress } from '@/lib/constants'
import { FARM_ABI, ERC20_ABI } from '@/lib/abis'

/**
 * Farm Page (Multi-Pool Yield Farming)
 *
 * Features:
 * - List all farm pools from API and optional chain reading
 * - Deposit/Withdraw/Harvest for each pool
 * - Display APY, TVL, user staked amounts, pending rewards
 * - Mock mode support with fallback data
 */

// Pool component for each farm
function FarmPoolCard({ pool, farmAddress, userAddress, isMockMode, chainId }) {
  const [amount, setAmount] = useState('')
  const [activeTab, setActiveTab] = useState('deposit') // 'deposit' or 'withdraw'

  // Read user info from chain
  const { data: userInfo } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: 'userInfo',
    args: userAddress && pool.id !== undefined ? [BigInt(pool.id), userAddress] : undefined,
    enabled: Boolean(farmAddress && userAddress && pool.id !== undefined && !isMockMode)
  })

  // Read pending rewards
  const { data: pendingReward } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: 'pendingReward',
    args: userAddress && pool.id !== undefined ? [BigInt(pool.id), userAddress] : undefined,
    enabled: Boolean(farmAddress && userAddress && pool.id !== undefined && !isMockMode)
  })

  // Read user LP token balance
  const { data: lpBalance } = useReadContract({
    address: pool.lpTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    enabled: Boolean(pool.lpTokenAddress && userAddress && !isMockMode)
  })

  // Deposit transaction
  const { data: depositHash, writeContract: deposit, isPending: isDepositing } = useWriteContract()
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash
  })

  // Withdraw transaction
  const { data: withdrawHash, writeContract: withdraw, isPending: isWithdrawing } = useWriteContract()
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawHash
  })

  // Harvest transaction
  const { data: harvestHash, writeContract: harvest, isPending: isHarvesting } = useWriteContract()
  const { isLoading: isHarvestConfirming, isSuccess: isHarvestSuccess } = useWaitForTransactionReceipt({
    hash: harvestHash
  })

  const userStaked = userInfo ? formatUnits(userInfo[0], 18, 6) : '0'
  const userPending = pendingReward ? formatUnits(pendingReward, 18, 6) : '0'
  const userLpBalance = lpBalance ? formatUnits(lpBalance, 18, 6) : '0'

  const handleDeposit = () => {
    if (!farmAddress || !amount || pool.id === undefined) return
    const amountWei = parseUnits(amount, 18)
    deposit({
      address: farmAddress,
      abi: FARM_ABI,
      functionName: 'deposit',
      args: [BigInt(pool.id), amountWei]
    })
  }

  const handleWithdraw = () => {
    if (!farmAddress || !amount || pool.id === undefined) return
    const amountWei = parseUnits(amount, 18)
    withdraw({
      address: farmAddress,
      abi: FARM_ABI,
      functionName: 'withdraw',
      args: [BigInt(pool.id), amountWei]
    })
  }

  const handleHarvest = () => {
    if (!farmAddress || pool.id === undefined) return
    harvest({
      address: farmAddress,
      abi: FARM_ABI,
      functionName: 'harvest',
      args: [BigInt(pool.id)]
    })
  }

  const handleMax = () => {
    if (activeTab === 'deposit') {
      setAmount(userLpBalance)
    } else {
      setAmount(userStaked)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{pool.name}</h3>
          <p className="text-sm text-gray-600">{pool.lpToken}</p>
        </div>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
          {pool.apy.toFixed(2)}% APY
        </span>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">TVL</div>
          <div className="text-lg font-semibold">{formatUSD(pool.tvl)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">Your Staked</div>
          <div className="text-lg font-semibold">{userStaked} LP</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-600 mb-1">LP Balance</div>
          <div className="text-lg font-semibold text-blue-700">{userLpBalance} LP</div>
        </div>
      </div>

      {/* Pending Rewards */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-600 mb-1">Pending Rewards</div>
            <div className="text-2xl font-bold text-orange-600">{userPending} DRT</div>
          </div>
          {!isMockMode ? (
            <button
              onClick={handleHarvest}
              disabled={isHarvesting || isHarvestConfirming || parseFloat(userPending) === 0}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isHarvesting || isHarvestConfirming ? 'Harvesting...' : 'Harvest'}
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
            >
              Harvest (Mock)
            </button>
          )}
        </div>
      </div>

      {/* Harvest Success */}
      {isHarvestSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-semibold">Harvest Successful!</p>
          <a
            href={`https://sepolia.etherscan.io/tx/${harvestHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View on Etherscan →
          </a>
        </div>
      )}

      {/* Deposit/Withdraw Tabs */}
      <div className="border-t pt-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'deposit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'withdraw'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Withdraw
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-600">
                {activeTab === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount'}
              </label>
              <button onClick={handleMax} className="text-sm text-blue-600">
                Balance: {activeTab === 'deposit' ? userLpBalance : userStaked}
              </button>
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
                LP
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!userAddress ? (
          <button className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg">
            Connect Wallet
          </button>
        ) : isMockMode ? (
          <button
            disabled
            className="w-full bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
          >
            {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} (Mock Mode - Contract Not Deployed)
          </button>
        ) : activeTab === 'deposit' ? (
          <ApproveButton
            tokenAddress={pool.lpTokenAddress}
            spenderAddress={farmAddress}
            amount={amount ? parseUnits(amount, 18) : 0n}
            disabled={!amount || isDepositing || isDepositConfirming}
          >
            <button
              onClick={handleDeposit}
              disabled={!amount || isDepositing || isDepositConfirming}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isDepositing || isDepositConfirming ? 'Depositing...' : 'Deposit'}
            </button>
          </ApproveButton>
        ) : (
          <button
            onClick={handleWithdraw}
            disabled={!amount || isWithdrawing || isWithdrawConfirming}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isWithdrawing || isWithdrawConfirming ? 'Withdrawing...' : 'Withdraw'}
          </button>
        )}

        {/* Transaction Success Messages */}
        {isDepositSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-semibold">Deposit Successful!</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${depositHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View on Etherscan →
            </a>
          </div>
        )}

        {isWithdrawSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-semibold">Withdraw Successful!</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${withdrawHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View on Etherscan →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FarmPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const farmAddress = getProtocolAddress(chainId, 'FARM')

  // State
  const [farmData, setFarmData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMockMode, setIsMockMode] = useState(false)

  // Fetch farm data from API
  useEffect(() => {
    setIsLoading(true)
    setError(null)

    fetch('/api/farm/stats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch farm data')
        return res.json()
      })
      .then(data => {
        setFarmData(data)
        // Check if using mock mode - only set to true if contract not deployed
        if (!farmAddress) {
          setIsMockMode(true)
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error fetching farm data:', err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [farmAddress])

  // Loading State
  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Farm</h1>
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading farm pools...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Farm</h1>
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-semibold text-gray-800 mb-2">Error Loading Farm Data</p>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Empty State
  if (!farmData || !farmData.pools || farmData.pools.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Farm</h1>
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-xl font-semibold text-gray-800 mb-2">No Farm Pools Available</p>
            <p className="text-gray-600">Check back later for farming opportunities</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Farm</h1>
          <p className="text-gray-600">Stake LP tokens to earn DRT rewards</p>
        </div>

        {/* Mock Mode Warning */}
        {isMockMode && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-yellow-800">Mock Mode Active</p>
                <p className="text-sm text-yellow-700">
                  Farm contract not deployed or unavailable. Displaying simulated data. Transactions are disabled.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Total Value Locked</div>
            <div className="text-3xl font-bold">
              {formatUSD(farmData.totalValueLocked)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Active Farms</div>
            <div className="text-3xl font-bold">
              {farmData.pools.length}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Active Users</div>
            <div className="text-3xl font-bold">
              {formatNumber(farmData.activeUsers)}
            </div>
          </div>
        </div>

        {/* Farm Pools */}
        <div>
          <h2 className="text-xl font-bold mb-4">Available Pools</h2>
          {farmData.pools.map((pool, index) => (
            <FarmPoolCard
              key={pool.id !== undefined ? pool.id : `pool-${index}`}
              pool={pool}
              farmAddress={farmAddress}
              userAddress={address}
              isMockMode={isMockMode}
              chainId={chainId}
            />
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">How Farming Works</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Deposit LP tokens to start earning DRT rewards</li>
            <li>• Rewards are calculated based on your share of the pool</li>
            <li>• Harvest rewards at any time without unstaking</li>
            <li>• Withdraw your LP tokens anytime (rewards auto-harvest)</li>
            <li>• Higher APY pools may have higher risk or lower liquidity</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
