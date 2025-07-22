<template>
   <!-- Parent Grid -->
      <div class="grid gap-10 sm:py-10 py-4 mt-5 mb-[75px] sm:mb-0 bg-black sm:px-40 px-[30px] sm:grid-cols-4 sm:bg-primary">
          <!-- Column 1 -->
          <ul class="grid grid-cols-2 gap-5 p-5 border rounded-lg border-[#545454] sm:border-none sm:block">
          <ul>
            <SectionTitle title="FAQ" />
            <li class="text-white text-[13px]">Privacy Policy</li>
            <li class="text-white text-[13px]">Privacy Setting</li>
            <li class="text-white text-[13px]">Privacy Preferences</li>
              
          </ul>
              <ul class="pl-5 sm:pl-0 border-l sm:border-none border-[#a3a3a3] sm:mt-3">
                <SectionTitle title="About" />
                <li class="text-white text-[13px]">Privacy Policy</li>
                <li class="text-white text-[13px]">Privacy Setting</li>
                <li class="text-white text-[13px]">Privacy Preferences</li>
              </ul>
              
              <ul class="hidden mt-3 sm:block min-w-[100px]">
                <SectionTitle title="Company" />
                <li class="text-white text-[13px]">Pricing</li>
                <li class="text-white text-[13px]">Careers</li>
                <li class="text-white text-[13px]">Contact Us</li>
                <li class="text-white text-[13px]">Resources</li>
                <li class="text-white text-[13px]">News</li>
                <li class="text-white text-[13px]">Blog</li>
                <li class="text-white text-[13px]">Help Center</li>
                <li class="text-white text-[13px]">Tutorials</li>
              </ul>
          </ul>
          
          <!-- Column 2 -->
          <ul class="hidden sm:block">
            <SectionTitle title="Features" />
            <li class="text-white text-[13px]">Design Online</li>
            <li class="text-white text-[13px]">Ai-Powered Design</li>
            <li class="text-white text-[13px]">Post Maker</li>
            <li class="text-white text-[13px]">Banner Maker</li>
            <li class="text-white text-[13px]">Invitation Maker</li>
            <li class="text-white text-[13px]">Presentation Maker</li>
            <li class="text-white text-[13px]">Lockable Design</li>
            <li class="text-white text-[13px]">Branded Template</li>
            <li class="text-white text-[13px]">Template</li>
            <li class="text-white text-[13px]">PDF Editor</li>
            <li class="text-white text-[13px]">Background Remover</li>
            <li class="text-white text-[13px]">Image Resizer</li>
            <li class="text-white text-[13px]">Animator</li>
          </ul>
          
          <!-- Column 3 -->
          <ul class="hidden sm:block min-w-[150px]">
            <ul class="flex items-center">
           <ul class="w-full h-[0.1px] mr-2 bg-contrast"></ul> <SectionTitle title="Templates" /><ul class="w-full h-[0.1px] ml-2 bg-contrast"></ul>  
            </ul>
            <li class="text-white text-[13px]">Banner</li>
            <li class="text-white text-[13px]">Social Posts</li>
            <li class="text-white text-[13px]">Business cards</li>
            <li class="text-white text-[13px]">Flyers</li>
            <li class="text-white text-[13px]">Magazine & Newsletters</li>
            <li class="text-white text-[13px]">Price list & Menus</li>
            <li class="text-white text-[13px]">Posters</li>
            <li class="text-white text-[13px]">Greeting cards</li>
            <li class="text-white text-[13px]">Invitations</li>
            <li class="text-white text-[13px]">Certificates</li>
            <li class="text-white text-[13px]">Resumes & CVS</li>
          </ul>
          
          <!-- Column 4 -->
          <ul class="hidden sm:block">
            <SectionTitle title="Social Medial" />
            <li class="text-white text-[13px]">Youtube</li>
            <li class="text-white text-[13px]">Instagram</li>
            <li class="text-white text-[13px]">Facebook</li>
            <li class="text-white text-[13px]">Linkedin</li>
            <li class="text-white text-[13px]">Twitter</li>
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
