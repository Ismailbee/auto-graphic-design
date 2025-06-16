<template>
  <ion-page class="welcome-page">
    <ion-content class="ion-text-center ion-padding full-background">
      <!-- Decorative Circle -->
      

      <div class="welcome-container">
        <img :src="logo" class="logo" />
        <!-- <h1>Auto Graphic Design</h1>
        <p>Create beautiful designs instantly ✨</p> -->
      </div>

      <!-- Curved Shape at the bottom -->
      <div class="curve relative">
        <span class="absolute right-[130px] top-10 text-white border-b border-dashed border-white w-[150px]">
          Powered by MaxR
        </span>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import logo from '@/assets/logo/auto-graphic-logo.png.png'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  setTimeout(() => {
    router.push('/login')
  }, 3000)
})
</script>

<style scoped>
.full-background {
  --background: #663300;
  position: relative;
}

/* Decorative Circle */
.circle {
  position: absolute;
  top: 300px;
  right: 20px;
  width: 300px;
  height: 300px;
  background-color: rgba(122, 65, 3, 0.1); /* Transparent white */
  
  border-radius: 50%;
  
  z-index: 1;
}

.welcome-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 90%;
  color: white;
}

.curve {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background-color: rgb(107, 55, 3); /* lighter brown */
  
  
}

.logo {
  width: 250px;
  margin-bottom: 20px;
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
