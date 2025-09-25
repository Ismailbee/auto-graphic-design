<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Airtime & Data Recharge</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="recharge-container">
        <!-- Header Section -->
        <div class="header-section bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 mb-6">
          <div class="flex items-center gap-3 mb-2">
            <ion-icon :icon="phonePortraitOutline" class="text-3xl"></ion-icon>
            <h1 class="text-2xl font-bold">Quick Recharge</h1>
          </div>
          <p class="opacity-90">Top up your phone with airtime and data plans</p>
        </div>

        <!-- Recharge Form -->
        <div class="recharge-form bg-white mx-4 mb-6 p-6 rounded-lg shadow-md">
          <form @submit.prevent="processRecharge">
            <!-- Network Selection -->
            <div class="form-group mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Select Network</label>
              <div class="network-grid grid grid-cols-2 md:grid-cols-4 gap-3">
                <div 
                  v-for="network in networks" 
                  :key="network"
                  class="network-option"
                  :class="{ 'active': selectedNetwork === network }"
                  @click="selectNetwork(network)"
                >
                  <div class="network-logo">
                    <img 
                      :src="getNetworkLogo(network)" 
                      :alt="network"
                      class="w-8 h-8 object-contain"
                    />
                  </div>
                  <span class="text-sm font-medium">{{ network }}</span>
                </div>
              </div>
            </div>

            <!-- Phone Number -->
            <div class="form-group mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <ion-input
                v-model="phoneNumber"
                type="tel"
                placeholder="08012345678"
                maxlength="11"
                class="phone-input"
                @ionInput="validatePhoneNumber"
              ></ion-input>
              <p v-if="phoneError" class="text-red-500 text-sm mt-1">{{ phoneError }}</p>
            </div>

            <!-- Plan Type Selection -->
            <div class="form-group mb-6" v-if="selectedNetwork">
              <label class="block text-sm font-medium text-gray-700 mb-3">Plan Duration</label>
              <div class="plan-type-grid grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  v-for="planType in planTypes" 
                  :key="planType"
                  type="button"
                  class="plan-type-btn"
                  :class="{ 'active': selectedPlanType === planType }"
                  @click="selectPlanType(planType)"
                >
                  {{ capitalizeFirst(planType) }}
                </button>
              </div>
            </div>

            <!-- Plan Selection -->
            <div class="form-group mb-6" v-if="selectedNetwork && selectedPlanType">
              <label class="block text-sm font-medium text-gray-700 mb-3">Select Plan</label>
              <div class="plans-list space-y-3">
                <div 
                  v-for="plan in availablePlans" 
                  :key="plan.name"
                  class="plan-option"
                  :class="{ 'active': selectedPlan?.name === plan.name }"
                  @click="selectPlan(plan)"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-semibold">{{ plan.name }}</div>
                      <div class="text-sm text-gray-600">Valid for {{ plan.validity }}</div>
                    </div>
                    <div class="text-lg font-bold text-green-600">
                      ₦{{ plan.price.toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Amount Display -->
            <div class="amount-display mb-6 p-4 bg-gray-50 rounded-lg" v-if="selectedPlan">
              <div class="flex items-center justify-between">
                <span class="text-gray-700">Amount to Pay:</span>
                <span class="text-2xl font-bold text-green-600">
                  ₦{{ selectedPlan.price.toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- Submit Button -->
            <ion-button 
              type="submit"
              expand="block"
              :disabled="!canProceed || processing"
              class="recharge-btn"
            >
              <ion-spinner v-if="processing" slot="start"></ion-spinner>
              {{ processing ? 'Processing...' : 'Proceed to Payment' }}
            </ion-button>
          </form>
        </div>

        <!-- Transaction History -->
        <div class="transaction-history mx-4 mb-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <ion-icon :icon="timeOutline"></ion-icon>
              Recent Transactions
            </h2>

            <div class="transactions-list space-y-3">
              <div 
                v-for="transaction in recentTransactions" 
                :key="transaction.id"
                class="transaction-item p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="network-badge">
                      <img 
                        :src="getNetworkLogo(transaction.network)" 
                        :alt="transaction.network"
                        class="w-6 h-6 object-contain"
                      />
                    </div>
                    <div>
                      <div class="font-semibold">{{ transaction.plan }}</div>
                      <div class="text-sm text-gray-600">{{ transaction.phone }}</div>
                    </div>
                  </div>
                  
                  <div class="text-right">
                    <div class="font-bold">₦{{ transaction.amount.toLocaleString() }}</div>
                    <div class="text-sm" :class="getStatusColor(transaction.status)">
                      {{ capitalizeFirst(transaction.status) }}
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>{{ formatDate(transaction.date) }}</span>
                  <span>{{ transaction.reference }}</span>
                </div>
              </div>

              <div v-if="recentTransactions.length === 0" class="text-center py-8">
                <ion-icon :icon="receiptOutline" class="text-4xl text-gray-300 mb-2"></ion-icon>
                <p class="text-gray-500">No transactions yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats mx-4 mb-6 grid grid-cols-2 gap-4">
          <div class="stat-card bg-white p-4 rounded-lg shadow-md text-center">
            <ion-icon :icon="cardOutline" class="text-2xl text-blue-600 mb-2"></ion-icon>
            <div class="text-lg font-bold">₦{{ totalSpent.toLocaleString() }}</div>
            <div class="text-sm text-gray-600">Total Spent</div>
          </div>
          
          <div class="stat-card bg-white p-4 rounded-lg shadow-md text-center">
            <ion-icon :icon="checkmarkCircleOutline" class="text-2xl text-green-600 mb-2"></ion-icon>
            <div class="text-lg font-bold">{{ successfulTransactions }}</div>
            <div class="text-sm text-gray-600">Successful</div>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <ion-modal :is-open="showSuccessModal" @didDismiss="closeSuccessModal">
        <div class="success-modal p-6 text-center">
          <ion-icon :icon="checkmarkCircleOutline" class="text-6xl text-green-500 mb-4"></ion-icon>
          <h2 class="text-2xl font-bold mb-2">Recharge Successful!</h2>
          <p class="text-gray-600 mb-4">Your {{ lastTransaction?.plan }} has been activated</p>
          <p class="text-sm text-gray-500 mb-6">Reference: {{ lastTransaction?.reference }}</p>
          <ion-button @click="closeSuccessModal" expand="block">Done</ion-button>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonIcon, IonInput, IonSpinner, IonModal
} from '@ionic/vue'
import { 
  phonePortraitOutline, timeOutline, receiptOutline, cardOutline,
  checkmarkCircleOutline
} from 'ionicons/icons'
import { useRechargeStore } from '../stores/recharge.js'

const router = useRouter()
const rechargeStore = useRechargeStore()

// Reactive state
const selectedNetwork = ref('')
const selectedPlanType = ref('')
const selectedPlan = ref(null)
const phoneNumber = ref('')
const phoneError = ref('')
const processing = ref(false)
const showSuccessModal = ref(false)
const lastTransaction = ref(null)

// Computed properties
const networks = computed(() => rechargeStore.networks)
const planTypes = ['daily', 'weekly', 'monthly', 'yearly']
const recentTransactions = computed(() => rechargeStore.recentTransactions)
const totalSpent = computed(() => rechargeStore.totalSpent)
const successfulTransactions = computed(() => rechargeStore.successfulTransactions)

const availablePlans = computed(() => {
  if (!selectedNetwork.value || !selectedPlanType.value) return []
  return rechargeStore.getPlansForNetwork(selectedNetwork.value, selectedPlanType.value)
})

const canProceed = computed(() => {
  return selectedNetwork.value && 
         selectedPlan.value && 
         phoneNumber.value && 
         !phoneError.value
})

// Methods
const selectNetwork = (network) => {
  selectedNetwork.value = network
  selectedPlanType.value = ''
  selectedPlan.value = null
  rechargeStore.setRechargeNetwork(network)
}

const selectPlanType = (planType) => {
  selectedPlanType.value = planType
  selectedPlan.value = null
  rechargeStore.setPlanType(planType)
}

const selectPlan = (plan) => {
  selectedPlan.value = plan
  rechargeStore.selectPlan(plan)
}

const validatePhoneNumber = () => {
  const phone = phoneNumber.value.replace(/\D/g, '') // Remove non-digits
  
  if (!phone) {
    phoneError.value = ''
    return
  }
  
  if (phone.length !== 11) {
    phoneError.value = 'Phone number must be 11 digits'
    return
  }
  
  if (!phone.startsWith('0')) {
    phoneError.value = 'Phone number must start with 0'
    return
  }
  
  phoneError.value = ''
  rechargeStore.setPhoneNumber(phone)
}

const processRecharge = async () => {
  if (!canProceed.value) return
  
  processing.value = true
  
  try {
    const transaction = await rechargeStore.processRecharge()
    lastTransaction.value = transaction
    showSuccessModal.value = true
    
    // Reset form
    resetForm()
  } catch (error) {
    alert(error.message || 'Recharge failed. Please try again.')
  } finally {
    processing.value = false
  }
}

const resetForm = () => {
  selectedNetwork.value = ''
  selectedPlanType.value = ''
  selectedPlan.value = null
  phoneNumber.value = ''
  phoneError.value = ''
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  lastTransaction.value = null
}

const getNetworkLogo = (network) => {
  const logos = {
    'MTN': '/images/mtn-logo.png',
    'Airtel': '/images/airtel-logo.png',
    'Glo': '/images/glo-logo.png',
    '9Mobile': '/images/9mobile-logo.png'
  }
  // Fallback to a generic logo or placeholder
  return logos[network] || `https://via.placeholder.com/32x32/4F46E5/white?text=${network.charAt(0)}`
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

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch for phone number changes
watch(phoneNumber, () => {
  validatePhoneNumber()
})
</script>

<style scoped>
.recharge-container {
  max-width: 800px;
  margin: 0 auto;
}

.network-option {
  @apply p-4 border-2 border-gray-200 rounded-lg cursor-pointer text-center transition-all duration-200 hover:border-blue-300;
}

.network-option.active {
  @apply border-blue-500 bg-blue-50;
}

.network-option .network-logo {
  @apply flex justify-center mb-2;
}

.plan-type-btn {
  @apply p-3 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-300;
}

.plan-type-btn.active {
  @apply border-blue-500 bg-blue-50 text-blue-700;
}

.plan-option {
  @apply p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-300;
}

.plan-option.active {
  @apply border-green-500 bg-green-50;
}

.phone-input {
  @apply w-full p-3 border border-gray-300 rounded-lg;
}

.transaction-item {
  transition: transform 0.2s ease;
}

.transaction-item:hover {
  transform: translateY(-1px);
}

.success-modal {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.header-section {
  border-radius: 0 0 20px 20px;
}

.stat-card {
  border: 1px solid #e5e7eb;
}

.network-badge {
  @apply w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center;
}
</style>