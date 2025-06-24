<template>
  <div 
    @click="$emit('click')" 
    class="flex flex-no-wrap items-center justify-center w-full h-full mx-2 my-1"
  >
    
      <div class="flex items-center justify-center h-[30px] w-[30px] bg-[#ca790f] rounded-full cursor-pointer transition">
        <ion-icon :icon="icon" class="text-lg text-white " />
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
