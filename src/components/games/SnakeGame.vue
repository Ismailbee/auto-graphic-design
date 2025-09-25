<template>
  <div class="snake-game">
    <div class="game-header text-center mb-4">
      <h2 class="text-2xl font-bold mb-2">Snake Game</h2>
      <p class="text-gray-600">Use arrow keys to control the snake</p>
    </div>

    <div class="game-info flex justify-between items-center mb-4">
      <div class="score">
        <span class="text-lg font-semibold">Score: {{ score }}</span>
      </div>
      <div class="high-score">
        <span class="text-lg font-semibold">High: {{ highScore }}</span>
      </div>
    </div>

    <div class="game-container">
      <canvas 
        ref="gameCanvas" 
        :width="canvasSize" 
        :height="canvasSize"
        class="game-canvas border-2 border-gray-800 rounded-lg mx-auto block"
        @keydown="handleKeyDown"
        tabindex="0"
      ></canvas>
    </div>

    <div class="game-controls mt-4 text-center">
      <div v-if="!gameRunning && !gameOver" class="mb-4">
        <ion-button @click="startGame" color="primary" size="large">
          Start Game
        </ion-button>
      </div>

      <div v-if="gameOver" class="mb-4">
        <div class="text-xl font-bold text-red-600 mb-2">Game Over!</div>
        <div class="text-lg mb-4">Final Score: {{ score }}</div>
        <ion-button @click="resetGame" color="primary">
          Play Again
        </ion-button>
      </div>

      <div v-if="gameRunning" class="mb-4">
        <ion-button @click="pauseGame" fill="outline">
          {{ gamePaused ? 'Resume' : 'Pause' }}
        </ion-button>
      </div>
    </div>

    <!-- Touch Controls for Mobile -->
    <div class="touch-controls grid grid-cols-3 gap-2 mt-6 max-w-48 mx-auto md:hidden">
      <div></div>
      <ion-button @touchstart="changeDirection('up')" fill="outline" class="control-btn">↑</ion-button>
      <div></div>
      
      <ion-button @touchstart="changeDirection('left')" fill="outline" class="control-btn">←</ion-button>
      <div></div>
      <ion-button @touchstart="changeDirection('right')" fill="outline" class="control-btn">→</ion-button>
      
      <div></div>
      <ion-button @touchstart="changeDirection('down')" fill="outline" class="control-btn">↓</ion-button>
      <div></div>
    </div>

    <div class="instructions text-center text-sm text-gray-600 mt-4">
      <p class="hidden md:block">Use arrow keys to move the snake</p>
      <p class="md:hidden">Tap the direction buttons to move the snake</p>
      <p>Eat the red food to grow and increase your score!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { IonButton } from '@ionic/vue'

const emit = defineEmits(['game-over'])

// Game constants
const GRID_SIZE = 20
const CANVAS_SIZE = 400

// Reactive state
const gameCanvas = ref(null)
const canvasSize = ref(CANVAS_SIZE)
const score = ref(0)
const highScore = ref(localStorage.getItem('snake-high-score') || 0)
const gameRunning = ref(false)
const gameOver = ref(false)
const gamePaused = ref(false)

// Game state
const gameState = reactive({
  snake: [{ x: 10, y: 10 }],
  direction: { x: 0, y: 0 },
  food: { x: 15, y: 15 },
  ctx: null
})

let gameLoop = null

// Methods
const startGame = () => {
  resetGameState()
  gameRunning.value = true
  gameOver.value = false
  gamePaused.value = false
  
  if (gameCanvas.value) {
    gameState.ctx = gameCanvas.value.getContext('2d')
    gameCanvas.value.focus()
    startGameLoop()
  }
}

const resetGame = () => {
  stopGameLoop()
  startGame()
}

const resetGameState = () => {
  gameState.snake = [{ x: 10, y: 10 }]
  gameState.direction = { x: 0, y: 0 }
  gameState.food = generateFood()
  score.value = 0
}

const pauseGame = () => {
  gamePaused.value = !gamePaused.value
  
  if (gamePaused.value) {
    stopGameLoop()
  } else {
    startGameLoop()
  }
}

const startGameLoop = () => {
  gameLoop = setInterval(() => {
    if (!gamePaused.value) {
      updateGame()
      drawGame()
    }
  }, 150) // Game speed
}

const stopGameLoop = () => {
  if (gameLoop) {
    clearInterval(gameLoop)
    gameLoop = null
  }
}

const updateGame = () => {
  // Move snake
  const head = { ...gameState.snake[0] }
  head.x += gameState.direction.x
  head.y += gameState.direction.y
  
  // Check wall collision
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    endGame()
    return
  }
  
  // Check self collision
  if (gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame()
    return
  }
  
  gameState.snake.unshift(head)
  
  // Check food collision
  if (head.x === gameState.food.x && head.y === gameState.food.y) {
    score.value += 10
    gameState.food = generateFood()
    
    // Update high score
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('snake-high-score', highScore.value.toString())
    }
  } else {
    gameState.snake.pop()
  }
}

const drawGame = () => {
  const ctx = gameState.ctx
  if (!ctx) return
  
  // Clear canvas
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  
  // Draw snake
  ctx.fillStyle = '#22c55e'
  gameState.snake.forEach((segment, index) => {
    if (index === 0) {
      ctx.fillStyle = '#16a34a' // Darker green for head
    } else {
      ctx.fillStyle = '#22c55e'
    }
    
    ctx.fillRect(
      segment.x * (CANVAS_SIZE / GRID_SIZE),
      segment.y * (CANVAS_SIZE / GRID_SIZE),
      CANVAS_SIZE / GRID_SIZE - 1,
      CANVAS_SIZE / GRID_SIZE - 1
    )
  })
  
  // Draw food
  ctx.fillStyle = '#ef4444'
  ctx.fillRect(
    gameState.food.x * (CANVAS_SIZE / GRID_SIZE),
    gameState.food.y * (CANVAS_SIZE / GRID_SIZE),
    CANVAS_SIZE / GRID_SIZE - 1,
    CANVAS_SIZE / GRID_SIZE - 1
  )
}

const generateFood = () => {
  let food
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
  } while (gameState.snake.some(segment => segment.x === food.x && segment.y === food.y))
  
  return food
}

const handleKeyDown = (event) => {
  if (!gameRunning.value || gamePaused.value) return
  
  switch (event.key) {
    case 'ArrowUp':
      if (gameState.direction.y !== 1) changeDirection('up')
      break
    case 'ArrowDown':
      if (gameState.direction.y !== -1) changeDirection('down')
      break
    case 'ArrowLeft':
      if (gameState.direction.x !== 1) changeDirection('left')
      break
    case 'ArrowRight':
      if (gameState.direction.x !== -1) changeDirection('right')
      break
    case ' ':
      event.preventDefault()
      pauseGame()
      break
  }
}

const changeDirection = (direction) => {
  if (!gameRunning.value || gamePaused.value) return
  
  switch (direction) {
    case 'up':
      if (gameState.direction.y !== 1) {
        gameState.direction = { x: 0, y: -1 }
      }
      break
    case 'down':
      if (gameState.direction.y !== -1) {
        gameState.direction = { x: 0, y: 1 }
      }
      break
    case 'left':
      if (gameState.direction.x !== 1) {
        gameState.direction = { x: -1, y: 0 }
      }
      break
    case 'right':
      if (gameState.direction.x !== -1) {
        gameState.direction = { x: 1, y: 0 }
      }
      break
  }
}

const endGame = () => {
  gameRunning.value = false
  gameOver.value = true
  stopGameLoop()
  
  emit('game-over', {
    gameName: 'Snake Game',
    score: score.value,
    length: gameState.snake.length
  })
}

// Lifecycle hooks
onMounted(() => {
  // Add keyboard event listener
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // Clean up
  document.removeEventListener('keydown', handleKeyDown)
  stopGameLoop()
})
</script>

<style scoped>
.snake-game {
  @apply max-w-md mx-auto p-4;
}

.game-canvas {
  background-color: #f3f4f6;
  outline: none;
}

.control-btn {
  @apply w-12 h-12;
  font-size: 1.5rem;
}

.touch-controls {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
</style>