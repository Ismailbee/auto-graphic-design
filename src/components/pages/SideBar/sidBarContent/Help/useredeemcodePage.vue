<template>
  <ion-page>
    <page-header label="Redeem a Code" />

    <ion-content class="ion-padding">
      <div class="flex items-center justify-center h-full">
        <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          
          <ion-icon :icon="giftOutline" class="text-5xl text-primary mb-4"></ion-icon>
          
          <h1 class="text-3xl font-bold text-gray-800">Have a Redeem Code?</h1>
          <p class="text-gray-600 mt-2">
            Enter your code below to claim your reward or unlock special features.
          </p>

          <form @submit.prevent="redeemCode" class="mt-8">
            <ion-item class="custom-input">
              <ion-label position="stacked" class="text-left">Enter Your Code</ion-label>
              <ion-input 
                v-model="code" 
                :class="{'ion-invalid': validation.error, 'ion-valid': validation.success}"
                @ionInput="validateCode"
                placeholder="e.g., PROMO123" 
                required
              ></ion-input>
              <ion-note v-if="validation.message" :color="validation.success ? 'success' : 'danger'">
                {{ validation.message }}
              </ion-note>
            </ion-item>

            <ion-button type="submit" expand="block" color="primary" class="mt-6" :disabled="!code || loading">
              <ion-spinner v-if="loading" name="crescent" class="mr-2"></ion-spinner>
              {{ loading ? 'Redeeming...' : 'Redeem Now' }}
            </ion-button>
          </form>
        </div>
      </div>
    </ion-content>
    <ion-toast
      :is-open="toast.isOpen"
      :message="toast.message"
      :duration="3000"
      :color="toast.color"
      @didDismiss="toast.isOpen = false"
    ></ion-toast>
  </ion-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon,
  IonToast,
  IonNote,
  IonSpinner
} from '@ionic/vue';
import { giftOutline } from 'ionicons/icons';
import pageHeader from '../../../Header/pageHeader.vue';

const router = useRouter();

const code = ref('');
const loading = ref(false);
const validation = reactive({
  error: false,
  success: false,
  message: ''
});
const toast = reactive({
  isOpen: false,
  message: '',
  color: 'dark'
});

const validateCode = () => {
  validation.error = false;
  validation.success = false;
  validation.message = '';
}

const redeemCode = async () => {
  if (!code.value) {
    toast.message = 'Please enter a code.';
    toast.color = 'danger';
    toast.isOpen = true;
    return;
  }

  loading.value = true;

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (code.value.toUpperCase() === 'INVALID') {
    validation.error = true;
    validation.message = 'This code is invalid or has expired.';
    toast.message = 'Failed to redeem code.';
    toast.color = 'danger';
    toast.isOpen = true;
  } else {
    validation.success = true;
    validation.message = 'Code accepted!';
    toast.message = 'Congratulations! Your reward has been applied.';
    toast.color = 'success';
    toast.isOpen = true;
    
    // Reset form and navigate away after success
    setTimeout(() => {
      code.value = '';
      router.back();
    }, 2500);
  }

  loading.value = false;
};
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}

.custom-input {
  --border-radius: 8px;
  --padding-start: 12px;
  --background: #ffffff;
  border: 1px solid #e0e0e0;
}
</style>