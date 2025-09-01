<template>
  <div class="history-panel">
    <div class="panel-header">
      <h3>History</h3>
      <div class="header-actions">
        <button @click="clearHistory" class="btn-secondary" :disabled="history.length === 0">
          <i class="fas fa-trash"></i>
          Clear
        </button>
      </div>
    </div>
    
    <!-- History Statistics -->
    <div class="history-stats">
      <div class="stat-item">
        <span class="stat-value">{{ history.length }}</span>
        <span class="stat-label">Actions</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ currentStep + 1 }}</span>
        <span class="stat-label">Current</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ canUndo ? '✓' : '✗' }}</span>
        <span class="stat-label">Can Undo</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ canRedo ? '✓' : '✗' }}</span>
        <span class="stat-label">Can Redo</span>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="quick-actions">
      <button 
        @click="undo" 
        :disabled="!canUndo"
        class="action-btn"
        title="Undo (Ctrl+Z)"
      >
        <i class="fas fa-undo"></i>
        <span>Undo</span>
      </button>
      <button 
        @click="redo" 
        :disabled="!canRedo"
        class="action-btn"
        title="Redo (Ctrl+Y)"
      >
        <i class="fas fa-redo"></i>
        <span>Redo</span>
      </button>
    </div>
    
    <!-- History Timeline -->
    <div class="history-timeline">
      <div class="timeline-header">
        <h4>Timeline</h4>
        <div class="timeline-controls">
          <button 
            @click="showDetails = !showDetails" 
            :class="['toggle-btn', { active: showDetails }]"
          >
            <i class="fas fa-info"></i>
          </button>
          <button 
            @click="autoScroll = !autoScroll" 
            :class="['toggle-btn', { active: autoScroll }]"
          >
            <i class="fas fa-arrows-alt-v"></i>
          </button>
        </div>
      </div>
      
      <div class="timeline-list" ref="timelineList">
        <div 
          v-for="(action, index) in history" 
          :key="action.id"
          :class="[
            'timeline-item',
            { 
              current: index === currentStep,
              future: index > currentStep,
              past: index < currentStep
            }
          ]"
          @click="goToStep(index)"
        >
          <div class="timeline-marker">
            <i :class="getActionIcon(action.type)"></i>
          </div>
          
          <div class="timeline-content">
            <div class="action-title">{{ formatActionTitle(action) }}</div>
            <div v-if="showDetails" class="action-details">
              <div class="action-meta">
                <span class="action-time">{{ formatTime(action.timestamp) }}</span>
                <span class="action-type">{{ action.type }}</span>
              </div>
              <div v-if="action.details" class="action-description">
                {{ action.details }}
              </div>
              <div v-if="action.objects" class="action-objects">
                Affected: {{ action.objects.length }} object(s)
              </div>
            </div>
          </div>
          
          <div class="timeline-actions">
            <button 
              @click.stop="goToStep(index)"
              class="goto-btn"
              :title="`Go to step ${index + 1}`"
            >
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="history.length === 0" class="empty-state">
          <i class="fas fa-history"></i>
          <h4>No History</h4>
          <p>Your actions will appear here</p>
        </div>
      </div>
    </div>
    
    <!-- History Options -->
    <div class="history-options">
      <div class="option-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="saveHistory" />
          <span>Save history between sessions</span>
        </label>
      </div>
      
      <div class="option-group">
        <label>History Limit</label>
        <select v-model="historyLimit" @change="updateHistoryLimit" class="limit-select">
          <option value="50">50 actions</option>
          <option value="100">100 actions</option>
          <option value="200">200 actions</option>
          <option value="500">500 actions</option>
        </select>
      </div>
      
      <div class="option-group">
        <button @click="exportHistory" class="btn-secondary export-btn">
          <i class="fas fa-download"></i>
          Export History
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useCanvasStore } from '../../../stores/canvas-konva';
import { useNotification } from '../../../composables/useNotification';

const canvasStore = useCanvasStore();
const { showSuccess, showError } = useNotification();

// UI State
const showDetails = ref(false);
const autoScroll = ref(true);
const timelineList = ref(null);

// Settings
const saveHistory = ref(true);
const historyLimit = ref(100);

// Computed properties
const history = computed(() => canvasStore.history);
const currentStep = computed(() => canvasStore.historyStep);
const canUndo = computed(() => canvasStore.canUndo);
const canRedo = computed(() => canvasStore.canRedo);

// Watch for history changes to auto-scroll
watch([history, currentStep], () => {
  if (autoScroll.value) {
    nextTick(() => {
      scrollToCurrentStep();
    });
  }
});

// Methods
function undo() {
  canvasStore.undo();
}

function redo() {
  canvasStore.redo();
}

function goToStep(step) {
  canvasStore.goToHistoryStep(step);
}

function clearHistory() {
  if (confirm('Are you sure you want to clear the entire history? This action cannot be undone.')) {
    canvasStore.clearHistory();
    showSuccess('History cleared');
  }
}

function getActionIcon(type) {
  const icons = {
    'add': 'fas fa-plus',
    'delete': 'fas fa-trash',
    'move': 'fas fa-arrows-alt',
    'resize': 'fas fa-expand-arrows-alt',
    'rotate': 'fas fa-undo',
    'style': 'fas fa-palette',
    'text': 'fas fa-font',
    'image': 'fas fa-image',
    'shape': 'fas fa-shapes',
    'layer': 'fas fa-layer-group',
    'group': 'fas fa-object-group',
    'ungroup': 'fas fa-object-ungroup',
    'duplicate': 'fas fa-copy',
    'paste': 'fas fa-paste',
    'cut': 'fas fa-cut',
    'transform': 'fas fa-sync',
    'filter': 'fas fa-filter',
    'effect': 'fas fa-magic'
  };
  return icons[type] || 'fas fa-edit';
}

function formatActionTitle(action) {
  const titles = {
    'add': `Added ${action.objectType || 'object'}`,
    'delete': `Deleted ${action.objectType || 'object'}`,
    'move': `Moved ${action.objectType || 'object'}`,
    'resize': `Resized ${action.objectType || 'object'}`,
    'rotate': `Rotated ${action.objectType || 'object'}`,
    'style': `Styled ${action.objectType || 'object'}`,
    'text': `Edited text`,
    'image': `Added image`,
    'shape': `Added shape`,
    'layer': `Layer operation`,
    'group': `Grouped objects`,
    'ungroup': `Ungrouped objects`,
    'duplicate': `Duplicated ${action.objectType || 'object'}`,
    'paste': `Pasted objects`,
    'cut': `Cut objects`,
    'transform': `Transformed ${action.objectType || 'object'}`,
    'filter': `Applied filter`,
    'effect': `Applied effect`
  };
  
  return titles[action.type] || action.description || 'Unknown action';
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function scrollToCurrentStep() {
  if (!timelineList.value) return;
  
  const currentItem = timelineList.value.querySelector('.timeline-item.current');
  if (currentItem) {
    currentItem.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}

function updateHistoryLimit() {
  canvasStore.setHistoryLimit(parseInt(historyLimit.value));
}

function exportHistory() {
  try {
    const historyData = {
      history: history.value,
      currentStep: currentStep.value,
      exportedAt: new Date().toISOString(),
      canvasInfo: {
        width: canvasStore.canvasWidth,
        height: canvasStore.canvasHeight,
        objectCount: canvasStore.objects.length
      }
    };
    
    const blob = new Blob([JSON.stringify(historyData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `canvas-history-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showSuccess('History exported successfully');
  } catch (error) {
    console.error('Export error:', error);
    showError('Failed to export history');
  }
}

// Keyboard shortcuts
function handleKeyboard(event) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'z':
        if (event.shiftKey) {
          event.preventDefault();
          redo();
        } else {
          event.preventDefault();
          undo();
        }
        break;
      case 'y':
        event.preventDefault();
        redo();
        break;
    }
  }
}

// Setup keyboard listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeyboard);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard);
});
</script>

<style scoped>
.history-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  color: #ef4444;
  border-color: #ef4444;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  color: #4f46e5;
  border: 1px solid #4f46e5;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: #4f46e5;
  color: white;
}

.action-btn:disabled {
  background: #f3f4f6;
  color: #d1d5db;
  border-color: #d1d5db;
  cursor: not-allowed;
}

.history-timeline {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px 16px;
}

.timeline-header h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.timeline-controls {
  display: flex;
  gap: 4px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover,
.toggle-btn.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.timeline-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px 16px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  margin-bottom: 8px;
}

.timeline-item:hover {
  background: #f8fafc;
}

.timeline-item.current {
  background: #eff6ff;
  border: 1px solid #3b82f6;
}

.timeline-item.future {
  opacity: 0.5;
}

.timeline-item.future .timeline-marker {
  background: #f3f4f6;
  color: #9ca3af;
}

.timeline-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #4f46e5;
  color: white;
  border-radius: 50%;
  flex-shrink: 0;
  font-size: 12px;
}

.timeline-item.current .timeline-marker {
  background: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.action-details {
  font-size: 11px;
  color: #6b7280;
}

.action-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.action-time {
  font-weight: 500;
}

.action-type {
  text-transform: uppercase;
  font-weight: 600;
  color: #9ca3af;
}

.action-description {
  margin-bottom: 2px;
}

.action-objects {
  font-style: italic;
}

.timeline-actions {
  display: flex;
  opacity: 0;
  transition: opacity 0.2s;
}

.timeline-item:hover .timeline-actions {
  opacity: 1;
}

.goto-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 10px;
}

.goto-btn:hover {
  background: #4338ca;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h4 {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.history-options {
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  background: #f9fafb;
}

.option-group {
  margin-bottom: 12px;
}

.option-group:last-child {
  margin-bottom: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.option-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.limit-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
}

.export-btn {
  width: 100%;
  justify-content: center;
}
</style>
