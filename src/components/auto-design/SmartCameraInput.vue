<template>
  <div class="smart-camera-input">
    <ion-button @click="handleSmartScanClick" color="primary" expand="block">
      <ion-icon slot="start" :icon="camera"></ion-icon>
      📸 Smart Scan
    </ion-button>

    <ion-modal :is-open="isOpen" @didDismiss="isOpen = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Smart Design Scanner</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="isOpen = false">
              <ion-icon :icon="close"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding">
        <!-- Tabs/Segment Control -->
        <div class="tabs-container">
          <div 
            class="tab-button" 
            :class="{ active: activeTab === 'scan' }"
            @click="activeTab = 'scan'"
          >
            <ion-icon :icon="camera"></ion-icon>
            Scan & Extract
          </div>
          <div 
            class="tab-button" 
            :class="{ active: activeTab === 'chat' }"
            @click="activeTab = 'chat'"
          >
            <ion-icon :icon="chatbubbles"></ion-icon>
            AI Chat
          </div>
        </div>

        <!-- Scan Section -->
        <div v-if="activeTab === 'scan'" class="scan-section">
          <div class="action-buttons">
            <ion-button @click="takePicture" color="secondary">
              <ion-icon slot="start" :icon="camera"></ion-icon>
              Camera
            </ion-button>
            
            <input 
              type="file" 
              accept="image/*" 
              ref="fileInput" 
              style="display: none" 
              @change="handleFileUpload"
            />
            <ion-button @click="$refs.fileInput.click()" color="tertiary">
              <ion-icon slot="start" :icon="image"></ion-icon>
              Upload
            </ion-button>
          </div>

          <div v-if="isProcessing" class="loading-container">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Analyzing image with AI...</p>
          </div>

          <div v-if="imageSrc" class="preview-container">
            <img :src="imageSrc" alt="Captured" class="preview-image" />
          </div>

          <div class="result-container">
            <div class="result-header">
              <h3>Extracted Text</h3>
              <ion-button size="small" fill="clear" @click="refineWithAI" :disabled="isAiThinking || !extractedText">
                <ion-icon slot="start" :icon="sparkles"></ion-icon>
                Refine with AI
              </ion-button>
            </div>
            <ion-textarea
              v-model="extractedText"
              placeholder="Text detected from image will appear here..."
              :auto-grow="true"
              rows="4"
              fill="outline"
              @ionInput="updateSVGText"
            ></ion-textarea>
          </div>

          <div class="svg-preview-box">
            <h3>SVG Preview</h3>
            <div class="svg-container">
              <svg width="100%" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f0f0f0" rx="10" />
                <text 
                  x="50%" 
                  y="50%" 
                  dominant-baseline="middle" 
                  text-anchor="middle" 
                  :font-size="fontSize"
                  fill="#333"
                >
                  {{ svgText || 'Preview Text' }}
                </text>
              </svg>
            </div>
          </div>
        </div>

        <!-- Chat Section -->
        <div v-if="activeTab === 'chat'" class="chat-section">
          <div class="chat-history" ref="chatContainer">
            <div v-if="chatHistory.length === 0" class="empty-chat">
              <p>Ask AI to refine the text or generate design ideas based on your scan.</p>
            </div>
            <div 
              v-for="(msg, index) in chatHistory" 
              :key="index" 
              class="chat-message"
              :class="msg.role"
            >
              <div class="message-content">{{ msg.content }}</div>
            </div>
          </div>

          <div class="chat-input-area">
            <ion-textarea
              v-model="chatInput"
              placeholder="Ask AI to modify text..."
              :auto-grow="true"
              rows="1"
              class="chat-input"
            ></ion-textarea>
            <ion-button @click="askDeepSeek" :disabled="!chatInput || isAiThinking">
              <ion-icon v-if="!isAiThinking" :icon="send"></ion-icon>
              <ion-spinner v-else name="dots"></ion-spinner>
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <ion-toast
      :is-open="!!toastMessage"
      :message="toastMessage"
      :duration="2000"
      @didDismiss="toastMessage = ''"
    ></ion-toast>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { 
  IonButton, IonIcon, IonSpinner, IonModal, IonContent, 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonTextarea, IonToast 
} from '@ionic/vue';
import { camera, image, chatbubbles, close, send, sparkles } from 'ionicons/icons';
// Lazy load Camera plugin - only load when user takes photo
import { loadCamera } from '@/composables/useCapacitorPlugins';
import { useOCR } from '@/composables/useOCR';
import { useDeepSeek } from '@/composables/useDeepSeek';

// Props & Emits
const props = defineProps<{
  initialText?: string;
}>();

const emit = defineEmits<{
  (e: 'update:description', value: string): void;
}>();

// State
const isOpen = ref(false);
const activeTab = ref<'scan' | 'chat'>('scan');
const imageSrc = ref<string>('');
const extractedText = ref<string>('');
const svgText = ref<string>('');
const fontSize = ref(24);
const isProcessing = ref(false);
const toastMessage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

// Chat State
const chatInput = ref('');
const chatHistory = ref<{ role: 'user' | 'assistant'; content: string }[]>([]);
const isAiThinking = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

// Composables
const { recognizeText, terminate: terminateOCR } = useOCR();
const { analyzeText } = useDeepSeek(); // Assuming analyzeText is available for general analysis

// Initialize
onMounted(() => {
  if (props.initialText) {
    extractedText.value = props.initialText;
    updateSVGText();
  }
});

// Cleanup
import { onUnmounted } from 'vue';
onUnmounted(() => {
  terminateOCR();
});

// Watchers
watch(extractedText, (newVal) => {
  emit('update:description', newVal);
  updateSVGText();
});

watch(chatHistory, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}, { deep: true });

// Methods
const handleSmartScanClick = () => {
  toastMessage.value = 'Coming Soon';
};

const takePicture = async () => {
  try {
    // Lazy load Camera plugin when needed
    const { Camera, CameraResultType, CameraSource } = await loadCamera();
    
    const image = await Camera.getPhoto({
      quality: 80, // Reduced quality for better performance
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    if (image.dataUrl) {
      processImage(image.dataUrl);
    }
  } catch (error) {
    console.error('Camera error:', error);
    toastMessage.value = 'Failed to capture image';
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        processImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }
};

const processImage = async (source: string) => {
  imageSrc.value = source;
  isProcessing.value = true;
  
  try {
    // 1. OCR Extraction
    const ocrResult = await recognizeText(source);
    
    if (ocrResult) {
      // 2. AI Analysis/Refinement (Optional but good for context)
      // We can use DeepSeek to clean up the OCR text if needed
      // For now, we just use the raw OCR result or a cleaned version
      extractedText.value = ocrResult;
      toastMessage.value = 'Text extracted successfully!';
      
      // Add to chat context implicitly
      chatHistory.value.push({
        role: 'assistant',
        content: `I've extracted the following text: "${ocrResult}". How would you like to modify it?`
      });
    } else {
      toastMessage.value = 'No text detected in image';
    }
  } catch (error) {
    console.error('Processing error:', error);
    toastMessage.value = 'Error processing image';
  } finally {
    isProcessing.value = false;
  }
};

const updateSVGText = () => {
  svgText.value = extractedText.value;
  autoScaleText();
};

const autoScaleText = () => {
  const length = svgText.value.length;
  if (length < 10) fontSize.value = 40;
  else if (length < 20) fontSize.value = 32;
  else if (length < 50) fontSize.value = 24;
  else fontSize.value = 16;
};

const askDeepSeek = async () => {
  if (!chatInput.value.trim()) return;

  const userMsg = chatInput.value;
  chatHistory.value.push({ role: 'user', content: userMsg });
  chatInput.value = '';
  isAiThinking.value = true;

  try {
    // Construct context for AI
    const context = `
      Current extracted text: "${extractedText.value}"
      User request: ${userMsg}
      
      Please provide a refined version of the text or design suggestions. 
      If the user asks to change the text, provide ONLY the new text in your response if possible, 
      or clearly indicate the suggested text.
    `;

    const response = await analyzeText(context, undefined, "You are a helpful design assistant. Your goal is to help the user refine text for their design."); // Using analyzeText as a generic prompt handler
    
    chatHistory.value.push({ role: 'assistant', content: response });
    
    // Simple heuristic: if response is short and looks like a replacement, update extractedText
    // This is a basic implementation; in a real app, we might want structured JSON response
    if (response.length < 200 && !response.includes('\n')) {
       // Optional: Auto-update text if it seems like a direct replacement
       // extractedText.value = response; 
    }
  } catch (error) {
    console.error('AI Chat error:', error);
    chatHistory.value.push({ role: 'assistant', content: 'Sorry, I encountered an error processing your request.' });
  } finally {
    isAiThinking.value = false;
  }
};

const refineWithAI = async () => {
  if (!extractedText.value) return;
  
  isAiThinking.value = true;
  toastMessage.value = "Refining text with AI...";
  
  try {
    // Use a specific prompt for refinement
    const refined = await analyzeText(
      extractedText.value, 
      "Please correct any OCR errors in this text. It is likely from a wedding invitation or similar event. Fix names, dates, and typos. Return ONLY the corrected text.",
      "You are a text correction assistant. You fix OCR errors and typos in wedding invitation text."
    );
    
    if (refined) {
      extractedText.value = refined;
      toastMessage.value = "Text refined!";
      
      chatHistory.value.push({
        role: 'assistant',
        content: "I've refined the text for you. Is this better?"
      });
    }
  } catch (e) {
    console.error("Refinement error:", e);
    toastMessage.value = "Failed to refine text.";
  } finally {
    isAiThinking.value = false;
  }
};
</script>

<style scoped>
.smart-camera-input {
  width: 100%;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-header h3 {
  margin: 0;
}

.tabs-container {
  display: flex;
  margin-bottom: 20px;
  background: #f4f5f8;
  border-radius: 8px;
  padding: 4px;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
}

.tab-button.active {
  background: white;
  color: var(--ion-color-primary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.scan-section, .chat-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: var(--ion-color-medium);
}

.preview-container {
  width: 100%;
  max-height: 200px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  background: #000;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.result-container h3, .svg-preview-box h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1rem;
  color: #333;
}

.svg-container {
  border: 1px dashed #ccc;
  border-radius: 8px;
  overflow: hidden;
}

/* Chat Styles */
.chat-history {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  min-height: 300px;
  max-height: 400px;
}

.empty-chat {
  text-align: center;
  color: #999;
  margin-top: 40px;
}

.chat-message {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.chat-message.user {
  align-self: flex-end;
  background: var(--ion-color-primary);
  color: white;
  border-bottom-right-radius: 2px;
}

.chat-message.assistant {
  align-self: flex-start;
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 2px;
}

.chat-input-area {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.chat-input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  --padding-start: 12px;
  --padding-end: 12px;
}
</style>
