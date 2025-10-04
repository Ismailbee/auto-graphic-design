<template>
  <div class="w-full max-w-7xl mx-auto py-10 px-4 relative">
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold text-primary mb-2">Explore Design Templates</h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Choose from a variety of professionally crafted templates to jumpstart your next project. Customize, preview, and use them for invitations, flyers, business cards, and more!
      </p>
    </div>

    <!-- Filter/Search Bar -->
    <div
      class="flex flex-col sm:flex-row items-center border-[1.5px] border-contrast rounded-lg p-3 justify-between gap-4 mb-8"
    >
      <div class="flex gap-2 w-full sm:w-auto">
        <input
          v-model="search"
          placeholder="Search templates..."
          class="w-full sm:w-[484px] bg-[#f8f8f8] p-2 mr-6"
        />
        <ion-select v-model="selectedCategory" placeholder="Category" interface="popover" class="w-40">
          <ion-select-option value="">All</ion-select-option>
          <ion-select-option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</ion-select-option>
        </ion-select>
      </div>

      <!-- Create button -->
      <button
        @click="createTemplate"
        class="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#f6ebcd] to-[#e2c98f] text-black font-semibold px-6 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
      >
        <ion-icon :icon="addOutline" class="animate-pulse" />
        <span class="relative z-10">Create New Template</span>
        <span
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-out"
        ></span>
      </button>
    </div>

    <!-- Masonry Grid -->
    <div class="columns-1 sm:columns-2 lg:columns-4 gap-4 space-y-4">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="relative break-inside-avoid overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition group cursor-pointer"
      >
        <!-- Template Image -->
        <img
          :src="template.image"
          :alt="template.category"
          class="w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <!-- Category Tag -->
        <div
          class="absolute top-3 left-3 bg-contrast text-white px-3 py-1 rounded-full text-xs font-bold
                 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
                 transition-all duration-500 ease-out"
        >
          {{ template.category }}
        </div>

        <!-- Action Bar -->
        <div
          class="absolute top-0 right-0 flex items-center gap-2
                 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0
                 transition-all duration-500 ease-out"
        >
          <!-- Like -->
          <button @click="toggleLike(template)" class="rounded-full p-0">
            <ion-icon :icon="template.liked ? star : starOutline" class="text-yellow-500 text-xl" />
          </button>

          <!-- Menu -->
          <div class="relative" ref="menuWrapper">
            <ion-button @click.stop="openMenu(template.id)" fill="clear" class="rounded-full p-0">
              <ion-icon :icon="ellipsisVertical" class="text-white text-md" />
            </ion-button>

            <!-- Dropdown -->
            <div
              v-if="activeMenu === template.id"
              class="dropdown-menu absolute right-3 top-8 mt-2 w-[110px] text-[12px] bg-white rounded-xl shadow-lg border p-2 z-20"
            >
              <button
                class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                @click="previewTemplate(template)"
              >
                <ion-icon :icon="eyeOutline" /> Preview
              </button>
              <button class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                <ion-icon :icon="createOutline" /> Edit
              </button>
              <button class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                🌐 Translate
              </button>
              <button
                class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 text-red-600"
              >
                🚩 Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="filteredTemplates.length === 0" class="text-center text-gray-500 mt-16">
      <ion-icon :icon="sadOutline" class="text-4xl mb-2" />
      <div>No templates found for your search.</div>
    </div>

    <!-- Preview Modal -->
    <ion-modal :is-open="showPreview" @didDismiss="showPreview = false">
      <div class="p-6 flex flex-col items-center">
        <img :src="previewedTemplate?.image" class="w-full max-w-md rounded-lg shadow mb-4" />
        <h3 class="text-xl font-bold mb-2">{{ previewedTemplate?.title }}</h3>
        <p class="text-gray-600 mb-4">{{ previewedTemplate?.description }}</p>
        <ion-button color="primary" @click="showPreview = false">Close</ion-button>
      </div>
    </ion-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { IonButton, IonSelect, IonSelectOption, IonIcon, IonModal } from '@ionic/vue'
import { star, starOutline, ellipsisVertical, eyeOutline, createOutline, addOutline, sadOutline } from 'ionicons/icons'

const categories = ['Invitation', 'Flyer', 'Business Card', 'Poster', 'Social Media', 'Certificate']

const activeMenu = ref(null)
function openMenu(id) {
  activeMenu.value = activeMenu.value === id ? null : id
}
function handleClickOutside(event) {
  const menus = document.querySelectorAll('.dropdown-menu')
  let clickedInside = false
  menus.forEach(menu => {
    if (menu.contains(event.target)) clickedInside = true
  })
  if (!clickedInside) activeMenu.value = null
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

function toggleLike(template) {
  template.liked = !template.liked
}

const templates = ref([
  { id: 1, category: 'Invitation', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=400&fit=crop' }, // Square
  { id: 2, category: 'Flyer', image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=600&h=300&fit=crop' },   // Wide
  { id: 3, category: 'Business Card', image: 'https://images.unsplash.com/photo-1522205152479-6cc64b100d8b?w=300&h=600&fit=crop' }, // Tall
  { id: 4, category: 'Poster', image: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=500&h=700&fit=crop' },
  { id: 5, category: 'Social Media', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=800&fit=crop' }, // Bigger square
  { id: 6, category: 'Certificate', image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=700&h=500&fit=crop' },

  { id: 7, category: 'Poster', image: 'https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?w=600&h=800&fit=crop' },
  { id: 8, category: 'Social Media', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=600&fit=crop' },
  { id: 9, category: 'Certificate', image: 'https://images.unsplash.com/photo-1612831662375-295c73855a05?w=600&h=400&fit=crop' },
  { id: 10, category: 'Poster', image: 'https://images.unsplash.com/photo-1508780709619-79562169bc64?w=600&h=900&fit=crop' },
  { id: 11, category: 'Social Media', image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&h=800&fit=crop' },
  { id: 12, category: 'Social Media', image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&h=600&fit=crop' },

  { id: 13, category: 'Certificate', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=700&h=500&fit=crop' },
  { id: 14, category: 'Flyer', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600&h=300&fit=crop' },
  { id: 15, category: 'Business Card', image: 'https://images.unsplash.com/photo-1616627989028-5f64b36b3adf?w=300&h=600&fit=crop' },
  { id: 16, category: 'Invitation', image: 'https://images.unsplash.com/photo-1607083206173-9cbb97ab3d10?w=400&h=400&fit=crop' },
  { id: 17, category: 'Flyer', image: 'https://images.unsplash.com/photo-1522204523234-8726d84c4a5c?w=600&h=300&fit=crop' },
  { id: 18, category: 'Business Card', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=600&fit=crop' },

  { id: 19, category: 'Poster', image: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=500&h=700&fit=crop' },
  { id: 20, category: 'Social Media', image: 'https://images.unsplash.com/photo-1506765515384-028b60a970df?w=800&h=800&fit=crop' },
  { id: 21, category: 'Certificate', image: 'https://images.unsplash.com/photo-1625246333195-01f9af70906f?w=700&h=500&fit=crop' },
  { id: 22, category: 'Poster', image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=900&fit=crop' },
  { id: 23, category: 'Social Media', image: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=600&h=600&fit=crop' },
  { id: 24, category: 'Certificate', image: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=700&h=500&fit=crop' },

  { id: 25, category: 'Poster', image: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=600&h=900&fit=crop' },
  { id: 26, category: 'Social Media', image: 'https://images.unsplash.com/photo-1581092919551-77f5ec17cdb9?w=800&h=800&fit=crop' },
  { id: 27, category: 'Social Media', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=600&fit=crop' },
  { id: 28, category: 'Certificate', image: 'https://images.unsplash.com/photo-1584697964154-489421fb81d1?w=700&h=500&fit=crop' },
  { id: 29, category: 'Flyer', image: 'https://images.unsplash.com/photo-1504691342899-8d2d2c34dc94?w=600&h=300&fit=crop' },
  { id: 30, category: 'Business Card', image: 'https://images.unsplash.com/photo-1620912189865-5dffdc1c7a0a?w=300&h=600&fit=crop' }
])


const search = ref('')
const selectedCategory = ref('')
const showPreview = ref(false)
const previewedTemplate = ref(null)

const filteredTemplates = computed(() =>
  templates.value.filter(t => {
    const matchCat = selectedCategory.value ? t.category === selectedCategory.value : true
    const matchSearch = t.category.toLowerCase().includes(search.value.toLowerCase())
    return matchCat && matchSearch
  })
)

function previewTemplate(template) {
  previewedTemplate.value = template
  showPreview.value = true
}
function createTemplate() {
  alert('Redirecting to template creation...')
}
</script>

<style scoped>
.text-primary {
  color: #502800;
}
.break-inside-avoid {
  break-inside: avoid;
}
</style>
