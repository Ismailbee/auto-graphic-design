<template>
  <div class="items-center">
    <div class="w-full h-[220px]  pb-2 bg-no-repeat bg-[#f6ebcd] flex items-center">
      <!-- Parent Grid -->
      <div class="sm:grid sm:grid-cols-2 w-full  h-full sm:border-b-2 border-[#502800]">

        <!-- Left Logo -->
        <div class="md:pl-[100px] p-[10px] sm:pt-[30px] pt-[90px] flex justify-center items-center">
          <img :src="imageUrl" alt="Logo" class="sm:w-[450px] w-[300px]" />
        </div>

        <!-- Right Side -->
        <div class="flex-col justify-between hidden h-full sm:flex">

          <!-- Top Row -->
          <div class="flex items-center justify-end flex-1 pr-16 sm:flex-2 ">
            <div class="relative pt-2 mr-4 cursor-pointer" @click="navigateToNotifications">
              <ion-icon :icon="notificationsOutline" class="mr-4 text-[35px] text-[#502800] " />

              <!-- Notification badge -->
              <div v-if="notificationCount > 0"
                class="absolute flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-600 rounded-full top-1 -right-[-15px]">
                {{ notificationCount }}
              </div>
            </div>

            <div class="flex items-center justify-center bg-primary w-[75px] h-[55px] rounded-[10px]">
              <img :src="imageUrl2" alt="Logo" class="w-[60px] h-[40px]" />
            </div>
          </div>

          <!-- Bottom Row -->
          <div class="flex items-end justify-end flex-1 w-full">
            <div class="bg-primary w-[450px] h-[80px] rounded-tl-full flex items-center justify-center px-12">
              <bodyTemplate :icon="logoSlack" label="Template" :label-icon="chevronUp" />
              <body-icon :icon="logoAppleAppstore" label="My Edit" @click="navigateTo('/myeditPage')" />
              <body-icon :icon="server" label="Token" @click="navigateTo('/tokenPage')" />
              <body-icon :icon="diamond" label="Reward" @click="navigateTo('/rewardPage')" />
            </div>
          </div>

        </div>
      </div>
    </div>
    <div class="sm:mt-[50px] mt-[40px] px-4 flex items-center justify-center">
      <SearchQuery />
      
    </div>



  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import { chevronUp, diamond, logoSlack, logoAppleAppstore, notificationsOutline, server, searchOutline } from 'ionicons/icons'
import { useNotification } from '@/composables/useNotification'
import bodyIcon from './bodyIcon.vue'
import bodyTemplate from './bodyTemplate.vue'
import SearchQuery from '../../SearchQuery/SearchQuery.vue'


// register components (required in script setup)
defineProps()
defineEmits()

const router = useRouter()
function navigateTo(path) {
  router.push(path)
}
const imageUrl = ref('image/design smarter.png')
const imageUrl2 = ref('image/logoauto.png')

const { notificationCount } = useNotification()



function navigateToNotifications() {
  router.push('/notifications')
}


let intervalId

onMounted(() => {
  intervalId = setInterval(() => {
  }, 5000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})


</script>

<style scoped>
.bg-primary {
  background-color: #502800;
}
.bg-contrast {
  background-color: #BA6900;
}
</style>
