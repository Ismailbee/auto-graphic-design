<template>
  <header class="header">
    <div class="header-content">
      <div class=" logo">
        <span class="logo-text">Design</span>
        <span class="logo-text-accent">Studio</span>
      </div>

      <!-- Desktop Navigation -->
      <nav class="nav-menu desktop-nav">
        <a href="#home" class="nav-link" @click.prevent="scrollToSection('home')">Home</a>
        <a href="#template" class="nav-link" @click.prevent="scrollToSection('template')">Template</a>
        
        <!-- New Service Pages -->
        <router-link to="/scheduling" class="nav-link">Scheduling</router-link>
        <router-link to="/imposition" class="nav-link">Imposition</router-link>
        <router-link to="/mockup" class="nav-link">Mockup</router-link>

        <!-- Auto Design Modal Trigger (replaces dropdown) -->
        <button class="more-button" @click="toggleAutoDesign">
          Auto Design
          <svg class="more-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v3m0 10v3m5-11l2.121-2.121M4.879 19.121L7 17m10 0l2.121 2.121M4.879 4.879L7 7" />
          </svg>
        </button>

        <!-- More Menu Button -->
        <button class="more-button" @click="toggleMoreMenu">
          More
          <svg class="more-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </nav>
      <!-- User Profile (Authenticated) or Get Started Button (Not Authenticated) -->
      <div class="header-actions">
        <ThemeToggle class="theme-toggle-btn" />

        <!-- Token Display (Authenticated Users Only) -->
        <HeaderTokenDisplay v-if="authStore.isAuthenticated" class="token-display-component" />

        <!-- Notifications (Authenticated Users Only) -->
        <NotificationBell v-if="authStore.isAuthenticated" class="notification-component" />

        <!-- Get Started Button (Not Authenticated) -->
        <button v-if="!authStore.isAuthenticated" class="cta-button" @click="handleGetQuote">
          <span class="cta-text">Get Started</span>
        </button>

        <!-- User Profile Dropdown (Desktop Only - Authenticated Users) -->
        <div v-if="authStore.user" class="header-user-profile desktop-only">
          <div v-if="!authStore.user.avatar" class="avatar-placeholder" @click="toggleUserDropdown">
            {{ getUserInitials() }}
          </div>
          <img v-else :src="authStore.user.avatar" :alt="authStore.user.name || 'User'" class="avatar-image" @click="toggleUserDropdown" />
          
          <!-- Dropdown Menu -->
          <transition name="dropdown">
            <div v-if="showUserDropdown" class="user-dropdown-menu">
              <div class="user-info">
                <span class="user-name">{{ authStore.user.name || authStore.user.username || 'User' }}</span>
                <span class="user-email">{{ authStore.user.email }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" @click="handleSettings">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </button>
              <button class="dropdown-item logout" @click="handleLogout">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m6 12l4-4m0 0l-4-4m4 4H9" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </transition>

          <!-- Avatar Uploader Modal -->
          <AvatarUploader v-model="showAvatarUploader" @save="onAvatarSaved" />
        </div>
      </div>
    </div>

    <!-- More Menu Modal -->
    <MoreMenuModal
      :is-open="isMoreMenuOpen"
      @close="closeMoreMenu"
      @navigate="handleMoreMenuNavigate"
      @microApp="handleMicroAppNavigate"
    />
    
    <!-- Auto Design Modal -->
    <AutoDesignModal
      :is-open="isAutoDesignOpen"
      @close="closeAutoDesign"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import HeaderTokenDisplay from '@/components/ui/HeaderTokenDisplay.vue'
import NotificationBell from '@/components/notifications/NotificationBell.vue'
import AutoDesignModal from './AutoDesignModal.vue'
import MoreMenuModal from './MoreMenuModal.vue'
import AvatarUploader from '@/components/common/AvatarUploader.vue'

const router = useRouter()
const isNative = Capacitor.isNativePlatform()
const authStore = useAuthStore()

// State for More Menu Modal
const isMoreMenuOpen = ref(false)

// State for Auto Design Modal
const isAutoDesignOpen = ref(false)

// State for User Dropdown
const showUserDropdown = ref(false)
// State for Avatar Uploader modal
const showAvatarUploader = ref(false)

// Emit events for parent component
const emit = defineEmits<{
  getQuote: []
}>()

// Toggle More Menu
const toggleMoreMenu = () => {
  isMoreMenuOpen.value = !isMoreMenuOpen.value
}

// Close More Menu
const closeMoreMenu = () => {
  isMoreMenuOpen.value = false
}

// Toggle Auto Design Modal
const toggleAutoDesign = () => {
  isAutoDesignOpen.value = !isAutoDesignOpen.value
}

// Close Auto Design Modal
const closeAutoDesign = () => {
  isAutoDesignOpen.value = false
}

// Handle click outside dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const dropdown = document.querySelector('.header-user-profile')
  
  if (dropdown && !dropdown.contains(target)) {
    showUserDropdown.value = false
  }
}

// Expose methods to parent component
defineExpose({
  toggleMoreMenu,
  toggleAutoDesign
})

onMounted(() => {
  // Handle click outside dropdown
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Clean up body scroll
  document.body.style.overflow = ''
  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside)
})

// (Removed Legal dropdown handlers)

// Handle More Menu navigation
const handleMoreMenuNavigate = (action: string) => {
  // Handle different actions
  switch (action) {
    case 'referral':
      router.push('/referral')
      break
    case 'subscription':
      router.push('/subscription')
      break
    case 'tokens-and-plans':
      router.push('/tokens-and-plans')
      break
    case 'terms':
      router.push('/legal/terms-of-service')
      break
    case 'privacy':
      router.push('/legal/privacy-policy')
      break
    case 'privacy-settings':
      router.push('/privacy-settings')
      break
    case 'cookies':
      router.push('/legal/cookies')
      break
    case 'about':
      router.push('/about')
      break
    case 'suggest':
      router.push('/feedback/suggest')
      break
    case 'help':
      router.push('/help-center')
      break
    case 'rate':
      // Open rating modal or external link
      break
    case 'schedule':
      router.push('/scheduling')
      break
    case 'support':
      router.push('/support')
      break
    case 'faq':
      router.push('/faq')
      break
    case 'notifications':
      router.push('/notifications')
      break
    case 'videos':
      router.push('/videos')
      break
    default:
  }
}

// Handle Micro-App navigation
const handleMicroAppNavigate = (appName: string) => {
  switch (appName) {
    case 'ican':
      // Micro-apps are not included in native (APK) builds.
      if (isNative) return
      if (hasMicroAppAccess()) {
        router.push('/ican')
      } else {
        showAccessDeniedAlert('ICAN Portal')
      }
      break
    case 'branch':
      // Future branch management app
      console.log('Branch Manager - Coming Soon')
      break
    case 'analytics':
      // Future analytics hub
      console.log('Analytics Hub - Coming Soon')
      break
    default:
      console.log(`Unknown micro-app: ${appName}`)
  }
}

// Check if user has special access for micro-apps
const checkSpecialAccess = (): boolean => {
  const userRole = authStore.user?.role || 'user'
  const hasSpecialAccess = userRole === 'admin' || 
                          userRole === 'moderator' || 
                          userRole === 'special' ||
                          (authStore.user as any)?.hasICANAccess === true

  // Development bypass
  const isDevelopment = import.meta.env.DEV
  const allowDevBypass = import.meta.env.VITE_ALLOW_MICROAPP_BYPASS === 'true'
  
  if (isDevelopment && allowDevBypass) {
    return true
  }
  
  return hasSpecialAccess
}

// Show access denied alert
const showAccessDeniedAlert = (appName: string) => {
  // You can implement a modal here or use the existing notification system
  alert(`Access to ${appName} requires special permissions. Please contact your administrator.`)
}

// Smooth scroll to section
const scrollToSection = async (sectionId: string) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('🔍 Scrolling to section:', sectionId)
  }
  
  const currentPath = router.currentRoute.value.path
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('📍 Current path:', currentPath)
  }

  // Check if we're on a home page (either / or /home)
  const isHomePage = currentPath === '/' || currentPath === '/home'
  
  if (!isHomePage) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('📍 Not on home page, navigating to /home first...')
    }
    // Navigate to home page first, then scroll
    await router.push('/home')
    // Wait longer for DOM to fully render and Vue components to mount
    await new Promise(resolve => setTimeout(resolve, 300))
  } else {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('✅ Already on home page')
    }
    // Still wait a bit for any pending renders
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  // Try multiple times to find the element (in case it's still loading)
  let element: HTMLElement | null = null
  let attempts = 0
  const maxAttempts = 10

  while (!element && attempts < maxAttempts) {
    element = document.getElementById(sectionId)
    if (!element) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`⏳ Attempt ${attempts + 1}: Element #${sectionId} not found, waiting...`)
      }
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    } else {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`✅ Found element #${sectionId} on attempt ${attempts + 1}`)
      }
    }
  }

  if (element) {
    // Calculate header height dynamically
    const header = document.querySelector('.header') as HTMLElement
    // Add extra offset to hide HeroSection completely
    const headerOffset = header ? header.offsetHeight + -110 : 150
    
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('📏 Header offset:', headerOffset + 'px')
    }
    
    // Debug page scrollability
    const documentHeight = document.documentElement.scrollHeight
    const windowHeight = window.innerHeight
    const canScroll = documentHeight > windowHeight
    
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('📊 Page scrollability check:', {
        documentHeight,
        windowHeight,
        canScroll,
        difference: documentHeight - windowHeight
      })
    }
    
    const elementPosition = element.getBoundingClientRect().top
    const currentScrollY = window.scrollY || window.pageYOffset
    const offsetPosition = elementPosition + currentScrollY - headerOffset

    const finalPosition = Math.max(0, offsetPosition)

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('📍 Scroll details:', {
        elementPosition,
        currentScrollY,
        offsetPosition,
        finalPosition,
        elementTop: element.offsetTop
      })
    }

    // Force body overflow to ensure scrollability
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('✅ Scrolling to position:', finalPosition)
    }
    
    // Try multiple scroll methods for maximum compatibility
    window.scrollTo({
      top: finalPosition,
      behavior: 'smooth'
    })
    
    // Fallback: Try instant scroll if smooth doesn't work
    setTimeout(() => {
      const currentScroll = window.scrollY || window.pageYOffset
      if (Math.abs(currentScroll - finalPosition) > 10) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('⚠️ Smooth scroll failed, trying instant scroll')
        }
        window.scrollTo(0, finalPosition)
        document.documentElement.scrollTop = finalPosition
        document.body.scrollTop = finalPosition
      }
    }, 100)
    
    // Check if scroll actually happened after a delay
    if (import.meta.env.DEV) {
      setTimeout(() => {
        const newScrollY = window.scrollY || window.pageYOffset
        // eslint-disable-next-line no-console
        console.log('🔍 Scroll verification:', {
          targetPosition: finalPosition,
          actualPosition: newScrollY,
          scrollWorked: Math.abs(newScrollY - finalPosition) < 50,
          bodyOverflow: document.body.style.overflow || 'auto',
          htmlOverflow: document.documentElement.style.overflow || 'auto'
        })
      }, 600)
    }
  } else {
    console.error('❌ Element not found with ID after all attempts:', sectionId)
    console.error('📍 Current route:', router.currentRoute.value.path)
    console.error('📋 Available elements with IDs:',
      Array.from(document.querySelectorAll('[id]')).map(el => el.id)
    )
    
    // Try fallback - scroll to top if element not found
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

const handleGetQuote = () => {
  // Navigate to login page instead of modal
  router.push('/login')
}

// Get user initials from name/username/email
const getUserInitials = (): string => {
  const user = authStore.user
  if (!user) return 'U'
  
  const name = user.name || user.username || user.email || 'User'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Toggle user dropdown
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

// Handle settings navigation
const handleSettings = () => {
  showUserDropdown.value = false
  router.push('/settings')
}

// Handle logout
const handleLogout = async () => {
  showUserDropdown.value = false
  if (confirm('Are you sure you want to logout?')) {
    try {
      await authStore.logoutUser()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
}

// Called when AvatarUploader emits save with a dataURL
const onAvatarSaved = async (dataUrl: string) => {
  try {
    await authStore.updateAvatar(dataUrl)
    showAvatarUploader.value = false
  } catch (err) {
    console.error('Failed to update avatar:', err)
  }
}
</script>

<style scoped>
/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.98);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Ensure header stays below mobile menu */
@media (max-width: 768px) {
  .header {
    z-index: 1000;
  }
}

.header:hover {
  border-bottom-color: rgba(6, 182, 212, 0.2);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* Prevent any overflow */
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 26px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: -0.5px;
  flex-shrink: 0;
  min-width: fit-content;
}

/* Mobile styles for logo */
@media (max-width: 768px) {
  .logo {
    margin-left: 70px; /* Increased to avoid hamburger button overlap */
    font-size: 20px;
    gap: 3px;
  }
}

/* Medium screens (tablets) */
@media (max-width: 1024px) and (min-width: 769px) {
  .logo {
    margin-left: 20px; /* Some spacing on tablets */
  }
}

/* Extra small screens - adjust for smaller hamburger button */
@media (max-width: 480px) {
  .logo {
    margin-left: 65px; /* Slightly less margin for smaller hamburger button */
    font-size: 18px;
  }
}

.logo:hover {
  transform: scale(1.02);
}

.logo-text {
  color: white;
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}

.logo-text-accent {
  background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.logo-text-accent::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #06b6d4, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.logo:hover .logo-text-accent::after {
  opacity: 1;
}

/* Navigation */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
  max-width: 100%;
}

/* Hide desktop navigation on mobile */
@media (max-width: 768px) {
  .nav-menu.desktop-nav {
    display: none;
  }
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  padding: 10px 20px;
  border-radius: 8px;
  letter-spacing: 0.3px;
}

.nav-link:hover {
  color: #22d3ee;
  background: rgba(6, 182, 212, 0.08);
  transform: translateY(-1px);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #06b6d4, #22d3ee);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}

.nav-link:hover::after {
  width: 60%;
}

/* Legal Dropdown */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  letter-spacing: 0.3px;
}

.dropdown-toggle:hover {
  color: #22d3ee;
  background: rgba(6, 182, 212, 0.08);
  transform: translateY(-1px);
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotate-180 {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 280px;
  background: rgba(15, 23, 42, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  padding: 16px;
  margin-top: 8px;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.dropdown-section {
  margin-bottom: 12px;
}

.dropdown-section:last-child {
  margin-bottom: 0;
}

.dropdown-section-title {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding: 0 12px;
}

.dropdown-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.3s ease;
  margin-bottom: 2px;
}

.dropdown-link:hover {
  color: #22d3ee;
  background: rgba(6, 182, 212, 0.12);
  transform: translateX(4px);
}

.dropdown-link .dropdown-icon {
  font-size: 16px;
  width: auto;
  height: auto;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 12px 0;
}

/* More Button */
.more-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  letter-spacing: 0.3px;
}

.more-button:hover {
  color: #22d3ee;
  border-color: rgba(6, 182, 212, 0.4);
  background: rgba(6, 182, 212, 0.12);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15);
}

.more-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.more-button:hover .more-icon {
  transform: rotate(90deg);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: fit-content;
}

/* Mobile responsive header actions */
@media (max-width: 768px) {
  .header-actions {
    gap: 8px; /* Balanced gap for mobile */
    flex-wrap: nowrap;
    overflow: hidden;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .header-actions {
    gap: 6px; /* Smaller but balanced gap for tiny screens */
  }
}

@media (max-width: 400px) {
  .header-actions {
    gap: 5px; /* Minimal but consistent spacing */
  }
}

/* Header User Profile (Desktop Only) */
.header-user-profile {
  position: relative;
  display: flex;
  align-items: center;
}

.user-avatar-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar-trigger:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(6, 182, 212, 0.4);
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.15);
}

.user-avatar-trigger .avatar-placeholder,
.user-avatar-trigger .avatar-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #06b6d4;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #06b6d4;
}

.avatar-placeholder:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #06b6d4;
}

.avatar-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 240px;
  background: rgba(30, 30, 40, 0.98);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.user-dropdown-menu .user-info {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 8px;
}

.user-dropdown-menu .user-name {
  font-size: 15px;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.user-dropdown-menu .user-email {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.dropdown-item:hover {
  background: rgba(6, 182, 212, 0.15);
  color: #22d3ee;
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Desktop Only */
.desktop-only {
  display: flex;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

/* Get Quote CTA Button */
.cta-button {
  padding: 10px 24px;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .nav-links {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px; /* Reduced horizontal padding on mobile */
    gap: 16px; /* Reduced gap between logo and actions */
  }

  .cta-button {
    padding: 8px 12px; /* More compact button */
    font-size: 12px;
    white-space: nowrap; /* Prevent text wrapping */
  }
  
  /* Make avatar smaller on mobile */
  .avatar-placeholder,
  .avatar-image {
    width: 32px !important;
    height: 32px !important;
    font-size: 12px;
  }
}

/* Additional mobile adjustments for very small screens */
@media (max-width: 480px) {
  .header-content {
    padding: 10px 12px; /* Even more compact on tiny screens */
    gap: 12px; /* Smaller gap for tiny screens */
  }
  
  .cta-button {
    padding: 6px 10px;
    font-size: 11px;
  }
  
  /* Even smaller avatar for tiny screens */
  .avatar-placeholder,
  .avatar-image {
    width: 28px !important;
    height: 28px !important;
    font-size: 10px;
  }
}

/* Ensure header content doesn't overflow on mobile */
@media (max-width: 768px) {
  .header-content {
    max-width: 100%;
    box-sizing: border-box;
    position: relative;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo {
    flex-shrink: 0;
    margin-left: 50px; /* Adjusted for mobile menu button */
    flex: 0 0 auto;
  }
  
  .header-actions {
    flex-shrink: 0;
    min-width: auto;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    max-width: calc(100vw - 180px); /* Responsive width based on viewport */
    overflow: visible;
  }
}

/* Prevent header items from being cut off on small screens */
@media (max-width: 480px) {
  .logo {
    margin-left: 45px !important;
    max-width: 120px;
  }
  
  .header-actions {
    max-width: calc(100vw - 150px);
  }
}

/* Ultra-small screens */
@media (max-width: 360px) {
  .logo {
    margin-left: 40px !important;
    font-size: 16px !important;
  }
  
  .header-actions {
    max-width: calc(100vw - 130px);
  }
}

/* Desktop styles for header action components - consistent sizing */
@media (min-width: 769px) {
  .theme-toggle-btn :deep(button) {
    width: 40px !important;
    height: 40px !important;
    padding: 8px !important;
  }
  
  .notification-component :deep(button) {
    width: 40px !important;
    height: 40px !important;
    padding: 8px !important;
  }
  
  .notification-component :deep(.notification-icon) {
    width: 24px !important;
    height: 24px !important;
  }
  
  .token-display-component :deep(.ion-chip) {
    height: 40px !important;
    min-height: 40px !important;
    padding: 6px 12px !important;
    font-size: 14px !important;
    max-width: none !important;
  }
}

/* Mobile styles for header action components */
@media (max-width: 768px) {
  /* Make theme toggle smaller on mobile */
  .theme-toggle-btn :deep(button) {
    width: 34px !important;
    height: 34px !important;
    padding: 7px !important;
  }
  
  /* Make notification bell smaller on mobile */
  .notification-component :deep(button) {
    width: 34px !important;
    height: 34px !important;
    padding: 7px !important;
  }
  
  .notification-component :deep(.notification-icon) {
    width: 20px !important;
    height: 20px !important;
  }
  
  /* Balanced token display on mobile - matches other components */
  .token-display-component :deep(.ion-chip) {
    height: 34px !important;
    min-height: 34px !important;
  }
}

/* Extra small screens - maintain consistent sizing */
@media (max-width: 400px) {
  .theme-toggle-btn :deep(button) {
    width: 32px !important;
    height: 32px !important;
    padding: 6px !important;
  }
  
  .notification-component :deep(button) {
    width: 32px !important;
    height: 32px !important;
    padding: 6px !important;
  }
  
  .notification-component :deep(.notification-icon) {
    width: 18px !important;
    height: 18px !important;
  }
  
  .token-display-component :deep(.ion-chip) {
    height: 32px !important;
    min-height: 32px !important;
  }
  
  .cta-button {
    padding: 6px 8px;
    font-size: 10px;
  }
  
  .cta-text {
    display: none;
  }
  
  .cta-button::after {
    content: "Start";
  }
}
</style>
