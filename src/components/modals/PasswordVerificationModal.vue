<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 class="text-lg font-semibold mb-4">Password Verification</h2>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Enter your password:</label>
        <input 
          v-model="password" 
          type="password" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="verifyPassword"
        >
      </div>
      <div class="flex justify-end space-x-3">
        <button @click="$emit('close')" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Cancel
        </button>
        <button @click="verifyPassword" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Verify
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const password = ref('')

const emit = defineEmits(['close', 'verified'])

const verifyPassword = () => {
  // Simple verification for demo purposes
  if (password.value) {
    emit('verified', password.value)
    emit('close')
  }
}
</script>