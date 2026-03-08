<template>
  <section id="contact" class="contact-section">
    <div class="contact-content">
      <div class="contact-grid">
        <!-- Left Side - Info -->
        <div class="contact-info">
          <h2 class="contact-title">Let's Create Something Amazing Together</h2>
          <p class="contact-description">
            Ready to transform your brand? Get in touch and let's discuss how we can help 
            bring your vision to life.
          </p>

          <div class="contact-methods">
            <!-- Visit Studio -->
            <div class="contact-method">
              <div class="method-icon" style="background: #06b6d4;">
                <span>📍</span>
              </div>
              <div class="method-details">
                <h4 class="method-title">Visit Our Studio</h4>
                <p class="method-text">123 Design Street, Creative District, NY 10001</p>
              </div>
            </div>

            <!-- Email -->
            <div class="contact-method">
              <div class="method-icon" style="background: #06b6d4;">
                <span>✉️</span>
              </div>
              <div class="method-details">
                <h4 class="method-title">Email Us</h4>
                <p class="method-text">hello@designstudio.com</p>
              </div>
            </div>

            <!-- Call -->
            <div class="contact-method">
              <div class="method-icon" style="background: #06b6d4;">
                <span>📞</span>
              </div>
              <div class="method-details">
                <h4 class="method-title">Call Us</h4>
                <p class="method-text">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Form -->
        <div class="contact-form-wrapper">
          <h3 class="form-title">Start Your Project</h3>
          <form class="contact-form" @submit.prevent="handleSubmit">
            <div class="form-row">
              <input 
                type="text" 
                class="form-input" 
                placeholder="Your Name"
                v-model="form.name"
                required
              />
              <input 
                type="email" 
                class="form-input" 
                placeholder="Email Address"
                v-model="form.email"
                required
              />
            </div>
            
            <input 
              type="text" 
              class="form-input full-width" 
              placeholder="Company Name"
              v-model="form.company"
            />
            
            <select 
              class="form-select" 
              v-model="form.budget"
              required
            >
              <option value="" disabled selected>Select Budget Range</option>
              <option value="5k-10k">$5,000 - $10,000</option>
              <option value="10k-25k">$10,000 - $25,000</option>
              <option value="25k-50k">$25,000 - $50,000</option>
              <option value="50k+">$50,000+</option>
            </select>
            
            <textarea 
              class="form-textarea" 
              placeholder="Tell us about your project..."
              v-model="form.message"
              rows="5"
              required
            ></textarea>
            
            <button type="submit" class="form-submit-btn">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  submitContact: [formData: typeof form.value]
}>()

// Contact form state
const form = ref({
  name: '',
  email: '',
  company: '',
  budget: '',
  message: ''
})

const handleSubmit = () => {
  emit('submitContact', form.value)
  // Reset form
  form.value = {
    name: '',
    email: '',
    company: '',
    budget: '',
    message: ''
  }
}
</script>

<style scoped>
/* Contact Section */
.contact-section {
  padding: 100px 80px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.contact-content {
  max-width: 1400px;
  margin: 0 auto;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}

/* Contact Info */
.contact-info {
  color: white;
}

.contact-title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.contact-description {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 40px;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-method {
  display: flex;
  gap: 16px;
  align-items: start;
}

.method-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.method-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: white;
}

.method-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
}

/* Contact Form */
.contact-form-wrapper {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-input,
.form-select,
.form-textarea {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  color: #1e293b;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #06b6d4;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-submit-btn {
  padding: 16px 32px;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 50px;
  }
}

@media (max-width: 768px) {
  .contact-section {
    padding: 60px 20px;
  }

  .contact-title {
    font-size: 32px;
  }

  .contact-description {
    font-size: 16px;
  }

  .contact-form-wrapper {
    padding: 30px 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

