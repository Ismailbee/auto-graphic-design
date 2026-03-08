<template>
  <div 
    @click="$emit('click')" 
    class="flex  items-center justify-center w-full h-full md:mx-0 lg:mx-2 my-1"
  >
    
      <div class="flex items-center justify-center md:h-[25px] lg:h-[35px] h-[30px] md:w-[25px] lg:w-[35px] w-[30px] bg-[#ca790f] rounded-full cursor-pointer transition">
        <ion-icon :icon="icon" class="text-lg md:text-[15px] lg:text-[18px] text-white " />
      </div>
    
    <span class="text-[12px] md:text-[11px] lg:text-[13px]  mt-1 ml-3 md:ml-1 font-medium text-[#502800] whitespace-nowrap">
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
