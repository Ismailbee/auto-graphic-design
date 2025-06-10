import { createRouter, createWebHistory } from '@ionic/vue-router';

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
  { path: '/', redirect: '/home' },
  { path: '/home', component: HomePage },
  { path: '/myAccountPage', component: myAccountPage },
  { path: '/scheduling', component: SchedulingPage },
  { path: '/mockupPage', component: mockupPage },
  { path: '/videosPage', component: videosPage },
  { path: '/subscriPage', component: subscriPage },
  { path: '/useredeemcodePage', component: useredeemcodePage },
  { path: '/suggestfeaturePage', component: suggestfeaturePage },
  { path: '/helpcenterPage', component: HelpcenterPage },
  { path: '/rateappPage', component: rateappPage },
  { path: '/contactPage', component: contactPage },
  { path: '/termservicePage', component: termservicePage },
  { path: '/privacypolicyPage', component: privacypolicyPage },
  { path: '/privacysettingPage', component: privacysettingPage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
