/**
 * Utility functions for handling bigint and token amounts
 * All token amounts should use bigint to avoid precision loss
 */

/**
 * Parse a human-readable amount to bigint wei
 * @param {string|number} amount - Human readable amount (e.g., "1.5")
 * @param {number} decimals - Token decimals (default 18)
 * @returns {bigint} Amount in wei
 */
export function parseUnits(amount, decimals = 18) {
  if (!amount || amount === '' || amount === '0') return 0n

  const amountStr = amount.toString()
  const [whole, fraction = ''] = amountStr.split('.')

  // Pad or truncate fraction to match decimals
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)

  // Combine whole and fraction parts
  const combined = whole + paddedFraction

  return BigInt(combined)
}

/**
 * Format bigint wei amount to human-readable string
 * @param {bigint|string} value - Amount in wei
 * @param {number} decimals - Token decimals (default 18)
 * @param {number} displayDecimals - Number of decimals to display (default 4)
 * @returns {string} Human readable amount
 */
export function formatUnits(value, decimals = 18, displayDecimals = 4) {
  if (!value || value === 0n || value === '0') return '0'

  const valueStr = value.toString().padStart(decimals + 1, '0')
  const whole = valueStr.slice(0, -decimals) || '0'
  const fraction = valueStr.slice(-decimals)

  // Trim trailing zeros from fraction
  const trimmedFraction = fraction.replace(/0+$/, '')

  if (!trimmedFraction) return whole

  // Limit display decimals
  const displayFraction = trimmedFraction.slice(0, displayDecimals)

  return `${whole}.${displayFraction}`
}

/**
 * Format token amount with symbol
 * @param {bigint|string} value - Amount in wei
 * @param {number} decimals - Token decimals
 * @param {string} symbol - Token symbol
 * @returns {string} Formatted amount with symbol
 */
export function formatTokenAmount(value, decimals = 18, symbol = '') {
  const formatted = formatUnits(value, decimals)
  return symbol ? `${formatted} ${symbol}` : formatted
}

/**
 * Format USD value
 * @param {number|string} value - USD amount
 * @returns {string} Formatted USD amount
 */
export function formatUSD(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`
  }

  return `$${num.toFixed(2)}`
}

/**
 * Calculate percentage
 * @param {bigint|string} part - Part value
 * @param {bigint|string} total - Total value
 * @returns {number} Percentage (0-100)
 */
export function calculatePercentage(part, total) {
  if (!total || total === 0n || total === '0') return 0

  const partBig = typeof part === 'bigint' ? part : BigInt(part)
  const totalBig = typeof total === 'bigint' ? total : BigInt(total)

  return Number((partBig * 10000n) / totalBig) / 100
}

/**
 * Add two bigint values safely
 * @param {bigint|string} a
 * @param {bigint|string} b
 * @returns {bigint}
 */
export function addBigInt(a, b) {
  const aBig = typeof a === 'bigint' ? a : BigInt(a || 0)
  const bBig = typeof b === 'bigint' ? b : BigInt(b || 0)
  return aBig + bBig
}

/**
 * Multiply bigint by a number (for calculations like price * amount)
 * @param {bigint|string} value
 * @param {number} multiplier
 * @returns {bigint}
 */
export function multiplyBigInt(value, multiplier) {
  const valueBig = typeof value === 'bigint' ? value : BigInt(value || 0)
  const multiplierBig = BigInt(Math.floor(multiplier * 10000))
  return (valueBig * multiplierBig) / 10000n
}
