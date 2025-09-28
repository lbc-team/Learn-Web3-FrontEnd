export const CONTRACTS = {
  COUNTER: {
    // address: process.env.NEXT_PUBLIC_COUNTER_ADDRESS,
    address: '0x431306040c181E768C4301a7bfD4fC6a770E833F',
    abi: [
      {
        "type": "function",
        "name": "increment",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function", 
        "name": "number",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "setNumber", 
        "inputs": [{"name": "newNumber", "type": "uint256", "internalType": "uint256"}],
        "outputs": [],
        "stateMutability": "nonpayable"
      }
    ]
  }
}

export const NETWORKS = {
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: [process.env.NEXT_PUBLIC_RPC_URL] },
      default: { http: [process.env.NEXT_PUBLIC_RPC_URL] },
    },
    blockExplorers: {
      etherscan: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
  },
}