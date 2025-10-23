import { NextResponse } from 'next/server'

/**
 * GET /api/token/price
 *
 * Returns token price data with historical series
 *
 * Response fields:
 * - price: Current token price (number)
 * - symbol: Token symbol (string)
 * - change24h: 24h price change percentage (number)
 * - series: Array of historical price points
 *   - ts: Timestamp (number)
 *   - price: Price at that time (number)
 * - source: Data source - "chain" or "mock" (string)
 * - timestamp: Response timestamp (string)
 */

// Generate mock historical price data
function generateMockPriceData() {
  const now = Date.now()
  const series = []
  const basePrice = 1.5

  // Generate 24 hours of data (hourly)
  for (let i = 24; i >= 0; i--) {
    const ts = now - (i * 60 * 60 * 1000) // hourly intervals
    // Add some realistic price variation
    const variation = Math.sin(i * 0.5) * 0.1 + (Math.random() - 0.5) * 0.05
    const price = basePrice + variation
    series.push({
      ts,
      price: parseFloat(price.toFixed(4))
    })
  }

  const currentPrice = series[series.length - 1].price
  const price24hAgo = series[0].price
  const change24h = ((currentPrice - price24hAgo) / price24hAgo) * 100

  return {
    price: currentPrice,
    symbol: 'DRT',
    change24h: parseFloat(change24h.toFixed(2)),
    series,
    source: 'mock',
    timestamp: new Date().toISOString()
  }
}

// Try to fetch from chain (placeholder for future implementation)
async function fetchChainPrice() {
  // TODO: Implement chain reading when contracts are available
  // const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA)
  // const tokenContract = new Contract(process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS, ABI, provider)
  // const price = await tokenContract.getPrice() // if price oracle exists

  return null // Return null to fallback to mock data
}

export async function GET() {
  try {
    // Try to fetch from chain first
    const chainData = await fetchChainPrice()

    if (chainData) {
      return NextResponse.json(chainData)
    }

    // Fallback to mock data
    const mockData = generateMockPriceData()
    return NextResponse.json(mockData)

  } catch (error) {
    console.error('Error fetching token price:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token price' },
      { status: 500 }
    )
  }
}
