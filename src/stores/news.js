import { defineStore } from 'pinia'
import { newsArticles } from '../data/mockData.js'

export const useNewsStore = defineStore('news', {
  state: () => ({
    articles: [...newsArticles],
    currentPage: 1,
    articlesPerPage: 6,
    searchQuery: '',
    selectedCategory: 'All',
    categories: ['All', 'Nigeria News', 'International News', 'Technology', 'Sports']
  }),

  getters: {
    filteredArticles: (state) => {
      let filtered = state.articles

      // Filter by search query
      if (state.searchQuery) {
        filtered = filtered.filter(article => 
          article.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      }

      // Filter by category
      if (state.selectedCategory !== 'All') {
        filtered = filtered.filter(article => article.category === state.selectedCategory)
      }

      return filtered
    },

    paginatedArticles: (state) => {
      const filtered = state.filteredArticles
      const start = (state.currentPage - 1) * state.articlesPerPage
      const end = start + state.articlesPerPage
      return filtered.slice(start, end)
    },

    totalPages: (state) => {
      return Math.ceil(state.filteredArticles.length / state.articlesPerPage)
    },

    nigeriaNews: (state) => {
      return state.articles.filter(article => article.category === 'Nigeria News')
    },

    internationalNews: (state) => {
      return state.articles.filter(article => article.category === 'International News')
    }
  },

  actions: {
    setSearchQuery(query) {
      this.searchQuery = query
      this.currentPage = 1 // Reset to first page when searching
    },

    setCategory(category) {
      this.selectedCategory = category
      this.currentPage = 1 // Reset to first page when filtering
    },

    setCurrentPage(page) {
      this.currentPage = page
    },

    getArticleById(id) {
      return this.articles.find(article => article.id === parseInt(id))
    },

    // Simulate loading more articles for infinite scroll
    loadMoreArticles() {
      // In a real app, this would fetch from an API
      const newArticles = [
        {
          id: Date.now(),
          title: "Breaking: New Development in Technology",
          image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
          category: "Technology",
          timestamp: new Date().toISOString(),
          description: "Latest technological advancement making headlines worldwide.",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        }
      ]
      this.articles.push(...newArticles)
    }
  },

  persist: true
})