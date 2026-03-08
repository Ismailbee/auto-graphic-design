<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Subscription Plans</ion-title>
        <ion-buttons slot="end">
          <DiamondTierIcon :color="userStore.tierColor" :show-glow="true" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="subscription-page">
      <div class="subscription-container">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-background">
            <div class="hero-gradient"></div>
            <div class="floating-shapes">
              <div class="shape shape-1"></div>
              <div class="shape shape-2"></div>
              <div class="shape shape-3"></div>
            </div>
          </div>
          
          <div class="hero-content">
            <div class="hero-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" />
              </svg>
              <span>Premium Features Await</span>
            </div>
            
            <h1 class="hero-title">Choose Your Perfect Plan</h1>
            <p class="hero-subtitle">
              Unlock powerful AI design tools, premium templates, and exclusive features.<br>
              Get bonus tokens with every subscription.
            </p>

            <!-- Current Plan Status -->
            <div v-if="userStore.user" class="current-status">
              <div class="status-card">
                <DiamondTierIcon :color="userStore.tierColor" :show-glow="true" />
                <div class="status-info">
                  <div class="status-label">Current Plan</div>
                  <div class="status-value">{{ userStore.user.plan }}</div>
                </div>
                <div v-if="userStore.user.planExpiryDate && !userStore.planExpired" class="status-expiry">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span>{{ userStore.daysUntilExpiry }} days left</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
          <p class="loading-text">Loading subscription plans...</p>
        </div>

        <!-- Plans Grid -->
        <div v-else class="plans-section">
          <div class="section-header">
            <h2>Choose Your Subscription</h2>
            <p>All plans include our core features. Upgrade for more power!</p>
          </div>

          <div class="plans-grid">
            <div
              v-for="(plan, index) in plans"
              :key="plan.id"
              class="plan-card"
              :class="{ 
                'plan-popular': plan.popular, 
                'plan-recommended': plan.recommended,
                'plan-current': isCurrentPlan(plan.name),
                'plan-free': plan.price === 0
              }"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <!-- Plan Badge -->
              <div v-if="plan.popular" class="plan-badge badge-popular">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" />
                </svg>
                Most Popular
              </div>
              <div v-else-if="plan.recommended" class="plan-badge badge-recommended">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
                Best Value
              </div>
              <div v-else-if="isCurrentPlan(plan.name)" class="plan-badge badge-current">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
                Active Plan
              </div>

              <!-- Plan Header -->
              <div class="plan-header">
                <div class="plan-icon-wrapper">
                  <DiamondTierIcon 
                    :color="plan.color" 
                    :show-glow="plan.popular || plan.recommended" 
                  />
                </div>
                <h3 class="plan-title">{{ plan.name }}</h3>
                <div class="plan-pricing">
                  <div class="price-wrapper">
                    <span class="currency">₦</span>
                    <span class="price-amount">{{ formatPrice(plan.price) }}</span>
                  </div>
                  <div class="price-duration">
                    {{ plan.price > 0 ? `per ${plan.duration}` : plan.duration }}
                  </div>
                </div>
              </div>

              <!-- Token Bonus Highlight -->
              <div v-if="plan.tokenBonus > 0" class="bonus-highlight">
                <div class="bonus-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" />
                  </svg>
                </div>
                <div class="bonus-text">
                  <span class="bonus-amount">{{ plan.tokenBonus.toLocaleString() }}</span>
                  <span class="bonus-label">Bonus Tokens</span>
                </div>
              </div>

              <!-- Features List -->
              <div class="plan-features">
                <div 
                  v-for="(feature, idx) in plan.features" 
                  :key="idx" 
                  class="feature-item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  <span>{{ feature }}</span>
                </div>
              </div>

              <!-- Action Button -->
              <button
                class="plan-action-btn"
                :class="{
                  'btn-popular': plan.popular,
                  'btn-recommended': plan.recommended,
                  'btn-disabled': isCurrentPlan(plan.name) || plan.price === 0 || processing
                }"
                :disabled="isCurrentPlan(plan.name) || plan.price === 0 || processing"
                @click="upgradeToPlan(plan)"
              >
                <ion-spinner 
                  v-if="processing && selectedPlanId === plan.id" 
                  name="crescent"
                  class="btn-spinner"
                ></ion-spinner>
                <span v-else class="btn-content">
                  <span>{{ getButtonText(plan) }}</span>
                  <svg v-if="!isCurrentPlan(plan.name) && plan.price > 0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Feature Comparison Section -->
        <div class="comparison-section">
          <div class="section-header">
            <h2>Detailed Feature Comparison</h2>
            <p>See exactly what you get with each plan</p>
          </div>

          <div class="comparison-table-wrapper">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th class="feature-col">Features</th>
                  <th class="plan-col">Free</th>
                  <th class="plan-col plan-col-premium">Premium</th>
                  <th class="plan-col plan-col-pro">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="feature-name">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" />
                    </svg>
                    Bonus Tokens
                  </td>
                  <td class="plan-value">50</td>
                  <td class="plan-value plan-value-premium">1,000</td>
                  <td class="plan-value plan-value-pro">1,500</td>
                </tr>
                <tr>
                  <td class="feature-name">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    AI Design Tools
                  </td>
                  <td class="plan-value">Basic</td>
                  <td class="plan-value plan-value-premium">Advanced</td>
                  <td class="plan-value plan-value-pro">All Tools</td>
                </tr>
                <tr>
                  <td class="feature-name">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export Quality
                  </td>
                  <td class="plan-value">Watermarked</td>
                  <td class="plan-value plan-value-premium">HD Quality</td>
                  <td class="plan-value plan-value-pro">4K Quality</td>
                </tr>
                <tr>
                  <td class="feature-name">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    Support Level
                  </td>
                  <td class="plan-value">Community</td>
                  <td class="plan-value plan-value-premium">Priority</td>
                  <td class="plan-value plan-value-pro">Dedicated</td>
                </tr>
                <tr>
                  <td class="feature-name">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Premium Templates
                  </td>
                  <td class="plan-value">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </td>
                  <td class="plan-value plan-value-premium">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  </td>
                  <td class="plan-value plan-value-pro">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td class="feature-name">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Collaboration
                  </td>
                  <td class="plan-value">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </td>
                  <td class="plan-value plan-value-premium">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  </td>
                  <td class="plan-value plan-value-pro">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="faq-section">
          <div class="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about our plans</p>
          </div>

          <div class="faq-grid">
            <div 
              v-for="(faq, index) in faqs" 
              :key="index"
              class="faq-card"
              @click="toggleFaq(index)"
            >
              <div class="faq-question">
                <div class="faq-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h4>{{ faq.question }}</h4>
                <svg 
                  class="faq-chevron" 
                  :class="{ 'faq-chevron-open': faq.open }"
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              <div class="faq-answer" :class="{ 'faq-answer-open': faq.open }">
                <p>{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Trust Section -->
        <div class="trust-section">
          <div class="trust-content">
            <svg class="trust-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h3>Secure & Trusted</h3>
            <p>
              All payments are processed securely through Paystack. Your information is protected with industry-standard encryption.
              Cancel or upgrade anytime with no hidden fees.
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonSpinner,
  alertController
} from '@ionic/vue'
import { Capacitor } from '@capacitor/core'
// Lazy load Browser plugin - only needed when opening payment page
import { loadBrowser } from '@/composables/useCapacitorPlugins'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth'
import { getSubscriptionPlans } from '@/services/user/subscription.service'
import { initializePayment } from '@/services/user/payment.service'
import type { SubscriptionPlan } from '@/types/payment.types'
import DiamondTierIcon from '@/components/subscription/DiamondTierIcon.vue'

interface FAQ {
  question: string
  answer: string
  open: boolean
}

const userStore = useUserStore()
const authStore = useAuthStore()

const plans = ref<SubscriptionPlan[]>([])
const loading = ref(false)
const processing = ref(false)
const selectedPlanId = ref<string>('')

const faqs = ref<FAQ[]>([
  {
    question: 'How does billing work?',
    answer: 'Plans are billed upfront for the duration specified. Premium and Pro plans last for 2 months. Payment is processed securely through Paystack.',
    open: false
  },
  {
    question: 'What happens to my tokens after plan expires?',
    answer: 'Your tokens never expire! You keep all earned and bonus tokens even after your subscription plan expires. They remain in your account for future use.',
    open: false
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: 'Yes! You can upgrade to a higher plan at any time. Your new plan will start immediately, and you\'ll receive the bonus tokens right away.',
    open: false
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods through Paystack, including credit/debit cards, bank transfers, and mobile money. All transactions are secure and encrypted.',
    open: false
  },
  {
    question: 'Is there a refund policy?',
    answer: 'Due to the instant delivery of digital tokens and features, we generally don\'t offer refunds. However, if you experience technical issues, please contact our support team.',
    open: false
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel anytime. Your plan will remain active until the end of your billing period, and you\'ll keep all tokens earned during that time.',
    open: false
  }
])

onMounted(async () => {
  // Refresh user data to get latest plan status
  if (authStore.user?.id) {
    await userStore.fetchUser(authStore.user.id, authStore.user.email, authStore.user.name)
  }
  await loadPlans()
})

async function loadPlans() {
  loading.value = true
  try {
    const response = await getSubscriptionPlans()
    plans.value = response.plans
  } catch (error) {
    console.error('Load plans error:', error)
    showToast('Failed to load subscription plans', 'danger')
  } finally {
    loading.value = false
  }
}

function isCurrentPlan(planName: string): boolean {
  return userStore.user?.plan === planName && !userStore.planExpired
}

function formatPrice(price: number): string {
  return price.toLocaleString()
}

function getButtonText(plan: SubscriptionPlan): string {
  if (plan.price === 0) return 'Current Plan'
  if (isCurrentPlan(plan.name)) return 'Active Plan'
  return `Get ${plan.name}`
}

function toggleFaq(index: number) {
  faqs.value[index].open = !faqs.value[index].open
}

async function upgradeToPlan(plan: SubscriptionPlan) {
  if (!authStore.user || !userStore.user) {
    showToast('Please log in to upgrade', 'warning')
    return
  }

  // Show confirmation
  const alert = await alertController.create({
    header: `Upgrade to ${plan.name}?`,
    message: `You'll be charged ₦${plan.price.toLocaleString()} and receive ${plan.tokenBonus.toLocaleString()} bonus tokens immediately.`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Continue',
        handler: () => {
          processUpgrade(plan)
        }
      }
    ]
  })

  await alert.present()
}

async function processUpgrade(plan: SubscriptionPlan) {
  processing.value = true
  selectedPlanId.value = plan.id

  try {
    const response = await initializePayment({
      userId: authStore.user!.id,
      email: authStore.user!.email!,
      amount: plan.price,
      type: 'plan_upgrade',
      plan: plan.name as 'Premium' | 'Pro',
      planId: plan.id,
      name: authStore.user!.name || authStore.user!.username
    })

    // For mobile: Open in browser, for web: redirect
    if (Capacitor.isNativePlatform()) {
      // Lazy load and open payment page in system browser
      const Browser = await loadBrowser()
      await Browser.open({ url: response.authorizationUrl })
      
      // Show info toast
      showToast('Payment page opened. Complete payment to activate your plan.', 'info')
    } else {
      // Redirect to Paystack on web
      window.location.href = response.authorizationUrl
    }
  } catch (error) {
    console.error('Upgrade error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process upgrade'
    showToast(errorMessage, 'danger')
  } finally {
    processing.value = false
    selectedPlanId.value = ''
  }
}

async function showToast(message: string, color: string = 'primary') {
  const type = color === 'danger' ? 'error' : color === 'warning' ? 'info' : color === 'success' ? 'success' : 'info'
  authStore.showNotification({
    title: 'Subscription',
    message,
    type,
    duration: 3000
  })
}
</script>

<style scoped>
/* Global Styles */
.subscription-page {
  --background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
}

.subscription-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* Hero Section */
.hero-section {
  position: relative;
  overflow: hidden;
  margin: -20px -20px 60px;
  padding: 80px 20px 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
  opacity: 0.9;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -50px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: -50px;
  animation-delay: 7s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  left: 30%;
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  color: white;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
  animation: slideDown 0.8s ease-out;
}

.hero-badge svg {
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 16px 0;
  line-height: 1.2;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-subtitle {
  font-size: 18px;
  line-height: 1.6;
  opacity: 0.95;
  margin: 0 0 40px 0;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Current Status Card */
.current-status {
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.status-card {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.status-info {
  text-align: left;
}

.status-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.status-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.status-expiry {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 20px;
}

.loading-spinner {
  font-size: 48px;
  color: #667eea;
}

.loading-text {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* Section Headers */
.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-header h2 {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-header p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* Plans Section */
.plans-section {
  margin-bottom: 80px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  padding: 20px 0;
}

/* Plan Cards */
.plan-card {
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out both;
  border: 2px solid transparent;
}

.plan-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.plan-card.plan-popular {
  border-color: #fbbf24;
  box-shadow: 0 8px 30px rgba(251, 191, 36, 0.3);
}

.plan-card.plan-popular:hover {
  box-shadow: 0 20px 50px rgba(251, 191, 36, 0.4);
}

.plan-card.plan-recommended {
  border-color: #8b5cf6;
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.3);
}

.plan-card.plan-recommended:hover {
  box-shadow: 0 20px 50px rgba(139, 92, 246, 0.4);
}

.plan-card.plan-current {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

/* Plan Badge */
.plan-badge {
  position: absolute;
  top: -12px;
  right: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.badge-popular {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.badge-recommended {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.badge-current {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

/* Plan Header */
.plan-header {
  text-align: center;
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 2px solid #f3f4f6;
}

.plan-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 56px;
}

.plan-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 20px 0;
  color: #1f2937;
}

.plan-pricing {
  margin-bottom: 0;
}

.price-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}

.currency {
  font-size: 24px;
  font-weight: 600;
  color: #6b7280;
  margin-top: 8px;
}

.price-amount {
  font-size: 56px;
  font-weight: 900;
  color: #1f2937;
  line-height: 1;
}

.price-duration {
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Bonus Highlight */
.bonus-highlight {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.bonus-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  color: white;
}

.bonus-icon svg {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.bonus-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bonus-amount {
  font-size: 20px;
  font-weight: 800;
  color: #92400e;
}

.bonus-label {
  font-size: 13px;
  font-weight: 600;
  color: #b45309;
}

/* Plan Features */
.plan-features {
  margin-bottom: 28px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  font-size: 15px;
  color: #4b5563;
  line-height: 1.5;
}

.feature-item svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #10b981;
}

/* Action Button */
.plan-action-btn {
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.plan-action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.plan-action-btn:hover::before {
  width: 300px;
  height: 300px;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.btn-popular {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
}

.btn-popular:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.5);
}

.btn-recommended {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.btn-recommended:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
}

.plan-action-btn:not(.btn-popular):not(.btn-recommended):not(.btn-disabled) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.plan-action-btn:not(.btn-popular):not(.btn-recommended):not(.btn-disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-disabled:hover {
  transform: none;
  box-shadow: none;
}

.btn-spinner {
  width: 20px;
  height: 20px;
}

/* Comparison Section */
.comparison-section {
  margin-bottom: 80px;
}

.comparison-table-wrapper {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.comparison-table thead tr {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.comparison-table th,
.comparison-table td {
  padding: 20px;
  text-align: left;
}

.comparison-table th {
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #4b5563;
}

.comparison-table th:first-child {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.comparison-table th:last-child {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.comparison-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
}

.comparison-table tbody tr:hover {
  background: #f9fafb;
}

.feature-col {
  width: 40%;
}

.plan-col {
  width: 20%;
  text-align: center;
}

.plan-col-premium {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%);
}

.plan-col-pro {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%);
}

.feature-name {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
}

.feature-name svg {
  flex-shrink: 0;
  color: #667eea;
}

.plan-value {
  text-align: center;
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
}

.plan-value svg {
  margin: 0 auto;
  display: block;
}

.plan-value-premium {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%);
  color: #f59e0b;
  font-weight: 700;
}

.plan-value-pro {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%);
  color: #8b5cf6;
  font-weight: 700;
}

/* FAQ Section */
.faq-section {
  margin-bottom: 80px;
}

.faq-grid {
  display: grid;
  gap: 20px;
}

.faq-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.faq-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.faq-question {
  display: flex;
  align-items: center;
  gap: 16px;
}

.faq-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
}

.faq-question h4 {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.faq-chevron {
  flex-shrink: 0;
  color: #9ca3af;
  transition: transform 0.3s ease;
}

.faq-chevron-open {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease, margin-top 0.3s ease;
  opacity: 0;
}

.faq-answer-open {
  max-height: 200px;
  opacity: 1;
  margin-top: 16px;
}

.faq-answer p {
  margin: 0;
  padding-left: 56px;
  font-size: 14px;
  line-height: 1.6;
  color: #6b7280;
}

/* Trust Section */
.trust-section {
  background: white;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.trust-content {
  max-width: 600px;
  margin: 0 auto;
}

.trust-icon {
  display: inline-block;
  color: #10b981;
  margin-bottom: 24px;
}

.trust-section h3 {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 16px 0;
  color: #1f2937;
}

.trust-section p {
  font-size: 15px;
  line-height: 1.6;
  color: #6b7280;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .plans-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 20px 80px;
    margin: -20px -20px 40px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .status-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .status-info {
    text-align: center;
  }

  .section-header h2 {
    font-size: 28px;
  }

  .plans-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .plan-card {
    padding: 24px;
  }

  .plan-title {
    font-size: 24px;
  }

  .price-amount {
    font-size: 48px;
  }

  .comparison-table-wrapper {
    padding: 20px;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 12px 8px;
    font-size: 12px;
  }

  .feature-name {
    font-size: 13px;
  }

  .feature-name svg {
    width: 14px;
    height: 14px;
  }

  .trust-section {
    padding: 32px 20px;
  }

  .trust-section h3 {
    font-size: 24px;
  }

  .faq-answer p {
    padding-left: 0;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }

  .section-header h2 {
    font-size: 24px;
  }

  .comparison-table {
    font-size: 11px;
  }

  .feature-col {
    width: 35%;
  }

  .plan-col {
    width: 21.66%;
  }
}
</style>