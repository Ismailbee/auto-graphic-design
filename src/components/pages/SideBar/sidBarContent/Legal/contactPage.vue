<template>
  <ion-page>
   <page-header :icon="arrowBackOutline" label="ContactPage" />

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>We're here to help</ion-card-title>
          <ion-card-subtitle>Please fill out the form below</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-item>
            <ion-label position="floating">Name</ion-label>
            <ion-input v-model="form.name" type="text" required></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="form.email" type="email" required></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Subject</ion-label>
            <ion-input v-model="form.subject" type="text" required></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Message</ion-label>
            <ion-textarea v-model="form.message" auto-grow rows="5" required></ion-textarea>
          </ion-item>

          <ion-button expand="block" @click="submitForm" class="ion-margin-top">
            Submit
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import pageHeader from '../../pageHeader.vue'
import { arrowBackOutline } from 'ionicons/icons'
import {
  IonPage, IonContent, IonItem, IonLabel,
  IonInput, IonTextarea, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle
} from '@ionic/vue'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

function submitForm() {
  if (!form.value.name || !form.value.email || !form.value.subject || !form.value.message) {
    alert('Please fill in all fields.')
    return
  }

  // Simulate sending
  console.log('Support request:', form.value)
  alert('Your message has been sent! We will respond soon.')

  // Reset form
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  }
}
</script>

<style scoped>
ion-card-title {
  font-weight: bold;
}
</style>
