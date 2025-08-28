<template>
  <div class="pages-panel">
    <div class="panel-header">
      <h3>Pages</h3>
      <button @click="addPage" class="add-page-btn" title="Add a new page">
        <i class="fas fa-plus"></i>
        <span>Add Page</span>
      </button>
    </div>
    <TransitionGroup name="list" tag="div" class="pages-list">
      <div
        v-for="(page, index) in pages"
        :key="page.id"
        class="page-item"
        :class="{ active: index === canvasStore.currentPageIndex }"
        @click="selectPage(index)"
      >
        <div class="page-thumbnail">
          <img v-if="page.thumbnail" :src="page.thumbnail" alt="Page thumbnail" />
          <span v-else class="page-number">{{ index + 1 }}</span>
        </div>
        <div class="page-info">
          <span class="page-name">Page {{ index + 1 }}</span>
        </div>
        <div class="page-actions">
          <button @click.stop="duplicatePage(index)" title="Duplicate Page">
            <i class="fas fa-copy"></i>
          </button>
          <button @click.stop="deletePage(index)" title="Delete Page">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCanvasStore } from '../../../../stores/canvas-konva';

const canvasStore = useCanvasStore();

const pages = computed(() => canvasStore.pages);

function addPage() {
  canvasStore.addPage();
}

function selectPage(index) {
  canvasStore.goToPage(index);
}

function duplicatePage(index) {
  canvasStore.duplicatePage(index);
}

function deletePage(index) {
  if (pages.value.length > 1) {
    canvasStore.deletePage(index);
  } else {
    alert("You cannot delete the last page.");
  }
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.pages-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.dark-theme .panel-header {
  border-bottom-color: #3d3d3d;
}
.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.add-page-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}
.add-page-btn:hover {
  background-color: #4338ca;
}
.pages-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.page-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 2px solid transparent;
}
.page-item:hover {
  background-color: #f5f5f5;
}
.dark-theme .page-item:hover {
  background-color: #3d3d3d;
}
.page-item.active {
  background-color: #eef2ff;
  border-color: #4f46e5;
}
.dark-theme .page-item.active {
  background-color: #3730a3;
  border-color: #6366f1;
}
.page-thumbnail {
  width: 60px;
  height: 45px;
  background-color: #e0e0e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;
}
.page-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.dark-theme .page-thumbnail {
  background-color: #555;
}
.page-number {
  font-size: 18px;
  font-weight: bold;
  color: #777;
}
.dark-theme .page-number {
  color: #ccc;
}
.page-info {
  flex: 1;
}
.page-name {
  font-weight: 500;
}
.page-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}
.page-item:hover .page-actions,
.page-item.active .page-actions {
  opacity: 1;
}
.page-actions button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dark-theme .page-actions button {
  color: #aaa;
}
.page-actions button:hover {
  background-color: #e0e0e0;
}
.dark-theme .page-actions button:hover {
  background-color: #555;
}
</style>
