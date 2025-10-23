/**
 * Swap (DEX with LP Token) 合约 ABI
 * 新版本支持LP Token自动铸造/销毁
 */
export const SWAP_ABI = [
  // ===== Swap Functions =====
  {
    name: 'swap',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
  {
    name: 'getAmountOut',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
  {
    name: 'getReserves',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'reserveA', type: 'uint256' },
      { name: 'reserveB', type: 'uint256' },
    ],
  },

  // ===== Liquidity Functions =====
  {
    name: 'addLiquidity',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountA', type: 'uint256' },
      { name: 'amountB', type: 'uint256' },
    ],
    outputs: [{ name: 'liquidity', type: 'uint256' }],
  },
  {
    name: 'removeLiquidity',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'liquidity', type: 'uint256' },
    ],
    outputs: [
      { name: 'amountA', type: 'uint256' },
      { name: 'amountB', type: 'uint256' },
    ],
  },

  // ===== ERC20 LP Token Functions =====
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },

  // ===== State Variables =====
  {
    name: 'reserveA',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'reserveB',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenA',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'tokenB',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },

  // ===== Events =====
  {
    name: 'LiquidityAdded',
    type: 'event',
    inputs: [
      { name: 'provider', type: 'address', indexed: true },
      { name: 'amountA', type: 'uint256', indexed: false },
      { name: 'amountB', type: 'uint256', indexed: false },
      { name: 'liquidity', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'LiquidityRemoved',
    type: 'event',
    inputs: [
      { name: 'provider', type: 'address', indexed: true },
      { name: 'amountA', type: 'uint256', indexed: false },
      { name: 'amountB', type: 'uint256', indexed: false },
      { name: 'liquidity', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Swapped',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'tokenIn', type: 'address', indexed: true },
      { name: 'amountIn', type: 'uint256', indexed: false },
      { name: 'amountOut', type: 'uint256', indexed: false },
    ],
  },
]
