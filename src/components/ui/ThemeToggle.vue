<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <!-- Sun Icon (Light Mode) -->
    <svg v-if="!isDark" class="theme-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>

    <!-- Moon Icon (Dark Mode) -->
    <svg v-else class="theme-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

function toggleTheme() {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid var(--border-primary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling */
}

.theme-toggle:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: rotate(180deg);
}

.theme-toggle:active {
  transform: rotate(180deg) scale(0.95);
}

.theme-icon {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

/* Animation when switching */
.theme-toggle:hover .theme-icon {
  transform: scale(1.1);
}

/* Dark mode specific styles */
.dark-mode .theme-toggle {
  border-color: var(--border-secondary);
}

.dark-mode .theme-toggle:hover {
  background: var(--bg-tertiary);
  border-color: var(--color-primary);
}
</style>

