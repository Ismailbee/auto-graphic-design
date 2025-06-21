<template>
  <ion-page>
    <ion-content class="bg-gray-50">
      <div class="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Choose Your Plan
          </h1>
          <p class="max-w-xl mx-auto mt-5 text-xl text-gray-500">
            Select the subscription that fits your needs
          </p>
        </div>

        <!-- Toggle for annual/monthly -->
        <div class="flex justify-center mb-8">
          <div class="inline-flex items-center p-1 bg-white rounded-lg shadow-sm">
            <button
              @click="toggleBilling('monthly')"
              :class="[billing === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:text-gray-900', 'px-4 py-2 text-sm font-medium rounded-md']"
            >
              Monthly
            </button>
            <button
              @click="toggleBilling('annually')"
              :class="[billing === 'annually' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:text-gray-900', 'px-4 py-2 text-sm font-medium rounded-md']"
            >
              Annually
              <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-200 text-indigo-800">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <!-- Subscription Cards - Grid for desktop, stacked for mobile -->
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <!-- Basic Plan -->
          <div class="overflow-hidden bg-white shadow-xl rounded-2xl">
            <div class="p-6">
              <h3 class="text-2xl font-medium text-gray-900">Basic</h3>
              <p class="mt-4 text-gray-500">Essential features to get started</p>
              <div class="mt-6">
                <p class="text-4xl font-extrabold text-gray-900">
                  {{ billing === 'monthly' ? '$9' : '$90' }}
                  <span class="text-base font-medium text-gray-500">
                    /{{ billing === 'monthly' ? 'month' : 'year' }}
                  </span>
                </p>
              </div>
            </div>
            <div class="px-6 py-6 border-t border-gray-200">
              <ul class="space-y-4">
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">10 projects</span>
                </li>
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">5GB storage</span>
                </li>
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">Basic analytics</span>
                </li>
              </ul>
              <div class="mt-8">
                <ion-button expand="block" fill="outline" color="primary">
                  Get started
                </ion-button>
              </div>
            </div>
          </div>

          <!-- Pro Plan (Featured) -->
          <div class="overflow-hidden transform bg-white border-2 border-indigo-600 shadow-xl rounded-2xl md:scale-105">
            <div class="p-6 bg-indigo-600">
              <h3 class="text-2xl font-medium text-white">Pro</h3>
              <p class="mt-4 text-indigo-100">Most popular choice</p>
              <div class="mt-6">
                <p class="text-4xl font-extrabold text-white">
                  {{ billing === 'monthly' ? '$29' : '$290' }}
                  <span class="text-base font-medium text-indigo-100">
                    /{{ billing === 'monthly' ? 'month' : 'year' }}
                  </span>
                </p>
              </div>
            </div>
            <div class="px-6 py-6 border-t border-gray-200">
              <ul class="space-y-4">
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">Unlimited projects</span>
                </li>
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">50GB storage</span>
                </li>
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">Advanced analytics</span>
                </li>
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">Priority support</span>
                </li>
              </ul>
              <div class="mt-8">
                <ion-button expand="block" color="primary">
                  Get started
                </ion-button>
              </div>
            </div>
          </div>

          <!-- Enterprise Plan -->
          <div class="overflow-hidden bg-white shadow-xl rounded-2xl">
            <div class="p-6">
              <h3 class="text-2xl font-medium text-gray-900">Enterprise</h3>
              <p class="mt-4 text-gray-500">For large organizations</p>
              <div class="mt-6">
                <p class="text-4xl font-extrabold text-gray-900">
                  {{ billing === 'monthly' ? '$99' : '$990' }}
                  <span class="text-base font-medium text-gray-500">
                    /{{ billing === 'monthly' ? 'month' : 'year' }}
                  </span>
                </p>
              </div>
            </div>
            <div class="px-6 py-6 border-t border-gray-200">
              <ul class="space-y-4">
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">Unlimited projects</span>
                </li>
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">500GB storage</span>
                </li>
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">Advanced analytics</span>
                </li>
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">24/7 dedicated support</span>
                </li>
                <li class="flex items-start">
                  <ion-icon name="checkmark-circle" class="flex-shrink-0 w-6 h-6 text-green-500"></ion-icon>
                  <span class="ml-3 text-gray-700">Custom integrations</span>
                </li>
              </ul>
              <div class="mt-8">
                <ion-button expand="block" fill="outline" color="primary">
                  Contact sales
                </ion-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';

const billing = ref('monthly');

const toggleBilling = (type) => {
  billing.value = type;
};
</script>
