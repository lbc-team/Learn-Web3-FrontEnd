#!/bin/bash

# export-abis.sh
# 从 foundry-demo/out 拷贝 ABI JSON 到 web3-dapp/public/abis

set -e

FOUNDRY_OUT="../foundry-demo/out"
WEB3_ABIS="../web3-dapp/public/abis"

echo "🔍 Checking Foundry output directory..."

# 创建目标目录
mkdir -p "$WEB3_ABIS"

# 检查 foundry-demo/out 是否存在
if [ ! -d "$FOUNDRY_OUT" ]; then
  echo "⚠️  Foundry output directory not found: $FOUNDRY_OUT"
  echo "✅ Created empty abis directory at $WEB3_ABIS"
  exit 0
fi

# 查找并拷贝所有 .json 文件
JSON_FILES=$(find "$FOUNDRY_OUT" -name "*.json" -type f 2>/dev/null || true)

if [ -z "$JSON_FILES" ]; then
  echo "⚠️  No JSON files found in $FOUNDRY_OUT"
  echo "✅ Created empty abis directory at $WEB3_ABIS"
else
  echo "📦 Copying ABI files..."

  # 拷贝所有 JSON 文件
  find "$FOUNDRY_OUT" -name "*.json" -type f -exec cp {} "$WEB3_ABIS/" \;

  FILE_COUNT=$(find "$WEB3_ABIS" -name "*.json" -type f | wc -l | tr -d ' ')
  echo "✅ Copied $FILE_COUNT ABI files to $WEB3_ABIS"
fi

# 创建 .env.local 占位文件（如果不存在）
ENV_FILE="../web3-dapp/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "📝 Creating .env.local placeholder..."
  cat > "$ENV_FILE" << 'EOF'
# RPC URLs
NEXT_PUBLIC_RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_RPC_URL_ANVIL=http://127.0.0.1:8545

# Contract Addresses (填入部署后的合约地址)
NEXT_PUBLIC_TOKEN_ADDRESS=
NEXT_PUBLIC_SWAP_ADDRESS=
NEXT_PUBLIC_STAKE_POOL_ADDRESS=
NEXT_PUBLIC_FARM_ADDRESS=
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
EOF
  echo "✅ Created .env.local at $ENV_FILE"
else
  echo "ℹ️  .env.local already exists, skipping..."
fi

echo ""
echo "🎉 ABI export complete!"
echo "📂 ABI files location: $WEB3_ABIS"
echo "⚙️  Environment file: $ENV_FILE"
