import { http, createConfig } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// 自定义 Anvil 本地链
const anvil = {
  id: 31337,
  name: 'Anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL_ANVIL || 'http://127.0.0.1:8545'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_URL_ANVIL || 'http://127.0.0.1:8545'],
    },
  },
  testnet: true,
}

// Wagmi 配置
export const config = createConfig({
  chains: [sepolia, anvil, mainnet],
  connectors: [
    injected(), // MetaMask, Coinbase Wallet, etc.
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA),
    [anvil.id]: http(process.env.NEXT_PUBLIC_RPC_URL_ANVIL || 'http://127.0.0.1:8545'),
    [mainnet.id]: http(),
  },
  ssr: true,
})
