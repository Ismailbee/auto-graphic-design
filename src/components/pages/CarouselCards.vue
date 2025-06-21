<template>
  <ion-slides :options="slideOpts" pager="true" class="w-full">
    <ion-slide v-for="(item, i) in items" :key="i">
      <ion-card class="rounded-xl shadow-lg w-[90%] mx-auto">
        <img :src="item.image" class="w-full h-44 object-cover" />
        <ion-card-content>
          <h3 class="text-base font-semibold text-gray-800">{{ item.title }}</h3>
          <p v-if="item.location" class="text-sm text-gray-600 mt-1">
            {{ item.location }}
          </p>
          <p class="text-xs text-gray-400 text-right mt-2">| {{ item.time }}</p>
        </ion-card-content>
      </ion-card>
    </ion-slide>
  </ion-slides>
</template>

<script setup>
import MemoImg from '@/assets/template/Memo.png'
import Sample2 from '@/assets/templates/sample2.jpg'
import Sample3 from '@/assets/templates/sample3.jpg'

const items = [
  { title: 'Graduation Memo', location: 'Gidan Mangoro Minna', time: '2 hrs ago', image: MemoImg },
  { title: 'Update Info',       location: '',                       time: '5 months ago', image: Sample2 },
  { title: 'Advert',            location: '',                       time: '1 year ago', image: Sample3 }
]

const slideOpts = {
  slidesPerView: 1.2,
  spaceBetween: 12,
  pagination: { clickable: true },
  breakpoints: {
    768: { slidesPerView: 2.2 },
    1024:{ slidesPerView: 3.2 }
  }
}
</script>
  