<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div
        v-if="show"
        class="modal-overlay"
        @click="handleOverlayClick"
        @keydown.esc="handleEscape"
        tabindex="-1"
        ref="modalRef"
      >
        <div
          class="modal-container"
          :class="containerClass"
          @click.stop
        >
          <!-- Close Button -->
          <button
            v-if="showCloseButton"
            @click="$emit('close')"
            class="modal-close-button"
            aria-label="Close modal"
          >
            <font-awesome-icon icon="times" class="w-4 h-4" />
          </button>

          <!-- Modal Content -->
          <div class="modal-content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true
  },
  closeOnEscape: {
    type: Boolean,
    default: true
  },
  containerClass: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['close'])

// Refs
const modalRef = ref(null)

// Store original body overflow
let originalBodyOverflow = ''

// Methods
const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    emit('close')
  }
}

const handleEscape = (event) => {
  if (props.closeOnEscape && event.key === 'Escape') {
    emit('close')
  }
}

const preventBodyScroll = () => {
  originalBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

const restoreBodyScroll = () => {
  document.body.style.overflow = originalBodyOverflow
}

const focusModal = () => {
  nextTick(() => {
    if (modalRef.value) {
      modalRef.value.focus()
    }
  })
}

// Watch for show prop changes
watch(() => props.show, (newValue) => {
  if (newValue) {
    preventBodyScroll()
    focusModal()
  } else {
    restoreBodyScroll()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  restoreBodyScroll()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
  pointer-events: auto;
  /* Changed to auto to allow modal interaction */
}

.modal-container {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  pointer-events: auto;
  /* Ensure modal content is clickable */
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  height: 100%;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in modal content */
  display: flex;
  flex-direction: column;
}

.modal-close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.modal-close-button:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.modal-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-container {
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 8px;
  }
  
  .modal-close-button {
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 5px;
  }
  
  .modal-container {
    max-width: 98vw;
    max-height: 98vh;
    border-radius: 6px;
  }
}
</style>
