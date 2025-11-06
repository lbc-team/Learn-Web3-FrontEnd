# Day 5: DAPP 交互实现（一）- 交易和签名

## 本节目标

实现智能合约写入操作（需要签名和 Gas 费）：
- **代币授权（Approve）**
- **Swap 交易**
- **添加/移除流动性**
- **质押/解除质押 LP**
- **LaunchPad 投资**
- **收割奖励**

---

## 1. 准备工作

### 1.1 创建合约 ABI 文件

```bash
mkdir -p lib/abis
touch lib/abis/ERC20ABI.json
touch lib/abis/SwapRouterABI.json
touch lib/abis/PoolFactoryABI.json
touch lib/abis/FarmABI.json
```

### 1.2 ERC20 ABI（最小版本）

创建 `lib/abis/ERC20ABI.json`：

```json
[
  {
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
]
```

### 1.3 创建常量配置

创建 `lib/constants/contracts.js`：

```javascript
// 合约地址（从 .env.local 或直接配置）
export const CONTRACTS = {
  // ERC20 代币
  USDT: process.env.NEXT_PUBLIC_USDT_ADDRESS || '0x...',
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x...',

  // DEX 合约
  SWAP_ROUTER: process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS || '0x...',
  POOL_FACTORY: process.env.NEXT_PUBLIC_POOL_FACTORY_ADDRESS || '0x...',

  // Farm 合约
  FARM: process.env.NEXT_PUBLIC_FARM_ADDRESS || '0x...',
  REWARD_TOKEN: process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS || '0x...',

  // LaunchPad 合约
  LAUNCHPAD: process.env.NEXT_PUBLIC_LAUNCHPAD_ADDRESS || '0x...',
}
```

---

## 2. 实现代币授权（Approve）

### 2.1 创建 Approve Hook

创建 `hooks/useTokenApprove.js`：

```javascript
'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import ERC20ABI from '@/lib/abis/ERC20ABI.json'

export function useTokenApprove() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async (tokenAddress, spenderAddress, amount, decimals = 18) => {
    try {
      const amountInWei = parseUnits(amount.toString(), decimals)

      await writeContract({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [spenderAddress, amountInWei],
      })
    } catch (err) {
      console.error('Approve failed:', err)
      throw err
    }
  }

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
```

### 2.2 在 Swap 页面中使用

更新 `app/swap/page.js`：

```javascript
'use client'

import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { useTokenApprove } from '@/hooks/useTokenApprove'
import { CONTRACTS } from '@/lib/constants/contracts'
import ERC20ABI from '@/lib/abis/ERC20ABI.json'

export default function SwapPage() {
  const { address, isConnected } = useAccount()
  const [fromToken, setFromToken] = useState('USDT')
  const [toToken, setToToken] = useState('USDC')
  const [fromAmount, setFromAmount] = useState('')

  const { approve, isPending, isConfirming, isSuccess } = useTokenApprove()

  // 检查授权额度
  const { data: allowance } = useReadContract({
    address: CONTRACTS[fromToken],
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.SWAP_ROUTER] : undefined,
    enabled: !!address,
  })

  const handleApprove = async () => {
    if (!fromAmount) return

    try {
      await approve(
        CONTRACTS[fromToken],
        CONTRACTS.SWAP_ROUTER,
        fromAmount,
        18 // decimals
      )
    } catch (err) {
      alert('Approval failed: ' + err.message)
    }
  }

  const handleSwap = async () => {
    // 实现 Swap 逻辑（下一步）
    alert('Swap functionality coming next!')
  }

  const needsApproval = allowance ? BigInt(allowance) < BigInt(fromAmount || 0) : true

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Swap Tokens
        </h1>

        {/* ... UI 代码保持不变 ... */}

        {/* 按钮逻辑 */}
        {!isConnected ? (
          <button className="w-full bg-gray-600 text-white font-semibold py-4 rounded-xl cursor-not-allowed">
            Please Connect Wallet
          </button>
        ) : needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={isPending || isConfirming}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            {isPending ? 'Approving...' : isConfirming ? 'Confirming...' : 'Approve ' + fromToken}
          </button>
        ) : (
          <button
            onClick={handleSwap}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg"
          >
            Swap
          </button>
        )}

        {/* 成功提示 */}
        {isSuccess && (
          <div className="mt-4 bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
            <div className="text-green-400 font-semibold">✓ Approval Successful!</div>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 3. 实现 Swap 交易

### 3.1 SwapRouter ABI

创建 `lib/abis/SwapRouterABI.json`：

```json
[
  {
    "inputs": [
      {"name": "tokenIn", "type": "address"},
      {"name": "tokenOut", "type": "address"},
      {"name": "amountIn", "type": "uint256"},
      {"name": "amountOutMin", "type": "uint256"},
      {"name": "to", "type": "address"},
      {"name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [{"name": "amountOut", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```

### 3.2 创建 Swap Hook

创建 `hooks/useSwap.js`：

```javascript
'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import SwapRouterABI from '@/lib/abis/SwapRouterABI.json'
import { CONTRACTS } from '@/lib/constants/contracts'

export function useSwap() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const swap = async (fromToken, toToken, amountIn, slippage = 0.5) => {
    try {
      const amountInWei = parseUnits(amountIn.toString(), 18)
      const amountOutMin = amountInWei * BigInt(100 - slippage * 100) / BigInt(100) // 简化计算
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 分钟

      await writeContract({
        address: CONTRACTS.SWAP_ROUTER,
        abi: SwapRouterABI,
        functionName: 'swapExactTokensForTokens',
        args: [
          CONTRACTS[fromToken],
          CONTRACTS[toToken],
          amountInWei,
          amountOutMin,
          address, // to
          deadline,
        ],
      })
    } catch (err) {
      console.error('Swap failed:', err)
      throw err
    }
  }

  return {
    swap,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
```

### 3.3 在 Swap 页面中集成

```javascript
import { useSwap } from '@/hooks/useSwap'

const { swap, isPending: swapPending, isConfirming: swapConfirming, isSuccess: swapSuccess } = useSwap()

const handleSwap = async () => {
  if (!fromAmount) return

  try {
    await swap(fromToken, toToken, fromAmount, 0.5) // 0.5% slippage
    alert('Swap successful!')
  } catch (err) {
    alert('Swap failed: ' + err.message)
  }
}
```

---

## 4. 实现添加流动性

### 4.1 PoolFactory ABI

创建 `lib/abis/PoolFactoryABI.json`：

```json
[
  {
    "inputs": [
      {"name": "tokenA", "type": "address"},
      {"name": "tokenB", "type": "address"},
      {"name": "amountA", "type": "uint256"},
      {"name": "amountB", "type": "uint256"},
      {"name": "amountAMin", "type": "uint256"},
      {"name": "amountBMin", "type": "uint256"},
      {"name": "to", "type": "address"},
      {"name": "deadline", "type": "uint256"}
    ],
    "name": "addLiquidity",
    "outputs": [
      {"name": "amountAAdded", "type": "uint256"},
      {"name": "amountBAdded", "type": "uint256"},
      {"name": "liquidity", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "tokenA", "type": "address"},
      {"name": "tokenB", "type": "address"},
      {"name": "liquidity", "type": "uint256"},
      {"name": "amountAMin", "type": "uint256"},
      {"name": "amountBMin", "type": "uint256"},
      {"name": "to", "type": "address"},
      {"name": "deadline", "type": "uint256"}
    ],
    "name": "removeLiquidity",
    "outputs": [
      {"name": "amountA", "type": "uint256"},
      {"name": "amountB", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```

### 4.2 创建 Liquidity Hook

创建 `hooks/useLiquidity.js`：

```javascript
'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import PoolFactoryABI from '@/lib/abis/PoolFactoryABI.json'
import { CONTRACTS } from '@/lib/constants/contracts'

export function useLiquidity() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const addLiquidity = async (token0, token1, amount0, amount1, address, slippage = 0.5) => {
    try {
      const amount0Wei = parseUnits(amount0.toString(), 18)
      const amount1Wei = parseUnits(amount1.toString(), 18)
      const amount0Min = amount0Wei * BigInt(100 - slippage * 100) / BigInt(100)
      const amount1Min = amount1Wei * BigInt(100 - slippage * 100) / BigInt(100)
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20

      await writeContract({
        address: CONTRACTS.POOL_FACTORY,
        abi: PoolFactoryABI,
        functionName: 'addLiquidity',
        args: [
          CONTRACTS[token0],
          CONTRACTS[token1],
          amount0Wei,
          amount1Wei,
          amount0Min,
          amount1Min,
          address,
          deadline,
        ],
      })
    } catch (err) {
      console.error('Add liquidity failed:', err)
      throw err
    }
  }

  const removeLiquidity = async (token0, token1, liquidityAmount, address, slippage = 0.5) => {
    try {
      const liquidityWei = parseUnits(liquidityAmount.toString(), 18)
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20

      await writeContract({
        address: CONTRACTS.POOL_FACTORY,
        abi: PoolFactoryABI,
        functionName: 'removeLiquidity',
        args: [
          CONTRACTS[token0],
          CONTRACTS[token1],
          liquidityWei,
          0, // amountAMin (可根据实际情况调整)
          0, // amountBMin
          address,
          deadline,
        ],
      })
    } catch (err) {
      console.error('Remove liquidity failed:', err)
      throw err
    }
  }

  return {
    addLiquidity,
    removeLiquidity,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
```

---

## 5. 实现 LP 质押

### 5.1 Farm ABI

创建 `lib/abis/FarmABI.json`：

```json
[
  {
    "inputs": [
      {"name": "poolId", "type": "uint256"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "poolId", "type": "uint256"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "poolId", "type": "uint256"}
    ],
    "name": "harvest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```

### 5.2 创建 Farm Hook

创建 `hooks/useFarm.js`：

```javascript
'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import FarmABI from '@/lib/abis/FarmABI.json'
import { CONTRACTS } from '@/lib/constants/contracts'

export function useFarm() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const stake = async (poolId, amount) => {
    try {
      const amountWei = parseUnits(amount.toString(), 18)

      await writeContract({
        address: CONTRACTS.FARM,
        abi: FarmABI,
        functionName: 'stake',
        args: [poolId, amountWei],
      })
    } catch (err) {
      console.error('Stake failed:', err)
      throw err
    }
  }

  const unstake = async (poolId, amount) => {
    try {
      const amountWei = parseUnits(amount.toString(), 18)

      await writeContract({
        address: CONTRACTS.FARM,
        abi: FarmABI,
        functionName: 'unstake',
        args: [poolId, amountWei],
      })
    } catch (err) {
      console.error('Unstake failed:', err)
      throw err
    }
  }

  const harvest = async (poolId) => {
    try {
      await writeContract({
        address: CONTRACTS.FARM,
        abi: FarmABI,
        functionName: 'harvest',
        args: [poolId],
      })
    } catch (err) {
      console.error('Harvest failed:', err)
      throw err
    }
  }

  return {
    stake,
    unstake,
    harvest,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
```

---

## 6. 交易状态处理

### 6.1 创建交易通知组件

创建 `components/TransactionNotification.js`：

```javascript
'use client'

export function TransactionNotification({ hash, isConfirming, isSuccess, error }) {
  if (!hash && !error) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-sm">
      {isConfirming && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
          <div className="text-blue-400 font-semibold mb-2">⏳ Transaction Pending</div>
          <div className="text-white/70 text-sm">Waiting for confirmation...</div>
        </div>
      )}

      {isSuccess && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
          <div className="text-green-400 font-semibold mb-2">✓ Transaction Successful!</div>
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-sm underline"
          >
            View on Etherscan ↗
          </a>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <div className="text-red-400 font-semibold mb-2">✗ Transaction Failed</div>
          <div className="text-white/70 text-sm">{error.message}</div>
        </div>
      )}
    </div>
  )
}
```

---

## 7. 本节小结

✅ **完成内容**：
- 实现代币授权（Approve）逻辑
- 实现 Swap 交易功能
- 实现添加/移除流动性
- 实现 LP 质押/解除质押
- 创建交易状态通知组件

📌 **下一步（Day 6）**：
- 实现合约数据查询
- 获取代币余额
- 获取流动性池信息
- 获取质押奖励数据
- 实现 Dashboard 数据展示

💡 **重要提示**：
- 每次交易需要用户签名
- 需要支付 Gas 费（测试网 ETH）
- Approve 只需执行一次（除非需要增加额度）
- 建议添加滑点保护
- 生产环境需要更完善的错误处理

---

## 常见问题

**Q1: 为什么 Approve 交易一直 pending？**
A: 检查钱包是否有足够的 ETH 支付 Gas 费，以及网络是否拥堵。

**Q2: 如何设置合适的滑点？**
A: 流动性好的池子 0.5%-1% 即可，流动性差的可能需要 3%-5%。

**Q3: 交易失败如何调试？**
A: 在 Etherscan 查看交易详情，查看 revert reason。

**Q4: 如何取消 pending 的交易？**
A: 在 MetaMask 中加速或取消交易，或发送相同 nonce 的 0 ETH 交易。

**Q5: 授权额度如何查询？**
A: 使用 `useReadContract` 调用 ERC20 的 `allowance` 函数。

**Q6: 如何监听交易确认？**
A: 使用 `useWaitForTransactionReceipt` Hook，传入交易 hash。
