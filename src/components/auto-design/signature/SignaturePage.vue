<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-2 md:p-3">
    <div class="max-w-4xl mx-auto lg:max-w-6xl xl:max-w-7xl">
      <!-- Header -->
      <div class="mb-3">
        <button
          @click="handleBack"
          class="mb-2 px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-1 text-slate-700 dark:text-slate-200 text-[10px]"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2.5 lg:p-4 xl:p-5 border border-purple-200 dark:border-purple-700">
          <div class="flex items-center gap-2 lg:gap-3 xl:gap-4 mb-1">
            <div class="p-1.5 lg:p-2 xl:p-2.5 bg-purple-100 dark:bg-purple-900 rounded-lg lg:rounded-xl">
              <svg class="w-4 h-4 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h1 class="text-base lg:text-xl xl:text-2xl font-bold text-slate-900 dark:text-white">Digital Signature</h1>
              <p class="text-[10px] lg:text-sm xl:text-base text-slate-600 dark:text-slate-300">Create and manage your signatures</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <!-- Signature Drawing Area -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2.5 lg:p-4 xl:p-5 border border-slate-200 dark:border-slate-700">
            <div class="mb-2.5 lg:mb-4 xl:mb-5">
              <h2 class="text-xs lg:text-base xl:text-lg font-semibold text-slate-900 dark:text-white mb-2 lg:mb-3 xl:mb-4">Draw Your Signature</h2>

              <!-- Color Picker -->
              <div class="flex items-center gap-2 lg:gap-3 xl:gap-4 mb-2 lg:mb-3 xl:mb-4">
                <label class="text-[10px] lg:text-sm xl:text-base font-medium text-slate-700 dark:text-slate-300">Pen Color:</label>
                <div class="flex gap-1 lg:gap-2">
                  <button
                    v-for="color in colors"
                    :key="color.value"
                    @click="penColor = color.value"
                    :class="[
                      'w-5 h-5 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-full border-2 transition-all',
                      penColor === color.value ? 'border-slate-900 dark:border-white scale-110' : 'border-slate-300 dark:border-slate-600'
                    ]"
                    :style="{ backgroundColor: color.value }"
                    :title="color.name"
                  ></button>
                </div>
              </div>

              <!-- Pen Size -->
              <div class="flex items-center gap-2 lg:gap-3 xl:gap-4 mb-2 lg:mb-3 xl:mb-4">
                <label class="text-[10px] lg:text-sm xl:text-base font-medium text-slate-700 dark:text-slate-300">Pen Size:</label>
                <input
                  v-model.number="penSize"
                  type="range"
                  min="1"
                  max="10"
                  class="flex-1 max-w-xs lg:max-w-md xl:max-w-lg"
                />
                <span class="text-[10px] lg:text-sm xl:text-base text-slate-600 dark:text-slate-400">{{ penSize }}px</span>
              </div>
            </div>

            <!-- Canvas -->
            <div class="relative bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
              <canvas
                ref="canvas"
                @mousedown="startDrawing"
                @mousemove="draw"
                @mouseup="stopDrawing"
                @mouseleave="stopDrawing"
                @touchstart="startDrawing"
                @touchmove="draw"
                @touchend="stopDrawing"
                class="w-full cursor-crosshair"
                :width="canvasWidth"
                :height="canvasHeight"
              ></canvas>
            </div>

            <!-- Controls -->
            <div class="mt-2 flex gap-1.5">
              <button
                @click="clearCanvas"
                class="px-2.5 py-1 text-[10px] bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
              <button
                @click="saveSignature"
                :disabled="!hasDrawn || savingSignature"
                class="flex-1 px-2.5 py-1 text-[10px] bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                title="Click to save your signature"
              >
                <svg v-if="!savingSignature" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <svg v-else class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ savingSignature ? 'Saving...' : 'Save Signature' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Saved Signatures -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2.5 lg:p-4 xl:p-5 border border-slate-200 dark:border-slate-700">
            <h2 class="text-xs lg:text-base xl:text-lg font-semibold text-slate-900 dark:text-white mb-2 lg:mb-3 xl:mb-4">Saved Signatures</h2>

            <div v-if="signatures.length === 0" class="text-center py-4 text-slate-500 dark:text-slate-400">
              <svg class="w-8 h-8 mx-auto mb-1.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-[10px]">No signatures yet</p>
            </div>

            <div v-else class="space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="sig in signatures"
                :key="sig.id"
                :class="[
                  'p-2 rounded-lg border-2 transition-all cursor-pointer',
                  selectedSignature === sig.id
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-slate-200 dark:border-slate-600 hover:border-purple-400'
                ]"
                @click="selectSignature(sig.id)"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[10px] text-slate-600 dark:text-slate-400">{{ sig.name }}{{ sig.isPrimary ? ' (Primary)' : '' }}</span>
                  <button
                    @click.stop="deleteSignature(sig.id)"
                    class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <img :src="sig.dataURL" alt="Signature" class="w-full h-12 object-contain bg-white rounded" />
                <div v-if="selectedSignature === sig.id" class="mt-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                  ✓ Selected
                </div>
              </div>
            </div>

            <button
              v-if="selectedSignature !== null"
              @click="proceedWithSignature"
              class="mt-2 w-full px-2.5 py-1.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Proceed to {{ documentType === 'invoice' ? 'Invoice' : documentType === 'receipt' ? 'Receipt' : 'Document' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAllSignatures, saveSignature as saveSignatureDB, deleteSignature as deleteSignatureDB } from '@/firebase/database';

const router = useRouter();
const route = useRoute();

// Canvas refs
const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

// State
const isDrawing = ref(false);
const hasDrawn = ref(false);
const penColor = ref('#000000');
const penSize = ref(2);
const canvasWidth = 650;
const canvasHeight = 280;

// Authenticated member info
interface AuthenticatedMember {
  name: string;
  branch: string;
  role: string;
}

const authenticatedMember = ref<AuthenticatedMember | null>(null);

// Colors
const colors = [
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Purple', value: '#8b5cf6' }
];

// Signatures - Updated to match Firebase structure
const signatures = ref<Array<{ 
  id: string; 
  dataURL: string; 
  name: string; 
  isPrimary: boolean;
  createdAt: string;
  branch: string;
}>>([]);
const selectedSignature = ref<string | null>(null);
const loadingSignatures = ref(false);
const savingSignature = ref(false);

// Document type from route query
const documentType = computed(() => route.query.type as string | undefined);

// Load signatures from Firebase
const loadSignatures = async () => {
  if (!authenticatedMember.value?.branch) {
    console.warn('Cannot load signatures: No branch information');
    return;
  }

  loadingSignatures.value = true;
  try {
    console.log('Loading signatures for branch:', authenticatedMember.value.branch);
    const result = await getAllSignatures(authenticatedMember.value.branch);
    console.log('Load signatures result:', result);
    
    if (result.success) {
      signatures.value = result.signatures || result.data || [];
      console.log('Loaded signatures:', signatures.value.length);
    } else {
      console.error('Failed to load signatures:', result.error);
    }
  } catch (error) {
    console.error('Error loading signatures:', error);
  } finally {
    loadingSignatures.value = false;
  }
};

// Initialize canvas
onMounted(() => {
  // Load authenticated member info
  const memberData = localStorage.getItem('authenticatedMember');
  console.log('Authenticated member data:', memberData);
  
  if (memberData) {
    try {
      authenticatedMember.value = JSON.parse(memberData);
      console.log('Authenticated member:', authenticatedMember.value);
    } catch (error) {
      console.error('Error parsing authenticated member:', error);
      alert('⚠️ Authentication error. Please log in again.');
    }
  } else {
    console.warn('No authenticated member found in localStorage');
    alert('⚠️ Please log in to use signature features.');
  }

  if (canvas.value) {
    ctx = canvas.value.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = penColor.value;
      ctx.lineWidth = penSize.value;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      console.log('Canvas initialized successfully');
    }
  } else {
    console.error('Canvas element not found');
  }

  // Load signatures from Firebase
  loadSignatures();
});

// Drawing functions
function startDrawing(event: MouseEvent | TouchEvent) {
  if (!ctx || !canvas.value) return;
  
  isDrawing.value = true;
  hasDrawn.value = true;

  const pos = getMousePos(event);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  
  // Update pen settings
  ctx.strokeStyle = penColor.value;
  ctx.lineWidth = penSize.value;
}

function draw(event: MouseEvent | TouchEvent) {
  if (!isDrawing.value || !ctx) return;

  event.preventDefault();
  const pos = getMousePos(event);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing.value = false;
}

function getMousePos(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if (!canvas.value) return { x: 0, y: 0 };

  const rect = canvas.value.getBoundingClientRect();
  const scaleX = canvas.value.width / rect.width;
  const scaleY = canvas.value.height / rect.height;

  let clientX: number, clientY: number;

  if (event instanceof MouseEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function clearCanvas() {
  if (!ctx || !canvas.value) return;

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  hasDrawn.value = false;
}

async function saveSignature() {
  if (!canvas.value || !hasDrawn.value) {
    alert('⚠️ Please draw a signature first!');
    return;
  }
  
  if (!authenticatedMember.value?.branch) {
    alert('⚠️ Authentication error: No branch information found. Please log in again.');
    console.error('Missing branch info:', authenticatedMember.value);
    return;
  }

  if (savingSignature.value) {
    console.log('Already saving...');
    return; // Prevent double submission
  }

  savingSignature.value = true;

  try {
    const dataUrl = canvas.value.toDataURL('image/png');
    const signatureName = `Signature ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    
    const newSignatureData = {
      name: signatureName,
      dataURL: dataUrl,
      isPrimary: signatures.value.length === 0, // First signature is primary by default
    };

    console.log('Saving signature for branch:', authenticatedMember.value.branch);
    console.log('Signature data:', { name: signatureName, isPrimary: newSignatureData.isPrimary });
    
    // Save to Firebase database
    const result = await saveSignatureDB(authenticatedMember.value.branch, newSignatureData);
    
    console.log('Save result:', result);
    
    if (result.success) {
      // Reload signatures to get updated list
      await loadSignatures();
      
      // Auto-select the new signature
      selectedSignature.value = result.id;

      // Clear canvas
      clearCanvas();

      // Check if user came from Invoice or Receipt page
      const returnPath = localStorage.getItem('signatureReturnPath');
      const returnType = localStorage.getItem('signatureReturnType');
      
      console.log('Return path:', returnPath, 'Return type:', returnType);
      
      if (returnPath && returnType) {
        // Show success message with option to return
        const docType = returnType === 'invoice' ? 'Invoice' : 'Receipt';
        const shouldReturn = confirm(
          `✅ Signature saved successfully!\n\n` +
          `Would you like to return to ${docType} page to use this signature?`
        );
        
        if (shouldReturn) {
          // Clear the stored return path
          localStorage.removeItem('signatureReturnPath');
          localStorage.removeItem('signatureReturnType');
          // Navigate back to the original page
          router.push(returnPath);
        }
      } else {
        // Regular save without return path
        alert('✅ Signature saved successfully!');
      }
    } else {
      alert(`❌ Failed to save signature: ${result.error || 'Unknown error'}`);
      console.error('Save failed:', result);
    }
  } catch (error) {
    console.error('Error saving signature:', error);
    alert(`❌ Error saving signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    savingSignature.value = false;
  }
}

function selectSignature(signatureId: string) {
  selectedSignature.value = signatureId;
}

async function deleteSignature(signatureId: string) {
  if (!authenticatedMember.value?.branch) return;
  
  if (confirm('Are you sure you want to delete this signature?')) {
    try {
      const result = await deleteSignatureDB(authenticatedMember.value.branch, signatureId);
      
      if (result.success) {
        // Reload signatures
        await loadSignatures();
        
        // Clear selection if deleted signature was selected
        if (selectedSignature.value === signatureId) {
          selectedSignature.value = null;
        }
        
        alert('✅ Signature deleted successfully!');
      } else {
        alert('❌ Failed to delete signature. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting signature:', error);
      alert('❌ Error deleting signature. Please try again.');
    }
  }
}

function proceedWithSignature() {
  if (selectedSignature.value === null) return;

  // Navigate based on document type
  if (documentType.value === 'invoice') {
    router.push('/invoice');
  } else if (documentType.value === 'receipt') {
    router.push('/receipt');
  } else {
    router.push('/invoice-receipt');
  }
}

function handleBack() {
  // Check if there's a return path stored
  const returnPath = localStorage.getItem('signatureReturnPath');
  
  if (returnPath) {
    // Clear the stored return path
    localStorage.removeItem('signatureReturnPath');
    localStorage.removeItem('signatureReturnType');
    router.push(returnPath);
  } else {
    router.push('/invoice-receipt');
  }
}
</script>

<style scoped>
canvas {
  touch-action: none;
}

/* Hide custom scrollbar while maintaining scroll functionality */
::-webkit-scrollbar {
  display: none;
  width: 0px;
}

::-webkit-scrollbar-track {
  display: none;
}

::-webkit-scrollbar-thumb {
  display: none;
}

::-webkit-scrollbar-thumb:hover {
  display: none;
}
</style>
