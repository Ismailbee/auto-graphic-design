<template>
  <ion-app>
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </ion-app>
</template>

<script>
import { IonApp } from '@ionic/vue';

export default {
  components: {
    IonApp
  }
}
</script>
