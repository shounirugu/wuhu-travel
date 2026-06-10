<template>
  <div class="list-page">
    <NavBar />

    <div class="list-page__content">
      <!-- Sidebar -->
      <aside class="list-page__sidebar">
        <h3>分类浏览</h3>
        <ul>
          <li v-for="cat in sidebarCategories" :key="cat.id">
            <button
              :class="{ active: activeCategoryId === cat.id }"
              @click="selectCategory(cat.id)"
            >
              {{ cat.label }}
              <span class="count">{{ cat.count }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <!-- Main -->
      <main class="list-page__main">
        <!-- Search -->
        <div class="list-page__search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索芜湖好玩的地方..."
            :prefix-icon="Search"
            clearable
            size="large"
            @input="onSearchInput"
          />
          <span class="list-page__result-count">
            找到 <strong>{{ total }}</strong> 个相关推荐
          </span>
        </div>

        <!-- Grid -->
        <div v-if="loading" class="list-page__grid">
          <div v-for="n in 6" :key="n" class="list-page__skeleton">
            <div class="skeleton-img"></div>
            <div class="skeleton-txt"></div>
          </div>
        </div>

        <div v-else-if="list.length === 0" class="list-page__empty">
          <el-icon :size="48"><Search /></el-icon>
          <p>暂无相关推荐，试试其他关键词</p>
        </div>

        <div v-else class="list-page__grid">
          <DestinationCard
            v-for="dest in list"
            :key="dest.id"
            :destination="dest"
            class="animate-in"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="list-page__pagination">
          <el-pagination
            v-model:current-page="page"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="fetchList"
          />
        </div>
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import NavBar from '@/components/NavBar.vue'
import DestinationCard from '@/components/DestinationCard.vue'
import Footer from '@/components/Footer.vue'
import { getDestinations } from '@/api/destinations'
import { getCategories } from '@/api/categories'

const route = useRoute()
const router = useRouter()

const categories = ref([])
const list = ref([])
const loading = ref(true)
const total = ref(0)
const totalPages = ref(0)
const page = ref(1)
const pageSize = ref(9)
const activeCategoryId = ref(null)
const searchQuery = ref('')

let searchTimer = null

const sidebarCategories = ref([
  { id: null, label: '全部', count: 20 },
])

onMounted(async () => {
  try {
    const catRes = await getCategories()
    categories.value = catRes.data
    sidebarCategories.value = [
      { id: null, label: '全部', count: 20 },
      ...catRes.data.map(c => ({ id: c.id, label: c.name, count: 5 })),
    ]
  } catch (e) {
    console.error('Failed to load categories:', e)
  }

  if (route.query.category_id) {
    activeCategoryId.value = Number(route.query.category_id)
  }
  if (route.query.q) {
    searchQuery.value = route.query.q
  }
  await fetchList()
})

watch(() => route.query, async (newQuery) => {
  if (newQuery.category_id) {
    activeCategoryId.value = Number(newQuery.category_id)
  } else {
    activeCategoryId.value = null
  }
  if (newQuery.q !== undefined) {
    searchQuery.value = newQuery.q || ''
  }
  page.value = 1
  await fetchList()
})

function selectCategory(catId) {
  router.push({ query: { category_id: catId || undefined } })
}

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    router.push({ query: { ...route.query, q: searchQuery.value || undefined } })
  }, 300)
}

async function fetchList() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (activeCategoryId.value) params.category_id = activeCategoryId.value
    if (searchQuery.value) params.q = searchQuery.value

    const res = await getDestinations(params)
    list.value = res.data.list
    total.value = res.data.total
    totalPages.value = res.data.totalPages
  } catch (e) {
    console.error('Failed to load destinations:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.list-page__content {
  max-width: 1200px;
  margin: 80px auto 0;
  padding: 40px 5vw;
  display: flex;
  gap: 32px;
}

.list-page__sidebar {
  width: 200px;
  flex-shrink: 0;
}

.list-page__sidebar h3 {
  font-size: var(--text-h3);
  font-weight: 700;
  margin-bottom: 16px;
  padding-left: 12px;
}

.list-page__sidebar ul {
  list-style: none;
}

.list-page__sidebar button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--color-ink-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.list-page__sidebar button:hover {
  background: var(--color-bg);
  color: var(--color-primary);
}

.list-page__sidebar button.active {
  background: var(--color-primary);
  color: #fff;
}

.list-page__sidebar .count {
  font-size: var(--text-xs);
  opacity: 0.8;
}

.list-page__main {
  flex: 1;
  min-width: 0;
}

.list-page__search {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding: 8px 20px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.list-page__search :deep(.el-input__wrapper) {
  box-shadow: none;
  background: transparent;
}

.list-page__result-count {
  font-size: var(--text-caption);
  color: var(--color-ink-secondary);
  white-space: nowrap;
}

.list-page__result-count strong {
  color: var(--color-primary);
}

.list-page__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  min-height: 200px;
}

.list-page__empty {
  text-align: center;
  padding: 80px 0;
  color: var(--color-ink-muted);
}

.list-page__empty p {
  margin-top: 16px;
  font-size: var(--text-body);
}

.list-page__pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* Skeleton */
.list-page__skeleton {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.skeleton-img {
  height: 200px;
  background: linear-gradient(90deg, #E8ECF0 25%, #F0F2F4 50%, #E8ECF0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-txt {
  height: 80px;
  margin: 16px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, #E8ECF0 25%, #F0F2F4 50%, #E8ECF0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 1024px) {
  .list-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .list-page__content {
    flex-direction: column;
  }

  .list-page__sidebar {
    width: 100%;
  }

  .list-page__sidebar ul {
    display: flex;
    gap: 8px;
    overflow-x: auto;
  }

  .list-page__sidebar button {
    white-space: nowrap;
    width: auto;
  }

  .list-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
