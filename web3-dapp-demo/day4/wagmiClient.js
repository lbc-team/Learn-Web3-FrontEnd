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
