<template>
  <ion-page>
   <ion-content>

      <div class="bg-[#f4f3f3] h-full w-full  px-[80px] py-8">

        <Breadcrumb
          prevPageName="My Account"
          prevPageRoute="/myAccountPage"
          currentPageName="Edit Profile"
        class="pb-3" />

        
      <div class="lg:grid grid-cols-2">

          <div>
        
        <ion-list class="p-5">
            
          <!-- Avatar Upload -->
            <div class="flex flex-col items-center mb-6">
              <div class="w-[150px] h-[150px] rounded-full border-[3px] border-contrast overflow-hidden cursor-pointer"
                  @click="triggerFileInput">
                <img :src="avatar || defaultAvatar" class="w-full h-full object-cover" />
              </div>
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onImageChange" />
            </div>

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
                <ion-input v-model="email" type="email" />
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Phone</ion-label>
                <ion-input v-model="phone" type="tel" />
              </ion-item>

            <ion-item>
                <ion-label position="stacked">City</ion-label>
                <ion-input v-model="city" />
              </ion-item>

              <ion-item>
                <ion-label position="stacked">State/Province</ion-label>
                <ion-input v-model="stateProvince" />
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Country</ion-label>
                <ion-input v-model="country" />
              </ion-item>
            </ion-list>

          </div>

          <div class="p-5">

              <ion-item>
              <ion-label position="stacked">Bio</ion-label>
              <ion-textarea v-model="bio" rows="3" />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Member Since</ion-label>
              <ion-input v-model="member" />
            </ion-item>

            <!-- Save Button -->
              <button  class="mt-6 p-5 w-full text-white bg-contrast rounded-md transition-all duration-200 hover:scale-105 cursor-pointer" @click="saveProfile">
                Save
              </button>
          </div>

      </div>


      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Breadcrumb from '@/components/pages/Breadcrumb.vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonInput,
  IonTextarea, IonButton
} from '@ionic/vue'

// store
const user = useUserStore()
const router = useRouter()

// fallback image URL
const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'

// bind local fields to store values
const avatar = ref(user.avatar)
const fullName = ref(user.fullName)
const username = ref(user.username)
const email = ref(user.email)
const phone = ref(user.phone)
const bio = ref(user.bio)
const member = ref(user.member)
const city = ref(user.city)
const stateProvince = ref(user.stateProvince)
const country = ref(user.country)

// file input reference
const fileInput = ref(null)

// open file picker
const triggerFileInput = () => {
  fileInput.value.click()
}

// handle image change
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

// save changes to store
const saveProfile = () => {
  user.updateProfile({
    avatar: avatar.value,
    fullName: fullName.value,
    username: username.value,
    email: email.value,
    phone: phone.value,
    bio: bio.value,
    member: member.value,
    city: city.value,
    stateProvince: stateProvince.value,
    country: country.value
  })
  router.push('/myAccountPage')
}
</script>

<style scoped>
ion-item {
  --highlight-color-focused: var(--ion-color-primary);
}
</style>
