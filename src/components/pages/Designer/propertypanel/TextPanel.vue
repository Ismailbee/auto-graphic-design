<!-- 
Copilot Setup: 
This is the Tiptap-based text editor panel.
- Use Tiptap for Vue 3 (headless editor).
- Provide formatting (bold, italic, underline, font size, alignment, color).
- On change → update selected Fabric.js text object.
- Should integrate smoothly with Fabric.js.
-->


<template>
  <div class="property-section" v-if="isText">
    <div class="section-title">Text</div>
    
    <!-- Text Content Editor with Tiptap -->
    <div class="property-row full-width" v-if="textContent">
      <label>Content</label>
      <div class="text-editor-container">
        <TiptapEditor
          ref="tiptapEditor"
          v-model="textContent"
          :is-compact="true"
          :show-toolbar="true"
          placeholder="Edit your text..."
          @update:modelValue="updateTextContent"
          @focus="onEditorFocus"
          @blur="onEditorBlur"
        />
      </div>
    </div>
    
    <div class="property-grid">
      <div class="property-row full-width">
        <label>Font</label>
        <select v-model="textProps.fontFamily" @change="updateProperty('fontFamily', textProps.fontFamily)">
          <option v-for="font in fontFamilies" :key="font" :value="font">{{ font }}</option>
        </select>
      </div>
      <div class="property-row">
        <label>Size</label>
        <input type="number" v-model.number="textProps.fontSize" @change="updateProperty('fontSize', textProps.fontSize)" min="8" max="120" />
      </div>
      <div class="property-row">
        <label>Style</label>
        <div class="button-group">
          <button @click="toggleStyle('fontWeight', textProps.fontWeight === 'bold' ? 'normal' : 'bold')" :class="{ active: textProps.fontWeight === 'bold' }" title="Bold">
            <i class="fas fa-bold"></i>
          </button>
          <button @click="toggleStyle('fontStyle', textProps.fontStyle === 'italic' ? 'normal' : 'italic')" :class="{ active: textProps.fontStyle === 'italic' }" title="Italic">
            <i class="fas fa-italic"></i>
          </button>
          <button @click="toggleStyle('underline', !textProps.underline)" :class="{ active: textProps.underline }" title="Underline">
            <i class="fas fa-underline"></i>
          </button>
          <button @click="toggleStyle('linethrough', !textProps.linethrough)" :class="{ active: textProps.linethrough }" title="Strikethrough">
            <i class="fas fa-strikethrough"></i>
          </button>
        </div>
      </div>
      <div class="property-row full-width">
        <label>Alignment</label>
        <div class="button-group">
          <button @click="updateProperty('textAlign', 'left')" :class="{ active: textProps.textAlign === 'left' }" title="Align Left">
            <i class="fas fa-align-left"></i>
          </button>
          <button @click="updateProperty('textAlign', 'center')" :class="{ active: textProps.textAlign === 'center' }" title="Align Center">
            <i class="fas fa-align-center"></i>
          </button>
          <button @click="updateProperty('textAlign', 'right')" :class="{ active: textProps.textAlign === 'right' }" title="Align Right">
            <i class="fas fa-align-right"></i>
          </button>
          <button @click="updateProperty('textAlign', 'justify')" :class="{ active: textProps.textAlign === 'justify' }" title="Justify">
            <i class="fas fa-align-justify"></i>
          </button>
        </div>
      </div>
      <div class="property-row full-width">
        <label>Letter Spacing</label>
        <div class="range-with-value">
          <input type="range" v-model.number="textProps.charSpacing" @change="updateProperty('charSpacing', textProps.charSpacing)" min="0" max="1000" step="10" />
          <span>{{ textProps.charSpacing }}</span>
        </div>
      </div>
      <div class="property-row full-width">
        <label>Line Height</label>
        <div class="range-with-value">
          <input type="range" v-model.number="textProps.lineHeight" @change="updateProperty('lineHeight', textProps.lineHeight)" min="0.5" max="2.5" step="0.1" />
          <span>{{ textProps.lineHeight }}</span>
        </div>
      </div>
      
      <!-- Additional text properties to ensure scrolling -->
      <div class="property-row full-width">
        <label>Text Color</label>
        <input type="color" v-model="textProps.fill" @change="updateProperty('fill', textProps.fill)" />
      </div>
      
      <div class="property-row full-width">
        <label>Background</label>
        <div class="color-with-toggle">
          <input type="color" v-model="textProps.backgroundColor" @change="updateProperty('backgroundColor', textProps.backgroundColor)" :disabled="!textProps.hasTextBackground" />
          <button class="toggle-button" @click="toggleTextBackground" :class="{ active: textProps.hasTextBackground }">
            <i class="fas fa-fill-drip"></i>
          </button>
        </div>
      </div>
      
      <div class="property-row full-width">
        <label>Text Effects</label>
        <div class="button-group">
          <button @click="toggleStyle('shadow', !textProps.hasShadow)" :class="{ active: textProps.hasShadow }" title="Shadow">
            <i class="fas fa-clone"></i>
          </button>
          <button @click="toggleStyle('textDecoration', textProps.textDecoration === 'overline' ? '' : 'overline')" 
                 :class="{ active: textProps.textDecoration === 'overline' }" title="Overline">
            <i class="fas fa-overline"></i>O
          </button>
          <button @click="toggleStyle('fontStyle', textProps.fontStyle === 'italic' ? 'normal' : 'italic')" 
                 :class="{ active: textProps.fontStyle === 'italic' }" title="Italic">
            <i class="fas fa-italic"></i>
          </button>
        </div>
      </div>
      
      <div class="property-row full-width">
        <label>Text Transformation</label>
        <select v-model="textProps.textCase" @change="transformTextCase">
          <option value="none">Normal Text</option>
          <option value="uppercase">UPPERCASE</option>
          <option value="lowercase">lowercase</option>
          <option value="capitalize">Title Case</option>
        </select>
      </div>
      
      <div class="property-row full-width">
        <label>Text Outline</label>
        <div class="outline-controls">
          <input type="color" v-model="textProps.stroke" @change="updateProperty('stroke', textProps.stroke)" />
          <div class="range-with-value">
            <input type="range" v-model.number="textProps.strokeWidth" @change="updateProperty('strokeWidth', textProps.strokeWidth)" min="0" max="5" step="0.1" />
            <span>{{ textProps.strokeWidth }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits, nextTick } from 'vue';
import TiptapEditor from '../../../common/TiptapEditor.vue';

const props = defineProps({
  object: Object,
});

const emit = defineEmits(['update-property', 'toggle-text-style']);

const tiptapEditor = ref(null);

const textProps = ref({ 
  fontFamily: 'Arial', 
  fontSize: 20, 
  fontWeight: 'normal', 
  fontStyle: 'normal',
  underline: false,
  linethrough: false,
  textAlign: 'left',
  charSpacing: 0,
  lineHeight: 1.16,
  fill: '#000000',
  backgroundColor: 'transparent',
  hasTextBackground: false,
  hasShadow: false,
  textDecoration: '',
  textCase: 'none',
  stroke: '#000000',
  strokeWidth: 0
});

const textContent = ref('');

const fontFamilies = [
  'Arial', 'Helvetica', 'Verdana', 'Georgia', 'Times New Roman', 
  'Courier New', 'Impact', 'Comic Sans MS', 'Tahoma', 'Trebuchet MS', 
  'Palatino', 'Garamond', 'Bookman', 'Avant Garde'
];

const isText = computed(() => props.object && (props.object.type === 'text' || props.object.type === 'i-text'));

watch(() => props.object, (obj) => {
  if (!isText.value) return;
  
  // Update text properties
  textProps.value.fontFamily = obj.fontFamily;
  textProps.value.fontSize = obj.fontSize;
  textProps.value.fontWeight = obj.fontWeight;
  textProps.value.fontStyle = obj.fontStyle;
  textProps.value.underline = obj.underline;
  textProps.value.linethrough = obj.linethrough;
  textProps.value.textAlign = obj.textAlign;
  textProps.value.charSpacing = obj.charSpacing || 0;
  textProps.value.lineHeight = obj.lineHeight || 1.16;
  textProps.value.fill = obj.fill || '#000000';
  textProps.value.backgroundColor = obj.backgroundColor || 'transparent';
  textProps.value.hasTextBackground = !!obj.backgroundColor;
  textProps.value.hasShadow = !!obj.shadow;
  textProps.value.textDecoration = obj.textDecoration || '';
  textProps.value.textCase = 'none';
  textProps.value.stroke = obj.stroke || '#000000';
  textProps.value.strokeWidth = obj.strokeWidth || 0;
  
  // Update text content for Tiptap editor
  const objText = obj.text || '';
  if (textContent.value !== objText) {
    textContent.value = objText;
  }
}, { immediate: true, deep: true });

function updateProperty(prop, value) {
  emit('update-property', prop, value);
}

function toggleStyle(prop, value) {
  emit('toggle-text-style', prop, value);
}

function toggleTextBackground() {
  textProps.value.hasTextBackground = !textProps.value.hasTextBackground;
  const bgColor = textProps.value.hasTextBackground ? textProps.value.backgroundColor : 'transparent';
  emit('update-property', 'backgroundColor', bgColor);
}

function transformTextCase() {
  if (!props.object || !props.object.text) return;
  
  let newText = props.object.text;
  switch (textProps.value.textCase) {
    case 'uppercase':
      newText = props.object.text.toUpperCase();
      break;
    case 'lowercase':
      newText = props.object.text.toLowerCase();
      break;
    case 'capitalize':
      newText = props.object.text.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      break;
  }
  
  if (newText !== props.object.text) {
    emit('update-property', 'text', newText);
  }
}

// Tiptap editor event handlers
function updateTextContent(html) {
  // Convert HTML to plain text for Fabric.js
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const plainText = tempDiv.textContent || tempDiv.innerText || '';
  
  if (plainText !== textContent.value) {
    textContent.value = plainText;
    emit('update-property', 'text', plainText);
  }
}

function onEditorFocus() {
  // Focus handling if needed
}

function onEditorBlur() {
  // Blur handling if needed
}
</script>

<style scoped>
@import './propertyPanelStyles.css';

.text-editor-container {
  margin-top: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.text-editor-container :deep(.tiptap-editor) {
  border: none;
}

.text-editor-container :deep(.ProseMirror) {
  min-height: 80px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
