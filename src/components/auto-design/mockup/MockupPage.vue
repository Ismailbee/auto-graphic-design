<template>
  <div class="mockup-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Design Mockups & Prototypes</h1>
        <p class="page-subtitle">
          Bring your designs to life with professional mockups and interactive prototypes
        </p>
      </div>
    </div>

    <!-- Mockup Content -->
    <div class="mockup-content">
      <div class="container">
        <!-- DIY Mockup Generator -->
        <section class="diy-generator">
          <MockupGenerator />
        </section>

        <!-- Services Overview -->
        <section class="services-overview">
          <div class="section-header">
            <h2 class="section-title">Mockup Services</h2>
            <p class="section-subtitle">
              Professional mockup creation to showcase your designs in realistic contexts
            </p>
          </div>

          <div class="services-grid">
            <div class="service-card">
              <div class="service-icon">📱</div>
              <h3 class="service-title">Mobile App Mockups</h3>
              <p class="service-description">
                Create stunning mobile app presentations with realistic device frames and interactions
              </p>
              <ul class="service-features">
                <li>iOS & Android devices</li>
                <li>Multiple screen sizes</li>
                <li>Interactive prototypes</li>
                <li>User flow animations</li>
              </ul>
              <div class="service-price">Starting at $149</div>
            </div>

            <div class="service-card">
              <div class="service-icon">💻</div>
              <h3 class="service-title">Website Mockups</h3>
              <p class="service-description">
                Professional website presentations with responsive layouts and browser frames
              </p>
              <ul class="service-features">
                <li>Desktop & mobile views</li>
                <li>Browser mockups</li>
                <li>Responsive layouts</li>
                <li>Interactive elements</li>
              </ul>
              <div class="service-price">Starting at $199</div>
            </div>

            <div class="service-card">
              <div class="service-icon">🎨</div>
              <h3 class="service-title">Branding Mockups</h3>
              <p class="service-description">
                Showcase your brand identity across various touchpoints and applications
              </p>
              <ul class="service-features">
                <li>Logo presentations</li>
                <li>Business card mockups</li>
                <li>Stationery sets</li>
                <li>Environmental graphics</li>
              </ul>
              <div class="service-price">Starting at $99</div>
            </div>

            <div class="service-card">
              <div class="service-icon">📦</div>
              <h3 class="service-title">Product Mockups</h3>
              <p class="service-description">
                3D product visualizations and packaging mockups for marketing materials
              </p>
              <ul class="service-features">
                <li>3D product renders</li>
                <li>Packaging design</li>
                <li>Label applications</li>
                <li>Marketing materials</li>
              </ul>
              <div class="service-price">Starting at $249</div>
            </div>
          </div>
        </section>

        <!-- Portfolio Gallery -->
        <section class="portfolio-gallery">
          <h2 class="section-title">Recent Mockup Work</h2>
          <div class="gallery-tabs">
            <button
              v-for="category in categories"
              :key="category"
              :class="['tab-button', { active: activeCategory === category }]"
              @click="activeCategory = category"
            >
              {{ category }}
            </button>
          </div>

          <div class="gallery-grid">
            <div
              v-for="item in filteredPortfolio"
              :key="item.id"
              class="gallery-item"
              @click="openLightbox(item)"
            >
              <div class="item-image">
                <img :src="item.image" :alt="item.title" />
                <div class="item-overlay">
                  <div class="overlay-content">
                    <h4 class="item-title">{{ item.title }}</h4>
                    <p class="item-category">{{ item.category }}</p>
                    <button class="view-button">View Details</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Process Section -->
        <section class="process-section">
          <h2 class="section-title">Our Mockup Process</h2>
          <div class="process-timeline">
            <div class="timeline-item">
              <div class="timeline-marker">1</div>
              <div class="timeline-content">
                <h3 class="timeline-title">Brief & Discovery</h3>
                <p class="timeline-description">
                  We understand your project requirements, target audience, and design goals
                </p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker">2</div>
              <div class="timeline-content">
                <h3 class="timeline-title">Concept Development</h3>
                <p class="timeline-description">
                  Create initial mockup concepts and present them for your feedback
                </p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker">3</div>
              <div class="timeline-content">
                <h3 class="timeline-title">Refinement</h3>
                <p class="timeline-description">
                  Refine the mockups based on your feedback and brand guidelines
                </p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker">4</div>
              <div class="timeline-content">
                <h3 class="timeline-title">Final Delivery</h3>
                <p class="timeline-description">
                  Deliver high-resolution mockups in multiple formats for your use
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section">
          <div class="cta-container">
            <h2 class="cta-title">Ready to Bring Your Design to Life?</h2>
            <p class="cta-subtitle">
              Get a custom mockup quote for your project today
            </p>
            <div class="cta-buttons">
              <button class="cta-primary" @click="scrollToQuoteForm">Get Quote</button>
              <button class="cta-secondary" @click="openPortfolio">View Portfolio</button>
            </div>
          </div>
        </section>

        <!-- Quote Form -->
        <section id="quote-form" class="quote-section">
          <div class="quote-container">
            <h2 class="section-title">Get Your Mockup Quote</h2>
            <p class="section-subtitle">
              Tell us about your project and we'll provide a custom quote
            </p>

            <form class="quote-form" @submit.prevent="handleSubmit">
              <div class="form-grid">
                <div class="form-group">
                  <label for="name" class="form-label">Full Name *</label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    class="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="email" class="form-label">Email Address *</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="form-input"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label for="mockupType" class="form-label">Mockup Type *</label>
                  <select id="mockupType" v-model="form.mockupType" class="form-select" required>
                    <option value="">Select mockup type</option>
                    <option value="mobile-app">Mobile App</option>
                    <option value="website">Website</option>
                    <option value="branding">Branding</option>
                    <option value="product">Product</option>
                    <option value="print">Print Design</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="timeline" class="form-label">Project Timeline</label>
                  <select id="timeline" v-model="form.timeline" class="form-select">
                    <option value="">Select timeline</option>
                    <option value="rush">Rush (1-3 days)</option>
                    <option value="standard">Standard (1 week)</option>
                    <option value="extended">Extended (2+ weeks)</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="description" class="form-label">Project Description *</label>
                <textarea
                  id="description"
                  v-model="form.description"
                  class="form-textarea"
                  rows="4"
                  placeholder="Describe your project, the type of mockups you need, and any specific requirements..."
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label for="budget" class="form-label">Budget Range</label>
                <select id="budget" v-model="form.budget" class="form-select">
                  <option value="">Select budget range</option>
                  <option value="under-500">Under $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-2500">$1,000 - $2,500</option>
                  <option value="2500-5000">$2,500 - $5,000</option>
                  <option value="5000-plus">$5,000+</option>
                </select>
              </div>

              <button type="submit" class="submit-button" :disabled="isSubmitting">
                <span v-if="!isSubmitting">Get Mockup Quote</span>
                <span v-else>Submitting...</span>
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div v-if="lightboxItem" class="lightbox-overlay" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">×</button>
        <img :src="lightboxItem.image" :alt="lightboxItem.title" class="lightbox-image" />
        <div class="lightbox-info">
          <h3 class="lightbox-title">{{ lightboxItem.title }}</h3>
          <p class="lightbox-category">{{ lightboxItem.category }}</p>
          <p class="lightbox-description">{{ lightboxItem.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MockupGenerator from '@/components/mockup/MockupGenerator.vue'

// Router not needed here currently

// Form state
const form = ref({
  name: '',
  email: '',
  mockupType: '',
  timeline: '',
  description: '',
  budget: ''
})

const isSubmitting = ref(false)
const activeCategory = ref('All')
type PortfolioItem = { id: number; title: string; category: string; image: string; description: string }
const lightboxItem = ref<PortfolioItem | null>(null)

// Portfolio data
const categories = ['All', 'Mobile App', 'Website', 'Branding', 'Product']

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: 'E-commerce Mobile App',
    category: 'Mobile App',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop',
    description: 'Modern e-commerce app mockup with clean UI and intuitive navigation'
  },
  {
    id: 2,
    title: 'Corporate Website',
    category: 'Website',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop',
    description: 'Responsive corporate website mockup with professional design'
  },
  {
    id: 3,
    title: 'Coffee Brand Identity',
    category: 'Branding',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=300&fit=crop',
    description: 'Complete brand identity mockup for a premium coffee brand'
  },
  {
    id: 4,
    title: 'Smart Watch App',
    category: 'Mobile App',
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&h=300&fit=crop',
    description: 'Wearable device app interface with health tracking features'
  },
  {
    id: 5,
    title: 'Cosmetic Product Line',
    category: 'Product',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=300&fit=crop',
    description: '3D product mockups for luxury cosmetic packaging'
  },
  {
    id: 6,
    title: 'Food Delivery Website',
    category: 'Website',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop',
    description: 'Modern food delivery platform with appetizing visuals'
  }
]

// Computed
const filteredPortfolio = computed(() => {
  if (activeCategory.value === 'All') {
    return portfolioItems
  }
  return portfolioItems.filter(item => item.category === activeCategory.value)
})

// Methods
const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
  // Submission successful; would post to API in production
    
    alert('Thank you! Your mockup quote request has been submitted. We\'ll get back to you within 24 hours with a detailed proposal.')
    
    // Reset form
    form.value = {
      name: '',
      email: '',
      mockupType: '',
      timeline: '',
      description: '',
      budget: ''
    }
  } catch (error) {
    // Handle error silently or surface via UI if needed
    alert('Sorry, there was an error submitting your request. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const openLightbox = (item: PortfolioItem) => {
  lightboxItem.value = item
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxItem.value = null
  document.body.style.overflow = 'auto'
}

const scrollToQuoteForm = () => {
  const element = document.getElementById('quote-form')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const openPortfolio = () => {
  const element = document.querySelector('.portfolio-gallery')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.mockup-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.page-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  padding: 120px 0 80px;
  text-align: center;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 32px;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 24px;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  line-height: 1.6;
}

.mockup-content {
  padding: 80px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-bottom: 80px;
}

.service-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  position: relative;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.service-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.service-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.service-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.service-features {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.service-features li {
  color: var(--text-secondary);
  padding: 4px 0;
  padding-left: 16px;
  position: relative;
}

.service-features li:before {
  content: '✓';
  color: var(--color-success);
  font-weight: bold;
  position: absolute;
  left: 0;
}

.service-price {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 1.125rem;
  margin-top: auto;
}

.portfolio-gallery {
  margin: 80px 0;
}

.gallery-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 32px 0;
  flex-wrap: wrap;
}

.tab-button {
  padding: 12px 24px;
  border: 2px solid var(--border-primary);
  background: white;
  color: var(--text-secondary);
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-button.active,
.tab-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.gallery-item {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform var(--transition-fast);
}

.gallery-item:hover {
  transform: translateY(-4px);
}

.item-image {
  position: relative;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform var(--transition-fast);
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.gallery-item:hover .item-overlay {
  opacity: 1;
}

.gallery-item:hover .item-image img {
  transform: scale(1.05);
}

.overlay-content {
  text-align: center;
  color: white;
}

.item-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.item-category {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-bottom: 16px;
}

.view-button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.process-section {
  margin: 80px 0;
  text-align: center;
}

.process-timeline {
  max-width: 800px;
  margin: 48px auto 0;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 40px;
  text-align: left;
}

.timeline-marker {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.timeline-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.timeline-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

.cta-section {
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 64px 32px;
  text-align: center;
  margin: 80px 0;
}

.cta-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.cta-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-primary,
.cta-secondary {
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cta-primary {
  background: var(--color-primary);
  color: white;
  border: none;
}

.cta-primary:hover {
  background: var(--color-primary-hover);
}

.cta-secondary {
  background: white;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.cta-secondary:hover {
  background: var(--color-primary);
  color: white;
}

.quote-section {
  background: white;
  border-radius: 24px;
  padding: 64px;
  box-shadow: var(--shadow-lg);
  margin: 80px 0;
}

.quote-container {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.quote-form {
  margin-top: 48px;
  text-align: left;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color var(--transition-fast);
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.submit-button {
  width: 100%;
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  margin-top: 24px;
}

.submit-button:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 32px;
}

.lightbox-content {
  max-width: 800px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  z-index: 1;
}

.lightbox-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.lightbox-info {
  padding: 24px;
}

.lightbox-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.lightbox-category {
  color: var(--color-primary);
  font-weight: 500;
  margin-bottom: 12px;
}

.lightbox-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .quote-section {
    padding: 32px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .timeline-item {
    flex-direction: column;
    text-align: center;
  }
  
  .header-content,
  .container {
    padding: 0 16px;
  }
}
</style>