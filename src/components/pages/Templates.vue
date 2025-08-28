<template>
  <div class="w-full max-w-7xl mx-auto py-10 px-4">
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold text-primary mb-2">Explore Design Templates</h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Choose from a variety of professionally crafted templates to jumpstart your next project. Customize, preview, and use them for invitations, flyers, business cards, and more!
      </p>
    </div>

    <!-- Filter/Search Bar -->
    <div class="flex flex-col sm:flex-row items-center border-[1.5px] border-contrast rounded-lg p-3 justify-between gap-4 mb-8">
      <div class="flex gap-2 w-full sm:w-auto">
        <input
          v-model="search"
          placeholder="Search templates..."
          class="w-full sm:w-[484px] bg-[#f8f8f8] p-2 mr-6"
          clear-input
        />
        <ion-select v-model="selectedCategory" placeholder="Category" interface="popover" class="w-40">
          <ion-select-option value="">All</ion-select-option>
          <ion-select-option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</ion-select-option>
        </ion-select>
      </div>
      <button 
        color="contrast" 
        @click="createTemplate"
        class="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#f6ebcd] to-[#e2c98f] text-black font-semibold px-6 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
      >
        <ion-icon name="start" :icon="addOutline" class="animate-pulse" />
        <span class="relative z-10">Create New Template</span>

        <!-- Animated glow overlay -->
        <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-out"></span>
      </button>

    </div>

    <!-- Templates Grid -->
    <div class="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <ion-card
        v-for="template in filteredTemplates"
        :key="template.id"
        class="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition group flex flex-col"
      >
        <div class="relative w-full aspect-[4/3] overflow-hidden">
          <img
            :src="template.image"
            :alt="template.title"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div class="absolute top-3 left-3 bg-contrast text-white px-3 py-1 rounded-full text-xs font-bold">
            {{ template.category }}
          </div>
        </div>
        <ion-card-header class="p-4 flex flex-col flex-1">
          <ion-card-title class="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
            {{ template.title }}
          </ion-card-title>
          <ion-card-subtitle class="text-sm text-gray-500 mb-2">
            {{ template.description }}
          </ion-card-subtitle>
          <div class="mt-auto flex gap-2">
            <ion-button size="small" color="primary" @click="previewTemplate(template)">
              <ion-icon name="start" :icon="eyeOutline" /> Preview
            </ion-button>
            <button class="py-2 px-4 border-[1.5px] border-contrast"  @click="useTemplate(template)">
              <ion-icon name="start" :icon="createOutline" /> Use
            </button>
          </div>
        </ion-card-header>
      </ion-card>
    </div>

    <!-- No Results -->
    <div v-if="filteredTemplates.length === 0" class="text-center text-gray-500 mt-16">
      <ion-icon :icon="sadOutline" class="text-4xl mb-2" />
      <div>No templates found for your search.</div>
    </div>

    <!-- Preview Modal -->
    <ion-modal :is-open="showPreview" @didDismiss="showPreview = false">
      <div class="p-6 flex flex-col items-center">
        <img :src="previewedTemplate?.image" :alt="previewedTemplate?.title" class="w-full max-w-md rounded-lg shadow mb-4" />
        <h3 class="text-xl font-bold mb-2">{{ previewedTemplate?.title }}</h3>
        <p class="text-gray-600 mb-4">{{ previewedTemplate?.description }}</p>
        <ion-button color="primary" @click="showPreview = false">Close</ion-button>
      </div>
    </ion-modal>
    <!-- See more -->
    <div class="text-center mt-10">
      <button @click="templates" class="px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-300">
        See More Templates
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonInput, IonSelect, IonSelectOption, IonIcon, IonModal } from '@ionic/vue'
import { addOutline, eyeOutline, createOutline, sadOutline } from 'ionicons/icons'

// Example categories
const categories = [
  'Invitation',
  'Flyer',
  'Business Card',
  'Poster',
  'Social Media',
  'Certificate'
]

// Example templates data
const templates = ref([
  {
    id: 1,
    title: 'Elegant Wedding Invitation',
    description: 'A classic invitation template for weddings.',
    category: 'Invitation',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: 'Modern Business Flyer',
    description: 'Perfect for promoting your business or event.',
    category: 'Flyer',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'Minimalist Business Card',
    description: 'A clean and professional business card design.',
    category: 'Business Card',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    title: 'Event Poster',
    description: 'Bold and eye-catching poster for any event.',
    category: 'Poster',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    title: 'Instagram Story Template',
    description: 'Stylish template for your social media stories.',
    category: 'Social Media',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    title: 'Certificate of Achievement',
    description: 'Formal certificate template for awards.',
    category: 'Certificate',
    image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80'
  }
])

const search = ref('')
const selectedCategory = ref('')
const showPreview = ref(false)
const previewedTemplate = ref(null)

const filteredTemplates = computed(() => {
  return templates.value.filter(t => {
    const matchesCategory = selectedCategory.value ? t.category === selectedCategory.value : true
    const matchesSearch = t.title.toLowerCase().includes(search.value.toLowerCase()) ||
      t.description.toLowerCase().includes(search.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

function previewTemplate(template) {
  previewedTemplate.value = template
  showPreview.value = true
}

function useTemplate(template) {
  // Here you could navigate to a design editor or start a new project with this template
  alert(`Using template: ${template.title}`)
}

function createTemplate() {
  // Navigate to template creation page or open a modal
  alert('Redirecting to template creation...')
}
</script>

<style scoped>
.text-primary {
  color: #502800;
}
.bg-secondary {
  background-color: #f8f9fa;
}
.aspect-\[4\/3\] {
  position: relative;
  padding-bottom: 75%;
}
.aspect-\[4\/3\] > img {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>