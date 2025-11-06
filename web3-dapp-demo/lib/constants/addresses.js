/**
 * 合约地址配置
 * 集中管理所有智能合约地址
 */

import { sepolia } from 'wagmi/chains'

// 代币合约地址
export const TOKEN_ADDRESSES = {
  [sepolia.id]: {
    REWARD_TOKEN: process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS,
    TOKEN_A: process.env.NEXT_PUBLIC_TOKEN_A_ADDRESS,
    TOKEN_B: process.env.NEXT_PUBLIC_TOKEN_B_ADDRESS,
    PAYMENT_TOKEN: process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS,
  },
}

// DeFi 协议合约地址
export const PROTOCOL_ADDRESSES = {
  [sepolia.id]: {
    SWAP: process.env.NEXT_PUBLIC_SWAP_ADDRESS,
    STAKE_POOL: process.env.NEXT_PUBLIC_STAKE_POOL_ADDRESS,
    FARM: process.env.NEXT_PUBLIC_FARM_ADDRESS,
    LAUNCHPAD: process.env.NEXT_PUBLIC_LAUNCHPAD_ADDRESS,
  },
}

// 代币配置（包含元数据）
export const TOKENS = {
  TKA: {
    symbol: 'TKA',
    name: 'Token A',
    decimals: 18,
    getAddress: (chainId) => TOKEN_ADDRESSES[chainId]?.TOKEN_A,
  },
  TKB: {
    symbol: 'TKB',
    name: 'Token B',
    decimals: 18,
    getAddress: (chainId) => TOKEN_ADDRESSES[chainId]?.TOKEN_B,
  },
  DRT: {
    symbol: 'DRT',
    name: 'DeFi Reward Token',
    decimals: 18,
    getAddress: (chainId) => TOKEN_ADDRESSES[chainId]?.REWARD_TOKEN,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 18,
    getAddress: (chainId) => TOKEN_ADDRESSES[chainId]?.PAYMENT_TOKEN,
  },
}

// 辅助函数：获取代币地址
export function getTokenAddress(chainId, tokenSymbol) {
  return TOKENS[tokenSymbol]?.getAddress(chainId)
}

// 辅助函数：获取协议合约地址
export function getProtocolAddress(chainId, protocol) {
  return PROTOCOL_ADDRESSES[chainId]?.[protocol]
}
