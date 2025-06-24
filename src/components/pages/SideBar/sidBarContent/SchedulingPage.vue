<template>
  <ion-page>
    <page-header :icon="arrowBackOutline" label="Scheduling" />

    <ion-content class="ion-padding">

      <!-- Date Picker -->
      <ion-item>
        <ion-label position="stacked">Select Date</ion-label>
        <ion-datetime
          v-model="selectedDate"
          presentation="date"
          :show-default-buttons="true"
        />
      </ion-item>

      <!-- Time Picker -->
      <ion-item>
        <ion-label position="stacked">Select Time</ion-label>
        <ion-datetime
          v-model="selectedTime"
          presentation="time"
          :show-default-buttons="true"
        />
      </ion-item>

      <!-- Task Input -->
      <ion-item>
        <ion-label position="stacked">Task Description</ion-label>
        <ion-textarea
          v-model="task"
          auto-grow
          placeholder="Describe your task..."
        ></ion-textarea>
      </ion-item>

      <!-- Submit Button -->
      <ion-button expand="block" color="success" class="mt-6" @click="scheduleTask">
        Schedule Task
      </ion-button>

      <!-- Scheduled Output -->
      <ion-card v-if="scheduledTask" class="mt-6">
        <ion-card-header>
          <ion-card-title>Scheduled Task</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p><strong>Date:</strong> {{ selectedDate }}</p>
          <p><strong>Time:</strong> {{ selectedTime }}</p>
          <p><strong>Task:</strong> {{ task }}</p>
        </ion-card-content>
      </ion-card>
      
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { arrowBackOutline } from 'ionicons/icons'
import pageHeader from '../pageHeader.vue'
import {
  IonPage, IonContent,  IonItem, IonLabel, IonDatetime, IonTextarea, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/vue'

const router = useRouter()


const selectedDate = ref('')
const selectedTime = ref('')
const task = ref('')
const scheduledTask = ref(false)

function scheduleTask() {
  if (selectedDate.value && selectedTime.value && task.value.trim()) {
    scheduledTask.value = true
    alert('Task Scheduled!')
  } else {
    alert('Please fill in all fields.')
  }
}
</script>
