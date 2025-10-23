#!/usr/bin/env node

/**
 * 自检脚本 - 验证 DeFi 教学项目配置
 *
 * 使用方法:
 *   node scripts/verify.js
 *
 * 检查项:
 * 1. Foundry 合约编译输出 (foundry-demo/out/*.json)
 * 2. ABI 文件导出 (web3-dapp/public/abis/*.json)
 * 3. 环境变量配置 (web3-dapp/.env.local)
 * 4. Next.js 开发服务器状态 (可选)
 */

const fs = require('fs')
const path = require('path')
const http = require('http')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan')
}

function section(title) {
  console.log()
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'gray')
  log(`  ${title}`, 'cyan')
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'gray')
}

// 项目根目录
const rootDir = path.resolve(__dirname, '..')
const foundryDir = path.join(rootDir, 'foundry-demo')
const web3Dir = path.join(rootDir, 'web3-dapp')

// 检查结果统计
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0
}

// 需要检查的合约 ABI
const requiredContracts = [
  'RewardToken.sol/RewardToken.json',
  'TokenA.sol/TokenA.json',
  'TokenB.sol/TokenB.json',
  'Swap.sol/Swap.json',
  'Farm.sol/Farm.json',
  'LaunchPad.sol/LaunchPad.json'
]

// 需要检查的环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_RPC_URL_SEPOLIA',
  'NEXT_PUBLIC_REWARD_TOKEN_ADDRESS',
  'NEXT_PUBLIC_TKA_ADDRESS',
  'NEXT_PUBLIC_TKB_ADDRESS',
  'NEXT_PUBLIC_SWAP_ADDRESS',
  'NEXT_PUBLIC_FARM_ADDRESS',
  'NEXT_PUBLIC_LAUNCHPAD_ADDRESS'
]

/**
 * 检查 1: Foundry 合约编译输出
 */
function checkFoundryBuild() {
  section('检查 1: Foundry 合约编译输出')

  const outDir = path.join(foundryDir, 'out')

  if (!fs.existsSync(outDir)) {
    error('foundry-demo/out 目录不存在')
    error('请先编译合约: cd foundry-demo && forge build')
    results.failed++
    return false
  }

  success('foundry-demo/out 目录存在')

  let allFound = true

  requiredContracts.forEach(contract => {
    results.total++
    const contractPath = path.join(outDir, contract)

    if (fs.existsSync(contractPath)) {
      success(`找到 ${contract}`)
      results.passed++
    } else {
      error(`缺失 ${contract}`)
      allFound = false
      results.failed++
    }
  })

  if (!allFound) {
    console.log()
    warning('修复建议:')
    info('cd foundry-demo && forge build')
  }

  return allFound
}

/**
 * 检查 2: ABI 文件导出
 */
function checkABIExport() {
  section('检查 2: ABI 文件导出到前端')

  const abisDir = path.join(web3Dir, 'public', 'abis')

  if (!fs.existsSync(abisDir)) {
    error('web3-dapp/public/abis 目录不存在')
    results.failed++
    console.log()
    warning('修复建议:')
    info('mkdir -p web3-dapp/public/abis')
    info('cd web3-dapp && npm run export-abis')
    return false
  }

  success('web3-dapp/public/abis 目录存在')

  const abiFiles = [
    'RewardToken.json',
    'TokenA.json',
    'TokenB.json',
    'Swap.json',
    'Farm.json',
    'LaunchPad.json'
  ]

  let allFound = true

  abiFiles.forEach(file => {
    results.total++
    const filePath = path.join(abisDir, file)

    if (fs.existsSync(filePath)) {
      // 验证 JSON 格式
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        const json = JSON.parse(content)

        if (json.abi && Array.isArray(json.abi)) {
          success(`${file} - 格式正确`)
          results.passed++
        } else {
          warning(`${file} - 格式异常 (缺少 abi 字段)`)
          results.warnings++
        }
      } catch (err) {
        error(`${file} - JSON 解析失败`)
        allFound = false
        results.failed++
      }
    } else {
      error(`缺失 ${file}`)
      allFound = false
      results.failed++
    }
  })

  if (!allFound) {
    console.log()
    warning('修复建议:')
    info('cd web3-dapp && npm run export-abis')
    info('或手动复制: cp foundry-demo/out/Contract.sol/Contract.json web3-dapp/public/abis/')
  }

  return allFound
}

/**
 * 检查 3: 环境变量配置
 */
function checkEnvConfig() {
  section('检查 3: 环境变量配置')

  const envPath = path.join(web3Dir, '.env.local')

  if (!fs.existsSync(envPath)) {
    error('.env.local 文件不存在')
    results.failed++
    console.log()
    warning('修复建议:')
    info('cp web3-dapp/.env.local.example web3-dapp/.env.local')
    info('然后编辑 .env.local 填入实际的环境变量值')
    return false
  }

  success('.env.local 文件存在')

  const envContent = fs.readFileSync(envPath, 'utf8')
  const missingVars = []
  const emptyVars = []

  requiredEnvVars.forEach(varName => {
    results.total++
    const regex = new RegExp(`^${varName}=(.*)$`, 'm')
    const match = envContent.match(regex)

    if (!match) {
      error(`缺失 ${varName}`)
      missingVars.push(varName)
      results.failed++
    } else {
      const value = match[1].trim()

      if (!value || value === 'your_' || value.includes('...') || value.includes('YOUR_')) {
        warning(`${varName} 未配置实际值`)
        emptyVars.push(varName)
        results.warnings++
      } else {
        success(`${varName} 已配置`)
        results.passed++
      }
    }
  })

  if (missingVars.length > 0 || emptyVars.length > 0) {
    console.log()
    warning('修复建议:')

    if (missingVars.length > 0) {
      info('在 .env.local 中添加以下变量:')
      missingVars.forEach(v => console.log(`  ${v}=`))
    }

    if (emptyVars.length > 0) {
      console.log()
      info('需要配置实际值的变量:')
      emptyVars.forEach(v => {
        if (v === 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID') {
          console.log(`  ${v} - 从 https://cloud.walletconnect.com 获取`)
        } else if (v.includes('RPC_URL')) {
          console.log(`  ${v} - 从 https://infura.io 或 https://alchemy.com 获取`)
        } else if (v.includes('ADDRESS')) {
          console.log(`  ${v} - 部署合约后填入合约地址`)
        } else {
          console.log(`  ${v}`)
        }
      })
    }

    return false
  }

  return true
}

/**
 * 检查 4: Next.js 开发服务器
 */
function checkDevServer() {
  section('检查 4: Next.js 开发服务器 (可选)')

  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET',
      timeout: 3000
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const json = JSON.parse(data)

          if (json.ok) {
            success('Next.js 开发服务器运行正常 (http://localhost:3000)')
            success(`服务版本: ${json.version || 'N/A'}`)
            results.passed++
          } else {
            warning('开发服务器响应异常')
            results.warnings++
          }
        } catch (err) {
          warning('开发服务器响应格式错误')
          results.warnings++
        }
        resolve(true)
      })
    })

    req.on('error', () => {
      warning('Next.js 开发服务器未运行')
      info('启动命令: cd web3-dapp && npm run dev')
      results.warnings++
      resolve(false)
    })

    req.on('timeout', () => {
      warning('开发服务器响应超时')
      results.warnings++
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

/**
 * 额外检查: package.json 和依赖
 */
function checkPackageJson() {
  section('额外检查: 项目依赖')

  const packagePath = path.join(web3Dir, 'package.json')

  if (!fs.existsSync(packagePath)) {
    error('package.json 不存在')
    return false
  }

  success('package.json 存在')

  const nodeModulesPath = path.join(web3Dir, 'node_modules')

  if (!fs.existsSync(nodeModulesPath)) {
    warning('node_modules 不存在，依赖未安装')
    console.log()
    info('修复建议: cd web3-dapp && npm install')
    return false
  }

  success('node_modules 存在，依赖已安装')

  // 检查关键依赖
  const criticalDeps = [
    'next',
    'react',
    'wagmi',
    'viem',
    '@rainbow-me/rainbowkit',
    'echarts'
  ]

  let allFound = true
  criticalDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep)
    if (fs.existsSync(depPath)) {
      success(`依赖 ${dep} 已安装`)
    } else {
      warning(`依赖 ${dep} 缺失`)
      allFound = false
    }
  })

  return allFound
}

/**
 * 生成修复建议
 */
function generateFixSuggestions() {
  section('📋 修复建议汇总')

  console.log()
  info('按顺序执行以下命令修复问题:')
  console.log()

  console.log('1️⃣  编译智能合约:')
  console.log('   cd foundry-demo && forge build')
  console.log()

  console.log('2️⃣  导出 ABI 文件:')
  console.log('   cd web3-dapp && npm run export-abis')
  console.log()

  console.log('3️⃣  配置环境变量:')
  console.log('   cp web3-dapp/.env.local.example web3-dapp/.env.local')
  console.log('   # 编辑 .env.local 填入实际值')
  console.log()

  console.log('4️⃣  安装前端依赖:')
  console.log('   cd web3-dapp && npm install')
  console.log()

  console.log('5️⃣  启动开发服务器:')
  console.log('   cd web3-dapp && npm run dev')
  console.log()

  console.log('6️⃣  访问应用:')
  console.log('   http://localhost:3000')
  console.log()
}

/**
 * 打印结果汇总
 */
function printSummary() {
  section('📊 检查结果汇总')

  console.log()
  console.log(`总检查项: ${results.total}`)
  log(`✅ 通过: ${results.passed}`, 'green')
  log(`❌ 失败: ${results.failed}`, 'red')
  log(`⚠️  警告: ${results.warnings}`, 'yellow')
  console.log()

  const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0

  if (results.failed === 0) {
    log(`🎉 恭喜！所有检查通过 (${passRate}%)`, 'green')
    console.log()
    info('你的项目已准备就绪，可以开始开发或部署到 Vercel！')
  } else {
    log(`⚠️  发现 ${results.failed} 个问题需要修复 (通过率: ${passRate}%)`, 'yellow')
    console.log()
    generateFixSuggestions()
  }
}

/**
 * 主函数
 */
async function main() {
  log(`
╔═══════════════════════════════════════════════╗
║   DeFi 教学项目 - 自检脚本                    ║
║   Web3 DApp Verification Tool                 ║
╚═══════════════════════════════════════════════╝
`, 'cyan')

  info(`项目根目录: ${rootDir}`)

  // 执行检查
  checkFoundryBuild()
  checkABIExport()
  checkEnvConfig()
  checkPackageJson()
  await checkDevServer()

  // 打印汇总
  printSummary()

  console.log()
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'gray')
  console.log()

  // 退出码
  process.exit(results.failed > 0 ? 1 : 0)
}

// 运行
main().catch(err => {
  console.error('脚本执行出错:', err)
  process.exit(1)
})
