<template>
  <section class="testimonials-section">
    <div class="testimonials-content">
      <h2 class="testimonials-title">Client Testimonials</h2>
      <p class="testimonials-subtitle">
        Don't just take our word for it - hear what our clients have to say about<br>
        working with us
      </p>

      <!-- Testimonials Grid -->
      <div class="testimonials-grid">
        <!-- Testimonial 1 -->
        <div class="testimonial-card">
          <div class="stars">
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
          </div>
          <p class="testimonial-text">
            "The team delivered an exceptional brand identity that perfectly captures our vision. 
            Our brand recognition has increased by 300% since launch."
          </p>
          <div class="testimonial-author">
            <div class="author-avatar" style="background: #06b6d4;">
              <span>J</span>
            </div>
            <div class="author-info">
              <h4 class="author-name">Jennifer Walsh</h4>
              <p class="author-title">CEO at TechFlow Solutions</p>
            </div>
          </div>
        </div>

        <!-- Testimonial 2 -->
        <div class="testimonial-card">
          <div class="stars">
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
          </div>
          <p class="testimonial-text">
            "Outstanding web design and development. The new site has improved our conversion rate 
            by 150% and user engagement is through the roof."
          </p>
          <div class="testimonial-author">
            <div class="author-avatar" style="background: #06b6d4;">
              <span>M</span>
            </div>
            <div class="author-info">
              <h4 class="author-name">Michael Chen</h4>
              <p class="author-title">Marketing Director at GreenLeaf Ventures</p>
            </div>
          </div>
        </div>

        <!-- Testimonial 3 -->
        <div class="testimonial-card">
          <div class="stars">
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
          </div>
          <p class="testimonial-text">
            "Their UI/UX expertise transformed our app completely. User satisfaction scores have 
            never been higher, and retention has doubled."
          </p>
          <div class="testimonial-author">
            <div class="author-avatar" style="background: #06b6d4;">
              <span>S</span>
            </div>
            <div class="author-info">
              <h4 class="author-name">Sarah Martinez</h4>
              <p class="author-title">Product Manager at Innovate Labs</p>
            </div>
          </div>
        </div>

        <!-- Testimonial 4 -->
        <div class="testimonial-card">
          <div class="stars">
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
            <span class="star">⭐</span>
          </div>
          <p class="testimonial-text">
            "Professional, creative, and results-driven. They understood our needs perfectly and 
            delivered beyond our expectations."
          </p>
          <div class="testimonial-author">
            <div class="author-avatar" style="background: #06b6d4;">
              <span>D</span>
            </div>
            <div class="author-info">
              <h4 class="author-name">David Thompson</h4>
              <p class="author-title">Founder at Apex Digital</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Trust Badge -->
      <div class="trust-badge">
        <p>Trusted by 100+ companies</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// No script needed for this component
</script>

<style scoped>
/* Testimonials Section */
.testimonials-section {
  padding: 100px 80px;
  background: #f8fafc;
}

.testimonials-content {
  max-width: 1400px;
  margin: 0 auto;
}

.testimonials-title {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  color: #1e293b;
}

.testimonials-subtitle {
  font-size: 18px;
  text-align: center;
  color: #64748b;
  margin-bottom: 60px;
  line-height: 1.6;
}

/* Testimonials Grid */
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.testimonial-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.testimonial-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.stars {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
}

.star {
  font-size: 20px;
}

.testimonial-text {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
  flex-grow: 1;
}

.testimonial-author {
  display: flex;
  gap: 12px;
  align-items: center;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.author-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.author-title {
  font-size: 14px;
  color: #64748b;
}

/* Trust Badge */
.trust-badge {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.trust-badge p {
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .testimonials-section {
    padding: 60px 20px;
  }

  .testimonials-title {
    font-size: 32px;
  }

  .testimonials-subtitle {
    font-size: 16px;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}
</style>

