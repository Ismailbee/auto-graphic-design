  <template>
    <ion-page>
      <ion-header translucent>
        <ion-toolbar>
          <ion-title>Login</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding" :fullscreen="true">
        <div class="login-container">
          <h2>Welcome Back</h2>

          <ion-input
            v-model="email"
            label="Email"
            label-placement="floating"
            type="email"
            placeholder="Enter your email"
          ></ion-input>

          <ion-input
            v-model="password"
            label="Password"
            label-placement="floating"
            type="password"
            placeholder="Enter your password"
          ></ion-input>

          <ion-button expand="block" @click="loginUser">Login</ion-button>

          <p class="register-text">
            Don't have an account?
            <a @click="goToRegister">Register here</a>
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
import { signInWithEmailAndPassword } from 'firebase/auth'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const email = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const router = useRouter()

    const loginUser = async () => {
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value)
        router.push('/home')
      } catch (error) {
        errorMessage.value = error.message
      }
    }

    const goToRegister = () => {
      router.push('/register')
    }

    return {
      email,
      password,
      errorMessage,
      loginUser,
      goToRegister,
    }
  }
})
</script>

