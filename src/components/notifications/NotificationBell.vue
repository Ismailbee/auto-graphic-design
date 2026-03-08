<template>
  <button class="notif-button" aria-label="Notifications" @click="goToNotifications">
    <svg class="notif-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0H9m6 0a3 3 0 11-6 0" />
    </svg>
    <span v-if="unreadCount > 0" class="badge" :aria-label="unreadCount + ' unread notifications'">
      {{ displayCount }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification.store'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const store = useNotificationStore()
const authStore = useAuthStore()

const unreadCount = computed(() => store.unreadCount)
const displayCount = computed(() => unreadCount.value > 99 ? '99+' : String(unreadCount.value))

const goToNotifications = () => {
  router.push('/notifications')
}

onMounted(async () => {
  // Subscribe to real-time notifications if user is authenticated
  if (authStore.user?.id) {
    await store.subscribeToUserNotifications(authStore.user.id)
  } else if (import.meta.env.DEV) {
    // Fallback to demo notifications in development
    store.seedDemo()
  }
})

onUnmounted(() => {
  // Clean up subscription when component is destroyed
  store.unsubscribeFromNotifications()
})
</script>

<style scoped>
.notif-button {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: visible;
}

.notif-button:hover {
  background: rgba(6, 182, 212, 0.18);
  border-color: rgba(6, 182, 212, 0.4);
  color: #22d3ee;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);
}

.notif-icon {
  width: 18px;
  height: 18px;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(15, 23, 42, 0.98);
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
</style>
