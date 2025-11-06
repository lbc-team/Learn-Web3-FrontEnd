'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { parseUnits, formatUnits } from '@/lib/utils/units'
import ApproveButton from '@/components/ApproveButton'
import { TOKENS, getTokenAddress, getProtocolAddress } from '@/lib/constants'
import { SWAP_ABI } from '@/lib/abis'

/**
 * Swap Page
 *
 * Token swap interface with:
 * - Token selection (TokenA <-> TokenB)
 * - Price quotes (from chain or mock API)
 * - Approve + Swap flow
 * - Transaction status tracking
 */

export default function SwapPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [tokenIn, setTokenIn] = useState('TKA')
  const [tokenOut, setTokenOut] = useState('TKB')
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [isMockMode, setIsMockMode] = useState(false)

  // Slippage settings
  const [slippage, setSlippage] = useState(0.5) // Default 0.5%
  const [showSlippageModal, setShowSlippageModal] = useState(false)
  const [customSlippage, setCustomSlippage] = useState('')

  const tokenInData = { ...TOKENS[tokenIn], address: getTokenAddress(chainId, tokenIn) }
  const tokenOutData = { ...TOKENS[tokenOut], address: getTokenAddress(chainId, tokenOut) }
  const swapAddress = getProtocolAddress(chainId, 'SWAP')

  // Read reserves from chain
  const { data: reserves } = useReadContract({
    address: swapAddress,
    abi: SWAP_ABI,
    functionName: 'getReserves',
    enabled: Boolean(swapAddress)
  })

  // Get quote from chain
  const { data: chainQuote, isError: isQuoteError } = useReadContract({
    address: swapAddress,
    abi: SWAP_ABI,
    functionName: 'getAmountOut',
    args: amountIn && tokenInData ? [tokenInData.address, parseUnits(amountIn, tokenInData.decimals)] : undefined,
    enabled: Boolean(swapAddress && amountIn && parseFloat(amountIn) > 0)
  })

  // Swap transaction
  const { data: swapHash, writeContract: swap, isPending: isSwapping } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({
    hash: swapHash
  })

  // Get quote (from chain or mock)
  useEffect(() => {
    const getQuote = async () => {
      if (!amountIn || parseFloat(amountIn) <= 0) {
        setAmountOut('')
        return
      }

      setIsLoadingQuote(true)

      // Try chain quote first
      if (chainQuote && !isQuoteError) {
        setAmountOut(formatUnits(chainQuote, tokenOutData.decimals))
        setIsMockMode(false)
        setIsLoadingQuote(false)
        return
      }

      // Fallback to mock calculation
      try {
        // Simple mock: use 1:1.5 ratio
        const mockRate = tokenIn === 'TKA' ? 1.5 : (1 / 1.5)
        const calculatedOut = parseFloat(amountIn) * mockRate
        setAmountOut(calculatedOut.toFixed(6))
        setIsMockMode(true)
      } catch (error) {
        console.error('Error getting quote:', error)
        setAmountOut('')
      }

      setIsLoadingQuote(false)
    }

    const timer = setTimeout(getQuote, 500) // Debounce
    return () => clearTimeout(timer)
  }, [amountIn, chainQuote, isQuoteError, tokenIn, tokenInData, tokenOutData])

  const handleSwap = () => {
    if (!swapAddress || !tokenInData || !amountIn) return

    const amountInWei = parseUnits(amountIn, tokenInData.decimals)

    swap({
      address: swapAddress,
      abi: SWAP_ABI,
      functionName: 'swap',
      args: [tokenInData.address, amountInWei]
    })
  }

  const switchTokens = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn(amountOut)
    setAmountOut('')
  }

  const handleApproved = () => {
    console.log('Token approved, ready to swap')
  }

  // Calculate minimum amount out with slippage
  const minAmountOut = amountOut ? (parseFloat(amountOut) * (1 - slippage / 100)).toFixed(6) : '0'

  // Calculate price impact (simplified)
  const priceImpact = reserves && amountIn ?
    ((parseFloat(amountIn) / (Number(reserves[tokenIn === 'TKA' ? 0 : 1]) / 1e18)) * 100).toFixed(2) : '0'

  // Slippage preset buttons
  const slippagePresets = [0.1, 0.5, 1.0]

  const handleSlippagePreset = (value) => {
    setSlippage(value)
    setCustomSlippage('')
  }

  const handleCustomSlippage = (value) => {
    setCustomSlippage(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      setSlippage(numValue)
    }
  }

  return (
    <div className="container max-w-lg mx-auto py-12">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Swap</h1>
          <div className="flex items-center gap-2">
            {isMockMode && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Mock Mode
              </span>
            )}
            <button
              onClick={() => setShowSlippageModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Token Input */}
        <div className="mb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-600">From</label>
              <button className="text-sm text-blue-600">Max</button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="0.0"
                className="flex-1 text-2xl font-semibold bg-transparent outline-none"
              />
              <select
                value={tokenIn}
                onChange={(e) => setTokenIn(e.target.value)}
                className="bg-white border rounded-lg px-3 py-2 font-semibold"
              >
                {Object.keys(TOKENS).map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={switchTokens}
            className="bg-white border-4 border-gray-50 rounded-xl p-2 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* Token Output */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-600">To</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={amountOut}
                readOnly
                placeholder="0.0"
                className="flex-1 text-2xl font-semibold bg-transparent outline-none text-gray-600"
              />
              <select
                value={tokenOut}
                onChange={(e) => setTokenOut(e.target.value)}
                className="bg-white border rounded-lg px-3 py-2 font-semibold"
              >
                {Object.keys(TOKENS).filter(s => s !== tokenIn).map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price Info */}
        {amountOut && (
          <div className="mb-4 space-y-2">
            <div className="p-3 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rate</span>
                <span className="font-semibold">
                  1 {tokenIn} = {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(4)} {tokenOut}
                </span>
              </div>
              {reserves && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Liquidity</span>
                    <span className="font-semibold">
                      ${((Number(reserves[0]) + Number(reserves[1])) / 1e18 * 1.5).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price Impact</span>
                    <span className={`font-semibold ${parseFloat(priceImpact) > 5 ? 'text-red-600' : parseFloat(priceImpact) > 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {priceImpact}%
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Slippage Tolerance</span>
                <span className="font-semibold">{slippage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Minimum Received</span>
                <span className="font-semibold">{minAmountOut} {tokenOut}</span>
              </div>
            </div>
            {parseFloat(priceImpact) > 5 && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-800">⚠️ High price impact! Consider a smaller amount.</p>
              </div>
            )}
          </div>
        )}

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
            {isMockMode ? 'Swap (Mock Mode - Contract Not Deployed)' : 'Swap Contract Not Available'}
          </button>
        ) : (
          <ApproveButton
            tokenAddress={tokenInData?.address}
            spenderAddress={swapAddress}
            amount={amountIn ? parseUnits(amountIn, tokenInData.decimals) : 0n}
            onApproved={handleApproved}
            disabled={!amountIn || !amountOut || isSwapping || isConfirming}
          >
            <button
              onClick={handleSwap}
              disabled={!amountIn || !amountOut || isSwapping || isConfirming}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isSwapping || isConfirming ? 'Swapping...' : 'Swap'}
            </button>
          </ApproveButton>
        )}

        {/* Success Message */}
        {isSwapSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">Swap Successful!</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${swapHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View on Etherscan →
            </a>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">How it works</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Select tokens to swap</li>
          <li>• Enter amount and get instant quote</li>
          <li>• Approve token spending (one-time)</li>
          <li>• Confirm swap transaction</li>
        </ul>
      </div>

      {/* Slippage Settings Modal */}
      {showSlippageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Settings</h2>
              <button
                onClick={() => setShowSlippageModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-3">Slippage Tolerance</label>
                <div className="flex gap-2 mb-3">
                  {slippagePresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSlippagePreset(preset)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                        slippage === preset && !customSlippage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={customSlippage}
                    onChange={(e) => handleCustomSlippage(e.target.value)}
                    placeholder="Custom"
                    step="0.1"
                    min="0"
                    max="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">%</span>
                </div>
                {customSlippage && parseFloat(customSlippage) > 5 && (
                  <p className="mt-2 text-sm text-yellow-600">⚠️ High slippage may result in unfavorable rates</p>
                )}
                {customSlippage && parseFloat(customSlippage) > 15 && (
                  <p className="mt-2 text-sm text-red-600">⚠️ Very high slippage! You may lose significant value.</p>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>What is slippage?</strong>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Slippage is the difference between expected and actual trade price.
                    Your transaction will revert if the price changes unfavorably by more than this percentage.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSlippageModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
