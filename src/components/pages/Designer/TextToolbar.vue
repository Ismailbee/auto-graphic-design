<template>
  <Transition 
    name="toolbar-fade"
    enter-active-class="toolbar-enter-active"
    leave-active-class="toolbar-leave-active"
    enter-from-class="toolbar-enter-from"
    leave-to-class="toolbar-leave-to"
  >
    <div 
      v-if="showToolbar" 
      class="text-toolbar"
      :style="toolbarPosition"
      ref="toolbarRef"
    >
    <!-- Font Family -->
    <div class="toolbar-group">
      <select 
        v-model="textProperties.fontFamily" 
        @change="updateTextProperty('fontFamily', $event.target.value)"
        class="font-family-select"
      >
        <option value="Arial">Arial</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
        <option value="Impact">Impact</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Courier New">Courier New</option>
        <option value="Palatino">Palatino</option>
        <option value="Garamond">Garamond</option>
        <option value="Bookman">Bookman</option>
        <option value="Montserrat">Montserrat</option>
        <option value="Open Sans">Open Sans</option>
        <option value="Lato">Lato</option>
        <option value="Roboto">Roboto</option>
        <option value="Poppins">Poppins</option>
        <option value="Inter">Inter</option>
        <option value="Playfair Display">Playfair Display</option>
        <option value="Oswald">Oswald</option>
        <option value="Source Sans Pro">Source Sans Pro</option>
        <option value="Raleway">Raleway</option>
      </select>
    </div>

    <!-- Quick Text Editor (Tiptap) -->
    <div class="toolbar-group text-editor" v-if="showTextEditor">
      <div class="compact-editor-wrapper">
        <TiptapEditor
          ref="tiptapToolbarEditor"
          v-model="toolbarTextContent"
          :is-compact="true"
          :show-toolbar="false"
          placeholder="Edit text..."
          @update:modelValue="updateToolbarTextContent"
          class="toolbar-tiptap"
        />
        <button class="expand-editor-btn" @click="toggleTextEditor" title="Toggle Text Editor">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M2 7h10M2 10h6" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Toggle Text Editor Button -->
    <div class="toolbar-group editor-toggle" v-else>
      <button class="toggle-editor-btn" @click="toggleTextEditor" title="Edit Text Content">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 7h12M2 10h8" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
    </div>

    <!-- Font Size -->
    <div class="toolbar-group">
      <button 
        class="size-btn decrease"
        @click="changeFontSize(-2)"
        :disabled="textProperties.fontSize <= 8"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8h12" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
      <input 
        type="number" 
        v-model.number="textProperties.fontSize"
        @change="updateTextProperty('fontSize', $event.target.value)"
        class="font-size-input"
        min="8"
        max="200"
      />
      <button 
        class="size-btn increase"
        @click="changeFontSize(2)"
        :disabled="textProperties.fontSize >= 200"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
    </div>

    <!-- Text Formatting -->
    <div class="toolbar-group formatting">
      <button 
        class="format-btn"
        :class="{ active: textProperties.fontWeight === 'bold' }"
        @click="toggleBold"
        title="Bold (Ctrl+B)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 2h5a3 3 0 0 1 3 3 3 3 0 0 1-1.5 2.598A3.5 3.5 0 0 1 9 14H4V2zM7 7h2a1.5 1.5 0 0 0 0-3H7v3zM7 9v3h2.5a1.5 1.5 0 0 0 0-3H7z" fill="currentColor"/>
        </svg>
      </button>
      
      <button 
        class="format-btn"
        :class="{ active: textProperties.fontStyle === 'italic' }"
        @click="toggleItalic"
        title="Italic (Ctrl+I)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 2h6l-1 2h-1.5l-2 8H9l-1 2H2l1-2h1.5l2-8H5l1-2z" fill="currentColor"/>
        </svg>
      </button>
      
      <button 
        class="format-btn"
        :class="{ active: textProperties.underline }"
        @click="toggleUnderline"
        title="Underline (Ctrl+U)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 2v6a5 5 0 0 0 10 0V2m-7 12h8" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
      </button>
    </div>

    <!-- Text Alignment -->
    <div class="toolbar-group alignment">
      <button 
        class="align-btn"
        :class="{ active: textProperties.textAlign === 'left' }"
        @click="setAlignment('left')"
        title="Align Left"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M2 6h8M2 9h12M2 12h8" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
      
      <button 
        class="align-btn"
        :class="{ active: textProperties.textAlign === 'center' }"
        @click="setAlignment('center')"
        title="Align Center"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M4 6h8M2 9h12M4 12h8" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
      
      <button 
        class="align-btn"
        :class="{ active: textProperties.textAlign === 'right' }"
        @click="setAlignment('right')"
        title="Align Right"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M6 6h8M2 9h12M6 12h8" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
    </div>

    <!-- Text Color -->
    <div class="toolbar-group color">
      <div class="color-picker-wrapper">
        <button class="color-btn" @click="$refs.colorPicker.click()">
          <div class="color-preview" :style="{ backgroundColor: textProperties.fill }"></div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 5l3 3 3-3" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>
        <input 
          type="color" 
          ref="colorPicker"
          v-model="textProperties.fill"
          @input="updateTextProperty('fill', $event.target.value)"
          class="hidden-color-input"
        />
      </div>
    </div>

    <!-- Letter Spacing -->
    <div class="toolbar-group spacing">
      <label class="spacing-label">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h2M12 4h2M2 8h2M12 8h2M2 12h2M12 12h2M6 2v12M10 2v12" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <input 
          type="range" 
          min="-50"
          max="200"
          step="10"
          v-model.number="textProperties.charSpacing"
          @input="updateTextProperty('charSpacing', $event.target.value)"
          class="spacing-slider"
        />
        <span class="spacing-value">{{ textProperties.charSpacing }}</span>
      </label>
    </div>

    <!-- Line Height -->
    <div class="toolbar-group line-height">
      <label class="spacing-label">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 2v12M13 2v12M6 4h4M6 8h4M6 12h4" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <input 
          type="range" 
          min="0.5"
          max="3"
          step="0.1"
          v-model.number="textProperties.lineHeight"
          @input="updateTextProperty('lineHeight', $event.target.value)"
          class="spacing-slider"
        />
        <span class="spacing-value">{{ textProperties.lineHeight }}</span>
      </label>
    </div>

    <!-- Text Effects -->
    <div class="toolbar-group effects">
      <div class="dropdown-wrapper">
        <button class="effects-btn" @click="toggleEffectsDropdown">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l2.5 5h5L11 10l1.5 5L8 12l-4.5 3L5 10 0.5 6h5L8 1z" fill="currentColor"/>
          </svg>
          Effects
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="dropdown-arrow">
            <path d="M3 5l3 3 3-3" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>
        
        <div v-if="showEffectsDropdown" class="effects-dropdown">
          <button @click="addShadow" class="effect-option">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6" cy="6" r="4" fill="currentColor" opacity="0.3"/>
              <circle cx="5" cy="5" r="4" fill="currentColor"/>
            </svg>
            Shadow
          </button>
          <button @click="addStroke" class="effect-option">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            Outline
          </button>
          <button @click="removeEffects" class="effect-option">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            Remove Effects
          </button>
        </div>
      </div>
    </div>

    <!-- More Options -->
    <div class="toolbar-group more">
      <button class="more-btn" @click="toggleMoreOptions">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="3" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="13" cy="8" r="1.5" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from '../../../stores/canvas-fabric'
import TiptapEditor from '../../common/TiptapEditor.vue'

const canvasStore = useCanvasStore()
const toolbarRef = ref(null)
const showEffectsDropdown = ref(false)

// Tiptap editor refs and state
const tiptapToolbarEditor = ref(null)
const showTextEditor = ref(false)
const toolbarTextContent = ref('')

// Text properties
const textProperties = reactive({
  fontFamily: 'Arial',
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  underline: false,
  textAlign: 'left',
  fill: '#000000',
  charSpacing: 0,
  lineHeight: 1.2
})

// Show toolbar when text is selected
const showToolbar = computed(() => {
  return canvasStore.activeObject && 
         (canvasStore.activeObject.type === 'textbox' ||
          canvasStore.activeObject.type === 'text' ||
          canvasStore.activeObject.type === 'i-text')
})

// Calculate toolbar position
const toolbarPosition = computed(() => {
  if (!showToolbar.value || !canvasStore.fabricCanvas) return { display: 'none' }
  
  const canvas = canvasStore.fabricCanvas
  const activeObj = canvasStore.activeObject
  
  if (!activeObj) return { display: 'none' }
  
  // Get object bounds
  const bounds = activeObj.getBoundingRect()
  const canvasEl = canvas.upperCanvasEl
  const canvasRect = canvasEl.getBoundingClientRect()
  const zoom = canvas.getZoom()
  const vpt = canvas.viewportTransform
  
  // Calculate position above the text object, considering viewport transform
  const left = canvasRect.left + ((bounds.left + vpt[4]) * zoom)
  const top = canvasRect.top + ((bounds.top + vpt[5]) * zoom) - 70 // 70px above the text
  
  // Ensure toolbar stays within viewport
  const toolbarWidth = 800 // Approximate toolbar width
  const viewportWidth = window.innerWidth
  const finalLeft = Math.max(20, Math.min(left, viewportWidth - toolbarWidth - 20))
  const finalTop = Math.max(20, top)
  
  return {
    position: 'fixed',
    left: `${finalLeft}px`,
    top: `${finalTop}px`,
    zIndex: 1000
  }
})

// Update text properties when active object changes
watch(() => canvasStore.activeObject, (newObj) => {
  if (newObj && (newObj.type === 'textbox' || newObj.type === 'text' || newObj.type === 'i-text')) {
    updatePropertiesFromObject(newObj)
  }
}, { immediate: true })

// Watch for text content changes
watch(() => canvasStore.activeObject?.text, (newText) => {
  if (newText !== undefined && newText !== toolbarTextContent.value) {
    toolbarTextContent.value = newText
  }
}, { immediate: true })

function updatePropertiesFromObject(obj) {
  textProperties.fontFamily = obj.fontFamily || 'Arial'
  textProperties.fontSize = obj.fontSize || 16
  textProperties.fontWeight = obj.fontWeight || 'normal'
  textProperties.fontStyle = obj.fontStyle || 'normal'
  textProperties.underline = obj.underline || false
  textProperties.textAlign = obj.textAlign || 'left'
  textProperties.fill = obj.fill || '#000000'
  textProperties.charSpacing = obj.charSpacing || 0
  textProperties.lineHeight = obj.lineHeight || 1.2
}

function updateTextProperty(property, value) {
  if (!canvasStore.activeObject) return
  
  const obj = canvasStore.activeObject
  obj.set(property, value)
  canvasStore.fabricCanvas.renderAll()
  canvasStore.saveState()
}

function changeFontSize(delta) {
  const newSize = Math.max(8, Math.min(200, textProperties.fontSize + delta))
  textProperties.fontSize = newSize
  updateTextProperty('fontSize', newSize)
}

function toggleBold() {
  const newWeight = textProperties.fontWeight === 'bold' ? 'normal' : 'bold'
  textProperties.fontWeight = newWeight
  updateTextProperty('fontWeight', newWeight)
}

function toggleItalic() {
  const newStyle = textProperties.fontStyle === 'italic' ? 'normal' : 'italic'
  textProperties.fontStyle = newStyle
  updateTextProperty('fontStyle', newStyle)
}

function toggleUnderline() {
  const newUnderline = !textProperties.underline
  textProperties.underline = newUnderline
  updateTextProperty('underline', newUnderline)
}

function setAlignment(align) {
  textProperties.textAlign = align
  updateTextProperty('textAlign', align)
}

function toggleEffectsDropdown() {
  showEffectsDropdown.value = !showEffectsDropdown.value
}

function addShadow() {
  if (!canvasStore.activeObject) return
  
  const obj = canvasStore.activeObject
  obj.set('shadow', {
    color: 'rgba(0,0,0,0.3)',
    blur: 5,
    offsetX: 3,
    offsetY: 3
  })
  canvasStore.fabricCanvas.renderAll()
  canvasStore.saveState()
  showEffectsDropdown.value = false
}

function addStroke() {
  if (!canvasStore.activeObject) return
  
  const obj = canvasStore.activeObject
  obj.set({
    stroke: '#000000',
    strokeWidth: 2
  })
  canvasStore.fabricCanvas.renderAll()
  canvasStore.saveState()
  showEffectsDropdown.value = false
}

function removeEffects() {
  if (!canvasStore.activeObject) return
  
  const obj = canvasStore.activeObject
  obj.set({
    shadow: null,
    stroke: null,
    strokeWidth: 0
  })
  canvasStore.fabricCanvas.renderAll()
  canvasStore.saveState()
  showEffectsDropdown.value = false
}

// Tiptap editor functions
function toggleTextEditor() {
  showTextEditor.value = !showTextEditor.value
  
  if (showTextEditor.value && canvasStore.activeObject) {
    // Load current text content into Tiptap editor
    toolbarTextContent.value = canvasStore.activeObject.text || ''
    nextTick(() => {
      if (tiptapToolbarEditor.value) {
        tiptapToolbarEditor.value.focus()
      }
    })
  }
}

function updateToolbarTextContent(html) {
  // Convert HTML to plain text for Fabric.js
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  const plainText = tempDiv.textContent || tempDiv.innerText || ''
  
  if (canvasStore.activeObject && plainText !== canvasStore.activeObject.text) {
    canvasStore.activeObject.set('text', plainText)
    canvasStore.fabricCanvas.renderAll()
    canvasStore.saveState()
    
    // Update the toolbar text content to stay in sync
    toolbarTextContent.value = plainText
  }
}

function toggleMoreOptions() {
  // Implementation for more options
  console.log('More options clicked')
}

// Close dropdowns when clicking outside
function handleClickOutside(event) {
  if (showEffectsDropdown.value && !event.target.closest('.effects')) {
    showEffectsDropdown.value = false
  }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
  if (!showToolbar.value || !canvasStore.activeObject) return
  
  // Only handle shortcuts if a text object is selected and not in editing mode
  if (document.activeElement.tagName === 'INPUT' || 
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.contentEditable === 'true') {
    return
  }
  
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault()
        toggleBold()
        break
      case 'i':
        event.preventDefault()
        toggleItalic()
        break
      case 'u':
        event.preventDefault()
        toggleUnderline()
        break
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyboardShortcuts)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyboardShortcuts)
})
</script>

<style scoped>
.text-toolbar {
  display: flex;
  align-items: center;
  gap: 1px;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-width: 800px;
  max-width: 90vw;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  position: relative;
}

.toolbar-group:not(:last-child)::after {
  content: '';
  width: 1px;
  height: 24px;
  background: #e1e5e9;
  margin-left: 8px;
}

/* Font Family Select */
.font-family-select {
  min-width: 140px;
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: #ffffff;
  font-size: 14px;
  color: #1e1e1e;
  cursor: pointer;
  transition: all 0.2s ease;
}

.font-family-select:hover {
  border-color: #8b5cf6;
}

.font-family-select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* Font Size Controls */
.size-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: #ffffff;
  color: #1e1e1e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.size-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #8b5cf6;
}

.size-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.font-size-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  color: #1e1e1e;
  background: #ffffff;
}

.font-size-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* Format Buttons */
.format-btn, .align-btn {
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #1e1e1e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.format-btn:hover, .align-btn:hover {
  background: #f8f9fa;
  border-color: #e1e5e9;
}

.format-btn.active, .align-btn.active {
  background: #8b5cf6;
  color: #ffffff;
  border-color: #8b5cf6;
}

/* Color Picker */
.color-picker-wrapper {
  position: relative;
}

.color-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn:hover {
  border-color: #8b5cf6;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #e1e5e9;
}

.hidden-color-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Spacing Controls */
.spacing-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.spacing-slider {
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: #e1e5e9;
  outline: none;
  cursor: pointer;
}

.spacing-slider::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  -webkit-appearance: none;
}

.spacing-value {
  min-width: 30px;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

/* Effects Dropdown */
.dropdown-wrapper {
  position: relative;
}

.effects-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: #ffffff;
  color: #1e1e1e;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.effects-btn:hover {
  border-color: #8b5cf6;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
}

.effects-btn:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.effects-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 8px;
  min-width: 160px;
  z-index: 1001;
  margin-top: 4px;
}

.effect-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #1e1e1e;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  text-align: left;
}

.effect-option:hover {
  background: #f8f9fa;
}

/* More Options */
.more-btn {
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #1e1e1e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.more-btn:hover {
  background: #f8f9fa;
  border-color: #e1e5e9;
}

/* Dark theme support */
.dark-theme .text-toolbar {
  background: #2d3748;
  border-color: #4a5568;
}

.dark-theme .font-family-select,
.dark-theme .font-size-input,
.dark-theme .size-btn,
.dark-theme .color-btn,
.dark-theme .effects-btn {
  background: #2d3748;
  color: #ffffff;
  border-color: #4a5568;
}

.dark-theme .format-btn:hover,
.dark-theme .align-btn:hover,
.dark-theme .size-btn:hover,
.dark-theme .color-btn:hover,
.dark-theme .effects-btn:hover {
  background: #4a5568;
}

.dark-theme .effects-dropdown {
  background: #2d3748;
  border-color: #4a5568;
}

.dark-theme .effect-option {
  color: #ffffff;
}

.dark-theme .effect-option:hover {
  background: #4a5568;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .text-toolbar {
    min-width: 600px;
    padding: 6px 8px;
  }
  
  .font-family-select {
    min-width: 120px;
  }
  
  .spacing-slider {
    width: 60px;
  }
}

@media (max-width: 768px) {
  .text-toolbar {
    flex-wrap: wrap;
    min-width: 400px;
    gap: 4px;
  }
  
  .toolbar-group {
    padding: 0 4px;
  }
  
  .font-family-select {
    min-width: 100px;
  }
}

/* Text Editor Styles */
.text-editor {
  min-width: 200px;
  max-width: 300px;
}

.compact-editor-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 4px;
}

.toolbar-tiptap {
  flex: 1;
  border: none !important;
  background: transparent !important;
}

.toolbar-tiptap :deep(.ProseMirror) {
  min-height: 32px !important;
  max-height: 60px !important;
  padding: 4px 8px !important;
  font-size: 14px !important;
  overflow-y: auto;
}

.expand-editor-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.expand-editor-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.editor-toggle {
  padding: 0 4px;
}

.toggle-editor-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-editor-btn:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #8b5cf6;
}

/* Toolbar animations */
.toolbar-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.toolbar-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}
</style>
