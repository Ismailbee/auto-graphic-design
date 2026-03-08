<template>
  <Teleport to="body">
    <div v-if="show" class="pointer-events-none fixed inset-0 z-[99998]">
      <div class="absolute inset-0 overflow-hidden">
        <span
          v-for="n in 18"
          :key="`${burstKey}-${n}`"
          class="confetti"
          :style="styleFor(n)"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  burstKey: number
}

const props = defineProps<Props>()

const seed = computed(() => props.burstKey || 1)

function rand01(i: number) {
  // deterministic pseudo-random based on burstKey + index
  const x = Math.sin((seed.value * 997 + i * 131) * 0.017453292519943295) * 10000
  return x - Math.floor(x)
}

function styleFor(i: number) {
  const left = Math.round(rand01(i) * 100)
  const delay = Math.round(rand01(i + 10) * 120)
  const duration = 700 + Math.round(rand01(i + 20) * 500)
  const drift = -20 + Math.round(rand01(i + 30) * 40)
  const size = 6 + Math.round(rand01(i + 40) * 8)

  return {
    left: `${left}%`,
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
    '--drift': `${drift}px`,
    width: `${size}px`,
    height: `${Math.max(8, size * 1.6)}px`
  } as Record<string, string>
}
</script>

<style scoped>
.confetti {
  position: absolute;
  top: -12px;
  border-radius: 4px;
  background: var(--ion-color-primary);
  opacity: 0.85;
  transform: translate3d(0, 0, 0) rotate(0deg);
  animation-name: fall;
  animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
  animation-fill-mode: forwards;
  will-change: transform, opacity;
}

@media (prefers-reduced-motion: reduce) {
  .confetti {
    display: none;
  }
}

@keyframes fall {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    opacity: 0;
  }
  12% {
    opacity: 0.9;
  }
  100% {
    transform: translate3d(var(--drift), 85vh, 0) rotate(220deg);
    opacity: 0;
  }
}
</style>
