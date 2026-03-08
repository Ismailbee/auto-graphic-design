<template>
  <div 
    @click="$emit('click')" 
    class="flex flex-col items-center justify-center w-full h-full mx-2 my-1"
  >
      <div class="flex items-center justify-center h-[30px] w-[30px] bg-[#ca790f] rounded-full cursor-pointer transition">
        <ion-icon :icon="icon" class="text-lg text-white " />
      </div>
    
    <span class="text-[12px] mt-1 font-medium text-white">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps({
  icon: [Object, String],  // Remember to use Object
  label: String
})
defineEmits(['click'])
</script>
