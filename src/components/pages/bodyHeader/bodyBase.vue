<template>
   <!-- Parent Grid -->
      <div class="grid grid-cols-4 gap-4 px-40 py-10 mt-5 bg-primary">
          <!-- Column 1 -->
          <ul class="w-[80px]">
            <SectionTitle title="FAQ" />
            <li class="text-white">Privacy Policy</li>
          </ul>

          <!-- Column 2 -->
          <ul class="w-[95px] border-l pl-3">
           <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
          </ul>

          <!-- Column 3 -->
          <ul class="w-[90px] border-l pl-3">
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
          </ul>

          <!-- Column 4 -->
          <ul class="w-[80px] border-l pl-3">
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
            <li class="text-[#b8b8b8] hover:text-black">Stickers</li>
          </ul>
        </div>   

</template>

<script setup>
import SectionTitle from './SectionTitle.vue'

// register components (required in script setup)
defineProps()
defineEmits()


</script>

<style scoped>

</style>
