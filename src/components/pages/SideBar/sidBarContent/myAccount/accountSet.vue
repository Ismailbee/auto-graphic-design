<template>
  <ion-page>
    <page-header label="Account Settings" />

    <ion-content class="ion-padding">
      <div class="max-w-4xl mx-auto">
        <Breadcrumb
          prevPageName="My Account"
          prevPageRoute="/myAccountPage"
          currentPageName="Account Settings"
          class="pb-4"
        />

        <section class="bg-white shadow-md rounded-lg p-6">
          <header class="flex items-start justify-between">
            <div>
              <h2 class="text-2xl font-semibold text-primary">Notifications</h2>
              <p class="text-sm text-gray-500 mt-1">Control how you receive alerts and updates from the app.</p>
            </div>
          </header>

          <ion-list class="mt-5">
            <ion-item lines="full" class="flex items-center justify-between">
              <ion-label class="ion-text-wrap">Desktop Notifications</ion-label>
              <ion-toggle v-model="form.desktopNotifications" aria-label="Desktop notifications"></ion-toggle>
            </ion-item>

            <ion-item lines="full" class="flex items-center justify-between">
              <ion-label class="ion-text-wrap">Email Notifications</ion-label>
              <ion-toggle v-model="form.emailNotifications" aria-label="Email notifications"></ion-toggle>
            </ion-item>

            <ion-item lines="full" class="flex items-center justify-between">
              <ion-label class="ion-text-wrap">Marketing Emails</ion-label>
              <ion-toggle v-model="form.marketingEmail" aria-label="Marketing emails"></ion-toggle>
            </ion-item>

            <ion-item lines="full" class="flex items-center justify-between">
              <ion-label class="ion-text-wrap">Product Updates</ion-label>
              <ion-toggle v-model="form.productUpdates" aria-label="Product updates"></ion-toggle>
            </ion-item>

            <ion-item lines="full" class="flex items-center justify-between">
              <ion-label class="ion-text-wrap">SMS Alerts</ion-label>
              <ion-toggle v-model="form.smsAlerts" aria-label="SMS alerts"></ion-toggle>
            </ion-item>

            <ion-item lines="full" class="flex items-center justify-between">
              <ion-label class="ion-text-wrap">Show Unread Badge</ion-label>
              <ion-toggle v-model="form.unreadBadge" aria-label="Unread notification badge"></ion-toggle>
            </ion-item>

            <ion-item lines="full" class="flex flex-wrap gap-3 items-center mt-3">
              <ion-label class="min-w-[180px]">Push Notification Timeout</ion-label>
              <div class="flex gap-3 items-center ml-auto">
                <ion-input
                  type="number"
                  min="1"
                  v-model.number="form.timeoutValue"
                  aria-label="Notification timeout value"
                  style="width:110px"
                ></ion-input>
                <ion-select v-model="form.timeoutUnit" aria-label="Notification timeout unit" style="width:140px">
                  <ion-select-option value="minutes">Minutes</ion-select-option>
                  <ion-select-option value="hours">Hours</ion-select-option>
                </ion-select>
              </div>
            </ion-item>
          </ion-list>

          <hr class="my-6" />

          <h3 class="text-lg font-medium text-primary">Email Preferences</h3>
          <p class="text-sm text-gray-500">Choose what types of emails you'd like to receive.</p>

          <ion-list class="mt-4">
            <ion-item lines="full" class="flex items-center justify-between">
              <ion-label>Communication Emails</ion-label>
              <ion-toggle v-model="form.communicationEmails" aria-label="Communication emails"></ion-toggle>
            </ion-item>
            <ion-item lines="full" class="flex items-center justify-between">
              <ion-label>Announcements & Updates</ion-label>
              <ion-toggle v-model="form.announcements" aria-label="Announcements and updates"></ion-toggle>
            </ion-item>
          </ion-list>

          <hr class="my-6" />

          <h3 class="text-lg font-medium text-primary">Sound</h3>
          <p class="text-sm text-gray-500">Mute notification sounds across the app.</p>

          <ion-list class="mt-4">
            <ion-item lines="none" class="flex items-center justify-between">
              <ion-label>Disable All Notification Sounds</ion-label>
              <ion-toggle v-model="form.disableSounds" aria-label="Disable notification sounds"></ion-toggle>
            </ion-item>
          </ion-list>

          <div class="mt-6 flex gap-3 justify-end">
            <ion-button fill="outline" color="medium" @click="resetToDefaults">Reset</ion-button>
            <ion-button color="primary" @click="saveSettings">Save Changes</ion-button>
          </div>
        </section>
      </div>

      <ion-toast :is-open="toast.visible" :message="toast.message" :duration="2500" @did-dismiss="toast.visible=false"></ion-toast>
    </ion-content>
  </ion-page>
</template>


<script setup>
import pageHeader from '@/components/pages/Header/pageHeader.vue'
import Breadcrumb from '@/components/pages/Breadcrumb.vue'
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonToast
} from '@ionic/vue'
import { reactive, onMounted } from 'vue'

const STORAGE_KEY = 'account_settings_v1'

const defaultSettings = {
  desktopNotifications: true,
  emailNotifications: true,
  marketingEmail: false,
  productUpdates: true,
  smsAlerts: false,
  unreadBadge: false,
  timeoutValue: 5,
  timeoutUnit: 'minutes',
  communicationEmails: true,
  announcements: false,
  disableSounds: false
}

const form = reactive({ ...defaultSettings })

const toast = reactive({ visible: false, message: '' })

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      Object.assign(form, { ...defaultSettings, ...parsed })
    }
  } catch (e) {
    // ignore parse errors and keep defaults
    console.warn('Failed to load settings', e)
  }
}

function validate() {
  if (!Number.isFinite(form.timeoutValue) || form.timeoutValue < 1) {
    toast.message = 'Timeout must be a number >= 1'
    toast.visible = true
    return false
  }
  return true
}

function saveSettings() {
  if (!validate()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    toast.message = 'Settings saved successfully'
    toast.visible = true
  } catch (e) {
    toast.message = 'Failed to save settings'
    toast.visible = true
    console.error(e)
  }
}

function resetToDefaults() {
  Object.assign(form, { ...defaultSettings })
  saveSettings()
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.ion-padding {
  padding-top: 1rem;
}

.text-primary {
  color: #0b5cff; /* keep consistent with app primary color */
}

.max-w-4xl {
  max-width: 64rem;
}

/* small adjustments to Ion list items so layout stays neat */
ion-item {
  --padding-start: 12px;
  --padding-end: 12px;
}
</style>
