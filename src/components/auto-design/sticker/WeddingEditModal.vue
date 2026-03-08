<template>
  <IonModal :is-open="modelValue" @did-dismiss="$emit('update:modelValue', false)" class="wedding-edit-modal">
    <IonHeader>
      <IonToolbar>
        <IonTitle>Edit Wedding Sticker</IonTitle>
        <IonButtons slot="end">
          <IonButton @click="$emit('update:modelValue', false)">
            <IonIcon :icon="closeOutline" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    
    <IonContent class="ion-padding">
      <!-- Names Section -->
      <div class="edit-section">
        <h3 class="section-title">Names</h3>
        <div class="name-inputs">
          <IonItem>
            <IonLabel position="floating">Name 1</IonLabel>
            <IonInput 
              v-model="localData.name1" 
              placeholder="e.g., John"
              @ionInput="updateField('name1', $event)"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Name 2</IonLabel>
            <IonInput 
              v-model="localData.name2" 
              placeholder="e.g., Sarah"
              @ionInput="updateField('name2', $event)"
            />
          </IonItem>
        </div>
      </div>
      
      <!-- Date Section -->
      <div class="edit-section">
        <h3 class="section-title">Wedding Date</h3>
        <IonItem>
          <IonLabel position="floating">Date</IonLabel>
          <IonInput 
            v-model="localData.date" 
            placeholder="e.g., June 15, 2025"
            @ionInput="updateField('date', $event)"
          />
        </IonItem>
      </div>
      
      <!-- Courtesy Section -->
      <div class="edit-section">
        <h3 class="section-title">Courtesy Message</h3>
        <IonItem>
          <IonLabel position="floating">Message</IonLabel>
          <IonTextarea 
            v-model="localData.courtesy" 
            placeholder="e.g., We invite you to celebrate..."
            :rows="3"
            @ionInput="updateField('courtesy', $event)"
          />
        </IonItem>
      </div>
      
      <!-- Color Section -->
      <div class="edit-section" v-if="showColorPicker">
        <h3 class="section-title">Colors</h3>
        <div class="color-options">
          <div 
            v-for="color in colorOptions" 
            :key="color.value"
            class="color-option"
            :class="{ selected: localData.titleColor === color.value }"
            :style="{ backgroundColor: color.value }"
            @click="selectColor(color.value)"
          >
            <span class="color-name">{{ color.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- Font Section -->
      <div class="edit-section" v-if="showFontPicker">
        <h3 class="section-title">Font Style</h3>
        <IonSelect 
          v-model="localData.fontFamily" 
          interface="popover"
          placeholder="Select font"
          @ionChange="updateField('fontFamily', $event)"
        >
          <IonSelectOption 
            v-for="font in fontOptions" 
            :key="font.value" 
            :value="font.value"
          >
            {{ font.name }}
          </IonSelectOption>
        </IonSelect>
      </div>
    </IonContent>
    
    <IonFooter>
      <IonToolbar>
        <div class="modal-actions">
          <IonButton 
            fill="outline" 
            color="medium"
            @click="$emit('update:modelValue', false)"
          >
            Cancel
          </IonButton>
          <IonButton 
            color="primary"
            @click="applyChanges"
          >
            Apply Changes
          </IonButton>
        </div>
      </IonToolbar>
    </IonFooter>
  </IonModal>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonFooter,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption
} from '@ionic/vue'
import { closeOutline } from 'ionicons/icons'

export interface WeddingEditData {
  name1: string
  name2: string
  date: string
  courtesy: string
  titleColor?: string
  fontFamily?: string
}

const props = defineProps<{
  modelValue: boolean
  initialData: WeddingEditData
  showColorPicker?: boolean
  showFontPicker?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'apply', data: WeddingEditData): void
  (e: 'field-change', field: string, value: string): void
}>()

const localData = reactive<WeddingEditData>({
  name1: '',
  name2: '',
  date: '',
  courtesy: '',
  titleColor: '#000000',
  fontFamily: 'serif'
})

// Color options
const colorOptions = [
  { name: 'Black', value: '#000000' },
  { name: 'Gold', value: '#d4af37' },
  { name: 'Rose Gold', value: '#b76e79' },
  { name: 'Navy', value: '#1a365d' },
  { name: 'Burgundy', value: '#722f37' },
  { name: 'Forest', value: '#228b22' },
  { name: 'White', value: '#ffffff' }
]

// Font options
const fontOptions = [
  { name: 'Serif (Classic)', value: 'serif' },
  { name: 'Sans Serif (Modern)', value: 'sans-serif' },
  { name: 'Script (Elegant)', value: 'cursive' },
  { name: 'Monospace', value: 'monospace' }
]

// Sync with initial data when modal opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.initialData) {
    Object.assign(localData, props.initialData)
  }
})

function updateField(field: string, event: CustomEvent) {
  const value = event.detail?.value || ''
  emit('field-change', field, value)
}

function selectColor(color: string) {
  localData.titleColor = color
  emit('field-change', 'titleColor', color)
}

function applyChanges() {
  emit('apply', { ...localData })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.wedding-edit-modal {
  --height: auto;
  --max-height: 90%;
  --border-radius: 16px;
}

.edit-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ion-color-medium);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.name-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.color-option {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 3px var(--ion-color-primary-tint);
}

.color-name {
  font-size: 0.625rem;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 0.5rem;
}

ion-item {
  --background: var(--ion-color-light);
  --border-radius: 8px;
  margin-bottom: 0.5rem;
}
</style>
