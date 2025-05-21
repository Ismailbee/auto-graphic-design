<template>
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="toggleMenu" style="margin-left: 20px;">
          <ion-icon :icon="menuIcon" slot="icon-only" />
        </ion-button>
      </ion-buttons>
      <ion-title slot="end">
        <img :src="imageUrl" alt="Logo" style="height: 35px; margin-right: 70px;" />
      </ion-title>
    </ion-toolbar>
  </ion-header>

  <transition name="slide">
    <div v-if="showMenu" class="menu-backdrop" @click="closeMenu">
      <div class="header-content-wrapper" @click.stop>
        <ion-content>
          <ion-list>
            <ion-item button router-link="/" router-direction="forward">
              <ion-label>Home</ion-label>
            </ion-item>
            <ion-item button router-link="/SchedulingPage" router-direction="forward">
              <ion-label>Scheduling</ion-label>
            </ion-item>
            <ion-item button router-link="/LegalPage" router-direction="forward">
              <ion-label>Legal</ion-label>
            </ion-item>
            <ion-item button router-link="/HelpPage" router-direction="forward">
              <ion-label>Help</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { closeOutline, menuOutline } from 'ionicons/icons';

const imageUrl = ref('./src/assets/logo.png');
const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const closeMenu = () => {
  showMenu.value = false;
};

const menuIcon = computed(() => (showMenu.value ? closeOutline : menuOutline));
</script>

<style scoped>
ion-toolbar {
  --background: #7D3F01;
  --color: #ffffff;
}

.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.header-content-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background-color: #fff;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3);
}

/* Transition classes for sliding effect */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}
.slide-enter-to, .slide-leave-from {
  transform: translateX(0);
}
</style>
