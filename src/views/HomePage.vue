<template>
  <ion-page>
    <!-- <app-header title="Home" /> -->
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
        
          <ion-title size="large">Home</ion-title>
        </ion-toolbar>
      </ion-header>

      
     <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
  <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <img src="https://via.placeholder.com/300" a  lt="Card Image" class="w-full h-48 object-cover">
    <div class="p-4">
      <h2 class="text-lg font-semibold mb-2">Card Title</h2>
      <p class="text-gray-600 mb-4">Short description goes here.</p>
      <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">View</button>
    </div>
    
  </div>
   <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <img src="https://via.placeholder.com/300" alt="Card Image" class="w-full h-48 object-cover">
    <div class="p-4">
      <h2 class="text-lg font-semibold mb-2">e</h2>
      <p class="text-gray-600 mb-4">Short description goes here.</p>
      <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">View</button>
    </div>
    
  </div>

 <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <img src="https://via.placeholder.com/300" alt="Card Image" class="w-full h-48 object-cover">
    <div class="p-4">
      <h2 class="text-lg font-semibold mb-2"></h2>
      <p class="text-gray-600 mb-4">Short description goes here.</p>
      <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">View</button>
    </div>
    
  </div>

 <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <img src="https://via.placeholder.com/300" alt="Card Image" class="w-full h-48 object-cover">
    <div class="p-4">
      <h2 class="text-lg font-semibold mb-2"></h2>
      <p class="text-gray-600 mb-4">Short description goes here.</p>
      <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">View</button>
    </div>
    
  </div>

 <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <img src="https://via.placeholder.com/300" alt="Card Image" class="w-full h-48 object-cover">
    <div class="p-4">
      <h2 class="text-lg font-semibold mb-2"></h2>
      <p class="text-gray-600 mb-4">Short description goes here.</p>
      <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">View</button>
    </div>
    
  </div>

  <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <img src="https://via.placeholder.com/300" alt="Card Image" class="w-full h-48 object-cover">
    <div class="p-4">
      <h2 class="text-lg font-semibold mb-2"></h2>
      <p class="text-gray-600 mb-4">Short description goes here.</p>
      <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">View</button>
    </div>
    
  </div>




  <!-- Copy and paste the above block for more cards -->
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
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/vue';

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HomePage',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
  },
});
</script>

<style scoped>
.grid-wrapper {
  padding: 1rem;
  margin-top: 2rem;
}

/* Responsive layout using flex and media queries */
.custom-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Box styling */
.grid-box {
  flex: 1 1 calc(50% - 1rem); /* 2 per row on small screens */
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 140px;
  height: 150px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  will-change: transform, opacity;

  /* Appear animation */
  animation-name: fadeSlideIn;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
  animation-timing-function: ease;
  opacity: 0; /* start hidden for animation */
}

@media (min-width: 768px) {
  .grid-box {
    flex: 1 1 calc(33.333% - 1rem); /* 3 per row on medium screens */
  }
}

@media (min-width: 1024px) {
  .grid-box {
    flex: 1 1 calc(25% - 1rem); /* 4 per row on large screens */
  }
}

.grid-box:hover {
  transform: translateY(-6px) scale(1.05);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

/* Box content styling */
.box-content {
  background: #3880ff;
  color: white;
  width: 100%;
  height: 100%;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: background 0.3s ease;
}

.box-content:hover {
  background: #3171e0;
}

/* Fade and slide up animation for appear */
@keyframes fadeSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Continuous side-to-side sliding after appear */
@keyframes slideLeftRight {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(15px);
  }
}

@keyframes slideRightLeft {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-15px);
  }
}

.slide-left {
  animation-name: fadeSlideIn, floatUpDown;
  animation-duration: 0.5s, 3s;
  animation-fill-mode: forwards, infinite;
  animation-timing-function: ease, ease-in-out;
  animation-delay: 0s, 0.8s;
  animation-iteration-count: 1, infinite;
}

.slide-right {
  animation-name: fadeSlideIn, floatUpDown;
  animation-duration: 0.5s, 3s;
  animation-fill-mode: forwards, infinite;
  animation-timing-function: ease, ease-in-out;
  animation-delay: 0s, 0.8s;
  animation-iteration-count: 1, infinite;
}
</style>
