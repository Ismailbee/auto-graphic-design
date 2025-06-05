<template>
  <ion-page>
    <ion-content class="login-content">
      <!-- Top decorative section -->
      <div class="header-section">
        <div class="logo-container">
          <img src="../logoauto.png" alt="App Logo" class="logo-image" />
          <h1 class="app-title">Welcome to Auto Graphic Design!</h1>
        </div>
      </div>

      <!-- Login card -->
      <div class="login-card">
        <p class="login-subtitle">LOGIN</p>

        <form @submit.prevent="handleLogin">
          <ion-item class="form-item" lines="none">
            <ion-input
              type="email"
              v-model="email"
              label="Email"
              label-placement="floating"
              placeholder="Enter your email"
              required
            ></ion-input>
          </ion-item>

          <ion-item class="form-item" lines="none">
            <ion-input
              type="password"
              v-model="password"
              label="Password"
              label-placement="floating"
              placeholder="Enter your password"
              required
            >
              <ion-input-password-toggle slot="end"></ion-input-password-toggle>
            </ion-input>
          </ion-item>

          <div class="forgot-password">
            <ion-button fill="clear" size="small" @click="handleForgotPassword">
              Forgot Password?
            </ion-button>
          </div>

          <ion-button 
            expand="block" 
            class="login-button" 
            type="submit"
            :disabled="!isFormValid"
          >
            Login
          </ion-button>

          <!-- Social login divider -->
          <div class="social-divider">
            <div class="divider-line"></div>
            <span class="divider-text">or login with</span>
            <div class="divider-line"></div>
          </div>

          <!-- Social login buttons -->
          <div class="social-buttons">
            <ion-button fill="clear" @click="socialLogin('facebook')">
              <ion-icon :icon="logoFacebook" color="primary"></ion-icon>
            </ion-button>
            <ion-button fill="clear" @click="socialLogin('google')">
              <ion-icon :icon="logoGoogle" color="danger"></ion-icon>
            </ion-button>
            <ion-button fill="clear" @click="socialLogin('apple')">
              <ion-icon :icon="logoApple"></ion-icon>
            </ion-button>
          </div>

          <!-- Sign up link -->
          <div class="signup-link">
            <p>Don't have an account?</p>
            <ion-button fill="clear" @click="navigateToSignup">
              Sign Up
            </ion-button>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonContent, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonIcon,
  IonInputPasswordToggle,
  toastController
} from '@ionic/vue';
import { 
  logoFacebook, 
  logoGoogle, 
  logoApple 
} from 'ionicons/icons';

const router = useRouter();
const email = ref('');
const password = ref('');

const isFormValid = computed(() => {
  return email.value && password.value;
});

const handleLogin = async () => {
  if (!isFormValid.value) {
    const toast = await toastController.create({
      message: 'Please enter both email and password',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  // Add your authentication logic here
  console.log('Logging in with:', email.value);
  router.push('/home');
};

const handleForgotPassword = () => {
  router.push('/forgot-password');
};

const navigateToSignup = () => {
  router.push('/signup');
};

const socialLogin = (provider) => {
  console.log(`Logging in with ${provider}`);
  // Implement social login logic
};
</script>

<style scoped>
.login-content {
  --background: linear-gradient(135deg, var(--ion-color-teal-600) 0%, var(--ion-color-teal-400) 100%);
  padding: 0;
}

.header-section {
  height: 50vh;
  background-color: #663300;
  border-bottom-left-radius: 48px;
  border-bottom-right-radius: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.logo-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.app-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-top: 16px;
  padding: 0 20px;
}

.login-card {
  position: absolute;
  top: 55%;
  width: 90%;
  left: 5%;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.login-subtitle {
  color: var(--ion-color-medium);
  margin-bottom: 24px;
  font-size: 0.9rem;
}

.form-item {
  --background: var(--ion-color-light);
  border-radius: 12px;
  margin-bottom: 16px;
}

.forgot-password {
  text-align: right;
  margin-bottom: 24px;
}

.login-button {
  --background: var(--ion-color-teal-600);
  --background-activated: var(--ion-color-teal-800);
  margin-bottom: 24px;
}

.social-divider {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.divider-line {
  flex-grow: 1;
  height: 1px;
  background-color: var(--ion-color-medium-shade);
}

.divider-text {
  padding: 0 12px;
  color: var(--ion-color-medium);
  font-size: 0.8rem;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.signup-link {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

@media (prefers-color-scheme: dark) {
  .login-card {
    background: var(--ion-color-step-50);
  }
  
  .form-item {
    --background: var(--ion-color-step-100);
  }
}
</style>