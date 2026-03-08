<template>
  <div class="welcome-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <!-- Logo & Branding -->
        <div class="brand-container">
          <div class="logo-wrapper">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h1 class="brand-name">SmartDesignPro</h1>
        </div>

        <!-- Tagline -->
        <h2 class="hero-title">Create Stunning Designs in Minutes</h2>
        <p class="hero-description">
          Professional design tools at your fingertips. Create logos, posters, social media graphics, 
          and more with our intuitive drag-and-drop editor. No design experience required.
        </p>

        <!-- CTA Buttons -->
        <div class="cta-buttons">
          <button class="btn-primary" @click="handleLogin">
            <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login to Get Started
          </button>
          
          <button class="btn-secondary" @click="handleRegister">
            <svg class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Create Free Account
          </button>
        </div>

        <!-- Features Preview -->
        <div class="features-preview">
          <div class="feature-badge">
            <svg class="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Free Templates</span>
          </div>
          <div class="feature-badge">
            <svg class="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Drag & Drop Editor</span>
          </div>
          <div class="feature-badge">
            <svg class="feature-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Export HD Images</span>
          </div>
        </div>
      </div>

      <!-- Hero Image/Illustration -->
      <div class="hero-image">
        <div class="mockup-container">
          <div class="mockup-screen">
            <div class="mockup-toolbar"></div>
            <div class="mockup-content">
              <div class="mockup-element element-1">ORGANIZATION</div>
              <div class="mockup-element element-2">BUSINESS</div>
              <div class="mockup-element element-3">COMMUNITY</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <h2 class="section-title">Everything You Need to Create Amazing Designs</h2>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <svg class="feature-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="feature-title">Professional Templates</h3>
          <p class="feature-description">Choose from hundreds of professionally designed templates for any occasion.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <svg class="feature-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 class="feature-title">Intuitive Editor</h3>
          <p class="feature-description">Drag, drop, and customize with our easy-to-use design tools.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <svg class="feature-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h3 class="feature-title">Export & Share</h3>
          <p class="feature-description">Download your designs in high quality or share them directly.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-wrapper">
            <svg class="feature-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h3 class="feature-title">Customization</h3>
          <p class="feature-description">Full control over colors, fonts, images, and layouts.</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">Ready to Start Creating?</h2>
        <p class="cta-description">Join thousands of users creating beautiful designs every day</p>
        <button class="btn-cta" @click="handleLogin">
          Get Started Now - It's Free
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="welcome-footer">
      <p>&copy; 2025 SmartDesignPro. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { onMounted, watch } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

// Wait for auth initialization, then check if user is authenticated
onMounted(async () => {
  // Wait for auth to initialize
  if (!authStore.authInitialized) {
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max wait
    while (!authStore.authInitialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }
  
  // After auth is initialized, check if user is authenticated
  if (authStore.isAuthenticated) {
    console.log('✅ User already authenticated, redirecting to home...')
    router.push('/home')
  }
})

// Watch for authentication changes and redirect
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth && authStore.authInitialized) {
    console.log('✅ User authenticated, redirecting to home from welcome page...')
    router.push('/home')
  }
})

const handleLogin = () => {
  console.log('🔐 Navigating to login page...')
  router.push('/login')
}

const handleRegister = () => {
  console.log('📝 Navigating to register page...')
  router.push('/register')
}
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding: 80px 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-content {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Branding */
.brand-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.logo-wrapper {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.logo-icon {
  width: 36px;
  height: 36px;
  color: white;
}

.brand-name {
  font-size: 32px;
  font-weight: 800;
  color: white;
  margin: 0;
}

.hero-title {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 24px;
  color: white;
}

.hero-description {
  font-size: 18px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  max-width: 600px;
}

/* CTA Buttons */
.cta-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.btn-primary,
.btn-secondary {
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
}

.btn-primary {
  background: white;
  color: #667eea;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* Features Preview */
.features-preview {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.feature-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  font-size: 14px;
  font-weight: 600;
}

.feature-icon {
  width: 18px;
  height: 18px;
}

/* Hero Image/Mockup */
.hero-image {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 1s ease-out 0.3s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.mockup-container {
  width: 100%;
  max-width: 500px;
  perspective: 1000px;
}

.mockup-screen {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: rotateY(-10deg) rotateX(5deg);
  transition: transform 0.3s ease;
}

.mockup-screen:hover {
  transform: rotateY(0deg) rotateX(0deg);
}

.mockup-toolbar {
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  margin-bottom: 16px;
}

.mockup-content {
  display: grid;
  gap: 12px;

}

.mockup-element {
  height: 80px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

.mockup-element.element-1 {
  animation-delay: 0s;
}

.mockup-element.element-2 {
  animation-delay: 0.3s;
}

.mockup-element.element-3 {
  animation-delay: 0.6s;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Features Section */
.features-section {
  padding: 100px 60px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 800;
  text-align: center;
  margin-bottom: 60px;
  color: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 32px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.feature-icon-wrapper {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.feature-svg {
  width: 32px;
  height: 32px;
  color: white;
}

.feature-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: white;
}

.feature-description {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

/* CTA Section */
.cta-section {
  padding: 100px 60px;
  text-align: center;
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 800;
  margin-bottom: 16px;
  color: white;
}

.cta-description {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
}

.btn-cta {
  padding: 18px 48px;
  font-size: 18px;
  font-weight: 700;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-cta:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

/* Footer */
.welcome-footer {
  padding: 40px;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

/* Responsive */
@media (max-width: 968px) {
  .hero-section {
    grid-template-columns: 1fr;
    padding: 60px 30px;
    text-align: center;
  }

  .brand-container {
    justify-content: center;
  }

  .hero-description {
    margin-left: auto;
    margin-right: auto;
  }

  .cta-buttons {
    justify-content: center;
  }

  .features-preview {
    justify-content: center;
  }

  .features-section,
  .cta-section {
    padding: 60px 30px;
  }
}
</style>

