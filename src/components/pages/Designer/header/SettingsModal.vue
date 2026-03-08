<template>
  <div class="modal-overlay" v-if="show" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Settings</h3>
        <button class="close-btn" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="settings-tabs">
          <button
            class="settings-tab"
            :class="{ active: activeSettingsTab === 'appearance' }"
            @click="activeSettingsTab = 'appearance'"
          >
            <i class="fas fa-palette"></i> Appearance
          </button>
          <button
            class="settings-tab"
            :class="{ active: activeSettingsTab === 'canvas' }"
            @click="activeSettingsTab = 'canvas'"
          >
            <i class="fas fa-th"></i> Canvas
          </button>
          <button
            class="settings-tab"
            :class="{ active: activeSettingsTab === 'export' }"
            @click="activeSettingsTab = 'export'"
          >
            <i class="fas fa-file-export"></i> Export
          </button>
          <button
            class="settings-tab"
            :class="{ active: activeSettingsTab === 'keyboard' }"
            @click="activeSettingsTab = 'keyboard'"
          >
            <i class="fas fa-keyboard"></i> Shortcuts
          </button>
        </div>

        <div class="settings-tab-content">
          <div v-if="activeSettingsTab === 'appearance'">
            <div class="setting-group">
              <h4>Theme</h4>
              <div class="theme-selector">
                <button
                  class="theme-option"
                  :class="{ active: canvasStore.workspaceTheme === 'light' }"
                  @click="canvasStore.workspaceTheme = 'light'"
                >
                  <div class="theme-preview light"></div>
                  <span>Light</span>
                </button>
                <button
                  class="theme-option"
                  :class="{ active: canvasStore.workspaceTheme === 'dark' }"
                  @click="canvasStore.workspaceTheme = 'dark'"
                >
                  <div class="theme-preview dark"></div>
                  <span>Dark</span>
                </button>
                <button
                  class="theme-option"
                  :class="{ active: canvasStore.workspaceTheme === 'custom' }"
                  @click="canvasStore.workspaceTheme = 'custom'"
                >
                  <div class="theme-preview custom" :style="{ backgroundColor: customThemeColor }">
                    <input type="color" v-model="customThemeColor" @input="updateCustomTheme">
                  </div>
                  <span>Custom</span>
                </button>
              </div>
            </div>

            <div class="setting-group">
              <h4>Interface Density</h4>
              <div class="density-selector">
                <button
                  class="density-option"
                  :class="{ active: interfaceDensity === 'compact' }"
                  @click="interfaceDensity = 'compact'"
                >
                  <i class="fas fa-compress"></i>
                  <span>Compact</span>
                </button>
                <button
                  class="density-option"
                  :class="{ active: interfaceDensity === 'comfortable' }"
                  @click="interfaceDensity = 'comfortable'"
                >
                  <i class="fas fa-expand"></i>
                  <span>Comfortable</span>
                </button>
              </div>
            </div>

            <div class="setting-group">
              <h4>Zoom Controls</h4>
              <div class="toggle-switch">
                <input type="checkbox" id="zoom-controls" v-model="showZoomControls">
                <label for="zoom-controls"></label>
                <span>Show zoom controls on canvas</span>
              </div>
            </div>
          </div>

          <div v-if="activeSettingsTab === 'canvas'">
            <div class="setting-group">
              <h4>Default Canvas Size</h4>
              <div class="canvas-size-presets">
                <button
                  v-for="preset in canvasSizePresets"
                  :key="preset.name"
                  :class="{ active: defaultCanvasSize === preset.name }"
                  @click="defaultCanvasSize = preset.name"
                >
                  {{ preset.name }}
                </button>
                <button
                  :class="{ active: defaultCanvasSize === 'custom' }"
                  @click="defaultCanvasSize = 'custom'"
                >
                  Custom
                </button>
              </div>

              <div class="custom-canvas-size" v-if="defaultCanvasSize === 'custom'">
                <div class="dimension-input">
                  <label>Width</label>
                  <input type="number" v-model="customCanvasWidth" min="1" max="10000">
                  <select v-model="canvasSizeUnit">
                    <option value="px">px</option>
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                  </select>
                </div>
                <div class="dimension-input">
                  <label>Height</label>
                  <input type="number" v-model="customCanvasHeight" min="1" max="10000">
                  <select v-model="canvasSizeUnit">
                    <option value="px">px</option>
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h4>Grid</h4>
              <div class="toggle-switch">
                <input type="checkbox" id="show-grid" v-model="showGrid">
                <label for="show-grid"></label>
                <span>Show grid</span>
              </div>
              <div class="grid-options" v-if="showGrid">
                <div class="grid-size">
                  <label>Grid size</label>
                  <input type="range" min="5" max="100" v-model="gridSize">
                  <span>{{ gridSize }}px</span>
                </div>
                <div class="grid-color">
                  <label>Grid color</label>
                  <input type="color" v-model="gridColor">
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h4>Rulers</h4>
              <div class="toggle-switch">
                <input type="checkbox" id="show-rulers" v-model="showRulers">
                <label for="show-rulers"></label>
                <span>Show rulers</span>
              </div>
            </div>

            <div class="setting-group">
              <h4>Autosave</h4>
              <div class="toggle-switch">
                <input type="checkbox" id="autosave" v-model="canvasStore.isAutosaveEnabled">
                <label for="autosave"></label>
                <span>{{ canvasStore.isAutosaveEnabled ? 'Enabled' : 'Disabled' }}</span>
              </div>
              <div class="autosave-interval" v-if="canvasStore.isAutosaveEnabled">
                <label>Autosave interval</label>
                <select v-model="autosaveInterval">
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                  <option value="600">10 minutes</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="activeSettingsTab === 'export'">
            <div class="setting-group">
              <h4>Default Export Format</h4>
              <div class="export-format-options">
                <div class="format-option" v-for="format in ['png', 'jpeg', 'svg', 'pdf']" :key="format">
                  <input
                    type="radio"
                    :id="'format-' + format"
                    :value="format"
                    v-model="defaultExportFormat"
                  >
                  <label :for="'format-' + format">{{ format.toUpperCase() }}</label>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h4>Image Quality</h4>
              <div class="quality-slider">
                <input type="range" min="1" max="100" v-model="exportQuality">
                <span>{{ exportQuality }}%</span>
              </div>
            </div>

            <div class="setting-group">
              <h4>PNG Options</h4>
              <div class="toggle-switch">
                <input type="checkbox" id="transparent-bg" v-model="transparentBackground">
                <label for="transparent-bg"></label>
                <span>Transparent background</span>
              </div>
            </div>
          </div>

          <div v-if="activeSettingsTab === 'keyboard'">
            <div class="setting-group">
              <h4>Keyboard Shortcuts</h4>
              <div class="shortcuts-list">
                <div class="shortcuts-category">
                  <h5>General</h5>
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
                  <h5>Tools</h5>
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
                  <div class="shortcut-item">
                    <span class="shortcut-keys"><kbd>E</kbd></span>
                    <span class="shortcut-desc">Ellipse Tool</span>
                  </div>
                  <div class="shortcut-item">
                    <span class="shortcut-keys"><kbd>H</kbd></span>
                    <span class="shortcut-desc">Hand Tool</span>
                  </div>
                </div>
              </div>

              <button class="view-all-shortcuts-btn" @click="$emit('show-shortcuts')">
                <i class="fas fa-external-link-alt"></i> View All Shortcuts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCanvasStore } from '../../../../stores/canvas-konva'

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(['close', 'show-shortcuts'])

const canvasStore = useCanvasStore()

const activeSettingsTab = ref('appearance')
const customThemeColor = ref('#4040ff')
const interfaceDensity = ref('comfortable')
const showZoomControls = ref(true)
const defaultCanvasSize = ref('Instagram Post')
const customCanvasWidth = ref(1080)
const customCanvasHeight = ref(1080)
const canvasSizeUnit = ref('px')
const showGrid = ref(false)
const gridSize = ref(20)
const gridColor = ref('#cccccc')
const showRulers = ref(true)
const autosaveInterval = ref(60)
const defaultExportFormat = ref('png')
const exportQuality = ref(85)
const transparentBackground = ref(true)

const canvasSizePresets = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Twitter Post', width: 1024, height: 512 },
]

function close() {
  emit('close')
}

function updateCustomTheme() {
  document.documentElement.style.setProperty('--custom-theme-color', customThemeColor.value)
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
