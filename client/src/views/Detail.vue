<template>
  <div class="detail-page">
    <NavBar />

    <!-- ===== Hero Section with Parallax ===== -->
    <div class="detail__hero" ref="heroRef">
      <div class="detail__hero-image" ref="heroImgRef">
        <img :src="detail.image_url" :alt="detail.name" @error="onImgError" />
        <div class="detail__hero-gradient"></div>
      </div>

      <!-- Back Button -->
      <div class="detail__back">
        <button @click="$router.back()" class="detail__back-btn">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </button>
      </div>

      <!-- Hero Info -->
      <div class="detail__hero-info">
        <div class="detail__hero-info-inner">
          <span class="detail__tag">{{ detail.category_name }}</span>
          <h1 class="detail__title">{{ detail.name }}</h1>
          <div class="detail__meta">
            <span class="detail__rating">
              <el-icon><StarFilled /></el-icon>
              {{ detail.rating }}
            </span>
            <span class="detail__address">
              <el-icon><Location /></el-icon>
              {{ detail.address }}
            </span>
          </div>
        </div>
        <div class="detail__hero-actions">
          <FavoriteButton v-if="detail.id" :destination-id="detail.id" />
        </div>
      </div>
    </div>

    <!-- ===== Content Section ===== -->
    <section class="detail__content">
      <div class="detail__grid">
        <!-- Left: Description -->
        <div class="detail__main">
          <div class="detail__card">
            <div class="detail__hui-line"></div>
            <h2 class="detail__section-title">{{ detail.name }}介绍</h2>
            <div class="detail__desc-text">
              <p>{{ detail.description }}</p>
            </div>
          </div>
        </div>

        <!-- Right: Sidebar -->
        <aside class="detail__sidebar">
          <!-- Tips Card -->
          <div class="detail__tips-card">
            <div class="detail__tips-icon-bg">
              <el-icon :size="80"><Sunny /></el-icon>
            </div>
            <h3 class="detail__tips-title">
              <el-icon><Sunny /></el-icon>
              游玩小贴士
            </h3>
            <ul class="detail__tips-list">
              <li v-for="(tip, i) in tipsList" :key="i" class="detail__tip-item">
                <span class="detail__tip-dot"></span>
                <span class="detail__tip-text">{{ tip }}</span>
              </li>
            </ul>
          </div>

          <!-- Map Card -->
          <MapCard
            v-if="detail.latitude && detail.longitude"
            :latitude="Number(detail.latitude)"
            :longitude="Number(detail.longitude)"
            :name="detail.name"
            :address="detail.address"
          />
        </aside>
      </div>
    </section>

    <!-- ===== Gallery Section ===== -->
    <section class="detail__gallery">
      <h2 class="detail__gallery-title">精选图集</h2>
      <div class="detail__gallery-grid">
        <div v-for="(img, i) in galleryImages" :key="i" class="detail__gallery-item">
          <img :src="img" :alt="`${detail.name} ${i + 1}`" @error="onGalleryImgError($event)" />
        </div>
      </div>
    </section>

    <!-- ===== Reviews Section ===== -->
    <section class="detail__reviews">
      <h2 class="detail__reviews-title">用户评论 ({{ reviews.length }})</h2>
      
      <!-- Review Form -->
      <div class="detail__review-form" v-if="userStore.isLoggedIn">
        <h3>发表评论</h3>
        <div class="detail__review-rating">
          <span>评分：</span>
          <el-rate v-model="reviewForm.rating" :min="1" :max="5" show-score />
        </div>
        <el-input
          v-model="reviewForm.content"
          type="textarea"
          :rows="3"
          placeholder="分享你的游玩体验..."
          maxlength="500"
          show-word-limit
        />
        <el-button type="primary" :loading="reviewLoading" @click="submitReview" style="margin-top:12px">
          提交评论
        </el-button>
      </div>
      <div v-else class="detail__review-login">
        <p>登录后即可发表评论</p>
        <el-button type="primary" @click="$router.push('/login')">去登录</el-button>
      </div>

      <!-- Review List -->
      <div class="detail__review-list">
        <div v-for="review in reviews" :key="review.id" class="detail__review-item">
          <div class="detail__review-header">
            <el-avatar :size="36">{{ review.nickname?.charAt(0) }}</el-avatar>
            <div class="detail__review-user">
              <span class="detail__review-name">{{ review.nickname }}</span>
              <span class="detail__review-time">{{ new Date(review.created_at).toLocaleDateString() }}</span>
            </div>
            <el-rate :model-value="Number(review.rating)" disabled size="small" />
          </div>
          <p class="detail__review-content">{{ review.content }}</p>
        </div>
        <el-empty v-if="reviews.length === 0" description="暂无评论，来发表第一条评论吧！" />
      </div>
    </section>

    <!-- ===== Footer ===== -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import MapCard from '@/components/MapCard.vue'
import { getDestinationById } from '@/api/destinations'
import { getReviews, addReview } from '@/api/reviews'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { ArrowLeft, StarFilled, Location, Sunny } from '@element-plus/icons-vue'

const route = useRoute()
const detail = ref({})
const heroRef = ref(null)
const heroImgRef = ref(null)
const userStore = useUserStore()
const reviews = ref([])
const reviewForm = reactive({ rating: 5, content: '' })
const reviewLoading = ref(false)

const tipsList = computed(() => {
  if (!detail.value.tips) return []
  return detail.value.tips.split('；').filter(Boolean)
})

const DEFAULT_IMG = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22580%22%3E%3Crect fill=%22%23157878%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22white%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.35em%22%3E%E8%8A%9C%E6%B9%96%E6%97%85%E6%B8%B8%3C/text%3E%3C/svg%3E'

function onImgError(e) {
  e.target.src = DEFAULT_IMG
}

function onGalleryImgError(e) {
  e.target.src = DEFAULT_IMG
}

async function loadReviews() {
  try {
    const res = await getReviews(route.params.id)
    reviews.value = res.list || []
  } catch (e) {
    console.error('Failed to load reviews:', e)
  }
}

async function submitReview() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再评论')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (!reviewForm.content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  reviewLoading.value = true
  try {
    await addReview(route.params.id, reviewForm)
    ElMessage.success('评论成功')
    reviewForm.content = ''
    reviewForm.rating = 5
    loadReviews()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '评论失败')
  } finally {
    reviewLoading.value = false
  }
}

const galleryImages = computed(() => {
  const gallery = detail.value.gallery_images
  if (gallery && Array.isArray(gallery) && gallery.length > 0) {
    return gallery
  }
  // 如果没有图集，返回主图作为兜底
  const base = detail.value.image_url
  if (!base) return []
  return [base]
})

function handleScroll() {
  if (!heroImgRef.value) return
  const scrolled = window.pageYOffset
  heroImgRef.value.style.transform = `translateY(${scrolled * 0.4}px) scale(1.05)`
}

onMounted(async () => {
  try {
    const res = await getDestinationById(route.params.id)
    detail.value = res.data
  } catch (e) {
    console.error('Failed to load detail:', e)
  }
  loadReviews()
  window.addEventListener('scroll', handleScroll)
})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    try {
      const res = await getDestinationById(newId)
      detail.value = res.data
    } catch (e) {
      console.error('Failed to load detail:', e)
    }
    loadReviews()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* ===== Hero ===== */
.detail__hero {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.detail__hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.7s ease;
}

.detail__hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail__hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent 40%, rgba(0,0,0,0.6));
}

/* Back Button */
.detail__back {
  position: absolute;
  top: 80px;
  left: 24px;
  z-index: 10;
}

.detail__back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.detail__back-btn:hover {
  background: rgba(255,255,255,0.3);
}

.detail__back-btn .el-icon {
  transition: transform 0.2s;
}

.detail__back-btn:hover .el-icon {
  transform: translateX(-3px);
}

/* Hero Info */
.detail__hero-info {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1200px;
  padding: 0 24px;
  z-index: 2;
}

.detail__hero-info-inner {
  max-width: 1200px;
}

.detail__tag {
  display: inline-block;
  padding: 4px 14px;
  background: #3D8B5F;
  color: #fff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.detail__title {
  font-size: 56px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  line-height: 1.2;
}

.detail__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(255,255,255,0.9);
  font-size: 18px;
}

.detail__rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.detail__rating .el-icon {
  color: #FFD43B;
}

.detail__address {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  opacity: 0.8;
}

/* ===== Content Section ===== */
.detail__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px;
}

.detail__grid {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: 48px;
}

/* Main Description */
.detail__main {
  min-width: 0;
}

.detail__card {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  border: 1px solid #DFE3E6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.detail__hui-line {
  height: 2px;
  width: 60px;
  background: linear-gradient(90deg, #157878, transparent);
  margin-bottom: 12px;
}

.detail__section-title {
  font-size: 36px;
  font-weight: 700;
  color: #1A2430;
  margin-bottom: 24px;
  line-height: 1.3;
}

.detail__desc-text p {
  font-size: 16px;
  line-height: 1.8;
  color: #556270;
  margin-bottom: 16px;
}

/* Sidebar */
.detail__sidebar {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Tips Card */
.detail__tips-card {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid rgba(21,120,120,0.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  position: relative;
  overflow: hidden;
}

.detail__tips-icon-bg {
  position: absolute;
  top: 0;
  right: 0;
  padding: 16px;
  opacity: 0.08;
  transform: rotate(12deg);
}

.detail__tips-icon-bg .el-icon {
  color: #157878;
}

.detail__tips-title {
  font-size: 24px;
  font-weight: 600;
  color: #157878;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail__tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail__tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail__tip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #157878;
  margin-top: 10px;
  flex-shrink: 0;
}

.detail__tip-text {
  font-size: 15px;
  line-height: 1.6;
  color: #556270;
}

/* Map Card */
.detail__map-card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #DFE3E6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.detail__map-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A2430;
  margin-bottom: 16px;
}

.detail__map-placeholder {
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #E8ECF0, #F0F2F4);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.detail__map-placeholder:hover {
  background: linear-gradient(135deg, #DFE3E6, #E8ECF0);
}

.detail__map-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255,255,255,0.9);
  border-radius: 9999px;
  color: #157878;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.detail__map-icon {
  font-size: 18px;
}

.detail__map-address {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 14px;
  color: #556270;
}

.detail__map-address .el-icon {
  color: #157878;
}

/* ===== Gallery ===== */
.detail__gallery {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.detail__gallery-title {
  font-size: 24px;
  font-weight: 600;
  color: #1A2430;
  margin-bottom: 32px;
}

.detail__gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.detail__gallery-item {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: box-shadow 0.3s;
}

.detail__gallery-item:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.detail__gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.detail__gallery-item:hover img {
  transform: scale(1.1);
}

/* Hero Actions */
.detail__hero-actions {
  margin-top: 16px;
}

/* ===== Reviews ===== */
.detail__reviews {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.detail__reviews-title {
  font-size: 24px;
  font-weight: 600;
  color: #1A2430;
  margin-bottom: 32px;
}

.detail__review-form {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #DFE3E6;
  margin-bottom: 32px;
}

.detail__review-form h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #1A2430;
}

.detail__review-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #556270;
}

.detail__review-login {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid #DFE3E6;
  margin-bottom: 32px;
  text-align: center;
}

.detail__review-login p {
  color: #909399;
  margin-bottom: 16px;
}

.detail__review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail__review-item {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #DFE3E6;
}

.detail__review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.detail__review-user {
  flex: 1;
}

.detail__review-name {
  font-weight: 600;
  color: #1A2430;
  display: block;
}

.detail__review-time {
  font-size: 12px;
  color: #909399;
}

.detail__review-content {
  font-size: 14px;
  line-height: 1.6;
  color: #556270;
  margin: 0;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .detail__grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .detail__title {
    font-size: 40px;
  }

  .detail__gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail__footer-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .detail__footer-links {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .detail__hero {
    height: 300px;
  }

  .detail__back {
    top: 64px;
    left: 16px;
  }

  .detail__back-btn span {
    display: none;
  }

  .detail__title {
    font-size: 28px;
  }

  .detail__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .detail__content {
    padding: 40px 16px;
  }

  .detail__card {
    padding: 24px;
  }

  .detail__section-title {
    font-size: 24px;
  }

  .detail__gallery {
    padding: 0 16px 40px;
  }

  .detail__gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}
</style>
