<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Privacy Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list lines="full">

        <ion-item>
          <ion-label>Allow Email Notifications</ion-label>
          <ion-toggle v-model="settings.emailNotifications" />
        </ion-item>

        <ion-item>
          <ion-label>Allow Location Access</ion-label>
          <ion-toggle v-model="settings.locationAccess" />
        </ion-item>

        <ion-item>
          <ion-label>Allow App Usage Tracking</ion-label>
          <ion-toggle v-model="settings.usageTracking" />
        </ion-item>

        <ion-item>
          <ion-label>Personalized Ads</ion-label>
          <ion-toggle v-model="settings.personalizedAds" />
        </ion-item>

        <ion-item>
          <ion-label>Dark Mode</ion-label>
          <ion-toggle v-model="settings.darkMode" />
        </ion-item>

      </ion-list>

      <ion-button expand="block" class="ion-margin-top" @click="saveSettings">
        Save Settings
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem,
  IonLabel, IonToggle, IonList, IonButton
} from '@ionic/vue'

const settings = ref({
  emailNotifications: true,
  locationAccess: false,
  usageTracking: true,
  personalizedAds: false,
  darkMode: false
})

function saveSettings() {
  // Simulate saving
  console.log('Saved settings:', settings.value)
  alert('Your preferences have been saved.')
}
</script>

<style scoped>
ion-label {
  font-size: 16px;
}
</style>
