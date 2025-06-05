<template>
  <ion-app>
    <Sidebar />
    <ion-router-outlet id="main-content" menu="main-menu" />
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import Sidebar from './pages/Sidebar.vue'

// No need for manual component registration in <script setup>
</script>

<style>
/* Global styles if needed */
</style>