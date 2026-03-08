<template>
  <section id="template" class="template-section">
    <div class="template-content">
      <h2 class="template-title">Our Templates</h2>
      <p class="template-subtitle">
        Explore our latest templates and see how we bring creative visions to life
      </p>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          v-for="filter in filters"
          :key="filter"
          :class="['filter-btn', { active: activeFilter === filter }]"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </div>

      <!-- Masonry Grid -->
      <div class="masonry-grid">
        <div
          v-for="template in filteredProjects"
          :key="template.id"
          class="masonry-item"
        >
          <!-- Template Image -->
          <img
            :src="template.image"
            :alt="template.category"
            class="template-image"
            loading="lazy"
          />

          <!-- Category Tag -->
          <div class="category-tag">
            {{ template.category }}
          </div>

          <!-- Action Bar -->
          <div class="action-bar">
            <!-- Like Button -->
            <button class="action-btn like-btn" @click="toggleLike(template)">
              <svg v-if="template.liked" class="icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <svg v-else class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>

            <!-- Menu Button -->
            <div class="menu-wrapper">
              <button class="action-btn menu-btn" @click.stop="openMenu(template.id)">
                <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div v-if="activeMenu === template.id" class="dropdown-menu">
                <button class="dropdown-item" @click="previewTemplate(template)">
                  <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Preview
                </button>
                <button class="dropdown-item" @click="editTemplate(template)">
                  <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit
                </button>
                <button class="dropdown-item">
                  <span class="icon">🌐</span>
                  Translate
                </button>
                <button class="dropdown-item danger" @click="reportTemplate(template)">
                  <span class="icon">🚩</span>
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Template {
  id: number
  title: string
  category: string
  image: string
  description?: string
  liked: boolean
}

// Template filter state
const activeFilter = ref('All')
const filters = ['All', 'Web Design', 'Branding', 'UI/UX', 'Templates']
const activeMenu = ref<number | null>(null)

// Template projects
const projects = ref<Template[]>([
  { id: 1, title: 'E-commerce Platform', category: 'Web Design', image: 'https://picsum.photos/400/300?random=1', liked: false },
  { id: 2, title: 'Brand Identity', category: 'Branding', image: 'https://picsum.photos/400/500?random=2', liked: false },
  { id: 3, title: 'Mobile App Design', category: 'UI/UX', image: 'https://picsum.photos/400/600?random=3', liked: false },
  { id: 4, title: 'Corporate Website', category: 'Web Design', image: 'https://picsum.photos/400/400?random=4', liked: false },
  { id: 5, title: 'Logo Design', category: 'Branding', image: 'https://picsum.photos/400/350?random=5', liked: false },
  { id: 6, title: 'Dashboard Interface', category: 'UI/UX', image: 'https://picsum.photos/400/550?random=6', liked: false },
  { id: 7, title: 'Restaurant Website', category: 'Web Design', image: 'https://picsum.photos/400/450?random=7', liked: false },
  { id: 8, title: 'Corporate Identity', category: 'Branding', image: 'https://picsum.photos/400/500?random=8', liked: false },
  { id: 9, title: 'SaaS Platform', category: 'UI/UX', image: 'https://picsum.photos/400/380?random=9', liked: false },
  {
    id: 10,
    title: 'Freedom Ceremony',
    category: 'Templates',
    image: '/templates/freedom-ceremony-preview.svg',
    description: 'Beautiful Freedom Ceremony template with customizable text and images',
    liked: false
  },
])

// Computed filtered projects
const filteredProjects = computed(() => {
  if (activeFilter.value === 'All') {
    return projects.value
  }
  return projects.value.filter(project => project.category === activeFilter.value)
})

// Toggle like
const toggleLike = (template: Template) => {
  template.liked = !template.liked
}

// Open menu
const openMenu = (id: number) => {
  activeMenu.value = activeMenu.value === id ? null : id
}

// Preview template
const previewTemplate = (template: Template) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('Preview template:', template.title)
  }
  activeMenu.value = null
  // Add your preview logic here
}

// Edit template
const editTemplate = (template: Template) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('Edit template:', template.title)
  }
  activeMenu.value = null
  // Add your edit logic here
}

// Report template
const reportTemplate = (template: Template) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('Report template:', template.title)
  }
  activeMenu.value = null
  // Add your report logic here
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.menu-wrapper')) {
    activeMenu.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Template Section */
.template-section {
  padding: 100px 80px;
  background: white;
}

.template-content {
  max-width: 1400px;
  margin: 0 auto;
}

.template-title {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  color: #1e293b;
}

.template-subtitle {
  font-size: 18px;
  text-align: center;
  color: #64748b;
  margin-bottom: 50px;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #06b6d4;
  color: #06b6d4;
}

.filter-btn.active {
  background: #06b6d4;
  border-color: #06b6d4;
  color: white;
}

/* Masonry Grid */
.masonry-grid {
  column-count: 4;
  column-gap: 16px;
}

.masonry-item {
  position: relative;
  break-inside: avoid;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.masonry-item:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.template-image {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.masonry-item:hover .template-image {
  transform: scale(1.05);
}

/* Category Tag */
.category-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #06b6d4;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  opacity: 0;
  transform: translateY(-8px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.masonry-item:hover .category-tag {
  opacity: 1;
  transform: translateY(0);
}

/* Action Bar */
.action-bar {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transform: translateX(12px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.masonry-item:hover .action-bar {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.action-btn:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn .icon {
  width: 20px;
  height: 20px;
  color: #334155;
}

.like-btn .icon {
  color: #ef4444;
}

/* Menu Wrapper */
.menu-wrapper {
  position: relative;
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 140px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid #e2e8f0;
  padding: 8px;
  z-index: 20;
  animation: dropdownFadeIn 0.3s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.dropdown-item:hover {
  background: #f1f5f9;
}

.dropdown-item.danger {
  color: #ef4444;
}

.dropdown-item.danger:hover {
  background: #fee2e2;
}

.dropdown-item .icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .masonry-grid {
    column-count: 3;
  }
}

@media (max-width: 768px) {
  .template-section {
    padding: 60px 20px;
  }

  .template-title {
    font-size: 32px;
  }

  .template-subtitle {
    font-size: 16px;
  }

  .masonry-grid {
    column-count: 2;
    column-gap: 12px;
  }

  .masonry-item {
    margin-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .masonry-grid {
    column-count: 1;
  }
}
</style>

