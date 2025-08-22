<template>
  <ion-page class="welcome-page">
    <ion-content class="ion-text-center ion-padding full-background flex flex-col items-center justify-center relative">

      <!-- Logo & tagline -->
      <div class="welcome-container">
        <img :src="logo" class="logo" alt="Golden Printer Logo" />
        <h1 class="welcome-title">Welcome to auto graphic design</h1>
        <p class="welcome-tagline">
          Your all-in-one platform for audio, graphics, and design.<br>
          Create, collaborate, and bring your ideas to life!
        </p>
      </div>

      <!-- Animated loader -->
      <div class="loader-container">
        <ion-spinner name="crescent" color="light"></ion-spinner>
        <span class="loading-text">Loading...</span>
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
import { onMounted } from 'vue'
import { useIonRouter } from '@ionic/vue'
import logo from '@/assets/logo/auto-graphic-logo.png.png'

const ionRouter = useIonRouter()

 onMounted(() => {
   setTimeout(() => ionRouter.push('/login', 'forward', 'replace'), 2500)
 })
</script>

<style scoped>
.full-background { 
  --background: linear-gradient(135deg, #663300 0%, #BA6900 100%);
  min-height: 100vh;
}
.welcome-container {
  display: flex; flex-direction: column; justify-content: center;
  align-items: center; height: 70vh; color: white;
}
.logo {
  width: 180px; margin-bottom: 18px; animation: fadeIn 1s ease-in-out;
  border-radius: 50%; box-shadow: 0 4px 24px 0 #ba690055;
}
.welcome-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
  color: #fff;
  text-shadow: 0 2px 8px #50280055;
}
.welcome-tagline {
  font-size: 1.1rem;
  color: #ffe6c7;
  margin-bottom: 2rem;
  line-height: 1.5;
  text-shadow: 0 1px 4px #50280033;
}
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.5rem;
}
.loading-text {
  color: #fff;
  margin-top: 0.5rem;
  font-size: 1rem;
  letter-spacing: 0.05em;
  opacity: 0.8;
}
.curve {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 120px;
  background-color: rgb(107, 55, 3);
  border-top-left-radius: 80px 40px;
  border-top-right-radius: 80px 40px;
  box-shadow: 0 -8px 32px 0 #50280033;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(40px);}
  to   { opacity: 1; transform: translateY(0);}
}
</style>
