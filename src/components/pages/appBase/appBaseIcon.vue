<template>
  <div 
    @click="$emit('click')" 
    class="flex flex-col items-center justify-center w-full h-full mx-2 my-1"
  >
    <div class="flex items-center justify-center h-[33px] w-[33px] rounded-full backdrop-blur-md shadow-md cursor-pointer transition">
     <ion-icon :icon="icon" class="text-lg text-white " />
      
    </div>
    <span class="text-[10px] mt-1  font-medium text-white whitespace-nowrap">
      {{ label }}
    </span>

  </div>
</template>

<script setup>
defineProps({
  icon: Object,  // Remember to use Object
  label: String
})
defineEmits(['click'])
</script>
