<template>
  <div class="image-preview-carousel">
    <Swiper
      :modules="modules"
      :slides-per-view="'auto'"
      :space-between="12"
      :navigation="images.length > 3"
      :pagination="{ clickable: true }"
      :scrollbar="{ draggable: true }"
      class="image-swiper"
    >
      <SwiperSlide
        v-for="(image, index) in images"
        :key="index"
        class="image-slide"
      >
        <div class="image-card">
          <!-- Remove Button -->
          <button
            @click="handleRemove(index)"
            class="remove-button"
            title="Remove image"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Image Preview -->
          <div class="image-preview">
            <img
              :src="getImageUrl(image)"
              :alt="`Image ${index + 1}`"
              class="preview-img"
            />
          </div>

          <!-- Image Info -->
          <div class="image-info">
            <p class="image-name">{{ image.name }}</p>
            <p class="image-size">{{ formatFileSize(image.size) }}</p>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- Image Counter -->
    <div class="image-counter">
      <span class="counter-text">{{ images.length }} image{{ images.length !== 1 ? 's' : '' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Scrollbar } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'

interface Props {
  images: File[]
}

interface Emits {
  (e: 'remove', index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modules = [Navigation, Pagination, Scrollbar]
const imageUrls = ref<Map<File, string>>(new Map())

onMounted(() => {
  // Create object URLs for all images
  props.images.forEach(file => {
    if (!imageUrls.value.has(file)) {
      imageUrls.value.set(file, URL.createObjectURL(file))
    }
  })
})

onUnmounted(() => {
  // Cleanup object URLs
  imageUrls.value.forEach(url => URL.revokeObjectURL(url))
  imageUrls.value.clear()
})

function getImageUrl(file: File): string {
  if (!imageUrls.value.has(file)) {
    const url = URL.createObjectURL(file)
    imageUrls.value.set(file, url)
    return url
  }
  return imageUrls.value.get(file)!
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function handleRemove(index: number) {
  emit('remove', index)
}
</script>

<style scoped>
.image-preview-carousel {
  @apply relative;
}

.image-swiper {
  @apply w-full pb-8;
}

.image-slide {
  @apply w-auto;
  width: 200px !important;
}

.image-card {
  @apply relative bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200;
}

.remove-button {
  @apply absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors duration-200 shadow-lg;
}

.image-preview {
  @apply w-full h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden;
}

.preview-img {
  @apply w-full h-full object-cover;
}

.image-info {
  @apply p-3 border-t border-gray-200 dark:border-gray-600;
}

.image-name {
  @apply text-xs font-medium text-gray-900 dark:text-white truncate mb-1;
}

.image-size {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.image-counter {
  @apply mt-2 text-center;
}

.counter-text {
  @apply text-xs text-gray-600 dark:text-gray-400 font-medium;
}

/* Swiper Navigation Buttons */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  @apply text-cyan-600 dark:text-cyan-400;
  width: 30px;
  height: 30px;
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 20px;
}

/* Swiper Pagination */
:deep(.swiper-pagination-bullet) {
  @apply bg-gray-400 dark:bg-gray-600;
}

:deep(.swiper-pagination-bullet-active) {
  @apply bg-cyan-600 dark:bg-cyan-400;
}

/* Swiper Scrollbar */
:deep(.swiper-scrollbar) {
  @apply bg-gray-200 dark:bg-gray-700;
}

:deep(.swiper-scrollbar-drag) {
  @apply bg-cyan-600 dark:bg-cyan-400;
}
</style>

