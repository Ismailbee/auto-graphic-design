import { createRouter, createWebHistory } from '@ionic/vue-router';

// Top-level pages
import HomePage from '../views/HomePage.vue';

// Sidebar content pages
import CreatePage from '../views/sidBarContent/CreatePage.vue';
import ProjectsPage from '../views/sidBarContent/ProjectsPage.vue';
import TemplatesPage from '../views/sidBarContent/TemplatesPage.vue';
import BrandPage from '../views/sidBarContent/BrandPage.vue';
import SchedulingPage from '../views/sidBarContent/SchedulingPage.vue';

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: HomePage
  },
  {
    path: '/create',
    component: CreatePage
  },
  {
    path: '/projects',
    component: ProjectsPage
  },
  {
    path: '/templates',
    component: TemplatesPage
  },
  {
    path: '/brand',
    component: BrandPage
  },
  {
    path: '/scheduling',
    component: SchedulingPage
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
