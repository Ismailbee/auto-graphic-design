<template>
  <ion-page>
     <ion-header class="sm:hidden">
      <ion-toolbar color="brand">
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon :icon="arrowBackOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
        <ion-title>My Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding bg-[#f7f7f7]">
      <!-- Profile Section -->
      <div class="flex flex-col items-center my-6">
        <h2 class="mt-3 text-lg font-semibold">John Doe</h2>
        <p class="text-sm text-gray-500">johndoe@example.com</p>
      </div>

      <!-- Account Settings -->
      <ion-list>
        <ion-list-header>Account Settings</ion-list-header>

        <ion-item button>
          <ion-label>Username</ion-label>
          <ion-note slot="end">johndoe123</ion-note>
        </ion-item>

        <ion-item button>
          <ion-label>Password</ion-label>
          <ion-note slot="end">••••••••</ion-note>
        </ion-item>

        <ion-item button>
          <ion-label>Phone</ion-label>
          <ion-note slot="end">+1 234 567 890</ion-note>
        </ion-item>
      </ion-list>

      <!-- Preferences -->
      <ion-list class="mt-6">
        <ion-list-header>Preferences</ion-list-header>

        <ion-item>
          <ion-label>Notifications</ion-label>
          <ion-toggle v-model="notificationsEnabled" />
        </ion-item>

        <ion-item>
          <ion-label>Dark Mode</ion-label>
          <ion-toggle v-model="darkMode" />
        </ion-item>

        <ion-item button>
          <ion-label>Language</ion-label>
          <ion-note slot="end">English</ion-note>
        </ion-item>
      </ion-list>

      <!-- App Info -->
      <ion-list class="mt-6">
        <ion-list-header>App Info</ion-list-header>

        <ion-item button>
          <ion-label>About</ion-label>
        </ion-item>

        <ion-item button>
          <ion-label>Help & Support</ion-label>
        </ion-item>

        <ion-item>
          <ion-label>App Version</ion-label>
          <ion-note slot="end">v1.0.0</ion-note>
        </ion-item>
      </ion-list>

      <!-- Logout -->
      <div class="flex justify-center mt-10">
        <ion-button color="danger" @click="logout">Logout</ion-button>
      </div>
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
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonToggle,
  IonListHeader,
  IonButton
} from '@ionic/vue'

const router = useRouter()
function goBack() {
  router.back()
}

const notificationsEnabled = ref(true)
const darkMode = ref(false)

function logout() {
  console.log('Logging out...')
  // Add logout logic here (clear tokens, redirect, etc.)
}
</script>

<style scoped>
/* Optional Tailwind reset tweaks or avatar image fallback */
</style>
