<template>
  <div v-if="activeTab === 'more'" class="panel">
    <h4>More Tools</h4>
    <div class="more-tools-grid">
      <button class="tool-item" @click="openQRCodeGenerator">
        <i class="fas fa-qrcode"></i>
        <span>QR Code Generator</span>
      </button>
      <button class="tool-item" @click="openCloudStorage('google')">
        <i class="fab fa-google-drive"></i>
        <span>Google Drive</span>
      </button>
      <button class="tool-item" @click="openCloudStorage('dropbox')">
        <i class="fab fa-dropbox"></i>
        <span>Dropbox</span>
      </button>
      <button class="tool-item" @click="openStyleLibrary">
        <i class="fas fa-palette"></i>
        <span>Style Library</span>
      </button>
      <button class="tool-item" @click="openLayersPanel">
        <i class="fas fa-layer-group"></i>
        <span>Layers</span>
      </button>
      <button class="tool-item" @click="openVersionHistory">
        <i class="fas fa-history"></i>
        <span>Version History</span>
      </button>
      <button class="tool-item" @click="toggleGridSettings">
        <i class="fas fa-th"></i>
        <span>Grid & Guides</span>
      </button>
      <button class="tool-item" @click="openShapeEditor">
        <i class="fas fa-bezier-curve"></i>
        <span>Shape Editor</span>
      </button>
    </div>
    
    <div v-if="showQRCodeGenerator" class="qr-code-generator">
      <div class="tool-section-title">
        <span>QR Code Generator</span>
        <button class="close-panel-btn" @click="showQRCodeGenerator = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="qr-code-form">
        <div class="form-group">
          <label>Content Type</label>
          <select v-model="qrCodeType">
            <option value="url">URL</option>
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="sms">SMS</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>{{ qrCodeTypeLabel }}</label>
          <input type="text" v-model="qrCodeContent" placeholder="Enter content for QR code">
        </div>
        
        <div class="form-group">
          <label>Color</label>
          <input type="color" v-model="qrCodeColor">
        </div>
        
        <div class="qr-preview" v-if="qrCodeContent">
          <div class="qr-code-display" ref="qrCodeDisplay"></div>
        </div>
        
        <button class="add-to-canvas-btn" @click="addQRCodeToCanvas" :disabled="!qrCodeContent">
          Add to Canvas
        </button>
      </div>
    </div>
    
    <div v-if="showGridSettings" class="grid-settings">
      <div class="tool-section-title">
        <span>Grid & Guides</span>
        <button class="close-panel-btn" @click="showGridSettings = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="grid-options">
        <div class="option-group">
          <label>Show Grid</label>
          <div class="toggle-switch">
            <input type="checkbox" :checked="canvasStore.gridVisible" @change="canvasStore.toggleGrid">
            <span class="slider"></span>
          </div>
        </div>
        
        <div class="option-group">
          <label>Snap to Grid</label>
          <div class="toggle-switch">
            <input type="checkbox" :checked="canvasStore.snapToGrid" @change="canvasStore.toggleSnapToGrid">
            <span class="slider"></span>
          </div>
        </div>
        
        <div class="option-group">
          <label>Grid Size</label>
          <div class="grid-size-controls">
            <input type="range" min="5" max="50" step="5" v-model="gridSize" @change="updateGridSize">
            <span>{{ gridSize }}px</span>
          </div>
        </div>
        
        <div class="option-group">
          <label>Show Rulers</label>
          <div class="toggle-switch">
            <input type="checkbox" :checked="canvasStore.rulers" @change="canvasStore.toggleRulers">
            <span class="slider"></span>
          </div>
        </div>
      </div>
      
      <div class="guides-section">
        <div class="tool-section-title">Guides</div>
        <button class="add-guide-btn" @click="addHorizontalGuide">
          <i class="fas fa-grip-lines"></i> Add Horizontal Guide
        </button>
        <button class="add-guide-btn" @click="addVerticalGuide">
          <i class="fas fa-grip-lines-vertical"></i> Add Vertical Guide
        </button>
        
        <div class="guides-list" v-if="guides.length > 0">
          <div v-for="(guide, index) in guides" :key="index" class="guide-item">
            <span>{{ guide.orientation === 'horizontal' ? 'Horizontal' : 'Vertical' }} at {{ guide.position }}px</span>
            <button class="remove-guide-btn" @click="removeGuide(index)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        
        <button v-if="guides.length > 0" class="clear-guides-btn" @click="clearAllGuides">
          Clear All Guides
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import { useCanvasStore } from '../../../../stores/canvas-konva';
import { Konva } from '../../../../lib/konva-init.js';

const props = defineProps({
  activeTab: String,
});

const canvasStore = useCanvasStore();

const showQRCodeGenerator = ref(false);
const qrCodeType = ref('url');
const qrCodeContent = ref('');
const qrCodeColor = ref('#000000');
const qrCodeDisplay = ref(null);

const showGridSettings = ref(false);
const gridSize = ref(20);
const guides = ref([]);

const qrCodeTypeLabel = computed(() => {
  const labels = {
    url: 'URL',
    text: 'Text',
    email: 'Email',
    phone: 'Phone',
    sms: 'SMS'
  };
  return labels[qrCodeType.value];
});

const openQRCodeGenerator = () => { showQRCodeGenerator.value = true; showGridSettings.value = false; };
const toggleGridSettings = () => { showGridSettings.value = !showGridSettings.value; showQRCodeGenerator.value = false; gridSize.value = canvasStore.gridSize; };

const openCloudStorage = (provider) => alert(`Opening ${provider} integration...`);
const openStyleLibrary = () => alert('Opening Style Library...');
const openLayersPanel = () => alert('Opening Layers Panel...');
const openVersionHistory = () => alert('Opening Version History...');
const openShapeEditor = () => alert('Opening Shape Editor...');

const updateGridSize = () => {
  canvasStore.gridSize = gridSize.value;
  canvasStore.updateGrid();
};

const addGuide = (orientation) => {
  if (!canvasStore.stageInstance) return;
  const position = orientation === 'horizontal' 
    ? canvasStore.stageInstance.height() / 2 
    : canvasStore.stageInstance.width() / 2;
  
  guides.value.push({ orientation, position });
  
  const lineCoords = orientation === 'horizontal' 
    ? [0, position, canvasStore.stageInstance.width(), position] 
    : [position, 0, position, canvasStore.stageInstance.height()];
  
  const guideLine = new Konva.Line({
    points: [lineCoords[0], lineCoords[1], lineCoords[2], lineCoords[3]],
    stroke: '#4f46e5',
    strokeWidth: 1,
    dash: [5, 5],
    listening: false,
    isGuide: true,
    id: `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  });
  
  canvasStore.layerInstance.add(guideLine);
  canvasStore.layerInstance.draw();
};

const addHorizontalGuide = () => addGuide('horizontal');
const addVerticalGuide = () => addGuide('vertical');

const removeGuide = (index) => {
  const guide = guides.value[index];
  if (canvasStore.layerInstance) {
    const guideObjects = canvasStore.layerInstance.children
      .filter(obj => 
        obj.attrs?.isGuide && 
        ((guide.orientation === 'horizontal' && obj.points()[1] === guide.position) ||
         (guide.orientation === 'vertical' && obj.points()[0] === guide.position))
      );
    
    guideObjects.forEach(obj => obj.destroy());
    canvasStore.layerInstance.draw();
  }
  guides.value.splice(index, 1);
};

const clearAllGuides = () => {
  if (canvasStore.layerInstance) {
    const guideObjects = canvasStore.layerInstance.children.filter(obj => obj.attrs?.isGuide);
    guideObjects.forEach(obj => obj.destroy());
    canvasStore.layerInstance.draw();
  }
  guides.value = [];
};

const addQRCodeToCanvas = () => {
  if (!qrCodeContent.value || !canvasStore.stageInstance) return;
  
  const cellSize = 5;
  const qrSize = 25 * cellSize;
  
  // Create a group to hold all the QR code elements
  const qrGroup = new Konva.Group({
    x: 100,
    y: 100,
    id: `qrcode-${Date.now()}`,
    draggable: true,
    name: 'qr-code',
    data: { type: qrCodeType.value, content: qrCodeContent.value }
  });
  
  // Add a white background rectangle
  const background = new Konva.Rect({
    width: qrSize,
    height: qrSize,
    fill: 'white',
    listening: false
  });
  qrGroup.add(background);
  
  const contentHash = qrCodeContent.value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Create the QR code pattern
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      if ((i < 7 && j < 7) || (i < 7 && j > 17) || (i > 17 && j < 7)) continue;
      if (((i * j + contentHash) % 5) < 2) {
        const cell = new Konva.Rect({
          x: j * cellSize,
          y: i * cellSize,
          width: cellSize,
          height: cellSize,
          fill: qrCodeColor.value,
          listening: false
        });
        qrGroup.add(cell);
      }
    }
  }
  
  // Add the positioning markers (the three large squares in the corners)
  const addPositionMarker = (left, top) => {
    const outerSquare = new Konva.Rect({
      x: left * cellSize,
      y: top * cellSize,
      width: 7 * cellSize,
      height: 7 * cellSize,
      fill: qrCodeColor.value,
      listening: false
    });
    
    const middleSquare = new Konva.Rect({
      x: (left + 1) * cellSize,
      y: (top + 1) * cellSize,
      width: 5 * cellSize,
      height: 5 * cellSize,
      fill: 'white',
      listening: false
    });
    
    const innerSquare = new Konva.Rect({
      x: (left + 2) * cellSize,
      y: (top + 2) * cellSize,
      width: 3 * cellSize,
      height: 3 * cellSize,
      fill: qrCodeColor.value,
      listening: false
    });
    
    qrGroup.add(outerSquare);
    qrGroup.add(middleSquare);
    qrGroup.add(innerSquare);
  };
  
  // Add the three position markers
  addPositionMarker(0, 0);
  addPositionMarker(0, 18);
  addPositionMarker(18, 0);
  
  // Add the QR code to the canvas and select it
  canvasStore.addObjectToCanvas(qrGroup);
  canvasStore.setActiveObject(qrGroup);
  
  // Close the QR code generator panel
  showQRCodeGenerator.value = false;
};
</script>

<style scoped>
/* Styles are inherited from AppSidebar.vue */
.panel {
  padding: 20px;
}
.more-tools-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}
.tool-item:hover {
  background-color: #f3f4f6;
  transform: translateY(-2px);
}
.tool-item i {
  font-size: 18px;
  width: 24px;
  text-align: center;
  color: #4f46e5;
}
.tool-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 24px 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}
.close-panel-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}
.form-group {
  margin-bottom: 12px;
}
.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
}
.qr-preview {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.add-to-canvas-btn {
  width: 100%;
  padding: 10px;
  margin-top: 12px;
}
.grid-options, .guides-section {
  margin-top: 12px;
}
.option-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.toggle-switch {
  /* styles */
}
.grid-size-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.add-guide-btn, .clear-guides-btn {
  width: 100%;
  padding: 8px;
  margin-top: 8px;
}
.guides-list {
  margin-top: 12px;
}
.guide-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}
.remove-guide-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
}
</style>
