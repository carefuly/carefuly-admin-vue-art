<script lang="ts" setup>
import {useI18n} from 'vue-i18n'
import {useChart} from '@/composables/useChart'
import {EChartsOption} from 'echarts'

const {t} = useI18n()

const {chartRef, isDark, initChart} = useChart()

// 模拟数据
const chartData = [
  {volume: 800, services: 400},
  {volume: 1000, services: 600},
  {volume: 750, services: 300},
  {volume: 600, services: 250},
  {volume: 450, services: 200},
  {volume: 500, services: 300}
]

const options: () => EChartsOption = () => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: [
      t('analysis.volumeServiceLevel.legend.volume'),
      t('analysis.volumeServiceLevel.legend.services')
    ],
    bottom: 20,
    itemWidth: 10,
    itemHeight: 10,
    icon: 'circle',
    textStyle: {
      fontSize: 12,
      color: isDark.value ? '#808290' : '#222B45'
    }
  },
  grid: {
    left: '20',
    right: '20',
    bottom: '60',
    top: '30',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: chartData.map((_, index) => `${index + 1}`),
    axisLine: {
      show: true,
      lineStyle: {
        color: isDark.value ? 'rgba(255, 255, 255, 0.1)' : '#EFF1F3',
        width: 0.8
      }
    },
    axisTick: {show: false},
    axisLabel: {show: false}
  },
  yAxis: {
    type: 'value',
    axisLine: {show: false},
    axisTick: {show: false},
    splitLine: {show: false},
    axisLabel: {show: false}
  },
  series: [
    {
      name: t('analysis.volumeServiceLevel.legend.volume'),
      type: 'bar',
      stack: 'total',
      data: chartData.map((item) => item.volume),
      itemStyle: {
        color: '#0095FF',
        borderRadius: [0, 0, 4, 4]
      },
      barWidth: '15'
    },
    {
      name: t('analysis.volumeServiceLevel.legend.services'),
      type: 'bar',
      stack: 'total',
      data: chartData.map((item) => item.services),
      itemStyle: {
        color: '#95E0FB',
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '50%'
    }
  ]
})

watch(isDark, () => {
  initChart(options())
})

onMounted(() => {
  initChart(options())
})
</script>

<template>
  <div class="custom-card art-custom-card volume-service-level">
    <div class="custom-card-header">
      <span class="title">{{ t('analysis.volumeServiceLevel.title') }}</span>
    </div>
    <div class="custom-card-body">
      <div ref="chartRef" class="chart-container"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.volume-service-level {
  height: 330px;

  .custom-card-body {
    padding: 20px;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
