<template>
  <ion-item
    button
    lines="none"
    @click="$emit('click')"
    class="menu-item group text-white bg-transparent flex items-center justify-center h-[2px] px-4 py-[11px] mx-2 my-1"
  >
    <ion-icon :icon="icon" slot="start" class="text-lg ml-1 mr-4 text-white group-hover:text-[#502800]" />
    <ion-label class="text-[12px] group-hover:text-[#502800]">{{ label }}</ion-label>
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
ion-item {
  --background: transparent;
}

.menu-item {
  transition:
    background 0.2s,
    color 0.2s,
    box-shadow 0.2s,
    transform 0.18s cubic-bezier(0.4,0.2,0.2,1);
  will-change: transform, box-shadow;
}
.menu-item:hover,
.menu-item:focus {
  background: #BA6900;
  color: #502800;
  transform: scale(1.04) translateY(-2px);
  box-shadow: 0 4px 18px 0 rgba(186,105,0,0.10), 0 1.5px 6px 0 rgba(80,40,0,0.08);
}
.menu-item:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px 0 rgba(186,105,0,0.10);
}
</style>