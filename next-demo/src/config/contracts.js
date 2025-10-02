export const CONTRACTS = {
  COUNTER: {
    address: process.env.NEXT_PUBLIC_COUNTER_ADDRESS,
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
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "setNumber",
        "inputs": [{ "name": "newNumber", "type": "uint256", "internalType": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
      }
    ]
  },
  ERC20TOKEN: {
    address: process.env.NEXT_PUBLIC_ERC20TOKEN_ADDRESS,
    abi: [
      {
        "type": "function",
        "name": "name",
        "inputs": [],
        "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "symbol",
        "inputs": [],
        "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "totalSupply",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "balanceOf",
        "inputs": [{ "name": "account", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "transfer",
        "inputs": [
          { "name": "to", "type": "address", "internalType": "address" },
          { "name": "amount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "approve",
        "inputs": [
          { "name": "spender", "type": "address", "internalType": "address" },
          { "name": "amount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "allowance",
        "inputs": [
          { "name": "owner", "type": "address", "internalType": "address" },
          { "name": "spender", "type": "address", "internalType": "address" }
        ],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "mintedByAddress",
        "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "MAX_MINT_PER_ADDRESS",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "mint",
        "inputs": [{ "name": "amount", "type": "uint256", "internalType": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "remainingMintAmount",
        "inputs": [{ "name": "account", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      }
    ]
  },
  TOKENBANK: {
    address: process.env.NEXT_PUBLIC_TOKENBANK_ADDRESS,
    abi: [
      {
        "type": "function",
        "name": "token",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "deposits",
        "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "totalDeposits",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "deposit",
        "inputs": [{ "name": "amount", "type": "uint256", "internalType": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "withdraw",
        "inputs": [{ "name": "amount", "type": "uint256", "internalType": "uint256" }],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "balanceOf",
        "inputs": [{ "name": "user", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "getBankBalance",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
      },
      {
        "type": "event",
        "name": "Deposit",
        "inputs": [
          { "name": "user", "type": "address", "indexed": true },
          { "name": "amount", "type": "uint256", "indexed": false }
        ]
      },
      {
        "type": "event",
        "name": "Withdraw",
        "inputs": [
          { "name": "user", "type": "address", "indexed": true },
          { "name": "amount", "type": "uint256", "indexed": false }
        ]
      },
      {
        "type": "error",
        "name": "InvalidAmount",
        "inputs": []
      },
      {
        "type": "error",
        "name": "InsufficientBalance",
        "inputs": []
      },
      {
        "type": "error",
        "name": "TransferFailed",
        "inputs": []
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