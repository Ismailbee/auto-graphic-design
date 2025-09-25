<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Payment Successful</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="success-container">
        <div class="success-content bg-white mx-4 my-8 p-8 rounded-lg shadow-md text-center">
          <!-- Success Animation -->
          <div class="success-icon mb-6">
            <div class="checkmark-circle">
              <ion-icon :icon="checkmarkCircleOutline" class="text-6xl text-green-500"></ion-icon>
            </div>
          </div>

          <!-- Success Message -->
          <h1 class="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p class="text-gray-600 mb-6">Your transaction has been completed successfully.</p>

          <!-- Transaction Details -->
          <div class="transaction-details bg-gray-50 p-6 rounded-lg mb-6">
            <h2 class="text-lg font-semibold mb-4">Transaction Details</h2>
            
            <div class="details-grid space-y-3">
              <div class="detail-row flex justify-between">
                <span class="text-gray-600">Reference Number:</span>
                <span class="font-semibold">{{ transactionReference }}</span>
              </div>
              
              <div class="detail-row flex justify-between">
                <span class="text-gray-600">Amount Paid:</span>
                <span class="font-bold text-green-600">{{ formatCurrency(paidAmount) }}</span>
              </div>
              
              <div class="detail-row flex justify-between">
                <span class="text-gray-600">Date & Time:</span>
                <span class="font-semibold">{{ formatDateTime(new Date()) }}</span>
              </div>
              
              <div class="detail-row flex justify-between">
                <span class="text-gray-600">Payment Method:</span>
                <span class="font-semibold">{{ paymentMethod }}</span>
              </div>
              
              <div class="detail-row flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span class="font-semibold text-green-600 flex items-center gap-1">
                  <ion-icon :icon="checkmarkOutline" class="text-sm"></ion-icon>
                  Completed
                </span>
              </div>
            </div>
          </div>

          <!-- Next Steps -->
          <div class="next-steps bg-blue-50 p-6 rounded-lg mb-6">
            <h3 class="font-semibold text-blue-800 mb-3">What happens next?</h3>
            <ul class="text-sm text-blue-700 space-y-2 text-left">
              <li class="flex items-start gap-2">
                <ion-icon :icon="checkmarkOutline" class="text-blue-600 mt-0.5 flex-shrink-0"></ion-icon>
                <span>You will receive a confirmation email shortly</span>
              </li>
              <li class="flex items-start gap-2">
                <ion-icon :icon="checkmarkOutline" class="text-blue-600 mt-0.5 flex-shrink-0"></ion-icon>
                <span>Your service will be activated within 5 minutes</span>
              </li>
              <li class="flex items-start gap-2">
                <ion-icon :icon="checkmarkOutline" class="text-blue-600 mt-0.5 flex-shrink-0"></ion-icon>
                <span>Check your transaction history for details</span>
              </li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons space-y-3">
            <ion-button 
              expand="block" 
              @click="downloadReceipt"
              fill="outline"
              class="mb-3"
            >
              <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
              Download Receipt
            </ion-button>

            <div class="button-row grid grid-cols-2 gap-3">
              <ion-button 
                expand="block" 
                fill="outline"
                @click="goToTransactionHistory"
              >
                View History
              </ion-button>
              
              <ion-button 
                expand="block" 
                @click="makeAnotherPayment"
                color="primary"
              >
                Pay Again
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
          <h3 class="text-lg font-semibold mb-3 text-center">Need Help?</h3>
          <p class="text-gray-600 text-center text-sm mb-4">
            If you have any questions about this transaction, our support team is here to help.
          </p>
          
          <div class="support-actions grid grid-cols-2 gap-3">
            <ion-button fill="outline" size="small" @click="contactSupport">
              <ion-icon :icon="chatbubbleOutline" slot="start"></ion-icon>
              Live Chat
            </ion-button>
            
            <ion-button fill="outline" size="small" @click="sendEmail">
              <ion-icon :icon="mailOutline" slot="start"></ion-icon>
              Email Us
            </ion-button>
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
  checkmarkCircleOutline, checkmarkOutline, downloadOutline, homeOutline,
  chatbubbleOutline, mailOutline
} from 'ionicons/icons'

const router = useRouter()
const route = useRoute()

// Reactive state
const transactionReference = ref('')
const paidAmount = ref(0)
const paymentMethod = ref('Card Payment')

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDateTime = (date) => {
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const downloadReceipt = () => {
  // Generate and download receipt
  const receiptData = {
    reference: transactionReference.value,
    amount: paidAmount.value,
    date: new Date().toISOString(),
    method: paymentMethod.value,
    status: 'Completed'
  }
  
  const receiptText = `
PAYMENT RECEIPT
================

Reference: ${receiptData.reference}
Amount: ${formatCurrency(receiptData.amount)}
Date: ${formatDateTime(new Date(receiptData.date))}
Method: ${receiptData.method}
Status: ${receiptData.status}

Thank you for your payment!
  `.trim()
  
  const blob = new Blob([receiptText], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `receipt-${receiptData.reference}.txt`
  link.click()
  window.URL.revokeObjectURL(url)
}

const goToTransactionHistory = () => {
  router.push('/recharge') // Assuming transaction history is on recharge page
}

const makeAnotherPayment = () => {
  router.push('/recharge')
}

const goHome = () => {
  router.push('/home')
}

const contactSupport = () => {
  // Open live chat or navigate to support
  alert('Live chat feature coming soon!')
}

const sendEmail = () => {
  // Open email client
  window.location.href = 'mailto:support@example.com?subject=Payment Support&body=Reference: ' + transactionReference.value
}

onMounted(() => {
  // Get transaction details from query params
  transactionReference.value = route.query.reference || 'TXN' + Date.now().toString().slice(-6)
  paidAmount.value = parseInt(route.query.amount) || 5000
  
  // Celebrate success with a small delay for better UX
  setTimeout(() => {
    // Could add confetti animation here
  }, 500)
})
</script>

<style scoped>
.success-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.checkmark-circle {
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.detail-row {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.success-content {
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

.next-steps ul {
  list-style: none;
  padding: 0;
}

.support-section {
  border-top: 3px solid #10b981;
}
</style>