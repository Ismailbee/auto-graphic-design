<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Register</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" :fullscreen="true">
      <div class="register-container">
        <h2>Create an Account</h2>

        <ion-input
          v-model="email"
          label="Email"
          label-placement="floating"
          type="email"
          placeholder="you@example.com"
        ></ion-input>

        <ion-input
          v-model="password"
          label="Password"
          label-placement="floating"
          type="password"
          placeholder="Create a password"
        ></ion-input>

        <ion-button expand="block" @click="registerUser">Register</ion-button>

        <p class="login-text">
          Already have an account?
          <a @click="goToLogin">Login here</a>
        </p>

        <ion-text color="danger" v-if="errorMessage">
          <p>{{ errorMessage }}</p>
        </ion-text>
      </div>
    </ion-content>
  </ion-page>
</template>


<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export default defineComponent({
  name: 'RegisterPage',
  setup() {
    const email = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const router = useRouter()

    const registerUser = async () => {
      try {
        await createUserWithEmailAndPassword(auth, email.value, password.value)
        router.push('/home')
      } catch (error) {
        errorMessage.value = error.message
      }
    }

    const goToLogin = () => {
      router.push('/login')
    }

    return {
      email,
      password,
      errorMessage,
      registerUser,
      goToLogin,
    }
  }
})
</script>
