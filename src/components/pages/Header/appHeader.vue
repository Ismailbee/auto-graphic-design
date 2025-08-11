<template>
  <!-- tailwindcss-intellisense-disable-next-line -->
  <div class="fixed top-0 left-0 z-40 justify-between flex items-center sm:justify-between md:w-full  w-full h-[75px] px-4 py-3 bg-[#f6ebcd]  whitespace-nowrap">
    
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
    <div class="items-center md:w-[100px] lg:w-[250px] flex-shrink-0 hidden gap-3 ml-10 md:ml-5 sm:flex">
      <headerTemplate :icon="logoSlack" label="Template" :label-icon="chevronUp"/>
      <header-icon :icon="logoAppleAppstore" label="My Edit" @click="navigateTo('/myeditPage')" />
      <header-icon :icon="server" label="Token" @click="navigateTo('/tokenPage')" />
      <header-icon :icon="diamond" label="Reward" @click="navigateTo('/rewardPage')" />
    </div>

    <!-- Middle Section (Search Bar) -->
    <!-- tailwindcss-intellisense-disable-next-line -->
    <div class="relative hidden lg:flex ml-[226px] sm:flex justify-center sm:visible px-4 md:w-[250px] w-full lg:w-[600px] text-black">
      <SearchQuery />
    </div>

   
    <!-- tailwindcss-intellisense-disable-next-line -->
 <!-- Right Section -->
<div
  class="flex items-center justify-end flex-shrink-0 min-w-0 gap-3 mr- sm:justify-end sm:flex-nowrap"
>
  <div v-if="showHeader" >
    <mobileSearchQuery />
  </div>

    <!-- Profile Image Dropdown Trigger -->
  <div   class="relative ">
    <div
      @click="toggleDropdown"
      class="cursor-pointer rounded-full w-[30px] h-[30px] overflow-hidden border-2 border-contrast"
    >
      <img
        :src="userStore.profileImageUrl || '/default-profile.png'"
        alt="Profile"
        class="object-cover w-full h-full"
      />
    </div>

    <myAccountDrop v-if="showDropdown" />
  </div>

  <div
    class="relative flex items-center justify-end pt-2 cursor-pointer shrink-0"
    @click="navigateToNotifications"
  >
    <ion-icon :icon="notificationsOutline" class="text-2xl" />
    <div
      v-if="notificationCount > 0"
      class="absolute flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-600 rounded-full top-1 -right-1"
    >
      {{ notificationCount }}
    </div>
  </div>

  <div
    class="flex items-center justify-center bg-primary w-[50px] h-[30px] rounded-[8px] shrink-0"
  >
    <img :src="imageUrl" alt="Logo" class="w-[35px] h-[22px]" />
  </div>
</div>


  </div>
</template>



<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { logoSlack, reorderThree, chevronUp, diamond, logoAppleAppstore, notificationsOutline, server, } from 'ionicons/icons'
import { useNotification } from '@/composables/useNotification'
import headerTemplate from '../Header/headerTemplate.vue'
import headerIcon from '../Header/headerIcon.vue'
import mobileSearchQuery from '../../SearchQuery/mobileSearchQuery.vue';
import SearchQuery from '../../SearchQuery/SearchQuery.vue';
import myAccountDrop from '../SideBar/sidBarContent/myAccount/myAccountDrop.vue'

const userStore = useUserStore()
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

const showDropdown = ref(false)
function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}
function closeDropdown() {
  showDropdown.value = false
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