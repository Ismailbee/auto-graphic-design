<template>
  <div class="auto-design-dropdown" ref="dropdownRef">
    <button 
      class="dropdown-trigger" 
      @click="toggleDropdown"
      :class="{ active: isOpen }"
    >
      Auto Design
      <svg 
        class="dropdown-arrow" 
        :class="{ rotated: isOpen }"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition name="dropdown-fade">
      <div v-if="isOpen" class="dropdown-menu">
        <div class="dropdown-content">
          <button
            v-for="category in categories"
            :key="category"
            class="dropdown-item"
            :class="{ 'is-loading': loadingCategory === category }"
            :disabled="loadingCategory !== null"
            @click="selectCategory(category)"
          >
            <span v-if="loadingCategory === category" class="item-spinner"></span>
            <span class="category-name">{{ category }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const loadingCategory = ref<string | null>(null)

const categories = [
  'Naming Ceremony',
  'Sticker',
  'Receipt',
  'Invoice',
  'Letter Head',
  'Exercise Book',
  'Calendar',
  'Flyer',
  'Flex/Banner',
  'Branding',
  'Table Calendar',
  'Roll-up Stand',
  'Business Card',
  'Tag',
  'Magazine',
  'Journal',
  'Book',
  'Register/Diary',
  'Forms',
  'Clock Design',
  'Label',
  'Cloth',
  'Status Design'
]

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectCategory = (category: string) => {
  // Show immediate loading feedback
  loadingCategory.value = category
  
  console.log('🎯 Selected category:', category)
  const formattedCategory = category.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')
  console.log('🔀 Formatted category:', formattedCategory)
  console.log('🚀 Navigating to:', `/auto-design?category=${formattedCategory}`)
  
  // Navigate to Auto Design page with the selected category
  router.push({
    path: '/auto-design',
    query: { category: formattedCategory }
  })
  
  // Close dropdown after short delay to show the loading state
  setTimeout(() => {
    isOpen.value = false
    loadingCategory.value = null
  }, 150)
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.auto-design-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  position: relative;
}

.dropdown-trigger:hover {
  color: #06b6d4;
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.1);
}

.dropdown-trigger.active {
  color: #06b6d4;
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.15);
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 280px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in dropdown */
}

.dropdown-content {
  max-height: 500px;
  overflow-y: auto;
  padding: 8px;
}

.dropdown-content::-webkit-scrollbar {
  display: none;
  width: 0px;
}

.dropdown-content::-webkit-scrollbar-track {
  display: none;
}

.dropdown-content::-webkit-scrollbar-thumb {
  display: none;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  display: none;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(6, 182, 212, 0.1);
}

.dropdown-item.is-loading {
  background: rgba(6, 182, 212, 0.15);
  pointer-events: none;
}

.dropdown-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.item-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #06b6d4;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.category-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

/* Dropdown fade animation */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.3s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .dropdown-menu {
    min-width: 240px;
    max-height: 400px;
  }

  .dropdown-content {
    max-height: 400px;
  }

  .dropdown-item {
    padding: 10px 14px;
  }

  .category-name {
    font-size: 13px;
  }
}
</style>

