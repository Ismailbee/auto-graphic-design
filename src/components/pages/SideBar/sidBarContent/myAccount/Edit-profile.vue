<template>
  <ion-page>
    <page-header label="Edit Profile" />

    <ion-content>
      <div class="bg-secondary min-h-screen w-full sm:px-[80px] pb-3 sm:py-8">
        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="My Account"
          prevPageRoute="/myAccountPage"
          currentPageName="Edit Profile"
          class="pb-3"
        />

        <!-- Grid Layout -->
        <div class="lg:grid grid-cols-2 gap-8">
          <!-- Left Column -->
          <div>
            <ion-list class="p-5">
              <!-- Avatar Upload -->
              <div class="flex flex-col items-center mb-6">
                <div
                  class="w-[120px] h-[120px] rounded-full border-[3px] border-contrast overflow-hidden cursor-pointer"
                  @click="triggerFileInput"
                >
                  <img
                    :src="avatar || defaultAvatar"
                    class="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  class="hidden"
                  accept="image/*"
                  @change="onImageChange"
                />
              </div>

              <!-- Profile Fields -->
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
                <ion-select
                  v-model="country"
                  interface="popover"
                  placeholder="Select Country"
                >
                  <ion-select-option
                    v-for="c in countries"
                    :key="c.code"
                    :value="c.name"
                  >
                    {{ c.flag }} {{ c.name }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
            </ion-list>
          </div>

          <!-- Right Column -->
          <div class="px-8">
            <!-- Bio -->
            <ion-item>
              <ion-label position="stacked">Bio</ion-label>
              <ion-textarea v-model="bio" rows="3" />
            </ion-item>

            <!-- Member Since -->
            <ion-item>
              <ion-label position="stacked">Member Since</ion-label>
              <ion-input v-model="member" />
            </ion-item>

            <!-- Gender & Language -->
            <div class="flex gap-4 mt-3 ml-4">
              <ion-item class="border-[0.9px] border-primary rounded-2xl flex-1">
                <ion-label position="stacked">Gender</ion-label>
                <ion-select
                  v-model="gender"
                  interface="popover"
                  placeholder="Select Gender"
                  class="ion-text-center"
                >
                  <ion-select-option value="Male">Male</ion-select-option>
                  <ion-select-option value="Female">Female</ion-select-option>
                  <ion-select-option value="Other">Other</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item class="border-[0.9px] border-primary rounded-2xl flex-1">
                <ion-label position="stacked">Language</ion-label>
                <ion-select
                  v-model="language"
                  interface="popover"
                  placeholder="Select Language"
                  class="ion-text-center"
                >
                  <ion-select-option value="English">English</ion-select-option>
                  <ion-select-option value="French">French</ion-select-option>
                  <ion-select-option value="Spanish">Spanish</ion-select-option>
                  <ion-select-option value="Arabic">Arabic</ion-select-option>
                </ion-select>
              </ion-item>
            </div>

            <!-- Date of Birth -->
            <div class="mt-3 ml-4">
              <ion-label class="text-[13px]">Date of Birth</ion-label>
              <div class="flex gap-3 w-full mt-1">
                <!-- Day -->
                <div class="px-3 flex border-[0.9px] border-primary rounded-lg flex-1">
                  <ion-select v-model="dobDay" placeholder="Day" interface="popover">
                    <ion-select-option v-for="day in 31" :key="day" :value="day">
                      {{ day }}
                    </ion-select-option>
                  </ion-select>
                </div>

                <!-- Month -->
                <div class="px-3 flex border-[0.9px] border-primary rounded-lg flex-1">
                  <ion-select
                    v-model="dobMonth"
                    placeholder="Month"
                    interface="popover"
                  >
                    <ion-select-option
                      v-for="(month, index) in months"
                      :key="index"
                      :value="index + 1"
                    >
                      {{ month }}
                    </ion-select-option>
                  </ion-select>
                </div>

                <!-- Year -->
                <div class="px-3 flex border-[0.9px] border-primary rounded-lg flex-1">
                  <ion-select v-model="dobYear" placeholder="Year" interface="popover">
                    <ion-select-option
                      v-for="year in years"
                      :key="year"
                      :value="year"
                    >
                      {{ year }}
                    </ion-select-option>
                  </ion-select>
                </div>
              </div>
            </div>

            <!-- Payment Methods -->
            <ion-card class="shadow-none mt-6 w-full rounded-2xl">
              <ion-card-header>
                <ion-card-title class="text-lg font-semibold">
                  Payment Methods
                </ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <!-- Existing Payment Options -->
                <div class="flex justify-between items-center w-full">
                  <div class="flex-1">
                    <div class="mb-4">
                      <img :src="visaLogo" alt="VISA" class="w-[90px]" />
                    </div>
                    <p>**** **** **** 1234</p>
                  </div>

                  <div class="flex-1">
                    <div class="mb-4 block">
                      <img :src="masterCardLogo" alt="MasterCard" class="w-[90px]" />
                    </div>
                    <p>**** **** **** 5678</p>
                  </div>
                </div>

                <!-- Add Payment Method Button -->
                <div class="mt-4">
                  <button
                    class="w-full p-2 text-white rounded-xl bg-primary"
                    @click="showPaymentForm = true"
                  >
                    Add Payment Method
                  </button>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Payment Form Modal -->
            <ion-modal :is-open="showPaymentForm" @didDismiss="showPaymentForm = false">
              <div class="p-6 bg-white rounded-2xl">
                <h2 class="text-lg font-semibold mb-4">Add Payment Method</h2>

                <!-- Card Number -->
                <ion-item class="mb-3">
                  <ion-label position="stacked">Card Number</ion-label>
                  <ion-input
                    placeholder="1234 5678 9012 3456"
                    v-model="newCard.number"
                  ></ion-input>
                </ion-item>

                <!-- Expiry Date -->
                <ion-item class="mb-3">
                  <ion-label position="stacked">Expiry Date</ion-label>
                  <ion-input placeholder="MM/YY" v-model="newCard.expiry"></ion-input>
                </ion-item>

                <!-- CVV -->
                <ion-item class="mb-3">
                  <ion-label position="stacked">CVV</ion-label>
                  <ion-input
                    placeholder="123"
                    type="password"
                    v-model="newCard.cvv"
                  ></ion-input>
                </ion-item>

                <!-- Modal Actions -->
                <div class="flex justify-end gap-3 mt-4">
                  <ion-button fill="clear" @click="showPaymentForm = false">Cancel</ion-button>
                  <ion-button @click="savePaymentMethod">Save</ion-button>
                </div>
              </div>
            </ion-modal>

            <!-- Save Profile Button -->
            <button
              class="mt-6 p-5 w-full text-white bg-contrast rounded-md transition-all duration-200 hover:scale-105 cursor-pointer"
              @click="saveProfile"
            >
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
import visaLogo from '@/assets/logo/Visa.png'
import masterCardLogo from '@/assets/logo/masterCard.png'
import pageHeader from '@/components/pages/Header/pageHeader.vue'
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


const country = ref(user.country || '')
const countries = [
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬' },
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪' }
]


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


const dobDay = ref('')
const dobMonth = ref('')
const dobYear = ref('')

// Month names
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Generate years dynamically (1900 → current year)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

// Payment Method logic
const addPaymentMethod = () => {
  console.log('Add Payment Method clicked')
  // Open a modal or navigate to "Add Payment" page
}

const showPaymentForm = ref(false)
const newCard = ref({
  number: '',
  expiry: '',
  cvv: ''
})

function savePaymentMethod() {
  console.log('New Card Added:', newCard.value)
  // Here you could push the new card to a payment list
  showPaymentForm.value = false
}

</script>

<style scoped>
ion-item {
  --highlight-color-focused: var(--ion-color-primary);
}

ion-select-option img {
  vertical-align: middle;
}
</style>