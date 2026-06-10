<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { computed } from 'vue'
import { aiStatsData } from '@/mock/aiStats'

const LINE_COLORS = ['#4A90D9', '#52B788', '#F5A623']

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
  },
  legend: {
    data: ['智能问答', '路线规划', '个性化推荐'],
    top: 0,
    textStyle: { color: '#6B7280' },
  },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '40px', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: aiStatsData.dates,
    axisLine: { lineStyle: { color: '#E5E7EB' } },
    axisLabel: { color: '#6B7280' },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } },
    axisLabel: { color: '#6B7280' },
  },
  series: aiStatsData.series.map((s, i) => ({
    name: s.name,
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: { width: 2.5, color: LINE_COLORS[i] },
    itemStyle: { color: LINE_COLORS[i] },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: hexToRgba(LINE_COLORS[i], 0.3) },
          { offset: 1, color: hexToRgba(LINE_COLORS[i], 0.02) },
        ],
      },
    },
    data: s.data,
  })),
}))
</script>

<style scoped>
.chart {
  height: 320px;
}
</style>
