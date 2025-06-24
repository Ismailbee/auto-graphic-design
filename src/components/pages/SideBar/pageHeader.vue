<template>
  <ion-header class="sm:hidden">
    <ion-toolbar color="brand">
      <ion-buttons slot="start">
        <ion-button @click="goBack">
          <ion-icon :icon="icon" slot="icon-only" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ label }}</ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup>
import { useRouter } from 'vue-router'

// Accept icon and label as props from parent
defineProps({
  icon: String,  // Use capital `String`
  label: String
})

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style scoped>
</style>
