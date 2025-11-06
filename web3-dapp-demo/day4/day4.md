# Day 4: 钱包连接实现（Wagmi + RainbowKit）

## 本节目标

实现 Web3 钱包连接功能，支持多种主流钱包：
- **配置 Wagmi**：React Hooks for Ethereum
- **集成 RainbowKit**：美观的钱包连接 UI
- **支持钱包**：MetaMask、Coinbase Wallet、Rainbow、WalletConnect
- **网络配置**：Sepolia 测试网

---

## 1. 依赖安装

首先确认 Day 1 已安装的依赖：

```bash
npm install wagmi viem@2.x @tanstack/react-query
npm install @rainbow-me/rainbowkit
```

---

## 2. 创建 Wagmi 配置文件

### 2.1 创建配置文件

```bash
mkdir -p lib
touch lib/wagmiClient.js
```

### 2.2 配置 Wagmi 客户端

创建 `lib/wagmiClient.js`：

```javascript
'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

// 配置 Wagmi 客户端
export const config = getDefaultConfig({
  appName: 'Web3 DAPP Demo',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepolia],
  ssr: true, // 如果是服务端渲染项目
})
```

### 2.3 要点说明

- **projectId**：从 [WalletConnect Cloud](https://cloud.walletconnect.com/) 获取免费的 Project ID
- **chains**：支持的区块链网络数组
- **ssr**：Next.js App Router 需要设置为 `true`
- **appName**：在钱包中显示的应用名称

---

## 3. 创建 Providers 组件

### 3.1 创建 Providers 文件

```bash
mkdir -p components
touch components/Providers.js
```

### 3.2 配置 Providers

创建 `components/Providers.js`：

```javascript
'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from '@/lib/wagmiClient'

const queryClient = new QueryClient()

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### 3.3 要点说明

- **WagmiProvider**：提供 Wagmi Hooks 上下文
- **QueryClientProvider**：React Query 用于数据缓存
- **RainbowKitProvider**：RainbowKit UI 组件上下文
- **'use client'**：必须标记为客户端组件

---

## 4. 更新根布局

### 4.1 修改 `app/layout.js`

编辑 `app/layout.js`：

```javascript
import { Providers } from '@/components/Providers'
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
        <Providers>
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
                  </div>
                </div>

                {/* 钱包连接按钮占位 - Day 4 会替换 */}
                <div id="wallet-button-placeholder">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {children}
        </Providers>
      </body>
    </html>
  )
}
```

---

## 5. 创建钱包连接组件

### 5.1 创建 WalletButton 组件

```bash
touch components/WalletButton.js
```

### 5.2 实现 WalletButton

创建 `components/WalletButton.js`：

```javascript
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function WalletButton() {
  return (
    <ConnectButton
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
      showBalance={{
        smallScreen: false,
        largeScreen: true,
      }}
    />
  )
}
```

### 5.3 集成到导航栏

再次编辑 `app/layout.js`，替换钱包按钮：

```javascript
import { WalletButton } from '@/components/WalletButton'
// ... 其他 imports

// 在导航栏中替换按钮占位符
<div id="wallet-button-placeholder">
  <WalletButton />
</div>
```

完整的导航栏代码：

```javascript
<nav className="bg-gray-900 border-b border-gray-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center">
        <Link href="/" className="text-white font-bold text-xl">
          Web3 DAPP
        </Link>
        <div className="ml-10 flex items-baseline space-x-4">
          <Link href="/swap" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Swap
          </Link>
          <Link href="/pool" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Pool
          </Link>
          <Link href="/farm" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Farms
          </Link>
          <Link href="/launchpad" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            LaunchPad
          </Link>
          <Link href="/dashboard" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Dashboard
          </Link>
          <Link href="/bridge" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
            Bridge
          </Link>
        </div>
      </div>

      {/* RainbowKit 钱包连接按钮 */}
      <WalletButton />
    </div>
  </div>
</nav>
```

---

## 6. 测试钱包连接

### 6.1 启动开发服务器

```bash
npm run dev
```

### 6.2 测试流程

1. **打开浏览器**：访问 http://localhost:3000
2. **点击 Connect Wallet**：查看钱包列表弹窗
3. **选择 MetaMask**：
   - 如果已安装 MetaMask 扩展，点击连接
   - 在 MetaMask 中切换到 Sepolia 测试网
   - 批准连接请求
4. **查看连接状态**：
   - 按钮显示地址缩写（如 0x1234...5678）
   - 显示 ETH 余额
   - 点击按钮可查看账户详情和断开连接

### 6.3 测试其他钱包

- **Coinbase Wallet**：需要安装 Coinbase Wallet 扩展
- **Rainbow Wallet**：移动端钱包，可通过 WalletConnect 扫码连接
- **WalletConnect**：支持数百种移动钱包通过扫码连接

---

## 7. 在页面中使用 Wagmi Hooks

### 7.1 创建示例页面

创建 `app/test-wallet/page.js` 来测试 Wagmi Hooks：

```javascript
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
```

### 7.2 常用 Wagmi Hooks

```javascript
// 获取账户信息
const { address, isConnected, chain } = useAccount()

// 获取余额
const { data: balance } = useBalance({ address })

// 读取合约
const { data } = useReadContract({
  address: '0x...',
  abi: contractABI,
  functionName: 'balanceOf',
  args: [address]
})

// 写入合约
const { writeContract } = useWriteContract()

// 断开连接
const { disconnect } = useDisconnect()

// 切换网络
const { switchChain } = useSwitchChain()
```

---

## 8. 自定义 RainbowKit 主题

### 8.1 修改 Providers.js

如果需要自定义主题，修改 `components/Providers.js`：

```javascript
'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from '@/lib/wagmiClient'

const queryClient = new QueryClient()

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#7b3ff2',
            accentColorForeground: 'white',
            borderRadius: 'large',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### 8.2 可用主题选项

- **darkTheme()**：深色主题
- **lightTheme()**：浅色主题
- **midnightTheme()**：午夜主题
- 自定义颜色和圆角

---

## 9. 环境变量配置

### 9.1 获取 WalletConnect Project ID

1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 注册并创建新项目
3. 复制 Project ID

### 9.2 更新 `.env.local`

```bash
# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# RPC URLs
NEXT_PUBLIC_RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# 其他环境变量...
```

---

## 10. 本节小结

✅ **完成内容**：
- 配置 Wagmi 客户端
- 集成 RainbowKit UI
- 实现钱包连接功能
- 支持多种主流钱包
- 测试钱包连接和信息读取

📌 **下一步（Day 5）**：
- 实现代币授权（Approve）
- 实现 Swap 交易
- 实现添加/移除流动性
- 实现 LP 质押和解除质押
- 处理交易状态和错误

💡 **注意事项**：
- 确保有 Sepolia 测试网 ETH
- 从水龙头获取测试币：https://sepoliafaucet.com/
- MetaMask 需要手动添加 Sepolia 网络
- 每次交易都需要 Gas 费

---

## 常见问题

**Q1: 为什么点击 Connect Wallet 没反应？**
A: 检查是否正确安装了 Providers 组件，并确认所有依赖已安装。

**Q2: 连接后地址显示错误？**
A: 确认 MetaMask 中选择的账户，并检查 `useAccount()` 的返回值。

**Q3: 如何添加更多网络支持？**
A: 在 `wagmiClient.js` 的 `chains` 数组中添加，例如 `[sepolia, mainnet, polygon]`。

**Q4: WalletConnect 扫码后连接失败？**
A: 确认 `.env.local` 中的 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 正确配置。

**Q5: 如何自定义钱包列表？**
A: 使用 `getDefaultWallets` 或手动配置 connectors，参考 RainbowKit 文档。

**Q6: 如何检测钱包网络切换？**
A: 使用 `useAccount()` 的 `chain` 属性，配合 `useEffect` 监听变化。

**Q7: 能否隐藏某些钱包选项？**
A: 可以通过自定义 config 配置 wallets 参数来控制显示的钱包。
