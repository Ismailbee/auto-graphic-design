<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Edit Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-avatar class="ion-margin">
        <img :src="avatar" />
      </ion-avatar>

      <input type="file" accept="image/*" @change="onImageChange" />

      <ion-list>
        <ion-item>
          <ion-label position="stacked">Full Name</ion-label>
          <ion-input v-model="fullName" />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Username</ion-label>
          <ion-input v-model="username" />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input v-model="email" />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Phone</ion-label>
          <ion-input v-model="phone" />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Bio</ion-label>
          <ion-textarea v-model="bio" />
        </ion-item>
      </ion-list>

      <ion-button expand="block" @click="saveProfile">Save</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonContent, IonAvatar, IonList, IonItem,
  IonLabel, IonInput, IonTextarea, IonButton
} from '@ionic/vue'


const user = useUserStore()
const router = useRouter()

const avatar = ref(user.avatar)
const fullName = ref(user.fullName)
const username = ref(user.username)
const email = ref(user.email)
const phone = ref(user.phone)
const bio = ref(user.bio)

const onImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      avatar.value = reader.result
    }
    reader.readAsDataURL(file)
  }
}

const saveProfile = () => {
  user.updateProfile({
    avatar: avatar.value,
    fullName: fullName.value,
    username: username.value,
    email: email.value,
    phone: phone.value,
    bio: bio.value
  })
  router.push('/myAccountPage')
}
</script>


<style scoped>
ion-avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  cursor: pointer;
}
</style>
