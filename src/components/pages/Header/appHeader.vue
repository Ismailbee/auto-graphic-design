<template>
  <div class="fixed top-0 left-0 z-50 flex items-center justify-between w-full px-4 py-3 bg-white shadow-md">
    
    <!-- Left Section -->
    <div class="flex items-center space-x-3">
      <ion-icon :icon="menuOutline" class="text-2xl text-[#502800] cursor-pointer hidden" @click="$emit('menuClick')" />
      <img src="/public/image/logoauto.png" alt="Logo" class="w-auto h-8" />
    </div>

    <!-- Middle Section -->
         <div class="w-[200px] md:w-[300px] relative">
      <input
        v-model="searchText"
        type="text"
        placeholder="Search..."
        class="w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-full focus:ring-[#BA6900] focus:outline-none transition duration-300"
      />
      <ion-icon :icon="searchOutline" class="absolute text-lg text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
    </div>
  

    <!-- Right Section (Search Bar) -->
  <div class="hidden md:flex items-center space-x-6 text-[#502800] font-semibold">
      <a @click="navigateTo('/home')" class="cursor-pointer hover:text-[#BA6900]">Home</a>
      <a @click="navigateTo('/about')" class="cursor-pointer hover:text-[#BA6900]">About</a>
      <a @click="navigateTo('/contact')" class="cursor-pointer hover:text-[#BA6900]">Contact</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { searchOutline, menuOutline } from 'ionicons/icons'

const searchText = ref('')
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
