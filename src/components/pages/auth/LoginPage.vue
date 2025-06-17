<template>
  <ion-page>
    <ion-content class="relative overflow-hidden">
      <div class="min-h-screen flex items-center justify-center relative z-10 px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl">

          <!-- ❶ Left headline -->
          <div class="text-white flex justify-center p-8">
            <div class="text-center md:text-left">
              <span class="text-5xl sm:text-7xl font-semibold text-[#663300] font-roboto block -mt-4">Welcome</span>
              <span class="text-5xl sm:text-7xl font-semibold text-[#663300] font-roboto block -mt-1">to Smart</span>
              <span class="text-5xl sm:text-8xl font-bold text-[#BA6900] font-roboto border-b-2 border-[#BA6900]">Graphic</span>
            </div>
          </div>

          <!-- ❷ Right card -->
          <div class="relative w-full flex items-center justify-center">
            <div class="relative flex flex-col items-center justify-center p-6 sm:p-14 bg-white w-full max-w-[400px] rounded-2xl z-10 shadow-xl">

              <img :src="logo" class="logo mb-4" />
              <h2 class="text-2xl font-bold text-[#663300] mb-6">Login</h2>

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

              <!-- LOGIN BUTTON -->
              <ion-button
                expand="block"
                class="w-full text-white font-semibold"
                style="--background: #663300"
                @click="loginUser"
              >
                Login
              </ion-button>

              <!-- Socials -->
              <div class="mt-4 text-center z-10">
                <div class="flex justify-center items-center gap-2 mb-4">
                  <div class="bg-[#bab9b9] h-[1px] w-[40px]"></div>
                  <span class="text-[#424141]">continue with</span>
                  <div class="bg-[#bab9b9] h-[1px] w-[40px]"></div>
                </div>

                <div class="flex gap-6 justify-center items-center">
                  <ion-icon
                    name="logo-google"
                    class="text-2xl text-[#DB4437] cursor-pointer"
                    @click="googleLogin"
                  ></ion-icon>

                  <ion-icon
                    name="logo-facebook"
                    class="text-2xl text-[#1877F2] cursor-pointer"
                    @click="facebookLogin"
                  ></ion-icon>
                </div>
              </div>

              <div class="mt-4 text-[#663300] text-center">
                Don’t have an account?
                <span @click="goToSignup" class="underline text-yellow-600 ml-1 cursor-pointer">
                  Sign up
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
import { ref, computed } from 'vue'
import { useIonRouter } from '@ionic/vue'
import logo from '@/assets/logo/auto-graphic-logo.png.png'

const email     = ref('')
const password  = ref('')
const touched   = ref(false)
const ionRouter = useIonRouter()

// ✅ Gmail-specific validation
const isValidEmail = computed(() => {
  const value = email.value.trim()
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
    value.includes('@') &&
    value.endsWith('@gmail.com')
  )
})

const emailHelper = computed(() =>
  touched.value ? '' : 'Enter a valid Gmail (e.g., user@gmail.com)'
)

const emailError = computed(() => {
  const value = email.value.trim()
  if (!touched.value) return ''
  if (!value.includes('@')) return 'Missing @ symbol'
  if (!value.endsWith('@gmail.com')) return 'Must be a Gmail address'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format'
  return ''
})

const inputClasses = computed(() => ({
  'ion-valid'  : touched.value && isValidEmail.value,
  'ion-invalid': touched.value && !isValidEmail.value,
  'ion-touched': touched.value
}))

function loginUser () {
  touched.value = true
  if (!isValidEmail.value || !password.value.trim()) {
    alert('Please enter a valid Gmail and password.')
    return
  }
  console.log('Logging in with', email.value, password.value)
  // 🔐 Add Firebase login logic here
}

function goToSignup () {
  ionRouter.push('/signup', 'forward')
}

// 🔐 Placeholder Google Login – will integrate next
function googleLogin () {
  alert('Google Sign-in will open here.')
  // ✅ Next step: integrate Firebase Google Auth
}

function facebookLogin () {
  alert('Facebook login not yet implemented.')
}
</script>

<style scoped>
ion-content { --background: #F3E6BA }
.logo       { width: 90px }
</style>
