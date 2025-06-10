<template>
    <ion-item button lines="none" class="flex items-center justify-center h-[2px] pl-4 pr-4 pt-3 pb-3 text-white">
          <slot></slot>
    </ion-item>
</template>
<script>
export default {
    
}
</script>
<style>
    ion-item{
  --background: transparent;
  --color: #BA6900;
  transition: backround-color 0.3s ease-in-out;
}
ion-item:hover {
  --background: #BA6900;
  
}
</style>