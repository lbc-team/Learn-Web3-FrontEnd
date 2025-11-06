# Web3 DAPP Demo - 6天入门教程

一个完整的 Web3 DAPP 开发教程项目，通过 6 天的学习，从零开始构建一个功能完整的 DeFi 应用。

## 📚 项目介绍

本项目是一个渐进式的 Web3 开发教程，涵盖了从项目初始化到完整 DAPP 交互的全部内容。每一天都有详细的教程文档和对应的代码实现。

### 🎯 学习内容

- **Day 1**: 项目概览与初始化
  - Next.js 项目搭建
  - 依赖安装与配置
  - 环境变量设置
  - 项目结构说明

- **Day 2**: DEX 核心页面开发
  - Swap（代币兑换）页面
  - Pool（流动性池）页面
  - Farms（质押挖矿）页面
  - UI 和样式实现

- **Day 3**: 高级功能页面开发
  - LaunchPad（代币发行）页面
  - Dashboard（数据看板）页面
  - Bridge（跨链桥）页面
  - 复杂交互界面

- **Day 4**: 钱包连接实现
  - Wagmi 配置
  - RainbowKit 集成
  - 多钱包支持（MetaMask、Coinbase、Rainbow、WalletConnect）
  - 网络配置

- **Day 5**: DAPP 交互 - 写入操作
  - 代币授权（Approve）
  - Swap 交易
  - 添加/移除流动性
  - LP 质押/解除质押
  - 交易状态处理

- **Day 6**: DAPP 交互 - 查询操作
  - 代币余额查询
  - 流动性池数据
  - 质押信息和奖励
  - APR 计算
  - Dashboard 实时数据

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- MetaMask 浏览器扩展
- Sepolia 测试网 ETH（可从水龙头获取）

### 安装步骤

1. **克隆项目**

```bash
git clone <your-repo-url>
cd web3-dapp-demo
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

复制 `.env.local.example` 为 `.env.local` 并填写：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
# 从 Infura 获取 RPC URL
NEXT_PUBLIC_RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# 从 WalletConnect Cloud 获取 Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID

# 合约地址（Sepolia 测试网）
NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SWAP_ADDRESS=0x...
# ... 其他合约地址
```

4. **启动开发服务器**

```bash
npm run dev
```

访问 http://localhost:3000

## 📖 学习路径

### 推荐学习顺序

1. **阅读教程文档**
   - 从 `day1/day1.md` 开始
   - 按顺序阅读每天的 markdown 文档
   - 理解每一步的原理和实现

2. **查看代码示例**
   - 每个 day 文件夹都包含对应的代码文件
   - 代码文件是按照教程实现后的结果
   - 可以直接参考或复制使用

3. **动手实践**
   - 跟随教程从零开始搭建
   - 遇到问题查看对应 day 的代码文件
   - 运行并测试每个功能

4. **完整测试**
   - 完成所有 6 天的学习后
   - 测试完整的 DAPP 功能
   - 连接钱包并进行真实交互

## 🏗️ 项目结构

```
web3-dapp-demo/
├── day1/                    # Day 1 教程和代码
│   └── day1.md
├── day2/                    # Day 2 教程和代码
│   ├── day2.md
│   ├── swap-page.js
│   ├── pool-page.js
│   └── farm-page.js
├── day3/                    # Day 3 教程和代码
│   ├── day3.md
│   ├── launchpad-page.js
│   ├── dashboard-page.js
│   └── bridge-page.js
├── day4/                    # Day 4 教程和代码
│   ├── day4.md
│   ├── wagmiClient.js
│   ├── Providers.js
│   ├── WalletButton.js
│   └── test-wallet-page.js
├── day5/                    # Day 5 教程和代码
│   ├── day5.md
│   ├── useTokenApprove.js
│   ├── useSwap.js
│   ├── useLiquidity.js
│   ├── useFarm.js
│   └── TransactionNotification.js
├── day6/                    # Day 6 教程和代码
│   ├── day6.md
│   ├── useTokenBalance.js
│   ├── usePoolData.js
│   ├── useFarmData.js
│   ├── useCalculateAPR.js
│   ├── useTokenPrice.js
│   └── dashboard-with-real-data.js
├── app/                     # Next.js App 目录
│   ├── api/                # API 路由
│   ├── swap/               # Swap 页面（完整版）
│   ├── pool/               # Pool 页面（完整版）
│   ├── farm/               # Farm 页面（完整版）
│   ├── launchpad/          # LaunchPad 页面（完整版）
│   ├── dashboard/          # Dashboard 页面（完整版）
│   ├── bridge/             # Bridge 页面（完整版）
│   ├── layout.js           # 根布局
│   ├── page.js             # 首页
│   └── globals.css         # 全局样式
├── components/              # React 组件
│   └── Navbar.js
├── lib/                     # 工具库
│   ├── abis/               # 智能合约 ABI
│   ├── constants/          # 常量配置
│   └── wagmiClient.js      # Wagmi 配置
├── .env.local.example      # 环境变量示例
├── package.json
├── next.config.mjs
├── tailwind.config.js
└── README.md
```

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 库**: React 19
- **样式**: TailwindCSS
- **Web3 库**:
  - Wagmi v2 - React Hooks for Ethereum
  - Viem 2.x - TypeScript Ethereum library
  - RainbowKit - 钱包连接 UI
- **状态管理**: TanStack React Query
- **智能合约**: Solidity (部署在 Sepolia 测试网)

## 🔗 相关资源

### 获取测试币

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)

### RPC 服务提供商

- [Infura](https://infura.io/) - 免费的 RPC 节点
- [Alchemy](https://www.alchemy.com/) - Web3 开发平台
- [QuickNode](https://www.quicknode.com/) - 高性能 RPC

### WalletConnect

- [WalletConnect Cloud](https://cloud.walletconnect.com/) - 获取免费 Project ID

### 学习资源

- [Wagmi 官方文档](https://wagmi.sh/)
- [Viem 文档](https://viem.sh/)
- [RainbowKit 文档](https://www.rainbowkit.com/)
- [Next.js 文档](https://nextjs.org/docs)
- [Solidity 教程](https://docs.soliditylang.org/)

## 📝 常见问题

### Q: 如何获取测试网 ETH？

A: 访问 Sepolia 水龙头（如 https://sepoliafaucet.com/），连接钱包后即可领取免费测试币。

### Q: 钱包连接失败怎么办？

A: 确保：
1. MetaMask 已安装并解锁
2. 切换到 Sepolia 测试网
3. `.env.local` 中的 WalletConnect Project ID 正确配置

### Q: 交易失败怎么办？

A: 检查：
1. 是否有足够的测试 ETH 支付 Gas 费
2. 代币是否已授权（Approve）
3. 在 Etherscan 查看交易详情和失败原因

### Q: 如何部署到生产环境？

A:
1. 更新 `.env.local` 为主网配置
2. 运行 `npm run build` 构建
3. 部署到 Vercel 或其他平台

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🎓 适用人群

- Web3 开发初学者
- 熟悉 React/Next.js，想学习区块链开发的前端开发者
- 想了解 DeFi 应用开发流程的开发者
- 区块链爱好者

## 💡 项目特点

✅ **渐进式学习** - 从简单到复杂，循序渐进
✅ **详细文档** - 每一步都有清晰的说明
✅ **完整代码** - 可直接运行的示例代码
✅ **真实项目** - 与实际 DeFi 项目相同的技术栈
✅ **实战导向** - 可部署到测试网的完整 DAPP

## 🚨 免责声明

本项目仅用于教学目的，不构成投资建议。智能合约未经审计，请勿在主网使用真实资金。

---

**开始你的 Web3 开发之旅！** 🚀

如有问题，请查看各 day 文件夹中的详细教程，或提交 Issue。
