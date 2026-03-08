/**
 * Hardware Back Button Handler for Capacitor
 * Handles Android hardware back button navigation
 */

import { useRouter } from 'vue-router';
import { onMounted, onUnmounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth'

export function useHardwareBackButton() {
  const router = useRouter()
  const authStore = useAuthStore()
  let backButtonListener: { remove(): Promise<void> } | null = null
  const lastBackPress = ref(0)
  const doubleBackToExitInterval = 2000 // 2 seconds

  const handleBackButton = () => {
    const currentRoute = router.currentRoute.value
    const currentTime = Date.now()

    // Define exit routes (routes where back button should exit app)
    const exitRoutes = ['/', '/home', '/welcome']
    
    // Define special route handling
    const routeHandlers: Record<string, () => void> = {
      // Auth routes should go to welcome/home
      '/login': () => router.push('/welcome'),
      '/register': () => router.push('/welcome'),
      
      // Dashboard routes should go to home
      '/invoice-dashboard': () => router.push('/home'),
      '/receipt-dashboard': () => router.push('/home'),
      
      // Template pages should go back to dashboard
      '/invoice-template/classic-professional': () => router.push('/invoice-dashboard'),
      '/invoice-template/classic-professional/preview': () => router.push('/invoice-template/classic-professional'),
      
      // Settings and profile pages
      '/settings': () => router.push('/home'),
      '/user-settings': () => router.push('/home'),
      
      // Help pages
      '/help-center': () => router.push('/home'),
      '/support': () => router.push('/help-center'),
      '/faq': () => router.push('/help-center'),
      
      // Legal pages
      '/legal/privacy-policy': () => router.push('/home'),
      '/legal/terms-of-service': () => router.push('/home'),
      '/cookies': () => router.push('/home'),
      
      // Service pages
      '/scheduling': () => router.push('/home'),
      '/imposition': () => router.push('/home'),
      '/mockup': () => router.push('/home'),
      '/videos': () => router.push('/home'),
      '/letterhead': () => router.push('/home'),
      
      // Subscription and tokens
      '/subscription': () => router.push('/home'),
      '/tokens-and-plans': () => router.push('/home'),
      '/referral': () => router.push('/home'),
      
      // Signature page - check for return path
      '/signature': () => {
        const returnPath = localStorage.getItem('signatureReturnPath')
        if (returnPath) {
          localStorage.removeItem('signatureReturnPath')
          router.push(returnPath)
        } else {
          router.push('/home')
        }
      }
    }

    // Check if current route is an exit route
    if (exitRoutes.includes(currentRoute.path)) {
      // Double-tap to exit logic
      if (currentTime - lastBackPress.value < doubleBackToExitInterval) {
        // Try to detect if we're in a Capacitor native app
        if (window.location.protocol === 'capacitor:' || (window as any).Capacitor) {
          // Dynamically import and use App.exitApp
          import('@capacitor/app').then(({ App }) => {
            App.exitApp();
          }).catch(() => {
            // Fallback if import fails
            window.close();
          });
        } else {
          // On web, just close the window
          window.close()
        }
      } else {
        lastBackPress.value = currentTime
        // Show exit prompt
        authStore.showNotification({
          title: 'Exit',
          message: 'Press back again to exit',
          type: 'info',
          duration: 2000
        })
      }
      return
    }

    // Check for specific route handler
    if (routeHandlers[currentRoute.path]) {
      routeHandlers[currentRoute.path]()
      return
    }

    // Handle dynamic routes (with parameters)
    const dynamicRouteHandlers = [
      {
        pattern: /^\/admin/,
        handler: () => router.push('/admin/dashboard')
      },
      {
        pattern: /^\/invoices\/saved/,
        handler: () => router.push('/invoice-dashboard')
      },
      {
        pattern: /^\/receipts\/saved/,
        handler: () => router.push('/receipt-dashboard')
      }
    ]

    for (const { pattern, handler } of dynamicRouteHandlers) {
      if (pattern.test(currentRoute.path)) {
        handler()
        return
      }
    }

    // Default behavior - try browser history, fallback to home
    try {
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/home')
      }
    } catch (error) {
      console.error('❌ Navigation error:', error)
      router.push('/home')
    }
  }

  const setupBackButtonHandler = async () => {
    try {
      // Check if we're in a Capacitor native app
      if (window.location.protocol === 'capacitor:' || (window as any).Capacitor) {
        // Dynamically import Capacitor App for native platforms
        const { App } = await import('@capacitor/app');
        backButtonListener = await App.addListener('backButton', handleBackButton)
      } else {
        // Fallback: Set up keyboard handler for web testing
        const handleKeydown = (event: KeyboardEvent) => {
          if (event.key === 'Escape' || (event.altKey && event.key === 'ArrowLeft')) {
            handleBackButton()
          }
        }
        
        document.addEventListener('keydown', handleKeydown)
        
        return () => {
          document.removeEventListener('keydown', handleKeydown)
        }
      }
    } catch (error) {
      console.error('❌ Failed to set up hardware back button handler:', error)
      
      // Fallback: Set up keyboard handler for web testing
      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' || (event.altKey && event.key === 'ArrowLeft')) {
          handleBackButton()
        }
      }
      
      document.addEventListener('keydown', handleKeydown)
      
      return () => {
        document.removeEventListener('keydown', handleKeydown)
      }
    }
  }

  const removeBackButtonHandler = async () => {
    if (backButtonListener) {
      try {
        await backButtonListener.remove()
      } catch (error) {
        console.error('❌ Failed to remove hardware back button handler:', error)
      }
    }
  }

  // Auto-setup and cleanup
  onMounted(() => {
    setupBackButtonHandler()
  })

  onUnmounted(() => {
    removeBackButtonHandler()
  })

  return {
    setupBackButtonHandler,
    removeBackButtonHandler,
    handleBackButton,
    // previously returned toast helper; now uses authStore.showNotification
  }
}