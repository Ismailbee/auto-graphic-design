<template>
  <ion-page class="m-0">
    <page-header>My Profile</page-header>

    <ion-content>
      <div class="lg:grid grid-cols-3 bg-[#f4f3f3] h-full w-full px-[80px] py-8">

        <!-- Left side menu cards -->
        <div class=" col-end-2">
          <div 
            v-for="item in cards" 
            :key="item.title"
            class="block bg-white border border-gray-300 shadow-md p-4 mb-4 rounded-md transition-all duration-200 hover:scale-105 cursor-pointer"
            @click="navigate(item.route)"
          >
            <h5 class="text-lg m-0 font-medium hover:font-bold transition-colors duration-200">
              {{ item.title }}
            </h5>
            <p class="text-sm text-gray-500">{{ item.desc }}</p>
          </div>
        </div>

        <!-- Right side profile section -->
        <div class="col-span-2 px-7 ">

          <!-- Profile header -->
          <div class="bg-primary rounded-md shadow-2xl mb-6 grid grid-cols-3 items-center gap-4 p-6">       
            <div class="grid-cols-2 col-span-2 grid items-center gap-4">
              <div class="w-[100px] h-[100px] rounded-full border-[4px] border-contrast overflow-hidden">
                <img :src="userStore.profileImageUrl" />
              </div>

              <div class="w-full ml-[-150px] sm:w-[600px]">
                <h2 class="text-white m-0">{{ userStore.fullName }}</h2>
                <p class=" m-0 text-contrast">{{ userStore.email }}</p>
              </div>
            </div>

            <!-- Edit profile button -->
            <button  
              @click="goToEditProfile" 
              class="px-6 py-2 h-[50px] w-full sm:w-[200px] rounded-full bg-contrast text-white font-semibold shadow-md hover:shadow-lg 
                     hover:scale-105 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-contrast"
            >
              Edit Profile
            </button>
          </div>

          <!-- Profile details -->
          <div class="bg-white shadow-md rounded-md p-4">
            <ion-list>
              <ion-item>
                <ion-label>Username</ion-label>
                <ion-text slot="end">{{ userStore.username }}</ion-text>
              </ion-item>
              <ion-item>
                <ion-label>Phone</ion-label>
                <ion-text slot="end">{{ userStore.phone || 'Not set' }}</ion-text>
              </ion-item>
              <ion-item>
                <ion-label>Bio</ion-label>
                <ion-text slot="end">{{ userStore.bio || 'No bio yet' }}</ion-text>
              </ion-item>
              <ion-item>
                <ion-label>Member Since</ion-label>
                <ion-text slot="end">{{ formatDate(userStore.joinDate) }}</ion-text>
              </ion-item>
              <ion-item>
                <ion-label>City</ion-label>
                <ion-text slot="end">{{ userStore.city || 'Not set' }}</ion-text>
              </ion-item>
              <ion-item>
                <ion-label>State/Province</ion-label>
                <ion-text slot="end">{{ userStore.stateProvince || 'Not set' }}</ion-text>
              </ion-item>
              <ion-item>
                <ion-label>Country</ion-label>
                <ion-text slot="end">{{ userStore.country || 'Not set' }}</ion-text>
              </ion-item>
            </ion-list>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import pageHeader from '../../../Header/pageHeader.vue'
import { IonPage, IonContent, IonItem, IonLabel, IonText, IonList } from '@ionic/vue'

const router = useRouter()
const userStore = useUserStore()

const goToEditProfile = () => {
  router.push('/Edit-Profile')
}

const navigate = (path) => {
  if (path) router.push(path)
}

const cards = [
  { title: 'Account Setting', desc: 'Details about your Personal Information', route: '/account-settings' },
  { title: 'Notification', desc: 'Manage alerts and preferences', route: '/notifications' },
  { title: 'Membership Plan', desc: 'View or change your subscription', route: '/membership' },
  { title: 'Password & Security', desc: 'Update your login and security settings', route: '/security' }
]

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
