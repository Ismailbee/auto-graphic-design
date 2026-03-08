<template>
  <div class="text-panel">
    <div class="quick-add">
      <button class="quick-add-button" @click="quickAddText">
        <i class="fas fa-plus"></i> Add Text
      </button>
    </div>
    
    <div class="text-presets">
      <h3 class="section-title">Text Styles</h3>
      <div class="preset-grid">
        <div v-for="preset in textPresets" :key="preset.id" class="text-preset" @click="addText(preset)">
          <div class="preset-preview" :style="getPresetStyle(preset)">{{ preset.sample }}</div>
          <div class="preset-name">{{ preset.name }}</div>
        </div>
      </div>
    </div>
    
    <div class="text-custom">
      <h3 class="section-title">Custom Text</h3>
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
        <div class="size-control">
          <input type="range" v-model="fontSize" min="12" max="120" class="range-input" />
          <span class="range-value">{{ fontSize }}px</span>
        </div>
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
      <div class="actions">
        <button class="add-text-button" @click="addCustomText">
          <i class="fas fa-plus"></i> Add Text
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCanvasStore } from '../../../../stores/canvas-fabric';
import { useFabricCanvas } from '../../../../composables/useFabricCanvas';
import { useNotification } from '../../../../composables/useNotification';
import { fabric } from 'fabric';

const canvasStore = useCanvasStore();
const { showSuccess } = useNotification();

// Quick add text function
const quickAddText = () => {
  if (!canvasStore.fabricCanvas) {
    console.error('Canvas not initialized');
    return;
  }
  
  // Get center position of canvas
  const center = canvasStore.fabricCanvas.getCenter();
  
  const textObj = new fabric.IText('Type here...', {
    left: center.left,
    top: center.top,
    fontFamily: 'Arial',
    fontSize: 48,
    fill: '#1e293b',
    textAlign: 'center',
    editable: true,
    selectable: true,
    evented: true
  });
  
  canvasStore.fabricCanvas.add(textObj);
  canvasStore.fabricCanvas.setActiveObject(textObj);
  canvasStore.fabricCanvas.renderAll();
  
  // Save state
  canvasStore.saveState();
  
  // Enter edit mode with proper timing
  setTimeout(() => {
    textObj.enterEditing();
    textObj.selectAll();
  }, 100);
  
  showSuccess('Text added! Click to start typing');
};

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
    backgroundColor: preset.background || 'transparent',
    padding: preset.background ? '4px 8px' : '0',
    borderRadius: preset.background ? '4px' : '0'
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
  if (!canvasStore.fabricCanvas) {
    console.error('Canvas not initialized');
    return;
  }
  
  // Get center position of canvas
  const center = canvasStore.fabricCanvas.getCenter();
  
  const textObj = new fabric.IText(preset.sample, {
    left: center.left,
    top: center.top,
    fontFamily: preset.fontFamily || 'Arial',
    fontSize: preset.fontSize || 48,
    fontWeight: preset.fontStyle?.includes('bold') ? 'bold' : 'normal',
    fontStyle: preset.fontStyle?.includes('italic') ? 'italic' : 'normal',
    fill: preset.color || '#1e293b',
    textAlign: 'center',
    editable: true,
    shadow: preset.background ? null : {
      color: 'rgba(0,0,0,0.2)',
      blur: 10,
      offsetX: 3,
      offsetY: 3
    }
  });
  
  // Add background if specified
  if (preset.background) {
    textObj.set('backgroundColor', preset.background);
  }
  
  canvasStore.fabricCanvas.add(textObj);
  canvasStore.fabricCanvas.setActiveObject(textObj);
  canvasStore.fabricCanvas.renderAll();
  
  // Save state
  canvasStore.saveState();
  
  // Enter edit mode immediately
  textObj.enterEditing();
  textObj.selectAll();
  
  showSuccess(`${preset.name} text added! Start typing now`);
};

// Add custom text
const addCustomText = () => {
  if (!canvasStore.fabricCanvas) {
    console.error('Canvas not initialized');
    return;
  }
  
  // Get center position of canvas
  const center = canvasStore.fabricCanvas.getCenter();
  
  const textObj = new fabric.IText(customText.value, {
    left: center.left,
    top: center.top,
    fontFamily: fontFamily.value,
    fontSize: fontSize.value,
    fontWeight: fontStyle.value.includes('bold') ? 'bold' : 'normal',
    fontStyle: fontStyle.value.includes('italic') ? 'italic' : 'normal',
    fill: textColor.value,
    textAlign: textAlign.value,
    editable: true,
    shadow: {
      color: 'rgba(0,0,0,0.2)',
      blur: 10,
      offsetX: 3,
      offsetY: 3
    }
  });
  
  canvasStore.fabricCanvas.add(textObj);
  canvasStore.fabricCanvas.setActiveObject(textObj);
  canvasStore.fabricCanvas.renderAll();
  
  // Save state
  canvasStore.saveState();
  
  // Enter edit mode immediately
  textObj.enterEditing();
  textObj.selectAll();
  
  showSuccess('Custom text added! Start typing now');
};
</script>

<style scoped>
.text-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.quick-add {
  margin-bottom: 4px;
}

.quick-add-button {
  width: 100%;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.dark-theme .quick-add-button {
  background-color: #4338ca;
}

.quick-add-button:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
}

.dark-theme .quick-add-button:hover {
  background-color: #3730a3;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.4);
}

.quick-add-button:active {
  transform: translateY(0);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1e293b;
}

.dark-theme .section-title {
  color: #e5e7eb;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.text-preset {
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s;
  background-color: white;
}

.dark-theme .text-preset {
  border-color: #374151;
  background-color: #1f2937;
}

.text-preset:hover {
  border-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.dark-theme .text-preset:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
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

.dark-theme .preset-preview {
  background-color: #111827;
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

.dark-theme .preset-name {
  color: #9ca3af;
  background-color: #1f2937;
  border-color: #374151;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #4b5563;
}

.dark-theme .form-group label {
  color: #9ca3af;
}

.text-input, .select-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  background-color: white;
  color: #1e293b;
}

.dark-theme .text-input, .dark-theme .select-input {
  background-color: #111827;
  border-color: #374151;
  color: #e5e7eb;
}

.size-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-input {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  outline: none;
  border-radius: 3px;
}

.dark-theme .range-input {
  background: #374151;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
}

.range-value {
  min-width: 40px;
  font-size: 14px;
  color: #4b5563;
}

.dark-theme .range-value {
  color: #9ca3af;
}

.button-group {
  display: flex;
  gap: 6px;
}

.style-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background-color: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-theme .style-button {
  background-color: #111827;
  border-color: #374151;
  color: #9ca3af;
}

.style-button:hover {
  background-color: #f3f4f6;
  color: #1e293b;
}

.dark-theme .style-button:hover {
  background-color: #1f2937;
  color: #e5e7eb;
}

.style-button.active {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.dark-theme .style-button.active {
  background-color: #4338ca;
  border-color: #4338ca;
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

.dark-theme .color-swatch {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.active {
  box-shadow: 0 0 0 2px #4f46e5;
}

.dark-theme .color-swatch.active {
  box-shadow: 0 0 0 2px #6366f1;
}

.actions {
  margin-top: 20px;
}

.add-text-button {
  width: 100%;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.dark-theme .add-text-button {
  background-color: #4338ca;
}

.add-text-button:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
}

.dark-theme .add-text-button:hover {
  background-color: #3730a3;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.4);
}

.add-text-button:active {
  transform: translateY(0);
}
</style>