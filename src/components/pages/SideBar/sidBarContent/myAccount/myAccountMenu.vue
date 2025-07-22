<template>
  <ion-item
    button
    lines="none"
    @click="$emit('click')"
    class="flex items-center justify-center pt-3 pb-3 pl-4 pr-4 my-2 text-white transition group"
  >
    <div class="rounded-full w-[50px] h-[50px] overflow-hidden border-4 border-contrast">
      <img :src="userStore.profileImageUrl" alt="profile" class="object-cover w-full h-full" />
    </div>

   <ion-label class="text-[15px] group-hover:text-contrast ml-3">
      {{ displayName }}
    </ion-label>

  </ion-item>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const displayName = computed(() =>
  userStore.fullName || userStore.username || 'My Profile'
)

defineEmits(['click'])
</script>

