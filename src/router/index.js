import { createRouter, createWebHistory } from '@ionic/vue-router';
import LoginPage from '../pages/LoginPage.vue';
import MainLayout from '../pages/MainLayout.vue';
import firstShowing from '../pages/firstShowing.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login', // Add named route for easier navigation
    component: LoginPage
  },
  {
    path: '/app', 
    component: MainLayout,
    children: [
      {
        path: 'firstPage',
        name: 'FirstPage', // Named route
        component: firstShowing,
        
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Optional: Add navigation guards
// router.beforeEach((to, from, next) => {
//   // Authentication check logic here
// });

export default router;