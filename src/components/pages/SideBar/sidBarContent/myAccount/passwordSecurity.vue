<template>
  <ion-page>
    <page-header>Password & Security</page-header>

    <ion-content>
      <div class="bg-secondary h-full w-full px-[80px] py-8">

        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="My Account"
          prevPageRoute="/myAccountPage"
          currentPageName="Password & Security"
          class="pb-3"
        />

        <div class="lg:grid grid-cols-2 gap-8">

          <!-- Change Password -->
          <div class="shadow-md rounded-lg bg-white">
            <ion-card-header>
              <ion-card-title class="text-lg font-semibold">Change Password</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-item class="rounded-lg">
                <ion-label position="stacked">Current Password</ion-label>
                <ion-input v-model="currentPassword" type="password" placeholder="Enter current password" />
              </ion-item>
              <ion-item class="rounded-lg mt-3">
                <ion-label position="stacked">New Password</ion-label>
                <ion-input v-model="newPassword" type="password" placeholder="Enter new password" />
              </ion-item>
              <ion-item class="rounded-lg mt-3">
                <ion-label position="stacked">Confirm New Password</ion-label>
                <ion-input v-model="confirmPassword" type="password" placeholder="Confirm new password" />
              </ion-item>
              <button class="mt-4 text-[15px] bg-contrast w-full p-3 text-white rounded-lg" @click="updatePassword">
                Update Password
              </button>
            </ion-card-content>
          </div>

          <!-- Security Settings -->
          <ion-card class="shadow-md rounded-lg mt-4">
            <ion-card-header>
              <ion-card-title class="text-lg font-semibold">Security Settings</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-item>
                <ion-label>Two-Factor Authentication</ion-label>
                <ion-toggle v-model="twoFactorEnabled"></ion-toggle>
              </ion-item>
              <ion-item>
                <ion-icon name="key-outline" slot="start"></ion-icon>
                <ion-label>Security Key</ion-label>
                <ion-toggle v-model="securityKeyEnabled"></ion-toggle>
              </ion-item>
              <ion-item>
                <ion-icon name="apps-outline" slot="start"></ion-icon>
                <ion-label>Authenticator App</ion-label>
                <ion-toggle v-model="authenticatorAppEnabled"></ion-toggle>
              </ion-item>
              <ion-item>
                <ion-label>Security Notifications</ion-label>
                <ion-toggle v-model="securityNotifications"></ion-toggle>
              </ion-item>
            </ion-card-content>
          </ion-card>

          <!-- Account Details -->
          <ion-card class="shadow-md rounded-lg mt-4">
            <ion-card-header>
              <ion-card-title class="text-lg font-semibold">Account Details</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-item>
                <ion-label>Email Verification</ion-label>
                <span :class="emailVerified ? 'text-green-600' : 'text-red-600'">
                  {{ emailVerified ? 'Verified' : 'Not Verified' }}
                </span>
              </ion-item>
            </ion-card-content>
          </ion-card>

          <!-- Recovery Settings -->
          <ion-card class="shadow-md rounded-lg mt-4">
            <ion-card-header>
              <ion-card-title class="text-lg font-semibold">Recovery Settings</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-item>
                <ion-label>Recovery Email</ion-label>
                <ion-input v-model="recoveryEmail" placeholder="Enter recovery email"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label>Recovery Phone</ion-label>
                <ion-input v-model="recoveryPhone" placeholder="Enter phone number"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label>Backup Security Question</ion-label>
                <ion-input v-model="securityQuestion" placeholder="Enter security question"></ion-input>
              </ion-item>
            </ion-card-content>
          </ion-card>

          <!-- Deactivate Account -->
          <ion-card class="shadow-md rounded-lg mt-4">
            <ion-card-header>
              <ion-card-title class="text-lg font-semibold">Deactivate Account</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <button class="bg-red-600 text-white px-4 py-2 rounded-lg w-full" @click="deactivateAccount">
                Deactivate My Account
              </button>
            </ion-card-content>
          </ion-card>

          <!-- Recent Login Activity -->
          <ion-card class="shadow-md rounded-lg mt-4">
            <ion-card-header>
              <ion-card-title class="text-lg font-semibold">Recent Login Activity</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item v-for="(activity, index) in loginActivities" :key="index">
                  <ion-label>
                    <h3 class="font-semibold">{{ activity.device }}</h3>
                    <p>{{ activity.date }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import pageHeader from '@/components/pages/Header/pageHeader.vue'
import Breadcrumb from '@/components/pages/Breadcrumb.vue'
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonList,
  IonIcon
} from '@ionic/vue'

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const twoFactorEnabled = ref(false)
const securityKeyEnabled = ref(false)
const authenticatorAppEnabled = ref(false)
const securityNotifications = ref(true)

const emailVerified = ref(true) // can be set based on user data
const recoveryEmail = ref('')
const recoveryPhone = ref('')
const securityQuestion = ref('')

const loginActivities = ref([
  { device: 'Windows PC - Chrome', date: 'Aug 12, 2025 - 8:15 AM' },
  { device: 'iPhone 14 Pro - Safari', date: 'Aug 10, 2025 - 3:42 PM' },
  { device: 'iPad - Safari', date: 'Aug 8, 2025 - 11:27 AM' }
])

const updatePassword = () => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    alert('Please fill in all fields.')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    alert('New passwords do not match.')
    return
  }
  console.log('Password updated successfully')
}

const deactivateAccount = () => {
  if (confirm('Are you sure you want to deactivate your account?')) {
    console.log('Account deactivated')
  }
}
</script>

<style scoped>
ion-item {
  --background: transparent;
}
</style>
