<template>
  <ion-page class="m-0">
    <page-header label="My Profile" />

  <ion-content>
  <div class="flex flex-col lg:grid lg:grid-cols-3 bg-secondary min-h-screen w-full px-6 sm:px-[80px] py-8">

    <!-- Breadcrumb -->
    <Breadcrumb
      prevPageName="Home"
      prevPageRoute="/home"
      currentPageName="My Account"
      class="pb-3"
    />

    <!-- Right side profile section (comes first on md and below) -->
    <div class="order-1 lg:order-2 col-span-2 lg:px-7 h-full w-full text-center sm:text-left">
      <!-- Profile header -->
      <div class="sm:bg-primary sm:rounded-md sm:shadow-2xl mb-6 sm:grid grid-cols-3 items-center gap-4 p-6">       
        <div class="grid-cols-2 sm:col-span-2 sm:grid items-center px-5 gap-4 col-span-2 flex flex-col justify-center space-y-3">
          <!-- Profile image -->
          <div class="w-[100px] h-[100px] rounded-full  overflow-hidden">
            <img :src="userStore.profileImageUrl" />
          </div>

          <!-- Name & Email -->
          <div class="md:ml-[-80px]">
            <h2 class="sm:text-white m-0">{{ userStore.fullName }}</h2>
            <p class="m-0 md:text-[14px] text-contrast">{{ userStore.email }}</p>
          </div>
        </div>

        <!-- Edit profile button -->
        <button  
          @click="goToEditProfile" 
          class="mt-3 sm:m-0 px-6 py-2 h-[50px] w-full lg:w-[200px] rounded-full bg-contrast text-white font-semibold shadow-md hover:shadow-lg 
                 hover:scale-105 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-contrast"
        >
          Edit Profile
        </button>
      </div>

      <!-- Profile details -->
      <div class="bg-white  rounded-md p-4">
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

    <!-- Left side menu cards (goes below on md and below) -->
    <div class="order-2 lg:order-1 col-end-2 mt-5 sm:m-0 md:mt-4 ">
      <div
        v-for="item in cards"
        :key="item.title"
        class="block bg-white border border-gray-300 hover:shadow-md p-3 mb-2 sm:mb-4 rounded-md transition-all duration-200 hover:scale-105 cursor-pointer"
        @click="navigate(item.route)"
      >
        <h5 class="text-lg m-0 font-medium hover:font-bold transition-colors duration-200">
          {{ item.title }}
        </h5>
        <p class="text-sm text-gray-500">{{ item.desc }}</p>
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
import Breadcrumb from '@/components/pages/Breadcrumb.vue'
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
  { title: 'Account Setting', desc: 'Details about your Personal Information', route: '/accountSet' },
  { title: 'Notification', desc: 'Manage alerts and preferences', route: '/notification' },
  { title: 'Membership Plan', desc: 'View or change your subscription', route: '/membershipPlan' },
  { title: 'Password & Security', desc: 'Update your login and security settings', route: '/passwordSecurity' }
]

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
