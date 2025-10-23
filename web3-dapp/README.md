# Web3 DApp - DeFi Teaching Platform

A full-stack decentralized finance (DeFi) application built for educational purposes, featuring LaunchPad, Bridge, DEX (Swap), LP Staking, and Farm modules.

## Tech Stack

### Frontend
- **Next.js 15** (App Router) - React framework with server components
- **JavaScript** - Pure JS implementation (no TypeScript)
- **Tailwind CSS** + **shadcn/ui** - Styling and UI components
- **wagmi** + **viem** - Ethereum interactions
- **RainbowKit** - Wallet connection UI
- **ECharts** - Data visualization

### Smart Contracts
- **Foundry** - Smart contract development framework
- **OpenZeppelin** - Secure contract libraries
- **Sepolia Testnet** - Deployed contracts

## Features

### 1. LaunchPad
- Project listings with countdown timers
- Buy/Claim token operations
- Progress tracking (raised/goal)

### 2. Bridge
- Cross-chain transfer interface
- Real-time status tracking (queued → inflight → complete)
- Transfer history

### 3. DEX (Swap)
- Token swapping with constant product AMM (x * y = k)
- Price impact calculation
- Slippage protection

### 4. LP Staking (Pool)
- Add/Remove liquidity
- Proportional dual-token calculation
- LP token management

### 5. Farm
- Multi-pool staking
- Deposit/Withdraw/Harvest operations
- Real-time APY and rewards tracking

### 6. Dashboard
- Portfolio overview
- Wallet balances
- LP holdings and Farm earnings
- Price and TVL charts (7day/30day)

## Contract Addresses (Sepolia)

```javascript
// Add your deployed contract addresses here
REWARD_TOKEN = "0x..."  // DRT Token
TKA = "0x..."           // Token A
TKB = "0x..."           // Token B
SWAP = "0x..."          // DEX Contract
FARM = "0x..."          // Farm Contract
LAUNCHPAD = "0x..."     // LaunchPad Contract
```

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Required for Vercel Deployment

# Wallet Connect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# RPC URLs
NEXT_PUBLIC_RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_RPC_URL_MAINNET=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

# Contract Addresses (Sepolia Testnet)
NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_TKA_ADDRESS=0x...
NEXT_PUBLIC_TKB_ADDRESS=0x...
NEXT_PUBLIC_SWAP_ADDRESS=0x...
NEXT_PUBLIC_FARM_ADDRESS=0x...
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0x...

# Optional: API Keys
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Local Development

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Click "Import Project"
   - Import your Git repository

2. **Configure Project**
   - Framework Preset: **Next.js**
   - Root Directory: `./web3-dapp` (if in monorepo)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

3. **Environment Variables**
   - Go to "Environment Variables" section
   - Add all variables from `.env.local` (see above)
   - Make sure to add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Important Notes for Vercel

1. **API Routes**: All `/api/*` endpoints are automatically deployed as serverless functions
2. **Environment Variables**: Must be configured in Vercel dashboard (not in `.env.local`)
3. **Build Warnings**: The MetaMask SDK warning about `@react-native-async-storage` can be safely ignored
4. **SSR Compatibility**: ECharts is loaded client-side only to prevent SSR issues

### Vercel Configuration (Optional)

Create `vercel.json` for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 10
    }
  }
}
```

## Project Structure

```
web3-dapp/
├── app/
│   ├── api/                    # API route handlers (serverless)
│   │   ├── bridge/transfer/    # Bridge API
│   │   ├── farm/stats/         # Farm statistics
│   │   ├── health/             # Health check
│   │   ├── launchpad/projects/ # LaunchPad projects
│   │   ├── stake/pools/        # Staking pools
│   │   └── token/price/        # Token price data
│   ├── bridge/                 # Bridge page
│   ├── dashboard/              # Dashboard page
│   ├── farm/                   # Farm page
│   ├── launchpad/              # LaunchPad page
│   ├── pool/                   # LP Staking page
│   ├── swap/                   # DEX Swap page
│   └── layout.js               # Root layout with providers
├── components/
│   ├── charts/                 # ECharts components
│   ├── ui/                     # shadcn/ui components
│   └── ApproveButton.js        # ERC20 approval component
├── lib/
│   ├── wagmiClient.js          # Wagmi configuration
│   └── utils.js                # Utility functions
├── contracts/                  # ABIs (copied from Foundry)
└── public/                     # Static assets
```

## Key Implementation Details

### BigInt Handling
All token amounts use `BigInt` to avoid floating-point precision errors:

```javascript
import { parseUnits, formatUnits } from 'viem'

// Convert user input to Wei (BigInt)
const amountWei = parseUnits(userInput, 18)

// Convert Wei to display (string)
const displayAmount = formatUnits(amountWei, 18)
```

### ECharts SSR Blocking
Dynamic import to prevent server-side rendering issues:

```javascript
const [echarts, setEcharts] = useState(null)

useEffect(() => {
  import('echarts').then(module => {
    setEcharts(module.default || module)
  })
}, [])
```

### Mock Mode
All API routes support mock data when blockchain is unavailable:

```javascript
const chainData = await fetchFromChain()
return chainData || generateMockData()
```

## Testing

### Manual Testing
1. Connect wallet (MetaMask on Sepolia testnet)
2. Get testnet ETH from [Sepolia faucet](https://sepoliafaucet.com/)
3. Test each module:
   - Swap: Trade TKA ↔ TKB
   - Pool: Add/Remove liquidity
   - Farm: Deposit/Withdraw/Harvest
   - LaunchPad: Buy/Claim tokens
   - Bridge: Cross-chain transfers
   - Dashboard: View all stats

### API Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Token price
curl http://localhost:3000/api/token/price

# Farm stats
curl http://localhost:3000/api/farm/stats

# Staking pools
curl http://localhost:3000/api/stake/pools

# LaunchPad projects
curl http://localhost:3000/api/launchpad/projects

# Bridge transfer (POST)
curl -X POST http://localhost:3000/api/bridge/transfer \
  -H "Content-Type: application/json" \
  -d '{"sourceChain":"Ethereum","targetChain":"Sepolia","token":"ETH","amount":"1.0","recipient":"0x..."}'
```

## Troubleshooting

### Build Issues

**Issue**: "Cannot find module for page" errors during build

**Solution**: Clear Next.js cache and rebuild
```bash
rm -rf .next
npm run build
```

### Wallet Connection Issues

**Issue**: RainbowKit not connecting

**Solution**: Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in `.env.local`

### Contract Interaction Errors

**Issue**: Transaction fails or reverts

**Solutions**:
- Check wallet is connected to Sepolia testnet
- Ensure sufficient ETH for gas
- Verify token approvals are granted
- Check contract addresses are correct

## Documentation

- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Detailed feature implementation
- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing steps
- [ECharts Implementation](./ECHARTS_IMPLEMENTATION.md) - Chart component documentation

## License

MIT

## Support

For issues and questions, please refer to the documentation files or create an issue in the repository.
