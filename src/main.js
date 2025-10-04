// Import Konva globally
import 'konva';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'

/* Import Ionic Icons */
import { addIcons } from 'ionicons'
import { 
  cloudUploadOutline, 
  checkmarkCircleOutline, 
  cogOutline, 
  eyeOutline,
  downloadOutline, 
  pulseOutline,
  libraryOutline,
  homeOutline,
  documentTextOutline,
  settingsOutline,
  add,
  searchOutline,
  playCircle,
  personCircle,
  eye,
  timeOutline,
  close,
  attachOutline,
  sendSharp,
  calendarOutline,
  statsChart,
  rocketOutline,
  checkmarkCircle,
  helpCircleOutline,
  closeCircle,
  arrowForward,
  giftOutline,
  menuOutline,
  chevronDownOutline,
  chevronUpOutline,
  informationCircleOutline,
  warningOutline,
  listOutline
} from 'ionicons/icons'

// Add icons to the registry
addIcons({
  'cloud-upload-outline': cloudUploadOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'cog-outline': cogOutline,
  'eye-outline': eyeOutline,
  'download-outline': downloadOutline,
  'pulse-outline': pulseOutline,
  'library-outline': libraryOutline,
  'home-outline': homeOutline,
  'document-text-outline': documentTextOutline,
  'settings-outline': settingsOutline,
  'add': add,
  'search-outline': searchOutline,
  'play-circle': playCircle,
  'person-circle': personCircle,
  'eye': eye,
  'time-outline': timeOutline,
  'close': close,
  'attach-outline': attachOutline,
  'send-sharp': sendSharp,
  'calendar-outline': calendarOutline,
  'stats-chart': statsChart,
  'rocket-outline': rocketOutline,
  'checkmark-circle': checkmarkCircle,
  'help-circle-outline': helpCircleOutline,
  'close-circle': closeCircle,
  'arrow-forward': arrowForward,
  'gift-outline': giftOutline,
  'menu-outline': menuOutline,
  'chevron-down-outline': chevronDownOutline,
  'chevron-up-outline': chevronUpOutline,
  'information-circle-outline': informationCircleOutline,
  'warning-outline': warningOutline,
  'list-outline': listOutline
})

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Theme variables */
import './theme/variables.css'

/* Tailwind CSS */
import './assets/css/tailwind.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)
  .use(IonicVue)
  .use(createPinia())
  .use(router)

router.isReady().then(() => {
  app.mount('#app')
})