<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-menu-button />
      </ion-buttons>
      <ion-title>{{ title }}</ion-title>
    </ion-toolbar>
    <ion-toolbar>
        <div><img src="../image" alt=""></div>
      <ion-segment :value="currentSegment" @ionChange="onSegmentChange">
        <ion-segment-button value="home" router-link="/home">
          <ion-label>Home</ion-label>
        </ion-segment-button>
        <ion-segment-button value="scheduling" router-link="/scheduling">
          <ion-label>Scheduling</ion-label>
        </ion-segment-button>
        <ion-segment-button value="legal" router-link="/legal">
          <ion-label>Legal</ion-label>
        </ion-segment-button>
        <ion-segment-button value="help" router-link="/help">
          <ion-label>Help</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-toolbar>
  </ion-header>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const route = useRoute();
const currentSegment = ref(route.name?.toLowerCase() || 'home');

watch(
  () => route.name,
  (newName) => {
    if (newName) {
      currentSegment.value = newName.toLowerCase();
    }
  }
);

function onSegmentChange(event) {
  const selected = event.detail.value;
  router.push({ name: selected.charAt(0).toUpperCase() + selected.slice(1) });
}
</script>
