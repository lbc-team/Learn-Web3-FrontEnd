# Day 1: DAPP 项目概览与初始化

## 学习目标

- 了解实战 DeFi 项目的整体架构
- 从零开始搭建 DAPP 前端项目
- 理解项目目录结构
- 配置开发环境和依赖

---

## 1. 实战 DeFi 项目介绍

本项目是一个完整的 DeFi 平台，包含以下核心功能：

### 1.1 主要功能模块

- **LaunchPad（代币发行平台）**
  - 项目方可以发行新代币
  - 用户可以参与代币销售
  - 支持自动合约部署

- **DEX（去中心化交易所）**
  - Swap：代币兑换功能
  - Pool：流动性池管理
  - 支持添加/移除流动性

- **LP 质押挖矿（Farms）**
  - 质押 LP Token 获得奖励
  - 多池支持
  - 实时收益展示

- **Bridge（跨链桥）**
  - 资产跨链转移
  - 支持多链互通

### 1.2 技术栈

**前端框架**
- Next.js 15 (App Router)
- React 18
- TailwindCSS

**Web3 相关**
- Wagmi v2 - React Hooks for Ethereum
- Viem - TypeScript 以太坊库
- RainbowKit - 钱包连接 UI

**智能合约**
- Solidity
- Foundry (已部署到 Sepolia 测试网)

---

## 2. 从 0 到 1 初始化构建 DAPP 前端项目

### 2.1 创建 Next.js 项目

```bash
# 进入工作目录
cd /Users/mac/Learn-Web3-FrontEnd

# 创建 Next.js 项目
npx create-next-app@latest web3-dapp-demo

# 创建时的选项：
# ✔ Would you like to use TypeScript? … No
# ✔ Would you like to use ESLint? … Yes
# ✔ Would you like to use Tailwind CSS? … Yes
# ✔ Would you like your code inside a `src/` directory? … No
# ✔ Would you like to use App Router? … Yes
# ✔ Would you like to use Turbopack for `next dev`? … No
# ✔ Would you like to customize the import alias (`@/*` by default)? … No

# 进入项目目录
cd web3-dapp-demo
```

### 2.2 安装 Web3 相关依赖

```bash
# 安装 Wagmi 和 Viem
npm install wagmi viem@2.x @tanstack/react-query

# 安装 RainbowKit (钱包连接)
npm install @rainbow-me/rainbowkit

# 安装其他工具库
npm install @reown/appkit @reown/appkit-adapter-wagmi
```

### 2.3 创建项目目录结构

```bash
# 创建必要的目录
mkdir -p app/{swap,pool,farm,launchpad,dashboard,bridge}
mkdir -p lib/{abis,constants,utils}
mkdir -p components
mkdir -p public
```

### 2.4 配置环境变量

创建 `.env.local` 文件：

```bash
# .env.local
# RPC URLs
NEXT_PUBLIC_RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_RPC_URL_ANVIL=http://127.0.0.1:8545

# WalletConnect Project ID (from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID

# Token Addresses (Sepolia Testnet)
NEXT_PUBLIC_TOKEN_A_ADDRESS=0x8a88b830915aea048ebf8340aca47e21b8e342b4
NEXT_PUBLIC_TOKEN_B_ADDRESS=0x2b79645f2be73db5c001397ba261489dd5d25294
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x2d6bf73e7c3c48ce8459468604fd52303a543dcd

# Contract Addresses (Sepolia)
NEXT_PUBLIC_SWAP_ADDRESS=0x1f8e4Ca3EeA8Fbf9677a17c346B5Eb4f88309866
NEXT_PUBLIC_STAKE_POOL_ADDRESS=0xad93F86b7eE2e350fDD5E5a2b30cDbb1b304d622
NEXT_PUBLIC_FARM_ADDRESS=0x77008b97579Ed75F9917c2f0f948afDf15604677
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0x0CfF6fe40c8c2c15930BFce84d27904D8a8461Cf
NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS=0x27345a45c0cbd8e780650ae59DF8f18eb5aB376D
```

---

## 3. 项目目录结构分析

完成初始化后，项目目录结构如下：

```
web3-dapp-demo/
├── app/                          # Next.js App Router 目录
│   ├── swap/                     # Swap 页面（Day 2）
│   ├── pool/                     # Pool 页面（Day 2）
│   ├── farm/                     # Farm 页面（Day 2）
│   ├── launchpad/                # LaunchPad 页面（Day 3）
│   │   └── create/               # 创建销售页面
│   ├── dashboard/                # Dashboard 页面（Day 3）
│   ├── bridge/                   # Bridge 页面（Day 3）
│   ├── api/                      # API 路由
│   │   ├── swap/                 # Swap API
│   │   ├── pool/                 # Pool API
│   │   ├── farm/                 # Farm API
│   │   └── launchpad/            # LaunchPad API
│   ├── layout.js                 # 根布局（Day 4 - 钱包连接）
│   ├── page.js                   # 首页
│   └── globals.css               # 全局样式
│
├── lib/                          # 工具库和配置
│   ├── abis/                     # 智能合约 ABI
│   │   ├── index.js
│   │   ├── erc20.js
│   │   ├── swap.js
│   │   ├── stakePool.js
│   │   ├── farm.js
│   │   └── launchpad.js
│   ├── constants/                # 常量配置
│   │   ├── index.js
│   │   └── addresses.js
│   ├── utils/                    # 工具函数
│   │   ├── units.js              # 单位转换
│   │   └── format.js             # 格式化函数
│   ├── wagmiClient.js            # Wagmi 配置（Day 4）
│   └── abiLoader.js              # ABI 加载器
│
├── components/                   # 可复用组件
│   ├── Navbar.js                 # 导航栏（Day 4）
│   ├── ApproveButton.js          # Approve 按钮（Day 5）
│   └── ErrorFilter.js            # 错误过滤器
│
├── public/                       # 静态资源
│   └── images/
│
├── .env.local                    # 环境变量（不提交到 Git）
├── .gitignore
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

### 3.1 关键目录说明

**app/** - Next.js 15 App Router
- 每个子目录代表一个路由
- `page.js` 是该路由的页面组件
- `layout.js` 是布局组件

**lib/** - 核心库文件
- `abis/` - 存放智能合约的 ABI 定义
- `constants/` - 项目常量（合约地址、链配置等）
- `utils/` - 工具函数（格式化、单位转换等）
- `wagmiClient.js` - Wagmi 配置文件

**components/** - 可复用组件
- UI 组件
- 业务组件

---

## 4. 安装插件与工具配置

### 4.1 推荐的 VS Code 插件

```bash
# 安装以下 VS Code 插件：
# - ESLint
# - Tailwind CSS IntelliSense
# - Prettier - Code formatter
# - Solidity (如果要查看合约)
```

### 4.2 配置 Tailwind CSS

`tailwind.config.js` 已由 create-next-app 自动生成，确保配置正确：

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4.3 配置 Next.js

`next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
}

module.exports = nextConfig
```

---

## 5. 验证安装

### 5.1 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000，应该能看到 Next.js 默认页面。

### 5.2 检查依赖安装

```bash
# 查看已安装的关键包
npm list wagmi viem @rainbow-me/rainbowkit
```

---

## Day 1 总结

今天我们完成了：

✅ 了解了项目的整体架构和功能模块
✅ 创建了 Next.js 项目
✅ 安装了所有必要的依赖
✅ 配置了环境变量
✅ 理解了项目目录结构

**下一步（Day 2）**：
- 开发 Swap 页面的 UI 和样式
- 开发 Pool 页面的 UI 和样式
- 开发 Farms 页面的 UI 和样式

---

## 常见问题

### Q: 如何获取 Infura API Key?
A: 访问 https://infura.io/ 注册账号，创建项目即可获得。

### Q: 如何获取 WalletConnect Project ID?
A: 访问 https://cloud.walletconnect.com/ 注册并创建项目。

### Q: 合约地址从哪里来？
A: 本项目合约已部署到 Sepolia 测试网，地址已在 `.env.local` 中提供。

### Q: 如何获取 Sepolia 测试币？
A: 使用 Sepolia Faucet: https://sepoliafaucet.com/
