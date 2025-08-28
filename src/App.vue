<template>
  <ion-app>
    <ion-router-outlet :key="$route.fullPath"></ion-router-outlet>
    <!-- Global appBase (bottom nav) -->
    <div class="relative z-[5]">
      <app-base v-if="isMobile" class="z-20" />
    </div>
    
    <!-- Toast notifications -->
    <toast-notifications />
  </ion-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import AppBase from './components/pages/appBase/appBase.vue'
import ToastNotifications from './components/common/ToastNotifications.vue'

const isMobile = ref(window.innerWidth < 640)

const handleResize = () => {
  isMobile.value = window.innerWidth < 640
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>