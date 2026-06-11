<template>
  <div class="map-card">
    <h3>位置</h3>
    <div ref="mapContainer" class="map-container"></div>
    <div class="map-actions">
      <el-button type="primary" size="small" @click="openInAmap">
        <el-icon><Location /></el-icon> 在高德地图中打开
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { Location } from '@element-plus/icons-vue'

const props = defineProps({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  name: { type: String, default: '' },
  address: { type: String, default: '' }
})

const mapContainer = ref(null)
let map = null

onMounted(async () => {
  try {
    const AMap = await AMapLoader.load({
      key: import.meta.env.VITE_AMAP_KEY,
      version: '2.0',
      plugins: ['AMap.Marker']
    })

    await nextTick()

    map = new AMap.Map(mapContainer.value, {
      zoom: 15,
      center: [props.longitude, props.latitude],
      viewMode: '2D'
    })

    const marker = new AMap.Marker({
      position: [props.longitude, props.latitude],
      title: props.name,
      content: `<div style="background:#409eff;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;">${props.name}</div>`
    })
    map.add(marker)
  } catch (e) {
    console.error('地图加载失败:', e)
  }
})

onUnmounted(() => {
  if (map) map.destroy()
})

function openInAmap() {
  const url = `https://uri.amap.com/marker?position=${props.longitude},${props.latitude}&name=${encodeURIComponent(props.name)}&src=wuhu_travel`
  window.open(url, '_blank')
}
</script>

<style scoped>
.map-card { background:#fff; border-radius:12px; padding:20px; box-shadow:0 2px 12px rgba(0,0,0,.08); }
.map-card h3 { margin:0 0 16px; color:#303133; }
.map-container { width:100%; height:300px; border-radius:8px; }
.map-actions { margin-top:12px; text-align:center; }
</style>
