<template>
  <div class="help-center-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="header-text">
          <h1 class="page-title">Help Center</h1>
          <p class="page-subtitle">Find answers and get support</p>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-section">
      <div class="search-container">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input 
          v-model="searchQuery"
          type="text" 
          class="search-input" 
          placeholder="Search for help..."
          @input="filterArticles"
        >
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <div class="action-card" @click="contactSupport">
        <div class="action-icon support-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="action-content">
          <h3 class="action-title">Contact Support</h3>
          <p class="action-desc">Get help from our team</p>
        </div>
      </div>

      <div class="action-card" @click="viewFAQ">
        <div class="action-icon faq-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="action-content">
          <h3 class="action-title">FAQ</h3>
          <p class="action-desc">Common questions</p>
        </div>
      </div>

      <div class="action-card" @click="watchVideos">
        <div class="action-icon video-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <div class="action-content">
          <h3 class="action-title">Video Tutorials</h3>
          <p class="action-desc">Learn by watching</p>
        </div>
      </div>
    </div>

    <!-- Categories -->
    <div class="content-section">
      <h2 class="section-title">Browse by Category</h2>
      
      <div class="categories-grid">
        <div 
          v-for="category in filteredCategories" 
          :key="category.id"
          class="category-card"
          @click="expandCategory(category.id)"
        >
          <div class="category-header">
            <div class="category-icon" :class="category.iconClass">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path :d="category.iconPath"/>
              </svg>
            </div>
            <div class="category-info">
              <h3 class="category-title">{{ category.title }}</h3>
              <p class="category-count">{{ category.articles.length }} articles</p>
            </div>
            <svg 
              class="expand-icon" 
              :class="{ expanded: expandedCategories.includes(category.id) }"
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          <transition name="expand">
            <div v-if="expandedCategories.includes(category.id)" class="articles-list">
              <a 
                v-for="article in category.articles" 
                :key="article.id"
                class="article-item"
                @click.stop="openArticle(article)"
              >
                <span class="article-title">{{ article.title }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Popular Articles -->
    <div class="content-section">
      <h2 class="section-title">Popular Articles</h2>
      
      <div class="popular-articles">
        <a 
          v-for="article in popularArticles" 
          :key="article.id"
          class="popular-article"
          @click="openArticle(article)"
        >
          <div class="article-badge">Hot</div>
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-excerpt">{{ article.excerpt }}</p>
          <div class="article-meta">
            <span class="views">{{ article.views }} views</span>
            <span class="helpful">{{ article.helpful }}% helpful</span>
          </div>
        </a>
      </div>
    </div>

    <!-- Contact Banner -->
    <div class="contact-banner">
      <div class="banner-content">
        <h2 class="banner-title">Still need help?</h2>
        <p class="banner-text">Our support team is here to assist you 24/7</p>
        <button class="banner-button" @click="contactSupport">
          Contact Support
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const expandedCategories = ref<string[]>([])

interface Article {
  id: string
  title: string
  excerpt: string
  views?: number
  helpful?: number
}

interface Category {
  id: string
  title: string
  iconClass: string
  iconPath: string
  articles: Article[]
}

const categories = ref<Category[]>([
  {
    id: 'getting-started',
    title: 'Getting Started',
    iconClass: 'icon-rocket',
    iconPath: 'M12 2 L2 7 L12 12 L22 7 L12 2 Z M2 17 L12 22 L22 17 M2 12 L12 17 L22 12',
    articles: [
      { id: '1', title: 'How to create your first design', excerpt: 'Step-by-step guide for beginners' },
      { id: '2', title: 'Understanding the editor interface', excerpt: 'Learn about all the tools' },
      { id: '3', title: 'Uploading and managing images', excerpt: 'Import your own graphics' },
      { id: '4', title: 'Using templates effectively', excerpt: 'Quick start with pre-made designs' }
    ]
  },
  {
    id: 'features',
    title: 'Features & Tools',
    iconClass: 'icon-tools',
    iconPath: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    articles: [
      { id: '5', title: 'Using the AI Auto Design feature', excerpt: 'Generate designs automatically' },
      { id: '6', title: 'Background removal tool guide', excerpt: 'Remove backgrounds instantly' },
      { id: '7', title: 'Text editing and typography', excerpt: 'Master text formatting' },
      { id: '8', title: 'Layer management basics', excerpt: 'Organize your design elements' },
      { id: '9', title: 'Applying filters and effects', excerpt: 'Enhance your designs' }
    ]
  },
  {
    id: 'account',
    title: 'Account & Billing',
    iconClass: 'icon-user',
    iconPath: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11 A4 4 0 0 0 12 3 A4 4 0 0 0 12 11',
    articles: [
      { id: '10', title: 'Managing your subscription', excerpt: 'Upgrade or cancel plans' },
      { id: '11', title: 'Understanding tokens system', excerpt: 'How tokens work' },
      { id: '12', title: 'Payment methods and billing', excerpt: 'Add or update payment info' },
      { id: '13', title: 'Referral program guide', excerpt: 'Earn rewards by referring' }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    iconClass: 'icon-alert',
    iconPath: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
    articles: [
      { id: '14', title: 'Design not saving properly', excerpt: 'Fix save issues' },
      { id: '15', title: 'Image upload errors', excerpt: 'Resolve upload problems' },
      { id: '16', title: 'Performance and loading issues', excerpt: 'Speed up the editor' },
      { id: '17', title: 'Browser compatibility problems', excerpt: 'Supported browsers' }
    ]
  },
  {
    id: 'export',
    title: 'Export & Sharing',
    iconClass: 'icon-share',
    iconPath: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13',
    articles: [
      { id: '18', title: 'Exporting designs in different formats', excerpt: 'PNG, JPG, PDF, SVG' },
      { id: '19', title: 'Setting export quality and resolution', excerpt: 'Optimize for print or web' },
      { id: '20', title: 'Sharing designs with collaborators', excerpt: 'Team collaboration' },
      { id: '21', title: 'Downloading design templates', excerpt: 'Save and reuse templates' }
    ]
  }
])

const popularArticles = ref([
  { 
    id: 'p1', 
    title: 'How to use AI Auto Design', 
    excerpt: 'Learn how to generate stunning designs automatically with our AI-powered feature.',
    views: 15420,
    helpful: 95
  },
  { 
    id: 'p2', 
    title: 'Background removal in 1 click', 
    excerpt: 'Master the background removal tool and create professional cutouts instantly.',
    views: 12840,
    helpful: 98
  },
  { 
    id: 'p3', 
    title: 'Understanding token limits', 
    excerpt: 'Everything you need to know about tokens, usage, and how to get more.',
    views: 9320,
    helpful: 92
  },
  { 
    id: 'p4', 
    title: 'Upgrading your plan', 
    excerpt: 'Compare plans and learn how to upgrade for more features and tokens.',
    views: 7650,
    helpful: 90
  }
])

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  
  const query = searchQuery.value.toLowerCase()
  return categories.value
    .map(cat => ({
      ...cat,
      articles: cat.articles.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query)
      )
    }))
    .filter(cat => cat.articles.length > 0)
})

const expandCategory = (categoryId: string) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

const openArticle = (article: Article) => {
  // In a real app, this would navigate to the article detail page
  // For now, we could show a modal or navigate to a detail view
  alert(`Article: ${article.title}`)
}

const filterArticles = () => {
  // Filtering is handled by computed property
}

const contactSupport = () => {
  router.push('/support')
}

const viewFAQ = () => {
  router.push('/faq')
}

const watchVideos = () => {
  router.push('/videos')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.help-center-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding-bottom: 80px;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 60px 20px 80px;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-4px);
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Search Section */
.search-section {
  max-width: 1200px;
  margin: -40px auto 40px;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.search-container {
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 20px 20px 20px 56px;
  border: 2px solid transparent;
  font-size: 16px;
  color: #1e293b;
  background: transparent;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #3b82f6;
}

.search-input::placeholder {
  color: #94a3b8;
}

/* Quick Actions */
.quick-actions {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #e2e8f0;
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.support-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.faq-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.video-icon {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.action-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Content Section */
.content-section {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  gap: 16px;
}

.category-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-rocket {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.icon-tools {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.icon-user {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.icon-alert {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.icon-share {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
}

.category-info {
  flex: 1;
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.category-count {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.expand-icon {
  color: #94a3b8;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* Articles List */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.articles-list {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.article-item:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
  transform: translateX(4px);
}

.article-item .article-title {
  font-size: 15px;
  color: #334155;
  font-weight: 500;
}

.article-item svg {
  color: #94a3b8;
}

/* Popular Articles */
.popular-articles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.popular-article {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-decoration: none;
  position: relative;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.popular-article::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.popular-article:hover::before {
  opacity: 1;
}

.popular-article:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e1;
}

.article-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  margin-bottom: 12px;
}

.popular-article .article-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.article-excerpt {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.article-meta span {
  font-size: 13px;
  color: #64748b;
}

.helpful {
  color: #10b981;
  font-weight: 600;
}

/* Contact Banner */
.contact-banner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.banner-content {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 20px;
  padding: 48px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.banner-content::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 60%);
}

.banner-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
  position: relative;
  z-index: 1;
}

.banner-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  position: relative;
  z-index: 1;
}

.banner-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.banner-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .banner-content {
    padding: 32px 24px;
  }

  .banner-title {
    font-size: 24px;
  }
}
</style>
