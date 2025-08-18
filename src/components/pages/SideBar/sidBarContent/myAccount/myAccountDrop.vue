<template>
  <div
    ref="dropdown"
    class="absolute left-[-80px] top-12 w-[200px] bg-white shadow-lg rounded-lg pb-2"
  >
    <div
      button
      lines="none"
      @click="$emit('click')"
      class="flex items-center p-3 text-white transition border-b group"
    >
      <div class="flex flex-col">
        <ion-label class="text-[15px] text-black ml-3">
          {{ displayName }}
        </ion-label>
        <ion-label class="text-[10px] text-[#c5c3c3ee] ml-3">
          {{ email }}
        </ion-label>
      </div>
    </div>

    <ul class="flex flex-col px-2 py-1 text-black">
      <li class="text-[13px] px-4 py-1 rounded-md cursor-pointer hover:bg-gray-100" @click="navigate('/myAccountPage')">Profile</li>
      <li class="text-[13px] px-4 py-1 rounded-md cursor-pointer hover:bg-gray-100">Upgrade to Pro+</li>
      <li class="text-[13px] px-4 py-1 rounded-md cursor-pointer hover:bg-gray-100">Billing</li>
      <li class="text-[13px] px-4 py-1 rounded-md cursor-pointer hover:bg-gray-100">Contact Us</li>
      <li class="text-[13px] px-4 py-1 rounded-md cursor-pointer hover:bg-gray-100">Restart Tour</li>
      <li class="text-[13px] px-4 py-1 rounded-md text-red-600 cursor-pointer hover:bg-gray-100" @click="logout">Log Out</li>
    </ul>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const dropdown = ref(null)

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

// Close dropdown when clicking outside
const emit = defineEmits(['click', 'close'])

function handleClickOutside(event) {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const displayName = computed(() =>
  userStore.fullName || userStore.username || userStore.email || 'My Profile'
)

const email = computed(() => userStore.email || '')
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