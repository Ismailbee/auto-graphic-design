<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeModal">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 class="text-lg font-semibold mb-4">Forgot Password</h2>
      <p class="text-gray-600 mb-4">Please contact your administrator to reset your password.</p>
      <div class="flex justify-end">
        <button @click="closeModal" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>