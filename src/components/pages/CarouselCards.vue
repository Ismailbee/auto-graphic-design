<template>
  <div class="flex items-center justify-center p-5">
    <div class="w-full max-w-6xl">
      <!-- Header -->
      <div class="text-center px-3 mb-4">
        <h2 class="text-2xl md:text-3xl font-bold text-primary mb-2">Featured Designs</h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Where every swipe reveals design perfection. Explore our latest and most creative works!
        </p>
      </div>

      <!-- Swiper Container -->
      <div class="relative px-3">
        <Swiper
          :modules="[Autoplay, Pagination]"
          :slides-per-view="3"
          :space-between="24"
          :loop="true"
          :autoplay="{ delay: 3500, disableOnInteraction: false }"
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
            <ion-card class="bg-white rounded-2xl shadow-lg overflow-hidden w-full flex flex-col transition-all duration-300 hover:shadow-xl group">
              <!-- Image container with hover effect -->
              <div class="relative w-full aspect-[4/3] overflow-hidden">
                <img
                  :src="item.image"
                  :alt="item.title"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:object-contain"
                  loading="lazy"
                />
                <div class="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center z-10">
                  <ion-icon :icon="timeOutline" class="mr-1"></ion-icon>
                  <span>{{ item.time }}</span>
                </div>
              </div>
              
              <!-- Card content -->
              <ion-card-header class="p-4 min-h-[120px] flex flex-col">
                <ion-card-title class="text-base md:text-lg font-semibold text-gray-800 line-clamp-2">
                  {{ item.title }}
                </ion-card-title>
                <ion-card-subtitle 
                  v-if="item.location" 
                  class="text-sm text-gray-600 flex items-center mt-2 line-clamp-2"
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
import invitationImg from '@/assets/template/invitation.jpg';
import NamingImg from '@/assets/template/naming Ceremony Memo.jpg';
import Flyer from '@/assets/template/flyer.jpg';

const items = [
  {
    title: 'Invitation Card',
    location: 'Saudat Consult Business Centre Gidan Mangoro Minna, Niger State',  
    time: '2 hrs ago',
    image: invitationImg
  },
  {
    title: 'Naming Ceremony',
    location: 'Kaduna Central Hall',
    time: '5 months ago',
    image: NamingImg
  },
  {
    title: 'Wedding Invitation',
    location: 'Abuja Event Center',
    time: '1 year ago',
    image: Flyer
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

<style scoped>
.text-primary {
  color: #502800;
}
/* Custom swiper pagination styles */
.swiper-pagination-bullet {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #d1d5db;
  opacity: 0.7;
  transition: all 0.3s;
}

.swiper-pagination-bullet-active {
  background-color: #7c3aed;
  opacity: 1;
  width: 1.5rem;
  border-radius: 9999px;
}

/* Ionic component overrides */
ion-card {
  box-shadow: none;
  margin: 0;
}

/* Ensure consistent card sizing */
.swiper-slide {
  height: auto;
}

/* Aspect ratio container */
.aspect-\[4\/3\] {
  position: relative;
  padding-bottom: 75%; /* 4:3 aspect ratio */
}

.aspect-\[4\/3\] > img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, object-fit 0.5s ease;
}

/* Hover effects */
.group:hover .aspect-\[4\/3\] > img {
  transform: scale(1.1);
  object-fit: contain;
  background-color: white; /* Add background for transparent images */
}

/* Text overflow handling */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card content min-height */
.min-h-\[120px\] {
  min-height: 120px;
}

/* Ensure time badge stays on top */
.z-10 {
  z-index: 10;
}
</style>