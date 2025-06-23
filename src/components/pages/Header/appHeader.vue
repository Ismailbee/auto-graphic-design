<template>
  <!-- tailwindcss-intellisense-disable-next-line -->
  <div class="fixed top-0 left-0 z-40 justify-between flex items-center sm:justify-between w-full h-[75px] px-4 py-3 bg-[#f6ebcd]">
    
    <div class="flex items-center justify-center ml-5 transition cursor-pointer sm:hidden"
      @click="$emit('toggle')" >
      <ion-icon
        :icon="reorderThree"
        :class="[
          'text-[30px] transition-colors duration-200',
          showHeader ? 'text-brown' : 'text-brown'
        ]"
      />
    </div>

    <!-- Left Section -->
    <div class="items-center flex-shrink-0 hidden gap-3 ml-10 sm:flex">
      <headerTemplate :icon="extensionPuzzle" label="Template" :label-icon="chevronUp"/>
      <header-icon :icon="logoAppleAppstore" label="My Edit" @click="navigateTo('/myeditPage')" />
      <header-icon :icon="server" label="Token" @click="navigateTo('/tokenPage')" />
      <header-icon :icon="diamond" label="Reward" @click="navigateTo('/rewardPage')" />
    </div>

    <!-- Middle Section (Search Bar) -->
    <!-- tailwindcss-intellisense-disable-next-line -->
    <div class="relative hidden ml-10 sm:flex justify-center sm:visible flex-1 px-4 max-w-[500px]">
      <input 
        type="text"
        placeholder="Search..."
        class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-[#BA6900] bg-gradient-to-t from-[#f7f7f7] via-[#ffffff] to-white"
      />
      <!-- tailwindcss-intellisense-disable-next-line -->
      <div class="absolute text-gray-400 transform -translate-y-1/2 left-7 top-6">
        <ion-icon :icon="searchOutline" class="text-lg"></ion-icon>
      </div>
    </div>

    <!-- Right Section -->
    <!-- tailwindcss-intellisense-disable-next-line -->
    <div class="flex items-center justify-end flex-shrink-0 gap-4 mr-7 sm:justify-center">
      
      <div class="flex items-center justify-end">
        <ion-icon
          v-if="showHeader"
          :icon="searchOutline"
          class="sm:hidden text-2xl mt-2 text-[#BA6900]"
        />

        <!-- tailwindcss-intellisense-disable-next-line -->
        <div class="flex items-center justify-end relative w-[35px] pt-2 cursor-pointer" @click="navigateToNotifications">
          <ion-icon :icon="notificationsOutline" class="text-2xl text-[#BA6900] sm:text-[#502800]" />
          <div v-if="notificationCount > 0"
            class="absolute flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-600 rounded-full top-1 -right-1">
            {{ notificationCount }}
          </div>
        </div>
      </div>

      <!-- tailwindcss-intellisense-disable-next-line -->
      <div class="flex items-center justify-center bg-primary w-[55px] h-[35px] rounded-[10px]">
        <img :src="imageUrl" alt="Logo" class="w-[40px] h-[25px]" />
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'
import { searchOutline, reorderThree, chevronUp, diamond, extensionPuzzle, logoAppleAppstore, notificationsOutline, server, } from 'ionicons/icons'
import { useNotification } from '@/composables/useNotification'
import headerTemplate from '../Header/headerTemplate.vue'
import headerIcon from '../Header/headerIcon.vue'

const imageUrl = ref('image/logoauto.png')
const router = useRouter()

function navigateTo(path) {
  router.push(path)
}

defineProps({
  showHeader: Boolean
})

const { notificationCount } = useNotification()
function navigateToNotifications() {
  router.push('/notifications')
}

let intervalId;



onUnmounted(() => {
  clearInterval(intervalId);
});

</script>

<style scoped>
/* Optional extra spacing below the header if it's fixed */
body {
  padding-top: 72px;
}
</style>