<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Games Hub</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showLeaderboard = !showLeaderboard">
            <ion-icon :icon="trophyOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="games-hub-container">
        <!-- Header Section -->
        <div class="header-section bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 mb-6">
          <div class="flex items-center gap-3 mb-2">
            <ion-icon :icon="gameControllerOutline" class="text-3xl"></ion-icon>
            <h1 class="text-2xl font-bold">Games Hub</h1>
          </div>
          <p class="opacity-90">Challenge yourself with classic games</p>
        </div>

        <!-- Player Stats -->
        <div class="player-stats grid grid-cols-3 gap-4 px-4 mb-6">
          <div class="stat-card bg-white p-4 rounded-lg shadow text-center">
            <ion-icon :icon="gameControllerOutline" class="text-2xl text-blue-600 mb-2"></ion-icon>
            <div class="text-lg font-bold">{{ playerStats.gamesPlayed }}</div>
            <div class="text-sm text-gray-600">Games Played</div>
          </div>
          
          <div class="stat-card bg-white p-4 rounded-lg shadow text-center">
            <ion-icon :icon="trophyOutline" class="text-2xl text-yellow-600 mb-2"></ion-icon>
            <div class="text-lg font-bold">{{ playerStats.totalScore }}</div>
            <div class="text-sm text-gray-600">Total Score</div>
          </div>
          
          <div class="stat-card bg-white p-4 rounded-lg shadow text-center">
            <ion-icon :icon="medalOutline" class="text-2xl text-green-600 mb-2"></ion-icon>
            <div class="text-lg font-bold">{{ Object.keys(playerStats.highScores).length }}</div>
            <div class="text-sm text-gray-600">High Scores</div>
          </div>
        </div>

        <!-- Games Grid -->
        <div class="games-grid px-4 mb-6">
          <h2 class="text-xl font-bold mb-4">Available Games</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="game in games" 
              :key="game.id"
              class="game-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              @click="playGame(game)"
            >
              <div class="relative">
                <img 
                  :src="game.thumbnail" 
                  :alt="game.name"
                  class="w-full h-48 object-cover"
                />
                <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <ion-icon 
                    :icon="playOutline" 
                    class="text-white text-4xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                  ></ion-icon>
                </div>
              </div>
              
              <div class="p-4">
                <h3 class="font-bold text-lg mb-2">{{ game.name }}</h3>
                <p class="text-gray-600 text-sm mb-3">{{ game.description }}</p>
                
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">
                    High Score: {{ getPlayerHighScore(game.name) }}
                  </div>
                  <ion-button size="small" fill="outline">
                    Play Now
                  </ion-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Leaderboard Section -->
        <div class="leaderboard-section px-4" v-if="showLeaderboard">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold flex items-center gap-2">
                <ion-icon :icon="trophyOutline" class="text-yellow-600"></ion-icon>
                Leaderboard
              </h2>
              <div class="flex gap-2">
                <ion-button 
                  v-for="game in games" 
                  :key="game.id"
                  size="small"
                  :fill="selectedLeaderboardGame === game.name ? 'solid' : 'outline'"
                  @click="selectedLeaderboardGame = game.name"
                >
                  {{ game.name }}
                </ion-button>
              </div>
            </div>

            <div class="leaderboard-list">
              <div 
                v-for="(entry, index) in currentLeaderboard" 
                :key="entry.id"
                class="leaderboard-entry flex items-center justify-between py-3 border-b border-gray-100"
                :class="{ 'bg-yellow-50': index < 3 }"
              >
                <div class="flex items-center gap-3">
                  <div class="rank-badge">
                    <ion-icon 
                      v-if="index === 0" 
                      :icon="trophyOutline" 
                      class="text-yellow-500 text-lg"
                    ></ion-icon>
                    <ion-icon 
                      v-else-if="index === 1" 
                      :icon="medalOutline" 
                      class="text-gray-400 text-lg"
                    ></ion-icon>
                    <ion-icon 
                      v-else-if="index === 2" 
                      :icon="medalOutline" 
                      class="text-orange-600 text-lg"
                    ></ion-icon>
                    <span v-else class="text-sm font-medium w-6 text-center">#{{ index + 1 }}</span>
                  </div>
                  
                  <div>
                    <div class="font-semibold">{{ entry.username }}</div>
                    <div class="text-sm text-gray-500">{{ formatDate(entry.timestamp) }}</div>
                  </div>
                </div>
                
                <div class="text-right">
                  <div class="font-bold text-lg">{{ entry.score }}</div>
                  <div class="text-sm text-gray-500">{{ entry.game }}</div>
                </div>
              </div>

              <div v-if="currentLeaderboard.length === 0" class="text-center py-8">
                <ion-icon :icon="trophyOutline" class="text-4xl text-gray-300 mb-2"></ion-icon>
                <p class="text-gray-500">No scores yet for {{ selectedLeaderboardGame }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Modal -->
      <ion-modal :is-open="showGameModal" @didDismiss="closeGameModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ selectedGame?.name }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeGameModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        
        <ion-content>
          <div class="game-container p-4">
            <!-- Game components would be dynamically loaded here -->
            <div v-if="selectedGame?.component === 'TicTacToe'">
              <TicTacToeGame @game-over="handleGameOver" />
            </div>
            <div v-else-if="selectedGame?.component === 'SnakeGame'">
              <SnakeGame @game-over="handleGameOver" />
            </div>
            <div v-else-if="selectedGame?.component === 'MemoryMatch'">
              <MemoryMatchGame @game-over="handleGameOver" />
            </div>
            <div v-else class="text-center py-12">
              <ion-icon :icon="constructOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
              <h3 class="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h3>
              <p class="text-gray-500">{{ selectedGame?.name }} is under development</p>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonModal
} from '@ionic/vue'
import { 
  gameControllerOutline, trophyOutline, medalOutline, playOutline,
  closeOutline, constructOutline
} from 'ionicons/icons'
import { useGamesStore } from '../stores/games.js'

// Import game components (would be created separately)
import TicTacToeGame from '../components/games/TicTacToeGame.vue'
import SnakeGame from '../components/games/SnakeGame.vue'
import MemoryMatchGame from '../components/games/MemoryMatchGame.vue'

const gamesStore = useGamesStore()

// Reactive state
const showLeaderboard = ref(true)
const showGameModal = ref(false)
const selectedGame = ref(null)
const selectedLeaderboardGame = ref('Tic-Tac-Toe')

// Computed properties
const games = computed(() => gamesStore.games)
const playerStats = computed(() => gamesStore.playerStats)

const currentLeaderboard = computed(() => {
  return gamesStore.getLeaderboardByGame(selectedLeaderboardGame.value)
})

// Methods
const playGame = (game) => {
  selectedGame.value = game
  gamesStore.setCurrentGame(game)
  showGameModal.value = true
}

const closeGameModal = () => {
  showGameModal.value = false
  selectedGame.value = null
  gamesStore.setCurrentGame(null)
}

const getPlayerHighScore = (gameName) => {
  return gamesStore.getPlayerHighScore(gameName)
}

const handleGameOver = (gameResult) => {
  const { gameName, score } = gameResult
  
  // Submit score to leaderboard
  gamesStore.submitScore(gameName, score)
  
  // Show completion message
  setTimeout(() => {
    alert(`Game Over! Your score: ${score}`)
  }, 500)
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  // Initialize default leaderboard view
  if (games.value.length > 0) {
    selectedLeaderboardGame.value = games.value[0].name
  }
})
</script>

<style scoped>
.games-hub-container {
  max-width: 1200px;
  margin: 0 auto;
}

.game-card {
  transition: all 0.3s ease;
}

.game-card:hover {
  transform: translateY(-4px);
}

.stat-card {
  border: 1px solid #e5e7eb;
}

.header-section {
  border-radius: 0 0 20px 20px;
}

.leaderboard-entry:last-child {
  border-bottom: none;
}

.rank-badge {
  width: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-container {
  min-height: 400px;
}

/* Game-specific styling */
ion-modal {
  --width: 90%;
  --height: 80%;
  --border-radius: 16px;
}

@media (min-width: 768px) {
  ion-modal {
    --width: 70%;
    --height: 70%;
  }
}
</style>