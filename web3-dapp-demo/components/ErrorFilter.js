'use client'

import { useEffect } from 'react'

/**
 * ErrorFilter Component
 *
 * Filters out noisy WalletConnect console errors that don't affect functionality
 */
export default function ErrorFilter() {
  useEffect(() => {
    // 保存原始的 console.error
    const originalError = console.error

    // 重写 console.error 来过滤特定错误
    console.error = (...args) => {
      // 策略1: 过滤空对象或无意义的错误
      if (args.length === 0) return

      if (args.length === 1) {
        const firstArg = args[0]
        // 空对象 {}
        if (typeof firstArg === 'object' && firstArg !== null && Object.keys(firstArg).length === 0) {
          return
        }
        // 空字符串
        if (typeof firstArg === 'string' && firstArg.trim() === '') {
          return
        }
      }

      // 策略2: 检查调用栈（如果有 Error 对象）
      const hasError = args.find(arg => arg instanceof Error)
      if (hasError && hasError.stack) {
        const stack = hasError.stack.toLowerCase()
        if (
          stack.includes('walletconnect') ||
          stack.includes('pino') ||
          stack.includes('logger')
        ) {
          return
        }
      }

      // 策略3: 检查当前调用栈
      try {
        const stack = new Error().stack || ''
        const stackLower = stack.toLowerCase()
        if (
          stackLower.includes('walletconnect') ||
          stackLower.includes('pino') ||
          stackLower.includes('logger')
        ) {
          return
        }
      } catch (e) {
        // 如果无法获取调用栈，继续
      }

      // 策略4: 转换为字符串检查内容
      try {
        const errorString = args.map(arg => {
          if (typeof arg === 'string') return arg
          if (typeof arg === 'object' && arg !== null) {
            try {
              return JSON.stringify(arg)
            } catch {
              return String(arg)
            }
          }
          return String(arg)
        }).join(' ').toLowerCase()

        // 过滤 WalletConnect 相关的关键词
        const shouldFilter =
          errorString.includes('walletconnect') ||
          errorString.includes('restore') ||
          errorString.includes('pino') ||
          errorString.includes('logger') ||
          errorString === '{}' ||
          errorString === ''

        if (shouldFilter) return
      } catch (e) {
        // 如果字符串转换失败，继续
      }

      // 如果以上都没有过滤掉，显示错误
      originalError(...args)
    }

    // 清理函数
    return () => {
      console.error = originalError
    }
  }, [])

  return null // 不渲染任何内容
}
