import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const USE_CUSTOM_RPC = true

const sepoliaConfig = USE_CUSTOM_RPC ? {
  ...sepolia,
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL] },
    public: { http: [process.env.NEXT_PUBLIC_RPC_URL] },
  }
} : sepolia

const transports = USE_CUSTOM_RPC ? {
  [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
} : {
  [sepolia.id]: http(),
}

const connectors = [
  injected(),
  walletConnect({
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    showQrModal: true,
    metadata: {
      name: 'Web3 Frontend Demo',
      description: 'Learn Web3 Frontend Development',
      url: 'https://learn-web3-frontend.com',
      icons: ['https://avatars.githubusercontent.com/u/37784886']
    }
  }),
]

export const config = createConfig({
  chains: [sepoliaConfig],
  transports,
  connectors,
  ssr: true,
})
