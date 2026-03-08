<template>
  <div class="fixed inset-0 overflow-auto">
    <!-- Settings Panel - At root level for true fixed positioning -->
  <Transition name="slide-up">
    <div 
      v-if="showSettings"
      class="fixed inset-x-0 bottom-0 z-[99999]"
      style="position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; z-index: 99999 !important; pointer-events: auto !important;"
    >
      <div 
        class="bg-white dark:bg-slate-800 w-full overflow-y-auto rounded-t-2xl border-t border-slate-200 dark:border-slate-700 shadow-lg" 
        :style="{ 
          height: settingsPanelHeight + 'px', 
          minHeight: '200px', 
          maxHeight: '80vh',
          zIndex: '99999 !important',
          pointerEvents: 'auto !important'
        }"
      >
        <!-- Drag Handle - Fixed at top -->
        <div 
          class="sticky top-0 flex justify-center py-1 cursor-row-resize hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"
          style="z-index: 100000 !important; pointer-events: auto !important;"
          @mousedown="startDragging"
        >
          <div class="w-8 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
        </div>
        <!-- Header - Fixed below drag handle -->
        <div class="flex bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 py-2 items-center justify-between" style="top: 36px !important; pointer-events: auto !important;">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Invoice Settings
          </h3>
          <button
            class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            style="pointer-events: auto !important;"
            @click="showSettings = false"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Scrollable Content Area -->
        <div class="p-3 space-y-3" style="padding-top: 1rem; margin-top: 0; pointer-events: auto !important;">
          <div class="flex justify-between px-16">
          

          </div>


      
          <!-- Signatures only -->
              <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Signatures</label>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <!-- Signature 1 Dropdown -->
                  <div>
                    <label class="block text-[9px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">Signature 1</label>
                    <select
                      v-model="selectedSignature1"
                      class="w-full px-1 py-0.5 text-[9px] border border-purple-300 dark:border-purple-600 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      style="pointer-events: auto !important;"
                      @change="handleSignature1Change"
                    >
                      <option value="">None</option>
                      <option v-for="sig in savedSignatures" :key="sig.id" :value="sig.id">{{ sig.name }}</option>
                    </select>
                  </div>
                  
                  <!-- Signature 2 Dropdown -->
                  <div>
                    <label class="block text-[9px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">Signature 2</label>
                    <select
                      v-model="selectedSignature2"
                      class="w-full px-1 py-0.5 text-[9px] border border-purple-300 dark:border-purple-600 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      style="pointer-events: auto !important;"
                      @change="handleSignature2Change"
                    >
                      <option value="">None</option>
                      <option v-for="sig in savedSignatures" :key="sig.id" :value="sig.id">{{ sig.name }}</option>
                    </select>
                  </div>
                </div>
                
                <!-- Signature count and status -->
                <div class="mb-2 text-[9px] text-slate-600 dark:text-slate-400">
                  <span v-if="savedSignatures.length === 0">No signatures available</span>
                  <span v-else>{{ savedSignatures.length }} signature{{ savedSignatures.length !== 1 ? 's' : '' }} available</span>
                </div>
                
                <!-- Action button -->
                <button
                  class="w-full px-2 py-0.5 text-[10px] bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center justify-center gap-1"
                  style="pointer-events: auto !important;"
                  @click="handleCreateSignature"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Signature
                </button>
              </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Bottom Toggle Button - At root level for true fixed positioning -->
  <div 
    v-if="!showSettings"
    class="fixed inset-x-0 bottom-0 bg-gradient-to-r from-indigo-600 to-indigo-700 z-[9999999]"
    style="position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; z-index: 9999999 !important; pointer-events: auto !important; box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1) !important; min-height: 50px !important;"
  >
    <button
      class="w-full py-2 text-white font-semibold text-xs text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
      @click="showSettings = true"
      style="pointer-events: auto !important;"
    >
      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
      Show Settings
    </button>
  </div>

  <div class="fixed inset-0 bg-slate-100 dark:bg-slate-900 flex flex-col touch-pan-x touch-pan-y touch-pinch-zoom">
    <!-- Error Boundary -->
    <div v-if="hasError" class="error-boundary" data-v-0455a002="">
      <div class="error-container" data-v-0455a002="">
        <div class="error-icon" data-v-0455a002="">⚠️</div>
        <h2 class="error-title" data-v-0455a002="">Oops! Something went wrong</h2>
        <p class="error-message" data-v-0455a002="">{{ errorMessage }}</p>
        <div class="error-actions" data-v-0455a002="">
          <button class="btn-primary" data-v-0455a002="" @click="handleRetry">Try Again</button>
          <button class="btn-secondary" data-v-0455a002="" @click="handleReload">Reload Page</button>
        </div>
        <details v-if="errorDetails" class="error-details" data-v-0455a002="">
          <summary data-v-0455a002="">Technical Details</summary>
          <pre data-v-0455a002="">{{ errorDetails }}</pre>
        </details>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
    <!-- Header Bar -->
    <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 md:px-8 lg:px-10 xl:px-14 py-2 md:py-4" :style="windowWidth < 768 ? 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 50 !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important; min-height: 100px !important; padding-top: 70px !important;' : 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 50 !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important; min-height: 80px !important;'">
      
      <!-- Mobile Layout (stacked, compact) -->
      <div v-if="windowWidth < 768" class="flex flex-col gap-1">
        <!-- Row 1: Back arrow and Title -->
        <div class="flex items-center gap-2">
          <!-- Back Button -->
          <button
            class="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded transition-colors flex items-center justify-center"
            title="Go Back"
            @click="$router.push({ name: 'Invoice', query: $route.query })"
          >
            <svg class="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="flex-1 min-w-0">
            <h1 class="text-base font-bold text-slate-900 dark:text-white truncate">Invoice Preview</h1>
          </div>
          
        </div>
        
        <!-- Row 2: Navigation, Export/Save Dropdown and Share buttons -->
        <div class="flex items-center gap-1">
            <button
              class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-medium transition-colors"
              title="Save current invoice"
              @click="showSaveDialog"
            >
              💾 Save
            </button>
            
            <button
              class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-medium transition-colors"
              title="Create new invoice"
              @click="createNewInvoice"
            >
              ➕ New
            </button>
          
          <!-- Export/Save Dropdown -->
          <div class="flex gap-1 flex-1">
            <div class="relative">
              <button
                class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
                @click="showMobileExportPopup = true"
              >
                📤 Export & Share
              </button>
            </div>
          </div>
        
        <!-- All controls inline -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Copies Control -->
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded p-1">
              <input
                v-model.number="totalCopies"
                type="number"
                min="1"
                max="100"
                step="1"
                class="w-10 h-6 text-[11px] text-center bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                title="Number of copies to generate"
                @input="validateCopiesInput"
                @blur="validateCopiesInput"
              />
              <div class="text-[10px] text-slate-500 dark:text-slate-400">
                {{ currentPage }}/{{ totalCopies }}
              </div>
              <div class="flex items-center gap-1">
                <button
                  :disabled="currentPage <= 1"
                  class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Page"
                  @click="goToPreviousPage"
                >
                  <svg class="w-3 h-3 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  :disabled="currentPage >= totalCopies"
                  class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Page"
                  @click="goToNextPage"
                >
                  <svg class="w-3 h-3 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Undo/Redo Controls -->
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded p-1">
              <button
                :disabled="!canUndo"
                class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
                @click.stop="undo"
              >
                <svg class="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              
              <button
                :disabled="!canRedo"
                class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
                @click.stop="redo"
              >
                <svg class="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        
      </div>
        
      <!-- Desktop Layout (horizontal, spacious) -->
      <div v-if="windowWidth >= 768" class="flex items-center justify-between gap-3">
        <!-- Left side: Back button and Title -->
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <!-- Back Button -->
          <button
            class="hidden md:flex p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded transition-colors items-center justify-center"
            title="Go Back"
            @click="$router.push({ name: 'Invoice', query: $route.query })"
          >
            <svg class="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="min-w-0 flex-1">
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">Invoice Preview</h1>
          </div>
        </div>
          
       
          
          <!-- Right side: Navigation, Export/Save Dropdown and Share buttons -->
          <div class="flex gap-1.5">
            <!-- Navigation Buttons -->
            <button
              class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-medium transition-colors"
              title="Save current invoice"
              @click="showSaveDialog"
            >
              💾 Save
            </button>
            
            <button
              class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-medium transition-colors"
              title="Create new invoice"
              @click="createNewInvoice"
            >
              ➕ New
            </button>
            
            <!-- Export/Save Dropdown -->
            <div class="relative">
              <button
                class="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                :disabled="isExporting"
                @click="showDesktopExportPopup = true"
              >
                📤 Export & Share
              </button>
            </div>
            
   <!-- Center: Controls -->
          <div class="flex items-center gap-3">
            <!-- Copies Control -->
            <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 rounded p-1.5">
              <span class="text-xs font-medium text-slate-700 dark:text-slate-300 px-1">Copies:</span>
              <input
                v-model.number="totalCopies"
                type="number"
                min="1"
                max="100"
                step="1"
                class="w-14 h-7 text-xs text-center bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                title="Number of copies to generate"
                @input="validateCopiesInput"
                @blur="validateCopiesInput"
              />
              <div class="text-[10px] text-slate-500 dark:text-slate-400 px-1">
                {{ currentPage }}/{{ totalCopies }}
              </div>
              <div class="flex items-center gap-1 ml-1">
                <button
                  :disabled="currentPage <= 1"
                  class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Page"
                  @click="goToPreviousPage"
                >
                  <svg class="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  :disabled="currentPage >= totalCopies"
                  class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Page"
                  @click="goToNextPage"
                >
                  <svg class="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Undo/Redo Controls -->
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded p-1.5">
              <button
                :disabled="!canUndo"
                class="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
                @click.stop="undo"
              >
                <svg class="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              
              <button
                :disabled="!canRedo"
                class="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
                @click.stop="redo"
              >
                <svg class="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                </svg>
              </button>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Filename Customization Modal -->
    <div v-if="showFilenameModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Customize Export Name</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            File Name:
          </label>
          <input 
            v-model="customFilename"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="Enter filename"
            @keydown.enter="confirmExport"
          />
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Extension will be added automatically (.pdf or .jpg)
          </p>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Export Type:
          </label>
          <div class="text-sm text-slate-600 dark:text-slate-400">
            {{ pendingExportType === 'pdf-current' ? '📄 PDF - Current Page' : 
               pendingExportType === 'pdf-all' ? '📄 PDF - All Pages' :
               pendingExportType === 'jpeg-current' ? '🖼️ JPEG - Current Page' :
               pendingExportType === 'jpeg-all' ? '🖼️ JPEG - All Pages' : 'Unknown' }}
          </div>
        </div>
        
        <div class="flex gap-3 justify-end">
          <button 
            class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            @click="cancelExport"
          >
            Cancel
          </button>
          <button 
            class="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white rounded-md transition-colors disabled:cursor-not-allowed"
            :disabled="!customFilename.trim()"
            @click="confirmExport"
          >
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Export/Save Popup Modal -->
    <div v-if="showMobileExportPopup || showDesktopExportPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closeMobileExportPopup(); closeDesktopExportPopup()">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" @click.stop>
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Export & Share</h3>
          <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" @click="closeMobileExportPopup(); closeDesktopExportPopup()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="p-4 space-y-4">
          <!-- Export Options -->
          <div>
            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Download</div>
            <div class="grid grid-cols-2 gap-2">
              <button
                class="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600 group text-left"
                :disabled="isExporting"
                @click="showFilenameDialog(totalCopies > 1 ? 'pdf-all' : 'pdf-current'); closeMobileExportPopup(); closeDesktopExportPopup()"
              >
                <span class="text-xl group-hover:scale-110 transition-transform">📄</span>
                <div>
                  <div class="text-sm font-medium text-slate-700 dark:text-slate-200">PDF Document</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ totalCopies > 1 ? 'All pages' : 'Current page' }}</div>
                </div>
              </button>

              <button
                class="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600 group text-left"
                :disabled="isExporting"
                @click="handleExportJPEG(totalCopies > 1 ? 'all' : 'current'); closeMobileExportPopup(); closeDesktopExportPopup()"
              >
                <span class="text-xl group-hover:scale-110 transition-transform">💾</span>
                <div>
                  <div class="text-sm font-medium text-slate-700 dark:text-slate-200">Save as JPG</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400">Choose save location</div>
                </div>
              </button>
            </div>
          </div>

      
          <!-- Share -->
          <div>
            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Share</div>
            <button
              class="w-full flex items-center gap-3 p-2.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-700 group text-left"
              @click="shareToSocialMedia('share'); closeMobileExportPopup(); closeDesktopExportPopup()"
              title="Share invoice"
            >
              <span class="text-xl group-hover:scale-110 transition-transform">📤</span>
              <div>
                <div class="text-sm font-medium text-blue-700 dark:text-blue-300">Share Invoice</div>
                <div class="text-[10px] text-blue-600 dark:text-blue-400">Share with others</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>



    <!-- Text Picker Compact Horizontal Bar -->
    <div 
      v-if="isTextPickerMode && selectedElementIds.length > 0"
      class="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 rounded shadow-lg border border-cyan-500 dark:border-cyan-400 z-50 px-1.5 py-1"
      style="max-width: 95vw; width: auto;"
    >
      <div class="flex items-center gap-1.5">
        <!-- Font Family -->
        <div class="flex items-center gap-0.5">
          <label class="text-[9px] font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Font:</label>
          <select
            v-model="selectedElementStyles.fontFamily"
            class="px-1 py-0.5 text-[9px] border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200"
            style="min-width: 70px;"
            @change="syncFontSelections"
          >
            <!-- Modern Sans-Serif -->
            <option value="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Inter</option>
            <option value="Poppins, 'Segoe UI', Arial, sans-serif">Poppins</option>
            <option value="Open Sans, 'Segoe UI', Arial, sans-serif">Open Sans</option>
            <option value="Lato, 'Segoe UI', Arial, sans-serif">Lato</option>
            <option value="Montserrat, 'Segue UI', Arial, sans-serif">Montserrat</option>
            <!-- Classic Sans-Serif -->
            <option value="Arial, Helvetica, sans-serif">Arial</option>
            <option value="Helvetica, 'Helvetica Neue', Arial, sans-serif">Helvetica</option>
            <option value="Verdana, Geneva, sans-serif">Verdana</option>
            <!-- Serif -->
            <option value="Georgia, 'Times New Roman', Times, serif">Georgia</option>
            <option value="'Times New Roman', Times, serif">Times</option>
            <!-- Display & Impact -->
            <option value="Impact, 'Arial Black', 'Arial Bold', sans-serif">Impact</option>
            <option value="Oswald, Impact, 'Arial Black', sans-serif">Oswald</option>
            <option value="Anton, Impact, 'Arial Black', sans-serif">Anton</option>
            <!-- Monospace -->
            <option value="'Courier New', Courier, monospace">Courier</option>
          </select>
        </div>

        <!-- Divider -->
        <div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>

        <!-- Font Size -->
        <div class="flex items-center gap-0.5">
          <label class="text-[9px] font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Size:</label>
          <input
            v-model.number="selectedElementStyles.fontSize"
            type="number"
            min="6"
            max="48"
            class="w-8 px-0.5 py-0.5 text-[9px] text-center border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200"
          />
        </div>

        <!-- Divider -->
        <div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>

        <!-- Text Color -->
        <div class="flex items-center gap-0.5">
          <label class="text-[9px] font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Color:</label>
          <div class="flex gap-0.5">
            <button
              title="Cyan"
              :class="selectedElementStyles.cmykColor === 'cyan' ? 'ring-2 ring-cyan-400' : ''"
              class="w-4 h-4 bg-cyan-500 hover:bg-cyan-600 rounded border border-slate-300 dark:border-slate-600 transition-all"
              @click="selectedElementStyles.cmykColor = 'cyan'; applyQuickColor('cyan')"
            ></button>
            <button
              title="Magenta"
              :class="selectedElementStyles.cmykColor === 'magenta' ? 'ring-2 ring-cyan-400' : ''"
              class="w-4 h-4 bg-pink-500 hover:bg-pink-600 rounded border border-slate-300 dark:border-slate-600 transition-all"
              @click="selectedElementStyles.cmykColor = 'magenta'; applyQuickColor('magenta')"
            ></button>
            <button
              title="Yellow"
              :class="selectedElementStyles.cmykColor === 'yellow' ? 'ring-2 ring-cyan-400' : ''"
              class="w-4 h-4 bg-yellow-400 hover:bg-yellow-500 rounded border border-slate-300 dark:border-slate-600 transition-all"
              @click="selectedElementStyles.cmykColor = 'yellow'; applyQuickColor('yellow')"
            ></button>
            <button
              title="Black"
              :class="selectedElementStyles.cmykColor === 'black' ? 'ring-2 ring-cyan-400' : ''"
              class="w-4 h-4 bg-black hover:bg-slate-800 rounded border border-slate-300 dark:border-slate-600 transition-all"
              @click="selectedElementStyles.cmykColor = 'black'; applyQuickColor('black')"
            ></button>
          </div>
        </div>

        <!-- Divider -->
        <div class="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>

        <!-- Apply Button -->
        <button
          title="Apply changes"
          class="px-1.5 py-0.5 text-[9px] font-semibold bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-0.5"
          @click="selectedElementIds.length > 1 ? applyStylesToSelectedElements() : applySelectedElementStyles()"
        >
          <svg class="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Apply
        </button>

        <!-- Close Button -->
        <button
          title="Exit Text Picker (Esc)"
          class="px-1.5 py-0.5 text-[9px] font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-0.5"
          @click="toggleTextPickerMode"
        >
          <svg class="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit
        </button>
      </div>
    </div>

    <!-- Instruction hint when no selection -->
    <div 
      v-if="isTextPickerMode && selectedElementIds.length === 0"
      class="fixed top-20 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white px-2 py-0.5 rounded shadow-lg z-50 text-[9px] flex items-center gap-1"
    >
      <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      Click text • Ctrl+Click for multi-select
      <button
        title="Exit Text Picker (Esc)"
        class="ml-1 px-1.5 py-0.5 bg-white/20 hover:bg-white/30 rounded text-[9px] font-semibold transition-colors"
        @click="toggleTextPickerMode"
      >
        Exit
      </button>
    </div>

    <!-- Zoom Toggle Button -->
    <button
      v-if="!showZoomControl"
      @click.stop="showZoomControl = true"
      class="fixed right-4 top-[200px] md:top-28 z-40 p-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
      title="Show Zoom Controls"
    >
      <svg class="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
      </svg>
    </button>

    <!-- Floating Zoom Control - Volume Style -->
    <div
      v-if="showZoomControl"
      ref="zoomControlRef"
      class="fixed right-4 top-[200px] md:top-28 z-40 flex flex-col items-center gap-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 px-2 py-3 select-none"
      @click.stop
    >
      <!-- Plus -->
      <button
        :disabled="zoomLevel >= maxZoom"
        class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        title="Zoom In (+)"
        @click="zoomIn"
      >
        <svg class="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <!-- Slider Track -->
      <div
        ref="sliderTrackRef"
        class="relative w-1.5 h-24 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer touch-none"
        @touchstart.stop="handleSliderTouchStart"
        @touchmove.stop.prevent="handleSliderTouchMove"
        @touchend.stop="handleSliderTouchEnd"
        @mousedown.stop="handleSliderMouseDown"
        @mousemove.stop="handleSliderMouseMove"
      >
        <!-- Fill with bounce animation -->
        <div
          class="absolute bottom-0 w-full bg-blue-500 rounded-full transition-all duration-150 pointer-events-none"
          :class="{ 'scale-y-110': bounce }"
          :style="{ height: zoomPercent + '%' }"
        ></div>

        <!-- Thumb -->
        <div
          class="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-300 rounded-full shadow cursor-pointer transition-all pointer-events-none"
          :style="{ bottom: `calc(${zoomPercent}% - 8px)` }"
        ></div>
      </div>

      <!-- Percentage Display -->
      <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300 min-w-[32px] text-center">
        {{ Math.round(zoomLevel * 100) }}%
      </span>

      <!-- Minus -->
      <button
        :disabled="zoomLevel <= minZoom"
        class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        title="Zoom Out (-)"
        @click="zoomOut"
      >
        <svg class="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
        </svg>
      </button>
      
      <!-- Fit to Screen -->
      <button
        class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all active:scale-95 mt-0.5 border-t border-slate-200 dark:border-slate-600"
        title="Fit to Screen"
        @click="autoFitZoom"
      >
        <svg class="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
    </div>

    <!-- Invoice Preview Section - always visible on all screen sizes -->
    <section 
      ref="previewContainerRef"
      class="fixed top-[180px] md:top-[140px] left-0 right-0 overflow-auto py-4" 
      :style="{ 
        bottom: '60px', 
        zIndex: '10',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }"
    >
      <!-- Wrapper - maintains actual size, uses zoom controls only -->
      <div 
        ref="zoomWrapperRef"
        class="zoom-area" 
        :style="{ 
          transform: `scale(${zoomLevel})`, 
          transformOrigin: 'top center',
          padding: `${zoomLevel * 50}px 20px`,
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          width: 'fit-content',
          margin: '0 auto'
        }"
      >
        <InvoiceTemplate1
          v-if="selectedTemplate === 'template1'"
          ref="templateComponentRef"
          :invoice-width="invoiceWidth"
          :invoice-height="invoiceHeight"
          :base-font-size="baseFontSize"
          :organization-name-font-size="organizationNameFontSize"
          :organization-sub-font-size="organizationSubFontSize"
          :address-font-size="addressFontSize"
          :phone-font-size="phoneFontSize"
          :customer-details-font-size="customerDetailsFontSize"
          :table-header-font-size="tableHeaderFontSize"
          :table-row-height="tableRowHeight"
          :footer-font-size="footerFontSize"
          :signature-height="signatureHeight"
          :signature-image-height="signatureImageHeight"
          :dynamic-padding="dynamicPadding"
          :dynamic-spacing="dynamicSpacing"
          :amount-column-width="amountColumnWidth"
          :kobo-column-width="koboColumnWidth"
          :kobo-total-width="koboTotalWidth"
          :total-box-width="totalBoxWidth"
          :total-box-min-width="totalBoxMinWidth"
          :enable-text-background="enableTextBackground"
          :watermark-visible="watermarkVisible"
          :watermark-type="watermarkType"
          :watermark-opacity="watermarkOpacity"
          :logo-data-url="logoDataUrl"
          :logo-height="logoHeight"
          :organization-name="organizationName"
          :organization-sub-name="organizationSubName"
          :organization-receipt-sub-name="organizationReceiptSubName"
          :head-office-address="headOfficeAddress"
          :head-office-phone="headOfficePhone"
          :show-page-numbers="showPageNumbers"
          :current-invoice-number="currentInvoiceNumber"
          :auto-date="autoDate"
          :items="items"
          :invoice-data="invoiceData"
          :max-items="MAX_ITEMS"
          :total-naira="totalNaira"
          :total-kobo="totalKobo"
          :cmyk-colors="cmykColors"
          :color-styles="colorStyles"
          :signature-image1="signatureImage1"
          :signature-image2="signatureImage2"
          v-model:customer-name="customerName"
          v-model:customer-address="customerAddress"
          v-model:customer-address2="customerAddress2"
          v-model:date="date"
          v-model:lpo="lpo"
          v-model:sum-of="sumOf"
          v-model:sum-of2="sumOf2"
          @save-invoice-data="saveInvoiceData"
          @add-item="addItem"
          @add-item-after="addItemAfter"
          @remove-item="removeItem"
          @sum-of-overflow="handleSumOfOverflow"
          @sum-of2-input="handleSumOf2Input"
          @logo-error="handleLogoError"
          @cell-edit="handleCellEdit"
        />
        <InvoiceTemplate2
          v-else-if="selectedTemplate === 'template2'"
          ref="templateComponentRef"
          :invoice-width="invoiceWidth"
          :invoice-height="invoiceHeight"
          :base-font-size="baseFontSize"
          :organization-name-font-size="organizationNameFontSize"
          :organization-sub-font-size="organizationSubFontSize"
          :address-font-size="addressFontSize"
          :phone-font-size="phoneFontSize"
          :customer-details-font-size="customerDetailsFontSize"
          :table-header-font-size="tableHeaderFontSize"
          :table-row-height="tableRowHeight"
          :footer-font-size="footerFontSize"
          :signature-height="signatureHeight"
          :signature-image-height="signatureImageHeight"
          :dynamic-padding="dynamicPadding"
          :dynamic-spacing="dynamicSpacing"
          :amount-column-width="amountColumnWidth"
          :kobo-column-width="koboColumnWidth"
          :kobo-total-width="koboTotalWidth"
          :total-box-width="totalBoxWidth"
          :total-box-min-width="totalBoxMinWidth"
          :enable-text-background="enableTextBackground"
          :watermark-visible="watermarkVisible"
          :watermark-type="watermarkType"
          :watermark-opacity="watermarkOpacity"
          :logo-data-url="logoDataUrl"
          :logo-height="logoHeight"
          :organization-name="organizationName"
          :organization-sub-name="organizationSubName"
          :organization-receipt-sub-name="organizationReceiptSubName"
          :head-office-address="headOfficeAddress"
          :head-office-phone="headOfficePhone"
          :show-page-numbers="showPageNumbers"
          :current-invoice-number="currentInvoiceNumber"
          :auto-date="autoDate"
          :items="items"
          :invoice-data="invoiceData"
          :max-items="MAX_ITEMS"
          :total-naira="totalNaira"
          :total-kobo="totalKobo"
          :cmyk-colors="cmykColors"
          :color-styles="colorStyles"
          :signature-image1="signatureImage1"
          :signature-image2="signatureImage2"
          v-model:customer-name="customerName"
          v-model:customer-address="customerAddress"
          v-model:customer-address2="customerAddress2"
          v-model:date="date"
          v-model:lpo="lpo"
          v-model:sum-of="sumOf"
          v-model:sum-of2="sumOf2"
          @save-invoice-data="saveInvoiceData"
          @add-item="addItem"
          @add-item-after="addItemAfter"
          @remove-item="removeItem"
          @sum-of-overflow="handleSumOfOverflow"
          @sum-of2-input="handleSumOf2Input"
          @logo-error="handleLogoError"
          @cell-edit="handleCellEdit"
        />
        <InvoiceTemplate3
          v-else
          ref="templateComponentRef"
          :invoice-width="invoiceWidth"
          :invoice-height="invoiceHeight"
          :base-font-size="baseFontSize"
          :organization-name-font-size="organizationNameFontSize"
          :organization-sub-font-size="organizationSubFontSize"
          :address-font-size="addressFontSize"
          :phone-font-size="phoneFontSize"
          :customer-details-font-size="customerDetailsFontSize"
          :table-header-font-size="tableHeaderFontSize"
          :table-row-height="tableRowHeight"
          :footer-font-size="footerFontSize"
          :signature-height="signatureHeight"
          :signature-image-height="signatureImageHeight"
          :dynamic-padding="dynamicPadding"
          :dynamic-spacing="dynamicSpacing"
          :amount-column-width="amountColumnWidth"
          :kobo-column-width="koboColumnWidth"
          :kobo-total-width="koboTotalWidth"
          :total-box-width="totalBoxWidth"
          :total-box-min-width="totalBoxMinWidth"
          :enable-text-background="enableTextBackground"
          :watermark-visible="watermarkVisible"
          :watermark-type="watermarkType"
          :watermark-opacity="watermarkOpacity"
          :logo-data-url="logoDataUrl"
          :logo-height="logoHeight"
          :organization-name="organizationName"
          :organization-sub-name="organizationSubName"
          :organization-receipt-sub-name="organizationReceiptSubName"
          :head-office-address="headOfficeAddress"
          :head-office-phone="headOfficePhone"
          :show-page-numbers="showPageNumbers"
          :current-invoice-number="currentInvoiceNumber"
          :auto-date="autoDate"
          :items="items"
          :invoice-data="invoiceData"
          :max-items="MAX_ITEMS"
          :total-naira="totalNaira"
          :total-kobo="totalKobo"
          :cmyk-colors="cmykColors"
          :color-styles="colorStyles"
          :signature-image1="signatureImage1"
          :signature-image2="signatureImage2"
          v-model:customer-name="customerName"
          v-model:customer-address="customerAddress"
          v-model:customer-address2="customerAddress2"
          v-model:date="date"
          v-model:lpo="lpo"
          v-model:sum-of="sumOf"
          v-model:sum-of2="sumOf2"
          @save-invoice-data="saveInvoiceData"
          @add-item="addItem"
          @add-item-after="addItemAfter"
          @remove-item="removeItem"
          @sum-of-overflow="handleSumOfOverflow"
          @sum-of2-input="handleSumOf2Input"
          @logo-error="handleLogoError"
          @cell-edit="handleCellEdit"
        />
<!-- End of InvoiceTemplate -->
</div>
<!-- End of wrapper -->
</section>
<!-- End of Invoice Preview Section -->
</div>
<!-- End of Main Content v-else -->
</div>
<!-- End of fixed inset bg div -->

<!-- Save Invoice Modal -->
<Teleport to="body">
<div v-if="showSaveModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <!-- Background overlay -->
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="cancelSave"></div>

    <!-- Modal panel -->
    <div class="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div class="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
              Save Invoice
            </h3>
            <div class="mt-4">
              <label for="invoice-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invoice Name
              </label>
              <input
                id="invoice-name"
                v-model="invoiceName"
                type="text"
                placeholder="Enter invoice name..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                @keydown.enter="saveInvoice"
                @keydown.escape="cancelSave"
              />
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Give your invoice a memorable name for easy identification.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          :disabled="isSaving"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          @click="saveInvoice"
        >
          <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSaving ? 'Saving...' : 'Save Invoice' }}
        </button>
        <button
          type="button"
          :disabled="isSaving"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-600 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          @click="cancelSave"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
</Teleport>

</template>

<script>
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, onUnmounted, watch, nextTick, Transition } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import html2pdf from 'html2pdf.js';
import * as htmlToImage from 'html-to-image';
import { getAllSignatures, logActivity } from '../../api-service';
import { safeLocalStorage } from '@/utils/storage.utils.js';
import { withFirebaseErrorHandling } from '@/utils/firebase-error-handler.js';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import InvoiceTemplate1 from '../../components/templates/InvoiceTemplate1.vue';
import InvoiceTemplate2 from '../../components/templates/InvoiceTemplate2.vue';
import InvoiceTemplate3 from '../../components/templates/InvoiceTemplate3.vue';

export default defineComponent({
  name: 'InvoicePreviewPage',
  components: {
    Transition,
    InvoiceTemplate1,
    InvoiceTemplate2,
    InvoiceTemplate3,
  },
  props: {
    branch: {
      type: String,
      default: 'Main Branch'
    }
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const templateComponentRef = ref(null);
    const invoiceRef = ref(null);
    const contentWrapperRef = ref(null);
    const previewContainerRef = ref(null);
    const zoomWrapperRef = ref(null);
    const exportDropdownRef = ref(null);
    const mobileExportDropdownRef = ref(null);
    const desktopExportDropdownRef = ref(null);
    const mobileShareDropdownRef = ref(null);
    const desktopShareDropdownRef = ref(null);
    const isExporting = ref(false);
    const showExportOptions = ref(false);
    // New popup variables
    const showMobileExportPopup = ref(false);
    const showDesktopExportPopup = ref(false);
    
    // Save invoice modal state
    const showSaveModal = ref(false);
    const invoiceName = ref('');
    const isSaving = ref(false);
    
    // Window width for responsive behavior
    const windowWidth = ref(window.innerWidth);
    const windowHeight = ref(window.innerHeight);
    
    // Viewport fitting system
    const autoFitEnabled = ref(true);
    const containerDimensions = ref({ width: 0, height: 0 });
    
    // Update window dimensions on resize
    const updateWindowDimensions = () => {
      windowWidth.value = window.innerWidth;
      windowHeight.value = window.innerHeight;
      updateContainerDimensions();
    };
    
    const updateContainerDimensions = () => {
      if (previewContainerRef.value) {
        const rect = previewContainerRef.value.getBoundingClientRect();
        containerDimensions.value = {
          width: rect.width,
          height: rect.height
        };
      }
    };
    
    // Pinch-to-zoom gesture variables
    let initialDistance = 0;
    let initialZoom = 1;
    
    // Calculate distance between two touch points
    const getDistance = (touch1, touch2) => {
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    
    // Handle pinch gesture start
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
        startZoom = zoomLevel.value;
      } else if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        initialZoom = zoomLevel.value;
      }
    };
    
    // Handle pinch gesture move
    const handleTouchMove = (e) => {
      if (e.touches.length === 1) {
        // One-finger vertical drag zoom
        updateZoomOrigin(e);
        
        const deltaY = startY - e.touches[0].clientY;
        const sensitivity = 0.005;
        
        zoomLevel.value = Math.min(
          maxZoom,
          Math.max(minZoom, startZoom + deltaY * sensitivity)
        );
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;
        const newZoom = initialZoom * scale;
        
        // Clamp zoom between min and max
        zoomLevel.value = Math.max(minZoom, Math.min(maxZoom, newZoom));
      }
    };
    
    // Handle pinch gesture end
    const handleTouchEnd = (e) => {
      if (e.touches.length === 0) {
        startY = 0;
        startZoom = 1;
        initialDistance = 0;
        initialZoom = 1;
      } else if (e.touches.length < 2) {
        initialDistance = 0;
        initialZoom = zoomLevel.value;
      }
    };
    
    onMounted(() => {
      window.addEventListener('resize', updateWindowDimensions);
      document.addEventListener('mouseup', handleSliderMouseUp);
      
      // Add pinch-to-zoom gesture listeners
      if (zoomWrapperRef.value) {
        zoomWrapperRef.value.addEventListener('touchstart', handleTouchStart, { passive: false });
        zoomWrapperRef.value.addEventListener('touchmove', handleTouchMove, { passive: false });
        zoomWrapperRef.value.addEventListener('touchend', handleTouchEnd, { passive: false });
        console.log('✅ Pinch-to-zoom gestures enabled');
      }
      
      // Initial dimension update
      updateWindowDimensions();
      nextTick(() => {
        updateContainerDimensions();
      });
      
      // Add click-outside listener for zoom control
      document.addEventListener('click', (event) => {
        if (showZoomControl.value && zoomControlRef.value && !zoomControlRef.value.contains(event.target)) {
          showZoomControl.value = false;
        }
      });
      
      // Initialize history with current state after data is loaded
      nextTick(() => {
        saveState();
        console.log('📝 Initial state saved to history');
      });
    });
    
    // Debounced quick save function for settings changes - declare before onUnmounted
    let saveQuickSettingsTimeout = null;
    
    onUnmounted(() => {
      window.removeEventListener('resize', updateWindowDimensions);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('mouseup', handleSliderMouseUp);
      document.removeEventListener('keydown', handleKeydown);
      
      // Remove pinch-to-zoom gesture listeners
      if (zoomWrapperRef.value) {
        zoomWrapperRef.value.removeEventListener('touchstart', handleTouchStart);
        zoomWrapperRef.value.removeEventListener('touchmove', handleTouchMove);
        zoomWrapperRef.value.removeEventListener('touchend', handleTouchEnd);
      }
      
      // Clear any pending save timeouts to prevent memory leaks
      if (saveQuickSettingsTimeout) {
        clearTimeout(saveQuickSettingsTimeout);
        saveQuickSettingsTimeout = null;
      }
    });
    
    // Filename customization modal
    const showFilenameModal = ref(false);
    const customFilename = ref('');
    const pendingExportType = ref('');
    
    // Panel visibility - open by default
    const showSettings = ref(false);
    const selectedCMYKColor = ref(null);

    // CMYK Color palette function
    const applyCMYKColor = (name, color) => {
      selectedCMYKColor.value = { 
        name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'), 
        values: color 
      };
      
      // Copy CMYK values to clipboard
      const cmykString = `C:${color.c} M:${color.m} Y:${color.y} K:${color.k}`;
      navigator.clipboard.writeText(cmykString).then(() => {
        console.log(`🎨 CMYK color copied: ${cmykString}`);
      }).catch(err => {
        console.log('📋 Fallback: CMYK values displayed');
      });
      
      // Clear selection after 3 seconds
      setTimeout(() => {
        selectedCMYKColor.value = null;
      }, 3000);
    };
    const settingsPanelHeight = ref(300); // Default smaller height
    const isDragging = ref(false);
    const dragStartY = ref(0);
    const dragStartHeight = ref(0);

    // Error handling
    const hasError = ref(false);
    const errorMessage = ref('');
    const errorDetails = ref('');

    // Safe localStorage utilities
    const safeParseJSON = (data, fallback = {}) => {
      try {
        if (!data || data === 'null' || data === 'undefined' || data === '[object Object]') {
          return fallback;
        }
        return JSON.parse(data);
      } catch (error) {
        console.error('JSON parse error for data:', data, error);
        return fallback;
      }
    };



    const cleanupCorruptedLocalStorage = () => {
      try {
        const keysToCheck = ['invoicePreviewData', 'invoiceQuickSettings', 'sdp_authenticated_member'];
        let cleanedCount = 0;
        
        keysToCheck.forEach(key => {
          try {
            const data = localStorage.getItem(key);
            if (data && !safeParseJSON(data, null)) {
              console.warn(`Removing corrupted localStorage key: ${key}`);
              localStorage.removeItem(key);
              cleanedCount++;
            }
          } catch (error) {
            console.warn(`Error checking localStorage key ${key}:`, error);
            // If we can't read it, try to remove it
            try {
              localStorage.removeItem(key);
              cleanedCount++;
            } catch (removeError) {
              console.error(`Failed to remove corrupted key ${key}:`, removeError);
            }
          }
        });
        
        if (cleanedCount > 0) {
          // Cleaned up corrupted localStorage entries
        }
        
        // If storage is still problematic, clear more aggressively
        try {
          const testKey = '_storage_test_';
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
        } catch (error) {
          console.warn('localStorage still having issues, performing aggressive cleanup...');
          // Keep only essential data
          const essentialKeys = ['sdp_authenticated_member'];
          const backup = {};
          
          essentialKeys.forEach(key => {
            try {
              const value = localStorage.getItem(key);
              if (value) backup[key] = value;
            } catch (e) {
              // Ignore sessionStorage errors - fallback handled above
            }
          });
          
          // Clear everything
          try {
            localStorage.clear();
            // Restore essential data
            Object.entries(backup).forEach(([key, value]) => {
              try {
                safeLocalStorage.setItem(key, value);
              } catch (e) {
                console.warn(`Could not restore ${key}:`, e);
              }
            });
          } catch (clearError) {
            console.error('Failed to clear localStorage:', clearError);
          }
        }
      } catch (error) {
        console.error('Error during localStorage cleanup:', error);
      }
    };

    // Invoice data loaded from localStorage
    const invoiceData = ref({
      organizationName: '',
      organizationSubName: '',
      headOfficeAddress: '',
      headOfficePhone: '',
      branchAddress1: '',
      branch1Phone: '',
      branchAddress2: '',
      branch2Phone: '',
      logoDataUrl: '',
      invoiceNumber: '',
      invoiceDate: '',
      customerName: '',
      customerAddress: '',
      customerAddress2: '',
      lpo: '',
      items: [],
      taxEnabled: false,
      taxRate: 7.5,
      sumOf: '',
      sumOf2: ''
    });
    
    // Template selection - default to template1 (3-color), template2 = B&W, template3 = 2-color
    const selectedTemplate = ref('template1');
    
    // Size settings - Default to 5x8 inches
    const invoiceWidth = ref(5);
    const invoiceHeight = ref(8.5); // Default to 8.5 inches for 5x8.5 invoice
    const isMobile = ref(false);
    const mobileScale = ref(1);
    
    // Calculate effective zoom that includes auto-fitting (must be after invoiceWidth/Height)
    const effectiveZoomLevel = computed(() => {
      if (!autoFitEnabled.value || !containerDimensions.value.width || !containerDimensions.value.height) {
        return zoomLevel.value;
      }
      
      // Calculate the actual invoice dimensions in pixels (96 DPI)
      const invoicePxWidth = invoiceWidth.value * 96;
      const invoicePxHeight = invoiceHeight.value * 96;
      
      // Account for padding (0.5in total = 0.25in each side = 24px each side = 48px total)
      const totalInvoiceWidth = invoicePxWidth + 48;
      const totalInvoiceHeight = invoicePxHeight + 48;
      
      // Calculate scale factors for both dimensions
      const scaleX = (containerDimensions.value.width - 40) / totalInvoiceWidth; // -40px for extra margin
      const scaleY = (containerDimensions.value.height - 40) / totalInvoiceHeight; // -40px for extra margin
      
      // Use the smaller scale to ensure content fits in both dimensions
      const autoScale = Math.min(scaleX, scaleY, 1); // Never scale up beyond 100%
      
      // Combine auto-scale with manual zoom, but respect zoom limits
      const combinedScale = autoScale * zoomLevel.value;
      
      return Math.max(minZoom, Math.min(maxZoom, combinedScale));
    });
    
    // Watch for invoice dimension changes to update container fitting
    watch([invoiceWidth, invoiceHeight], () => {
      nextTick(() => {
        updateContainerDimensions();
      });
    });
    
    // Watch for minimum size enforcement
    watch(invoiceWidth, (newWidth) => {
      if (newWidth < 4.5) {
        invoiceWidth.value = 4.5;
      }
    });
    
    watch(invoiceHeight, (newHeight) => {
      if (newHeight < 6) {
        invoiceHeight.value = 6;
      }
    });
    
    // Text background watermark
    const enableTextBackground = ref(true); // Always enabled by default
    const watermarkType = ref('both'); // Always show both logo and organization name
    
    // Watermark CMYK color controls
    const watermarkCMYK = ref({
      c: 0,
      m: 0,
      y: 0,
      k: 90  // Default to 90% black for subtle watermark
    });
    
    // Watermark appearance controls
    const watermarkOpacity = ref(0.5); // Fixed at 50% opacity
    const watermarkFontSize = ref(6); // Default font size in px
    const watermarkVisible = ref(true); // Always visible
    
    // CMYK color definitions for common colors
    const cmykColors = {
      white: { c: 0, m: 0, y: 0, k: 0 },
      black: { c: 0, m: 0, y: 0, k: 100 },
      blue1: { c: 88, m: 73, y: 0, k: 3 }, // #1e40af equivalent
      blue2: { c: 76, m: 49, y: 0, k: 4 }, // #3b82f6 equivalent
      cyan: { c: 74, m: 0, y: 17, k: 0 }, // #00bcd4 equivalent
      pink: { c: 0, m: 75, y: 0, k: 0 }, // #ff4081 equivalent
      yellow: { c: 0, m: 8, y: 90, k: 0 }, // #ffeb3b equivalent
      lightGray: { c: 6, m: 4, y: 4, k: 6 }, // #e2e8f0 equivalent
      shadowGray: { c: 0, m: 0, y: 0, k: 90 }, // For shadows
      red: { c: 0, m: 91, y: 76, k: 6 }, // #ef4444 equivalent
      darkGray: { c: 0, m: 0, y: 0, k: 78 }, // #374151 equivalent
      darkGray2: { c: 0, m: 0, y: 0, k: 74 }, // #424242 equivalent
      mediumGray: { c: 0, m: 0, y: 0, k: 58 }, // #6b7280 equivalent
      lightBackground: { c: 3, m: 2, y: 2, k: 2 }, // #f9fafb equivalent
      darkMediumGray: { c: 0, m: 0, y: 0, k: 71 }, // #4b5563 equivalent
      borderGray: { c: 8, m: 5, y: 5, k: 8 } // #e5e7eb equivalent
    };
    
    // Zoom controls with advanced features
    const zoomLevel = ref(1);
    const bounce = ref(false);
    const zoomOrigin = ref({ x: 50, y: 50 });
    const zoomControlRef = ref(null);
    const sliderTrackRef = ref(null);
    const showZoomControl = ref(false);
    
    const minZoom = 0.3;
    const maxZoom = 1;
    const zoomStep = 0.1;
    const snapLevels = [0.5, 1, 1.5];
    
    // Zoom percentage for slider
    const zoomPercent = computed(() => {
      return ((zoomLevel.value - minZoom) / (maxZoom - minZoom)) * 100;
    });
    
    // Snap zoom magnetization
    const snapZoom = () => {
      const threshold = 0.03; // Reduced to allow easier escape from snap points
      
      for (const snap of snapLevels) {
        if (Math.abs(zoomLevel.value - snap) < threshold) {
          zoomLevel.value = snap;
          break;
        }
      }
    };
    
    // Watch zoom changes for bounce animation and snap
    watch(zoomLevel, () => {
      bounce.value = true;
      setTimeout(() => (bounce.value = false), 120);
      snapZoom();
    });
    
    const zoomIn = () => {
      if (zoomLevel.value < maxZoom) {
        zoomLevel.value = Math.min(maxZoom, +(zoomLevel.value + zoomStep).toFixed(2));
      }
    };
    
    const zoomOut = () => {
      if (zoomLevel.value > minZoom) {
        zoomLevel.value = Math.max(minZoom, +(zoomLevel.value - zoomStep).toFixed(2));
      }
    };
    
    const resetZoom = () => {
      zoomLevel.value = 1;
    };
    
    // Touch gesture variables for one-finger drag
    let startY = 0;
    let startZoom = 1;
    
    // Update zoom origin toward finger position
    const updateZoomOrigin = (e) => {
      if (!invoiceRef.value) return;
      
      const rect = invoiceRef.value.getBoundingClientRect();
      const touch = e.touches[0];
      
      zoomOrigin.value = {
        x: ((touch.clientX - rect.left) / rect.width) * 100,
        y: ((touch.clientY - rect.top) / rect.height) * 100
      };
    };
    
    // Slider touch and mouse handlers
    let isSliderDragging = false;
    
    const updateZoomFromSlider = (clientY) => {
      if (!sliderTrackRef.value) return;
      
      const rect = sliderTrackRef.value.getBoundingClientRect();
      const y = clientY - rect.top;
      const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height))); // Inverted and clamped
      
      // Convert percentage to zoom level
      const newZoom = minZoom + (percentage * (maxZoom - minZoom));
      zoomLevel.value = Math.max(minZoom, Math.min(maxZoom, newZoom));
    };
    
    const handleSliderTouchStart = (e) => {
      isSliderDragging = true;
      updateZoomFromSlider(e.touches[0].clientY);
    };
    
    const handleSliderTouchMove = (e) => {
      if (!isSliderDragging) return;
      updateZoomFromSlider(e.touches[0].clientY);
    };
    
    const handleSliderTouchEnd = () => {
      isSliderDragging = false;
    };
    
    // Mouse handlers for desktop
    const handleSliderMouseDown = (e) => {
      isSliderDragging = true;
      updateZoomFromSlider(e.clientY);
    };
    
    const handleSliderMouseMove = (e) => {
      if (!isSliderDragging) return;
      updateZoomFromSlider(e.clientY);
    };
    
    const handleSliderMouseUp = () => {
      isSliderDragging = false;
    };
    
    // Auto-fit zoom to show complete invoice on load
    const autoFitZoom = () => {
      nextTick(() => {
        // Find the correct container - prefer previewContainerRef first
        const container = previewContainerRef.value || 
                         document.querySelector('section.fixed.overflow-auto') || 
                         document.querySelector('section[class*="overflow-auto"]') ||
                         document.querySelector('.fixed.overflow-auto');
        
        if (!container) {
          console.warn('Container not found for auto-fit zoom');
          return;
        }
        
        if (container && invoiceWidth.value && invoiceHeight.value) {
          const containerWidth = container.clientWidth - 48; // padding (py-6 = 24px * 2)
          const containerHeight = container.clientHeight - 48; // padding
          const invoiceWidthPx = (invoiceWidth.value + 1) * 96; // convert inches to pixels (96 DPI) + 1 for padding
          const invoiceHeightPx = (invoiceHeight.value + 1) * 96; // + 1 for padding
          
          const scaleX = containerWidth / invoiceWidthPx;
          const scaleY = containerHeight / invoiceHeightPx;
          const optimalScale = Math.min(scaleX, scaleY) * 0.85; // 85% of container for better fit
          
          // Set to 50% zoom for auto-fit
          zoomLevel.value = 0.5;
          
          console.log('Auto-fit zoom:', {
            containerWidth,
            containerHeight,
            invoiceWidthPx,
            invoiceHeightPx,
            scaleX,
            scaleY,
            optimalScale,
            finalZoom: zoomLevel.value
          });
        } else {
          console.warn('Container not found for auto-fit zoom');
        }
      });
    };
    
    // Save invoice data to localStorage
    const saveInvoiceData = () => {
      try {
        const currentDataString = safeLocalStorage.getItem('invoicePreviewData');
        const currentData = currentDataString ? JSON.parse(currentDataString) : {};
        
        // Update the current page data with the latest invoice data
        if (!currentData.pages) {
          currentData.pages = {};
        }
        
        currentData.pages[currentPage.value] = {
          ...invoiceData.value,
          items: items.value
        };
        
        // Also update the main invoiceData in the root
        currentData.invoiceData = {
          ...invoiceData.value,
          items: items.value
        };
        
        safeLocalStorage.setItem('invoicePreviewData', JSON.stringify(currentData));
      } catch (error) {
        console.error('Error saving invoice data:', error);
      }
    };

    // Pagination navigation methods (with debounced save)
    const saveCurrentPage = () => {
      try {
        const currentDataString = safeLocalStorage.getItem('invoicePreviewData');
        const currentData = currentDataString ? JSON.parse(currentDataString) : {};
        currentData.currentPage = currentPage.value;
        safeLocalStorage.setItem('invoicePreviewData', JSON.stringify(currentData));
      } catch (error) {
        console.error('Error saving current page:', error);
      }
    };
    
    const goToPreviousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value = currentPage.value - 1;
        saveCurrentPage();
      }
    };
    
    const goToNextPage = () => {
      if (currentPage.value < totalCopies.value) {
        currentPage.value = currentPage.value + 1;
        saveCurrentPage();
      }
    };
    
    const goToPage = (pageNumber) => {
      const page = Math.max(1, Math.min(totalCopies.value, pageNumber));
      currentPage.value = page;
      saveCurrentPage();
    };
    
    // Export dropdown methods with better state management
    const toggleExportOptions = (event) => {
      // Prevent event from bubbling up
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      
      // Don't toggle if currently exporting
      if (isExporting.value) {
        return;
      }
      
      showExportOptions.value = !showExportOptions.value;
    };
    
    const closeExportOptions = () => {
      showExportOptions.value = false;
    };

    // Mobile Export/Save popup methods
    const closeMobileExportPopup = () => {
      showMobileExportPopup.value = false;
    };

    // Desktop Export/Save popup methods  
    const closeDesktopExportPopup = () => {
      showDesktopExportPopup.value = false;
    };

    // Mobile Share popup methods
    const closeMobileSharePopup = () => {
      showMobileSharePopup.value = false;
    };

    // Desktop Share popup methods
    const closeDesktopSharePopup = () => {
      showDesktopSharePopup.value = false;
    };

    // Helper function to download invoice image for sharing
    const downloadInvoiceImage = async () => {
      if (!invoiceRef.value) return null;
      
      try {
        // Use html2canvas with CORS handling for better compatibility
        const canvas = await html2canvas(invoiceRef.value, {
          scale: 2, // Higher resolution
          useCORS: false, // Disable CORS to avoid external CSS issues
          allowTaint: true, // Allow cross-origin images
          backgroundColor: '#ffffff',
          logging: false, // Reduce console noise
          ignoreElements: (element) => {
            // Skip elements that might cause CORS issues
            return element.tagName === 'SCRIPT' || 
                   element.classList.contains('no-capture');
          }
        });
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `invoice-${Date.now()}.jpg`;
        link.href = dataUrl;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return dataUrl;
      } catch (error) {
        console.error('Error generating invoice image:', error);
        return null;
      }
    };

    // Social media sharing functions with Capacitor support for APK
    const shareToSocialMedia = async (platform) => {
      if (!invoiceRef.value || isExporting.value) return;
      
      // Store original styles
      let originalTransform = '';
      let originalPosition = '';
      let originalLeft = '';
      let originalTop = '';
      let originalMargin = '';
      let originalWidth = '';
      let parentOriginalTransform = '';
      let parentOriginalWidth = '';
      let parentOriginalHeight = '';
      let parentOriginalMaxHeight = '';
      let orgOriginalStyles = {};
      
      try {
        isExporting.value = true;
        const shareText = `Check out this invoice from ${organizationName.value || 'SmartDesignPro'}`;
        
        // Get parent wrapper element
        const parentWrapper = invoiceRef.value.parentElement;
        
        // Store original styles from both invoice and parent
        originalTransform = invoiceRef.value.style.transform;
        originalPosition = invoiceRef.value.style.position;
        originalLeft = invoiceRef.value.style.left;
        originalTop = invoiceRef.value.style.top;
        originalMargin = invoiceRef.value.style.margin;
        originalWidth = invoiceRef.value.style.width;
        
        if (parentWrapper) {
          parentOriginalTransform = parentWrapper.style.transform;
          parentOriginalWidth = parentWrapper.style.width;
          parentOriginalHeight = parentWrapper.style.height;
          parentOriginalMaxHeight = parentWrapper.style.maxHeight;
          
          // Remove parent transform and constraints that affect positioning
          parentWrapper.style.transform = 'none';
          parentWrapper.style.width = 'auto';
          parentWrapper.style.height = 'auto';
          parentWrapper.style.maxHeight = 'none';
        }
        
        // Preserve organization name styles before export
        const orgElement = invoiceRef.value.querySelector('.organization-name');
        if (orgElement) {
          orgOriginalStyles = {
            fontFamily: orgElement.style.fontFamily || window.getComputedStyle(orgElement).fontFamily,
            fontWeight: orgElement.style.fontWeight || window.getComputedStyle(orgElement).fontWeight,
            fontSize: orgElement.style.fontSize || window.getComputedStyle(orgElement).fontSize,
            letterSpacing: orgElement.style.letterSpacing || window.getComputedStyle(orgElement).letterSpacing,
            textTransform: orgElement.style.textTransform || window.getComputedStyle(orgElement).textTransform
          };
        }
        
        // Temporarily apply print styles and fix position
        invoiceRef.value.style.transform = 'none';
        invoiceRef.value.style.position = 'relative';
        invoiceRef.value.style.left = '0';
        invoiceRef.value.style.top = '0';
        invoiceRef.value.style.margin = '0';
        invoiceRef.value.style.width = `${invoiceWidth.value}in`;
        
        // Force organization name font to ensure it stays consistent
        if (orgElement) {
          orgElement.style.fontFamily = 'Impact, "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif !important';
          orgElement.style.fontWeight = '900 !important';
          orgElement.style.fontStretch = 'condensed !important';
        }
        
        // Capture and lock table row heights before export
        const tableRows = invoiceRef.value.querySelectorAll('table tbody tr');
        const originalRowHeights = [];
        tableRows.forEach((row, index) => {
          const computedHeight = window.getComputedStyle(row).height;
          originalRowHeights[index] = { 
            element: row, 
            height: computedHeight,
            originalStyle: row.style.height 
          };
          row.style.height = computedHeight;
          row.style.minHeight = computedHeight;
          row.style.maxHeight = computedHeight;
          
          // Also lock cell heights and inner div heights
          const cells = row.querySelectorAll('td');
          cells.forEach(cell => {
            const cellStyles = window.getComputedStyle(cell);
            const cellHeight = cellStyles.height;
            const paddingTop = cellStyles.paddingTop;
            const paddingBottom = cellStyles.paddingBottom;
            
            cell.style.height = cellHeight;
            cell.style.minHeight = cellHeight;
            cell.style.maxHeight = cellHeight;
            cell.style.paddingTop = paddingTop;
            cell.style.paddingBottom = paddingBottom;
            cell.style.boxSizing = 'border-box';
            
            // Lock the height of print-only divs inside cells
            const printDivs = cell.querySelectorAll('.print-only');
            printDivs.forEach(div => {
              const divStyles = window.getComputedStyle(div);
              const divHeight = divStyles.height;
              div.style.height = divHeight;
              div.style.minHeight = divHeight;
              div.style.maxHeight = divHeight;
              div.style.lineHeight = divStyles.lineHeight;
              div.style.boxSizing = 'border-box';
            });
          });
        });
        
        // Wait for styles to apply and fonts to load
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Force font loading to prevent symbol rendering in exports
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
        
        // Additional delay for font rendering
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Generate HIGH-QUALITY invoice image using same settings as JPEG export
        const dataUrl = await htmlToImage.toJpeg(invoiceRef.value, { 
          quality: 0.98, 
          pixelRatio: 3,
          cacheBust: true,
          backgroundColor: cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k),
          skipFonts: true,
          fontEmbedCSS: '',
          allowTaint: true
        });
        
        // Check if running in Capacitor (APK) or web
        const isNative = Capacitor.isNativePlatform();
        
        if (isNative) {
          // For APK: Use Capacitor Filesystem and Share
          try {
            const fileName = `invoice-${currentInvoiceNumber.value.replace('/', '-')}-${Date.now()}.jpg`;
            // Remove data URL prefix for Capacitor Filesystem
            const base64 = dataUrl.split(',')[1];
            
            // Save to External storage for sharing
            const savedFile = await Filesystem.writeFile({
              path: fileName,
              data: base64,
              directory: Directory.External,
              recursive: true
            });
            
            console.log('✅ File saved for sharing:', savedFile.uri);
            
            // Share the image using Capacitor Share API
            await Share.share({
              title: shareText,
              text: shareText,
              url: savedFile.uri,
              dialogTitle: 'Share Invoice'
            });
            
            console.log('✅ Invoice shared successfully!');
            
          } catch (error) {
            console.error('Capacitor share error:', error);
            alert('❌ Failed to share invoice. Please try again or check app permissions.');
          }
        } else {
          // For Web/Desktop: Try Web Share API first
          if (navigator.share && navigator.canShare) {
            try {
              // Convert base64 to blob
              const blob = await (await fetch(dataUrl)).blob();
              const file = new File([blob], `invoice-${Date.now()}.jpg`, { type: 'image/jpeg' });
              
              const shareData = {
                title: shareText,
                text: shareText,
                files: [file]
              };
              
              if (navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return;
              }
            } catch (shareError) {
              console.log('Web Share API failed, falling back:', shareError);
            }
          }
          
          // Fallback: Download image
          const link = document.createElement('a');
          link.download = `invoice-${Date.now()}.jpg`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          alert('📸 Invoice image downloaded! You can share it manually.');
        }
        
      } catch (error) {
        console.error('Error sharing:', error);
        alert('❌ Sharing failed. Please try again.');
      } finally {
        // Restore all original styles including organization name
        if (invoiceRef.value) {
          invoiceRef.value.style.transform = originalTransform;
          invoiceRef.value.style.position = originalPosition;
          invoiceRef.value.style.left = originalLeft;
          invoiceRef.value.style.top = originalTop;
          invoiceRef.value.style.margin = originalMargin;
          invoiceRef.value.style.width = originalWidth;
          
          // Restore organization name styles
          const orgElement = invoiceRef.value.querySelector('.organization-name');
          if (orgElement && orgOriginalStyles) {
            orgElement.style.fontFamily = orgOriginalStyles.fontFamily || '';
            orgElement.style.fontWeight = orgOriginalStyles.fontWeight || '';
            orgElement.style.fontSize = orgOriginalStyles.fontSize || '';
            orgElement.style.letterSpacing = orgOriginalStyles.letterSpacing || '';
            orgElement.style.textTransform = orgOriginalStyles.textTransform || '';
          }
        }
        
        const parentWrapper = invoiceRef.value?.parentElement;
        if (parentWrapper) {
          parentWrapper.style.transform = parentOriginalTransform;
          parentWrapper.style.width = parentOriginalWidth;
          parentWrapper.style.height = parentOriginalHeight;
          parentWrapper.style.maxHeight = parentOriginalMaxHeight;
        }
        
        isExporting.value = false;
        closeMobileShareOptions();
        closeDesktopShareOptions();
      }
    };

    // Close mobile share options (alias for popup closing)
    const closeMobileShareOptions = () => {
      closeMobileExportPopup();
      closeDesktopExportPopup();
    };

    // Close desktop share options (alias for popup closing)
    const closeDesktopShareOptions = () => {
      closeMobileExportPopup();
      closeDesktopExportPopup();
    };

    const copyShareLink = async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('✅ Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('✅ Link copied to clipboard!');
      }
      
      // Close all share dropdowns
      closeMobileShareOptions();
      closeDesktopShareOptions();
    };
    
    // Filename customization methods
    const showFilenameDialog = (exportType) => {
      pendingExportType.value = exportType;
      
      // Generate default filename based on export type and invoice data
      const invoiceNum = currentInvoiceNumber.value.replace('/', '-') || 'Invoice';
      const customerNamePart = customerName.value ? `-${customerName.value.replace(/[^a-zA-Z0-9]/g, '')}` : '';
      
      let defaultName = '';
      
      if (exportType === 'pdf-current') {
        defaultName = `${invoiceNum}${customerNamePart}`;
      } else if (exportType === 'pdf-all') {
        defaultName = `${invoiceNum}-All-Pages-${totalCopies.value}-copies`;
      } else if (exportType === 'jpeg-current') {
        defaultName = `${invoiceNum}${customerNamePart}-Image`;
      } else if (exportType === 'jpeg-all') {
        defaultName = `${invoiceNum}-All-Images-${totalCopies.value}-copies`;
      }
      
      customFilename.value = defaultName;
      showFilenameModal.value = true;
    };
    
    const cancelExport = () => {
      showFilenameModal.value = false;
      customFilename.value = '';
      pendingExportType.value = '';
    };
    
    const confirmExport = async () => {
      if (!customFilename.value.trim()) return;
      
      const filename = customFilename.value.trim();
      showFilenameModal.value = false;
      
      // Execute the export based on the pending type
      try {
        if (pendingExportType.value === 'pdf-current') {
          await handleExportPDF('current', filename);
        } else if (pendingExportType.value === 'pdf-all') {
          await handleExportPDF('all', filename);
        } else if (pendingExportType.value === 'jpeg-current') {
          await handleExportJPEG('current', filename);
        } else if (pendingExportType.value === 'jpeg-all') {
          await handleExportJPEG('all', filename);
        }
      } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
      } finally {
        customFilename.value = '';
        pendingExportType.value = '';
      }
    };
    
    // Click outside handler for remaining dropdowns
    const handleClickOutside = (event) => {
      // Check if the click target exists and is in the DOM
      if (!event.target || !document.contains(event.target)) return;
      
      // Handle original export dropdown  
      if (showExportOptions.value && exportDropdownRef.value && !exportDropdownRef.value.contains(event.target)) {
        const dropdownMenu = document.querySelector('[style*="z-index: 9999"]');
        if (!dropdownMenu || !dropdownMenu.contains(event.target)) {
          closeExportOptions();
        }
      }
      
      // Note: Popup modals handle their own backdrop clicks
    };
    
    // Input validation methods
    const validateCopiesInput = () => {
      const value = parseInt(totalCopies.value);
      if (isNaN(value) || value < 1) {
        totalCopies.value = 1;
      } else if (value > 100) {
        totalCopies.value = 100;
      } else {
        totalCopies.value = value;
      }
    };
    
    // Color settings for CMYK exports
    const colorMode = ref('full-color');
    const customColor1CMYK = ref({ c: 0, m: 0, y: 0, k: 100 });
    const customColor2CMYK = ref({ c: 100, m: 50, y: 0, k: 0 });
    const customColor3CMYK = ref({ c: 50, m: 0, y: 100, k: 0 });
    
    // Undo/Redo functionality
    const history = ref([]);
    const historyIndex = ref(-1);
    const maxHistorySize = ref(50); // Limit history to prevent memory issues
    const isRestoring = ref(false); // Flag to prevent watchers during restoration
    
    const canUndo = computed(() => historyIndex.value > 0);
    const canRedo = computed(() => historyIndex.value < history.value.length - 1);
    
    // Force initial state save after all components are ready
    setTimeout(() => {
      saveState();
      console.log('✅ Initial undo/redo state saved. History:', history.value.length, 'CanUndo:', canUndo.value);
    }, 1000);

    // Font selection variables
    const selectedFont = ref('Impact, \'Arial Black\', \'Arial Bold\', sans-serif');
    const baseFontSize = ref(12);
    const fontSizePresets = ref([
      { name: 'Small', size: 10 },
      { name: 'Normal', size: 12 },
      { name: 'Medium', size: 14 },
      { name: 'Large', size: 16 }
    ]);

    // Save current state to history
    const saveState = () => {
      // Don't save state during restoration
      if (isRestoring.value) return;
      
      const currentState = {
        organizationName: organizationName.value,
        organizationSubName: organizationSubName.value,
        organizationReceiptSubName: organizationReceiptSubName.value,
        headOfficeAddress: headOfficeAddress.value,
        headOfficePhone: headOfficePhone.value,
        branchAddress1: branchAddress1.value,
        branch1Phone: branch1Phone.value,
        branchAddress2: branchAddress2.value,
        branch2Phone: branch2Phone.value,
        logoDataUrl: logoDataUrl.value,
        receiptNumber: receiptNumber.value,
        date: date.value,
        customerName: customerName.value,
        customerAddress: customerAddress.value,
        customerAddress2: customerAddress2.value,
        lpo: lpo.value,
        items: JSON.parse(JSON.stringify(items.value)), // Deep copy
        sumOf: sumOf.value,
        sumOf2: sumOf2.value,
        // Store entire current page data for complete restoration
        currentPageData: JSON.parse(JSON.stringify(pageData.value[currentPage.value] || {})),
        colorMode: colorMode.value,
        customColor1CMYK: { ...customColor1CMYK.value },
        customColor2CMYK: { ...customColor2CMYK.value },
        customColor3CMYK: { ...customColor3CMYK.value },
        selectedFont: selectedFont.value,
        baseFontSize: baseFontSize.value,
        invoiceWidth: invoiceWidth.value,
        invoiceHeight: invoiceHeight.value,
        elementStyles: JSON.parse(JSON.stringify(elementStyles.value || {}))
      };
      
      // Check if state is different from current history state
      if (history.value.length > 0 && historyIndex.value >= 0) {
        const lastState = history.value[historyIndex.value];
        if (JSON.stringify(lastState) === JSON.stringify(currentState)) {
          return; // Skip saving duplicate state
        }
      }
      
      // Remove future history if we're not at the end
      if (historyIndex.value < history.value.length - 1) {
        history.value = history.value.slice(0, historyIndex.value + 1);
      }
      
      // Add new state
      history.value.push(currentState);
      historyIndex.value = history.value.length - 1;
      
      // Limit history size
      if (history.value.length > maxHistorySize.value) {
        history.value.shift();
        historyIndex.value--;
      }
      
      console.log('📝 State saved. History size:', history.value.length, 'Index:', historyIndex.value);
    };

    // Undo function
    const undo = () => {
      if (!canUndo.value) return;
      
      console.log('⬅️ Undo - Going to history index:', historyIndex.value - 1);
      historyIndex.value--;
      const state = history.value[historyIndex.value];
      isRestoring.value = true;
      restoreState(state);
      nextTick(() => {
        isRestoring.value = false;
      });
    };

    // Redo function
    const redo = () => {
      if (!canRedo.value) return;
      
      console.log('➡️ Redo - Going to history index:', historyIndex.value + 1);
      historyIndex.value++;
      const state = history.value[historyIndex.value];
      isRestoring.value = true;
      restoreState(state);
      nextTick(() => {
        isRestoring.value = false;
      });
    };

    // Restore state function
    const restoreState = (state) => {
      console.log('🔄 Restoring state:', state);
      
      organizationName.value = state.organizationName;
      organizationSubName.value = state.organizationSubName;
      organizationReceiptSubName.value = state.organizationReceiptSubName || 'Minna and District Society';
      headOfficeAddress.value = state.headOfficeAddress;
      headOfficePhone.value = state.headOfficePhone;
      branchAddress1.value = state.branchAddress1;
      branch1Phone.value = state.branch1Phone;
      branchAddress2.value = state.branchAddress2;
      branch2Phone.value = state.branch2Phone;
      logoDataUrl.value = state.logoDataUrl;
      receiptNumber.value = state.receiptNumber;
      date.value = state.date;
      customerName.value = state.customerName;
      customerAddress.value = state.customerAddress;
      lpo.value = state.lpo;
      
      // If we have complete page data, restore it directly
      if (state.currentPageData) {
        pageData.value[currentPage.value] = JSON.parse(JSON.stringify(state.currentPageData));
      }
      
      // Always ensure 12 items when restoring state
      const stateItems = state.items || [];
      const paddedItems = [];
      for (let i = 0; i < 12; i++) {
        if (i < stateItems.length && stateItems[i]) {
          paddedItems.push({
            id: i + 1,
            quantity: stateItems[i].quantity || 0,
            description: stateItems[i].description || '',
            price: stateItems[i].price || 0,
            tax: stateItems[i].tax || 0
          });
        } else {
          paddedItems.push({
            id: i + 1,
            quantity: 0,
            description: '',
            price: 0,
            tax: 0
          });
        }
      }
      items.value = paddedItems;
      
      sumOf.value = state.sumOf;
      sumOf2.value = state.sumOf2;
      colorMode.value = state.colorMode;
      customColor1CMYK.value = { ...state.customColor1CMYK };
      customColor2CMYK.value = { ...state.customColor2CMYK };
      customColor3CMYK.value = { ...state.customColor3CMYK || { c: 50, m: 0, y: 100, k: 0 } };
      selectedFont.value = state.selectedFont;
      baseFontSize.value = state.baseFontSize;
      invoiceWidth.value = state.invoiceWidth;
      invoiceHeight.value = state.invoiceHeight;
      elementStyles.value = JSON.parse(JSON.stringify(state.elementStyles || {}));
      
      // Re-apply styles after restoration
      nextTick(() => {
        applyAllSavedStyles();
      });
      
      console.log('✅ State restored successfully');
    };

    // Keyboard shortcuts for undo/redo and text picker
    const handleKeydown = (event) => {
      // Escape key to close text picker
      if (event.key === 'Escape' && isTextPickerMode.value) {
        event.preventDefault();
        toggleTextPickerMode();
        return;
      }
      
      // Undo/Redo shortcuts
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          redo();
        }
      }
    };

    // Text picker variables
    const isTextPickerMode = ref(false);
    const selectedTextElement = ref(null);
    const selectedElementId = ref('');
    const selectedElementStyles = ref({
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 12,
      cmykColor: 'black'
    });

    // Store individual element styles
    const elementStyles = ref({});

    // Multiple selection variables
    const selectedTextElements = ref([]); // Array of selected elements
    const selectedElementIds = ref([]); // Array of selected element IDs
    const isMultiSelectMode = ref(false); // Toggle for multi-select mode
    const groupStyles = ref({
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 12,
      cmykColor: 'black'
    });

    // Auto font adjustment variables
    const autoAdjustedElements = ref(new Set());
    const slimFonts = [
      'Arial Narrow, sans-serif',
      'Helvetica Narrow, sans-serif', 
      'Roboto Condensed, sans-serif',
      'Open Sans Condensed, sans-serif',
      'PT Sans Narrow, sans-serif',
      'Source Sans Pro, sans-serif'
    ];
    
    const originalElementStyles = ref({}); // Store original styles before auto-adjustment
    
  // Preview toggle for mobile (default true so preview is visible on all screen sizes)
  const showPreview = ref(true);
    
    // Page/Copies management
    const totalCopies = ref(1);
    const currentPage = ref(1);
    const showPageNumbers = ref(false);
    const showGrandTotal = ref(true);
    
    // Per-page data storage - each page can have different data
    const pageData = ref({});
    
    // Global/shared fields (same for all pages)
    const logoDataUrl = ref('');
    const organizationName = ref('');
    const organizationSubName = ref('Established by Act of Parliament No. 15 of (1965)');
    const organizationReceiptSubName = ref('Minna and District Society');
    const businessNumber = ref('BN123456789');
    const headOfficeAddress = ref('Federal University of Technology, Bosso Campus, Minna, Niger State, Nigeria');
    const headOfficePhone = ref('+234-814-619-820');
    const branchAddress1 = ref('');
    const branch1Phone = ref('');
    const branchAddress2 = ref('');
    const branch2Phone = ref('');
    const additionalBranches = ref([]);
    const receiptNumber = ref(1);
    const autoReceiptNumber = ref(true);
    const autoDate = ref(true);
    
    // Initialize default page data structure
    const createDefaultPageData = () => ({
      customerName: '',
      customerAddress: '',
      customerAddress2: '',
      date: '', // Empty by default
      lpo: '',
      sumOf: '',
      sumOf2: '',
      signatureImage1: '',
      signatureImage2: '',
      selectedSignature1: '',
      selectedSignature2: '',
      items: [
        { id: 1, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 2, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 3, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 4, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 5, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 6, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 7, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 8, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 9, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 10, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 11, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 12, quantity: 0, description: '', price: 0, tax: 0 }
      ]
    });
    
    // Initialize page data for current page
    const ensurePageData = (pageNum) => {
      if (!pageData.value[pageNum]) {
        pageData.value[pageNum] = createDefaultPageData();
      }
    };
    
    // Computed properties for current page data
    const customerName = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.customerName || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].customerName = value;
      }
    });
    
    const customerAddress = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.customerAddress || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].customerAddress = value;
      }
    });
    
    const customerAddress2 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.customerAddress2 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].customerAddress2 = value;
      }
    });
    
    const date = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.date || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].date = value;
      }
    });
    
    const lpo = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.lpo || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].lpo = value;
      }
    });
    
    // Helper function to get item amount including tax
    const getItemAmount = (item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const baseAmount = quantity * price;
      
      // Add tax if enabled
      if (invoiceData.value.taxEnabled) {
        const taxAmount = baseAmount * ((item.tax || 0) / 100);
        return baseAmount + taxAmount;
      }
      return baseAmount;
    };
    
    // Calculate grand total
    const grandTotal = computed(() => {
      return items.value.reduce((sum, item) => {
        if (item.description && item.description.trim()) {
          return sum + getItemAmount(item);
        }
        return sum;
      }, 0);
    });

    // Convert number to words for Nigerian Naira
    const numberToWords = (num) => {
      if (num === 0) return 'Zero';
      
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
      
      const convertHundreds = (n) => {
        let result = '';
        if (n >= 100) {
          result += ones[Math.floor(n / 100)] + ' Hundred ';
          n %= 100;
        }
        if (n >= 20) {
          result += tens[Math.floor(n / 10)] + ' ';
          n %= 10;
        } else if (n >= 10) {
          result += teens[n - 10] + ' ';
          n = 0;
        }
        if (n > 0) {
          result += ones[n] + ' ';
        }
        return result.trim();
      };
      
      const naira = Math.floor(num);
      const kobo = Math.round((num - naira) * 100);
      
      let result = '';
      let scaleIndex = 0;
      let tempNum = naira;
      
      if (tempNum === 0) {
        result = 'Zero';
      } else {
        const parts = [];
        while (tempNum > 0) {
          const chunk = tempNum % 1000;
          if (chunk !== 0) {
            const chunkWords = convertHundreds(chunk);
            if (scales[scaleIndex]) {
              parts.unshift(chunkWords + ' ' + scales[scaleIndex]);
            } else {
              parts.unshift(chunkWords);
            }
          }
          tempNum = Math.floor(tempNum / 1000);
          scaleIndex++;
        }
        result = parts.join(' ');
      }
      
      if (kobo > 0) {
        result += ' Naira, ' + convertHundreds(kobo) + ' Kobo';
      } else {
        result += ' Naira';
      }
      
      return result;
    };

    // Auto-update amount in words based on grand total
    const amountInWords = computed(() => {
      if (grandTotal.value > 0) {
        return numberToWords(grandTotal.value);
      }
      return '';
    });
    
    const sumOf = computed({
      get: () => {
        ensurePageData(currentPage.value);
        const storedValue = pageData.value[currentPage.value]?.sumOf || '';
        
        // Auto-update with amount in words if empty and there's an actual amount
        if ((!storedValue || storedValue.trim() === '') && amountInWords.value) {
          return amountInWords.value;
        }
        
        return storedValue;
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].sumOf = value;
      }
    });
    
    const sumOf2 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.sumOf2 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].sumOf2 = value;
      }
    });
    
    const items = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.items || createDefaultPageData().items;
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].items = value;
      }
    });
    
    const signatureImage1 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.signatureImage1 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].signatureImage1 = value;
      }
    });
    
    const signatureImage2 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.signatureImage2 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].signatureImage2 = value;
      }
    });
    
    // Shared signature state - synchronized across main and preview pages
    const SHARED_SIGNATURE_KEY = 'sdp_invoice_shared_signatures';
    
    const loadSharedSignatureState = () => {
      try {
        const sharedData = localStorage.getItem(SHARED_SIGNATURE_KEY);
        if (sharedData) {
          const parsed = JSON.parse(sharedData);
          selectedSignature1.value = parsed.selectedSignature1 || '';
          selectedSignature2.value = parsed.selectedSignature2 || '';
          signatureImage1.value = parsed.signatureImage1 || '';
          signatureImage2.value = parsed.signatureImage2 || '';
          console.log('📋 Loaded shared signature state for invoice preview:', parsed);
        }
      } catch (error) {
        console.error('❌ Error loading shared signature state:', error);
      }
    };
    
    const saveSharedSignatureState = () => {
      try {
        const sharedData = {
          selectedSignature1: selectedSignature1.value,
          selectedSignature2: selectedSignature2.value,
          signatureImage1: signatureImage1.value,
          signatureImage2: signatureImage2.value,
          timestamp: Date.now()
        };
        localStorage.setItem(SHARED_SIGNATURE_KEY, JSON.stringify(sharedData));
        console.log('💾 Saved shared signature state for invoice preview:', sharedData);
      } catch (error) {
        console.error('❌ Error saving shared signature state:', error);
      }
    };
    
    const selectedSignature1 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.selectedSignature1 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].selectedSignature1 = value;
      }
    });
    
    const selectedSignature2 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.selectedSignature2 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].selectedSignature2 = value;
      }
    });
    
    // Dynamic MAX_ITEMS based on invoice height - Reduced by 2 for each size
    const MAX_ITEMS = computed(() => {
      const height = invoiceHeight.value;
      
      if (height >= 8.5) {
        // For 8.5 inches or more, max 13 items
        return 13;
      } else if (height >= 8.0) {
        // Between 8.0 and 8.5, allow 12 items
        return 12;
      } else if (height >= 7.5) {
        // Between 7.5 and 8.0, allow 11 items
        return 11;
      } else if (height >= 7.0) {
        // Between 7.0 and 7.5, allow 10 items
        return 10;
      } else if (height >= 6.5) {
        // Between 6.5 and 7.0, allow 9 items
        return 9;
      } else if (height >= 6.0) {
        // Between 6.0 and 6.5, allow 8 items
        return 7;
      } else if (height >= 5.5) {
        // Between 5.5 and 6.0, allow 7 items
        return 7;
      } else if (height >= 5.0) {
        // Between 5.0 and 5.5, allow 6 items
        return 6;
      } else if (height >= 4.5) {
        // Between 4.5 and 5.0, allow 5 items
        return 5;
      } else {
        // Below 4.5, minimum 4 items
        return 4;
      }
    });
    
    // Dynamic logo height based on invoice height
    const logoHeight = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return 90; // Full size for 8+ inches
      } else {
        // Reduce very slowly - only 1px per inch below 8
        const scaledHeight = 90 - ((8 - height) * 1);
        // Minimum 60px for better visibility
        return Math.max(70, scaledHeight);
      }
    });
    
    // Dynamic header padding (top and bottom) based on invoice height
    const headerPaddingTop = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '0.5rem'; // Default top padding for 8+ inches
      } else {
        // Reduce padding very slowly - 0.05rem per inch below 8
        const padding = 0.5 - ((8 - height) * 0.05);
        return `${Math.max(0.3, padding)}rem`; // Minimum 0.3rem (higher minimum)
      }
    });
    
    const headerPaddingBottom = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '0.5rem'; // Default bottom padding for 8+ inches
      } else {
        // Reduce padding very slowly - 0.05rem per inch below 8
        const padding = 0.5 - ((8 - height) * 0.05);
        return `${Math.max(0.3, padding)}rem`; // Minimum 0.3rem (higher minimum)
      }
    });
    
    // Combined header padding for template use
    const headerPadding = computed(() => headerPaddingBottom.value);
    
    // Computed properties for page management
    const displayPageNumber = computed(() => {
      return `${String(currentPage.value).padStart(3, '0')}`;
    });

    // Calculate per-page invoice number
    const currentInvoiceNumber = computed(() => {
      // Always format with 4-digit leading zeros for professional appearance
      if (totalCopies.value > 1) {
        const baseNumber = receiptNumber.value || 1;
        return String(baseNumber + currentPage.value - 1).padStart(4, '0');
      }
      // Even for single invoices, use 4-digit format (0001, 0002, etc.)
      return String(receiptNumber.value || 1).padStart(4, '0');
    });
    
    // Watch for changes in total copies - Optimized with debouncing
    let totalCopiesTimeout = null;
    watch(totalCopies, (newTotal, oldTotal) => {
      // Skip if no actual change
      if (newTotal === oldTotal) return;
      
      // Clear previous timeout
      if (totalCopiesTimeout) {
        clearTimeout(totalCopiesTimeout);
      }
      
      // Debounce the update
      totalCopiesTimeout = setTimeout(() => {
        try {
          // Ensure totalCopies is within valid range
          const validTotal = Math.max(1, Math.min(100, parseInt(newTotal) || 1));
          
          if (validTotal !== newTotal) {
            totalCopies.value = validTotal;
            return;
          }
          
          // Initialize data for new pages (only if increasing)
          if (validTotal > (parseInt(oldTotal) || 1)) {
            for (let i = (parseInt(oldTotal) || 1) + 1; i <= validTotal; i++) {
              ensurePageData(i);
            }
          }
          
          // Adjust current page if it exceeds new total
          if (currentPage.value > validTotal) {
            currentPage.value = Math.max(1, validTotal);
          }
          
          // Optimized storage update
          try {
            const storedData = safeLocalStorage.getItem('invoicePreviewData');
            const currentData = storedData ? JSON.parse(storedData) : {};
            currentData.totalCopies = validTotal;
            currentData.pageData = pageData.value;
            safeLocalStorage.setItem('invoicePreviewData', JSON.stringify(currentData));
          } catch (storageError) {
            console.warn('⚠️ Storage update failed:', storageError);
          }
          
          totalCopiesTimeout = null;
        } catch (error) {
          console.error('❌ Error in totalCopies watcher:', error);
          totalCopiesTimeout = null;
        }
      }, 300); // 300ms debounce
    });
    
    // Watch for changes in current page to ensure it's valid
    watch(currentPage, (newPage) => {
      if (newPage < 1) {
        currentPage.value = 1;
      } else if (newPage > totalCopies.value) {
        currentPage.value = totalCopies.value;
      }
    });
    
    // Watch for changes to save state for undo/redo (debounced to avoid too many history entries)
    let saveStateTimeout = null;
    const debouncedSaveState = () => {
      // Don't save state during restoration
      if (isRestoring.value) return;
      
      if (saveStateTimeout) clearTimeout(saveStateTimeout);
      saveStateTimeout = setTimeout(() => {
        saveState();
      }, 500); // Save state 500ms after user stops typing
    };
    
    // Watch all editable fields for changes
    watch([
      organizationName,
      organizationSubName,
      organizationReceiptSubName,
      headOfficeAddress,
      headOfficePhone,
      customerName,
      customerAddress,
      customerAddress2,
      date,
      lpo,
      sumOf,
      sumOf2,
      receiptNumber
    ], () => {
      debouncedSaveState();
    }, { deep: true });
    
    // Watch items array changes
    watch(items, () => {
      debouncedSaveState();
    }, { deep: true });
    
    // Also watch the underlying pageData for deep changes
    watch(pageData, () => {
      debouncedSaveState();
    }, { deep: true });
    
    // Handle automatic text overflow from address line 1 to line 2
    const ADDRESS_LINE_LIMIT = 50; // Character limit for first address line
    let isOverflowHandling = false; // Prevent recursive updates
    
    watch(customerAddress, (newValue, oldValue) => {
      if (isOverflowHandling) return;
      
      // Handle overflow: text longer than limit moves to line 2
      if (newValue && newValue.length > ADDRESS_LINE_LIMIT) {
        isOverflowHandling = true;
        
        // Find the last space before the limit to avoid breaking words
        let splitIndex = ADDRESS_LINE_LIMIT;
        for (let i = ADDRESS_LINE_LIMIT - 1; i >= Math.max(0, ADDRESS_LINE_LIMIT - 20); i--) {
          if (newValue[i] === ' ') {
            splitIndex = i;
            break;
          }
        }
        
        // Split the text
        const line1 = newValue.substring(0, splitIndex).trim();
        const overflow = newValue.substring(splitIndex).trim();
        
        // Combine overflow with existing line 2 content
        const line2 = overflow + (customerAddress2.value ? ' ' + customerAddress2.value : '');
        
        // Update both fields
        customerAddress.value = line1;
        customerAddress2.value = line2;
        
        nextTick(() => {
          isOverflowHandling = false;
        });
      }
      // Handle pull-back: when deleting from line 1, pull text from line 2
      else if (oldValue && newValue && oldValue.length > newValue.length) {
        const line1 = newValue || '';
        const line2 = customerAddress2.value || '';
        
        if (line1.length < ADDRESS_LINE_LIMIT && line2) {
          isOverflowHandling = true;
          
          const availableSpace = ADDRESS_LINE_LIMIT - line1.length;
          const line2Words = line2.split(' ');
          
          let pulledText = '';
          let remainingWords = [];
          let currentLength = 0;
          
          for (let i = 0; i < line2Words.length; i++) {
            const word = line2Words[i];
            const wordWithSpace = (pulledText ? ' ' : '') + word;
            
            if (currentLength + wordWithSpace.length <= availableSpace) {
              pulledText += wordWithSpace;
              currentLength += wordWithSpace.length;
            } else {
              remainingWords = line2Words.slice(i);
              break;
            }
          }
          
          if (pulledText) {
            customerAddress.value = (line1 + ' ' + pulledText).trim();
            customerAddress2.value = remainingWords.join(' ').trim();
          }
          
          nextTick(() => {
            isOverflowHandling = false;
          });
        }
      }
    });
    
    // Dynamic sizing based on invoice height
    const dynamicPadding = computed(() => {
      const height = invoiceHeight.value;
      const padding = Math.max(0.15, height * 0.015);
      return `${padding}rem`;
    });
    
    const dynamicGap = computed(() => {
      const height = invoiceHeight.value;
      const gap = Math.max(0.1, height * 0.01);
      return `${gap}rem`;
    });
    
    const dynamicSpacing = computed(() => {
      const height = invoiceHeight.value;
      const spacing = Math.max(0.1, height * 0.008);
      return `${spacing}rem`;
    });
    
    const signatureHeight = computed(() => {
      const height = invoiceHeight.value;
      // Scale signature area based on available space (minimum 3rem, maximum 5rem)
      const scaledHeight = Math.max(3, Math.min(5, height * 0.6));
      return `${scaledHeight}rem`;
    });
    
    const signatureImageHeight = computed(() => {
      const height = invoiceHeight.value;
      // Scale signature images (smaller size: minimum 1.5rem, maximum 2.5rem)
      const scaledHeight = Math.max(1.5, Math.min(2.5, height * 0.3));
      return `${scaledHeight}rem`;
    });
    
    // Stable font size for organization name with smooth scaling
    const organizationNameFontSize = computed(() => {
      return '19px'; // Fixed font size for consistency across all devices
    });
    
    const organizationSubFontSize = computed(() => {
      return '10.5px';
    });

    // Dynamic address and phone font sizes based on invoice height
    const addressFontSize = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '11px'; // Increased from 9px for better visibility
      } else {
        // Reduce by 0.4px per inch below 8
        const scaledSize = 11 - ((8 - height) * 0.4);
        return `${Math.max(10, scaledSize)}px`; // Increased minimum from 7px to 11px
      }
    });

    const phoneFontSize = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '10px'; // Increased from 8px for better visibility
      } else {
        // Reduce by 0.3px per inch below 8
        const scaledSize = 10 - ((8 - height) * 0.3);
        return `${Math.max(9, scaledSize)}px`; // Increased minimum from 6px to 10px
      }
    });

    // Dynamic footer font size (slightly larger than address font)
    const footerFontSize = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '11px'; // Full size for 8+ inches
      } else {
        // Reduce by 0.5px per inch below 8
        const scaledSize = 11 - ((8 - height) * 0.5);
        return `${Math.max(8.5, scaledSize)}px`; // Minimum 8.5px
      }
    });

    // Dynamic box heights based on invoice height
    const outlineBoxHeight = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '60px'; // Full height for 8+ inches
      } else {
        // Reduce by 4px per inch below 8
        const scaledHeight = 60 - ((8 - height) * 4);
        return `${Math.max(40, scaledHeight)}px`; // Minimum 40px
      }
    });

    const customerBoxHeight = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '80px'; // Full height for 8+ inches
      } else {
        // Reduce by 5px per inch below 8
        const scaledHeight = 80 - ((8 - height) * 5);
        return `${Math.max(50, scaledHeight)}px`; // Minimum 50px
      }
    });

    // Dynamic table header font size based on invoice width and content fitting
    const tableHeaderFontSize = computed(() => {
      const width = invoiceWidth.value;
      
      // Base font size: 10px for standard width (5+ inches)
      // Automatically reduce font size when width gets smaller
      if (width >= 5) {
        return '10px'; // Standard size for 5+ inches width
      } else if (width >= 4.5) {
        return '9px'; // Slightly smaller for 4.5-5 inches
      } else if (width >= 4) {
        return '8.5px'; // Smaller for 4-4.5 inches  
      } else if (width >= 3.5) {
        return '8px'; // Minimum size before wrapping for 3.5-4 inches
      } else {
        return '7.5px'; // Very small for very narrow widths (allows wrapping)
      }
    });

    // Dynamic customer details font size based on invoice width
    const customerDetailsFontSize = computed(() => {
      const width = invoiceWidth.value;
      
      // Base font size: 11px for standard width (5+ inches)
      // Automatically reduce font size when width gets smaller
      if (width >= 5) {
        return '11px'; // Standard size for 5+ inches width
      } else if (width >= 4.5) {
        return '10px'; // Slightly smaller for 4.5-5 inches
      } else if (width >= 4) {
        return '9px'; // Smaller for 4-4.5 inches  
      } else if (width >= 3.5) {
        return '8px'; // Smaller for 3.5-4 inches
      } else {
        return '7px'; // Very small for very narrow widths
      }
    });

    // Dynamic AMOUNT column and total row widths based on invoice width
    const amountColumnWidth = computed(() => {
      const width = invoiceWidth.value;
      const taxEnabled = invoiceData.value.taxEnabled;
      
      // Calculate responsive width based on invoice size
      // Base width at 5 inches: 27% (with tax) or 29% (without tax) - Increased for more space
      const baseWidth = taxEnabled ? 27 : 29;
      
      // Scale factor: reduce width proportionally for smaller invoices
      if (width >= 5) {
        return `${baseWidth}%`;
      } else {
        // Reduce by 0.3% per 0.1 inch below 5 inches
        const reduction = (5 - width) * 3;
        const adjustedWidth = Math.max(baseWidth - reduction, taxEnabled ? 22 : 24);
        return `${adjustedWidth}%`;
      }
    });

    const koboColumnWidth = computed(() => {
      const width = invoiceWidth.value;
      
      // Base width at 5 inches: 24.5%
      const baseWidth = 24.5;
      
      // Scale proportionally for smaller invoices
      if (width >= 5) {
        return `${baseWidth}%`;
      } else {
        // Reduce by 0.4% per 0.1 inch below 5 inches
        const reduction = (5 - width) * 4;
        const adjustedWidth = Math.max(baseWidth - reduction, 20);
        return `${adjustedWidth}%`;
      }
    });

    const totalBoxWidth = computed(() => {
      const width = invoiceWidth.value;
      
      // Base width at 5 inches: 28% (increased from 25%)
      const baseWidth = 27.5;
      
      // Scale proportionally for smaller invoices
      if (width >= 5) {
        return `${baseWidth}%`;
      } else {
        // Reduce by 0.35% per 0.1 inch below 5 inches
        const reduction = (5 - width) * 3.5;
        const adjustedWidth = Math.max(baseWidth - reduction, 26);
        return `${adjustedWidth}%`;
      }
    });

    const totalBoxMinWidth = computed(() => {
      const width = invoiceWidth.value;
      
      // Base min-width at 5 inches: 105px (increased from 91.5px)
      const baseMinWidth = 105;
      
      // Scale proportionally for smaller invoices
      if (width >= 5) {
        return `${baseMinWidth}px`;
      } else {
        // Reduce by 2px per 0.1 inch below 5 inches
        const reduction = (5 - width) * 20;
        const adjustedMinWidth = Math.max(baseMinWidth - reduction, 80);
        return `${adjustedMinWidth}px`;
      }
    });

    const koboTotalWidth = computed(() => {
      const width = invoiceWidth.value;
      
      // Base width at 5 inches: 24%
      const baseWidth = 24;
      
      // Scale proportionally for smaller invoices
      if (width >= 5) {
        return `${baseWidth}%`;
      } else {
        // Reduce by 0.4% per 0.1 inch below 5 inches
        const reduction = (5 - width) * 4;
        const adjustedWidth = Math.max(baseWidth - reduction, 20);
        return `${adjustedWidth}%`;
      }
    });
    
    // Dropdown positioning
    const dropdownStyle = computed(() => {
      if (!exportDropdownRef.value) {
        return {};
      }
      
      const rect = exportDropdownRef.value.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dropdownWidth = 180;
      const dropdownHeight = 160; // Estimated height
      
      let left = rect.right - dropdownWidth; // Right-aligned by default
      let top = rect.bottom + 4;
      
      // Adjust horizontal position if it would go off screen
      if (left < 8) {
        left = rect.left;
      }
      
      // Adjust vertical position if it would go off screen
      if (top + dropdownHeight > viewportHeight - 8) {
        top = rect.top - dropdownHeight - 4;
      }
      
      return {
        left: `${Math.max(8, left)}px`,
        top: `${Math.max(8, top)}px`,
      };
    });

    // Dynamic table row height based on invoice height - Reduced for shorter cells
    const tableRowHeight = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '25px'; // Reduced from 32px for shorter cells
      } else {
        // Reduce very slowly - only 1px per inch below 8
        const scaledHeight = 25 - ((8 - height) * 1);
        return `${Math.max(17, scaledHeight)}px`; // Minimum 16px (reduced from 24px)
      }
    });

    // Generate watermark text function
    const generateWatermarkText = () => {
      if (!organizationName.value) return '';
      
      const text = organizationName.value.replace(/\s+/g, '');
      const fontSize = watermarkFontSize.value;
      
      // Calculate for maximum coverage with dense text pattern
      const extraCoverage = 3.0; // Much higher coverage multiplier
      
      // Calculate characters needed for full coverage including extended area
      const effectiveWidth = invoiceWidth.value * extraCoverage;
      const effectiveHeight = invoiceHeight.value * extraCoverage;
      
      // Character calculation for better justification - shorter lines work better
      const charsPerLine = Math.floor((effectiveWidth * 72) / (fontSize * 0.7)); // Shorter lines for better justify
      const linesNeeded = Math.floor((effectiveHeight * 72) / (fontSize * 1.2)); // Better line spacing
      
      let watermark = '';
      let textIndex = 0;
      
      for (let line = 0; line < linesNeeded; line++) {
        let lineText = '';
        
        // Fill each line completely with repeating text - ensure exact length
        while (lineText.length < charsPerLine) {
          const remainingSpace = charsPerLine - lineText.length;
          
          if (textIndex >= text.length) {
            textIndex = 0; // Reset to beginning of text
          }
          
          const availableText = text.substring(textIndex);
          
          if (availableText.length <= remainingSpace) {
            lineText += availableText;
            textIndex = 0; // Reset for next iteration
          } else {
            lineText += availableText.substring(0, remainingSpace);
            textIndex += remainingSpace;
          }
        }
        
        // Ensure line is exactly the right length by padding or trimming
        lineText = lineText.substring(0, charsPerLine);
        if (lineText.length < charsPerLine) {
          // Fill remaining space with repeated text
          const fillText = text.repeat(Math.ceil((charsPerLine - lineText.length) / text.length));
          lineText += fillText.substring(0, charsPerLine - lineText.length);
        }
        
        // Add the line with maximum text density
        watermark += lineText;
        if (line < linesNeeded - 1) {
          watermark += '\n';
        }
        
        // Minimal offset for denser pattern
        textIndex = (textIndex + 1) % text.length;
      }
      
      return watermark;
    };
    
    // Get watermark color with opacity for text watermark
    const getWatermarkColor = () => {
      return 'rgb(128, 128, 128)'; // Simple gray color
    };
    
    // Get watermark color as CSS string for preview
    const getWatermarkColorPreview = () => {
      return 'rgb(128, 128, 128)'; // Simple gray color
    };
    
    const sumOfInput1 = ref(null);
    const sumOfInput2 = ref(null);
    
    // Signature management
    const savedSignatures = ref([]);
    
    // Load invoice data from localStorage - Optimized for performance
    onMounted(async () => {
      try {
        // Clean up any corrupted localStorage data first
        cleanupCorruptedLocalStorage();
        
        // Initialize page 1 data first
        ensurePageData(1);
      
        const savedDataString = safeLocalStorage.getItem('invoicePreviewData');
        if (savedDataString && savedDataString.trim() !== '') {
          let parsed;
          try {
            parsed = JSON.parse(savedDataString);
            
            // Validate parsed data structure
            if (!parsed || typeof parsed !== 'object') {
              throw new Error('Invalid data structure');
            }
            
            // Process the parsed data
            const shouldLoadOrganizationData = parsed.formMode === 'generate' || parsed.fromQuickFill === true;
            
            invoiceData.value = { ...invoiceData.value, ...parsed };
            
            // Load settings
            if (parsed.invoiceWidth) invoiceWidth.value = parsed.invoiceWidth;
            if (parsed.invoiceHeight) invoiceHeight.value = parsed.invoiceHeight;
            if (parsed.colorMode) colorMode.value = parsed.colorMode;
            if (parsed.totalCopies) totalCopies.value = parsed.totalCopies;
            if (parsed.currentPage) currentPage.value = parsed.currentPage;
            if (parsed.showPageNumbers !== undefined) showPageNumbers.value = parsed.showPageNumbers;
            if (parsed.autoDate !== undefined) autoDate.value = parsed.autoDate;
            if (parsed.selectedTemplate) selectedTemplate.value = parsed.selectedTemplate;
            
            // Load per-page data if it exists
            if (parsed.pageData) {
              pageData.value = parsed.pageData;
              for (let i = 1; i <= totalCopies.value; i++) {
                ensurePageData(i);
              }
            }

            // Load font settings
            const quickSettingsString = safeLocalStorage.getItem('invoiceQuickSettings');
            if (quickSettingsString) {
              try {
                const fontSettings = JSON.parse(quickSettingsString);
                if (fontSettings.selectedFont) selectedFont.value = fontSettings.selectedFont;
                if (fontSettings.baseFontSize) baseFontSize.value = fontSettings.baseFontSize;
                if (fontSettings.elementStyles) elementStyles.value = fontSettings.elementStyles;
                if (fontSettings.autoAdjustedElements) {
                  autoAdjustedElements.value = new Set(fontSettings.autoAdjustedElements);
                }
                if (fontSettings.originalElementStyles) {
                  originalElementStyles.value = fontSettings.originalElementStyles;
                }
              } catch (fontError) {
                console.warn('Error parsing font settings:', fontError);
                safeLocalStorage.removeItem('invoiceQuickSettings');
              }
            }
            
            // Load organization data if appropriate
            if (shouldLoadOrganizationData) {
              logoDataUrl.value = String(parsed.logoDataUrl || '').trim();
              organizationName.value = String(parsed.organizationName || '').trim();
              organizationSubName.value = String(parsed.organizationSubName || '').trim();
              organizationReceiptSubName.value = String(parsed.organizationReceiptSubName || 'Minna and District Society').trim();
              businessNumber.value = String(parsed.businessNumber || '').trim();
              headOfficeAddress.value = String(parsed.headOfficeAddress || '').trim();
              headOfficePhone.value = String(parsed.headOfficePhone || '').trim();
              branchAddress1.value = String(parsed.branchAddress1 || '').trim();
              branch1Phone.value = String(parsed.branch1Phone || '').trim();
              branchAddress2.value = String(parsed.branchAddress2 || '').trim();
              branch2Phone.value = String(parsed.branch2Phone || '').trim();
              
              // Handle additional branches
              if (parsed.additionalBranches && Array.isArray(parsed.additionalBranches)) {
                additionalBranches.value = parsed.additionalBranches;
                if (additionalBranches.value.length > 0 && (!branchAddress1.value && !branch1Phone.value)) {
                  branchAddress1.value = additionalBranches.value[0].address || '';
                  branch1Phone.value = additionalBranches.value[0].phone || '';
                }
                if (additionalBranches.value.length > 1 && (!branchAddress2.value && !branch2Phone.value)) {
                  branchAddress2.value = additionalBranches.value[1].address || '';
                  branch2Phone.value = additionalBranches.value[1].phone || '';
                }
              }
              receiptNumber.value = parsed.invoiceNumber || 1;
            }
            // Note: Keep the manually set organization data when not loading from form
            
            // Load tax enabled setting
            if (typeof parsed.taxEnabled !== 'undefined') {
              invoiceData.value.taxEnabled = parsed.taxEnabled;
            }
            
            // Load customer and transaction data
            customerName.value = parsed.customerName || '';
            customerAddress.value = parsed.customerAddress || '';
            date.value = parsed.invoiceDate || '';
            lpo.value = parsed.lpo || '';
            
            // Always ensure 12 items - pad with empty items if necessary
            const loadedItems = parsed.items && Array.isArray(parsed.items) ? parsed.items : [];
            const paddedItems = [];
            
            // Fill with loaded items first
            for (let i = 0; i < 12; i++) {
              if (i < loadedItems.length && loadedItems[i]) {
                paddedItems.push({
                  id: i + 1,
                  quantity: loadedItems[i].quantity || 0,
                  description: loadedItems[i].description || '',
                  price: loadedItems[i].price || 0,
                  tax: loadedItems[i].tax || 0
                });
              } else {
                paddedItems.push({
                  id: i + 1,
                  quantity: 0,
                  description: '',
                  price: 0,
                  tax: 0
                });
              }
            }
            
            items.value = paddedItems;
            sumOf.value = parsed.sumOf || '';
            sumOf2.value = parsed.sumOf2 || '';
            
            // Load signature data from preview data
            if (parsed.selectedSignature1) selectedSignature1.value = parsed.selectedSignature1;
            if (parsed.selectedSignature2) selectedSignature2.value = parsed.selectedSignature2;
            if (parsed.signatureImage1) signatureImage1.value = parsed.signatureImage1;
            if (parsed.signatureImage2) signatureImage2.value = parsed.signatureImage2;
            
            console.log('📝 Loaded signature data:', {
              selectedSignature1: parsed.selectedSignature1,
              selectedSignature2: parsed.selectedSignature2,
              hasSignatureImage1: !!parsed.signatureImage1,
              hasSignatureImage2: !!parsed.signatureImage2
            });
            
          } catch (parseError) {
            console.error('Error parsing preview data:', parseError);
            try {
              safeLocalStorage.removeItem('invoicePreviewData');
            } catch (removeError) {
              console.warn('Error removing corrupt data:', removeError);
            }
          }
        }
        
        // Load signatures with a slight delay to ensure member data is available
        setTimeout(async () => {
          await loadSignatures();
          
          // Load shared signature state after signatures are loaded
          loadSharedSignatureState();
        }, 100);
        
        // Add storage event listener for real-time sync with main page
        window.addEventListener('storage', handleStorageChange);

        // Apply saved element styles
        applyAllSavedStyles();

        // Setup auto font adjustment
        setupAutoAdjustment();
        
        // Check if mobile
        isMobile.value = window.innerWidth < 768;
        calculateMobileScale();
        
        window.addEventListener('resize', () => {
          isMobile.value = window.innerWidth < 768;
          calculateMobileScale();
        });
        
        // Add click outside event listener for export dropdown
        document.addEventListener('click', handleClickOutside);
        
        // Auto-fit zoom when component is mounted
        setTimeout(autoFitZoom, 500);
        
        // Force font size recalculation after data loading
        await nextTick();
        const currentHeight = invoiceHeight.value;
        invoiceHeight.value = currentHeight + 0.001;
        await nextTick();
        invoiceHeight.value = currentHeight;
        
        // Save initial state for undo/redo - do it immediately
        await nextTick();
        console.log('💾 Saving initial state for undo/redo...');
        saveState();
        console.log('✅ Initial state saved. History length:', history.value.length, 'Index:', historyIndex.value);
        
      } catch (error) {
        console.error('Error in onMounted:', error);
        handleError(error, 'onMounted');
      }
    });
    
    // Clean up event listeners and pending operations on unmount
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
      
      // Clear all pending debounced saves to prevent memory leaks
      // Note: No longer using debounced storage saves
      
      // Clear other timeouts
      if (orgNameUpdateTimeout) clearTimeout(orgNameUpdateTimeout);
      if (dimensionUpdateTimeout) clearTimeout(dimensionUpdateTimeout);
      
      // Clean up large data structures
      pageData.value = {};
      elementStyles.value = {};
      originalElementStyles.value = {};
      autoAdjustedElements.value.clear();
    });
    
    // Calculate mobile scale
    const calculateMobileScale = () => {
      if (isMobile.value) {
        const screenWidth = window.innerWidth - 32; // Account for padding
        const invoiceWidthPx = invoiceWidth.value * 96; // 96 DPI
        mobileScale.value = Math.min(screenWidth / invoiceWidthPx, 1);
      } else {
        mobileScale.value = 1;
      }
    };
    
    // Content scale - DISABLED for export compatibility
    const contentScale = ref(1);
    
    const updateContentScale = () => {
      // Scaling disabled - keeping function for compatibility
      contentScale.value = 1;
    };
    
    onMounted(() => {
      updateContentScale();
      const resizeObserver = new ResizeObserver(updateContentScale);
      if (contentWrapperRef.value) {
        resizeObserver.observe(contentWrapperRef.value);
      }
    });

    // Throttled dimension/items watcher to prevent excessive updates
    let orgNameUpdateTimeout = null;
    let dimensionUpdateTimeout = null;
    watch([invoiceWidth, invoiceHeight], () => {
      if (dimensionUpdateTimeout) clearTimeout(dimensionUpdateTimeout);
      dimensionUpdateTimeout = setTimeout(() => {
        nextTick(updateContentScale);
        autoFitZoom();
        dimensionUpdateTimeout = null;
      }, 150);
    }, { deep: false }); // Use shallow watch for better performance

    // Separate watcher for items that doesn't trigger zoom changes
    watch(items, () => {
      nextTick(updateContentScale);
    }, { deep: true });

    // Watch for organization name changes - simplified
    watch(
      () => organizationName.value,
      () => {
        nextTick(() => {
          const el = invoiceRef.value?.querySelector('.organization-name');
          if (!el) return;
          
          // Force fixed font size - prevent mobile scaling
          el.style.fontSize = '19px !important';
          el.style.lineHeight = '1.25';
          
          // Prevent mobile browser scaling and dynamic font adjustment
          el.style.webkitTextSizeAdjust = '100%';
          el.style.textSizeAdjust = '100%';
          el.style.webkitFontSmoothing = 'antialiased';
          el.style.mozOsxFontSmoothing = 'grayscale';
          el.style.transform = 'none';
          el.style.zoom = '1';
          el.style.minHeight = 'auto';
          el.style.maxWidth = 'none';
          
          console.log(`📏 Org name size locked at: 19px (mobile scaling prevented)`);
        });
      },
      { flush: 'post' }
    );

    // Watch MAX_ITEMS and remove excess items when height decreases
    watch(MAX_ITEMS, (newMaxItems) => {
      if (items.value.length > newMaxItems) {
        items.value.splice(newMaxItems);
      }
    });
    
    // Organization name change handler - saves changes to prevent data loss
    const handleOrganizationNameChange = (event) => {
      try {
        const newName = event.target.textContent || event.target.innerText || '';
        organizationName.value = newName.trim();
        
        // Save the change to localStorage to prevent data loss
        const existingData = safeLocalStorage.getItem('invoicePreviewData');
        if (existingData) {
          const parsedData = JSON.parse(existingData);
          parsedData.organizationName = organizationName.value;
          safeLocalStorage.setItem('invoicePreviewData', JSON.stringify(parsedData));
        }
        
        // Also save to form data if it exists
        const formData = safeLocalStorage.getItem('generateInvoiceFormData');
        if (formData) {
          const parsedFormData = JSON.parse(formData);
          parsedFormData.organizationName = organizationName.value;
          safeLocalStorage.setItem('generateInvoiceFormData', JSON.stringify(parsedFormData));
        }
      } catch (error) {
        console.warn('Error saving organization name change:', error);
      }
    };

    // Invoice dimensions
    const invoiceDimensions = computed(() => ({
      width: isMobile.value ? '100%' : `${invoiceWidth.value}in`,
      height: `${invoiceHeight.value}in`,
      minHeight: `${invoiceHeight.value}in`,
      minWidth: isMobile.value ? '100%' : `${invoiceWidth.value}in`,
      maxWidth: isMobile.value ? '100%' : `${invoiceWidth.value}in`
    }));
    
    // CMYK to RGB conversion
    const cmykToRgb = (c, m, y, k) => {
      const cNorm = c / 100;
      const mNorm = m / 100;
      const yNorm = y / 100;
      const kNorm = k / 100;
      const r = 255 * (1 - cNorm) * (1 - kNorm);
      const g = 255 * (1 - mNorm) * (1 - kNorm);
      const b = 255 * (1 - yNorm) * (1 - kNorm);
      return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    };
    
    // Get color mode description for PDF metadata
    const getColorModeDescription = () => {
      switch (colorMode.value) {
        case 'full-color':
          return 'Full Color (RGB)';
        case 'one-color':
          return 'Single Color (CMYK)';
        case 'two-color':
          return 'Two Color (CMYK)';
        case 'three-color':
          return 'Three Color (CMYK)';
        default:
          return 'Full Color';
      }
    };

    // CMYK to RGB CSS string helper
    const cmykToRgbCss = (c, m, y, k) => {
      const rgb = cmykToRgb(c, m, y, k);
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    };
    
    // CMYK CSS function for print media (when supported)
    const cmykToCss = (c, m, y, k) => {
      // For print media, try to use CMYK if supported, fallback to RGB
      return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
    };
    
    // Enhanced color conversion for print-ready output
    const getPrintReadyColor = (c, m, y, k) => {
      return {
        rgb: cmykToRgbCss(c, m, y, k),
        cmyk: cmykToCss(c, m, y, k),
        values: { c, m, y, k }
      };
    };
    
    // CMYK to HEX conversion
    const cmykToHex = (cmyk) => {
      const rgb = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
      const toHex = (n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
    };
    
    // Color styles based on mode
    const colorStyles = computed(() => {
      const styles = {};
      const color1Hex = cmykToHex(customColor1CMYK.value);
      const color2Hex = cmykToHex(customColor2CMYK.value);
      const color3Hex = cmykToHex(customColor3CMYK.value);
      
      // CMYK equivalents
      const blue1 = cmykToRgbCss(cmykColors.blue1.c, cmykColors.blue1.m, cmykColors.blue1.y, cmykColors.blue1.k);
      const blue2 = cmykToRgbCss(cmykColors.blue2.c, cmykColors.blue2.m, cmykColors.blue2.y, cmykColors.blue2.k);
      const white = cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k);
      const black = cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k);
      const lightGray = cmykToRgbCss(cmykColors.lightGray.c, cmykColors.lightGray.m, cmykColors.lightGray.y, cmykColors.lightGray.k);
      
      switch (colorMode.value) {
        case 'full-color':
          styles.headerBg = `linear-gradient(135deg, ${blue1} 0%, ${blue2} 100%)`;
          styles.headerText = white;
          styles.tableHeaderBg = blue1;
          styles.tableHeaderText = white;
          styles.accentColor = blue2;
          styles.borderColor = lightGray;
          styles.organizationTextColor = blue1;
          styles.primaryText = black;
          styles.secondaryText = lightGray;
          styles.logoFilter = 'none';
          break;
        case 'three-color':
          styles.headerBg = `linear-gradient(135deg, ${color1Hex} 0%, ${color2Hex} 100%)`;
          styles.headerText = white;
          styles.tableHeaderBg = color1Hex;
          styles.tableHeaderText = white;
          styles.accentColor = color3Hex;
          styles.borderColor = color2Hex;
          styles.organizationTextColor = color1Hex;
          styles.primaryText = color1Hex;
          styles.secondaryText = color2Hex;
          styles.logoFilter = 'sepia(100%) hue-rotate(160deg) saturate(300%)';
          break;
        case 'two-color':
          styles.headerBg = `linear-gradient(135deg, ${color1Hex} 0%, ${color2Hex} 100%)`;
          styles.headerText = white;
          styles.tableHeaderBg = color1Hex;
          styles.tableHeaderText = white;
          styles.accentColor = color2Hex;
          styles.borderColor = color1Hex;
          styles.organizationTextColor = color1Hex;
          styles.primaryText = color1Hex;
          styles.secondaryText = color2Hex;
          styles.logoFilter = 'sepia(100%) saturate(300%)';
          break;
        case 'one-color':
          styles.headerBg = color1Hex;
          styles.headerText = white;
          styles.tableHeaderBg = color1Hex;
          styles.tableHeaderText = white;
          styles.accentColor = color1Hex;
          styles.borderColor = color1Hex;
          styles.organizationTextColor = color1Hex;
          styles.primaryText = color1Hex;
          styles.secondaryText = color1Hex;
          styles.logoFilter = `grayscale(100%)`;
          break;
        default:
          styles.headerBg = blue1;
          styles.headerText = white;
          styles.tableHeaderBg = blue1;
          styles.tableHeaderText = white;
          styles.accentColor = blue2;
          styles.borderColor = lightGray;
          styles.organizationTextColor = blue1;
          styles.primaryText = black;
          styles.secondaryText = lightGray;
          styles.logoFilter = 'none';
      }
      
      return styles;
    });
    
    // Calculate total Naira (whole number part of all amounts)
    const totalNaira = computed(() => {
      return items.value.reduce((sum, item) => {
        const amount = getItemAmount(item);
        return sum + Math.floor(amount);
      }, 0);
    });

    // Calculate total Kobo (decimal parts of all amounts)
    const totalKobo = computed(() => {
      return items.value.reduce((sum, item) => {
        const amount = getItemAmount(item);
        const kobo = Math.round((amount % 1) * 100);
        return sum + kobo;
      }, 0);
    });

    // Currency formatter
    const toCurrency = (value) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2
      }).format(value || 0);
    };

    // Font selection methods
    const handleFontChange = () => {
      // Sync element font with main font selection
      selectedElementStyles.value.fontFamily = selectedFont.value;
      // Apply font family to invoice
      if (invoiceRef.value) {
        invoiceRef.value.style.fontFamily = selectedFont.value;
      }
      saveQuickSettings();
    };
    
    // Sync font selections across all dropdowns
    const syncFontSelections = () => {
      selectedFont.value = selectedElementStyles.value.fontFamily;
      handleFontChange();
    };

    const handleFontSizeChange = () => {
      // Apply base font size to invoice
      if (invoiceRef.value) {
        invoiceRef.value.style.fontSize = baseFontSize.value + 'px';
      }
      saveQuickSettings();
    };

    const setFontSizePreset = (size) => {
      baseFontSize.value = size;
      handleFontSizeChange();
    };

    // Debounced quick save function for settings changes to reduce writes
    const saveQuickSettings = () => {
      // Clear existing timeout to debounce rapid calls
      if (saveQuickSettingsTimeout) {
        clearTimeout(saveQuickSettingsTimeout);
      }
      
      // Set new timeout to save after 500ms of no changes
      saveQuickSettingsTimeout = setTimeout(() => {
        const quickSettings = {
          selectedFont: selectedFont.value,
          baseFontSize: baseFontSize.value,
          invoiceWidth: invoiceWidth.value,
          invoiceHeight: invoiceHeight.value,
          colorMode: colorMode.value,
          customColor1CMYK: customColor1CMYK.value,
          customColor2CMYK: customColor2CMYK.value,
          elementStyles: elementStyles.value,
          autoAdjustedElements: Array.from(autoAdjustedElements.value),
          originalElementStyles: originalElementStyles.value
        };
        safeLocalStorage.setItem('invoiceQuickSettings', JSON.stringify(quickSettings));
        console.log('✅ Saved invoice settings to localStorage');
        saveQuickSettingsTimeout = null;
      }, 500);
    };

    // Auto font adjustment methods

    const applySlimFont = (element, elementId) => {
      if (!element || !elementId) return;
      
      // Store original style if not already stored
      if (!originalElementStyles.value[elementId]) {
        originalElementStyles.value[elementId] = {
          fontFamily: element.style.fontFamily || window.getComputedStyle(element).fontFamily,
          fontSize: element.style.fontSize || window.getComputedStyle(element).fontSize
        };
      }
      
      // Apply slim font from the list
      const currentFontIndex = slimFonts.findIndex(font => 
        element.style.fontFamily?.includes(font.split(',')[0]));
      const nextFontIndex = currentFontIndex >= 0 ? 
        Math.min(currentFontIndex + 1, slimFonts.length - 1) : 0;
      
      element.style.fontFamily = slimFonts[nextFontIndex];
      
      // Also reduce font size slightly if still overflowing
      const currentSize = parseInt(element.style.fontSize) || baseFontSize.value;
      element.style.fontSize = Math.max(8, currentSize - 1) + 'px';
      
      // Mark as auto-adjusted
      autoAdjustedElements.value.add(elementId);
      
      // Save to element styles
      elementStyles.value[elementId] = {
        ...elementStyles.value[elementId],
        fontFamily: element.style.fontFamily,
        fontSize: parseInt(element.style.fontSize),
        autoAdjusted: true
      };
      
      saveQuickSettings();
    };

    const resetAutoAdjustment1 = (element) => {
      if (!element || !selectedElementId.value) return;
      
      const elementId = selectedElementId.value;
      const original = originalElementStyles.value[elementId];
      
      if (original) {
        element.style.fontFamily = original.fontFamily;
        element.style.fontSize = original.fontSize;
      }
      
      // Remove from auto-adjusted set
      autoAdjustedElements.value.delete(elementId);
      
      // Update element styles
      if (elementStyles.value[elementId]) {
        elementStyles.value[elementId].autoAdjusted = false;
      }
      
      saveQuickSettings();
    };

    const setupAutoAdjustment1 = () => {
      if (!invoiceRef.value) return;
      
      // Set up ResizeObserver to watch for text overflow
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          const elementId = element.getAttribute('data-element-id') || 
                           element.id || 
                           `element-${Math.random().toString(36).substr(2, 9)}`;
          
          if (!elementId || autoAdjustedElements.value.has(elementId)) return;
          
          // Check if text content exists and is overflowing
          if (element.textContent.trim() && checkTextOverflow(element)) {
            applySlimFont(element, elementId);
          }
        });
      });
      
      // Observe all text elements in the invoice
      const textElements = invoiceRef.value.querySelectorAll(
        'input[type="text"], textarea, [contenteditable], p, span, div:not(:empty)'
      );
      
      textElements.forEach((element, index) => {
        // Add unique identifier if not exists
        if (!element.getAttribute('data-element-id')) {
          element.setAttribute('data-element-id', `text-${index}`);
        }
        resizeObserver.observe(element);
      });
      
      // Also set up input event listeners for real-time checking
      textElements.forEach((element) => {
        element.addEventListener('input', () => {
          const elementId = element.getAttribute('data-element-id');
          if (elementId && !autoAdjustedElements.value.has(elementId) && checkTextOverflow(element)) {
            applySlimFont(element, elementId);
          }
        });
      });
    };

    // Text picker methods
    const toggleTextPickerMode = () => {
      // Before toggling off, save any pending changes
      if (isTextPickerMode.value && selectedElementId.value && selectedTextElement.value) {
        // Save state before making changes for undo/redo
        saveState();
        
        const element = selectedTextElement.value;
        
        // Apply current styles from the picker
        element.style.fontFamily = selectedElementStyles.value.fontFamily;
        element.style.fontSize = selectedElementStyles.value.fontSize + 'px';
        
        // Apply color based on cmykColor selection
        let colorValue;
        switch (selectedElementStyles.value.cmykColor) {
          case 'cyan':
            colorValue = 'rgb(6, 182, 212)';
            break;
          case 'magenta':
            colorValue = 'rgb(236, 72, 153)';
            break;
          case 'yellow':
            colorValue = 'rgb(250, 204, 21)';
            break;
          case 'black':
          default:
            colorValue = 'rgb(0, 0, 0)';
            break;
        }
        element.style.color = colorValue;
        
        // Save to element styles store
        elementStyles.value[selectedElementId.value] = { ...selectedElementStyles.value };
        
        // Save to localStorage
        saveQuickSettings();
        
        // Save state for undo/redo
        saveState();
      }
      
      isTextPickerMode.value = !isTextPickerMode.value;
      selectedTextElement.value = null;
      selectedElementId.value = '';
      
      if (isTextPickerMode.value) {
        // Add hover effects and click handlers to all text elements
        addTextPickerListeners();
      } else {
        // Remove hover effects and click handlers
        removeTextPickerListeners();
      }
    };

    const addTextPickerListeners = () => {
      if (!invoiceRef.value) return;
      
      // Find all text elements
      const textElements = invoiceRef.value.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, td, th, input, textarea');
      
      textElements.forEach((element, index) => {
        // Skip if element has no text content or is empty
        if (!element.textContent.trim()) return;
        
        // Add unique ID for tracking
        element.setAttribute('data-text-id', `text-element-${index}`);
        
        // Add hover effect
        element.style.cursor = 'pointer';
        element.style.transition = 'all 0.2s ease';
        
        // Add event listeners
        element.addEventListener('mouseenter', handleTextHover);
        element.addEventListener('mouseleave', handleTextLeave);
        element.addEventListener('click', handleTextClick);
      });
    };

    const removeTextPickerListeners = () => {
      if (!invoiceRef.value) return;
      
      const textElements = invoiceRef.value.querySelectorAll('[data-text-id]');
      textElements.forEach(element => {
        element.style.cursor = '';
        element.style.backgroundColor = '';
        element.style.borderRadius = '';
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.boxShadow = '';
        element.title = '';
        element.removeEventListener('mouseenter', handleTextHover);
        element.removeEventListener('mouseleave', handleTextLeave);
        element.removeEventListener('click', handleTextClick);
      });
    };

    const handleTextHover = (event) => {
      if (!isTextPickerMode.value) return;
      
      const element = event.target;
      const elementId = element.getAttribute('data-text-id');
      
      // Don't override existing selection styles
      if (selectedElementIds.value.includes(elementId)) return;
      
      // Enhanced hover effect - more visible and friendly
      element.style.backgroundColor = 'rgba(59, 130, 246, 0.15)'; // Blue with 15% opacity
      element.style.borderRadius = '3px';
      element.style.cursor = 'pointer';
      element.style.outline = '2px solid rgba(59, 130, 246, 0.4)';
      element.style.outlineOffset = '1px';
      
      // Add helpful tooltip
      element.title = selectedElementIds.value.length > 0 
        ? 'Click to toggle selection • Ctrl/⌘+Click for multi-select' 
        : 'Click to select this text • Ctrl/⌘+Click for multi-select';
    };

    const handleTextLeave = (event) => {
      if (!isTextPickerMode.value) return;
      
      const element = event.target;
      const elementId = element.getAttribute('data-text-id');
      
      // Don't clear styles if element is selected
      if (!selectedElementIds.value.includes(elementId)) {
        element.style.backgroundColor = '';
        element.style.borderRadius = '';
        element.style.outline = '';
        element.style.outlineOffset = '';
      }
      
      // Remove tooltip
      element.title = '';
    };

    const handleTextClick = (event) => {
      if (!isTextPickerMode.value) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      const element = event.target;
      const elementId = element.getAttribute('data-text-id');
      
      if (!elementId) return;
      
      // Apply pending changes from previous selection before switching
      if (selectedElementId.value && selectedElementId.value !== elementId && selectedTextElement.value) {
        // Save state before making changes for undo/redo
        saveState();
        
        const prevElement = selectedTextElement.value;
        
        // Apply current styles from the picker to the previous element
        prevElement.style.fontFamily = selectedElementStyles.value.fontFamily;
        prevElement.style.fontSize = selectedElementStyles.value.fontSize + 'px';
        
        // Apply color based on cmykColor selection
        let colorValue;
        switch (selectedElementStyles.value.cmykColor) {
          case 'cyan':
            colorValue = 'rgb(6, 182, 212)';
            break;
          case 'magenta':
            colorValue = 'rgb(236, 72, 153)';
            break;
          case 'yellow':
            colorValue = 'rgb(250, 204, 21)';
            break;
          case 'black':
          default:
            colorValue = 'rgb(0, 0, 0)';
            break;
        }
        prevElement.style.color = colorValue;
        
        // Save to element styles store
        elementStyles.value[selectedElementId.value] = { ...selectedElementStyles.value };
        
        // Save to localStorage
        saveQuickSettings();
        
        // Save state for undo/redo
        saveState();
      }
      
      // Check if Ctrl/Cmd key is held for multi-select
      const isMultiSelect = event.ctrlKey || event.metaKey || selectedElementIds.value.length > 0;
      
      if (isMultiSelect) {
        // Multi-select mode
        const index = selectedElementIds.value.indexOf(elementId);
        
        if (index > -1) {
          // Remove from selection
          selectedElementIds.value.splice(index, 1);
          element.style.backgroundColor = '';
          element.style.outline = '';
          element.style.outlineOffset = '';
          element.style.borderRadius = '';
          element.style.boxShadow = '';
        } else {
          // Add to selection - clearer multi-select styling
          selectedElementIds.value.push(elementId);
          element.style.backgroundColor = 'rgba(34, 197, 94, 0.15)'; // Green with 15% opacity
          element.style.borderRadius = '3px';
          element.style.outline = '2px solid rgba(34, 197, 94, 0.6)'; // Green outline
          element.style.outlineOffset = '1px';
          element.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.2)';
        }
        
        // Update arrays
        updateSelectedElements();
        
        // Update single selection for style controls
        if (selectedElementIds.value.length === 1) {
          selectedTextElement.value = element;
          selectedElementId.value = elementId;
        } else {
          selectedTextElement.value = null;
          selectedElementId.value = '';
        }
      } else {
        // Single selection mode - clearer single-select styling
        clearAllSelections();
        
        selectedTextElement.value = element;
        selectedElementId.value = elementId;
        selectedElementIds.value = [elementId];
        
        // Highlight selected element with vibrant blue for single selection
        element.style.outline = '3px solid rgba(59, 130, 246, 0.8)'; // Blue outline
        element.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'; // Blue with 20% opacity
        element.style.borderRadius = '3px';
        element.style.outlineOffset = '1px';
        element.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        
        updateSelectedElements();
      }
      
      // Get current styles for the style controls
      if (selectedTextElement.value) {
        const computedStyles = window.getComputedStyle(selectedTextElement.value);
        const savedStyles = elementStyles.value[selectedElementId.value];
        
        selectedElementStyles.value = {
          fontFamily: computedStyles.fontFamily || 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: parseInt(computedStyles.fontSize) || 12,
          cmykColor: savedStyles?.cmykColor || 'black'
        };
      }
    };



    const applySelectedElementStyles = () => {
      if (!selectedTextElement.value || !selectedElementId.value) return;
      
      // Save state before making changes for undo/redo
      saveState();
      
      const element = selectedTextElement.value;
      
      // Apply styles
      element.style.fontFamily = selectedElementStyles.value.fontFamily;
      element.style.fontSize = selectedElementStyles.value.fontSize + 'px';
      
      // Apply CMYK color based on selection
      let cmykColor;
      switch (selectedElementStyles.value.cmykColor) {
        case 'color1':
          cmykColor = customColor1CMYK.value;
          break;
        case 'color2':
          cmykColor = customColor2CMYK.value;
          break;
        default: // 'black'
          cmykColor = { c: 0, m: 0, y: 0, k: 100 };
      }
      element.style.color = cmykToRgbCss(cmykColor.c, cmykColor.m, cmykColor.y, cmykColor.k);
      
      // Save to element styles store
      elementStyles.value[selectedElementId.value] = { ...selectedElementStyles.value };
      
      // Save to localStorage
      saveQuickSettings();
      
      // Save state for undo/redo
      saveState();
    };

    // Quick color application function for CMYK buttons
    const applyQuickColor = (color) => {
      if (selectedElementIds.value.length === 0) return;
      
      // Save state before making changes for undo/redo
      saveState();
      
      // Apply color to all selected elements
      selectedElementIds.value.forEach(elementId => {
        const element = document.querySelector(`[data-text-id="${elementId}"]`);
        if (element) {
          let colorValue;
          switch (color) {
            case 'cyan':
              colorValue = 'rgb(6, 182, 212)'; // cyan-500
              break;
            case 'magenta':
              colorValue = 'rgb(236, 72, 153)'; // pink-500
              break;
            case 'yellow':
              colorValue = 'rgb(250, 204, 21)'; // yellow-400
              break;
            case 'black':
            default:
              colorValue = 'rgb(0, 0, 0)'; // black
              break;
          }
          
          element.style.color = colorValue;
          
          // Save to element styles store
          if (!elementStyles.value[elementId]) {
            elementStyles.value[elementId] = {
              fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: 12,
              cmykColor: color
            };
          } else {
            elementStyles.value[elementId].cmykColor = color;
          }
        }
      });
      
      // Save to localStorage
      saveQuickSettings();
      
      // Save state for undo/redo
      saveState();
    };

    const resetSelectedElementStyles = () => {
      if (!selectedTextElement.value || !selectedElementId.value) return;
      
      const element = selectedTextElement.value;
      
      // Reset to default styles
      element.style.fontFamily = '';
      element.style.fontSize = '';
      element.style.color = '';
      
      // Remove from element styles store
      delete elementStyles.value[selectedElementId.value];
      
      // Update selected styles to default
      selectedElementStyles.value = {
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 12,
        cmykColor: 'black'
      };
      
      // Save to localStorage
      saveQuickSettings();
    };

    const applyAllSavedStyles = () => {
      // Apply saved styles to elements when component loads
      setTimeout(() => {
        if (!invoiceRef.value || !elementStyles.value) return;
        
        Object.keys(elementStyles.value).forEach(elementId => {
          const element = invoiceRef.value.querySelector(`[data-text-id="${elementId}"]`);
          if (element) {
            const styles = elementStyles.value[elementId];
            element.style.fontFamily = styles.fontFamily || '';
            element.style.fontSize = (styles.fontSize || '') + (styles.fontSize ? 'px' : '');
            
            // Apply CMYK color if available
            if (styles.cmykColor) {
              let cmykColor;
              switch (styles.cmykColor) {
                case 'color1':
                  cmykColor = customColor1CMYK.value;
                  break;
                case 'color2':
                  cmykColor = customColor2CMYK.value;
                  break;
                default: // 'black'
                  cmykColor = { c: 0, m: 0, y: 0, k: 100 };
              }
              element.style.color = cmykToRgbCss(cmykColor.c, cmykColor.m, cmykColor.y, cmykColor.k);
            } else if (styles.color) {
              // Fallback for old saved styles
              element.style.color = styles.color;
            }
          }
        });
      }, 100);
    };

    // Multi-select text picker functions
    const toggleMultiSelectMode = () => {
      isMultiSelectMode.value = !isMultiSelectMode.value;
      
      if (!isMultiSelectMode.value) {
        // Clear existing selections when disabling multi-select
        clearAllSelections();
      }
    };



    const updateSelectedElements = () => {
      selectedTextElements.value = [];
      
      selectedElementIds.value.forEach(elementId => {
        const element = invoiceRef.value?.querySelector(`[data-text-id="${elementId}"]`);
        if (element) {
          selectedTextElements.value.push(element);
        }
      });
    };

    const clearAllSelections = () => {
      selectedElementIds.value = [];
      selectedTextElements.value = [];
      selectedTextElement.value = null;
      selectedElementId.value = '';
      
      // Remove visual indicators with all new styles
      if (invoiceRef.value) {
        const allElements = invoiceRef.value.querySelectorAll('[data-text-id]');
        allElements.forEach(element => {
          element.style.backgroundColor = '';
          element.style.outline = '';
          element.style.outlineOffset = '';
          element.style.borderRadius = '';
          element.style.boxShadow = '';
          element.title = '';
        });
      }
    };

    const selectAllText = () => {
      if (!isTextPickerMode.value || !isMultiSelectMode.value || !invoiceRef.value) return;
      
      clearAllSelections();
      
      const textElements = invoiceRef.value.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, td, th');
      
      textElements.forEach((element, index) => {
        if (!element.textContent.trim()) return;
        
        const elementId = element.getAttribute('data-text-id') || `text-element-${index}`;
        element.setAttribute('data-text-id', elementId);
        
        selectedElementIds.value.push(elementId);
        element.style.backgroundColor = `${cmykToRgbCss(cmykColors.blue2.c, cmykColors.blue2.m, cmykColors.blue2.y, cmykColors.blue2.k)}4D`; // 4D = 30% opacity
        element.style.outline = `2px solid ${cmykToRgbCss(cmykColors.blue2.c, cmykColors.blue2.m, cmykColors.blue2.y, cmykColors.blue2.k)}`;
      });
      
      updateSelectedElements();
    };

    const applyStylesToSelectedElements = () => {
      if (selectedTextElements.value.length === 0) return;
      
      // Save state before making changes for undo/redo
      saveState();
      
      selectedTextElements.value.forEach(element => {
        // Apply font family
        if (selectedElementStyles.value.fontFamily) {
          element.style.fontFamily = selectedElementStyles.value.fontFamily;
        }
        
        // Apply font size
        if (selectedElementStyles.value.fontSize) {
          element.style.fontSize = selectedElementStyles.value.fontSize + 'px';
        }
        
        // Apply CMYK color
        if (selectedElementStyles.value.cmykColor) {
          let cmykColor;
          switch (selectedElementStyles.value.cmykColor) {
            case 'color1':
              cmykColor = customColor1CMYK.value;
              break;
            case 'color2':
              cmykColor = customColor2CMYK.value;
              break;
            default: // 'black'
              cmykColor = { c: 0, m: 0, y: 0, k: 100 };
          }
          element.style.color = cmykToRgbCss(cmykColor.c, cmykColor.m, cmykColor.y, cmykColor.k);
        }
        
        // Save to element styles store
        const elementId = element.getAttribute('data-text-id');
        if (elementId) {
          elementStyles.value[elementId] = { ...selectedElementStyles.value };
        }
      });
      
      // Save to localStorage
      saveQuickSettings();
      
      // Save state for undo/redo
      saveState();
    };

    const resetSelectedElements = () => {
      if (selectedTextElements.value.length === 0) return;
      
      selectedTextElements.value.forEach(element => {
        // Reset styles
        element.style.fontFamily = '';
        element.style.fontSize = '';
        element.style.color = '';
        
        // Remove from element styles store
        const elementId = element.getAttribute('data-text-id');
        if (elementId && elementStyles.value[elementId]) {
          delete elementStyles.value[elementId];
        }
      });
      
      // Save to localStorage
      saveQuickSettings();
    };
    
    // Check text overflow function
    const checkTextOverflow = (element) => {
      if (!element) return false;
      
      // Check if text is overflowing horizontally
      const isOverflowing = element.scrollWidth > element.offsetWidth || 
                           element.scrollHeight > element.offsetHeight;
      
      return isOverflowing;
    };

    const autoAdjustFont = (element) => {
      if (!element || autoAdjustedElements.value.has(element)) return;
      
      // Skip elements with data-no-auto-adjust attribute (like organization name)
      if (element.hasAttribute('data-no-auto-adjust')) return;
      
      const elementId = element.getAttribute('data-text-id') || 
                       element.id || 
                       `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (!element.getAttribute('data-text-id')) {
        element.setAttribute('data-text-id', elementId);
      }

      const originalFont = window.getComputedStyle(element).fontFamily;
      const originalSize = parseInt(window.getComputedStyle(element).fontSize);
      
      // Try slim fonts first
      let adjusted = false;
      for (const slimFont of slimFonts) {
        element.style.fontFamily = slimFont;
        
        if (!checkTextOverflow(element)) {
          // Mark as auto-adjusted
          autoAdjustedElements.value.add(element);
          
          // Save the adjustment info
          if (!elementStyles.value[elementId]) {
            elementStyles.value[elementId] = {};
          }
          elementStyles.value[elementId].originalFont = originalFont;
          elementStyles.value[elementId].fontFamily = slimFont;
          elementStyles.value[elementId].fontSize = originalSize;
          elementStyles.value[elementId].autoAdjusted = true;
          
          adjusted = true;
          break;
        }
      }
      
      // If slim fonts don't work, try reducing font size
      if (!adjusted) {
        element.style.fontFamily = originalFont; // Reset font
        let newSize = originalSize;
        
        while (checkTextOverflow(element) && newSize > 8) {
          newSize -= 1;
          element.style.fontSize = newSize + 'px';
        }
        
        if (newSize < originalSize) {
          // Mark as auto-adjusted
          autoAdjustedElements.value.add(element);
          
          // Save the adjustment info
          if (!elementStyles.value[elementId]) {
            elementStyles.value[elementId] = {};
          }
          elementStyles.value[elementId].originalFont = originalFont;
          elementStyles.value[elementId].originalSize = originalSize;
          elementStyles.value[elementId].fontFamily = originalFont;
          elementStyles.value[elementId].fontSize = newSize;
          elementStyles.value[elementId].autoAdjusted = true;
        }
      }
      
      saveQuickSettings();
    };

    const setupAutoAdjustment = () => {
      if (!invoiceRef.value) return;
      
      // Set up mutation observer to watch for text changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            // Check all text elements for overflow
            const textElements = invoiceRef.value.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, td, th, input, textarea');
            textElements.forEach(element => {
              if (checkTextOverflow(element)) {
                autoAdjustFont(element);
              }
            });
          }
        });
      });
      
      // Observe the invoice for changes
      observer.observe(invoiceRef.value, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['value']
      });
      
      // Also check on input events
      const textInputs = invoiceRef.value.querySelectorAll('input, textarea');
      textInputs.forEach(input => {
        input.addEventListener('input', () => {
          setTimeout(() => {
            if (checkTextOverflow(input)) {
              autoAdjustFont(input);
            }
          }, 10);
        });
      });
      
      // Initial check
      setTimeout(() => {
        if (invoiceRef.value) {
          const textElements = invoiceRef.value.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, td, th, input, textarea');
          textElements.forEach(element => {
            if (checkTextOverflow(element)) {
              autoAdjustFont(element);
            }
          });
        }
      }, 100);
    };

    const resetAutoAdjustment = (element) => {
      if (!element) return;
      
      const elementId = element.getAttribute('data-text-id');
      if (!elementId || !elementStyles.value[elementId]?.autoAdjusted) return;
      
      const savedStyles = elementStyles.value[elementId];
      
      // Reset to original styles
      if (savedStyles.originalFont) {
        element.style.fontFamily = savedStyles.originalFont;
      }
      if (savedStyles.originalSize) {
        element.style.fontSize = savedStyles.originalSize + 'px';
      }
      
      // Remove from auto-adjusted set
      autoAdjustedElements.value.delete(element);
      
      // Remove auto-adjusted flag but keep other custom styles
      if (elementStyles.value[elementId]) {
        delete elementStyles.value[elementId].autoAdjusted;
        delete elementStyles.value[elementId].originalFont;
        delete elementStyles.value[elementId].originalSize;
        

        // If no other styles remain, remove the element entirely
        if (Object.keys(elementStyles.value[elementId]).length === 0) {
          delete elementStyles.value[elementId];
        }
      }
      
      saveQuickSettings();
    };
    
    // Handle preset size changes
    const handlePresetChange = (event) => {
      const preset = event.target.value;
      switch (preset) {
        case 'a4':
          invoiceWidth.value = 8.27;
          invoiceHeight.value = 11.69;
          break;
        case 'a5':
          invoiceWidth.value = 5.83;
          invoiceHeight.value = 8.27;
          break;
        case 'letter':
          invoiceWidth.value = 8.5;
          invoiceHeight.value = 11;
          break;
        case 'legal':
          invoiceWidth.value = 8.5;
          invoiceHeight.value = 14;
          break;
      }
      calculateMobileScale();
    };
    
    // Enhanced CMYK Export Functions
    const exportCMYKImage = async (format = 'jpeg', exportType = 'current', customName = null) => {
      if (!invoiceRef.value || !contentWrapperRef.value || isExporting.value) return;
      
      console.log('Starting CMYK Image export...', { format, exportType, customName });
      
      try {
        isExporting.value = true;
        
        // Use invoiceRef directly - no transform manipulations needed
        const targetElement = invoiceRef.value;
        
        if (!targetElement) {
          console.error('❌ No target element found for export');
          return;
        }
        
        console.log('📊 Target element for CMYK export:', {
          element: targetElement,
          offsetWidth: targetElement.offsetWidth,
          offsetHeight: targetElement.offsetHeight
        });
        
        // Use the target element directly
        let finalTargetElement = targetElement;
        
        // Store original styles for restoration
        let originalTransform = '';
        let originalPosition = '';
        let originalLeft = '';
        let originalTop = '';
        let originalMargin = '';
        let originalZIndex = '';
        
        // Wait for any pending renders
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('Target element dimensions:', finalTargetElement.offsetWidth, 'x', finalTargetElement.offsetHeight);
        
        const pagesToExport = exportType === 'all' ? totalCopies.value : 1;
        
        // Export single or multiple pages
        for (let page = 1; page <= pagesToExport; page++) {
          currentPage.value = page;
          await new Promise(resolve => setTimeout(resolve, 400));
          
          // Capture with simplified settings
          console.log('Capturing element with html2canvas...', finalTargetElement);
          
          const canvas = await html2canvas(finalTargetElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true,
            scrollX: 0,
            scrollY: 0
          });
          
          console.log('Canvas created:', canvas.width, 'x', canvas.height);
          
          // Convert to desired format
          const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
          const quality = format === 'jpeg' ? 0.98 : undefined;
          const imageData = canvas.toDataURL(mimeType, quality);
          
          // Create download
          const filename = customName 
            ? `${customName}-CMYK-Page${page}.${format}` 
            : `Invoice-CMYK-Page${page}.${format}`;
          
          const link = document.createElement('a');
          link.href = imageData;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          if (pagesToExport > 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        // Restore original styles - no longer needed since we don't modify anything
        // finalTargetElement styles remain unchanged
        
        // Restore contentWrapperRef transform - no longer needed
        // contentWrapperRef transform is now always 'none'
        
        console.log('CMYK Image export completed successfully');
        
      } catch (error) {
        console.error('CMYK Image export failed:', error);
        alert(`CMYK ${format.toUpperCase()} export failed. Please try again.`);
      } finally {
        isExporting.value = false;
      }
    };

    // NEW: Ghostscript-style CMYK Export - Preserves exact layout
    const exportGhostscriptCMYK = async (exportType = 'current', customName = null, format = 'pdf') => {
      if (!invoiceRef.value || !contentWrapperRef.value || isExporting.value) return;
      
      try {
        isExporting.value = true;
        console.log('Starting Ghostscript-style CMYK export...', { exportType, customName, format });
        
        // Use the invoiceRef directly - no transform manipulations needed
        const targetElement = invoiceRef.value;
        
        console.log('📊 Target element details:', {
          element: targetElement,
          offsetWidth: targetElement.offsetWidth,
          offsetHeight: targetElement.offsetHeight,
          scrollWidth: targetElement.scrollWidth,
          scrollHeight: targetElement.scrollHeight,
          clientWidth: targetElement.clientWidth,
          clientHeight: targetElement.clientHeight,
          computedStyle: window.getComputedStyle(targetElement).transform
        });

        // Check if backend server is available
        let backendAvailable = false;
        try {
          const healthCheck = await fetch('http://localhost:3001/api/cmyk/info', {
            method: 'GET',
            timeout: 5000
          });
          backendAvailable = healthCheck.ok;
        } catch (error) {
          console.warn('Backend server not available:', error);
        }

        if (!backendAvailable) {
          console.warn('CMYK Backend server not available, falling back to client-side export');
          
          // Fall back to enhanced client-side CMYK export
          return await exportCMYKImage(format, exportType, customName);
        }

        // Create progress indicator
        const progressDiv = document.createElement('div');
        progressDiv.innerHTML = `
          <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      background: rgba(0, 0, 0, 0.9); color: white; padding: 20px; 
                      border-radius: 8px; z-index: 10000; text-align: center;">
            <div style="font-size: 16px; margin-bottom: 10px;">🎨 Converting to CMYK</div>
            <div style="font-size: 12px; margin-bottom: 15px;">Preserving exact layout - No changes to positioning, fonts, or size</div>
            <div id="cmyk-progress-bar" style="width: 300px; height: 6px; background: #333; border-radius: 3px; overflow: hidden;">
              <div id="cmyk-progress-fill" style="width: 0%; height: 100%; background: #4f46e5; transition: width 0.3s;"></div>
            </div>
            <div style="margin-top: 10px; font-size: 11px; opacity: 0.8;">Your design stays exactly the same - only colors are converted to CMYK</div>
          </div>
        `;
        document.body.appendChild(progressDiv);

        const updateProgress = (percent, message) => {
          const fill = document.getElementById('cmyk-progress-fill');
          const text = progressDiv.querySelector('div');
          if (fill) fill.style.width = `${percent}%`;
          if (message) text.textContent = message;
        };

        // Step 1: Generate the original PDF/PNG exactly as shown
        updateProgress(20, '📄 Capturing exact design...');
        
        let originalBuffer;
        let fileName;
        
        // Calculate proper dimensions for print-ready output
        const dpi = 300; // High resolution for printing
        const inchToPx = dpi;
        const targetWidth = invoiceWidth.value * inchToPx;
        const targetHeight = invoiceHeight.value * inchToPx;

        if (format === 'pdf') {
          // Create exact PDF representation with proper dimensions
          console.log('📸 Capturing PDF with dimensions:', { targetWidth, targetHeight });
          
          const canvas = await html2canvas(targetElement, {
            scale: 2, // Reduced scale for better stability
            backgroundColor: '#ffffff',
            allowTaint: true,
            useCORS: true,
            foreignObjectRendering: false,
            imageTimeout: 15000,
            removeContainer: false,
            logging: false,
            scrollX: 0,
            scrollY: 0
          });

          console.log('✅ Canvas captured for PDF:', {
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            expectedWidth: targetWidth * 3,
            expectedHeight: targetHeight * 3
          });

          if (canvas.width === 0 || canvas.height === 0) {
            throw new Error('Canvas capture failed - zero dimensions');
          }

          const pdf = new jsPDF({
            unit: 'in',
            format: [invoiceWidth.value, invoiceHeight.value],
            orientation: 'portrait',
            compress: false // Don't compress to maintain CMYK conversion quality
          });

          const imgData = canvas.toDataURL('image/png', 1.0); // PNG for better quality
          pdf.addImage(imgData, 'PNG', 0, 0, invoiceWidth.value, invoiceHeight.value, '', 'FAST');
          
          originalBuffer = pdf.output('arraybuffer');
          fileName = customName ? `${customName}.pdf` : `Invoice-${Date.now()}.pdf`;
          
        } else {
          // Create exact image representation with print dimensions
          console.log('📸 Capturing image with dimensions:', { targetWidth, targetHeight });
          
          const canvas = await html2canvas(targetElement, {
            scale: 3, // High quality for print
            backgroundColor: '#ffffff',
            allowTaint: true,
            useCORS: true,
            foreignObjectRendering: false,
            imageTimeout: 15000,
            removeContainer: false,
            logging: false,
            width: targetWidth,
            height: targetHeight,
            dpi: dpi,
            pixelRatio: 1
          });

          console.log('✅ Canvas captured for image:', {
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            expectedWidth: targetWidth * 3,
            expectedHeight: targetHeight * 3
          });

          if (canvas.width === 0 || canvas.height === 0) {
            throw new Error('Canvas capture failed - zero dimensions');
          }

          if (format === 'jpeg') {
            originalBuffer = await new Promise(resolve => {
              canvas.toBlob(resolve, 'image/jpeg', 0.95); // High quality
            });
            fileName = customName ? `${customName}.jpg` : `Receipt-${Date.now()}.jpg`;
          } else {
            originalBuffer = await new Promise(resolve => {
              canvas.toBlob(resolve, 'image/png', 1.0);
            });
            fileName = customName ? `${customName}.png` : `Receipt-${Date.now()}.png`;
          }
        }

        console.log('📦 Original buffer size:', originalBuffer ? originalBuffer.byteLength || originalBuffer.size : 'undefined');

        if (!originalBuffer || (originalBuffer.byteLength === 0 && originalBuffer.size === 0)) {
          throw new Error('Failed to generate original file - buffer is empty');
        }

        updateProgress(60, '🎨 Converting to CMYK color space...');
        
        // Step 2: Send to backend for CMYK conversion
        const formData = new FormData();
        
        // Convert buffer to proper format for FormData
        let fileBlob;
        if (originalBuffer instanceof ArrayBuffer) {
          fileBlob = new Blob([originalBuffer], { 
            type: format === 'pdf' ? 'application/pdf' : `image/${format}` 
          });
        } else {
          fileBlob = originalBuffer; // Already a Blob
        }
        
        console.log('📤 Sending to backend:', {
          fileName,
          blobSize: fileBlob.size,
          blobType: fileBlob.type
        });

        formData.append('file', fileBlob, fileName);
        formData.append('preserveLayout', 'true');
        formData.append('colorProfile', 'default');

        const response = await fetch('http://localhost:3001/api/cmyk/convert', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`CMYK conversion failed: ${response.statusText}`);
        }

        updateProgress(90, '💾 Finalizing CMYK file...');

        // Step 3: Download the CMYK-converted file
        const cmykBuffer = await response.arrayBuffer();
        const metadata = JSON.parse(response.headers.get('X-CMYK-Metadata') || '{}');
        
        const fileExt = format === 'pdf' ? '.pdf' : '.png';
        const finalFileName = customName 
          ? `${customName}-CMYK${fileExt}` 
          : `Invoice-CMYK-${Date.now()}${fileExt}`;

        const blob = new Blob([cmykBuffer], { 
          type: format === 'pdf' ? 'application/pdf' : 'image/png' 
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = finalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        updateProgress(100, '✅ CMYK conversion complete!');
        
        // Show success message
        setTimeout(() => {
          document.body.removeChild(progressDiv);
          alert(`✅ Perfect CMYK Export Complete!\n\n` +
                `File: ${finalFileName}\n\n` +
                `✓ Exact layout preserved (Ghostscript-style)\n` +
                `✓ No position changes\n` +
                `✓ No font changes\n` +
                `✓ No size changes\n` +
                `✓ No design breaks\n` +
                `✓ No reflow\n` +
                `✓ Only color space converted to CMYK\n\n` +
                `Your file is ready for professional CMYK printing!\n` +
                `This conversion preserves YOUR EXACT design.`);
        }, 1000);

        console.log('Ghostscript-style CMYK export completed:', {
          originalSize: originalBuffer.byteLength,
          cmykSize: cmykBuffer.byteLength,
          metadata
        });

      } catch (error) {
        console.error('Ghostscript-style CMYK export failed:', error);
        
        // Remove progress indicator if it exists
        const progressDiv = document.querySelector('[style*="position: fixed"]');
        if (progressDiv) document.body.removeChild(progressDiv);
        
        alert(`❌ Perfect CMYK Export Failed\n\n${error.message}\n\nPlease ensure the export server is running (node export-server.cjs) and try again.`);
      } finally {
        // No transform restoration needed since we don't modify anything
        isExporting.value = false;
      }
    };
    
    // Enhanced CMYK Vector PDF Export Function - Accurately reflects actual design
    const exportCMYKVectorPDF = async (exportType = 'current', customName = null) => {
      if (!invoiceData.value || isExporting.value) return;
      
      try {
        isExporting.value = true;
        console.log('Starting CMYK export...', { exportType, customName });
        
        const pdf = new jsPDF({
          unit: 'in',
          format: [invoiceWidth.value, invoiceHeight.value],
          orientation: 'portrait'
        });
        
        console.log('PDF created with dimensions:', invoiceWidth.value, 'x', invoiceHeight.value);
        
        // Set CMYK color space
        try {
          pdf.internal.write('/ColorSpace /DeviceCMYK');
        } catch (error) {
          console.warn('Could not set CMYK color space:', error);
        }
        
        // Add CMYK color profile information
        const colorModeInfo = getColorModeDescription();
        pdf.setProperties({
          title: `Invoice ${invoiceData.value.invoiceNumber || currentInvoiceNumber.value}`,
          subject: `${colorModeInfo} - CMYK Vector Export`,
          author: organizationName.value || 'Professional Invoice',
          creator: 'SmartDesignPro - True CMYK Vector System',
          keywords: `CMYK, vector, ${colorMode.value}, invoice, professional`,
          colorSpace: 'CMYK'
        });
        
        // Keep the default page - don't delete it!
        console.log('PDF initialized with default page');
        
        // Function to set CMYK color in PDF
        const setCMYKColor = (c, m, y, k) => {
          try {
            pdf.internal.write(`${c/100} ${m/100} ${y/100} ${k/100} k`);
            pdf.internal.write(`${c/100} ${m/100} ${y/100} ${k/100} K`);
          } catch (error) {
            console.warn('Could not set CMYK color:', error);
            // Fallback to RGB
            const rgb = cmykToRgb(c, m, y, k);
            pdf.setTextColor(rgb.r, rgb.g, rgb.b);
            pdf.setFillColor(rgb.r, rgb.g, rgb.b);
          }
        };
        
        // Get current CMYK colors based on color mode
        const getCurrentCMYKColors = () => {
          switch (colorMode.value) {
            case 'one-color':
              return {
                primary: customColor1CMYK.value,
                accent: customColor1CMYK.value
              };
            case 'two-color':
              return {
                primary: customColor1CMYK.value,
                accent: customColor2CMYK.value
              };
            case 'three-color':
              return {
                primary: customColor1CMYK.value,
                accent: customColor3CMYK.value
              };
            default:
              return {
                primary: cmykColors.blue1,
                accent: cmykColors.blue2
              };
          }
        };
        
        // Function to draw vector elements based on actual template data
        const drawAccurateVectorInvoice = (pageNumber, isFirstPage = false) => {
          console.log('Drawing page:', pageNumber, 'First page:', isFirstPage);
          
          // Only add new page if it's not the first page (since we already have the default page)
          if (!isFirstPage) {
            pdf.addPage([invoiceWidth.value, invoiceHeight.value], 'portrait');
          }
          
          // Set margins to match template (0.5in padding from HTML)
          const margin = 0.5;
          const contentWidth = invoiceWidth.value - (margin * 2);
          const currentColors = getCurrentCMYKColors();
          let currentY = margin;
          
          // Header Section - Logo and Organization Info
          const headerHeight = 1.2;
          
          // Organization name with exact styling
          if (organizationName.value) {
            setCMYKColor(currentColors.primary.c, currentColors.primary.m, currentColors.primary.y, currentColors.primary.k);
            
            // Use a bold font to simulate Impact if not available, or standard bold
            pdf.setFont('helvetica', 'bold');
            
            // Dynamic font size calculation based on organization name length
            const nameLength = organizationName.value.length;
            const fontSize = nameLength > 30 ? 20 : nameLength > 20 ? 24 : 28;
            pdf.setFontSize(fontSize);
            
            // Center or left align based on logo presence
            const nameX = logoDataUrl.value ? margin + 1.2 : margin + contentWidth/2;
            const textAlign = logoDataUrl.value ? 'left' : 'center';
            
            if (textAlign === 'center') {
              const textWidth = pdf.getTextWidth(organizationName.value);
              pdf.text(organizationName.value, nameX - textWidth/2, currentY + 0.4);
            } else {
              pdf.text(organizationName.value, nameX, currentY + 0.4);
            }
            
            // Business Number (BN)
            if (businessNumber.value) {
              setCMYKColor(0, 0, 0, 100); // Black
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'normal');
              const bnText = `BN: ${businessNumber.value}`;
              
              if (textAlign === 'center') {
                 const nameWidth = pdf.getTextWidth(organizationName.value);
                 pdf.text(bnText, nameX + nameWidth/2 + 0.1, currentY + 0.2);
              } else {
                 const nameWidth = pdf.getTextWidth(organizationName.value);
                 pdf.text(bnText, nameX + nameWidth + 0.1, currentY + 0.2);
              }
            }
            
            // Organization subtitle
            if (organizationSubName.value) {
              setCMYKColor(0, 0, 0, 100); // Black
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'bold');
              
              if (textAlign === 'center') {
                const textWidth = pdf.getTextWidth(organizationSubName.value);
                pdf.text(organizationSubName.value, nameX - textWidth/2, currentY + 0.65);
              } else {
                pdf.text(organizationSubName.value, nameX, currentY + 0.65);
              }
            }
          }
          
          // Logo (Placeholder logic as we can't easily put base64 image in vector PDF without more processing, 
          // but we can draw a placeholder or try to add the image if supported)
          if (logoDataUrl.value) {
             try {
               // Attempt to add image if it's a valid format
               const imgProps = pdf.getImageProperties(logoDataUrl.value);
               const imgWidth = 1.0;
               const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
               pdf.addImage(logoDataUrl.value, 'PNG', margin, currentY, imgWidth, imgHeight);
             } catch (e) {
               console.warn('Could not add logo to PDF:', e);
             }
          }
          
          currentY += 0.8;
          
          // Address Section
          if (headOfficeAddress.value || headOfficePhone.value || branchAddress1.value || branch1Phone.value) {
            setCMYKColor(0, 0, 0, 100); // Black
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            
            let addressY = currentY;
            // Calculate column widths based on how many branches exist
            const hasBranch1 = branchAddress1.value || branch1Phone.value;
            const hasBranch2 = branchAddress2.value || branch2Phone.value;
            const cols = 1 + (hasBranch1 ? 1 : 0) + (hasBranch2 ? 1 : 0);
            const colWidth = contentWidth / cols;
            
            // Head Office
            let colX = margin;
            if (headOfficeAddress.value || headOfficePhone.value) {
              pdf.setFont('helvetica', 'bold');
              if (headOfficeAddress.value) {
                pdf.text('Head Office Address:', colX, addressY);
                pdf.setFont('helvetica', 'normal');
                const addressLines = pdf.splitTextToSize(headOfficeAddress.value, colWidth - 0.1);
                for (let i = 0; i < addressLines.length; i++) {
                  pdf.text(addressLines[i], colX + 1.4, addressY + (i * 0.15));
                }
              }
              
              if (headOfficePhone.value) {
                pdf.setFont('helvetica', 'bold');
                pdf.text('Tel:', colX, addressY + 0.3);
                pdf.setFont('helvetica', 'normal');
                pdf.text(headOfficePhone.value, colX + 0.3, addressY + 0.3);
              }
              colX += colWidth;
            }
            
            // Branch 1
            if (hasBranch1) {
              pdf.setFont('helvetica', 'bold');
              if (branchAddress1.value) {
                pdf.text('Branch Address 1:', colX, addressY);
                pdf.setFont('helvetica', 'normal');
                const addressLines = pdf.splitTextToSize(branchAddress1.value, colWidth - 0.1);
                for (let i = 0; i < addressLines.length; i++) {
                  pdf.text(addressLines[i], colX + 1.4, addressY + (i * 0.15));
                }
              }
              if (branch1Phone.value) {
                pdf.setFont('helvetica', 'bold');
                pdf.text('Tel:', colX, addressY + 0.3);
                pdf.setFont('helvetica', 'normal');
                pdf.text(branch1Phone.value, colX + 0.3, addressY + 0.3);
              }
              colX += colWidth;
            }
            
            currentY += 0.5;
          }
          
          // Receipt Title
          setCMYKColor(currentColors.accent.c, currentColors.accent.m, currentColors.accent.y, currentColors.accent.k);
          // Draw rounded rect background
          const titleText = 'CASH/CREDIT INVOICE';
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          const titleWidth = pdf.getTextWidth(titleText) + 0.4;
          pdf.roundedRect(margin + contentWidth/2 - titleWidth/2, currentY, titleWidth, 0.25, 0.05, 0.05, 'F');
          
          setCMYKColor(0, 0, 0, 0); // White text
          pdf.text(titleText, margin + contentWidth/2 - (titleWidth - 0.4)/2, currentY + 0.17);
          
          // Invoice number
          setCMYKColor(0, 0, 0, 100); // Black
          pdf.setFontSize(12);
          pdf.text(`No.: ${currentInvoiceNumber.value}`, margin + contentWidth - 1.2, currentY + 0.17);
          
          currentY += 0.4;
          
          // Customer Details Boxes
          setCMYKColor(0, 0, 0, 100); // Black outline
          pdf.setLineWidth(0.015);
          
          const boxHeight = 0.6;
          const leftBoxWidth = contentWidth * 0.65;
          const rightBoxWidth = contentWidth * 0.33;
          
          // Left box (Name and Address)
          pdf.roundedRect(margin, currentY, leftBoxWidth, boxHeight, 0.1, 0.1, 'S');
          
          // Customer name
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Name:', margin + 0.1, currentY + 0.2);
          
          // Dotted line for Name
          pdf.setLineWidth(0.005);
          pdf.setLineDash([0.02, 0.02], 0);
          pdf.line(margin + 0.6, currentY + 0.2, margin + leftBoxWidth - 0.1, currentY + 0.2);
          pdf.setLineDash([]); // Reset dash
          
          if (customerName.value) {
            pdf.setFont('helvetica', 'normal');
            pdf.text(customerName.value, margin + 0.6, currentY + 0.18);
          }
          
          // Customer address
          pdf.setFont('helvetica', 'bold');
          pdf.text('Address:', margin + 0.1, currentY + 0.45);
          
          // Dotted line for Address
          pdf.setLineDash([0.02, 0.02], 0);
          pdf.line(margin + 0.8, currentY + 0.45, margin + leftBoxWidth - 0.1, currentY + 0.45);
          pdf.setLineDash([]);
          
          if (customerAddress.value) {
            pdf.setFont('helvetica', 'normal');
            pdf.text(customerAddress.value, margin + 0.8, currentY + 0.43);
          }
          
          // Right box (Date and LPO)
          const rightBoxX = margin + contentWidth - rightBoxWidth;
          pdf.roundedRect(rightBoxX, currentY, rightBoxWidth, boxHeight, 0.1, 0.1, 'S');
          
          // Date
          pdf.setFont('helvetica', 'bold');
          pdf.text('Date:', rightBoxX + 0.1, currentY + 0.2);
          
          pdf.setLineDash([0.02, 0.02], 0);
          pdf.line(rightBoxX + 0.5, currentY + 0.2, rightBoxX + rightBoxWidth - 0.1, currentY + 0.2);
          pdf.setLineDash([]);
          
          if (date.value) {
            pdf.setFont('helvetica', 'normal');
            pdf.text(date.value, rightBoxX + 0.5, currentY + 0.18);
          }
          
          // LPO No
          pdf.setFont('helvetica', 'bold');
          pdf.text('L.P.O No.:', rightBoxX + 0.1, currentY + 0.45);
          
          pdf.setLineDash([0.02, 0.02], 0);
          pdf.line(rightBoxX + 0.8, currentY + 0.45, rightBoxX + rightBoxWidth - 0.1, currentY + 0.45);
          pdf.setLineDash([]);
          
          if (lpo.value) {
            pdf.setFont('helvetica', 'normal');
            pdf.text(lpo.value, rightBoxX + 0.8, currentY + 0.43);
          }
          
          currentY += boxHeight + 0.2;
          
          // Table
          const tableStartY = currentY;
          const tableHeaderHeight = 0.35;
          const rowHeight = 0.25;
          
          // Table header background
          setCMYKColor(currentColors.primary.c, currentColors.primary.m, currentColors.primary.y, currentColors.primary.k);
          pdf.rect(margin, tableStartY, contentWidth, tableHeaderHeight, 'F');
          
          // Column widths
          const qtyWidth = contentWidth * 0.08;
          const descWidth = invoiceData.value.taxEnabled ? contentWidth * 0.52 : contentWidth * 0.60;
          const rateWidth = invoiceData.value.taxEnabled ? contentWidth * 0.10 : contentWidth * 0.15;
          const taxWidth = invoiceData.value.taxEnabled ? contentWidth * 0.08 : 0;
          const amountWidth = contentWidth * 0.22; // Combined N & K
          
          // Table headers text
          setCMYKColor(0, 0, 0, 0); // White
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          
          pdf.text('QTY', margin + 0.1, tableStartY + 0.22);
          pdf.text('DESCRIPTION OF GOODS', margin + qtyWidth + 0.1, tableStartY + 0.22);
          pdf.text('RATE', margin + qtyWidth + descWidth + 0.1, tableStartY + 0.22);
          if (invoiceData.value.taxEnabled) {
             pdf.text('TAX%', margin + qtyWidth + descWidth + rateWidth + 0.1, tableStartY + 0.22);
          }
          
          // Amount Header with N and K
          const amountX = margin + contentWidth - amountWidth;
          pdf.text('AMOUNT', amountX + amountWidth/2 - 0.3, tableStartY + 0.12);
          
          pdf.setFontSize(8);
          pdf.text('N (N)', amountX + 0.2, tableStartY + 0.28);
          pdf.text('(K)', amountX + amountWidth - 0.4, tableStartY + 0.28);
          
          // Vertical line in Amount header
          pdf.setLineWidth(0.01);
          pdf.line(amountX + amountWidth * 0.7, tableStartY, amountX + amountWidth * 0.7, tableStartY + tableHeaderHeight);
          
          currentY += tableHeaderHeight;
          
          // Table Rows
          setCMYKColor(0, 0, 0, 100); // Black
          pdf.setFont('helvetica', 'normal');
          
          // Calculate max rows
          const availableHeight = invoiceHeight.value - currentY - 1.5; // Space for footer
          const maxRows = Math.max(10, Math.floor(availableHeight / rowHeight));
          
          items.value.slice(0, maxRows).forEach((item, index) => {
            const rowY = currentY + (index * rowHeight);
            
            // Qty
            if (item.quantity) pdf.text(String(item.quantity), margin + 0.1, rowY + 0.17);
            
            // Description
            if (item.description) {
               const desc = item.description.length > 50 ? item.description.substring(0, 47) + '...' : item.description;
               pdf.text(desc, margin + qtyWidth + 0.1, rowY + 0.17);
            }
            
            // Rate
            if (item.price) pdf.text(item.price.toFixed(2), margin + qtyWidth + descWidth + 0.1, rowY + 0.17);
            
            // Tax
            if (invoiceData.value.taxEnabled && item.tax) pdf.text(String(item.tax), margin + qtyWidth + descWidth + rateWidth + 0.1, rowY + 0.17);
            
            // Amount Background (Accent color light)
            setCMYKColor(currentColors.accent.c * 0.1, currentColors.accent.m * 0.1, currentColors.accent.y * 0.1, currentColors.accent.k * 0.1);
            pdf.rect(amountX, rowY, amountWidth, rowHeight, 'F');
            
            setCMYKColor(0, 0, 0, 100); // Black text
            
            // Naira
            if (item.naira) pdf.text(String(item.naira), amountX + 0.1, rowY + 0.17);
            
            // Kobo
            if (item.kobo) pdf.text(String(item.kobo), amountX + amountWidth * 0.75, rowY + 0.17);
            
            // Horizontal line
            pdf.setLineWidth(0.005);
            pdf.line(margin, rowY + rowHeight, margin + contentWidth, rowY + rowHeight);
          });
          
          // Fill empty rows
          for (let i = items.value.length; i < maxRows; i++) {
             const rowY = currentY + (i * rowHeight);
             pdf.setLineWidth(0.005);
             pdf.line(margin, rowY + rowHeight, margin + contentWidth, rowY + rowHeight);
          }
          
          const tableEndY = currentY + (maxRows * rowHeight);
          
          // Vertical Lines
          pdf.setLineWidth(0.01);
          pdf.line(margin, tableStartY, margin, tableEndY); // Left
          pdf.line(margin + qtyWidth, tableStartY, margin + qtyWidth, tableEndY);
          pdf.line(margin + qtyWidth + descWidth, tableStartY, margin + qtyWidth + descWidth, tableEndY);
          pdf.line(margin + qtyWidth + descWidth + rateWidth, tableStartY, margin + qtyWidth + descWidth + rateWidth, tableEndY);
          if (invoiceData.value.taxEnabled) {
             pdf.line(margin + qtyWidth + descWidth + rateWidth + taxWidth, tableStartY, margin + qtyWidth + descWidth + rateWidth + taxWidth, tableEndY);
          }
          pdf.line(margin + contentWidth, tableStartY, margin + contentWidth, tableEndY); // Right
          pdf.line(amountX, tableStartY, amountX, tableEndY); // Amount start
          pdf.line(amountX + amountWidth * 0.7, tableStartY, amountX + amountWidth * 0.7, tableEndY); // N/K divider
          
          // Total Row
          const totalY = tableEndY;
          pdf.setFont('helvetica', 'bold');
          pdf.text('TOTAL:', amountX - 0.6, totalY + 0.2);
          
          // Total Box
          pdf.rect(amountX, totalY, amountWidth, 0.3, 'S');
          pdf.line(amountX + amountWidth * 0.7, totalY, amountX + amountWidth * 0.7, totalY + 0.3);
          
          if (totalNaira.value) pdf.text(String(totalNaira.value), amountX + 0.1, totalY + 0.2);
          if (totalKobo.value) pdf.text(String(totalKobo.value), amountX + amountWidth * 0.75, totalY + 0.2);
          
          currentY = totalY + 0.5;
          
          // Footer
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Received the above goods in good condition', margin, currentY);
          pdf.text('No refund of money after payment.', margin, currentY + 0.15);
          
          currentY += 0.4;
          
          // Amount in words
          pdf.setFont('helvetica', 'bold');
          pdf.text('Amount in words:', margin, currentY);
          
          pdf.setLineDash([0.02, 0.02], 0);
          pdf.line(margin + 1.2, currentY, margin + contentWidth, currentY);
          pdf.setLineDash([]);
          
          if (sumOf.value) {
             pdf.setFont('helvetica', 'bold');
             pdf.text(sumOf.value, margin + 1.3, currentY - 0.02);
          }
          
          // Second line for amount in words
          currentY += 0.25;
          pdf.setLineDash([0.02, 0.02], 0);
          pdf.line(margin, currentY, margin + contentWidth - 1.5, currentY);
          pdf.setLineDash([]);
          
          if (sumOf2.value) {
             pdf.text(sumOf2.value, margin, currentY - 0.02);
          }
          
          pdf.setFont('helvetica', 'normal');
          pdf.text('Naira', margin + contentWidth - 1.4, currentY);
          pdf.text('Kobo', margin + contentWidth - 0.5, currentY);
          
          currentY += 0.4;
          
          // Thanks message
          setCMYKColor(currentColors.primary.c, currentColors.primary.m, currentColors.primary.y, currentColors.primary.k);
          pdf.setFontSize(12);
          const thanksText = 'Thanks for your patronage';
          const thanksWidth = pdf.getTextWidth(thanksText);
          pdf.text(thanksText, margin + contentWidth/2 - thanksWidth/2, currentY);
          
          currentY += 0.5;
          
          // Signatures
          setCMYKColor(0, 0, 0, 100); // Black
          pdf.setLineWidth(0.01);
          
          // Left Sig
          pdf.line(margin + 0.5, currentY, margin + 2.5, currentY);
          const sigText = 'Signature';
          const sigWidth = pdf.getTextWidth(sigText);
          pdf.text(sigText, margin + 1.5 - sigWidth/2, currentY + 0.15);
          
          // Right Sig
          pdf.line(margin + contentWidth - 2.5, currentY, margin + contentWidth - 0.5, currentY);
          pdf.text(sigText, margin + contentWidth - 1.5 - sigWidth/2, currentY + 0.15);
        };
        
        // Generate pages
        const pagesToExport = exportType === 'all' ? totalCopies.value : 1;
        console.log('Generating pages:', pagesToExport);
        
        for (let page = 1; page <= pagesToExport; page++) {
          console.log('Drawing page:', page);
          drawAccurateVectorInvoice(page, page === 1); // Mark first page
        }
        
        console.log('PDF generation complete. Saving...');
        
        // Save PDF with CMYK color information
        const filename = customName ? `${customName}-CMYK-Vector.pdf` : `Invoice-CMYK-Vector-${pagesToExport}Pages.pdf`;
        console.log('Saving with filename:', filename);
        pdf.save(filename);
        
        console.log('CMYK export completed successfully');
        
      } catch (error) {
        console.error('CMYK Vector export failed:', error);
        alert(`CMYK Vector export failed: ${error.message}. Please try again.`);
      } finally {
        isExporting.value = false;
      }
    };
    
    // Export handlers
    const handleExportPDF = async (exportType = 'current', customName = null) => {
      if (!invoiceRef.value || isExporting.value) return;
      
      // Store original styles
      let originalTransform = '';
      let originalPosition = '';
      let originalLeft = '';
      let originalTop = '';
      let originalMargin = '';
      let originalWidth = '';
      let parentOriginalTransform = '';
      let parentOriginalWidth = '';
      let parentOriginalHeight = '';
      let parentOriginalMaxHeight = '';
      let orgOriginalStyles = {};
      
      try {
        isExporting.value = true;
        
        // Get parent wrapper element
        const parentWrapper = invoiceRef.value.parentElement;
        
        // Store original styles from both invoice and parent
        originalTransform = invoiceRef.value.style.transform;
        originalPosition = invoiceRef.value.style.position;
        originalLeft = invoiceRef.value.style.left;
        originalTop = invoiceRef.value.style.top;
        originalMargin = invoiceRef.value.style.margin;
        originalWidth = invoiceRef.value.style.width;
        
        if (parentWrapper) {
          parentOriginalTransform = parentWrapper.style.transform;
          parentOriginalWidth = parentWrapper.style.width;
          parentOriginalHeight = parentWrapper.style.height;
          parentOriginalMaxHeight = parentWrapper.style.maxHeight;
          
          // Remove parent transform and constraints that affect positioning
          parentWrapper.style.transform = 'none';
          parentWrapper.style.width = 'auto';
          parentWrapper.style.height = 'auto';
          parentWrapper.style.maxHeight = 'none';
        }
        
        // Preserve organization name styles before export
        const orgElement = invoiceRef.value.querySelector('.organization-name');
        if (orgElement) {
          orgOriginalStyles = {
            fontFamily: orgElement.style.fontFamily || window.getComputedStyle(orgElement).fontFamily,
            fontWeight: orgElement.style.fontWeight || window.getComputedStyle(orgElement).fontWeight,
            fontSize: orgElement.style.fontSize || window.getComputedStyle(orgElement).fontSize,
            letterSpacing: orgElement.style.letterSpacing || window.getComputedStyle(orgElement).letterSpacing,
            textTransform: orgElement.style.textTransform || window.getComputedStyle(orgElement).textTransform
          };
        }
        
        // Temporarily apply print styles and fix position
        invoiceRef.value.style.transform = 'none';
        invoiceRef.value.style.position = 'relative';
        invoiceRef.value.style.left = '0';
        invoiceRef.value.style.top = '0';
        invoiceRef.value.style.margin = '0 auto';
        
        // Force organization name font to ensure it stays consistent
        if (orgElement) {
          orgElement.style.fontFamily = 'Anton, "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif !important';
          orgElement.style.fontWeight = '900 !important';
          orgElement.style.fontStretch = 'normal !important';
          orgElement.style.textTransform = 'uppercase !important';
          orgElement.style.letterSpacing = '0.02em !important';
        }
        
        // Capture and lock table row heights before export
        const tableRows = invoiceRef.value.querySelectorAll('table tbody tr');
        const originalRowHeights = [];
        tableRows.forEach((row, index) => {
          const computedHeight = window.getComputedStyle(row).height;
          originalRowHeights[index] = { 
            element: row, 
            height: computedHeight,
            originalStyle: row.style.height 
          };
          row.style.height = computedHeight;
          row.style.minHeight = computedHeight;
          row.style.maxHeight = computedHeight;
          
          // Also lock cell heights and inner div heights
          const cells = row.querySelectorAll('td');
          cells.forEach(cell => {
            const cellStyles = window.getComputedStyle(cell);
            const cellHeight = cellStyles.height;
            const paddingTop = cellStyles.paddingTop;
            const paddingBottom = cellStyles.paddingBottom;
            
            cell.style.height = cellHeight;
            cell.style.minHeight = cellHeight;
            cell.style.maxHeight = cellHeight;
            cell.style.paddingTop = paddingTop;
            cell.style.paddingBottom = paddingBottom;
            cell.style.boxSizing = 'border-box';
            
            // Lock the height of print-only divs inside cells
            const printDivs = cell.querySelectorAll('.print-only');
            printDivs.forEach(div => {
              const divStyles = window.getComputedStyle(div);
              const divHeight = divStyles.height;
              div.style.height = divHeight;
              div.style.minHeight = divHeight;
              div.style.maxHeight = divHeight;
              div.style.lineHeight = divStyles.lineHeight;
              div.style.boxSizing = 'border-box';
            });
          });
        });
        
        // Wait for styles to apply and fonts to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Force font loading to prevent symbol rendering in exports
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
        
        // Additional delay for font rendering
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (exportType === 'all') {
          // Export all pages as single combined PDF with multiple pages
          const originalPage = currentPage.value;
          const pagesToExport = Math.max(1, totalCopies.value);
          
          // No transform manipulation needed
          
          // Show progress indicator
          const progressDiv = document.createElement('div');
          progressDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
                        z-index: 10000; font-family: system-ui; text-align: center;">
              <div style="margin-bottom: 12px;">📄 Combining pages into PDF...</div>
              <div style="font-size: 14px; color: #666;">Page <span id="current-page">1</span> of ${pagesToExport}</div>
              <div style="width: 200px; height: 4px; background: #f0f0f0; border-radius: 2px; margin: 8px 0; overflow: hidden;">
                <div id="progress-bar" style="width: 0%; height: 100%; background: #4f46e5; transition: width 0.3s;"></div>
              </div>
            </div>
          `;
          document.body.appendChild(progressDiv);
          
          try {
            // Create PDF instance - Remove default first page since we'll add our own
            const pdf = new jsPDF({
              unit: 'in',
              format: [invoiceWidth.value, invoiceHeight.value],
              orientation: 'portrait'
            });
            
            // Add CMYK color profile information to PDF metadata
            const colorModeInfo = getColorModeDescription();
            pdf.setProperties({
              title: `Invoice ${invoiceData.value.invoiceNumber || currentInvoiceNumber.value}`,
              subject: `${colorModeInfo} - ${colorMode.value.toUpperCase()}`,
              author: invoiceData.value.organizationName || 'Professional Invoice',
              creator: 'SmartDesignPro - CMYK Color System',
              keywords: `CMYK, ${colorMode.value}, invoice, professional, ${colorModeInfo}`,
              colorSpace: colorMode.value !== 'full-color' ? 'CMYK' : 'RGB'
            });
            
            // Add CMYK color information as custom PDF properties
            if (colorMode.value !== 'full-color') {
              pdf.addMetadata('Custom', 'CMYKColorMode', colorMode.value);
              pdf.addMetadata('Custom', 'PrimaryColor', `C:${customColor1CMYK.value.c} M:${customColor1CMYK.value.m} Y:${customColor1CMYK.value.y} K:${customColor1CMYK.value.k}`);
              if (colorMode.value === 'two-color' || colorMode.value === 'three-color') {
                pdf.addMetadata('Custom', 'SecondaryColor', `C:${customColor2CMYK.value.c} M:${customColor2CMYK.value.m} Y:${customColor2CMYK.value.y} K:${customColor2CMYK.value.k}`);
              }
              if (colorMode.value === 'three-color') {
                pdf.addMetadata('Custom', 'TertiaryColor', `C:${customColor3CMYK.value.c} M:${customColor3CMYK.value.m} Y:${customColor3CMYK.value.y} K:${customColor3CMYK.value.k}`);
              }
            }
            
            // Remove the default empty page that jsPDF creates
            pdf.deletePage(1);
            
            for (let page = 1; page <= totalCopies.value; page++) {
              // Update progress
              const currentPageEl = document.getElementById('current-page');
              const progressBar = document.getElementById('progress-bar');
              if (currentPageEl) currentPageEl.textContent = page;
              if (progressBar) progressBar.style.width = `${(page / pagesToExport) * 100}%`;
              
              currentPage.value = page;
              // Wait for page to fully update and render
              await new Promise(resolve => setTimeout(resolve, 600));
              
              // Ensure we have the content wrapper reference
              const targetElement = invoiceRef.value;
              
              // Capture current page using htmlToImage for better quality
              const imgData = await htmlToImage.toJpeg(targetElement, {
                quality: 0.98,
                pixelRatio: 3,
                cacheBust: true,
                backgroundColor: cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k),
                skipFonts: true,
                fontEmbedCSS: '',
                allowTaint: true,
                width: targetElement.scrollWidth,
                height: targetElement.scrollHeight
              });
              
              // Add new page to PDF for each page
              pdf.addPage([invoiceWidth.value, invoiceHeight.value], 'portrait');
              pdf.addImage(imgData, 'JPEG', 0, 0, invoiceWidth.value, invoiceHeight.value);
              
              // Add color information as metadata annotation for the first page
              if (page === 1 && colorMode.value !== 'full-color') {
                let colorInfo = `Color Mode: ${colorMode.value.toUpperCase()}\\n`;
                colorInfo += `Primary: C:${customColor1CMYK.value.c}% M:${customColor1CMYK.value.m}% Y:${customColor1CMYK.value.y}% K:${customColor1CMYK.value.k}%\\n`;
                if (colorMode.value === 'two-color' || colorMode.value === 'three-color') {
                  colorInfo += `Secondary: C:${customColor2CMYK.value.c}% M:${customColor2CMYK.value.m}% Y:${customColor2CMYK.value.y}% K:${customColor2CMYK.value.k}%\\n`;
                }
                if (colorMode.value === 'three-color') {
                  colorInfo += `Tertiary: C:${customColor3CMYK.value.c}% M:${customColor3CMYK.value.m}% Y:${customColor3CMYK.value.y}% K:${customColor3CMYK.value.k}%\\n`;
                }
                
                // Add invisible text annotation with color information
                pdf.setFontSize(6);
                pdf.setTextColor(255, 255, 255); // White text (invisible on white background)
                pdf.text(colorInfo, 0.01, 0.01);
              }
              
              // Delay between captures for stability
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // Remove progress indicator
            document.body.removeChild(progressDiv);
            
            // Save the combined PDF
            const filename = customName ? `${customName}.pdf` : `Combined-Invoice-${pagesToExport}-Pages.pdf`;
            const isNative = Capacitor.isNativePlatform();
            
            if (isNative) {
              try {
                // Save to Cache first, then share so user can save anywhere
                const pdfBase64 = pdf.output('datauri');
                const base64Data = pdfBase64.split(',')[1];
                const savedFile = await Filesystem.writeFile({
                  path: filename,
                  data: base64Data,
                  directory: Directory.Cache,
                  recursive: true
                });
                
                console.log('✅ Multi-page PDF saved to cache:', savedFile.uri);
                
                // Share the PDF so user can save to Downloads, Drive, etc.
                await Share.share({
                  title: 'Save Invoice PDF',
                  text: `Save ${filename} (${pagesToExport} pages) to your device`,
                  url: savedFile.uri,
                  dialogTitle: 'Save Multi-page PDF'
                });
                
                console.log('✅ PDF shared - user can now save to Downloads');
              } catch (error) {
                console.error('PDF save and share error:', error);
                alert('❌ Failed to save PDF.\\n\\nPlease check app permissions in Settings.');
              }
            } else {
              try {
                pdf.save(filename);
              } catch (error) {
                console.warn('Standard save failed, trying alternative method:', error);
                const pdfOutput = pdf.output('blob');
                const url = URL.createObjectURL(pdfOutput);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }
            }
            
          } catch (error) {
            // Remove progress indicator on error
            if (document.body.contains(progressDiv)) {
              document.body.removeChild(progressDiv);
            }
            throw error;
          } finally {
            // No transform restoration needed
          }
          
          // Restore original page
          currentPage.value = originalPage;
          return;
        }
        
        const filename = customName ? `${customName}.pdf` : `Invoice-${currentInvoiceNumber.value.replace('/', '-')}.pdf`;
        
        const isNative = Capacitor.isNativePlatform();
        const targetElement = invoiceRef.value;
        
        // Capture using htmlToImage for better quality
        const imgData = await htmlToImage.toJpeg(targetElement, {
          quality: 0.98,
          pixelRatio: 3,
          cacheBust: true,
          backgroundColor: cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k),
          skipFonts: true,
          fontEmbedCSS: '',
          allowTaint: true,
          width: targetElement.scrollWidth,
          height: targetElement.scrollHeight
        });
        
        const pdf = new jsPDF({
          unit: 'in',
          format: [invoiceWidth.value, invoiceHeight.value],
          orientation: 'portrait'
        });
        
        const colorModeInfo = getColorModeDescription();
        pdf.setProperties({
          title: `Invoice ${invoiceData.value.invoiceNumber || currentInvoiceNumber.value}`,
          subject: `${colorModeInfo} - ${colorMode.value.toUpperCase()}`,
          author: invoiceData.value.organizationName || 'Professional Invoice',
          creator: 'SmartDesignPro - CMYK Color System',
          keywords: `CMYK, ${colorMode.value}, invoice, professional, ${colorModeInfo}`,
          colorSpace: colorMode.value !== 'full-color' ? 'CMYK' : 'RGB'
        });
        
        if (colorMode.value !== 'full-color') {
          pdf.addMetadata('Custom', 'CMYKColorMode', colorMode.value);
          pdf.addMetadata('Custom', 'PrimaryColor', `C:${customColor1CMYK.value.c} M:${customColor1CMYK.value.m} Y:${customColor1CMYK.value.y} K:${customColor1CMYK.value.k}`);
          if (colorMode.value === 'two-color' || colorMode.value === 'three-color') {
            pdf.addMetadata('Custom', 'SecondaryColor', `C:${customColor2CMYK.value.c} M:${customColor2CMYK.value.m} Y:${customColor2CMYK.value.y} K:${customColor2CMYK.value.k}`);
          }
          if (colorMode.value === 'three-color') {
            pdf.addMetadata('Custom', 'TertiaryColor', `C:${customColor3CMYK.value.c} M:${customColor3CMYK.value.m} Y:${customColor3CMYK.value.y} K:${customColor3CMYK.value.k}`);
          }
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, invoiceWidth.value, invoiceHeight.value);
        
        if (isNative) {
          try {
            // Save to Cache first, then share so user can save anywhere
            const pdfBase64 = pdf.output('datauri');
            const base64Data = pdfBase64.split(',')[1];
            const savedFile = await Filesystem.writeFile({
              path: filename,
              data: base64Data,
              directory: Directory.Cache,
              recursive: true
            });
            
            console.log('✅ PDF saved to cache:', savedFile.uri);
            
            // Share the PDF so user can save to Downloads, Drive, etc.
            await Share.share({
              title: 'Save Invoice PDF',
              text: `Save ${filename} to your device`,
              url: savedFile.uri,
              dialogTitle: 'Save Invoice PDF'
            });
            
            console.log('✅ PDF shared - user can now save to Downloads');
          } catch (error) {
            console.error('PDF save and share error:', error);
            alert('❌ Failed to save PDF.\\n\\nPlease check app permissions in Settings.');
          }
        } else {
          try {
            pdf.save(filename);
          } catch (saveError) {
            const pdfOutput = pdf.output('blob');
            const url = URL.createObjectURL(pdfOutput);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }
        
        // Restore table row heights
        originalRowHeights.forEach(({ element, originalStyle }) => {
          element.style.height = originalStyle;
          element.style.minHeight = '';
          element.style.maxHeight = '';
          
          // Restore cell heights and inner div heights
          const cells = element.querySelectorAll('td');
          cells.forEach(cell => {
            cell.style.height = '';
            cell.style.minHeight = '';
            cell.style.maxHeight = '';
            cell.style.paddingTop = '';
            cell.style.paddingBottom = '';
            cell.style.boxSizing = '';
            
            // Restore print-only div heights
            const printDivs = cell.querySelectorAll('.print-only');
            printDivs.forEach(div => {
              div.style.height = '';
              div.style.minHeight = '';
              div.style.maxHeight = '';
              div.style.lineHeight = '';
              div.style.boxSizing = '';
            });
          });
        });
        
        // Restore original styles
        if (parentWrapper) {
          parentWrapper.style.transform = parentOriginalTransform;
          parentWrapper.style.width = parentOriginalWidth;
          parentWrapper.style.height = parentOriginalHeight;
          parentWrapper.style.maxHeight = parentOriginalMaxHeight;
        }
        
        invoiceRef.value.style.transform = originalTransform;
        invoiceRef.value.style.position = originalPosition;
        invoiceRef.value.style.left = originalLeft;
        invoiceRef.value.style.top = originalTop;
        invoiceRef.value.style.margin = originalMargin;
        invoiceRef.value.style.width = originalWidth;
        
        // Restore organization name styles
        if (orgElement && orgOriginalStyles) {
          orgElement.style.fontFamily = orgOriginalStyles.fontFamily || '';
          orgElement.style.fontWeight = orgOriginalStyles.fontWeight || '';
          orgElement.style.fontSize = orgOriginalStyles.fontSize || '';
          orgElement.style.letterSpacing = orgOriginalStyles.letterSpacing || '';
          orgElement.style.textTransform = orgOriginalStyles.textTransform || '';
        }
        
        // Log export activity
        const member = JSON.parse(safeLocalStorage.getItem('sdp_authenticated_member') || '{}');
        await logActivity(member.branch || route.query.branch, {
          action: `Invoice Exported (PDF)`,
          memberName: member.name || 'Unknown Member',
          type: 'export',
          details: {
            documentNumber: currentInvoiceNumber.value,
            exportFormat: 'pdf',
            exportType: exportType,
            pageCount: exportType === 'all' ? totalCopies.value : 1
          }
        });
        
        if (exportType === 'all' && totalCopies.value > 1) {
          alert(`✅ All ${totalCopies.value} invoice pages exported as PDF successfully!`);
        } else {
          alert('✅ Invoice exported as PDF successfully!');
        }
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert(`❌ Failed to export PDF: ${error.message}`);
        
        // Restore styles on error
        if (invoiceRef.value) {
          const parentWrapper = invoiceRef.value.parentElement;
          if (parentWrapper) {
            parentWrapper.style.transform = parentOriginalTransform || '';
            parentWrapper.style.width = parentOriginalWidth || '';
            parentWrapper.style.height = parentOriginalHeight || '';
            parentWrapper.style.maxHeight = parentOriginalMaxHeight || '';
          }
          
          invoiceRef.value.style.transform = originalTransform || '';
          invoiceRef.value.style.position = originalPosition || '';
          invoiceRef.value.style.left = originalLeft || '';
          invoiceRef.value.style.top = originalTop || '';
          invoiceRef.value.style.margin = originalMargin || '';
          invoiceRef.value.style.width = originalWidth || '';
          
          const printOnlyElements = invoiceRef.value.querySelectorAll('.print-only');
          const noPrintElements = invoiceRef.value.querySelectorAll('.no-print');
          printOnlyElements.forEach(el => {
            el.style.display = '';
            el.style.visibility = '';
          });
          noPrintElements.forEach(el => {
            el.style.display = '';
            el.style.visibility = '';
          });
        }
      } finally {
        isExporting.value = false;
      }
    };
    
    const handleExportJPEG = async (exportType = 'current', customName = null) => {
      if (!invoiceRef.value || isExporting.value) return;
      
      // Store original styles
      let originalTransform = '';
      let originalPosition = '';
      let originalLeft = '';
      let originalTop = '';
      let originalMargin = '';
      let originalWidth = '';
      let parentOriginalTransform = '';
      let parentOriginalWidth = '';
      let parentOriginalHeight = '';
      let parentOriginalMaxHeight = '';
      
      try {
        isExporting.value = true;
        
        // Get parent wrapper element
        const parentWrapper = invoiceRef.value.parentElement;
        
        // Store original styles from both invoice and parent
        originalTransform = invoiceRef.value.style.transform;
        originalPosition = invoiceRef.value.style.position;
        originalLeft = invoiceRef.value.style.left;
        originalTop = invoiceRef.value.style.top;
        originalMargin = invoiceRef.value.style.margin;
        originalWidth = invoiceRef.value.style.width;
        
        if (parentWrapper) {
          parentOriginalTransform = parentWrapper.style.transform;
          parentOriginalWidth = parentWrapper.style.width;
          parentOriginalHeight = parentWrapper.style.height;
          parentOriginalMaxHeight = parentWrapper.style.maxHeight;
          
          // Remove parent transform and constraints that affect positioning
          parentWrapper.style.transform = 'none';
          parentWrapper.style.width = 'auto';
          parentWrapper.style.height = 'auto';
          parentWrapper.style.maxHeight = 'none';
        }
        
        // Store original shadow style and padding
        const originalBoxShadow = invoiceRef.value.style.boxShadow;
        const originalPadding = invoiceRef.value.style.padding;
        
        // Store contentWrapperRef transform - not needed since it's always 'none' now
        let contentWrapperOriginalTransform = '';
        
        // No element style manipulation needed for export
        
        // Capture and lock table row heights before export
        const tableRows = invoiceRef.value.querySelectorAll('table tbody tr');
        const originalRowHeights = [];
        tableRows.forEach((row, index) => {
          const computedHeight = window.getComputedStyle(row).height;
          originalRowHeights[index] = { 
            element: row, 
            height: computedHeight,
            originalStyle: row.style.height 
          };
          row.style.height = computedHeight;
          row.style.minHeight = computedHeight;
          row.style.maxHeight = computedHeight;
          
          // Also lock cell heights and inner div heights
          const cells = row.querySelectorAll('td');
          cells.forEach(cell => {
            const cellStyles = window.getComputedStyle(cell);
            const cellHeight = cellStyles.height;
            const paddingTop = cellStyles.paddingTop;
            const paddingBottom = cellStyles.paddingBottom;
            
            cell.style.height = cellHeight;
            cell.style.minHeight = cellHeight;
            cell.style.maxHeight = cellHeight;
            cell.style.paddingTop = paddingTop;
            cell.style.paddingBottom = paddingBottom;
            cell.style.boxSizing = 'border-box';
            
            // Lock the height of print-only divs inside cells
            const printDivs = cell.querySelectorAll('.print-only');
            printDivs.forEach(div => {
              const divStyles = window.getComputedStyle(div);
              const divHeight = divStyles.height;
              div.style.height = divHeight;
              div.style.minHeight = divHeight;
              div.style.maxHeight = divHeight;
              div.style.lineHeight = divStyles.lineHeight;
              div.style.boxSizing = 'border-box';
            });
          });
        });
        
        // Wait for styles to apply and fonts to load
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Force font loading to prevent symbol rendering in exports
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
        
        // Additional delay for font rendering
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (exportType === 'all' && totalCopies.value > 1) {
          // Export all pages as separate JPEGs
          const originalPage = currentPage.value;
          // Collect all pages first, then download
          const downloads = [];
          
          for (let page = 1; page <= totalCopies.value; page++) {
            currentPage.value = page;
            // Wait longer for page to fully update and render
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const dataUrl = await htmlToImage.toJpeg(invoiceRef.value, { 
              quality: 0.98, 
              pixelRatio: 3,
              cacheBust: true,
              backgroundColor: cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k),
              skipFonts: true, // Skip font embedding to avoid CORS issues
              fontEmbedCSS: '',
              allowTaint: true,
              width: invoiceWidth.value * 96, // Convert inches to pixels at 96 DPI
              height: invoiceHeight.value * 96, // Convert inches to pixels at 96 DPI
              style: {
                margin: '0',
                padding: '0',
                overflow: 'visible'
              }
            });
            
            // Store download info
            const baseFilename = customName || `Receipt-${(receiptNumber.value || 1) + page - 1}`;
            const filename = `${baseFilename}-Page-${page}.jpg`;
            
            downloads.push({ dataUrl, filename });
          }
          
          // Restore original page before downloading
          currentPage.value = originalPage;
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const isNative = Capacitor.isNativePlatform();
          
          if (isNative) {
            try {
              // Save each file to cache, then share so user can save
              for (const download of downloads) {
                const base64Data = download.dataUrl.split(',')[1];
                const savedFile = await Filesystem.writeFile({
                  path: download.filename,
                  data: base64Data,
                  directory: Directory.Cache,
                  recursive: true
                });
                
                console.log('✅ File saved to cache:', savedFile.uri);
                
                // Share each file so user can save to Downloads
                await Share.share({
                  title: `Save Image ${downloads.indexOf(download) + 1}/${downloads.length}`,
                  text: `Save ${download.filename} to your device`,
                  url: savedFile.uri,
                  dialogTitle: 'Save Invoice Image'
                });
                
                // Add delay between shares
                await new Promise(resolve => setTimeout(resolve, 500));
              }
              
              console.log(`✅ All ${downloads.length} images ready to save`);
            } catch (error) {
              console.error('Save and share error:', error);
              alert('❌ Failed to save images. Please try again.');
            }
          } else {
            downloads.forEach((download, index) => {
              setTimeout(() => {
                try {
                  const link = document.createElement('a');
                  link.download = download.filename;
                  link.href = download.dataUrl;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } catch (error) {
                  console.warn('JPEG download failed:', error);
                  const newWindow = window.open();
                  newWindow.document.write(`<img src="${download.dataUrl}" alt="Invoice" />`);
                }
              }, index * 300);
            });
          }
        } else {
          const dataUrl = await htmlToImage.toJpeg(invoiceRef.value, { 
            quality: 0.98, 
            pixelRatio: 3,
            cacheBust: true,
            backgroundColor: cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k),
            skipFonts: true,
            fontEmbedCSS: '',
            allowTaint: true,
            width: invoiceWidth.value * 96, // Convert inches to pixels at 96 DPI
            height: invoiceHeight.value * 96, // Convert inches to pixels at 96 DPI
            style: {
              margin: '0',
              padding: '0',
              overflow: 'visible'
            }
          });
          
          const filename = customName ? `${customName}.jpg` : `Invoice-${currentInvoiceNumber.value.replace('/', '-')}.jpg`;
          const isNative = Capacitor.isNativePlatform();
          
          if (isNative) {
            try {
              // Save to Cache first, then share so user can save anywhere
              const base64Data = dataUrl.split(',')[1];
              const savedFile = await Filesystem.writeFile({
                path: filename,
                data: base64Data,
                directory: Directory.Cache,
                recursive: true
              });
              
              console.log('✅ File saved to cache:', savedFile.uri);
              
              // Share the file so user can save to Downloads, Drive, etc.
              await Share.share({
                title: 'Save Invoice Image',
                text: `Save ${filename} to your device`,
                url: savedFile.uri,
                dialogTitle: 'Save Invoice Image'
              });
              
              console.log('✅ Image shared - user can now save to Downloads');
            } catch (error) {
              console.error('Save and share error:', error);
              alert('❌ Failed to save image. Please check app permissions in Settings.');
            }
          } else {
            try {
              const link = document.createElement('a');
              link.download = filename;
              link.href = dataUrl;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch (error) {
              console.warn('JPEG download failed:', error);
              const newWindow = window.open();
              newWindow.document.write(`<img src="${dataUrl}" alt="Invoice" style="max-width: 100%; height: auto;" />`);
            }
          }
        }
        
        // Restore table row heights
        originalRowHeights.forEach(({ element, originalStyle }) => {
          element.style.height = originalStyle;
          element.style.minHeight = '';
          element.style.maxHeight = '';
          
          // Restore cell heights and inner div heights
          const cells = element.querySelectorAll('td');
          cells.forEach(cell => {
            cell.style.height = '';
            cell.style.minHeight = '';
            cell.style.maxHeight = '';
            cell.style.paddingTop = '';
            cell.style.paddingBottom = '';
            cell.style.boxSizing = '';
            
            // Restore print-only div heights
            const printDivs = cell.querySelectorAll('.print-only');
            printDivs.forEach(div => {
              div.style.height = '';
              div.style.minHeight = '';
              div.style.maxHeight = '';
              div.style.lineHeight = '';
              div.style.boxSizing = '';
            });
          });
        });
        
        // Restore original styles
        if (parentWrapper) {
          parentWrapper.style.transform = parentOriginalTransform;
          parentWrapper.style.width = parentOriginalWidth;
          parentWrapper.style.height = parentOriginalHeight;
          parentWrapper.style.maxHeight = parentOriginalMaxHeight;
        }
        
        invoiceRef.value.style.transform = originalTransform;
        invoiceRef.value.style.position = originalPosition;
        invoiceRef.value.style.left = originalLeft;
        invoiceRef.value.style.top = originalTop;
        invoiceRef.value.style.margin = originalMargin;
        invoiceRef.value.style.width = originalWidth;
        invoiceRef.value.style.boxShadow = originalBoxShadow; // Restore original shadow
        invoiceRef.value.style.padding = originalPadding; // Restore original padding
        
        // Restore contentWrapperRef transform - not needed anymore since it's always 'none'
        // if (contentWrapperRef.value) {
        //   contentWrapperRef.value.style.transform = contentWrapperOriginalTransform;
        // }
        
        // Log export activity
        const member = JSON.parse(safeLocalStorage.getItem('sdp_authenticated_member') || '{}');
        await logActivity(member.branch || route.query.branch, {
          action: `Invoice Exported (JPEG)`,
          memberName: member.name || 'Unknown Member',
          type: 'export',
          details: {
            documentNumber: currentInvoiceNumber.value,
            exportFormat: 'jpeg',
            exportType: exportType,
            pageCount: exportType === 'all' ? totalCopies.value : 1
          }
        });
        
        if (exportType === 'all' && totalCopies.value > 1) {
          alert(`✅ All ${totalCopies.value} invoice pages exported as JPEG successfully!`);
        } else {
          alert('✅ Invoice exported as JPEG successfully!');
        }
      } catch (error) {
        console.error('Error exporting JPEG:', error);
        alert(`❌ Failed to export JPEG: ${error.message}`);
        
        // Restore styles on error
        if (invoiceRef.value) {
          const parentWrapper = invoiceRef.value.parentElement;
          if (parentWrapper) {
            parentWrapper.style.transform = parentOriginalTransform || '';
            parentWrapper.style.width = parentOriginalWidth || '';
            parentWrapper.style.height = parentOriginalHeight || '';
            parentWrapper.style.maxHeight = parentOriginalMaxHeight || '';
          }
          
          invoiceRef.value.style.transform = originalTransform || '';
          invoiceRef.value.style.position = originalPosition || '';
          invoiceRef.value.style.left = originalLeft || '';
          invoiceRef.value.style.top = originalTop || '';
          invoiceRef.value.style.margin = originalMargin || '';
          invoiceRef.value.style.width = originalWidth || '';
          
          const printOnlyElements = invoiceRef.value.querySelectorAll('.print-only');
          const noPrintElements = invoiceRef.value.querySelectorAll('.no-print');
          printOnlyElements.forEach(el => {
            el.style.display = '';
            el.style.visibility = '';
          });
          noPrintElements.forEach(el => {
            el.style.display = '';
            el.style.visibility = '';
          });
        }
      } finally {
        isExporting.value = false;
      }
    };
    
    const handleSaveInvoice = async () => {
      if (isExporting.value) {
        return;
      }
      
      try {
        isExporting.value = true;
        
        // Get authenticated member data using safe method
        const memberDataString = safeLocalStorage.getItem('sdp_authenticated_member');
        const memberData = memberDataString ? JSON.parse(memberDataString) : null;
        if (!memberData) {
          alert('❌ Please log in to save invoices');
          return;
        }
        
        if (!memberData?.branch) {
          alert('❌ Branch information not found');
          return;
        }
        
        const member = memberData; // Use the parsed data directly
        
        // Prepare invoice data to save
        const invoiceToSave = {
          organizationName: organizationName.value,
          organizationSubName: organizationSubName.value,
          organizationReceiptSubName: organizationReceiptSubName.value,
          headOfficeAddress: headOfficeAddress.value,
          headOfficePhone: headOfficePhone.value,
          branchAddress1: branchAddress1.value,
          branch1Phone: branch1Phone.value,
          branchAddress2: branchAddress2.value,
          branch2Phone: branch2Phone.value,
          logoDataUrl: logoDataUrl.value,
          invoiceNumber: receiptNumber.value,
          invoiceDate: date.value,
          customerName: customerName.value,
          customerAddress: customerAddress.value,
          customerAddress2: customerAddress2.value,
          lpo: lpo.value,
          items: items.value,
          sumOf: sumOf.value,
          sumOf2: sumOf2.value,
          invoiceWidth: invoiceWidth.value,
          invoiceHeight: invoiceHeight.value,
          colorMode: colorMode.value,
          customColor1CMYK: customColor1CMYK.value,
          customColor2CMYK: customColor2CMYK.value,
          selectedSignature1: selectedSignature1.value,
          selectedSignature2: selectedSignature2.value,
          totalCopies: totalCopies.value,
          currentPage: currentPage.value,
          showPageNumbers: showPageNumbers.value,
          signatureImage1: signatureImage1.value,
          signatureImage2: signatureImage2.value,
          grandTotal: grandTotal.value
        };
        
        // Save to localStorage (current invoice being edited)
        safeLocalStorage.setItem('invoicePreviewData', JSON.stringify(invoiceToSave));
        
        // Save to Firebase (permanent storage)
        const { saveInvoice } = await import('@/firebase/database');
        const result = await saveInvoice(member.branch, invoiceToSave);
        
        if (result.success) {
          const viewSaved = confirm(`✅ Invoice saved successfully!\n\nInvoice ID: ${result.id}\nBranch: ${member.branch}\n\nYour invoice is saved in:\n- localStorage (key: "invoices_${member.branch}")\n- Browser Storage under your branch\n\nWould you like to view all saved invoices in console?`);
          
          if (viewSaved) {
            // Get all saved invoices
            const { getAllInvoices } = await import('@/firebase/database');
            const allInvoices = await getAllInvoices(member.branch);
            /* eslint-disable no-console */
            console.log('=== SAVED INVOICES ===');
            console.log(`Branch: ${member.branch}`);
            console.log(`Total Invoices: ${allInvoices.invoices?.length || 0}`);
            console.table(allInvoices.invoices?.map(inv => ({
              ID: inv.id,
              Invoice_Number: inv.invoiceNumber,
              Customer: inv.customerName,
              Total: inv.grandTotal,
              Date: inv.invoiceDate,
              Created: new Date(inv.createdAt).toLocaleString()
            })));
            /* eslint-enable no-console */
            alert('Check your browser console (F12) to see all saved invoices!');
          }
        } else {
          alert(`⚠️ Invoice saved locally but Firebase save failed: ${result.error}\n\nYou can still access it from localStorage key: "invoices_${member.branch}"`);
        }
      } catch (error) {
        console.error('Error saving invoice:', error);
        alert(`❌ Failed to save invoice: ${error.message}\n\nCheck browser console for details.`);
      } finally {
        isExporting.value = false;
      }
    };
    
    const handleBack = () => {
      router.back();
    };
    
    // Auto-resize textarea
    const autoResize = (event) => {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };
    
    // Add item after index
    const addItemAfter = (index) => {
      if (items.value.length >= MAX_ITEMS.value) {
        alert(`⚠️ Maximum ${MAX_ITEMS.value} items allowed for ${invoiceHeight.value}" height invoice`);
        return;
      }
      const newItem = {
        id: Date.now(),
        quantity: 0,
        description: '',
        price: 0,
        tax: 0
      };
      items.value.splice(index + 1, 0, newItem);
    };
    
    // Add new item
    const addItem = () => {
      if (items.value.length >= MAX_ITEMS.value) {
        alert(`⚠️ Maximum ${MAX_ITEMS.value} items allowed for ${invoiceHeight.value}" height invoice`);
        return;
      }
      items.value.push({
        id: Date.now(),
        quantity: 0,
        description: '',
        price: 0,
        tax: 0
      });
    };
    
    // Remove item
    const removeItem = (id) => {
      if (items.value.length > 1) {
        // Disable auto-zoom during item removal to prevent unwanted zoom adjustments
        const currentZoom = zoomLevel.value;
        items.value = items.value.filter(item => item.id !== id);
        
        // Always ensure we have 12 items by adding an empty item if needed
        if (items.value.length < 12) {
          const newId = Math.max(...items.value.map(item => item.id)) + 1;
          items.value.push({
            id: newId,
            quantity: 0,
            description: '',
            price: 0,
            tax: 0
          });
        }
        
        // Maintain current zoom level after removal
        nextTick(() => {
          zoomLevel.value = currentZoom;
        });
      }
    };
    
    // Handle sumOf overflow
    const handleSumOfOverflow = () => {
      // Optional: Add logic to handle text overflow between sumOf fields
    };
    
    // Handle sumOf2 input
    const handleSumOf2Input = () => {
      // Optional: Add logic for sumOf2 field
    };

    // Handle cell edit from InvoiceTemplate1 child component
    const handleCellEdit = ({ index, field, value }) => {
      if (items.value[index]) {
        items.value[index][field] = value;
      }
    };

    // Handle logo error from template component
    const handleLogoError = () => {
      console.error('Logo failed to load:', logoDataUrl.value);
      logoDataUrl.value = null;
    };

    // Sync template component exposed refs to parent refs
    const syncTemplateRefs = () => {
      if (templateComponentRef.value) {
        invoiceRef.value = templateComponentRef.value.invoiceRef;
        contentWrapperRef.value = templateComponentRef.value.contentWrapperRef;
      }
    };

    // Watch for template component mounting and sync refs
    watch(templateComponentRef, () => {
      nextTick(syncTemplateRefs);
    });
    
    // Load signatures from Firebase
    const loadSignatures = async () => {
      try {
        console.log('🖋️ [PreviewInvoice] Loading signatures...');
        
        const memberData = await withFirebaseErrorHandling(
          async () => safeLocalStorage.getItem('sdp_authenticated_member'),
          'loadMemberData',
          { suppressConsoleErrors: true }
        );
        
        if (!memberData) {
          console.log('🖋️ [PreviewInvoice] No authenticated member data available');
          return;
        }
        
        let member;
        try {
          member = JSON.parse(memberData);
        } catch (error) {
          console.log('🖋️ [PreviewInvoice] Error parsing member data');
          return;
        }
        
        if (!member?.branch) {
          console.log('🖋️ [PreviewInvoice] No branch found in member data');
          return;
        }

        console.log('🖋️ [PreviewInvoice] Loading signatures for branch:', member.branch);

        // Use dynamic import like ReceiptPage.vue
        const { getAllSignatures } = await import('@/firebase/database');
        const result = await getAllSignatures(member.branch);
        
        console.log('🔥 [PreviewInvoice] Firebase getAllSignatures result:', result);
        
        if (result?.success) {
          savedSignatures.value = result.signatures || result.data || [];
          console.log('✅ [PreviewInvoice] Loaded signatures count:', savedSignatures.value.length);
          console.log('📝 [PreviewInvoice] Signature details:', savedSignatures.value.map(s => ({ 
            id: s.id, 
            name: s.name,
            branch: s.branch || 'no-branch-specified'
          })));
          
          // Auto-select primary signatures
          const primary = savedSignatures.value.find(sig => sig.isPrimary);
          if (primary) {
            console.log('🖋️ [PreviewInvoice] Setting primary signature:', primary.name);
            selectedSignature1.value = primary.id;
            selectedSignature2.value = primary.id;
            signatureImage1.value = primary.dataURL;
            signatureImage2.value = primary.dataURL;
          } else if (savedSignatures.value.length > 0) {
            console.log('🖋️ [PreviewInvoice] No primary signature, using first available');
            const firstSig = savedSignatures.value[0];
            selectedSignature1.value = firstSig.id;
            selectedSignature2.value = firstSig.id;
            signatureImage1.value = firstSig.dataURL;
            signatureImage2.value = firstSig.dataURL;
          }
          
          // If no signatures found, check localStorage as fallback
          if (savedSignatures.value.length === 0) {
            console.log('🗃️ [PreviewInvoice] No Firebase signatures, checking localStorage...');
            const signatureKeys = Object.keys(localStorage).filter(key => 
              key.includes('signature') || key.includes('Signature')
            );
            console.log('🗃️ [PreviewInvoice] Found localStorage signature keys:', signatureKeys);
            
            if (signatureKeys.length > 0) {
              try {
                const localSignatures = [];
                signatureKeys.forEach(key => {
                  try {
                    const parsed = JSON.parse(localStorage.getItem(key));
                    if (parsed && (parsed.id || parsed.name)) {
                      localSignatures.push(parsed);
                    }
                  } catch (e) {
                    console.log('🗃️ [PreviewInvoice] Failed to parse localStorage signature:', key);
                  }
                });
                
                if (localSignatures.length > 0) {
                  console.log('📦 [PreviewInvoice] Using localStorage signatures:', localSignatures.length);
                  savedSignatures.value = localSignatures;
                }
              } catch (error) {
                console.error('🗃️ [PreviewInvoice] Error processing localStorage signatures:', error);
              }
            }
          }
        } else {
          console.log('❌ [PreviewInvoice] Failed to load signatures from Firebase');
          savedSignatures.value = [];
        }
      } catch (error) {
        console.error('❌ [PreviewInvoice] Error in loadSignatures:', error);
        savedSignatures.value = [];
      }
    };

    // Handle signature 1 selection
    const handleSignature1Change = () => {
      console.log('🖋️ Signature 1 changed to:', selectedSignature1.value);
      const selected = savedSignatures.value.find(sig => sig.id === selectedSignature1.value);
      console.log('🖋️ Found signature:', selected);
      if (selected) {
        signatureImage1.value = selected.dataURL;
        console.log('🖋️ Set signatureImage1 to:', signatureImage1.value ? 'Image loaded' : 'No image');
      } else {
        signatureImage1.value = '';
        console.log('🖋️ Cleared signatureImage1');
      }
      
      // Save to shared state for main page sync
      saveSharedSignatureState();
    };

    // Handle signature 2 selection
    const handleSignature2Change = () => {
      console.log('🖋️ Signature 2 changed to:', selectedSignature2.value);
      const selected = savedSignatures.value.find(sig => sig.id === selectedSignature2.value);
      console.log('🖋️ Found signature:', selected);
      if (selected) {
        signatureImage2.value = selected.dataURL;
        console.log('🖋️ Set signatureImage2 to:', signatureImage2.value ? 'Image loaded' : 'No image');
      } else {
        signatureImage2.value = '';
        console.log('🖋️ Cleared signatureImage2');
      }
      
      // Save to shared state for main page sync
      saveSharedSignatureState();
    };

    // Handle create new signature
    const handleCreateSignature = () => {
      // Store return path for navigation after signature creation
      localStorage.setItem('signatureReturnPath', router.currentRoute.value.fullPath);
      localStorage.setItem('signatureReturnType', 'invoice');
      router.push('/signature');
    };

    // Navigation functions
    const viewSavedInvoices = () => {
      const branch = router.currentRoute.value.query.branch || '';
      router.push({ path: '/saved-invoices', query: { branch } });
    };
    
    // Save Invoice Functions
    const showSaveDialog = () => {
      // Generate a default invoice name based on customer and date
      const custName = customerName.value || organizationName.value || 'Invoice';
      const date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-');
      
      invoiceName.value = `${custName} - ${date}`;
      showSaveModal.value = true;
    };

    const cancelSave = () => {
      showSaveModal.value = false;
      invoiceName.value = '';
    };

    const saveInvoice = async () => {
      if (!invoiceName.value.trim()) {
        alert('Please enter a name for your invoice');
        return;
      }

      isSaving.value = true;
      
      try {
        // Get current member/branch info
        const memberData = localStorage.getItem('authenticatedMember') || localStorage.getItem('sdp_authenticated_member');
        if (!memberData) {
          alert('Please log in to save invoices');
          return;
        }

        const member = JSON.parse(memberData);
        if (!member.branch) {
          alert('No branch information found. Please log in again.');
          return;
        }

        // Prepare invoice data
        const invoiceData = {
          name: invoiceName.value.trim(),
          organizationName: organizationName.value,
          organizationSubName: organizationSubName.value,
          customerName: customerName.value,
          customerAddress: customerAddress.value,
          lpo: lpo.value,
          invoiceDate: date.value,
          invoiceNumber: currentInvoiceNumber.value,
          items: items.value,
          taxEnabled: taxEnabled.value,
          branch: member.branch,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save using the proper database service
        const { saveInvoice: dbSaveInvoice } = await import('@/firebase/database');
        const result = await dbSaveInvoice(member.branch, invoiceData);

        if (result.success) {
          // Log activity
          try {
            const { logActivity } = await import('../../api-service');
            await logActivity(member.branch, {
              action: `Invoice Saved: ${invoiceName.value}`,
              memberName: member.name || 'Unknown Member',
              type: 'invoice',
              details: {
                invoiceNumber: currentInvoiceNumber.value,
                invoiceName: invoiceName.value
              }
            });
          } catch (activityError) {
            console.warn('Failed to log activity:', activityError);
          }

          showSaveModal.value = false;
          invoiceName.value = '';
          alert('✅ Invoice saved successfully!');
          
          // Navigate to saved invoices page
          const branch = router.currentRoute.value.query.branch || '';
          router.push({ path: '/saved-invoices', query: { branch } });
        } else {
          throw new Error(result.error || 'Failed to save invoice');
        }
      } catch (error) {
        console.error('Error saving invoice:', error);
        alert(`Error saving invoice: ${error.message}. Please try again.`);
      } finally {
        isSaving.value = false;
      }
    };

    const createNewInvoice = () => {
      if (confirm('Are you sure you want to start a new invoice? Any unsaved changes will be lost.')) {
        // Clear all invoice data
        try {
          localStorage.removeItem('invoicePreviewData');
          localStorage.removeItem('generateInvoiceFormData');
          localStorage.removeItem('invoiceQuickSettings');
        } catch (error) {
          console.warn('Error clearing localStorage:', error);
        }
        
        // Navigate to new invoice creation
        router.push({ name: 'Invoice', query: router.currentRoute.value.query });
      }
    };
    
    // Handle storage changes for real-time sync
    const handleStorageChange = (event) => {
      if (event.key === SHARED_SIGNATURE_KEY && event.newValue) {
        try {
          const newData = JSON.parse(event.newValue);
          console.log('🔄 Detected signature state change from main page:', newData);
          
          selectedSignature1.value = newData.selectedSignature1 || '';
          selectedSignature2.value = newData.selectedSignature2 || '';
          signatureImage1.value = newData.signatureImage1 || '';
          signatureImage2.value = newData.signatureImage2 || '';
        } catch (error) {
          console.error('❌ Error handling storage change:', error);
        }
      }
    };

    // Error handling methods
    const handleRetry = () => {
      try {
        hasError.value = false;
        errorMessage.value = '';
        errorDetails.value = '';
        // Force a complete page reload to reset all state
        window.location.reload();
      } catch (error) {
        console.error('Error during retry:', error);
        try {
          // Fallback if location.reload() fails
          window.location.href = window.location.href;
        } catch (fallbackError) {
          console.error('Fallback reload also failed:', fallbackError);
          // Last resort - try to redirect to current path
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = currentPath;
        }
      }
    };

    const handleReload = () => {
      try {
        window.location.reload();
      } catch (error) {
        console.error('Error during reload:', error);
        try {
          // Fallback if location.reload() fails
          window.location.href = window.location.href;
        } catch (fallbackError) {
          console.error('Fallback reload also failed:', fallbackError);
          // Last resort - try to redirect to current path
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = currentPath;
        }
      }
    };

    const handleError = (error, context = '') => {
      console.error(`Error in ${context}:`, error);
      hasError.value = true;
      errorMessage.value = error.message || 'An unexpected error occurred';
      errorDetails.value = `${context ? context + ': ' : ''}${error.stack || error.toString()}`;
    };

    // Drag to resize functionality
    const startDragging = (event) => {
      isDragging.value = true;
      dragStartY.value = event.clientY;
      dragStartHeight.value = settingsPanelHeight.value;
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', stopDragging);
      event.preventDefault();
    };

    const handleDrag = (event) => {
      if (!isDragging.value) return;
      const deltaY = dragStartY.value - event.clientY;
      const newHeight = Math.max(200, Math.min(window.innerHeight * 0.8, dragStartHeight.value + deltaY));
      settingsPanelHeight.value = newHeight;
    };

    const stopDragging = () => {
      isDragging.value = false;
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDragging);
    };

    // Computed style for responsive header
    const headerStyles = computed(() => {
      if (windowWidth.value < 768) {
        return 'position: fixed !important; top: 70px !important; left: 0 !important; right: 0 !important; z-index: 50 !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important; min-height: 100px !important;';
      } else {
        return 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 50 !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important; min-height: 80px !important;';
      }
    });

    return {
      invoiceRef,
      exportDropdownRef,
      previewContainerRef,
      isExporting,
      invoiceData,
      showSettings,
      hasError,
      settingsPanelHeight,
      startDragging,
      windowWidth,
      windowHeight,
      showPreview,
      invoiceWidth,
      invoiceHeight,
      isMobile,
      mobileScale,
      zoomLevel,
      effectiveZoomLevel,
      autoFitEnabled,
      containerDimensions,
      minZoom,
      maxZoom,
      zoomIn,
      zoomOut,
      resetZoom,
      autoFitZoom,
      totalCopies,
      currentPage,
      goToPreviousPage,
      goToNextPage,
      goToPage,
      saveInvoiceData,
      toggleExportOptions,
      closeExportOptions,
      // New popup functions
      closeMobileExportPopup,
      closeDesktopExportPopup, 
      shareToSocialMedia,
      copyShareLink,
      handleClickOutside,
      validateCopiesInput,
      displayPageNumber,
      currentInvoiceNumber,
      showPageNumbers,
      showExportOptions,
      // New popup variables
      showMobileExportPopup,
      showDesktopExportPopup,
      dropdownStyle,
      dynamicPadding,
      dynamicGap,
      dynamicSpacing,
      signatureHeight,
      signatureImageHeight,
      // Undo/Redo
      canUndo,
      canRedo,
      undo,
      redo,
      saveState,
      colorMode,
      customColor1CMYK,
      customColor2CMYK,
      customColor3CMYK,
      // Font selection
      selectedFont,
      baseFontSize,
      fontSizePresets,
      showFilenameModal,
      customFilename,
      pendingExportType,
      // CMYK functions
      cmykToRgbCss,
      cmykColors,
      // Text picker
      isTextPickerMode,
      selectedTextElement,
      selectedElementId,
      selectedElementStyles,
      elementStyles,
      toggleTextPickerMode,
      applySelectedElementStyles,
      resetSelectedElementStyles,
      applyAllSavedStyles,
      applyQuickColor,
      // Multi-select text picker
      isMultiSelectMode,
      selectedElementIds,
      selectedTextElements,
      groupStyles,
      toggleMultiSelectMode,
      selectAllText,
      clearAllSelections,
      applyStylesToSelectedElements,
      resetSelectedElements,
      contentScale,
      invoiceDimensions,
      colorStyles,
      grandTotal,
      totalNaira,
      totalKobo,
      amountInWords,
      numberToWords,
      // Global/shared fields
      logoDataUrl,
      organizationName,
      organizationSubName,
      organizationReceiptSubName,
      businessNumber,
      headOfficeAddress,
      headOfficePhone,
      branchAddress1,
      branch1Phone,
      branchAddress2,
      branch2Phone,
      additionalBranches,

      receiptNumber,
      autoReceiptNumber,
      autoDate,
      showGrandTotal,
      // Per-page data (computed properties)
      pageData,
      customerName,
      customerAddress,
      customerAddress2,
      date,
      lpo,
      items,
      signatureImage1,
      signatureImage2,
      selectedSignature1,
      selectedSignature2,
      sumOf,
      sumOf2,
      // Helper functions
      createDefaultPageData,
      ensurePageData,
      MAX_ITEMS,
      logoHeight,
      headerPaddingTop,
      headerPaddingBottom,
      headerPadding,
      organizationNameFontSize,
      organizationSubFontSize,
      addressFontSize,
      phoneFontSize,
      footerFontSize,
      tableHeaderFontSize,
      customerDetailsFontSize,
      amountColumnWidth,
      koboColumnWidth,
      totalBoxWidth,
      totalBoxMinWidth,
      koboTotalWidth,
      tableRowHeight,
      outlineBoxHeight,
      customerBoxHeight,
      sumOfInput1,
      sumOfInput2,
      // Signature management
      savedSignatures,
      // Methods
      getItemAmount,
      toCurrency,
      handlePresetChange,
      cmykToHex,
      cmykToCss,
      getPrintReadyColor,
      getColorModeDescription,
      handleExportPDF,
      exportCMYKVectorPDF,
      handleExportJPEG,
      handleSaveInvoice,
      showFilenameDialog,
      cancelExport,
      confirmExport,
      showFilenameModal,
      customFilename,
      pendingExportType,
      handleBack,
      autoResize,
      addItemAfter,
      addItem,
      removeItem,
      handleSumOfOverflow,
      handleSumOf2Input,
      loadSignatures,
      handleSignature1Change,
      handleSignature2Change,
      handleCreateSignature,
      // Font methods
      handleFontChange,
      syncFontSelections,
      handleFontSizeChange,
      setFontSizePreset,
      // Auto adjustment variables
      autoAdjustedElements,
      slimFonts,
      originalElementStyles,
      // Auto adjustment methods
      checkTextOverflow,
      applySlimFont,
      setupAutoAdjustment,
      resetAutoAdjustment,
      // Text background watermark
      enableTextBackground,
      watermarkType,
      watermarkCMYK,
      watermarkOpacity,
      watermarkFontSize,
      watermarkVisible,
      cmykColors,
      generateWatermarkText,
      getWatermarkColor,
      getWatermarkColorPreview,
      // Navigation methods
      viewSavedInvoices,
      createNewInvoice,
      // Save modal
      showSaveModal,
      invoiceName,
      isSaving,
      showSaveDialog,
      cancelSave,
      saveInvoice,
      // Error handling
      hasError,
      errorMessage,
      errorDetails,
      handleRetry,
      handleReload,
      handleError,
      cleanupCorruptedLocalStorage,
      handleOrganizationNameChange,
      // CMYK Color Palette
      selectedCMYKColor,
      applyCMYKColor,
      // Template references
      templateComponentRef,
      invoiceRef,
      contentWrapperRef,
      // Template selection
      selectedTemplate,
      // Template event handlers
      handleCellEdit,
      handleLogoError,
      // Zoom controls
      bounce,
      zoomPercent,
      zoomOrigin,
      zoomControlRef,
      sliderTrackRef,
      showZoomControl,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleSliderTouchStart,
      handleSliderTouchMove,
      handleSliderTouchEnd,
      handleSliderMouseDown,
      handleSliderMouseMove,
      headerStyles
    };
  }
});
</script>

<style scoped>
/* Using universally available system fonts for maximum compatibility */
/* Organization name - APK & PDF safe */
.organization-name {
  font-family: 'Arial Black', 'Arial Bold', Arial, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.25;
  text-align: center;
  white-space: normal;
  word-break: normal;
  overflow-wrap: anywhere;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}

/* Improve PDF export text positioning */
.inline-block, .inline-flex {
  vertical-align: baseline !important;
}

/* Fix baseline alignment for all text elements during export */
h1, h2, h3, h4, h5, h6, p, span, div {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Prevent text shifting during export */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Fix flexbox alignment for export */
.flex {
  display: flex !important;
}

.items-center {
  align-items: center !important;
}

.justify-center {
  justify-content: center !important;
}

/* Ensure consistent line heights */
.leading-none {
  line-height: 1 !important;
}

.leading-tight {
  line-height: 1.25 !important;
}

.error-boundary[data-v-0455a002] {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  background-color: v-bind('cmykColors?.lightBackground ? cmykToRgbCss(cmykColors.lightBackground.c, cmykColors.lightBackground.m, cmykColors.lightBackground.y, cmykColors.lightBackground.k) : "#f9fafb"');
}

/* Organization name styles already defined above */

/* Beautiful Custom Scrollbar Styles */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

*::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
  border-radius: 3px;
  transition: all 0.2s ease;
}

*::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

*::-webkit-scrollbar-thumb:active {
  background: rgba(107, 114, 128, 0.8);
}

/* Dark mode scrollbar */
.dark *::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark *::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.8);
}

.dark *::-webkit-scrollbar-thumb:active {
  background: rgba(55, 65, 81, 0.9);
}

/* Enhanced scrollbar for main content areas */
.overflow-auto::-webkit-scrollbar,
section::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-thumb,
section::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.overflow-auto::-webkit-scrollbar-thumb:hover,
section::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

/* Prevent text shifting during export */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Fix flexbox alignment for export */
.flex {
  display: flex !important;
}

.items-center {
  align-items: center !important;
}

.justify-center {
  justify-content: center !important;
}

/* Ensure consistent line heights */
.leading-none {
  line-height: 1 !important;
}

.leading-tight {
  line-height: 1.25 !important;
}

.error-container[data-v-0455a002] {
  max-width: 600px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px v-bind('cmykColors?.black ? cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k) + "1A" : "#0000001A"'); /* 1A = 10% opacity */
  text-align: center;
}

.error-icon[data-v-0455a002] {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title[data-v-0455a002] {
  font-size: 1.5rem;
  font-weight: 600;
  color: v-bind('cmykColors?.darkGray ? cmykToRgbCss(cmykColors.darkGray.c, cmykColors.darkGray.m, cmykColors.darkGray.y, cmykColors.darkGray.k) : "#374151"');
  margin-bottom: 0.5rem;
}

.error-message[data-v-0455a002] {
  color: v-bind('cmykColors?.mediumGray ? cmykToRgbCss(cmykColors.mediumGray.c, cmykColors.mediumGray.m, cmykColors.mediumGray.y, cmykColors.mediumGray.k) : "#6b7280"');
  margin-bottom: 1.5rem;
}

.error-actions[data-v-0455a002] {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.btn-primary[data-v-0455a002] {
  background-color: v-bind('cmykColors?.blue2 ? cmykToRgbCss(cmykColors.blue2.c, cmykColors.blue2.m, cmykColors.blue2.y, cmykColors.blue2.k) : "#3b82f6"');
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary[data-v-0455a002]:hover {
  background-color: v-bind('cmykToRgbCss(cmykColors.blue1.c, cmykColors.blue1.m, cmykColors.blue1.y, cmykColors.blue1.k)');
}

.btn-secondary[data-v-0455a002] {
  background-color: v-bind('cmykToRgbCss(cmykColors.mediumGray.c, cmykColors.mediumGray.m, cmykColors.mediumGray.y, cmykColors.mediumGray.k)');
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-secondary[data-v-0455a002]:hover {
  background-color: v-bind('cmykToRgbCss(cmykColors.darkMediumGray.c, cmykColors.darkMediumGray.m, cmykColors.darkMediumGray.y, cmykColors.darkMediumGray.k)');
}

.error-details[data-v-0455a002] {
  text-align: left;
  border: 1px solid v-bind('cmykToRgbCss(cmykColors.borderGray.c, cmykColors.borderGray.m, cmykColors.borderGray.y, cmykColors.borderGray.k)');
  border-radius: 6px;
  padding: 1rem;
  background-color: v-bind('cmykToRgbCss(cmykColors.lightBackground.c, cmykColors.lightBackground.m, cmykColors.lightBackground.y, cmykColors.lightBackground.k)');
}

.error-details summary[data-v-0455a002] {
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.error-details pre[data-v-0455a002] {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.875rem;
  color: #374151;
  margin: 0;
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* Invoice preview styling */
#meblink-invoice {
  font-family: 'Arial', sans-serif;
}

#meblink-invoice table {
  border-collapse: collapse;
}

#meblink-invoice table td,
#meblink-invoice table th {
  border: 1px solid #d1d5db;
}

/* Mobile touch and scroll optimization */
@media (max-width: 768px) {
  /* Enable smooth scrolling and touch optimization for mobile */
  .relative.min-h-screen {
    touch-action: pan-x pan-y pinch-zoom;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Ensure invoice container allows horizontal scrolling */
  section.w-full.overflow-auto {
    overflow-x: auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y pinch-zoom;
  }
  
  /* Prevent zoom conflicts with browser zoom */
  #meblink-invoice {
    touch-action: pan-x pan-y pinch-zoom;
  }
}

/* Font loading optimization */
#meblink-invoice {
  font-display: swap;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Fallback font for better compatibility */
#meblink-invoice * {
  font-family: inherit;
}

/* Print/No-Print classes for interactive editing */
@media screen {
  .print-only {
    display: none !important;
  }
}

@media print {
  .no-print {
    display: none !important;
  }
  
  .print-only {
    display: block !important;
  }
}

/* CMYK Color Slider Styles */
.slider-cyan::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #00bcd4;
  cursor: pointer;
  border: 2px solid v-bind('cmykColors?.white ? cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k) : "#ffffff"');
  box-shadow: 0 2px 4px v-bind('cmykColors?.black ? cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k) + "33" : "#00000033"'); /* 33 = 20% opacity */
}

.slider-cyan::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #00bcd4;
  cursor: pointer;
  border: 2px solid v-bind('cmykColors?.white ? cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k) : "#ffffff"');
  box-shadow: 0 2px 4px v-bind('cmykColors?.black ? cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k) + "33" : "#00000033"'); /* 33 = 20% opacity */
}

.slider-magenta::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #e91e63;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-magenta::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: v-bind('cmykColors?.pink ? cmykToRgbCss(cmykColors.pink.c, cmykColors.pink.m, cmykColors.pink.y, cmykColors.pink.k) : "#e91e63"');
  cursor: pointer;
  border: 2px solid v-bind('cmykColors?.white ? cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k) : "#ffffff"');
  box-shadow: 0 2px 4px v-bind('cmykColors?.shadowGray ? cmykToRgbCss(cmykColors.shadowGray.c, cmykColors.shadowGray.m, cmykColors.shadowGray.y, cmykColors.shadowGray.k) + "33" : "#00000033"');
}

.slider-yellow::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #ffeb3b;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-yellow::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: v-bind('cmykColors?.yellow ? cmykToRgbCss(cmykColors.yellow.c, cmykColors.yellow.m, cmykColors.yellow.y, cmykColors.yellow.k) : "#ffeb3b"');
  cursor: pointer;
  border: 2px solid v-bind('cmykColors?.white ? cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k) : "#ffffff"');
  box-shadow: 0 2px 4px v-bind('cmykColors?.shadowGray ? cmykToRgbCss(cmykColors.shadowGray.c, cmykColors.shadowGray.m, cmykColors.shadowGray.y, cmykColors.shadowGray.k) + "33" : "#00000033"');
}

.slider-black::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #424242;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-black::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: v-bind('cmykColors?.darkGray2 ? cmykToRgbCss(cmykColors.darkGray2.c, cmykColors.darkGray2.m, cmykColors.darkGray2.y, cmykColors.darkGray2.k) : "#424242"');
  cursor: pointer;
  border: 2px solid v-bind('cmykColors?.white ? cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k) : "#ffffff"');
  box-shadow: 0 2px 4px v-bind('cmykColors?.shadowGray ? cmykToRgbCss(cmykColors.shadowGray.c, cmykColors.shadowGray.m, cmykColors.shadowGray.y, cmykColors.shadowGray.k) + "33" : "#00000033"');
}

/* CMYK Slider Track Styles */
.slider-cyan::-webkit-slider-track {
  background: linear-gradient(to right, v-bind('cmykColors?.white ? cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k) : "#ffffff"'), v-bind('cmykColors?.cyan ? cmykToRgbCss(cmykColors.cyan.c, cmykColors.cyan.m, cmykColors.cyan.y, cmykColors.cyan.k) : "#00bcd4"'));
}

.slider-magenta::-webkit-slider-track {
  background: linear-gradient(to right, #ffffff, #e91e63);
}

.slider-yellow::-webkit-slider-track {
  background: linear-gradient(to right, #ffffff, #ffeb3b);
}

.slider-black::-webkit-slider-track {
  background: linear-gradient(to right, #ffffff, #424242);
}

/* Print Media Styles for CMYK Output */
@media print {
  /* Force CMYK color space for print */
  .invoice-content-wrapper {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  /* Ensure backgrounds print */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

/* CSS Custom Properties for CMYK Colors */
:root {
  --primary-cmyk: v-bind('colorMode !== "full-color" ? `cmyk(${customColor1CMYK.c}%, ${customColor1CMYK.m}%, ${customColor1CMYK.y}%, ${customColor1CMYK.k}%)` : "cmyk(100%, 0%, 0%, 0%)"');
  --secondary-cmyk: v-bind('colorMode === "two-color" || colorMode === "three-color" ? `cmyk(${customColor2CMYK.c}%, ${customColor2CMYK.m}%, ${customColor2CMYK.y}%, ${customColor2CMYK.k}%)` : "cmyk(0%, 100%, 0%, 0%)"');
  --tertiary-cmyk: v-bind('colorMode === "three-color" ? `cmyk(${customColor3CMYK.c}%, ${customColor3CMYK.m}%, ${customColor3CMYK.y}%, ${customColor3CMYK.k}%)` : "cmyk(0%, 0%, 100%, 0%)"');
}

/* Zoom control styles */
.zoom-area {
  touch-action: none !important;
  will-change: transform;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.scale-y-110 {
  animation: bounce 120ms ease-out;
}

@keyframes bounce {
  0% { transform: scaleY(1); }
  50% { transform: scaleY(1.1); }
  100% { transform: scaleY(1); }
}
</style>
