<template>
   <!-- Parent Grid -->
      <div class="grid gap-10 sm:py-10 py-4  mb-[75px] sm:mb-0 bg-black lg:px-40 md:px-[55px] px-[30px] sm:grid-cols-4 sm:bg-primary">
          <!-- Column 1 -->
          <ul class="grid grid-cols-2 gap-5 p-5 border rounded-lg border-[#545454] sm:border-none sm:block">
          <ul>
            <SectionTitle title="FAQ" />
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Privacy Policy</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Privacy Setting</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Privacy Preferences</li>
              
          </ul>
              <ul class="pl-5 md:pl-0 lg:pl-0 border-l sm:border-none border-[#a3a3a3] sm:mt-3">
                <SectionTitle title="About" />
                <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Privacy Policy</li>
                <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Privacy Setting</li>
                <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Privacy Preferences</li>
              </ul>
              
              <ul class="hidden mt-3 sm:block min-w-[100px]">
                <SectionTitle title="Company" />
                <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Pricing</li>
                <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Careers</li>
                <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Contact Us</li>
                <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Resources</li>
                <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">News</li>
                <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Blog</li>
                <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Help Center</li>
                <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Tutorials</li>
              </ul>
          </ul>
          
          <!-- Column 2 -->
          <ul class="hidden sm:block">
            <SectionTitle title="Features" />
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Design Online</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Ai-Powered Design</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Post Maker</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Banner Maker</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Invitation Maker</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Presentation Maker</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Lockable Design</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Branded Template</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Template</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">PDF Editor</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Background Remover</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Image Resizer</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Animator</li>
          </ul>
          
          <!-- Column 3 -->
          <ul class="hidden sm:block min-w-[150px]">
            <ul class="flex items-center">
           <ul class="w-full h-[0.1px] mr-2 bg-contrast"></ul> <SectionTitle title="Templates" /><ul class="w-full h-[0.1px] ml-2 bg-contrast"></ul>  
            </ul>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Banner</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Social Posts</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Business cards</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Flyers</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Magazine & Newsletters</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Price list & Menus</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Posters</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Greeting cards</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Invitations</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Certificates</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Resumes & CVS</li>
          </ul>
          
          <!-- Column 4 -->
          <ul class="hidden sm:block">
            <SectionTitle title="Social Media" />
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Youtube</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Instagram</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Facebook</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Linkedin</li>
            <li class="text-white text-[13px] xl:text-[13px] md:text-[11px]">Twitter</li>
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
