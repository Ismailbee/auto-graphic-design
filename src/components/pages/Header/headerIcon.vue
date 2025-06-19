<template>
  <div 
    @click="$emit('click')" 
    class="flex flex-no-wrap items-center justify-center w-full h-full mx-2 my-1"
  >
    <div class="flex items-center justify-center bg-gradient-to-b from-[#BA6900]/80 via-white/10 to-transparent h-[33px] w-[33px] rounded-full backdrop-blur-md shadow-md cursor-pointer transition">
      <div class="flex items-center justify-center h-[25px] w-[25px] bg-[#ca790f] rounded-full cursor-pointer transition">
        <ion-icon :icon="icon" class="text-lg text-white " />
      </div>
    </div>
    <span class="text-[12px] mt-1 ml-3 font-medium text-[#502800] whitespace-nowrap">
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
