<template>
  <div 
    ref="dropdownRef"
    class="relative flex flex-no-wrap items-center justify-center w-full h-full md:mx-0 lg:mx-2 my-1"
  >
    <!-- Circle Button -->
    
      <div
      @click="toggleDropdown" 
       class="flex items-center justify-center md:h-[25px] lg:h-[35px] h-[30px] md:w-[25px] lg:w-[35px] w-[30px] bg-[#ca790f] rounded-full transition">
        <ion-icon :icon="icon" class="text-lg md:text-sm lg:text-[18px] text-white" />
      </div>
    

   <!-- Label and dropdown toggle -->
<div 
  @click="toggleDropdown" 
  class="flex items-center mt-1 space-x-1 cursor-pointer"
>
  <span class="text-[12px] md:text-[11px] font-medium text-[#502800] whitespace-nowrap ml-3 md:ml-1">
    {{ label }}
  </span>

  <ion-icon 
    :icon="labelIcon"
    class="text-lg md:text-[15px] text-[#502800] visible transition-transform duration-200"
    :class="{ 'rotate-180': isOpen }"
  />
</div>


    <!-- Dropdown Menu -->
  <div 
  v-if="isOpen" 
  class="absolute top-full mt-3 left-[160px] -translate-x-1/2 z-10 w-[420px]"
>

      <!-- Message bubble tail -->
      <div class="absolute top-[6px] left-40 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow"></div>

      <!-- Dropdown Content -->
      <div class="mt-3 bg-white text-[12px] rounded-xl shadow-lg py-3 px-4 text-black relative">
        <div class="grid grid-cols-4 gap-4">
          <!-- Column 1 -->
          <ul class="w-[80px]">
            <li @click="navigateTo('/stickers')" class="cursor-pointer text-[#b8b8b8] hover:text-black text-[13px]">Stickers</li>
            <li @click="navigateTo('/receipt')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Receipt</li>
            <li @click="navigateTo('/invoice')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Invoice</li>
            <li @click="navigateTo('/letter-head')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Letter Head</li>
            <li @click="navigateTo('/exercise-book')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Exercise Book</li>
            <li @click="navigateTo('/calendar')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Calendar</li>
            <li @click="navigateTo('/flyer')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Flyer</li>
          </ul>

          <!-- Column 2 -->
          <ul class="w-[95px] border-l pl-3">
            <li @click="navigateTo('/flex-banner')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Flex/Banner</li>
            <li @click="navigateTo('/jotter')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Jotter</li>
            <li @click="navigateTo('/branding')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Branding</li>
            <li @click="navigateTo('/table-calendar')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Table Calendar</li>
            <li @click="navigateTo('/roll-up-stand')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Roll-up Stand</li>
            <li @click="navigateTo('/business-card')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Business Card</li>
            <li @click="navigateTo('/tag')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Tag</li>
          </ul>

          <!-- Column 3 -->
          <ul class="w-[90px] border-l pl-3">
            <li @click="navigateTo('/magazine')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Magazine</li>
            <li @click="navigateTo('/journal')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Journal</li>
            <li @click="navigateTo('/story-book')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Story Book</li>
            <li @click="navigateTo('/register-dairy')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Register/Dairy</li>
            <li @click="navigateTo('/forms')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Forms</li>
            <li @click="navigateTo('/clock-design')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Clock Design</li>
            <li @click="navigateTo('/label')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Label</li>
          </ul>

          <!-- Column 4 -->
          <ul class="w-[80px] border-l pl-3">
            <li @click="navigateTo('/cloth')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Cloth</li>
            <li @click="navigateTo('/status-design')" class="cursor-pointer text-[#b8b8b8] hover:text-black">Status Design</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const isOpen = ref(false)
const dropdownRef = ref(null)

// Props & Emits
defineProps({
  icon: [String, Object],         // or just String if you're always passing SVG strings
  label: String,
  labelIcon: [String, Object],    // <-- fix here
})
defineEmits(['click'])

// Toggle dropdown open/close
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

// Navigation with dropdown close AFTER router push completes
function navigateTo(path) {
  router.push(path).finally(() => {
    isOpen.value = false
  })
}

// Click outside to close
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
ion-icon {
  display: inline-block;
  will-change: transform;
  backface-visibility: hidden;
}

</style>
