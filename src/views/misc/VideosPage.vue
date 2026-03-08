<template>
  <div class="videos-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Video Production & Motion Graphics</h1>
        <p class="page-subtitle">
          Create engaging video content that tells your story and captivates your audience
        </p>
      </div>
    </div>

    <!-- Videos Content -->
    <div class="videos-content">
      <div class="container">
        <!-- Services Overview -->
        <section class="services-overview">
          <div class="section-header">
            <h2 class="section-title">Video Services</h2>
            <p class="section-subtitle">
              Professional video production and motion graphics for all your marketing needs
            </p>
          </div>

          <div class="services-grid">
            <div class="service-card">
              <div class="service-icon">🎬</div>
              <h3 class="service-title">Brand Videos</h3>
              <p class="service-description">
                Compelling brand stories that connect with your audience and communicate your values
              </p>
              <ul class="service-features">
                <li>Brand storytelling</li>
                <li>Company introductions</li>
                <li>Mission & vision videos</li>
                <li>Corporate presentations</li>
              </ul>
              <div class="service-price">Starting at $2,999</div>
            </div>

            <div class="service-card">
              <div class="service-icon">📺</div>
              <h3 class="service-title">Product Videos</h3>
              <p class="service-description">
                Showcase your products with high-quality demonstrations and explainer videos
              </p>
              <ul class="service-features">
                <li>Product demonstrations</li>
                <li>Explainer videos</li>
                <li>Feature highlights</li>
                <li>Comparison videos</li>
              </ul>
              <div class="service-price">Starting at $1,999</div>
            </div>

            <div class="service-card">
              <div class="service-icon">✨</div>
              <h3 class="service-title">Motion Graphics</h3>
              <p class="service-description">
                Dynamic animations and motion graphics that bring your brand to life
              </p>
              <ul class="service-features">
                <li>Logo animations</li>
                <li>Infographic videos</li>
                <li>Title sequences</li>
                <li>Social media content</li>
              </ul>
              <div class="service-price">Starting at $1,499</div>
            </div>

            <div class="service-card">
              <div class="service-icon">📱</div>
              <h3 class="service-title">Social Media Videos</h3>
              <p class="service-description">
                Short-form content optimized for social media platforms and maximum engagement
              </p>
              <ul class="service-features">
                <li>Instagram Reels</li>
                <li>TikTok content</li>
                <li>YouTube shorts</li>
                <li>LinkedIn videos</li>
              </ul>
              <div class="service-price">Starting at $799</div>
            </div>
          </div>
        </section>

        <!-- Video Portfolio -->
        <section class="video-portfolio">
          <h2 class="section-title">Our Video Work</h2>
          <div class="portfolio-tabs">
            <button
              v-for="category in videoCategories"
              :key="category"
              :class="['tab-button', { active: activeVideoCategory === category }]"
              @click="activeVideoCategory = category"
            >
              {{ category }}
            </button>
          </div>

          <div class="video-grid">
            <div
              v-for="video in filteredVideos"
              :key="video.id"
              class="video-item"
              @click="playVideo(video)"
            >
              <div class="video-thumbnail">
                <img :src="video.thumbnail" :alt="video.title" />
                <div class="play-overlay">
                  <div class="play-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="video-info">
                <h4 class="video-title">{{ video.title }}</h4>
                <p class="video-category">{{ video.category }}</p>
                <p class="video-description">{{ video.description }}</p>
                <div class="video-stats">
                  <span class="video-duration">{{ video.duration }}</span>
                  <span class="video-views">{{ video.views }} views</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Production Process -->
        <section class="process-section">
          <h2 class="section-title">Our Video Production Process</h2>
          <div class="process-timeline">
            <div class="timeline-item">
              <div class="timeline-marker">
                <span class="marker-icon">💡</span>
              </div>
              <div class="timeline-content">
                <h3 class="timeline-title">Concept & Planning</h3>
                <p class="timeline-description">
                  We work with you to develop the concept, script, and storyboard for your video
                </p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker">
                <span class="marker-icon">🎯</span>
              </div>
              <div class="timeline-content">
                <h3 class="timeline-title">Pre-Production</h3>
                <p class="timeline-description">
                  Planning locations, casting, equipment setup, and scheduling the production
                </p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker">
                <span class="marker-icon">🎬</span>
              </div>
              <div class="timeline-content">
                <h3 class="timeline-title">Production</h3>
                <p class="timeline-description">
                  Professional filming with high-quality equipment and experienced crew
                </p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker">
                <span class="marker-icon">✂️</span>
              </div>
              <div class="timeline-content">
                <h3 class="timeline-title">Post-Production</h3>
                <p class="timeline-description">
                  Editing, color grading, sound design, and motion graphics to create the final video
                </p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-marker">
                <span class="marker-icon">🚀</span>
              </div>
              <div class="timeline-content">
                <h3 class="timeline-title">Delivery & Launch</h3>
                <p class="timeline-description">
                  Final delivery in all required formats and assistance with launch strategy
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Equipment & Tech -->
        <section class="equipment-section">
          <div class="equipment-container">
            <div class="equipment-content">
              <h2 class="section-title">Professional Equipment & Technology</h2>
              <p class="section-subtitle">
                We use industry-standard equipment and cutting-edge technology to deliver exceptional results
              </p>
              
              <div class="equipment-grid">
                <div class="equipment-item">
                  <div class="equipment-icon">📹</div>
                  <h4>4K+ Cameras</h4>
                  <p>Professional cinema cameras with high dynamic range</p>
                </div>
                <div class="equipment-item">
                  <div class="equipment-icon">🎤</div>
                  <h4>Pro Audio</h4>
                  <p>Crystal clear sound recording and mixing equipment</p>
                </div>
                <div class="equipment-item">
                  <div class="equipment-icon">💡</div>
                  <h4>Studio Lighting</h4>
                  <p>Professional lighting setups for any environment</p>
                </div>
                <div class="equipment-item">
                  <div class="equipment-icon">🎨</div>
                  <h4>Motion Graphics</h4>
                  <p>Advanced software for animations and visual effects</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section">
          <div class="cta-container">
            <h2 class="cta-title">Ready to Create Amazing Video Content?</h2>
            <p class="cta-subtitle">
              Let's discuss your video project and bring your vision to life
            </p>
            <div class="cta-buttons">
              <button @click="scrollToQuoteForm" class="cta-primary">Get Quote</button>
              <button @click="scheduleConsultation" class="cta-secondary">Schedule Consultation</button>
            </div>
          </div>
        </section>

        <!-- Quote Form -->
        <section id="video-quote-form" class="quote-section">
          <div class="quote-container">
            <h2 class="section-title">Get Your Video Production Quote</h2>
            <p class="section-subtitle">
              Tell us about your video project and we'll provide a detailed quote
            </p>

            <form @submit.prevent="handleSubmit" class="quote-form">
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
                  <label for="videoType" class="form-label">Video Type *</label>
                  <select id="videoType" v-model="form.videoType" class="form-select" required>
                    <option value="">Select video type</option>
                    <option value="brand-video">Brand Video</option>
                    <option value="product-demo">Product Demo</option>
                    <option value="explainer">Explainer Video</option>
                    <option value="motion-graphics">Motion Graphics</option>
                    <option value="social-media">Social Media Content</option>
                    <option value="testimonial">Testimonial Video</option>
                    <option value="event">Event Coverage</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="duration" class="form-label">Estimated Duration</label>
                  <select id="duration" v-model="form.duration" class="form-select">
                    <option value="">Select duration</option>
                    <option value="15-30s">15-30 seconds</option>
                    <option value="30-60s">30-60 seconds</option>
                    <option value="1-2min">1-2 minutes</option>
                    <option value="2-5min">2-5 minutes</option>
                    <option value="5min+">5+ minutes</option>
                  </select>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label for="budget" class="form-label">Budget Range</label>
                  <select id="budget" v-model="form.budget" class="form-select">
                    <option value="">Select budget range</option>
                    <option value="under-2k">Under $2,000</option>
                    <option value="2k-5k">$2,000 - $5,000</option>
                    <option value="5k-10k">$5,000 - $10,000</option>
                    <option value="10k-25k">$10,000 - $25,000</option>
                    <option value="25k-plus">$25,000+</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="timeline" class="form-label">Project Timeline</label>
                  <select id="timeline" v-model="form.timeline" class="form-select">
                    <option value="">Select timeline</option>
                    <option value="rush">Rush (1-2 weeks)</option>
                    <option value="standard">Standard (3-4 weeks)</option>
                    <option value="extended">Extended (5+ weeks)</option>
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
                  placeholder="Describe your video project, target audience, key messages, and any specific requirements..."
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Services Needed (Check all that apply)</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="form.services" value="scriptwriting">
                    <span class="checkmark"></span>
                    Scriptwriting
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="form.services" value="storyboarding">
                    <span class="checkmark"></span>
                    Storyboarding
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="form.services" value="filming">
                    <span class="checkmark"></span>
                    Filming/Production
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="form.services" value="editing">
                    <span class="checkmark"></span>
                    Editing
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="form.services" value="motion-graphics">
                    <span class="checkmark"></span>
                    Motion Graphics
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="form.services" value="voiceover">
                    <span class="checkmark"></span>
                    Voiceover
                  </label>
                </div>
              </div>

              <button type="submit" class="submit-button" :disabled="isSubmitting">
                <span v-if="!isSubmitting">Get Video Quote</span>
                <span v-else>Submitting...</span>
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>

    <!-- Video Modal -->
    <div v-if="selectedVideo" class="video-modal-overlay" @click="closeVideoModal">
      <div class="video-modal-content" @click.stop>
        <button class="video-modal-close" @click="closeVideoModal">×</button>
        <div class="video-player">
          <iframe
            :src="selectedVideo.embedUrl"
            frameborder="0"
            allowfullscreen
            width="100%"
            height="100%"
          ></iframe>
        </div>
        <div class="video-modal-info">
          <h3 class="modal-video-title">{{ selectedVideo.title }}</h3>
          <p class="modal-video-description">{{ selectedVideo.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Form state
const form = ref({
  name: '',
  email: '',
  videoType: '',
  duration: '',
  budget: '',
  timeline: '',
  description: '',
  services: []
})

const isSubmitting = ref(false)
const activeVideoCategory = ref('All')
const selectedVideo = ref(null)

// Video categories and portfolio
const videoCategories = ['All', 'Brand Videos', 'Product Demos', 'Motion Graphics', 'Social Media']

const videoPortfolio = [
  {
    id: 1,
    title: 'Tech Startup Brand Story',
    category: 'Brand Videos',
    description: 'Compelling brand narrative for an innovative tech startup',
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop',
    duration: '2:30',
    views: '15K',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 2,
    title: 'Product Feature Showcase',
    category: 'Product Demos',
    description: 'Detailed demonstration of a SaaS product\'s key features',
    thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop',
    duration: '1:45',
    views: '8.2K',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 3,
    title: 'Animated Logo Reveal',
    category: 'Motion Graphics',
    description: 'Dynamic logo animation with particle effects',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&h=300&fit=crop',
    duration: '0:15',
    views: '25K',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 4,
    title: 'Instagram Reel Campaign',
    category: 'Social Media',
    description: 'Engaging social media content for product launch',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=300&fit=crop',
    duration: '0:30',
    views: '45K',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 5,
    title: 'Corporate Culture Video',
    category: 'Brand Videos',
    description: 'Behind-the-scenes look at company culture and values',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    duration: '3:15',
    views: '12K',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 6,
    title: 'Explainer Animation',
    category: 'Motion Graphics',
    description: 'Animated explainer for complex financial services',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
    duration: '2:00',
    views: '18K',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
]

// Computed
const filteredVideos = computed(() => {
  if (activeVideoCategory.value === 'All') {
    return videoPortfolio
  }
  return videoPortfolio.filter(video => video.category === activeVideoCategory.value)
})

// Methods
const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Video quote form submitted:', form.value)
    
    alert('Thank you! Your video production quote request has been submitted. Our team will get back to you within 24 hours with a detailed proposal.')
    
    // Reset form
    form.value = {
      name: '',
      email: '',
      videoType: '',
      duration: '',
      budget: '',
      timeline: '',
      description: '',
      services: []
    }
  } catch (error) {
    console.error('Error submitting video quote:', error)
    alert('Sorry, there was an error submitting your request. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const playVideo = (video: any) => {
  selectedVideo.value = video
  document.body.style.overflow = 'hidden'
}

const closeVideoModal = () => {
  selectedVideo.value = null
  document.body.style.overflow = 'auto'
}

const scrollToQuoteForm = () => {
  const element = document.getElementById('video-quote-form')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const scheduleConsultation = () => {
  router.push('/schedule')
}
</script>

<style scoped>
.videos-page {
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

.videos-content {
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
}

.video-portfolio {
  margin: 80px 0;
}

.portfolio-tabs {
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

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
}

.video-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.video-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.video-thumbnail {
  position: relative;
  overflow: hidden;
}

.video-thumbnail img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.video-item:hover .play-overlay {
  opacity: 1;
}

.play-button {
  width: 64px;
  height: 64px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast);
}

.video-item:hover .play-button {
  transform: scale(1.1);
}

.video-info {
  padding: 24px;
}

.video-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.video-category {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.video-description {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
}

.video-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

.process-section,
.equipment-section {
  margin: 80px 0;
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
}

.timeline-marker {
  width: 64px;
  height: 64px;
  background: var(--bg-secondary);
  border: 3px solid var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.marker-icon {
  font-size: 1.5rem;
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

.equipment-container {
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 64px;
  text-align: center;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  margin-top: 48px;
}

.equipment-item {
  text-align: center;
}

.equipment-icon {
  font-size: 2rem;
  margin-bottom: 16px;
}

.equipment-item h4 {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.equipment-item p {
  color: var(--text-secondary);
  line-height: 1.5;
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
  max-width: 700px;
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

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
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

/* Video Modal */
.video-modal-overlay {
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

.video-modal-content {
  max-width: 900px;
  width: 100%;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.video-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  z-index: 1;
}

.video-player {
  width: 100%;
  height: 500px;
  background: black;
}

.video-modal-info {
  padding: 24px;
}

.modal-video-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.modal-video-description {
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
  
  .quote-section,
  .equipment-container {
    padding: 32px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .checkbox-group {
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
  
  .video-player {
    height: 250px;
  }
  
  .header-content,
  .container {
    padding: 0 16px;
  }
}
</style>