<template>
  <div class="property-section">
    <div class="section-title">Design</div>
    <div class="property-grid">
      <div class="property-row full-width">
        <label>Canvas Size</label>
        <div class="size-inputs">
          <input type="number" v-model.number="canvasSize.width" @change="updateCanvasSize" placeholder="W" />
          <span>x</span>
          <input type="number" v-model.number="canvasSize.height" @change="updateCanvasSize" placeholder="H" />
        </div>
      </div>
      <div class="property-row full-width">
        <label>Presets</label>
        <select v-model="selectedPreset" @change="applyPreset" class="preset-select">
          <option disabled value="">Select a preset</option>
          <optgroup v-for="category in categories" :key="category" :label="category">
            <option v-for="preset in getPresetsByCategory(category)" :key="preset.name" :value="preset">
              {{ preset.name }} ({{ preset.width }}×{{ preset.height }})
            </option>
          </optgroup>
        </select>
      </div>
      <div class="property-row full-width">
        <label>Background Color</label>
        <input type="color" v-model="backgroundColor" @change="updateBackgroundColor" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, computed } from 'vue';

const emit = defineEmits(['update-canvas-size', 'update-background-color']);

const canvasSize = ref({ width: 1080, height: 1080 });
const backgroundColor = ref('#ffffff');
const selectedPreset = ref('');

const presets = ref([
  // Social Media
  { name: 'Instagram Post', width: 1080, height: 1080, category: 'Social Media' },
  { name: 'Instagram Story', width: 1080, height: 1920, category: 'Social Media' },
  { name: 'Instagram Reel', width: 1080, height: 1920, category: 'Social Media' },
  { name: 'Facebook Post', width: 940, height: 788, category: 'Social Media' },
  { name: 'Facebook Cover', width: 1640, height: 924, category: 'Social Media' },
  { name: 'Twitter Post', width: 1024, height: 512, category: 'Social Media' },
  { name: 'Twitter Header', width: 1500, height: 500, category: 'Social Media' },
  { name: 'LinkedIn Post', width: 1200, height: 627, category: 'Social Media' },
  { name: 'LinkedIn Cover', width: 1584, height: 396, category: 'Social Media' },
  { name: 'Pinterest Pin', width: 1000, height: 1500, category: 'Social Media' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'Social Media' },
  { name: 'TikTok Video', width: 1080, height: 1920, category: 'Social Media' },
  
  // Print
  { name: 'A4 Document', width: 2480, height: 3508, category: 'Print' },
  { name: 'A5 Document', width: 1748, height: 2480, category: 'Print' },
  { name: 'US Letter', width: 2550, height: 3300, category: 'Print' },
  { name: 'Business Card', width: 1050, height: 600, category: 'Print' },
  { name: 'Flyer', width: 2550, height: 3300, category: 'Print' },
  { name: 'Postcard', width: 1875, height: 1275, category: 'Print' },
  { name: 'Brochure', width: 2480, height: 3508, category: 'Print' },
  { name: 'Poster', width: 4961, height: 7016, category: 'Print' },
  
  // Presentation
  { name: 'Presentation 16:9', width: 1920, height: 1080, category: 'Presentation' },
  { name: 'Presentation 4:3', width: 1024, height: 768, category: 'Presentation' },
  
  // Video
  { name: 'HD Video', width: 1920, height: 1080, category: 'Video' },
  { name: '4K Video', width: 3840, height: 2160, category: 'Video' },
  { name: 'SD Video', width: 720, height: 480, category: 'Video' },
  { name: 'Square Video', width: 1080, height: 1080, category: 'Video' },
  
  // Custom
  { name: 'Square', width: 1080, height: 1080, category: 'Common' },
  { name: '16:9 Ratio', width: 1920, height: 1080, category: 'Common' },
  { name: '4:3 Ratio', width: 1600, height: 1200, category: 'Common' },
  { name: '3:2 Ratio', width: 1500, height: 1000, category: 'Common' },
  { name: '1:1 Ratio', width: 1000, height: 1000, category: 'Common' },
  
  // Advertising
  { name: 'Facebook Ad', width: 1080, height: 1080, category: 'Advertising' },
  { name: 'Instagram Ad', width: 1080, height: 1080, category: 'Advertising' },
  { name: 'Google Display Ad', width: 300, height: 250, category: 'Advertising' },
  { name: 'Leaderboard Ad', width: 728, height: 90, category: 'Advertising' },
  { name: 'Billboard Ad', width: 970, height: 250, category: 'Advertising' },
]);

function updateCanvasSize() {
  emit('update-canvas-size', { ...canvasSize.value });
}

function applyPreset() {
  if (selectedPreset.value) {
    canvasSize.value.width = selectedPreset.value.width;
    canvasSize.value.height = selectedPreset.value.height;
    updateCanvasSize();
  }
}

function updateBackgroundColor() {
  emit('update-background-color', backgroundColor.value);
}

// Derived computed value for categories
const categories = computed(() => {
  const categorySet = new Set(presets.value.map(preset => preset.category));
  return Array.from(categorySet);
});

// Function to get presets by category
function getPresetsByCategory(category) {
  return presets.value.filter(preset => preset.category === category);
}
</script>

<style scoped>
@import './propertyPanelStyles.css';

.size-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.size-inputs input {
  width: 70px;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}
.size-inputs input:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}
.size-inputs span {
  color: #6b7280;
  font-weight: 600;
}
select.preset-select {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}
select.preset-select:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}
select.preset-select option {
  padding: 8px;
}
select.preset-select optgroup {
  font-weight: 600;
  font-size: 13px;
}

.dark-theme .size-inputs input,
.dark-theme select.preset-select {
  background-color: #3d3d3d;
  border-color: #555;
  color: #e0e0e0;
}

.dark-theme .size-inputs input:focus,
.dark-theme select.preset-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.dark-theme .size-inputs span {
  color: #a0aec0;
}
</style>
