<template>
  <ion-item button lines="none" @click="$emit('click')" class="group text-white bg-transparent hover:bg-[#BA6900] transition flex items-center justify-center h-[2px]  px-4  py-[11px] mx-2 my-1">
    <ion-icon :icon="icon" slot="start" class="text-lg ml-1 mr-4 text-white group-hover:text-[#502800]" />
    <ion-label class="text-[12px]  group-hover:text-[#502800] ">{{ label }}</ion-label>
  </ion-item>
</template>

<script setup>
defineProps({
  icon: String,
  label: String
})
defineEmits(['click'])
</script>

<style>
ion-item{
  --background: transparent;
 
}

</style>