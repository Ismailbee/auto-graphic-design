<template>
  <ion-page>
    <!-- Header -->
      <ion-header class="sm:hidden">
      <ion-toolbar color="brand">
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon :icon="arrowBackOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
        <ion-title>Mock-Up</ion-title>
      </ion-toolbar>
    </ion-header>

    <!-- Content -->
    <ion-content class="ion-padding">
      <h2 class="mb-4 text-xl font-bold">Feature Preview</h2>

      <!-- Card -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Sample Card</ion-card-title>
          <ion-card-subtitle>Preview Content</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          This is a placeholder for future content. Use this card to test layout, spacing, and component design.
        </ion-card-content>
      </ion-card>

      <!-- Buttons -->
      <div class="mt-6 space-y-3">
        <ion-button expand="block" color="primary">Primary Action</ion-button>
        <ion-button expand="block" fill="outline">Secondary Action</ion-button>
        <ion-button expand="block" color="medium" disabled>Disabled Action</ion-button>
      </div>

      <!-- Input Field -->
      <ion-item class="mt-6">
        <ion-label position="stacked">Mock Input</ion-label>
        <ion-input placeholder="Type something..." />
      </ion-item>

      <!-- Switch -->
      <ion-item>
        <ion-label>Enable Feature</ion-label>
        <ion-toggle />
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { arrowBackOutline } from 'ionicons/icons'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
} from '@ionic/vue';

const router = useRouter()

function goBack() {
  router.back()
}

</script>

<style scoped>
/* Tailwind optional for spacing and typography */
</style>
