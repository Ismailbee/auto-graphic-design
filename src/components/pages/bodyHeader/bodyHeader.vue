<template>
  <div class="items-center">
    <div class="w-full h-[220px] bg-center pb-2 bg-no-repeat bg-[#fff6dc] to-white flex items-center">
      <!-- Parent Grid -->
      <div class="grid md:grid-cols-2 w-full h-full border-b-2 border-[#502800]">

        <!-- Left Logo -->
        <div class="md:pl-[100px] pl-[10px] pt-[50px]">
          <img :src="imageUrl" alt="Logo" class="w-[60%]" />
        </div>

        <!-- Right Side -->
        <div class="flex flex-col justify-between h-full">

          <!-- Top Row -->
          <div class="flex items-center justify-end flex-1 pr-8">
            <div class="relative cursor-pointer" @click="navigateToNotifications">
              <ion-icon :icon="notificationsOutline" class="mr-4 text-2xl text-[#502800] " />

              <!-- Notification badge -->
              <div v-if="notificationCount > 0"
                class="absolute flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-600 rounded-full -top-1 -right-[-12px]">
                {{ notificationCount }}
              </div>
            </div>

            <div class="flex items-center justify-center bg-primary w-[75px] h-[55px]">
              <img :src="imageUr2" alt="Logo" class="w-[40px] h-[40px]" />
            </div>
          </div>

          <!-- Bottom Row -->
          <div class="flex items-end justify-end flex-1 w-full">
            <div class="bg-primary w-[400px] h-[70px] rounded-tl-full flex items-center justify-center px-12">
              <bodyTemplate :icon="extensionPuzzle" label="Template" :label-icon="chevronUp" @click="navigateTo('/template')" />
              <body-icon :icon="logoAppleAppstore" label="My Edit" @click="navigateTo('/template')" />
              <body-icon :icon="server" label="Token" @click="navigateTo('/template')" />
              <body-icon :icon="diamond" label="Reward" @click="navigateTo('/template')" />
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="mt-[50px] px-4 flex items-center justify-center">
      <div class="relative w-[500px] flex items-center justify-center ">
        <input 
          type="text"
          placeholder="Search..."
          class="w-full max-w-[500px] pl-10 pr-4 py-3  text-sm border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#BA6900] focus:border-transparent transition duration-300 bg-gradient-to-t from-[#D2D3D5] via-[#F1F1F2] to-white"
        />

        <!-- Icon placed relative to input field, not absolute fixed distance -->
        <div class="absolute text-gray-400 transform -translate-y-1/2 left-4 top-7">
          <ion-icon :icon="searchOutline" class="text-lg"></ion-icon>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import { chevronUp, diamond, extensionPuzzle, logoAppleAppstore, notificationsOutline, server, searchOutline } from 'ionicons/icons'
import bodyIcon from './bodyIcon.vue'
import bodyTemplate from './bodyTemplate.vue'


// register components (required in script setup)
defineProps()
defineEmits()

const router = useRouter()
const imageUrl = ref('image/design smarter.png')
const imageUr2 = ref('image/logoauto.png')
const notificationCount = ref(0)

function navigateToNotifications() {
  router.push('/notifications')
}

function navigateTo(path) {
  router.push(path)
}

onMounted(() => {
  setInterval(() => {
    notificationCount.value += 1
  }, 5000)
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
