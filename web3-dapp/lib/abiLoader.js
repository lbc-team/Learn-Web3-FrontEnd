/**
 * ABI Loader - 动态加载合约 ABI
 * 从 public/abis/ 目录加载编译后的 ABI JSON 文件
 */

const ABI_CACHE = {}

/**
 * 加载合约 ABI
 * @param {string} contractName - 合约名称（不含 .sol.json 后缀）
 * @returns {Promise<Object>} - 合约 ABI 对象
 */
export async function loadABI(contractName) {
  if (ABI_CACHE[contractName]) {
    return ABI_CACHE[contractName]
  }

  try {
    // Foundry 输出的文件名格式：ContractName.sol/ContractName.json
    const abiPath = `/abis/${contractName}.sol/${contractName}.json`
    const response = await fetch(abiPath)

    if (!response.ok) {
      console.warn(`ABI not found for ${contractName}, trying direct path...`)
      // 尝试直接路径
      const directResponse = await fetch(`/abis/${contractName}.json`)
      if (!directResponse.ok) {
        throw new Error(`Failed to load ABI for ${contractName}`)
      }
      const data = await directResponse.json()
      ABI_CACHE[contractName] = data.abi || data
      return ABI_CACHE[contractName]
    }

    const data = await response.json()
    ABI_CACHE[contractName] = data.abi || data
    return ABI_CACHE[contractName]
  } catch (error) {
    console.error(`Error loading ABI for ${contractName}:`, error)
    // 返回空 ABI 以防止应用崩溃
    return []
  }
}

/**
 * 批量加载多个合约 ABI
 * @param {string[]} contractNames - 合约名称数组
 * @returns {Promise<Object>} - 键值对对象 { contractName: abi }
 */
export async function loadABIs(contractNames) {
  const abis = {}
  await Promise.all(
    contractNames.map(async (name) => {
      abis[name] = await loadABI(name)
    })
  )
  return abis
}

/**
 * 清除 ABI 缓存
 */
export function clearABICache() {
  Object.keys(ABI_CACHE).forEach(key => delete ABI_CACHE[key])
}
