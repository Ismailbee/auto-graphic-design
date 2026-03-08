<template>
  <!-- Mobile Menu Overlay with Advanced Blur -->
  <Transition name="overlay-fade">
    <div 
      v-if="isOpen"
      class="mobile-menu-overlay"
      @click="closeSidebar"
    >
      <!-- Animated Background Particles -->
      <div class="overlay-particles">
        <div class="particle" v-for="n in 6" :key="n" :style="{ '--delay': n * 0.2 + 's' }"></div>
      </div>
    </div>
  </Transition>

  <!-- Ultra-Modern Mobile Sidebar -->
  <Transition name="sidebar-slide">
    <nav 
      v-if="isOpen"
      class="mobile-sidebar"
    >
      <!-- Animated Background Gradient -->
      <div class="sidebar-bg-gradient"></div>
      <div class="sidebar-glow-effect"></div>
      
      <!-- Sidebar Header with Glass Effect -->
      <div class="sidebar-header">
        <div class="brand-section">
          <div class="brand-logo">
            <div class="logo-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#a78bfa"/>
                    <stop offset="100%" style="stop-color:#06b6d4"/>
                  </linearGradient>
                </defs>
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="url(#logoGrad)" stroke-width="2" fill="none"/>
                <path d="M2 17l10 5 10-5" stroke="url(#logoGrad)" stroke-width="2" fill="none"/>
                <path d="M2 12l10 5 10-5" stroke="url(#logoGrad)" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <div class="logo-ring"></div>
          </div>
          <div class="brand-info">
            <h2 class="brand-title">
              <span class="title-text">DesignStudio</span>
              <span class="title-highlight"></span>
            </h2>
            <p class="brand-subtitle">
              <span class="pro-badge">PRO</span>
              Professional Suite
            </p>
          </div>
        </div>
        <button 
          class="close-button"
          aria-label="Close menu"
          @click="closeSidebar"
        >
          <span class="close-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </span>
          <span class="close-bg"></span>
        </button>
      </div>

      <!-- Sidebar Content with Stagger Animation -->
      <div class="sidebar-content">
        <!-- Primary Actions -->
        <div class="nav-section" :style="{ '--stagger': 0 }">
          <h3 class="nav-section-title">
            <span class="section-icon">⚡</span>
            Quick Actions
          </h3>
          
          <!-- Auto Design - Featured Button with Premium Effects -->
          <button class="featured-action-button" @click="toggleAutoDesign">
            <div class="featured-bg"></div>
            <div class="featured-shimmer"></div>
            <div class="action-icon featured">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v4m0 14v4m-9-9h4m14 0h-4m-2.5-6.5l2.8-2.8m-9.6 9.6l2.8-2.8m0-4l-2.8-2.8m9.6 9.6l-2.8-2.8"></path>
              </svg>
              <div class="icon-pulse"></div>
            </div>
            <div class="action-content">
              <span class="action-title">Auto Design</span>
              <span class="action-subtitle">
                <span class="ai-badge">AI</span>
                Powered creation
              </span>
            </div>
            <div class="action-indicator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </button>
        </div>

        <!-- Navigation Section -->
        <div class="nav-section" :style="{ '--stagger': 1 }">
          <h3 class="nav-section-title">
            <span class="section-icon">🧭</span>
            Navigation
          </h3>
          
          <a 
            href="#home"
            class="nav-item"
            @click="handleNavigation('#home')"
          >
            <div class="nav-item-bg"></div>
            <div class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span class="nav-label">Home</span>
            <span class="nav-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </a>

          <a 
            href="#template"
            class="nav-item"
            @click="handleNavigation('#template')"
          >
            <div class="nav-item-bg"></div>
            <div class="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <span class="nav-label">Templates</span>
            <span class="template-count">50+</span>
            <span class="nav-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </a>
        </div>

        <!-- Professional Tools -->
        <div class="nav-section" :style="{ '--stagger': 2 }">
          <h3 class="nav-section-title">
            <span class="section-icon">🛠️</span>
            Professional Tools
          </h3>
          
          <a 
            href="/scheduling"
            class="nav-item"
            @click="handleNavigation('/scheduling')"
          >
            <div class="nav-item-bg"></div>
            <div class="nav-icon scheduling">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <span class="nav-label">Scheduling</span>
            <span class="nav-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </a>

          <a 
            href="/imposition"
            class="nav-item"
            @click="handleNavigation('/imposition')"
          >
            <div class="nav-item-bg"></div>
            <div class="nav-icon imposition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              </svg>
            </div>
            <span class="nav-label">Imposition</span>
            <span class="nav-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </a>

          <a 
            href="/mockup"
            class="nav-item"
            @click="handleNavigation('/mockup')"
          >
            <div class="nav-item-bg"></div>
            <div class="nav-icon mockup">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <span class="nav-label">Mockup Generator</span>
            <span class="new-badge">NEW</span>
            <span class="nav-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </a>
        </div>

        <!-- Additional Options -->
        <div class="nav-section" :style="{ '--stagger': 3 }">
          <button class="secondary-action-button" @click="handleMore">
            <div class="secondary-bg"></div>
            <div class="action-icon secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1.5"></circle>
                <circle cx="12" cy="5" r="1.5"></circle>
                <circle cx="12" cy="19" r="1.5"></circle>
              </svg>
            </div>
            <span class="action-label">More Options</span>
            <div class="action-indicator">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- User Profile Section with Glass Effect -->
      <div v-if="user" class="sidebar-user-profile">
        <div class="profile-glass"></div>
        
        <!-- User Info Row -->
        <div class="user-info-row">
          <div class="user-avatar-compact">
            <div class="avatar-ring"></div>
            <div class="avatar-inner">
              <div v-if="!user.avatar" class="avatar-placeholder-compact">
                {{ getUserInitials() }}
              </div>
              <img v-else :src="user.avatar" :alt="user.name || 'User'" class="avatar-image" />
            </div>
            <div class="avatar-status"></div>
          </div>
          <div class="user-details">
            <h3 class="user-name-compact">{{ user.name || user.username || 'User' }}</h3>
            <p class="user-email-compact">{{ user.email }}</p>
          </div>
        </div>
        
        <!-- Compact User Actions -->
        <div class="user-actions-compact">
          <button class="user-action-button-icon-only settings" title="Settings" @click="handleSettings">
            <span class="action-btn-bg"></span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <button class="user-action-button-icon-only logout" title="Logout" @click="handleLogout">
            <span class="action-btn-bg"></span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  </Transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'

// User interface
interface User {
  id: string
  email: string
  name?: string
  username?: string
  avatar?: string
}

// Props
const props = defineProps<{
  isOpen: boolean
  user?: User | null
}>()

// Emits
const emit = defineEmits<{
  close: []
  navigate: [section: string]
  autoDesign: []
  toggleAutoDesign: []
  more: []
  settings: []
  logout: []
}>()

// Close sidebar
const closeSidebar = () => {
  emit('close')
}

// Handle navigation
const handleNavigation = (section: string) => {
  emit('navigate', section)
}

// Handle toggle auto design
const toggleAutoDesign = () => {
  emit('toggleAutoDesign')
}

// Handle more button
const handleMore = () => {
  emit('more')
}

// Handle settings
const handleSettings = () => {
  emit('settings')
}

// Handle logout
const handleLogout = () => {
  emit('logout')
}

// Get user initials
const getUserInitials = () => {
  if (!props.user) return 'U'
  
  const name = props.user.name || props.user.username || props.user.email
  const parts = name.split(' ')
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  
  return name.substring(0, 2).toUpperCase()
}

// Prevent scroll function for touch and wheel events (but allow sidebar scrolling)
const preventScroll = (e: Event) => {
  // Allow scrolling inside the sidebar and all its children
  const target = e.target as Element
  if (target && (
    target.closest('.mobile-sidebar') || 
    target.closest('.sidebar-content') ||
    target.closest('.nav-section') ||
    target.classList.contains('mobile-sidebar') ||
    target.classList.contains('sidebar-content') ||
    target.classList.contains('nav-section')
  )) {
    return // Allow scrolling inside sidebar
  }
  
  // Prevent scrolling on the main page
  e.preventDefault()
  e.stopPropagation()
  return false
}

// Lock body scroll when sidebar is open
watch(() => props.isOpen, (isOpen) => {
  const body = document.body
  
  if (isOpen) {
    // Store current scroll position
    const scrollY = window.scrollY
    
    // Add scroll lock class for CSS control
    body.classList.add('sidebar-scroll-lock')
    
    // Simple CSS-based scroll prevention (no position: fixed)
    body.style.setProperty('overflow', 'hidden', 'important')
    body.style.setProperty('overflow-y', 'hidden', 'important')
    
    // Store scroll position for restoration
    body.dataset.scrollY = scrollY.toString()
    
    // Prevent touch scrolling on mobile
    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('wheel', preventScroll, { passive: false })
  } else {
    // Restore scroll position
    const scrollY = parseInt(body.dataset.scrollY || '0')
    
    // Remove scroll lock class
    body.classList.remove('sidebar-scroll-lock')
    
    // Remove simple scroll lock styles
    body.style.removeProperty('overflow')
    body.style.removeProperty('overflow-y')
    
    // Remove event listeners
    document.removeEventListener('touchmove', preventScroll)
    document.removeEventListener('wheel', preventScroll)
    
    // Restore scroll position
    window.scrollTo(0, scrollY)
    
    // Clean up data attribute
    delete body.dataset.scrollY
  }
})
</script>

<style scoped>
/* ============================================
   ULTRA-MODERN SIDEBAR - 2024 DESIGN TRENDS
   Glassmorphism + Micro-interactions + Premium Effects
   ============================================ */

/* CSS Variables for consistent theming */
:root {
  --sidebar-primary: #8b5cf6;
  --sidebar-secondary: #06b6d4;
  --sidebar-accent: #f472b6;
  --sidebar-bg: rgba(15, 23, 42, 0.95);
  --sidebar-glass: rgba(255, 255, 255, 0.05);
}

/* ===== TRANSITIONS ===== */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
}

.sidebar-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.sidebar-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%) scale(0.95);
  opacity: 0.5;
}

/* ===== OVERLAY ===== */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  z-index: 9999;
}

.overlay-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border-radius: 50%;
  opacity: 0.4;
  animation: floatParticle 8s infinite ease-in-out;
  animation-delay: var(--delay);
}

.particle:nth-child(1) { top: 20%; left: 30%; }
.particle:nth-child(2) { top: 60%; left: 70%; }
.particle:nth-child(3) { top: 40%; left: 50%; }
.particle:nth-child(4) { top: 80%; left: 20%; }
.particle:nth-child(5) { top: 30%; left: 80%; }
.particle:nth-child(6) { top: 70%; left: 40%; }

@keyframes floatParticle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
  50% { transform: translateY(-30px) scale(1.5); opacity: 0.8; }
}

/* ===== MOBILE SIDEBAR ===== */
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  max-width: 88vw;
  background: linear-gradient(165deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    8px 0 40px rgba(0, 0, 0, 0.4),
    inset 1px 0 0 rgba(255, 255, 255, 0.05);
}

.sidebar-bg-gradient {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse 80% 50% at 20% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.sidebar-glow-effect {
  position: absolute;
  top: -100px;
  left: -100px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
}

/* ===== SIDEBAR HEADER ===== */
.sidebar-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
  z-index: 1;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  position: relative;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-inner {
  position: relative;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 
    0 4px 16px rgba(139, 92, 246, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

.logo-ring {
  position: absolute;
  inset: -3px;
  border-radius: 14px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  opacity: 0.5;
  animation: logoRingSpin 8s linear infinite;
}

.logo-ring::before {
  content: '';
  position: absolute;
  inset: 2px;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 12px;
}

@keyframes logoRingSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  position: relative;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.3px;
  line-height: 1.1;
}

.title-text {
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-highlight {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #8b5cf6, #06b6d4);
  border-radius: 2px;
  opacity: 0.6;
}

.brand-subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.1px;
}

.pro-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: linear-gradient(135deg, #f472b6 0%, #8b5cf6 100%);
  color: white;
  font-size: 8px;
  font-weight: 700;
  border-radius: 4px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(244, 114, 182, 0.4);
}

.close-button {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-icon {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.close-bg {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-button:hover .close-bg {
  opacity: 1;
  transform: scale(1);
}

.close-button:hover .close-icon {
  color: #ffffff;
  transform: rotate(90deg);
}

.close-button:active .close-icon {
  transform: rotate(90deg) scale(0.9);
}

/* ===== SIDEBAR CONTENT ===== */
.sidebar-content {
  position: relative;
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #8b5cf6, #06b6d4);
  border-radius: 4px;
}

/* ===== NAVIGATION SECTIONS ===== */
.nav-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: slideInStagger 0.5s ease-out both;
  animation-delay: calc(var(--stagger) * 0.08s + 0.1s);
}

@keyframes slideInStagger {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nav-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 0 4px;
}

.section-icon {
  font-size: 12px;
}

/* ===== FEATURED ACTION BUTTON ===== */
.featured-action-button {
  position: relative;
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.featured-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #06b6d4 100%);
  border-radius: 16px;
  z-index: 0;
  transition: all 0.4s ease;
}

.featured-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 20%,
    rgba(255, 255, 255, 0.1) 45%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 55%,
    transparent 80%
  );
  background-size: 200% 100%;
  z-index: 1;
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.featured-action-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 12px 40px rgba(139, 92, 246, 0.4),
    0 4px 12px rgba(6, 182, 212, 0.2);
}

.featured-action-button:hover .featured-bg {
  filter: brightness(1.1);
}

.featured-action-button:active {
  transform: translateY(-1px) scale(0.98);
}

.action-icon.featured {
  position: relative;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  z-index: 2;
  backdrop-filter: blur(8px);
}

.action-icon.featured svg {
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.icon-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.5; }
}

.action-content {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 2;
}

.action-title {
  font-size: 15px;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.action-subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  margin: 3px 0 0 0;
  font-weight: 500;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.3);
  color: #fef08a;
  font-size: 8px;
  font-weight: 700;
  border-radius: 4px;
  letter-spacing: 0.5px;
  border: 1px solid rgba(254, 240, 138, 0.3);
}

.action-indicator {
  position: relative;
  color: rgba(255, 255, 255, 0.9);
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.featured-action-button:hover .action-indicator {
  transform: translateX(4px);
}

/* ===== NAVIGATION ITEMS ===== */
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 14px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover .nav-item-bg {
  opacity: 1;
  transform: scale(1);
  border-color: rgba(139, 92, 246, 0.2);
}

.nav-item:hover {
  color: #ffffff;
  transform: translateX(4px);
}

.nav-item:active {
  transform: translateX(2px) scale(0.98);
}

.nav-icon {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-right: 12px;
  z-index: 1;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-item:hover .nav-icon {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.nav-icon.scheduling:hover { background: rgba(34, 197, 94, 0.15); }
.nav-icon.imposition:hover { background: rgba(249, 115, 22, 0.15); }
.nav-icon.mockup:hover { background: rgba(6, 182, 212, 0.15); }

.nav-icon svg {
  opacity: 0.85;
  transition: all 0.3s ease;
}

.nav-item:hover .nav-icon svg {
  opacity: 1;
  transform: scale(1.1);
}

.nav-label {
  position: relative;
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  z-index: 1;
}

.nav-arrow {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(-8px);
}

.nav-item:hover .nav-arrow {
  opacity: 1;
  transform: translateX(0);
  color: rgba(255, 255, 255, 0.6);
}

.template-count {
  position: relative;
  z-index: 1;
  padding: 2px 8px;
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  font-size: 10px;
  font-weight: 600;
  border-radius: 20px;
  margin-right: 8px;
}

.new-badge {
  position: relative;
  z-index: 1;
  padding: 2px 8px;
  background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
  color: white;
  font-size: 9px;
  font-weight: 700;
  border-radius: 20px;
  margin-right: 8px;
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
}

/* ===== SECONDARY ACTION BUTTON ===== */
.secondary-action-button {
  position: relative;
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.secondary-bg {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.secondary-action-button:hover .secondary-bg {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.secondary-action-button:hover {
  color: #ffffff;
  transform: translateY(-2px);
}

.secondary-action-button:active {
  transform: translateY(0);
}

.action-icon.secondary {
  position: relative;
  width: 34px;
  height: 34px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  z-index: 1;
  transition: all 0.3s ease;
}

.secondary-action-button:hover .action-icon.secondary {
  background: rgba(255, 255, 255, 0.12);
}

.action-label {
  position: relative;
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  z-index: 1;
}

.secondary-action-button .action-indicator {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.secondary-action-button:hover .action-indicator {
  transform: translateX(3px);
  color: rgba(255, 255, 255, 0.7);
}

/* ===== USER PROFILE SECTION ===== */
.sidebar-user-profile {
  position: relative;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: auto;
  z-index: 1;
}

.profile-glass {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.5) 100%);
  backdrop-filter: blur(10px);
  z-index: 0;
}

.user-info-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1;
  margin-bottom: 12px;
}

.user-avatar-compact {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.avatar-ring {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  animation: avatarRingSpin 6s linear infinite;
}

.avatar-ring::before {
  content: '';
  position: absolute;
  inset: 2px;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 50%;
}

@keyframes avatarRingSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.avatar-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  z-index: 1;
}

.avatar-placeholder-compact {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
  color: white;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border: 2px solid rgba(15, 23, 42, 0.95);
  border-radius: 50%;
  z-index: 2;
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
}

.user-details {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.user-name-compact {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.user-email-compact {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

/* ===== USER ACTION BUTTONS ===== */
.user-actions-compact {
  position: relative;
  display: flex;
  gap: 10px;
  z-index: 1;
}

.user-action-button-icon-only {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn-bg {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.user-action-button-icon-only svg {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.user-action-button-icon-only:hover .action-btn-bg {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
}

.user-action-button-icon-only:hover svg {
  color: #ffffff;
  transform: scale(1.1);
}

.user-action-button-icon-only:active svg {
  transform: scale(0.95);
}

.user-action-button-icon-only.settings:hover .action-btn-bg {
  background: rgba(148, 163, 184, 0.15);
  border-color: rgba(148, 163, 184, 0.3);
}

.user-action-button-icon-only.settings:hover svg {
  animation: settingsSpin 0.6s ease;
}

@keyframes settingsSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(90deg); }
}

.user-action-button-icon-only.logout .action-btn-bg {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.user-action-button-icon-only.logout svg {
  color: #fca5a5;
}

.user-action-button-icon-only.logout:hover .action-btn-bg {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

.user-action-button-icon-only.logout:hover svg {
  color: #fef2f2;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 480px) {
  .mobile-sidebar {
    width: 280px;
  }

  .sidebar-header {
    padding: 14px 16px;
  }

  .brand-logo {
    width: 38px;
    height: 38px;
  }

  .logo-inner {
    width: 32px;
    height: 32px;
  }

  .brand-title {
    font-size: 15px;
  }

  .sidebar-content {
    padding: 14px;
    gap: 18px;
  }

  .featured-action-button {
    padding: 12px 14px;
  }

  .action-icon.featured {
    width: 36px;
    height: 36px;
  }

  .nav-item {
    padding: 10px 12px;
  }

  .nav-icon {
    width: 32px;
    height: 32px;
  }

  .user-avatar-compact {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 320px) {
  .mobile-sidebar {
    width: 260px;
  }

  .brand-section {
    gap: 10px;
  }

  .sidebar-content {
    padding: 12px;
    gap: 16px;
  }
}

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
