import { defineStore } from 'pinia'
import { moviesData } from '../data/mockData.js'

export const useMoviesStore = defineStore('movies', {
  state: () => ({
    movies: [...moviesData],
    categories: ['All', 'Hollywood', 'Nollywood', 'Bollywood', 'Korean Drama', 'Chinese Drama'],
    genres: ['All', 'Action', 'Drama', 'Romance', 'Thriller', 'Sci-Fi', 'Fantasy', 'Adventure'],
    languages: ['All', 'English', 'Hindi', 'Korean', 'Mandarin'],
    searchQuery: '',
    selectedCategory: 'All',
    selectedGenre: 'All',
    selectedLanguage: 'All',
    selectedYear: 'All',
    sortBy: 'latest', // latest, rating, title
    downloads: [] // Track user downloads
  }),

  getters: {
    filteredMovies: (state) => {
      let filtered = [...state.movies]

      // Filter by search query
      if (state.searchQuery) {
        filtered = filtered.filter(movie => 
          movie.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          movie.description.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      }

      // Filter by category
      if (state.selectedCategory !== 'All') {
        filtered = filtered.filter(movie => movie.category === state.selectedCategory)
      }

      // Filter by genre
      if (state.selectedGenre !== 'All') {
        filtered = filtered.filter(movie => movie.genre.includes(state.selectedGenre))
      }

      // Filter by language
      if (state.selectedLanguage !== 'All') {
        filtered = filtered.filter(movie => movie.language === state.selectedLanguage)
      }

      // Filter by year
      if (state.selectedYear !== 'All') {
        filtered = filtered.filter(movie => movie.year.toString() === state.selectedYear)
      }

      // Sort movies
      switch (state.sortBy) {
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating)
          break
        case 'title':
          filtered.sort((a, b) => a.title.localeCompare(b.title))
          break
        case 'latest':
        default:
          filtered.sort((a, b) => b.year - a.year)
          break
      }

      return filtered
    },

    moviesByCategory: (state) => (category) => {
      return state.movies.filter(movie => movie.category === category)
    },

    availableYears: (state) => {
      const years = [...new Set(state.movies.map(movie => movie.year))]
      return ['All', ...years.sort((a, b) => b - a)]
    },

    topRatedMovies: (state) => {
      return [...state.movies]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10)
    }
  },

  actions: {
    setSearchQuery(query) {
      this.searchQuery = query
    },

    setCategory(category) {
      this.selectedCategory = category
    },

    setGenre(genre) {
      this.selectedGenre = genre
    },

    setLanguage(language) {
      this.selectedLanguage = language
    },

    setYear(year) {
      this.selectedYear = year
    },

    setSortBy(sortBy) {
      this.sortBy = sortBy
    },

    clearAllFilters() {
      this.searchQuery = ''
      this.selectedCategory = 'All'
      this.selectedGenre = 'All'
      this.selectedLanguage = 'All'
      this.selectedYear = 'All'
      this.sortBy = 'latest'
    },

    getMovieById(id) {
      return this.movies.find(movie => movie.id === parseInt(id))
    },

    downloadMovie(movieId) {
      const movie = this.getMovieById(movieId)
      if (!movie) return false

      const download = {
        id: Date.now(),
        movieId: movie.id,
        title: movie.title,
        poster: movie.poster,
        downloadDate: new Date().toISOString(),
        status: 'completed', // In real app: pending, downloading, completed, failed
        progress: 100
      }

      this.downloads.unshift(download)
      return download
    },

    getDownloadHistory() {
      return this.downloads.sort((a, b) => 
        new Date(b.downloadDate) - new Date(a.downloadDate)
      )
    },

    removeFromDownloads(downloadId) {
      const index = this.downloads.findIndex(d => d.id === downloadId)
      if (index !== -1) {
        this.downloads.splice(index, 1)
      }
    },

    // Simulate adding new movies (admin feature)
    addMovie(movieData) {
      const newMovie = {
        id: Date.now(),
        ...movieData,
        rating: 0 // New movies start with 0 rating
      }
      this.movies.unshift(newMovie)
      return newMovie
    }
  },

  persist: true
})