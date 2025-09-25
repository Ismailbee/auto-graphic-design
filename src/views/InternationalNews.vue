<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/news"></ion-back-button>
        </ion-buttons>
        <ion-title>International News</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleSearch">
            <ion-icon :icon="searchOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="international-news-container">
        <!-- Header Section -->
        <div class="header-section bg-blue-600 text-white p-6 mb-6">
          <div class="flex items-center gap-3 mb-2">
            <ion-icon :icon="globeOutline" class="text-2xl"></ion-icon>
            <h1 class="text-2xl font-bold">International News</h1>
          </div>
          <p class="opacity-90">Global updates from around the world</p>
        </div>

        <!-- Search Section -->
        <div class="search-section px-4 mb-6" v-if="showSearch">
          <ion-searchbar 
            v-model="searchQuery"
            placeholder="Search international news..."
            @ionInput="handleSearch"
          ></ion-searchbar>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <ion-spinner></ion-spinner>
          <p class="mt-2 text-gray-600">Loading international news...</p>
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
                  <ion-chip color="primary" size="small">
                    International
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
            <ion-icon :icon="globeOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">No international articles found</h3>
            <p class="text-gray-500">Try adjusting your search terms</p>
          </div>

          <!-- Load More Button -->
          <div class="text-center mt-8 mb-6" v-if="canLoadMore">
            <ion-button 
              @click="loadMore" 
              fill="outline"
              :disabled="loadingMore"
            >
              <ion-spinner v-if="loadingMore" slot="start"></ion-spinner>
              {{ loadingMore ? 'Loading...' : 'Load More Articles' }}
            </ion-button>
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
  searchOutline, globeOutline, timeOutline, arrowForwardOutline
} from 'ionicons/icons'
import { useNewsStore } from '../stores/news.js'

const router = useRouter()
const newsStore = useNewsStore()

// Reactive state
const showSearch = ref(false)
const searchQuery = ref('')
const loading = ref(false)
const loadingMore = ref(false)
const displayedArticles = ref(6) // Start with 6 articles

// Computed properties
const allInternationalArticles = computed(() => {
  let articles = newsStore.internationalNews
  
  if (searchQuery.value) {
    articles = articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return articles
})

const filteredArticles = computed(() => {
  return allInternationalArticles.value.slice(0, displayedArticles.value)
})

const canLoadMore = computed(() => {
  return displayedArticles.value < allInternationalArticles.value.length
})

// Methods
const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    searchQuery.value = ''
  }
}

const handleSearch = (event) => {
  searchQuery.value = event.target.value
  displayedArticles.value = 6 // Reset displayed count when searching
}

const viewArticle = (articleId) => {
  router.push(`/news/${articleId}`)
}

const loadMore = () => {
  loadingMore.value = true
  
  setTimeout(() => {
    displayedArticles.value += 6
    loadingMore.value = false
  }, 800)
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
.international-news-container {
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
</style>