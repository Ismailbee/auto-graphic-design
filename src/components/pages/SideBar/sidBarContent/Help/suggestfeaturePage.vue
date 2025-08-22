<template>
  <ion-page>
    <page-header label="Suggest a Feature" />

    <ion-content>
      <div class="bg-secondary min-h-screen w-full px-6 sm:px-[80px] py-8">

        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="Home"
          prevPageRoute="/home"
          currentPageName="Suggest a Feature"
          class="pb-3"
        />

        <div class="w-full h-full sm:bg-primary rounded-lg py-3 text-center mb-5 ">
        
            <h1 class="font-semibold m-0 sm:text-contrast">Suggest a Feature</h1>
            <p class="text-grey-300 sm:text-white">Please fill out the form below</p>
          
        </div>
        <div class="w-full h-full bg-white rounded-lg ">
          <ion-card-content>
        
            <ion-item class="custom-input">
              <ion-label position="stacked">Suggestion Message...</ion-label>
              <ion-textarea v-model="form.message" auto-grow rows="5" required></ion-textarea>
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

/* Add spacing between label and input */
.custom-input {
  --padding-top: 12px;   /* pushes input down inside ion-item */
  margin-bottom: 18px;   /* spacing between each field */
}

.custom-input ion-label {
  margin-bottom: 6px;    /* space between label and input */
}
</style>
