<template>
  <ion-item button lines="none" @click="$emit('click')" class="group text-[#BA6900] bg-transparent hover:bg-[#BA6900] transition flex items-center justify-center h-[5px] pl-4 pr-4 pt-3 pb-3 mx-2 my-1">
    <ion-icon :icon="icon" slot="start" class="text-[23px] ml-1 mr-4 text-white group-hover:text-[#502800]" />
    <ion-label class="text-[15px] group-hover:text-white ">{{ label }}</ion-label>
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
.bg-primary { background-color: #502800; }
.bg-contrast { background-color: #BA6900; }

</style>