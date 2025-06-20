<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Carousel Grid</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-slides :options="slideOpts">
        <!-- Slide 1 -->
        <ion-slide>
          <ion-card class="custom-card">
            <img :src="require('@/assets/graphic1.jpg')" alt="Saudat Business" />
            <ion-card-content>
              <h2>SAUDAT CONSULT</h2>
              <p class="text-gray-600">Gidan Mangoro, Minna</p>
            </ion-card-content>
          </ion-card>
        </ion-slide>

        <!-- Slide 2 -->
        <ion-slide>
          <ion-card class="custom-card">
            <img :src="require('@/assets/graphic2.jpg')" alt="Passing Out" />
            <ion-card-content>
              <h2>Update Info</h2>
              <p class="text-gray-600">| 5 months ago</p>
            </ion-card-content>
          </ion-card>
        </ion-slide>

        <!-- Slide 3 -->
        <ion-slide>
          <ion-card class="custom-card">
            <img :src="require('@/assets/graphic3.jpg')" alt="Saudat Agro" />
            <ion-card-content>
              <h2>Advert</h2>
              <p class="text-gray-600">| 1 year ago</p>
            </ion-card-content>
          </ion-card>
        </ion-slide>
      </ion-slides>
    </ion-content>
  </ion-page>
</template>

<script setup>
const slideOpts = {
  initialSlide: 0,
  speed: 400,
  slidesPerView: 1.2,
  spaceBetween: 10,
  breakpoints: {
    768: {
      slidesPerView: 2.2
    },
    1024: {
      slidesPerView: 3.2
    }
  }
}
</script>

<style scoped>
.custom-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-bottom: 1px solid #ddd;
}

h2 {
  font-size: 1rem;
  font-weight: 600;
}

p {
  font-size: 0.8rem;
}
</style>
