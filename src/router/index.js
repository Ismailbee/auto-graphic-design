import { createRouter, createWebHistory } from '@ionic/vue-router';

// Import all your pages
import HomePage from '../views/HomePage.vue';
import SchedulingPage from '../views/sidBarContent/SchedulingPage.vue';
import LegalPage from '../views/sidBarContent/LegalPage.vue';
import HelpPage from '../views/sidBarContent/HelpPage.vue';
import CreatePage from '../views/sidBarContent/CreatePage.vue';
import ProjectsPage from '../views/sidBarContent/ProjectsPage.vue';
import TemplatesPage from '../views/sidBarContent/TemplatesPage.vue';
import BrandPage from '../views/sidBarContent/BrandPage.vue';

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'Home', component: HomePage },
  { path: '/scheduling', name: 'Scheduling', component: SchedulingPage },
  { path: '/legal', name: 'Legal', component: LegalPage },
  { path: '/help', name: 'Help', component: HelpPage },
  { path: '/create', name: 'Create', component: CreatePage },
  { path: '/projects', name: 'Projects', component: ProjectsPage },
  { path: '/templates', name: 'Templates', component: TemplatesPage },
  { path: '/brand', name: 'Brand', component: BrandPage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
