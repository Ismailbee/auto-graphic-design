<template>
  <ion-header class="sm:hidden">
    <ion-toolbar color="brand">
      <ion-buttons slot="start">
        <ion-button @click="goBack">
          <ion-icon slot="icon-only" :icon=" arrowBackOutline" class="text-white text-lg ml-9" />
        </ion-button>
      </ion-buttons>
      <ion-title class="text-contrast text-lg">{{ label }}</ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { arrowBackOutline } from 'ionicons/icons' // ✅ Ionic's back arrow icon

defineProps({
  label: String
})

const router = useRouter()

function goBack() {
  router.back()
}
</script>
