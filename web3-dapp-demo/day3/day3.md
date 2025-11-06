# Day 3: 高级页面开发（LaunchPad、Dashboard、Bridge）

## 本节目标

完成另外三个核心页面的 UI 结构和样式：
- **LaunchPad 页面**：代币发行与众筹平台
- **Dashboard 页面**：用户数据看板
- **Bridge 页面**：跨链桥接口

注：本节只实现页面结构和样式，暂不接入区块链交互逻辑。

---

## 1. LaunchPad 页面开发

### 1.1 创建 LaunchPad 页面文件

```bash
mkdir -p app/launchpad
touch app/launchpad/page.js
```

### 1.2 LaunchPad 页面代码

创建 `app/launchpad/page.js`：

```javascript
'use client'

import { useState } from 'react'

export default function LaunchPadPage() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [investAmount, setInvestAmount] = useState('')

  // 模拟项目数据
  const mockProjects = [
    {
      id: 1,
      name: 'DeFi Protocol X',
      symbol: 'DPX',
      logo: '🚀',
      description: 'Next-generation decentralized lending protocol with AI-powered risk assessment',
      totalRaise: '500,000',
      raised: '350,000',
      participants: 1234,
      startTime: '2024-02-15',
      endTime: '2024-02-28',
      tokenPrice: '0.05',
      status: 'active',
      progress: 70
    },
    {
      id: 2,
      name: 'GameFi Arena',
      symbol: 'GFA',
      logo: '🎮',
      description: 'Play-to-earn metaverse gaming platform with NFT integration',
      totalRaise: '1,000,000',
      raised: '1,000,000',
      participants: 3456,
      startTime: '2024-01-20',
      endTime: '2024-02-05',
      tokenPrice: '0.10',
      status: 'completed',
      progress: 100
    },
    {
      id: 3,
      name: 'Green Energy DAO',
      symbol: 'GED',
      logo: '🌱',
      description: 'Decentralized renewable energy financing and carbon credit marketplace',
      totalRaise: '750,000',
      raised: '125,000',
      participants: 567,
      startTime: '2024-03-01',
      endTime: '2024-03-15',
      tokenPrice: '0.08',
      status: 'upcoming',
      progress: 0
    },
  ]

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
    return badges[status] || badges.upcoming
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🚀 LaunchPad
          </h1>
          <p className="text-white/70 text-lg">
            Discover and invest in promising blockchain projects
          </p>
        </div>

        {/* 项目列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {mockProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 hover:border-purple-400/50 transition-all cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              {/* 项目头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-4xl mr-3">{project.logo}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{project.name}</h3>
                    <div className="text-white/50 text-sm">${project.symbol}</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(project.status)}`}>
                  {project.status.toUpperCase()}
                </div>
              </div>

              {/* 项目描述 */}
              <p className="text-white/70 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* 筹资进度 */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Progress</span>
                  <span className="text-white font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* 项目数据 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/50 text-xs mb-1">Raised</div>
                  <div className="text-white font-semibold">${project.raised}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/50 text-xs mb-1">Goal</div>
                  <div className="text-white font-semibold">${project.totalRaise}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/50 text-xs mb-1">Token Price</div>
                  <div className="text-white font-semibold">${project.tokenPrice}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/50 text-xs mb-1">Participants</div>
                  <div className="text-white font-semibold">{project.participants}</div>
                </div>
              </div>

              {/* 操作按钮 */}
              {project.status === 'active' ? (
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50">
                  Invest Now
                </button>
              ) : project.status === 'upcoming' ? (
                <button className="w-full bg-white/10 text-white/70 font-semibold py-3 rounded-xl cursor-not-allowed">
                  Coming Soon
                </button>
              ) : (
                <button className="w-full bg-white/10 text-white/70 font-semibold py-3 rounded-xl cursor-not-allowed">
                  Sale Ended
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 项目详情弹窗 */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
               onClick={() => setSelectedProject(null)}>
            <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-white/20"
                 onClick={(e) => e.stopPropagation()}>

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <div className="text-5xl mr-4">{selectedProject.logo}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{selectedProject.name}</h2>
                    <div className="text-white/50">${selectedProject.symbol}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-white/70 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <p className="text-white/70 mb-6">{selectedProject.description}</p>

              {/* 投资输入 */}
              {selectedProject.status === 'active' && (
                <div className="bg-white/5 rounded-xl p-6 mb-6">
                  <label className="text-white/70 text-sm mb-2 block">Investment Amount (USDT)</label>
                  <div className="flex items-center bg-white/10 rounded-lg px-4 py-3 mb-4">
                    <input
                      type="number"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 bg-transparent text-white text-xl font-semibold focus:outline-none placeholder-white/30"
                    />
                    <button className="text-purple-400 text-sm font-semibold hover:text-purple-300">
                      MAX
                    </button>
                  </div>

                  <div className="flex justify-between text-sm text-white/70 mb-4">
                    <span>You will receive:</span>
                    <span className="text-white font-semibold">
                      {investAmount ? (parseFloat(investAmount) / parseFloat(selectedProject.tokenPrice)).toFixed(2) : '0.00'} {selectedProject.symbol}
                    </span>
                  </div>

                  <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50">
                    Confirm Investment
                  </button>
                </div>
              )}

              {/* 项目时间线 */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Timeline</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Start Date:</span>
                    <span className="text-white">{selectedProject.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">End Date:</span>
                    <span className="text-white">{selectedProject.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Status:</span>
                    <span className={`font-semibold ${
                      selectedProject.status === 'active' ? 'text-green-400' :
                      selectedProject.status === 'completed' ? 'text-gray-400' :
                      'text-blue-400'
                    }`}>
                      {selectedProject.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 1.3 LaunchPad 页面要点说明

- **项目卡片网格**：展示所有 IDO 项目
- **状态标识**：Active / Completed / Upcoming
- **进度条**：可视化筹资进度
- **详情弹窗**：点击卡片查看详细信息
- **投资输入**：输入投资金额，自动计算获得代币数量

---

## 2. Dashboard 页面开发

### 2.1 创建 Dashboard 页面文件

```bash
mkdir -p app/dashboard
touch app/dashboard/page.js
```

### 2.2 Dashboard 页面代码

创建 `app/dashboard/page.js`：

```javascript
'use client'

import { useState } from 'react'

export default function DashboardPage() {
  // 模拟用户数据
  const userData = {
    totalBalance: '12,345.67',
    totalValue: '24,691.34',
    profitLoss: '+45.6%',
    profitLossValue: '+$5,234.12'
  }

  // 模拟资产列表
  const assets = [
    { symbol: 'ETH', name: 'Ethereum', balance: '5.2345', value: '$10,469.00', change: '+3.2%', changePositive: true },
    { symbol: 'USDT', name: 'Tether', balance: '8,500', value: '$8,500.00', change: '0.0%', changePositive: true },
    { symbol: 'USDC', name: 'USD Coin', balance: '3,200', value: '$3,200.00', change: '0.0%', changePositive: true },
    { symbol: 'DPX', name: 'DeFi Protocol X', balance: '1,250', value: '$2,500.00', change: '+12.5%', changePositive: true },
  ]

  // 模拟流动性仓位
  const liquidityPositions = [
    { pair: 'ETH/USDT', value: '$1,234.56', share: '0.05%', earned: '$45.67' },
    { pair: 'ETH/USDC', value: '$987.65', share: '0.03%', earned: '$23.45' },
  ]

  // 模拟质押仓位
  const stakingPositions = [
    { pool: 'ETH/USDT LP', staked: '1.23 LP', value: '$1,234.56', apr: '45.6%', earned: '12.5 REWARD' },
    { pool: 'ETH/USDC LP', staked: '0.98 LP', value: '$987.65', apr: '32.1%', earned: '8.3 REWARD' },
  ]

  // 模拟交易历史
  const transactions = [
    { type: 'Swap', description: 'Swapped 1.5 ETH for 3000 USDT', time: '2 hours ago', status: 'success' },
    { type: 'Add Liquidity', description: 'Added ETH/USDT liquidity', time: '5 hours ago', status: 'success' },
    { type: 'Stake', description: 'Staked 1.23 ETH/USDT LP', time: '1 day ago', status: 'success' },
    { type: 'Harvest', description: 'Harvested 12.5 REWARD tokens', time: '2 days ago', status: 'success' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* 页面标题 */}
        <h1 className="text-4xl font-bold text-white mb-8">
          Dashboard
        </h1>

        {/* 总览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Total Balance</div>
            <div className="text-3xl font-bold text-white mb-1">${userData.totalBalance}</div>
            <div className="text-white/50 text-xs">Wallet Balance</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Portfolio Value</div>
            <div className="text-3xl font-bold text-white mb-1">${userData.totalValue}</div>
            <div className="text-green-400 text-xs font-semibold">{userData.profitLoss}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Total Profit/Loss</div>
            <div className="text-3xl font-bold text-green-400 mb-1">{userData.profitLossValue}</div>
            <div className="text-white/50 text-xs">All time</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Staking Rewards</div>
            <div className="text-3xl font-bold text-purple-400 mb-1">20.8</div>
            <div className="text-white/50 text-xs">REWARD tokens</div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 左侧：资产列表 + 流动性 */}
          <div className="lg:col-span-2 space-y-8">

            {/* 我的资产 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">My Assets</h2>
              <div className="space-y-3">
                {assets.map((asset, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mr-3 flex items-center justify-center text-white font-bold">
                          {asset.symbol[0]}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{asset.symbol}</div>
                          <div className="text-white/50 text-sm">{asset.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{asset.value}</div>
                        <div className="text-white/70 text-sm">{asset.balance} {asset.symbol}</div>
                      </div>
                      <div className={`text-sm font-semibold ${asset.changePositive ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 流动性仓位 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Liquidity Positions</h2>
              <div className="space-y-3">
                {liquidityPositions.map((position, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-white font-semibold text-lg">{position.pair}</div>
                      <div className="text-white font-semibold">{position.value}</div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Pool Share: {position.share}</span>
                      <span className="text-green-400 font-semibold">Earned: {position.earned}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 质押仓位 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Staking Positions</h2>
              <div className="space-y-3">
                {stakingPositions.map((position, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-white font-semibold text-lg">{position.pool}</div>
                        <div className="text-white/50 text-sm">{position.staked}</div>
                      </div>
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                        {position.apr} APR
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Value: {position.value}</span>
                      <span className="text-green-400 font-semibold">Earned: {position.earned}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：交易历史 */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 sticky top-4">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm mb-1">{tx.type}</div>
                        <div className="text-white/70 text-xs">{tx.description}</div>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full ml-2 mt-1"></div>
                    </div>
                    <div className="text-white/50 text-xs">{tx.time}</div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold py-3 rounded-lg transition-all">
                View All Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 2.3 Dashboard 页面要点说明

- **总览卡片**：总余额、投资组合价值、盈亏、质押奖励
- **资产列表**：用户持有的所有代币及价值
- **流动性仓位**：已添加的流动性池及收益
- **质押仓位**：正在进行的质押及奖励
- **交易历史**：最近的交易记录

---

## 3. Bridge 页面开发

### 3.1 创建 Bridge 页面文件

```bash
mkdir -p app/bridge
touch app/bridge/page.js
```

### 3.2 Bridge 页面代码

创建 `app/bridge/page.js`：

```javascript
'use client'

import { useState } from 'react'

export default function BridgePage() {
  const [fromChain, setFromChain] = useState('Ethereum')
  const [toChain, setToChain] = useState('Polygon')
  const [selectedToken, setSelectedToken] = useState('USDT')
  const [amount, setAmount] = useState('')

  const chains = [
    { name: 'Ethereum', icon: '🔷', color: 'from-blue-500 to-purple-500' },
    { name: 'Polygon', icon: '🟣', color: 'from-purple-500 to-pink-500' },
    { name: 'BSC', icon: '🟡', color: 'from-yellow-500 to-orange-500' },
    { name: 'Arbitrum', icon: '🔵', color: 'from-blue-400 to-cyan-400' },
    { name: 'Optimism', icon: '🔴', color: 'from-red-500 to-pink-500' },
  ]

  const tokens = ['USDT', 'USDC', 'ETH', 'WBTC']

  const handleSwapChains = () => {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
  }

  // 模拟历史记录
  const bridgeHistory = [
    {
      from: 'Ethereum',
      to: 'Polygon',
      token: 'USDT',
      amount: '1,000',
      status: 'completed',
      time: '2 hours ago'
    },
    {
      from: 'BSC',
      to: 'Ethereum',
      token: 'USDC',
      amount: '500',
      status: 'pending',
      time: '5 hours ago'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🌉 Cross-Chain Bridge
          </h1>
          <p className="text-white/70 text-lg">
            Transfer assets securely across different blockchains
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 左侧：跨链桥接口 */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">

              {/* From Chain */}
              <div className="mb-6">
                <label className="text-white/70 text-sm mb-3 block">From Chain</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {chains.map((chain) => (
                    <button
                      key={chain.name}
                      onClick={() => setFromChain(chain.name)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        fromChain === chain.name
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-3xl mb-2">{chain.icon}</div>
                      <div className="text-white font-semibold text-sm">{chain.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 金额输入 */}
              <div className="mb-6">
                <label className="text-white/70 text-sm mb-2 block">Amount</label>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {tokens.map(token => (
                        <option key={token} value={token} className="bg-gray-800">
                          {token}
                        </option>
                      ))}
                    </select>
                    <span className="text-white/50 text-sm">Balance: 10,000.00</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 bg-transparent text-white text-3xl font-semibold focus:outline-none placeholder-white/30"
                    />
                    <button className="text-blue-400 text-sm font-semibold hover:text-blue-300 ml-3">
                      MAX
                    </button>
                  </div>
                </div>
              </div>

              {/* 交换方向按钮 */}
              <div className="flex justify-center my-6">
                <button
                  onClick={handleSwapChains}
                  className="bg-white/10 hover:bg-white/20 rounded-full p-4 border border-white/20 transition-all"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              {/* To Chain */}
              <div className="mb-6">
                <label className="text-white/70 text-sm mb-3 block">To Chain</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {chains.map((chain) => (
                    <button
                      key={chain.name}
                      onClick={() => setToChain(chain.name)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        toChain === chain.name
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-3xl mb-2">{chain.icon}</div>
                      <div className="text-white font-semibold text-sm">{chain.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 桥接信息 */}
              <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
                <h3 className="text-white font-semibold mb-3">Bridge Details</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">You will receive</span>
                  <span className="text-white font-semibold">{amount || '0.00'} {selectedToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Bridge Fee</span>
                  <span className="text-white">~$5.00 (0.5%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Estimated Time</span>
                  <span className="text-white">~5-15 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Network Fee</span>
                  <span className="text-white">~$2.50</span>
                </div>
              </div>

              {/* Bridge 按钮 */}
              <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/50">
                Connect Wallet to Bridge
              </button>

              {/* 安全提示 */}
              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <div className="text-yellow-400 font-semibold text-sm mb-1">Security Notice</div>
                    <div className="text-white/70 text-xs">
                      Always double-check the destination chain and address. Bridge transactions cannot be reversed.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：桥接历史 */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 sticky top-4">
              <h2 className="text-xl font-bold text-white mb-6">Bridge History</h2>

              <div className="space-y-4">
                {bridgeHistory.map((record, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">🔷</span>
                        <span className="text-white font-semibold text-sm">{record.from}</span>
                      </div>
                      <span className="text-white/50">→</span>
                      <div className="flex items-center">
                        <span className="text-lg mr-2">🟣</span>
                        <span className="text-white font-semibold text-sm">{record.to}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70">Amount</span>
                        <span className="text-white font-semibold">
                          {record.amount} {record.token}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70">Status</span>
                        <span className={`font-semibold ${
                          record.status === 'completed' ? 'text-green-400' :
                          record.status === 'pending' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {record.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-white/50 text-xs">{record.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 支持的链 */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white/70 text-sm mb-3">Supported Chains</h3>
                <div className="flex flex-wrap gap-2">
                  {chains.map((chain) => (
                    <div
                      key={chain.name}
                      className="bg-white/5 px-3 py-1 rounded-full text-xs text-white/70 flex items-center"
                    >
                      <span className="mr-1">{chain.icon}</span>
                      {chain.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 3.3 Bridge 页面要点说明

- **链选择器**：图标化的链选择界面
- **双向切换**：一键交换源链和目标链
- **桥接详情**：显示费用、预计时间、实际到账金额
- **安全提示**：提醒用户注意跨链风险
- **历史记录**：展示过往桥接交易
- **支持的链**：清晰展示可用的区块链网络

---

## 4. 更新导航栏

编辑 `app/layout.js`，添加新页面的导航链接：

```javascript
<Link
  href="/launchpad"
  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
>
  LaunchPad
</Link>
<Link
  href="/dashboard"
  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
>
  Dashboard
</Link>
<Link
  href="/bridge"
  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
>
  Bridge
</Link>
```

---

## 5. 测试页面

### 5.1 启动开发服务器

```bash
npm run dev
```

### 5.2 访问页面

在浏览器中分别访问：
- http://localhost:3000/launchpad
- http://localhost:3000/dashboard
- http://localhost:3000/bridge

---

## 6. 本节小结

✅ **完成内容**：
- LaunchPad 页面：IDO 项目展示和投资界面
- Dashboard 页面：用户资产和交易数据看板
- Bridge 页面：跨链资产转移界面

📌 **下一步（Day 4）**：
- 钱包连接功能实现
- MetaMask、Coinbase、Rainbow、WalletConnect 集成
- RainbowKit 配置
- Wagmi 客户端设置

💡 **注意事项**：
- 当前所有数据仍为模拟数据
- 页面交互仅为 UI 层面
- Day 4 将实现真正的钱包连接
- Day 5-6 将接入智能合约交互

---

## 常见问题

**Q1: LaunchPad 项目数据从哪里获取？**
A: 真实数据需要从智能合约或后端 API 获取，Day 6 会实现数据获取逻辑。

**Q2: Dashboard 如何获取用户真实资产？**
A: 需要连接钱包后，通过合约调用查询用户余额和仓位，Day 5-6 会实现。

**Q3: Bridge 支持哪些链？**
A: 当前是模拟数据。真实跨链桥需要对接各链的桥接协议（如 LayerZero、Wormhole 等）。

**Q4: 如何添加更多代币支持？**
A: 修改 `tokens` 数组，添加代币符号和对应的合约地址配置。

**Q5: 能否自定义主题颜色？**
A: 可以！修改 TailwindCSS 的渐变色和主题色即可实现自定义。
