<template>
  <div
    class="remote-cursor"
    :style="{
      left: `${cursor.x}px`,
      top: `${cursor.y}px`,
      '--cursor-color': cursor.color,
    }"
  >
    <!-- Cursor pointer -->
    <svg
      class="cursor-pointer"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.65376 12.3673L13.1844 4.83666C13.5263 4.49474 14.0789 4.49474 14.4208 4.83666L15.1644 5.58032C15.5063 5.92224 15.5063 6.47481 15.1644 6.81673L7.63376 14.3473L5.65376 12.3673Z"
        :fill="cursor.color"
      />
      <path
        d="M4.31802 16.5985L7.63376 14.3473L5.65376 12.3673L3.40254 15.683C3.06062 16.0249 3.06062 16.5775 3.40254 16.9194L4.14619 17.663C4.48811 18.0049 5.04068 18.0049 5.3826 17.663L8.69834 15.4118L6.71834 13.4318L4.31802 16.5985Z"
        :fill="cursor.color"
      />
    </svg>

    <!-- User name label -->
    <div class="cursor-label">
      {{ cursor.userName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RemoteCursor } from '@/types/collaboration'

interface Props {
  cursor: RemoteCursor
}

defineProps<Props>()
</script>

<style scoped>
.remote-cursor {
  position: absolute;
  pointer-events: none;
  z-index: 10000;
  transition: left 0.1s ease-out, top 0.1s ease-out;
  will-change: left, top;
}

.cursor-pointer {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.cursor-label {
  position: absolute;
  left: 20px;
  top: 0;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  color: #fff;
  background: var(--cursor-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  /* Glassmorphism effect */
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Smooth fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.remote-cursor {
  animation: fadeIn 0.2s ease-out;
}
</style>

