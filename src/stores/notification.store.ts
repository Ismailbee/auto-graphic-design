import { defineStore } from 'pinia'
import { 
subscribeToNotifications, 
markNotificationAsRead, 
markAllNotificationsAsRead,
formatTimestamp,
type NotificationData
} from '@/services/user/notification.service'
import type { Unsubscribe } from 'firebase/firestore'

export interface NotificationItem {
id: string
title: string
message?: string
type?: 'info' | 'success' | 'warning' | 'error'
read: boolean
createdAt: string // ISO string
link?: string // optional deep link path
}

interface NotificationState {
items: NotificationItem[]
isSubscribed: boolean
unsubscribe: Unsubscribe | null
}

export const useNotificationStore = defineStore('notification', {
state: (): NotificationState => ({
items: [],
isSubscribed: false,
unsubscribe: null
}),
getters: {
unreadCount: (state) => state.items.filter(n => !n.read).length,
// Items are stored in newest-first order to avoid re-sorting on every render.
sorted: (state) => state.items
},
actions: {
/**
 * Subscribe to real-time notifications from Firebase
 */
async subscribeToUserNotifications(userId: string) {
if (this.isSubscribed) {
return
}

try {
this.unsubscribe = subscribeToNotifications(userId, (notifications) => {
// Convert Firebase notifications to store format
const mapped = notifications.map((notif: NotificationData) => ({
id: notif.id,
title: notif.title,
message: notif.message,
type: notif.type,
read: notif.read,
createdAt: formatTimestamp(notif.createdAt),
link: notif.link
}))

// Keep newest-first ordering once, here.
mapped.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
this.items = mapped
})

this.isSubscribed = true
} catch (error) {
console.error('Failed to subscribe to notifications:', error)
}
},

/**
 * Unsubscribe from real-time notifications
 */
unsubscribeFromNotifications() {
if (this.unsubscribe) {
this.unsubscribe()
this.unsubscribe = null
this.isSubscribed = false
}
},

/**
 * Mark all notifications as read (syncs with Firebase)
 */
async markAllRead() {
// Optimistic update
this.items = this.items.map(n => ({ ...n, read: true }))

// Get userId from auth store
const { useAuthStore } = await import('./auth')
const authStore = useAuthStore()

if (authStore.user?.id) {
try {
await markAllNotificationsAsRead(authStore.user.id)
} catch (error) {
console.error('Failed to mark all as read:', error)
// Revert on error (the real-time listener will restore correct state)
}
}
},

/**
 * Mark a single notification as read (syncs with Firebase)
 */
async markRead(id: string) {
// Optimistic update
const idx = this.items.findIndex(n => n.id === id)
if (idx !== -1) this.items[idx].read = true

try {
await markNotificationAsRead(id)
} catch (error) {
console.error('Failed to mark as read:', error)
// Revert on error (the real-time listener will restore correct state)
}
},

/**
 * Add a local notification (for testing/demo)
 */
add(notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'> & { id?: string, createdAt?: string, read?: boolean }) {
const item: NotificationItem = {
id: notification.id || cryptoRandomId(),
title: notification.title,
message: notification.message,
type: notification.type || 'info',
read: notification.read ?? false,
createdAt: notification.createdAt || new Date().toISOString(),
link: notification.link
}
this.items.unshift(item)
},

/**
 * Clear all local notifications
 */
clear() {
this.items = []
},

/**
 * Seed demo notifications (development only)
 */
seedDemo() {
if (this.items.length) return
this.add({ title: 'Welcome to SmartDesignPro', message: 'Thanks for joining! Explore new templates today.', type: 'success' })
this.add({ title: 'Design Approved', message: 'Your design "Brand Poster" was approved by the team.', type: 'info' })
this.add({ title: 'New Comment', message: 'Alex commented on "Summer Flyer".', type: 'info' })
}
}
})

function cryptoRandomId(): string {
try {
// Browser crypto
const arr = new Uint8Array(16)
crypto.getRandomValues(arr)
return Array.from(arr).map(x => x.toString(16).padStart(2, '0')).join('')
} catch {
// Fallback
return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
}
