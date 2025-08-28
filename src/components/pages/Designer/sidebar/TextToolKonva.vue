<template>
  <div class="text-tool-panel">
    <h3 class="panel-title">Add Text</h3>
    
    <div class="text-presets">
      <div v-for="preset in textPresets" :key="preset.id" class="text-preset" @click="addText(preset)">
        <div class="preset-preview" :style="getPresetStyle(preset)">{{ preset.sample }}</div>
        <div class="preset-name">{{ preset.name }}</div>
      </div>
    </div>
    
    <div class="text-custom">
      <h4 class="section-title">Custom Text</h4>
      <div class="form-group">
        <input 
          type="text" 
          v-model="customText" 
          placeholder="Enter your text" 
          class="text-input"
        />
      </div>
      <div class="form-group">
        <label>Font Family</label>
        <select v-model="fontFamily" class="select-input">
          <option v-for="font in fontFamilies" :key="font" :value="font">{{ font }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Font Size</label>
        <input type="range" v-model="fontSize" min="12" max="120" class="range-input" />
        <span class="range-value">{{ fontSize }}px</span>
      </div>
      <div class="form-group">
        <label>Font Style</label>
        <div class="button-group">
          <button 
            class="style-button" 
            :class="{ active: fontStyle.includes('bold') }" 
            @click="toggleBold"
          >
            <i class="fas fa-bold"></i>
          </button>
          <button 
            class="style-button" 
            :class="{ active: fontStyle.includes('italic') }" 
            @click="toggleItalic"
          >
            <i class="fas fa-italic"></i>
          </button>
          <button 
            class="style-button" 
            :class="{ active: textAlign === 'left' }" 
            @click="textAlign = 'left'"
          >
            <i class="fas fa-align-left"></i>
          </button>
          <button 
            class="style-button" 
            :class="{ active: textAlign === 'center' }" 
            @click="textAlign = 'center'"
          >
            <i class="fas fa-align-center"></i>
          </button>
          <button 
            class="style-button" 
            :class="{ active: textAlign === 'right' }" 
            @click="textAlign = 'right'"
          >
            <i class="fas fa-align-right"></i>
          </button>
        </div>
      </div>
      <div class="form-group">
        <label>Text Color</label>
        <div class="color-picker">
          <div 
            v-for="color in textColors" 
            :key="color" 
            class="color-swatch" 
            :style="{ backgroundColor: color }"
            :class="{ active: textColor === color }"
            @click="textColor = color"
          ></div>
        </div>
      </div>
      <button class="add-text-button" @click="addCustomText">
        <i class="fas fa-plus"></i> Add Text
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCanvasStore } from '../../../stores/canvas-konva';
import { createEditableText, addTextEditingControls } from '../../../composables/useKonvaText';

const canvasStore = useCanvasStore();

// Text presets
const textPresets = [
  { id: 1, name: 'Heading', sample: 'Heading', fontSize: 72, fontFamily: 'Arial', fontStyle: 'bold', color: '#1e293b' },
  { id: 2, name: 'Subheading', sample: 'Subheading', fontSize: 48, fontFamily: 'Arial', fontStyle: 'normal', color: '#4b5563' },
  { id: 3, name: 'Body', sample: 'Body Text', fontSize: 24, fontFamily: 'Arial', fontStyle: 'normal', color: '#6b7280' },
  { id: 4, name: 'Accent', sample: 'Accent', fontSize: 36, fontFamily: 'Arial', fontStyle: 'italic', color: '#4f46e5' },
  { id: 5, name: 'Quote', sample: 'Quote', fontSize: 30, fontFamily: 'Georgia', fontStyle: 'italic', color: '#9333ea' },
  { id: 6, name: 'Button', sample: 'BUTTON', fontSize: 20, fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff', background: '#4f46e5' }
];

// Font options
const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana', 'Impact'];
const textColors = ['#000000', '#ffffff', '#1e293b', '#4b5563', '#6b7280', '#4f46e5', '#9333ea', '#e11d48', '#16a34a', '#eab308'];

// Custom text state
const customText = ref('Your text here');
const fontSize = ref(48);
const fontFamily = ref('Arial');
const fontStyle = ref('normal');
const textAlign = ref('center');
const textColor = ref('#1e293b');

// Computed style for preset preview
const getPresetStyle = (preset) => {
  return {
    fontFamily: preset.fontFamily || 'Arial',
    fontSize: `${Math.min(preset.fontSize / 2, 24)}px`,
    fontWeight: preset.fontStyle?.includes('bold') ? 'bold' : 'normal',
    fontStyle: preset.fontStyle?.includes('italic') ? 'italic' : 'normal',
    color: preset.color || '#000000',
    backgroundColor: preset.background || 'transparent'
  };
};

// Toggle bold in font style
const toggleBold = () => {
  if (fontStyle.value.includes('bold')) {
    fontStyle.value = fontStyle.value.replace('bold', '').trim() || 'normal';
  } else {
    fontStyle.value = fontStyle.value === 'normal' ? 'bold' : `bold ${fontStyle.value}`;
  }
};

// Toggle italic in font style
const toggleItalic = () => {
  if (fontStyle.value.includes('italic')) {
    fontStyle.value = fontStyle.value.replace('italic', '').trim() || 'normal';
  } else {
    fontStyle.value = fontStyle.value === 'normal' ? 'italic' : `italic ${fontStyle.value}`;
  }
};

// Add text based on preset
const addText = (preset) => {
  if (!canvasStore.stageInstance || !canvasStore.layerInstance) return;
  
  const textNode = createEditableText(canvasStore.stageInstance, canvasStore.layerInstance, {
    text: preset.sample,
    fontSize: preset.fontSize,
    fontFamily: preset.fontFamily,
    fontStyle: preset.fontStyle,
    fill: preset.color,
    align: 'center',
    draggable: true,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowBlur: 10,
    shadowOffset: { x: 5, y: 5 },
    shadowOpacity: 0.5
  });
  
  // Add editing controls
  addTextEditingControls(textNode, canvasStore.stageInstance, canvasStore.layerInstance);
  
  // Select the new text
  canvasStore.setActiveObject(textNode);
  
  // Save state
  canvasStore.saveState();
};

// Add custom text
const addCustomText = () => {
  if (!canvasStore.stageInstance || !canvasStore.layerInstance) return;
  
  const textNode = createEditableText(canvasStore.stageInstance, canvasStore.layerInstance, {
    text: customText.value,
    fontSize: fontSize.value,
    fontFamily: fontFamily.value,
    fontStyle: fontStyle.value,
    fill: textColor.value,
    align: textAlign.value,
    draggable: true,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowBlur: 10,
    shadowOffset: { x: 5, y: 5 },
    shadowOpacity: 0.5
  });
  
  // Add editing controls
  addTextEditingControls(textNode, canvasStore.stageInstance, canvasStore.layerInstance);
  
  // Select the new text
  canvasStore.setActiveObject(textNode);
  
  // Save state
  canvasStore.saveState();
};
</script>

<style scoped>
.text-tool-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1e293b;
}

.text-presets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.text-preset {
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s;
}

.text-preset:hover {
  border-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.preset-preview {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: #f9fafb;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preset-name {
  padding: 8px;
  font-size: 12px;
  text-align: center;
  font-weight: 500;
  color: #4b5563;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #4b5563;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #6b7280;
}

.text-input, .select-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
}

.range-input {
  width: 80%;
  vertical-align: middle;
}

.range-value {
  font-size: 12px;
  color: #6b7280;
  margin-left: 8px;
}

.button-group {
  display: flex;
  gap: 4px;
}

.style-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
}

.style-button:hover {
  background-color: #f3f4f6;
}

.style-button.active {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.active {
  box-shadow: 0 0 0 2px #4f46e5;
}

.add-text-button {
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.add-text-button:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.add-text-button i {
  font-size: 12px;
}
</style>
