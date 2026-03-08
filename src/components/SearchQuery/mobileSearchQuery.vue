<template>
  <div>
    <!-- Search Icon -->
    <ion-icon
      :icon="searchOutline"
      class="mt-2 text-2xl text-white cursor-pointer sm:hidden"
      @click="toggleOverlay"
    />

    <!-- Overlay -->
    <div v-if="showOverlay" class="fixed z-50 flex items-center justify-center px-4 left-9 top-20">
      <div class="relative w-[300px] max-w-md">
        <!-- Input Field -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="w-full text-black max-w-[700px] pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2  focus:border-transparent transition duration-300 bg-[#eeee] sm:bg-gradient-to-t from-[#D2D3D5] via-[#F1F1F2] to-white"
        />

        <!-- Icon inside input -->
        <div class="absolute text-gray-400 -translate-y-1/2 top-7 left-4">
          <ion-icon :icon="searchOutline" class="text-lg"></ion-icon>
        </div>

        <!-- Close icon -->
        <ion-icon
          :icon="closeOutline"
          @click="toggleOverlay"
          class="absolute text-xl text-gray-600 translate-y-1/2 cursor-pointer right-4 top-[0px]"
        />

        <!-- Results -->
        <ul v-if="searchQuery" class="mt-4 bg-white divide-y divide-gray-200 rounded-lg shadow max-h-[300px] overflow-y-auto">
          <li
            v-for="item in filteredResults"
            :key="item.id"
            class="p-3 text-sm text-black hover:bg-[#f6ebcd] cursor-pointer"
            @click="navigateTo(item.path)"
          >
            {{ item.title }}
          </li>
          <li v-if="filteredResults.length === 0" class="p-3 italic text-gray-400">
            No results found.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { searchOutline, closeOutline } from 'ionicons/icons'

const router = useRouter()
const showOverlay = ref(false)
const searchQuery = ref('')

const toggleOverlay = () => {
  showOverlay.value = !showOverlay.value
}

const items = [
  { id: 1, title: 'App Header', path: '/app-header' },
  { id: 2, title: 'My Account', path: '/my-account' },
  { id: 3, title: 'Scheduling', path: '/scheduling' },
  { id: 4, title: 'Video Page', path: '/videoPage' },
]

const filteredResults = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return items.filter(item => item.title.toLowerCase().includes(query))
})

function navigateTo(path) {
  router.push(path)
  toggleOverlay()
}
</script>
