<template>
  <nav class="navbar" :class="{ 'navbar--solid': isSolid }">
    <div class="navbar__inner">
      <router-link to="/" class="navbar__logo">
        <img src="@/assets/images/logo.svg" alt="芜湖旅游" class="navbar__logo-icon" />
        <span class="navbar__logo-text">芜湖旅游</span>
      </router-link>

      <div class="navbar__links">
        <router-link to="/" class="navbar__link" active-class="navbar__link--active">首页</router-link>
        <router-link to="/list" class="navbar__link" active-class="navbar__link--active">探索</router-link>
        <router-link to="/stats" class="navbar__link" active-class="navbar__link--active">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据看板</span>
        </router-link>
      </div>

      <div class="navbar__user">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                {{ userStore.userInfo?.nickname?.charAt(0) }}
              </el-avatar>
              <span class="nickname">{{ userStore.userInfo?.nickname }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="router.push('/login')">登录</el-button>
          <el-button @click="router.push('/register')">注册</el-button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { DataAnalysis } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isSolid = ref(false)

const handleScroll = () => {
  isSolid.value = window.scrollY > 60 || route.path !== '/'
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  z-index: 100;
  transition: background 0.3s, box-shadow 0.3s;
  background: linear-gradient(to bottom, rgba(0,0,0,0.45), transparent);
}

.navbar--solid {
  background: var(--color-surface);
  box-shadow: var(--shadow-nav);
}

.navbar__inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5vw;
}

.navbar__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-h3);
  font-weight: 700;
  text-decoration: none;
}

.navbar:not(.navbar--solid) .navbar__logo {
  color: #fff;
}

.navbar--solid .navbar__logo {
  color: var(--color-primary);
}

.navbar__logo-icon {
  width: 32px;
  height: 32px;
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: 40px;
}

.navbar__link {
  font-size: var(--text-body);
  font-weight: 500;
  padding: 4px 0;
  position: relative;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.3s;
}

.navbar:not(.navbar--solid) .navbar__link {
  color: rgba(255,255,255,0.85);
}

.navbar--solid .navbar__link {
  color: var(--color-ink-secondary);
}

.navbar__link:hover,
.navbar__link--active {
  color: var(--color-primary) !important;
}

.navbar__link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.3s, left 0.3s;
}

.navbar__link:hover::after,
.navbar__link--active::after {
  width: 100%;
  left: 0;
}

.navbar__user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.nickname {
  font-size: 14px;
  font-weight: 500;
}

.navbar:not(.navbar--solid) .nickname {
  color: #fff;
}

.navbar--solid .nickname {
  color: var(--color-ink-secondary);
}
</style>
