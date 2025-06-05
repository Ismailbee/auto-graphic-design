import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'animate.css';
import './tailwind.css';
import MainLayout from './pages/MainLayout.vue';

import { IonicVue } from '@ionic/vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

// ✅ Import your Sidebar component
// import Sidebar from './pages/Sidebar.vue'; // Adjust if path is different

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Dark mode theme support */
import '@ionic/vue/css/palettes/dark.system.css';

// const dotLottie = new DotLottie({
//     autoplay: true,
//     loop: true,
//     canvas: document.querySelector('#dotlottie-canvas'),
//     src: "<https://lottie.host/YOUR_ANIMATION_ID.lottie>",
// });

const app = createApp(App);

app.use(IonicVue);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});

// ✅ Register Sidebar globally so it can be used in any component
app.component('MainLayout', MainLayout);

router.isReady().then(() => {
  app.mount('#app');
});
