<template>
  <div class="diamond-tier-icon" :class="[`tier-${color}`, { glow: showGlow }]">
    <ion-icon :icon="diamondIcon" :class="`diamond-${color}`"></ion-icon>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { diamond, diamondOutline } from 'ionicons/icons'
import type { TierColor } from '@/types/payment.types'

interface Props {
  color?: TierColor
  showGlow?: boolean
  outline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  showGlow: false,
  outline: false
})

const diamondIcon = computed(() => {
  return props.outline ? diamondOutline : diamond
})
</script>

<style scoped>
.diamond-tier-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.diamond-tier-icon ion-icon {
  font-size: 24px;
  transition: all 0.3s ease;
}

/* Blue Tier (Free/Basic) */
.diamond-blue {
  color: #3b82f6;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tier-blue.glow .diamond-blue {
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.6));
  animation: pulse-blue 2s ease-in-out infinite;
}

/* Gold Tier (Premium) */
.diamond-gold {
  color: #fbbf24;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tier-gold.glow .diamond-gold {
  filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.6));
  animation: pulse-gold 2s ease-in-out infinite;
}

/* Red Tier (Pro) */
.diamond-red {
  color: #ef4444;
  background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tier-red.glow .diamond-red {
  filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.8));
  animation: pulse-red 2s ease-in-out infinite;
}

/* Hover Effects */
.diamond-tier-icon:hover ion-icon {
  transform: scale(1.1) rotate(5deg);
}

/* Pulse Animations */
@keyframes pulse-blue {
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 18px rgba(59, 130, 246, 0.9));
  }
}

@keyframes pulse-gold {
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.9));
  }
}

@keyframes pulse-red {
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(239, 68, 68, 1));
  }
}

/* Size Variants */
.diamond-tier-icon.small ion-icon {
  font-size: 18px;
}

.diamond-tier-icon.large ion-icon {
  font-size: 32px;
}

.diamond-tier-icon.xlarge ion-icon {
  font-size: 48px;
}
</style>

