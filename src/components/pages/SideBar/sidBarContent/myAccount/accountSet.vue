<template>
  <ion-page>
    <!-- Header -->
    <page-header label="Membership Plan" />

     
    <ion-content>
       <div class="sm:bg-secondary min-h-screen w-full sm:px-[90px] sm:py-[30px]">
          <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="My Account"
          prevPageRoute="/myAccountPage"
          currentPageName="Account Setting"
          class="pb-3"
        />

        <div class="bg-white shadow-md rounded-md p-3">
                        
                <!-- Notifications -->
                <h3 class="font-semibold text-primary text-lg mt-4">Notifications</h3>
                <div>
                    <ion-item>
                    <ion-label>Enable Desktop Notifications</ion-label>
                    <ion-toggle v-model="desktopNotifications" color="brand"></ion-toggle>
                    </ion-item>

                    <ion-item class="space-x-[150px]">
                    <ion-label>Enable Email Notifications</ion-label>
                    <ion-toggle v-model="emailNotifications" color="brand"></ion-toggle>
                    </ion-item>

                    <ion-item>
                    <ion-label>Enable Marketing Email Notifications</ion-label>
                    <ion-toggle v-model="marketingemailNotifications" color="brand"></ion-toggle>
                    </ion-item>

                    <ion-item>
                    <ion-label>Enable Poduct Updates Notifications</ion-label>
                    <ion-toggle v-model="productUpdatesemailNotifications" color="brand"></ion-toggle>
                    </ion-item>

                    <ion-item>
                    <ion-label>Enable SMS Alerts Notifications</ion-label>
                    <ion-toggle v-model="SMSNotifications" color="brand"></ion-toggle>
                    </ion-item>

                    <ion-item>
                    <ion-label>Enable Unread Notification Badge</ion-label>
                    <ion-toggle v-model="unreadBadge" color="brand"></ion-toggle>
                    </ion-item>

                    <ion-item>
                    <ion-label>Push Notification Time-Out</ion-label>
                    <div class="flex gap-2 items-center bg-contrast px-9 text-white rounded-xl">
                        <ion-input
                        type="number"
                        min="1"
                        v-model="timeoutValue"
                        style="width: 80px"
                        ></ion-input>
                        <ion-select v-model="timeoutUnit" style="width: 120px">
                        <ion-select-option value="minutes">Minutes</ion-select-option>
                        <ion-select-option value="hours">Hours</ion-select-option>
                        </ion-select>
                    </div>
                    </ion-item>
                </div>

                <!-- Email Notifications -->
                <h3 class="font-semibold text-primary text-lg mt-6">Email Notifications</h3>
                <div>
                    <ion-item>
                    <ion-label>Communication Emails</ion-label>
                    <ion-toggle v-model="communicationEmails" color="brand"></ion-toggle>
                    </ion-item>
                    <ion-item>
                    <ion-label>Announcements & Updates</ion-label>
                    <ion-toggle v-model="announcements" color="brand"></ion-toggle>
                    </ion-item>
                </div>

                <!-- Sound -->
                <h3 class="font-semibold text-primary text-lg mt-6">Sound</h3>
                <div>
                    <ion-item>
                    <ion-label>Disable All Notification Sounds</ion-label>
                    <ion-toggle v-model="disableSounds" color="brand"></ion-toggle>
                    </ion-item>
                </div>

        </div>
       </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import pageHeader from '@/components/pages/Header/pageHeader.vue'
import Breadcrumb from '@/components/pages/Breadcrumb.vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonInput
} from '@ionic/vue'
import { ref } from 'vue'

// Notifications
const desktopNotifications = ref(true)
const unreadBadge = ref(false)
const timeoutValue = ref(5)
const timeoutUnit = ref('minutes')

// Email Notifications
const communicationEmails = ref(true)
const announcements = ref(false)

// Sound
const disableSounds = ref(false)
</script>

<style scoped>
h3 {
  margin-bottom: 8px;
}
</style>
