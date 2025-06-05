<template>
  <ion-page>
    <ion-menu menu-id="main-menu" content-id="main-content" side="start" type="overlay">
      <ion-content class="bg-white dark:bg-gray-800">
        <!-- Logo -->
        <div class="p-4 flex justify-center items-center">
          <img src="../logoauto.png" alt="Logo" class="h-8 w-8" />
        </div>

        <!-- Navigation -->
        <ion-list>
          <ion-menu-toggle v-for="item in navItems" :key="item.title" auto-hide="false">
            <ion-item 
              button 
              @click="handleItemClick(item)"
              :detail="isSectionOpen(item) ? chevronDown : chevronForward"
            >
              <ion-icon :icon="item.icon" slot="start"></ion-icon>
              <ion-label>{{ item.title }}</ion-label>
              <ion-badge v-if="item.badge" slot="end">{{ item.badge }}</ion-badge>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>

        <!-- Theme Toggle -->
        <ion-button 
          @click="toggleTheme" 
          fill="clear" 
          class="absolute bottom-4 left-4"
        >
          <ion-icon :icon="theme === 'light' ? sunnyOutline : moonOutline"></ion-icon>
        </ion-button>
      </ion-content>
    </ion-menu>

    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { 
  IonPage, IonMenu, IonContent, IonList, 
  IonItem, IonIcon, IonLabel, IonBadge,
  IonButton, IonMenuToggle, IonRouterOutlet
} from '@ionic/vue';
import {
  homeOutline, peopleOutline, documentTextOutline,
  calendarOutline, statsChartOutline, addCircleOutline,
  sunnyOutline, moonOutline, chevronDown,
  chevronForward, chevronBack
} from 'ionicons/icons';

// Navigation items
const navItems = ref([
  {
    title: 'Home',
    icon: homeOutline,
    path: '/',
    children: []
  },
  {
    title: 'Users',
    icon: peopleOutline,
    path: '/users',
    badge: 3
  },
  // Add more items as needed
]);

// Theme management
const theme = ref('light');
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  document.body.classList.toggle('dark', theme.value === 'dark');
};

// Menu section handling
const openSections = ref(new Set());
const isSectionOpen = (item) => openSections.value.has(item.title);
const handleItemClick = (item) => {
  if (item.children?.length) {
    if (openSections.value.has(item.title)) {
      openSections.value.delete(item.title);
    } else {
      openSections.value.add(item.title);
    }
  } else {
    // Handle navigation here (use your router)
    console.log('Navigating to:', item.path);
  }
};
</script>

<style>
.bg-white {
  background-color: white;
}
.dark .bg-gray-800 {
  background-color: #1a202c;
}
</style>