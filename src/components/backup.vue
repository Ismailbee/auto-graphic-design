<template>
  <ion-page>
    <ion-header :translucent="true">
    <ion-toolbar>
      <!-- Mobile Hamburger -->
      <ion-buttons slot="start" class="mobile-nav">
        <ion-button @click="toggleMenu" style="margin-left: 20px;">
          <ion-icon :icon="menuIcon" slot="icon-only" />
        </ion-button>
      </ion-buttons>

      <!-- Desktop Navigation -->
       <ion-title class="items-center flex ml-[80px] flex-1" slot="start">
      <div class="desktop-nav">
        <ion-buttons>
          <ion-button @click="navigateTo('home')">Home</ion-button>
          <ion-button @click="navigateTo('scheduling')">Scheduling</ion-button>
          <ion-button @click="navigateTo('videos')">Videos</ion-button>
          <ion-button @click="navigateTo('mockups')" class="whitespace-nowrap shrink-0 min-w-fit">Mock-ups</ion-button>
          <ion-button @click="navigateTo('legal')">Legal</ion-button>
          <ion-button @click="navigateTo('help')">Help</ion-button>

        </ion-buttons>
      </div>
      </ion-title>

      <!-- Logo -->
      <ion-title class="flex items-center justify-end" slot="end">
        <div
          v-if="!showMenu"
          class="flex flex-row-reverse items-center flex-shrink-0 w-auto mr-20"
        >
          <img :src="imageUrl" alt="Logo" class="w-[75px] flex-shrink-0" />
        </div>
      </ion-title>


    </ion-toolbar>
       
  </ion-header>

  <!-- Mobile Slide Menu -->
  <transition name="slide">
    <div v-if="showMenu" class="menu-backdrop" @click="closeMenu">
      <div class="header-content-wrapper" @click.stop>
        <div class="h-[100px] w-full bg-[#7D3F01] items-center justify-center flex">
            <img :src="imageUrl" alt="Logo" class="w-[95px]" />
        
        </div>
        <ion-content>
          <ion-list>
            <ion-item button @click="closeMenu('Home')">
              <ion-label>Home</ion-label>
            </ion-item>
            <ion-item button  @click="closeMenu('scheduling')">
              <ion-label>Scheduling</ion-label>
            </ion-item>
            <ion-item button @click="closeMenu('Videos')">
              <ion-label>Videos</ion-label>
            </ion-item>
            <ion-item button @click="closeMenu('Mockups')">
              <ion-label>Mock-ups</ion-label>
            </ion-item>
            <ion-item button @click="closeMenu('HelpCenter')">
              <ion-label>Help Center</ion-label>
            </ion-item>
            <ion-item button @click="closeMenu('Support')">
              <ion-label>Contact Support</ion-label>
            </ion-item>
            <ion-item button @click="closeMenu('Terms')">
              <ion-label>Terms of Service</ion-label>
            </ion-item>
            <ion-item button @click="closeMenu('Privacy')">
              <ion-label>Privacy Policy</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </div>
    </div>
  </transition>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { closeOutline, menuOutline } from 'ionicons/icons';
import router from '../../router';


const navigateTo = (path) => {
  router.push(`/${path}`);
};


const imageUrl = ref('/logo.png');
const showMenu = ref(false);
const helpDropdown = ref(false);
const legalDropdown = ref(false);

// Refs for dropdown wrappers
const helpRef = ref(null);
const legalRef = ref(null);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const closeMenu = (route) => {
  router.push(route)
  showMenu.value = false;
};

const toggleHelp = () => {
  helpDropdown.value = !helpDropdown.value;
  legalDropdown.value = false; // Close other dropdown
};

const toggleLegal = () => {
  legalDropdown.value = !legalDropdown.value;
  helpDropdown.value = false;
};

const handleClickOutside = (event) => {
  if (
    helpRef.value && !helpRef.value.contains(event.target) &&
    legalRef.value && !legalRef.value.contains(event.target)
  ) {
    helpDropdown.value = false;
    legalDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const menuIcon = computed(() => (showMenu.value ? closeOutline : menuOutline));
</script>

<style scoped>
ion-toolbar {
  --background: #7D3F01;
  --color: #ffffff;
  height: 70px;
  align-items: center;
  display: flex;
  justify-content: center;
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
  height: 200%;
  background-color: #fff;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

/* Mobile defaults */
.desktop-nav {
  display: none;
}
.mobile-nav {
  display: flex;
}

/* Dropdown styles */
.dropdown-wrapper {
  position: relative;
  padding: 0 10px;
  cursor: pointer;
  overflow: visible;
}

.dropdown-label {
  color: white;
  font-weight: bold;
}

.dropdown {
  position: fixed;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 10000;
  overflow: visible;
}

.dropdown ion-button {
  --color: black;
  text-align: left;
  width: 100%;
}

/* Desktop view */
@media (min-width: 768px) {
  .mobile-nav {
    display: none;
  }

  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .desktop-nav ion-button {
    --color: #ffffff;
    font-weight: bold;
    font-size: 13px;
  }
}
</style>
