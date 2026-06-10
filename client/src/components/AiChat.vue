<template>
  <teleport to="body">
    <transition name="chat-window">
      <div v-if="visible" class="ai-chat">
        <!-- Header -->
        <div class="ai-chat__header">
          <div class="ai-chat__header-left">
            <div class="ai-chat__avatar">
              <img src="@/assets/images/ai-bot.svg" alt="AI" class="ai-chat__avatar-img" />
              <span class="ai-chat__status"></span>
            </div>
            <div class="ai-chat__header-info">
              <span class="ai-chat__title">芜湖旅行助手</span>
              <span class="ai-chat__subtitle">在线 · 随时为你解答</span>
            </div>
          </div>
          <button class="ai-chat__close" @click="visible = false">
            <el-icon :size="16"><Close /></el-icon>
          </button>
        </div>

        <!-- Messages -->
        <div class="ai-chat__messages" ref="msgContainer">
          <transition-group name="msg-fade">
            <div
              v-for="(msg, i) in messages"
              :key="i"
              class="ai-chat__msg"
              :class="`ai-chat__msg--${msg.role}`"
            >
              <div v-if="msg.role === 'assistant'" class="ai-chat__msg-avatar">
                <img src="@/assets/images/ai-bot.svg" alt="AI" />
              </div>
              <div class="ai-chat__bubble" v-html="renderMarkdown(msg.content)"></div>
            </div>
          </transition-group>

          <!-- Thinking indicator -->
          <div v-if="thinking" class="ai-chat__msg ai-chat__msg--assistant">
            <div class="ai-chat__msg-avatar">
              <img src="@/assets/images/ai-bot.svg" alt="AI" />
            </div>
            <div class="ai-chat__thinking">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="ai-chat__quick">
          <button @click="sendQuick('推荐美食')">
            <span class="quick-icon">🍜</span>
            <span>美食推荐</span>
          </button>
          <button @click="sendQuick('一日游路线')">
            <span class="quick-icon">🗺️</span>
            <span>一日游</span>
          </button>
          <button @click="sendQuick('打卡拍照')">
            <span class="quick-icon">📸</span>
            <span>打卡拍照</span>
          </button>
        </div>

        <!-- Input -->
        <div class="ai-chat__input">
          <input
            v-model="input"
            placeholder="问我关于芜湖的任何事..."
            @keyup.enter="send"
          />
          <button
            class="ai-chat__send"
            :disabled="!input.trim() || thinking"
            @click="send"
          >
            <el-icon :size="18"><Promotion /></el-icon>
          </button>
        </div>
      </div>
    </transition>

    <!-- FAB with pulse glow -->
    <button v-if="!visible" class="ai-chat__fab" @click="visible = true">
      <span class="ai-chat__fab-glow"></span>
      <span class="ai-chat__fab-inner">
        <img src="@/assets/images/ai-bot.svg" alt="AI" class="ai-chat__fab-icon" />
      </span>
    </button>
  </teleport>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { aiChat, saveAiHistory, getAiHistory, getAiHistoryBySession } from '@/api/ai'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Close, Promotion } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const visible = ref(false)
const input = ref('')
const messages = ref([
  { role: 'assistant', content: '你好呀！我是芜湖旅行助手 🎉\n\n关于芜湖的风景、美食、玩乐，尽管问我！' },
])
const thinking = ref(false)
const msgContainer = ref(null)
const sessionId = ref('')

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

function scrollToBottom() {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    }
  })
}

watch(visible, async (val) => {
  if (val) {
    await loadHistory()
    scrollToBottom()
  }
})

async function loadHistory() {
  if (!userStore.isLoggedIn) return

  try {
    const res = await getAiHistory()
    const sessions = res.sessions || []

    if (sessions.length > 0) {
      const latestSession = sessions[0]
      sessionId.value = latestSession.session_id

      const historyRes = await getAiHistoryBySession(latestSession.session_id)
      const historyList = historyRes.list || []

      if (historyList.length > 0) {
        messages.value = historyList.map(m => ({
          role: m.role,
          content: m.content,
        }))
      }
    }
  } catch {
    // 静默处理，保留默认欢迎语
  }
}

async function send() {
  const text = input.value.trim()
  if (!text || thinking.value) return

  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再使用AI助手')
    router.push('/login')
    return
  }

  if (!sessionId.value) {
    sessionId.value = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  }

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  thinking.value = true
  scrollToBottom()

  if (userStore.userInfo) {
    saveAiHistory({ session_id: sessionId.value, role: 'user', content: text }).catch(() => {})
  }

  try {
    const history = messages.value.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }))

    const res = await aiChat(text, history)
    const reply = res.data.reply
    messages.value.push({ role: 'assistant', content: reply })

    if (userStore.userInfo) {
      saveAiHistory({ session_id: sessionId.value, role: 'assistant', content: reply }).catch(() => {})
    }
  } catch (e) {
    messages.value.push({
      role: 'assistant',
      content: '抱歉，AI 助手暂时无法响应。请稍后再试或浏览网站探索芜湖好去处！',
    })
  } finally {
    thinking.value = false
    scrollToBottom()
  }
}

function sendQuick(text) {
  input.value = text
  send()
}
</script>

<style scoped>
/* ===== Chat Window ===== */
.ai-chat {
  position: fixed;
  bottom: 92px;
  right: 24px;
  width: 400px;
  height: 560px;
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 12px 24px rgba(0, 0, 0, 0.08),
    0 24px 48px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  z-index: 200;
  overflow: hidden;
  border: 1px solid rgba(21, 120, 120, 0.08);
}

/* ===== Header ===== */
.ai-chat__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  background: linear-gradient(135deg, #157878 0%, #0E6060 100%);
  color: #fff;
  position: relative;
}

.ai-chat__header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 18px;
  right: 18px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
}

.ai-chat__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-chat__avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-chat__avatar svg,
.ai-chat__avatar-img {
  width: 22px;
  height: 22px;
  color: #fff;
}

.ai-chat__status {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4ADE80;
  border: 2px solid #157878;
}

.ai-chat__header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-chat__title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.ai-chat__subtitle {
  font-size: 12px;
  opacity: 0.75;
  font-weight: 400;
}

.ai-chat__close {
  background: rgba(255, 255, 255, 0.12);
  border: none;
  color: #fff;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.ai-chat__close:hover {
  background: rgba(255, 255, 255, 0.22);
}

/* ===== Messages ===== */
.ai-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: linear-gradient(180deg, #F8FAFA 0%, #F6F8F8 100%);
}

.ai-chat__messages::-webkit-scrollbar {
  width: 4px;
}

.ai-chat__messages::-webkit-scrollbar-track {
  background: transparent;
}

.ai-chat__messages::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.ai-chat__msg {
  display: flex;
  gap: 10px;
  max-width: 100%;
}

.ai-chat__msg--user {
  justify-content: flex-end;
}

.ai-chat__msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #157878, #0E6060);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.ai-chat__msg-avatar svg,
.ai-chat__msg-avatar img {
  width: 18px;
  height: 18px;
  color: #fff;
}

.ai-chat__bubble {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
  letter-spacing: 0.01em;
}

.ai-chat__msg--assistant .ai-chat__bubble {
  background: var(--color-surface);
  color: var(--color-ink);
  border-radius: 4px 14px 14px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.ai-chat__msg--user .ai-chat__bubble {
  background: linear-gradient(135deg, #157878, #0E6060);
  color: #fff;
  border-radius: 14px 4px 14px 14px;
  max-width: 280px;
}

/* ===== Thinking ===== */
.ai-chat__thinking {
  display: flex;
  gap: 5px;
  padding: 14px 18px;
  background: var(--color-surface);
  border-radius: 4px 14px 14px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.ai-chat__thinking .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-primary);
  opacity: 0.5;
  animation: dotPulse 1.2s ease-in-out infinite;
}

.ai-chat__thinking .dot:nth-child(2) { animation-delay: 0.15s; }
.ai-chat__thinking .dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
  40% { transform: scale(1.1); opacity: 1; }
}

/* ===== Message fade-in ===== */
.msg-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.msg-fade-leave-active {
  transition: all 0.15s ease;
}
.msg-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.msg-fade-leave-to {
  opacity: 0;
}

/* ===== Quick Actions ===== */
.ai-chat__quick {
  display: flex;
  gap: 8px;
  padding: 0 16px 12px;
  flex-wrap: wrap;
}

.ai-chat__quick button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  font-size: 13px;
  color: var(--color-ink-secondary);
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.ai-chat__quick button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(21, 120, 120, 0.04);
  transform: translateY(-1px);
}

.quick-icon {
  font-size: 14px;
  line-height: 1;
}

/* ===== Input ===== */
.ai-chat__input {
  display: flex;
  padding: 10px 16px 16px;
  gap: 10px;
  background: var(--color-surface);
}

.ai-chat__input input {
  flex: 1;
  padding: 11px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 14px;
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-ink);
  outline: none;
  transition: all 0.25s ease;
}

.ai-chat__input input::placeholder {
  color: var(--color-ink-muted);
}

.ai-chat__input input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(21, 120, 120, 0.08);
}

.ai-chat__send {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #157878, #0E6060);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.ai-chat__send:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(21, 120, 120, 0.3);
}

.ai-chat__send:active:not(:disabled) {
  transform: scale(0.95);
}

.ai-chat__send:disabled {
  background: var(--color-border);
  cursor: not-allowed;
}

/* ===== FAB Button with Pulse Glow ===== */
.ai-chat__fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 200;
  padding: 0;
}

.ai-chat__fab-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #157878, #0E6060);
  animation: fabPulse 2.5s ease-in-out infinite;
}

.ai-chat__fab-inner {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #157878, #0E6060);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 16px rgba(21, 120, 120, 0.35);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.ai-chat__fab-inner svg,
.ai-chat__fab-icon {
  width: 26px;
  height: 26px;
  color: #fff;
  transition: transform 0.3s ease;
}

.ai-chat__fab:hover .ai-chat__fab-inner {
  transform: scale(1.08);
}

.ai-chat__fab:hover .ai-chat__fab-inner svg,
.ai-chat__fab:hover .ai-chat__fab-icon {
  transform: scale(1.05);
}

.ai-chat__fab:active .ai-chat__fab-inner {
  transform: scale(0.95);
}

@keyframes fabPulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.25);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* ===== Window Transition ===== */
.chat-window-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.chat-window-leave-active {
  transition: all 0.2s ease;
}
.chat-window-enter-from,
.chat-window-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .ai-chat {
    width: 100vw;
    height: 85vh;
    bottom: 0;
    right: 0;
    border-radius: 20px 20px 0 0;
  }

  .ai-chat__fab {
    bottom: 20px;
    right: 20px;
  }
}
</style>
