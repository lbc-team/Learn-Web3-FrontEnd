# DeFi DApp Contracts

This directory contains the core smart contracts for the DeFi DApp teaching platform.

## 📁 Contract Overview

### Core Contracts

| Contract | Description | Key Functions |
|----------|-------------|---------------|
| **Token.sol** | ERC20 token with mint/burn functionality | `mint()`, `burn()`, `burnFrom()` |
| **Swap.sol** | Simple constant product AMM (x * y = k) | `swap()`, `addLiquidity()`, `removeLiquidity()`, `getAmountOut()` |
| **StakePool.sol** | Single-token staking with rewards | `stake()`, `withdraw()`, `claimReward()`, `earned()` |
| **Farm.sol** | Multi-pool farming with reward distribution | `deposit()`, `withdraw()`, `harvest()`, `pendingReward()` |
| **LaunchPad.sol** | Token sale platform | `buy()`, `claim()`, `getSaleInfo()` |

## 🏗️ Architecture

### Token.sol
- Standard ERC20 with custom decimals support
- Owner-controlled minting
- Public burning functionality
- Full OpenZeppelin security implementation

**Key Functions:**
```solidity
function mint(address to, uint256 amount) external onlyOwner
function burn(uint256 amount) external
function burnFrom(address from, uint256 amount) external
```

### Swap.sol
- Simplified constant product AMM (Uniswap-style)
- Single token pair (tokenA <-> tokenB)
- 0.3% trading fee
- Price calculation: `amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)`

**Key Functions:**
```solidity
function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut)
function getAmountOut(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut)
function addLiquidity(uint256 amountA, uint256 amountB) external
function getReserves() external view returns (uint256, uint256)
```

### StakePool.sol
- Time-weighted reward distribution
- Reward rate configurable by owner
- Automatic compound calculation
- Formula: `reward = stakedBalance * (rewardPerToken - userRewardPerTokenPaid) / 1e18 + rewards`

**Key Functions:**
```solidity
function stake(uint256 amount) external
function withdraw(uint256 amount) external
function claimReward() external
function earned(address account) public view returns (uint256)
function getUserInfo(address user) external view returns (uint256 staked, uint256 pendingReward)
```

### Farm.sol
- Multi-pool farming with allocation points
- Configurable reward distribution across pools
- Per-pool reward calculation based on share
- Supports multiple LP tokens

**Key Functions:**
```solidity
function deposit(uint256 _pid, uint256 _amount) external
function withdraw(uint256 _pid, uint256 _amount) external
function harvest(uint256 _pid) external
function pendingReward(uint256 _pid, address _user) external view returns (uint256)
function getUserInfo(uint256 _pid, address _user) external view returns (uint256 amount, uint256 pending)
```

### LaunchPad.sol
- Token sale management
- Time-based sale periods
- Min/max purchase limits per user
- Two-phase: buy period + claim period

**Key Functions:**
```solidity
function buy(uint256 amount) external
function claim() external
function getSaleInfo() external view returns (...)
function getUserInfo(address user) external view returns (uint256 purchased, uint256 claimed, uint256 claimable)
```

## 🛠️ Development

### Build Contracts

```bash
cd foundry-demo
forge build
```

This will compile all contracts and generate ABIs in `out/` directory:
- `out/Token.sol/Token.json`
- `out/Swap.sol/Swap.json`
- `out/StakePool.sol/StakePool.json`
- `out/Farm.sol/Farm.json`
- `out/LaunchPad.sol/LaunchPad.json`

### Run Tests

```bash
forge test
```

### Deploy to Local Anvil

1. Start Anvil (local testnet):
```bash
anvil
```

2. Deploy contracts:
```bash
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Note: The private key above is the default Anvil account #0 (for testing only!)

### Deploy to Sepolia Testnet

1. Set up environment variables in `.env`:
```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=YOUR_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

2. Deploy contracts:
```bash
source .env
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --private-key $PRIVATE_KEY --verify --etherscan-api-key $ETHERSCAN_API_KEY
```

3. The deployment script will output all contract addresses. Copy them to your `web3-dapp/.env.local`:
```
NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_A_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_B_ADDRESS=0x...
NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_SWAP_ADDRESS=0x...
NEXT_PUBLIC_STAKE_POOL_ADDRESS=0x...
NEXT_PUBLIC_FARM_ADDRESS=0x...
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0x...
```

## 📝 Deployment Flow

The `Deploy.s.sol` script deploys contracts in this order:

1. **Token Contracts** (4 total):
   - RewardToken (DRT) - For staking/farming rewards
   - TokenA (TKA) - First swap pair token
   - TokenB (TKB) - Second swap pair token
   - PaymentToken (USDC) - For LaunchPad purchases

2. **Swap Contract**:
   - Initialized with TokenA and TokenB pair

3. **StakePool Contract**:
   - Stake: TokenA
   - Reward: RewardToken
   - Reward Rate: 1 token/second

4. **Farm Contract**:
   - Reward: RewardToken
   - Reward Rate: 1 token/second
   - Pools configured separately after deployment

5. **LaunchPad Contract**:
   - Empty initialization
   - Sale configured separately via `createSale()`

## 🔍 Verification

After deployment, verify each contract on Etherscan:

```bash
forge verify-contract <CONTRACT_ADDRESS> src/Token.sol:Token --chain sepolia --etherscan-api-key $ETHERSCAN_API_KEY --constructor-args $(cast abi-encode "constructor(string,string,uint8,uint256)" "DeFi Reward Token" "DRT" 18 1000000000000000000000000)
```

## 📚 Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## ⚠️ Security Notes

**For Educational Purposes Only**

These contracts are simplified for teaching and have NOT been audited. Do NOT use in production without:
- Comprehensive testing
- Professional security audit
- Additional safety mechanisms
- Proper access controls

## 📄 License

MIT
