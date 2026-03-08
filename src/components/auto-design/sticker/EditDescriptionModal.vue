<template>
  <div class="edit-modal-overlay">
    <div class="edit-modal-container">
      <h3 class="edit-modal-title">Edit Your Design</h3>
      <p class="edit-modal-subtitle">Update your details below and click Save to refresh the design.</p>
      
      <div class="edit-modal-content">
        <!-- Title/Heading Field -->
        <div class="edit-field">
          <label class="edit-field-label">Heading / Title</label>
          <input
            type="text"
            :value="extractedData.heading"
            @input="updateField('heading', ($event.target as HTMLInputElement).value)"
            class="edit-field-input"
            placeholder="e.g., Congratulations on your wedding"
          />
        </div>

        <!-- Names Field -->
        <div class="edit-field">
          <label class="edit-field-label">Names</label>
          <div class="names-row">
            <input
              type="text"
              :value="extractedData.name1"
              @input="updateField('name1', ($event.target as HTMLInputElement).value)"
              class="edit-field-input"
              placeholder="First name (e.g., John)"
            />
            <span class="names-separator">&</span>
            <input
              type="text"
              :value="extractedData.name2"
              @input="updateField('name2', ($event.target as HTMLInputElement).value)"
              class="edit-field-input"
              placeholder="Second name (e.g., Mary)"
            />
          </div>
        </div>

        <!-- Date Field -->
        <div class="edit-field">
          <label class="edit-field-label">Date</label>
          <input
            type="text"
            :value="extractedData.date"
            @input="updateField('date', ($event.target as HTMLInputElement).value)"
            class="edit-field-input"
            placeholder="e.g., 25th December 2025"
          />
        </div>

        <!-- Courtesy Field -->
        <div class="edit-field">
          <label class="edit-field-label">Courtesy (From)</label>
          <input
            type="text"
            :value="extractedData.courtesy"
            @input="updateField('courtesy', ($event.target as HTMLInputElement).value)"
            class="edit-field-input"
            placeholder="e.g., The Johnson Family"
          />
        </div>

        <!-- Raw Description (hidden by default, can toggle) -->
        <div class="edit-field raw-field">
          <button @click="showRaw = !showRaw" class="toggle-raw-btn">
            {{ showRaw ? 'Hide' : 'Show' }} Raw Description
          </button>
          <textarea
            v-if="showRaw"
            :value="description"
            @input="$emit('update:description', ($event.target as HTMLTextAreaElement).value)"
            class="edit-modal-textarea"
            rows="4"
            placeholder="Enter full description..."
          ></textarea>
        </div>
        
        <!-- Validation Warnings -->
        <div v-if="validationWarnings && validationWarnings.length > 0" class="validation-warnings-container">
          <div class="warning-header">
            <svg class="warning-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="warning-title">Please check:</span>
          </div>
          <ul class="warning-list">
            <li v-for="(warning, index) in validationWarnings" :key="index" class="warning-list-item">
              {{ warning }}
            </li>
          </ul>
        </div>
      </div>

      <div class="edit-modal-actions">
        <button @click="$emit('close')" class="edit-modal-cancel-btn">
          Cancel
        </button>
        <button @click="saveChanges" class="edit-modal-save-btn">
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

// Props
const props = defineProps<{
  description: string
  validationWarnings?: string[]
  extractedInfo?: {
    heading?: string | null
    name1?: string | null
    name2?: string | null
    date?: string | null
    courtesy?: string | null
  }
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:description', value: string): void
  (e: 'save', data: { heading: string; name1: string; name2: string; date: string; courtesy: string }): void
}>()

// Local state
const showRaw = ref(false)

const extractedData = reactive({
  heading: props.extractedInfo?.heading || '',
  name1: props.extractedInfo?.name1 || '',
  name2: props.extractedInfo?.name2 || '',
  date: props.extractedInfo?.date || '',
  courtesy: props.extractedInfo?.courtesy || ''
})

// Watch for prop changes
watch(() => props.extractedInfo, (newInfo) => {
  if (newInfo) {
    extractedData.heading = newInfo.heading || ''
    extractedData.name1 = newInfo.name1 || ''
    extractedData.name2 = newInfo.name2 || ''
    extractedData.date = newInfo.date || ''
    extractedData.courtesy = newInfo.courtesy || ''
  }
}, { immediate: true, deep: true })

function updateField(field: keyof typeof extractedData, value: string) {
  extractedData[field] = value
}

function saveChanges() {
  emit('save', { ...extractedData })
  emit('close')
}
</script>

<style scoped>
.edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.edit-modal-container {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.edit-modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.edit-modal-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 20px;
}

.edit-modal-content {
  margin-bottom: 20px;
}

/* Edit Fields */
.edit-field {
  margin-bottom: 16px;
}

.edit-field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
}

.edit-field-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.edit-field-input:focus {
  outline: none;
  border-color: #667eea;
}

.edit-field-input::placeholder {
  color: #999;
}

/* Names Row */
.names-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.names-row .edit-field-input {
  flex: 1;
}

.names-separator {
  font-size: 1.2rem;
  font-weight: 600;
  color: #667eea;
}

/* Raw field toggle */
.raw-field {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.toggle-raw-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 0;
  margin-bottom: 8px;
}

.toggle-raw-btn:hover {
  text-decoration: underline;
}

.edit-modal-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.edit-modal-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.edit-modal-textarea::placeholder {
  color: #999;
}

/* Validation warnings */
.validation-warnings-container {
  margin-top: 16px;
  padding: 12px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 8px;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.warning-icon {
  width: 20px;
  height: 20px;
  color: #d97706;
}

.warning-title {
  font-weight: 500;
  color: #92400e;
}

.warning-list {
  margin: 0;
  padding-left: 28px;
}

.warning-list-item {
  color: #92400e;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.warning-list-item:last-child {
  margin-bottom: 0;
}

/* Actions */
.edit-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.edit-modal-cancel-btn {
  padding: 12px 24px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-modal-cancel-btn:hover {
  background: #eee;
}

.edit-modal-save-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-modal-save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
</style>
