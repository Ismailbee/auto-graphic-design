<template>
  <div class="faq-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="header-text">
          <h1 class="page-title">Frequently Asked Questions</h1>
          <p class="page-subtitle">Find quick answers to common questions</p>
        </div>
      </div>
    </div>

    <!-- Search -->
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
          placeholder="Search FAQ..."
        >
      </div>
    </div>

    <!-- Popular Questions -->
    <div class="content-section">
      <h2 class="section-title">🔥 Popular Questions</h2>
      
      <div class="faq-grid">
        <div 
          v-for="faq in filteredPopularFaqs" 
          :key="faq.id"
          class="faq-card"
          :class="{ expanded: faq.open }"
        >
          <div class="faq-header" @click="toggleFaq(faq)">
            <h3 class="faq-question">{{ faq.question }}</h3>
            <svg 
              class="expand-icon" 
              :class="{ rotated: faq.open }"
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <transition name="expand">
            <div v-if="faq.open" class="faq-answer">
              <p>{{ toText(faq.answer) }}</p>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- All Categories -->
    <div class="content-section">
      <h2 class="section-title">Browse by Category</h2>
      
      <div v-for="category in filteredCategories" :key="category.id" class="category-section">
        <div class="category-header">
          <div class="category-icon" :style="{ background: category.color }">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path :d="category.iconPath"/>
            </svg>
          </div>
          <h3 class="category-title">{{ category.title }}</h3>
          <span class="category-count">{{ category.faqs.length }} questions</span>
        </div>

        <div class="faq-list">
          <div 
            v-for="faq in category.faqs" 
            :key="faq.id"
            class="faq-item"
            :class="{ expanded: faq.open }"
          >
            <div class="faq-item-header" @click="toggleFaq(faq)">
              <h4 class="faq-item-question">{{ faq.question }}</h4>
              <svg 
                class="expand-icon" 
                :class="{ rotated: faq.open }"
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <transition name="expand">
              <div v-if="faq.open" class="faq-item-answer">
                <p>{{ toText(faq.answer) }}</p>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Banner -->
    <div class="help-banner">
      <div class="banner-content">
        <h2 class="banner-title">Still have questions?</h2>
        <p class="banner-text">Can't find what you're looking for? Our support team is here to help!</p>
        <div class="banner-buttons">
          <button class="banner-button primary" @click="contactSupport">
            Contact Support
          </button>
          <button class="banner-button secondary" @click="viewHelp">
            Visit Help Center
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const toText = (html: string) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

interface FAQ {
  id: string
  question: string
  answer: string
  open: boolean
}

interface Category {
  id: string
  title: string
  color: string
  iconPath: string
  faqs: FAQ[]
}

const popularFaqs = ref<FAQ[]>([
  {
    id: 'p1',
    question: 'How do I create my first design?',
    answer: `<p>Creating your first design is easy!</p>
      <ol>
        <li>Click the <strong>"New Design"</strong> button on the home page</li>
        <li>Choose a template or start from scratch</li>
        <li>Use the editor tools to customize your design</li>
        <li>Save and export when you're done</li>
      </ol>
      <p>Watch our <a href="/videos">video tutorial</a> for a detailed walkthrough.</p>`,
    open: false
  },
  {
    id: 'p2',
    question: 'What are tokens and how do they work?',
    answer: `<p>Tokens are the currency used for AI-powered features in SmartDesignPro.</p>
      <ul>
        <li><strong>Free Plan:</strong> 100 tokens/month</li>
        <li><strong>Premium Plan:</strong> 1,000 tokens/month</li>
        <li><strong>Pro Plan:</strong> 5,000 tokens/month</li>
      </ul>
      <p>Each AI operation consumes tokens based on complexity. Check your token balance in the top menu.</p>`,
    open: false
  },
  {
    id: 'p3',
    question: 'How do I upgrade my plan?',
    answer: `<p>Upgrading your plan is simple:</p>
      <ol>
        <li>Go to <strong>Settings → Subscription</strong></li>
        <li>Choose your preferred plan (Premium or Pro)</li>
        <li>Enter your payment details</li>
        <li>Confirm and enjoy your upgraded features!</li>
      </ol>
      <p>All upgrades are instant and you can cancel anytime.</p>`,
    open: false
  },
  {
    id: 'p4',
    question: 'Can I cancel my subscription anytime?',
    answer: `<p><strong>Yes!</strong> You can cancel your subscription anytime without penalties.</p>
      <p>After cancellation:</p>
      <ul>
        <li>You'll keep access until the end of your billing period</li>
        <li>Your designs are saved and accessible</li>
        <li>You can reactivate anytime</li>
        <li>No questions asked refund policy (within 30 days)</li>
      </ul>`,
    open: false
  }
])

const categories = ref<Category[]>([
  {
    id: 'getting-started',
    title: 'Getting Started',
    color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    iconPath: 'M12 2 L2 7 L12 12 L22 7 L12 2 Z M2 17 L12 22 L22 17 M2 12 L12 17 L22 12',
    faqs: [
      {
        id: 'gs1',
        question: 'How do I sign up for SmartDesignPro?',
        answer: '<p>Click the <strong>"Get Started"</strong> button and create your free account using email or social login. No credit card required for the free plan!</p>',
        open: false
      },
      {
        id: 'gs2',
        question: 'What file formats can I upload?',
        answer: '<p>We support JPG, PNG, GIF, SVG, PDF, AI, and PSD files. Maximum file size is 50MB per file.</p>',
        open: false
      },
      {
        id: 'gs3',
        question: 'How do I save my designs?',
        answer: '<p>Click <strong>"Save"</strong> button (Ctrl+S) to save your design to the cloud. All saves are automatic every 2 minutes.</p>',
        open: false
      }
    ]
  },
  {
    id: 'features',
    title: 'Features & Tools',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    iconPath: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    faqs: [
      {
        id: 'f1',
        question: 'How does AI Auto Design work?',
        answer: '<p>AI Auto Design analyzes your content and automatically creates professional layouts. Just provide text/images, choose a style, and let AI do the work!</p>',
        open: false
      },
      {
        id: 'f2',
        question: 'Can I remove backgrounds from images?',
        answer: '<p>Yes! Select any image and click <strong>"Remove Background"</strong>. Our AI will automatically detect and remove backgrounds in seconds.</p>',
        open: false
      },
      {
        id: 'f3',
        question: 'How do I add custom fonts?',
        answer: '<p>Go to <strong>Text → Font Menu</strong> and click <strong>"Upload Font"</strong>. Supports TTF, OTF, and WOFF formats.</p>',
        open: false
      }
    ]
  },
  {
    id: 'billing',
    title: 'Billing & Payments',
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z',
    faqs: [
      {
        id: 'b1',
        question: 'What payment methods do you accept?',
        answer: '<p>We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and bank transfers for annual plans.</p>',
        open: false
      },
      {
        id: 'b2',
        question: 'When will I be charged?',
          answer: '<p>Billing occurs on the same day you subscribe each month/year. You will receive an email invoice before each charge.</p>',
        open: false
      },
      {
        id: 'b3',
        question: 'Do you offer refunds?',
          answer: '<p>Yes! We offer a 30-day money-back guarantee. If you are not satisfied, contact support for a full refund, no questions asked.</p>',
        open: false
      }
    ]
  },
  {
    id: 'account',
    title: 'Account Management',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    iconPath: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11 A4 4 0 0 0 12 3 A4 4 0 0 0 12 11',
    faqs: [
      {
        id: 'a1',
        question: 'How do I change my password?',
        answer: '<p>Go to <strong>Settings → Security</strong> and click <strong>"Change Password"</strong>. Enter your current password and new password.</p>',
        open: false
      },
      {
        id: 'a2',
        question: 'Can I use SmartDesignPro on multiple devices?',
        answer: '<p>Yes! Your account works on any device. Just log in and all your designs will sync automatically via the cloud.</p>',
        open: false
      },
      {
        id: 'a3',
        question: 'How do I delete my account?',
        answer: '<p>Go to <strong>Settings → Account → Delete Account</strong>. Note: This action is permanent and cannot be undone.</p>',
        open: false
      }
    ]
  },
  {
    id: 'export',
    title: 'Export & Sharing',
    color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    iconPath: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13',
    faqs: [
      {
        id: 'e1',
        question: 'What export formats are available?',
        answer: '<p>You can export designs as PNG, JPG, PDF, SVG, and even animated GIF. Choose the format that fits your needs!</p>',
        open: false
      },
      {
        id: 'e2',
        question: 'Can I export high-resolution designs?',
        answer: '<p>Yes! Premium and Pro users can export up to 4K resolution (4096x4096px). Free users can export up to 1080p.</p>',
        open: false
      },
      {
        id: 'e3',
        question: 'How do I share my design with others?',
        answer: '<p>Click <strong>"Share"</strong> to generate a public link, or invite collaborators via email for real-time editing.</p>',
        open: false
      }
    ]
  }
])

const filteredPopularFaqs = computed(() => {
  if (!searchQuery.value) return popularFaqs.value
  
  const query = searchQuery.value.toLowerCase()
  return popularFaqs.value.filter(faq => 
    faq.question.toLowerCase().includes(query) ||
    faq.answer.toLowerCase().includes(query)
  )
})

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  
  const query = searchQuery.value.toLowerCase()
  return categories.value
    .map(cat => ({
      ...cat,
      faqs: cat.faqs.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      )
    }))
    .filter(cat => cat.faqs.length > 0)
})

const toggleFaq = (faq: FAQ) => {
  faq.open = !faq.open
}

const contactSupport = () => {
  router.push('/support')
}

const viewHelp = () => {
  router.push('/help-center')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.faq-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding-bottom: 80px;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
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
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
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
  background: rgba(255, 255, 255, 0.3);
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
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

/* Search Section */
.search-section {
  max-width: 1200px;
  margin: -40px auto 60px;
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
  border-color: #8b5cf6;
}

.search-input::placeholder {
  color: #94a3b8;
}

/* Content Section */
.content-section {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 32px 0;
}

/* FAQ Grid */
.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.faq-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.faq-card:hover {
  border-color: #8b5cf6;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
  transform: translateY(-4px);
}

.faq-card.expanded {
  border-color: #8b5cf6;
}

.faq-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.faq-question {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.expand-icon {
  color: #94a3b8;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.faq-answer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  color: #475569;
  font-size: 15px;
  line-height: 1.7;
}

.faq-answer :deep(p) {
  margin: 0 0 12px 0;
}

.faq-answer :deep(ul),
.faq-answer :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.faq-answer :deep(li) {
  margin: 8px 0;
}

.faq-answer :deep(strong) {
  color: #1e293b;
  font-weight: 600;
}

.faq-answer :deep(a) {
  color: #8b5cf6;
  text-decoration: none;
  font-weight: 500;
}

.faq-answer :deep(a:hover) {
  text-decoration: underline;
}

/* Category Section */
.category-section {
  margin-bottom: 48px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.category-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.category-count {
  font-size: 14px;
  color: #64748b;
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 8px;
}

/* FAQ List */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.faq-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.faq-item.expanded {
  border-color: #8b5cf6;
}

.faq-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.faq-item-question {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.faq-item-answer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  color: #475569;
  font-size: 14px;
  line-height: 1.7;
}

.faq-item-answer :deep(p) {
  margin: 0 0 12px 0;
}

.faq-item-answer :deep(ul),
.faq-item-answer :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.faq-item-answer :deep(li) {
  margin: 8px 0;
}

.faq-item-answer :deep(strong) {
  color: #1e293b;
  font-weight: 600;
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 800px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Help Banner */
.help-banner {
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
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%);
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

.banner-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.banner-button {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.banner-button.primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.banner-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.5);
}

.banner-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.banner-button.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }

  .banner-content {
    padding: 32px 24px;
  }

  .banner-title {
    font-size: 24px;
  }

  .banner-buttons {
    flex-direction: column;
    width: 100%;
  }

  .banner-button {
    width: 100%;
  }
}
</style>
