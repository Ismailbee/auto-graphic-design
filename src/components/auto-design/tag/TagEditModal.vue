<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop="handleOutsideClick">
          <div class="modal-header">
            <h2 class="modal-title">📝 Review & Edit Event Information</h2>
            <button class="close-btn" @click="close">✕</button>
          </div>

          <div class="modal-body">
            <!-- Logo Upload Section (fixed at top) -->
            <div class="form-section">
              <label class="form-label">
                <span class="label-icon">🖼️</span>
                Logo Image
              </label>
              <div class="upload-area">
                <div v-if="logoImage" class="logo-preview">
                  <img :src="logoImage" alt="Logo" />
                  <button class="remove-btn" @click="removeLogo">Remove</button>
                </div>
                <button v-else class="upload-btn" @click="triggerUpload">
                  📤 Upload Logo
                </button>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileUpload"
              />
            </div>

            <!-- Orderable Content Fields -->
            <TransitionGroup name="field-reorder" tag="div" class="orderable-fields">
              <div
                v-for="(field, idx) in fieldOrder"
                :key="field"
                class="form-section orderable-field"
              >
                <div class="label-row">
                  <!-- Reorder arrows -->
                  <div class="reorder-controls">
                    <button
                      class="arrow-btn"
                      :disabled="idx === 0"
                      title="Move up"
                      @click="moveFieldUp(idx)"
                    >▲</button>
                    <button
                      class="arrow-btn"
                      :disabled="idx === fieldOrder.length - 1"
                      title="Move down"
                      @click="moveFieldDown(idx)"
                    >▼</button>
                  </div>
                  <label class="form-label" :for="field">
                    <span class="label-icon">{{ FIELD_META[field].icon }}</span>
                    {{ FIELD_META[field].label }}
                    <span v-if="FIELD_CONFIG[field].required" class="required">*</span>
                    <span v-if="FIELD_CONFIG[field].optionalText" class="optional">{{ FIELD_CONFIG[field].optionalText }}</span>
                  </label>
                  <button
                    class="switch-btn"
                    title="Switch this value to another field"
                    @click="openSwapMenu(field)"
                  >
                    🔀
                  </button>
                  <div class="size-dropdown-wrapper">
                    <button
                      class="size-trigger-btn"
                      :class="{ open: sizeMenuOpen === field }"
                      @click.stop="toggleSizeMenu(field as SizableField)"
                      :title="`Text size: X${fieldSizes[field as SizableField]}`"
                    >
                      X{{ fieldSizes[field as SizableField] }} ▾
                    </button>
                    <Transition name="size-dropdown">
                      <div v-if="sizeMenuOpen === field" class="size-dropdown" @click.stop>
                        <button
                          v-for="sz in TEXT_SIZE_OPTIONS"
                          :key="sz"
                          class="size-option"
                          :class="{ active: fieldSizes[field as SizableField] === sz }"
                          @click="setFieldSize(field as SizableField, sz)"
                        >X{{ sz }}</button>
                      </div>
                    </Transition>
                  </div>
                </div>
                <!-- Swap menu -->
                <Transition name="swap-menu">
                  <div v-if="swapMenuOpen === field" class="swap-menu">
                    <div class="swap-menu-header">Use this as:</div>
                    <button
                      v-for="opt in getSwapOptions(field)"
                      :key="opt.key"
                      class="swap-option"
                      @click="swapFieldValue(field, opt.key)"
                    >
                      <span class="swap-option-icon">{{ opt.icon }}</span>
                      {{ opt.label }}
                    </button>
                  </div>
                </Transition>
                <!-- Text input fields -->
                <input
                  v-if="FIELD_CONFIG[field].inputType === 'text'"
                  :id="field"
                  v-model="(localData as any)[field]"
                  type="text"
                  class="form-input"
                  :placeholder="FIELD_CONFIG[field].placeholder"
                  :required="FIELD_CONFIG[field].required"
                />
                <!-- Textarea fields -->
                <textarea
                  v-else
                  :id="field"
                  v-model="(localData as any)[field]"
                  class="form-textarea"
                  :placeholder="FIELD_CONFIG[field].placeholder"
                  :rows="FIELD_CONFIG[field].rows || 3"
                  :required="FIELD_CONFIG[field].required"
                ></textarea>
                <!-- Base text hint -->
                <p v-if="field === 'baseText' && localData.baseText" class="field-hint">
                  ℹ️ Base text will replace Date/Time/Venue on the tag. Clear it to use event details instead.
                </p>
              </div>
            </TransitionGroup>

            <!-- Event Details Section (fixed at bottom) -->
            <div class="form-section-group">
              <div class="label-row" style="margin-bottom: 16px;">
                <h3 class="section-title" style="margin: 0;">📅 Event Details</h3>
                <span v-if="localData.baseText" class="field-hint-inline">Overridden by Base Text</span>
              </div>

              <div class="form-row">
                <div class="form-section flex-1">
                  <div class="label-row">
                    <label class="form-label" for="date">
                      <span class="label-icon">📆</span>
                      Date
                    </label>
                    <button
                      class="switch-btn"
                      title="Switch this value to another field"
                      @click="openSwapMenu('date')"
                    >
                      🔀
                    </button>
                    <div class="size-dropdown-wrapper">
                      <button
                        class="size-trigger-btn"
                        :class="{ open: sizeMenuOpen === 'date' }"
                        @click.stop="toggleSizeMenu('date')"
                        :title="`Text size: X${fieldSizes['date']}`"
                      >
                        X{{ fieldSizes['date'] }} ▾
                      </button>
                      <Transition name="size-dropdown">
                        <div v-if="sizeMenuOpen === 'date'" class="size-dropdown" @click.stop>
                          <button
                            v-for="sz in TEXT_SIZE_OPTIONS"
                            :key="sz"
                            class="size-option"
                            :class="{ active: fieldSizes['date'] === sz }"
                            @click="setFieldSize('date', sz)"
                          >X{{ sz }}</button>
                        </div>
                      </Transition>
                    </div>
                  </div>
                  <Transition name="swap-menu">
                    <div v-if="swapMenuOpen === 'date'" class="swap-menu">
                      <div class="swap-menu-header">Use this as:</div>
                      <button
                        v-for="opt in getSwapOptions('date')"
                        :key="opt.key"
                        class="swap-option"
                        @click="swapFieldValue('date', opt.key)"
                      >
                        <span class="swap-option-icon">{{ opt.icon }}</span>
                        {{ opt.label }}
                      </button>
                    </div>
                  </Transition>
                  <input
                    id="date"
                    v-model="localData.date"
                    type="text"
                    class="form-input"
                    placeholder="e.g., January 15, 2026"
                  />
                </div>

                <div class="form-section flex-1">
                  <div class="label-row">
                    <label class="form-label" for="time">
                      <span class="label-icon">⏰</span>
                      Time
                    </label>
                    <button
                      class="switch-btn"
                      title="Switch this value to another field"
                      @click="openSwapMenu('time')"
                    >
                      🔀
                    </button>
                    <div class="size-dropdown-wrapper">
                      <button
                        class="size-trigger-btn"
                        :class="{ open: sizeMenuOpen === 'time' }"
                        @click.stop="toggleSizeMenu('time')"
                        :title="`Text size: X${fieldSizes['time']}`"
                      >
                        X{{ fieldSizes['time'] }} ▾
                      </button>
                      <Transition name="size-dropdown">
                        <div v-if="sizeMenuOpen === 'time'" class="size-dropdown" @click.stop>
                          <button
                            v-for="sz in TEXT_SIZE_OPTIONS"
                            :key="sz"
                            class="size-option"
                            :class="{ active: fieldSizes['time'] === sz }"
                            @click="setFieldSize('time', sz)"
                          >X{{ sz }}</button>
                        </div>
                      </Transition>
                    </div>
                  </div>
                  <Transition name="swap-menu">
                    <div v-if="swapMenuOpen === 'time'" class="swap-menu">
                      <div class="swap-menu-header">Use this as:</div>
                      <button
                        v-for="opt in getSwapOptions('time')"
                        :key="opt.key"
                        class="swap-option"
                        @click="swapFieldValue('time', opt.key)"
                      >
                        <span class="swap-option-icon">{{ opt.icon }}</span>
                        {{ opt.label }}
                      </button>
                    </div>
                  </Transition>
                  <input
                    id="time"
                    v-model="localData.time"
                    type="text"
                    class="form-input"
                    placeholder="e.g., 10:00 AM"
                  />
                </div>
              </div>

              <div class="form-section">
                <div class="label-row">
                  <label class="form-label" for="venue">
                    <span class="label-icon">📍</span>
                    Venue
                  </label>
                  <button
                    class="switch-btn"
                    title="Switch this value to another field"
                    @click="openSwapMenu('venue')"
                  >
                    🔀
                  </button>
                  <div class="size-dropdown-wrapper">
                    <button
                      class="size-trigger-btn"
                      :class="{ open: sizeMenuOpen === 'venue' }"
                      @click.stop="toggleSizeMenu('venue')"
                      :title="`Text size: X${fieldSizes['venue']}`"
                    >
                      X{{ fieldSizes['venue'] }} ▾
                    </button>
                    <Transition name="size-dropdown">
                      <div v-if="sizeMenuOpen === 'venue'" class="size-dropdown" @click.stop>
                        <button
                          v-for="sz in TEXT_SIZE_OPTIONS"
                          :key="sz"
                          class="size-option"
                          :class="{ active: fieldSizes['venue'] === sz }"
                          @click="setFieldSize('venue', sz)"
                        >X{{ sz }}</button>
                      </div>
                    </Transition>
                  </div>
                </div>
                <Transition name="swap-menu">
                  <div v-if="swapMenuOpen === 'venue'" class="swap-menu">
                    <div class="swap-menu-header">Use this as:</div>
                    <button
                      v-for="opt in getSwapOptions('venue')"
                      :key="opt.key"
                      class="swap-option"
                      @click="swapFieldValue('venue', opt.key)"
                    >
                      <span class="swap-option-icon">{{ opt.icon }}</span>
                      {{ opt.label }}
                    </button>
                  </div>
                </Transition>
                <textarea
                  id="venue"
                  v-model="localData.venue"
                  class="form-textarea"
                  placeholder="Enter venue location..."
                  rows="2"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="close">Cancel</button>
            <button class="btn-primary" @click="save">
              {{ mode === 'confirm' ? '✅ Confirm' : '✨ Generate' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ExtractedTagInfo, SizableField, TextSizeMultiplier } from './types'
import { type OrderableField, DEFAULT_FIELD_ORDER, TEXT_SIZE_OPTIONS, DEFAULT_FIELD_SIZES } from './types'

interface Props {
  modelValue: boolean
  data: ExtractedTagInfo
  hasLogo?: boolean
  logoSrc?: string | null
  mode?: 'generate' | 'confirm'
}

// Swappable field definitions
type SwappableField = OrderableField | 'date' | 'time' | 'venue'

const FIELD_META: Record<SwappableField, { label: string; icon: string }> = {
  logoTitle: { label: 'Logo Title', icon: '🏷️' },
  tagTitle: { label: 'Organization Name', icon: '🏢' },
  theme: { label: 'Theme / Description', icon: '🎯' },
  subtheme: { label: 'Subtheme', icon: '📌' },
  baseText: { label: 'Base Text', icon: '📄' },
  eventType: { label: 'Event Type', icon: '📋' },
  date: { label: 'Date', icon: '📆' },
  time: { label: 'Time', icon: '⏰' },
  venue: { label: 'Venue', icon: '📍' },
}

// Config for each orderable field (input type, placeholder, etc.)
const FIELD_CONFIG: Record<OrderableField, { placeholder: string; inputType: 'text' | 'textarea'; rows?: number; required: boolean; optionalText?: string }> = {
  logoTitle: { placeholder: 'Enter logo title...', inputType: 'text', required: false, optionalText: '(Optional)' },
  tagTitle: { placeholder: 'Enter organization name...', inputType: 'text', required: true },
  theme: { placeholder: 'Enter theme or description...', inputType: 'textarea', rows: 3, required: false },
  subtheme: { placeholder: 'Enter subtheme or additional description...', inputType: 'textarea', rows: 2, required: false, optionalText: '(Optional)' },
  eventType: { placeholder: 'e.g., OFFICIAL, CONFERENCE, SEMINAR...', inputType: 'text', required: false, optionalText: '(Optional)' },
  baseText: { placeholder: 'e.g., If found please call 08012345678...', inputType: 'textarea', rows: 3, required: false, optionalText: '(Replaces Date/Time/Venue)' },
}

const props = withDefaults(defineProps<Props>(), {
  hasLogo: false,
  logoSrc: null,
  mode: 'generate'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: ExtractedTagInfo, logoImage: string | null): void
  (e: 'uploadLogo', file: File): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const localData = ref<ExtractedTagInfo>({ ...props.data })
const logoImage = ref<string | null>(props.logoSrc)
const swapMenuOpen = ref<SwappableField | null>(null)
const sizeMenuOpen = ref<SizableField | null>(null)
const fieldOrder = ref<OrderableField[]>(props.data.fieldOrder || [...DEFAULT_FIELD_ORDER])
const fieldSizes = ref<Record<SizableField, TextSizeMultiplier>>({ ...DEFAULT_FIELD_SIZES, ...props.data.fieldSizes })

// Watch for prop changes
watch(() => props.data, (newData) => {
  localData.value = { ...newData }
  if (newData.fieldOrder) {
    fieldOrder.value = [...newData.fieldOrder]
  }
  if (newData.fieldSizes) {
    fieldSizes.value = { ...DEFAULT_FIELD_SIZES, ...newData.fieldSizes }
  }
}, { deep: true })

watch(() => props.logoSrc, (newSrc) => {
  logoImage.value = newSrc
})

// Close swap/size menus when clicking outside them
function handleOutsideClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.swap-menu') && !target.closest('.switch-btn')) {
    swapMenuOpen.value = null
  }
  if (!target.closest('.size-dropdown') && !target.closest('.size-trigger-btn')) {
    sizeMenuOpen.value = null
  }
}

// === Field reordering ===
function moveFieldUp(index: number) {
  if (index <= 0) return
  const arr = [...fieldOrder.value]
  ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
  fieldOrder.value = arr
}

function moveFieldDown(index: number) {
  if (index >= fieldOrder.value.length - 1) return
  const arr = [...fieldOrder.value]
  ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
  fieldOrder.value = arr
}

// === Swap menu ===
function openSwapMenu(field: SwappableField) {
  sizeMenuOpen.value = null  // close size dropdown
  swapMenuOpen.value = swapMenuOpen.value === field ? null : field
}

function getSwapOptions(currentField: SwappableField) {
  return (Object.keys(FIELD_META) as SwappableField[])
    .filter(key => key !== currentField)
    .map(key => ({
      key,
      label: FIELD_META[key].label,
      icon: FIELD_META[key].icon,
    }))
}

function swapFieldValue(fromField: SwappableField, toField: SwappableField) {
  const fromValue = (localData.value as any)[fromField] || ''
  const toValue = (localData.value as any)[toField] || ''
  ;(localData.value as any)[fromField] = toValue
  ;(localData.value as any)[toField] = fromValue
  swapMenuOpen.value = null
}

function close() {
  swapMenuOpen.value = null
  sizeMenuOpen.value = null
  emit('update:modelValue', false)
}

function toggleSizeMenu(field: SizableField) {
  swapMenuOpen.value = null  // close swap menu
  sizeMenuOpen.value = sizeMenuOpen.value === field ? null : field
}

function setFieldSize(field: SizableField, size: TextSizeMultiplier) {
  fieldSizes.value = { ...fieldSizes.value, [field]: size }
  sizeMenuOpen.value = null
}

function save() {
  // Include field order and field sizes in the saved data
  emit('save', { ...localData.value, fieldOrder: [...fieldOrder.value], fieldSizes: { ...fieldSizes.value } }, logoImage.value)
  close()
}

function triggerUpload() {
  fileInput.value?.click()
}

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    logoImage.value = e.target?.result as string
    localData.value.hasLogo = true
  }
  reader.readAsDataURL(file)
}

function removeLogo() {
  logoImage.value = null
  localData.value.hasLogo = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: var(--bg-primary, #1a1a2e);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  animation: modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 22px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
  border-radius: 16px 16px 0 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #e8e8f0);
  margin: 0;
  letter-spacing: -0.2px;
}

.close-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 18px;
  color: var(--text-secondary, #888);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 68, 68, 0.1);
  border-color: rgba(255, 68, 68, 0.3);
  color: #ff6b6b;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}

.form-section {
  margin-bottom: 20px;
}

.form-section.flex-1 {
  flex: 1;
  min-width: 0;
}

.form-section-group {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.015);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #e0e0e0);
  margin: 0 0 18px 0;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  opacity: 0.85;
}

.form-row {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #d0d0d8);
  margin-bottom: 0;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  position: relative;
}

/* ---- Switch Button: Clean outline style ---- */
.switch-btn {
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 3px 7px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-secondary, #777);
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  line-height: 1;
}

.switch-btn:hover {
  border-color: var(--primary-color, #4a9eff);
  color: var(--primary-color, #4a9eff);
  background: rgba(74, 158, 255, 0.06);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(74, 158, 255, 0.12);
}

.switch-btn:active {
  transform: translateY(0);
}

/* ---- Reorder Controls ---- */
.orderable-fields {
  position: relative;
}

.orderable-field {
  position: relative;
}

.reorder-controls {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-right: 6px;
  flex-shrink: 0;
}

.arrow-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  width: 22px;
  height: 16px;
  font-size: 9px;
  line-height: 1;
  cursor: pointer;
  color: var(--text-secondary, #888);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;
}

.arrow-btn:hover:not(:disabled) {
  background: rgba(74, 158, 255, 0.12);
  border-color: var(--primary-color, #4a9eff);
  color: var(--primary-color, #4a9eff);
}

.arrow-btn:active:not(:disabled) {
  background: rgba(74, 158, 255, 0.2);
  transform: scale(0.92);
}

.arrow-btn:disabled {
  opacity: 0.2;
  cursor: default;
}

/* Field reorder transition */
.field-reorder-move {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.field-reorder-enter-active,
.field-reorder-leave-active {
  transition: all 0.3s ease;
}

.field-reorder-enter-from,
.field-reorder-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* ---- Swap Menu: Polished dropdown ---- */
.swap-menu {
  position: relative;
  background: var(--bg-primary, #1a1a2e);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 6px;
  margin-bottom: 8px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  z-index: 100;
  overflow: hidden;
}

.swap-menu-header {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary, #777);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 8px 10px 6px;
}

.swap-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-primary, #d0d0d8);
  font-size: 13px;
  font-weight: 450;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.swap-option:hover {
  background: rgba(74, 158, 255, 0.1);
  color: var(--primary-color, #5eaaff);
}

.swap-option:active {
  background: rgba(74, 158, 255, 0.18);
}

.swap-option-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

/* Swap menu transitions */
.swap-menu-enter-active {
  animation: swapSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.swap-menu-leave-active {
  animation: swapSlideDown 0.12s ease-in reverse;
}

@keyframes swapSlideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    max-height: 320px;
    transform: translateY(0);
  }
}

/* ---- Size Dropdown ---- */
.size-dropdown-wrapper {
  position: relative;
  flex-shrink: 0;
  margin-left: 4px;
}

.size-trigger-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary, #888);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.6;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 2px;
}

.size-trigger-btn:hover {
  border-color: var(--primary-color, #4a9eff);
  color: var(--primary-color, #4a9eff);
  background: rgba(74, 158, 255, 0.06);
}

.size-trigger-btn.open {
  border-color: var(--primary-color, #4a9eff);
  color: var(--primary-color, #4a9eff);
  background: rgba(74, 158, 255, 0.08);
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.1);
}

.size-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--bg-primary, #1a1a2e);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 200;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  min-width: 52px;
}

.size-option {
  background: transparent;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary, #d0d0d8);
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.size-option:hover {
  background: rgba(74, 158, 255, 0.1);
  color: var(--primary-color, #5eaaff);
}

.size-option.active {
  background: var(--primary-color, #4a9eff);
  color: #fff;
}

.size-option.active:hover {
  background: var(--primary-hover, #3a8eef);
  color: #fff;
}

/* Size dropdown transitions */
.size-dropdown-enter-active {
  animation: sizeDropDown 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.size-dropdown-leave-active {
  animation: sizeDropDown 0.1s ease-in reverse;
}

@keyframes sizeDropDown {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.label-icon {
  font-size: 15px;
}

.optional {
  font-size: 11px;
  color: var(--text-secondary, #777);
  font-weight: 400;
  font-style: italic;
}

.field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.4;
}

.field-hint-inline {
  font-size: 11px;
  color: rgba(255, 180, 80, 0.7);
  font-weight: 500;
  letter-spacing: 0.3px;
}

.required {
  color: #ff5c5c;
  font-weight: 600;
  font-size: 13px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary, #e0e0e8);
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color, #4a9eff);
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.form-textarea {
  resize: vertical;
  min-height: 56px;
}

.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  transition: all 0.25s;
  background: rgba(255, 255, 255, 0.01);
}

.upload-area:hover {
  border-color: rgba(74, 158, 255, 0.4);
  background: rgba(74, 158, 255, 0.03);
}

.upload-btn {
  background: var(--primary-color, #4a9eff);
  color: white;
  border: none;
  padding: 11px 22px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: var(--primary-hover, #3a8eef);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(74, 158, 255, 0.25);
}

.upload-btn:active {
  transform: translateY(0);
}

.logo-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-preview img {
  max-width: 100px;
  max-height: 100px;
  border-radius: 10px;
  object-fit: contain;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.remove-btn {
  background: transparent;
  color: #ff5c5c;
  border: 1px solid rgba(255, 92, 92, 0.3);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(255, 68, 68, 0.1);
  border-color: #ff5c5c;
}

.modal-footer {
  padding: 18px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: linear-gradient(0deg, rgba(255,255,255,0.02) 0%, transparent 100%);
  border-radius: 0 0 16px 16px;
}

.btn-secondary,
.btn-primary {
  padding: 11px 22px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #d0d0d8);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.18);
}

.btn-primary {
  background: var(--primary-color, #4a9eff);
  color: white;
  box-shadow: 0 2px 10px rgba(74, 158, 255, 0.2);
}

.btn-primary:hover {
  background: var(--primary-hover, #3a8eef);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(74, 158, 255, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(-20px) scale(0.95);
}

/* Scrollbar */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.14);
}
</style>
