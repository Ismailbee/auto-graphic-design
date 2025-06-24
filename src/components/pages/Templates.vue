<template>
  <div class="py-8 px-7 sm:px-6 lg:px-[150px]">
    <h1 class="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Our Templates</h1>
    
    <!-- Pinterest-style masonry grid -->
    <div class="columns-2 sm:columns-3 lg:columns-4 gap-4 sm:gap-4 md:gap-6">
      <div 
        v-for="(template, index) in templates" 
        :key="index"
        :class="[
          'bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md overflow-hidden transform transition-all duration-300 ease-in-out mb-4 sm:mb-6',
          'hover:shadow-md sm:hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1',
          'opacity-0 translate-y-10',
          'scroll-animate',
          'break-inside-avoid'  // Prevent cards from splitting across columns
        ]"
        :style="{ transitionDelay: `${index * 100}ms` }"
      >
        <!-- Clickable Image Preview -->
        <div class="relative group overflow-hidden">
          <router-link 
            :to="`/edit/${template.id}`" 
            class="block"
          >
            <img 
              :src="template.previewImage" 
              :alt="template.title"
              class="w-full h-auto object-cover"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end p-[10px]">
              <span class="text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 font-bold text-sm sm:text-base">
                Customize
              </span>
            </div>
          </router-link>
          
          <!-- Three dots menu -->
          <div class="absolute top-2 right-2">
            <button 
              @click.stop="toggleMenu(index)"
              class="p-1 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            <!-- Dropdown menu -->
            <div 
              v-if="activeMenu === index"
              class="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10"
              v-click-outside="closeMenu"
            >
              <div class="py-1">
                <button 
                  @click="downloadTemplate(template)"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button 
                  @click="toggleStar(template)"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" 
                    class="h-4 w-4 mr-2" 
                    :class="{'text-yellow-400 fill-current': template.starred, 'text-gray-400': !template.starred}" 
                    viewBox="0 0 20 20"   
                    stroke="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {{ template.starred ? 'Starred' : 'Star' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Card Content -->
        <div class="p-2 sm:p-4 flex flex-col">
          <h2 class="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2 line-clamp-2">{{ template.title }}</h2>
          <div class="mt-auto flex justify-end">
            <router-link 
              :to="`/edit/${template.id}`" 
              class="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-[#673b0d] text-white rounded-md sm:rounded-lg hover:bg-purple-700 transition"
            >
              Customize
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NamingImg from '@/assets/template/naming Ceremony Memo.jpg';
import Flyer from '@/assets/template/flyer.jpg';
import Stiker from '@/assets/template/Stiker design.jpg';

const router = useRouter();
const activeMenu = ref(null);

const templates = ref([
  { 
    id: 'receipt-1',
    title: 'Elegant Receipt', 
    previewImage: Flyer,
    starred: false
  },
  { 
    id: 'letterhead-1',
    title: 'Corporate Letterhead', 
    previewImage: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    starred: false
  },
  
  { 
    id: 'receipt-2',
    title: 'Minimal Receipt', 
    previewImage: 'https://images.unsplash.com/photo-1600189261867-8e1e0f0535d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    starred: false
  },
  { 
    id: 'letterhead-2',
    title: 'Modern Letterhead', 
    previewImage: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    starred: false
  },
  { 
    id: 'receipt-3',
    title: 'Vintage Receipt', 
    previewImage: Flyer,
    starred: false
  },
  { 
    id: 'letterhead-3',
    title: 'Creative Letterhead', 
    previewImage: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    starred: false
  },
  { 
    id: 'letterhead-4',
    title: 'Islamic Pattern Background', 
    previewImage: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    starred: false
  },
  { 
    id: 'letterhead-5',
    title: 'Masjid Al Nabawi', 
    previewImage: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    starred: false
  },
    { 
    id: 'letterhead-5',
    title: 'Masjid Al Nabawi', 
    previewImage: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    starred: false
  },
    { 
    id: 'letterhead-5',
    title: 'Masjid Al Nabawi', 
    previewImage: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    starred: false
  },
]);

// Toggle dropdown menu
const toggleMenu = (index) => {
  activeMenu.value = activeMenu.value === index ? null : index;
};

// Close menu when clicking outside
const closeMenu = () => {
  activeMenu.value = null;
};

// Download template function
const downloadTemplate = (template) => {
  console.log('Downloading:', template.title);
  // Implement download logic here
  closeMenu();
};

// Toggle star function
const toggleStar = (template) => {
  template.starred = !template.starred;
  closeMenu();
};

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scroll-animate').forEach(el => {
    observer.observe(el);
  });
});
</script>

<style scoped>
.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-animate.opacity-100 {
  opacity: 1;
  transform: translateY(0);
}

/* Ensure text doesn't overflow */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Pinterest-style masonry grid adjustments */
.break-inside-avoid {
  break-inside: avoid;
}

/* Optional: Add some Pinterest-like styling */
.router-link {
  display: block;
}
</style>