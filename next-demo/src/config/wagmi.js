import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'
import { http } from 'viem'

// 配置选项：true使用自定义RPC，false使用链默认RPC
const USE_CUSTOM_RPC = true

// 条件配置Sepolia
const sepoliaConfig = USE_CUSTOM_RPC ? {
  ...sepolia,
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL] },
    public: { http: [process.env.NEXT_PUBLIC_RPC_URL] },
  }
} : sepolia

console.log("sepolia", sepolia)

// 条件配置transports
const transports = USE_CUSTOM_RPC ? {
  [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
} : undefined

export const config = getDefaultConfig({
  appName: 'Web3 RPC Demo',
  projectId: 'YOUR_PROJECT_ID', // 从 WalletConnect Cloud 获取
  chains: [sepoliaConfig],
  ...(transports && { transports }),
  ssr: true, // 如果你的 dApp 使用服务端渲染 (SSR)
})