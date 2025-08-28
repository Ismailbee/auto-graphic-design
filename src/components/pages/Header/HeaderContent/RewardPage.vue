<template>
  <ion-page>
    <page-header label="Rewards" />
    <ion-content :fullscreen="true">
      <div class="rewards-page-container">
        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="Home"
          prevPageRoute="/home"
          currentPageName="Rewards"
          class="pb-3"
        />

        <!-- User Points Summary Card -->
        <ion-card class="points-summary-card">
          <ion-card-header>
            <ion-card-title class="ion-text-center">Your Reward Points</ion-card-title>
          </ion-card-header>
          <ion-card-content class="ion-text-center">
            <div class="points-display">
              <i class="fas fa-star points-icon"></i>
              <span class="points-value">{{ points }}</span>
              <span class="points-label">Points</span>
            </div>
            <div class="progress-container">
              <ion-progress-bar :value="points / 1000" class="points-progress-bar"></ion-progress-bar>
              <p class="progress-text">
                {{ 1000 - (points % 1000) }} points to the next reward tier!
              </p>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Available Rewards Section -->
        <div class="rewards-list-section">
          <h2 class="section-title">Available Rewards</h2>
          <ion-list :inset="true">
            <ion-item v-for="reward in rewards" :key="reward.id" class="reward-item" lines="none">
              <div class="reward-icon-container" :style="{ backgroundColor: reward.iconBg }">
                <i :class="reward.icon"></i>
              </div>
              <ion-label>
                <h2>{{ reward.name }}</h2>
                <p>{{ reward.description }}</p>
              </ion-label>
              <ion-button 
                slot="end" 
                :color="points >= reward.cost ? 'primary' : 'medium'" 
                :disabled="points < reward.cost" 
                @click="redeemReward(reward)"
                class="redeem-button"
              >
                <span class="cost">{{ reward.cost }}</span>
                <i class="fas fa-arrow-right"></i>
              </ion-button>
            </ion-item>
          </ion-list>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import Breadcrumb from '@/components/pages/Breadcrumb.vue';
import pageHeader from '../../Header/pageHeader.vue';
import {
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonProgressBar, IonList, IonItem, IonLabel, IonButton
} from '@ionic/vue';
import { useNotification } from '@/composables/useNotification';

const { addNotification } = useNotification();
const points = ref(320); // User’s current points

const rewards = ref([
  { id: 1, name: '10% Discount', description: 'Use for any purchase', cost: 100, icon: 'fas fa-tag', iconBg: '#e0f2fe' },
  { id: 2, name: 'Free Item', description: 'Get a bonus item free', cost: 250, icon: 'fas fa-gift', iconBg: '#dcfce7' },
  { id: 3, name: 'Exclusive Access', description: 'Join our premium group', cost: 500, icon: 'fas fa-crown', iconBg: '#fef9c3' },
  { id: 4, name: 'Priority Support', description: 'Jump the queue', cost: 750, icon: 'fas fa-headset', iconBg: '#fae8ff' },
]);

function redeemReward(reward) {
  if (points.value >= reward.cost) {
    points.value -= reward.cost;
    addNotification({
      type: 'success',
      message: `You redeemed: ${reward.name}`,
    });
  } else {
    addNotification({
      type: 'error',
      message: 'Not enough points to redeem this reward.',
    });
  }
}
</script>

<style scoped>
.rewards-page-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100%;
}

/* Points Summary Card */
.points-summary-card {
  --background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.05);
  margin-bottom: 24px;
}

.points-summary-card ion-card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #4a5568;
}

.points-display {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
}

.points-icon {
  font-size: 2.5rem;
  color: #f59e0b; /* Amber-400 */
  margin-right: 12px;
}

.points-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.points-label {
  font-size: 1rem;
  font-weight: 500;
  color: #718096;
  margin-left: 8px;
  align-self: flex-end;
  margin-bottom: 8px;
}

.progress-container {
  margin-top: 16px;
}

.points-progress-bar {
  --progress-background: var(--ion-color-primary);
  --buffer-background: #e2e8f0;
  height: 10px;
  border-radius: 5px;
}

.progress-text {
  font-size: 0.875rem;
  color: #4a5568;
  margin-top: 8px;
}

/* Rewards List */
.rewards-list-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  margin-bottom: 16px;
  padding-left: 8px;
}

.reward-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
  --background: #f8fafc;
  display: flex;
  align-items: center;
  padding: 12px;
}

.reward-icon-container {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.reward-icon-container i {
  font-size: 1.5rem;
  color: var(--ion-color-primary);
}

.reward-item ion-label h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.reward-item ion-label p {
  font-size: 0.875rem;
  color: #718096;
}

.redeem-button {
  --border-radius: 12px;
  --box-shadow: none;
  height: 44px;
  font-weight: 600;
}

.redeem-button .cost {
  font-size: 1rem;
  margin-right: 8px;
}

.redeem-button i {
  font-size: 1rem;
}
</style>
