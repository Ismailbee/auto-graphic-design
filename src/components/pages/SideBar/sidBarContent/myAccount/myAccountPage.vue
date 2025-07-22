<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>My Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="ion-text-center">
        <ion-avatar class="ion-margin">
          <img :src="user.avatar" />
        </ion-avatar>
        <h2>{{ user.fullName }}</h2>
        <p>{{ user.email }}</p>
        <ion-button fill="outline" size="small" @click="router.push('/Edit-Profile')">
          Edit Profile
        </ion-button>
      </div>

      <ion-list>
        <ion-item>
          <ion-label>Username</ion-label>
          <ion-text slot="end">{{ user.username }}</ion-text>
        </ion-item>
        <ion-item>
          <ion-label>Phone</ion-label>
          <ion-text slot="end">{{ user.phone || 'Not set' }}</ion-text>
        </ion-item>
        <ion-item>
          <ion-label>Bio</ion-label>
          <ion-text slot="end">{{ user.bio || 'No bio yet' }}</ion-text>
        </ion-item>
        <ion-item>
          <ion-label>Member Since</ion-label>
          <ion-text slot="end">{{ formatDate(user.joinDate) }}</ion-text>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonAvatar,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonList
} from '@ionic/vue'


const router = useRouter()
const user = useUserStore()


const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

router.push('/edit-profile')

</script>

<style scoped>
ion-avatar {
  width: 100px;
  height: 100px;
}
</style>
