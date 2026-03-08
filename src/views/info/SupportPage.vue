<template>
  <div class="support-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="header-text">
          <h1 class="page-title">Contact Support</h1>
          <p class="page-subtitle">We're here to help 24/7</p>
        </div>
      </div>
    </div>

    <!-- Contact Methods -->
    <div class="contact-methods">
      <div class="method-card" @click="selectMethod('chat')">
        <div class="method-icon chat-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3 class="method-title">Live Chat</h3>
        <p class="method-desc">Chat with our support team instantly</p>
        <span class="method-badge online">● Online Now</span>
      </div>

      <div class="method-card" @click="selectMethod('email')">
        <div class="method-icon email-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h3 class="method-title">Email Support</h3>
        <p class="method-desc">Get a detailed response within 24 hours</p>
        <span class="method-badge">support@smartdesignpro.com</span>
      </div>

      <div class="method-card" @click="selectMethod('phone')">
        <div class="method-icon phone-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        <h3 class="method-title">Phone Support</h3>
        <p class="method-desc">Speak with an expert directly</p>
        <span class="method-badge">+1 (555) 123-4567</span>
      </div>
    </div>

    <!-- Contact Form -->
    <div class="form-section">
      <div class="form-container">
        <h2 class="form-title">Send us a message</h2>
        <p class="form-subtitle">Fill out the form below and we'll get back to you as soon as possible</p>

        <form class="contact-form" @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input 
                v-model="formData.name"
                type="text" 
                class="form-input" 
                placeholder="John Doe"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input 
                v-model="formData.email"
                type="email" 
                class="form-input" 
                placeholder="john@example.com"
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Subject *</label>
            <input 
              v-model="formData.subject"
              type="text" 
              class="form-input" 
              placeholder="How can we help you?"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label">Category *</label>
            <select v-model="formData.category" class="form-select" required>
              <option value="">Select a category</option>
              <option value="technical">Technical Issue</option>
              <option value="billing">Billing & Payments</option>
              <option value="feature">Feature Request</option>
              <option value="account">Account Management</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Priority</label>
            <div class="priority-options">
              <label 
                v-for="priority in priorities" 
                :key="priority.value"
                class="priority-option"
                :class="{ active: formData.priority === priority.value }"
              >
                <input 
              v-model="formData.priority"
                    type="radio"
                    class="priority-input"
                  :value="priority.value" 
                >
                <span class="priority-label" :class="priority.class">{{ priority.label }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Message *</label>
            <textarea 
              v-model="formData.message"
              class="form-textarea" 
              placeholder="Please describe your issue or question in detail..."
              rows="6"
              required
            ></textarea>
            <span class="char-count">{{ formData.message.length }}/1000</span>
          </div>

          <div class="form-group">
            <label class="file-upload">
              <input 
                type="file"
                class="file-input"
                accept="image/*,.pdf,.doc,.docx"
                multiple
                @change="handleFileUpload"
              >
              <div class="file-upload-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
                Attach Files (Optional)
              </div>
            </label>
            <p class="file-hint">You can attach images, PDFs, or documents (max 10MB each)</p>
            <div v-if="attachedFiles.length" class="attached-files">
              <div v-for="(file, index) in attachedFiles" :key="index" class="file-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
                <span class="file-name">{{ file.name }}</span>
                <button type="button" class="file-remove" @click="removeFile(index)">×</button>
              </div>
            </div>
          </div>

          <button type="submit" class="submit-button" :disabled="isSubmitting">
            <span v-if="!isSubmitting">Send Message</span>
            <span v-else>Sending...</span>
            <svg v-if="!isSubmitting" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>

      <!-- FAQ Quick Links -->
      <div class="quick-links">
        <h3 class="quick-links-title">Quick Answers</h3>
        <p class="quick-links-desc">Common questions answered instantly</p>
        <div class="quick-link-items">
          <a href="/faq" class="quick-link">
            <span>How do I reset my password?</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
          <a href="/faq" class="quick-link">
            <span>How do tokens work?</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
          <a href="/faq" class="quick-link">
            <span>How to upgrade my plan?</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
          <a href="/faq" class="quick-link">
            <span>Can I cancel anytime?</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <transition name="modal">
      <div v-if="showSuccess" class="success-modal" @click="showSuccess = false">
        <div class="success-content" @click.stop>
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 class="success-title">Message Sent Successfully!</h3>
          <p class="success-text">We've received your message and will get back to you within 24 hours.</p>
          <button class="success-button" @click="showSuccess = false">Close</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  name: '',
  email: '',
  subject: '',
  category: '',
  priority: 'medium',
  message: ''
})

const priorities = [
  { value: 'low', label: 'Low', class: 'priority-low' },
  { value: 'medium', label: 'Medium', class: 'priority-medium' },
  { value: 'high', label: 'High', class: 'priority-high' },
  { value: 'urgent', label: 'Urgent', class: 'priority-urgent' }
]

const attachedFiles = ref<File[]>([])
const isSubmitting = ref(false)
const showSuccess = ref(false)

const selectMethod = (method: string) => {
  if (method === 'chat') {
    // Open chat widget
    alert('Live chat feature coming soon!')
  } else if (method === 'email') {
    // Scroll to form or pre-fill email
    window.scrollTo({ top: document.querySelector('.form-section')?.getBoundingClientRect().top || 0, behavior: 'smooth' })
  } else if (method === 'phone') {
    // Show phone number
    alert('Call us at +1 (555) 123-4567')
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    attachedFiles.value.push(...Array.from(target.files))
  }
}

const removeFile = (index: number) => {
  attachedFiles.value.splice(index, 1)
}

const submitForm = async () => {
  isSubmitting.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Reset form
  formData.value = {
    name: '',
    email: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  }
  attachedFiles.value = []
  
  isSubmitting.value = false
  showSuccess.value = true
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.support-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding-bottom: 80px;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  padding: 60px 20px 120px;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
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
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-4px);
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

/* Contact Methods */
.contact-methods {
  max-width: 1200px;
  margin: -80px auto 60px;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  position: relative;
  z-index: 2;
}

.method-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.method-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
  border-color: #e2e8f0;
}

.method-icon {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.chat-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.email-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.phone-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.method-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.method-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.method-badge {
  display: inline-block;
  padding: 6px 16px;
  background: #f1f5f9;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
}

.method-badge.online {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

/* Form Section */
.form-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.form-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 32px 0;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.form-input,
.form-select,
.form-textarea {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  color: #1e293b;
  background: white;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 140px;
}

.char-count {
  font-size: 12px;
  color: #94a3b8;
  text-align: right;
}

/* Priority Options */
.priority-options {
  display: flex;
  gap: 12px;
}

.priority-option {
  flex: 1;
  cursor: pointer;
}

.priority-input {
  display: none;
}

.priority-label {
  display: block;
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.priority-option.active .priority-label {
  border-color: currentColor;
  background: currentColor;
  color: white;
}

.priority-low { color: #10b981; }
.priority-medium { color: #3b82f6; }
.priority-high { color: #f59e0b; }
.priority-urgent { color: #ef4444; }

/* File Upload */
.file-upload {
  cursor: pointer;
}

.file-input {
  display: none;
}

.file-upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.file-upload-button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.file-hint {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.attached-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: #334155;
}

.file-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: all 0.2s ease;
}

.file-remove:hover {
  background: #dc2626;
}

/* Submit Button */
.submit-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Quick Links */
.quick-links {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.quick-links-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.quick-links-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
}

.quick-link-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
  text-decoration: none;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.quick-link:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
  transform: translateX(4px);
}

.quick-link svg {
  color: #94a3b8;
}

/* Success Modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.success-content {
  background: white;
  border-radius: 20px;
  padding: 48px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.success-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.success-text {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.success-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.success-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Responsive */
@media (max-width: 900px) {
  .form-section {
    grid-template-columns: 1fr;
  }

  .quick-links {
    position: static;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }

  .contact-methods {
    grid-template-columns: 1fr;
  }

  .form-container {
    padding: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .priority-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
