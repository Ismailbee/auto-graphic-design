import { defineStore } from 'pinia'
import { gamesData } from '../data/mockData.js'

export const useGamesStore = defineStore('games', {
  state: () => ({
    games: [...gamesData],
    leaderboard: [
      { id: 1, username: 'player1', game: 'Tic-Tac-Toe', score: 15, timestamp: '2024-01-15T10:30:00Z' },
      { id: 2, username: 'player2', game: 'Snake Game', score: 2450, timestamp: '2024-01-14T15:20:00Z' },
      { id: 3, username: 'player3', game: 'Memory Match', score: 18, timestamp: '2024-01-13T09:15:00Z' },
      { id: 4, username: 'player1', game: 'Snake Game', score: 1890, timestamp: '2024-01-12T16:45:00Z' },
      { id: 5, username: 'player4', game: 'Tic-Tac-Toe', score: 12, timestamp: '2024-01-11T12:30:00Z' }
    ],
    currentGame: null,
    playerStats: {
      gamesPlayed: 0,
      totalScore: 0,
      highScores: {}
    }
  }),

  getters: {
    getLeaderboardByGame: (state) => (gameName) => {
      return state.leaderboard
        .filter(entry => entry.game === gameName)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10) // Top 10 scores
    },

    getAllTimeLeaderboard: (state) => {
      return state.leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
    },

    getPlayerHighScore: (state) => (gameName) => {
      return state.playerStats.highScores[gameName] || 0
    }
  },

  actions: {
    setCurrentGame(game) {
      this.currentGame = game
    },

    submitScore(gameName, score, username = 'currentPlayer') {
      const newEntry = {
        id: Date.now(),
        username,
        game: gameName,
        score,
        timestamp: new Date().toISOString()
      }

      this.leaderboard.unshift(newEntry)
      this.playerStats.gamesPlayed += 1
      this.playerStats.totalScore += score

      // Update high score if this is better
      if (!this.playerStats.highScores[gameName] || score > this.playerStats.highScores[gameName]) {
        this.playerStats.highScores[gameName] = score
      }

      // Keep only the latest 100 scores to prevent infinite growth
      if (this.leaderboard.length > 100) {
        this.leaderboard = this.leaderboard.slice(0, 100)
      }

      return newEntry
    },

    getGameById(id) {
      return this.games.find(game => game.id === parseInt(id))
    },

    resetPlayerStats() {
      this.playerStats = {
        gamesPlayed: 0,
        totalScore: 0,
        highScores: {}
      }
    }
  },

  persist: true
})