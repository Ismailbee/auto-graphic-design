<template>
  <div class="notifications-container">
    <transition-group name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="toast-notification"
        :class="{
          'toast-success': toast.type === 'success',
          'toast-error': toast.type === 'error',
          'toast-warning': toast.type === 'warning',
          'toast-info': toast.type === 'info',
          'toast-hidden': !toast.visible
        }"
      >
        <div class="toast-icon">
          <i :class="getIconClass(toast.type)"></i>
        </div>
        <div class="toast-content">{{ toast.message }}</div>
        <button class="toast-close" @click="removeToast(toast.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useNotification } from '../../composables/useNotification';

const { toasts, removeToast } = useNotification();

function getIconClass(type) {
  switch (type) {
    case 'success':
      return 'fas fa-check-circle';
    case 'error':
      return 'fas fa-exclamation-circle';
    case 'warning':
      return 'fas fa-exclamation-triangle';
    case 'info':
    default:
      return 'fas fa-info-circle';
  }
}
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
}

.toast-notification {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: white;
  color: #374151;
  margin-bottom: 8px;
  min-width: 280px;
  max-width: 100%;
  transition: all 0.3s ease, transform 0.2s ease;
  transform: translateX(0);
}

.dark-theme .toast-notification {
  background-color: #1f2937;
  color: #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toast-success {
  border-left: 4px solid #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}

.toast-hidden {
  transform: translateX(120%);
  opacity: 0;
}

.toast-icon {
  margin-right: 12px;
  font-size: 20px;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-content {
  flex: 1;
  font-size: 14px;
}

.toast-close {
  background: none;
  border: none;
  padding: 4px;
  margin-left: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  color: #374151;
}

.dark-theme .toast-close {
  color: #9ca3af;
}

.dark-theme .toast-close:hover {
  color: #e5e7eb;
}

/* Transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
