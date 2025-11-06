import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

/**
 * GET /api/launchpad/projects
 *
 * Returns launchpad project information
 */

const LAUNCHPAD_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_saleId", "type": "uint256"}],
    "name": "getSaleInfo",
    "outputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "address", "name": "saleToken", "type": "address"},
      {"internalType": "address", "name": "paymentToken", "type": "address"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "soldAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "uint256", "name": "minPurchase", "type": "uint256"},
      {"internalType": "uint256", "name": "maxPurchase", "type": "uint256"},
      {"internalType": "bool", "name": "finalized", "type": "bool"},
      {"internalType": "bool", "name": "active", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSaleCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

const ERC20_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
]

// Try to fetch from chain
async function fetchChainProjects() {
  const launchpadAddress = process.env.NEXT_PUBLIC_LAUNCHPAD_ADDRESS

  if (!launchpadAddress || launchpadAddress === '0x0000000000000000000000000000000000000000') {
    return null
  }

  try {
    const client = createPublicClient({
      chain: sepolia,
      transport: http('https://sepolia.infura.io/v3/da2de9befd37454aa8dc594c122102f1')
    })

    // Get sale count
    const saleCount = await client.readContract({
      address: launchpadAddress,
      abi: LAUNCHPAD_ABI,
      functionName: 'getSaleCount'
    })

    if (saleCount === 0n) {
      return null // No sales yet, return mock data
    }

    // Fetch all sales
    const projects = []
    const now = Math.floor(Date.now() / 1000)

    for (let i = 0; i < Number(saleCount); i++) {
      const saleInfo = await client.readContract({
        address: launchpadAddress,
        abi: LAUNCHPAD_ABI,
        functionName: 'getSaleInfo',
        args: [BigInt(i)]
      })

      // Get token name and symbol
      let tokenName = 'Unknown Token'
      let tokenSymbol = 'TKN'

      try {
        tokenName = await client.readContract({
          address: saleInfo[1], // saleToken address
          abi: ERC20_ABI,
          functionName: 'name'
        })
        tokenSymbol = await client.readContract({
          address: saleInfo[1],
          abi: ERC20_ABI,
          functionName: 'symbol'
        })
      } catch (e) {
        console.error('Error reading token info:', e)
      }

      const [creator, saleToken, paymentToken, price, totalAmount, soldAmount,
             startTime, endTime, minPurchase, maxPurchase, finalized, active] = saleInfo

      // Determine status
      let status = 'active'
      if (!active) {
        status = 'ended'
      } else if (Number(startTime) > now) {
        status = 'upcoming'
      } else if (Number(endTime) < now || finalized) {
        status = 'ended'
      }

      // Calculate raised amount (soldAmount * price / 1e18)
      const raised = (Number(soldAmount) * Number(price)) / 1e18
      const goal = (Number(totalAmount) * Number(price)) / 1e18
      const progress = goal > 0 ? (raised / goal) * 100 : 0

      projects.push({
        id: i,
        name: tokenName,
        symbol: tokenSymbol,
        description: `Token sale for ${tokenName} (${tokenSymbol})`,
        logo: `https://via.placeholder.com/200/6366f1/ffffff?text=${tokenSymbol}`,
        saleToken: saleToken,
        paymentToken: paymentToken,
        price: (Number(price) / 1e18).toString(),
        goal: goal.toString(),
        raised: raised.toString(),
        totalSupply: (Number(totalAmount) / 1e18).toLocaleString('en-US', { maximumFractionDigits: 0 }),
        startTime: Number(startTime) * 1000, // Convert to ms
        endTime: Number(endTime) * 1000,
        minPurchase: (Number(minPurchase) / 1e18).toString(),
        maxPurchase: (Number(maxPurchase) / 1e18).toString(),
        status,
        participants: 0, // TODO: Track this on-chain
        progress: Math.min(progress, 100),
        address: launchpadAddress,
        creator
      })
    }

    return {
      projects,
      source: 'chain',
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error fetching from chain:', error)
    return null
  }
}

// Generate mock launchpad projects (fallback)
function generateMockProjects() {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000

  return {
    projects: [
      {
        id: 0,
        name: 'Test Token',
        symbol: 'TEST',
        description: 'Test token sale - no real sales available yet',
        logo: 'https://via.placeholder.com/200/6366f1/ffffff?text=TEST',
        saleToken: '0x0000000000000000000000000000000000000000',
        paymentToken: process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
        price: '0.1',
        goal: '50000',
        raised: '0',
        totalSupply: 500000,
        startTime: now + oneDay,
        endTime: now + (7 * oneDay),
        minPurchase: '100',
        maxPurchase: '10000',
        status: 'upcoming',
        participants: 0,
        progress: 0,
        address: process.env.NEXT_PUBLIC_LAUNCHPAD_ADDRESS || '0x0000000000000000000000000000000000000000'
      }
    ],
    source: 'mock',
    timestamp: new Date().toISOString()
  }
}

export async function GET() {
  try {
    // Try to fetch from chain first
    const chainData = await fetchChainProjects()

    if (chainData && chainData.projects.length > 0) {
      return NextResponse.json(chainData)
    }

    // Fallback to mock data
    const mockData = generateMockProjects()
    return NextResponse.json(mockData)

  } catch (error) {
    console.error('Error fetching launchpad projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch launchpad projects' },
      { status: 500 }
    )
  }
}
