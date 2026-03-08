<template>
  <div class="color-panel">
    <div class="panel-header">
      <h3>Colors</h3>
      <button @click="showColorPicker = !showColorPicker" class="btn-primary">
        <i class="fas fa-palette"></i>
        Custom
      </button>
    </div>
    
    <!-- Color Picker -->
    <div v-if="showColorPicker" class="color-picker-section">
      <div class="color-picker-canvas" ref="colorCanvas" @click="pickColor"></div>
      <div class="color-controls">
        <div class="hue-slider">
          <input 
            type="range" 
            min="0" 
            max="360" 
            v-model="hue"
            @input="updateColor"
            class="slider hue"
          />
        </div>
        <div class="color-inputs">
          <div class="input-group">
            <label>HEX</label>
            <input type="text" v-model="hexColor" @input="updateFromHex" class="hex-input" />
          </div>
          <div class="rgba-inputs">
            <div class="input-group">
              <label>R</label>
              <input type="number" min="0" max="255" v-model="rgba.r" @input="updateFromRGBA" />
            </div>
            <div class="input-group">
              <label>G</label>
              <input type="number" min="0" max="255" v-model="rgba.g" @input="updateFromRGBA" />
            </div>
            <div class="input-group">
              <label>B</label>
              <input type="number" min="0" max="255" v-model="rgba.b" @input="updateFromRGBA" />
            </div>
            <div class="input-group">
              <label>A</label>
              <input type="number" min="0" max="1" step="0.1" v-model="rgba.a" @input="updateFromRGBA" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Color Palettes -->
    <div class="color-palettes">
      <div class="palette-section">
        <h4>Recent Colors</h4>
        <div class="color-grid">
          <div 
            v-for="color in recentColors" 
            :key="color"
            class="color-swatch"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
            :title="color"
          ></div>
        </div>
      </div>
      
      <div class="palette-section">
        <h4>Brand Colors</h4>
        <div class="color-grid">
          <div 
            v-for="color in brandColors" 
            :key="color.id"
            class="color-swatch"
            :style="{ backgroundColor: color.value }"
            @click="selectColor(color.value)"
            :title="color.name"
          ></div>
          <button class="add-brand-color" @click="addToBrandColors">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
      
      <div class="palette-section">
        <h4>Material Design</h4>
        <div class="color-grid">
          <div 
            v-for="color in materialColors" 
            :key="color"
            class="color-swatch"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
            :title="color"
          ></div>
        </div>
      </div>
      
      <div class="palette-section">
        <h4>Gradients</h4>
        <div class="gradient-grid">
          <div 
            v-for="gradient in predefinedGradients" 
            :key="gradient.id"
            class="gradient-swatch"
            :style="{ background: gradient.css }"
            @click="selectGradient(gradient)"
            :title="gradient.name"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Gradient Editor -->
    <div v-if="showGradientEditor" class="gradient-editor">
      <div class="gradient-preview" :style="{ background: currentGradient.css }"></div>
      <div class="gradient-controls">
        <div class="gradient-stops">
          <div 
            v-for="(stop, index) in currentGradient.stops" 
            :key="index"
            class="gradient-stop"
            :style="{ left: `${stop.position * 100}%`, backgroundColor: stop.color }"
            @click="selectGradientStop(index)"
            :class="{ active: selectedStopIndex === index }"
          ></div>
        </div>
        <div class="gradient-options">
          <label>Type:</label>
          <select v-model="currentGradient.type" @change="updateGradient">
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
          <label>Angle:</label>
          <input 
            type="range" 
            min="0" 
            max="360" 
            v-model="currentGradient.angle"
            @input="updateGradient"
            v-if="currentGradient.type === 'linear'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useCanvasStore } from '../../../stores/canvas-konva';

const canvasStore = useCanvasStore();

// Color picker state
const showColorPicker = ref(false);
const showGradientEditor = ref(false);
const colorCanvas = ref(null);
const hue = ref(0);
const saturation = ref(100);
const lightness = ref(50);
const alpha = ref(1);

// Color values
const rgba = ref({ r: 255, g: 0, b: 0, a: 1 });
const hexColor = ref('#ff0000');

// Color palettes
const recentColors = ref([
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#808080', '#800000'
]);

const brandColors = ref([
  { id: 1, name: 'Primary', value: '#4f46e5' },
  { id: 2, name: 'Secondary', value: '#06b6d4' },
  { id: 3, name: 'Accent', value: '#f59e0b' },
  { id: 4, name: 'Success', value: '#10b981' },
  { id: 5, name: 'Warning', value: '#f59e0b' },
  { id: 6, name: 'Error', value: '#ef4444' }
]);

const materialColors = ref([
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548', '#9e9e9e', '#607d8b'
]);

// Gradients
const predefinedGradients = ref([
  {
    id: 1,
    name: 'Sunset',
    type: 'linear',
    angle: 45,
    stops: [
      { color: '#ff7e5f', position: 0 },
      { color: '#feb47b', position: 1 }
    ],
    css: 'linear-gradient(45deg, #ff7e5f 0%, #feb47b 100%)'
  },
  {
    id: 2,
    name: 'Ocean',
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 1 }
    ],
    css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 3,
    name: 'Forest',
    type: 'linear',
    angle: 90,
    stops: [
      { color: '#56ab2f', position: 0 },
      { color: '#a8e6cf', position: 1 }
    ],
    css: 'linear-gradient(90deg, #56ab2f 0%, #a8e6cf 100%)'
  }
]);

const currentGradient = ref({
  type: 'linear',
  angle: 90,
  stops: [
    { color: '#ff0000', position: 0 },
    { color: '#0000ff', position: 1 }
  ],
  css: 'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)'
});

const selectedStopIndex = ref(0);

onMounted(() => {
  setupColorPicker();
});

function setupColorPicker() {
  if (!colorCanvas.value) return;
  
  const canvas = colorCanvas.value;
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = 200;
  canvas.height = 200;
  
  drawColorPicker(ctx);
}

function drawColorPicker(ctx) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // Create saturation-lightness gradient
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const s = x / width * 100;
      const l = (height - y) / height * 100;
      const rgb = hslToRgb(hue.value, s, l);
      
      const index = (y * width + x) * 4;
      data[index] = rgb.r;
      data[index + 1] = rgb.g;
      data[index + 2] = rgb.b;
      data[index + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function pickColor(event) {
  const rect = colorCanvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const s = (x / rect.width) * 100;
  const l = ((rect.height - y) / rect.height) * 100;
  
  saturation.value = s;
  lightness.value = l;
  
  updateColor();
}

function updateColor() {
  const rgb = hslToRgb(hue.value, saturation.value, lightness.value);
  rgba.value = { ...rgb, a: alpha.value };
  hexColor.value = rgbToHex(rgb.r, rgb.g, rgb.b);
  
  nextTick(() => {
    if (colorCanvas.value) {
      const ctx = colorCanvas.value.getContext('2d');
      drawColorPicker(ctx);
    }
  });
}

function updateFromHex() {
  const rgb = hexToRgb(hexColor.value);
  if (rgb) {
    rgba.value = { ...rgb, a: alpha.value };
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hue.value = hsl.h;
    saturation.value = hsl.s;
    lightness.value = hsl.l;
    updateColor();
  }
}

function updateFromRGBA() {
  hexColor.value = rgbToHex(rgba.value.r, rgba.value.g, rgba.value.b);
  const hsl = rgbToHsl(rgba.value.r, rgba.value.g, rgba.value.b);
  hue.value = hsl.h;
  saturation.value = hsl.s;
  lightness.value = hsl.l;
  updateColor();
}

function selectColor(color) {
  addToRecentColors(color);
  applyColorToSelection(color);
}

function selectGradient(gradient) {
  currentGradient.value = { ...gradient };
  showGradientEditor.value = true;
  applyGradientToSelection(gradient);
}

function addToRecentColors(color) {
  // Remove if already exists
  const index = recentColors.value.indexOf(color);
  if (index > -1) {
    recentColors.value.splice(index, 1);
  }
  
  // Add to beginning
  recentColors.value.unshift(color);
  
  // Keep only last 20 colors
  if (recentColors.value.length > 20) {
    recentColors.value = recentColors.value.slice(0, 20);
  }
}

function addToBrandColors() {
  const color = hexColor.value;
  const name = prompt('Enter color name:');
  
  if (name) {
    brandColors.value.push({
      id: Date.now(),
      name: name,
      value: color
    });
  }
}

function applyColorToSelection(color) {
  const selectedObjects = canvasStore.selectedObjects;
  
  selectedObjects.forEach(obj => {
    if (obj.fill) {
      obj.fill(color);
    } else if (obj.stroke) {
      obj.stroke(color);
    }
  });
  
  canvasStore.layerInstance?.batchDraw();
  canvasStore.saveState();
}

function applyGradientToSelection(gradient) {
  // This would require more complex implementation
  // For now, we'll apply the first color of the gradient
  const firstColor = gradient.stops[0].color;
  applyColorToSelection(firstColor);
}

// Color conversion utilities
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;
  
  let r, g, b;
  
  if (h >= 0 && h < 1/6) {
    r = c; g = x; b = 0;
  } else if (h >= 1/6 && h < 2/6) {
    r = x; g = c; b = 0;
  } else if (h >= 2/6 && h < 3/6) {
    r = 0; g = c; b = x;
  } else if (h >= 3/6 && h < 4/6) {
    r = 0; g = x; b = c;
  } else if (h >= 4/6 && h < 5/6) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;
  
  const l = sum / 2;
  
  if (diff === 0) {
    return { h: 0, s: 0, l: l * 100 };
  }
  
  const s = l > 0.5 ? diff / (2 - sum) : diff / sum;
  
  let h;
  switch (max) {
    case r:
      h = (g - b) / diff + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / diff + 2;
      break;
    case b:
      h = (r - g) / diff + 4;
      break;
  }
  h /= 6;
  
  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
</script>

<style scoped>
.color-panel {
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #4338ca;
}

.color-picker-section {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.color-picker-canvas {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  cursor: crosshair;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
}

.color-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hue-slider input {
  width: 100%;
  height: 20px;
  border-radius: 10px;
  background: linear-gradient(to right, 
    #ff0000 0%, #ffff00 16.66%, #00ff00 33.33%, 
    #00ffff 50%, #0000ff 66.66%, #ff00ff 83.33%, #ff0000 100%);
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

.color-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 8px;
}

.rgba-inputs {
  display: contents;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-group label {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
}

.input-group input {
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
}

.hex-input {
  font-family: monospace;
}

.color-palettes {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.palette-section {
  margin-bottom: 24px;
}

.palette-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.add-brand-color {
  width: 24px;
  height: 24px;
  border: 2px dashed #d1d5db;
  border-radius: 4px;
  background: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.2s;
}

.add-brand-color:hover {
  border-color: #4f46e5;
  color: #4f46e5;
}

.gradient-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.gradient-swatch {
  width: 100%;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.gradient-swatch:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gradient-editor {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.gradient-preview {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
}

.gradient-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gradient-stops {
  position: relative;
  height: 20px;
  background: #e5e7eb;
  border-radius: 10px;
}

.gradient-stop {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  cursor: pointer;
  top: 2px;
  transform: translateX(-50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.gradient-stop.active {
  border-color: #4f46e5;
}

.gradient-options {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.gradient-options select,
.gradient-options input {
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
}
</style>
