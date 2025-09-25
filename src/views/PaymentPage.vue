<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/recharge"></ion-back-button>
        </ion-buttons>
        <ion-title>Payment</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="payment-container">
        <!-- Header Section -->
        <div class="header-section bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 mb-6">
          <div class="flex items-center gap-3 mb-2">
            <ion-icon :icon="cardOutline" class="text-3xl"></ion-icon>
            <h1 class="text-2xl font-bold">Secure Payment</h1>
          </div>
          <p class="opacity-90">Complete your transaction securely</p>
        </div>

        <!-- Payment Summary -->
        <div class="payment-summary bg-white mx-4 mb-6 p-6 rounded-lg shadow-md">
          <h2 class="text-lg font-bold mb-4">Payment Summary</h2>
          <div class="summary-details space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Description:</span>
              <span class="font-semibold">{{ paymentDescription }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Amount:</span>
              <span class="font-bold text-xl text-green-600">{{ formatCurrency(paymentAmount) }}</span>
            </div>
            <div class="border-t pt-3">
              <div class="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span class="text-green-600">{{ formatCurrency(paymentAmount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="payment-methods bg-white mx-4 mb-6 p-6 rounded-lg shadow-md">
          <h2 class="text-lg font-bold mb-4">Select Payment Method</h2>
          
          <div class="payment-options space-y-3">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="payment-option"
              :class="{ 'active': selectedMethod === method.id }"
              @click="selectPaymentMethod(method.id)"
            >
              <div class="flex items-center gap-3">
                <ion-icon :icon="getMethodIcon(method.id)" class="text-2xl"></ion-icon>
                <div>
                  <div class="font-semibold">{{ method.name }}</div>
                  <div class="text-sm text-gray-600">{{ method.types.join(', ') }}</div>
                </div>
              </div>
              <ion-radio 
                :value="method.id" 
                v-model="selectedMethod"
              ></ion-radio>
            </div>
          </div>
        </div>

        <!-- Payment Details Form -->
        <div class="payment-form bg-white mx-4 mb-6 p-6 rounded-lg shadow-md" v-if="selectedMethod">
          <h2 class="text-lg font-bold mb-4">Payment Details</h2>
          
          <form @submit.prevent="processPayment">
            <!-- Card Details -->
            <div class="card-details space-y-4">
              <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <ion-input
                  v-model="cardDetails.number"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  @ionInput="formatCardNumber"
                  class="card-input"
                  required
                ></ion-input>
                <div class="supported-cards flex gap-2 mt-2">
                  <img v-for="card in supportedCards" :key="card" 
                       :src="getCardIcon(card)" :alt="card" 
                       class="w-8 h-5 object-contain" />
                </div>
              </div>

              <div class="form-row grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <ion-input
                    v-model="cardDetails.expiry"
                    type="text"
                    placeholder="MM/YY"
                    maxlength="5"
                    @ionInput="formatExpiry"
                    class="card-input"
                    required
                  ></ion-input>
                </div>

                <div class="form-group">
                  <label class="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <ion-input
                    v-model="cardDetails.cvv"
                    type="password"
                    placeholder="123"
                    maxlength="4"
                    class="card-input"
                    required
                  ></ion-input>
                </div>
              </div>

              <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                <ion-input
                  v-model="cardDetails.name"
                  type="text"
                  placeholder="John Doe"
                  class="card-input"
                  required
                ></ion-input>
              </div>
            </div>

            <!-- Security Notice -->
            <div class="security-notice bg-blue-50 p-4 rounded-lg mt-6 mb-6">
              <div class="flex items-start gap-3">
                <ion-icon :icon="shieldCheckmarkOutline" class="text-blue-600 text-xl mt-1"></ion-icon>
                <div>
                  <h4 class="font-semibold text-blue-800 mb-1">Secure Payment</h4>
                  <p class="text-sm text-blue-700">
                    Your payment information is encrypted and secure. We don't store your card details.
                  </p>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <ion-button 
              type="submit"
              expand="block"
              :disabled="!canProceed || processing"
              class="payment-btn"
              size="large"
            >
              <ion-spinner v-if="processing" slot="start"></ion-spinner>
              {{ processing ? `Processing...` : `Pay ${formatCurrency(paymentAmount)}` }}
            </ion-button>
          </form>
        </div>

        <!-- Recent Transactions -->
        <div class="recent-transactions mx-4 mb-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-lg font-bold mb-4">Recent Transactions</h2>
            
            <div class="transactions-list space-y-3">
              <div 
                v-for="transaction in recentTransactions" 
                :key="transaction.id"
                class="transaction-item p-3 border border-gray-200 rounded-lg"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-semibold text-sm">{{ transaction.description }}</div>
                    <div class="text-xs text-gray-500">{{ formatDate(transaction.date) }}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold">{{ formatCurrency(transaction.amount) }}</div>
                    <div class="text-xs" :class="getStatusColor(transaction.status)">
                      {{ capitalizeFirst(transaction.status) }}
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="recentTransactions.length === 0" class="text-center py-6">
                <ion-icon :icon="receiptOutline" class="text-3xl text-gray-300 mb-2"></ion-icon>
                <p class="text-gray-500 text-sm">No recent transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonInput, IonSpinner, IonBackButton, IonRadio
} from '@ionic/vue'
import { 
  cardOutline, shieldCheckmarkOutline, receiptOutline
} from 'ionicons/icons'
import { usePaymentsStore } from '../stores/payments.js'

const router = useRouter()
const route = useRoute()
const paymentsStore = usePaymentsStore()

// Reactive state
const selectedMethod = ref('')
const processing = ref(false)
const cardDetails = ref({
  number: '',
  expiry: '',
  cvv: '',
  name: ''
})

// Get payment details from query params or store
const paymentAmount = ref(parseInt(route.query.amount) || 5000)
const paymentDescription = ref(route.query.description || 'Payment')

// Computed properties
const paymentMethods = computed(() => paymentsStore.paymentMethods)
const supportedCards = computed(() => paymentsStore.supportedCards)
const recentTransactions = computed(() => paymentsStore.recentTransactions.slice(0, 5))

const canProceed = computed(() => {
  return selectedMethod.value && 
         cardDetails.value.number.length >= 16 &&
         cardDetails.value.expiry.length === 5 &&
         cardDetails.value.cvv.length >= 3 &&
         cardDetails.value.name.trim().length > 0
})

// Methods
const selectPaymentMethod = (methodId) => {
  selectedMethod.value = methodId
  paymentsStore.setPaymentMethod(methodId)
}

const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  value = value.replace(/(\d{4})(?=\d)/g, '$1 ')
  cardDetails.value.number = value
}

const formatExpiry = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  cardDetails.value.expiry = value
}

const processPayment = async () => {
  if (!canProceed.value) return
  
  processing.value = true
  
  try {
    paymentsStore.setPaymentAmount(paymentAmount.value, 'NGN', paymentDescription.value)
    paymentsStore.setCardDetails(cardDetails.value)
    
    const result = await paymentsStore.processPayment()
    
    // Redirect to success page
    router.push({
      path: '/payment/success',
      query: {
        reference: result.transaction.reference,
        amount: result.transaction.amount
      }
    })
  } catch (error) {
    // Redirect to failure page
    router.push({
      path: '/payment/failure',
      query: {
        error: error.message || 'Payment failed'
      }
    })
  } finally {
    processing.value = false
  }
}

const getMethodIcon = (methodId) => {
  const icons = {
    'stripe': cardOutline,
    'paystack': cardOutline
  }
  return icons[methodId] || cardOutline
}

const getCardIcon = (cardType) => {
  const icons = {
    'Visa': '/images/visa-icon.png',
    'Mastercard': '/images/mastercard-icon.png',
    'Verve': '/images/verve-icon.png'
  }
  return icons[cardType] || '/images/card-icon.png'
}

const formatCurrency = (amount) => {
  return paymentsStore.formatCurrency(amount)
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status) => {
  const colors = {
    'completed': 'text-green-600',
    'pending': 'text-yellow-600',
    'failed': 'text-red-600'
  }
  return colors[status] || 'text-gray-600'
}

const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

onMounted(() => {
  // Set payment details in store
  paymentsStore.setPaymentAmount(paymentAmount.value, 'NGN', paymentDescription.value)
  
  // Select first payment method by default
  if (paymentMethods.value.length > 0) {
    selectPaymentMethod(paymentMethods.value[0].id)
  }
})
</script>

<style scoped>
.payment-container {
  max-width: 600px;
  margin: 0 auto;
}

.payment-option {
  @apply p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-300;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.payment-option.active {
  @apply border-blue-500 bg-blue-50;
}

.card-input {
  @apply w-full p-3 border border-gray-300 rounded-lg;
}

.supported-cards {
  opacity: 0.7;
}

.header-section {
  border-radius: 0 0 20px 20px;
}

.security-notice {
  border-left: 4px solid #3b82f6;
}

.transaction-item {
  transition: transform 0.2s ease;
}

.transaction-item:hover {
  transform: translateY(-1px);
}
</style>