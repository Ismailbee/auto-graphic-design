<template>
  <div :class="['fixed z-50 flex flex-col items-center justify-center h-screen transition-all duration-300', sidebarOpen ? 'w-[285px]' : 'w-0']">
    <ion-content v-if="sidebarOpen" class="relative w-full h-screen px-2 pt-6 text-white bg-primary rounded-b-3xl">

      <!-- Collapse Arrow -->
      <div class="absolute z-10 flex items-center justify-center w-8 h-8 transition rounded-full cursor-pointer top-5 right-3 bg-contrast hover:scale-110" @click="toggleSidebar">
        <ion-icon :icon="chevronBackOutline" class="text-xl text-white" />
      </div>

      <!-- Menu Sections -->
      <ion-list class="h-full pt-12 space-y-6 overflow-y-auto">

        <!-- Main Section -->
        <SectionTitle title="Main" />
        <MenuItem icon="home" label="Home" @click="navigateTo('/home')" />
        <MenuItem icon="personCircle" label="My Account" @click="navigateTo('/myAccountPage')" />

        <!-- Scheduling Section -->
        <SectionTitle title="Scheduling" />
        <MenuItem icon="appsSharp" label="Scheduling" @click="navigateTo('/scheduling')" />
        <MenuItem icon="walletSharp" label="Mock-ups" @click="navigateTo('/mockupPage')" />
        <MenuItem icon="logoYoutube" label="Videos" @click="navigateTo('/videosPage')" />

        <!-- Help Section -->
        <SectionTitle title="Help" />
        <MenuItem icon="personAddSharp" label="Subscription" @click="navigateTo('/subscriPage')" />
        <MenuItem icon="bagAddSharp" label="Use Redeem Code" @click="navigateTo('/useredeemcodePage')" />
        <MenuItem icon="bulbSharp" label="Suggest a Feature" @click="navigateTo('/suggestfeaturePage')" />
        <MenuItem icon="helpCircleSharp" label="Help Center" @click="navigateTo('/helpcenterPage')" />
        <MenuItem icon="starHalfSharp" label="Rate App" @click="navigateTo('/rateappPage')" />

        <!-- Legal Section -->
        <SectionTitle title="Legal" />
        <MenuItem icon="chatbubbleSharp" label="Contact Support" @click="navigateTo('/contactPage')" />
        <MenuItem icon="readerSharp" label="Terms of Service" @click="navigateTo('/termservicePage')" />
        <MenuItem icon="shieldHalfSharp" label="Privacy Policy" @click="navigateTo('/privacypolicyPage')" />
        <MenuItem icon="shieldCheckmarkSharp" label="Privacy Settings" @click="navigateTo('/privacysettingPage')" />

      </ion-list>
    </ion-content>
  </div>
</template>

<script setup>
import { IonIcon, IonContent, IonList } from '@ionic/vue';
import { defineEmits, defineProps } from 'vue';
import {
  add, home, personCircle, readerSharp, walletSharp, logoYoutube, appsSharp,
  bagAddSharp, bulbSharp, helpCircleSharp, personAddSharp, starHalfSharp,
  chatbubbleSharp, shieldHalfSharp, shieldCheckmarkSharp, chevronBackOutline
} from 'ionicons/icons';
import { useIonRouter } from '@ionic/vue';

const props = defineProps({ sidebarOpen: Boolean });
const emit = defineEmits(['toggle']);
const ionRouter = useIonRouter();

const toggleSidebar = () => emit('toggle');
const navigateTo = (route) => ionRouter.push(route);
</script>

<!-- Section Title Component -->
<script>
export const SectionTitle = {
  props: ['title'],
  template: `<h5 class="pl-4 text-[#BA6900] font-semibold">{{ title }}</h5>`
}
</script>

<!-- Menu Item Component -->
<script>
export const MenuItem = {
  props: ['icon', 'label'],
  emits: ['click'],
  template: `
    <ion-item button lines="none" @click="$emit('click')" class="group text-white bg-transparent hover:bg-[#BA6900] transition rounded-lg mx-2 my-1">
      <ion-icon :icon="icon" slot="start" class="text-lg ml-1 group-hover:text-[#502800]" />
      <ion-label class="text-sm group-hover:text-[#502800] font-medium">{{ label }}</ion-label>
    </ion-item>
  `
}
</script>

<style scoped>
.bg-primary { background-color: #502800; }
.bg-contrast { background-color: #BA6900; }
</style>
