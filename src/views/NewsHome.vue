<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Newsline</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openSearch">
            <ion-icon :icon="searchOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="news-home-container">
        <!-- Hero Section -->
        <div class="hero-section bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 mb-6">
          <h1 class="text-3xl font-bold mb-2">Stay Informed</h1>
          <p class="text-lg opacity-90">Latest news from Nigeria and around the world</p>
        </div>

        <!-- Quick Navigation -->
        <div class="quick-nav grid grid-cols-2 gap-4 px-4 mb-6">
          <ion-card class="nav-card" @click="navigateTo('/nigeria-news')">
            <ion-card-content class="text-center py-6">
              <ion-icon :icon="flagOutline" class="text-3xl text-green-600 mb-2"></ion-icon>
              <h3 class="font-semibold">Nigeria News</h3>
              <p class="text-sm text-gray-600">Local updates</p>
            </ion-card-content>
          </ion-card>

          <ion-card class="nav-card" @click="navigateTo('/international-news')">
            <ion-card-content class="text-center py-6">
              <ion-icon :icon="globeOutline" class="text-3xl text-blue-600 mb-2"></ion-icon>
              <h3 class="font-semibold">International</h3>
              <p class="text-sm text-gray-600">Global updates</p>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Search and Filter -->
        <div class="search-filter-section px-4 mb-6" v-if="showSearch">
          <div class="flex gap-3 mb-4">
            <ion-searchbar 
              v-model="searchQuery"
              placeholder="Search news..."
              @ionInput="handleSearch"
              class="flex-1"
            ></ion-searchbar>
            <ion-button fill="outline" @click="toggleFilters">
              <ion-icon :icon="filterOutline"></ion-icon>
            </ion-button>
          </div>

          <div class="filter-chips flex gap-2 overflow-x-auto pb-2" v-if="showFilters">
            <ion-chip 
              v-for="category in categories" 
              :key="category"
              :color="selectedCategory === category ? 'primary' : 'medium'"
              @click="setCategory(category)"
            >
              {{ category }}
            </ion-chip>
          </div>
        </div>

        <!-- Featured Articles -->
        <div class="featured-section px-4 mb-6">
          <h2 class="text-xl font-bold mb-4">Featured Stories</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <article 
              v-for="article in featuredArticles" 
              :key="article.id"
              class="article-card bg-white rounded-lg shadow-md overflow-hidden"
              @click="viewArticle(article.id)"
            >
              <div class="relative">
                <img 
                  :src="article.image" 
                  :alt="article.title"
                  class="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div class="absolute top-2 left-2">
                  <ion-chip :color="getCategoryColor(article.category)" size="small">
                    {{ article.category }}
                  </ion-chip>
                </div>
              </div>
              
              <div class="p-4">
                <h3 class="font-semibold text-lg mb-2 line-clamp-2">{{ article.title }}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-3">{{ article.description }}</p>
                
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>{{ formatDate(article.timestamp) }}</span>
                  <ion-button fill="clear" size="small">
                    Read More
                    <ion-icon :icon="arrowForwardOutline" slot="end"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="text-center px-4 mb-6">
          <ion-button 
            expand="block" 
            fill="outline"
            @click="loadMoreArticles"
            :disabled="loading"
          >
            <ion-spinner v-if="loading" slot="start"></ion-spinner>
            {{ loading ? 'Loading...' : 'Load More Stories' }}
          </ion-button>
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
  IonIcon, IonCard, IonCardContent, IonSearchbar, IonChip, IonSpinner
} from '@ionic/vue'
import { 
  searchOutline, flagOutline, globeOutline, filterOutline, 
  arrowForwardOutline 
} from 'ionicons/icons'
import { useNewsStore } from '../stores/news.js'

const router = useRouter()
const newsStore = useNewsStore()

// Reactive state
const showSearch = ref(false)
const showFilters = ref(false)
const loading = ref(false)
const searchQuery = ref('')

// Computed properties
const featuredArticles = computed(() => newsStore.paginatedArticles)
const categories = computed(() => newsStore.categories)
const selectedCategory = computed(() => newsStore.selectedCategory)

// Methods
const navigateTo = (path) => {
  router.push(path)
}

const openSearch = () => {
  showSearch.value = !showSearch.value
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const handleSearch = (event) => {
  searchQuery.value = event.target.value
  newsStore.setSearchQuery(searchQuery.value)
}

const setCategory = (category) => {
  newsStore.setCategory(category)
}

const viewArticle = (articleId) => {
  router.push(`/news/${articleId}`)
}

const loadMoreArticles = async () => {
  loading.value = true
  
  setTimeout(() => {
    newsStore.loadMoreArticles()
    loading.value = false
  }, 1000)
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getCategoryColor = (category) => {
  const colors = {
    'Nigeria News': 'success',
    'International News': 'primary',
    'Technology': 'secondary',
    'Sports': 'warning'
  }
  return colors[category] || 'medium'
}

onMounted(() => {
  // Initialize with fresh data
  newsStore.setCurrentPage(1)
})
</script>

<style scoped>
.news-home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.nav-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.nav-card:hover {
  transform: translateY(-2px);
}

.article-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

.filter-chips {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-chips::-webkit-scrollbar {
  display: none;
}

.hero-section {
  border-radius: 0 0 20px 20px;
}
</style>