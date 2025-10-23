'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from '@/lib/wagmiClient'
import Navbar from '@/components/Navbar'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { useState } from 'react'

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
              </div>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
