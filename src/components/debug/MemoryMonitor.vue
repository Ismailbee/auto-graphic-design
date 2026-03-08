<template>
  <div class="memory-monitor" v-if="showMonitor">
    <div class="monitor-header">
      <h3>📊 Memory Monitor</h3>
      <button @click="toggleMonitor" class="close-btn">×</button>
    </div>
    
    <div class="monitor-stats">
      <div class="stat-item">
        <span class="label">Used:</span>
        <span class="value" :class="{ warning: memoryUsage.usedPercent > 70, critical: memoryUsage.usedPercent > 90 }">
          {{ memoryUsage.used }}MB ({{ memoryUsage.usedPercent }}%)
        </span>
      </div>
      
      <div class="stat-item">
        <span class="label">Total:</span>
        <span class="value">{{ memoryUsage.total }}MB</span>
      </div>
      
      <div class="stat-item">
        <span class="label">Limit:</span>
        <span class="value">{{ memoryUsage.limit }}MB</span>
      </div>
      
      <div class="stat-item">
        <span class="label">Images:</span>
        <span class="value">{{ imageCount }}</span>
      </div>
      
      <div class="stat-item">
        <span class="label">Texts:</span>
        <span class="value">{{ textCount }}</span>
      </div>
    </div>
    
    <div class="monitor-actions">
      <button @click="forceCleanup" class="cleanup-btn">🧹 Cleanup</button>
      <button @click="clearCanvas" class="clear-btn">🗑️ Clear All</button>
    </div>
    
    <div class="memory-bar">
      <div 
        class="memory-fill" 
        :style="{ width: memoryUsage.usedPercent + '%' }"
        :class="{ warning: memoryUsage.usedPercent > 70, critical: memoryUsage.usedPercent > 90 }"
      ></div>
    </div>
  </div>
  
  <!-- Floating toggle button when hidden -->
  <button v-else @click="toggleMonitor" class="memory-toggle">
    📊 {{ memoryUsage.used }}MB
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWhiteboardStore } from '@/stores/whiteboard'

const store = useWhiteboardStore()
const showMonitor = ref(false)

// Memory tracking
const memoryUsage = ref({
  used: 0,
  total: 0,
  limit: 0,
  usedPercent: 0
})

// Get current canvas data
const imageCount = computed(() => store.images?.length || 0)
const textCount = computed(() => store.texts?.length || 0)

// Update memory statistics
const updateMemoryStats = () => {
  if ('memory' in performance) {
    const memory = performance.memory
    const used = Math.round(memory.usedJSHeapSize / 1024 / 1024)
    const total = Math.round(memory.totalJSHeapSize / 1024 / 1024)
    const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
    
    memoryUsage.value = {
      used,
      total,
      limit,
      usedPercent: Math.round((used / limit) * 100)
    }
    
    // Auto-cleanup if memory usage is very high
    if (memoryUsage.value.usedPercent > 85) {
      console.warn('🚨 High memory usage detected:', memoryUsage.value.usedPercent + '%')
      autoCleanup()
    }
  }
}

// Force memory cleanup
const forceCleanup = () => {
  console.log('🧹 Forcing memory cleanup...')
  
  // Clear blob URLs
  const images = document.querySelectorAll('img')
  images.forEach(img => {
    if (img.src.startsWith('blob:')) {
      URL.revokeObjectURL(img.src)
    }
  })
  
  // Clear canvas contexts
  const canvases = document.querySelectorAll('canvas')
  canvases.forEach(canvas => {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  })
  
  // Force garbage collection if available
  if (window.gc) {
    window.gc()
    console.log('✅ Garbage collection executed')
  }
  
  // Update stats after cleanup
  setTimeout(updateMemoryStats, 100)
}

// Auto cleanup when memory is high
const autoCleanup = () => {
  console.log('🤖 Auto-cleanup triggered')
  
  // Clear browser caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name))
    })
  }
  
  forceCleanup()
}

// Clear entire canvas
const clearCanvas = () => {
  if (confirm('Are you sure you want to clear the entire canvas? This cannot be undone.')) {
    store.clearImages()
    store.clearTexts()
    console.log('🗑️ Canvas cleared')
  }
}

// Toggle monitor visibility
const toggleMonitor = () => {
  showMonitor.value = !showMonitor.value
}

// Set up monitoring interval
let monitorInterval = null

onMounted(() => {
  updateMemoryStats()
  
  // Update every 5 seconds
  monitorInterval = setInterval(updateMemoryStats, 5000)
  
  console.log('📊 Memory monitor started')
})

onUnmounted(() => {
  if (monitorInterval) {
    clearInterval(monitorInterval)
  }
  console.log('📊 Memory monitor stopped')
})

// Expose functions for external use
defineExpose({
  forceCleanup,
  updateMemoryStats,
  toggleMonitor
})
</script>

<style scoped>
.memory-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  padding: 16px;
  min-width: 250px;
  z-index: 10000;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
}

.monitor-header h3 {
  margin: 0;
  font-size: 14px;
  color: #00ff88;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
}

.close-btn:hover {
  color: #fff;
}

.monitor-stats {
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.label {
  color: #888;
}

.value {
  color: #00ff88;
  font-weight: bold;
}

.value.warning {
  color: #ffaa00;
}

.value.critical {
  color: #ff4444;
}

.monitor-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.cleanup-btn, .clear-btn {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #222;
  color: white;
  cursor: pointer;
  font-size: 11px;
}

.cleanup-btn:hover {
  background: #333;
  border-color: #00ff88;
}

.clear-btn:hover {
  background: #333;
  border-color: #ff4444;
}

.memory-bar {
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
}

.memory-fill {
  height: 100%;
  background: #00ff88;
  transition: all 0.3s ease;
}

.memory-fill.warning {
  background: #ffaa00;
}

.memory-fill.critical {
  background: #ff4444;
}

.memory-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: 1px solid #333;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 12px;
  z-index: 9999;
  font-family: 'Consolas', 'Monaco', monospace;
}

.memory-toggle:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: #00ff88;
}
</style>