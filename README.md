# Learn-Web3-FrontEnd - DeFi 教学项目

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Foundry](https://img.shields.io/badge/Foundry-Latest-orange)](https://getfoundry.sh/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

一个完整的 Web3 DeFi 教学项目，包含智能合约开发（Foundry）和前端应用（Next.js），用于教学演示和实战练习。

## 📚 项目概述

本项目包含以下核心模块：

- **LaunchPad** - 代币发行平台（买入/认领）
- **Bridge** - 跨链桥接（转账/状态追踪）
- **DEX (Swap)** - 去中心化交易所（代币交换）
- **LP Staking (Pool)** - 流动性质押（添加/移除流动性）
- **Farm** - 收益农场（质押/提现/收获奖励）
- **Dashboard** - 数据看板（资产概览/图表可视化）

## 🏗️ 项目结构

\`\`\`
Learn-Web3-FrontEnd/
├── foundry-demo/          # Foundry 智能合约项目
│   ├── src/               # 合约源码
│   │   ├── RewardToken.sol
│   │   ├── TokenA.sol
│   │   ├── TokenB.sol
│   │   ├── Swap.sol
│   │   ├── Farm.sol
│   │   └── LaunchPad.sol
│   ├── script/            # 部署脚本
│   ├── test/              # 合约测试
│   └── out/               # 编译输出（ABI + Bytecode）
│
├── web3-dapp/             # Next.js 前端应用
│   ├── app/               # Next.js App Router 页面
│   │   ├── api/           # API 路由（Serverless）
│   │   ├── dashboard/     # Dashboard 页面
│   │   ├── swap/          # DEX 交换页面
│   │   ├── pool/          # LP 质押页面
│   │   ├── farm/          # Farm 页面
│   │   ├── launchpad/     # LaunchPad 页面
│   │   └── bridge/        # Bridge 页面
│   ├── components/        # React 组件
│   ├── lib/               # 工具函数和配置
│   ├── public/abis/       # 合约 ABI 文件
│   └── .env.local         # 环境变量（需手动创建）
│
└── scripts/               # 工具脚本
    └── verify.js          # 项目自检脚本
\`\`\`

## 🚀 快速开始

### 前置要求

- **Node.js** 18+ 和 npm
- **Foundry** - [安装指南](https://book.getfoundry.sh/getting-started/installation)
- **MetaMask** 或其他 Web3 钱包

### Step 1: 克隆项目

\`\`\`bash
git clone <your-repo-url>
cd Learn-Web3-FrontEnd
\`\`\`

### Step 2: 编译智能合约

\`\`\`bash
cd foundry-demo
forge install
forge build
\`\`\`

验证编译输出：
\`\`\`bash
ls out/*/         # 应该看到 *.json 文件
\`\`\`

### Step 3: 导出 ABI 到前端

\`\`\`bash
cd ../web3-dapp
npm run export-abis
\`\`\`

这会将合约 ABI 从 \`foundry-demo/out/\` 复制到 \`web3-dapp/public/abis/\`

### Step 4: 配置环境变量

\`\`\`bash
# 复制环境变量模板
cp .env.local.example .env.local

# 编辑 .env.local 填入实际值
# 必需的变量见下方 "环境变量说明"
\`\`\`

### Step 5: 安装前端依赖

\`\`\`bash
npm install
\`\`\`

### Step 6: 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:3000

### Step 7: 运行自检脚本（可选）

\`\`\`bash
cd ..
node scripts/verify.js
\`\`\`

自检脚本会检查：
- ✅ Foundry 合约编译输出
- ✅ ABI 文件导出状态
- ✅ 环境变量配置
- ✅ 依赖安装情况
- ✅ 开发服务器状态

## 🔑 环境变量说明

在 \`web3-dapp/.env.local\` 中配置以下变量：

\`\`\`bash
# 【必需】WalletConnect Project ID
# 获取地址: https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# 【必需】RPC URLs
NEXT_PUBLIC_RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_RPC_URL_MAINNET=https://mainnet.infura.io/v3/YOUR_KEY

# 【必需】合约地址（部署到 Sepolia 后填入）
NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_TKA_ADDRESS=0x...
NEXT_PUBLIC_TKB_ADDRESS=0x...
NEXT_PUBLIC_SWAP_ADDRESS=0x...
NEXT_PUBLIC_FARM_ADDRESS=0x...
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0x...

# 【可选】Etherscan API Key
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_api_key
\`\`\`

## 📦 合约部署

### 部署到 Sepolia 测试网

1. **获取测试 ETH**
   - 访问 [Sepolia Faucet](https://sepoliafaucet.com/)
   - 获取测试 ETH

2. **配置部署私钥**
   \`\`\`bash
   cd foundry-demo
   # 创建 .env 文件
   echo "PRIVATE_KEY=your_private_key" > .env
   echo "SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY" >> .env
   \`\`\`

3. **运行部署脚本**
   \`\`\`bash
   forge script script/Deploy.s.sol:DeployScript --rpc-url \$SEPOLIA_RPC_URL --broadcast --verify
   \`\`\`

4. **复制合约地址到 .env.local**
   - 部署成功后，将输出的合约地址填入 \`web3-dapp/.env.local\`

## 🎓 课堂演示脚本

### 演示 1: DEX Swap（15 分钟）

**目标**: 演示 AMM 自动做市商原理

\`\`\`bash
# 1. 启动应用
cd web3-dapp && npm run dev

# 2. 访问 http://localhost:3000/swap

# 3. 演示步骤:
# - 连接 MetaMask 钱包（Sepolia）
# - 输入 TKA 数量，观察 TKB 自动计算（x*y=k）
# - 显示价格影响和滑点
# - 执行 Swap 操作
# - 查看交易确认
\`\`\`

**关键概念讲解**:
- Constant Product AMM (x * y = k)
- Price Impact（价格影响）
- Slippage（滑点）
- ERC20 Approval 流程

### 演示 2: LP Staking（15 分钟）

**目标**: 演示流动性提供和收益

\`\`\`bash
# 访问 http://localhost:3000/pool

# 演示步骤:
# - Add Liquidity: 添加 TKA + TKB
# - 观察 LP Token 余额变化
# - 计算占比和预期收益
# - Remove Liquidity: 移除流动性
# - 对比移除前后的代币数量
\`\`\`

**关键概念讲解**:
- Liquidity Pool（流动性池）
- LP Token 机制
- Proportional Calculation（比例计算）
- Impermanent Loss（无常损失）

### 演示 3: Farm Yield（15 分钟）

**目标**: 演示收益农场和质押奖励

\`\`\`bash
# 访问 http://localhost:3000/farm

# 演示步骤:
# - 选择 Farm Pool
# - Deposit LP Token 质押
# - 等待区块产生奖励
# - Harvest 收获奖励
# - Withdraw 提现本金
\`\`\`

**关键概念讲解**:
- Yield Farming（收益农场）
- APY 计算
- Reward Distribution（奖励分配）
- Compound Interest（复利）

### 演示 4: LaunchPad（10 分钟）

**目标**: 演示代币发行和认购

\`\`\`bash
# 访问 http://localhost:3000/launchpad

# 演示步骤:
# - 查看项目详情和倒计时
# - Buy: 购买代币（approve + buy）
# - 观察进度条变化
# - Claim: 认领代币
\`\`\`

**关键概念讲解**:
- Token Sale（代币销售）
- Vesting（归属期）
- Price Discovery（价格发现）

### 演示 5: Bridge（10 分钟）

**目标**: 演示跨链转账概念

\`\`\`bash
# 访问 http://localhost:3000/bridge

# 演示步骤:
# - 选择源链和目标链
# - 输入代币和数量
# - 提交转账
# - 观察状态: queued → inflight → complete
# - 查看转账历史
\`\`\`

**关键概念讲解**:
- Cross-Chain Bridge（跨链桥）
- Lock & Mint 机制
- Relay 和验证

### 演示 6: Dashboard（5 分钟）

**目标**: 数据可视化和分析

\`\`\`bash
# 访问 http://localhost:3000/dashboard

# 演示内容:
# - 钱包余额总览
# - LP 持仓统计
# - Farm 收益汇总
# - 价格走势图（7天/30天切换）
# - TVL 趋势图
\`\`\`

**关键概念讲解**:
- TVL (Total Value Locked)
- Portfolio Tracking
- ECharts 可视化

## 🔧 常用命令

### 合约开发

\`\`\`bash
# 编译合约
cd foundry-demo && forge build

# 运行测试
forge test

# 部署合约
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast

# 验证合约
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> --chain sepolia
\`\`\`

### 前端开发

\`\`\`bash
cd web3-dapp

# 开发模式
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 导出 ABI
npm run export-abis

# Lint 检查
npm run lint
\`\`\`

### 自检和调试

\`\`\`bash
# 运行自检脚本
node scripts/verify.js

# 检查 API 端点
curl http://localhost:3000/api/health
curl http://localhost:3000/api/token/price
\`\`\`

## 🚢 部署到 Vercel

### 方法 1: Vercel Dashboard（推荐）

1. **推送代码到 GitHub**
   \`\`\`bash
   git add .
   git commit -m "feat: complete defi teaching project"
   git push origin main
   \`\`\`

2. **导入到 Vercel**
   - 访问 https://vercel.com/new
   - 选择你的仓库
   - Root Directory: \`./web3-dapp\`（如果是 monorepo）

3. **配置环境变量**
   - 在 Vercel Dashboard → Settings → Environment Variables
   - 添加所有 \`NEXT_PUBLIC_*\` 变量

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约 2-3 分钟）

### 方法 2: Vercel CLI

\`\`\`bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd web3-dapp
vercel --prod
\`\`\`

详细部署指南见：[web3-dapp/DEPLOYMENT.md](web3-dapp/DEPLOYMENT.md)

## 📊 测试指南

### 单元测试

\`\`\`bash
cd foundry-demo
forge test -vv
\`\`\`

### 集成测试

\`\`\`bash
# 测试 API 端点
cd web3-dapp
npm run dev

# 另一个终端
curl http://localhost:3000/api/health
curl http://localhost:3000/api/token/price
curl http://localhost:3000/api/farm/stats
\`\`\`

### E2E 测试（手动）

1. 访问 http://localhost:3000
2. 连接 MetaMask（Sepolia）
3. 逐个测试各功能页面
4. 验证交易执行和状态更新

详细测试指南见：[web3-dapp/TESTING_GUIDE.md](web3-dapp/TESTING_GUIDE.md)

## 🐛 故障排查

### 问题 1: 构建失败 "Cannot find module"

**原因**: Next.js 缓存问题

**解决方案**:
\`\`\`bash
cd web3-dapp
rm -rf .next
npm run build
\`\`\`

### 问题 2: RainbowKit 钱包连接失败

**原因**: 缺少 WalletConnect Project ID

**解决方案**:
1. 访问 https://cloud.walletconnect.com
2. 创建免费项目获取 Project ID
3. 在 \`.env.local\` 中设置 \`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID\`

### 问题 3: 合约交互失败

**原因**: 合约地址未配置或网络错误

**解决方案**:
1. 确认钱包连接到 Sepolia 测试网
2. 检查 \`.env.local\` 中的合约地址是否正确
3. 确保有足够的测试 ETH 支付 gas

### 问题 4: ABI 文件找不到

**原因**: ABI 未导出或路径错误

**解决方案**:
\`\`\`bash
cd web3-dapp
npm run export-abis
ls public/abis/  # 验证文件存在
\`\`\`

### 问题 5: 图表不显示

**原因**: ECharts SSR 问题

**解决方案**:
- 已在 \`LineChartEcharts.js\` 中处理（动态导入）
- 如仍有问题，检查浏览器控制台错误

### 问题 6: API 路由返回 500

**原因**: 环境变量缺失或 RPC 节点问题

**解决方案**:
1. 运行 \`node scripts/verify.js\` 检查配置
2. 测试 RPC URL: \`curl \$NEXT_PUBLIC_RPC_URL_SEPOLIA\`
3. 查看 Vercel 日志（如果已部署）

更多问题见：[web3-dapp/DEPLOYMENT.md](web3-dapp/DEPLOYMENT.md#常见问题)

## 📚 学习资源

### 官方文档
- [Next.js 文档](https://nextjs.org/docs)
- [Foundry Book](https://book.getfoundry.sh/)
- [Wagmi 文档](https://wagmi.sh/)
- [Viem 文档](https://viem.sh/)
- [RainbowKit 文档](https://www.rainbowkit.com/)

### 推荐教程
- [Solidity by Example](https://solidity-by-example.org/)
- [Uniswap V2 原理](https://docs.uniswap.org/contracts/v2/overview)
- [ERC20 代币标准](https://eips.ethereum.org/EIPS/eip-20)

### 相关项目
- [Uniswap V2 Core](https://github.com/Uniswap/v2-core)
- [Sushiswap Contracts](https://github.com/sushiswap/sushiswap)

## 🤝 贡献指南

欢迎贡献代码、文档和教学案例！

1. Fork 本仓库
2. 创建特性分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 提交 Pull Request

## 📝 开发规范

- 智能合约使用 Solidity 0.8.20+
- 前端代码使用纯 JavaScript（禁用 TypeScript）
- 遵循 Next.js 15 App Router 规范
- 代币金额计算使用 \`BigInt\` 避免精度问题
- API 路由支持 Mock 模式（链不可用时）
- 所有页面支持三态处理（Loading/Empty/Error）

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📮 联系方式

- 项目问题：提交 [GitHub Issue](issues)
- 教学合作：[联系方式]

## 🎯 项目状态

- [x] 智能合约开发（Foundry + OpenZeppelin）
- [x] 合约部署到 Sepolia 测试网
- [x] 前端页面开发（Next.js 15 + App Router）
- [x] 钱包集成（RainbowKit + Wagmi + Viem）
- [x] 数据可视化（ECharts）
- [x] API 路由（Serverless Functions）
- [x] Vercel 部署配置
- [x] 自检脚本和文档
- [ ] 单元测试覆盖率 > 80%
- [ ] E2E 测试（Playwright）
- [ ] 多链支持（Polygon, Arbitrum）
- [ ] 移动端优化

---

**祝你学习愉快！Happy Learning! 🚀**

如有问题，请运行 \`node scripts/verify.js\` 进行自检，或查看相关文档。
