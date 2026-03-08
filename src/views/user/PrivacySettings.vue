<template>
  <div class="privacy-settings-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Privacy Settings</h1>
        <p class="page-subtitle">
          Manage your privacy preferences and control how your data is used
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="settings-content">
      <div class="container">
        <!-- Privacy Dashboard -->
        <section class="privacy-dashboard">
          <div class="dashboard-header">
            <h2 class="section-title">Your Privacy Dashboard</h2>
            <p class="section-subtitle">
              Control your privacy settings and manage your personal data
            </p>
          </div>

          <div class="settings-grid">
            <!-- Data Collection Settings -->
            <div class="settings-card">
              <div class="card-header">
                <div class="card-icon">🛡️</div>
                <h3 class="card-title">Data Collection</h3>
              </div>
              <div class="card-content">
                <p class="card-description">
                  Control what data we collect and how it's used to improve your experience
                </p>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Analytics & Performance</h4>
                    <p class="setting-description">Help us improve our services by sharing usage analytics</p>
                  </div>
                  <div class="setting-control">
                    <label class="toggle-switch">
                      <input v-model="settings.analytics" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Error Reporting</h4>
                    <p class="setting-description">Automatically send error reports to help us fix issues</p>
                  </div>
                  <div class="setting-control">
                    <label class="toggle-switch">
                      <input v-model="settings.errorReporting" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Usage Statistics</h4>
                    <p class="setting-description">Share anonymous usage statistics to help improve features</p>
                  </div>
                  <div class="setting-control">
                    <label class="toggle-switch">
                      <input v-model="settings.usageStats" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Communication Settings -->
            <div class="settings-card">
              <div class="card-header">
                <div class="card-icon">📧</div>
                <h3 class="card-title">Communications</h3>
              </div>
              <div class="card-content">
                <p class="card-description">
                  Manage your email preferences and notification settings
                </p>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Marketing Emails</h4>
                    <p class="setting-description">Receive updates about new features and special offers</p>
                  </div>
                  <div class="setting-control">
                    <label class="toggle-switch">
                      <input v-model="settings.marketingEmails" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Project Updates</h4>
                    <p class="setting-description">Get notified about project progress and milestones</p>
                  </div>
                  <div class="setting-control">
                    <label class="toggle-switch">
                      <input v-model="settings.projectUpdates" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Newsletter</h4>
                    <p class="setting-description">Receive our monthly design tips and industry insights</p>
                  </div>
                  <div class="setting-control">
                    <label class="toggle-switch">
                      <input v-model="settings.newsletter" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cookie Settings -->
            <div class="settings-card">
              <div class="card-header">
                <div class="card-icon">🍪</div>
                <h3 class="card-title">Cookie Preferences</h3>
              </div>
              <div class="card-content">
                <p class="card-description">
                  Control which cookies we can use to enhance your experience
                </p>
                
                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Essential Cookies</h4>
                    <p class="setting-description">Required for basic site functionality (cannot be disabled)</p>
                  </div>
                  <div class="setting-control">
                    <label class="toggle-switch disabled">
                      <input type="checkbox" checked disabled />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Analytics Cookies</h4>
                    <p class="setting-description">Help us understand how you use our website</p>
                  </div>
                  <div class="setting-control">
                    <label class="toggle-switch">
                      <input v-model="settings.analyticsCookies" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Marketing Cookies</h4>
                    <p class="setting-description">Used to deliver relevant advertisements</p>
                  </div>
                  <div class="setting-control">
                    <label class="toggle-switch">
                      <input v-model="settings.marketingCookies" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h4 class="setting-title">Preference Cookies</h4>
                    <p class="setting-description">Remember your settings and preferences</p>
                  </div>
                  <div class="setting-control">
                    <label class="toggle-switch">
                      <input v-model="settings.preferenceCookies" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Data Management -->
            <div class="settings-card">
              <div class="card-header">
                <div class="card-icon">📊</div>
                <h3 class="card-title">Data Management</h3>
              </div>
              <div class="card-content">
                <p class="card-description">
                  Access, export, or delete your personal data
                </p>
                
                <div class="data-actions">
                  <button @click="requestDataExport" class="data-action-btn primary">
                    <span class="btn-icon">📥</span>
                    Export My Data
                  </button>
                  <button @click="openDataAccessModal" class="data-action-btn secondary">
                    <span class="btn-icon">👁️</span>
                    View My Data
                  </button>
                  <button @click="openDeleteAccountModal" class="data-action-btn danger">
                    <span class="btn-icon">🗑️</span>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>

            <!-- Third-Party Integrations -->
            <div class="settings-card">
              <div class="card-header">
                <div class="card-icon">🔗</div>
                <h3 class="card-title">Third-Party Services</h3>
              </div>
              <div class="card-content">
                <p class="card-description">
                  Manage connections to third-party services and their data access
                </p>
                
                <div class="integration-item">
                  <div class="integration-info">
                    <h4 class="integration-name">Google Analytics</h4>
                    <p class="integration-description">Website analytics and performance tracking</p>
                  </div>
                  <div class="integration-control">
                    <label class="toggle-switch">
                      <input v-model="settings.googleAnalytics" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="integration-item">
                  <div class="integration-info">
                    <h4 class="integration-name">Hotjar</h4>
                    <p class="integration-description">User behavior analysis and heatmaps</p>
                  </div>
                  <div class="integration-control">
                    <label class="toggle-switch">
                      <input v-model="settings.hotjar" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="integration-item">
                  <div class="integration-info">
                    <h4 class="integration-name">Intercom</h4>
                    <p class="integration-description">Customer support and live chat</p>
                  </div>
                  <div class="integration-control">
                    <label class="toggle-switch">
                      <input v-model="settings.intercom" type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Save Settings -->
          <div class="settings-actions">
            <button @click="saveSettings" class="save-btn" :disabled="isSaving">
              <span v-if="!isSaving">Save Settings</span>
              <span v-else>Saving...</span>
            </button>
            <button @click="resetToDefaults" class="reset-btn">
              Reset to Defaults
            </button>
          </div>
        </section>

        <!-- Privacy Information -->
        <section class="privacy-info">
          <h2 class="section-title">Privacy Information</h2>
          <div class="info-cards">
            <div class="info-card">
              <h3 class="info-title">How We Use Your Data</h3>
              <p class="info-text">
                We use your data to provide and improve our services, communicate with you, and ensure the security of your account. We never sell your personal information to third parties.
              </p>
              <a href="/legal/privacy-policy" class="info-link">Read Privacy Policy →</a>
            </div>

            <div class="info-card">
              <h3 class="info-title">Your Rights</h3>
              <p class="info-text">
                You have the right to access, correct, or delete your personal data. You can also object to processing or request data portability. Contact us to exercise these rights.
              </p>
              <a href="mailto:privacy@smartdesignpro.com" class="info-link">Contact Privacy Team →</a>
            </div>

            <div class="info-card">
              <h3 class="info-title">Data Security</h3>
              <p class="info-text">
                We implement industry-standard security measures to protect your data, including encryption, access controls, and regular security audits.
              </p>
              <a href="/security" class="info-link">Learn About Security →</a>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Modals -->
    <DeleteAccountModal 
      v-if="showDeleteModal" 
      @close="showDeleteModal = false" 
      @confirm="handleDeleteAccount" 
    />
    
    <DataAccessModal 
      v-if="showDataAccessModal" 
      @close="showDataAccessModal = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Settings state
const settings = reactive({
  // Data Collection
  analytics: true,
  errorReporting: true,
  usageStats: false,
  
  // Communications
  marketingEmails: true,
  projectUpdates: true,
  newsletter: false,
  
  // Cookies
  analyticsCookies: true,
  marketingCookies: false,
  preferenceCookies: true,
  
  // Third-party
  googleAnalytics: true,
  hotjar: false,
  intercom: true
})

const isSaving = ref(false)
const showDeleteModal = ref(false)
const showDataAccessModal = ref(false)

// Load settings on mount
onMounted(() => {
  loadSettings()
})

// Methods
const loadSettings = () => {
  // Load saved settings from localStorage or API
  const savedSettings = localStorage.getItem('privacySettings')
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings))
  }
}

const saveSettings = async () => {
  isSaving.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Save to localStorage (in real app, this would be an API call)
    localStorage.setItem('privacySettings', JSON.stringify(settings))
    
    alert('Privacy settings saved successfully!')
  } catch (error) {
    console.error('Error saving settings:', error)
    alert('Error saving settings. Please try again.')
  } finally {
    isSaving.value = false
  }
}

const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all privacy settings to defaults?')) {
    Object.assign(settings, {
      analytics: true,
      errorReporting: true,
      usageStats: false,
      marketingEmails: true,
      projectUpdates: true,
      newsletter: false,
      analyticsCookies: true,
      marketingCookies: false,
      preferenceCookies: true,
      googleAnalytics: true,
      hotjar: false,
      intercom: true
    })
  }
}

const requestDataExport = async () => {
  try {
    alert('Your data export request has been received. You will receive an email with your data within 48 hours.')
    // In real app, this would trigger an API call to generate data export
  } catch (error) {
    console.error('Error requesting data export:', error)
    alert('Error requesting data export. Please try again.')
  }
}

const openDataAccessModal = () => {
  showDataAccessModal.value = true
}

const openDeleteAccountModal = () => {
  showDeleteModal.value = true
}

const handleDeleteAccount = async () => {
  try {
    // Simulate account deletion API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert('Your account deletion request has been submitted. You will receive a confirmation email.')
    router.push('/')
  } catch (error) {
    console.error('Error deleting account:', error)
    alert('Error processing account deletion. Please contact support.')
  }
}

// Placeholder components for modals
const DeleteAccountModal = {
  emits: ['close', 'confirm'],
  template: `
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <h3>Delete Account</h3>
        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button @click="$emit('confirm')" class="btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  `
}

const DataAccessModal = {
  emits: ['close'],
  template: `
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <h3>Your Data</h3>
        <p>Here's a summary of the data we have about you:</p>
        <ul>
          <li>Account information (name, email)</li>
          <li>Project files and communications</li>
          <li>Usage analytics (anonymized)</li>
          <li>Billing information</li>
        </ul>
        <div class="modal-actions">
          <button @click="$emit('close')" class="btn-primary">Close</button>
        </div>
      </div>
    </div>
  `
}
</script>

<style scoped>
.privacy-settings-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.page-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  padding: 120px 0 60px;
  text-align: center;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 32px;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  line-height: 1.6;
}

.settings-content {
  padding: 80px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
}

.settings-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-icon {
  font-size: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.card-description {
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.6;
}

.setting-item,
.integration-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-primary);
}

.setting-item:last-child,
.integration-item:last-child {
  border-bottom: none;
}

.setting-info,
.integration-info {
  flex: 1;
  margin-right: 16px;
}

.setting-title,
.integration-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.setting-description,
.integration-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.setting-control,
.integration-control {
  flex-shrink: 0;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-secondary);
  transition: var(--transition-fast);
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: var(--transition-fast);
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.toggle-switch.disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Data Actions */
.data-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: left;
}

.data-action-btn.primary {
  background: var(--color-primary);
  color: white;
}

.data-action-btn.primary:hover {
  background: var(--color-primary-hover);
}

.data-action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.data-action-btn.secondary:hover {
  background: var(--bg-hover);
}

.data-action-btn.danger {
  background: var(--color-error);
  color: white;
}

.data-action-btn.danger:hover {
  background: #dc2626;
}

.btn-icon {
  font-size: 1rem;
}

/* Settings Actions */
.settings-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 48px;
}

.save-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}

.save-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  background: white;
  color: var(--text-primary);
  border: 2px solid var(--border-primary);
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}

.reset-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Privacy Info */
.privacy-info {
  margin-top: 80px;
  text-align: center;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-top: 48px;
}

.info-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 32px;
  text-align: left;
}

.info-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.info-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.info-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.info-link:hover {
  text-decoration: underline;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 32px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-danger {
  background: var(--color-error);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .data-actions {
    flex-direction: column;
  }
  
  .header-content,
  .container {
    padding: 0 16px;
  }
}
</style>