<template>
  <div class="fixed top-0 left-0 z-50 justify-between flex items-center sm:justify-between w-full h-[75px] px-4 py-3 bg-primary sm:bg-gradient-to-r from-[#EEDCAC] via-white to-white shadow-md">
   
    <div class="flex items-center justify-center ml-5 transition cursor-pointer sm:hidden"
      @click="$emit('toggle')" >
      <ion-icon :icon="reorderThree" class="text-[30px] text-white" />
    </div>

    <!-- Left Section -->
    <div class="items-center flex-shrink-0 hidden gap-3 ml-16 sm:flex">
      <headerTemplate :icon="extensionPuzzle" label="Template" :label-icon="chevronUp" @click="navigateTo('/template')" />
      <header-icon :icon="logoAppleAppstore" label="My Edit" @click="navigateTo('/template')" />
      <header-icon :icon="server" label="Token" @click="navigateTo('/template')" />
      <header-icon :icon="diamond" label="Reward" @click="navigateTo('/template')" />
    </div>

    <!-- Middle Section (Search Bar) -->
    <div class="relative hidden sm:flex  sm:visible flex-1 px-4 max-w-[500px]">
      <input 
        type="text"
        placeholder="Search..."
        class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-[#BA6900] bg-gradient-to-t from-[#f7f7f7] via-[#ffffff] to-white"
      />
      <div class="absolute text-gray-400 transform -translate-y-1/2 left-7 top-6">
        <ion-icon :icon="searchOutline" class="text-lg"></ion-icon>
      </div>
    </div>

    <!-- Right Section -->
    <div class="flex items-center justify-end flex-shrink-0 gap-4 mr-7 sm:justify-center">
      <div class="relative pt-2 cursor-pointer" @click="navigateToNotifications">
        <ion-icon :icon="notificationsOutline" class="ml-10 text-2xl text-[#BA6900] sm:text-[#502800]" />
        <div v-if="notificationCount > 0"
          class="absolute flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-600 rounded-full -top-1 -right-2">
          {{ notificationCount }}
        </div>
      </div>

      <div class="flex items-center justify-center bg-primary w-[70px] h-[50px] rounded-[10px]">
        <img :src="imageUr1" alt="Logo" class="w-[55px] h-[35px]" />
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { searchOutline, reorderThree, chevronUp, diamond, extensionPuzzle, logoAppleAppstore, notificationsOutline, server, } from 'ionicons/icons'
import headerTemplate from './headerTemplate.vue'
import headerIcon from './headerIcon.vue'

const imageUr1 = ref('image/logoauto.png')
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
