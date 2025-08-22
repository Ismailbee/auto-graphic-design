<template>
  <ion-page>
    <page-header label="Privacy Settings" />
    <ion-content>
      <div class="bg-secondary min-h-screen w-full px-6 pb-24 sm:px-24 py-10">
        <div class="mx-auto max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h1 class="text-3xl font-extrabold text-primary mb-6 text-center">Privacy Settings</h1>
          <p class="text-gray-700 mb-6 text-center">
            Manage your privacy preferences and control how your data is used.
          </p>

          <form class="space-y-6">
            <div>
              <label class="flex items-center gap-3">
                <ion-toggle v-model="settings.profileVisible" color="primary" />
                <span>Show my profile to other users</span>
              </label>
              <p class="text-xs text-gray-500 ml-9">Allow your profile to be discoverable by others.</p>
            </div>

            <div>
              <label class="flex items-center gap-3">
                <ion-toggle v-model="settings.emailUpdates" color="primary" />
                <span>Receive email updates</span>
              </label>
              <p class="text-xs text-gray-500 ml-9">Get news, tips, and offers by email.</p>
            </div>

            <div>
              <label class="flex items-center gap-3">
                <ion-toggle v-model="settings.analytics" color="primary" />
                <span>Allow usage analytics</span>
              </label>
              <p class="text-xs text-gray-500 ml-9">Help us improve by sharing anonymous usage data.</p>
            </div>

            <div>
              <label class="flex items-center gap-3">
                <ion-toggle v-model="settings.personalizedAds" color="primary" />
                <span>Personalized ads</span>
              </label>
              <p class="text-xs text-gray-500 ml-9">Allow us to show you relevant ads based on your activity.</p>
            </div>

            <div>
              <ion-button expand="block" color="contrast" @click.prevent="saveSettings">
                Save Preferences
              </ion-button>
            </div>
          </form>

          <div class="mt-10 text-xs text-gray-500 text-center">
            You can request your data or delete your account at any time. For more information, see our <a href="/privacypolicyPage" class="text-contrast underline">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import pageHeader from "../../../Header/pageHeader.vue";

const settings = ref({
  profileVisible: true,
  emailUpdates: true,
  analytics: false,
  personalizedAds: false,
})

function saveSettings() {
  // Here you would save settings to your backend or local storage
  alert('Your privacy preferences have been saved!')
}
</script>

<style scoped>
.bg-secondary {
  background-color: #f8f9fa;
}
.text-primary {
  color: #502800;
}
.text-contrast {
  color: #ffffff;
  background-color: #007bff;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
}
</style>
