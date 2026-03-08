<template>
  <ion-page>
    <!-- Header -->
    <page-header label="Token" />

    <ion-content >

     <div class="bg-secondary min-h-screen w-full sm:px-[80px] pb-[130px] p-5 sm:py-8">
        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="Home"
          prevPageRoute="/home"
          currentPageName="Token"
          class="pb-3"
        />

       <!-- Token Balance Card -->
      <div class="rounded-2xl text-center">
        <div>
          <h5 class="text-4xl font-bold text-primary">
            {{ tokens }} TOK
          </h5>
          <p class="text-gray-500 text-sm">Available Balance</p>
        </div>

        <ion-card-content>
          <button class="rounded-xl bg-contrast p-2 px-20 text-white shadow-md hover:scale-[1.02] transition"
            @click="addTokens"
          >
            ➕ Add Tokens
          </button>
        </ion-card-content>
      </div>

      <!-- Transaction History -->
      <ion-list class="mt-6 rounded-2xl shadow-sm bg-white p-2">
        <ion-list-header class="bg-gray-100 rounded-t-2xl">
          <ion-label class="font-semibold text-gray-700">📜 Transaction History</ion-label>
        </ion-list-header>

        <ion-item
          v-for="(tx, index) in transactions"
          :key="index"
          class="hover:bg-gray-50 transition"
        >
          <ion-label>
            <h2 class="font-semibold text-gray-800">{{ tx.description }}</h2>
            <p class="text-xs text-gray-500">{{ tx.date }}</p>
          </ion-label>

          <ion-badge
            :color="tx.amount.startsWith('+') ? 'success' : 'danger'"
            slot="end"
            class="text-sm px-3 py-1 rounded-lg shadow-sm"
          >
            {{ tx.amount }} TOK
          </ion-badge>
        </ion-item>
      </ion-list>
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

<style scoped>
ion-badge {
  font-weight: 600;
}
</style>
