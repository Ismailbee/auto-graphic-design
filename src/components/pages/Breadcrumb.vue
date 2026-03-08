<template>
  <nav class="sm:flex hidden items-center text-sm space-x-2">
    <!-- Previous page link -->
    <span
      v-if="prevPageName && prevPageRoute"
      @click="goToPrev"
      class="text-gray-500 hover:text-primary cursor-pointer transition-colors duration-200"
    >
      {{ prevPageName }}
    </span>

    <!-- Separator -->
    <span v-if="prevPageName" class="text-gray-400"> &gt; </span>

    <!-- Current page -->
    <span class="text-gray-800 font-medium">
      {{ currentPageName }}
    </span>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  prevPageName: { type: String, default: '' },
  prevPageRoute: { type: String, default: '' },
  currentPageName: { type: String, required: true }
})

const router = useRouter()

const goToPrev = () => {
  if (props.prevPageRoute) {
    router.push(props.prevPageRoute)
  }
}
</script>

<style scoped>
/* Optional: can customize colors via Tailwind classes instead */
</style>
