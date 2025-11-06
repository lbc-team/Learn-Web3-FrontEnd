import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    service: 'web3-dapp-api',
    version: '1.0.0'
  })
}
