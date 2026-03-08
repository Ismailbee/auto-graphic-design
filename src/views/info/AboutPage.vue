<template>
  <div class="about-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <button class="back-button" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="hero-title">About SmartDesignPro</h1>
        <p class="hero-subtitle">Empowering creativity with AI-powered design tools</p>
      </div>
    </div>

    <!-- Mission Section -->
    <div class="section mission-section">
      <div class="container">
        <div class="mission-content">
          <div class="mission-text">
            <h2 class="section-title">Our Mission</h2>
            <p class="section-desc">
              At SmartDesignPro, we believe that everyone deserves access to professional design tools. 
              Our mission is to democratize design by combining cutting-edge AI technology with intuitive 
              interfaces, making it possible for anyone to create stunning visuals without years of training.
            </p>
            <p class="section-desc">
              We're committed to empowering creators, entrepreneurs, and businesses of all sizes to bring 
              their visual ideas to life quickly and affordably.
            </p>
          </div>
          <div class="mission-image">
            <div class="image-placeholder">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">500K+</div>
            <div class="stat-label">Active Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">10M+</div>
            <div class="stat-label">Designs Created</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">150+</div>
            <div class="stat-label">Countries</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">99%</div>
            <div class="stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="section features-section">
      <div class="container">
        <h2 class="section-title center">What Makes Us Different</h2>
        <p class="section-subtitle">Cutting-edge features that set us apart</p>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon ai-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 class="feature-title">AI-Powered Design</h3>
            <p class="feature-desc">
              Advanced AI algorithms that understand design principles and create professional layouts automatically.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon cloud-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
              </svg>
            </div>
            <h3 class="feature-title">Cloud Storage</h3>
            <p class="feature-desc">
              All your designs are safely stored in the cloud and accessible from any device, anywhere.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon speed-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 class="feature-title">Lightning Fast</h3>
            <p class="feature-desc">
              Optimized performance ensures your designs load instantly and render smoothly.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon collab-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 class="feature-title">Team Collaboration</h3>
            <p class="feature-desc">
              Work together in real-time with your team on the same design project.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon template-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </div>
            <h3 class="feature-title">Thousands of Templates</h3>
            <p class="feature-desc">
              Start with professionally designed templates for every occasion and industry.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon support-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 class="feature-title">24/7 Support</h3>
            <p class="feature-desc">
              Our dedicated support team is always here to help you succeed with your designs.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Section -->
    <div class="section team-section">
      <div class="container">
        <h2 class="section-title center">Meet Our Team</h2>
        <p class="section-subtitle">The people behind SmartDesignPro</p>
        
        <div class="team-grid">
          <div class="team-member">
            <div class="member-avatar">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 class="member-name">John Smith</h3>
            <p class="member-role">CEO & Founder</p>
            <p class="member-bio">15 years in design tech, passionate about democratizing creativity.</p>
          </div>

          <div class="team-member">
            <div class="member-avatar">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 class="member-name">Sarah Johnson</h3>
            <p class="member-role">CTO</p>
            <p class="member-bio">AI researcher with expertise in computer vision and machine learning.</p>
          </div>

          <div class="team-member">
            <div class="member-avatar">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 class="member-name">Michael Chen</h3>
            <p class="member-role">Head of Design</p>
            <p class="member-bio">Award-winning designer focused on user experience and accessibility.</p>
          </div>

          <div class="team-member">
            <div class="member-avatar">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 class="member-name">Emily Rodriguez</h3>
            <p class="member-role">Head of Customer Success</p>
            <p class="member-bio">Dedicated to ensuring every user has an amazing experience.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Start Creating?</h2>
          <p class="cta-text">Join thousands of creators who trust SmartDesignPro</p>
          <div class="cta-buttons">
            <button class="cta-button primary" @click="getStarted">
              Get Started Free
            </button>
            <button class="cta-button secondary" @click="viewPlans">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const getStarted = () => {
  router.push('/home')
}

const viewPlans = () => {
  router.push('/subscription')
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #ffffff;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 80px 20px 120px;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.back-button {
  position: absolute;
  left: 0;
  top: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Section */
.section {
  padding: 80px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.section-title.center {
  text-align: center;
}

.section-subtitle {
  font-size: 18px;
  color: #64748b;
  text-align: center;
  margin: 0 0 48px 0;
}

.section-desc {
  font-size: 17px;
  color: #475569;
  line-height: 1.8;
  margin: 0 0 20px 0;
}

/* Mission Section */
.mission-section {
  background: #f8fafc;
}

.mission-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.mission-text {
  padding-right: 40px;
}

.mission-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  width: 300px;
  height: 300px;
  border-radius: 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3);
}

/* Stats Section */
.stats-section {
  padding: 80px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
}

.stat-card {
  text-align: center;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.stat-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

/* Features Section */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
  transform: translateY(-4px);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: white;
}

.ai-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.cloud-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.speed-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.collab-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.template-icon {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
}

.support-icon {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.feature-desc {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

/* Team Section */
.team-section {
  background: #f8fafc;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.team-member {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.team-member:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.member-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.member-name {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.member-role {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
  margin: 0 0 12px 0;
}

.member-bio {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

/* CTA Section */
.cta-section {
  padding: 80px 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.cta-content {
  text-align: center;
}

.cta-title {
  font-size: 40px;
  font-weight: 700;
  color: white;
  margin: 0 0 16px 0;
}

.cta-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
}

.cta-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.cta-button {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cta-button.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.cta-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
}

.cta-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.cta-button.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 900px) {
  .mission-content {
    grid-template-columns: 1fr;
  }

  .mission-text {
    padding-right: 0;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }

  .section-title {
    font-size: 28px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .features-grid,
  .team-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    width: 100%;
  }

  .cta-button {
    width: 100%;
  }
}
</style>
