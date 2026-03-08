<template>
  <div class="admin-sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <h2 v-if="!isCollapsed">Admin Panel</h2>
      <ion-button fill="clear" @click="toggleSidebar">
        <ion-icon :icon="isCollapsed ? menuOutline : closeOutline"></ion-icon>
      </ion-button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        active-class="active"
      >
        <ion-icon :icon="item.icon"></ion-icon>
        <span v-if="!isCollapsed">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import {
  homeOutline,
  peopleOutline,
  cardOutline,
  statsChartOutline,
  settingsOutline,
  menuOutline,
  closeOutline
} from 'ionicons/icons'

const isCollapsed = ref(false)

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: homeOutline },
  { path: '/admin/users', label: 'Users', icon: peopleOutline },
  { path: '/admin/payments', label: 'Payments', icon: cardOutline },
  { path: '/admin/analytics', label: 'Analytics', icon: statsChartOutline },
  { path: '/admin/settings', label: 'Settings', icon: settingsOutline }
]

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.admin-sidebar {
  width: 250px;
  background: #1f2937;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s;
  z-index: 1000;
}

.admin-sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.sidebar-nav {
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-left: 4px solid #fbbf24;
}

.nav-item ion-icon {
  font-size: 24px;
  min-width: 24px;
}

.collapsed .nav-item span {
  display: none;
}
</style>
