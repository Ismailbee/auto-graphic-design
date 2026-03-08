<template>
  <!-- Modal Overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2"
        style="z-index: 2000;"
        @click.self="handleClose"
      >
        <!-- Modal Content -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Crop Logo Image
            </h3>
            <button
              type="button"
              @click="handleClose"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Cropper Area -->
          <div class="flex-1 overflow-auto p-4 md:p-6">
            <div class="w-full h-full flex flex-col lg:flex-row-reverse gap-4 lg:gap-6">
              <!-- Controls - Side Panel on Desktop, Bottom on Mobile -->
              <div class="w-full lg:w-56 flex-shrink-0 space-y-3 order-2 lg:order-1">
                <!-- Zoom Control -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Zoom</label>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="zoomOut"
                      class="px-2 py-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded text-slate-900 dark:text-white transition-colors text-lg leading-none flex-shrink-0"
                    >
                      −
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      :value="zoomLevel"
                      @input="handleZoom"
                      class="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <button
                      type="button"
                      @click="zoomIn"
                      class="px-2 py-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded text-slate-900 dark:text-white transition-colors text-lg leading-none flex-shrink-0"
                    >
                      +
                    </button>
                  </div>
                  <span class="text-xs text-slate-600 dark:text-slate-400 text-center">{{ zoomLevel }}%</span>
                </div>

                <!-- Transform Buttons -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Transform</label>
                  <div class="flex lg:grid lg:grid-cols-2 gap-2 overflow-x-auto">
                    <button
                      type="button"
                      @click="rotateLeft"
                      class="px-3 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded text-xs font-medium transition-colors flex flex-col items-center gap-1 whitespace-nowrap flex-shrink-0"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      <span class="text-[10px]">Rotate L</span>
                    </button>
                    <button
                      type="button"
                      @click="rotateRight"
                      class="px-3 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded text-xs font-medium transition-colors flex flex-col items-center gap-1 whitespace-nowrap flex-shrink-0"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                      </svg>
                      <span class="text-[10px]">Rotate R</span>
                    </button>
                    <button
                      type="button"
                      @click="flipHorizontal"
                      class="px-3 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded text-xs font-medium transition-colors flex flex-col items-center gap-1 whitespace-nowrap flex-shrink-0"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span class="text-[10px]">Flip</span>
                    </button>
                    <button
                      type="button"
                      @click="reset"
                      class="px-3 py-3 bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600 rounded text-xs font-medium transition-colors flex flex-col items-center gap-1 whitespace-nowrap flex-shrink-0"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span class="text-[10px]">Reset</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Image Container -->
              <div class="flex-1 bg-gray-100 dark:bg-slate-900 rounded-lg overflow-hidden order-1 lg:order-2" :style="{ minHeight: '220px', maxHeight: '380px', height: containerHeight }">
                <div class="w-full h-full flex items-center justify-center relative cropper-wrapper">
                  <img
                    ref="imageElement"
                    :src="imageUrl"
                    alt="Crop preview"
                    class="block max-w-full max-h-full"
                    @load="onImageLoad"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
                type="button"
                @click="handleClose"
                class="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
                type="button"
                @click="handleCrop"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close', 'crop']);

const imageElement = ref(null);
const cropper = ref(null);
const zoomLevel = ref(0);
const scaleX = ref(1);
const imageLoaded = ref(false);
const currentRotation = ref(0); // Track current rotation in degrees
const containerHeight = ref('350px'); // Dynamic container height

// Handle image load event
const onImageLoad = () => {
  console.log('🖼️ Image loaded successfully');
  imageLoaded.value = true;
  if (props.isOpen && props.imageUrl) {
    console.log('🎬 Initializing cropper after image load');
    nextTick(() => {
      initCropper();
    });
  }
};

// Initialize cropper when modal opens
watch(() => props.isOpen, async (newVal) => {
  console.log('👀 isOpen changed:', newVal, 'imageUrl:', props.imageUrl ? 'present' : 'missing');
  if (newVal && props.imageUrl) {
    await nextTick();
    console.log('⏰ After nextTick, imageElement:', imageElement.value ? 'exists' : 'null');
    initCropper();
  } else {
    destroyCropper();
  }
});

// Also watch for imageUrl changes
watch(() => props.imageUrl, async (newVal) => {
  console.log('🖼️ imageUrl changed:', newVal ? 'present' : 'missing');
  if (props.isOpen && newVal) {
    await nextTick();
    console.log('⏰ After nextTick (imageUrl watch), imageElement:', imageElement.value ? 'exists' : 'null');
    initCropper();
  }
});

// Try to initialize on mount if modal is already open
onMounted(() => {
  console.log('🏔️ LogoCropper mounted, isOpen:', props.isOpen, 'imageUrl:', props.imageUrl ? 'present' : 'missing');
  if (props.isOpen && props.imageUrl) {
    nextTick(() => {
      console.log('⏰ After nextTick (onMounted), imageElement:', imageElement.value ? 'exists' : 'null');
      initCropper();
    });
  }
});

const initCropper = () => {
  console.log('🚀 Initializing cropper...');
  if (!imageElement.value) {
    console.error('❌ imageElement.value is null');
    return;
  }

  console.log('✅ imageElement exists');
  
  // Destroy existing cropper
  destroyCropper();

  // Create new cropper instance
  console.log('🎨 Creating new Cropper instance...');
  cropper.value = new Cropper(imageElement.value, {
    aspectRatio: NaN, // Free aspect ratio
    viewMode: 1, // Restrict crop box to not exceed the canvas
    dragMode: 'move',
    autoCropArea: 0.6, // Smaller initial crop area for better visibility
    restore: false,
    guides: true,
    center: true,
    highlight: true,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
    responsive: true,
    checkOrientation: true,
    modal: true,
    background: true,
    scalable: true,
    rotatable: true,
    zoomable: true,
    zoomOnWheel: false,
    wheelZoomRatio: 0.1,
    minContainerWidth: 200,
    minContainerHeight: 200,
    // Force initial sizing
    initialAspectRatio: NaN,
    ready: () => {
      console.log('✅ Cropper is ready and initialized!');
      console.log('🖼️ Cropper instance:', cropper.value);
      
      // Force immediate auto-sizing
      setTimeout(() => {
        autoSizeImageToFit();
        updateContainerDimensions();
      }, 100);
    },
    zoom: () => {
      // Prevent extreme zoom levels
      const imageData = cropper.value.getImageData();
      if (imageData.ratio > 3) {
        cropper.value.zoomTo(3);
      } else if (imageData.ratio < 0.1) {
        cropper.value.zoomTo(0.1);
      }
    }
  });
};

// Aggressive auto-sizing function to ensure image always fits completely
const autoSizeImageToFit = () => {
  if (!cropper.value) return;
  
  console.log('🔧 Auto-sizing image to fit container...');
  
  try {
    const containerData = cropper.value.getContainerData();
    const imageData = cropper.value.getImageData();
    
    if (!containerData || !imageData) return;
    
    // Calculate available space with margins
    const availableWidth = containerData.width * 0.95; // 95% of container for better fit
    const availableHeight = containerData.height * 0.95; // 95% of container for better fit
    
    // Calculate scale needed to fit both dimensions
    const widthScale = availableWidth / imageData.naturalWidth;
    const heightScale = availableHeight / imageData.naturalHeight;
    
    // Use the smaller scale to ensure image fits completely
    const optimalScale = Math.min(widthScale, heightScale);
    
    // Ensure scale is within reasonable bounds
    const finalScale = Math.max(Math.min(optimalScale, 1.0), 0.1);
    
    console.log('📏 Container:', containerData.width, 'x', containerData.height);
    console.log('📷 Image:', imageData.naturalWidth, 'x', imageData.naturalHeight);
    console.log('🎯 Calculated scale:', finalScale);
    
    // Apply the scale
    cropper.value.zoomTo(finalScale);
    
    // Center the image
    setTimeout(() => {
      const newImageData = cropper.value.getImageData();
      const centerX = (containerData.width - newImageData.width) / 2;
      const centerY = (containerData.height - newImageData.height) / 2;
      cropper.value.moveTo(centerX, centerY);
      
      // Reset zoom level display
      zoomLevel.value = 0;
    }, 50);
    
  } catch (error) {
    console.error('❌ Error in auto-sizing:', error);
    // Fallback to basic fit
    fitImageToContainer();
  }
};

// Destroy cropper function
const destroyCropper = () => {
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }
};

// Helper function to fit image to container
const fitImageToContainer = () => {
  if (cropper.value) {
    // Save current rotation before reset
    const savedRotation = currentRotation.value;
    
    // Reset to default first (this will reset rotation to 0)
    cropper.value.reset();
    
    // Reapply the saved rotation if any
    if (savedRotation !== 0) {
      cropper.value.rotateTo(savedRotation);
    }
    
    // Now get dimensions AFTER rotation is applied
    const containerData = cropper.value.getContainerData();
    const imageData = cropper.value.getImageData();
    
    // Calculate the ratio to fit the image within the container
    // When rotated 90 or 270 degrees, dimensions are swapped
    const isRotated90or270 = savedRotation === 90 || savedRotation === 270;
    const effectiveWidth = isRotated90or270 ? imageData.naturalHeight : imageData.naturalWidth;
    const effectiveHeight = isRotated90or270 ? imageData.naturalWidth : imageData.naturalHeight;
    
    const containerRatio = containerData.width / containerData.height;
    const imageRatio = effectiveWidth / effectiveHeight;
    
    // Use 95% scaling to maximize visible area while ensuring image fits
    let scale;
    if (imageRatio > containerRatio) {
      // Image is wider - fit to width
      scale = (containerData.width * 0.95) / effectiveWidth;
    } else {
      // Image is taller - fit to height
      scale = (containerData.height * 0.95) / effectiveHeight;
    }
    
    // Ensure minimum scale to prevent tiny images
    scale = Math.max(scale, 0.1);
    
    // Apply the calculated scale
    cropper.value.zoomTo(scale);
    
    // Center the image by moving it to the center of the container
    setTimeout(() => {
      const updatedContainerData = cropper.value.getContainerData();
      const updatedImageData = cropper.value.getImageData();
      
      // Calculate center position
      const centerX = (updatedContainerData.width - updatedImageData.width) / 2;
      const centerY = (updatedContainerData.height - updatedImageData.height) / 2;
      
      // Move image to center
      cropper.value.moveTo(centerX, centerY);
    }, 50);
    
    // Reset zoom level display to 0 as this is the "fitted" state
    zoomLevel.value = 0;
  }
};

// Function to update container dimensions based on image and rotation
const updateContainerDimensions = () => {
  if (cropper.value) {
    const imageData = cropper.value.getImageData();
    const isRotated90or270 = currentRotation.value === 90 || currentRotation.value === 270;
    
    // Get effective dimensions considering rotation
    const effectiveWidth = isRotated90or270 ? imageData.naturalHeight : imageData.naturalWidth;
    const effectiveHeight = isRotated90or270 ? imageData.naturalWidth : imageData.naturalHeight;
    
    // Calculate aspect ratio
    const aspectRatio = effectiveHeight / effectiveWidth;
    
    // Set container height based on aspect ratio
    // Cap at 380px to ensure image shows completely on laptop screens
    const maxWidth = 550;
    const calculatedHeight = Math.min(380, maxWidth * aspectRatio);
    containerHeight.value = `${calculatedHeight}px`;
  }
};

// Enhanced rotation function that always fits the image after rotation
const rotateAndFit = (degrees) => {
  if (cropper.value) {
    console.log('🔄 Rotating by', degrees, 'degrees');
    
    // Update rotation tracking
    currentRotation.value = (currentRotation.value + degrees) % 360;
    if (currentRotation.value < 0) currentRotation.value += 360;
    
    // Get image data before rotation for proper scaling calculation
    const imageData = cropper.value.getImageData();
    const containerData = cropper.value.getContainerData();
    
    // Perform rotation
    cropper.value.rotate(degrees);
    
    // Wait for rotation to complete, then properly scale and fit
    setTimeout(() => {
      // Update container dimensions first
      updateContainerDimensions();
      
      // Get new dimensions after rotation
      const newImageData = cropper.value.getImageData();
      const newContainerData = cropper.value.getContainerData();
      
      // Calculate proper scaling for rotated image
      const containerRatio = newContainerData.width / newContainerData.height;
      
      // For rotated images, swap width/height in calculations
      const isRotated90or270 = currentRotation.value === 90 || currentRotation.value === 270;
      const effectiveWidth = isRotated90or270 ? newImageData.naturalHeight : newImageData.naturalWidth;
      const effectiveHeight = isRotated90or270 ? newImageData.naturalWidth : newImageData.naturalHeight;
      const imageRatio = effectiveWidth / effectiveHeight;
      
      let scale;
      if (imageRatio > containerRatio) {
        // Image is wider - fit to width with 80% container usage
        scale = (newContainerData.width * 0.80) / effectiveWidth;
      } else {
        // Image is taller - fit to height with 80% container usage
        scale = (newContainerData.height * 0.80) / effectiveHeight;
      }
      
      // Apply proper scaling
      cropper.value.zoomTo(scale);
      
      // Center the image
      const finalImageData = cropper.value.getImageData();
      const centerX = (newContainerData.width - finalImageData.width) / 2;
      const centerY = (newContainerData.height - finalImageData.height) / 2;
      cropper.value.moveTo(centerX, centerY);
      
      // Reset zoom level display
      zoomLevel.value = 0;
    }, 100);
  }
};

const handleZoom = (event) => {
  console.log('🔍 Zoom slider changed:', event.target.value);
  const newZoom = parseInt(event.target.value);
  zoomLevel.value = newZoom;
  
  if (cropper.value) {
    if (newZoom === 0) {
      // Fit image to container when zoom is 0
      fitImageToContainer();
    } else {
      const containerData = cropper.value.getContainerData();
      const imageData = cropper.value.getImageData();
      
      // Calculate base fitted scale
      const containerRatio = containerData.width / containerData.height;
      const imageRatio = imageData.naturalWidth / imageData.naturalHeight;
      
      let baseFitScale;
      if (imageRatio > containerRatio) {
        baseFitScale = (containerData.width * 0.80) / imageData.naturalWidth;
      } else {
        baseFitScale = (containerData.height * 0.80) / imageData.naturalHeight;
      }
      
      // 0 = fitted state, 1-200 = zoom in from fitted
      // Use linear scaling: zoom multiplier from 1x to 5x
      const zoomMultiplier = 1 + (newZoom / 100) * 2; // Maps 0->1x, 100->3x, 200->5x
      const ratio = baseFitScale * zoomMultiplier;
      console.log('📐 Zooming to ratio:', ratio, 'multiplier:', zoomMultiplier);
      cropper.value.zoomTo(ratio);
    }
  } else {
    console.error('❌ Cropper not initialized');
  }
};

const zoomIn = () => {
  console.log('➕ Zoom in clicked');
  if (cropper.value) {
    const newZoom = Math.min(200, zoomLevel.value + 10);
    zoomLevel.value = newZoom;
    
    if (newZoom === 0) {
      fitImageToContainer();
    } else {
      const containerData = cropper.value.getContainerData();
      const imageData = cropper.value.getImageData();
      
      const containerRatio = containerData.width / containerData.height;
      const imageRatio = imageData.naturalWidth / imageData.naturalHeight;
      
      let baseFitScale;
      if (imageRatio > containerRatio) {
        baseFitScale = (containerData.width * 0.80) / imageData.naturalWidth;
      } else {
        baseFitScale = (containerData.height * 0.80) / imageData.naturalHeight;
      }
      
      const zoomMultiplier = 1 + (newZoom / 100) * 2;
      const ratio = baseFitScale * zoomMultiplier;
      
      cropper.value.zoomTo(ratio);
    }
  } else {
    console.error('❌ Cropper not initialized');
  }
};

const zoomOut = () => {
  console.log('➖ Zoom out clicked');
  if (cropper.value) {
    const newZoom = Math.max(0, zoomLevel.value - 10);
    zoomLevel.value = newZoom;
    
    if (newZoom === 0) {
      fitImageToContainer();
    } else {
      const containerData = cropper.value.getContainerData();
      const imageData = cropper.value.getImageData();
      
      const containerRatio = containerData.width / containerData.height;
      const imageRatio = imageData.naturalWidth / imageData.naturalHeight;
      
      let baseFitScale;
      if (imageRatio > containerRatio) {
        baseFitScale = (containerData.width * 0.80) / imageData.naturalWidth;
      } else {
        baseFitScale = (containerData.height * 0.80) / imageData.naturalHeight;
      }
      
      const zoomMultiplier = 1 + (newZoom / 100) * 2;
      const ratio = baseFitScale * zoomMultiplier;
      
      cropper.value.zoomTo(ratio);
    }
  } else {
    console.error('❌ Cropper not initialized');
  }
};

const rotateLeft = () => {
  console.log('↪️ Rotate left clicked');
  if (cropper.value) {
    rotateAndFit(-90);
  } else {
    console.error('❌ Cropper not initialized');
  }
};

const rotateRight = () => {
  console.log('↩️ Rotate right clicked');
  if (cropper.value) {
    rotateAndFit(90);
  } else {
    console.error('❌ Cropper not initialized');
  }
};

// Smart rotation function that toggles between landscape and portrait
const smartRotate = () => {
  if (cropper.value) {
    const imageData = cropper.value.getImageData();
    const isLandscape = imageData.naturalWidth > imageData.naturalHeight;
    
    // If landscape, rotate to make portrait; if portrait, rotate to make landscape
    const rotationDegrees = isLandscape ? 90 : -90;
    console.log('🔄 Smart rotate: image is', isLandscape ? 'landscape' : 'portrait', 'rotating', rotationDegrees, 'degrees');
    
    rotateAndFit(rotationDegrees);
  }
};

const flipHorizontal = () => {
  console.log('🔄 Flip horizontal clicked');
  if (cropper.value) {
    scaleX.value = -scaleX.value;
    console.log('🔄 New scaleX:', scaleX.value);
    cropper.value.scaleX(scaleX.value);
    
    // Reduce container size and fit image to show completely
    setTimeout(() => {
      updateContainerDimensions();
      fitImageToContainer();
    }, 50);
  } else {
    console.error('❌ Cropper not initialized');
  }
};

const reset = () => {
  console.log('🔄 Reset clicked');
  if (cropper.value) {
    cropper.value.reset();
    scaleX.value = 1;
    currentRotation.value = 0; // Reset rotation tracking
    containerHeight.value = '350px'; // Reset to default height
    // Fit image after reset and set zoom to 0%
    setTimeout(() => {
      updateContainerDimensions();
      fitImageToContainer();
      zoomLevel.value = 0;
    }, 50);
    console.log('✅ Reset complete');
  } else {
    console.error('❌ Cropper not initialized');
  }
};

const handleCrop = () => {
  console.log('🎯 LogoCropper: handleCrop called');
  
  if (!cropper.value) {
    console.error('❌ LogoCropper: cropper.value is null/undefined');
    return;
  }

  console.log('✅ LogoCropper: cropper instance exists');

  // Get cropped canvas
  const canvas = cropper.value.getCroppedCanvas({
    maxWidth: 4096,
    maxHeight: 4096,
    fillColor: '#fff',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  });

  if (!canvas) {
    console.error('❌ LogoCropper: getCroppedCanvas returned null');
    return;
  }

  console.log('✅ LogoCropper: canvas created successfully', canvas);

  // Convert to data URL (PNG format for transparency)
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error('❌ LogoCropper: toBlob returned null');
      return;
    }
    
    console.log('✅ LogoCropper: blob created', blob.size, 'bytes');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('✅ LogoCropper: FileReader complete, emitting crop event');
      console.log('📤 LogoCropper: Data URL length:', reader.result ? reader.result.length : 0);
      emit('crop', reader.result);
    };
    reader.onerror = (error) => {
      console.error('❌ LogoCropper: FileReader error:', error);
    };
    reader.readAsDataURL(blob);
  }, 'image/png', 0.95);
};

const handleClose = () => {
  emit('close');
};

// Cleanup on unmount
onBeforeUnmount(() => {
  destroyCropper();
});
</script>

<style scoped>
/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}

/* Custom range slider */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Ensure cropper elements fill the full height */
.cropper-wrapper :deep(.cropper-container) {
  width: 100% !important;
  height: 100% !important;
}

.cropper-wrapper :deep(.cropper-canvas),
.cropper-wrapper :deep(.cropper-drag-box),
.cropper-wrapper :deep(.cropper-crop-box),
.cropper-wrapper :deep(.cropper-modal) {
  width: 100% !important;
  height: 100% !important;
}
</style>
