/**
 * Format utility functions for display
 */

/**
 * Truncate address for display
 * @param {string} address - Ethereum address
 * @param {number} startChars - Characters to show at start
 * @param {number} endChars - Characters to show at end
 * @returns {string} Truncated address
 */
export function truncateAddress(address, startChars = 6, endChars = 4) {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Format timestamp to relative time
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Relative time string
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diff = timestamp - now

  const seconds = Math.floor(Math.abs(diff) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (diff > 0) {
    // Future
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`
    return `in ${seconds} second${seconds > 1 ? 's' : ''}`
  } else {
    // Past
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`
  }
}

/**
 * Format timestamp to date string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date
 */
export function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format number with commas
 * @param {number|string} value
 * @returns {string}
 */
export function formatNumber(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

/**
 * Format APR/APY percentage
 * @param {number} value - Percentage value
 * @returns {string}
 */
export function formatPercentage(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K%`
  }
  return `${value.toFixed(2)}%`
}

/**
 * Get transaction status color
 * @param {string} status - Transaction status
 * @returns {string} Tailwind color class
 */
export function getStatusColor(status) {
  switch (status) {
    case 'success':
    case 'completed':
    case 'active':
      return 'text-green-600'
    case 'pending':
    case 'processing':
      return 'text-yellow-600'
    case 'error':
    case 'failed':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Copy text to clipboard
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}
