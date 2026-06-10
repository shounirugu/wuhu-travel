<template>
  <div class="login-page">
    <main class="auth-container">
      <!-- 左侧 Hero 区域 -->
      <section class="hero-section">
        <img
          src="https://cdn.pixabay.com/photo/2020/03/03/08/39/sunset-4897949_1280.jpg"
          alt="芜湖日落"
          @error="$event.target.style.display='none'"
        />
        <div class="hero-overlay"></div>
        <!-- Hero 文案 -->
        <div class="hero-content">
          <div class="mb-8">
            <span class="hero-badge">发现安徽</span>
            <h1 class="hero-title">探索<br/>芜湖之美</h1>
            <p class="hero-subtitle">
              沉浸在长江的诗意魅力与徽派建筑的永恒优雅之中。
            </p>
          </div>
          <div class="hero-location">
            <span class="material-symbols-outlined">location_on</span>
            <span>芜湖市滨江公园</span>
          </div>
        </div>
      </section>

      <!-- 右侧表单区域 -->
      <section class="form-section">
        <!-- 品牌标识 -->
        <div class="brand-header">
          <div class="brand-logo">
            <img src="@/assets/images/logo.svg" alt="芜湖旅游" class="brand-icon" />
            <h2 class="brand-name">芜湖旅游</h2>
          </div>
          <p class="brand-subtitle">江城墨韵 · 尊享体验</p>
        </div>

        <!-- 表单容器 -->
        <div class="form-container">
          <!-- Tab 导航 -->
          <nav class="auth-tabs">
            <button
              class="auth-tab"
              :class="{ active: activeTab === 'login' }"
              @click="activeTab = 'login'"
            >
              登录
            </button>
            <button
              class="auth-tab"
              :class="{ active: activeTab === 'register' }"
              @click="goToRegister"
            >
              注册
            </button>
          </nav>

          <!-- 登录表单 -->
          <form v-if="activeTab === 'login'" class="auth-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label class="form-label">用户名或邮箱</label>
              <div class="form-input-wrapper">
                <span class="material-symbols-outlined form-input-icon">person</span>
                <input
                  v-model="loginForm.username"
                  type="text"
                  class="form-input"
                  placeholder="请输入您的账号"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">密码</label>
              <div class="form-input-wrapper">
                <span class="material-symbols-outlined form-input-icon">lock</span>
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  class="form-input-action"
                  @click="showPassword = !showPassword"
                >
                  <span class="material-symbols-outlined">
                    {{ showPassword ? 'visibility' : 'visibility_off' }}
                  </span>
                </button>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input v-model="rememberMe" type="checkbox" class="checkbox-input" />
                <span>记住我</span>
              </label>
              <a href="#" class="forgot-link">忘记密码？</a>
            </div>

            <button type="submit" class="btn-gradient" :loading="loading">
              登录
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>
        </div>

        <!-- 社交登录 -->
        <div class="social-login">
          <div class="social-divider">
            <span>或使用以下方式登录</span>
          </div>
          <div class="social-buttons">
            <button class="social-btn">
              <span class="material-symbols-outlined" style="color: #07C160;">chat</span>
              <span>微信</span>
            </button>
            <button class="social-btn">
              <span class="material-symbols-outlined" style="color: #12B7F5;">alternate_email</span>
              <span>QQ</span>
            </button>
          </div>
        </div>

        <!-- 页脚 -->
        <footer class="auth-footer">
          <p>© 2024 芜湖旅游平台. 探索长江之魂.</p>
          <div class="footer-links">
            <a href="#">隐私政策</a>
            <a href="#">服务条款</a>
          </div>
        </footer>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)

onMounted(() => {
  if (route.query.expired === '1') {
    ElMessage.warning('登录已过期，请重新登录')
  }
})
const activeTab = ref('login')
const showPassword = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

function goToRegister() {
  router.push('/register')
}

async function handleLogin() {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    await userStore.login(loginForm.username, loginForm.password)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    console.error('[Login] Error:', e)
    ElMessage.error(e.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F6F8F8;
  padding: 24px;
}

.auth-container {
  width: 100%;
  max-width: 1440px;
  min-height: 800px;
  display: flex;
  overflow: hidden;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

/* 左侧 Hero */
.hero-section {
  width: 60%;
  position: relative;
  background: linear-gradient(135deg, #1A2430 0%, #0F3443 30%, #34E89E 100%);
  overflow: hidden;
}

.hero-section img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
  transform: scale(1.05);
  transition: transform 10s ease-out;
}

.hero-section:hover img {
  transform: scale(1.1);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(26,36,48,0.8), transparent);
}

.hero-content {
  position: relative;
  z-index: 10;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  color: white;
}

.hero-badge {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 9999px;
  background: rgba(21,120,120,0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 16px;
  line-height: 1.7;
  opacity: 0.8;
  max-width: 400px;
}

.hero-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.6;
  margin-top: 32px;
}

/* 右侧表单 */
.form-section {
  width: 40%;
  padding: 64px;
  display: flex;
  flex-direction: column;
}

.brand-header {
  margin-bottom: 48px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: contain;
}

.brand-name {
  font-size: 24px;
  font-weight: 600;
  color: #157878;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: 14px;
  color: #3e4948;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

/* Tab 导航 */
.auth-tabs {
  display: flex;
  gap: 32px;
  border-bottom: 1px solid #DFE3E6;
  margin-bottom: 40px;
}

.auth-tab {
  padding-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #6e7979;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  cursor: pointer;
}

.auth-tab.active {
  color: #157878;
  border-bottom-color: #157878;
}

.auth-tab:hover:not(.active) {
  color: #3e4948;
}

/* 表单 */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #3e4948;
  margin-left: 4px;
}

.form-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input-icon {
  position: absolute;
  left: 16px;
  color: #6e7979;
  font-size: 20px;
}

.form-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  background: #F6F8F8;
  border: 1px solid #bdc9c8;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'PingFang SC', sans-serif;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #157878;
  box-shadow: 0 0 0 2px rgba(21,120,120,0.1);
}

.form-input::placeholder {
  color: #6e7979;
}

.form-input-action {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6e7979;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.form-input-action:hover {
  color: #157878;
}

.form-input-action .material-symbols-outlined {
  font-size: 20px;
}

/* 选项行 */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #3e4948;
  transition: color 0.3s;
}

.checkbox-label:hover {
  color: #157878;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  border: 1px solid #bdc9c8;
  border-radius: 4px;
  cursor: pointer;
  accent-color: #157878;
}

.forgot-link {
  color: #157878;
  text-decoration: none;
  transition: opacity 0.3s;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* 渐变按钮 */
.btn-gradient {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #157878 0%, #0E6060 100%);
  color: white;
  font-size: 18px;
  font-weight: 600;
  font-family: 'PingFang SC', sans-serif;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(21,120,120,0.3);
}

.btn-gradient:hover {
  opacity: 0.9;
  box-shadow: 0 4px 12px rgba(21,120,120,0.4);
}

.btn-gradient:active {
  transform: scale(0.98);
}

.btn-gradient:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 社交登录 */
.social-login {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #DFE3E6;
}

.social-divider {
  text-align: center;
  font-size: 14px;
  color: #6e7979;
  margin-bottom: 24px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.social-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 32px;
  border: 1px solid #DFE3E6;
  border-radius: 9999px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  font-family: 'PingFang SC', sans-serif;
  color: #121c28;
  cursor: pointer;
  transition: all 0.3s;
}

.social-btn:hover {
  border-color: #157878;
  background: #F6F8F8;
}

.social-btn .material-symbols-outlined {
  font-size: 20px;
  transition: transform 0.3s;
}

.social-btn:hover .material-symbols-outlined {
  transform: scale(1.1);
}

/* 页脚 */
.auth-footer {
  margin-top: 48px;
  text-align: center;
  font-size: 12px;
  color: #6e7979;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.footer-links a {
  color: #6e7979;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #157878;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-page {
    padding: 0;
    align-items: stretch;
  }

  .auth-container {
    flex-direction: column;
    min-height: 100vh;
    border-radius: 0;
  }

  .hero-section {
    display: none;
  }

  .form-section {
    width: 100%;
    padding: 32px 24px;
    justify-content: center;
  }

  .form-container {
    max-width: 100%;
  }

  .brand-header {
    text-align: center;
  }

  .brand-logo {
    justify-content: center;
  }

  .hero-title {
    font-size: 36px;
  }

  .social-btn {
    padding: 10px 24px;
  }
}
</style>
