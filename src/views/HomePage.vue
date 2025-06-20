<template>
  <ion-page>
    <!-- Scrollable Main Wrapper -->
    <div
      ref="scrollContainer"
      class="relative h-screen overflow-y-auto"
      @scroll="handleScroll"
    >
      <!-- Floating Toggle Button -->
      <div v-if="!sidebarOpen" class="hidden sm:fixed sm:flex z-50 top-[300px] left-[-70px]">
        <div class="flex items-center w-[140px] h-[105px] rounded-full bg-primary pulse-animation">
          <div
            class="flex items-center ml-[80px] justify-center h-[50px] w-[50px] bg-contrast text-white rounded-full cursor-pointer hover:scale-110 transition"
            @click="toggleSidebar"
          >
            <ion-icon :icon="add" class="text-3xl transition-transform hover:scale-125" />
          </div>
        </div>
      </div>

    

      <!-- Sidebar -->
      <side-bar :sidebarOpen="sidebarOpen" @toggle="toggleSidebar" />

      <!-- Main Content -->
    <div
      :class="[
        'transition-all duration-300 h-screen flex flex-col',
        sidebarOpen && !isMobile ? 'ml-[285px]' : 'ml-0'
      ]">
      <!-- Slide-down App Header -->
     <transition name="slide-down">
      <app-header
          v-if="showHeader || isMobile"
          @toggle="toggleSidebar"
          :class="headerClasses"
          :showHeader="showHeader"
        />


      </transition>



      
        <!-- Body Header -->
        <body-header title="bodyHeader" @menuClick="toggleSidebar" />

        <!-- Page Content -->
        <div
          class=" p-20 mt-[10px] h-full w-full font-bold text-black"
        >
            <CarouselCards />
        </div>
        
        <div>
          <app-Base title="appBase" />
        </div>
      </div>
    </div>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { IonPage, IonIcon } from '@ionic/vue'
import { add } from 'ionicons/icons'

import sideBar from '../components/pages/SideBar/sideBar.vue'
import appHeader from '../components/pages/Header/appHeader.vue'
import bodyHeader from '../components/pages/bodyHeader/bodyHeader.vue'
import CarouselCards from  '../components/pages/CarouselCards.vue'


// Sidebar toggle
const sidebarOpen = ref(false)
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Scroll tracking for app-header visibility
const scrollContainer = ref(null)
const showHeader = ref(false)
let lastScrollTop = 0

const handleScroll = () => {
  const el = scrollContainer.value
  if (!el) return

  const scrollTop = el.scrollTop
  const scrollHeight = el.scrollHeight
  const clientHeight = el.clientHeight

  const scrolledPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
  showHeader.value = scrolledPercentage >= 38

  lastScrollTop = scrollTop
}


  const headerClasses = computed(() => [
  'transition-all duration-200 flex flex-shrink-0 flex-wrap z-40',
  sidebarOpen.value && !isMobile.value ? 'ml-[285px] md:max-w-[1250px]' : 'ml-0 w-full',
  showHeader.value? 'bg-primary' : 'bg-[#fff6dc] sm:bg-gradient-to-r from-[#EEDCAC] via-white to-white transition-all duration-200 header-transition'
])

const isMobile = ref(window.innerWidth < 640) // sm: 640px in Tailwind

const handleResize = () => {
  isMobile.value = window.innerWidth < 640
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  if (isMobile.value) showHeader.value = true // 👈 force show on mobile
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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

.header-transition {
  transition: background-color 0.5s ease, background-image 0.5s ease;
}

</style>