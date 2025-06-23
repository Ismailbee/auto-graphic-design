<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>My Rewards</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <!-- User Points Summary -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Reward Points</ion-card-title>
          <ion-card-subtitle>You have {{ points }} points</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-progress-bar :value="points / 1000" color="tertiary"></ion-progress-bar>
          <div class="mt-2 text-sm">Progress to next level: {{ Math.floor((points / 1000) * 100) }}%</div>
        </ion-card-content>
      </ion-card>

      <!-- Redeemable Rewards -->
      <ion-list>
        <ion-list-header>
          <ion-label>Available Rewards</ion-label>
        </ion-list-header>

        <ion-item v-for="reward in rewards" :key="reward.id">
          <ion-label>
            <h2>{{ reward.name }}</h2>
            <p>{{ reward.description }}</p>
          </ion-label>
          <ion-button slot="end" :disabled="points < reward.cost" @click="redeemReward(reward)">
            Redeem ({{ reward.cost }})
          </ion-button>
        </ion-item>
      </ion-list>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
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
