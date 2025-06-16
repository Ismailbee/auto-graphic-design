<template>
  <ion-page>
    <ion-content class="bg-[#ebd793]">
      <div class="min-h-screen flex items-center justify-center">
        <div class="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl  ">
          
          <!-- Left Section -->
          <div class=" text-white flex  justify-center p-8 ">
             <div class="leading-none  "> 
              <span class="text-8xl font-kenyan text-[#663300] block mt-[-15px]">Welcome</span>
              <span class="text-8xl font-kenyan text-[#663300] block mt-[-20px] max-h-[90px] ">to Smart</span>
                <span class="text-8xl text-[#BA6900] font-NICKERB1 border-b-[2px] border-[#BA6900]">Graphic</span>
            </div>
          </div>

          <!-- Right Section -->
          <div class="flex flex-col items-center justify-center p-14 bg-white h-[550px] w-[400px] rounded-2xl">
            <h2 class="text-2xl font-bold text-[#663300] mb-6">Login</h2>

            <ion-input
              label="Email"
              label-placement="floating"
              type="email"
              v-model="email"
              class="w-full max-w-sm mb-4 bg-gray-100 rounded-md px-3 py-2"
            ></ion-input>

            <ion-input
              label="Password"
              label-placement="floating"
              type="password"
              v-model="password"
              class="w-full max-w-sm mb-6 bg-gray-100 rounded-md px-3 py-2"
            ></ion-input>

            <ion-button
              expand="block"
              @click="loginUser"
              class="w-full max-w-sm bg-[#f0b400] text-white font-semibold"
            >
              Login
            </ion-button>

            <div class="mt-4 text-[#663300]">
              Don’t have an account?
              <router-link to="/signup" class="underline text-yellow-600 ml-1">Sign up</router-link>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')

function loginUser() {
  console.log('Logging in with', email.value, password.value)
  // Your login logic here
}
</script>

<style >
ion-content{
--background : #F3E6BA;
} 
</style>
