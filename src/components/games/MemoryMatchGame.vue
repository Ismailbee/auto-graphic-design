<template>
  <div class="memory-match-game">
    <div class="game-header text-center mb-4">
      <h2 class="text-2xl font-bold mb-2">Memory Match</h2>
      <p class="text-gray-600">Find matching pairs of cards</p>
    </div>

    <div class="game-info flex justify-between items-center mb-4">
      <div class="moves">
        <span class="text-lg font-semibold">Moves: {{ moves }}</span>
      </div>
      <div class="matches">
        <span class="text-lg font-semibold">Matches: {{ matches }}/{{ totalPairs }}</span>
      </div>
      <div class="timer">
        <span class="text-lg font-semibold">Time: {{ formatTime(timeElapsed) }}</span>
      </div>
    </div>

    <div class="game-board mx-auto" :style="{ maxWidth: boardSize + 'px' }">
      <div 
        class="grid gap-2"
        :class="`grid-cols-${gridCols}`"
      >
        <div
          v-for="(card, index) in cards"
          :key="index"
          @click="flipCard(index)"
          class="card-container"
          :class="{
            'flipped': card.isFlipped || card.isMatched,
            'matched': card.isMatched,
            'pointer-events-none': card.isFlipped || card.isMatched || flippedCards.length >= 2
          }"
        >
          <div class="card">
            <div class="card-back">
              <ion-icon :icon="helpCircleOutline" class="text-4xl text-blue-500"></ion-icon>
            </div>
            <div class="card-front">
              <span class="text-3xl">{{ card.emoji }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="game-controls mt-6 text-center">
      <div v-if="!gameStarted && !gameWon" class="mb-4">
        <div class="difficulty-selection mb-4">
          <p class="text-lg font-semibold mb-3">Select Difficulty:</p>
          <div class="flex justify-center gap-3">
            <ion-button 
              v-for="difficulty in difficulties" 
              :key="difficulty.name"
              @click="selectDifficulty(difficulty)"
              :fill="selectedDifficulty.name === difficulty.name ? 'solid' : 'outline'"
            >
              {{ difficulty.name }} ({{ difficulty.pairs }} pairs)
            </ion-button>
          </div>
        </div>
        <ion-button @click="startGame" color="primary" size="large">
          Start Game
        </ion-button>
      </div>

      <div v-if="gameWon" class="mb-4">
        <div class="text-2xl font-bold text-green-600 mb-2">🎉 Congratulations! 🎉</div>
        <div class="text-lg mb-2">You completed the game!</div>
        <div class="text-sm text-gray-600 mb-4">
          Time: {{ formatTime(timeElapsed) }} | Moves: {{ moves }} | Score: {{ calculateScore() }}
        </div>
        <ion-button @click="resetGame" color="primary">
          Play Again
        </ion-button>
      </div>

      <div v-if="gameStarted && !gameWon" class="mb-4">
        <ion-button @click="resetGame" fill="outline">
          Reset Game
        </ion-button>
      </div>
    </div>

    <div class="game-stats bg-gray-50 p-4 rounded-lg mt-6">
      <h3 class="text-lg font-semibold mb-3 text-center">Best Scores</h3>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-xl font-bold text-green-600">{{ bestScores.easy || '-' }}</div>
          <div class="text-sm text-gray-600">Easy</div>
        </div>
        <div>
          <div class="text-xl font-bold text-yellow-600">{{ bestScores.medium || '-' }}</div>
          <div class="text-sm text-gray-600">Medium</div>
        </div>
        <div>
          <div class="text-xl font-bold text-red-600">{{ bestScores.hard || '-' }}</div>
          <div class="text-sm text-gray-600">Hard</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import { helpCircleOutline } from 'ionicons/icons'

const emit = defineEmits(['game-over'])

// Game configuration
const difficulties = [
  { name: 'Easy', pairs: 6, cols: 3, size: 80 },
  { name: 'Medium', pairs: 8, cols: 4, size: 70 },
  { name: 'Hard', pairs: 12, cols: 4, size: 60 }
]

// Emojis for cards
const emojis = ['🎮', '🏆', '⭐', '🎯', '🎨', '🎪', '🎭', '🎸', '🎲', '🃏', '🎳', '🏀', '⚽', '🎾', '🏐', '🏈']

// Reactive state
const gameStarted = ref(false)
const gameWon = ref(false)
const moves = ref(0)
const matches = ref(0)
const timeElapsed = ref(0)
const selectedDifficulty = ref(difficulties[0])
const cards = ref([])
const flippedCards = ref([])
const bestScores = reactive({
  easy: localStorage.getItem('memory-best-easy') || null,
  medium: localStorage.getItem('memory-best-medium') || null,
  hard: localStorage.getItem('memory-best-hard') || null
})

let gameTimer = null

// Computed properties
const totalPairs = computed(() => selectedDifficulty.value.pairs)
const gridCols = computed(() => selectedDifficulty.value.cols)
const cardSize = computed(() => selectedDifficulty.value.size)
const boardSize = computed(() => gridCols.value * (cardSize.value + 8))

// Methods
const selectDifficulty = (difficulty) => {
  selectedDifficulty.value = difficulty
}

const startGame = () => {
  gameStarted.value = true
  gameWon.value = false
  moves.value = 0
  matches.value = 0
  timeElapsed.value = 0
  flippedCards.value = []
  
  generateCards()
  startTimer()
}

const generateCards = () => {
  const pairs = selectedDifficulty.value.pairs
  const selectedEmojis = emojis.slice(0, pairs)
  const cardData = []
  
  // Create pairs
  selectedEmojis.forEach(emoji => {
    cardData.push({ emoji, isFlipped: false, isMatched: false })
    cardData.push({ emoji, isFlipped: false, isMatched: false })
  })
  
  // Shuffle cards
  cards.value = shuffleArray(cardData)
}

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const flipCard = (index) => {
  if (cards.value[index].isFlipped || cards.value[index].isMatched || flippedCards.value.length >= 2) {
    return
  }
  
  cards.value[index].isFlipped = true
  flippedCards.value.push(index)
  
  if (flippedCards.value.length === 2) {
    moves.value++
    setTimeout(checkMatch, 1000)
  }
}

const checkMatch = () => {
  const [first, second] = flippedCards.value
  const firstCard = cards.value[first]
  const secondCard = cards.value[second]
  
  if (firstCard.emoji === secondCard.emoji) {
    // Match found
    firstCard.isMatched = true
    secondCard.isMatched = true
    matches.value++
    
    if (matches.value === totalPairs.value) {
      endGame()
    }
  } else {
    // No match
    firstCard.isFlipped = false
    secondCard.isFlipped = false
  }
  
  flippedCards.value = []
}

const startTimer = () => {
  gameTimer = setInterval(() => {
    timeElapsed.value++
  }, 1000)
}

const stopTimer = () => {
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
}

const endGame = () => {
  gameWon.value = true
  gameStarted.value = false
  stopTimer()
  
  const score = calculateScore()
  updateBestScore(score)
  
  emit('game-over', {
    gameName: 'Memory Match',
    score: score,
    time: timeElapsed.value,
    moves: moves.value,
    difficulty: selectedDifficulty.value.name
  })
}

const calculateScore = () => {
  // Score calculation: base score - penalties for time and moves
  const baseScore = selectedDifficulty.value.pairs * 100
  const timePenalty = Math.floor(timeElapsed.value / 10)
  const movePenalty = Math.max(0, (moves.value - selectedDifficulty.value.pairs) * 5)
  
  return Math.max(baseScore - timePenalty - movePenalty, 10)
}

const updateBestScore = (score) => {
  const difficultyKey = selectedDifficulty.value.name.toLowerCase()
  const currentBest = bestScores[difficultyKey]
  
  if (!currentBest || score > currentBest) {
    bestScores[difficultyKey] = score
    localStorage.setItem(`memory-best-${difficultyKey}`, score.toString())
  }
}

const resetGame = () => {
  gameStarted.value = false
  gameWon.value = false
  stopTimer()
  flippedCards.value = []
  cards.value = []
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Lifecycle hooks
onMounted(() => {
  // Load best scores from localStorage
  Object.keys(bestScores).forEach(key => {
    const saved = localStorage.getItem(`memory-best-${key}`)
    if (saved) {
      bestScores[key] = parseInt(saved)
    }
  })
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.memory-match-game {
  @apply max-w-2xl mx-auto p-4;
}

.card-container {
  @apply cursor-pointer;
  perspective: 1000px;
  height: v-bind(cardSize + 'px');
  width: v-bind(cardSize + 'px');
}

.card {
  @apply relative w-full h-full;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card-container.flipped .card {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  @apply absolute inset-0 w-full h-full flex items-center justify-center rounded-lg border-2;
  backface-visibility: hidden;
}

.card-back {
  @apply bg-blue-100 border-blue-300;
}

.card-front {
  @apply bg-white border-gray-300;
  transform: rotateY(180deg);
}

.card-container.matched .card-front {
  @apply bg-green-100 border-green-300;
}

.pointer-events-none {
  pointer-events: none;
}

.difficulty-selection ion-button {
  @apply mx-1;
}
</style>