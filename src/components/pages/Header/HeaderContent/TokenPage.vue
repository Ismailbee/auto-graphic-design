<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>My Tokens</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <!-- Token Balance -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Token Balance</ion-card-title>
          <ion-card-subtitle>{{ tokens }} TOK</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-button expand="block" color="success" @click="addTokens">
            Add Tokens
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Token History -->
      <ion-list>
        <ion-list-header>
          <ion-label>Transaction History</ion-label>
        </ion-list-header>

        <ion-item v-for="(tx, index) in transactions" :key="index">
          <ion-label>
            <h2>{{ tx.description }}</h2>
            <p>{{ tx.date }}</p>
          </ion-label>
          <ion-badge color="secondary" slot="end">{{ tx.amount }} TOK</ion-badge>
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
  IonButton, IonList, IonListHeader, IonItem, IonLabel, IonBadge
} from '@ionic/vue'

const tokens = ref(250)

const transactions = ref([
  { description: 'Earned from survey', date: '2025-06-20', amount: '+50' },
  { description: 'Redeemed for discount', date: '2025-06-18', amount: '-100' },
  { description: 'Referral bonus', date: '2025-06-15', amount: '+300' },
])

function addTokens() {
  tokens.value += 100
  transactions.value.unshift({
    description: 'Manual top-up',
    date: new Date().toISOString().split('T')[0],
    amount: '+100'
  })
}
</script>
