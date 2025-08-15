<template>
  <ion-page>
    <ion-header class="header">
      <ion-toolbar>
        <div class="logo">
          <div class="logo-icon"><font-awesome-icon :icon="faPalette" /></div>
          <ion-title class="logo-text">DesignCraft Pro</ion-title>
        </div>
        <ion-buttons slot="end" class="header-controls">
          <ion-button fill="clear" @click="saveProject"><font-awesome-icon :icon="faSave" /> Save</ion-button>
          <ion-button fill="clear" @click="exportPNG"><font-awesome-icon :icon="faDownload" /> Export</ion-button>
          <ion-button color="primary" @click="shareProject"><font-awesome-icon :icon="faShareAlt" /> Share</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="main-content">
      <div class="layout">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-section">
            <div class="sidebar-title">Design Tools</div>
            <div class="tools-grid">
              <div class="tool-item" :class="{active: activeTool==='select'}" @click="activeTool='select'">
                <font-awesome-icon :icon="faMousePointer" class="tool-icon" />
                <div class="tool-name">Select</div>
              </div>
              <div class="tool-item" :class="{active: activeTool==='text'}" @click="activeTool='text'">
                <font-awesome-icon :icon="faTextHeight" class="tool-icon" />
                <div class="tool-name">Text</div>
              </div>
              <div class="tool-item" :class="{active: activeTool==='image'}" @click="activeTool='image'">
                <font-awesome-icon :icon="faImage" class="tool-icon" />
                <div class="tool-name">Image</div>
              </div>
              <div class="tool-item" :class="{active: activeTool==='shape'}" @click="activeTool='shape'">
                <font-awesome-icon :icon="faShapes" class="tool-icon" />
                <div class="tool-name">Shapes</div>
              </div>
              <div class="tool-item" :class="{active: activeTool==='brush'}" @click="activeTool='brush'">
                <font-awesome-icon :icon="faPaintBrush" class="tool-icon" />
                <div class="tool-name">Brush</div>
              </div>
              <div class="tool-item" :class="{active: activeTool==='icon'}" @click="activeTool='icon'">
                <font-awesome-icon :icon="faIcons" class="tool-icon" />
                <div class="tool-name">Icons</div>
              </div>
            </div>
          </div>

          <div class="size-section">
            <div class="size-title"><font-awesome-icon :icon="faRulerCombined" /> Page Size</div>
            <div class="size-grid">
              <div class="size-item" :class="{active: selectedSize==='a4'}" @click="selectSize('a4')">
                <div class="size-name">A4</div>
                <div class="size-dimensions">210 × 297 mm</div>
              </div>
              <div class="size-item" :class="{active: selectedSize==='a5'}" @click="selectSize('a5')">
                <div class="size-name">A5</div>
                <div class="size-dimensions">148 × 210 mm</div>
              </div>
              <div class="size-item" :class="{active: selectedSize==='a3'}" @click="selectSize('a3')">
                <div class="size-name">A3</div>
                <div class="size-dimensions">297 × 420 mm</div>
              </div>
              <div class="size-item" :class="{active: selectedSize==='a2'}" @click="selectSize('a2')">
                <div class="size-name">A2</div>
                <div class="size-dimensions">420 × 594 mm</div>
              </div>
            </div>

            <div class="input-group">
              <div class="input-label">Custom Size (px)</div>
              <div class="custom-size">
                <ion-input type="number" v-model.number="customWidth" placeholder="Width" class="custom-input"></ion-input>
                <ion-input type="number" v-model.number="customHeight" placeholder="Height" class="custom-input"></ion-input>
              </div>
            </div>
            <ion-button expand="block" @click="applyCustomSize" class="apply-size-btn">
              <font-awesome-icon :icon="faCheck" /> Apply Size
            </ion-button>
          </div>

          <div class="sidebar-section templates">
            <div class="sidebar-title">Templates</div>
            <div class="tools-grid">
              <div class="tool-item" @click="applyTemplate('social')">
                <font-awesome-icon :icon="faBullhorn" class="tool-icon" />
                <div class="tool-name">Social</div>
              </div>
              <div class="tool-item" @click="applyTemplate('docs')">
                <font-awesome-icon :icon="faFileAlt" class="tool-icon" />
                <div class="tool-name">Docs</div>
              </div>
              <div class="tool-item" @click="applyTemplate('business')">
                <font-awesome-icon :icon="faBriefcase" class="tool-icon" />
                <div class="tool-name">Business</div>
              </div>
              <div class="tool-item" @click="applyTemplate('events')">
                <font-awesome-icon :icon="faBirthdayCake" class="tool-icon" />
                <div class="tool-name">Events</div>
              </div>
              <div class="tool-item" @click="applyTemplate('marketing')">
                <font-awesome-icon :icon="faChartLine" class="tool-icon" />
                <div class="tool-name">Marketing</div>
              </div>
              <div class="tool-item" @click="applyTemplate('education')">
                <font-awesome-icon :icon="faGraduationCap" class="tool-icon" />
                <div class="tool-name">Education</div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Editor -->
        <section class="editor-area">
          <div class="toolbar">
            <div class="toolbar-group">
              <ion-button class="toolbar-btn" @click="undo">
                <font-awesome-icon :icon="faUndo" /> Undo
              </ion-button>
              <ion-button class="toolbar-btn" @click="redo">
                <font-awesome-icon :icon="faRedo" /> Redo
              </ion-button>
            </div>
            
            <div class="toolbar-group">
              <ion-button class="toolbar-btn" @click="addPage">
                <font-awesome-icon :icon="faPlus" /> Add Page
              </ion-button>
              <ion-button class="toolbar-btn" color="danger" @click="deleteCurrentPage">
                <font-awesome-icon :icon="faTrashAlt" /> Delete
              </ion-button>
            </div>
            
            <div class="toolbar-group">
              <ion-button class="toolbar-btn" @click="arrangeObjects">
                <font-awesome-icon :icon="faLayerGroup" /> Arrange
              </ion-button>
              <ion-button class="toolbar-btn" @click="duplicateObject">
                <font-awesome-icon :icon="faCopy" /> Duplicate
              </ion-button>
            </div>

            <div class="page-controls">
              <ion-button fill="clear" @click="prevPage" class="page-btn">
                <font-awesome-icon :icon="faChevronLeft" />
              </ion-button>
              <div class="page-indicator">Page {{ currentPage }} of {{ pages.length }}</div>
              <ion-button fill="clear" @click="nextPage" class="page-btn">
                <font-awesome-icon :icon="faChevronRight" />
              </ion-button>
            </div>
          </div>

          <div class="canvas-container">
            <div class="canvas-wrapper" ref="canvasWrapper" :class="{'page-transition': pageTransition}">
              <div class="page-shadow"></div>
              <div ref="canvasContainer" class="canvas-container-inner"></div>
            </div>
          </div>
        </section>

        <!-- AI Panel -->
        <aside class="ai-panel">
          <div class="ai-panel-header">
            <div class="ai-icon"><font-awesome-icon :icon="faRobot" /></div>
            <div class="ai-title">DeepSeek-VL AI</div>
          </div>
          <p class="ai-subtitle">Describe what you want and the AI will create elements for you.</p>
          
          <div class="input-group">
            <div class="input-label">Describe your design:</div>
            <ion-textarea v-model="aiPrompt" placeholder="Example: A modern tech logo with a blue gradient and abstract circuit design..."></ion-textarea>
          </div>
          
          <div class="input-group">
            <div class="input-label">Design type:</div>
            <ion-select v-model="aiType" interface="action-sheet">
              <ion-select-option value="logo">Logo</ion-select-option>
              <ion-select-option value="post">Social Media Post</ion-select-option>
              <ion-select-option value="banner">Banner</ion-select-option>
              <ion-select-option value="business">Business Card</ion-select-option>
              <ion-select-option value="poster">Poster</ion-select-option>
              <ion-select-option value="icon">Icon</ion-select-option>
            </ion-select>
          </div>
          
          <ion-button expand="block" @click="generateAI" :disabled="isGenerating" class="generate-btn">
            <ion-spinner v-if="isGenerating"></ion-spinner>
            <template v-else>
              <font-awesome-icon :icon="faMagic" /> Generate Design
            </template>
          </ion-button>

          <div class="ai-results">
            <div class="results-title"><font-awesome-icon :icon="faLightbulb" /> AI Generated Designs</div>
            <div class="results-grid">
              <div v-for="(r, idx) in aiResults" :key="idx" class="design-preview" @click="applyPreview(r)">
                <div class="preview-img"><font-awesome-icon :icon="r.icon" /></div>
                <div class="preview-info">
                  <div class="preview-title">{{ r.title }}</div>
                  <div class="preview-desc">{{ r.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
  faPalette,
  faSave,
  faShareAlt,
  faDownload,
  faChevronLeft,
  faChevronRight,
  faPlus,
  faTrashAlt,
  faLayerGroup,
  faCopy,
  faUndo,
  faRedo,
  faCheck,
  faMagic,
  faRobot,
  faLightbulb,
  faMousePointer,
  faTextHeight,
  faImage,
  faShapes,
  faPaintBrush,
  faIcons,
  faRulerCombined,
  faBullhorn,
  faFileAlt,
  faBriefcase,
  faBirthdayCake,
  faChartLine,
  faGraduationCap,
  faBolt,
  faInfinity,
  faAtom,
  faCubes
} from '@fortawesome/free-solid-svg-icons';

// State
const activeTool = ref('select');
const selectedSize = ref('a4');
const customWidth = ref(800);
const customHeight = ref(600);
const canvasWrapper = ref(null);
const canvasContainer = ref(null);
const pageTransition = ref(false);

const pages = reactive([]);
const currentPage = ref(1);
let fabricCanvas = null;

const aiPrompt = ref('A modern tech logo with a blue gradient and abstract circuit design');
const aiType = ref('logo');
const isGenerating = ref(false);
const aiResults = ref([
  { title: 'Tech Lightning', desc: 'Modern & Minimal', icon: faBolt, payload: {} },
  { title: 'Abstract Circuit', desc: 'Tech & Innovation', icon: faInfinity, payload: {} },
  { title: 'Quantum Core', desc: 'Futuristic Design', icon: faAtom, payload: {} },
  { title: 'Modular Blocks', desc: '3D Perspective', icon: faCubes, payload: {} }
]);

// Methods
function createEmptyPage(width = 800, height = 600, text = 'Your Design Here') {
  const fakeCanvas = new fabric.StaticCanvas(null, { width, height });
  const txt = new fabric.Text(text, { 
    left: 50, 
    top: 50, 
    fontSize: 28, 
    fontFamily: 'Poppins',
    fill: '#333' 
  });
  fakeCanvas.add(txt);
  const json = fakeCanvas.toJSON();
  fakeCanvas.dispose();
  return { id: Date.now() + Math.random(), width, height, json };
}

async function initFirstPage() {
  const initial = createEmptyPage(customWidth.value, customHeight.value);
  pages.push(initial);
  await nextTick();
  await mountCanvasForPage(0);
}

async function mountCanvasForPage(index) {
  if (fabricCanvas) {
    try { fabricCanvas.dispose(); } catch (e) { console.warn(e); }
    fabricCanvas = null;
  }

  const container = canvasContainer.value;
  container.innerHTML = '';
  const el = document.createElement('canvas');
  el.id = `designer-canvas-${pages[index].id}`;
  el.width = pages[index].width;
  el.height = pages[index].height;
  el.style.background = '#fff';
  container.appendChild(el);

  fabricCanvas = new fabric.Canvas(el, { 
    backgroundColor: '#ffffff',
    preserveObjectStacking: true
  });

  // Add border to visualize canvas
  fabricCanvas.add(new fabric.Rect({
    width: pages[index].width,
    height: pages[index].height,
    left: 0,
    top: 0,
    fill: 'transparent',
    stroke: '#cccccc',
    strokeWidth: 1,
    selectable: false,
    evented: false
  }));

  if (pages[index].json) {
    fabricCanvas.loadFromJSON(pages[index].json, fabricCanvas.renderAll.bind(fabricCanvas));
  }

  fabricCanvas.on('object:modified', () => {
    pages[index].json = fabricCanvas.toJSON();
  });

  fabricCanvas.on('object:added', () => {
    pages[index].json = fabricCanvas.toJSON();
  });
}

function resizeActiveCanvas(width, height) {
  if (!fabricCanvas) return;
  const json = fabricCanvas.toJSON();
  const idx = currentPage.value - 1;
  pages[idx].width = width;
  pages[idx].height = height;
  mountCanvasForPage(idx);
  fabricCanvas.loadFromJSON(json, fabricCanvas.renderAll.bind(fabricCanvas));
}

function selectSize(size) {
  selectedSize.value = size;
  if (size === 'a4') { customWidth.value = 800; customHeight.value = 1130; }
  if (size === 'a5') { customWidth.value = 560; customHeight.value = 800; }
  if (size === 'a3') { customWidth.value = 1130; customHeight.value = 1600; }
  if (size === 'a2') { customWidth.value = 1600; customHeight.value = 2260; }
}

function applyCustomSize() {
  const w = Number(customWidth.value);
  const h = Number(customHeight.value);
  if (w > 0 && h > 0) {
    resizeActiveCanvas(w, h);
  }
}

async function addPage() {
  pageTransition.value = true;
  const newPage = createEmptyPage(
    customWidth.value || 800, 
    customHeight.value || 600, 
    `Page ${pages.length + 1}`
  );
  pages.push(newPage);
  currentPage.value = pages.length;
  await nextTick();
  await mountCanvasForPage(currentPage.value - 1);
  pageTransition.value = false;
}

async function prevPage() {
  if (currentPage.value > 1) {
    pageTransition.value = true;
    pages[currentPage.value - 1].json = fabricCanvas.toJSON();
    currentPage.value--;
    await nextTick();
    await mountCanvasForPage(currentPage.value - 1);
    pageTransition.value = false;
  }
}

async function nextPage() {
  if (currentPage.value < pages.length) {
    pageTransition.value = true;
    pages[currentPage.value - 1].json = fabricCanvas.toJSON();
    currentPage.value++;
    await nextTick();
    await mountCanvasForPage(currentPage.value - 1);
    pageTransition.value = false;
  }
}

function deleteCurrentPage() {
  if (pages.length === 1) {
    pages[0] = createEmptyPage(customWidth.value, customHeight.value);
    mountCanvasForPage(0);
    currentPage.value = 1;
    return;
  }
  pages.splice(currentPage.value - 1, 1);
  if (currentPage.value > pages.length) currentPage.value = pages.length;
  mountCanvasForPage(currentPage.value - 1);
}

function undo() {
  if (!fabricCanvas) return;
  fabricCanvas.getActiveObject()?.exitEditing?.();
  fabricCanvas.discardActiveObject();
  fabricCanvas.renderAll();
}

function redo() {
  console.warn('Redo not implemented - consider adding an action stack');
}

function arrangeObjects() {
  if (!fabricCanvas) return;
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj) {
    activeObj.bringToFront();
    fabricCanvas.renderAll();
  }
}

function duplicateObject() {
  if (!fabricCanvas) return;
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj) {
    activeObj.clone(clone => {
      clone.set({
        left: clone.left + 10,
        top: clone.top + 10
      });
      fabricCanvas.add(clone);
    });
  }
}

async function generateAI() {
  if (!aiPrompt.value.trim()) return;
  isGenerating.value = true;
  
  await new Promise(r => setTimeout(r, 1200));
  
  const newText = new fabric.Text(aiPrompt.value.substring(0, 20) + '...', {
    left: 100,
    top: 100,
    fontSize: 24,
    fontFamily: 'Poppins',
    fill: '#8b5cf6',
    fontWeight: 'bold'
  });
  
  fabricCanvas.add(newText);
  isGenerating.value = false;
  showNotification('AI design generated successfully!');
}

function applyPreview(preview) {
  if (!fabricCanvas) return;
  const circle = new fabric.Circle({ 
    left: 80, 
    top: 80, 
    radius: 40, 
    fill: '#8b5cf6', 
    selectable: true 
  });
  const txt = new fabric.Text(preview.title, { 
    left: 140, 
    top: 90, 
    fontSize: 18, 
    fontFamily: 'Poppins',
    fill: '#111' 
  });
  const group = new fabric.Group([circle, txt], { left: 50, top: 50 });
  fabricCanvas.add(group);
  fabricCanvas.renderAll();
}

function applyTemplate(type) {
  if (!fabricCanvas) return;
  
  fabricCanvas.getObjects().forEach(obj => {
    if (!(obj instanceof fabric.Rect && obj.fill === 'transparent')) {
      fabricCanvas.remove(obj);
    }
  });
  
  let templateText, templateObjects = [];
  
  switch(type) {
    case 'social':
      templateText = new fabric.Text('Social Media Post', {
        left: 100,
        top: 100,
        fontSize: 36,
        fontFamily: 'Poppins',
        fill: '#6366f1',
        fontWeight: 'bold'
      });
      templateObjects.push(templateText);
      break;
      
    case 'business':
      templateText = new fabric.Text('Business Card', {
        left: 100,
        top: 100,
        fontSize: 24,
        fontFamily: 'Poppins',
        fill: '#333'
      });
      const rect = new fabric.Rect({
        left: 80,
        top: 150,
        width: 200,
        height: 30,
        fill: '#6366f1'
      });
      templateObjects.push(templateText, rect);
      break;
      
    default:
      templateText = new fabric.Text(`${type} Template`, {
        left: 100,
        top: 100,
        fontSize: 28,
        fontFamily: 'Poppins',
        fill: '#333'
      });
      templateObjects.push(templateText);
  }
  
  templateObjects.forEach(obj => fabricCanvas.add(obj));
  fabricCanvas.renderAll();
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '12px 25px';
  notification.style.backgroundColor = '#6366f1';
  notification.style.color = 'white';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
  notification.style.zIndex = '1000';
  notification.style.fontFamily = 'Poppins, sans-serif';
  notification.style.fontWeight = '500';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(20px)';
  notification.style.transition = 'all 0.3s ease';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function exportPNG() {
  if (!fabricCanvas) return;
  const data = fabricCanvas.toDataURL({ format: 'png', multiplier: 2 });
  const a = document.createElement('a');
  a.href = data;
  a.download = `design-page-${currentPage.value}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function saveProject() {
  if (fabricCanvas) pages[currentPage.value - 1].json = fabricCanvas.toJSON();
  const project = JSON.stringify(pages);
  const blob = new Blob([project], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'designcraft-project.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function shareProject() {
  showNotification('Share functionality would connect to your preferred service');
}

onMounted(async () => {
  selectSize('a4');
  await initFirstPage();
});
</script>

<style scoped>
/* Layout */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.layout {
  display: flex;
  height: 100%;
}

/* Header Styles */
.header {
  --background: rgba(15, 23, 42, 0.9);
  --border-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  color: #6366f1;
}

.logo-text {
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 24px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-left: 10px;
}

.header-controls {
  display: flex;
  gap: 15px;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-section {
  margin-bottom: 30px;
  padding: 0 20px;
}

.sidebar-title {
  font-size: 14px;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 15px;
  letter-spacing: 1px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.tool-item {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 8px;
  padding: 15px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.tool-item:hover {
  background: rgba(51, 65, 85, 0.7);
  border-color: rgba(99, 102, 241, 0.5);
}

.tool-item.active {
  background: rgba(71, 85, 105, 0.8);
  border-color: #6366f1;
}

.tool-icon {
  font-size: 20px;
  color: #818cf8;
  margin-bottom: 8px;
}

.tool-name {
  font-size: 12px;
  color: #e6e6e6;
}

/* Page Sizes Section */
.size-section {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 10px;
  padding: 15px;
  margin: 0 15px 20px;
}

.size-title {
  font-size: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.size-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.size-item {
  background: rgba(51, 65, 85, 0.5);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-item:hover, .size-item.active {
  background: rgba(71, 85, 105, 0.8);
  border: 1px solid #6366f1;
}

.size-name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.size-dimensions {
  font-size: 11px;
  color: #94a3b8;
}

.custom-size {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.custom-input {
  --background: rgba(51, 65, 85, 0.5);
  --border-color: rgba(255, 255, 255, 0.1);
  --color: white;
  --padding-start: 8px;
  --border-radius: 6px;
}

.apply-size-btn {
  --background: rgba(71, 85, 105, 0.8);
  --color: white;
  margin-top: 10px;
}

/* Editor Area */
.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.toolbar {
  display: flex;
  padding: 15px 24px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 15px;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.toolbar-btn {
  --background: rgba(30, 41, 59, 0.6);
  --color: #e6e6e6;
  --border-radius: 6px;
  --padding-start: 12px;
  --padding-end: 12px;
  font-size: 14px;
}

.toolbar-btn:hover {
  --background: rgba(51, 65, 85, 0.7);
}

.page-controls {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 10px;
}

.page-btn {
  width: 34px;
  height: 34px;
  --border-radius: 6px;
  --background: rgba(30, 41, 59, 0.6);
  --color: #e6e6e6;
}

.page-btn:hover {
  --background: rgba(51, 65, 85, 0.7);
}

.page-indicator {
  font-size: 14px;
  color: #94a3b8;
}

.canvas-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  overflow: auto;
  background: radial-gradient(circle, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
  position: relative;
}

.canvas-wrapper {
  position: relative;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.page-transition {
  animation: slideIn 0.4s ease forwards;
}

.page-shadow {
  position: absolute;
  top: 8px;
  left: 8px;
  right: -8px;
  bottom: -8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  z-index: -1;
}

.canvas-container-inner canvas {
  background-color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

/* AI Panel */
.ai-panel {
  width: 380px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-icon {
  font-size: 24px;
  color: #8b5cf6;
}

.ai-title {
  font-size: 18px;
  font-weight: 600;
}

.ai-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 25px;
  line-height: 1.6;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #e6e6e6;
}

ion-textarea {
  --background: rgba(30, 41, 59, 0.6);
  --color: #e6e6e6;
  --border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --border-color: rgba(255, 255, 255, 0.1);
  --highlight-color-focused: #6366f1;
}

ion-select {
  --background: rgba(30, 41, 59, 0.6);
  --color: #e6e6e6;
  --border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  --border-color: rgba(255, 255, 255, 0.1);
  --highlight-color-focused: #6366f1;
  width: 100%;
}

.generate-btn {
  --background: linear-gradient(90deg, #8b5cf6, #6366f1);
  --color: white;
  --border-radius: 8px;
  --padding-top: 15px;
  --padding-bottom: 15px;
  font-weight: 500;
  margin-bottom: 20px;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.ai-results {
  margin-top: 20px;
  flex: 1;
  overflow-y: auto;
}

.results-title {
  font-size: 16px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.design-preview {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.design-preview:hover {
  transform: translateY(-3px);
  border-color: #6366f1;
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
}

.preview-img {
  width: 100%;
  height: 120px;
  background: linear-gradient(45deg, #4338ca, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;
}

.preview-info {
  padding: 12px;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
}

.preview-desc {
  font-size: 12px;
  color: #94a3b8;
}

/* Animations */
@keyframes slideIn {
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.generating {
  animation: pulse 1.5s infinite;
}

/* Font Awesome specific styles */
.fa-icon {
  margin-right: 8px;
}

.svg-inline--fa {
  vertical-align: -0.2em;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .sidebar {
    width: 240px;
  }
  .ai-panel {
    width: 320px;
  }
}

@media (max-width: 992px) {
  .sidebar {
    width: 200px;
  }
  .ai-panel {
    width: 280px;
  }
}
</style>