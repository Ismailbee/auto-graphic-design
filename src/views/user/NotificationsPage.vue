<template>
  <div class="notifications-page">
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" aria-label="Go back" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="header-text">
          <h1 class="page-title">Notifications</h1>
          <p v-if="unreadCount > 0" class="page-subtitle">{{ unreadCount }} unread</p>
          <p v-else class="page-subtitle">All caught up!</p>
        </div>
        <button v-if="unreadCount > 0" class="mark-all-btn" @click="markAllRead">
          Mark all as read
        </button>
      </div>
    </div>

    <div class="content">
      <div v-if="notifications.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0H9m6 0a3 3 0 11-6 0" />
          </svg>
        </div>
        <h3 class="empty-title">No notifications yet</h3>
        <p class="empty-text">When you get notifications, they'll show up here</p>
      </div>

      <div v-else class="notifications-list">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="notification-item"
          :class="{ unread: !notif.read, [notif.type || 'info']: true }"
          @click="handleNotificationClick(notif)"
        >
          <div class="notif-icon" :class="notif.type || 'info'">
            <svg v-if="notif.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else-if="notif.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg v-else-if="notif.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div class="notif-content">
            <h4 class="notif-title">{{ notif.title }}</h4>
            <p v-if="notif.message" class="notif-message">{{ notif.message }}</p>
            <span class="notif-time">{{ formatTime(notif.createdAt) }}</span>
          </div>
          <button v-if="!notif.read" class="mark-read-btn" aria-label="Mark as read" @click.stop="markRead(notif.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore, type NotificationItem } from '@/stores/notification.store'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const store = useNotificationStore()
const authStore = useAuthStore()

const notifications = computed(() => store.sorted)
const unreadCount = computed(() => store.unreadCount)

// Subscribe to real-time notifications when page loads
onMounted(async () => {
  if (authStore.user?.id) {
    await store.subscribeToUserNotifications(authStore.user.id)
  }
})

// Clean up subscription when page is destroyed
onUnmounted(() => {
  store.unsubscribeFromNotifications()
})

const goBack = () => router.back()

const markAllRead = () => {
  store.markAllRead()
}

const markRead = (id: string) => {
  store.markRead(id)
}

const handleNotificationClick = (notif: NotificationItem) => {
  if (!notif.read) {
    store.markRead(notif.id)
  }
  if (notif.link) {
    router.push(notif.link)
  }
}

const formatTime = (isoString: string): string => {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
</script>

<style scoped>
.notifications-page { min-height: 100vh; background: #f8fafc; padding-bottom: 80px; }
.page-header { background: linear-gradient(135deg, #06b6d4, #0891b2); padding: 60px 20px 40px; color: white; }
.header-content { max-width: 900px; margin: 0 auto; display: flex; align-items: center; gap: 16px; }
.back-button { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; }
.back-button:hover { background: rgba(255,255,255,0.25); transform: translateX(-2px); }
.header-text { flex: 1; }
.page-title { font-size: 32px; font-weight: 700; margin: 0; }
.page-subtitle { margin: 4px 0 0; opacity: 0.9; font-size: 14px; }
.mark-all-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.mark-all-btn:hover { background: rgba(255,255,255,0.25); }
.content { max-width: 900px; margin: -20px auto 0; padding: 0 20px; }
.empty-state { background: white; border-radius: 16px; padding: 60px 20px; text-align: center; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
.empty-icon { width: 80px; height: 80px; margin: 0 auto 16px; border-radius: 50%; background: linear-gradient(135deg,#f0f9ff,#e0f2fe); color: #06b6d4; display: flex; align-items: center; justify-content: center; }
.empty-title { margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0f172a; }
.empty-text { margin: 0; color: #64748b; }
.notifications-list { display: flex; flex-direction: column; gap: 12px; }
.notification-item { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: flex-start; gap: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); cursor: pointer; transition: all 0.3s; border-left: 4px solid transparent; }
.notification-item:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.12); transform: translateY(-2px); }
.notification-item.unread { background: linear-gradient(to right, #f0f9ff, white); border-left-color: #06b6d4; }
.notif-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.notif-icon.info { background: linear-gradient(135deg,#dbeafe,#bfdbfe); color: #3b82f6; }
.notif-icon.success { background: linear-gradient(135deg,#d1fae5,#a7f3d0); color: #10b981; }
.notif-icon.warning { background: linear-gradient(135deg,#fef3c7,#fde68a); color: #f59e0b; }
.notif-icon.error { background: linear-gradient(135deg,#fee2e2,#fecaca); color: #ef4444; }
.notif-content { flex: 1; }
.notif-title { margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a; }
.notif-message { margin: 0 0 8px 0; color: #475569; font-size: 14px; line-height: 1.5; }
.notif-time { font-size: 12px; color: #94a3b8; font-weight: 500; }
.mark-read-btn { width: 32px; height: 32px; border-radius: 8px; background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); color: #06b6d4; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; flex-shrink: 0; }
.mark-read-btn:hover { background: rgba(6,182,212,0.2); transform: scale(1.1); }
@media (max-width: 768px) { .page-header { padding: 40px 20px 30px; } .page-title { font-size: 24px; } .header-content { flex-wrap: wrap; } .mark-all-btn { width: 100%; } }
</style>
