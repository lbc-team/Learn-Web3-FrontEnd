'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { parseUnits, formatUnits } from '@/lib/utils/units'
import ApproveButton from '@/components/ApproveButton'
import { TOKENS, getTokenAddress, getProtocolAddress } from '@/lib/constants'
import { SWAP_ABI, ERC20_ABI } from '@/lib/abis'
import { CloudCog } from 'lucide-react'

/**
 * Pool Page (Liquidity Pool)
 *
 * Features:
 * - Add liquidity (proportional deposit of TokenA + TokenB)
 * - Remove liquidity (proportional withdrawal)
 * - Display TVL and reserves
 * - Dual token approval flow
 */

export default function PoolPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const swapAddress = getProtocolAddress(chainId, 'SWAP')

  // 获取代币地址
  const tokenAAddress = getTokenAddress(chainId, 'TKA')
  const tokenBAddress = getTokenAddress(chainId, 'TKB')

  // State
  const [mode, setMode] = useState('add') // 'add' or 'remove'
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [lpAmount, setLpAmount] = useState('')
  const [isMockMode, setIsMockMode] = useState(false)
  const [poolData, setPoolData] = useState(null)
  const [tokenAApproved, setTokenAApproved] = useState(false)

  // Read reserves from chain
  const { data: reserves, isError: reservesError } = useReadContract({
    address: swapAddress,
    abi: SWAP_ABI,
    functionName: 'getReserves',
    enabled: Boolean(swapAddress)
  })

  // Read user LP token balance
  const { data: lpBalance } = useReadContract({
    address: swapAddress,
    abi: SWAP_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: Boolean(swapAddress && address)
  })

  // Read user token balances
  const { data: balanceTKA } = useReadContract({
    address: tokenAAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: Boolean(tokenAAddress && address)
  })

  const { data: balanceTKB } = useReadContract({
    address: tokenBAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: Boolean(tokenBAddress && address)
  })

  // Add liquidity transaction
  const { data: addHash, writeContract: addLiquidity, isPending: isAdding } = useWriteContract()

  const { isLoading: isAddConfirming, isSuccess: isAddSuccess } = useWaitForTransactionReceipt({
    hash: addHash
  })

  // Remove liquidity transaction
  const { data: removeHash, writeContract: removeLiquidity, isPending: isRemoving } = useWriteContract()

  const { isLoading: isRemoveConfirming, isSuccess: isRemoveSuccess } = useWaitForTransactionReceipt({
    hash: removeHash
  })

  // Fetch pool data from API
  useEffect(() => {
    fetch('/api/stake/pools')
      .then(res => res.json())
      .then(data => setPoolData(data))
      .catch(console.error)
  }, [])

  // Check if mock mode
  useEffect(() => {
    if (!swapAddress || reservesError) {
      setIsMockMode(true)
    } else {
      setIsMockMode(false)
    }
  }, [swapAddress, reservesError])

  // Auto-calculate amountB when amountA changes (proportional)
  useEffect(() => {
    if (mode !== 'add' || !amountA || parseFloat(amountA) <= 0) {
      return
    }

    if (reserves && reserves[0] > 0n && reserves[1] > 0n) {
      // Use actual reserves ratio
      const reserveA = Number(reserves[0]) / 1e18
      const reserveB = Number(reserves[1]) / 1e18
      const ratio = reserveB / reserveA
      const calculatedB = parseFloat(amountA) * ratio
      setAmountB(calculatedB.toFixed(6))
    } else {
      // Mock: use 1:1.5 ratio
      const calculatedB = parseFloat(amountA) * 1.5
      setAmountB(calculatedB.toFixed(6))
    }
  }, [amountA, reserves, mode])

  // Calculate proportional amounts when removing liquidity
  const calculateRemoveAmounts = () => {
    if (!lpAmount || parseFloat(lpAmount) <= 0 || !reserves || !lpBalance) {
      return { amountA: '0', amountB: '0' }
    }

    const lpAmountBig = parseUnits(lpAmount, 18)
    const lpBalanceBig = BigInt(lpBalance)

    if (lpAmountBig > lpBalanceBig) {
      return { amountA: '0', amountB: '0' }
    }

    // Calculate proportional amounts
    const reserveA = BigInt(reserves[0])
    const reserveB = BigInt(reserves[1])

    // Simple calculation: (lpAmount / lpBalance) * reserve
    const amountABig = (lpAmountBig * reserveA) / lpBalanceBig
    const amountBBig = (lpAmountBig * reserveB) / lpBalanceBig

    return {
      amountA: formatUnits(amountABig, 18, 6),
      amountB: formatUnits(amountBBig, 18, 6)
    }
  }

  const removeAmounts = calculateRemoveAmounts()

  const handleAddLiquidity = () => {
    if (!swapAddress || !amountA || !amountB) return

    const amountAWei = parseUnits(amountA, 18)
    const amountBWei = parseUnits(amountB, 18)

    addLiquidity({
      address: swapAddress,
      abi: SWAP_ABI,
      functionName: 'addLiquidity',
      args: [amountAWei, amountBWei]
    })
  }

  const handleRemoveLiquidity = () => {
    if (!swapAddress || !lpAmount) return

    const lpAmountWei = parseUnits(lpAmount, 18)

    removeLiquidity({
      address: swapAddress,
      abi: SWAP_ABI,
      functionName: 'removeLiquidity',
      args: [lpAmountWei]
    })
  }

  const handleMaxLP = () => {
    if (lpBalance) {
      setLpAmount(formatUnits(lpBalance, 18, 6))
    }
  }

  const handleMaxTKA = () => {
    if (balanceTKA) {
      setAmountA(formatUnits(balanceTKA, 18, 6))
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Liquidity Pool</h1>
        <p className="text-gray-600">Add or remove liquidity to earn trading fees</p>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Total TVL</div>
          <div className="text-2xl font-bold">
            {poolData?.pools?.[0]?.tvl
              ? `$${parseFloat(poolData.pools[0].tvl).toLocaleString()}`
              : '$0'
            }
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Reserve A</div>
          <div className="text-2xl font-bold">
            {reserves ? formatUnits(reserves[0], 18, 2) : '0'} TKA
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Reserve B</div>
          <div className="text-2xl font-bold">
            {reserves ? formatUnits(reserves[1], 18, 2) : '0'} TKB
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('add')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              mode === 'add'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Add Liquidity
          </button>
          <button
            onClick={() => setMode('remove')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              mode === 'remove'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Remove Liquidity
          </button>
        </div>

        {isMockMode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Mock Mode:</strong> Swap contract not deployed. Using simulated data.
            </p>
          </div>
        )}

        {/* Add Liquidity Mode */}
        {mode === 'add' && (
          <>
            {/* Token A Input */}
            <div className="mb-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-600">Token A</label>
                  <button onClick={handleMaxTKA} className="text-sm text-blue-600">
                    Balance: {balanceTKA ? formatUnits(balanceTKA, 18, 4) : '0'}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={amountA}
                    onChange={(e) => setAmountA(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 text-2xl font-semibold bg-transparent outline-none"
                  />
                  <div className="bg-white border rounded-lg px-3 py-2 font-semibold">
                    TKA
                  </div>
                </div>
              </div>
            </div>

            {/* Plus Icon */}
            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-white border-4 border-gray-50 rounded-xl p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>

            {/* Token B Input */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-600">Token B</label>
                  <button onClick={() => balanceTKB && setAmountB(formatUnits(balanceTKB, 18, 6))} className="text-sm text-blue-600">
                    Balance: {balanceTKB ? formatUnits(balanceTKB, 18, 4) : '0'}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={amountB}
                    onChange={(e) => setAmountB(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 text-2xl font-semibold bg-transparent outline-none"
                  />
                  <div className="bg-white border rounded-lg px-3 py-2 font-semibold">
                    TKB
                  </div>
                </div>
              </div>
            </div>

            {/* Price Info */}
            {amountA && amountB && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate</span>
                  <span className="font-semibold">
                    1 TKA = {(parseFloat(amountB) / parseFloat(amountA)).toFixed(4)} TKB
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Your Share</span>
                  <span className="font-semibold">~0.1%</span>
                </div>
              </div>
            )}

            {/* Action Button - Add Liquidity with Dual Approval */}
            {!isConnected ? (
              <button className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg">
                Connect Wallet
              </button>
            ) : !swapAddress || isMockMode ? (
              <button
                disabled
                className="w-full bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
              >
                {isMockMode ? 'Add Liquidity (Mock Mode - Contract Not Deployed)' : 'Swap Contract Not Available'}
              </button>
            ) : (
              <ApproveButton
                tokenAddress={tokenAAddress}
                spenderAddress={swapAddress}
                amount={amountA ? parseUnits(amountA, 18) : 0n}
                onApproved={() => setTokenAApproved(true)}
                disabled={!amountA || !amountB || isAdding || isAddConfirming}
              >
                <ApproveButton
                  tokenAddress={tokenBAddress}
                  spenderAddress={swapAddress}
                  amount={amountB ? parseUnits(amountB, 18) : 0n}
                  disabled={!amountA || !amountB || isAdding || isAddConfirming}
                >
                  <button
                    onClick={handleAddLiquidity}
                    disabled={!amountA || !amountB || isAdding || isAddConfirming}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isAdding || isAddConfirming ? 'Adding Liquidity...' : 'Add Liquidity'}
                  </button>
                </ApproveButton>
              </ApproveButton>
            )}

            {/* Success Message */}
            {isAddSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">Liquidity Added Successfully!</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${addHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View on Etherscan →
                </a>
              </div>
            )}
          </>
        )}

        {/* Remove Liquidity Mode */}
        {mode === 'remove' && (
          <>
            {/* LP Token Input */}
            <div className="mb-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-600">LP Tokens</label>
                  <button onClick={handleMaxLP} className="text-sm text-blue-600">
                    Balance: {lpBalance ? formatUnits(lpBalance, 18, 4) : '0'}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={lpAmount}
                    onChange={(e) => setLpAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 text-2xl font-semibold bg-transparent outline-none"
                  />
                  <div className="bg-white border rounded-lg px-3 py-2 font-semibold">
                    LP
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-white border-4 border-gray-50 rounded-xl p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* Output Amounts */}
            <div className="mb-6 space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">You will receive</div>
                <div className="text-xl font-semibold">{removeAmounts.amountA} TKA</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">You will receive</div>
                <div className="text-xl font-semibold">{removeAmounts.amountB} TKB</div>
              </div>
            </div>

            {/* Action Button */}
            {!isConnected ? (
              <button className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg">
                Connect Wallet
              </button>
            ) : !swapAddress || isMockMode ? (
              <button
                disabled
                className="w-full bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
              >
                {isMockMode ? 'Remove Liquidity (Mock Mode - Contract Not Deployed)' : 'Swap Contract Not Available'}
              </button>
            ) : (
              <button
                onClick={handleRemoveLiquidity}
                disabled={!lpAmount || isRemoving || isRemoveConfirming}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isRemoving || isRemoveConfirming ? 'Removing Liquidity...' : 'Remove Liquidity'}
              </button>
            )}

            {/* Success Message */}
            {isRemoveSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">Liquidity Removed Successfully!</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${removeHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View on Etherscan →
                </a>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">How it works</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Add liquidity in a 1:1 ratio to earn trading fees</li>
          <li>• Receive LP tokens representing your pool share</li>
          <li>• Remove liquidity anytime by burning LP tokens</li>
          <li>• Earn 0.3% fee on all swaps proportional to your share</li>
        </ul>
      </div>
    </div>
  )
}
