<template>
  <div class="export-buttons">
    <button 
      @click="$emit('export', 'png')" 
      class="export-btn export-png-btn"
      :disabled="disabled"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>Download PNG</span>
    </button>
    
    <button 
      v-if="showSvgOption"
      @click="$emit('export', 'svg')" 
      class="export-btn export-svg-btn"
      :disabled="disabled"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
      <span>Download SVG</span>
    </button>
    
    <button 
      v-if="showShareOption"
      @click="$emit('share')" 
      class="export-btn share-btn"
      :disabled="disabled"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      <span>Share</span>
    </button>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  disabled?: boolean
  showSvgOption?: boolean
  showShareOption?: boolean
}>()

// Emits
defineEmits<{
  (e: 'export', format: 'png' | 'svg'): void
  (e: 'share'): void
}>()
</script>

<style scoped>
.export-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 16px;
}

.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-png-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.export-png-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.export-svg-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.export-svg-btn:hover:not(:disabled) {
  background: #e8e8e8;
  transform: translateY(-2px);
}

.share-btn {
  background: linear-gradient(135deg, #00c853 0%, #009624 100%);
  color: white;
}

.share-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 200, 83, 0.4);
}

/* Icon sizes */
.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }

/* Responsive */
@media (max-width: 480px) {
  .export-buttons {
    flex-direction: column;
  }
  
  .export-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
