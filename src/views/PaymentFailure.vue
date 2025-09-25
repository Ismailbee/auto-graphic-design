<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Payment Failed</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="failure-container">
        <div class="failure-content bg-white mx-4 my-8 p-8 rounded-lg shadow-md text-center">
          <!-- Failure Icon -->
          <div class="failure-icon mb-6">
            <div class="error-circle">
              <ion-icon :icon="closeCircleOutline" class="text-6xl text-red-500"></ion-icon>
            </div>
          </div>

          <!-- Failure Message -->
          <h1 class="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
          <p class="text-gray-600 mb-6">We couldn't process your payment. Please try again.</p>

          <!-- Error Details -->
          <div class="error-details bg-red-50 p-6 rounded-lg mb-6 border-l-4 border-red-500">
            <h2 class="text-lg font-semibold text-red-800 mb-3">What went wrong?</h2>
            <p class="text-red-700 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- Common Reasons -->
          <div class="common-reasons bg-gray-50 p-6 rounded-lg mb-6">
            <h3 class="font-semibold text-gray-800 mb-3">Common reasons for payment failure:</h3>
            <ul class="text-sm text-gray-700 space-y-2 text-left">
              <li class="flex items-start gap-2">
                <ion-icon :icon="alertCircleOutline" class="text-yellow-600 mt-0.5 flex-shrink-0"></ion-icon>
                <span>Insufficient funds in your account</span>
              </li>
              <li class="flex items-start gap-2">
                <ion-icon :icon="alertCircleOutline" class="text-yellow-600 mt-0.5 flex-shrink-0"></ion-icon>
                <span>Incorrect card details or expired card</span>
              </li>
              <li class="flex items-start gap-2">
                <ion-icon :icon="alertCircleOutline" class="text-yellow-600 mt-0.5 flex-shrink-0"></ion-icon>
                <span>Network connectivity issues</span>
              </li>
              <li class="flex items-start gap-2">
                <ion-icon :icon="alertCircleOutline" class="text-yellow-600 mt-0.5 flex-shrink-0"></ion-icon>
                <span>Bank declined the transaction</span>
              </li>
              <li class="flex items-start gap-2">
                <ion-icon :icon="alertCircleOutline" class="text-yellow-600 mt-0.5 flex-shrink-0"></ion-icon>
                <span>Daily transaction limit exceeded</span>
              </li>
            </ul>
          </div>

          <!-- Retry Options -->
          <div class="retry-options mb-6">
            <h3 class="font-semibold text-gray-800 mb-4">Try these solutions:</h3>
            
            <div class="solutions-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="solution-card bg-blue-50 p-4 rounded-lg border border-blue-200">
                <ion-icon :icon="cardOutline" class="text-2xl text-blue-600 mb-2"></ion-icon>
                <h4 class="font-semibold text-blue-800 mb-1">Check Card Details</h4>
                <p class="text-sm text-blue-700">Verify your card number, expiry date, and CVV</p>
              </div>
              
              <div class="solution-card bg-green-50 p-4 rounded-lg border border-green-200">
                <ion-icon :icon="cashOutline" class="text-2xl text-green-600 mb-2"></ion-icon>
                <h4 class="font-semibold text-green-800 mb-1">Check Balance</h4>
                <p class="text-sm text-green-700">Ensure you have sufficient funds</p>
              </div>
              
              <div class="solution-card bg-purple-50 p-4 rounded-lg border border-purple-200">
                <ion-icon :icon="refreshOutline" class="text-2xl text-purple-600 mb-2"></ion-icon>
                <h4 class="font-semibold text-purple-800 mb-1">Try Different Method</h4>
                <p class="text-sm text-purple-700">Use another payment method</p>
              </div>
              
              <div class="solution-card bg-orange-50 p-4 rounded-lg border border-orange-200">
                <ion-icon :icon="callOutline" class="text-2xl text-orange-600 mb-2"></ion-icon>
                <h4 class="font-semibold text-orange-800 mb-1">Contact Bank</h4>
                <p class="text-sm text-orange-700">Call your bank if issue persists</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons space-y-3">
            <ion-button 
              expand="block" 
              @click="retryPayment"
              color="primary"
              size="large"
            >
              <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
              Try Again
            </ion-button>

            <div class="button-row grid grid-cols-2 gap-3">
              <ion-button 
                expand="block" 
                fill="outline"
                @click="changePage"
              >
                <ion-icon :icon="cardOutline" slot="start"></ion-icon>
                Change Method
              </ion-button>
              
              <ion-button 
                expand="block" 
                fill="outline"
                @click="contactSupport"
              >
                <ion-icon :icon="helpCircleOutline" slot="start"></ion-icon>
                Get Help
              </ion-button>
            </div>

            <ion-button 
              expand="block" 
              fill="clear"
              @click="goHome"
              class="mt-4"
            >
              <ion-icon :icon="homeOutline" slot="start"></ion-icon>
              Back to Home
            </ion-button>
          </div>
        </div>

        <!-- Support Section -->
        <div class="support-section bg-white mx-4 mb-6 p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-3 text-center">Still Having Issues?</h3>
          <p class="text-gray-600 text-center text-sm mb-4">
            Our support team is available 24/7 to help you resolve payment issues.
          </p>
          
          <div class="support-actions grid grid-cols-1 md:grid-cols-3 gap-3">
            <ion-button fill="outline" size="small" @click="openLiveChat">
              <ion-icon :icon="chatbubbleOutline" slot="start"></ion-icon>
              Live Chat
            </ion-button>
            
            <ion-button fill="outline" size="small" @click="callSupport">
              <ion-icon :icon="callOutline" slot="start"></ion-icon>
              Call Us
            </ion-button>
            
            <ion-button fill="outline" size="small" @click="emailSupport">
              <ion-icon :icon="mailOutline" slot="start"></ion-icon>
              Email
            </ion-button>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="faq-section bg-white mx-4 mb-6 p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-4 text-center">Frequently Asked Questions</h3>
          
          <div class="faq-list space-y-4">
            <div class="faq-item">
              <h4 class="font-semibold text-gray-800 mb-2">Why was my payment declined?</h4>
              <p class="text-sm text-gray-600">
                Payments can be declined for various reasons including insufficient funds, incorrect details, or bank security measures.
              </p>
            </div>
            
            <div class="faq-item">
              <h4 class="font-semibold text-gray-800 mb-2">Will I be charged for a failed payment?</h4>
              <p class="text-sm text-gray-600">
                No, you will not be charged for failed payment attempts. Charges only apply when transactions are successful.
              </p>
            </div>
            
            <div class="faq-item">
              <h4 class="font-semibold text-gray-800 mb-2">How long should I wait before retrying?</h4>
              <p class="text-sm text-gray-600">
                You can retry immediately, but if the issue persists, wait 15-30 minutes or contact your bank.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon
} from '@ionic/vue'
import { 
  closeCircleOutline, alertCircleOutline, cardOutline, cashOutline,
  refreshOutline, callOutline, helpCircleOutline, homeOutline,
  chatbubbleOutline, mailOutline
} from 'ionicons/icons'

const router = useRouter()
const route = useRoute()

// Reactive state
const errorMessage = ref('')

// Methods
const retryPayment = () => {
  router.push('/payment')
}

const changePage = () => {
  router.push('/payment')
}

const contactSupport = () => {
  // Open support chat or navigate to support page
  alert('Opening support chat...')
}

const goHome = () => {
  router.push('/home')
}

const openLiveChat = () => {
  alert('Live chat feature coming soon!')
}

const callSupport = () => {
  window.location.href = 'tel:+2341234567890'
}

const emailSupport = () => {
  window.location.href = 'mailto:support@example.com?subject=Payment Failed&body=I need help with a failed payment.'
}

onMounted(() => {
  // Get error message from query params
  errorMessage.value = route.query.error || 'Payment could not be processed at this time. Please try again.'
})
</script>

<style scoped>
.failure-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.error-circle {
  animation: shake 0.5s ease-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.failure-content {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.solution-card {
  text-align: center;
  transition: transform 0.2s ease;
}

.solution-card:hover {
  transform: translateY(-2px);
}

.common-reasons ul {
  list-style: none;
  padding: 0;
}

.faq-item {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.faq-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.support-section {
  border-top: 3px solid #ef4444;
}
</style>