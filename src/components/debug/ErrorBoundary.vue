<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Oops! Something went wrong</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <button @click="handleReset" class="btn-primary">
          Try Again
        </button>
        <button @click="handleReload" class="btn-secondary">
          Reload Page
        </button>
      </div>
      <details v-if="errorDetails" class="error-details">
        <summary>Technical Details</summary>
        <pre>{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { logger } from '@/utils/logger'

const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')

onErrorCaptured((err: Error, instance: any, info: string) => {
  hasError.value = true
  errorMessage.value = err.message || 'An unexpected error occurred'
  errorDetails.value = `${err.stack}\n\nComponent: ${instance?.$options?.name || 'Unknown'}\nInfo: ${info}`

  logger.error('Error captured by ErrorBoundary:', {
    error: err,
    component: instance?.$options?.name,
    info
  })

  // Prevent the error from propagating further
  return false
})

function handleReset() {
  try {
    hasError.value = false
    errorMessage.value = ''
    errorDetails.value = ''
  } catch (error) {
    console.error('Error during reset:', error)
    // Force reload if reset fails
    try {
      window.location.reload()
    } catch (reloadError) {
      console.error('Error during fallback reload:', reloadError)
    }
  }
}

function handleReload() {
  try {
    window.location.reload()
  } catch (error) {
    console.error('Error during reload:', error)
    try {
      // Fallback if location.reload() fails
      window.location.href = window.location.href
    } catch (fallbackError) {
      console.error('Fallback reload also failed:', fallbackError)
      // Last resort - try to redirect to current path
      const currentPath = window.location.pathname + window.location.search
      window.location.href = currentPath
    }
  }
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background-color: #f9fafb;
}

.error-container {
  max-width: 600px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.error-details {
  text-align: left;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 4px;
}

.error-details summary {
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.error-details pre {
  font-size: 0.75rem;
  color: #374151;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

