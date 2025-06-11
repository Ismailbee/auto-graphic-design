<template>
  <ion-page>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Home</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="fixed top-0 left-0 w-64 h-full ">
        
         <div class="fixed top-0 left-0 z-10 w-full bg-white shadow">
          <!-- AppHeader -->
        <appHeader title="header" />
        </div>
        
        <!-- Sidebar menu -->
        <sideBar title="sideBar" />

        <!-- Main content -->
        <div class="grid w-screen h-screen gap-5 p-4 ml-5">
          <div class="flex flex-1 p-4 font-bold text-white bg-green-200 rounded-lg">
            Tailwind is now working! ✅
          </div>
        </div>
      </div>
    </ion-content>
    
  </ion-page>
</template>



<script>
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import sideBar from '../components/pages/SideBar/sideBar.vue';
import appHeader from '../components/pages/Header/appHeader.vue';

export default defineComponent({
  name: 'HomePage',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    sideBar,
    appHeader
  }
});
</script>

<style scoped>
body{
  margin: 0;
}
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
