<template>
  <div v-if="isOpen" class="help-modal-overlay" @click.self="$emit('close')">
    <div class="help-modal">
      <div class="help-header">
        <h3>How to Use the AI Designer</h3>
        <button @click="$emit('close')" class="close-btn">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="help-content">
        <!-- Quick Start -->
        <div class="help-section">
          <h4 class="section-title">
            <span class="section-icon">🚀</span>
            Quick Start
          </h4>
          <p class="section-text">
            Simply tell me all your wedding details in one message! For example:
          </p>
          <div class="example-box">
            "Create a gold wedding sticker for John & Sarah, December 25, 2024"
          </div>
        </div>
        
        <!-- Voice Commands -->
        <div class="help-section">
          <h4 class="section-title">
            <span class="section-icon">🎤</span>
            Voice Commands
          </h4>
          <p class="section-text">
            Click the microphone button to speak your request. Voice input is great for hands-free designing!
          </p>
        </div>
        
        <!-- Design Elements -->
        <div class="help-section">
          <h4 class="section-title">
            <span class="section-icon">✨</span>
            What I Can Understand
          </h4>
          <ul class="feature-list">
            <li><strong>Names:</strong> Bride & groom names, "Rahul & Priya"</li>
            <li><strong>Dates:</strong> Any date format - "25 Dec 2024", "25/12/2024"</li>
            <li><strong>Colors:</strong> Gold, silver, red, blue, pink, green, etc.</li>
            <li><strong>Styles:</strong> Traditional, modern, floral, mandala, elegant</li>
            <li><strong>Courtesy:</strong> "With compliments from", "Shubh Vivah"</li>
          </ul>
        </div>
        
        <!-- Tips -->
        <div class="help-section">
          <h4 class="section-title">
            <span class="section-icon">💡</span>
            Pro Tips
          </h4>
          <ul class="feature-list">
            <li>Upload photos to add personal images to your design</li>
            <li>Click on any text to edit it directly</li>
            <li>Use the controls panel to adjust image size and effects</li>
            <li>Say "make it gold" or "change color to pink" to update colors</li>
            <li>Ask for help anytime by saying "help" or "guide"</li>
          </ul>
        </div>
        
        <!-- Example Prompts -->
        <div class="help-section">
          <h4 class="section-title">
            <span class="section-icon">📝</span>
            Example Prompts
          </h4>
          <div class="examples-grid">
            <div class="example-chip" @click="$emit('use-example', 'Create a gold floral wedding sticker')">
              Gold floral wedding
            </div>
            <div class="example-chip" @click="$emit('use-example', 'Modern minimalist design in silver')">
              Modern minimalist
            </div>
            <div class="example-chip" @click="$emit('use-example', 'Traditional Indian wedding sticker with mandala')">
              Traditional mandala
            </div>
            <div class="example-chip" @click="$emit('use-example', 'Elegant pink and white design')">
              Elegant pink design
            </div>
          </div>
        </div>
      </div>
      
      <div class="help-footer">
        <button @click="$emit('close')" class="got-it-btn">
          Got it!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  isOpen: boolean
}>()

// Emits
defineEmits<{
  (e: 'close'): void
  (e: 'use-example', prompt: string): void
}>()
</script>

<style scoped>
.help-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.help-modal {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.help-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.help-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.help-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.section-icon {
  font-size: 1.25rem;
}

.section-text {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.example-box {
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 12px;
  border: 1px dashed #667eea;
  font-size: 0.9rem;
  color: #333;
  font-style: italic;
}

.feature-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-list li {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
}

.feature-list li strong {
  color: #333;
}

.examples-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.example-chip {
  padding: 8px 14px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
}

.example-chip:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.help-footer {
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: center;
}

.got-it-btn {
  padding: 12px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.got-it-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Icon sizes */
.w-6 { width: 1.5rem; }
.h-6 { height: 1.5rem; }
</style>
