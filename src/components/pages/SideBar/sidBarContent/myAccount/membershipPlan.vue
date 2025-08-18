<template>
  <ion-page>
    <page-header>Membership Plan</page-header>

    <ion-content>

      <div class="bg-secondary min-h-screen w-full px-[80px] py-8">

        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="My Account"
          prevPageRoute="/myAccountPage"
          currentPageName="Membership Plan"
          class="pb-3"
        />
        
          <div class="">
          <!-- Current Plan with Ribbon -->
          <div class="relative mb-6">
            <div class="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
              ACTIVE
            </div>
            <ion-card class="shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div class="bg-gradient-to-r from-primary to-indigo-600 h-2 w-full"></div>
              <ion-card-header>
                <ion-card-title class="text-xl font-bold text-gray-800">Your Current Plan</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-2xl font-extrabold text-primary">Pro+ Plan</p>
                    <p class="text-gray-600 mt-1"><ion-icon :icon="calendarOutline" class="mr-1"></ion-icon> Renews: <strong>September 15, 2025</strong></p>
                    <p class="text-gray-800 mt-2 text-lg font-semibold">₦8,500 / month</p>
                  </div>
                  <div class="text-right">
                    <ion-badge color="success" class="text-sm">20% Savings</ion-badge>
                    <p class="text-xs text-gray-500 mt-1">Compared to monthly</p>
                  </div>
                </div>
                <ion-button expand="block" fill="outline" color="medium" class="mt-4" @click="openCancelModal">
                  Cancel Subscription
                </ion-button>
              </ion-card-content>
            </ion-card>
          </div>

          <!-- Usage Graph with Animated Loading -->
          <ion-card class="shadow-lg rounded-xl mb-6 overflow-hidden">
            <ion-card-header>
              <ion-card-title class="text-xl font-bold text-gray-800 flex items-center">
                <ion-icon :icon="statsChart" class="mr-2 text-primary"></ion-icon>
                Usage This Month
              </ion-card-title>
              <ion-card-subtitle class="text-gray-500">Your monthly resource consumption</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <div class="relative h-48">
                <canvas id="usageChart"></canvas>
                <div v-if="loadingChart" class="absolute inset-0 flex items-center justify-center">
                  <ion-spinner name="crescent" color="primary"></ion-spinner>
                </div>
              </div>
              <div class="flex justify-between mt-4 text-sm text-gray-600">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Available Plans with Featured Highlight -->
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <ion-icon :icon="rocketOutline" class="mr-2 text-primary"></ion-icon>
              Upgrade Your Plan
            </h2>
            <p class="text-gray-600 mb-4">Choose the perfect plan for your needs</p>
            
            <div class="grid gap-4 md:grid-cols-3">
              <ion-card 
                v-for="(plan, index) in plans" 
                :key="plan.name"
                :class="[
                  'rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]',
                  plan.featured ? 'border-2 border-primary shadow-xl' : 'shadow-lg'
                ]"
              >
                <div v-if="plan.featured" class="bg-primary text-white text-center py-1 text-sm font-bold">
                  MOST POPULAR
                </div>
                <ion-card-header>
                  <ion-card-title class="flex items-center justify-between">
                    <span class="text-lg font-bold text-gray-800">{{ plan.name }}</span>
                    <ion-badge v-if="plan.saving" color="success">{{ plan.saving }}</ion-badge>
                  </ion-card-title>
                  <ion-card-subtitle class="text-gray-600">{{ plan.desc }}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <div class="mb-4">
                    <p class="text-3xl font-extrabold text-gray-900">{{ plan.price }}</p>
                    <p v-if="plan.originalPrice" class="text-sm text-gray-500 line-through">{{ plan.originalPrice }}</p>
                  </div>
                  <ul class="space-y-2 mb-6">
                    <li v-for="feature in plan.features" :key="feature" class="flex items-center text-sm text-gray-700">
                      <ion-icon :icon="checkmarkCircle" class="mr-2 text-green-500"></ion-icon>
                      {{ feature }}
                    </li>
                  </ul>
                  <ion-button 
                    :color="plan.featured ? 'primary' : 'medium'" 
                    expand="block" 
                    :fill="plan.featured ? 'solid' : 'outline'"
                    @click="openPlanDetails(plan)"
                  >
                    {{ plan.current ? 'Current Plan' : 'Select Plan' }}
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </div>
          </div>

          <!-- FAQ Section -->
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <ion-icon :icon="helpCircleOutline" class="mr-2 text-primary"></ion-icon>
              Frequently Asked Questions
            </h2>
            <ion-accordion-group>
              <ion-accordion v-for="(faq, index) in faqs" :key="index" class="mb-2 rounded-lg overflow-hidden">
                <ion-item slot="header" class="bg-gray-50">
                  <ion-label class="font-medium">{{ faq.question }}</ion-label>
                </ion-item>
                <div slot="content" class="ion-padding text-sm text-gray-700 bg-white">
                  {{ faq.answer }}
                </div>
              </ion-accordion>
            </ion-accordion-group>
          </div>
        </div>

        <!-- Plan Details Modal -->
        <ion-modal :is-open="showPlanModal" @didDismiss="showPlanModal = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>Plan Details</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="showPlanModal = false">
                  <ion-icon :icon="closeCircle"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div v-if="selectedPlan" class="text-center">
              <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ selectedPlan.name }} Plan</h2>
              <p class="text-gray-600 mb-6">{{ selectedPlan.desc }}</p>
              
              <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <p class="text-4xl font-extrabold text-primary mb-1">{{ selectedPlan.price }}</p>
                <p v-if="selectedPlan.originalPrice" class="text-sm text-gray-500 line-through">{{ selectedPlan.originalPrice }}</p>
                <p v-if="selectedPlan.saving" class="text-sm text-green-600 font-medium">Save {{ selectedPlan.saving }}</p>
              </div>
              
              <div class="text-left mb-6">
                <h3 class="font-bold text-lg text-gray-800 mb-3">Plan Features:</h3>
                <ul class="space-y-3">
                  <li v-for="feature in selectedPlan.features" :key="feature" class="flex items-start">
                    <ion-icon :icon="checkmarkCircle" class="mt-1 mr-2 text-green-500"></ion-icon>
                    <span>{{ feature }}</span>
                  </li>
                </ul>
              </div>
              
              <ion-button expand="block" size="large" @click="confirmUpgrade(selectedPlan)">
                Upgrade Now
                <ion-icon :icon="arrowForward" slot="end"></ion-icon>
              </ion-button>
            </div>
          </ion-content>
        </ion-modal>

        <!-- Cancel Subscription Modal -->
        <ion-modal :is-open="showCancelModal" @didDismiss="showCancelModal = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>Cancel Subscription</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="showCancelModal = false">
                  <ion-icon :icon="closeCircle"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="text-center">
              <ion-icon :icon="helpCircleOutline" class="text-5xl text-yellow-500 mb-4"></ion-icon>
              <h2 class="text-xl font-bold text-gray-800 mb-2">Are you sure?</h2>
              <p class="text-gray-600 mb-6">Your Pro+ plan will remain active until September 15, 2025. After that date, you'll lose access to premium features.</p>
              
              <div class="bg-red-50 rounded-lg p-4 mb-6 text-left">
                <h3 class="font-bold text-red-700 mb-2">What you'll lose:</h3>
                <ul class="list-disc list-inside text-red-600 space-y-1">
                  <li>Advanced analytics features</li>
                  <li>Priority customer support</li>
                  <li>Team collaboration tools</li>
                  <li>10GB storage space</li>
                </ul>
              </div>
              
              <ion-button expand="block" color="danger" @click="cancelSubscription">
                Confirm Cancellation
              </ion-button>
              <ion-button expand="block" fill="outline" color="medium" @click="showCancelModal = false">
                Keep My Subscription
              </ion-button>
            </div>
          </ion-content>
        </ion-modal>
      </div>

    </ion-content>
  
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import Breadcrumb from '@/components/pages/Breadcrumb.vue'
import { 
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonList, IonItem, IonLabel, IonButton, IonBadge, IonIcon, IonSpinner, IonModal,
  IonAccordionGroup, IonAccordion, IonHeader, IonToolbar, IonTitle, IonButtons
} from '@ionic/vue'
import { 
  calendarOutline, statsChart, rocketOutline, helpCircleOutline, 
  checkmarkCircle, closeCircle, arrowForward
} from 'ionicons/icons'
import pageHeader from '@/components/pages/Header/pageHeader.vue'

const loadingChart = ref(true)
const showPlanModal = ref(false)
const showCancelModal = ref(false)
const selectedPlan = ref(null)

const plans = [
  { 
    name: 'Basic', 
    desc: 'Perfect for individuals', 
    price: '₦3,500', 
    originalPrice: '₦4,000/mo',
    saving: '12% off',
    period: 'month',
    features: [
      'Up to 5 projects',
      'Basic analytics',
      'Email support',
      '1GB storage'
    ],
    featured: false,
    current: false
  },
  { 
    name: 'Pro+', 
    desc: 'For growing teams', 
    price: '₦8,500', 
    originalPrice: '₦10,000/mo',
    saving: '15% off',
    period: 'month',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '10GB storage',
      'Team collaboration'
    ],
    featured: true,
    current: true
  },
  { 
    name: 'Enterprise', 
    desc: 'For large organizations', 
    price: '₦20,000', 
    period: 'month',
    features: [
      'Unlimited everything',
      'Dedicated account manager',
      '24/7 premium support',
      '100GB storage',
      'Custom integrations',
      'API access'
    ],
    featured: false,
    current: false
  }
]

const faqs = [
  {
    question: 'Can I change my plan anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at your next billing cycle.'
  },
  {
    question: 'Is there a free trial available?',
    answer: 'We offer a 14-day free trial for all new customers. No credit card required to start your trial.'
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel anytime from your account settings. Your subscription will remain active until the end of your current billing period.'
  }
]

const openPlanDetails = (plan) => {
  if (plan.current) return
  selectedPlan.value = plan
  showPlanModal.value = true
}

const openCancelModal = () => {
  showCancelModal.value = true
}

const confirmUpgrade = (plan) => {
  console.log('Upgrading to plan:', plan.name)
  // Implement payment processing logic here
  showPlanModal.value = false
  // Show success message
}

const cancelSubscription = () => {
  console.log('Subscription cancelled')
  showCancelModal.value = false
  // Show confirmation message
}

onMounted(() => {
  setTimeout(() => {
    const ctx = document.getElementById('usageChart')
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Usage (%)',
            data: [30, 65, 45, 85],
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#4F46E5',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#4F46E5',
            titleFont: { weight: 'bold', size: 14 },
            bodyFont: { size: 12 },
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.parsed.y}% usage`
            }
          }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            max: 100,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { stepSize: 25 }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    })
    loadingChart.value = false
  }, 1000)
})
</script>

<style scoped>
ion-card {
  --ion-background-color: white;
}

ion-accordion {
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

.bg-gradient-to-b {
  background: linear-gradient(to bottom, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
  background: linear-gradient(to right, var(--tw-gradient-stops));
}
</style>