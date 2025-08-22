import { ref, onMounted, onUnmounted } from 'vue'

// Notifications list
const notifications = ref([
  { title: "System Update", desc: "Version 2.1.0 is now available.", read: false, status: null },
  { title: "Promo Alert", desc: "Get 20% off on your next order.", read: false, status: null },
  { title: "Security Notice", desc: "We’ve updated our privacy policy.", read: true, status: null }
])

// Count of unread notificationsconst notificationCount = ref(notifications.value.length)
const notificationCount = ref(notifications.value.length)


let intervalId = null
const FETCH_INTERVAL = 5000

export function useNotification() {
  const isActive = () => document.visibilityState === 'visible'

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()

      notifications.value = data
      notificationCount.value = data.length


      if (notificationCount.value > 0) playNotificationSound()
    } catch (err) {
      console.error("Notification fetch error:", err)
    }
  }

  function playNotificationSound() {
    if (window.navigator.vibrate) navigator.vibrate([200])
    const audio = new Audio('/sounds/notification.mp3')
    audio.play().catch(() => {})
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
  notifications.value.splice(index, 1);
  notificationCount.value = notifications.value.length;
}

function rejectNotification(index) {
  notifications.value.splice(index, 1);
  notificationCount.value = notifications.value.length;
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
    fetchNotifications,
    startFetching,
    stopFetching,
    acceptNotification,
    rejectNotification
  }
}
