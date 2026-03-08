<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm">
    <div class="px-6 py-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ title }}
      </h1>
      <div class="flex items-center space-x-4">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
