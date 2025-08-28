<template>
  <div v-if="activeTab === 'pageSetup'" class="panel">
    <h3>Page Setup</h3>
    
    <div class="size-presets">
      <div class="tool-section-title">Size Presets</div>
      <div class="preset-categories">
        <button
          v-for="category in ['social', 'print', 'presentation', 'custom']"
          :key="category"
          @click="activePresetCategory = category"
          :class="{ active: activePresetCategory === category }"
          class="category-button"
        >
          {{ getCategoryName(category) }}
        </button>
      </div>
      
      <div class="preset-grid">
        <div
          v-for="preset in filteredPresets"
          :key="preset.name"
          class="preset-item"
          @click="selectCanvasSize(preset)"
        >
          <div class="preset-preview" :style="getPresetStyle(preset)">
            <i :class="preset.icon || 'fas fa-file'"></i>
          </div>
          <div class="preset-info">
            <div class="preset-name">{{ preset.name }}</div>
            <div class="preset-dimensions">{{ preset.width }} × {{ preset.height }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="custom-size">
      <div class="tool-section-title">Custom Size</div>
      <div class="size-inputs">
        <div class="size-input-group">
          <label>Width</label>
          <div class="input-with-unit">
            <input type="number" v-model="customWidth" min="1" @change="updateCustomSize">
            <select v-model="sizeUnit" @change="updateUnitSize">
              <option value="px">px</option>
              <option value="in">in</option>
              <option value="cm">cm</option>
              <option value="mm">mm</option>
              <option value="ft">ft</option>
            </select>
          </div>
        </div>
        
        <div class="size-input-group">
          <label>Height</label>
          <div class="input-with-unit">
            <input type="number" v-model="customHeight" min="1" @change="updateCustomSize">
            <select v-model="sizeUnit" @change="updateUnitSize">
              <option value="px">px</option>
              <option value="in">in</option>
              <option value="cm">cm</option>
              <option value="mm">mm</option>
              <option value="ft">ft</option>
            </select>
          </div>
        </div>
      </div>
      
      <button class="apply-size-btn" @click="applyCustomSize">
        Apply Custom Size
      </button>
    </div>
    
    <div class="background-settings">
      <div class="tool-section-title">Background</div>
      <div class="color-picker">
        <label>Background Color</label>
        <input type="color" v-model="backgroundColor" @change="updateBackgroundColor">
      </div>
      
      <button class="bg-transparent-btn" @click="setTransparentBackground">
        <i class="fas fa-chess-board"></i> Make Transparent
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineProps } from 'vue';
import { useCanvasStore } from '../../../../stores/canvas-konva';

const props = defineProps({
  activeTab: String,
});

const canvasStore = useCanvasStore();

const activePresetCategory = ref('social');
const customWidth = ref(1200);
const customHeight = ref(800);
const sizeUnit = ref('px');
const backgroundColor = ref('#ffffff');

const getCategoryName = (category) => {
  const names = {
    'social': 'Social Media',
    'print': 'Print',
    'presentation': 'Presentations',
    'custom': 'Custom'
  };
  return names[category] || category;
};

const filteredPresets = computed(() => {
  return canvasStore.canvasSizePresets.filter(preset => preset.category === activePresetCategory.value);
});

const getPresetStyle = (preset) => {
  const ratio = preset.width / preset.height;
  const height = 80;
  let width = ratio * height;
  let maxWidth = 120;
  
  if (width > maxWidth) {
    const scale = maxWidth / width;
    return {
      width: maxWidth + 'px',
      height: (height * scale) + 'px',
      border: '1px solid #e5e7eb'
    };
  }
  
  return {
    width: width + 'px',
    height: height + 'px',
    border: '1px solid #e5e7eb'
  };
};

const selectCanvasSize = (preset) => {
  canvasStore.setCanvasSize(preset.width, preset.height);
};

const getUnitMultiplier = (unit) => {
  switch(unit) {
    case 'in': return 96;
    case 'cm': return 37.8;
    case 'mm': return 3.78;
    case 'ft': return 1152;
    default: return 1;
  }
};

const convertToPx = (value, unit) => value * getUnitMultiplier(unit);

const updateUnitSize = () => {
  const pxWidth = convertToPx(customWidth.value, sizeUnit.value);
  const pxHeight = convertToPx(customHeight.value, sizeUnit.value);
  
  customWidth.value = Math.round(pxWidth / getUnitMultiplier(sizeUnit.value));
  customHeight.value = Math.round(pxHeight / getUnitMultiplier(sizeUnit.value));
};

const updateCustomSize = () => {
  if (isNaN(customWidth.value) || customWidth.value <= 0) customWidth.value = 1;
  if (isNaN(customHeight.value) || customHeight.value <= 0) customHeight.value = 1;
};

const applyCustomSize = () => {
  const pxWidth = convertToPx(customWidth.value, sizeUnit.value);
  const pxHeight = convertToPx(customHeight.value, sizeUnit.value);
  const maxDimension = 8000;
  
  canvasStore.setCanvasSize(Math.min(pxWidth, maxDimension), Math.min(pxHeight, maxDimension));
};

const updateBackgroundColor = () => {
  canvasStore.setBackgroundColor(backgroundColor.value);
};

const setTransparentBackground = () => {
  backgroundColor.value = 'transparent';
  canvasStore.setBackgroundColor('transparent');
};

watch(() => canvasStore.backgroundColor, (newColor) => {
  backgroundColor.value = newColor;
});

onMounted(() => {
  backgroundColor.value = canvasStore.backgroundColor;
});
</script>

<style scoped>
/* Styles are inherited from AppSidebar.vue */
.panel {
  padding: 20px;
}
.tool-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 24px 0 12px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}
.preset-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.category-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f3f4f6;
  border: 1px solid transparent;
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
}
.category-button.active {
  background-color: #4f46e5;
  color: white;
}
.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.preset-item {
  cursor: pointer;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}
.preset-item:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}
.preset-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.preset-info {
  text-align: center;
}
.preset-name {
  font-weight: 500;
  font-size: 13px;
}
.preset-dimensions {
  font-size: 12px;
  color: #6b7280;
}
.custom-size {
  margin-top: 24px;
}
.size-inputs {
  display: flex;
  gap: 16px;
}
.size-input-group {
  flex: 1;
}
.input-with-unit {
  display: flex;
}
.apply-size-btn {
  width: 100%;
  padding: 10px;
  margin-top: 12px;
}
.background-settings {
  margin-top: 24px;
}
.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bg-transparent-btn {
  width: 100%;
  padding: 10px;
  margin-top: 12px;
}
</style>
