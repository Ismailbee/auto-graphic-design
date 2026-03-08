<template>
  <div class="cookies-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="header-text">
          <h1 class="page-title">Cookie Policy</h1>
          <p class="page-subtitle">Last updated: November 3, 2025</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="content-section">
      <div class="container">
        <!-- Introduction -->
        <div class="intro-card">
          <svg class="intro-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <h2 class="intro-title">What are cookies?</h2>
          <p class="intro-text">
            Cookies are small text files that are stored on your device when you visit a website. They help us provide 
            you with a better experience by remembering your preferences and improving our services.
          </p>
        </div>

        <!-- Cookie Types -->
        <div class="content-block">
          <h2 class="block-title">Types of Cookies We Use</h2>
          
          <div class="cookie-types">
            <div class="cookie-card">
              <div class="cookie-header">
                <div class="cookie-icon essential">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3 class="cookie-name">Essential Cookies</h3>
                <span class="cookie-badge required">Required</span>
              </div>
              <p class="cookie-desc">
                These cookies are necessary for the website to function properly. They enable basic features like 
                page navigation, secure areas access, and shopping cart functionality.
              </p>
              <div class="cookie-examples">
                <strong>Examples:</strong>
                <ul>
                  <li>Session authentication</li>
                  <li>Security tokens</li>
                  <li>Remember your login status</li>
                </ul>
              </div>
            </div>

            <div class="cookie-card">
              <div class="cookie-header">
                <div class="cookie-icon analytics">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <h3 class="cookie-name">Analytics Cookies</h3>
                <span class="cookie-badge optional">Optional</span>
              </div>
              <p class="cookie-desc">
                These cookies help us understand how visitors interact with our website by collecting and reporting 
                information anonymously. This helps us improve our services.
              </p>
              <div class="cookie-examples">
                <strong>Examples:</strong>
                <ul>
                  <li>Google Analytics</li>
                  <li>Usage statistics</li>
                  <li>Page view tracking</li>
                </ul>
              </div>
            </div>

            <div class="cookie-card">
              <div class="cookie-header">
                <div class="cookie-icon functional">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                  </svg>
                </div>
                <h3 class="cookie-name">Functional Cookies</h3>
                <span class="cookie-badge optional">Optional</span>
              </div>
              <p class="cookie-desc">
                These cookies enable enhanced functionality and personalization, such as remembering your preferences 
                and choices (language, region, etc.).
              </p>
              <div class="cookie-examples">
                <strong>Examples:</strong>
                <ul>
                  <li>Language preferences</li>
                  <li>Theme selection (dark/light mode)</li>
                  <li>Recently viewed items</li>
                </ul>
              </div>
            </div>

            <div class="cookie-card">
              <div class="cookie-header">
                <div class="cookie-icon marketing">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <h3 class="cookie-name">Marketing Cookies</h3>
                <span class="cookie-badge optional">Optional</span>
              </div>
              <p class="cookie-desc">
                These cookies track your online activity to help advertisers deliver more relevant advertising or to 
                limit how many times you see an ad.
              </p>
              <div class="cookie-examples">
                <strong>Examples:</strong>
                <ul>
                  <li>Facebook Pixel</li>
                  <li>Google Ads</li>
                  <li>Retargeting campaigns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Cookie Table -->
        <div class="content-block">
          <h2 class="block-title">Cookie Details</h2>
          
          <div class="cookie-table-wrapper">
            <table class="cookie-table">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>auth_token</code></td>
                  <td><span class="badge essential">Essential</span></td>
                  <td>24 hours</td>
                  <td>User authentication and session management</td>
                </tr>
                <tr>
                  <td><code>csrf_token</code></td>
                  <td><span class="badge essential">Essential</span></td>
                  <td>Session</td>
                  <td>Security protection against CSRF attacks</td>
                </tr>
                <tr>
                  <td><code>theme_preference</code></td>
                  <td><span class="badge functional">Functional</span></td>
                  <td>1 year</td>
                  <td>Remember your theme choice (dark/light)</td>
                </tr>
                <tr>
                  <td><code>_ga</code></td>
                  <td><span class="badge analytics">Analytics</span></td>
                  <td>2 years</td>
                  <td>Google Analytics - distinguish users</td>
                </tr>
                <tr>
                  <td><code>_gid</code></td>
                  <td><span class="badge analytics">Analytics</span></td>
                  <td>24 hours</td>
                  <td>Google Analytics - distinguish users</td>
                </tr>
                <tr>
                  <td><code>_fbp</code></td>
                  <td><span class="badge marketing">Marketing</span></td>
                  <td>3 months</td>
                  <td>Facebook Pixel tracking</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Managing Cookies -->
        <div class="content-block">
          <h2 class="block-title">Managing Your Cookie Preferences</h2>
          <p class="block-text">
            You have full control over which cookies we use. You can manage your preferences at any time using 
            the buttons below:
          </p>
          
          <div class="cookie-controls">
            <button class="control-button" @click="openSettings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
              </svg>
              Cookie Settings
            </button>
            <button class="control-button" @click="acceptAll">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Accept All
            </button>
            <button class="control-button" @click="rejectOptional">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Reject Optional
            </button>
          </div>
        </div>

        <!-- Browser Settings -->
        <div class="content-block">
          <h2 class="block-title">Browser Cookie Settings</h2>
          <p class="block-text">
            You can also control cookies through your browser settings. Most browsers allow you to:
          </p>
          
          <div class="browser-list">
            <div class="browser-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Block all cookies</span>
            </div>
            <div class="browser-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Block third-party cookies only</span>
            </div>
            <div class="browser-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Delete cookies when you close your browser</span>
            </div>
            <div class="browser-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Delete existing cookies</span>
            </div>
          </div>

          <p class="block-text">
            <strong>Note:</strong> Blocking all cookies may prevent certain features of our website from working correctly.
          </p>
        </div>

        <!-- Contact -->
        <div class="content-block">
          <h2 class="block-title">Questions About Cookies?</h2>
          <p class="block-text">
            If you have any questions about our use of cookies or this policy, please contact us:
          </p>
          
          <div class="contact-info">
            <a href="mailto:privacy@smartdesignpro.com" class="contact-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              privacy@smartdesignpro.com
            </a>
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

const openSettings = () => {
  alert('Cookie settings panel would open here')
}

const acceptAll = () => {
  alert('All cookies accepted!')
}

const rejectOptional = () => {
  alert('Optional cookies rejected!')
}
</script>

<style scoped>
.cookies-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: 60px 20px;
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

/* Content */
.content-section {
  max-width: 1200px;
  margin: -40px auto 0;
  padding: 0 20px;
}

.container {
  position: relative;
  z-index: 2;
}

/* Intro Card */
.intro-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  margin-bottom: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.intro-icon {
  color: #f59e0b;
  margin-bottom: 20px;
}

.intro-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.intro-text {
  font-size: 16px;
  color: #64748b;
  line-height: 1.7;
  max-width: 800px;
  margin: 0 auto;
}

/* Content Block */
.content-block {
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.block-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
}

.block-text {
  font-size: 16px;
  color: #475569;
  line-height: 1.7;
  margin: 0 0 24px 0;
}

/* Cookie Types */
.cookie-types {
  display: grid;
  gap: 24px;
}

.cookie-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
}

.cookie-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.cookie-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.cookie-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.cookie-icon.essential {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.cookie-icon.analytics {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.cookie-icon.functional {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.cookie-icon.marketing {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.cookie-name {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.cookie-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.cookie-badge.required {
  background: #dcfce7;
  color: #059669;
}

.cookie-badge.optional {
  background: #e0e7ff;
  color: #4f46e5;
}

.cookie-desc {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 16px;
}

.cookie-examples {
  font-size: 14px;
  color: #475569;
}

.cookie-examples strong {
  display: block;
  margin-bottom: 8px;
  color: #1e293b;
}

.cookie-examples ul {
  margin: 0;
  padding-left: 24px;
  list-style: disc;
}

.cookie-examples li {
  margin: 4px 0;
}

/* Cookie Table */
.cookie-table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.cookie-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.cookie-table thead {
  background: #f8fafc;
}

.cookie-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
}

.cookie-table td {
  padding: 14px 16px;
  font-size: 14px;
  color: #475569;
  border-bottom: 1px solid #f1f5f9;
}

.cookie-table tr:last-child td {
  border-bottom: none;
}

.cookie-table code {
  padding: 2px 8px;
  background: #f1f5f9;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #475569;
}

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
}

.badge.essential {
  background: #dcfce7;
  color: #059669;
}

.badge.functional {
  background: #ede9fe;
  color: #7c3aed;
}

.badge.analytics {
  background: #dbeafe;
  color: #2563eb;
}

.badge.marketing {
  background: #fef3c7;
  color: #d97706;
}

/* Cookie Controls */
.cookie-controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.control-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

/* Browser List */
.browser-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.browser-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 15px;
  color: #475569;
}

.browser-item svg {
  color: #3b82f6;
  flex-shrink: 0;
}

/* Contact Info */
.contact-info {
  margin-top: 24px;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.contact-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }

  .intro-card,
  .content-block {
    padding: 24px;
  }

  .cookie-table-wrapper {
    font-size: 13px;
  }

  .cookie-controls {
    flex-direction: column;
  }

  .control-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
