<template>
  <div class="stats-page">
    <NavBar />

    <div class="stats-page__content">
      <div class="stats-page__header">
        <h1>📊 芜湖旅游数据看板</h1>
        <p>实时掌握平台内容分布与热度</p>
      </div>

      <!-- KPI Cards -->
      <div v-if="!loading" class="stats-page__kpi">
        <div class="kpi-card">
          <el-icon class="kpi-card__icon" :size="28"><Location /></el-icon>
          <div>
            <div class="kpi-card__value">{{ overview.totalDestinations }}<small> 个</small></div>
            <div class="kpi-card__label">推荐总数</div>
          </div>
        </div>
        <div class="kpi-card">
          <el-icon class="kpi-card__icon" :size="28"><Star /></el-icon>
          <div>
            <div class="kpi-card__value">{{ overview.avgRating }}<small> ⭐</small></div>
            <div class="kpi-card__label">平均评分</div>
          </div>
        </div>
        <div class="kpi-card">
          <el-icon class="kpi-card__icon" :size="28"><Grid /></el-icon>
          <div>
            <div class="kpi-card__value">{{ overview.totalCategories }}<small> 类</small></div>
            <div class="kpi-card__label">分类数量</div>
          </div>
        </div>
        <div class="kpi-card">
          <el-icon class="kpi-card__icon" :size="28"><ChatDotRound /></el-icon>
          <div>
            <div class="kpi-card__value">{{ todayAiCount }}<small> 次</small></div>
            <div class="kpi-card__label">今日 AI 对话</div>
          </div>
        </div>
      </div>

      <el-skeleton v-else :rows="2" animated />

      <!-- Charts Row 1 -->
      <div v-if="!loading" class="stats-page__charts-top">
        <div class="chart-card">
          <h3>景点分类分布</h3>
          <CategoryPieChart :data="categoryDistribution" />
        </div>
        <div class="chart-card">
          <h3>评分 Top 10 排行</h3>
          <RatingBarChart :data="topRatedDestinations" />
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div v-if="!loading" class="chart-card chart-card--full">
        <h3>AI 功能使用趋势（过去 7 天）</h3>
        <AiTrendChart />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import CategoryPieChart from '@/components/charts/CategoryPieChart.vue'
import RatingBarChart from '@/components/charts/RatingBarChart.vue'
import AiTrendChart from '@/components/charts/AiTrendChart.vue'
import { getStats } from '@/api/stats'
import { todayAiCount } from '@/mock/aiStats'
import { Location } from '@element-plus/icons-vue'

const loading = ref(true)
const overview = ref({})
const categoryDistribution = ref([])
const topRatedDestinations = ref([])

onMounted(async () => {
  try {
    const res = await getStats()
    overview.value = res.data.overview
    categoryDistribution.value = res.data.categoryDistribution
    topRatedDestinations.value = res.data.topRatedDestinations
  } catch (e) {
    console.error('Failed to load stats:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stats-page__content {
  max-width: 1200px;
  margin: 80px auto 0;
  padding: 40px 5vw 80px;
}

.stats-page__header {
  margin-bottom: 32px;
}

.stats-page__header h1 {
  font-size: var(--text-h1);
  font-weight: 700;
  color: var(--color-ink);
}

.stats-page__header p {
  font-size: var(--text-caption);
  color: var(--color-ink-muted);
  margin-top: 4px;
}

/* KPI */
.stats-page__kpi {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 16px;
}

.kpi-card__icon {
  color: var(--color-primary);
  background: rgba(21, 120, 120, 0.08);
  padding: 12px;
  border-radius: var(--radius-md);
}

.kpi-card__value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-ink);
  line-height: 1.2;
}

.kpi-card__value small {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--color-ink-muted);
}

.kpi-card__label {
  font-size: var(--text-caption);
  color: var(--color-ink-muted);
}

/* Charts */
.stats-page__charts-top {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 16px;
  margin-bottom: 24px;
}

.chart-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid var(--color-border);
}

.chart-card h3 {
  font-size: var(--text-h3);
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--color-ink);
}

.chart-card--full {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .stats-page__kpi {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-page__charts-top {
    grid-template-columns: 1fr;
  }
}
</style>
