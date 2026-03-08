console.log('🚀 main.ts is loading...')

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import './styles/theme.css'
import './styles/wedding-fonts.css'
import App from './App.vue'
import { useThemeStore } from './stores/theme'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCloudArrowUp, faHome } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCloudArrowUp, faHome)

// Development console filter
if (import.meta.env.DEV) {
  import('./utils/console-filter').then(module => {
    module.default.enable();
  });
  
  // Aggressive browser warning suppression
  import('./utils/browser-warning-suppressor');
}

// Capacitor imports
import { App as CapacitorApp } from '@capacitor/app'

// Ionic Vue imports
import { IonicVue } from '@ionic/vue'
import '@ionic/vue/css/core.css'
/* ... other ionic css imports ... */

// Suppress Datadog Browser SDK warning safely
const originalWarn = console.warn
console.warn = (...args: any[]) => {
  try {
    if (typeof args[0] === 'string' && args[0].includes('Datadog Browser SDK')) {
      return
    }
  } catch (e) {
    // fall through to normal warn
  }
  originalWarn.apply(console, args)
}

// FontAwesome imports
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* icons import truncated for brevity in snippet; keep your original list */

library.add(/* ...your icons... */)

async function timeoutPromise<T>(p: Promise<T>, ms: number, label = 'operation') {
  let timer: any
  const t = new Promise<T>((_, rej) => {
    timer = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)
  })
  return Promise.race([p, t]) as Promise<T>
}

async function unregisterServiceWorkersDev() {
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map(r => r.unregister()))
      console.log('🧹 Service workers unregistered (dev)')
    } catch (err) {
      console.warn('Could not unregister service workers:', err)
    }
  }
}

async function bootstrap() {
  console.log('🔧 creating app + pinia + plugins...')
  const app = createApp(App)
  const pinia = createPinia()

  // Register Font Awesome component globally
  app.component('font-awesome-icon', FontAwesomeIcon)

  // global error/warn handlers
  app.config.errorHandler = (err, instance, info) => {
    console.error('🔴 Vue Error:', err)
    console.error('Component:', instance?.$options?.name || 'Unknown')
    console.error('Info:', info)
    const appDiv = document.getElementById('app')
    if (appDiv && !appDiv.innerHTML.includes('Failed to mount')) {
      appDiv.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace; background: #ffe0e0; border: 1px solid red; border-radius: 4px;">
        <h2>Vue Error</h2>
        <p><strong>Error:</strong> ${String(err)}</p>
        <p><strong>Component:</strong> ${instance?.$options?.name || 'Unknown'}</p>
        <p><strong>Info:</strong> ${info}</p>
      </div>`
    }
  }
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('🟡 Vue Warning:', msg)
    console.warn('Trace:', trace)
  }

  app.use(IonicVue)
  app.component('font-awesome-icon', FontAwesomeIcon)
  app.use(pinia)
  app.use(router)

  // Initialize theme with a timeout & error handling
  const themeStore = useThemeStore()
  try {
    console.log('🟢 Initializing theme (initTheme)...')
    // If initTheme is sync this will still work. We guard with a 5s timeout.
    await timeoutPromise(
      Promise.resolve(themeStore.initTheme && themeStore.initTheme()),
      5000,
      'themeStore.initTheme'
    )
    console.log('🟢 Theme initialized')
  } catch (err) {
    console.error('⚠️ theme init failed or timed out:', err)
  }

  // Wait for router to be ready (prevents some blank-screen race conditions)
  try {
    console.log('⏳ Waiting for router to be ready...')
    await Promise.race([
      router.isReady(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('router.isReady() timed out')), 3000))
    ])
    console.log('✅ Router is ready')
  } catch (err) {
    console.warn('⚠️ Router readiness timeout - continuing to mount anyway:', err)
    // Don't force navigation - just continue with mounting
    // The router will handle the navigation on its own
    // Previous code was causing redirect to home:
    // await router.replace(router.currentRoute.value.fullPath || '/')
  }

  console.log('🚀 Mounting Vue app to #app...')
  try {
    app.mount('#app')
    console.log('✅ Vue app mounted successfully')
  } catch (err) {
    console.error('❌ Failed to mount Vue app:', err)
    const appDiv = document.getElementById('app')
    if (appDiv) {
      appDiv.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">
        <h2>Failed to mount app</h2>
        <pre>${String(err)}</pre>
      </div>`
    }
  }
}

bootstrap().catch(err => {
  console.error('Fatal bootstrap error:', err)
})
