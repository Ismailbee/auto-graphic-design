<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Movies & Series</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleSearch">
            <ion-icon :icon="searchOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="movies-container">
        <!-- Header Section -->
        <div class="header-section bg-gradient-to-r from-purple-600 to-red-600 text-white p-6 mb-6">
          <div class="flex items-center gap-3 mb-2">
            <ion-icon :icon="filmOutline" class="text-3xl"></ion-icon>
            <h1 class="text-2xl font-bold">Movies & Series</h1>
          </div>
          <p class="opacity-90">Download your favorite movies and series</p>
        </div>

        <!-- Search and Filters -->
        <div class="search-filter-section px-4 mb-6">
          <div class="search-bar mb-4" v-if="showSearch">
            <ion-searchbar 
              v-model="searchQuery"
              placeholder="Search movies and series..."
              @ionInput="handleSearch"
            ></ion-searchbar>
          </div>

          <!-- Filter Chips -->
          <div class="filters-section">
            <div class="filter-group mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div class="flex gap-2 overflow-x-auto pb-2">
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

            <div class="filter-group mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">Genres</label>
              <div class="flex gap-2 overflow-x-auto pb-2">
                <ion-chip 
                  v-for="genre in genres" 
                  :key="genre"
                  :color="selectedGenre === genre ? 'secondary' : 'medium'"
                  @click="setGenre(genre)"
                >
                  {{ genre }}
                </ion-chip>
              </div>
            </div>

            <div class="filter-group mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <div class="flex gap-2 overflow-x-auto pb-2">
                <ion-chip 
                  v-for="language in languages" 
                  :key="language"
                  :color="selectedLanguage === language ? 'success' : 'medium'"
                  @click="setLanguage(language)"
                >
                  {{ language }}
                </ion-chip>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <div class="flex gap-2">
                <ion-select 
                  v-model="selectedYear"
                  placeholder="Year"
                  interface="popover"
                  class="year-select"
                >
                  <ion-select-option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }}
                  </ion-select-option>
                </ion-select>

                <ion-select 
                  v-model="sortBy"
                  placeholder="Sort by"
                  interface="popover"
                  class="sort-select"
                >
                  <ion-select-option value="latest">Latest</ion-select-option>
                  <ion-select-option value="rating">Rating</ion-select-option>
                  <ion-select-option value="title">Title</ion-select-option>
                </ion-select>
              </div>

              <ion-button fill="clear" @click="clearFilters" size="small">
                Clear Filters
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <ion-spinner></ion-spinner>
          <p class="mt-2 text-gray-600">Loading movies...</p>
        </div>

        <!-- Movies Grid -->
        <div v-else class="movies-grid px-4">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <div 
              v-for="movie in filteredMovies" 
              :key="movie.id"
              class="movie-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
              @click="viewMovie(movie.id)"
            >
              <div class="relative">
                <img 
                  :src="movie.poster" 
                  :alt="movie.title"
                  class="w-full h-64 object-cover"
                  loading="lazy"
                />
                <div class="absolute top-2 left-2">
                  <ion-chip :color="getCategoryColor(movie.category)" size="small">
                    {{ movie.category }}
                  </ion-chip>
                </div>
                <div class="absolute top-2 right-2">
                  <div class="rating-badge bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    ⭐ {{ movie.rating }}
                  </div>
                </div>
              </div>
              
              <div class="p-3">
                <h3 class="font-bold text-sm mb-1 line-clamp-2">{{ movie.title }}</h3>
                <p class="text-gray-600 text-xs mb-2">{{ movie.year }} • {{ movie.language }}</p>
                
                <div class="flex items-center justify-between">
                  <div class="genre-tags">
                    <span class="text-xs text-gray-500">{{ movie.genre.slice(0, 2).join(', ') }}</span>
                  </div>
                  <ion-button 
                    size="small" 
                    fill="clear"
                    @click.stop="downloadMovie(movie.id)"
                  >
                    <ion-icon :icon="downloadOutline" class="text-lg"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredMovies.length === 0" class="text-center py-12">
            <ion-icon :icon="filmOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">No movies found</h3>
            <p class="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="stats-section px-4 mt-8 mb-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-bold mb-4 text-center">Download Statistics</h3>
            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-blue-600">{{ downloadHistory.length }}</div>
                <div class="text-sm text-gray-600">Downloads</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-600">{{ filteredMovies.length }}</div>
                <div class="text-sm text-gray-600">Available Movies</div>
              </div>
            </div>
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
  IonIcon, IonChip, IonSearchbar, IonSpinner, IonSelect, IonSelectOption
} from '@ionic/vue'
import { 
  searchOutline, filmOutline, downloadOutline
} from 'ionicons/icons'
import { useMoviesStore } from '../stores/movies.js'

const router = useRouter()
const moviesStore = useMoviesStore()

// Reactive state
const showSearch = ref(false)
const loading = ref(false)

// Computed properties
const searchQuery = computed(() => moviesStore.searchQuery)
const selectedCategory = computed(() => moviesStore.selectedCategory)
const selectedGenre = computed(() => moviesStore.selectedGenre)
const selectedLanguage = computed(() => moviesStore.selectedLanguage)
const selectedYear = computed(() => moviesStore.selectedYear)
const sortBy = computed(() => moviesStore.sortBy)

const categories = computed(() => moviesStore.categories)
const genres = computed(() => moviesStore.genres)
const languages = computed(() => moviesStore.languages)
const availableYears = computed(() => moviesStore.availableYears)

const filteredMovies = computed(() => moviesStore.filteredMovies)
const downloadHistory = computed(() => moviesStore.getDownloadHistory())

// Methods
const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handleSearch = (event) => {
  moviesStore.setSearchQuery(event.target.value)
}

const setCategory = (category) => {
  moviesStore.setCategory(category)
}

const setGenre = (genre) => {
  moviesStore.setGenre(genre)
}

const setLanguage = (language) => {
  moviesStore.setLanguage(language)
}

const clearFilters = () => {
  moviesStore.clearAllFilters()
}

const viewMovie = (movieId) => {
  router.push(`/movies/${movieId}`)
}

const downloadMovie = (movieId) => {
  const download = moviesStore.downloadMovie(movieId)
  if (download) {
    // Show success message
    alert(`Download started for ${download.title}!`)
  }
}

const getCategoryColor = (category) => {
  const colors = {
    'Hollywood': 'primary',
    'Nollywood': 'success',
    'Bollywood': 'warning',
    'Korean Drama': 'secondary',
    'Chinese Drama': 'tertiary'
  }
  return colors[category] || 'medium'
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
.movies-container {
  max-width: 1400px;
  margin: 0 auto;
}

.movie-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.movie-card:hover {
  transform: translateY(-4px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.header-section {
  border-radius: 0 0 20px 20px;
}

.filter-group {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-group::-webkit-scrollbar {
  display: none;
}

.year-select, .sort-select {
  min-width: 120px;
}

.rating-badge {
  font-size: 0.75rem;
}
</style>