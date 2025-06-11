<template>
  <ion-title>
    <div class="flex items-center flex-shrink-0 w-auto mr-20">
      <div>
        <img :src="imageUrl" alt="Logo" class="flex-shrink-0 w-[500px]" />
      </div>
      <div class="bg-yellow-500"></div>
    </div>
  </ion-title>
</template>

<script setup>
import { ref } from 'vue';

const imageUrl = ref('./src/design smarter.png');
</script>

<style>
</style>
