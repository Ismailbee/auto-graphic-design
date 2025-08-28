<template>
  <div class="toast-notifications-container">
    <div 
      v-for="toast in toasts" 
      :key="toast.id" 
      class="toast-notification"
      :class="`toast-${toast.type}`"
    >
      <div class="toast-icon">
        <i :class="getIconClass(toast.type)"></i>
      </div>
      <div class="toast-content">{{ toast.message }}</div>
      <button class="toast-close" @click="removeToast(toast.id)">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useNotification } from '@/composables/useNotification';

const { toasts, removeToast } = useNotification();

function getIconClass(type) {
  switch (type) {
    case 'success': return 'fas fa-check-circle';
    case 'error': return 'fas fa-exclamation-circle';
    case 'warning': return 'fas fa-exclamation-triangle';
    case 'info': default: return 'fas fa-info-circle';
  }
}
</script>

<style scoped>
.toast-notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast-notification {
  pointer-events: auto;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  animation: slide-in 0.3s ease forwards;
  max-width: 350px;
}

.toast-content {
  flex: 1;
  margin: 0 12px;
  font-size: 14px;
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.toast-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.2s;
}

.toast-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

/* Toast types */
.toast-success {
  border-left: 4px solid #10b981;
}
.toast-success .toast-icon {
  color: #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}
.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}
.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}
.toast-info .toast-icon {
  color: #3b82f6;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
