<template>
  <ion-app>
    <ion-router-outlet :key="$route.fullPath"></ion-router-outlet>
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue'
</script>
