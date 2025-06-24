<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-10 px-5">
        <h1 class="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Design Gallery
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Where every swipe reveals design perfection
        </p>
      </div>

      <!-- Swiper Container -->
      <div class="relative px-3 mb-16">
        <Swiper
          :modules="[Autoplay, Pagination]"
          :slides-per-view="3"
          :space-between="24"
          :loop="true"
          :autoplay="{ delay: 3000, disableOnInteraction: false }"
          :pagination="{ clickable: true }"
          :breakpoints="{
            320: {
              slidesPerView: 1,
              spaceBetween: 12
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 16
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24
            }
          }"
          class="w-full py-5"
        >
          <SwiperSlide
            v-for="(item, i) in items"
            :key="i"
            class="flex justify-center"
          >
            <ion-card class="bg-white rounded-2xl shadow-lg overflow-hidden w-full flex flex-col transition-all duration-300 hover:shadow-xl h-full">
              <div class="relative w-full aspect-[4/3]">
                <img
                  :src="item.image"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <div class="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <ion-icon :icon="timeOutline" class="mr-1"></ion-icon>
                  <span>{{ item.time }}</span>
                </div>
              </div>
              
              <ion-card-header class="p-4 flex-grow">
                <ion-card-title class="text-base md:text-lg font-semibold text-gray-800 mb-2">
                  {{ item.title }}
                </ion-card-title>
                <ion-card-subtitle 
                  v-if="item.location" 
                  class="text-sm text-gray-600 flex items-center"
                >
                  <ion-icon :icon="locationOutline" class="mr-1 text-purple-600"></ion-icon>
                  {{ item.location }}
                </ion-card-subtitle>
              </ion-card-header>
            </ion-card>
          </SwiperSlide>

          <div class="swiper-pagination !relative !mt-10 !flex !justify-center !gap-2"></div>
        </Swiper>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonIcon } from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import { timeOutline, locationOutline } from 'ionicons/icons';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const items = [
  {
    title: 'Invitation Card',
    location: 'Gidan Mangoro Minna',
    time: '2 hrs ago',
    image: '@assets/template/invitation.jpg'
  },
  {
    title: 'Naming Ceremony',
    location: 'Kaduna Central Hall',
    time: '5 months ago',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Wedding Invitation',
    location: 'Abuja Event Center',
    time: '1 year ago',
    image: 'https://images.unsplash.com/photo-1600857062241-98c0b057cb1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Business Conference',
    location: 'Lagos Business Hub',
    time: '3 days ago',
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Birthday Party',
    location: 'Ikeja City Mall',
    time: '1 week ago',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Product Launch',
    location: 'Port Harcourt Expo',
    time: '2 months ago',
    image: 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }
];
</script>

<style>
/* Custom swiper pagination styles */
.swiper-pagination-bullet {
  @apply w-2 h-2 bg-gray-300 opacity-70 transition-all duration-300;
}

.swiper-pagination-bullet-active {
  @apply bg-purple-600 opacity-100 w-6 rounded-full;
}

/* Ionic component overrides */
ion-card {
  @apply shadow-none m-0;
}

/* Ensure swiper container shows exactly 3 cards */
.swiper {
  width: 100%;
  padding: 20px 0 60px;
}

.swiper-slide {
  height: auto; /* Let the slide height adjust to content */
  padding: 0 12px; /* Adjust based on your space-between value */
}

/* Remove any fixed width constraints from the card */
ion-card {
  @apply w-full h-full; /* Card will fill the slide */
}

/* Adjust pagination position if needed */
.swiper-pagination {
  bottom: 0 !important;
}
</style>