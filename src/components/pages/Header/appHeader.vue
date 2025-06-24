<template>
  <!-- tailwindcss-intellisense-disable-next-line -->
  <div class="fixed top-0 left-0 z-40 justify-between flex items-center sm:justify-between w-full h-[75px] px-4 py-3 bg-[#f6ebcd]">
    
  <div
  class="flex items-center justify-center ml-5 transition cursor-pointer sm:hidden"
  @click="$emit('toggle')"
>
  <ion-icon
    :icon="reorderThree"
    :class="[
      ' text-[30px] transition-colors duration-200',
      showHeader ? ' ' : ''
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
    <div class="relative hidden ml-10 sm:flex justify-center sm:visible flex-1 px-4 max-w-[500px] text-black">
      <SearchQuery />
    </div>

    <!-- Right Section -->
    <!-- tailwindcss-intellisense-disable-next-line -->
   <!-- Right Section -->
    <div class="flex items-center justify-between flex-shrink-0 w-[120px] gap-4 mr-7 sm:justify-center">
      
      <div v-if="showHeader">
        <mobileSearchQuery />
      </div>

      <div class="flex items-center justify-between w-[100px]">
        <div class="relative flex items-center justify-end pt-2 cursor-pointer" @click="navigateToNotifications">
          <ion-icon
            :icon="notificationsOutline"
            :class="[
              'text-2xl',
              showHeader ? '' : ''
            ]"
          />
          <div v-if="notificationCount > 0"
            class="absolute flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-600 rounded-full top-1 -right-1">
            {{ notificationCount }}
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center bg-primary w-[155px] h-[35px] rounded-[10px]">
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
import mobileSearchQuery from '../../SearchQuery/mobileSearchQuery.vue';
import SearchQuery from '../../SearchQuery/SearchQuery.vue';

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

const searchQuery = ref('');
const showSearchOverlay = ref(false);

function toggleSearchOverlay() {
  showSearchOverlay.value = !showSearchOverlay.value;
}


</script>

<style scoped>
/* Optional extra spacing below the header if it's fixed */
body {
  padding-top: 72px;
}

ion-icon::part(icon) {
  stroke: none !important;
}
</style>