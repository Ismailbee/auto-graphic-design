<template>
  <ion-page>
    <page-header label="Contact" />

    <ion-content>
      <div class="bg-secondary min-h-screen w-full px-6 sm:px-[80px] pt-8 pb-32">

        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="Home"
          prevPageRoute="/home"
          currentPageName="Contact"
          class="pb-3"
        />

        <div class="w-full h-full bg-white rounded-lg">
          <ion-card-header>
            <h2 class="text-black">We're here to help</h2>
            <ion-card-subtitle>Please fill out the form below</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <ion-item class="custom-input">
              <ion-label position="stacked">Name</ion-label>
              <ion-input v-model="form.name" type="text" required></ion-input>
            </ion-item>

            <ion-item class="custom-input">
              <ion-label position="stacked">Email</ion-label>
              <ion-input v-model="form.email" type="email" required></ion-input>
            </ion-item>

            <ion-item class="custom-input">
              <ion-label position="stacked">Subject</ion-label>
              <ion-input v-model="form.subject" type="text" required></ion-input>
            </ion-item>

           <ion-item class="custom-input">
              <ion-label position="stacked">Message</ion-label>
              <ion-textarea 
                v-model="form.message" 
                auto-grow 
                rows="5" 
                required 
                class="justify-text"
              ></ion-textarea>
            </ion-item>

            <button
              @click="submitForm"
              class="bg-contrast font-semibold text-white px-4 py-3 rounded-md mt-4 w-full"
            >
              Submit
            </button>
          </ion-card-content>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import pageHeader from "../../../Header/pageHeader.vue";
import Breadcrumb from "@/components/pages/Breadcrumb.vue";
import {
  IonPage, IonContent, IonItem, IonLabel,
  IonInput, IonTextarea, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle
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

.justify-text {
  text-align: justify;
}

/* Add spacing between label and input */
.custom-input {
  --padding-top: 12px;   /* pushes input down inside ion-item */
  margin-bottom: 18px;   /* spacing between each field */
}

.custom-input ion-label {
  margin-bottom: 6px;    /* space between label and input */
}
</style>
