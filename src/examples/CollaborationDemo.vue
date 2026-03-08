<template>
  <div class="collaboration-demo">
    <div class="demo-header">
      <h1>Real-Time Collaboration Demo</h1>
      <p>This demonstrates the collaboration features</p>
    </div>

    <div class="demo-content">
      <!-- Connection Status -->
      <div class="status-card">
        <h3>Connection Status</h3>
        <div class="status-indicator" :class="{ connected: isConnected }">
          <div class="status-dot"></div>
          <span>{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
        </div>
        
        <button
          v-if="!isConnected"
          @click="connectToServer"
          class="btn-primary"
        >
          Connect to Server
        </button>
        
        <button
          v-else
          @click="disconnectFromServer"
          class="btn-secondary"
        >
          Disconnect
        </button>
      </div>

      <!-- Project Controls -->
      <div class="controls-card">
        <h3>Project Controls</h3>
        
        <div class="form-group">
          <label>Project ID</label>
          <input
            v-model="projectId"
            type="text"
            placeholder="Enter project ID"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Your Name</label>
          <input
            v-model="userName"
            type="text"
            placeholder="Enter your name"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Your Role</label>
          <select v-model="userRole" class="form-select">
            <option value="owner">Owner</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <button
          @click="joinProject"
          :disabled="!isConnected || !projectId || !userName"
          class="btn-primary"
        >
          Join Project
        </button>

        <button
          v-if="currentProjectId"
          @click="leaveProject"
          class="btn-secondary"
        >
          Leave Project
        </button>
      </div>

      <!-- Active Users -->
      <div class="users-card">
        <h3>Active Users ({{ activeUsersList.length }})</h3>
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
            <div v-if="user.isOnline" class="online-dot"></div>
          </div>

          <div v-if="activeUsersList.length === 0" class="empty-state">
            No other users online
          </div>
        </div>
      </div>

      <!-- Cursor Tracking Demo -->
      <div class="cursor-demo-card">
        <h3>Cursor Tracking Demo</h3>
        <div
          class="cursor-demo-area"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
          <p>Move your mouse here to broadcast cursor position</p>
          
          <!-- Remote Cursors -->
          <RemoteCursor
            v-for="cursor in remoteCursorsList"
            :key="cursor.userId"
            :cursor="cursor"
          />
        </div>
      </div>

      <!-- Activity Log -->
      <div class="activity-card">
        <h3>Activity Log</h3>
        <div class="activity-list">
          <div
            v-for="entry in activityLog.slice(0, 10)"
            :key="entry.id"
            class="activity-item"
          >
            <div class="activity-icon">
              {{ getActivityIcon(entry.action) }}
            </div>
            <div class="activity-content">
              <strong>{{ entry.userName }}</strong>
              {{ getActivityText(entry.action) }}
            </div>
            <div class="activity-time">
              {{ formatTime(entry.timestamp) }}
            </div>
          </div>

          <div v-if="activityLog.length === 0" class="empty-state">
            No activity yet
          </div>
        </div>
      </div>
    </div>

    <!-- Collaboration Panel (Floating) -->
    <div v-if="currentProjectId" class="floating-panel">
      <CollaborationPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCollaborationStore } from '@/stores/collaboration'
import { storeToRefs } from 'pinia'
import { getRandomUserColor } from '@/types/collaboration'
import type { UserRole, ActivityAction } from '@/types/collaboration'
import RemoteCursor from '@/components/collaboration/RemoteCursor.vue'
import CollaborationPanel from '@/components/collaboration/CollaborationPanel.vue'

const collaborationStore = useCollaborationStore()
const {
  isConnected,
  currentProjectId,
  currentUser,
  activeUsersList,
  remoteCursorsList,
  activityLog,
} = storeToRefs(collaborationStore)

// Form state
const projectId = ref('demo-project-123')
const userName = ref('User ' + Math.floor(Math.random() * 1000))
const userRole = ref<UserRole>('editor')

async function connectToServer() {
  try {
    await collaborationStore.initialize('http://localhost:3000')
    alert('Connected to collaboration server!')
  } catch (error) {
    alert('Failed to connect. Make sure the WebSocket server is running on port 3000.')
    console.error(error)
  }
}

function disconnectFromServer() {
  collaborationStore.cleanup()
}

function joinProject() {
  if (!projectId.value || !userName.value) return

  const user = {
    id: 'user-' + Date.now(),
    name: userName.value,
    email: userName.value.toLowerCase().replace(/\s/g, '') + '@example.com',
    color: getRandomUserColor(),
    role: userRole.value,
    isOnline: true,
  }

  collaborationStore.joinProject(projectId.value, user)
}

function leaveProject() {
  collaborationStore.leaveProject()
}

function handleMouseMove(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  collaborationStore.updateCursorPosition(x, y)
}

function handleMouseLeave() {
  collaborationStore.hideCursor()
}

function getActivityIcon(action: ActivityAction): string {
  const icons: Record<ActivityAction, string> = {
    user_joined: '👋',
    user_left: '👋',
    object_added: '➕',
    object_modified: '✏️',
    object_deleted: '🗑️',
    comment_added: '💬',
    comment_resolved: '✅',
    background_changed: '🎨',
    layer_reordered: '📑',
  }
  return icons[action] || '📝'
}

function getActivityText(action: ActivityAction): string {
  const texts: Record<ActivityAction, string> = {
    user_joined: 'joined the project',
    user_left: 'left the project',
    object_added: 'added an object',
    object_modified: 'modified an object',
    object_deleted: 'deleted an object',
    comment_added: 'added a comment',
    comment_resolved: 'resolved a comment',
    background_changed: 'changed the background',
    layer_reordered: 'reordered layers',
  }
  return texts[action] || 'performed an action'
}

function formatTime(timestamp: Date): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'
  return date.toLocaleDateString()
}
</script>

<style scoped>
.collaboration-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.demo-header {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
}

.demo-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.demo-header p {
  font-size: 18px;
  opacity: 0.9;
}

.demo-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.status-card,
.controls-card,
.users-card,
.cursor-demo-card,
.activity-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.status-card h3,
.controls-card h3,
.users-card h3,
.cursor-demo-card h3,
.activity-card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.2);
  margin-bottom: 16px;
}

.status-indicator.connected {
  background: rgba(16, 185, 129, 0.2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 14px;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.btn-primary,
.btn-secondary {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-primary {
  background: #fff;
  color: #667eea;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.users-list,
.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
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
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
}

.user-role {
  font-size: 12px;
  opacity: 0.8;
  text-transform: capitalize;
}

.online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.cursor-demo-area {
  position: relative;
  height: 300px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling */
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
  font-size: 14px;
}

.activity-icon {
  font-size: 20px;
}

.activity-content {
  flex: 1;
}

.activity-time {
  font-size: 12px;
  opacity: 0.7;
}

.empty-state {
  text-align: center;
  padding: 24px;
  opacity: 0.7;
  font-size: 14px;
}

.floating-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}
</style>

