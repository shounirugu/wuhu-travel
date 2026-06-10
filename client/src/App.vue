<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <AiChat />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AiChat from '@/components/AiChat.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchProfile()
  }
})
</script>

<style>
.page-enter-active {
  transition: opacity 0.3s, transform 0.3s;
}
.page-leave-active {
  transition: opacity 0.15s;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.page-leave-to {
  opacity: 0;
}
</style>
