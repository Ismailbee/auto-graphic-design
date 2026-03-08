import { registerSW } from 'virtual:pwa-register'

export function registerPWA() {
  if (!('serviceWorker' in navigator)) return

  // In dev, a previously-installed SW can serve stale bundles and break HMR.
  // Unregister any SWs and skip registration.
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations()
      .then(regs => Promise.all(regs.map(r => r.unregister())))
      .catch(() => {})
    return
  }

  // Auto-update SW in the background
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Keep UX unchanged: auto reload to activate new SW.
      // (If you want a toast later, we can add it explicitly.)
      window.location.reload()
    },
  })
}
