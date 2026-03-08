<template>
  <section id="home" class="hero-section">
    <!-- Background Image Carousel -->
    <div class="background-carousel">
      <transition-group name="fade" tag="div">
        <div
          v-for="(image, index) in backgroundImages"
          :key="image"
          v-show="index === currentImageIndex"
          class="background-image"
          :style="{ backgroundImage: `url(${image})` }"
        ></div>
      </transition-group>
      <div class="overlay"></div>
    </div>

    <div class="hero-content">
      <h1 class="hero-title">
        <span class="title-white">We craft</span>
        <span class="title-accent">digital experiences</span>
        <span class="title-white">that captivate</span>
      </h1>
      
      <p class="hero-description">
        Award-winning design agency specializing in brand identity, web design, 
        and digital strategy. We transform ideas into compelling visual narratives.
      </p>
      
      <div class="hero-actions">
        <button class="btn-primary" @click="toggleAutoDesign">
          Auto Design
        </button>
        <button class="btn-secondary" @click="$emit('startProject')">
          Start Your Project
        </button>
      </div>
    </div>
    
    <!-- Background decoration -->
    <!-- <div class="hero-background"></div> -->
    
    <!-- Auto Design Modal -->
    <AutoDesignModal
      :is-open="isAutoDesignOpen"
      @close="closeAutoDesign"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AutoDesignModal from './AutoDesignModal.vue'

const backgroundImages = [
  "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2864&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1572044162444-24c956217942?q=80&w=2940&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=2940&auto=format&fit=crop",

  /* 🎨🎧 Computer Graphics / Design Images */
  "https://images.unsplash.com/photo-1586717799252-bd134ad00e26?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1527443224154-d7f5d9c4e2d0?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526378722484-c032a7df013d?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&auto=format&fit=crop"
];


const currentImageIndex = ref(0)
const isAutoDesignOpen = ref(false)
let intervalId: number | undefined

// Auto Design Modal Functions
const toggleAutoDesign = () => {
  isAutoDesignOpen.value = !isAutoDesignOpen.value
}

const closeAutoDesign = () => {
  isAutoDesignOpen.value = false
}

onMounted(() => {
  intervalId = window.setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % backgroundImages.length
  }, 5000) // Change image every 5 seconds
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

defineEmits<{
  startProject: []
}>()
</script>

<style scoped>
/* Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  min-height: 750px;
  justify-content: left;
  padding: 150px 80px 80px;
  position: relative;
  background-color: #0f172a;
  overflow: hidden;
}

.background-carousel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  animation: zoom 20s infinite;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(14, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
  z-index: 2;
}

.hero-content {
  max-width: 800px;
  z-index: 3;
  position: relative;
}

.hero-title {
  font-size: 64px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-white {
  color: white;
}

.title-accent {
  color: #06b6d4;
  background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 16px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.hero-background {
  display: none;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Zoom Animation */
@keyframes zoom {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    padding: 120px 20px 60px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-description {
    font-size: 16px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style>

