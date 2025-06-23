<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>My Edit</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <!-- Profile Picture -->
      <div class="flex justify-center my-6">
        <ion-avatar class="w-[100px] h-[100px]">
          <img :src="profileImage" alt="Profile Image" />
        </ion-avatar>
      </div>

      <!-- Edit Form -->
      <ion-list>

        <ion-item>
          <ion-label position="stacked">Full Name</ion-label>
          <ion-input v-model="form.name" placeholder="Enter your name"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input v-model="form.email" type="email" placeholder="Enter email"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Phone</ion-label>
          <ion-input v-model="form.phone" type="tel" placeholder="Enter phone number"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Bio</ion-label>
          <ion-textarea v-model="form.bio" auto-grow placeholder="Tell us about yourself..."></ion-textarea>
        </ion-item>

      </ion-list>

      <ion-button expand="block" color="success" class="mt-6" @click="saveChanges">
        Save Changes
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonAvatar, IonList, IonItem, IonLabel, IonInput, IonTextarea, IonButton
} from '@ionic/vue'

const profileImage = ref('https://via.placeholder.com/100')

const form = ref({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '',
  bio: '',
})

function saveChanges() {
  console.log('Saved Data:', form.value)
  alert('Profile updated successfully!')
}
</script>
