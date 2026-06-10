<template>
  <el-button
    :type="isFavorited ? 'danger' : 'default'"
    :icon="isFavorited ? StarFilled : Star"
    @click="toggleFavorite"
    :loading="loading"
  >
    {{ isFavorited ? '已收藏' : '收藏' }}
  </el-button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { addFavorite, removeFavorite, checkFavorite } from '@/api/favorites'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'

const props = defineProps({
  destinationId: { type: [Number, String], required: true }
})

const userStore = useUserStore()
const router = useRouter()
const isFavorited = ref(false)
const loading = ref(false)

onMounted(async () => {
  if (userStore.isLoggedIn && props.destinationId) {
    try {
      const res = await checkFavorite(props.destinationId)
      isFavorited.value = res.favorited
    } catch {
      // 静默失败，保持默认未收藏状态
    }
  }
})

async function toggleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再收藏')
    router.push({ path: '/login', query: { redirect: window.location.pathname } })
    return
  }
  loading.value = true
  try {
    if (isFavorited.value) {
      await removeFavorite(props.destinationId)
      isFavorited.value = false
      ElMessage.success('已取消收藏')
    } else {
      await addFavorite(props.destinationId)
      isFavorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch (e) {
    const status = e.response?.status
    if (status === 409) {
      isFavorited.value = true
    } else if (status === 404) {
      isFavorited.value = false
    } else {
      ElMessage.error(e.response?.data?.message || '操作失败')
    }
  } finally {
    loading.value = false
  }
}
</script>
