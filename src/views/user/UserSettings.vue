<template>
  <div class="settings-page">
    <!-- Logo Cropper Modal -->
    <LogoCropper
      :is-open="showImageCropper"
      :image-url="tempImageUrl"
      @close="handleCropperClose"
      @crop="handleCroppedAvatar"
    />

    <!-- Header -->
    <div class="settings-header">
      <button @click="goBack" class="back-button">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <h1 class="settings-title">Settings</h1>
      <p class="settings-subtitle">Manage your account settings and preferences</p>
    </div>

    <!-- Settings Navigation -->
    <div class="settings-container">
      <nav class="settings-nav">
        <button
          v-for="section in sections"
          :key="section.id"
          :class="['nav-item', { active: activeSection === section.id }]"
          @click="activeSection = section.id"
        >
          <span class="nav-icon">{{ section.icon }}</span>
          <span class="nav-label">{{ section.label }}</span>
        </button>
      </nav>

      <!-- Settings Content -->
      <div class="settings-content">
        <!-- Account Settings -->
        <div v-if="activeSection === 'account'" class="settings-section">
          <h2 class="section-title">Account Settings</h2>
          <p class="section-description">Manage your account information and profile</p>

          <!-- Profile Picture -->
          <div class="setting-group">
            <label class="setting-label">Profile Picture</label>
            <div class="avatar-upload">
              <div class="avatar-preview" @click="uploadAvatar" style="cursor: pointer;" title="Click to upload photo">
                <img v-if="profileData.avatar" :src="profileData.avatar" alt="Avatar" />
                <div v-else class="avatar-placeholder">
                  {{ getInitials(profileData.name || 'User') }}
                </div>
              </div>
              <div class="avatar-actions">
                <button @click="uploadAvatar" class="btn-secondary">Upload Photo</button>
                <button v-if="profileData.avatar" @click="removeAvatar" class="btn-text">Remove</button>
              </div>
            </div>
            <p class="setting-hint">Click on the circle to upload a new photo. Images will be cropped and adjusted automatically.</p>
          </div>

          <!-- Name -->
          <div class="setting-group">
            <label class="setting-label">Full Name</label>
            <input
              v-model="profileData.name"
              type="text"
              class="setting-input"
              placeholder="Enter your full name"
            />
          </div>

          <!-- Username -->
          <div class="setting-group">
            <label class="setting-label">Username</label>
            <input
              v-model="profileData.username"
              type="text"
              class="setting-input"
              placeholder="Enter your username"
            />
          </div>

          <!-- Email -->
          <div class="setting-group">
            <label class="setting-label">Email Address</label>
            <input
              v-model="profileData.email"
              type="email"
              class="setting-input"
              placeholder="Enter your email"
            />
            <p class="setting-hint">We'll send a verification email if you change this</p>
          </div>

          <!-- Bio -->
          <div class="setting-group">
            <label class="setting-label">Bio</label>
            <textarea
              v-model="profileData.bio"
              class="setting-textarea"
              placeholder="Tell us about yourself"
              rows="4"
            ></textarea>
          </div>

          <!-- Save Button -->
          <div class="setting-actions">
            <button @click="saveProfile" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div v-if="activeSection === 'privacy'" class="settings-section">
          <h2 class="section-title">Privacy Settings</h2>
          <p class="section-description">Control who can see your information and activity</p>

          <!-- Profile Visibility -->
          <div class="setting-group">
            <label class="setting-label">Profile Visibility</label>
            <select v-model="settings.privacy.profileVisibility" class="setting-select">
              <option value="public">Public - Anyone can view your profile</option>
              <option value="private">Private - Only you can view your profile</option>
            </select>
          </div>

          <!-- Show Email -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Show Email Address</label>
                <p class="setting-hint">Display your email on your public profile</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.privacy.showEmail" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Activity Visibility -->
          <div class="setting-group">
            <label class="setting-label">Activity Visibility</label>
            <select v-model="settings.privacy.activityVisibility" class="setting-select">
              <option value="public">Public - Everyone can see your activity</option>
              <option value="friends">Friends - Only friends can see your activity</option>
              <option value="private">Private - Only you can see your activity</option>
            </select>
          </div>

          <!-- Data Sharing -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Data Sharing</label>
                <p class="setting-hint">Allow us to use your data to improve our services</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.privacy.dataSharing" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Save Button -->
          <div class="setting-actions">
            <button @click="saveSettings" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Notification Settings -->
        <div v-if="activeSection === 'notifications'" class="settings-section">
          <h2 class="section-title">Notification Settings</h2>
          <p class="section-description">Choose what notifications you want to receive</p>

          <!-- Email Notifications -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Email Notifications</label>
                <p class="setting-hint">Receive notifications via email</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.emailNotifications" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Push Notifications -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Push Notifications</label>
                <p class="setting-hint">Receive push notifications in your browser</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.pushNotifications" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Design Comments -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Design Comments</label>
                <p class="setting-hint">Get notified when someone comments on your designs</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.designComments" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Design Likes -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Design Likes</label>
                <p class="setting-hint">Get notified when someone likes your designs</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.designLikes" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- New Followers -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">New Followers</label>
                <p class="setting-hint">Get notified when someone follows you</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.newFollowers" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Marketplace Updates -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Marketplace Updates</label>
                <p class="setting-hint">Get notified about new templates and marketplace news</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.marketplaceUpdates" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- System Announcements -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">System Announcements</label>
                <p class="setting-hint">Get notified about important system updates</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.systemAnnouncements" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Save Button -->
          <div class="setting-actions">
            <button @click="saveSettings" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Preferences -->
        <div v-if="activeSection === 'preferences'" class="settings-section">
          <h2 class="section-title">Preferences</h2>
          <p class="section-description">Customize your experience</p>

          <!-- Theme -->
          <div class="setting-group">
            <label class="setting-label">Theme</label>
            <select v-model="settings.preferences.theme" @change="applyTheme" class="setting-select">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <!-- Language -->
          <div class="setting-group">
            <label class="setting-label">Language</label>
            <select v-model="settings.preferences.language" class="setting-select">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          <!-- Timezone -->
          <div class="setting-group">
            <label class="setting-label">Timezone</label>
            <select v-model="settings.preferences.timezone" class="setting-select">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>

          <!-- Auto Save -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Auto Save</label>
                <p class="setting-hint">Automatically save your work every few minutes</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.preferences.autoSave" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Save Button -->
          <div class="setting-actions">
            <button @click="saveSettings" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Security -->
        <div v-if="activeSection === 'security'" class="settings-section">
          <h2 class="section-title">Security</h2>
          <p class="section-description">Manage your password and account security</p>

          <!-- Linked Sign-in Methods -->
          <div class="setting-group">
            <label class="setting-label">🔗 Linked Sign-in Methods</label>
            <p class="setting-hint">See which login methods are connected to your account</p>
            <div class="linked-providers">
              <div class="provider-badge" :class="{ active: accountLinking.hasGoogle }">
                <span class="provider-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </span>
                <span class="provider-name">Google</span>
                <span v-if="accountLinking.hasGoogle" class="provider-status">✓ Connected</span>
                <span v-else class="provider-status not-connected">Not connected</span>
              </div>
              <div class="provider-badge" :class="{ active: accountLinking.hasPassword }">
                <span class="provider-icon">📧</span>
                <span class="provider-name">Email/Password</span>
                <span v-if="accountLinking.hasPassword" class="provider-status">✓ Connected</span>
                <span v-else class="provider-status not-connected">Not connected</span>
              </div>
            </div>
          </div>

          <!-- Link Email/Password (for Google users) -->
          <div v-if="accountLinking.hasGoogle && !accountLinking.hasPassword" class="setting-group account-linking">
            <label class="setting-label">➕ Add Password Login</label>
            <p class="setting-hint">
              You signed in with Google. Add a password so you can also log in with email and password.
            </p>
            <input
              v-model="accountLinking.newPassword"
              type="password"
              class="setting-input"
              placeholder="Create a password (min 6 characters)"
            />
            <input
              v-model="accountLinking.confirmPassword"
              type="password"
              class="setting-input"
              placeholder="Confirm password"
              style="margin-top: 12px"
            />
            <button
              @click="linkPassword"
              class="btn-primary"
              style="margin-top: 12px"
              :disabled="accountLinking.isLinking"
            >
              {{ accountLinking.isLinking ? 'Linking...' : 'Add Password Login' }}
            </button>
          </div>

          <!-- Change Password (for users who have password) -->
          <div v-if="accountLinking.hasPassword" class="setting-group">
            <label class="setting-label">Change Password</label>
            <input
              v-model="passwordData.currentPassword"
              type="password"
              class="setting-input"
              placeholder="Current password"
            />
            <input
              v-model="passwordData.newPassword"
              type="password"
              class="setting-input"
              placeholder="New password"
              style="margin-top: 12px"
            />
            <input
              v-model="passwordData.confirmPassword"
              type="password"
              class="setting-input"
              placeholder="Confirm new password"
              style="margin-top: 12px"
            />
            <button @click="changePassword" class="btn-secondary" style="margin-top: 12px" :disabled="isSaving">
              {{ isSaving ? 'Changing...' : 'Change Password' }}
            </button>
          </div>

          <!-- Delete Account -->
          <div class="setting-group danger-zone">
            <label class="setting-label">Delete Account</label>
            <p class="setting-hint">Once you delete your account, there is no going back. Please be certain.</p>
            <button @click="confirmDeleteAccount" class="btn-danger">
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Logo Cropper Modal -->
    <LogoCropper
      :is-open="showImageCropper"
      :image-url="tempImageUrl"
      @close="handleCropperClose"
      @crop="handleCroppedAvatar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LogoCropper from '@/components/image/LogoCropper.vue'
import type { UserSettings, ProfileUpdateData } from '@/types/auth'
import { safeLocalStorage } from '@/utils/storage.utils.ts'
import { getLinkedProviders, hasPasswordProvider, hasGoogleProvider, linkEmailPassword } from '@/services/firebase/firebase-auth'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const activeSection = ref('account')
const isSaving = ref(false)
const showImageCropper = ref(false)
const tempImageUrl = ref('')

const sections = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  { id: 'security', label: 'Security', icon: '🛡️' }
]

const profileData = reactive({
  name: '',
  username: '',
  email: '',
  avatar: '',
  bio: ''
})

const settings = reactive<UserSettings>({
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    activityVisibility: 'public',
    dataSharing: true
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    designComments: true,
    designLikes: true,
    newFollowers: true,
    marketplaceUpdates: false,
    systemAnnouncements: true
  },
  preferences: {
    language: 'en',
    timezone: 'UTC',
    theme: 'light',
    autoSave: true,
    defaultCanvasSize: '1920x1080'
  }
})

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Account linking state
const accountLinking = reactive({
  newPassword: '',
  confirmPassword: '',
  isLinking: false,
  linkedProviders: [] as string[],
  hasPassword: false,
  hasGoogle: false
})

onMounted(async () => {
  loadUserData()
  loadSettings()
  // Sync theme with theme store
  settings.preferences.theme = themeStore.mode

  // Load linked providers
  await loadLinkedProviders()
})

async function loadLinkedProviders() {
  try {
    accountLinking.linkedProviders = await getLinkedProviders()
    accountLinking.hasPassword = await hasPasswordProvider()
    accountLinking.hasGoogle = await hasGoogleProvider()
  } catch (error) {
    console.error('Error loading linked providers:', error)
  }
}

async function linkPassword() {
  // Validate passwords
  if (!accountLinking.newPassword || !accountLinking.confirmPassword) {
    authStore.showNotification({
      title: 'Error',
      message: 'Please fill in both password fields',
      type: 'error'
    })
    return
  }

  if (accountLinking.newPassword !== accountLinking.confirmPassword) {
    authStore.showNotification({
      title: 'Error',
      message: 'Passwords do not match',
      type: 'error'
    })
    return
  }

  if (accountLinking.newPassword.length < 6) {
    authStore.showNotification({
      title: 'Error',
      message: 'Password must be at least 6 characters',
      type: 'error'
    })
    return
  }

  accountLinking.isLinking = true

  try {
    await linkEmailPassword(accountLinking.newPassword)

    // Clear form
    accountLinking.newPassword = ''
    accountLinking.confirmPassword = ''

    // Reload providers
    await loadLinkedProviders()

    authStore.showNotification({
      title: 'Success! 🎉',
      message: 'Password authentication added successfully! You can now login with email and password.',
      type: 'success'
    })
  } catch (error: any) {
    console.error('Error linking password:', error)
    authStore.showNotification({
      title: 'Error',
      message: error.message || 'Failed to link password',
      type: 'error'
    })
  } finally {
    accountLinking.isLinking = false
  }
}

function loadUserData() {
  if (authStore.user) {
    profileData.name = authStore.user.name || ''
    profileData.username = authStore.user.username || ''
    profileData.email = authStore.user.email || ''
    profileData.avatar = authStore.user.avatar || ''
  }
}

function loadSettings() {
  const saved = localStorage.getItem('userSettings')
  if (saved) {
    Object.assign(settings, JSON.parse(saved))
  }
  // Sync with theme store
  settings.preferences.theme = themeStore.mode
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

async function saveProfile() {
  isSaving.value = true
  try {
    // TODO: Implement API call to update profile
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    authStore.showNotification({
      title: 'Success',
      message: 'Profile updated successfully',
      type: 'success'
    })
  } catch (error) {
    authStore.showNotification({
      title: 'Error',
      message: 'Failed to update profile',
      type: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

async function saveSettings() {
  isSaving.value = true
  try {
    safeLocalStorage.setItem('userSettings', JSON.stringify(settings))
    await new Promise(resolve => setTimeout(resolve, 500))
    
    authStore.showNotification({
      title: 'Success',
      message: 'Settings saved successfully',
      type: 'success'
    })
  } catch (error) {
    authStore.showNotification({
      title: 'Error',
      message: 'Failed to save settings',
      type: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

function applyTheme() {
  const theme = settings.preferences.theme
  themeStore.setTheme(theme)
}

async function changePassword() {
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    authStore.showNotification({
      title: 'Error',
      message: 'Passwords do not match',
      type: 'error'
    })
    return
  }

  isSaving.value = true
  try {
    // TODO: Implement password change API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    passwordData.currentPassword = ''
    passwordData.newPassword = ''
    passwordData.confirmPassword = ''
    
    authStore.showNotification({
      title: 'Success',
      message: 'Password changed successfully',
      type: 'success'
    })
  } catch (error) {
    authStore.showNotification({
      title: 'Error',
      message: 'Failed to change password',
      type: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

// Upload avatar
const uploadAvatar = () => {
  console.log('🎬 UserSettings: uploadAvatar called')
  
  // Create a file input programmatically
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) {
      console.log('⚠️ UserSettings: No file selected')
      return
    }

    console.log('📁 UserSettings: File selected:', file.name, file.type, file.size, 'bytes')

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('❌ UserSettings: Invalid file type:', file.type)
      alert('Please upload an image file (PNG, JPG, etc.)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ UserSettings: File too large:', file.size)
      alert('Image size should be less than 5MB')
      return
    }

    console.log('✅ UserSettings: File validation passed, reading file...')

    // Read file and show cropper
    const reader = new FileReader()
    reader.onload = (e) => {
      tempImageUrl.value = e.target?.result as string
      showImageCropper.value = true
      console.log('✅ UserSettings: File loaded, cropper modal opened')
      console.log('📊 UserSettings: Image data URL length:', tempImageUrl.value?.length)
    }
    reader.onerror = () => {
      console.error('❌ UserSettings: FileReader error')
      alert('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

// Remove current avatar
async function removeAvatar() {
  profileData.avatar = ''
  try {
    await authStore.updateAvatar('')
  } catch (err) {
    console.error('removeAvatar error:', err)
  }
}

// Handle cropped avatar
const handleCroppedAvatar = async (croppedDataUrl: string) => {
  console.log('📥 UserSettings: handleCroppedAvatar called')
  console.log('📥 UserSettings: Received data URL length:', croppedDataUrl?.length)
  
  try {
    console.log('🔄 UserSettings: Calling authStore.updateAvatar...')
    await authStore.updateAvatar(croppedDataUrl)
    console.log('✅ UserSettings: authStore.updateAvatar successful')
    
    profileData.avatar = croppedDataUrl
    showImageCropper.value = false
    tempImageUrl.value = ''
    
    console.log('✅ UserSettings: Avatar updated successfully, modal closed')
  } catch (error) {
    console.error('❌ UserSettings: Failed to update avatar:', error)
    alert('Failed to update avatar: ' + (error as Error).message)
  }
}

// Handle cropper close
const handleCropperClose = () => {
  showImageCropper.value = false
  tempImageUrl.value = ''
}

function confirmDeleteAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    deleteAccount()
  }
}

async function deleteAccount() {
  // TODO: Implement account deletion
  console.log('Delete account')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
}

.settings-header {
  max-width: 1200px;
  margin: 0 auto 32px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.back-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.back-button svg {
  width: 16px;
  height: 16px;
}

.settings-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.settings-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
}

.settings-nav {
  background: white;
  border-radius: 12px;
  padding: 8px;
  height: fit-content;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.nav-item:hover {
  background: #f8fafc;
  color: #1e293b;
}

.nav-item.active {
  background: #eff6ff;
  color: #2563eb;
}

.nav-icon {
  font-size: 18px;
}

.settings-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.settings-section {
  max-width: 600px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.section-description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 32px;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.setting-hint {
  font-size: 13px;
  color: #64748b;
  margin: 4px 0 0;
}

.setting-input,
.setting-select,
.setting-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s;
}

.setting-input:focus,
.setting-select:focus,
.setting-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.setting-textarea {
  resize: vertical;
  font-family: inherit;
}

.setting-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2563eb;
}

input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling */
  border: 2px solid #e2e8f0;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  font-size: 24px;
  font-weight: 600;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-primary,
.btn-secondary,
.btn-danger,
.btn-text {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-text {
  background: transparent;
  color: #64748b;
  padding: 8px 12px;
}

.btn-text:hover {
  color: #1e293b;
}

.danger-zone {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 2px solid #fee2e2;
}

/* Account Linking Styles */
.linked-providers {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.provider-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.provider-badge.active {
  background: #ecfdf5;
  border-color: #10b981;
}

.provider-icon {
  display: flex;
  align-items: center;
  font-size: 18px;
}

.provider-name {
  font-weight: 500;
  color: #1e293b;
}

.provider-status {
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
}

.provider-status.not-connected {
  color: #94a3b8;
  font-weight: 400;
}

.account-linking {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 20px;
}

.account-linking .setting-label {
  color: #0284c7;
}

@media (max-width: 768px) {
  .settings-container {
    grid-template-columns: 1fr;
  }

  .settings-nav {
    display: flex;
    overflow-x: auto;
    padding: 4px;
  }

  .nav-item {
    flex-shrink: 0;
  }

  .nav-label {
    display: none;
  }

  .settings-content {
    padding: 24px 16px;
  }
}
</style>

