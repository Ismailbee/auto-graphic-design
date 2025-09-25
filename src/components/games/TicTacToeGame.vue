<template>
  <div class="tic-tac-toe-game">
    <div class="game-header text-center mb-6">
      <h2 class="text-2xl font-bold mb-2">Tic-Tac-Toe</h2>
      <p class="text-gray-600">Get three in a row to win!</p>
    </div>

    <div class="game-status text-center mb-4">
      <div v-if="!gameOver" class="text-lg">
        Current Player: <span :class="currentPlayer === 'X' ? 'text-blue-600' : 'text-red-600'" class="font-bold">{{ currentPlayer }}</span>
      </div>
      <div v-else class="text-xl font-bold">
        <span v-if="winner" :class="winner === 'X' ? 'text-blue-600' : 'text-red-600'">
          Player {{ winner }} Wins! 🎉
        </span>
        <span v-else class="text-gray-600">It's a Draw! 🤝</span>
      </div>
    </div>

    <div class="game-board mx-auto" style="width: 300px;">
      <div class="grid grid-cols-3 gap-2 bg-gray-800 p-2 rounded-lg">
        <button
          v-for="(cell, index) in board"
          :key="index"
          @click="makeMove(index)"
          :disabled="cell !== '' || gameOver"
          class="game-cell"
          :class="{
            'cursor-not-allowed': cell !== '' || gameOver,
            'hover:bg-gray-100': cell === '' && !gameOver
          }"
        >
          <span 
            :class="{
              'text-blue-600': cell === 'X',
              'text-red-600': cell === 'O'
            }"
            class="text-4xl font-bold"
          >
            {{ cell }}
          </span>
        </button>
      </div>
    </div>

    <div class="game-controls text-center mt-6">
      <ion-button @click="resetGame" fill="outline" class="mr-3">
        New Game
      </ion-button>
      <ion-button v-if="gameOver" @click="playAgain" color="primary">
        Play Again
      </ion-button>
    </div>

    <div class="game-stats bg-gray-50 p-4 rounded-lg mt-6">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-blue-600">{{ stats.xWins }}</div>
          <div class="text-sm text-gray-600">X Wins</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-gray-600">{{ stats.draws }}</div>
          <div class="text-sm text-gray-600">Draws</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-red-600">{{ stats.oWins }}</div>
          <div class="text-sm text-gray-600">O Wins</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { IonButton } from '@ionic/vue'

const emit = defineEmits(['game-over'])

// Game state
const board = ref(Array(9).fill(''))
const currentPlayer = ref('X')
const gameOver = ref(false)
const winner = ref(null)

// Game statistics
const stats = reactive({
  xWins: 0,
  oWins: 0,
  draws: 0
})

// Winning combinations
const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
]

// Methods
const makeMove = (index) => {
  if (board.value[index] !== '' || gameOver.value) return
  
  board.value[index] = currentPlayer.value
  
  if (checkWinner()) {
    gameOver.value = true
    winner.value = currentPlayer.value
    updateStats()
    emitGameOver()
  } else if (board.value.every(cell => cell !== '')) {
    gameOver.value = true
    winner.value = null
    updateStats()
    emitGameOver()
  } else {
    currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X'
  }
}

const checkWinner = () => {
  return winningCombinations.some(combination => {
    const [a, b, c] = combination
    return board.value[a] && 
           board.value[a] === board.value[b] && 
           board.value[b] === board.value[c]
  })
}

const updateStats = () => {
  if (winner.value === 'X') {
    stats.xWins++
  } else if (winner.value === 'O') {
    stats.oWins++
  } else {
    stats.draws++
  }
}

const emitGameOver = () => {
  let score = 0
  if (winner.value === 'X') score = 3
  else if (winner.value === 'O') score = 1
  else score = 1 // Draw gets 1 point
  
  emit('game-over', {
    gameName: 'Tic-Tac-Toe',
    score: score,
    winner: winner.value,
    moves: board.value.filter(cell => cell !== '').length
  })
}

const resetGame = () => {
  board.value = Array(9).fill('')
  currentPlayer.value = 'X'
  gameOver.value = false
  winner.value = null
}

const playAgain = () => {
  resetGame()
}

// Auto-play for O player (simple AI)
watch(currentPlayer, (newPlayer) => {
  if (newPlayer === 'O' && !gameOver.value) {
    setTimeout(() => {
      makeAIMove()
    }, 500)
  }
})

const makeAIMove = () => {
  if (gameOver.value) return
  
  // Simple AI: Try to win, block player, or take center/corner
  let moveIndex = findWinningMove('O') || findWinningMove('X') || findBestMove()
  
  if (moveIndex !== null) {
    makeMove(moveIndex)
  }
}

const findWinningMove = (player) => {
  for (let combo of winningCombinations) {
    const [a, b, c] = combo
    const cells = [board.value[a], board.value[b], board.value[c]]
    
    if (cells.filter(cell => cell === player).length === 2 && 
        cells.filter(cell => cell === '').length === 1) {
      return combo[cells.indexOf('')]
    }
  }
  return null
}

const findBestMove = () => {
  const availableMoves = board.value.map((cell, index) => cell === '' ? index : null)
    .filter(index => index !== null)
  
  // Prefer center, then corners, then edges
  const preferredMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7]
  
  for (let move of preferredMoves) {
    if (availableMoves.includes(move)) {
      return move
    }
  }
  
  return availableMoves[0] || null
}
</script>

<style scoped>
.game-cell {
  @apply w-24 h-24 bg-white rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200;
  @apply hover:shadow-md active:scale-95;
}

.game-cell:disabled {
  @apply cursor-not-allowed;
}

.tic-tac-toe-game {
  @apply max-w-md mx-auto p-4;
}
</style>