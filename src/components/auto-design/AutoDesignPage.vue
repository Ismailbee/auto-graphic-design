 <template>
  <div class="auto-design-page min-h-screen bg-gray-50 dark:bg-gray-900">

  <CelebrationBurst :show="showCelebration" :burstKey="celebrationKey" />

    <!-- Initial Loading State - Shows immediately while components load -->
    <div v-if="isInitialLoading" class="initial-loading-state">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h2 class="loading-title">Loading Design Studio</h2>
        <p class="loading-subtitle">Preparing your creative workspace...</p>
      </div>
    </div>
    
    <!-- Show Sticker Template Panel if category is sticker -->
    <Suspense v-else-if="selectedCategory === 'sticker'">
      <template #default>
        <StickerTemplatePanel @celebrate="triggerCelebration" />
      </template>
      <template #fallback>
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <div class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600 text-lg">Loading designer...</p>
          </div>
        </div>
      </template>
    </Suspense>

    <!-- Show Tag Template Panel if category is tag -->
    <Suspense v-else-if="selectedCategory === 'tag'">
      <template #default>
        <TagTemplatePanel />
      </template>
      <template #fallback>
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <div class="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-600 text-lg">Loading tag designer...</p>
          </div>
        </div>
      </template>
    </Suspense>

    <!-- NamingPanel removed - wedding-only mode -->

    <!-- Show default Auto Design interface for other categories -->
    <template v-else>
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Auto Design: {{ categoryName }}
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Create professional designs automatically
              </p>
            </div>
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              @click="goBack"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        
        <!-- Form Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Design Details
          </h2>

          <!-- Dynamic Text Inputs based on Template -->
          <div class="space-y-4 mb-6">
            <!-- Naming Ceremony Template Fields -->
            <template v-if="selectedCategory === 'naming-ceremony'">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtitle
                </label>
                <input
                  v-model="formData.text.subtitle"
                  type="text"
                  placeholder="Alhamdulillah on your"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  v-model="formData.text.title"
                  type="text"
                  placeholder="Naming ceremony"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Child Name (First)
                </label>
                <input
                  v-model="formData.text.childName"
                  type="text"
                  placeholder="MUHAMMAD"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Child Full Name
                </label>
                <input
                  v-model="formData.text.childFullName"
                  type="text"
                  placeholder="AL-AMIN AHMAD"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    v-model="formData.text.date"
                    type="text"
                    placeholder="5TH"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month
                  </label>
                  <input
                    v-model="formData.text.month"
                    type="text"
                    placeholder="OCTOBER"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <input
                    v-model="formData.text.year"
                    type="text"
                    placeholder="2025"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Courtesy Text
                </label>
                <input
                  v-model="formData.text.courtesy"
                  type="text"
                  placeholder="COURTESY: MUM"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </template>

            <!-- Default Template Fields (for other templates) -->
            <template v-else>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  v-model="formData.text.title"
                  type="text"
                  placeholder="Enter title..."
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtitle
                </label>
                <input
                  v-model="formData.text.subtitle"
                  type="text"
                  placeholder="Enter subtitle..."
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  v-model="formData.text.description"
                  rows="3"
                  placeholder="Enter description..."
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
            </template>
          </div>

          <!-- Color Pickers -->
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Colors</h3>

            <!-- Naming Ceremony Colors -->
            <template v-if="selectedCategory === 'naming-ceremony'">
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Background</label>
                  <input
                    v-model="formData.colors.background"
                    type="color"
                    class="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Primary (Yellow)</label>
                  <input
                    v-model="formData.colors.primary"
                    type="color"
                    class="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Accent (Gold)</label>
                  <input
                    v-model="formData.colors.accent"
                    type="color"
                    class="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </template>

            <!-- Default Colors -->
            <template v-else>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Primary Color</label>
                  <input
                    v-model="formData.colors.primary"
                    type="color"
                    class="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-2">Secondary Color</label>
                  <input
                    v-model="formData.colors.secondary"
                    type="color"
                    class="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </template>
          </div>

          <!-- Size Selector -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Size
            </label>
            <button
              class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-left hover:border-cyan-500 dark:hover:border-cyan-400 transition-all duration-200 bg-white dark:bg-gray-700 group"
              @click="showSizePopup = true"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <div>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white block">
                      {{ selectedSizeText }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ selectedSizeDescription }}
                    </span>
                  </div>
                </div>
                <svg class="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          <!-- Logo Upload removed - component not available -->

          <!-- Image Upload -->
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ selectedCategory === 'naming-ceremony' ? 'Baby Photo' : 'Image' }}
            </h3>
            <ImageUploader />
          </div>

          <!-- Options -->
          <div class="mb-6">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="formData.options.removeBackground"
                type="checkbox"
                class="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Remove Background from Images
              </span>
            </label>
          </div>

          <!-- Generate Button -->
          <button
            :disabled="isGenerating"
            class="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleGenerate"
          >
            <span v-if="!isGenerating">Generate Design</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating... {{ generationProgress }}%
            </span>
          </button>
        </div>

        <!-- Preview Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Preview
          </h2>

          <!-- AI Processing State -->
          <div v-if="autoDesignStore.isProcessingAI" class="flex flex-col items-center justify-center min-h-[400px]">
            <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-gray-600 dark:text-gray-400 mb-2">{{ autoDesignStore.aiStatus }}</p>
            <div class="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-purple-500 to-pink-600 h-full transition-all duration-300"
                :style="{ width: autoDesignStore.aiProgress + '%' }"
              ></div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">{{ autoDesignStore.aiProgress }}%</p>
          </div>

          <!-- Loading State -->
          <div v-else-if="isGenerating" class="flex flex-col items-center justify-center min-h-[400px]">
            <div class="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-gray-600 dark:text-gray-400 mb-2">Generating your design...</p>
            <div class="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300"
                :style="{ width: generationProgress + '%' }"
              ></div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">{{ generationProgress }}%</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!currentProject" class="flex flex-col items-center justify-center min-h-[400px] text-center">
            <svg class="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Design Yet</h3>
            <p class="text-gray-600 dark:text-gray-400 max-w-sm">
              Fill out the form and click "Generate Design" to create your professional design automatically.
            </p>
          </div>

          <!-- Preview (when available) -->
          <div v-else class="space-y-4">
            <!-- Debug info -->
            <div class="text-xs text-gray-500 mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div>Status: {{ currentProject.status }}</div>
              <div>Preview URL: {{ currentProject.design?.previewUrl || 'No URL' }}</div>
            </div>

            <div class="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                v-if="currentProject.design?.previewUrl"
                :src="currentProject.design.previewUrl"
                alt="Design Preview"
                class="w-full h-full object-contain"
                @error="(e) => console.error('Image load error:', e)"
                @load="() => console.log('Image loaded successfully')"
              />
              <div v-else class="flex items-center justify-center h-full text-gray-400">
                No preview URL available
              </div>
            </div>
            <div class="flex gap-3">
              <button class="flex-1 py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                Download
              </button>
              <button class="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Edit in Canvas
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <div>
            <h4 class="text-sm font-medium text-blue-900 dark:text-blue-300">Phase 4 - AI Integration Complete!</h4>
            <p class="text-sm text-blue-700 dark:text-blue-400 mt-1">
              AI-powered background removal and text layout are now available! Enable "Remove Background" option to process images automatically.
            </p>
          </div>
        </div>
      </div>
      </div>

      <!-- Size Selection Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="showSizePopup"
            class="fixed inset-0 z-50 overflow-y-auto"
            @click.self="showSizePopup = false"
          >
            <div class="flex min-h-screen items-center justify-center p-4">
              <!-- Backdrop -->
              <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>

              <!-- Modal -->
              <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 transform transition-all">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Select Size</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose the perfect dimensions for your design</p>
                  </div>
                  <button
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    @click="showSizePopup = false"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Size Options Grid -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <button
                    v-for="size in sizeOptions"
                    :key="size.value"
                    :class="[
                      'p-5 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02]',
                      formData.size === size.value
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600'
                    ]"
                    @click="selectSize(size.value)"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div
                        :class="[
                          'w-12 h-12 rounded-lg flex items-center justify-center',
                          formData.size === size.value
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                            : 'bg-gray-100 dark:bg-gray-700'
                        ]"
                      >
                        <svg
                          :class="[
                            'w-6 h-6',
                            formData.size === size.value ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                          ]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="size.icon" />
                        </svg>
                      </div>
                      <div v-if="formData.size === size.value" class="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-1">{{ size.label }}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ size.description }}</p>
                  </button>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                  <button
                    class="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    @click="showSizePopup = false"
                  >
                    Cancel
                  </button>
                  <button
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-cyan-500/30"
                    @click="confirmSize"
                  >
                    Apply Size
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Design Preview Modal -->
      <DesignPreviewModal
        v-model="autoDesignStore.showPreviewModal"
        :project="autoDesignStore.currentProject"
        @download="handleDownload"
        @send-to-editor="handleSendToEditor"
        @retouch="handleRetouch"
        @create-more="handleCreateMore"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'

// Lazy load heavy components for faster initial page load
const StickerTemplatePanel = defineAsyncComponent({
  loader: () => import('@/components/auto-design/StickerTemplatePanel.vue'),
  loadingComponent: {
    template: `<div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Loading designer...</p>
      </div>
    </div>`
  },
  delay: 100
})

const TagTemplatePanel = defineAsyncComponent({
  loader: () => import('@/components/auto-design/tag/TagTemplatePanel.vue'),
  loadingComponent: {
    template: `<div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Loading tag designer...</p>
      </div>
    </div>`
  },
  delay: 100
})

const CelebrationBurst = defineAsyncComponent(() => import('@/components/ui/CelebrationBurst.vue'))

const ImageUploader = defineAsyncComponent(() => import('@/components/image/ImageUploader.vue'))
const DesignPreviewModal = defineAsyncComponent(() => import('@/components/auto-design/DesignPreviewModal.vue'))
import * as autoDesignApi from '@/services/api/auto-design-api'
const route = useRoute()
const router = useRouter()
const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()

const showCelebration = ref(false)
const celebrationKey = ref(0)
let celebrationTimer: ReturnType<typeof setTimeout> | null = null

function triggerCelebration() {
  celebrationKey.value += 1
  showCelebration.value = true
  if (celebrationTimer) clearTimeout(celebrationTimer)
  celebrationTimer = setTimeout(() => {
    showCelebration.value = false
    celebrationTimer = null
  }, 1100)
}

// Initialize category from route query immediately (before render)
// to prevent flash of wrong content
const initialCategory = (route.query.category as string) || 'sticker'
const selectedCategory = ref<string>(initialCategory)
const showSizePopup = ref(false)

// Initial loading state - shows immediately on mount then fades out
const isInitialLoading = ref(true)

// Hide initial loading after a brief moment to allow DOM to settle
onMounted(() => {
  // Use requestAnimationFrame to ensure UI has rendered
  requestAnimationFrame(() => {
    setTimeout(() => {
      isInitialLoading.value = false
    }, 100)
  })
})

const sizeOptions = [
  {
    value: 'A4',
    label: 'A4',
    description: '210 × 297 mm',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    value: 'A5',
    label: 'A5',
    description: '148 × 210 mm',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    value: 'Letter',
    label: 'Letter',
    description: '8.5 × 11 in',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    value: 'Business Card',
    label: 'Business Card',
    description: '3.5 × 2 in',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  },
  {
    value: 'Custom',
    label: 'Custom Size',
    description: 'Set your own dimensions',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
  },
  {
    value: 'Instagram Post',
    label: 'Instagram Post',
    description: '1080 × 1080 px',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
  }
]

const selectedSizeText = computed(() => {
  const size = sizeOptions.find(s => s.value === formData.value.size)
  return size?.label || 'Select Size'
})

const selectedSizeDescription = computed(() => {
  const size = sizeOptions.find(s => s.value === formData.value.size)
  return size?.description || 'Choose dimensions'
})


const categoryName = computed(() => {
  return selectedCategory.value
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const formData = computed(() => autoDesignStore.formData)
const isGenerating = computed(() => autoDesignStore.isGenerating)
const generationProgress = computed(() => autoDesignStore.generationProgress)
const currentProject = computed(() => autoDesignStore.currentProject)

onMounted(() => {
  // Category was already set from route query during initialization
  // Just sync with store
  console.log('🎯 AutoDesignPage mounted with category:', selectedCategory.value)
  autoDesignStore.setCategory(selectedCategory.value)
  
  console.log('📌 Will show StickerTemplatePanel?', selectedCategory.value === 'sticker')
})

// Cleanup on unmount for faster navigation
onBeforeUnmount(() => {
  if (celebrationTimer) {
    clearTimeout(celebrationTimer)
    celebrationTimer = null
  }
})

function selectSize(size: string) {
  autoDesignStore.updateFormData('size', size)
}

function confirmSize() {
  showSizePopup.value = false
  authStore.showNotification({
    title: 'Size Applied',
    message: `Design size set to ${selectedSizeText.value}`,
    type: 'success'
  })
}


async function handleGenerate() {
  try {
    await autoDesignStore.generateDesign()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate design'
    authStore.showNotification({
      title: 'Generation Failed',
      message: errorMessage,
      type: 'error'
    })
  }
}

function goBack() {
  router.push('/home')
}

async function handleDownload(format: 'png' | 'jpeg' | 'pdf') {
  if (!autoDesignStore.currentProject) return

  try {
    const blob = await autoDesignApi.downloadDesign(autoDesignStore.currentProject.id, format)

    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `design-${autoDesignStore.currentProject.id}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    authStore.showNotification({
      title: 'Download Started',
      message: `Downloading design as ${format.toUpperCase()}`,
      type: 'success'
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to download design'
    authStore.showNotification({
      title: 'Download Failed',
      message: errorMessage,
      type: 'error'
    })
  }
}

function handleSendToEditor() {
  if (!autoDesignStore.currentProject) return
  autoDesignStore.sendToEditor(autoDesignStore.currentProject)
}

function handleRetouch() {
  authStore.showNotification({
    title: 'Coming Soon',
    message: 'Retouch feature will be available in Phase 6',
    type: 'info'
  })
}

function handleCreateMore() {
  authStore.showNotification({
    title: 'Coming Soon',
    message: 'Create More feature will be available in Phase 6',
    type: 'info'
  })
}
</script>

<style scoped>
/* Hide custom scrollbar while maintaining scroll functionality */
::-webkit-scrollbar {
  display: none;
  width: 0px;
}

::-webkit-scrollbar-track {
  display: none;
}

.dark ::-webkit-scrollbar-track {
  display: none;
}

::-webkit-scrollbar-thumb {
  display: none;
}

.dark ::-webkit-scrollbar-thumb {
  display: none;
}

::-webkit-scrollbar-thumb:hover {
  display: none;
}

.dark ::-webkit-scrollbar-thumb:hover {
  display: none;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}

/* Initial Loading State */
.initial-loading-state {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .initial-loading-state {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.loading-content {
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

.loading-spinner {
  width: 56px;
  height: 56px;
  border: 4px solid #e2e8f0;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

.dark .loading-spinner {
  border-color: #374151;
  border-top-color: #a78bfa;
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px;
}

.dark .loading-title {
  color: #f1f5f9;
}

.loading-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

.dark .loading-subtitle {
  color: #94a3b8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

