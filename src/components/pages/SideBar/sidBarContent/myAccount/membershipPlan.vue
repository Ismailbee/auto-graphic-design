<template>
  <ion-page>
    <page-header>Membership Plan</page-header>

    <ion-content class="p-6 bg-[#f8f9fa]">

      <!-- Current Plan -->
      <ion-card class="shadow-md rounded-lg">
        <ion-card-header>
          <ion-card-title class="text-lg font-semibold">Your Current Plan</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p class="text-xl font-bold text-primary">Pro+ Plan</p>
          <p class="text-gray-600">Renews on: <strong>September 15, 2025</strong></p>
          <p class="text-gray-800 mt-2">₦8,500 / month</p>
        </ion-card-content>
      </ion-card>

      <!-- Usage Graph -->
      <ion-card class="shadow-md rounded-lg mt-4">
        <ion-card-header>
          <ion-card-title class="text-lg font-semibold">Usage This Month</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <canvas id="usageChart" height="150"></canvas>
        </ion-card-content>
      </ion-card>

      <!-- Available Plans -->
      <div class="mt-6">
        <h2 class="text-lg font-semibold mb-2">Upgrade or Change Plan</h2>
        <ion-list>
          <ion-item
            v-for="plan in plans"
            :key="plan.name"
            class="hover:bg-gray-100 transition rounded-lg"
          >
            <ion-label>
              <h3 class="font-semibold">{{ plan.name }}</h3>
              <p>{{ plan.desc }}</p>
            </ion-label>
            <div slot="end" class="text-right">
              <p class="font-bold">{{ plan.price }}</p>
              <ion-button
                color="primary"
                size="small"
                @click="upgradePlan(plan.name)"
              >
                Select
              </ion-button>
            </div>
          </ion-item>
        </ion-list>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { onMounted } from 'vue'
import Chart from 'chart.js/auto'
import pageHeader from '@/components/pages/Header/pageHeader.vue'
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton
} from '@ionic/vue'

const plans = [
  { name: 'Basic', desc: 'Essential features for personal use.', price: '₦3,500 / mo' },
  { name: 'Pro+', desc: 'Advanced tools for growing teams.', price: '₦8,500 / mo' },
  { name: 'Enterprise', desc: 'Full suite with premium support.', price: '₦20,000 / mo' }
]

const upgradePlan = (planName) => {
  console.log(`User selected: ${planName}`)
  // You can add a modal or payment process here
}

onMounted(() => {
  const ctx = document.getElementById('usageChart')
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Usage (%)',
          data: [50, 75, 60, 90],
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  })
})
</script>

<style scoped>
canvas {
  max-width: 100%;
}
</style>
