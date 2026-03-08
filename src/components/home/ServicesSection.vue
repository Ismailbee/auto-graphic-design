<template>
  <section id="services" class="services-section">
    <div class="services-content">
      <h2 class="services-title">Our Services</h2>
      <p class="services-subtitle">
        We offer comprehensive design solutions to help your brand stand out<br>
        in the digital landscape
      </p>

      <!-- Services Grid -->
      <div class="services-grid">
        <!-- Brand Identity -->
        <div class="service-card">
          <div class="service-icon">🎨</div>
          <h3 class="service-title">Brand Identity</h3>
          <p class="service-description">
            Complete brand development from concept to execution, including logo design, brand 
            guidelines, and visual identity systems.
          </p>
          <ul class="service-features">
            <li>Logo Design</li>
            <li>Brand Guidelines</li>
            <li>Color Palettes</li>
            <li>Typography</li>
          </ul>
          <button class="service-btn" @click="$emit('learnMore', 'brand-identity')">
            Learn More
          </button>
        </div>

        <!-- Web Design -->
        <div class="service-card">
          <div class="service-icon">💻</div>
          <h3 class="service-title">Web Design</h3>
          <p class="service-description">
            Custom website design and development that combines stunning visuals with seamless 
            user experience and performance.
          </p>
          <ul class="service-features">
            <li>Responsive Design</li>
            <li>User Experience</li>
            <li>Development</li>
            <li>SEO Optimization</li>
          </ul>
          <button class="service-btn" @click="$emit('learnMore', 'web-design')">
            Learn More
          </button>
        </div>

        <!-- UI/UX Design -->
        <div class="service-card">
          <div class="service-icon">📱</div>
          <h3 class="service-title">UI/UX Design</h3>
          <p class="service-description">
            User-centered design approach for digital products, focusing on intuitive interfaces 
            and exceptional user experiences.
          </p>
          <ul class="service-features">
            <li>User Research</li>
            <li>Wireframing</li>
            <li>Prototyping</li>
            <li>User Testing</li>
          </ul>
          <button class="service-btn" @click="$emit('learnMore', 'ui-ux-design')">
            Learn More
          </button>
        </div>

        <!-- Digital Strategy -->
        <div class="service-card">
          <div class="service-icon">📊</div>
          <h3 class="service-title">Digital Strategy</h3>
          <p class="service-description">
            Comprehensive digital marketing strategies that align with your business goals and 
            drive meaningful results.
          </p>
          <ul class="service-features">
            <li>Market Analysis</li>
            <li>Content Strategy</li>
            <li>Social Media</li>
            <li>Analytics</li>
          </ul>
          <button class="service-btn" @click="$emit('learnMore', 'digital-strategy')">
            Learn More
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineEmits<{
  learnMore: [service: string]
}>()
</script>

<style scoped>
/* Services Section */
.services-section {
  padding: 100px 80px;
  background: #f8fafc;
}

.services-content {
  max-width: 1400px;
  margin: 0 auto;
}

.services-title {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  color: #1e293b;
}

.services-subtitle {
  font-size: 18px;
  text-align: center;
  color: #64748b;
  margin-bottom: 60px;
  line-height: 1.6;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.service-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.service-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.service-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.service-description {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
  flex-grow: 1;
}

.service-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
}

.service-features li {
  padding: 8px 0;
  color: #64748b;
  font-size: 14px;
  position: relative;
  padding-left: 24px;
}

.service-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #06b6d4;
  font-weight: 700;
}

.service-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.service-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(6, 182, 212, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .services-section {
    padding: 60px 20px;
  }

  .services-title {
    font-size: 32px;
  }

  .services-subtitle {
    font-size: 16px;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>

