<template>
  <ion-page>
   <page-header label="Rewards" />
  <ion-content>
      <div class="bg-secondary min-h-screen w-full sm:px-[80px] p-5 sm:py-8">
        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="Home"
          prevPageRoute="/home"
          currentPageName="Rewards"
          class="pb-3"
        />

         <!-- User Points Summary -->
      <div class="rounded-lg border-[1px] border-contrast p-4 mb-4">
        <ion-card-header>
          <ion-card-title>Reward Points</ion-card-title>
          <ion-card-subtitle>You have {{ points }} points</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-progress-bar :value="points / 1000" color="tertiary"></ion-progress-bar>
          <div class="mt-2 text-sm">Progress to next level: {{ Math.floor((points / 1000) * 100) }}%</div>
        </ion-card-content>
      </div>

      <!-- Redeemable Rewards -->
      <div>
        <ion-list-header>
          <h6>Available Rewards</h6>
        </ion-list-header>

        <ion-item v-for="reward in rewards" :key="reward.id">
          <ion-label>
            <h2>{{ reward.name }}</h2>
            <p>{{ reward.description }}</p>
          </ion-label>
          <ion-button slot="end" color="brand" :disabled="points < reward.cost" @click="redeemReward(reward)">
            Redeem ({{ reward.cost }})
          </ion-button>
        </ion-item>
      </div>


      </div>

     
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import Breadcrumb from '@/components/pages/Breadcrumb.vue'
import pageHeader from '../../Header/pageHeader.vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonProgressBar, IonList, IonListHeader, IonItem, IonLabel, IonButton
} from '@ionic/vue'

const points = ref(320) // User’s current points

const rewards = ref([
  { id: 1, name: '10% Discount', description: 'Use for any purchase', cost: 100 },
  { id: 2, name: 'Free Item', description: 'Get a bonus item free', cost: 250 },
  { id: 3, name: 'Exclusive Access', description: 'Join our premium group', cost: 500 },
])

function redeemReward(reward) {
  if (points.value >= reward.cost) {
    points.value -= reward.cost
    alert(`You redeemed: ${reward.name}`)
  }
}
</script>

<style scoped>
.text-sm {
  font-size: 14px;
}
</style>
