<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Templates</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="(item, index) in items" :key="index" class="bg-white rounded-2xl shadow-md overflow-hidden">
          <img
            v-if="item.image"
            :src="item.image"
            alt="template preview"
            class="w-full h-40 object-cover border-b"
          />
          <div class="p-4">
            <h3 class="text-lg font-semibold">{{ item.title }}</h3>
            <p v-if="item.location" class="text-sm text-gray-600">{{ item.location }}</p>
            <div class="text-xs text-gray-500 text-right mt-2">| {{ item.time }}</div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>

import { useIonRouter }  from '@ionic/vue'


const items = [
  {
    title: "Saudat Consult Business Centre",
    location: "Gidan Mangoro Minna, Niger State",
    time: "2hrs ago",
    image: "assets/templates/sample1.jpg"
  },
  {
    title: "Update info",
    location: "",
    time: "5 months ago",
    image: "assets/templates/sample2.jpg"
  },
  {
    title: "Advert",
    location: "",
    time: "1 year ago",
    image: "assets/templates/sample3.jpg"
  }
];
</script>

<style scoped>
/* You can still use scoped styles here if needed */
</style>
