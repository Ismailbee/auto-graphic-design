<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content" :class="{ 'dark-theme': canvasStore.workspaceTheme === 'dark' }">
      <div class="modal-header">
        <h3>Share Design</h3>
        <button @click="close" class="close-btn"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="share-tabs">
          <button 
            :class="{ active: activeTab === 'invite' }" 
            @click="activeTab = 'invite'"
            class="share-tab"
          >
            Invite People
          </button>
          <button 
            :class="{ active: activeTab === 'link' }" 
            @click="activeTab = 'link'"
            class="share-tab"
          >
            Share Link
          </button>
          <button 
            :class="{ active: activeTab === 'social' }" 
            @click="activeTab = 'social'"
            class="share-tab"
          >
            Social Media
          </button>
        </div>

        <div v-if="activeTab === 'invite'">
          <h4>Invite by email</h4>
          <div class="collaborator-input">
            <input type="email" v-model="inviteEmail" placeholder="Enter email address..." />
            <button @click="addCollaborator">
              <i class="fas fa-paper-plane"></i> Invite
            </button>
          </div>
          <div class="collaborators-list">
            <div v-for="collaborator in collaborators" :key="collaborator.email" class="collaborator-item">
              <div class="collaborator-info">
                <img :src="collaborator.avatar" :alt="collaborator.name" />
                <span>{{ collaborator.name }} ({{ collaborator.email }})</span>
              </div>
              <div class="collaborator-role">
                <select v-model="collaborator.role">
                  <option value="viewer">Can view</option>
                  <option value="editor">Can edit</option>
                </select>
                <button @click="removeCollaborator(collaborator.email)">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'link'">
          <h4>Public Link</h4>
          <p>Anyone with this link can view the design.</p>
          <div class="link-sharing">
            <input type="text" :value="shareableLink" readonly />
            <button @click="copyLink">
              <i class="fas fa-copy"></i> Copy Link
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'social'">
          <h4>Share on Social Media</h4>
          <div class="social-buttons">
            <button class="share-button facebook" @click="share('facebook')"><i class="fab fa-facebook-f"></i> Facebook</button>
            <button class="share-button twitter" @click="share('twitter')"><i class="fab fa-twitter"></i> Twitter</button>
            <button class="share-button linkedin" @click="share('linkedin')"><i class="fab fa-linkedin-in"></i> LinkedIn</button>
            <button class="share-button email" @click="share('email')"><i class="fas fa-envelope"></i> Email</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCanvasStore } from '../../../../stores/canvas-konva'
import { useNotification } from '../../../../composables/useNotification'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close'])

const canvasStore = useCanvasStore()
const { showSuccess, showError } = useNotification()

const activeTab = ref('invite')
const inviteEmail = ref('')
const collaborators = ref([
  { name: 'Jane Doe', email: 'jane.doe@example.com', role: 'editor', avatar: 'https://i.pravatar.cc/40?u=jane' },
  { name: 'Current User', email: 'you@example.com', role: 'owner', avatar: 'https://i.pravatar.cc/40?u=you' }
])

const shareableLink = computed(() => {
  // In a real app, this would be a unique URL for the design
  return `${window.location.origin}/view/${canvasStore.projectId || 'shared-design'}`
})

function close() {
  emit('close')
}

function addCollaborator() {
  if (inviteEmail.value && /^\S+@\S+\.\S+$/.test(inviteEmail.value)) {
    if (collaborators.value.some(c => c.email === inviteEmail.value)) {
      showError('This user has already been invited.')
      return
    }
    collaborators.value.push({
      name: inviteEmail.value.split('@')[0],
      email: inviteEmail.value,
      role: 'viewer',
      avatar: `https://i.pravatar.cc/40?u=${inviteEmail.value}`
    })
    showSuccess(`Invitation sent to ${inviteEmail.value}`)
    inviteEmail.value = ''
  } else {
    showError('Please enter a valid email address.')
  }
}

function removeCollaborator(email) {
  collaborators.value = collaborators.value.filter(c => c.email !== email)
}

function copyLink() {
  navigator.clipboard.writeText(shareableLink.value).then(() => {
    showSuccess('Link copied to clipboard!')
  }).catch(err => {
    showError('Failed to copy link.')
    console.error('Failed to copy link: ', err)
  })
}

function share(platform) {
  const url = encodeURIComponent(shareableLink.value)
  const text = encodeURIComponent(`Check out my design: ${canvasStore.projectName || 'Untitled Design'}`)
  let shareUrl = ''

  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
      break
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`
      break
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`
      break
    case 'email':
      shareUrl = `mailto:?subject=${text}&body=Check out this design I made: ${url}`
      window.location.href = shareUrl
      return
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1002;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 16px;
  width: 550px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.dark-theme .modal-content {
  background-color: #2d3748;
  color: var(--text-dark-primary);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--header-border-light);
}

.dark-theme .modal-header {
  border-bottom-color: var(--header-border-dark);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-light-secondary);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.dark-theme .close-btn {
  color: var(--text-dark-secondary);
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: var(--text-light-primary);
}

.dark-theme .close-btn:hover {
  background-color: #374151;
  color: var(--text-dark-primary);
}

.modal-body {
  padding: 24px;
}

.share-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--header-border-light);
}
.dark-theme .share-tabs {
  border-bottom-color: var(--header-border-dark);
}

.share-tab {
  padding: 10px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-light-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.dark-theme .share-tab {
  color: var(--text-dark-secondary);
}

.share-tab:hover {
  color: var(--text-light-primary);
}
.dark-theme .share-tab:hover {
  color: var(--text-dark-primary);
}

.share-tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.collaborator-input {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.collaborator-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.dark-theme .collaborator-input input {
  background-color: #1f2937;
  border-color: #4b5563;
  color: var(--text-dark-primary);
}

.collaborator-input button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.collaborators-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.collaborator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f9fafb;
  border-radius: 6px;
}

.dark-theme .collaborator-item {
  background-color: #1f2937;
}

.collaborator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collaborator-info img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.collaborator-role {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collaborator-role select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  background-color: white;
}

.dark-theme .collaborator-role select {
  background-color: #1f2937;
  border-color: #4b5563;
  color: var(--text-dark-primary);
}

.collaborator-role button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-theme .collaborator-role button {
  color: #6b7280;
}

.collaborator-role button:hover {
  background-color: #f3f4f6;
  color: #ef4444;
}

.dark-theme .collaborator-role button:hover {
  background-color: #374151;
  color: #ef4444;
}

.link-sharing {
  display: flex;
  gap: 8px;
}

.link-sharing input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f9fafb;
}

.dark-theme .link-sharing input {
  background-color: #1f2937;
  border-color: #4b5563;
  color: var(--text-dark-primary);
}

.link-sharing button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.social-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;
}

.share-button:hover {
  opacity: 0.9;
}

.share-button.facebook { background-color: #1877f2; }
.share-button.twitter { background-color: #1da1f2; }
.share-button.linkedin { background-color: #0077b5; }
.share-button.email { background-color: #6b7280; }
</style>