<template>
  <ion-page>
    <ion-content :fullscreen="true" class="profile-view">
      <ProfilePage :userId="userId || 'current-user'" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent } from '@ionic/vue'
import ProfilePage from '../components/feed/ProfilePage.vue'

const props = defineProps({
  userId: {
    type: String,
    default: 'current-user'
  }
})
</script>

<style scoped>
.profile-view {
  --background: #f8fafc;
}

ion-content {
  --padding-top: 20px;
  --padding-bottom: 20px;
  --padding-start: 0;
  --padding-end: 0;
}
</style>