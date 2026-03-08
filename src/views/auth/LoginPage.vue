<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="login-container">
        <!-- Header Section with Animation -->
        <div class="header-section animate-fade-down">
          <div class="logo-bg">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>
          <h1>Welcome Back</h1>
          <p class="subtitle">Sign in to continue creating</p>
        </div>

        <!-- Form Section -->
        <div class="form-section animate-fade-up">
          <div class="input-group">
            <ion-item lines="none" class="custom-input">
              <ion-icon :icon="mailOutline" slot="start" class="input-icon"></ion-icon>
              <ion-input 
                v-model="email" 
                type="email" 
                placeholder="Email Address"
                required
              ></ion-input>
            </ion-item>
          </div>

          <div class="input-group">
            <ion-item lines="none" class="custom-input">
              <ion-icon :icon="lockClosedOutline" slot="start" class="input-icon"></ion-icon>
              <ion-input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="Password"
                required
              ></ion-input>
              <ion-icon 
                :icon="showPassword ? eyeOffOutline : eyeOutline" 
                slot="end" 
                class="password-toggle"
                @click="togglePassword"
              ></ion-icon>
            </ion-item>
          </div>

          <div class="forgot-password">
            <a @click.prevent="handleForgotPassword" href="#">Forgot Password?</a>
          </div>

          <ion-button expand="block" class="signin-btn" @click="handleLogin" :disabled="isLoading">
            <span v-if="!isLoading">Sign In</span>
            <ion-spinner v-else name="crescent"></ion-spinner>
          </ion-button>

          <div class="divider">
            <span>Or continue with</span>
          </div>

          <ion-button expand="block" class="google-btn" @click="handleGoogleLogin" :disabled="isLoading">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="google-icon" />
            <span>Google</span>
          </ion-button>

          <div class="register-link">
            <p>Don't have an account? <a @click.prevent="goToRegister" href="#">Create New Account</a></p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { 
  IonPage, 
  IonContent, 
  IonInput, 
  IonButton, 
  IonItem, 
  IonIcon,
  IonSpinner,
  toastController,
  alertController
} from '@ionic/vue';
import { 
  eyeOutline, 
  eyeOffOutline, 
  mailOutline, 
  lockClosedOutline 
} from 'ionicons/icons';

const router = useRouter();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

// Redirect if already authenticated
const checkAuth = () => {
  if (isAuthenticated.value) {
    console.log('User already authenticated, redirecting to home...');
    router.replace('/home');
  }
};

// Check on mount
onMounted(() => {
  checkAuth();
});

// Watch for auth state changes
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    console.log('User became authenticated, redirecting to home...');
    router.replace('/home');
  }
});

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const goToRegister = () => {
  router.push('/register');
};

const handleLogin = async () => {
  if (!email.value || !password.value) {
    const toast = await toastController.create({
      message: 'Please enter your email and password',
      duration: 2000,
      color: 'warning',
      position: 'top',
      cssClass: 'custom-toast'
    });
    await toast.present();
    return;
  }

  isLoading.value = true;
  try {
    await authStore.loginUser({
      email: email.value,
      password: password.value
    });
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Login failed. Please check your credentials.',
      duration: 3000,
      color: 'danger',
      position: 'top',
      cssClass: 'custom-toast'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = async () => {
  isLoading.value = true;
  try {
    await authStore.loginWithGoogle();
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Google login failed',
      duration: 3000,
      color: 'danger',
      position: 'top',
      cssClass: 'custom-toast'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = async () => {
  const alert = await alertController.create({
    header: 'Reset Password',
    message: 'Enter your email address to receive a password reset link.',
    inputs: [
      {
        name: 'email',
        type: 'email',
        placeholder: 'Email Address',
        value: email.value
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Send Reset Link',
        handler: async (data) => {
          if (!data.email) {
            const toast = await toastController.create({
              message: 'Please enter your email address',
              duration: 2000,
              color: 'warning',
              position: 'top'
            });
            await toast.present();
            return false;
          }
          
          try {
            await authStore.resetPassword(data.email);
            const toast = await toastController.create({
              message: 'Password reset link sent! Check your email.',
              duration: 3000,
              color: 'success',
              position: 'top'
            });
            await toast.present();
          } catch (error: any) {
            const toast = await toastController.create({
              message: error.message || 'Failed to send reset link',
              duration: 3000,
              color: 'danger',
              position: 'top'
            });
            await toast.present();
          }
        }
      }
    ]
  });
  
  await alert.present();
};
</script>

<style scoped>
ion-content {
  --background: #ffffff;
}

.login-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
  justify-content: center;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-bg {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4);
  transform: rotate(-5deg);
  transition: transform 0.3s ease;
}

.logo-bg:hover {
  transform: rotate(0deg) scale(1.05);
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: white;
}

h1 {
  font-size: 32px;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #718096;
  font-size: 16px;
  margin: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  background: #f7fafc;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #edf2f7;
  transition: all 0.3s ease;
}

.input-group:focus-within {
  background: #ffffff;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.custom-input {
  --background: transparent;
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 0;
  --min-height: 60px;
}

.input-icon {
  color: #a0aec0;
  margin-right: 8px;
}

ion-input {
  --padding-top: 20px;
  --padding-bottom: 20px;
  --placeholder-color: #a0aec0;
  --color: #2d3748;
  font-size: 16px;
  font-weight: 500;
}

.password-toggle {
  color: #a0aec0;
  cursor: pointer;
  margin-right: 8px;
}

.forgot-password {
  text-align: right;
}

.forgot-password a {
  color: #667eea;
  font-size: 14px;
  text-decoration: none;
  font-weight: 600;
}

.signin-btn {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --background-hover: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  --background-activated: linear-gradient(135deg, #4c51bf 0%, #553c9a 100%);
  --border-radius: 16px;
  --box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.3);
  margin-top: 10px;
  height: 56px;
  font-weight: 700;
  font-size: 16px;
  text-transform: none;
  letter-spacing: 0.5px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #a0aec0;
  font-size: 14px;
  margin: 10px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 10px;
}

.google-btn {
  --background: #ffffff;
  --background-hover: #f7fafc;
  --background-activated: #edf2f7;
  --color: #2d3748;
  --border-radius: 16px;
  --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --border-width: 1px;
  --border-style: solid;
  --border-color: #e2e8f0;
  height: 56px;
  font-weight: 600;
  font-size: 16px;
  text-transform: none;
  margin-top: 0;
}

.google-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
}

.register-link p {
  color: #718096;
  font-size: 15px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 700;
}

/* Animations */
.animate-fade-down {
  animation: fadeDown 0.8s ease-out;
}

.animate-fade-up {
  animation: fadeUp 0.8s ease-out 0.2s backwards;
}

@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  ion-content {
    --background: #1a202c;
  }
  
  h1 {
    color: #ffffff;
  }
  
  .subtitle {
    color: #a0aec0;
  }
  
  .input-group {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .input-group:focus-within {
    background: #2d3748;
    border-color: #667eea;
  }
  
  ion-input {
    --color: #ffffff;
    --placeholder-color: #718096;
  }
  
  .google-btn {
    --background: #2d3748;
    --background-hover: #4a5568;
    --color: #ffffff;
    --border-color: #4a5568;
  }
}
</style>
