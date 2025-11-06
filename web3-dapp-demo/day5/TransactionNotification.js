'use client'

export function TransactionNotification({ hash, isConfirming, isSuccess, error }) {
  if (!hash && !error) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50">
      {isConfirming && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 backdrop-blur-lg">
          <div className="text-blue-400 font-semibold mb-2">⏳ Transaction Pending</div>
          <div className="text-white/70 text-sm">Waiting for confirmation...</div>
        </div>
      )}

      {isSuccess && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 backdrop-blur-lg">
          <div className="text-green-400 font-semibold mb-2">✓ Transaction Successful!</div>
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-sm underline hover:text-blue-300"
          >
            View on Etherscan ↗
          </a>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 backdrop-blur-lg">
          <div className="text-red-400 font-semibold mb-2">✗ Transaction Failed</div>
          <div className="text-white/70 text-sm">{error.message}</div>
        </div>
      )}
    </div>
  )
}
