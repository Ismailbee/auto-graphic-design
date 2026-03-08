<template>
  <div class="collaboration-panel">
    <!-- Header -->
    <div class="panel-header">
      <h3 class="panel-title">
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Collaborators
        <span class="user-count">{{ activeUsersList.length + 1 }}</span>
      </h3>
      
      <button
        v-if="canManageCollaborators"
        @click="showInviteModal = true"
        class="invite-btn"
        title="Invite collaborator"
      >
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- Current User -->
    <div class="user-item current-user">
      <div class="user-avatar" :style="{ backgroundColor: currentUser?.color }">
        {{ currentUser?.name?.charAt(0).toUpperCase() }}
      </div>
      <div class="user-info">
        <div class="user-name">{{ currentUser?.name }} (You)</div>
        <div class="user-role">{{ currentUser?.role }}</div>
      </div>
      <div class="online-indicator"></div>
    </div>

    <!-- Active Users -->
    <div class="users-list">
      <div
        v-for="user in activeUsersList"
        :key="user.id"
        class="user-item"
      >
        <div class="user-avatar" :style="{ backgroundColor: user.color }">
          {{ user.name?.charAt(0).toUpperCase() }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-role">{{ user.role }}</div>
        </div>
        <div v-if="user.isOnline" class="online-indicator"></div>
      </div>

      <div v-if="activeUsersList.length === 0" class="empty-state">
        <p>No other users online</p>
      </div>
    </div>

    <!-- Connection Status -->
    <div class="connection-status" :class="{ connected: isConnected }">
      <div class="status-dot"></div>
      <span>{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
    </div>

    <!-- Invite Modal -->
    <Teleport to="body">
      <div v-if="showInviteModal" class="modal-overlay" @click="showInviteModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Invite Collaborator</h3>
            <button @click="showInviteModal = false" class="close-btn">
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Email Address</label>
              <input
                v-model="inviteEmail"
                type="email"
                placeholder="colleague@example.com"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Role</label>
              <select v-model="inviteRole" class="form-select">
                <option value="editor">Editor - Can edit the design</option>
                <option value="viewer">Viewer - Can view and comment only</option>
              </select>
            </div>

            <div class="form-group">
              <label>Message (Optional)</label>
              <textarea
                v-model="inviteMessage"
                placeholder="Add a personal message..."
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="showInviteModal = false" class="btn-secondary">
              Cancel
            </button>
            <button @click="sendInvite" class="btn-primary" :disabled="!inviteEmail">
              Send Invite
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCollaborationStore } from '@/stores/collaboration'
import { storeToRefs } from 'pinia'
import type { UserRole } from '@/types/collaboration'

const collaborationStore = useCollaborationStore()
const {
  isConnected,
  currentUser,
  activeUsersList,
  canManageCollaborators,
} = storeToRefs(collaborationStore)

// Invite modal state
const showInviteModal = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<UserRole>('editor')
const inviteMessage = ref('')

function sendInvite() {
  if (!inviteEmail.value) return

  // TODO: Call API to send invitation
  console.log('Sending invite:', {
    email: inviteEmail.value,
    role: inviteRole.value,
    message: inviteMessage.value,
  })

  // Reset form
  inviteEmail.value = ''
  inviteRole.value = 'editor'
  inviteMessage.value = ''
  showInviteModal.value = false

  // Show success notification
  alert('Invitation sent successfully!')
}
</script>

<style scoped>
.collaboration-panel {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 16px;
  color: #333;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 280px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.icon {
  width: 20px;
  height: 20px;
}

.user-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.invite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(59, 130, 246, 0.2);
  border: none;
  border-radius: 8px;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
}

.invite-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: scale(1.05);
}

.users-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.5);
  transition: background 0.2s;
}

.user-item:hover {
  background: rgba(255, 255, 255, 0.7);
}

.user-item.current-user {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  /* Keeping overflow: hidden for text truncation with ellipsis - this is intentional */
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #666;
  text-transform: capitalize;
}

.online-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: #666;
  font-size: 14px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  font-size: 12px;
  font-weight: 600;
  color: #ef4444;
}

.connection-status.connected {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  pointer-events: auto;
  /* Changed to auto to allow modal interaction */
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  pointer-events: auto;
  /* Ensure modal content is clickable */
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in collaboration panel */
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #000;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

