<template>
  <div :class="['fixed z-50 flex flex-col items-center justify-center h-screen transition-all duration-300', sidebarOpen ? 'w-[285px]'  : 'w-0']">
    <ion-content v-if="sidebarOpen" class="relative w-full h-screen px-2 pt-6 text-white bg-primary rounded-b-3xl">

      <!-- Collapse Arrow -->
      <div class="absolute z-10 flex items-center justify-center w-8 h-8 transition rounded-full cursor-pointer top-5 right-3 bg-contrast hover:scale-110" @click="toggleSidebar">
        <ion-icon :icon="chevronBackOutline" class="text-xl text-white" />
      </div>

      <!-- Menu Sections -->
      <ion-list class="h-full space-y-3 overflow-y-auto pt-[50px] bg-primary">

        <div class="border-[#90560a] border-b-[0.1px]">
          <myAccountMenu :icon="personCircle" label="My Account" @click="navigateTo('/myAccountPage')" />
          <MenuTitle :icon="home" label="Home" @click="navigateTo('/home')" />
        </div>
        
        <div class="border-[#90560a] border-b-[0.1px]">
          <MenuItem :icon="appsSharp" label="Scheduling" @click="navigateTo('/scheduling')" />
          <MenuItem :icon="logoSlack" label="Template" @click="navigateTo('/template')" />
          <MenuItem :icon="walletSharp" label="Mock-ups" @click="navigateTo('/mockupPage')" />
          <MenuItem :icon="logoYoutube" label="Videos" @click="navigateTo('/videosPage')" />
        </div>
   
        <div class="border-[#90560a] border-b-[0.1px]">
          <SectionTitle title="Help" />
          <MenuItem :icon="personAddSharp" label="Subscription" @click="navigateTo('/subscriPage')" />
          <MenuItem :icon="bagAddSharp" label="Use Redeem Code" @click="navigateTo('/useredeemcodePage')" />
          <MenuItem :icon="bulbSharp" label="Suggest a Feature" @click="navigateTo('/suggestfeaturePage')" />
          <MenuItem :icon="helpCircleSharp" label="Help Center" @click="navigateTo('/helpcenterPage')" />
          <MenuItem :icon="starHalfSharp" label="Rate App" @click="navigateTo('/rateappPage')" />
        </div>
        
        <div>
        <SectionTitle title="Legal" />
        <MenuItem :icon="chatbubbleSharp" label="Contact Support" @click="navigateTo('/contactPage')" />
        <MenuItem :icon="readerSharp" label="Terms of Service" @click="navigateTo('/termservicePage')" />
        <MenuItem :icon="shieldHalfSharp" label="Privacy Policy" @click="navigateTo('/privacypolicyPage')" />
        <MenuItem :icon="shieldCheckmarkSharp" label="Privacy Settings" @click="navigateTo('/privacysettingPage')" />

        </div>
      </ion-list>

    </ion-content>
  </div>
</template>

<script setup>
import { IonIcon, IonContent, IonList } from '@ionic/vue';
import { defineEmits, defineProps } from 'vue';
import { useIonRouter } from '@ionic/vue';
import {
  home, personCircle, readerSharp, walletSharp, logoYoutube, appsSharp,
  bagAddSharp, bulbSharp, helpCircleSharp, personAddSharp, starHalfSharp,
  chatbubbleSharp, logoSlack, shieldHalfSharp, shieldCheckmarkSharp, chevronBackOutline
} from 'ionicons/icons';

import myAccountMenu from './sidBarContent/myAccount/myAccountMenu.vue';
import MenuTitle from './MenuTitle.vue';
import MenuItem from './MenuItem.vue';
import SectionTitle from './SectionTitle.vue';

const props = defineProps({ sidebarOpen: Boolean });
const emit = defineEmits(['toggle']);
const ionRouter = useIonRouter();

const toggleSidebar = () => emit('toggle');
const navigateTo = (route) => {
  ionRouter.push(route)
  emit('toggle') // auto-close on mobile
}
</script>

<style scoped>
.bg-primary { background-color: #502800; }
.bg-contrast { background-color: #BA6900; }
</style>
