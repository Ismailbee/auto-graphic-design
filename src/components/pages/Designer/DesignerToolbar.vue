<template>
  <ion-header class="bg-slate-900/60 backdrop-blur border-b border-white/10">
      <ion-toolbar class="min-h-[56px]">
        <ion-buttons slot="start" class="flex items-center gap-2">
          <div class="text-xl text-white">
            <font-awesome-icon :icon="faPalette" />
          </div>
          <ion-title class="font-montserrat font-extrabold text-xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent ml-1.5">
            Smart Graphic Design — Pro
          </ion-title>
        </ion-buttons>

        <!-- Top actions -->
        <div class="flex items-center gap-2" slot="end">
          <!-- File -->
          <ion-button fill="clear" size="small" @click="newDocument">
            <font-awesome-icon :icon="faFileAlt" class="mr-1 text-white" /> New
          </ion-button>
          <ion-button fill="clear" size="small" @click="saveProject">
            <font-awesome-icon :icon="faSave" class="mr-1 text-white" /> Save
          </ion-button>
          <ion-button fill="clear" size="small" @click="loadProject">
            <font-awesome-icon :icon="faDownload" class="mr-1 text-white" /> Load
          </ion-button>
          <ion-button color="primary" size="small" @click="exportPNG">
            <font-awesome-icon :icon="faDownload" class="mr-1 text-white" /> Export PNG
          </ion-button>
        </div>
      </ion-toolbar>

      <!-- Secondary bar: Edit / View -->
      <div class="flex items-center gap-2 px-3 py-2 bg-slate-900/60 border-t border-white/10">
        <!-- Undo/Redo -->
        <div class="flex gap-1 items-center">
          <button @click="undo" class="btn-ghost"><font-awesome-icon :icon="faUndo" class="mr-1 text-[10px]"/>Undo</button>
          <button @click="redo" class="btn-ghost"><font-awesome-icon :icon="faRedo" class="mr-1 text-[10px]"/>Redo</button>
        </div>

        <!-- Zoom -->
        <div class="flex items-center gap-2 ml-2">
          <button class="btn-ghost" @click="zoomOut">-</button>
          <div class="min-w-20 text-center text-xs text-white">{{ Math.round(zoom * 100) }}%</div>
          <button class="btn-ghost" @click="zoomIn">+</button>
          <button class="btn-ghost" @click="fitToScreen">Fit</button>
          <button class="btn-ghost" @click="resetZoom">Reset</button>
        </div>

        <!-- View toggles -->
        <div class="flex items-center gap-2 ml-2">
          <label class="view-toggle"><input type="checkbox" v-model="view.grid" @change="toggleGrid"/> Grid</label>
          <label class="view-toggle"><input type="checkbox" v-model="view.snap"/> Snap</label>
          <label class="view-toggle"><input type="checkbox" v-model="view.rulers"/> Rulers</label>
        </div>

        <!-- Page nav -->
        <div class="flex items-center gap-1 ml-auto">
          <ion-button fill="clear" @click="prevPage" class="w-6 h-6 rounded-md btn-ghost">
            <font-awesome-icon :icon="faChevronLeft" class="text-white text-xs" />
          </ion-button>
          <div class="text-xs text-slate-300">Page {{ currentPage }} / {{ pages.length }}</div>
          <ion-button fill="clear" @click="nextPage" class="w-6 h-6 rounded-md btn-ghost">
            <font-awesome-icon :icon="faChevronRight" class="text-white text-xs" />
          </ion-button>
          <button class="btn-ghost" @click="addPage"><font-awesome-icon :icon="faPlus" class="mr-1"/>Add</button>
          <button class="btn-danger" @click="deleteCurrentPage"><font-awesome-icon :icon="faTrashAlt" class="mr-1"/>Delete</button>
        </div>
      </div>
    </ion-header>

</template>

<script setup>

</script>