// Initialize Konva.js globally first
import './lib/konva-init.js';

import { createApp } from 'vue';
import App from './AppKonva.vue';
import router from './router/konva-router.js';
import { IonicVue, IonIcon } from '@ionic/vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'swiper/swiper-bundle.css'; // ✅ Correct for Swiper v6
import 'swiper/css'
import 'swiper/css/pagination'
import sideBar from '../src/components/pages/SideBar/sideBar.vue';
import bodyHeader from './components/pages/bodyHeader/bodyHeader.vue';
import bodyBase from './components/pages/bodyHeader/bodyBase.vue';
import appBase from './components/pages/appBase/appBase.vue';
import 'animate.css';
import './assets/css/tailwind.css';
// Import local copy of Cropper.js styles
import './assets/css/cropper.css';

// pinia
import { createPinia } from 'pinia'
import piniaPersistedState from 'pinia-plugin-persistedstate'

// Ionic Core CSS
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
import './theme/variables.css';
import '@ionic/vue/css/palettes/dark.system.css';

const app = createApp(App);

const pinia = createPinia()
pinia.use(piniaPersistedState)
app.use(pinia)

app.use(IonicVue, {
  animated: true
});

app.use(router);
app.component('sideBar', sideBar);
app.component('bodyHeader', bodyHeader);
app.component('bodyBase', bodyBase);
app.component('appBase', appBase);
app.component('IonIcon', IonIcon);

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});

router.isReady().then(() => {
  app.mount('#app');
});
