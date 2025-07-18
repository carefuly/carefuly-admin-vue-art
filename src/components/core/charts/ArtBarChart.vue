<script setup lang="ts">
import {useChartOps, useChart} from '@/composables/useChart'
import {getCssVar} from '@/utils/ui'
import {EChartsOption} from 'echarts'
import * as echarts from 'echarts'

const {
  chartRef,
  isDark,
  initChart,
  getAxisLineStyle,
  getAxisLabelStyle,
  getAxisTickStyle,
  getSplitLineStyle
} = useChart()

interface Props {
  data?: number[]
  xAxisData?: string[]
  color?: string
  height?: string
  barWidth?: string | number
  showAxisLabel?: boolean
  showAxisLine?: boolean
  showSplitLine?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [0, 0, 0, 0, 0, 0, 0],
  xAxisData: () => [],
  color: '',
  height: useChartOps().chartHeight,
  barWidth: '40%',
  showAxisLabel: true,
  showAxisLine: true,
  showSplitLine: true
})

const options: () => EChartsOption = () => {
  const computedColor =
    props.color ||
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: getCssVar('--el-color-primary-light-4')
      },
      {
        offset: 1,
        color: getCssVar('--el-color-primary')
      }
    ])

  return {
    grid: {
      top: 15,
      right: 0,
      bottom: 0,
      left: 0,
      containLabel: true
    },
    tooltip: {
      trigger: 'item'
    },
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      axisTick: getAxisTickStyle(),
      axisLine: getAxisLineStyle(props.showAxisLine),
      axisLabel: getAxisLabelStyle(props.showAxisLabel)
    },
    yAxis: {
      axisLabel: getAxisLabelStyle(props.showAxisLabel),
      axisLine: getAxisLineStyle(props.showAxisLine),
      splitLine: getSplitLineStyle(props.showSplitLine)
    },
    series: [
      {
        data: props.data,
        type: 'bar',
        itemStyle: {
          borderRadius: 4,
          color: computedColor
        },
        barWidth: props.barWidth
      }
    ]
  }
}

watch(isDark, () => {
  initChart(options())
})

onMounted(() => {
  initChart(options())
})
</script>

<template>
  <div ref="chartRef" class="bar-chart" :style="{ height: props.height }"></div>
</template>
