import { ref, onMounted, onUnmounted } from 'vue'

// Notifications list
const notifications = ref([
  { title: "System Update", desc: "Version 2.1.0 is now available.", read: false, status: null },
  { title: "Promo Alert", desc: "Get 20% off on your next order.", read: false, status: null },
  { title: "Security Notice", desc: "We’ve updated our privacy policy.", read: true, status: null }
])

// Count of unread notifications
const notificationCount = ref(notifications.value.length)

// Toast notifications
const toasts = ref([])
let toastIdCounter = 0

let intervalId = null
const FETCH_INTERVAL = 5000

export function useNotification() {
  const isActive = () => document.visibilityState === 'visible'

  async function fetchNotifications() {
    try {
      // Demo data only
      notificationCount.value = notifications.value.filter(n => !n.read).length

      if (notificationCount.value > 0) playNotificationSound()
    } catch (err) {
      console.error("Notification fetch error:", err)
    }
  }

  function playNotificationSound() {
    // ✅ Vibrate only if user has interacted (avoids Chrome warning)
    if ("vibrate" in navigator && document.hasFocus()) {
      // Mobile-only check
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        try {
          navigator.vibrate(200)
        } catch (e) {
          console.warn("Vibrate blocked:", e)
        }
      }
    }

    // ✅ Play sound safely
    const audio = new Audio('/sounds/notification.mp3')
    audio.play().catch(() => {
      // ignored — user interaction needed
    })
  }

  function startFetching() {
    stopFetching()
    intervalId = setInterval(() => {
      if (isActive()) fetchNotifications()
    }, FETCH_INTERVAL)
  }

  function stopFetching() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function handleVisibilityChange() {
    if (isActive()) startFetching()
    else stopFetching()
  }

  function acceptNotification(index) {
    notifications.value.splice(index, 1)
    notificationCount.value = notifications.value.length
  }

  function rejectNotification(index) {
    notifications.value.splice(index, 1)
    notificationCount.value = notifications.value.length
  }

  // Toast notification methods
  function showToast(message, type = 'info', duration = 3000) {
    const id = toastIdCounter++
    const toast = { id, message, type, duration }
    toasts.value.push(toast)

    setTimeout(() => {
      removeToast(id)
    }, duration)

    return id
  }

  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function showSuccess(message, duration = 3000) {
    return showToast(message, 'success', duration)
  }

  function showError(message, duration = 4000) {
    return showToast(message, 'error', duration)
  }

  function showWarning(message, duration = 3500) {
    return showToast(message, 'warning', duration)
  }

  function showInfo(message, duration = 3000) {
    return showToast(message, 'info', duration)
  }

  onMounted(() => {
    startFetching()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    stopFetching()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    notifications,
    notificationCount,
    toasts,
    fetchNotifications,
    startFetching,
    stopFetching,
    acceptNotification,
    rejectNotification,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast
  }
}
