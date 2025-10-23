import { NextResponse } from 'next/server'

/**
 * GET /api/stake/pools
 *
 * Returns staking pool information
 *
 * Response fields:
 * - pools: Array of pool objects
 *   - id: Pool ID (number)
 *   - name: Pool name (string)
 *   - stakingToken: Staking token symbol (string)
 *   - rewardToken: Reward token symbol (string)
 *   - tvl: Total Value Locked in USD (string, for bigint compatibility)
 *   - apr: Annual Percentage Rate (number)
 *   - totalStaked: Total amount staked (string)
 *   - rewardRate: Reward rate per second (string)
 *   - active: Pool active status (boolean)
 * - source: Data source - "chain" or "mock" (string)
 * - timestamp: Response timestamp (string)
 */

// Generate mock pool data
function generateMockPools() {
  return {
    pools: [
      {
        id: 0,
        name: 'DRT Staking Pool',
        stakingToken: 'TKA',
        rewardToken: 'DRT',
        tvl: '1250000',
        apr: 45.5,
        totalStaked: '850000',
        rewardRate: '1000000000000000000', // 1 token per second in wei
        active: true,
        address: process.env.NEXT_PUBLIC_STAKE_POOL_ADDRESS || '0x0000000000000000000000000000000000000000'
      },
      {
        id: 1,
        name: 'TKA-TKB LP Pool',
        stakingToken: 'TKA-TKB LP',
        rewardToken: 'DRT',
        tvl: '2500000',
        apr: 85.2,
        totalStaked: '500000',
        rewardRate: '2000000000000000000', // 2 tokens per second
        active: true,
        address: '0x0000000000000000000000000000000000000001'
      },
      {
        id: 2,
        name: 'TKB Staking Pool',
        stakingToken: 'TKB',
        rewardToken: 'DRT',
        tvl: '750000',
        apr: 32.8,
        totalStaked: '300000',
        rewardRate: '500000000000000000', // 0.5 tokens per second
        active: true,
        address: '0x0000000000000000000000000000000000000002'
      }
    ],
    source: 'mock',
    timestamp: new Date().toISOString()
  }
}

// Try to fetch from chain (placeholder for future implementation)
async function fetchChainPools() {
  // TODO: Implement chain reading
  // const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA)
  // const stakePoolContract = new Contract(process.env.NEXT_PUBLIC_STAKE_POOL_ADDRESS, ABI, provider)
  // const poolData = await stakePoolContract.getPoolInfo()

  return null // Return null to fallback to mock data
}

export async function GET() {
  try {
    // Try to fetch from chain first
    const chainData = await fetchChainPools()

    if (chainData) {
      return NextResponse.json(chainData)
    }

    // Fallback to mock data
    const mockData = generateMockPools()
    return NextResponse.json(mockData)

  } catch (error) {
    console.error('Error fetching stake pools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stake pools' },
      { status: 500 }
    )
  }
}
