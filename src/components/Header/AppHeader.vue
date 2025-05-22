<template>
  <ion-header :translucent="true">
   <ion-toolbar>
  <template #start>
    <ion-buttons>
      <ion-button @click="toggleMenu" style="margin-left: 20px;">
        <template #icon-only>
          <ion-icon :icon="menuIcon" />
        </template>
      </ion-button>
    </ion-buttons>
  </template>

  <ion-title style="margin-right: 70px;">
    <img :src="imageUrl" alt="Logo" style="height: 35px;" />
  </ion-title>
</ion-toolbar>


  </ion-header>

  <transition name="slide">
    <div v-if="showMenu" class="menu-backdrop" @click="closeMenu">
      <div class="header-content-wrapper" @click.stop>
        <ion-content>
         <ion-list>
            <ion-item button :to="{ name: 'Home' }" router-direction="forward" @click="closeMenu">
              <ion-label>Home</ion-label>
            </ion-item>
            <ion-item button :to="{ name: 'Scheduling' }" router-direction="forward" @click="closeMenu">
              <ion-label>Scheduling</ion-label>
            </ion-item>
            <ion-item button :to="{ name: 'Legal' }" router-direction="forward" @click="closeMenu">
              <ion-label>Legal</ion-label>
            </ion-item>
            <ion-item button :to="{ name: 'Help' }" router-direction="forward" @click="closeMenu">
              <ion-label>Help</ion-label>
            </ion-item>
          </ion-list>

        </ion-content>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/vue';

import { defineComponent, ref, computed } from 'vue';
import { closeOutline, menuOutline } from 'ionicons/icons';

export default defineComponent({
  name: 'AppHeader',
  components: {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel
  },
  setup() {
    const imageUrl = ref('/assets/logo.png'); // safer path
    const showMenu = ref(false);

    const toggleMenu = () => {
      showMenu.value = !showMenu.value;
    };

    const closeMenu = () => {
      showMenu.value = false;
    };

    const menuIcon = computed(() =>
      showMenu.value ? closeOutline : menuOutline
    );

    return {
      imageUrl,
      showMenu,
      toggleMenu,
      closeMenu,
      menuIcon
    };
  }
});
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
</style>
