<template>
  <div class="absolute left-[-80px] top-12 w-[200px] bg-white shadow-lg rounded-lg pb-2">
    
    <div
      button
      lines="none"
      @click="$emit('click')"
      class="flex items-center p-3 text-white transition border-b group"
    >

        <div class="flex flex-col">
          <ion-label class="text-[15px] text-black ml-3">
          {{ displayName }}
        </ion-label>
        
          <ion-label class="text-[10px] text-[#c5c3c3ee] ml-3">
          {{ email }}
        </ion-label>
        </div>
 
    </div>
    
    <ul class="flex flex-col px-2 py-1 text-black">
      <li class="text-[13px] px-4 py-1 rounded-md cursor-pointer hover:bg-gray-100" @click="navigate('/myAccountPage')">Profile</li>
      <li class="text-[13px] px-4 py-1 rounded-md cursor-pointer hover:bg-gray-100">Upgrade to Pro+</li>
      <li class="text-[13px] px-4 py-1 rounded-md cursor-pointer hover:bg-gray-100">Billing</li>
      <li class="text-[13px] px-4 py-1 rounded-md cursor-pointer hover:bg-gray-100">Contact Us</li>
      <li class="text-[13px] px-4 py-1 rounded-md cursor-pointer hover:bg-gray-100">Restart Tour</li>
      <li class="text-[13px] px-4 py-1 rounded-md text-red-600 cursor-pointer hover:bg-gray-100" @click="logout">Log Out</li>
    </ul>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

function navigate(path) {
  router.push(path)
}

function logout() {
  console.log('Logging out...')
}

const displayName = computed(() =>
  userStore.fullName || userStore.username || userStore.email || 'My Profile'
)

const email = computed(() => userStore.email || '')

defineEmits(['click'])
</script>
