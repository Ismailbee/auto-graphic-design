<template>
  <section class="process-section">
    <div class="process-content">
      <h2 class="process-title">Our Process</h2>
      <p class="process-subtitle">
        A proven methodology that ensures exceptional results for every project
      </p>

      <!-- Process Steps -->
      <div class="process-grid">
        <!-- Step 1: Discovery -->
        <div class="process-card">
          <div class="process-icon">🔍</div>
          <div class="process-number">01</div>
          <h3 class="process-step-title">Discovery</h3>
          <p class="process-description">
            We dive deep into understanding your brand, goals, and target audience through 
            comprehensive research and strategy sessions.
          </p>
          <div class="process-arrow">→</div>
        </div>

        <!-- Step 2: Design -->
        <div class="process-card">
          <div class="process-icon">✨</div>
          <div class="process-number">02</div>
          <h3 class="process-step-title">Design</h3>
          <p class="process-description">
            Our creative team develops innovative concepts and visual solutions that align with your 
            brand identity and objectives.
          </p>
          <div class="process-arrow">→</div>
        </div>

        <!-- Step 3: Development -->
        <div class="process-card">
          <div class="process-icon">⚡</div>
          <div class="process-number">03</div>
          <h3 class="process-step-title">Development</h3>
          <p class="process-description">
            We bring designs to life with clean, efficient code and seamless functionality across all 
            devices and platforms.
          </p>
          <div class="process-arrow">→</div>
        </div>

        <!-- Step 4: Launch -->
        <div class="process-card">
          <div class="process-icon">🚀</div>
          <div class="process-number">04</div>
          <h3 class="process-step-title">Launch</h3>
          <p class="process-description">
            We ensure a smooth launch with thorough testing, optimization, and ongoing support to 
            maximize your success.
          </p>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="process-cta">
        <button class="process-btn" @click="$emit('startProject')">
          Start Your Project
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineEmits<{
  startProject: []
}>()
</script>

<style scoped>
/* Process Section */
.process-section {
  padding: 100px 80px;
  background: white;
}

.process-content {
  max-width: 1400px;
  margin: 0 auto;
}

.process-title {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  color: #1e293b;
}

.process-subtitle {
  font-size: 18px;
  text-align: center;
  color: #64748b;
  margin-bottom: 60px;
}

/* Process Grid */
.process-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.process-card {
  background: #f8fafc;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.process-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  background: white;
}

.process-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.process-number {
  font-size: 14px;
  font-weight: 700;
  color: #06b6d4;
  margin-bottom: 12px;
}

.process-step-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.process-description {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
}

.process-arrow {
  position: absolute;
  top: 50%;
  right: -30px;
  transform: translateY(-50%);
  font-size: 24px;
  color: #06b6d4;
  font-weight: 700;
}

.process-card:last-child .process-arrow {
  display: none;
}

/* Process CTA */
.process-cta {
  text-align: center;
}

.process-btn {
  padding: 16px 40px;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.process-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .process-arrow {
    display: none;
  }
}

@media (max-width: 768px) {
  .process-section {
    padding: 60px 20px;
  }

  .process-title {
    font-size: 32px;
  }

  .process-subtitle {
    font-size: 16px;
  }

  .process-grid {
    grid-template-columns: 1fr;
  }
}
</style>

