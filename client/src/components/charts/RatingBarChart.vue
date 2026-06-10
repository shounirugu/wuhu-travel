<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
})

const CATEGORY_COLORS = {
  '风景': '#4A90D9',
  '项目': '#52B788',
  '小吃': '#F5A623',
  '打卡地': '#8B5CF6',
}

const option = computed(() => {
  const items = [...props.data].reverse()
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => `${params[0].name}<br/>评分：${params[0].value} ⭐`,
    },
    grid: { left: '22%', right: '10%', top: '5%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 4.0,
      max: 5.0,
      axisLabel: { formatter: (v) => v.toFixed(1) },
      splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } },
    },
    yAxis: {
      type: 'category',
      data: items.map(d => d.name),
      axisLabel: { fontSize: 12, color: '#1F2937' },
    },
    series: [{
      type: 'bar',
      barMaxWidth: 24,
      label: {
        show: true,
        position: 'right',
        formatter: '{c}',
        color: '#6B7280',
        fontSize: 12,
      },
      data: items.map(d => ({
        value: Number(d.rating),
        itemStyle: {
          color: CATEGORY_COLORS[d.categoryName] || '#4A90D9',
          borderRadius: [0, 4, 4, 0],
        },
      })),
    }],
  }
})
</script>

<style scoped>
.chart {
  height: 360px;
}
</style>
