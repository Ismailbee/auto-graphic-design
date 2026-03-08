<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click="closeModal" @wheel="handleWheel" @touchmove="handleTouchMove">
        <div class="modal-container" @click.stop>
          <!-- Close Button -->
          <button class="close-button" aria-label="Close menu" @click="closeModal">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Modal Header -->
            <div class="modal-header">
              <h2 class="modal-title">Auto Design</h2>
              <p class="modal-subtitle">Choose a category to start a design</p>
              
              <!-- Search Bar -->
              <div class="search-container">
                <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  v-model="searchQuery"
                  type="text"
                  class="search-input"
                  placeholder="Search categories..."
                  @input="handleSearch"
                />
                <button 
                  v-if="searchQuery"
                  class="clear-search"
                  aria-label="Clear search"
                  @click="clearSearch"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Categories Grid -->
            <div class="categories-grid">
              <button
                v-for="category in filteredCategories"
                :key="category.name"
                class="category-card"
                @click="selectCategory(category.name)"
              >
                <div class="category-image">
                  <img :src="category.image" :alt="category.name" />
                </div>
                <div class="category-info">
                  <h4 class="category-title">{{ category.name }}</h4>
                  <p class="category-desc">Start a {{ category.name.toLowerCase() }} design</p>
                </div>
                <svg class="item-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <!-- No Results Message -->
              <div v-if="filteredCategories.length === 0" class="no-results">
                <svg class="no-results-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="no-results-text">No categories found</p>
                <p class="no-results-subtext">Try a different search term</p>
              </div>
            </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const searchQuery = ref('')

const closeModal = () => emit('close')

const categories = [
  { name: 'Invoice/Receipt', image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=100&h=100&fit=crop' },
  { name: 'Sticker', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop' },
  { name: 'Letter Head', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=100&h=100&fit=crop' },
  { name: 'Exercise Book', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&h=100&fit=crop' },
  { name: 'Calendar', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=100&h=100&fit=crop' },
  { name: 'Flyer', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop' },
  { name: 'Flex/Banner', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop' },
  { name: 'Branding', image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=100&h=100&fit=crop' },
  { name: 'Table Calendar', image: 'https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?w=100&h=100&fit=crop' },
  { name: 'Roll-up Stand', image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=100&h=100&fit=crop' },
  { name: 'Business Card', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100&h=100&fit=crop' },
  { name: 'Tag', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=100&h=100&fit=crop' },
  { name: 'Magazine', image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=100&h=100&fit=crop' },
  { name: 'Journal', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&h=100&fit=crop' },
  { name: 'Book', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&h=100&fit=crop' },
  { name: 'Register/Diary', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=100&h=100&fit=crop' },
  { name: 'Forms', image: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=100&h=100&fit=crop' },
  { name: 'Clock Design', image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=100&h=100&fit=crop' },
  { name: 'Label', image: 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=100&h=100&fit=crop' },
  { name: 'Cloth', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=100&h=100&fit=crop' },
  { name: 'Status Design', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop' }
]

// Computed property to filter categories based on search query
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories
  
  const query = searchQuery.value.toLowerCase().trim()
  return categories.filter(category => 
    category.name.toLowerCase().includes(query)
  )
})

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')

const selectCategory = (category: string) => {
  // Special handling for Invoice/Receipt - route to dedicated page
  if (category === 'Invoice/Receipt') {
    router.push({ path: '/invoice-receipt' })
  } 
  // Special handling for Letter Head - route to templates dashboard
  else if (category === 'Letter Head') {
    router.push({ path: '/letterhead' })
  } 
  else {
    router.push({ path: '/auto-design', query: { category: slugify(category) } })
  }
  closeModal()
}

const clearSearch = () => {
  searchQuery.value = ''
}

const handleSearch = () => {
  // Search is handled by the computed property
  // This function is kept for potential future use (e.g., analytics)
}

// Escape to close
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) closeModal()
}

// Prevent wheel scrolling on the overlay
const handleWheel = (e: WheelEvent) => {
  if (e.target === e.currentTarget) {
    e.preventDefault()
  }
}

// Prevent touch scrolling on mobile
const handleTouchMove = (e: TouchEvent) => {
  if (e.target === e.currentTarget) {
    e.preventDefault()
  }
}

// Prevent body scroll when modal is open and clear search when closing
watch(() => props.isOpen, (newValue) => {
  /* eslint-disable no-console */
  console.log('🎯 AutoDesignModal isOpen changed:', newValue)
  if (newValue) {
    // Prevent body scroll with multiple techniques
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.documentElement.style.overflow = 'hidden'
    console.log('🚀 AutoDesignModal opened - content should be visible')
  } else {
    // Restore body scroll
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.documentElement.style.overflow = ''
    // Clear search query when modal closes
    searchQuery.value = ''
    console.log('❌ AutoDesignModal closed')
  }
  /* eslint-enable no-console */
})

onMounted(() => document.addEventListener('keydown', handleEscape))
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  // Ensure overflow is restored completely
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.documentElement.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10003;
  padding: 20px;
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: none;
}

.modal-container {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  opacity: 1;
  transform: scale(1);
  visibility: visible;
  pointer-events: auto;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-button:hover { background: rgba(0, 0, 0, 0.1); transform: rotate(90deg); }
.close-button svg { width: 20px; height: 20px; color: #64748b; }

.modal-header { padding: 40px 40px 20px; border-bottom: 1px solid #e2e8f0; }
.modal-title { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
.modal-subtitle { font-size: 15px; color: #64748b; margin: 0 0 20px; }

/* Search Bar Styles */
.search-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.search-icon {
  position: absolute;
  left: 14px;
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 44px 12px 44px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  color: #1e293b;
  background: #f8fafc;
  transition: all 0.2s ease;
  outline: none;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  background: white;
  border-color: #06b6d4;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}

.clear-search {
  position: absolute;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2e8f0;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.clear-search:hover {
  background: #cbd5e1;
  transform: scale(1.05);
}

.clear-search svg {
  width: 14px;
  height: 14px;
  color: #64748b;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 24px 40px 40px;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.category-card:hover { background: rgba(6, 182, 212, 0.08); transform: translateY(-2px); border-color: #06b6d4; }

.category-image {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f1f5f9;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-info { flex: 1; }
.category-title { margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; }
.category-desc { margin: 2px 0 0; font-size: 13px; color: #64748b; }

.item-arrow { width: 16px; height: 16px; color: #94a3b8; opacity: 0; transition: all 0.2s ease; }
.category-card:hover .item-arrow { opacity: 1; transform: translateX(2px); }

/* No Results Styles */
.no-results {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.no-results-icon {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.no-results-text {
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 8px;
}

.no-results-subtext {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

/* Modal animations */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from .modal-container {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-fade-leave-to .modal-container {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

/* Hide Scrollbar */
.modal-container::-webkit-scrollbar { display: none; width: 0px; }
.modal-container::-webkit-scrollbar-track { display: none; }
.modal-container::-webkit-scrollbar-thumb { display: none; }
.modal-container::-webkit-scrollbar-thumb:hover { display: none; }

/* Responsive */
@media (max-width: 768px) {
  .modal-container { border-radius: 16px; max-height: 85vh; }
  .modal-header { padding: 30px 24px 16px; }
  .modal-title { font-size: 24px; }
  .modal-subtitle { font-size: 14px; }
  .categories-grid { grid-template-columns: 1fr; gap: 12px; padding: 20px 24px 32px; }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .categories-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
