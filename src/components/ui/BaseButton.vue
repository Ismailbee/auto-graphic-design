<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="button-spinner"></span>
    <slot></slot>
  </button>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'BaseButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'danger', 'success', 'ghost', 'outline'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    type: {
      type: String,
      default: 'button',
      validator: (value) => ['button', 'submit', 'reset'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const buttonClasses = computed(() => {
      return [
        'base-button',
        `base-button--${props.variant}`,
        `base-button--${props.size}`,
        {
          'base-button--disabled': props.disabled,
          'base-button--loading': props.loading,
          'base-button--block': props.block
        }
      ];
    });

    const handleClick = (event) => {
      if (!props.disabled && !props.loading) {
        emit('click', event);
      }
    };

    return {
      buttonClasses,
      handleClick
    };
  }
});
</script>

<style scoped>
.base-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: center;
  white-space: nowrap;
  user-select: none;
  outline: none;
}

.base-button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.base-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

/* Variants */
.base-button--primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.base-button--primary:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.base-button--secondary {
  background-color: #6b7280;
  color: white;
  border-color: #6b7280;
}

.base-button--secondary:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #4b5563;
  border-color: #4b5563;
}

.base-button--danger {
  background-color: #ef4444;
  color: white;
  border-color: #ef4444;
}

.base-button--danger:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #dc2626;
  border-color: #dc2626;
}

.base-button--success {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}

.base-button--success:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #059669;
  border-color: #059669;
}

.base-button--ghost {
  background-color: transparent;
  color: #374151;
  border-color: transparent;
}

.base-button--ghost:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #f3f4f6;
}

.base-button--outline {
  background-color: transparent;
  color: #3b82f6;
  border-color: #3b82f6;
}

.base-button--outline:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #eff6ff;
}

/* Sizes */
.base-button--small {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.base-button--medium {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.base-button--large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

/* States */
.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button--loading {
  cursor: wait;
  opacity: 0.7;
}

.base-button--block {
  display: flex;
  width: 100%;
}

/* Spinner */
.button-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-rotate 0.6s linear infinite;
}

@keyframes spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .base-button--ghost {
    color: #e5e7eb;
  }

  .base-button--ghost:hover:not(.base-button--disabled):not(.base-button--loading) {
    background-color: #374151;
  }
}
</style>
