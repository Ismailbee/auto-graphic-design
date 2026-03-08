/**
 * Theme Store
 * Manages dark mode and theme preferences
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  // State
  const mode = ref<ThemeMode>('light')
  const isDark = ref(false)

  /**
   * Initialize theme from localStorage or system preference
   */
  function initTheme() {
    // Load saved preference
    const saved = localStorage.getItem('theme')
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
      mode.value = saved as ThemeMode
    } else {
      // Default to system preference
      mode.value = 'auto'
    }

    // Apply theme
    applyTheme()

    // Watch for system theme changes if in auto mode
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        if (mode.value === 'auto') {
          isDark.value = e.matches
          updateDOM()
        }
      })
    }
  }

  /**
   * Set theme mode
   */
  function setTheme(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem('theme', newMode)
    applyTheme()
  }

  /**
   * Toggle between light and dark
   */
  function toggleTheme() {
    if (mode.value === 'auto') {
      // If auto, switch to opposite of current
      setTheme(isDark.value ? 'light' : 'dark')
    } else {
      // Toggle between light and dark
      setTheme(mode.value === 'light' ? 'dark' : 'light')
    }
  }

  /**
   * Apply theme based on current mode
   */
  function applyTheme() {
    if (mode.value === 'dark') {
      isDark.value = true
    } else if (mode.value === 'light') {
      isDark.value = false
    } else {
      // Auto mode - check system preference
      if (window.matchMedia) {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      } else {
        isDark.value = false
      }
    }

    updateDOM()
  }

  /**
   * Update DOM with theme class
   */
  function updateDOM() {
    const root = document.documentElement
    
    if (isDark.value) {
      root.classList.add('dark-mode')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark-mode')
      root.setAttribute('data-theme', 'light')
    }

    // Update meta theme-color for mobile browsers
    updateMetaThemeColor()
  }

  /**
   * Update meta theme color for mobile browsers
   */
  function updateMetaThemeColor() {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }

    // Set color based on theme
    const color = isDark.value ? '#0f172a' : '#ffffff'
    metaThemeColor.setAttribute('content', color)
  }

  // Watch for mode changes
  watch(mode, () => {
    applyTheme()
  })

  return {
    // State
    mode,
    isDark,

    // Actions
    initTheme,
    setTheme,
    toggleTheme,
    applyTheme
  }
})

