<template>
  <!-- Sidebar Component (Portal-like Fixed Position) -->
  <Teleport to="body">
    <div v-if="isSidebarOpen" class="sidebar-container" :class="{ 'sidebar-active': isSidebarOpen }">
      <Sidebar
        :is-open="isSidebarOpen"
        :user="authStore.user"
        @close="closeSidebar"
        @navigate="handleSidebarNavigation"
        @auto-design="handleSidebarAutoDesign"
        @toggle-auto-design="handleSidebarToggleAutoDesign"
        @more="handleSidebarMore"
        @settings="handleSidebarSettings"
        @logout="handleSidebarLogout"
      />
    </div>
  </Teleport>

  <div class="home-page">
    <!-- Mobile Hamburger Button (Fixed Position) -->
    <button 
      class="mobile-hamburger-button"
      :class="{ 'sidebar-open': isSidebarOpen }"
      aria-label="Open menu"
      @click="toggleSidebar"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <!-- Professional Header -->
    <HomeHeader ref="homeHeaderRef" @get-quote="handleGetQuote" />

    <!-- Hero Section -->
    <HeroSection
      @start-project="handleStartProject"
    />

    <!-- Template Section (lazy) -->
    <TemplateSection />

    <!-- Services Section (lazy) -->
    <ServicesSection @learn-more="handleLearnMore" />

    <!-- Process Section (lazy) -->
    <ProcessSection @start-project="handleStartProject" />

    <!-- Team Section (lazy) -->
    <TeamSection />

    <!-- Testimonials Section (lazy) -->
    <TestimonialsSection />

    <!-- Contact Section (lazy) -->
    <ContactSection @submit-contact="handleSubmitContact" />

    <!-- Footer (lazy) -->
    <HomeFooter />

    <!-- Interactive Guide (lazy) -->
    <InteractiveGuide 
      :steps="guideSteps"
      :show-help-button="true"
      @complete="handleGuideComplete"
      @skip="handleGuideSkip"
      @help-mode-toggle="handleHelpModeToggle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'

// Above-the-fold components kept eager
import HomeHeader from '@/components/home/HomeHeader.vue'
import HeroSection from '@/components/home/HeroSection.vue'

// Lazy-load non-critical sections (reduces initial HomePage chunk)
const Sidebar = defineAsyncComponent(() => import('@/components/home/Sidebar.vue'))
const TemplateSection = defineAsyncComponent(() => import('@/components/home/TemplateSection.vue'))
const ServicesSection = defineAsyncComponent(() => import('@/components/home/ServicesSection.vue'))
const ProcessSection = defineAsyncComponent(() => import('@/components/home/ProcessSection.vue'))
const TeamSection = defineAsyncComponent(() => import('@/components/home/TeamSection.vue'))
const TestimonialsSection = defineAsyncComponent(() => import('@/components/home/TestimonialsSection.vue'))
const ContactSection = defineAsyncComponent(() => import('@/components/home/ContactSection.vue'))
const HomeFooter = defineAsyncComponent(() => import('@/components/home/HomeFooter.vue'))
const InteractiveGuide = defineAsyncComponent(() => import('@/components/onboarding/InteractiveGuideEnhanced.vue'))

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

// Component refs
const homeHeaderRef = ref<InstanceType<typeof HomeHeader> | null>(null)

// Interactive Guide Steps
const guideSteps: Array<{ target: string; message: string; position: 'top' | 'bottom' | 'left' | 'right' }> = [
  {
    target: '.logo',
    message: 'Welcome to SmartDesignPro! This is your home for creating amazing designs.',
    position: 'bottom'
  },
  {
    target: '.hero-actions .btn-primary',
    message: 'Click here to start a new project immediately.',
    position: 'right'
  },
  {
    target: '#template',
    message: 'Browse our collection of professional templates for any occasion.',
    position: 'top'
  },
  {
    target: '#services',
    message: 'Explore our wide range of design services tailored for you.',
    position: 'top'
  },
  {
    target: '.header-actions',
    message: 'Login or Sign up here to save your designs and access premium features.<br><br><strong>💡 Pro Tip:</strong> Press <kbd>?</kbd> key anytime to toggle Help Mode!',
    position: 'bottom'
  }
]

const handleGuideComplete = () => {
  console.log('Guide completed')
}

const handleGuideSkip = () => {
  console.log('Guide skipped')
}

const handleHelpModeToggle = (active: boolean) => {
  console.log('Help mode:', active ? 'activated' : 'deactivated')
}

// Sidebar state
const isSidebarOpen = ref(false)

// Sidebar functions
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleSidebarNavigation = (section: string) => {
  closeSidebar()
  // Wait for sidebar to close, then navigate
  setTimeout(() => {
    const element = document.querySelector(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 300)
}

const handleSidebarAutoDesign = () => {
  closeSidebar()
  // Wait for sidebar to close, then navigate to editor-pro
  setTimeout(() => {
    if (!authStore.isAuthenticated) {
      router.push('/login')
    } else {
      router.push('/editor-pro')
    }
  }, 300)
}

const handleSidebarToggleAutoDesign = () => {
  closeSidebar()
  // Wait for sidebar to close, then trigger AutoDesign modal via HomeHeader
  setTimeout(() => {
    homeHeaderRef.value?.toggleAutoDesign()
  }, 300)
}

const handleSidebarMore = () => {
  closeSidebar()
  // Use the HomeHeader ref to toggle the More menu
  setTimeout(() => {
    homeHeaderRef.value?.toggleMoreMenu()
  }, 300)
}

const handleSidebarSettings = () => {
  closeSidebar()
  setTimeout(() => {
    router.push('/settings')
  }, 300)
}

const handleSidebarLogout = async () => {
  closeSidebar()
  setTimeout(async () => {
    try {
      await authStore.logoutUser()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, 300)
}

// Refresh user data when page loads (to get latest plan/tokens)
onMounted(async () => {
  if (authStore.isAuthenticated && authStore.user?.id) {
    try {
      await userStore.fetchUser(
        authStore.user.id,
        authStore.user.email,
        authStore.user.name || authStore.user.username
      )
      console.log('✅ User data refreshed on HomePage')
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  // Debug: Check if page is scrollable
  setTimeout(() => {
    const docHeight = document.documentElement.scrollHeight
    const winHeight = window.innerHeight
    const canScroll = docHeight > winHeight
    
    console.log('🔍 HomePage Scrollability Check:', {
      documentHeight: docHeight,
      windowHeight: winHeight,
      canScroll,
      difference: docHeight - winHeight,
      templateSection: document.getElementById('template'),
      allSectionIds: Array.from(document.querySelectorAll('[id]')).map(el => el.id)
    })
  }, 1000)
})

const handleGetQuote = () => {
  console.log('Get Quote clicked')
}

const handleStartProject = () => {
  console.log('🚀 Start Your Project clicked')
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    router.push('/editor-pro')
  }
}

const handleLearnMore = (service: string) => {
  console.log('Learn more about:', service)
}

const handleSubmitContact = (formData: any) => {
  console.log('Contact form submitted:', formData)
  alert('Thank you for your message! We will get back to you soon.')
}
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  position: relative; /* Required for fixed positioning context */
  transform: none; /* Prevent transform from creating new stacking context */
  contain: none; /* Prevent containment from affecting positioning */
}

/* Sidebar Container - Fixed Position */
.sidebar-container {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 10000 !important;
  pointer-events: none; /* Allow clicks to pass through when sidebar is closed */
  transform: none !important; /* Prevent any transforms from affecting position */
  will-change: auto !important; /* Reset any will-change properties */
}

/* Enable pointer events when sidebar is open */
.sidebar-container.sidebar-active {
  pointer-events: all;
}

/* Ensure sidebar content is also properly positioned */
.sidebar-container :deep(.sidebar) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  height: 100vh !important;
}

/* Mobile Hamburger Button */
.mobile-hamburger-button {
  display: none;
  position: fixed;
  top: 12px;
  left: 20px;
  z-index: 10001;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: none;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
  transition: all 0.3s ease;
  color: white;
}

.mobile-hamburger-button:hover {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.mobile-hamburger-button:active {
  transform: scale(0.95);
}

.mobile-hamburger-button svg {
  display: block;
}

/* Reduce z-index when sidebar is open so sidebar covers hamburger */
.mobile-hamburger-button.sidebar-open {
  z-index: 9999;
}

/* Show hamburger on mobile */
@media (max-width: 768px) {
  .mobile-hamburger-button {
    display: block;
  }
}

/* Smaller button on tiny screens */
@media (max-width: 480px) {
  .mobile-hamburger-button {
    top: 10px;
    left: 12px;
    padding: 8px;
    border-radius: 10px;
  }

  .mobile-hamburger-button svg {
    width: 20px;
    height: 20px;
  }
}
</style>
