'use client'

import { useAccount, useBalance, useDisconnect } from 'wagmi'

export default function TestWalletPage() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">
          Please connect your wallet first
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Wallet Info</h1>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 space-y-6">
          <div>
            <div className="text-white/70 text-sm mb-2">Connected Address</div>
            <div className="text-white text-lg font-mono">{address}</div>
          </div>

          <div>
            <div className="text-white/70 text-sm mb-2">Network</div>
            <div className="text-white text-lg">{chain?.name || 'Unknown'}</div>
          </div>

          <div>
            <div className="text-white/70 text-sm mb-2">Balance</div>
            <div className="text-white text-lg">
              {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
            </div>
          </div>

          <button
            onClick={() => disconnect()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  )
}
