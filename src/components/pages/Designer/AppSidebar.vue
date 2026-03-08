<!-- 
Copilot Setup: 
This sidebar manages layers & object properties.
- Show a list of Fabric.js objects (with names).
- Allow reorder, lock/unlock, delete.
- Properties: size, position, rotation, opacity.
- Live sync with CanvasArea.
-->

<template>
  <aside class="app-sidebar" :class="{ 'dark-theme': canvasStore.workspaceTheme === 'dark', 'panel-visible': activePanel }">
    <div class="sidebar-main">
      <nav class="sidebar-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="togglePanel(tab.id)"
          :class="{ active: activePanel === tab.id }"
          class="nav-button"
          :title="tab.name"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.name }}</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <button 
          @click="toggleTheme" 
          class="nav-button"
          :title="canvasStore.workspaceTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          :aria-pressed="canvasStore.workspaceTheme === 'dark'"
          :aria-label="canvasStore.workspaceTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <i :class="canvasStore.workspaceTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
          <span class="sr-only">{{ canvasStore.workspaceTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode' }}</span>
        </button>
        <button class="nav-button" @click="showHelp" title="Help & Resources">
          <i class="fas fa-question-circle"></i>
        </button>
      </div>
    </div>
    
    <transition name="slide-fade">
      <div class="sidebar-panel" v-if="activePanel">
        <div class="panel-header">
          <h2>{{ activePanelName }}</h2>
          <button class="close-panel-btn" @click="activePanel = null" title="Collapse panel">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="panel-content">
          <TemplatesPanel v-if="activePanel === 'templates'" :activeTab="activePanel" />
          <ElementsPanel v-if="activePanel === 'elements'" :activeTab="activePanel" />
          <UploadsPanel v-if="activePanel === 'uploads'" :activeTab="activePanel" />
          <TextPanel v-if="activePanel === 'text'" :activeTab="activePanel" />
          <ImagesPanel v-if="activePanel === 'images'" :activeTab="activePanel" />
          <AnimationsPanel v-if="activePanel === 'animations'" :activeTab="activePanel" />
          <PageSetupPanel v-if="activePanel === 'pageSetup'" :activeTab="activePanel" />
          <MorePanel v-if="activePanel === 'more'" :activeTab="activePanel" />
        </div>
      </div>
    </transition>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCanvasStore } from '../../../stores/canvas-fabric';
import { useNotification } from '../../../composables/useNotification';
import TemplatesPanel from './sidebar/TemplatesPanel.vue';
import ElementsPanel from './sidebar/ElementsPanel.vue';
import UploadsPanel from './sidebar/UploadsPanel.vue';
import TextPanel from './sidebar/TextPanel.vue';
import ImagesPanel from './sidebar/ImagesPanel.vue';
import AnimationsPanel from './sidebar/AnimationsPanel.vue';
import PageSetupPanel from './sidebar/PageSetupPanel.vue';
import MorePanel from './sidebar/MorePanel.vue';

const canvasStore = useCanvasStore();
const { showSuccess, showInfo } = useNotification();

const activePanel = ref(null); // Default open panel - start with no panel open

const tabs = [
  { id: 'templates', name: 'Templates', icon: 'fas fa-th-large' },
  { id: 'elements', name: 'Elements', icon: 'fas fa-shapes' },
  { id: 'uploads', name: 'Media', icon: 'fas fa-photo-video' },
  { id: 'text', name: 'Text', icon: 'fas fa-font' },
  { id: 'images', name: 'Images', icon: 'fas fa-image' },
  { id: 'animations', name: 'Effects', icon: 'fas fa-magic' },
  { id: 'pageSetup', name: 'Page', icon: 'fas fa-file-alt' },
  { id: 'more', name: 'More', icon: 'fas fa-ellipsis-h' }
];

const activePanelName = computed(() => {
  const tab = tabs.find(t => t.id === activePanel.value);
  return tab ? tab.name : '';
});

function togglePanel(panelId) {
  if (activePanel.value === panelId) {
    activePanel.value = null; // Close if clicking the active tab
  } else {
    activePanel.value = panelId; // Open the new tab
  }
}

function getCanvasCenter() {
  const canvas = canvasStore.canvasInstance;
  if (!canvas) return { left: 100, top: 100 };
  return canvas.getCenter ? canvas.getCenter() : { left: canvas.width / 2, top: canvas.height / 2 };
}

function toggleTheme() {
  const newTheme = canvasStore.workspaceTheme === 'dark' ? 'light' : 'dark';
  canvasStore.setWorkspaceTheme(newTheme);
  showSuccess(`Switched to ${newTheme} mode`);
}

function showHelp() {
  showInfo('Help center coming soon!');
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --sidebar-main-width: 80px;
  --sidebar-panel-width: 200px;
  --sidebar-bg-light: #ffffff;
  --sidebar-bg-dark: #1f2937;
  --sidebar-border-light: #e5e7eb;
  --sidebar-border-dark: #374151;
  --text-light-primary: #111827;
  --text-light-secondary: #6b7280;
  --text-dark-primary: #f9fafb;
  --text-dark-secondary: #9ca3af;
  --primary-color: #4f46e5;
  --primary-color-hover: #4338ca;
  --primary-color-light: #eef2ff;
}

.app-sidebar {
  display: flex;
  height: 100%;
  font-family: 'Inter', sans-serif;
  background-color: #f6f7fa;
  box-shadow: 1px 0 3px rgba(0,0,0,0.05);
}

.dark-theme .app-sidebar {
  background-color: var(--sidebar-bg-dark);
}

.sidebar-main {
  width: var(--sidebar-main-width);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  border-right: 1px solid var(--sidebar-border-light);
  background-color: var(--sidebar-bg-light);
  z-index: 2;
  transition: width 0.2s ease;
  flex-shrink: 0;
}
.dark-theme .sidebar-main {
  background-color: var(--sidebar-bg-dark);
  border-right-color: var(--sidebar-border-dark);
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0px;
  width: 100%;
  padding: 0 12px;
}

.nav-button {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  color: var(--text-light-secondary);
  transition: all 0.2s ease-in-out;
  position: relative;
  padding: 9px;
}
.dark-theme .nav-button {
  color: var(--text-dark-secondary);
}
.nav-button i {
  font-size: 18px;
  margin-bottom: 2px;
}

.nav-button span {
  font-weight: 500;
  font-size: 9px;
}

.nav-button:hover {
  background-color: lightgray;
  color: var(--primary-color);
}
.dark-theme .nav-button:hover {
  background-color: #374151;
  color: #c7d2fe;
}
.nav-button.active {
  background-color: var(--primary-color);
  color: white;
}
.dark-theme .nav-button.active {
  background-color: var(--primary-color-hover);
  color: white;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 0 12px;
}
.sidebar-footer .nav-button {
  height: 48px;
}
.sidebar-footer .nav-button i {
    margin-bottom: 0;
}
.sidebar-footer .nav-button span {
    display: none;
}

.sidebar-panel {
  width: var(--sidebar-panel-width);
  max-width: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--sidebar-border-light);
  background-color: var(--sidebar-bg-light);
  z-index: 1;
  flex-shrink: 0;
  box-sizing: border-box;
}
.dark-theme .sidebar-panel {
  border-right-color: var(--sidebar-border-dark);
  background-color: var(--sidebar-bg-dark);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--sidebar-border-light);
  flex-shrink: 0;
}
.dark-theme .panel-header {
  border-bottom-color: var(--sidebar-border-dark);
}
.panel-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-light-primary);
}
.dark-theme .panel-header h2 {
  color: var(--text-dark-primary);
}

.close-panel-btn {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.dark-theme .close-panel-btn {
  color: var(--text-dark-secondary);
}
.close-panel-btn:hover {
  background-color: #f3f4f6;
  color: var(--text-light-primary);
}
.dark-theme .close-panel-btn:hover {
  background-color: #374151;
  color: var(--text-dark-primary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.dark-theme .panel-content::-webkit-scrollbar-thumb {
  background-color: #475569;
}

/* When any panel is open, significantly reduce its width to make room visually and ensure scroll */
.app-sidebar.panel-visible .sidebar-panel {
  width: var(--sidebar-panel-width);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Accessibility helper */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
</style>