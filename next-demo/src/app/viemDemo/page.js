'use client'
import { useState } from 'react'
import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  parseEther, 
  formatEther,
  getContract,
  formatUnits
} from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { CONTRACTS } from '@/config/contracts'


export default function ViemDemo() {
  const [privateKey, setPrivateKey] = useState('')
  const [results, setResults] = useState({})
  const [status, setStatus] = useState('')
  const [mintAmount, setMintAmount] = useState('')

  // 配置常量
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL
  const TOKEN_ADDRESS = CONTRACTS.ERC20TOKEN.address
  const ERC20_ABI = CONTRACTS.ERC20TOKEN.abi

  // 1. Client 和 Transport 演示
  const demonstrateClientTransport = async () => {
    try {
      setStatus('演示 Client 和 Transport...')
      
      // 创建 Public Client (用于读取数据)
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(RPC_URL)
      })

      // 获取链信息
      const chainId = await publicClient.getChainId()
      const blockNumber = await publicClient.getBlockNumber()
      
      setResults(prev => ({
        ...prev,
        client: {
          chainId,
          blockNumber: blockNumber.toString(),
          transport: 'HTTP',
        }
      }))
      
      setStatus('Client 和 Transport 演示完成')
    } catch (error) {
      setStatus(`Client 错误: ${error.message}`)
    }
  }

  // 2. Public Actions 演示
  const demonstratePublicActions = async () => {
    if (!privateKey) {
      setStatus('请输入私钥')
      return
    }

    try {
      setStatus('演示 Public Actions...')
      
      const account = privateKeyToAccount(`0x${privateKey}`)
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(RPC_URL)
      })

      // Public Actions: 获取余额、区块信息等
      const ethBalance = await publicClient.getBalance({ address: account.address })
      const block = await publicClient.getBlock({ blockTag: 'latest' })
      const gasPrice = await publicClient.getGasPrice()

      setResults(prev => ({
        ...prev,
        publicActions: {
          address: account.address,
          ethBalance: formatEther(ethBalance),
          latestBlock: block.number.toString(),
          gasPrice: formatUnits(gasPrice, 9) + ' gwei'
        }
      }))
      
      setStatus('Public Actions 演示完成')
    } catch (error) {
      setStatus(`Public Actions 错误: ${error.message}`)
    }
  }

  // 3. Wallet Actions 演示
  const demonstrateWalletActions = async () => {
    if (!privateKey) {
      setStatus('请输入私钥')
      return
    }

    try {
      setStatus('演示 Wallet Actions...')
      
      const account = privateKeyToAccount(`0x${privateKey}`)
      const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(RPC_URL)
      })

      // Wallet Actions: 账户信息
      const addresses = await walletClient.getAddresses()
      const chainId = await walletClient.getChainId()

      setResults(prev => ({
        ...prev,
        walletActions: {
          addresses,
          chainId,
          accountType: 'privateKey',
          ready: true
        }
      }))
      
      setStatus('Wallet Actions 演示完成')
    } catch (error) {
      setStatus(`Wallet Actions 错误: ${error.message}`)
    }
  }

  // 4. Account 和 Contract 演示
  const demonstrateAccountContract = async () => {
    if (!privateKey) {
      setStatus('请输入私钥')
      return
    }

    try {
      setStatus('演示 Account 和 Contract...')
      
      const account = privateKeyToAccount(`0x${privateKey}`)
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(RPC_URL)
      })

      // 创建合约实例
      const contract = getContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        client: publicClient
      })

      // 读取合约信息
      const [name, symbol, totalSupply, owner] = await Promise.all([
        contract.read.name(),
        contract.read.symbol(), 
        contract.read.totalSupply(),
        contract.read.owner()
      ])

      setResults(prev => ({
        ...prev,
        accountContract: {
          account: {
            address: account.address,
            type: 'LocalAccount'
          },
          contract: {
            address: TOKEN_ADDRESS,
            name,
            symbol,
            totalSupply: formatEther(totalSupply),
            owner
          }
        }
      }))
      
      setStatus('Account 和 Contract 演示完成')
    } catch (error) {
      setStatus(`Account/Contract 错误: ${error.message}`)
    }
  }

  // 5. ETH 和 Token 余额查询
  const getBalances = async () => {
    if (!privateKey) {
      setStatus('请输入私钥')
      return
    }

    try {
      setStatus('查询 ETH 和 Token 余额...')
      
      const account = privateKeyToAccount(`0x${privateKey}`)
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(RPC_URL)
      })

      // ETH 余额
      const ethBalance = await publicClient.getBalance({ address: account.address })
      
      // Token 余额
      const tokenBalance = await publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address]
      })

      setResults(prev => ({
        ...prev,
        balances: {
          eth: formatEther(ethBalance),
          token: formatEther(tokenBalance)
        }
      }))
      
      setStatus('余额查询完成')
    } catch (error) {
      setStatus(`余额查询错误: ${error.message}`)
    }
  }

  // 6. 读取 ERC20 合约数据
  const readContractData = async () => {
    if (!privateKey) {
      setStatus('请输入私钥')
      return
    }

    try {
      setStatus('读取 ERC20 合约数据...')
      
      const account = privateKeyToAccount(`0x${privateKey}`)
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(RPC_URL)
      })

      // 读取合约数据
      const [
        name,
        symbol,
        totalSupply,
        owner,
        mintedByAddress,
        maxMintPerAddress,
        remainingMint
      ] = await Promise.all([
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'name'
        }),
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'symbol'
        }),
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'totalSupply'
        }),
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'owner'
        }),
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'mintedByAddress',
          args: [account.address]
        }),
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'MAX_MINT_PER_ADDRESS'
        }),
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'remainingMintAmount',
          args: [account.address]
        })
      ])

      setResults(prev => ({
        ...prev,
        contractData: {
          name,
          symbol,
          totalSupply: formatEther(totalSupply),
          owner,
          mintedByAddress: formatEther(mintedByAddress),
          maxMintPerAddress: formatEther(maxMintPerAddress),
          remainingMint: formatEther(remainingMint)
        }
      }))
      
      setStatus('合约数据读取完成')
    } catch (error) {
      setStatus(`合约数据读取错误: ${error.message}`)
    }
  }

  // 7. Mint 功能
  const mintTokens = async () => {
    if (!privateKey || !mintAmount) {
      setStatus('请输入私钥和铸造数量')
      return
    }

    try {
      setStatus('铸造代币中...')
      
      const account = privateKeyToAccount(`0x${privateKey}`)
      const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(RPC_URL)
      })

      const hash = await walletClient.writeContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'mint',
        args: [parseEther(mintAmount)]
      })

      setResults(prev => ({
        ...prev,
        mint: {
          hash,
          amount: mintAmount,
          success: true
        }
      }))
      
      setStatus(`铸造成功！交易哈希: ${hash}`)
    } catch (error) {
      setStatus(`铸造失败: ${error.message}`)
    }
  }


  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'monospace'
    }}>
      <h1>Viem使用教学演示</h1>
      
      {/* 配置区域 */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        backgroundColor: '#f5f5f5',
        borderRadius: '8px' 
      }}>
        <h3>配置信息</h3>
        <p>Token Address: {TOKEN_ADDRESS}</p>
        <div style={{ marginTop: '10px' }}>
          <label>私钥 (不含0x前缀):</label>
          <input
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            style={{ 
              width: '400px', 
              padding: '8px', 
              marginLeft: '10px',
              fontFamily: 'monospace'
            }}
            placeholder="输入私钥进行演示"
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '10px',
        marginBottom: '20px' 
      }}>
        <button onClick={demonstrateClientTransport} style={buttonStyle}>
          1. Client & Transport
        </button>
        <button onClick={demonstratePublicActions} style={buttonStyle}>
          2. Public Actions
        </button>
        <button onClick={demonstrateWalletActions} style={buttonStyle}>
          3. Wallet Actions
        </button>
        <button onClick={demonstrateAccountContract} style={buttonStyle}>
          4. Account & Contract
        </button>
        <button onClick={getBalances} style={buttonStyle}>
          5. 查询余额
        </button>
        <button onClick={readContractData} style={buttonStyle}>
          6. 读取合约数据
        </button>
      </div>

      {/* Mint 功能 */}
      <div style={{ 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#e8f4fd',
        borderRadius: '8px'
      }}>
        <h4>Mint 代币功能</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="number"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            placeholder="铸造数量 (ETH)"
            style={{ padding: '8px', width: '200px' }}
          />
          <button onClick={mintTokens} style={buttonStyle}>
            Mint 代币
          </button>
        </div>
      </div>

      {/* 状态显示 */}
      <div style={{ 
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '5px'
      }}>
        <strong>状态:</strong> {status}
      </div>

      {/* 结果显示 */}
      <div style={{ marginTop: '20px' }}>
        <h3>演示结果</h3>
        <pre style={{ 
          backgroundColor: '#1e1e1e',
          color: '#d4edda',
          padding: '20px',
          borderRadius: '8px',
          overflow: 'auto',
          maxHeight: '600px'
        }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="/" style={{ 
          color: '#0070f3', 
          textDecoration: 'none',
          padding: '10px 20px',
          border: '1px solid #0070f3',
          borderRadius: '5px'
        }}>
          返回首页
        </a>
      </div>
    </div>
  )
}

const buttonStyle = {
  padding: '10px 15px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold'
}