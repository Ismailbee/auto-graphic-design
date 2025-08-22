<template>
  <ion-page>
    <page-header label="Subscription" />

    <ion-content>
      <div class="bg-secondary min-h-screen w-full px-6 pb-[150px] sm:pb-0 sm:px-[80px] py-8">
        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="Home"
          prevPageRoute="/home"
          currentPageName="Subscription"
          class="pb-3"
        />

        <div class="mx-auto max-w-7xl">
          <div class="mb-4 text-center">
            <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-4xl">
              Choose Your Plan
            </h1>
            <p class="max-w-xl mx-auto mt-5 text-md text-gray-500">
              Select the subscription that fits your needs. Enjoy more features, priority support, and exclusive perks!
            </p>
          </div>

          <!-- Toggle for annual/monthly -->
          <div class="flex justify-center mb-8">
            <div class="inline-flex items-center p-1 bg-white rounded-lg shadow-sm">
              <button
                @click="toggleBilling('monthly')"
                :class="[billing === 'monthly' ? 'bg-contrast text-white' : 'text-gray-700 hover:text-gray-900', 'px-4 py-2 text-sm font-medium rounded-md transition']"
              >
                Monthly
              </button>
              <button
                @click="toggleBilling('annually')"
                :class="[billing === 'annually' ? 'bg-primary text-white' : 'text-gray-700 hover:text-gray-900', 'px-4 py-2 text-sm font-medium rounded-md transition']"
              >
                Annually
                <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-200 text-indigo-800">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <!-- Subscription Cards -->
          <div class="grid gap-8 md:grid-cols-3 py-12">
            <ion-card
              v-for="plan in plans"
              :key="plan.name"
              :class="['rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl', plan.featured ? 'border-2 border-primary md:scale-105' : '']"
            >
              <!-- Featured Banner -->
              <div v-if="plan.featured" class="bg-primary text-white text-center py-1 text-sm font-bold">
                Most Popular
              </div>

              <!-- Header -->
              <div :class="['p-6', plan.featured ? 'bg-primary text-white' : '']">
                <div class="flex items-center justify-between">
                  <h2 class="text-2xl font-bold">{{ plan.name }}</h2>
                  <span v-if="plan.icon" class="text-3xl">{{ plan.icon }}</span>
                </div>
                <p class="mt-2 text-gray-500" :class="plan.featured ? 'text-white/80' : ''">{{ plan.desc }}</p>
                <div class="mt-4 flex items-end gap-2">
                  <span class="text-4xl font-extrabold">
                    {{ plan.price[billing] }}
                  </span>
                  <span class="text-md text-gray-500" :class="plan.featured ? 'text-white/80' : ''">
                    /{{ billing === 'monthly' ? 'mo' : 'yr' }}
                  </span>
                </div>
              </div>

              <!-- Features -->
              <div class="px-6 py-6 border-t border-gray-200">
                <ul class="space-y-2">
                  <li v-for="feature in plan.features" :key="feature" class="flex items-center gap-2">
                    <ion-icon name="checkmark-circle-outline" class="text-green-500"></ion-icon>
                    <span>{{ feature }}</span>
                  </li>
                </ul>
                <ion-button
                  expand="block"
                  class="mt-6"
                  :color="plan.featured ? 'contrast' : 'primary'"
                  @click="selectPlan(plan)"
                >
                  {{ plan.cta }}
                </ion-button>
              </div>
            </ion-card>
          </div>

          <!-- FAQ Section -->
          <div class="max-w-3xl mx-auto mt-12">
            <h2 class="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
            <div v-for="faq in faqs" :key="faq.q" class="mb-4">
              <button
                class="w-full text-left font-semibold text-primary focus:outline-none"
                @click="faq.open = !faq.open"
              >
                {{ faq.q }}
              </button>
              <div v-if="faq.open" class="mt-2 text-gray-600 bg-white rounded p-3 shadow">
                {{ faq.a }}
              </div>
            </div>
          </div>

          <!-- Customer Support Banner -->
          <div class="mt-16 flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-8">
            <h3 class="text-lg font-semibold mb-2">Need help choosing a plan?</h3>
            <p class="text-gray-500 mb-4">Contact our support team for personalized recommendations.</p>
            <ion-button color="contrast" @click="goToContact">Contact Support</ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Breadcrumb from "@/components/pages/Breadcrumb.vue";
import pageHeader from "../../../Header/pageHeader.vue";

const billing = ref('monthly')
const router = useRouter()

// Subscription plans
const plans = [
  {
    name: 'Basic',
    desc: 'Essential features to get started',
    price: { monthly: '$9', annually: '$90' },
    features: ['10 projects', '5GB storage', 'Basic analytics'],
    featured: false,
    cta: 'Get Started',
    icon: '🌱'
  },
  {
    name: 'Pro',
    desc: 'Most popular choice for professionals',
    price: { monthly: '$29', annually: '$290' },
    features: ['Unlimited projects', '50GB storage', 'Advanced analytics', 'Priority support'],
    featured: true,
    cta: 'Get Started',
    icon: '🚀'
  },
  {
    name: 'Enterprise',
    desc: 'For large organizations with advanced needs',
    price: { monthly: '$99', annually: '$990' },
    features: ['Unlimited projects', '500GB storage', 'Advanced analytics', '24/7 support', 'Custom integrations'],
    featured: false,
    cta: 'Contact Sales',
    icon: '🏢'
  }
]

const toggleBilling = (type) => {
  billing.value = type
}

const selectPlan = (plan) => {
  if (plan.cta === 'Contact Sales') {
    router.push("/contService")
  } else {
    // Simulate checkout or show a modal
    alert(`You selected the ${plan.name} plan!`)
  }
}

const goToContact = () => {
  router.push("/contService")
}

// Modern FAQ section
const faqs = ref([
  {
    q: "Can I change my plan later?",
    a: "Yes, you can upgrade or downgrade your plan at any time from your account settings.",
    open: false
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 14-day money-back guarantee on all new subscriptions.",
    open: false
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. We use industry-standard security and encryption to protect your data.",
    open: false
  },
  {
    q: "Do you offer discounts for students or non-profits?",
    a: "Yes! Please contact our support team for special pricing.",
    open: false
  }
])
</script>

<style scoped>
.bg-secondary {
  background-color: #f8f9fa;
}
</style>
