<template>
  <div :class="['flex flex-col items-center justify-center h-screen space-y-4 transition-all duration-500', sidebarOpen ? 'w-[350px]' : 'w-[90px]']">
    
    <!-- Toggle Button (Circle) -->
   <div v-if="!sidebarOpen"
   class="flex items-center ml-[-80px] w-[150px] h-[150px] rounded-full bg-primary">
     <div 
         class="flex items-center ml-[80px] justify-center tex  t-white transition rounded-full cursor-pointer h-[60px] w-[60px] bg-contrast hover:scale-110"
         @click="toggleSidebar">
      <ion-icon :icon="addOutline" class="text-3xl text-white transition-transform hover:scale-125" />
    </div>
   </div>

    <!-- Expanded Sidebar Content -->
    <ion-content v-if="sidebarOpen" class="relative flex flex-col w-full h-screen px-2 pt-6 text-white rounded-b-50">

      <!-- Collapse Arrow -->
      <div class="absolute z-10 flex items-center justify-center w-8 h-8 mt-2 mr-2 rounded-full cursor-pointer top-8 left-7 bg-contrast hover:scale-110"
           @click="toggleSidebar">
        <ion-icon :icon="close" class="text-2xl text-white" />
      </div>

      <!-- Sidebar Menu Items -->
      <ion-list class="h-screen pt-[110px] rounded-b-30 bg-primary">
        <div>
          <ion-item button lines="none" class="group text-xl text-[#BA6900] bg-transparent hover:secondary hover:bg-primary-contrast"
                    style="--background: transparent;  --color: #BA6900;"
                    @click="navigateTo('/home')">
            <ion-icon :icon="home" slot="start" class="text-2xl pl-4 text-white group-hover:text-[#BA6900]" />
            <ion-label><strong class="hover:text-white">Home</strong></ion-label>
          </ion-item>
          
          <ion-item button lines="none" class="group text-xl text-[#BA6900] hover:bg-primary-contrast"
                   style="--background: transparent;  --color: #BA6900;"
                   @click="navigateTo('/create')">
          <ion-icon :icon="personCircle" slot="start" class="text-2xl pl-4 text-white group-hover:text-[#BA6900]" />
          <ion-label><strong class="hover:text-white">My Account</strong></ion-label>
          </ion-item>
        </div>
        
        <div class="p-2 border-[#794613] border-b-[0.01px] border-t-[0.01px]">
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="appsSharp" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label>Scheduling</ion-label>
          </ion-item-button1>
          
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="walletSharp" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label>Mock-ups</ion-label>
          </ion-item-button1>
          
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="logoYoutube" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label>Videos</ion-label>
          </ion-item-button1>          
        </div>
        
        <div class="p-2 border-[#794613] border-b-[0.01px] border-t-[0.01px]">
          <h2 class="m-0 pl-7 text-[#BA6900]">HELP</h2>
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="personAddSharp" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label >Subscription</ion-label>
          </ion-item-button1>
          
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="bagAddSharp" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label class="shrink-label">Use Redeem Code</ion-label>
          </ion-item-button1>
          
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="bulbSharp" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label class="shrink-label">Suggest a Feature</ion-label>
          </ion-item-button1>  
                  
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="helpCircleSharp" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label class="shrink-label">Help Center</ion-label>
          </ion-item-button1>  
                  
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="starHalfSharp" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label>Rate App</ion-label>
          </ion-item-button1>                    
        </div>
       
        <div class="p-2 border-[#794613] border-t-[0.01px]">
          <h2 class="m-0 pl-7 text-[#BA6900]">LEGAL</h2>
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="chatbubbleSharp" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label class="text-white shrink-label group-hover:text-[rgb(80,40,0)]">Contact Support</ion-label>
          </ion-item-button1>
          
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="readerSharp" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label class="shrink-label">Terms of Service</ion-label>
          </ion-item-button1>
          
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="shieldHalfSharp" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label class="shrink-label">Privacy Policy</ion-label>
          </ion-item-button1>  
                  
          <ion-item-button1 @click="navigateTo('/scheduling')" class="group">
              <ion-icon :icon="shieldCheckmarkSharp" slot="start" class="text-xl text-white group-hover:text-[#502800] " />
              <ion-label class="shrink-label">Privacy Settings</ion-label>
          </ion-item-button1>                      
        </div>
        
      </ion-list>

    </ion-content>
  </div>
</template>

<script setup>
import { IonIcon, useIonRouter } from '@ionic/vue';
import { close, home, personCircle, readerSharp, walletSharp, logoYoutube, appsSharp, lockOpenSharp, bagAddSharp, bulbSharp, helpCircleSharp, statsChartSharp, personAddSharp, starHalfSharp, chatbubbleSharp, shieldHalfSharp, shieldCheckmarkSharp } from 'ionicons/icons';
import ionItemButton1 from '../ionElement/ion-item-button1.vue';
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

const ionRouter = useIonRouter();
const sidebarOpen = ref(false);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};


const navigateTo = (route) => {
  // Use Ionic's router push method
  ionRouter.push(route);
};
</script>

<style scoped>
.bg-primary {
  background-color: #502800;
}

.bg-contrast {
  background-color: #BA6900;
}
ion-item{
  --background: transparent;
  --color: #BA6900;
  transition: backround-color 0.3s ease-in-out;
}
ion-item:hover {
  --background: #BA6900;
  --color: #502800;
}
ion-label {
  font-size: 1.125rem;
  font-weight: 600;
}
.shrink-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(0.6rem, 1.5vw, 1rem); /* Shrinks on smaller screens */
  display: block;
}

</style>