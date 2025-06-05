<!-- pages/HomePage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Home</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="flex w-full h-screen">
        <!-- Sidebar menu -->
        <sideBar title="sideBar" />

        <!-- Main content -->
        <div class="flex-1 p-4 ml-5">
          <div class="p-4 font-bold text-white bg-green-200 rounded-lg">
            Tailwind is now working! ✅
          </div>
          <div class="p-4 mt-4 font-bold text-white bg-green-200 rounded-lg">
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
import sideBar from '../components/SideBar/sideBar.vue';

export default defineComponent({
  name: 'HomePage',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    sideBar
  }
});
</script>

<style scoped>
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
