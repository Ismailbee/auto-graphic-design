<template>
  <ion-page>
    <ion-content class="relative overflow-hidden">
      <div class="min-h-screen flex items-center justify-center relative z-10 px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl">
          <!-- Left -->
          <div class="text-white flex justify-center p-8">
            <div class="leading-none text-center md:text-left">
              <span class="text-5xl sm:text-7xl  text-[#663300] font-semibold font-roboto block mt-[-15px]">Create</span>
              <span class="text-5xl sm:text-7xl  text-[#663300] font-semibold font-roboto block mt-[-5px] ">your</span>
              <span class="text-5xl sm:text-7xl text-[#BA6900] font-bold  font-roboto border-b-2 border-[#BA6900]">Account</span>
            </div>
          </div>

          <!-- Right -->
          <div class="relative w-full flex items-center justify-center">
            <!-- <span
              class="font-NICKERB1 absolute text-[600px] text-[#BA6900] top-[-80px] right-[400px] pointer-events-none hidden md:block z-0"
            ></span> -->

            <div
              class="relative flex flex-col items-center justify-center p-6 sm:p-14 bg-white w-full max-w-[400px] rounded-2xl z-10 shadow-xl"
            >
              <img :src="logo" class="logo mb-4 z-10" />
              <h2 class="text-2xl font-bold text-[#663300] mb-6 z-10">Sign Up</h2>

             <!-- EMAIL -->
              <ion-input
                v-model="email"
                label="Email"
                label-placement="floating"
                type="email"
                fill="solid"
                class="w-full mb-4"
                :helper-text="emailHelper"
                :error-text="emailError"
                :class="inputClasses"
                @ionBlur="touched = true"
                style="--padding-start: 0.75rem"  
              />

              <!-- PASSWORD -->
              <ion-input
                v-model="password"
                placeholder="Password:"
                type="password"
                fill="solid"
                class="w-full mb-6 "
                style="--padding-start: 0.75rem">
                <ion-input-password-toggle slot="end"></ion-input-password-toggle>
              </ion-input>

              <ion-button
                expand="block"
                @click="signupUser"
                class="w-full text-white font-semibold"
                style="--background: #663300"
              >
                Sign up
              </ion-button>

              <div class="mt-4 text-[#663300] text-center">
                Already have an account?
                <span
                  class="underline text-yellow-600 ml-1 cursor-pointer"
                  @click="goToLogin"
                >
                  Login
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useIonRouter }    from '@ionic/vue'
import logo                from '@/assets/logo/auto-graphic-logo.png.png'

/* ── state ───────────────────────────────────────────── */
const email    = ref('')
const password = ref('')

/* ── router ──────────────────────────────────────────── */
const ionRouter = useIonRouter()

function signupUser () {
  console.log('Signing up with', email.value, password.value)
  ionRouter.push('/login', 'back')        // go back to Login with slide-back animation
}

function goToLogin () {
  ionRouter.push('/login', 'back')
}

/* ── debug ───────────────────────────────────────────── */
onMounted(() => console.log('✅ Sign-Up page mounted!'))
</script>

<style>
ion-content {
  --background: #F3E6BA;
}
.logo {
  width: 90px;
}
</style>
