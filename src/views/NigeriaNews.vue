<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/news"></ion-back-button>
        </ion-buttons>
        <ion-title>Nigeria News</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleSearch">
            <ion-icon :icon="searchOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="nigeria-news-container">
        <!-- Header Section -->
        <div class="header-section bg-green-600 text-white p-6 mb-6">
          <div class="flex items-center gap-3 mb-2">
            <ion-icon :icon="flagOutline" class="text-2xl"></ion-icon>
            <h1 class="text-2xl font-bold">Nigeria News</h1>
          </div>
          <p class="opacity-90">Stay updated with the latest happenings across Nigeria</p>
        </div>

        <!-- Search Section -->
        <div class="search-section px-4 mb-6" v-if="showSearch">
          <ion-searchbar 
            v-model="searchQuery"
            placeholder="Search Nigeria news..."
            @ionInput="handleSearch"
          ></ion-searchbar>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <ion-spinner></ion-spinner>
          <p class="mt-2 text-gray-600">Loading news...</p>
        </div>

        <!-- News Grid -->
        <div v-else class="news-grid px-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article 
              v-for="article in filteredArticles" 
              :key="article.id"
              class="news-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              @click="viewArticle(article.id)"
            >
              <div class="relative">
                <img 
                  :src="article.image" 
                  :alt="article.title"
                  class="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div class="absolute top-3 right-3">
                  <ion-chip color="success" size="small">
                    Nigeria
                  </ion-chip>
                </div>
              </div>
              
              <div class="p-4">
                <h3 class="font-bold text-lg mb-2 line-clamp-2 text-gray-800">
                  {{ article.title }}
                </h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                  {{ article.description }}
                </p>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <ion-icon :icon="timeOutline" class="text-sm"></ion-icon>
                    <span>{{ formatDate(article.timestamp) }}</span>
                  </div>
                  
                  <ion-button 
                    fill="clear" 
                    size="small"
                    color="primary"
                  >
                    Read More
                    <ion-icon :icon="arrowForwardOutline" slot="end"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty State -->
          <div v-if="filteredArticles.length === 0" class="text-center py-12">
            <ion-icon :icon="newspaperOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
            <p class="text-gray-500">Try adjusting your search terms</p>
          </div>

          <!-- Pagination -->
          <div class="pagination-section mt-8 mb-6" v-if="totalPages > 1">
            <div class="flex justify-center items-center gap-2">
              <ion-button 
                fill="outline" 
                size="small"
                :disabled="currentPage === 1"
                @click="previousPage"
              >
                <ion-icon :icon="chevronBackOutline"></ion-icon>
                Previous
              </ion-button>

              <div class="flex gap-1">
                <ion-button
                  v-for="page in visiblePages"
                  :key="page"
                  :fill="currentPage === page ? 'solid' : 'outline'"
                  size="small"
                  @click="setPage(page)"
                >
                  {{ page }}
                </ion-button>
              </div>

              <ion-button 
                fill="outline" 
                size="small"
                :disabled="currentPage === totalPages"
                @click="nextPage"
              >
                Next
                <ion-icon :icon="chevronForwardOutline"></ion-icon>
              </ion-button>
            </div>

            <p class="text-center text-sm text-gray-500 mt-3">
              Showing {{ startItem }} - {{ endItem }} of {{ totalArticles }} articles
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonChip, IonSearchbar, IonSpinner, IonBackButton
} from '@ionic/vue'
import { 
  searchOutline, flagOutline, timeOutline, arrowForwardOutline,
  chevronBackOutline, chevronForwardOutline, newspaperOutline
} from 'ionicons/icons'
import { useNewsStore } from '../stores/news.js'

const router = useRouter()
const newsStore = useNewsStore()

// Reactive state
const showSearch = ref(false)
const searchQuery = ref('')
const loading = ref(false)

// Computed properties
const filteredArticles = computed(() => {
  let articles = newsStore.nigeriaNews
  
  if (searchQuery.value) {
    articles = articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // Paginate the filtered articles
  const start = (currentPage.value - 1) * articlesPerPage.value
  const end = start + articlesPerPage.value
  return articles.slice(start, end)
})

const totalArticles = computed(() => {
  let articles = newsStore.nigeriaNews
  
  if (searchQuery.value) {
    articles = articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return articles.length
})

const currentPage = ref(1)
const articlesPerPage = ref(6)
const totalPages = computed(() => Math.ceil(totalArticles.value / articlesPerPage.value))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const startItem = computed(() => (currentPage.value - 1) * articlesPerPage.value + 1)
const endItem = computed(() => Math.min(currentPage.value * articlesPerPage.value, totalArticles.value))

// Methods
const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    searchQuery.value = ''
  }
}

const handleSearch = (event) => {
  searchQuery.value = event.target.value
  currentPage.value = 1 // Reset to first page when searching
}

const viewArticle = (articleId) => {
  router.push(`/news/${articleId}`)
}

const setPage = (page) => {
  currentPage.value = page
  // Scroll to top when changing pages
  document.querySelector('ion-content').scrollToTop(300)
}

const previousPage = () => {
  if (currentPage.value > 1) {
    setPage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    setPage(currentPage.value + 1)
  }
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loading.value = true
  
  // Simulate loading delay
  setTimeout(() => {
    loading.value = false
  }, 800)
})
</script>

<style scoped>
.nigeria-news-container {
  max-width: 1200px;
  margin: 0 auto;
}

.news-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.news-card:hover {
  transform: translateY(-4px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.header-section {
  border-radius: 0 0 20px 20px;
}

.pagination-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 2rem;
}
</style>