<template>
  <ion-page>
    <!-- Header -->
    <page-header label="Account Setting" />

    <ion-content>
      <div class="sm:bg-secondary min-h-screen w-full px-4 sm:px-[90px] sm:py-[30px]">
        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="My Account"
          prevPageRoute="/myAccountPage"
          currentPageName="Account Setting"
          class="pb-3"
        />

        <div class="bg-white sm:shadow-md rounded-md py-3 px-9">
          <!-- Notifications -->
          <h3 class="font-semibold text-primary text-lg mt-4">Notifications</h3>
          <div>
            <!-- Desktop -->
            <div class="flex justify-between items-center py-2 border-b-[0.5px] border-grey-500">
              <ion-label class="flex-1 whitespace-nowrap">Enable Desktop Notifications</ion-label>
              <ion-toggle v-model="desktopNotifications" color="brand"></ion-toggle>
            </div>

            <!-- Email -->
            <div class="flex justify-between items-center py-2 border-b-[0.5px] border-grey-500">
              <ion-label class="flex-1 whitespace-nowrap">Enable Email Notifications</ion-label>
              <ion-toggle v-model="emailNotifications" color="brand"></ion-toggle>
            </div>

            <!-- Marketing -->
            <div class="flex justify-between items-center py-2 border-b-[0.5px] border-grey-500">
              <ion-label class="flex-1 whitespace-nowrap">Enable Marketing Email Notifications</ion-label>
              <ion-toggle v-model="marketingemailNotifications" color="brand"></ion-toggle>
            </div>

            <!-- Product Updates -->
            <div class="flex justify-between items-center py-2 border-b-[0.5px] border-grey-500">
              <ion-label class="flex-1 whitespace-nowrap">Enable Product Updates Notifications</ion-label>
              <ion-toggle v-model="productUpdatesemailNotifications" color="brand"></ion-toggle>
            </div>

            <!-- SMS -->
            <div class="flex justify-between items-center py-2 border-b-[0.5px] border-grey-500">
              <ion-label class="flex-1 whitespace-nowrap">Enable SMS Alerts Notifications</ion-label>
              <ion-toggle v-model="SMSNotifications" color="brand"></ion-toggle>
            </div>

            <!-- Unread Badge -->
            <div class="flex justify-between items-center  py-2 border-b-[0.5px] border-grey-500">
              <ion-label class="flex-1 whitespace-nowrap">Enable Unread Notification Badge</ion-label>
              <ion-toggle v-model="unreadBadge" color="brand"></ion-toggle>
            </div>

            <!-- Timeout -->
            <div class="sm:flex justify-between items-center py-2 border-b-[0.5px] border-grey-500">
              <ion-label class="flex-1 whitespace-nowrap">Push Notification Time-Out</ion-label>
              <div class="flex gap-2 items-center border-[0.10px] px-9 mt-2 rounded-xl">
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
            </div>
          </div>

          <!-- Email Notifications -->
          <h3 class="font-semibold text-primary text-lg mt-6">Email Notifications</h3>
          <div>
            <div class="flex justify-between items-center py-2 border-b-[0.5px] border-grey-500">
              <ion-label class="flex-1 whitespace-nowrap">Communication Emails</ion-label>
              <ion-toggle v-model="communicationEmails" color="brand"></ion-toggle>
            </div>
            <div class="flex justify-between items-center py-2 border-b-[0.5px] border-grey-500">
              <ion-label class="flex-1 whitespace-nowrap">Announcements & Updates</ion-label>
              <ion-toggle v-model="announcements" color="brand"></ion-toggle>
            </div>
          </div>

          <!-- Sound -->
          <h3 class="font-semibold text-primary text-lg mt-6">Sound</h3>
          <div>
            <div class="flex justify-between items-center py-2">
              <ion-label class="flex-1 whitespace-nowrap">Disable All Notification Sounds</ion-label>
              <ion-toggle v-model="disableSounds" color="brand"></ion-toggle>
            </div>
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
