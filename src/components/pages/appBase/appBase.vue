<template>
  <div class="fixed visible sm:hidden bottom-0 left-0 z-40 justify-between flex items-center sm:justify-between w-full h-[75px] px-4 py-3  bg-primary">
   
    <!-- Left Section -->
      <div class="flex items-center justify-start ml-5">
        <app-base-icon :icon="home" label="Home" :label-icon="chevronUp" @click="navigateTo('/template')" />
        <app-base-icon :icon="text" label="My Edit" @click="navigateTo('/template')" />
      </div>
      
      
        <!-- Floating Toggle Button -->
      <div class="absolute z-50 flex bottom-4 left-40 sm:hidden">
        <div class="flex items-center justify-center w-[90px] h-[90px] rounded-full bg-primary">
          <div
            class="flex items-center justify-center h-[60px] w-[60px] bg-contrast text-white rounded-full cursor-pointer scale-110 transition"
            
          >
            <ion-icon :icon="add" class="text-[30px] transition-transform scale-125" />
          </div>
        </div>
      </div>
      
       <!-- right Section -->
      <div class="flex items-center justify-end mr-5">
        <app-base-icon :icon="appsSharp" label="Scheduling" @click="navigateTo('/template')" />
        <app-base-icon :icon="diamond" label="Reward" @click="navigateTo('/template')" />
       </div>
 
  </div>
</template>


<script setup>
import { useRouter } from 'vue-router'
import { add, chevronUp, diamond, home, appsSharp, text } from 'ionicons/icons'
import AppBaseIcon from './appBaseIcon.vue'

const router = useRouter()
function navigateTo(path) {
  router.push(path)
}


</script>

<style scoped>
/* Optional extra spacing below the header if it's fixed */
body {
  padding-top: 72px;
}
</style>
