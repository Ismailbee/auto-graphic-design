<template>
  <div class="bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-8 text-primary">COMMENT FROM OUR CUSTOMER</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="index"
          class="shadow-md rounded-lg p-6 relative min-h-64 "
          :class="index % 2 === 0 ? 'bg-primary' : 'bg-[#BA6900]'"
        >
          <!-- Testimonial comment -->
          <p class="mb-4 text-white h-[calc(100%-80px)] overflow-y-auto">
            {{ testimonial.comment }}
          </p>

          <!-- Demarcation line -->
          <div class="w-full h-px bg-white bg-opacity-50 my-8"></div>

          <!-- Profile info -->
          <div class="absolute bottom-4 left-4 right-4 flex items-center">
            <img 
              :src="testimonial.profilePic" 
              alt="Profile Image" 
              class="w-12 h-12 rounded-full object-cover border-2 border-white"
            />
            <span class="ml-3 font-medium text-white">
              {{ testimonial.author }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const testimonials = ref([
  {
    author: 'John Doe',
    comment: "I've never seen designs come together so seamlessly. Truly innovative! The attention to detail is remarkable and the user experience is flawless. This product has completely transformed our workflow.",
    profilePic: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    author: 'Jane Smith',
    comment: "The interface is a work of art. It's both beautiful and functional.",
    profilePic: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    author: 'Alex Johnson',
    comment: "This app has revolutionized how we create graphics. A must try!",
    profilePic: 'https://randomuser.me/api/portraits/men/55.jpg'
  },
  {
    author: 'Emily Peters',
    comment: "Every feature is thoughtfully designed. I love using it daily!",
    profilePic: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    author: 'Michael Lee',
    comment: "A fantastic tool that brings creative visions to life.",
    profilePic: 'https://randomuser.me/api/portraits/men/27.jpg'
  },
  {
    author: 'Olivia Brown',
    comment: "Simple, elegant, and powerful. It's the best design tool I've used.",
    profilePic: 'https://randomuser.me/api/portraits/women/13.jpg'
  },
])
</script>