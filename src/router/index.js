import { createRouter, createWebHistory } from '@ionic/vue-router';



const routes = [
  { path: '/', redirect: '/welcome' },
  { path: '/welcome', component: () => import('../components/pages/auth/WelcomePage.vue') },
  { path: '/login', component: () => import('../components/pages/auth/LoginPage.vue') },
  { path: '/signup', component: () => import('../components/pages/auth/SignUpPage.vue') },

  // Main & Sidebar pages
  { path: '/home', component: () => import('../views/HomePage.vue') },
 // myAccountPage
  { path: '/myAccountPage', component: () => import('../components/pages/SideBar/sidBarContent/myAccount/myAccountPage.vue') },
  { path: '/Edit-Profile', component: () => import('../components/pages/SideBar/sidBarContent/myAccount/Edit-profile.vue') },
  
  
  { path: '/scheduling', component: () => import('../components/pages/SideBar/sidBarContent/SchedulingPage.vue') },
  { path: '/template', component: () => import('../components/pages/SideBar/sidBarContent/Template.vue') },
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

  // Header Pages
  { path: '/myeditPage', component: () => import('../components/pages/Header/HeaderContent/MyeditPage.vue') },
  { path: '/tokenPage', component: () => import('../components/pages/Header/HeaderContent/TokenPage.vue') },
  { path: '/rewardPage', component: () => import('../components/pages/Header/HeaderContent/RewardPage.vue') },
]


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
