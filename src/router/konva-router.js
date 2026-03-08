import { createRouter, createWebHistory } from '@ionic/vue-router'

const routes = [
  { path: '/', redirect: '/konva-designer' },

  // Konva Designer View
  { path: '/konva-designer', component: () => import('../views/DesignerView-Konva.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
