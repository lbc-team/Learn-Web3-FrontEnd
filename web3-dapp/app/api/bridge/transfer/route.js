/**
 * Bridge Transfer API
 *
 * 处理跨链桥接转账请求
 * POST /api/bridge/transfer
 *
 * 请求体:
 * {
 *   sourceChain: string,
 *   targetChain: string,
 *   token: string,
 *   amount: string,
 *   recipient: string
 * }
 *
 * 返回:
 * {
 *   success: boolean,
 *   transferId: string,
 *   status: 'queued' | 'inflight' | 'complete',
 *   estimatedTime: number,
 *   fee: string,
 *   source: 'chain' | 'mock'
 * }
 */

export async function POST(request) {
  try {
    const body = await request.json()
    const { sourceChain, targetChain, token, amount, recipient } = body

    // 验证参数
    if (!sourceChain || !targetChain || !token || !amount || !recipient) {
      return Response.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // TODO: 实际实现中应该调用链上合约或跨链桥服务
    // 这里返回模拟数据

    const transferId = `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 模拟费用计算（0.1% 手续费）
    const fee = (parseFloat(amount) * 0.001).toFixed(4)

    // 模拟预计时间（分钟）
    const estimatedTime = sourceChain === targetChain ? 1 :
                         (sourceChain === 'Ethereum' || targetChain === 'Ethereum') ? 15 : 5

    return Response.json({
      success: true,
      transferId,
      status: 'queued',
      estimatedTime,
      fee,
      sourceChain,
      targetChain,
      token,
      amount,
      recipient,
      timestamp: Date.now(),
      source: 'mock'
    })

  } catch (error) {
    console.error('Bridge transfer error:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Get Transfer Status
 * GET /api/bridge/transfer?transferId=xxx
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const transferId = searchParams.get('transferId')

  if (!transferId) {
    return Response.json(
      { success: false, error: '缺少 transferId 参数' },
      { status: 400 }
    )
  }

  // TODO: 实际实现中应该查询链上状态或数据库
  // 这里返回模拟的状态进度

  // 模拟状态转换：queued -> inflight -> complete
  const timestamp = parseInt(transferId.split('_')[1]) || Date.now()
  const elapsed = Date.now() - timestamp

  let status = 'queued'
  if (elapsed > 60000) {
    status = 'complete'
  } else if (elapsed > 10000) {
    status = 'inflight'
  }

  return Response.json({
    success: true,
    transferId,
    status,
    progress: Math.min(100, (elapsed / 60000) * 100),
    timestamp,
    source: 'mock'
  })
}
