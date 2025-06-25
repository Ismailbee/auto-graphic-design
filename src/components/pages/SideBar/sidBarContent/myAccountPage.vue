<template>
  <ion-page>
    <page-header :icon="arrowBackOutline" label="My Account" />

    <ion-content class="ion-padding bg-[#f7f7f7]">
      <!-- Profile Section -->
      <div class="flex flex-col items-center my-6">
        <label class="relative cursor-pointer group">
          <img
            :src="profileImageUrl"
            alt="Profile"
            class="object-cover w-24 h-24 border-2 rounded-full shadow-md border-primary"
          />
          <input type="file" class="hidden" @change="onFileChange" accept="image/*" />
          <div
            class="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 text-white transition rounded-full bg-primary opacity-80 group-hover:opacity-100"
          >
            <ion-icon :icon="cameraOutline" class="text-lg" />
          </div>
        </label>

        <h2 class="mt-3 text-lg font-semibold text-[#333]">{{ fullName }}</h2>

        <div class="flex items-center gap-2">
          <div v-if="editing.email">
            <input
              v-model="edited.email"
              class="text-sm border rounded-md px-2 py-1 border-gray-300 w-[200px]"
            />
            <ion-button fill="clear" size="small" @click="saveEdit('email')">
              <ion-icon :icon="checkmarkOutline" />
            </ion-button>
            <ion-button fill="clear" size="small" @click="cancelEdit('email')">
              <ion-icon :icon="closeOutline" />
            </ion-button>
          </div>
          <div v-else class="text-sm text-gray-500">
            {{ email }}
            <ion-button fill="clear" size="small" @click="startEdit('email')">
              <ion-icon :icon="createOutline" />
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Account Settings -->
      <ion-list>
        <ion-list-header>Account Settings</ion-list-header>

        <!-- Username -->
        <ion-item>
          <ion-label>Username</ion-label>
          <div v-if="editing.username" class="flex items-center gap-2">
            <input
              v-model="edited.username"
              class="p-1 text-sm border rounded-md border-gray-300 w-[140px]"
            />
            <ion-button fill="clear" @click="saveEdit('username')" size="small">
              <ion-icon :icon="checkmarkOutline" />
            </ion-button>
            <ion-button fill="clear" @click="cancelEdit('username')" size="small">
              <ion-icon :icon="closeOutline" />
            </ion-button>
          </div>
          <div v-else class="flex items-center gap-2">
            <ion-note slot="end">{{ username }}</ion-note>
            <ion-button fill="clear" @click="startEdit('username')" size="small">
              <ion-icon :icon="createOutline" />
            </ion-button>
          </div>
        </ion-item>

        <!-- Password -->
        <ion-item>
          <ion-label>Password</ion-label>
          <div v-if="editing.password" class="flex items-center gap-2">
            <input
              type="password"
              v-model="edited.password"
              class="p-1 text-sm border rounded-md border-gray-300 w-[140px]"
            />
            <ion-button fill="clear" @click="saveEdit('password')" size="small">
              <ion-icon :icon="checkmarkOutline" />
            </ion-button>
            <ion-button fill="clear" @click="cancelEdit('password')" size="small">
              <ion-icon :icon="closeOutline" />
            </ion-button>
          </div>
          <div v-else class="flex items-center gap-2">
            <ion-note slot="end">••••••••</ion-note>
            <ion-button fill="clear" @click="startEdit('password')" size="small">
              <ion-icon :icon="createOutline" />
            </ion-button>
          </div>
        </ion-item>

        <!-- Phone -->
        <ion-item>
          <ion-label>Phone</ion-label>
          <div v-if="editing.phone" class="flex items-center gap-2">
            <input
              v-model="edited.phone"
              class="p-1 text-sm border rounded-md border-gray-300 w-[140px]"
            />
            <ion-button fill="clear" @click="saveEdit('phone')" size="small">
              <ion-icon :icon="checkmarkOutline" />
            </ion-button>
            <ion-button fill="clear" @click="cancelEdit('phone')" size="small">
              <ion-icon :icon="closeOutline" />
            </ion-button>
          </div>
          <div v-else class="flex items-center gap-2">
            <ion-note slot="end">{{ phone }}</ion-note>
            <ion-button fill="clear" @click="startEdit('phone')" size="small">
              <ion-icon :icon="createOutline" />
            </ion-button>
          </div>
        </ion-item>
      </ion-list>

      <!-- Preferences -->
      <ion-list class="mt-6">
        <ion-list-header>Preferences</ion-list-header>

        <ion-item>
          <ion-label>Notifications</ion-label>
          <ion-toggle v-model="notificationsEnabled" />
        </ion-item>

        <ion-item>
          <ion-label>Dark Mode</ion-label>
          <ion-toggle v-model="darkMode" />
        </ion-item>

        <ion-item button>
          <ion-label>Language</ion-label>
          <ion-note slot="end">English</ion-note>
        </ion-item>
      </ion-list>

      <!-- App Info -->
      <ion-list class="mt-6">
        <ion-list-header>App Info</ion-list-header>

        <ion-item button>
          <ion-label>About</ion-label>
        </ion-item>

        <ion-item button>
          <ion-label>Help & Support</ion-label>
        </ion-item>

        <ion-item>
          <ion-label>App Version</ion-label>
          <ion-note slot="end">v1.0.0</ion-note>
        </ion-item>
      </ion-list>

      <!-- Logout -->
      <div class="flex justify-center mt-10">
        <ion-button color="danger" @click="logout">Logout</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  arrowBackOutline,
  createOutline,
  checkmarkOutline,
  closeOutline,
  cameraOutline
} from 'ionicons/icons'
import pageHeader from '../pageHeader.vue'

import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonToggle,
  IonListHeader,
  IonButton,
  IonIcon
} from '@ionic/vue'

const router = useRouter()

// Data
const profileImageUrl = ref('/image/profile-placeholder.jpg')
const fullName = ref('John Doe')
const email = ref('johndoe@example.com')
const username = ref('johndoe123')
const password = ref('mypassword')
const phone = ref('+1 234 567 890')

const editing = ref({
  username: false,
  email: false,
  password: false,
  phone: false
})

const edited = ref({
  username: username.value,
  email: email.value,
  password: password.value,
  phone: phone.value
})

const notificationsEnabled = ref(true)
const darkMode = ref(false)

// Image change
function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      profileImageUrl.value = reader.result
    }
    reader.readAsDataURL(file)
  }
}

// Watch to sync fullName with username
watch(() => username.value, (newVal) => {
  fullName.value = newVal
})

// Edit logic
function startEdit(field) {
  edited.value[field] = eval(field).value
  editing.value[field] = true
}

function cancelEdit(field) {
  editing.value[field] = false
}

function saveEdit(field) {
  if (field === 'username') username.value = edited.value.username
  if (field === 'email') email.value = edited.value.email
  if (field === 'phone') phone.value = edited.value.phone
  if (field === 'password') password.value = edited.value.password
  editing.value[field] = false
}

function logout() {
  console.log('Logging out...')
}
</script>

<style scoped>
input {
  outline: none;
}
</style>
