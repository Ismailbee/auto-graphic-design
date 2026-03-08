<template>
  <div class="suggest-page">
    <div class="page-header">
      <div class="header-content">
  <button class="back-button" aria-label="Go back" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="header-text">
          <h1 class="page-title">Suggest a Feature</h1>
          <p class="page-subtitle">Help us build what you need next</p>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="form-card">
        <h2 class="form-title">Tell us your idea</h2>
        <form class="feature-form" @submit.prevent="submit">
          <div class="form-group">
            <label class="form-label">Title *</label>
            <input v-model="form.title" type="text" class="form-input" placeholder="Short and descriptive" required />
          </div>
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select v-model="form.category" class="form-select" required>
              <option value="">Select a category</option>
              <option value="editor">Editor</option>
              <option value="ai">AI / Automation</option>
              <option value="export">Export</option>
              <option value="templates">Templates</option>
              <option value="integrations">Integrations</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Description *</label>
            <textarea v-model="form.description" rows="6" class="form-textarea" placeholder="Describe the problem you're facing and how this feature would help" required></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Impact *</label>
              <select v-model="form.impact" class="form-select" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">How often do you need this?</label>
              <select v-model="form.frequency" class="form-select">
                <option value="rarely">Rarely</option>
                <option value="sometimes">Sometimes</option>
                <option value="often">Often</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>
          <button type="submit" class="submit-button" :disabled="isSubmitting">
            <span v-if="!isSubmitting">Submit Suggestion</span>
            <span v-else>Submitting...</span>
          </button>
        </form>
      </div>
      <div class="side-card">
        <h3 class="side-title">Tips for a great suggestion</h3>
        <ul class="tips">
          <li>Explain the problem you're facing</li>
          <li>Describe the desired outcome</li>
          <li>Include examples or workflows</li>
          <li>Tell us how it impacts your work</li>
        </ul>
      </div>
    </div>

    <transition name="modal">
      <div v-if="showSuccess" class="success-modal" @click="showSuccess=false">
        <div class="success-content" @click.stop>
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 class="success-title">Thanks for your suggestion!</h3>
          <p class="success-text">We appreciate your feedback. Our team reviews every suggestion.</p>
          <button class="success-button" @click="showSuccess=false">Close</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  title: '',
  category: '',
  description: '',
  impact: 'medium',
  frequency: 'sometimes'
})

const isSubmitting = ref(false)
const showSuccess = ref(false)

const submit = async () => {
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 1200))
  isSubmitting.value = false
  showSuccess.value = true
  form.value = { title: '', category: '', description: '', impact: 'medium', frequency: 'sometimes' }
}

const goBack = () => router.back()
</script>

<style scoped>
.suggest-page { min-height: 100vh; background: #f8fafc; padding-bottom: 80px; }
.page-header { background: linear-gradient(135deg, #06b6d4, #0891b2); padding: 60px 20px; color: white; }
.header-content { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 16px; }
.back-button { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.page-title { font-size: 32px; font-weight: 700; margin: 0; }
.page-subtitle { margin: 6px 0 0; opacity: 0.9; }
.content { max-width: 1100px; margin: -30px auto 0; padding: 0 20px; display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
.form-card, .side-card { background: white; border-radius: 16px; padding: 28px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
.form-title { margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; }
.feature-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-label { font-weight: 600; color: #334155; font-size: 14px; }
.form-input, .form-select, .form-textarea { border: 2px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; font-size: 15px; }
.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #06b6d4; box-shadow: 0 0 0 3px rgba(6,182,212,0.15); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.submit-button { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border: none; padding: 14px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.side-title { margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a; }
.tips { margin: 0; padding-left: 18px; color: #475569; line-height: 1.7; }
.modal-enter-active, .modal-leave-active { transition: opacity .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.success-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; padding: 20px; }
.success-content { background: white; border-radius: 16px; padding: 28px; max-width: 420px; text-align: center; }
.success-icon { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg,#10b981,#059669); color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.success-title { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #0f172a; }
.success-text { margin: 0 0 16px 0; color: #475569; }
.success-button { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border: none; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
@media (max-width: 900px) { .content { grid-template-columns: 1fr; } }
</style>
