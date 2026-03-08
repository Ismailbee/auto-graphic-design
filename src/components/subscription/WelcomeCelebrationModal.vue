<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleDismiss" :backdrop-dismiss="false">
    <div class="celebration-modal">
      <!-- Confetti Canvas -->
      <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

      <!-- Content -->
      <div class="celebration-content">
        <div class="celebration-icon">
          <DiamondTierIcon :color="tierColor" :show-glow="true" class="large-diamond" />
        </div>

        <h1 class="celebration-title">🎉 Welcome to {{ planName }}! 🎉</h1>

        <p class="celebration-message">
          Congratulations! You've successfully upgraded to the {{ planName }} plan.
        </p>

        <div class="rewards-summary">
          <div class="reward-item">
            <ion-icon :icon="sparklesOutline" class="reward-icon"></ion-icon>
            <div class="reward-details">
              <div class="reward-amount">+{{ tokenBonus.toLocaleString() }}</div>
              <div class="reward-label">Bonus Tokens Added</div>
            </div>
          </div>

          <div class="reward-item">
            <ion-icon :icon="timeOutline" class="reward-icon"></ion-icon>
            <div class="reward-details">
              <div class="reward-amount">{{ duration }}</div>
              <div class="reward-label">Plan Duration</div>
            </div>
          </div>
        </div>

        <div class="features-unlocked">
          <h3>✨ Features Unlocked</h3>
          <ul>
            <li v-for="(feature, index) in features" :key="index">{{ feature }}</li>
          </ul>
        </div>

        <ion-button expand="block" size="large" @click="handleDismiss" class="continue-button">
          Start Creating Amazing Designs!
        </ion-button>
      </div>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { IonModal, IonButton, IonIcon } from '@ionic/vue'
import { sparklesOutline, timeOutline } from 'ionicons/icons'
import DiamondTierIcon from './DiamondTierIcon.vue'
import type { TierColor } from '@/types/payment.types'

interface Props {
  isOpen: boolean
  planName: string
  tierColor: TierColor
  tokenBonus: number
  duration: string
  features: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  dismiss: []
}>()

const confettiCanvas = ref<HTMLCanvasElement | null>(null)
let confettiAnimationId: number | null = null

interface Confetti {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  color: string
  rotation: number
  rotationSpeed: number
}

const confettiParticles: Confetti[] = []

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    startConfetti()
  } else {
    stopConfetti()
  }
})

function startConfetti() {
  if (!confettiCanvas.value) return

  const canvas = confettiCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Create confetti particles
  const colors = ['#fbbf24', '#f59e0b', '#e5e7eb', '#d1d5db', '#667eea', '#764ba2']
  
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 10 + 5,
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 5 - 2.5
    })
  }

  animateConfetti()
}

function animateConfetti() {
  if (!confettiCanvas.value) return

  const canvas = confettiCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  confettiParticles.forEach((particle, index) => {
    ctx.save()
    ctx.translate(particle.x, particle.y)
    ctx.rotate((particle.rotation * Math.PI) / 180)
    ctx.fillStyle = particle.color
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
    ctx.restore()

    // Update position
    particle.y += particle.speedY
    particle.x += particle.speedX
    particle.rotation += particle.rotationSpeed

    // Reset particle if it goes off screen
    if (particle.y > canvas.height) {
      particle.y = -10
      particle.x = Math.random() * canvas.width
    }
  })

  confettiAnimationId = requestAnimationFrame(animateConfetti)
}

function stopConfetti() {
  if (confettiAnimationId !== null) {
    cancelAnimationFrame(confettiAnimationId)
    confettiAnimationId = null
  }
  confettiParticles.length = 0
}

function handleDismiss() {
  stopConfetti()
  emit('dismiss')
}

onMounted(() => {
  if (props.isOpen) {
    startConfetti()
  }
})
</script>

<style scoped>
.celebration-modal {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.confetti-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.celebration-content {
  position: relative;
  z-index: 2;
  max-width: 500px;
  padding: 40px 24px;
  text-align: center;
  color: white;
}

.celebration-icon {
  margin-bottom: 24px;
  animation: bounce 1s ease-in-out infinite;
}

.large-diamond {
  font-size: 80px;
}

.celebration-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 16px 0;
  animation: fadeInUp 0.6s ease-out;
}

.celebration-message {
  font-size: 18px;
  margin: 0 0 32px 0;
  opacity: 0.95;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.rewards-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

.reward-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.reward-icon {
  font-size: 32px;
  color: #fbbf24;
}

.reward-amount {
  font-size: 24px;
  font-weight: bold;
}

.reward-label {
  font-size: 12px;
  opacity: 0.9;
}

.features-unlocked {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.features-unlocked h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  text-align: center;
}

.features-unlocked ul {
  margin: 0;
  padding-left: 24px;
  list-style: none;
}

.features-unlocked li {
  margin-bottom: 12px;
  position: relative;
  padding-left: 24px;
}

.features-unlocked li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
  font-size: 18px;
}

.continue-button {
  --background: white;
  --color: #667eea;
  font-weight: 600;
  animation: fadeInUp 0.6s ease-out 0.8s both;
}

.continue-button:hover {
  --background: #f9fafb;
}

/* Animations */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .celebration-content {
    padding: 24px 16px;
  }

  .celebration-title {
    font-size: 24px;
  }

  .celebration-message {
    font-size: 16px;
  }

  .rewards-summary {
    grid-template-columns: 1fr;
  }
}
</style>

