<template>
  <ion-page class="welcome-page">
    <ion-content class="ion-text-center ion-padding full-background">

      <!-- Logo & tagline -->
      <div class="welcome-container">
        <img :src="logo" class="logo" />
      </div>

      <!-- Bottom curve -->
      <div class="curve relative">
        <span
          class="absolute right-[130px] top-10 text-white border-b border-dashed border-white w-[150px]"
        >
          Powered by&nbsp;MaxR
        </span>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { onMounted }  from 'vue'
import { useIonRouter } from '@ionic/vue'     // ⬅ Ionic router
import logo             from '@/assets/logo/auto-graphic-logo.png.png'

const ionRouter = useIonRouter()

onMounted(() => {
  /* after 3 s, slide-forward to Login */
  setTimeout(() => ionRouter.push('/login', 'forward', 'replace'), 3000)
})
</script>

<style scoped>
.full-background { --background: #663300 }
.welcome-container {
  display: flex; flex-direction: column; justify-content: center;
  align-items: center; height: 90%; color: white;
}
.curve {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 120px;
  background-color: rgb(107, 55, 3);
}
.logo {
  width: 250px; margin-bottom: 20px; animation: fadeIn 1s ease-in-out;
}
  
</style>
