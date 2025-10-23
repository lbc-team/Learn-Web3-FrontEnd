'use client'
import { useState, useEffect } from 'react'
import { useAccount, useBalance, useSendTransaction, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { parseEther, formatEther } from 'viem'
import { CONTRACTS } from '@/config/contracts'

export default function ConnectRpc() {
  const { address, isConnected } = useAccount()
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [status, setStatus] = useState('')

  // 获取余额
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
  })

  // 发送交易
  const { data: hash, sendTransaction } = useSendTransaction()

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // 读取合约
  // contactAddress： 0x431306040c181E768C4301a7bfD4fC6a770E833F
  const { data: contractNumber, refetch: refetchContractNumber } = useReadContract({
    address: CONTRACTS.COUNTER.address,
    abi: CONTRACTS.COUNTER.abi,
    functionName: 'number',
  })

  // 写合约
  const { data: writeHash, writeContract } = useWriteContract()

  // 等待写合约交易确认
  const { isLoading: isWriteConfirming, isSuccess: isWriteConfirmed } = useWaitForTransactionReceipt({
    hash: writeHash,
  })

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) {
      setStatus('请填写完整的转账信息')
      return
    }

    try {
      sendTransaction({
        to: transferTo,
        value: parseEther(transferAmount)
      })
      setStatus('转账交易已发送，等待确认...')
    } catch (error) {
      setStatus(`转账失败: ${error.message}`)
    }
  }

  const handleReadContract = async () => {
    try {
      await refetchContractNumber()
      setStatus('合约数据读取成功')
    } catch (error) {
      setStatus(`读取合约失败: ${error.message}`)
    }
  }

  const handleSetNumber = async () => {
    if (!newNumber) {
      setStatus('请输入新数值')
      return
    }

    try {
      writeContract({
        address: CONTRACTS.COUNTER.address,
        abi: CONTRACTS.COUNTER.abi,
        functionName: 'setNumber',
        args: [BigInt(newNumber)]
      })
      setStatus('setNumber交易已发送，等待确认...')
    } catch (error) {
      setStatus(`setNumber调用失败: ${error.message}`)
    }
  }

  const handleIncrement = async () => {
    try {
      writeContract({
        address: CONTRACTS.COUNTER.address,
        abi: CONTRACTS.COUNTER.abi,
        functionName: 'increment'
      })
      setStatus('increment交易已发送，等待确认...')
    } catch (error) {
      setStatus(`increment调用失败: ${error.message}`)
    }
  }

  // 监听交易确认状态
  useEffect(() => {
    if (isConfirmed && hash) {
      setStatus(`转账成功! 交易哈希: ${hash}`)
      refetchBalance()
    }
  }, [isConfirmed, hash, refetchBalance])

  useEffect(() => {
    if (isWriteConfirmed && writeHash) {
      setStatus(`合约调用成功! 交易哈希: ${writeHash}`)
      refetchContractNumber()
    }
  }, [isWriteConfirmed, writeHash, refetchContractNumber])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>Web3 RPC连接演示</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <ConnectButton />
      </div>

      {!isConnected ? (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <p>请先连接钱包以使用Web3功能</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px', width: '100%' }}>
            <h3>钱包信息</h3>
            <p>地址: {address}</p>
            <p>余额: {balance ? formatEther(balance.value) : '0'} ETH</p>
          </div>

          <div style={{ marginBottom: '20px', width: '100%' }}>
            <h3>1. 刷新余额</h3>
            <button onClick={() => refetchBalance()} style={{ 
              padding: '10px 20px', 
              backgroundColor: '#0070f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              刷新余额
            </button>
          </div>

          <div style={{ marginBottom: '20px', width: '100%' }}>
            <h3>2. 转账功能</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="接收地址"
                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
              />
              <input
                type="text"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="转账金额 (ETH)"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <button 
              onClick={handleTransfer} 
              disabled={isConfirming}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: isConfirming ? '#ccc' : '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: isConfirming ? 'not-allowed' : 'pointer'
              }}
            >
              {isConfirming ? '确认中...' : '发送转账'}
            </button>
          </div>

          <div style={{ marginBottom: '20px', width: '100%' }}>
            <h3>3. 读取合约数据</h3>
            <button onClick={handleReadContract} style={{ 
              padding: '10px 20px', 
              backgroundColor: '#8b5cf6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}>
              读取Counter合约的number值
            </button>
            {contractNumber !== undefined && (
              <p>合约number值: {contractNumber.toString()}</p>
            )}
          </div>

          <div style={{ marginBottom: '20px', width: '100%' }}>
            <h3>4. 写合约功能</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="number"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="新的number值"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <button 
                onClick={handleSetNumber} 
                disabled={isWriteConfirming}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: isWriteConfirming ? '#ccc' : '#f59e0b', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: isWriteConfirming ? 'not-allowed' : 'pointer',
                  marginRight: '10px'
                }}
              >
                {isWriteConfirming ? '确认中...' : '调用setNumber'}
              </button>
              <button 
                onClick={handleIncrement} 
                disabled={isWriteConfirming}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: isWriteConfirming ? '#ccc' : '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: isWriteConfirming ? 'not-allowed' : 'pointer'
                }}
              >
                {isWriteConfirming ? '确认中...' : '调用increment'}
              </button>
            </div>
          </div>

          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '8px',
            width: '100%'
          }}>
            <h4>操作状态:</h4>
            <p style={{ margin: 0, color: status.includes('成功') ? '#10b981' : '#ef4444' }}>
              {status || '等待操作...'}
            </p>
          </div>
        </>
      )}

      <div style={{ marginTop: '20px' }}>
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