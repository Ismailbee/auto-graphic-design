<template>
  <ion-page class="tokens-plans-page">
    <ion-header class="tokens-header">
      <ion-toolbar class="tokens-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="goBack" class="back-button">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="tokens-title">Tokens & Plans</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="tokens-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="loading-text">Loading your account...</p>
      </div>

      <!-- Main Content -->
      <div v-else-if="userStore.user" class="tokens-plans-container">
        <!-- HERO SECTION: Account Overview -->
        <div class="hero-section">
          <div class="hero-content">
            <!-- Current Plan Badge -->
          <div class="plan-status-badge" :class="`plan-${userStore.user?.plan?.toLowerCase() || 'free'}`">
            <span class="plan-icon">{{ getPlanIcon(userStore.user?.plan || 'Basic') }}</span>
            <span class="plan-text">{{ userStore.user?.plan || 'Free' }} Plan</span>
            <span v-if="userStore.user?.plan && userStore.user.plan !== 'Basic'" class="plan-expiry">
                {{ userStore.daysUntilExpiry }} days left
            </span>
          </div>            <!-- Token Balance Display -->
            <div class="token-balance-hero">
              <div class="token-balance-label">Available Tokens</div>
              <div class="token-balance-display">
                <span class="token-icon-large">💎</span>
                <span class="token-count-large">{{ userStore.user?.tokens ? userStore.user.tokens.toLocaleString() : '0' }}</span>
              </div>
              <div class="token-balance-subtext">
                Used in {{ userStore.user.totalDesignsGenerated }} designs
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="quick-stats">
              <div class="stat-card">
                <div class="stat-label">Total Designs</div>
                <div class="stat-value">{{ userStore.user.totalDesignsGenerated }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Avg per Design</div>
                <div class="stat-value">
                  {{ userStore.user.totalDesignsGenerated > 0
                    ? Math.round(userStore.user.tokens / userStore.user.totalDesignsGenerated)
                    : 0
                  }}
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Current Plan</div>
                <div class="stat-value">{{ userStore.user.plan }}</div>
              </div>
            </div>

            <!-- Primary CTA -->
            <ion-button
              expand="block"
              color="primary"
              size="large"
              class="primary-cta"
              @click="scrollToTokens"
            >
              <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
              Buy More Tokens
            </ion-button>
          </div>
        </div>

        <!-- SECTION: Token Purchase Options -->
        <div ref="tokensSection" class="section-divider"></div>

        <div class="section-header">
          <h2 class="section-title">Buy Tokens</h2>
          <p class="section-subtitle">Choose a package that fits your needs</p>
        </div>

        <ion-grid class="token-packages-grid">
          <ion-row class="packages-row">
            <ion-col
              v-for="pkg in tokenPackages"
              :key="pkg.amount"
              size="12"
              size-md="6"
              size-lg="4"
              class="package-col"
            >
              <div
                class="token-package-card"
                :class="{ 'best-value': pkg.isBestValue }"
                @click="handleTokenPurchase(pkg)"
              >
                <!-- Best Value Badge -->
                <div v-if="pkg.isBestValue" class="best-value-badge">
                  <ion-icon :icon="starOutline"></ion-icon>
                  Best Value
                </div>

                <!-- Package Content -->
                <div class="package-content">
                  <div class="package-price">₦{{ pkg.amount.toLocaleString() }}</div>
                  <div class="package-tokens-display">
                    <span class="token-icon">💎</span>
                    <span class="token-amount">{{ pkg.tokens.toLocaleString() }}</span>
                  </div>
                  <div class="package-tokens-label">tokens</div>

                  <!-- Value Indicator -->
                  <div class="package-value">
                    {{ (pkg.tokens / pkg.amount).toFixed(2) }} tokens/₦
                  </div>
                </div>

                <!-- Purchase Button -->
                <ion-button
                  expand="block"
                  color="primary"
                  class="package-btn"
                  :class="{ 'best-value-btn': pkg.isBestValue }"
                >
                  Buy Now
                </ion-button>
              </div>
            </ion-col>

            <!-- Custom Token Purchase Card -->
            <ion-col size="12" size-md="6" size-lg="4" class="package-col">
              <div class="token-package-card custom-package-card">
                <!-- Custom Badge -->
                <div class="custom-badge">
                  <ion-icon :icon="addCircleOutline"></ion-icon>
                  Custom Amount
                </div>

                <!-- Custom Input Section -->
                <div class="custom-input-section">
                  <div class="custom-input-group">
                    <label class="custom-label">How many tokens?</label>
                    <div class="input-wrapper">
                      <input
                        v-model.number="customTokenAmount"
                        type="number"
                        class="custom-input"
                        placeholder="Enter amount (min 100)"
                        min="100"
                        step="1"
                        @input="validateCustomAmount"
                      />
                      <span class="input-suffix">💎</span>
                    </div>
                    <div v-if="customAmountError" class="error-message">
                      {{ customAmountError }}
                    </div>
                  </div>

                  <!-- Price Display -->
                  <div class="price-calculation">
                    <div class="calc-row">
                      <span class="calc-label">Price:</span>
                      <span class="calc-value">₦{{ calculatedPrice.toLocaleString() }}</span>
                    </div>
                    <div class="calc-row">
                      <span class="calc-label">Rate:</span>
                      <span class="calc-value">1 token = ₦1</span>
                    </div>
                  </div>
                </div>

                <!-- Purchase Button -->
                <ion-button
                  expand="block"
                  color="primary"
                  class="package-btn custom-buy-btn"
                  :disabled="!isCustomAmountValid"
                  @click="handleCustomTokenPurchase"
                >
                  Buy {{ customTokenAmount > 0 ? customTokenAmount.toLocaleString() : '0' }} Tokens
                </ion-button>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- SECTION: Subscription Plans -->
        <div ref="plansSection" class="section-divider"></div>

        <div class="section-header">
          <h2 class="section-title">Subscription Plans</h2>
          <p class="section-subtitle">Unlock more features and benefits</p>
        </div>

        <ion-grid class="plans-grid">
          <ion-row class="plans-row">
            <ion-col
              v-for="plan in planConfigs"
              :key="plan.name"
              size="12"
              size-md="6"
              size-lg="4"
              class="plan-col"
            >
              <div
                class="plan-card"
                :class="{
                  'current-plan': userStore.user.plan === plan.name,
                  'recommended': plan.badge === 'Recommended'
                }"
              >
                <!-- Recommended Badge -->
                <div v-if="plan.badge" class="plan-badge-label">
                  <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                  {{ plan.badge }}
                </div>

                <!-- Plan Header -->
                <div class="plan-header">
                  <div class="plan-icon-display">{{ plan.icon }}</div>
                  <h3 class="plan-name">{{ plan.name }}</h3>
                  <div class="plan-pricing">
                    <span v-if="plan.price === 0" class="price-free">Free Forever</span>
                    <span v-else class="price-amount">₦{{ plan.price.toLocaleString() }}</span>
                    <span v-if="plan.price > 0" class="price-period">/ {{ plan.duration }}</span>
                  </div>
                </div>

                <!-- Plan Benefits -->
                <div class="plan-benefits">
                  <div v-if="plan.freeTokens > 0" class="benefit-highlight">
                    <ion-icon :icon="giftOutline"></ion-icon>
                    <span>{{ plan.freeTokens.toLocaleString() }} free tokens</span>
                  </div>
                  <ul class="features-list">
                    <li v-for="(feature, index) in plan.features" :key="index">
                      <ion-icon :icon="checkmarkOutline" class="feature-icon"></ion-icon>
                      <span>{{ feature }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Plan CTA -->
                <ion-button
                  expand="block"
                  :color="getPlanButtonColor(plan.name)"
                  :disabled="userStore.user.plan === plan.name || isDowngrade(plan.name)"
                  class="plan-cta"
                  :class="{ 'recommended-btn': plan.badge === 'Recommended' }"
                  @click="handlePlanUpgrade(plan)"
                >
                  {{ getPlanButtonText(plan.name) }}
                </ion-button>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
        <p>{{ error }}</p>
        <ion-button @click="loadUserData">Retry</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonIcon,
  alertController
} from '@ionic/vue'
import {
  alertCircleOutline,
  arrowBackOutline,
  addCircleOutline,
  starOutline,
  checkmarkOutline,
  checkmarkCircleOutline,
  giftOutline
} from 'ionicons/icons'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth'
import { TOKEN_PACKAGES, PLAN_CONFIGS, type TokenPackage, type PlanConfig, type PlanType } from '@/types/payment.types'
import { purchaseTokens, upgradePlan, verifyPayment } from '@/services/user/payment.service'

// Router
const router = useRouter()

// Store
const userStore = useUserStore()
const authStore = useAuthStore()

function notify(
  message: string,
  type: 'info' | 'success' | 'error' = 'info',
  duration: number = 2500,
  title: string = 'Tokens & Plans'
) {
  authStore.showNotification({
    title,
    message,
    type,
    duration
  })
}

// State
const loading = ref(true)
const error = ref<string | null>(null)
const tokensSection = ref<HTMLElement>()
const plansSection = ref<HTMLElement>()

// Custom token purchase state
const customTokenAmount = ref<number>(100)
const customAmountError = ref<string | null>(null)
const MIN_CUSTOM_TOKENS = 100

// Pending payment state for mobile payments
const pendingPayment = ref<{
  reference: string
  tokens: number
  type: 'token_purchase' | 'plan_upgrade'
  plan?: 'Premium' | 'Pro'
  planId?: string
  freeTokens?: number
} | null>(null)

// App state listener for mobile payment verification
let appStateListener: any = null

// Data
const tokenPackages = TOKEN_PACKAGES
const planConfigs = PLAN_CONFIGS

// Computed properties
const calculatedPrice = computed(() => {
  return customTokenAmount.value >= MIN_CUSTOM_TOKENS ? customTokenAmount.value : 0
})

const isCustomAmountValid = computed(() => {
  return customTokenAmount.value >= MIN_CUSTOM_TOKENS && !customAmountError.value
})

// Lifecycle
onMounted(async () => {
  await loadUserData()
  
  // Set up app state listener for mobile payments
  if (Capacitor.isNativePlatform()) {
    setupAppStateListener()
  }
})

// Clean up listener on unmount
onUnmounted(() => {
  if (appStateListener) {
    appStateListener.remove()
    appStateListener = null
  }
})

// Setup app state listener for mobile payment verification
async function setupAppStateListener() {
  try {
    appStateListener = await App.addListener('appStateChange', async ({ isActive }) => {
      console.log('📱 App state changed, isActive:', isActive)
      
      // When app becomes active and there's a pending payment
      if (isActive && pendingPayment.value) {
        console.log('📱 App resumed with pending payment:', pendingPayment.value)
        await handlePendingPaymentVerification()
      } else if (isActive) {
        // Even without pending payment, refresh user data when app resumes
        // This handles cases where payment was completed but reference was lost
        console.log('📱 App resumed, refreshing user data...')
        await loadUserData()
      }
    })
    console.log('📱 App state listener set up successfully')
  } catch (err) {
    console.error('Failed to setup app state listener:', err)
  }
}

// Handle pending payment verification when app resumes
async function handlePendingPaymentVerification() {
  if (!pendingPayment.value) return
  
  const payment = pendingPayment.value
  
  try {
    notify('Verifying your payment...', 'info', 2000, 'Payment')
    
    // Verify the payment
    const result = await verifyPayment(payment.reference)
    console.log('📱 Payment verification result:', result)
    
    if (result.status === 'success') {
      if (payment.type === 'token_purchase') {
        // Update local token count
        userStore.updateTokens(payment.tokens)
        
        notify(`✅ ${payment.tokens} tokens added to your account!`, 'success', 3000)
      } else if (payment.type === 'plan_upgrade' && payment.plan) {
        // Update plan
        const expiryDate = new Date()
        expiryDate.setMonth(expiryDate.getMonth() + 2)
        userStore.upgradePlan(payment.plan, expiryDate.toISOString(), payment.freeTokens || 0)
        
        notify(`🎉 Welcome to ${payment.plan}! ${payment.freeTokens || 0} tokens added.`, 'success', 3000)
      }
    } else {
      // Payment not successful yet or failed
      notify('Payment status: ' + (result.status || 'pending'), 'info', 2000, 'Payment')
    }
  } catch (err: any) {
    console.error('Payment verification error:', err)
    // Don't show error toast, just refresh data
  } finally {
    // Clear pending payment and refresh user data
    pendingPayment.value = null
    await loadUserData()
  }
}

// Methods
function goBack() {
  router.push('/home')
}

async function loadUserData() {
  loading.value = true
  error.value = null

  try {
    // Get user ID from auth store
    const userId = authStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }
    // Pass email and name to create user if they don't exist
    const email = authStore.user?.email
    const name = authStore.user?.name || authStore.user?.firstName
    await userStore.fetchUser(userId, email, name)
  } catch (err: any) {
    error.value = err.message || 'Failed to load user data'
  } finally {
    loading.value = false
  }
}

function getPlanIcon(plan: PlanType): string {
  const config = planConfigs.find(p => p.name === plan)
  return config?.icon || '🆓'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function scrollToTokens() {
  tokensSection.value?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToPlans() {
  plansSection.value?.scrollIntoView({ behavior: 'smooth' })
}

// Custom token purchase methods
function validateCustomAmount() {
  customAmountError.value = null

  if (!customTokenAmount.value || customTokenAmount.value < MIN_CUSTOM_TOKENS) {
    customAmountError.value = `Minimum purchase is ${MIN_CUSTOM_TOKENS} tokens`
    return false
  }

  if (!Number.isInteger(customTokenAmount.value)) {
    customAmountError.value = 'Please enter a whole number'
    return false
  }

  return true
}

async function handleCustomTokenPurchase() {
  if (!userStore.user) return

  // Validate before proceeding
  if (!validateCustomAmount()) {
    notify(customAmountError.value || 'Invalid token amount', 'error', 2000)
    return
  }

  // Create a temporary package object for the custom purchase
  const customPackage = {
    amount: calculatedPrice.value,
    tokens: customTokenAmount.value
  }

  // Use the existing handleTokenPurchase method
  await handleTokenPurchase(customPackage)
}

function getPlanButtonColor(planName: PlanType): string {
  if (userStore.user?.plan === planName) return 'medium'
  if (planName === 'Pro') return 'tertiary'
  if (planName === 'Premium') return 'secondary'
  return 'light'
}

function getPlanButtonText(planName: PlanType): string {
  if (userStore.user?.plan === planName) return 'Current Plan'
  if (isDowngrade(planName)) return 'Downgrade'
  if (planName === 'Basic') return 'Switch to Basic'
  return `Upgrade to ${planName}`
}

function isDowngrade(planName: PlanType): boolean {
  const planOrder = { 'Basic': 0, 'Premium': 1, 'Pro': 2 }
  const currentPlanLevel = planOrder[userStore.user?.plan || 'Basic']
  const targetPlanLevel = planOrder[planName]
  return targetPlanLevel < currentPlanLevel
}

async function handleTokenPurchase(pkg: TokenPackage) {
  if (!userStore.user) return

  try {
    notify('Opening payment gateway...', 'info', 2000, 'Payment')

    // For mobile, store pending payment info before opening browser
    const isNative = Capacitor.isNativePlatform()
    
    const reference = await purchaseTokens(
      userStore.user.id,
      userStore.user.email,
      userStore.user.name,
      pkg.amount,
      pkg.tokens,
      async (response) => {
        // Payment successful callback (works on web, not on mobile)
        notify('Payment successful! Verifying...', 'success', 2000, 'Payment')

        // Verify payment
        try {
          await verifyPayment(response.reference)

          // Update local state
          userStore.updateTokens(pkg.tokens)

          notify(`✅ ${pkg.tokens} tokens added to your account!`, 'success', 3000)

          // Refresh user data
          await loadUserData()
        } catch (err) {
          console.error('Verification error:', err)
        }
      },
      async () => {
        // Payment cancelled callback (works on web, not on mobile)
        pendingPayment.value = null
        notify('Payment cancelled. No charges were made.', 'info', 2000, 'Payment')
      }
    )
    
    // Store pending payment for mobile verification when app resumes
    if (isNative && reference) {
      console.log('📱 Storing pending payment for mobile:', { reference, tokens: pkg.tokens })
      pendingPayment.value = {
        reference,
        tokens: pkg.tokens,
        type: 'token_purchase'
      }
      
      // Show instruction for mobile users
      notify('Complete payment in browser. Your tokens will be added when you return.', 'info', 4000, 'Payment')
    }
  } catch (err: any) {
    pendingPayment.value = null
    notify(err.message || 'Failed to process payment', 'error', 3000, 'Payment')
  }
}

async function handlePlanUpgrade(plan: PlanConfig) {
  if (!userStore.user || plan.name === 'Basic' || userStore.user.plan === plan.name) return

  // For mobile, track if we're on native platform
  const isNative = Capacitor.isNativePlatform()

  // Show confirmation modal
  const alert = await alertController.create({
    header: `Upgrade to ${plan.name}?`,
    message: `
      <div class="upgrade-confirmation">
        <p><strong>You'll get:</strong></p>
        <ul>
          <li>${plan.freeTokens.toLocaleString()} free tokens immediately</li>
          <li>All ${plan.name} plan benefits</li>
        </ul>
        <p><strong>Billing:</strong> ₦${plan.price.toLocaleString()} every ${plan.duration}</p>
      </div>
    `,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Confirm Upgrade',
        handler: async () => {
          try {
            const reference = await upgradePlan(
              userStore.user!.id,
              userStore.user!.email,
              userStore.user!.name,
              plan.name as 'Premium' | 'Pro',
              plan.planId,
              plan.price,
              async (response) => {
                // Payment successful callback (works on web, not on mobile)
                notify('Payment successful! Verifying...', 'success', 2000, 'Payment')

                // Verify payment
                try {
                  await verifyPayment(response.reference)

                  // Update local state
                  const expiryDate = new Date()
                  expiryDate.setMonth(expiryDate.getMonth() + 2)
                  userStore.upgradePlan(plan.name as PlanType, expiryDate.toISOString(), plan.freeTokens)

                  notify(`🎉 Welcome to ${plan.name}! ${plan.freeTokens} tokens added.`, 'success', 3000)

                  // Refresh user data
                  await loadUserData()
                } catch (err) {
                  console.error('Verification error:', err)
                }
              },
              async () => {
                // Payment cancelled callback (works on web, not on mobile)
                pendingPayment.value = null
                notify('Upgrade cancelled. No charges were made.', 'info', 2000, 'Payment')
              }
            )

            // Store pending payment for mobile verification when app resumes
            if (isNative && reference) {
              console.log('📱 Storing pending plan upgrade for mobile:', { reference, plan: plan.name })
              pendingPayment.value = {
                reference,
                tokens: plan.freeTokens,
                type: 'plan_upgrade',
                plan: plan.name as 'Premium' | 'Pro',
                planId: plan.planId,
                freeTokens: plan.freeTokens
              }

              // Show instruction for mobile users
              notify('Complete payment in browser. Your plan will be upgraded when you return.', 'info', 4000, 'Payment')
            }
          } catch (err: any) {
            pendingPayment.value = null
            notify(err.message || 'Failed to process upgrade', 'error', 3000, 'Payment')
          }
        }
      }
    ]
  })

  await alert.present()
}
</script>

<style scoped>
/* ============================================================================
   TOKENS & PLANS PAGE - MODERN PROFESSIONAL DESIGN
   ============================================================================ */

.tokens-plans-page {
  --ion-background-color: #f8f9fa;
}

.tokens-header {
  --ion-background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --min-height: 80px;
}

.tokens-toolbar {
  --ion-padding-start: 0;
  --ion-padding-end: 0;
  --min-height: 80px;
}

.tokens-title {
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}

.back-button {
  --padding-start: 16px;
  --padding-end: 16px;
  --color: #635bff;
}

.tokens-content {
  --ion-padding: 0;
  --ion-background: #f8f9fa;
}

.tokens-plans-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

/* ============================================================================
   LOADING & ERROR STATES
   ============================================================================ */

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  gap: 1.5rem;
  padding: 2rem;
}

.loading-text {
  font-size: 1rem;
  color: #727f96;
  font-weight: 500;
}

/* ============================================================================
   HERO SECTION - ACCOUNT OVERVIEW
   ============================================================================ */

.hero-section {
  background: linear-gradient(135deg, #635bff 0%, #5a4dd4 100%);
  color: white;
  padding: 48px 24px;
  position: relative;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in hero section */
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

/* Plan Status Badge */
.plan-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.plan-status-badge.plan-basic {
  background: rgba(255, 255, 255, 0.15);
}

.plan-status-badge.plan-premium {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
}

.plan-status-badge.plan-pro {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
}

.plan-icon {
  font-size: 1.2rem;
}

.plan-text {
  font-weight: 600;
}

.plan-expiry {
  margin-left: 8px;
  opacity: 0.9;
  font-size: 0.85rem;
}

/* Token Balance Display */
.token-balance-hero {
  margin-bottom: 32px;
}

.token-balance-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 8px;
  font-weight: 500;
}

.token-balance-display {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.token-icon-large {
  font-size: 3.5rem;
  line-height: 1;
}

.token-count-large {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -1px;
}

.token-balance-subtext {
  font-size: 0.95rem;
  opacity: 0.85;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.85;
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

/* Primary CTA */
.primary-cta {
  --background: #ffffff;
  --color: #635bff;
  --background-hover: #f0f0ff;
  font-weight: 600;
  font-size: 1rem;
  height: 48px;
  border-radius: 8px;
  max-width: 300px;
}

/* ============================================================================
   SECTION DIVIDERS & HEADERS
   ============================================================================ */

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
  margin: 48px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 0 24px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #0a2540;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.section-subtitle {
  font-size: 1rem;
  color: #727f96;
  margin: 0;
}

/* ============================================================================
   TOKEN PACKAGES SECTION
   ============================================================================ */

.token-packages-grid {
  padding: 0 24px 48px;
}

.packages-row {
  row-gap: 24px;
}

.package-col {
  display: flex;
}

.token-package-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  width: 100%;
  height: 100%;
}

.token-package-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #635bff;
}

.token-package-card.best-value {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
}

.token-package-card.best-value:hover {
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.2);
}

/* Best Value Badge */
.best-value-badge {
  position: absolute;
  top: -12px;
  right: 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.best-value-badge ion-icon {
  font-size: 0.9rem;
}

/* Package Content */
.package-content {
  flex-grow: 1;
  margin-bottom: 20px;
}

.package-price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #635bff;
  margin-bottom: 12px;
  letter-spacing: -1px;
}

.package-tokens-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.token-icon {
  font-size: 1.8rem;
}

.token-amount {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0a2540;
}

.package-tokens-label {
  font-size: 0.9rem;
  color: #727f96;
  margin-bottom: 12px;
}

.package-value {
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 600;
  background: #ecfdf5;
  padding: 6px 10px;
  border-radius: 6px;
  display: inline-block;
}

/* Package Button */
.package-btn {
  --background: #635bff;
  --background-hover: #5a4dd4;
  --color: white;
  font-weight: 600;
  height: 44px;
  border-radius: 8px;
}

.package-btn.best-value-btn {
  --background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  --background-hover: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

/* ============================================================================
   CUSTOM TOKEN PURCHASE SECTION
   ============================================================================ */

.custom-package-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
  border-color: #3b82f6;
  border-style: dashed;
}

.custom-package-card:hover {
  border-color: #2563eb;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.15);
}

.custom-badge {
  position: absolute;
  top: -12px;
  right: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.custom-badge ion-icon {
  font-size: 0.9rem;
}

.custom-input-section {
  flex-grow: 1;
  margin-bottom: 20px;
}

.custom-input-group {
  margin-bottom: 16px;
}

.custom-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #0a2540;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-input {
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #0a2540;
  transition: all 0.3s ease;
  font-family: inherit;
}

.custom-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.custom-input::placeholder {
  color: #9ca3af;
}

.input-suffix {
  position: absolute;
  right: 12px;
  font-size: 1.2rem;
  pointer-events: none;
}

.error-message {
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 6px;
  font-weight: 500;
}

.price-calculation {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.calc-row:last-child {
  margin-bottom: 0;
}

.calc-label {
  color: #6b7280;
  font-weight: 500;
}

.calc-value {
  color: #0a2540;
  font-weight: 700;
}

.custom-buy-btn {
  --background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  --background-hover: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.custom-buy-btn:disabled {
  --background: #d1d5db;
  --color: #9ca3af;
  opacity: 0.6;
}

/* ============================================================================
   SUBSCRIPTION PLANS SECTION
   ============================================================================ */

.plans-grid {
  padding: 0 24px 48px;
}

.plans-row {
  row-gap: 24px;
}

.plan-col {
  display: flex;
}

.plan-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 28px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  width: 100%;
  height: 100%;
}

.plan-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.plan-card.current-plan {
  border-color: #635bff;
  background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%);
  box-shadow: 0 8px 24px rgba(99, 91, 255, 0.15);
}

.plan-card.recommended {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.plan-card.recommended:hover {
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.15);
}

/* Plan Badge */
.plan-badge-label {
  position: absolute;
  top: -12px;
  right: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.plan-badge-label ion-icon {
  font-size: 0.9rem;
}

/* Plan Header */
.plan-header {
  margin-bottom: 24px;
  text-align: center;
}

.plan-icon-display {
  font-size: 3rem;
  margin-bottom: 12px;
  line-height: 1;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0a2540;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.plan-pricing {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.price-free {
  font-size: 1.1rem;
  font-weight: 600;
  color: #10b981;
}

.price-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #635bff;
  letter-spacing: -1px;
}

.price-period {
  font-size: 0.9rem;
  color: #727f96;
  font-weight: 500;
}

/* Plan Benefits */
.plan-benefits {
  flex-grow: 1;
  margin-bottom: 24px;
}

.benefit-highlight {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef3c7;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #92400e;
  font-size: 0.95rem;
}

.benefit-highlight ion-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.features-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.4;
}

.feature-icon {
  color: #10b981;
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Plan CTA */
.plan-cta {
  --background: #635bff;
  --background-hover: #5a4dd4;
  --color: white;
  font-weight: 600;
  height: 44px;
  border-radius: 8px;
}

.plan-cta.recommended-btn {
  --background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --background-hover: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* ============================================================================
   RESPONSIVE DESIGN
   ============================================================================ */

@media (max-width: 768px) {
  .hero-section {
    padding: 32px 16px;
  }

  .hero-section::before {
    width: 300px;
    height: 300px;
    top: -30%;
    right: -5%;
  }

  .token-balance-display {
    flex-direction: column;
    align-items: flex-start;
  }

  .token-icon-large,
  .token-count-large {
    font-size: 2.5rem;
  }

  .quick-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .primary-cta {
    max-width: 100%;
  }

  .section-header {
    padding: 0 16px;
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .section-subtitle {
    font-size: 0.9rem;
  }

  .token-packages-grid,
  .plans-grid {
    padding: 0 16px 32px;
  }

  .token-package-card,
  .plan-card {
    padding: 20px;
  }

  .package-price {
    font-size: 2rem;
  }

  .plan-name {
    font-size: 1.25rem;
  }

  .price-amount {
    font-size: 1.5rem;
  }

  .custom-input {
    font-size: 1rem;
    padding: 12px 40px 12px 12px;
  }

  .custom-label {
    font-size: 0.85rem;
  }

  .calc-row {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 24px 12px;
  }

  .token-count-large {
    font-size: 2rem;
  }

  .token-icon-large {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .package-price,
  .price-amount {
    font-size: 1.5rem;
  }

  .token-packages-grid,
  .plans-grid {
    padding: 0 12px 24px;
  }
}
</style>

