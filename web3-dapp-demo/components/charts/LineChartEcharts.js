'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * LineChartEcharts 组件
 *
 * 通用的 ECharts 折线图组件，支持响应式和暗色模式
 *
 * @param {Object} props
 * @param {Array} props.series - 数据系列 [{name, data: [[ts, value], ...]}]
 * @param {string} props.xField - X 轴字段名（默认 'ts'）
 * @param {string} props.yField - Y 轴字段名（默认 'value'）
 * @param {number} props.height - 图表高度（默认 400）
 * @param {string} props.title - 图表标题
 * @param {string} props.yAxisFormatter - Y 轴格式化函数（如 '${value}', '{value}%'）
 * @param {boolean} props.areaStyle - 是否显示面积图（默认 true）
 * @param {boolean} props.darkMode - 暗色模式（默认 false）
 * @param {boolean} props.smooth - 是否平滑曲线（默认 true）
 * @param {Object} props.customOptions - 自定义 ECharts 配置
 */
export default function LineChartEcharts({
  series = [],
  xField = 'ts',
  yField = 'value',
  height = 400,
  title = '',
  yAxisFormatter = '{value}',
  areaStyle = true,
  darkMode = false,
  smooth = true,
  customOptions = {}
}) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [isClient, setIsClient] = useState(false)
  const [echarts, setEcharts] = useState(null)

  // 确保只在客户端渲染（SSR 阻断）
  useEffect(() => {
    setIsClient(true)

    // 动态导入 echarts（仅客户端）
    import('echarts').then(module => {
      setEcharts(module.default || module)
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [])

  // 初始化和更新图表
  useEffect(() => {
    if (!isClient || !echarts || !chartRef.current) return

    // 初始化图表实例
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, darkMode ? 'dark' : null)
    }

    // 处理数据转换
    const processedSeries = series.map((item, index) => {
      const colors = [
        'rgb(99, 102, 241)',   // Indigo
        'rgb(16, 185, 129)',   // Green
        'rgb(245, 158, 11)',   // Amber
        'rgb(239, 68, 68)',    // Red
        'rgb(168, 85, 247)',   // Purple
      ]

      return {
        name: item.name || `Series ${index + 1}`,
        type: 'line',
        data: item.data || [],
        smooth,
        lineStyle: {
          color: colors[index % colors.length],
          width: 2
        },
        itemStyle: {
          color: colors[index % colors.length]
        },
        areaStyle: areaStyle ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.3)')
              },
              {
                offset: 1,
                color: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.05)')
              }
            ]
          }
        } : undefined
      }
    })

    // ECharts 配置
    const option = {
      title: title ? {
        text: title,
        left: 'center',
        textStyle: {
          color: darkMode ? '#fff' : '#333',
          fontSize: 16,
          fontWeight: 'bold'
        }
      } : undefined,

      tooltip: {
        trigger: 'axis',
        backgroundColor: darkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: darkMode ? '#555' : '#ccc',
        textStyle: {
          color: darkMode ? '#fff' : '#333'
        },
        formatter: (params) => {
          if (!params || params.length === 0) return ''

          const date = new Date(params[0].data[0])
          let tooltip = `${date.toLocaleString()}<br/>`

          params.forEach(param => {
            const value = param.data[1]
            const formattedValue = typeof value === 'number'
              ? value.toLocaleString(undefined, { maximumFractionDigits: 4 })
              : value

            tooltip += `
              <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>
              ${param.seriesName}: <strong>${formattedValue}</strong><br/>
            `
          })

          return tooltip
        }
      },

      legend: series.length > 1 ? {
        data: series.map((item, index) => item.name || `Series ${index + 1}`),
        top: title ? 35 : 10,
        textStyle: {
          color: darkMode ? '#fff' : '#333'
        }
      } : undefined,

      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: series.length > 1 ? (title ? 65 : 40) : (title ? 45 : 20),
        containLabel: true
      },

      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: darkMode ? '#555' : '#ccc'
          }
        },
        axisLabel: {
          color: darkMode ? '#aaa' : '#666',
          formatter: (value) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: darkMode ? '#333' : '#f0f0f0'
          }
        }
      },

      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: darkMode ? '#aaa' : '#666',
          formatter: yAxisFormatter
        },
        splitLine: {
          lineStyle: {
            color: darkMode ? '#333' : '#f0f0f0'
          }
        }
      },

      series: processedSeries,

      // 合并自定义配置
      ...customOptions
    }

    chartInstance.current.setOption(option, true)

  }, [isClient, echarts, series, darkMode, title, yAxisFormatter, areaStyle, smooth, customOptions])

  // 响应式 resize（防抖）
  useEffect(() => {
    if (!chartInstance.current) return

    let resizeTimer = null

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)

      resizeTimer = setTimeout(() => {
        if (chartInstance.current) {
          chartInstance.current.resize()
        }
      }, 200) // 200ms 防抖
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimer) clearTimeout(resizeTimer)
    }
  }, [isClient, echarts])

  // SSR 时返回占位符
  if (!isClient) {
    return (
      <div
        style={{ height: `${height}px` }}
        className="flex items-center justify-center bg-gray-50 rounded-lg"
      >
        <div className="text-gray-400">Loading chart...</div>
      </div>
    )
  }

  return (
    <div
      ref={chartRef}
      style={{ height: `${height}px`, width: '100%' }}
    />
  )
}

/**
 * 数据转换工具函数
 */

/**
 * 将 API 返回的数据转换为 ECharts 格式
 * @param {Array} data - API 数据 [{ts, price}, ...]
 * @param {string} xField - X 轴字段名
 * @param {string} yField - Y 轴字段名
 * @returns {Array} - ECharts 格式 [[ts, value], ...]
 */
export function transformDataForEcharts(data, xField = 'ts', yField = 'value') {
  if (!Array.isArray(data)) return []

  return data.map(item => [
    item[xField],
    item[yField]
  ])
}

/**
 * 过滤指定天数的数据
 * @param {Array} data - 原始数据
 * @param {number} days - 天数
 * @returns {Array} - 过滤后的数据
 */
export function filterDataByDays(data, days) {
  if (!Array.isArray(data) || data.length === 0) return []

  const now = Date.now()
  const cutoffTime = now - (days * 24 * 60 * 60 * 1000)

  return data.filter(item => {
    const timestamp = Array.isArray(item) ? item[0] : item.ts
    return timestamp >= cutoffTime
  })
}

/**
 * 生成模拟数据（用于测试）
 * @param {number} days - 天数
 * @param {number} baseValue - 基准值
 * @param {number} variance - 变化幅度
 * @returns {Array} - 模拟数据
 */
export function generateMockData(days = 7, baseValue = 100, variance = 10) {
  const data = []
  const now = Date.now()
  const interval = (days * 24 * 60 * 60 * 1000) / 100 // 100 个数据点

  for (let i = 0; i < 100; i++) {
    const ts = now - ((99 - i) * interval)
    const randomChange = (Math.random() - 0.5) * variance
    const value = baseValue + randomChange + Math.sin(i * 0.2) * (variance / 2)

    data.push([ts, parseFloat(value.toFixed(4))])
  }

  return data
}
