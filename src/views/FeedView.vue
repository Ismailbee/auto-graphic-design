<template>
  <ion-page>
    <ion-content :fullscreen="true" class="feed-view">
      <SocialFeed />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent } from '@ionic/vue'
import SocialFeed from '../components/feed/SocialFeed.vue'
</script>

<style scoped>
.feed-view {
  --background: #f8fafc;
}

ion-content {
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}
</style>