<template>
  <div class="home">
    <NavBar />

    <!-- ===== Hero Section ===== -->
    <section class="hero">
      <div class="hero__left">
        <div class="hero__decor hero__decor--top"></div>
        <h1 class="hero__title">
          <span v-for="(char, i) in titleChars" :key="i" class="hero__char"
            :style="{ animationDelay: `${0.2 + i * 0.08}s` }">{{ char }}</span>
        </h1>
        <p class="hero__subtitle">江水穿城，徽韵千年</p>
        <div class="hero__features">
          <span>· {{ categories.length }} 大分类探索</span>
          <span>· 20 处精选推荐</span>
          <span>· AI 旅行助手随行</span>
        </div>
        <button class="hero__cta" @click="$router.push('/list')">
          开始探索
          <el-icon>
            <ArrowRight />
          </el-icon>
        </button>
        <div class="hero__decor hero__decor--bottom"></div>
      </div>
      <div class="hero__right">
        <el-carousel height="580px" :interval="5000" arrow="never">
          <el-carousel-item v-for="item in carouselItems" :key="item.name">
            <div class="hero__slide">
              <img :src="item.image" :alt="item.name" @error="onImgError($event)" />
              <div class="hero__slide-overlay">
                <span class="hero__slide-tag">{{ item.tag }}</span>
                <h3 class="hero__slide-name">{{ item.name }}</h3>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </section>

    <!-- ===== Category Section ===== -->
    <section class="categories">
      <div class="categories__header">
        <h2>探索多元芜湖</h2>
        <div class="categories__divider"></div>
      </div>
      <div class="categories__grid">
        <div v-for="(cat, i) in categories" :key="cat.id" class="cat-card"
          :class="[`cat-card--${catClass(cat.name)}`, `cat-card--${catSize(cat.name)}`]"
          :style="{ animationDelay: `${i * 0.12}s` }" @click="goToList(cat.id)">
          <div class="cat-card__bg" :style="categoryBgs[cat.id]
            ? { backgroundImage: `url(${categoryBgs[cat.id]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}"></div>
          <div class="cat-card__content">
            <el-icon class="cat-card__icon" :size="36">
              <component :is="cat.icon" />
            </el-icon>
            <h3 class="cat-card__name">{{ cat.name }}</h3>
            <p class="cat-card__count">5 个推荐</p>
            <p class="cat-card__desc">{{ catDesc(cat.name) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Featured Section ===== -->
    <section class="featured">
      <div class="featured__header">
        <div>
          <h2>热门推荐</h2>
          <div class="featured__divider"></div>
        </div>
        <router-link to="/list" class="featured__more">
          查看更多 <el-icon>
            <ArrowRight />
          </el-icon>
        </router-link>
      </div>

      <div v-if="loading" class="featured__grid">
        <div v-for="n in 6" :key="n" class="featured__skeleton">
          <div class="skeleton-image"></div>
          <div class="skeleton-text"></div>
        </div>
      </div>

      <div v-else class="featured__grid">
        <DestinationCard v-for="dest in featured" :key="dest.id" :destination="dest" class="animate-in" />
      </div>
    </section>

    <!-- ===== Footer ===== -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import NavBar from '@/components/NavBar.vue'
import DestinationCard from '@/components/DestinationCard.vue'
import Footer from '@/components/Footer.vue'
import { getCategories } from '@/api/categories'
import { getFeaturedDestinations, getDestinations } from '@/api/destinations'

const router = useRouter()
const categories = ref([])
const featured = ref([])
const loading = ref(true)
const allDestinations = ref([])

const titleText = '芜湖，\n半城山水半城诗'

const titleChars = computed(() => {
  return titleText.split('').map(c => c === '\n' ? '\n' : c)
})

const carouselItems = [
  { name: '镜湖风景区', image: '/images/jinghu-park.jpg', tag: 'Landmark 01' },
  { name: '鸠兹古镇', image: '/images/jiuzi-ancient.jpg', tag: 'Landmark 02' },
  { name: '滨江步道', image: '/images/binjiang-walkway.jpg', tag: 'Landmark 03' },
]

const DEFAULT_IMG = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22580%22%3E%3Crect fill=%22%23157878%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22white%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.35em%22%3E%E8%8A%9C%E6%B9%96%E6%97%85%E6%B8%B8%3C/text%3E%3C/svg%3E'

function onImgError(e) {
  e.target.src = DEFAULT_IMG
}

function catClass(name) {
  const map = { '风景': 'scenery', '项目': 'activity', '小吃': 'food', '打卡地': 'photo' }
  return map[name] || 'scenery'
}

function catSize(name) {
  const map = { '风景': 'col3', '项目': 'col4', '小吃': 'col4', '打卡地': 'col3' }
  return map[name] || 'normal'
}

function catDesc(name) {
  const map = {
    '风景': '山水如画，徽韵千年',
    '项目': '欢乐无限，精彩不断',
    '小吃': '舌尖上的芜湖',
    '打卡地': '随手一拍都是大片',
  }
  return map[name] || ''
}

const categoryBgs = computed(() => {
  const map = {}
  allDestinations.value.forEach(d => {
    if (!map[d.category_id]) {
      map[d.category_id] = d.image_url
    }
  })
  return map
})

function goToList(categoryId) {
  router.push({ path: '/list', query: { category_id: categoryId } })
}

onMounted(async () => {
  try {
    const [catRes, featRes, allRes] = await Promise.all([
      getCategories(),
      getFeaturedDestinations(),
      getDestinations({ pageSize: 100 }),
    ])
    categories.value = catRes.data
    featured.value = featRes.data
    allDestinations.value = allRes.data.list
  } finally {
    loading.value = false
  }
})
</script>

<script>
import { onMounted } from 'vue'
export default {
  mounted() {
    onMounted
  }
}
</script>

<style scoped>
/* ===== Hero ===== */
.hero {
  display: flex;
  height: 580px;
  max-width: 1200px;
  margin: 80px auto 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.hero__left {
  width: 40%;
  background: linear-gradient(135deg, #0E2D3B, #157878);
  padding: 64px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  color: #fff;
}

.hero__decor {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 6px;
  opacity: 0.3;
}

.hero__decor--top {
  top: 48px;
  left: 0;
}

.hero__decor--top::before,
.hero__decor--top::after {
  content: '';
  height: 1px;
  background: #fff;
}

.hero__decor--top::before {
  width: 64px;
  opacity: 0.3;
}

.hero__decor--top::after {
  width: 96px;
  opacity: 0.5;
}

.hero__decor--bottom {
  bottom: 48px;
  right: 0;
  align-items: flex-end;
}

.hero__decor--bottom::before,
.hero__decor--bottom::after {
  content: '';
  height: 1px;
  background: #fff;
}

.hero__decor--bottom::before {
  width: 48px;
  opacity: 0.3;
}

.hero__decor--bottom::after {
  width: 112px;
  opacity: 0.5;
}

.hero__title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 24px;
  white-space: pre-line;
}

.hero__char {
  display: inline-block;
  opacity: 0;
  animation: charIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes charIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero__subtitle {
  font-size: 1.125rem;
  opacity: 0.85;
  margin-bottom: 20px;
  animation: fadeInUp 0.5s 0.8s both;
}

.hero__features {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.875rem;
  opacity: 0.75;
  margin-bottom: 32px;
  animation: fadeInUp 0.5s 1s both;
}

.hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 14px 36px;
  background: linear-gradient(135deg, #157878, #0E6060);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  animation: ctaPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s both;
}

.hero__cta:hover {
  transform: scale(1.04);
  box-shadow: 0 4px 16px rgba(21, 120, 120, 0.4);
}

@keyframes ctaPop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero__right {
  width: 60%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.hero__slide {
  position: relative;
  height: 100%;
}

.hero__slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__slide-overlay {
  position: absolute;
  bottom: 40px;
  left: 40px;
  color: #fff;
}

.hero__slide-tag {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.8;
  display: block;
  margin-bottom: 4px;
}

.hero__slide-name {
  font-size: 1.25rem;
  font-weight: 700;
}

/* ===== Categories ===== */
.categories {
  width: 100%;
  max-width: 1200px;
  margin: 80px auto;
}

.categories__header {
  text-align: center;
  margin-bottom: 48px;
}

.categories__header h2 {
  font-size: var(--text-h1);
  font-weight: 700;
  color: var(--color-primary);
}

.categories__divider {
  width: 64px;
  height: 4px;
  background: var(--color-primary);
  margin: 16px auto 0;
  border-radius: 2px;
}

.categories__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: 240px 200px;
  gap: 24px;
}

.cat-card--col3 {
  grid-column: span 3;
}

.cat-card--col4 {
  grid-column: span 4;
}

.cat-card {
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.cat-card:hover {
  transform: translateY(-4px);
}

.cat-card__bg {
  position: absolute;
  inset: 0;
  opacity: 0.95;
  transition: filter 0.3s;
}

.cat-card:hover .cat-card__bg {
  filter: brightness(1.05);
}

.cat-card--scenery .cat-card__bg {
  background: var(--gradient-scenery);
}

.cat-card--activity .cat-card__bg {
  background: var(--gradient-activity);
}

.cat-card--food .cat-card__bg {
  background: var(--gradient-food);
}

.cat-card--photo .cat-card__bg {
  background: var(--gradient-photo);
}

.cat-card__content {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: #fff;
}

.cat-card__icon {
  opacity: 0.75;
  margin-bottom: 8px;
}

.cat-card__name {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.cat-card__count {
  font-size: 0.875rem;
  opacity: 0.85;
}

.cat-card__desc {
  font-size: 0.875rem;
  opacity: 0.7;
  margin-top: 4px;
}

/* ===== Featured ===== */
.featured {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 80px;
}

.featured__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.featured__header h2 {
  font-size: var(--text-h1);
  font-weight: 700;
  color: var(--color-ink);
}

.featured__divider {
  width: 48px;
  height: 3px;
  background: var(--color-primary);
  margin-top: 8px;
  border-radius: 1.5px;
}

.featured__more {
  color: var(--color-primary);
  font-weight: 600;
  font-size: var(--text-body);
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
}

.featured__more:hover {
  opacity: 0.8;
}

.featured__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.featured__skeleton {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.skeleton-image {
  height: 200px;
  background: linear-gradient(90deg, #E8ECF0 25%, #F0F2F4 50%, #E8ECF0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  height: 80px;
  margin: 16px;
  background: linear-gradient(90deg, #E8ECF0 25%, #F0F2F4 50%, #E8ECF0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .categories__grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  }

  .cat-card--col3,
  .cat-card--col4 {
    grid-column: span 1;
  }

  .featured__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    margin-top: 64px;
    border-radius: 0;
    max-width: 100%;
  }

  .hero__left {
    width: 100%;
    padding: 40px 24px;
  }

  .hero__right {
    width: 100%;
    height: 60vh;
  }

  .hero__slide-overlay {
    bottom: 20px;
    left: 20px;
  }

  .categories,
  .featured {
    padding: 0 5vw;
  }

  .categories__grid {
    grid-template-columns: 1fr;
  }

  .cat-card--col3,
  .cat-card--col4 {
    grid-column: span 1;
  }

  .featured__grid {
    grid-template-columns: 1fr;
  }
}
</style>
