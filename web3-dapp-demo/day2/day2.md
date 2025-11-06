# Day 2: DEX 核心页面开发（Swap、Pool、Farms）

## 本节目标

完成 DEX 三大核心页面的 UI 结构和样式：
- **Swap 页面**：代币兑换界面
- **Pool 页面**：流动性池管理
- **Farms 页面**：LP 代币质押挖矿

注：本节只实现页面结构和样式，暂不接入区块链交互逻辑。

---

## 1. Swap 页面开发

### 1.1 创建 Swap 页面文件

```bash
mkdir -p app/swap
touch app/swap/page.js
```

### 1.2 Swap 页面代码

创建 `app/swap/page.js`：

```javascript
'use client'

import { useState } from 'react'

export default function SwapPage() {
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('USDT')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')

  const tokens = ['ETH', 'USDT', 'USDC', 'DAI']

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Swap Tokens
        </h1>

        {/* Swap 卡片 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">

          {/* From Token */}
          <div className="mb-4">
            <label className="text-white/70 text-sm mb-2 block">From</label>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {tokens.map(token => (
                    <option key={token} value={token} className="bg-gray-800">
                      {token}
                    </option>
                  ))}
                </select>
                <span className="text-white/50 text-sm">Balance: 0.00</span>
              </div>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-white text-2xl font-semibold focus:outline-none placeholder-white/30"
              />
            </div>
          </div>

          {/* 交换按钮 */}
          <div className="flex justify-center my-4">
            <button
              onClick={handleSwapTokens}
              className="bg-white/10 hover:bg-white/20 rounded-full p-3 border border-white/20 transition-all"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To Token */}
          <div className="mb-6">
            <label className="text-white/70 text-sm mb-2 block">To</label>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {tokens.map(token => (
                    <option key={token} value={token} className="bg-gray-800">
                      {token}
                    </option>
                  ))}
                </select>
                <span className="text-white/50 text-sm">Balance: 0.00</span>
              </div>
              <input
                type="number"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-white text-2xl font-semibold focus:outline-none placeholder-white/30"
              />
            </div>
          </div>

          {/* 兑换信息 */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Exchange Rate</span>
              <span className="text-white">1 ETH = 2000 USDT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Price Impact</span>
              <span className="text-green-400">{'<'}0.01%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Network Fee</span>
              <span className="text-white">~$2.50</span>
            </div>
          </div>

          {/* Swap 按钮 */}
          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50">
            Connect Wallet to Swap
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 1.3 Swap 页面要点说明

- **双向输入框**：支持 From/To 金额输入
- **代币选择器**：下拉选择要兑换的代币
- **交换方向按钮**：一键翻转兑换方向
- **实时信息展示**：汇率、价格影响、手续费（目前为模拟数据）
- **渐变背景**：使用 TailwindCSS 渐变和毛玻璃效果

---

## 2. Pool 页面开发

### 2.1 创建 Pool 页面文件

```bash
mkdir -p app/pool
touch app/pool/page.js
```

### 2.2 Pool 页面代码

创建 `app/pool/page.js`：

```javascript
'use client'

import { useState } from 'react'

export default function PoolPage() {
  const [activeTab, setActiveTab] = useState('add') // 'add' or 'remove'
  const [token0, setToken0] = useState('ETH')
  const [token1, setToken1] = useState('USDT')
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')

  const tokens = ['ETH', 'USDT', 'USDC', 'DAI']

  // 模拟流动性池数据
  const mockPools = [
    { pair: 'ETH/USDT', liquidity: '$1,234,567', apr: '12.5%', myShare: '0.05%' },
    { pair: 'ETH/USDC', liquidity: '$987,654', apr: '8.3%', myShare: '0.00%' },
    { pair: 'USDT/USDC', liquidity: '$543,210', apr: '5.2%', myShare: '0.00%' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* 标题 */}
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Liquidity Pools
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* 左侧：添加/移除流动性 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">

            {/* Tab 切换 */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setActiveTab('add')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'add'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Add Liquidity
              </button>
              <button
                onClick={() => setActiveTab('remove')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'remove'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Remove Liquidity
              </button>
            </div>

            {activeTab === 'add' ? (
              <>
                {/* Token 0 输入 */}
                <div className="mb-4">
                  <label className="text-white/70 text-sm mb-2 block">Token 1</label>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <select
                        value={token0}
                        onChange={(e) => setToken0(e.target.value)}
                        className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {tokens.map(token => (
                          <option key={token} value={token} className="bg-gray-800">
                            {token}
                          </option>
                        ))}
                      </select>
                      <span className="text-white/50 text-sm">Balance: 0.00</span>
                    </div>
                    <input
                      type="number"
                      value={amount0}
                      onChange={(e) => setAmount0(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-transparent text-white text-2xl font-semibold focus:outline-none placeholder-white/30"
                    />
                  </div>
                </div>

                {/* Plus 图标 */}
                <div className="flex justify-center my-4">
                  <div className="bg-white/10 rounded-full p-3 border border-white/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>

                {/* Token 1 输入 */}
                <div className="mb-6">
                  <label className="text-white/70 text-sm mb-2 block">Token 2</label>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <select
                        value={token1}
                        onChange={(e) => setToken1(e.target.value)}
                        className="bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {tokens.map(token => (
                          <option key={token} value={token} className="bg-gray-800">
                            {token}
                          </option>
                        ))}
                      </select>
                      <span className="text-white/50 text-sm">Balance: 0.00</span>
                    </div>
                    <input
                      type="number"
                      value={amount1}
                      onChange={(e) => setAmount1(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-transparent text-white text-2xl font-semibold focus:outline-none placeholder-white/30"
                    />
                  </div>
                </div>

                {/* 流动性信息 */}
                <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Share of Pool</span>
                    <span className="text-white">0.05%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">LP Tokens</span>
                    <span className="text-white">0.001 LP</span>
                  </div>
                </div>

                {/* 添加流动性按钮 */}
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/50">
                  Connect Wallet to Add
                </button>
              </>
            ) : (
              <>
                {/* 移除流动性界面 */}
                <div className="mb-6">
                  <label className="text-white/70 text-sm mb-2 block">
                    Amount to Remove
                  </label>
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="text-center mb-4">
                      <div className="text-5xl font-bold text-white mb-2">25%</div>
                      <div className="text-white/50 text-sm">of your liquidity</div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="25"
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between mt-2 text-xs text-white/50">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* 预计收到 */}
                <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-3">
                  <div className="text-white/70 text-sm mb-2">You will receive:</div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">0.025 ETH</span>
                    <span className="text-white/50 text-sm">~$50.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">50 USDT</span>
                    <span className="text-white/50 text-sm">~$50.00</span>
                  </div>
                </div>

                {/* 移除流动性按钮 */}
                <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-red-500/50">
                  Connect Wallet to Remove
                </button>
              </>
            )}
          </div>

          {/* 右侧：流动性池列表 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Your Liquidity</h2>

            <div className="space-y-4">
              {mockPools.map((pool, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-white font-semibold text-lg">{pool.pair}</div>
                      <div className="text-white/50 text-sm">Liquidity: {pool.liquidity}</div>
                    </div>
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {pool.apr} APR
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">My Share:</span>
                    <span className="text-white font-semibold">{pool.myShare}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 空状态提示 */}
            <div className="mt-6 text-center text-white/50 text-sm">
              <p>Connect wallet to see your liquidity positions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 2.3 Pool 页面要点说明

- **Tab 切换**：添加流动性 / 移除流动性
- **双代币输入**：流动性对两边的代币和数量
- **滑块控制**：移除流动性时的百分比选择
- **流动性池列表**：展示所有可用池子及 APR
- **响应式布局**：大屏双栏，小屏单栏

---

## 3. Farms 页面开发

### 3.1 创建 Farms 页面文件

```bash
mkdir -p app/farm
touch app/farm/page.js
```

### 3.2 Farms 页面代码

创建 `app/farm/page.js`：

```javascript
'use client'

import { useState } from 'react'

export default function FarmPage() {
  const [activeTab, setActiveTab] = useState('stake') // 'stake' or 'unstake'
  const [amount, setAmount] = useState('')

  // 模拟农场数据
  const mockFarms = [
    {
      name: 'ETH/USDT LP',
      apr: '45.6%',
      tvl: '$2,345,678',
      earned: '12.5',
      staked: '1.23',
      rewardToken: 'REWARD'
    },
    {
      name: 'ETH/USDC LP',
      apr: '32.1%',
      tvl: '$1,876,543',
      earned: '0.00',
      staked: '0.00',
      rewardToken: 'REWARD'
    },
    {
      name: 'USDT/USDC LP',
      apr: '18.9%',
      tvl: '$987,654',
      earned: '0.00',
      staked: '0.00',
      rewardToken: 'REWARD'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* 标题和统计 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Yield Farms
          </h1>
          <p className="text-white/70 text-lg">
            Stake LP tokens to earn rewards
          </p>

          {/* 总览统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-white/70 text-sm mb-2">Total Value Locked</div>
              <div className="text-3xl font-bold text-white">$5,209,875</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-white/70 text-sm mb-2">My Total Staked</div>
              <div className="text-3xl font-bold text-white">$123.45</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-white/70 text-sm mb-2">Total Earned</div>
              <div className="text-3xl font-bold text-green-400">12.5 REWARD</div>
            </div>
          </div>
        </div>

        {/* 农场列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockFarms.map((farm, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 hover:border-green-400/50 transition-all"
            >
              {/* 农场头部 */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{farm.name}</h3>
                  <div className="text-white/50 text-sm">Earn {farm.rewardToken}</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold">
                  {farm.apr} APR
                </div>
              </div>

              {/* 农场信息 */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">TVL</span>
                  <span className="text-white font-semibold">{farm.tvl}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Your Staked</span>
                  <span className="text-white font-semibold">{farm.staked} LP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Earned</span>
                  <span className="text-green-400 font-semibold">{farm.earned} {farm.rewardToken}</span>
                </div>
              </div>

              {/* 已赚取奖励 */}
              {parseFloat(farm.earned) > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white/70 text-xs mb-1">Rewards Available</div>
                      <div className="text-green-400 font-bold text-lg">{farm.earned} {farm.rewardToken}</div>
                    </div>
                    <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-all">
                      Harvest
                    </button>
                  </div>
                </div>
              )}

              {/* 质押/取消质押 */}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setActiveTab('stake')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'stake'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Stake
                  </button>
                  <button
                    onClick={() => setActiveTab('unstake')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'unstake'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Unstake
                  </button>
                </div>

                <div className="flex items-center bg-white/5 rounded-lg px-3 py-2 mb-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-white focus:outline-none placeholder-white/30"
                  />
                  <button className="text-green-400 text-sm font-semibold hover:text-green-300">
                    MAX
                  </button>
                </div>

                <div className="text-white/50 text-xs mb-3">
                  Available: 0.00 LP
                </div>

                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-green-500/50">
                  {activeTab === 'stake' ? 'Stake LP Tokens' : 'Unstake LP Tokens'}
                </button>
              </div>

              {/* 详情链接 */}
              <button className="w-full text-white/70 hover:text-white text-sm font-semibold transition-all">
                View Contract ↗
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 3.3 Farms 页面要点说明

- **农场卡片布局**：响应式网格，自动适配屏幕
- **APR 高亮显示**：吸引用户关注高收益池
- **实时奖励展示**：已赚取的代币数量
- **Stake/Unstake 切换**：同一界面完成质押和取消质押
- **Harvest 按钮**：一键收割奖励
- **TVL 和用户数据**：展示总锁仓量和个人质押

---

## 4. 添加页面导航

### 4.1 更新根布局导航

编辑 `app/layout.js`，添加导航链接：

```javascript
import Link from 'next/link'
import './globals.css'

export const metadata = {
  title: 'Web3 DAPP Demo',
  description: 'Learn Web3 Development Step by Step',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* 导航栏 */}
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-white font-bold text-xl">
                  Web3 DAPP
                </Link>
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    href="/swap"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Swap
                  </Link>
                  <Link
                    href="/pool"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Pool
                  </Link>
                  <Link
                    href="/farm"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Farms
                  </Link>
                </div>
              </div>

              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">
                Connect Wallet
              </button>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  )
}
```

---

## 5. 测试页面

### 5.1 启动开发服务器

```bash
npm run dev
```

### 5.2 访问页面

在浏览器中分别访问：
- http://localhost:3000/swap
- http://localhost:3000/pool
- http://localhost:3000/farm

---

## 6. 本节小结

✅ **完成内容**：
- Swap 页面：双向代币兑换界面
- Pool 页面：添加/移除流动性界面
- Farms 页面：LP 质押挖矿界面
- 导航栏：快速切换各页面

📌 **下一步（Day 3）**：
- LaunchPad 页面开发
- Dashboard 数据看板
- Bridge 跨链桥界面

💡 **注意事项**：
- 当前所有数据都是模拟数据
- 钱包连接功能将在 Day 4 实现
- 区块链交互逻辑将在 Day 5-6 实现
- 建议先熟悉页面布局和交互流程

---

## 常见问题

**Q1: 为什么页面上的余额都是 0？**
A: 目前未连接钱包，也未接入区块链数据。Day 4 会实现钱包连接，Day 5-6 会接入真实数据。

**Q2: 点击按钮没有反应？**
A: 这是正常的，当前只是 UI 展示，业务逻辑在后续章节实现。

**Q3: 如何修改代币列表？**
A: 修改各页面中的 `tokens` 数组，添加你想要的代币名称即可。

**Q4: 样式可以自定义吗？**
A: 可以！本教程使用 TailwindCSS，你可以修改任何 className 来调整样式。

**Q5: APR 数据从哪里来？**
A: 目前是硬编码的模拟数据。真实 APR 需要从合约或后端 API 获取，Day 6 会讲解。
