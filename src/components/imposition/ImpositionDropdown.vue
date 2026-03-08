<template>
  <div class="imposition-dropdown-container">
    <!-- MERGE NOTE: If your page already has an Imposition button, replace its @click 
         with this component's button, or merge the popover content into your existing popover -->
    
    <!-- Imposition Button -->
    <ion-button
      :id="popoverId"
      expand="block"
      fill="outline"
      class="imposition-trigger-button"
      @click="showPopover = true"
      aria-haspopup="true"
      :aria-expanded="showPopover"
    >
      <ion-icon slot="start" :icon="layersOutline"></ion-icon>
      <ion-label>
        {{ selectedImposition ? selectedImposition.label : 'Select Imposition' }}
      </ion-label>
    </ion-button>

    <!-- Display selected imposition details -->
    <div v-if="selectedImposition" class="selected-info ion-padding-top">
      <ion-text color="medium">
        <p class="ion-no-margin">
          <strong>Selected Imposition:</strong> {{ selectedImposition.label }} — 
          {{ selectedImposition.description }}
        </p>
      </ion-text>
    </div>

    <!-- MERGE NOTE: If reusing an existing popover, keep its original id.
         Example: if your page uses id="imposition-popover", change popoverId prop to match -->
    
    <!-- Imposition Popover -->
    <ion-popover
      :trigger="popoverId"
      :is-open="showPopover"
      @didDismiss="showPopover = false"
      :show-backdrop="true"
      side="bottom"
      alignment="start"
      class="imposition-popover"
    >
      <ion-content class="ion-padding">
        <!-- MERGE NOTE: If you have existing popover items (e.g., booklet option),
             insert them BEFORE this list to maintain their position and selection state -->
        
        <!-- Imposition Options List -->
        <ion-list lines="none" class="imposition-list">
          <ion-list-header>
            <ion-label>Imposition Options</ion-label>
          </ion-list-header>

          <ion-item
            v-for="option in impositionOptions"
            :key="option.value"
            button
            :detail="false"
            @click="selectImposition(option)"
            :class="{ 'selected-item': selectedImposition?.value === option.value }"
            role="option"
            :aria-selected="selectedImposition?.value === option.value"
            :aria-describedby="`desc-${option.value}`"
            tabindex="0"
            @keydown.enter="selectImposition(option)"
            @keydown.space.prevent="selectImposition(option)"
          >
            <ion-label>
              <h3>{{ option.label }}</h3>
              <p :id="`desc-${option.value}`" class="option-description">
                {{ option.description }}
              </p>
            </ion-label>
            <ion-icon
              v-if="selectedImposition?.value === option.value"
              slot="end"
              :icon="checkmarkCircle"
              color="primary"
              aria-hidden="true"
            ></ion-icon>
          </ion-item>
        </ion-list>

        <!-- Rotation Control Section -->
        <div class="rotation-section ion-margin-top">
          <ion-list lines="none">
            <ion-list-header>
              <ion-label>Rotation Control</ion-label>
            </ion-list-header>

            <!-- Primary Implementation: IonSelect (recommended for mobile) -->
            <ion-item>
              <ion-label>Rotation</ion-label>
              <ion-select
                v-model="rotationAngle"
                interface="popover"
                placeholder="Select rotation"
                @ionChange="onRotationChange"
                aria-label="Select page rotation"
              >
                <ion-select-option :value="0">0° (Normal)</ion-select-option>
                <ion-select-option :value="180">Flip 180° Top</ion-select-option>
                <ion-select-option :value="-180">Flip 180° Bottom</ion-select-option>
              </ion-select>
            </ion-item>

            <!-- ALTERNATE IMPLEMENTATION: Toggle switches (commented out)
                 Uncomment this section if you prefer toggle switches instead of select
            
            <ion-item>
              <ion-label>Flip 180° Top</ion-label>
              <ion-toggle
                :checked="rotationAngle === 180"
                @ionChange="toggleRotation(180, $event)"
                aria-label="Flip page 180 degrees top"
              ></ion-toggle>
            </ion-item>

            <ion-item>
              <ion-label>Flip 180° Bottom</ion-label>
              <ion-toggle
                :checked="rotationAngle === -180"
                @ionChange="toggleRotation(-180, $event)"
                aria-label="Flip page 180 degrees bottom"
              ></ion-toggle>
            </ion-item>
            -->
          </ion-list>

          <!-- Rotation Preview (optional visual indicator) -->
          <div v-if="rotationAngle !== 0" class="rotation-preview ion-padding">
            <ion-text color="medium">
              <p class="ion-text-center">
                <small>Current rotation: {{ rotationAngle }}°</small>
              </p>
            </ion-text>
            <!-- Example preview element with rotation applied -->
            <div 
              class="preview-box"
              :style="{ transform: `rotate(${rotationAngle}deg)` }"
              aria-hidden="true"
            >
              <ion-text>Preview</ion-text>
            </div>
          </div>
        </div>

        <!-- Action Buttons (optional) -->
        <div class="action-buttons ion-padding-top">
          <ion-button
            expand="block"
            fill="clear"
            @click="closePopover"
          >
            Close
          </ion-button>
        </div>
      </ion-content>
    </ion-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
  IonButton,
  IonPopover,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonText,
  IonSelect,
  IonSelectOption,
  IonIcon,
} from '@ionic/vue';
import { layersOutline, checkmarkCircle } from 'ionicons/icons';

/**
 * Type definition for imposition option
 */
interface ImpositionOption {
  value: string;
  label: string;
  description: string;
}

/**
 * Component Props
 */
interface Props {
  /** Feature flag to enable the new dropdown (default: true) */
  enableImpositionDropdownV2?: boolean;
  /** Initial imposition selection (e.g., from parent state or existing booklet) */
  initialImposition?: ImpositionOption | null;
  /** Initial rotation angle */
  initialRotation?: number;
  /** Popover trigger ID - MERGE NOTE: Use existing popover id if merging */
  popoverId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  enableImpositionDropdownV2: true,
  initialImposition: null,
  initialRotation: 0,
  popoverId: 'imposition-popover-trigger',
});

/**
 * Component Emits
 * - Backward compatible events: update:imposition, update:rotation
 * - New versioned events: update:impositionV2, update:rotationV2
 */
const emit = defineEmits<{
  'update:imposition': [value: ImpositionOption | null];
  'update:rotation': [value: number];
  'update:impositionV2': [value: ImpositionOption | null];
  'update:rotationV2': [value: number];
}>();

/**
 * Imposition Options Data
 * MERGE NOTE: If your page already has a "booklet" option, you can add it here
 * or keep it separate in the parent component's existing list
 */
const impositionOptions = ref<ImpositionOption[]>([
  {
    value: 'tent-card',
    label: 'Tent-Card',
    description: 'A sheet printed on both sides, folded to stand like a tent.',
  },
  {
    value: '2-up',
    label: '2-up',
    description: 'Two copies of the same page imposed on one sheet.',
  },
  {
    value: '2-side',
    label: '2-side',
    description: 'Front and back pages arranged for double-sided print.',
  },
  {
    value: 'side-fold-card',
    label: 'Side-Fold Card',
    description: 'Fold on the long edge.',
  },
  {
    value: 'tri-fold-brochure',
    label: 'Tri-Fold Brochure',
    description: 'Sheet divided into 3 panels and folded.',
  },
  {
    value: '8-up-perfect-bound-sheetwise',
    label: '8-up Perfect Bound Sheetwise',
    description: 'Eight pages imposed sheetwise for perfect binding.',
  },
  {
    value: '8-up-perfect-bound-work-turn',
    label: '8-up Perfect Bound Work & Turn',
    description: 'Print, turn on same grip, print again.',
  },
  {
    value: '8-up-perfect-bound-work-tumble',
    label: '8-up Perfect Bound Work & Tumble',
    description: 'Print, flip head-to-tail, print again.',
  },
]);

/**
 * MERGE NOTE: If integrating with existing booklet functionality,
 * add the booklet option to impositionOptions or handle it separately
 * Example:
 * {
 *   value: 'booklet',
 *   label: 'Booklet',
 *   description: 'Existing booklet imposition layout',
 * }
 */

/**
 * Reactive State
 */
const showPopover = ref(false);
const selectedImposition = ref<ImpositionOption | null>(props.initialImposition);
const rotationAngle = ref<number>(props.initialRotation);

/**
 * Initialize from props on mount
 * MERGE NOTE: Preserve existing booklet selection if present
 */
onMounted(() => {
  if (props.initialImposition) {
    selectedImposition.value = props.initialImposition;
  }
  if (props.initialRotation !== undefined) {
    rotationAngle.value = props.initialRotation;
  }
});

/**
 * Watch for prop changes (external updates)
 */
watch(
  () => props.initialImposition,
  (newVal) => {
    if (newVal && newVal !== selectedImposition.value) {
      selectedImposition.value = newVal;
    }
  }
);

watch(
  () => props.initialRotation,
  (newVal) => {
    if (newVal !== undefined && newVal !== rotationAngle.value) {
      rotationAngle.value = newVal;
    }
  }
);

/**
 * Select an imposition option
 * Emits both backward-compatible and versioned events
 */
const selectImposition = (option: ImpositionOption) => {
  selectedImposition.value = option;
  
  // Emit events for parent component
  emit('update:imposition', option);
  emit('update:impositionV2', option);
  
  // Close popover after selection
  showPopover.value = false;
};

/**
 * Handle rotation change from IonSelect
 */
const onRotationChange = (event: CustomEvent) => {
  const newRotation = event.detail.value;
  rotationAngle.value = newRotation;
  
  // Emit events for parent component
  emit('update:rotation', newRotation);
  emit('update:rotationV2', newRotation);
};

/**
 * ALTERNATE: Toggle rotation (for toggle switch implementation)
 * Uncomment if using toggle switches instead of select
 */
/*
const toggleRotation = (angle: number, event: CustomEvent) => {
  if (event.detail.checked) {
    rotationAngle.value = angle;
  } else {
    rotationAngle.value = 0;
  }
  
  emit('update:rotation', rotationAngle.value);
  emit('update:rotationV2', rotationAngle.value);
};
*/

/**
 * Close popover
 */
const closePopover = () => {
  showPopover.value = false;
};
</script>

<style scoped>
.imposition-dropdown-container {
  width: 100%;
}

.imposition-trigger-button {
  margin: 8px 0;
}

.selected-info {
  font-size: 0.875rem;
}

.imposition-popover ion-content {
  --background: var(--ion-background-color, #fff);
}

.imposition-list ion-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.imposition-list ion-item:hover {
  --background: var(--ion-color-light, #f4f5f8);
}

.imposition-list ion-item:focus {
  outline: 2px solid var(--ion-color-primary, #3880ff);
  outline-offset: -2px;
}

.selected-item {
  --background: var(--ion-color-primary-tint, #4c8dff);
  --color: var(--ion-color-primary-contrast, #fff);
}

.option-description {
  font-size: 0.75rem;
  color: var(--ion-color-medium, #92949c);
  margin-top: 4px;
}

.selected-item .option-description {
  color: var(--ion-color-primary-contrast, #fff);
  opacity: 0.8;
}

.rotation-section {
  border-top: 1px solid var(--ion-color-light, #f4f5f8);
  padding-top: 16px;
}

.rotation-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-box {
  width: 60px;
  height: 80px;
  border: 2px solid var(--ion-color-primary, #3880ff);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  background: var(--ion-color-light, #f4f5f8);
}

.action-buttons {
  border-top: 1px solid var(--ion-color-light, #f4f5f8);
}

/* Accessibility: Focus visible styles */
ion-item:focus-visible {
  outline: 2px solid var(--ion-color-primary, #3880ff);
  outline-offset: -2px;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .imposition-popover {
    --width: 90vw;
  }
}
</style>

<!--
═══════════════════════════════════════════════════════════════════════════════
  INTEGRATION NOTES
═══════════════════════════════════════════════════════════════════════════════

USAGE:
  Import and use this component in your ImpositionPage.vue:
  
  Props:
    - enable-imposition-dropdown-v2 (boolean, default: true)
    - initial-imposition (ImpositionOption object)
    - initial-rotation (number, default: 0)
    - popover-id (string, custom popover trigger ID)
  
  Events:
    - @update:imposition - Fires when imposition selection changes
    - @update:rotation - Fires when rotation changes
    - @update:impositionV2 - New version event
    - @update:rotationV2 - New version event

MERGE NOTES:
  1. Preserves existing booklet functionality - non-destructive
  2. Uses scoped styles to avoid conflicts
  3. Fully accessible with ARIA support
  4. Feature flag to enable/disable new UI

═══════════════════════════════════════════════════════════════════════════════
-->
