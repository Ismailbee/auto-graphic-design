<template>
  <header class="app-header" :class="{ 'dark-theme': canvasStore.workspaceTheme === 'dark' }">
    <div class="header-left">
      <div class="header-nav">
        <button class="nav-button" @click="goHome">
          <i class="fas fa-home"></i>
          <span>Home</span>
        </button>
      </div>
    </div>

    <div class="header-center">
      <!-- This area can be used for contextual tools based on selection -->
      <div class="main-toolbar">
        <div class="document-info">
          <input 
            type="text" 
            class="project-title-input" 
            v-model="projectName"
            @change="updateProjectName"
            placeholder="Untitled design"
          />
          <div class="save-status" :title="`Last saved: ${lastSavedTime}`">
            <i :class="saveStatusIcon"></i>
            <span>{{ canvasStore.saveStatus }}</span>
          </div>
        </div>
        <div class="separator"></div>
        <button class="tool-button" @click="canvasStore.undo" :disabled="!canvasStore.canUndo" title="Undo (Ctrl+Z)">
          <i class="fas fa-undo"></i>
        </button>
        <button class="tool-button" @click="canvasStore.redo" :disabled="!canvasStore.canRedo" title="Redo (Ctrl+Y)">
          <i class="fas fa-redo"></i>
        </button>
      </div>
    </div>

    <div class="header-right">
      <button class="gallery-button" @click="openGallery">
        <i class="fas fa-images"></i>
        <span>My Gallery</span>
      </button>
      
      <button class="share-button" @click="showShareDialog = true">
        <i class="fas fa-share-alt"></i>
        <span>Share</span>
      </button>
      
      <div class="export-menu">
        <button class="export-button" :class="{ 'active': showExportMenu }" @click="toggleExportMenu">
          <i class="fas fa-download"></i>
          <span>Export</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <transition name="fade-down">
          <div v-if="showExportMenu" class="dropdown-menu">
            <div class="dropdown-header">Export As</div>
            <button @click="exportAs('png')"><i class="fas fa-file-image"></i> PNG</button>
            <button @click="exportAs('jpeg')"><i class="fas fa-file-image"></i> JPEG</button>
            <button @click="exportAs('svg')"><i class="fas fa-file-code"></i> SVG</button>
            <div class="dropdown-divider"></div>
            <button @click="downloadProjectJson"><i class="fas fa-file-alt"></i> Export Project (JSON)</button>
            <button @click="saveProject"><i class="fas fa-save"></i> Save Project</button>
            <button @click="openProjects"><i class="fas fa-folder-open"></i> Manage Projects</button>
            <div class="dropdown-divider"></div>
            <button @click="exportAs('pdf')"><i class="fas fa-file-pdf"></i> PDF</button>
          </div>
        </transition>
      </div>
      
      <UserMenu />
    </div>
    
  <ShareModal :show="showShareDialog" @close="showShareDialog = false" />
  <ProjectsModal :show="showProjects" @close="showProjects = false" />
  <GalleryModal :show="showGallery" @close="showGallery = false" @select-image="addImageToCanvas" />
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCanvasStore } from '../../../stores/canvas-fabric'
import UserMenu from './header/UserMenu.vue'
import ShareModal from './header/ShareModal.vue'
import ProjectsModal from './header/ProjectsModal.vue'
import GalleryModal from './header/GalleryModal.vue'

const router = useRouter()
const canvasStore = useCanvasStore()

const projectName = ref(canvasStore.projectName)
const showExportMenu = ref(false)
const showShareDialog = ref(false);
const showProjects = ref(false);
const showGallery = ref(false);

const saveStatusIcon = computed(() => {
  switch (canvasStore.saveStatus) {
    case 'Saving...': return 'fas fa-spinner fa-spin'
    case 'Saved': return 'fas fa-check-circle'
    case 'Unsaved changes': return 'fas fa-edit'
    default: return 'fas fa-cloud'
  }
})

const lastSavedTime = computed(() => {
  if (!canvasStore.lastSaved) return 'Never'
  return new Date(canvasStore.lastSaved).toLocaleTimeString()
})

watch(() => canvasStore.projectName, (newName) => {
  projectName.value = newName
})

function updateProjectName() {
  canvasStore.setProjectName(projectName.value)
}

function goHome() {
  router.push('/home')
}

function toggleExportMenu() {
  showExportMenu.value = !showExportMenu.value
}

function exportAs(format) {
  if (format === 'pdf') {
    alert('PDF export is coming soon!')
  } else {
    const dataUrl = canvasStore.exportCanvas(format)
    if (dataUrl) {
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${projectName.value || 'design'}.${format}`
      a.click()
    }
  }
  showExportMenu.value = false
}

function downloadProjectJson() {
  canvasStore.exportProjectJson(`${projectName.value || 'design'}.json`)
  showExportMenu.value = false
}

function saveProject() {
  canvasStore.saveToLocalStorage()
  showExportMenu.value = false
}

function loadProject() {
  const key = prompt('Enter project key to load (leave empty to load autosave):', '')
  canvasStore.loadFromLocalStorage(key || undefined)
  showExportMenu.value = false
}

function openProjects() {
  showProjects.value = true
  showExportMenu.value = false
}

function openGallery() {
  showGallery.value = true
  // Close other menus if open
  showExportMenu.value = false
}

function addImageToCanvas(imageUrl) {
  // Add the selected image to the canvas
  if (canvasStore.stageInstance && imageUrl) {
    canvasStore.addElement('image', { src: imageUrl });
  }
  showGallery.value = false;
}

const handleClickOutside = (e) => {
  if (!e.target.closest('.export-menu')) {
    showExportMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --header-height: 96px;
  --header-bg-light: #ffffff;
  --header-bg-dark: var(--app-dark-surface);
  --header-border-light: #e5e7eb;
  --header-border-dark: var(--app-dark-border);
  --text-light-primary: #111827;
  --text-light-secondary: #94a3b8;
  --text-dark-primary: #f9fafb;
  --text-dark-secondary: #9ca3af;
  --primary-color: #4f46e5;
  --primary-color-hover: #4338ca;
  --primary-color-light: #eef2ff;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
  padding: 0 32px;
  background-color: white;
  border-bottom: 1px solid var(--header-border-light);
  position: relative;
  z-index: 1001;
  font-family: 'Inter', sans-serif;
  transition: background 0.3s, border-color 0.3s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.dark-theme .app-header {
  background: var(--header-bg-dark);
  border-bottom-color: var(--header-border-dark);
  color: var(--text-dark-primary);
}

.header-left, .header-center, .header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left { flex: 1; min-width: 0; }
.header-center { flex: 1; justify-content: center; }
.header-right { flex: 1; justify-content: flex-end; }

.header-right {
  padding-right: 100px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 6px;
}
.dark-theme .header-nav { background-color: #111827; }

.nav-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: none;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-light-secondary);
  cursor: pointer;
  transition: all 0.18s;
}
.dark-theme .nav-button { color: var(--text-dark-secondary); }
.nav-button:hover { background-color: #f3f4f6; color: var(--text-light-primary); }
.dark-theme .nav-button:hover { background-color: #374151; color: var(--text-dark-primary); }

.separator {
  width: 1px;
  height: 24px;
  background-color: var(--header-border-light);
}
.dark-theme .separator { background-color: var(--header-border-dark); }

.document-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 4px;
}

.project-title-input {
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 600;
  padding: 8px 10px;
  border-radius: 6px;
  color: var(--text-light-primary);
  width: 260px;
  transition: all 0.18s;
}
.dark-theme .project-title-input { color: var(--text-dark-primary); }
.project-title-input:hover { background-color: #f3f4f6; }
.dark-theme .project-title-input:hover { background-color: #374151; }
.project-title-input:focus {
  outline: none;
  background-color: white;
  box-shadow: 0 0 0 2px var(--primary-color);
}
.dark-theme .project-title-input:focus {
  background-color: #1f2937;
  box-shadow: 0 0 0 2px var(--primary-color);
}

.save-status {
  font-size: 12px;
  color: var(--text-light-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}
.dark-theme .save-status { color: var(--text-dark-secondary); }
.save-status .fa-check-circle { color: #10b981; }

.main-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
   
  background-color: #f9fafb;
  border: 1px solid var(--header-border-light);
  border-radius: 14px;
  padding: 0 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
.dark-theme .main-toolbar {
  background-color: #111827;
  border-color: var(--header-border-dark);
}

.tool-button {
  background: transparent;
  border: none;
  font-size: 18px;
  color: var(--text-light-secondary);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
}
.dark-theme .tool-button { color: var(--text-dark-secondary); }
.tool-button:hover:not(:disabled) { 
  background-color: #f3f4f6; 
  color: var(--primary-color);
  transform: translateY(-1px);
}
.dark-theme .tool-button:hover:not(:disabled) { 
  background-color: #374151; 
  color: var(--primary-color-light);
}
.tool-button:disabled { opacity: 0.4; cursor: not-allowed; }

.collaboration-indicator {
  display: flex;
  align-items: center;
}
.collaborator-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--header-bg-light);
  margin-left: -12px;
}
.dark-theme .collaborator-avatar { border-color: var(--header-bg-dark); }
.collaborator-count {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e5e7eb;
  color: var(--text-light-primary);
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--header-bg-light);
  margin-left: -12px;
}
.dark-theme .collaborator-count {
  background-color: #4b5563;
  color: var(--text-dark-primary);
  border-color: var(--header-bg-dark);
}

.gallery-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #eef2ff;
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--primary-color);
}
.dark-theme .gallery-button {
  background-color: #312e81;
  border-color: #4338ca;
  color: #e0e7ff;
}
.gallery-button:hover { 
  background-color: #e0e7ff; 
  border-color: #c7d2fe; 
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(79, 70, 229, 0.15);
}
.dark-theme .gallery-button:hover { 
  background-color: #4338ca; 
  border-color: #4f46e5; 
}

.share-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f9fafb;
  border: 1px solid var(--header-border-light);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-light-primary);
}
.dark-theme .share-button {
  background-color: #374151;
  border-color: var(--header-border-dark);
  color: var(--text-dark-primary);
}
.share-button:hover { 
  background-color: #f3f4f6; 
  border-color: #d1d5db; 
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.dark-theme .share-button:hover { 
  background-color: #4b5563; 
  border-color: #6b7280; 
}

.export-menu { position: relative; }
.export-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #38bdf8; /* Changed to a blue color */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(56, 189, 248, 0.3);
}
.export-button:hover { 
  background-color: #0ea5e9; /* Darker blue on hover */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(56, 189, 248, 0.4);
}
.export-button .fa-chevron-down { font-size: 12px; margin-left: 4px; }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: white;
  border: 1px solid var(--header-border-light);
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.07);
  width: 220px;
  padding: 8px;
  z-index: 10;
}
.dark-theme .dropdown-menu {
  background-color: #2d3748;
  border-color: var(--header-border-dark);
}
.dropdown-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-light-secondary);
  text-transform: uppercase;
}
.dark-theme .dropdown-header { color: var(--text-dark-secondary); }
.dropdown-menu button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  color: var(--text-light-primary);
}
.dark-theme .dropdown-menu button { color: var(--text-dark-primary); }
.dropdown-menu button:hover { background-color: #f3f4f6; }
.dark-theme .dropdown-menu button:hover { background-color: #374151; }
.dropdown-divider {
  height: 1px;
  background-color: var(--header-border-light);
  margin: 8px 0;
}
.dark-theme .dropdown-divider { background-color: var(--header-border-dark); }

.fade-down-enter-active, .fade-down-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-down-enter-from, .fade-down-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>