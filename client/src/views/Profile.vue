<template>
  <div class="profile-page">
    <NavBar />

    <!-- 未登录提示 -->
    <div v-if="!userStore.isLoggedIn" class="profile-login-required">
      <div class="profile-login-required__card">
        <div class="profile-login-required__icon">🔐</div>
        <h2>请先登录</h2>
        <p>登录后即可查看个人中心、管理收藏和评论</p>
        <el-button type="primary" size="large" @click="goToLogin">
          立即登录
        </el-button>
      </div>
    </div>

    <!-- 已登录 - 正常内容 -->
    <template v-else>
    <!-- User Header -->
    <header class="profile-header">
      <div class="profile-header__pattern"></div>
      <div class="profile-header__content">
        <div class="profile-header__user">
          <div class="profile-header__avatar">
            <img v-if="userStore.userInfo?.avatar" :src="userStore.userInfo.avatar" alt="头像" />
            <span v-else class="profile-header__avatar-text">{{ userStore.userInfo?.nickname?.charAt(0) || '?' }}</span>
          </div>
          <div class="profile-header__info">
            <h1 class="profile-header__name">{{ userStore.userInfo?.nickname || '未登录' }}</h1>
            <p class="profile-header__bio">探索长江之魂，一步一风景。</p>
          </div>
        </div>
        <div class="profile-header__stats glass-panel">
          <div class="profile-header__stat">
            <span class="profile-header__stat-number">{{ userStats.favoritesCount }}</span>
            <span class="profile-header__stat-label">收藏</span>
          </div>
          <div class="profile-header__stat">
            <span class="profile-header__stat-number">{{ userStats.reviewsCount }}</span>
            <span class="profile-header__stat-label">评论</span>
          </div>
          <div class="profile-header__stat">
            <span class="profile-header__stat-number">{{ userStats.travelDays }}</span>
            <span class="profile-header__stat-label">旅行天数</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="profile-layout">
      <!-- Left Sidebar -->
      <aside class="profile-sidebar">
        <nav class="profile-nav">
          <button
            v-for="item in navItems"
            :key="item.key"
            class="profile-nav__item"
            :class="{ 'profile-nav__item--active': activeTab === item.key }"
            @click="activeTab = item.key"
          >
            <el-icon :size="20"><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <!-- AI History Card -->
        <div class="profile-ai-card">
          <div class="profile-ai-card__header">
            <h3>最近AI对话</h3>
            <el-icon class="profile-ai-card__icon"><Clock /></el-icon>
          </div>
          <div v-if="aiHistory.length > 0" class="profile-ai-card__list">
            <div
              v-for="item in aiHistory"
              :key="item.session_id"
              class="profile-ai-card__item"
            >
              <p class="profile-ai-card__text">{{ item.last_message }}</p>
              <span class="profile-ai-card__time">{{ formatTime(item.created_at) }}</span>
            </div>
          </div>
          <p v-else class="profile-ai-card__empty">暂无对话记录</p>
        </div>
      </aside>

      <!-- Right Content -->
      <section class="profile-content">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'info'" class="profile-info">
          <!-- 头像上传 -->
          <el-card class="profile-info__avatar-card">
            <template #header>头像设置</template>
            <div class="profile-info__avatar-wrapper">
              <el-avatar :size="120" :src="userStore.userInfo?.avatar" v-if="userStore.userInfo?.avatar">
                <img :src="userStore.userInfo?.avatar" />
              </el-avatar>
              <el-avatar :size="120" v-else>
                <span class="profile-info__avatar-text">{{ userStore.userInfo?.nickname?.charAt(0) || '?' }}</span>
              </el-avatar>
              <el-upload
                class="profile-info__avatar-upload"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-change="handleAvatarChange"
                :auto-upload="false"
                accept="image/*"
              >
                <el-button type="primary" size="small">更换头像</el-button>
              </el-upload>
              <p class="profile-info__avatar-tip">支持 JPG、PNG 格式，文件小于 2MB</p>
            </div>
          </el-card>

          <!-- 个人信息 -->
          <el-card>
            <template #header>个人信息</template>
            <el-form :model="profileForm" label-width="80px">
              <el-form-item label="用户名">
                <el-input :value="userStore.userInfo?.username" disabled />
              </el-form-item>
              <el-form-item label="昵称">
                <el-input v-model="profileForm.nickname" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleUpdateProfile">保存修改</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 密码修改 -->
          <el-card class="profile-info__password-card">
            <template #header>
              <div class="profile-info__password-header">
                <el-icon><Lock /></el-icon>
                <span>修改密码</span>
              </div>
            </template>
            <el-form :model="passwordForm" label-width="100px">
              <el-form-item label="当前密码">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码（至少6位）" />
              </el-form-item>
              <el-form-item label="确认新密码">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">修改密码</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- Favorites Tab -->
        <div v-if="activeTab === 'favorites'" class="profile-favorites">
          <div class="profile-content__header">
            <h2>我的收藏</h2>
            <div class="profile-content__toggle">
              <button
                class="profile-content__toggle-btn"
                :class="{ 'profile-content__toggle-btn--active': viewMode === 'grid' }"
                @click="viewMode = 'grid'"
              >
                <el-icon><Grid /></el-icon>
              </button>
              <button
                class="profile-content__toggle-btn"
                :class="{ 'profile-content__toggle-btn--active': viewMode === 'list' }"
                @click="viewMode = 'list'"
              >
                <el-icon><List /></el-icon>
              </button>
            </div>
          </div>
          <el-empty v-if="favorites.length === 0" description="暂无收藏" />
          <div v-else class="favorites-grid" :class="{ 'favorites-grid--list': viewMode === 'list' }">
            <div
              v-for="item in favorites"
              :key="item.id"
              class="favorite-card"
              @click="$router.push(`/detail/${item.destination_id}`)"
            >
              <div class="favorite-card__image">
                <img :src="item.image_url" :alt="item.name" @error="onImgError($event)" />
                <div class="favorite-card__heart">
                  <el-icon><StarFilled /></el-icon>
                </div>
              </div>
              <div class="favorite-card__body">
                <div class="favorite-card__meta">
                  <span class="favorite-card__tag" :style="{ background: getCategoryColor(item.category_name) + '20', color: getCategoryColor(item.category_name) }">{{ item.category_name }}</span>
                  <span class="favorite-card__rating">
                    <el-icon><Star /></el-icon>
                    {{ item.rating }}
                  </span>
                </div>
                <h4 class="favorite-card__name">{{ item.name }}</h4>
                <p class="favorite-card__address">{{ item.address }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Tab -->
        <div v-if="activeTab === 'reviews'" class="profile-reviews">
          <h2 class="profile-content__title">我的评论</h2>
          <el-empty v-if="myReviews.length === 0" description="暂无评论" />
          <div v-else class="review-list">
            <div
              v-for="review in myReviews"
              :key="review.id"
              class="review-item"
              @click="$router.push(`/detail/${review.destination_id}`)"
            >
              <div class="review-item__header">
                <img :src="review.image_url" :alt="review.destination_name" @error="onImgError($event)" />
                <div class="review-item__info">
                  <h4>{{ review.destination_name }}</h4>
                  <el-rate :model-value="review.rating" disabled size="small" />
                </div>
                <span class="review-item__time">{{ new Date(review.created_at).toLocaleDateString() }}</span>
              </div>
              <p class="review-item__content">{{ review.content }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <Footer />
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { updateProfile, getUserStats, changePassword } from '@/api/auth'
import { getFavorites } from '@/api/favorites'
import { getMyReviews } from '@/api/reviews'
import { getAiHistory } from '@/api/ai'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import { ElMessage } from 'element-plus'
import { User, Star, ChatDotRound, Clock, Grid, List, StarFilled, Lock } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const activeTab = ref('favorites')
const viewMode = ref('grid')
const favorites = ref([])
const myReviews = ref([])
const aiHistory = ref([])
const userStats = reactive({ favoritesCount: 0, reviewsCount: 0, travelDays: 0 })
const profileForm = reactive({ nickname: '' })
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const passwordLoading = ref(false)

const navItems = [
  { key: 'info', label: '我的资料', icon: User },
  { key: 'favorites', label: '我的收藏', icon: Star },
  { key: 'reviews', label: '我的评论', icon: ChatDotRound },
]

const categoryColors = {
  '风景': '#3D8B5F',
  '小吃': '#D97A38',
  '项目': '#157878',
  '打卡地': '#7B5EA7',
}

function getCategoryColor(name) {
  return categoryColors[name] || '#157878'
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

function onImgError(e) {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2280%22%3E%3Crect fill=%22%23157878%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22white%22 font-size=%2214%22 text-anchor=%22middle%22 dy=%22.35em%22%3E芜湖旅游%3C/text%3E%3C/svg%3E'
}

function goToLogin() {
  router.push({ path: '/login', query: { redirect: '/profile' } })
}

async function handleUpdateProfile() {
  try {
    await updateProfile({ nickname: profileForm.nickname })
    await userStore.fetchProfile()
    ElMessage.success('更新成功')
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

async function handleChangePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    ElMessage.error('新密码至少6位')
    return
  }
  passwordLoading.value = true
  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    })
    ElMessage.success('密码修改成功，请重新登录')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    userStore.logout()
    router.push('/login')
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

function handleAvatarSuccess(response) {
  ElMessage.success('头像更新成功')
}

function beforeAvatarUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

function handleAvatarChange(file) {
  const raw = file.raw
  if (!beforeAvatarUpload(raw)) return false

  const reader = new FileReader()
  reader.onload = async (e) => {
    const base64 = e.target.result
    try {
      await updateProfile({ avatar: base64 })
      await userStore.fetchProfile()
      ElMessage.success('头像更新成功')
    } catch (err) {
      ElMessage.error('头像更新失败')
    }
  }
  reader.readAsDataURL(raw)
  return false
}

onMounted(async () => {
  try {
    await userStore.fetchProfile()
    profileForm.nickname = userStore.userInfo?.nickname || ''

    const [statsRes, favoritesRes, reviewsRes, aiRes] = await Promise.all([
      getUserStats().catch(() => ({ favoritesCount: 0, reviewsCount: 0, travelDays: 0 })),
      getFavorites().catch(() => ({ list: [] })),
      getMyReviews().catch(() => ({ list: [] })),
      getAiHistory().catch(() => ({ sessions: [] })),
    ])

    Object.assign(userStats, statsRes)
    favorites.value = favoritesRes.list || []
    myReviews.value = reviewsRes.list || []
    aiHistory.value = aiRes.sessions || []
  } catch (e) {
    console.error('Failed to load profile:', e)
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #F6F8F8;
}

/* 未登录提示 */
.profile-login-required {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 80px 24px;
}

.profile-login-required__card {
  text-align: center;
  background: #fff;
  border-radius: 16px;
  padding: 60px 48px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  max-width: 420px;
  width: 100%;
}

.profile-login-required__icon {
  font-size: 56px;
  margin-bottom: 20px;
}

.profile-login-required__card h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1A2430;
  margin: 0 0 12px;
}

.profile-login-required__card p {
  font-size: 15px;
  color: #6e7979;
  margin: 0 0 32px;
  line-height: 1.6;
}

/* ===== User Header ===== */
.profile-header {
  background: #fff;
  border-radius: 0 0 16px 16px;
  overflow: hidden;
  margin-bottom: 24px;
}

.profile-header__pattern {
  height: 160px;
  background-color: #f8f9ff;
  background-image: radial-gradient(circle at 2px 2px, #dfe9fa 1px, transparent 0);
  background-size: 24px 24px;
  opacity: 0.4;
}

.profile-header__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-top: -48px;
  position: relative;
  z-index: 10;
}

.profile-header__user {
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-header__avatar {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  background: #fff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-header__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-header__avatar-text {
  font-size: 48px;
  font-weight: 700;
  color: #157878;
}

.profile-header__name {
  font-size: 36px;
  font-weight: 700;
  color: #1A2430;
  margin: 0 0 4px;
}

.profile-header__bio {
  font-size: 15px;
  color: #3e4948;
  margin: 0;
}

.profile-header__stats {
  display: flex;
  gap: 32px;
  padding: 16px 24px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.profile-header__stat {
  text-align: center;
}

.profile-header__stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #157878;
}

.profile-header__stat-label {
  font-size: 13px;
  color: #3e4948;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===== Main Layout ===== */
.profile-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

/* ===== Sidebar ===== */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-nav {
  background: #fff;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #DFE3E633;
}

.profile-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #3e4948;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.profile-nav__item:hover {
  background: #e5efff;
  color: #157878;
}

.profile-nav__item--active {
  background: #157878;
  color: #fff;
  box-shadow: 0 2px 8px rgba(21,120,120,0.3);
}

.profile-nav__item--active:hover {
  background: #157878;
}

/* AI History Card */
.profile-ai-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #DFE3E633;
}

.profile-ai-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.profile-ai-card__header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1A2430;
  margin: 0;
}

.profile-ai-card__icon {
  color: #157878;
  font-size: 20px;
}

.profile-ai-card__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-ai-card__item {
  padding: 12px;
  background: #F6F8F8;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-ai-card__item:hover {
  border-color: #157878;
}

.profile-ai-card__text {
  font-size: 13px;
  font-weight: 500;
  color: #3e4948;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-ai-card__time {
  font-size: 12px;
  color: #6e7979;
  margin-top: 4px;
  display: block;
}

.profile-ai-card__empty {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* ===== Content ===== */
.profile-content__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.profile-content__title {
  font-size: 24px;
  font-weight: 600;
  color: #1A2430;
  margin: 0 0 24px;
}

.profile-content__toggle {
  display: flex;
  gap: 8px;
}

.profile-content__toggle-btn {
  padding: 8px;
  border: 1px solid #DFE3E6;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #3e4948;
}

.profile-content__toggle-btn:hover {
  background: #e5efff;
}

.profile-content__toggle-btn--active {
  background: #157878;
  color: #fff;
  border-color: #157878;
}

/* ===== Favorites Grid ===== */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.favorites-grid--list {
  grid-template-columns: 1fr;
}

.favorite-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #DFE3E64D;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-6px);
}

.favorite-card__image {
  position: relative;
  height: 192px;
  overflow: hidden;
}

.favorite-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.favorite-card:hover .favorite-card__image img {
  transform: scale(1.05);
}

.favorite-card__heart {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e74c3c;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.favorite-card__body {
  padding: 16px;
}

.favorite-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.favorite-card__tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.favorite-card__rating {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: #D97A38;
}

.favorite-card__rating .el-icon {
  color: #D97A38;
}

.favorite-card__name {
  font-size: 18px;
  font-weight: 600;
  color: #1A2430;
  margin: 0 0 4px;
}

.favorite-card__address {
  font-size: 14px;
  color: #6e7979;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== Reviews ===== */
.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #DFE3E64D;
  cursor: pointer;
  transition: all 0.2s;
}

.review-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.review-item__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.review-item__header img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.review-item__info {
  flex: 1;
}

.review-item__info h4 {
  margin: 0 0 4px;
  color: #303133;
  font-size: 15px;
}

.review-item__time {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.review-item__content {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

/* ===== Profile Info ===== */
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-info__avatar-card {
  margin-bottom: 0;
}

.profile-info__avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}

.profile-info__avatar-text {
  font-size: 48px;
  font-weight: 700;
  color: #157878;
}

.profile-info__avatar-upload {
  display: flex;
  justify-content: center;
}

.profile-info__avatar-tip {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.profile-info__password-card {
  margin-bottom: 0;
}

.profile-info__password-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-header__content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-layout {
    grid-template-columns: 1fr;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }
}
</style>
