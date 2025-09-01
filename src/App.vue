<template>
  <ion-app>
    <ion-router-outlet :key="$route.fullPath"></ion-router-outlet>
    <!-- Global appBase (bottom nav) -->
    <div class="relative z-[5]">
      <app-base v-if="isMobile" class="z-20" />
    </div>
    
    <!-- Toast notifications -->
    <toast-notifications />
    
    <!-- Dev performance monitor button (only in development) -->
    <div v-if="isDev" class="performance-toggle" @click="togglePerformanceMonitor">
      <div class="performance-icon" :class="{ active: showingPerformanceMonitor }">
        <span>FPS</span>
      </div>
    </div>
  </ion-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import AppBase from './components/pages/appBase/appBase.vue'
import ToastNotifications from './components/common/ToastNotifications.vue'
import { PerformanceMonitor } from './utils/performanceMonitor'

const isMobile = ref(window.innerWidth < 640)
// Vite exposes env via import.meta.env
const isDev = import.meta.env.DEV === true
const showingPerformanceMonitor = ref(false)
let removeOverlay = null

const handleResize = () => {
  isMobile.value = window.innerWidth < 640
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (removeOverlay) removeOverlay()
})

// Toggle performance monitor
function togglePerformanceMonitor() {
  if (showingPerformanceMonitor.value) {
    if (removeOverlay) {
      removeOverlay()
      removeOverlay = null
    }
  } else {
    removeOverlay = PerformanceMonitor.showOverlay()
  }
  showingPerformanceMonitor.value = !showingPerformanceMonitor.value
}
</script>

<style scoped>
.performance-toggle {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 9999;
  cursor: pointer;
  pointer-events: auto;
}

.performance-icon {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.performance-icon.active {
  background-color: rgba(76, 175, 80, 0.8);
}

.performance-icon:hover {
  transform: scale(1.1);
}
</style>