# DeFi DApp 用户完全指南

## 📋 项目概述

这是一个完整的 DeFi 教学平台，包含 5 个核心功能模块：

1. **LaunchPad（代币发行平台）** - 参与代币预售
2. **Bridge（跨链桥）** - 资产跨链转移
3. **Swap（去中心化交易所）** - 代币兑换交易
4. **Pool（流动性池）** - 添加/移除流动性
5. **Farm（流动性挖矿）** - 质押 LP 代币赚取奖励

## 🏗️ 技术架构

### 智能合约
- **框架**: Foundry + OpenZeppelin
- **网络**: Sepolia 测试网
- **语言**: Solidity ^0.8.20

### 前端应用
- **框架**: Next.js 15 (App Router)
- **语言**: JavaScript (非 TypeScript)
- **样式**: Tailwind CSS + shadcn/ui
- **Web3**: wagmi + viem + RainbowKit
- **图表**: ECharts

## 📝 合约地址 (Sepolia)

### 代币合约
所有代币都支持任何地址自行 mint，每个地址最多 mint 10 万枚：

- **RewardToken (DRT)**: `0xb09c7d0757Ed382E2E0F03477671307Dcf7cC30E`
- **TokenA (TKA)**: `0x8a88b830915AEA048Ebf8340ACa47E21b8E342B4`
- **TokenB (TKB)**: `0x2b79645f2Be73db5C001397BA261489DD5D25294`
- **PaymentToken (USDC)**: `0x2d6BF73e7C3c48Ce8459468604fd52303A543dcD`

### 业务合约
- **Swap (DEX)**: `0xb3a8c506c5364bb5e2794c64f8f98f926ee63717`
- **StakePool**: `0x47d3fc598191c9720183db9ab3f8dcbc6476492c`
- **Farm**: `0xe4c92bb326ba7adb9acd4bf3f649ea3109617753`
- **LaunchPad**: `0x6fd4a0f8d8cfcbfd7eac6f0eb430fdbdedc61421`

所有合约均已在 [Sepolia Etherscan](https://sepolia.etherscan.io) 上开源验证。

## 🚀 快速开始

### 环境准备

1. **安装 MetaMask 钱包**
   - 访问 https://metamask.io/
   - 安装浏览器插件
   - 创建或导入钱包

2. **添加 Sepolia 测试网**
   - 网络名称: Sepolia
   - RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
   - Chain ID: 11155111
   - 货币符号: ETH

3. **获取测试 ETH**
   - 访问 https://sepoliafaucet.com/   
   - 或使用 https://faucet.quicknode.com/ethereum/sepolia
   - 输入您的钱包地址获取免费测试 ETH

### 启动应用

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd Learn-Web3-FrontEnd
   ```

2. **安装依赖**
   ```bash
   cd web3-dapp
   npm install
   ```

3. **配置环境变量**

   创建 `.env.local` 文件（项目中已包含）：
   ```env
   # RPC URLs
   NEXT_PUBLIC_RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_KEY

   # Token Addresses
   NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=0xb09c7d0757ed382e2e0f03477671307dcf7cc30e
   NEXT_PUBLIC_TOKEN_A_ADDRESS=0x8a88b830915aea048ebf8340aca47e21b8e342b4
   NEXT_PUBLIC_TOKEN_B_ADDRESS=0x2b79645f2be73db5c001397ba261489dd5d25294
   NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x2d6bf73e7c3c48ce8459468604fd52303a543dcd

   # Contract Addresses
   NEXT_PUBLIC_SWAP_ADDRESS=0xb3a8c506c5364bb5e2794c64f8f98f926ee63717
   NEXT_PUBLIC_STAKE_POOL_ADDRESS=0x47d3fc598191c9720183db9ab3f8dcbc6476492c
   NEXT_PUBLIC_FARM_ADDRESS=0xe4c92bb326ba7adb9acd4bf3f649ea3109617753
   NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0x6fd4a0f8d8cfcbfd7eac6f0eb430fdbdedc61421
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

   访问 http://localhost:3000

## 📖 功能详解与使用步骤

### 1. 连接钱包

**操作步骤**：
1. 点击页面右上角 "Connect Wallet" 按钮
2. 选择 MetaMask 钱包
3. 在弹出窗口中确认连接
4. 确保已切换到 Sepolia 测试网

**注意事项**：
- 首次连接需要确认授权
- 确保钱包中有足够的 ETH 支付 gas 费

### 2. 获取测试代币（Mint）

所有代币合约都支持自行 mint，这是本平台的核心特性之一，方便学员获取测试代币。

**操作步骤**：

方法一：通过 Etherscan（推荐）
1. 访问代币合约页面（以 TKA 为例）:
   https://sepolia.etherscan.io/address/0x8a88b830915AEA048Ebf8340ACa47E21b8E342B4#writeContract
2. 点击 "Connect to Web3" 连接钱包
3. 找到 `mint` 函数
4. 输入数量（注意：需要加上 18 个零，例如 10000 个代币输入 `10000000000000000000000`）
5. 点击 "Write" 并确认交易

方法二：通过前端页面（如果集成了 mint 功能）
1. 进入对应的页面（Swap/Pool/Farm）
2. 在代币选择处会显示余额
3. 点击 "Mint" 按钮（如果有）
4. 输入数量并确认

**限制**：
- 每个地址最多 mint 100,000 枚代币
- 总供应上限：10 亿枚

**推荐 mint 数量**：
- TKA: 10,000 枚（用于 Swap 和添加流动性）
- TKB: 10,000 枚（用于 Swap 和添加流动性）
- USDC: 1,000 枚（用于 LaunchPad 购买）
- DRT: 10,000 枚（奖励代币，可选）

### 3. LaunchPad - 代币预售

LaunchPad 允许用户参与新代币的预售。

**使用步骤**：

1. **浏览项目**
   - 进入 LaunchPad 页面
   - 查看可用的预售项目列表
   - 每个项目显示：名称、简介、代币价格、已筹集金额等

2. **参与预售**
   - 选择感兴趣的项目
   - 点击 "Buy Tokens" 按钮
   - 输入购买金额（USDC）
   - 首次购买需要先 Approve USDC
   - 确认购买交易

3. **查看持仓**
   - 购买成功后可以在项目卡片中看到已购买的代币数量
   - 显示实时进度条和筹集情况

**注意事项**：
- 需要先 mint USDC 作为支付代币
- 每个项目有筹资目标上限
- 预售价格固定，先到先得

### 4. Swap - 代币兑换

去中心化交易所，使用恒定乘积做市商（x * y = k）算法。

**使用步骤**：

1. **选择代币对**
   - 选择要卖出的代币（From Token）
   - 选择要买入的代币（To Token）
   - 目前支持 TKA ↔ TKB

2. **输入数量**
   - 在 "You Pay" 框中输入要卖出的数量
   - 系统自动计算 "You Receive" 的数量
   - 显示当前汇率和价格影响

3. **设置滑点**
   - 点击右上角齿轮图标 ⚙️
   - 选择预设滑点（0.1%、0.5%、1.0%）
   - 或输入自定义滑点（0-50%）
   - 滑点保护您免受价格大幅波动影响

4. **查看交易详情**
   - 汇率显示（1 TKA = X TKB）
   - 价格影响百分比
     - 🟢 绿色（<2%）：影响较小
     - 🟡 黄色（2-5%）：中等影响
     - 🔴 红色（>5%）：影响较大，谨慎操作
   - 滑点容差
   - 最少收到数量

5. **授权代币**
   - 首次交易需要 Approve 代币
   - 点击 "Approve XXX" 按钮
   - 在钱包中确认授权交易
   - 等待交易确认

6. **执行兑换**
   - Approve 成功后，点击 "Swap" 按钮
   - 确认交易详情
   - 在钱包中确认交易
   - 等待交易完成

**重要提示**：
- 大额交易会有更大的价格影响
- 流动性不足时可能交易失败
- 0.3% 的交易手续费

### 5. Pool - 流动性池

添加或移除流动性，成为做市商赚取手续费。

**添加流动性步骤**：

1. **准备代币**
   - 确保钱包中有 TKA 和 TKB
   - 数量需要按照当前池子比例配对

2. **输入数量**
   - 输入 TKA 数量
   - 系统自动计算需要的 TKB 数量（按比例）
   - 查看将获得的 LP 代币数量

3. **授权代币**
   - 点击 "Approve TKA" 和 "Approve TKB"
   - 分别在钱包中确认两次授权

4. **添加流动性**
   - 授权完成后，点击 "Add Liquidity"
   - 确认交易
   - 获得 LP 代币

**移除流动性步骤**：

1. **查看持仓**
   - 在 "Remove Liquidity" 标签页查看 LP 余额
   - 显示对应的 TKA 和 TKB 数量

2. **输入移除数量**
   - 输入要移除的 LP 代币数量
   - 系统显示将收回的 TKA 和 TKB

3. **确认移除**
   - 点击 "Remove Liquidity"
   - 确认交易
   - 收回代币到钱包

**收益说明**：
- 流动性提供者赚取 0.3% 的交易手续费
- 手续费自动累积到池子中
- 移除流动性时一并取回

### 6. Farm - 流动性挖矿

质押 LP 代币或其他代币赚取 DRT 奖励。

**使用步骤**：

1. **选择矿池**
   - 浏览可用的矿池列表
   - 查看每个矿池的信息：
     - 质押代币类型
     - APY（年化收益率）
     - TVL（总锁仓价值）
     - 每日奖励

2. **存入（Deposit）**
   - 点击要参与的矿池卡片
   - 点击 "Deposit" 按钮
   - 输入质押数量
   - 首次需要 Approve 质押代币
   - 确认质押交易

3. **查看奖励**
   - 实时显示待领取奖励
   - 奖励每秒累积
   - 显示已质押数量

4. **领取奖励（Harvest）**
   - 点击 "Harvest" 按钮
   - 确认交易
   - DRT 代币发送到钱包

5. **取出（Withdraw）**
   - 点击 "Withdraw" 按钮
   - 输入要取出的数量
   - 确认交易
   - 同时领取所有待领取奖励

**奖励机制**：
- 奖励按秒累积
- 随时可以领取
- Withdraw 时自动领取所有奖励
- APY 根据总质押量动态变化

### 7. Bridge - 跨链桥（演示版）

**注意**: Bridge 功能目前为前端演示版本，不涉及真实的跨链交易。

**使用步骤**：

1. **选择源链和目标链**
   - From Chain: 选择源区块链
   - To Chain: 选择目标区块链

2. **选择代币和数量**
   - 选择要跨链的代币
   - 输入数量

3. **查看详情**
   - 预估到账时间
   - 跨链手续费
   - 最终收到数量

4. **执行跨链**
   - 点击 "Bridge" 按钮
   - 确认交易（演示模式）

## 🔧 智能合约开发（开发者）

### 本地开发环境

1. **安装 Foundry**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **进入合约目录**
   ```bash
   cd foundry-demo
   ```

3. **安装依赖**
   ```bash
   forge install
   ```

4. **编译合约**
   ```bash
   forge build
   ```

5. **运行测试**
   ```bash
   forge test
   ```

### 部署合约

1. **配置环境变量**

   创建 `.env` 文件：
   ```env
   PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   ```

2. **部署代币合约**
   ```bash
   source .env
   forge script script/DeployTokens.s.sol:DeployTokens --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
   ```

3. **部署业务合约**
   ```bash
   forge script script/DeployContracts.s.sol:DeployContracts --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
   ```

4. **验证合约**
   ```bash
   forge verify-contract <CONTRACT_ADDRESS> src/<CONTRACT>.sol:<CONTRACT_NAME> --chain sepolia
   ```

### 合约架构

```
foundry-demo/
├── src/
│   ├── TokenA.sol          # TKA 代币（自行 mint）
│   ├── TokenB.sol          # TKB 代币（自行 mint）
│   ├── RewardToken.sol     # DRT 奖励代币（自行 mint）
│   ├── PaymentToken.sol    # USDC 支付代币（自行 mint）
│   ├── Swap.sol            # DEX 交易合约
│   ├── StakePool.sol       # 单币质押池
│   ├── Farm.sol            # LP 挖矿合约
│   └── LaunchPad.sol       # 代币预售合约
├── script/
│   ├── DeployTokens.s.sol      # 代币部署脚本
│   └── DeployContracts.s.sol   # 业务合约部署脚本
└── test/
    └── (测试文件)
```

## 🎨 前端开发（开发者）

### 项目结构

```
web3-dapp/
├── app/
│   ├── launchpad/
│   │   └── page.js         # LaunchPad 页面
│   ├── swap/
│   │   └── page.js         # Swap 页面
│   ├── pool/
│   │   └── page.js         # Pool 页面
│   ├── farm/
│   │   └── page.js         # Farm 页面
│   ├── bridge/
│   │   └── page.js         # Bridge 页面
│   └── api/
│       ├── token/          # 代币价格 API
│       └── launchpad/      # LaunchPad 项目 API
├── components/
│   ├── Navbar.js           # 导航栏
│   ├── ApproveButton.js    # 通用授权按钮
│   └── ...
├── lib/
│   ├── wagmi.js            # wagmi 配置
│   └── utils/
│       └── units.js        # 单位转换工具
└── public/
    └── (静态资源)
```

### 关键技术点

1. **Web3 交互**
   - 使用 wagmi hooks: `useAccount`, `useReadContract`, `useWriteContract`
   - viem 进行单位转换: `parseUnits`, `formatUnits`
   - RainbowKit 提供钱包连接 UI

2. **ABI 管理**
   - 所有 ABI 都内联在各页面组件中
   - 只包含实际使用的函数定义
   - 简化依赖，提高可维护性

3. **状态管理**
   - React hooks 管理本地状态
   - wagmi 自动处理链上状态同步
   - 没有使用额外的状态管理库

4. **样式方案**
   - Tailwind CSS 实用类
   - shadcn/ui 组件库
   - 响应式设计（移动端友好）

## ❓ 常见问题

### Q1: 交易一直 pending 怎么办？
**A**:
- 检查钱包中是否有足够的 ETH 支付 gas
- 在 MetaMask 中查看交易状态
- 如果长时间未确认，可以尝试加速或取消交易

### Q2: 为什么 Approve 失败？
**A**:
- 确保钱包已连接到 Sepolia 网络
- 检查代币合约地址是否正确
- 确认有足够的 ETH 支付 gas 费

### Q3: Swap 提示 "Insufficient liquidity"？
**A**:
- 池子中流动性不足
- 尝试减少交易数量
- 或先去 Pool 页面添加流动性

### Q4: 如何查看我的交易记录？
**A**:
- 访问 https://sepolia.etherscan.io/
- 输入您的钱包地址查看所有交易
- 或在每次交易完成后点击交易哈希链接

### Q5: 代币授权额度用完了怎么办？
**A**:
- 重新点击 Approve 按钮
- 系统会请求新的授权额度
- 建议授权较大数额以减少 Approve 次数

### Q6: 为什么我的奖励没有增加？
**A**:
- 检查是否已成功 Deposit
- 刷新页面查看最新奖励
- 确认矿池状态是否正常

### Q7: 如何退出流动性挖矿？
**A**:
- 点击 Withdraw 按钮
- 输入要取出的数量
- 确认交易即可取回本金和奖励

### Q8: 测试代币可以卖掉换成真实 ETH 吗？
**A**:
- 不可以，这些都是 Sepolia 测试网的代币
- 没有任何实际价值
- 仅用于学习和测试目的

## 🔐 安全提示

1. **私钥安全**
   - 永远不要分享您的私钥或助记词
   - 使用硬件钱包存储大额资产
   - 定期备份钱包

2. **合约交互**
   - 仔细检查合约地址
   - 理解每笔交易的含义
   - 不要授权不信任的合约

3. **测试网络**
   - Sepolia 代币无实际价值
   - 用于学习和测试
   - 不要在测试网存储真实资产

## 📚 学习资源

- [Solidity 文档](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [wagmi 文档](https://wagmi.sh/)
- [Next.js 文档](https://nextjs.org/docs)
- [Uniswap V2 白皮书](https://uniswap.org/whitepaper.pdf)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**祝您学习愉快！Happy Coding! 🎉**
