<template>
  
    <div class="relative sm:w-[700px]  w-[300px] flex items-center justify-center">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Search..."
        class="w-full h-[45px] text-black max-w-[700px] pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2  focus:border-transparent transition duration-300 bg-[#eeee] sm:bg-gradient-to-t from-[#D2D3D5] via-[#F1F1F2] to-white"
      />

      <!-- Search results -->
      <div v-if="searchQuery" class="mt-4 sm:w-[700px] w-[300px] mx-auto absolute top-[60px] z-10">
        <ul class="bg-white divide-y divide-gray-200 rounded-lg shadow">
          <li
            v-for="item in filteredResults"
            :key="item.id"
            class="p-3 text-sm hover:bg-[#f6ebcd] cursor-pointer"
            @click="navigateTo(item.path)"
          >
            {{ item.title }}
          </li>
          <li v-if="filteredResults.length === 0" class="p-3 italic text-gray-400">
            No results found.
          </li>
        </ul>
      </div>

      <div class="absolute text-gray-400 transform -translate-y-1/2 left-4 top-6">
        <ion-icon :icon="searchOutline" class="text-lg"></ion-icon>
      </div>
    </div>

</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { searchOutline } from 'ionicons/icons'

const router = useRouter()
const searchQuery = ref('')

const items = ref([
  { id: 1, title: 'App Header', path: '/app-header', component: 'appHeader.vue' },
  { id: 2, title: 'My Account', path: '/my-account', component: 'myAccountPage.vue' },
  { id: 3, title: 'Scheduling', path: '/scheduling' },
  { id: 4, title: 'Video Page', path: '/videoPage' },
])

const filteredResults = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item => item.title.toLowerCase().includes(query))
})

function navigateTo(path) {
  router.push(path)
}
</script>
