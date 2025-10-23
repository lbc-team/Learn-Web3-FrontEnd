'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatUnits, formatUSD } from '@/lib/utils/units'
import { formatNumber } from '@/lib/utils/format'
import LineChartEcharts, { transformDataForEcharts, filterDataByDays } from '@/components/charts/LineChartEcharts'

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  }
]

const FARM_ABI = [
  {
    name: 'userInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' }
    ],
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'rewardDebt', type: 'uint256' }
    ]
  },
  {
    name: 'pendingReward',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'user', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
]

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const [priceData, setPriceData] = useState(null)
  const [poolsData, setPoolsData] = useState(null)
  const [farmData, setFarmData] = useState(null)
  const [priceDays, setPriceDays] = useState(7) // 价格图表时间范围
  const [apyDays, setApyDays] = useState(30)    // APY 图表时间范围

  const swapAddress = process.env.NEXT_PUBLIC_SWAP_ADDRESS
  const farmAddress = process.env.NEXT_PUBLIC_FARM_ADDRESS

  // Read token balances
  const { data: balanceTKA } = useReadContract({
    address: process.env.NEXT_PUBLIC_TOKEN_A_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: Boolean(address)
  })

  const { data: balanceTKB } = useReadContract({
    address: process.env.NEXT_PUBLIC_TOKEN_B_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: Boolean(address)
  })

  const { data: balanceDRT } = useReadContract({
    address: process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: Boolean(address)
  })

  // Read LP Token balance (Swap contract is also LP token)
  const { data: lpBalance } = useReadContract({
    address: swapAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: Boolean(address && swapAddress)
  })

  // Read Farm Pool 0 user info
  const { data: farmPool0 } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: 'userInfo',
    args: address ? [0n, address] : undefined,
    enabled: Boolean(address && farmAddress)
  })

  // Read Farm Pool 1 user info
  const { data: farmPool1 } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: 'userInfo',
    args: address ? [1n, address] : undefined,
    enabled: Boolean(address && farmAddress)
  })

  // Read Farm Pool 2 user info
  const { data: farmPool2 } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: 'userInfo',
    args: address ? [2n, address] : undefined,
    enabled: Boolean(address && farmAddress)
  })

  // Read pending rewards for Pool 0
  const { data: pendingPool0 } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: 'pendingReward',
    args: address ? [0n, address] : undefined,
    enabled: Boolean(address && farmAddress)
  })

  // Read pending rewards for Pool 1
  const { data: pendingPool1 } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: 'pendingReward',
    args: address ? [1n, address] : undefined,
    enabled: Boolean(address && farmAddress)
  })

  // Read pending rewards for Pool 2
  const { data: pendingPool2 } = useReadContract({
    address: farmAddress,
    abi: FARM_ABI,
    functionName: 'pendingReward',
    args: address ? [2n, address] : undefined,
    enabled: Boolean(address && farmAddress)
  })

  // Calculate total LP holdings
  const totalLPHoldings = lpBalance ? formatUnits(lpBalance, 18, 6) : '0'

  // Calculate total staked in farms
  const totalStaked = [farmPool0, farmPool1, farmPool2].reduce((sum, pool) => {
    if (!pool) return sum
    return sum + Number(formatUnits(pool[0], 18, 6))
  }, 0)

  // Calculate total pending rewards
  const totalPendingRewards = [pendingPool0, pendingPool1, pendingPool2].reduce((sum, pending) => {
    if (!pending) return sum
    return sum + Number(formatUnits(pending, 18, 6))
  }, 0)

  // Fetch price data from API
  useEffect(() => {
    fetch('/api/token/price')
      .then(res => res.json())
      .then(data => setPriceData(data))
      .catch(console.error)

    fetch('/api/stake/pools')
      .then(res => res.json())
      .then(data => setPoolsData(data))
      .catch(console.error)

    fetch('/api/farm/stats')
      .then(res => res.json())
      .then(data => setFarmData(data))
      .catch(console.error)
  }, [])

  // 准备价格图表数据（支持 7天/30天切换）
  const priceChartData = priceData?.series
    ? filterDataByDays(
        transformDataForEcharts(priceData.series, 'ts', 'price'),
        priceDays
      )
    : []

  // 准备 TVL 图表数据（合成各池 TVL 历史）
  const tvlChartData = poolsData?.pools
    ? [{
        name: 'Total TVL',
        data: transformDataForEcharts(
          poolsData.pools[0]?.history || [], // 使用第一个池的历史数据作为示例
          'ts',
          'tvl'
        )
      }]
    : []

  // 准备 APY 图表数据（支持 7天/30天切换）
  const apyChartSeries = farmData?.apyHistory
    ? [
        {
          name: 'Pool 0',
          data: filterDataByDays(
            farmData.apyHistory
              .filter(item => item.poolId === 0)
              .map(item => [item.ts, item.apy]),
            apyDays
          )
        },
        {
          name: 'Pool 1',
          data: filterDataByDays(
            farmData.apyHistory
              .filter(item => item.poolId === 1)
              .map(item => [item.ts, item.apy]),
            apyDays
          )
        },
        {
          name: 'Pool 2',
          data: filterDataByDays(
            farmData.apyHistory
              .filter(item => item.poolId === 2)
              .map(item => [item.ts, item.apy]),
            apyDays
          )
        }
      ]
    : []

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Wallet Balances */}
      {isConnected && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Token A Balance</div>
              <div className="text-2xl font-bold">
                {balanceTKA ? formatUnits(balanceTKA, 18, 4) : '0'} TKA
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Token B Balance</div>
              <div className="text-2xl font-bold">
                {balanceTKB ? formatUnits(balanceTKB, 18, 4) : '0'} TKB
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Reward Token Balance</div>
              <div className="text-2xl font-bold">
                {balanceDRT ? formatUnits(balanceDRT, 18, 4) : '0'} DRT
              </div>
            </div>
          </div>

          {/* LP Holdings & Farm Earnings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 mb-1">💎 LP 持仓</div>
              <div className="text-2xl font-bold">
                {totalLPHoldings} LP
              </div>
              <div className="text-xs mt-2 opacity-80">
                钱包中的 LP Token
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 mb-1">🌾 Farm 质押</div>
              <div className="text-2xl font-bold">
                {totalStaked.toFixed(6)} LP
              </div>
              <div className="text-xs mt-2 opacity-80">
                已质押到 Farm 的 LP
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
              <div className="text-sm opacity-90 mb-1">💰 待领取收益</div>
              <div className="text-2xl font-bold">
                {totalPendingRewards.toFixed(6)} DRT
              </div>
              <div className="text-xs mt-2 opacity-80">
                所有 Farm 池的总收益
              </div>
            </div>
          </div>
        </>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Token Price</div>
          <div className="text-3xl font-bold">${priceData?.price?.toFixed(4) || '0'}</div>
          <div className={`text-sm mt-2 ${priceData?.change24h >= 0 ? 'text-green-200' : 'text-red-200'}`}>
            {priceData?.change24h >= 0 ? '+' : ''}{priceData?.change24h?.toFixed(2)}% (24h)
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Total TVL</div>
          <div className="text-3xl font-bold">
            {poolsData ? formatUSD(poolsData.pools.reduce((sum, pool) => sum + parseFloat(pool.tvl), 0)) : '$0'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Farm TVL</div>
          <div className="text-3xl font-bold">
            {farmData ? formatUSD(farmData.totalValueLocked) : '$0'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Active Users</div>
          <div className="text-3xl font-bold">
            {farmData ? formatNumber(farmData.activeUsers) : '0'}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Price Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Token Price</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPriceDays(7)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  priceDays === 7
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                7天
              </button>
              <button
                onClick={() => setPriceDays(30)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  priceDays === 30
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                30天
              </button>
            </div>
          </div>

          {priceChartData.length > 0 ? (
            <LineChartEcharts
              series={[{ name: 'Price', data: priceChartData }]}
              height={350}
              yAxisFormatter="${value}"
              areaStyle={true}
              smooth={true}
            />
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-400">
              Loading price data...
            </div>
          )}
        </div>

        {/* TVL Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Total Value Locked</h3>

          {tvlChartData.length > 0 && tvlChartData[0].data.length > 0 ? (
            <LineChartEcharts
              series={tvlChartData}
              height={350}
              yAxisFormatter="${value}"
              areaStyle={true}
              smooth={true}
            />
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-400">
              Loading TVL data...
            </div>
          )}
        </div>
      </div>

      {/* APY Chart - Full Width */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Farm APY History</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setApyDays(7)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                apyDays === 7
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              7天
            </button>
            <button
              onClick={() => setApyDays(30)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                apyDays === 30
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              30天
            </button>
          </div>
        </div>

        {apyChartSeries.length > 0 && apyChartSeries[0].data.length > 0 ? (
          <LineChartEcharts
            series={apyChartSeries}
            height={400}
            yAxisFormatter="{value}%"
            areaStyle={false}
            smooth={true}
          />
        ) : (
          <div className="h-[400px] flex items-center justify-center text-gray-400">
            Loading APY data...
          </div>
        )}
      </div>

      {/* Staking Pools */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Staking Pools</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Pool</th>
                <th className="text-right py-3 px-4">TVL</th>
                <th className="text-right py-3 px-4">APR</th>
                <th className="text-right py-3 px-4">Total Staked</th>
              </tr>
            </thead>
            <tbody>
              {poolsData?.pools?.map((pool) => (
                <tr key={pool.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold">{pool.name}</div>
                    <div className="text-sm text-gray-600">{pool.stakingToken} → {pool.rewardToken}</div>
                  </td>
                  <td className="text-right py-3 px-4 font-semibold">{formatUSD(pool.tvl)}</td>
                  <td className="text-right py-3 px-4">
                    <span className="text-green-600 font-semibold">{pool.apr.toFixed(2)}%</span>
                  </td>
                  <td className="text-right py-3 px-4">{formatNumber(parseFloat(pool.totalStaked))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
