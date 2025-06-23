// useNotification.js
import { ref, onMounted, onUnmounted } from 'vue'

const notificationCount = ref(0)
let intervalId = null

export function useNotification() {
  const isActive = () => document.visibilityState === 'visible'

  function fetchNotifications() {
    notificationCount.value += 1
    playNotificationSound()
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
    }, 5000)
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

  onMounted(() => {
    startFetching()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    stopFetching()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    notificationCount,
    fetchNotifications,
    startFetching,
    stopFetching
  }
}
