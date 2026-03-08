<template>
  <div id="ican-micro-app" class="ican-wrapper">
    <div class="coming-soon-container">
      <div class="icon-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
      <h1>ICAN Portal</h1>
      <p class="subtitle">Branch Management System</p>
      <div class="info-box">
        <p>The ICAN Portal is currently being integrated into SmartDesignPro.</p>
        <p>This feature provides comprehensive branch management including:</p>
        <ul>
          <li>📊 Dashboard & Analytics</li>
          <li>📄 Invoice & Receipt Generation</li>
          <li>👥 Member Management</li>
          <li>📈 Reports & Statistics</li>
          <li>✍️ Digital Signatures</li>
        </ul>
      </div>
      <div class="actions">
        <button class="primary-button" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
        <button class="secondary-button" @click="contactSupport">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Contact Support
        </button>
      </div>
      <div class="footer-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>For immediate access to ICAN Portal, please use the standalone application.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/home')
}

const contactSupport = () => {
  router.push('/support')
}
</script>

<style scoped>
.ican-wrapper {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.coming-soon-container {
  max-width: 700px;
  width: 100%;
  background: white;
  border-radius: 24px;
  padding: 60px 40px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.icon-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper svg {
  width: 50px;
  height: 50px;
  color: white;
}

.coming-soon-container h1 {
  font-size: 36px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 18px;
  color: #64748b;
  margin: 0 0 32px 0;
  font-weight: 600;
}

.info-box {
  background: #f8fafc;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  text-align: left;
}

.info-box p {
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.info-box p:last-of-type {
  font-weight: 600;
  color: #1e293b;
}

.info-box ul {
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
}

.info-box li {
  font-size: 15px;
  color: #475569;
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.primary-button,
.secondary-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.secondary-button {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.secondary-button:hover {
  background: #f8fafc;
  transform: translateY(-2px);
}

.primary-button svg,
.secondary-button svg {
  width: 20px;
  height: 20px;
}

.footer-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #fef3c7;
  border-radius: 12px;
  color: #92400e;
  font-size: 14px;
  line-height: 1.5;
}

.footer-note svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .coming-soon-container {
    padding: 40px 24px;
  }

  .coming-soon-container h1 {
    font-size: 28px;
  }

  .actions {
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
