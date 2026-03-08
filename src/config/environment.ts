/**
 * Environment Configuration
 * Handles differences between web and mobile (Capacitor) environments
 */

// Check if running on native platform (Android/iOS)
export const isNativePlatform = (): boolean => {
  return typeof (window as any).Capacitor !== 'undefined' && 
    (window as any).Capacitor.isNativePlatform && 
    (window as any).Capacitor.isNativePlatform()
}

// Check if running on Android specifically
export const isAndroid = (): boolean => {
  if (typeof (window as any).Capacitor !== 'undefined') {
    return (window as any).Capacitor.getPlatform?.() === 'android'
  }
  return false
}

// Check if running on iOS
export const isIOS = (): boolean => {
  if (typeof (window as any).Capacitor !== 'undefined') {
    return (window as any).Capacitor.getPlatform?.() === 'ios'
  }
  return false
}

/**
 * API Configuration
 * For mobile apps, we need to either:
 * 1. Use a real backend server URL (not localhost)
 * 2. Or disable backend features and work offline
 */
export const API_CONFIG = {
  // Set to true to enable offline mode (no backend calls)
  // Controlled by env var to avoid accidentally shipping offline mode.
  OFFLINE_MODE: import.meta.env.VITE_OFFLINE_MODE === 'true',
  
  // Base URLs - these would need to be real server URLs for production
  // For now, offline mode means these won't be used
  AUTH_API_URL: import.meta.env.VITE_AUTH_API_URL || '',
  PAYMENT_API_URL: import.meta.env.VITE_PAYMENT_API_URL || '',
  EXPORT_API_URL: import.meta.env.VITE_API_URL || '',
  AUTO_DESIGN_API_URL: import.meta.env.VITE_AUTO_DESIGN_API_URL || '',
  COLLABORATION_URL: import.meta.env.VITE_COLLABORATION_URL || '',
}

/**
 * Feature Flags
 * Control which features are enabled
 * 
 * Set USE_REAL_AUTH to true for real Firebase login
 * Set USE_REAL_AUTH to false for offline mode (no login needed)
 */

// Controlled by env var so production can use real auth.
const USE_REAL_AUTH = import.meta.env.VITE_USE_REAL_AUTH === 'true'

export const FEATURES = {
  // Token system - enabled when using real auth
  TOKENS_ENABLED: USE_REAL_AUTH,
  
  // Firebase authentication - enabled when using real auth
  FIREBASE_AUTH_ENABLED: USE_REAL_AUTH,
  
  // Payment system - enabled when using real auth
  PAYMENTS_ENABLED: USE_REAL_AUTH,
  
  // Collaboration features - requires backend
  COLLABORATION_ENABLED: false,
  
  // Admin dashboard - disabled for mobile
  ADMIN_ENABLED: !isNativePlatform(),
  
  // Background removal - can work offline with local processing
  BACKGROUND_REMOVAL_ENABLED: true,
  
  // SVG Export - works offline
  SVG_EXPORT_ENABLED: true,
  
  // PNG Export - works offline
  PNG_EXPORT_ENABLED: true,
}

/**
 * Default user for offline mode
 */
export const OFFLINE_USER = {
  id: 'offline-user',
  email: 'user@offline.local',
  displayName: 'User',
  photoURL: null,
  tokens: 9999, // Unlimited tokens in offline mode
  plan: 'premium',
  isAdmin: false,
  createdAt: new Date().toISOString(),
}

/**
 * Check if a feature is available
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature]
}

/**
 * Get API URL - returns empty string in offline mode
 */
export function getApiUrl(type: keyof typeof API_CONFIG): string {
  if (API_CONFIG.OFFLINE_MODE) {
    return ''
  }
  return API_CONFIG[type] || ''
}

console.log('🔧 Environment Config:', {
  isNative: isNativePlatform(),
  isAndroid: isAndroid(),
  isIOS: isIOS(),
  offlineMode: API_CONFIG.OFFLINE_MODE,
  features: FEATURES
})
