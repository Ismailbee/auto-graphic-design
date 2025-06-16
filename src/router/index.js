import { createRouter, createWebHistory } from '@ionic/vue-router';

// Welcome & Login Pages
import WelcomePage from '../components/pages/auth/WelcomePage.vue';
import LoginPage from '../components/pages/auth/LoginPage.vue';
import SignUpPage from '../components/pages/auth/SignUpPage.vue'


// Top-level pages
import HomePage from '../views/HomePage.vue';

// Sidebar content pages
import myAccountPage from '../components/pages/SideBar/sidBarContent/myAccountPage.vue';
import SchedulingPage from '../components/pages/SideBar/sidBarContent/SchedulingPage.vue';
import mockupPage from '../components/pages/SideBar/sidBarContent/mockupPage.vue';
import videosPage from '../components/pages/SideBar/sidBarContent/videosPage.vue';

// Help content pages
import subscriPage from '../components/pages/SideBar/sidBarContent/Help/subscriPage.vue';
import useredeemcodePage from '../components/pages/SideBar/sidBarContent/Help/useredeemcodePage.vue';
import suggestfeaturePage from '../components/pages/SideBar/sidBarContent/Help/suggestfeaturePage.vue';
import HelpcenterPage from '../components/pages/SideBar/sidBarContent/Help/HelpcenterPage.vue';
import rateappPage from '../components/pages/SideBar/sidBarContent/Help/rateappPage.vue';

// Legal content pages
import contactPage from '../components/pages/SideBar/sidBarContent/Legal/contactPage.vue';
import termservicePage from '../components/pages/SideBar/sidBarContent/Legal/termservicePage.vue';
import privacypolicyPage from '../components/pages/SideBar/sidBarContent/Legal/privacypolicyPage.vue';
import privacysettingPage from '../components/pages/SideBar/sidBarContent/Legal/privacysettingsPage.vue';

const routes = [
  { path: '/', redirect: '/welcome' },
  { path: '/welcome', component: () => import('../components/pages/auth/WelcomePage.vue') },
  { path: '/login', component: () => import('../components/pages/auth/LoginPage.vue') },
  { path: '/signup', component: () => import('../components/pages/auth/SignUpPage.vue') },

  // Main & Sidebar pages
  { path: '/home', component: () => import('../views/HomePage.vue') },
  { path: '/myAccountPage', component: () => import('../components/pages/SideBar/sidBarContent/myAccountPage.vue') },
  { path: '/scheduling', component: () => import('../components/pages/SideBar/sidBarContent/SchedulingPage.vue') },
  { path: '/mockupPage', component: () => import('../components/pages/SideBar/sidBarContent/mockupPage.vue') },
  { path: '/videosPage', component: () => import('../components/pages/SideBar/sidBarContent/videosPage.vue') },

  // Help Pages
  { path: '/subscriPage', component: () => import('../components/pages/SideBar/sidBarContent/Help/subscriPage.vue') },
  { path: '/useredeemcodePage', component: () => import('../components/pages/SideBar/sidBarContent/Help/useredeemcodePage.vue') },
  { path: '/suggestfeaturePage', component: () => import('../components/pages/SideBar/sidBarContent/Help/suggestfeaturePage.vue') },
  { path: '/helpcenterPage', component: () => import('../components/pages/SideBar/sidBarContent/Help/HelpcenterPage.vue') },
  { path: '/rateappPage', component: () => import('../components/pages/SideBar/sidBarContent/Help/rateappPage.vue') },

  // Legal Pages
  { path: '/contactPage', component: () => import('../components/pages/SideBar/sidBarContent/Legal/contactPage.vue') },
  { path: '/termservicePage', component: () => import('../components/pages/SideBar/sidBarContent/Legal/termservicePage.vue') },
  { path: '/privacypolicyPage', component: () => import('../components/pages/SideBar/sidBarContent/Legal/privacypolicyPage.vue') },
  { path: '/privacysettingPage', component: () => import('../components/pages/SideBar/sidBarContent/Legal/privacysettingsPage.vue') },
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
