/**
 * Browser Compatibility and Storage Fallbacks
 * Handles tracking prevention, storage quotas, and cross-browser compatibility
 */

// Detect tracking prevention
export const isTrackingPreventionActive = (): boolean => {
  try {
    // Try to access localStorage
    localStorage.setItem('__test__', 'test')
    localStorage.removeItem('__test__')
    return false
  } catch {
    return true
  }
}

// Enhanced storage detection
export const getStorageAvailability = () => {
  const result = {
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    cookieStorage: false,
    trackingPrevention: false
  }

  // Test localStorage
  try {
    if (typeof Storage !== 'undefined' && localStorage) {
      localStorage.setItem('__storage_test__', 'test')
      localStorage.removeItem('__storage_test__')
      result.localStorage = true
    }
  } catch (error) {
    console.warn('💾 localStorage unavailable:', error.message)
    result.trackingPrevention = true
  }

  // Test sessionStorage
  try {
    if (typeof Storage !== 'undefined' && sessionStorage) {
      sessionStorage.setItem('__storage_test__', 'test')
      sessionStorage.removeItem('__storage_test__')
      result.sessionStorage = true
    }
  } catch (error) {
    console.warn('💾 sessionStorage unavailable:', error.message)
  }

  // Test IndexedDB
  try {
    result.indexedDB = !!window.indexedDB
  } catch (error) {
    console.warn('💾 IndexedDB unavailable:', error.message)
  }

  // Test cookie storage
  try {
    document.cookie = '__cookie_test__=test; path=/'
    result.cookieStorage = document.cookie.includes('__cookie_test__')
    // Clean up
    document.cookie = '__cookie_test__=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  } catch (error) {
    console.warn('🍪 Cookie storage unavailable:', error.message)
  }

  return result
}

// Initialize storage compatibility
export const initStorageCompatibility = () => {
  const availability = getStorageAvailability()
  
  console.log('💾 Storage Availability Check:', {
    localStorage: availability.localStorage ? '✅' : '❌',
    sessionStorage: availability.sessionStorage ? '✅' : '❌', 
    indexedDB: availability.indexedDB ? '✅' : '❌',
    cookies: availability.cookieStorage ? '✅' : '❌',
    trackingPrevention: availability.trackingPrevention ? '⚠️ Active' : '✅ Inactive'
  })

  // Show user-friendly message if tracking prevention is active
  if (availability.trackingPrevention) {
    console.info(`
🛡️ PRIVACY MODE DETECTED
Your browser's tracking prevention is active, which may limit some features:
• Settings may not persist between sessions
• Some analytics features disabled
• Using memory-based fallbacks

This is normal and helps protect your privacy! 
All core features will continue to work.
    `)
  }

  return availability
}

// Graceful analytics fallback
export const initAnalyticsFallback = () => {
  // Disable or stub analytics functions when tracking prevention is active
  if (isTrackingPreventionActive()) {
    console.log('🔇 Analytics disabled due to tracking prevention')
    
    // Stub global analytics functions to prevent errors
    window.gtag = window.gtag || function() { 
      console.log('📊 Analytics call blocked by tracking prevention:', arguments) 
    }
    
    // Stub other common analytics
    window.dataLayer = window.dataLayer || []
    window.fbq = window.fbq || function() {
      console.log('📘 Facebook Analytics blocked by tracking prevention:', arguments)
    }
  }
}

// Initialize on import
try {
  initStorageCompatibility()
  initAnalyticsFallback()
} catch (error) {
  console.warn('⚠️ Storage compatibility init failed:', error)
}