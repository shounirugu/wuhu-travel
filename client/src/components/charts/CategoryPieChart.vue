<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
})

const COLORS = ['#4A90D9', '#52B788', '#F5A623', '#8B5CF6']

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} 个 ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    textStyle: { color: '#1F2937', fontSize: 13 },
  },
  series: [{
    name: '景点分类',
    type: 'pie',
    radius: ['45%', '70%'],
    center: ['40%', '50%'],
    avoidLabelOverlap: false,
    label: { show: false },
    emphasis: {
      label: { show: true, fontSize: 16, fontWeight: 'bold' },
      itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
    },
    data: props.data.map((item, i) => ({
      name: item.categoryName,
      value: item.count,
      itemStyle: { color: COLORS[i] },
    })),
  }],
}))
</script>

<style scoped>
.chart {
  height: 320px;
}
</style>
