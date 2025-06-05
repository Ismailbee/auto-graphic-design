<template>
  <!-- Sidebar -->
  <div :class="['transition-all duration-500', sidebarOpen ? 'w-60' : 'w-[80px]']"
       class="flex flex-col items-center justify-center h-screen space-y-4">

   <!-- Toggle Button (Top Circle) -->
    <div v-if="!sidebarOpen"
      class="flex items-center justify-center w-12 h-12 text-white transition rounded-full cursor-pointer bg-primary hover:scale-110"
      @click="toggleSidebar">
      <ion-icon :icon="addOutline" class="text-2xl" />
    </div>


    <!-- Menu Items (Shown only when sidebar is open) -->
    <div v-if="sidebarOpen"
        class="relative flex flex-col items-start w-full h-screen px-4 m-6 space-y-4 text-white bg-primary">

      <!-- Collapse Arrow -->
      <div
        class="absolute top-0 right-0 mt-2 mr-2 text-white cursor-pointer hover:scale-110"
        @click="toggleSidebar">
        <ion-icon :icon="chevronBackOutline" class="text-2xl text-white" />
      </div>

      <div
        v-for="item in menuItems"
        :key="item.title"
        @click="navigateTo(item.route)"
        class="flex items-center w-full gap-3 p-2 rounded cursor-pointer hover:bg-primary-contrast">
        <ion-icon :icon="item.icon" class="text-xl" />
        <span class="text-sm">{{ item.title }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { IonIcon } from '@ionic/vue';
import {
  addOutline,
  homeOutline,
  briefcaseOutline,
  layersOutline,
  colorPaletteOutline,
  calendarOutline,
  chevronBackOutline
} from 'ionicons/icons';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const sidebarOpen = ref(false);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const menuItems = [
  { title: 'Create', icon: addOutline, route: '/create' },
  { title: 'Home', icon: homeOutline, route: '/home' },
  { title: 'Projects', icon: briefcaseOutline, route: '/projects' },
  { title: 'Templates', icon: layersOutline, route: '/templates' },
  { title: 'Brand', icon: colorPaletteOutline, route: '/brand' },
  { title: 'Scheduling', icon: calendarOutline, route: '/scheduling' },
];

const navigateTo = (route) => {
  router.push(route);
};
</script>

<style scoped>
.bg-primary {
  background-color: #3880ff;
}
.bg-primary-contrast {
  background-color: #3171e0;
}
</style>