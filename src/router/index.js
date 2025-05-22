import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../views/HomePage.vue';
import SchedulingPage from '../components/Header/HeadDetails/SchedulingPage.vue';
import LegalPage from '../components/Header/HeadDetails/LegalPage.vue';
import HelpPage from '../components/Header/HeadDetails/HelpPage.vue';

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
 {
    path: '/scheduling',
    name: 'Scheduling',
    component: SchedulingPage,
  },
  {
    path: '/legal',
    name: 'Legal',
    component: LegalPage,
  },
  {
    path: '/help',
    name: 'Help',
    component: HelpPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router;
