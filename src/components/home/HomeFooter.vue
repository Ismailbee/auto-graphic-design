<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-grid">
        <!-- Left Column - Brand -->
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="logo-text">Design</span>
            <span class="logo-text-accent">Studio</span>
          </div>
          <p class="footer-description">
            We're a creative design agency passionate about crafting exceptional digital 
            experiences that help brands connect with their audiences and achieve their goals.
          </p>
          <div class="social-links">
            <a href="#" class="social-icon" aria-label="Twitter">
              <span>🐦</span>
            </a>
            <a href="#" class="social-icon" aria-label="LinkedIn">
              <span>💼</span>
            </a>
            <a href="#" class="social-icon" aria-label="Facebook">
              <span>📘</span>
            </a>
            <a href="#" class="social-icon" aria-label="Pinterest">
              <span>📌</span>
            </a>
          </div>
        </div>

        <!-- Services Column -->
        <div class="footer-links">
          <h4 class="footer-heading">Services</h4>
          <ul class="footer-list">
            <li><a href="#" class="footer-link">Brand Identity</a></li>
            <li><a href="#" class="footer-link">Web Design</a></li>
            <li><a href="#" class="footer-link">UI/UX Design</a></li>
            <li><a href="#" class="footer-link">Digital Strategy</a></li>
            <li><a href="#" class="footer-link">Motion Graphics</a></li>
          </ul>
        </div>

        <!-- Company Column -->
        <div class="footer-links">
          <h4 class="footer-heading">Company</h4>
          <ul class="footer-list">
            <li><a href="#" class="footer-link">About Us</a></li>
            <li><a href="#" class="footer-link">Our Team</a></li>
            <li><a href="#" class="footer-link">Careers</a></li>
            <li><a href="#" class="footer-link">Blog</a></li>
            <li><a href="#" class="footer-link">Contact</a></li>
          </ul>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <p class="footer-copyright">
          © 2024 DesignStudio. All rights reserved.
        </p>
        <div class="footer-legal">
          <a href="#" class="legal-link">Privacy Policy</a>
          <a href="#" class="legal-link">Terms of Service</a>
          <a href="#" class="legal-link">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// No script needed for this component
</script>

<style scoped>
/* Footer */
.footer {
  background: #0f172a;
  padding: 80px 80px 40px;
  color: white;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 60px;
  margin-bottom: 60px;
}

/* Footer Brand */
.footer-brand {
  max-width: 400px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
}

.logo-text {
  color: white;
}

.logo-text-accent {
  color: #06b6d4;
}

.footer-description {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 24px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-icon:hover {
  background: #06b6d4;
  transform: translateY(-2px);
}

/* Footer Links */
.footer-heading {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  color: white;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-list li {
  margin-bottom: 12px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 15px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #06b6d4;
}

/* Footer Bottom */
.footer-bottom {
  padding-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-copyright {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.footer-legal {
  display: flex;
  gap: 24px;
}

.legal-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.legal-link:hover {
  color: #06b6d4;
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 60px 20px 30px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .footer-legal {
    flex-direction: column;
    gap: 12px;
  }
}
</style>

