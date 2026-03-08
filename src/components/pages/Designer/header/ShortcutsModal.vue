<template>
  <div class="modal-overlay" v-if="show" @click.self="close">
    <div class="modal-content shortcuts-content">
      <div class="modal-header">
        <h3>Keyboard Shortcuts</h3>
        <button class="close-btn" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="shortcuts-search">
          <input type="text" placeholder="Search shortcuts..." v-model="shortcutsSearchQuery">
          <button><i class="fas fa-search"></i></button>
        </div>

        <div class="shortcuts-grid">
          <div class="shortcuts-category">
            <h4>General</h4>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Z</kbd></span>
              <span class="shortcut-desc">Undo</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd></span>
              <span class="shortcut-desc">Redo</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>S</kbd></span>
              <span class="shortcut-desc">Save</span>
            </div>
          </div>

          <div class="shortcuts-category">
            <h4>Tools</h4>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>V</kbd></span>
              <span class="shortcut-desc">Select Tool</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>T</kbd></span>
              <span class="shortcut-desc">Text Tool</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>R</kbd></span>
              <span class="shortcut-desc">Rectangle Tool</span>
            </div>
          </div>

          <div class="shortcuts-category">
            <h4>Object Manipulation</h4>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>D</kbd></span>
              <span class="shortcut-desc">Duplicate</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>Delete</kbd></span>
              <span class="shortcut-desc">Delete</span>
            </div>
          </div>

          <div class="shortcuts-category">
            <h4>View</h4>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>+</kbd></span>
              <span class="shortcut-desc">Zoom In</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>-</kbd></span>
              <span class="shortcut-desc">Zoom Out</span>
            </div>
          </div>
        </div>

        <div class="shortcuts-footer">
          <button class="print-shortcuts-btn">
            <i class="fas fa-print"></i> Print Shortcuts
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(['close'])

const shortcutsSearchQuery = ref('')

function close() {
  emit('close')
}
</script>

<style scoped>
/* Using styles from AppHeader.vue for now */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1002;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 16px;
  width: 550px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.dark-theme .modal-content {
  background-color: #2d3748;
  color: var(--text-dark-primary);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--header-border-light);
}

.dark-theme .modal-header {
  border-bottom-color: var(--header-border-dark);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-light-secondary);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
