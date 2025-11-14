提示词编写思路技巧：

1.背景和目标，告知大的框架性的内容
2.实现具体要求，具体功能描述，逻辑清晰，需要自己先梳理清楚。 对样式还原不是特别友好。
3.给定输出产物的描述
4.验收标准和注意事项，尽量清晰简洁明了

给GPT的提示词：
我现在需要你给我一套完整的CC提示词，让它新在我的教学项目目录下搭建这样一个完整的DAPP项目。
但是合约和后端以及前端的技术栈方面做出一些微调。
首先要有一个全局的提示词，让CC从全局架构层面出发，知道它要搭建的整个项目是什么样的。然后才是每一步的提示词，每一步的提示词应该让它知道这一步的产物是什么，而且要让它保证每一步都能调通。
1.在我的foundry-demo工程目录下生成的所有此Dapp中用到的合约，可以使用Openzepplin等合约开发工具库，每个合约部分保留各个Defi功能的核心交互函数，并生成对应的ABI，便于前端交互
2.后端部分，不要使用mock-api，全部使用真实的api，保留前端需要交互的各个真实api，如果某些前端页面中的功能需要一些历史数据，可以在后端api中生成一些固定的假数据，数据可以模拟，但后端接口需要真实可调用，后续我需要把整个项目都部署到vercel上
3.前端部分，整体的功能和页面还是和原来一样保持不变，但是技术栈上，取消TS，使用JS，然后对于需要展示的图表，使用Echarts来进行图表展示。
整体技术栈还是Next.js (app router, JS), Tailwind, shadcn/ui, wagmi + viem, RainbowKit, Echarts图表
4.给出的提示词让cc能确保生成一个完整的能打包构建的项目，确保项目可以部署到vercel上。



给claude code的提示词：
你现在扮演“资深区块链全栈工程师 + 教学项目助教”。任务：完整搭建一个可部署到 Vercel 的教学型 DeFi 一体站 DApp。请严格遵守下面的全局规则与交付标准，不得偏离。

一、总体目标（简述）
- 构建包含：LauncherPad、跨链(Bridge)、DEX(Swap)、LP 质押(Staking/Pool)、Farm（Farming）的教学型 DApp；
- 合约使用 Foundry + OpenZeppelin；编译产出 ABI；
- 后端 API 必须是真实可请求的 HTTP 接口（实现为 Next.js App Router 的 server route handlers），接口可以返回模拟历史数据，但必须真实可调用；
- 前端使用 JavaScript（禁止 TypeScript），框架：Next.js (app router, JS) + Tailwind + shadcn/ui；钱包/链交互：wagmi + viem + RainbowKit；图表使用 ECharts；
- 最终可 `pnpm run build` 并部署到 Vercel（serverless API in Next.js）。

二、项目文件/目录约定（强制）
项目根目录结构示例（必须按此结构创建/填充）：

foundry-demo/                ← 已存在 Foundry 工作区（保留）
  src/                 ← Solidity 合约（Token.sol, Swap.sol, StakePool.sol, Farm.sol, LaunchPad.sol）
  script/                    ← Foundry 部署脚本（Solidity script）
  out/                       ← forge build 产出（ABI JSON）

web3-dapp/                   ← 前端与后端（Next.js）共存项目（需要你创建）
  package.json
  app/                       ← Next.js App Router 页面与 server api（例如 app/api/token/price/route.js）
  components/
  lib/                       ← web3/viem/wagmi client、abi loader、utils（JS）
  public/abis/               ← 从 foundry-demo/out 拷贝的 ABI JSON
  .env.local.example         ← 环境变量示例

scripts/
  export-abis.sh             ← 把 foundry-demo/out/*.json 拷贝到 web3-dapp/public/abis 的脚本（需要你创建）

README.md                    ← 含运行/部署步骤与常见问题

三、全局编码与行为规范（必须遵守）
- 所有前端与 server code 使用 JS（ESM 或 CommonJS 明确）。不要产生任何 .ts 文件。
- 合约使用 OpenZeppelin（via `forge install OpenZeppelin/openzeppelin-contracts`）。
- 每次更改代码后，必须输出“变更摘要 + 文件树（缩略）+ 启动/测试命令 + DoD 验收步骤”；
- 每个 Step 的提交须包含建议的 commit message（格式：feat/feat(scope): summary 或 chore: ...）；
- 前端任何链上写操作前必须检测 allowance 并在不足时执行 approve；
- 所有代币金额在前端统一用 10^decimals 的整数（bigint / string 表示），不得用 JS 浮点误差计算代币数量（提供 utils/units.js）。

四、交付/验收标准（整体）
- Foundry 合约：`forge build` 成功，`out/*.json` ABI 文件存在；
- ABI 拷贝：`web3-dapp/public/abis/*.json` 存在；
- 本地测试：运行 `node scripts/export-abis.sh`、`cd web3-dapp && npm install && npm run dev`，打开 http://localhost:3000 能看到首页并能访问至少这些 routes：
    - GET /api/token/price -> 返回 JSON（price + series）
    - GET /api/stake/pools -> 返回池列表 JSON
    - GET /api/farm/stats -> 返回 farm stats JSON
- 钱包交互：页面能连接钱包（MetaMask/Injected），能读取 ERC20 balance；当合约地址与 RPC 指向本地 Anvil（或 testnet）并部署合约后，能完成 approve + swap/stake/harvest 流程；
- 构建：`cd web3-dapp && pnpm run build` 成功（用于 Vercel 部署）。

五、运行/部署提示（给 CC）
- 给出清晰的 run & deploy 步骤（本地 anvil 部署脚本，以及如何在 Vercel 环境变量中填入 RPC_URL 与合约地址）。
- 任何时候，若环境变量中缺合约地址或 RPC 无法连通，页面应明确显示“模拟模式（Mock Mode）”标识，但仍须使用真实可调用的 Next.js server API（返回模拟数据），并把该行为写入 README。

理解以上后，等待后续 Step 指令，并在每一步严格给出“文件变更摘要 + 文件树 + 主要代码片段 + 运行与验证步骤（DoD）”。

现在准备好，请等待我发给你的第一步 Step 指令（后续我会一个 step 一个 step 地粘给你执行）。   【Step 1：初始化前端项目与辅助脚本】

目标：
在 `foundry-demo` 同级创建 `web3-dapp` 子目录并初始化 Next.js + Tailwind + shadcn/ui + wagmi + viem + RainbowKit + ECharts（全部 JS），并在项目根创建 scripts/export-abis.sh。

产物（文件/目录）：
- web3-dapp/
  - package.json                    ← 包含 scripts: dev, build, start, export-abis
  - app/page.js                      ← 首页（含 Navbar）
  - app/layout.js                    ← 全局布局
  - app/api/health/route.js          ← GET 返回 {ok:true}
  - public/abis/                     ← 初始空目录（CC 会创建）
  - lib/wagmiClient.js               ← wagmi + viem client 初始化（JS）
  - lib/abiLoader.js                 ← 从 public/abis 动态加载 ABI
  - components/Navbar.js             ← 顶部导航 + ConnectButton
  - styles/globals.css               ← Tailwind 指引
  - .env.local.example

- scripts/export-abis.sh             ← 将 foundry-demo/out/*.json 拷贝到 web3-dapp/public/abis

具体要求与关键实现提示：
1. package.json scripts:
   - "dev": "next dev -p 3000"
   - "build": "next build"
   - "start": "next start -p 3000"
   - "export-abis": "bash ../scripts/export-abis.sh"  （相对路径）
2. lib/wagmiClient.js 示例：创建 wagmi chain/list、createClient、connectors（RainbowKit）并导出 providers，全部用 JS。
3. app/api/health/route.js: 返回 JSON {ok:true}，供快速探测。
4. scripts/export-abis.sh: 检查 foundry-demo/out 是否存在 JSON 文件，拷贝到 web3-dapp/public/abis，并生成 web3-dapp/.env.local（占位，不写敏感值）。

DoD（验收）：
- 运行：`bash scripts/export-abis.sh`（即使 out 为空也要创建目录与 .env.local）；
- 运行：`cd web3-dapp && npm install && pnpm run dev`；
- 访问 http://localhost:3000/ 返回首页并在页面显示 Navbar 与 ConnectButton；访问 http://localhost:3000/api/health 返回 {ok:true}；
- 输出：变更摘要、web3-dapp 的文件树（至少前三层）、关键代码片段（wagmiClient.js、export-abis.sh）、建议 commit message。

建议 commit message: feat(web): init nextjs + wagmi + export-abis script



【Step 2：Foundry 合约开发（Token, Swap, StakePool, Farm, LaunchPad）】

目标：
在 `foundry-demo/contracts` 下创建 5 个核心合约（用 OpenZeppelin），保留教学所需的核心交互函数。用 `forge build` 生成 ABI（out/*.json）。并创建一个部署脚本（script/Deploy.s.sol）用于 sepolia 链上部署。

产物（文件/目录）：
- foundry-demo/contracts/Token.sol
  - ERC20 基本 mint/burn/constructor
- foundry-demo/contracts/Swap.sol
  - 简化 swap（仅示范调用、不会做完整 AMM 实现；可直接实现简单 constant product 或允许 router 调用）
- foundry-demo/contracts/StakePool.sol
  - stake(), withdraw(), claimReward()
- foundry-demo/contracts/Farm.sol
  - deposit(pid), withdraw(pid), harvest(pid), pendingReward(pid,user)
- foundry-demo/contracts/LaunchPad.sol
  - buy(), claim(), saleInfo()
- foundry-demo/script/Deploy.s.sol
  - 简单的 solidity script：部署 Token -> StakePool -> Farm -> LaunchPad，并在控制台打印地址，放到readme.md文件中

关键实现要点：
1. 使用 OpenZeppelin contracts：通过 `forge install OpenZeppelin/openzeppelin-contracts`；
2. 合约函数接口必须与前端 ABI 交互需求对齐（例如 ERC20: decimals(), symbol(), balanceOf(), allowance(), approve()）；
3. `forge build` 会生成 out/*.json（含 abi），CC 必须确保这些文件存在；
4. 在 foundry-demo 根创建 README_CONTRACTS.md 说明如何用forge script 部署（包含示例命令）。

DoD（验收）：
- 运行（在 foundry-demo）： `forge build`，成功且 out/*.json 存在（列出至少 Token.json & StakePool.json）；
- 找到 script/Deploy.s.sol，包含部署并打印合约地址的逻辑；
- 输出：变更摘要、contracts 目录树（含文件名）、关键代码片段（Token.sol、StakePool.sol 函数签名）、运行与验证命令（forge build、forge script 示例）、建议 commit message。

建议 commit message: feat(contract): add core contracts + deploy script   【Step 3：实现 Next.js server API（app/api）】

目标：
在 `web3-dapp/app/api/` 下实现如下真实可调用的 route handlers（JS）：
- GET /api/token/price/route.js  -> 返回 { price: <number|string>, series: [{ts, price}, ...] }
- GET /api/stake/pools/route.js  -> 返回池子数组（id,name,tvl,token0,token1,apr）
- GET /api/farm/stats/route.js   -> 返回 farm 的历史收益及 APY 统计
- GET /api/launchpad/projects/route.js -> 返回 launchpad 项目数据（name,goal,raised,start,end）

实现要求：
1. 这些 API 返回“真实可调用”的 JSON（内容可以是固定模拟数据，但必须是动态 JS 实现，不要直接写静态 .json 文件作为“mock”）；
2. 在返回数据中包含时间戳和足够字段以便前端绘图（例如 series 每项含 ts 和 price）；
3. API 内部要优先尝试从链上读取（若 web3 provider 可用并有合约地址），否则回落到生成的模拟数据，并在 response 中添加 `"source": "chain" | "mock"` 字段；
4. 每个 api 的 route.js 文件头部写明返回字段说明（注释），便于教学。

DoD（验收）：
- 启动 dev：`cd web3-dapp && npm run dev`；
- 验证 curl:
   - `curl http://localhost:3000/api/token/price` 返回 JSON，包含 price 和 series 字段；
   - `curl http://localhost:3000/api/stake/pools` 返回池子数组；
- 输出：每个 route.js 的代码片段、curl 返回示例、commit message 建议。

建议 commit message: feat(api): add server route handlers for token/ stake/ farm/ launchpad



【Step 5.6：前端页面开发与钱包集成（核心交互）】

目标：
实现以下页面（JS），整体 UI 使用 Tailwind + shadcn/ui；集成 wagmi + viem + RainbowKit，确保 ConnectWallet 能连接并能读取 ERC20 balance。

页面与关键需求：
1. /swap
   - tokenIn/tokenOut 选择（tokenList 从 web3-dapp/public/abis 或 packages/config）
   - 调用 Router ABI 的 getAmountsOut（若链上不可用，使用后端 price API 模拟）
   - Approve/Swap 流程（approve -> swap 写链）并显示 tx 状态

2. /pool
   - Add/Remove 流动性界面（按比例计算）
   - 显示 TVL（调用 /api/stake/pools）

3. /farms
   - 列表展示 farm pools（api + optional chain read）
   - 支持 deposit/withdraw/harvest（若链上未部署则显示 Mock 状态）

4. /launchpad
   - 显示项目详情、倒计时、进度条（/api/launchpad/projects）
   - buy/claim（触发合约或显示 mock 操作）

5. /bridge
   - 表单：源链/目标链/Token/Amount -> 调用 /api/bridge/transfer（该 API 也实现为 Next.js route）
   - 显示进度（queued -> inflight -> complete；状态来自后端 API）

6. /dashboard
   - 汇总钱包余额、LP 持仓、Farm 收益、价格/TVL 图（ECharts）
实现要点与工具：
- lib/wagmiClient.js：导出 provider、公链设置、viem 公共 client，确保前端页面复用；
- components/ApproveButton.js：封装 allowance 检测与 approve 流程；
- 所有金额计算使用 utils/units.js（bigint 字符串转化）；
- 页面与 API 的错误/空状态处理要完善（Loading / Empty / Error 三态）并显示“模拟模式”提示（如果 env 中 NEXT_PUBLIC_MOCK_MODE=true 或链不可访问）。

DoD（验收）：
- 运行 `cd web3-dapp && npm run dev`，在浏览器：
  - 能用 MetaMask 连接，并在 Navbar 显示地址；
  - 访问 /swap，选择 token，尝试报价（若链上实际合约未部署则 API 返回 mock price，页面仍工作）；
  - 访问 /dashboard，页面能渲染 ECharts 图表（即便数据源为 api 返回的模拟 series）；
- 输出：每个页面的文件名、关键代码片段（例如 Swap 页面中调用 getAmountsOut 的实现、ApproveButton 关键函数）、测试步骤与截图/交互预期描述；
- 建议 commit message: feat(web): add pages swap/pool/farm/launchpad/bridge/dashboard 



【Step 6：ECharts 可视化实现（价格、TVL、APY）】

目标：
在 dashboard 与各模块中使用 ECharts 绘制可交互的折线/面积图，支持 7 日/30 日切换。组件化实现并复用。

产物（组件）：
- components/charts/LineChartEcharts.js  ← 接受 props {series, xField:'ts', yField:'price', height}
- pages/dashboard 使用 LineChartEcharts 渲染 price series（/api/token/price）和 TVL 曲线（/api/stake/pools -> 合成 series）
- charts 支持响应式和暗色模式

实现要点：
- 使用 `echarts` 官方 npm 包（不要用第三方封装）；
- 组件内部需做 `useEffect` 防抖 resize，且在 SSR 阻断（仅在 client-side 渲染）；
- 提供示例数据转换方法：将 api 返回的 {ts, price} 转为 echarts 需要的格式；
- 图表必须在页面加载时能渲染（即使 api 返回 mock 数据）。

DoD：
- 在 /dashboard 页面能看到 price 折线与 TVL 折线，切换 7d/30d 无报错；
- 输出：LineChartEcharts.js 主要代码、如何将 api 数据转换为图表数据示例、commit message 建议。

建议 commit message: feat(ui): add echarts line chart component


【Step 7：构建、打包、并准备部署到 Vercel】

目标：
确保 web3-dapp 可被 Vercel 正常构建并包含 serverless API routes（app/api/*）。生成部署说明并校验常见问题。

必做项：
1. package.json build 脚本： "build": "next build"
2. 确保 app/api 路由均为 Next.js route handlers（app/api/.../route.js），支持 serverless 部署；
3. 在 README 中写明 Vercel 环境变量（NEXT_PUBLIC_RPC_URL，NEXT_PUBLIC_TOKEN_ADDRESS 等）及如何配置；
4. 给出线上部署说明：线上需要把部署到 sepolia链上的合约地址写入 Vercel 环境变量；
5. 提供 vercel.json（可选）或部署建议（注意 Next.js App Router 与 serverless）。

DoD（验收）：
- 运行：`cd web3-dapp && npm run build` 通过（若依赖 chain 访问不可用，build 也应成功，因为 API route 是 server-side JS）；
- README 中包含：如何在 Vercel 上设置环境变量与部署步骤（截图/CLI 命令示例）；
- 输出：构建日志（示例）、vercel 部署注意事项、commit message 建议。

建议 commit message: chore(ci): prepare project for vercel deploy


【Step 8：自检脚本与 README 教学文档】

目标：
- 提供一个简单的自检脚本 `scripts/verify.js`（node），自动检查：
  - foundry-demo/out 存在 ABI json；
  - web3-dapp/public/abis 存在并可读取；
  - web3-dapp/.env.local 存在且包含必需变量（列出缺失项）；
  - Next.js dev server 在 3000 可达（可选 ping）；
- 完善 README.md（根与 web3-dapp/README.md），包含：快速启动、部署到 Vercel、课堂演示脚本、故障排查建议。

产物：
- scripts/verify.js
- README.md（包含每一步的运行命令、部署到 Vercel 的环境变量清单、教学演示脚本）

DoD：
- 运行 `node scripts/verify.js` 输出检查结果并对缺失项给出下一步修复建议；
- README 能引导新手一步步从 clone -> forge build -> export-abis -> next dev -> deploy 到 Vercel；
- 输出：verify.js 代码片段、README 关键节选、commit message 建议。

建议 commit message: docs: add verify script & README
后续都用中文回复我



确保每个用到的合约都开源前端项目只保留调用的合约的ABI，模仿Uniswap前端项目管理ABI和合约地址的方式
梳理整体的业务流程



我发现项目整体已经完成了，我现在想做全流程测试，但是有几个地方不是很完善，需要做出调整： 1.目前REWARD_TOKEN、TOKEN_A、TOKEN_B、PAYMENT_TOKEN都是开源的，但是只能owner才可以mint，此项目是教学使用，这样不便于学员进行mint。要求修改这几个token合约的实现，仿照foundry-demo中的Web3FrontEndToken的实现，每个地址可以自己给自己mint，但是每个地址最多mint10万枚token，修改后把合约在sepolia上重新部署开源，把重新部署的合约地址和ABI全部更新到现在的前端项目中。 2.现在我在sepolia浏览器上看到的NEXT_PUBLIC_SWAP_ADDRESS、NEXT_PUBLIC_STAKE_POOL_ADDRESS、NEXT_PUBLIC_FARM_ADDRESS、NEXT_PUBLIC_LAUNCHPAD_ADDRESS是没有开源的，这样不符合教学要求，请把这几个前端项目中用到的合约全部开源。
3.目前我发现web3-dapp前端项目中的public中ABI很多，有些在项目中并没有调用，请精简这些ABI，只保留在web3-dapp中调用的合约的ABI，模仿Uniswap前端项目管理ABI和合约地址的方式。 4.目前foundry-demo和web3-dapp中有许多执行任务过程中生成的各种总结类型的md文档，删除这些md文档，然后在web3-dapp中重新生成一份整体业务梳理的大而全的md文档，介绍这个项目该怎么使用，用户每一步应该怎么操作。




我发现项目整体已经完成了，我现在想做全流程测试,我已经给自己的账户mint了REWARD_TOKEN、TokenA、TokenB和PAYMENT_TOKEN。 但是我现在启动项目后，lunchpad、Bridge、Swap、Pool、Farm业务全部都是显示模拟模式已激活。我想在已经部署的sepolia链上，测试这几个业务。之前已经让你把这几个业务涉及的合约都添加到对应的环境变量文件.env.local中了。 现在告诉我应该如何关闭模拟模式，调用真实的sepolia链上的ABI。 然后告诉我应该按什么顺序步骤来一步步测试这些合约是否正确生效，前端是否能正确调用这些合约。   嗯，我发现现在添加流动性失败了，我猜测是因为添加流动性的合约已经部署完成了，但是swap合约是后部署的，所以无法在添加流动性后自动给用户发放LP Token，是否需要重新写一个添加流动性的合约？如果需要的话，重新编写这个合约然后部署到sepolia上，然后更新所有用到了这个合约的地方。 还有个问题，我发现现在每次添加流动性都需要分别approve Token A和Token B，但是每次approve都显示无上限，是否可以改进这里，参考uniswap V2的做法？ 我的理解是如果approve过一次无上限，在下次添加流动性的时候就不需要approve这种token了。



