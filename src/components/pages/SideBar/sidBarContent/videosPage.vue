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
        <ion-title>Video Page</ion-title>
      </ion-toolbar>
    </ion-header>

    <!-- Content -->
    <ion-content class="ion-padding">
      <!-- Video Container -->
      <div class="w-full mb-4 bg-black aspect-video">
        <video
          ref="videoPlayer"
          controls
          class="w-full h-full"
          poster="https://via.placeholder.com/1280x720"
        >
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <!-- Video Info -->
      <h2 class="mb-2 text-2xl font-bold">Intro to Ionic Vue</h2>
      <p class="mb-4 text-gray-600">Learn how to build beautiful mobile apps using Ionic Vue framework in this introductory video.</p>

      <!-- Action Buttons -->
      <ion-button expand="block" color="primary">Like</ion-button>
      <ion-button expand="block" fill="outline" class="mt-2">Share</ion-button>
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
  IonButtons,
  IonBackButton,
  IonButton
} from '@ionic/vue'

const router = useRouter()

function goBack() {
  router.back()
}

</script>

<style scoped>
.aspect-video {
  aspect-ratio: 16 / 9;
}
</style>
