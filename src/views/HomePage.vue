<template>
  <ion-page>
    <ion-header collapse="condense">
      <ion-toolbar>
        <ion-title size="large">Home</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="flex w-full h-screen">
        <!-- Sidebar -->
        <SideBar :sidebarOpen="sidebarOpen" @toggle="toggleSidebar" />

        <!-- Main Content -->
        <div
          :class="[
            'transition-all duration-300 h-screen flex flex-col w-full p-4',
            sidebarOpen && !isMobile ? 'ml-[285px]' : 'ml-0'
          ]"
        >
          <transition name="slide-down">
            <AppHeader
              v-if="showHeader || isMobile"
              @toggle="toggleSidebar"
              class="z-40"
            />
          </transition>

          <BodyHeader title="bodyHeader" @menuClick="toggleSidebar" />

          <div class="flex flex-wrap gap-5 mt-[220px]">
            <div class="p-4 font-bold text-white bg-green-200 rounded-lg w-full">
              <Template title="Template" />
            </div>

            <div class="p-4 font-bold text-white bg-green-200 rounded-lg w-full">
              Tailwind is now working! ✅
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/vue'

import SideBar from '../components/pages/SideBar/sideBar.vue'
import AppHeader from '../components/layout/AppHeader.vue'
import BodyHeader from '../components/layout/BodyHeader.vue'
import Template from '../components/pages/Templates.vue'

export default {
  components: {
    
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    SideBar,
    AppHeader,
    BodyHeader,
    Template, 
  }
}

const sidebarOpen = ref(true)
const isMobile = ref(false)
const showHeader = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Colors */
.bg-primary {
  background-color: #502800;
}
.bg-contrast {
  background-color: #BA6900;
}

/* Pulse Animation for Floating Button */
.pulse-animation {
  animation: pulse 5.8s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Slide-down transition for <app-header /> */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>







