'use client'
import { useState, useEffect } from 'react'
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBlockNumber,
  useChainId,
  useSwitchChain
} from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACTS } from '@/config/contracts'
import { sepolia } from 'wagmi/chains'

export default function WagmiDemo() {
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [approveAmount, setApproveAmount] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // 1. useAccount Hook - 获取账户信息
  const { address, isConnected, isConnecting, isDisconnected, connector } = useAccount()

  // 2. useBalance Hook - 获取ETH余额
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
  })

  // 3. useReadContract Hook - 获取Token余额 (替代已弃用的 useBalance token 属性)
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: CONTRACTS.ERC20TOKEN.address,
    abi: CONTRACTS.ERC20TOKEN.abi,
    functionName: 'balanceOf',
    args: [address],
  })

  // 4. useChainId Hook - 获取链ID
  const chainId = useChainId()

  // 5. useSwitchChain Hook - 切换链
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()

  // 6. useBlockNumber Hook - 获取区块号
  const { data: blockNumber } = useBlockNumber({ watch: true })

  // 7. useConnect Hook - 连接钱包
  const { connectors, connect, isPending: isConnectPending, error: connectError } = useConnect()

  // 8. useDisconnect Hook - 断开连接
  const { disconnect } = useDisconnect()

  // 8. useReadContract Hooks - 读取TokenBank合约数据
  const { data: bankDeposit, refetch: refetchBankDeposit } = useReadContract({
    address: CONTRACTS.TOKENBANK.address,
    abi: CONTRACTS.TOKENBANK.abi,
    functionName: 'deposits',
    args: [address],
  })

  const { data: totalDeposits } = useReadContract({
    address: CONTRACTS.TOKENBANK.address,
    abi: CONTRACTS.TOKENBANK.abi,
    functionName: 'totalDeposits',
  })

  const { data: tokenAddress } = useReadContract({
    address: CONTRACTS.TOKENBANK.address,
    abi: CONTRACTS.TOKENBANK.abi,
    functionName: 'token',
  })

  // 读取Token的approve额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.ERC20TOKEN.address,
    abi: CONTRACTS.ERC20TOKEN.abi,
    functionName: 'allowance',
    args: [address, CONTRACTS.TOKENBANK.address],
  })

  // 9. useWriteContract Hook - Approve Token
  const {
    data: approveHash,
    writeContract: approveToken,
    isPending: isApprovePending
  } = useWriteContract()

  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // 10. useWriteContract Hook - Deposit
  const {
    data: depositHash,
    writeContract: depositToken,
    isPending: isDepositPending
  } = useWriteContract()

  const { isLoading: isDepositLoading, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  })

  // 11. useWriteContract Hook - Withdraw
  const {
    data: withdrawHash,
    writeContract: withdrawToken,
    isPending: isWithdrawPending
  } = useWriteContract()

  const { isLoading: isWithdrawLoading, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  })

  // 处理Approve
  const handleApprove = () => {
    if (!approveAmount) {
      alert('请输入授权金额')
      return
    }

    approveToken({
      address: CONTRACTS.ERC20TOKEN.address,
      abi: CONTRACTS.ERC20TOKEN.abi,
      functionName: 'approve',
      args: [CONTRACTS.TOKENBANK.address, parseEther(approveAmount)]
    })
  }

  // 处理Deposit
  const handleDeposit = () => {
    if (!depositAmount) {
      alert('请输入存款金额')
      return
    }

    depositToken({
      address: CONTRACTS.TOKENBANK.address,
      abi: CONTRACTS.TOKENBANK.abi,
      functionName: 'deposit',
      args: [parseEther(depositAmount)]
    })
  }

  // 处理Withdraw
  const handleWithdraw = () => {
    if (!withdrawAmount) {
      alert('请输入提款金额')
      return
    }

    withdrawToken({
      address: CONTRACTS.TOKENBANK.address,
      abi: CONTRACTS.TOKENBANK.abi,
      functionName: 'withdraw',
      args: [parseEther(withdrawAmount)]
    })
  }

  // 监听交易成功，刷新数据
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance()
      alert('授权成功!')
    }
  }, [isApproveSuccess, refetchAllowance])

  useEffect(() => {
    if (isDepositSuccess) {
      refetchTokenBalance()
      refetchBankDeposit()
      alert('存款成功!')
    }
  }, [isDepositSuccess, refetchTokenBalance, refetchBankDeposit])

  useEffect(() => {
    if (isWithdrawSuccess) {
      refetchTokenBalance()
      refetchBankDeposit()
      alert('提款成功!')
    }
  }, [isWithdrawSuccess, refetchTokenBalance, refetchBankDeposit])

  // 防止hydration错误
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 处理连接钱包
  const handleConnectClick = (connector) => {
    connect({ connector })
    setIsModalOpen(false)
  }

  // 检查是否在正确的链上
  const isCorrectChain = chainId === sepolia.id
  const handleSwitchToSepolia = () => {
    switchChain({ chainId: sepolia.id })
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Wagmi使用教学演示</h1>

      {/* 链检查警告 */}
      {isConnected && !isCorrectChain && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#fee2e2',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>⚠️ 网络错误</h2>
          <p style={{ marginBottom: '15px', fontSize: '16px' }}>
            当前连接的是 <strong>{chainId === 1 ? '以太坊主网' : `链 ID: ${chainId}`}</strong>
          </p>
          <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
            本演示需要在 <strong>Sepolia 测试网</strong> 上运行，请切换网络
          </p>
          <button
            onClick={handleSwitchToSepolia}
            disabled={isSwitchingChain}
            style={{
              ...buttonStyle,
              backgroundColor: '#ef4444',
              fontSize: '16px',
              padding: '12px 24px'
            }}
          >
            {isSwitchingChain ? '切换中...' : '切换到 Sepolia 测试网'}
          </button>
        </div>
      )}

      {/* Wagmi核心Hooks演示区域 */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Wagmi核心Hooks演示</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {/* 1. useAccount */}
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
            <h3>1. useAccount()</h3>
            <p><strong>连接状态:</strong> {isConnected ? '✅ 已连接' : '❌ 未连接'}</p>
            <p><strong>地址:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}</p>
            <p><strong>连接中:</strong> {isConnecting ? '是' : '否'}</p>
            <p><strong>已断开:</strong> {isDisconnected ? '是' : '否'}</p>
            <p><strong>连接器:</strong> {connector?.name || 'N/A'}</p>
          </div>

          {/* 2. useBalance & useReadContract */}
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
            <h3>2. useBalance() & useReadContract()</h3>
            <p><strong>ETH余额:</strong> {ethBalance ? formatEther(ethBalance.value) : '0'} ETH</p>
            <p><strong>Token余额:</strong> {tokenBalance ? formatEther(tokenBalance) : '0'} 枚 W3FET</p>
            <button
              onClick={() => {
                refetchEthBalance()
                refetchTokenBalance()
              }}
              style={{ ...smallButtonStyle, marginTop: '10px' }}
            >
              刷新余额
            </button>
          </div>

          {/* 3. useChainId */}
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
            <h3>3. useChainId()</h3>
            <p><strong>链ID:</strong> {chainId}</p>
            <p><strong>网络:</strong> {chainId === 11155111 ? '✅ Sepolia Testnet' : chainId === 1 ? '❌ 以太坊主网' : '❌ 未知网络'}</p>
            {!isCorrectChain && isConnected && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                ⚠️ 请切换到 Sepolia
              </p>
            )}
          </div>

          {/* 4. useBlockNumber */}
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
            <h3>4. useBlockNumber()</h3>
            <p><strong>当前区块:</strong> {blockNumber?.toString() || 'N/A'}</p>
            <p><small>(实时更新)</small></p>
          </div>

          {/* 5. useConnect */}
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
            <h3>5. useConnect()</h3>
            <p><strong>可用连接器:</strong> {isMounted ? connectors.length : '...'}</p>

            {!isConnected ? (
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={isConnectPending}
                  style={buttonStyle}
                >
                  连接钱包
                </button>
              </div>
            ) : (
              <p style={{ color: '#10b981', marginTop: '10px' }}>
                ✅ 已通过 {connector?.name} 连接
              </p>
            )}

            {connectError && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                错误: {connectError.message}
              </p>
            )}
          </div>

          {/* 6. useDisconnect */}
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
            <h3>6. useDisconnect()</h3>
            <button
              onClick={() => disconnect()}
              disabled={!isConnected}
              style={{
                ...buttonStyle,
                backgroundColor: isConnected ? '#ef4444' : '#ccc',
                cursor: isConnected ? 'pointer' : 'not-allowed'
              }}
            >
              {isConnected ? '断开连接' : '未连接'}
            </button>
            {isConnected && (
              <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
                点击按钮断开与 {connector?.name} 的连接
              </p>
            )}
          </div>
        </div>
      </div>

      {/* TokenBank操作区域 */}
      {isConnected && (
        <>
          {/* useReadContract 演示 */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
            <h2>7. useReadContract() - 读取TokenBank数据</h2>

            {!isCorrectChain && (
              <div style={{
                padding: '10px 15px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '5px',
                marginBottom: '15px',
                fontSize: '14px',
                color: '#856404'
              }}>
                ⚠️ 当前网络不正确，显示的数据可能不准确。请切换到 Sepolia 测试网。
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
                <h4>我的存款</h4>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#0070f3' }}>
                  {bankDeposit ? formatEther(bankDeposit) : '0'} W3FET
                </p>
              </div>

              <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
                <h4>总存款量</h4>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                  {totalDeposits ? formatEther(totalDeposits) : '0'} W3FET
                </p>
              </div>

              <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
                <h4>授权额度</h4>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {allowance ? formatEther(allowance) : '0'} W3FET
                </p>
              </div>
            </div>

            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '5px' }}>
              <p><strong>Token地址:</strong> {tokenAddress || 'N/A'}</p>
            </div>
          </div>

          {/* useWriteContract 演示 */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
            <h2>8-10. useWriteContract() - 写合约操作</h2>

            {!isCorrectChain && (
              <div style={{
                padding: '10px 15px',
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '5px',
                marginBottom: '15px',
                fontSize: '14px',
                color: '#dc2626'
              }}>
                ⚠️ 当前网络不正确，无法执行写操作。请切换到 Sepolia 测试网。
              </div>
            )}

            {/* Approve */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
              <h3>① Approve Token (授权)</h3>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                使用 useWriteContract Hook 调用 ERC20 的 approve 函数
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(e.target.value)}
                  placeholder="授权金额"
                  style={inputStyle}
                  disabled={!isCorrectChain}
                />
                <button
                  onClick={handleApprove}
                  disabled={!isCorrectChain || isApprovePending || isApproveLoading}
                  style={{
                    ...buttonStyle,
                    backgroundColor: !isCorrectChain ? '#ccc' : buttonStyle.backgroundColor,
                    cursor: !isCorrectChain ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isApprovePending || isApproveLoading ? '处理中...' : 'Approve'}
                </button>
              </div>
              {approveHash && (
                <p style={{ marginTop: '10px', fontSize: '12px' }}>
                  交易哈希: {approveHash}
                </p>
              )}
            </div>

            {/* Deposit */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
              <h3>② Deposit (存款)</h3>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                使用 useWriteContract Hook 调用 TokenBank 的 deposit 函数
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="存款金额"
                  style={inputStyle}
                  disabled={!isCorrectChain}
                />
                <button
                  onClick={handleDeposit}
                  disabled={!isCorrectChain || isDepositPending || isDepositLoading}
                  style={{
                    ...buttonStyle,
                    backgroundColor: !isCorrectChain ? '#ccc' : '#10b981',
                    cursor: !isCorrectChain ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isDepositPending || isDepositLoading ? '处理中...' : 'Deposit'}
                </button>
              </div>
              {depositHash && (
                <p style={{ marginTop: '10px', fontSize: '12px' }}>
                  交易哈希: {depositHash}
                </p>
              )}
            </div>

            {/* Withdraw */}
            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
              <h3>③ Withdraw (提款)</h3>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                使用 useWriteContract Hook 调用 TokenBank 的 withdraw 函数
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="提款金额"
                  style={inputStyle}
                  disabled={!isCorrectChain}
                />
                <button
                  onClick={handleWithdraw}
                  disabled={!isCorrectChain || isWithdrawPending || isWithdrawLoading}
                  style={{
                    ...buttonStyle,
                    backgroundColor: !isCorrectChain ? '#ccc' : '#ef4444',
                    cursor: !isCorrectChain ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isWithdrawPending || isWithdrawLoading ? '处理中...' : 'Withdraw'}
                </button>
              </div>
              {withdrawHash && (
                <p style={{ marginTop: '10px', fontSize: '12px' }}>
                  交易哈希: {withdrawHash}
                </p>
              )}
            </div>
          </div>

          {/* useWaitForTransactionReceipt 说明 */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
            <h2>11. useWaitForTransactionReceipt()</h2>
            <p style={{ marginBottom: '10px' }}>
              该 Hook 用于等待交易确认，监听交易状态变化。
            </p>
            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
              <p><strong>Approve 交易:</strong> {isApproveLoading ? '⏳ 确认中...' : isApproveSuccess ? '✅ 已确认' : '⚪ 待发起'}</p>
              <p><strong>Deposit 交易:</strong> {isDepositLoading ? '⏳ 确认中...' : isDepositSuccess ? '✅ 已确认' : '⚪ 待发起'}</p>
              <p><strong>Withdraw 交易:</strong> {isWithdrawLoading ? '⏳ 确认中...' : isWithdrawSuccess ? '✅ 已确认' : '⚪ 待发起'}</p>
            </div>
          </div>
        </>
      )}

      {!isConnected && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px'
        }}>
          <h2>请连接钱包</h2>
          <p style={{ fontSize: '16px', marginBottom: '20px', color: '#666' }}>
            请点击按钮连接钱包以使用TokenBank功能
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isConnectPending}
            style={buttonStyle}
          >
            连接钱包
          </button>
        </div>
      )}

      {/* 钱包连接弹窗 */}
      {isMounted && isModalOpen && (
        <div style={modalOverlayStyle} onClick={() => setIsModalOpen(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>选择钱包</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={closeButtonStyle}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => handleConnectClick(connector)}
                  disabled={isConnectPending}
                  style={walletButtonStyle}
                >
                  <span>{connector.name}</span>
                  {isConnectPending && <span style={{ fontSize: '12px', color: '#666' }}>连接中...</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 返回按钮 */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
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
  padding: '10px 20px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
}

const smallButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
}

const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd',
  fontSize: '14px',
  width: '200px',
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
}

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '12px',
  minWidth: '400px',
  maxWidth: '500px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#666',
  padding: '0',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const walletButtonStyle = {
  padding: '15px 20px',
  backgroundColor: 'white',
  color: '#333',
  border: '1px solid #ddd',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: '500',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: '#f5f5f5',
    borderColor: '#0070f3',
  }
}