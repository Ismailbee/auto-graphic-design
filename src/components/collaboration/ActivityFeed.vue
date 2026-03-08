<template>
  <div class="activity-feed">
    <div class="feed-header">
      <h3>
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Activity
      </h3>
      <button v-if="activityLog.length > 0" @click="clearActivity" class="clear-btn" title="Clear activity">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <div class="activity-list">
      <div
        v-for="entry in displayedActivities"
        :key="entry.id"
        class="activity-item"
        :class="`activity-${entry.action}`"
      >
        <div class="activity-icon">
          {{ getActivityIcon(entry.action) }}
        </div>
        
        <div class="activity-content">
          <div class="activity-user">
            <div class="user-avatar" :style="{ backgroundColor: getUserColor(entry.userId) }">
              {{ entry.userName?.charAt(0).toUpperCase() }}
            </div>
            <span class="user-name">{{ entry.userName }}</span>
          </div>
          
          <div class="activity-description">
            {{ getActivityDescription(entry) }}
          </div>
          
          <div class="activity-time">
            {{ formatTime(entry.timestamp) }}
          </div>
        </div>
      </div>

      <div v-if="activityLog.length === 0" class="empty-state">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No activity yet</p>
        <span>Actions will appear here</span>
      </div>

      <div v-if="hasMore" class="load-more">
        <button @click="loadMore" class="load-more-btn">
          Load more
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCollaborationStore } from '@/stores/collaboration'
import { storeToRefs } from 'pinia'
import type { ActivityLogEntry, ActivityAction } from '@/types/collaboration'
import { USER_COLORS } from '@/types/collaboration'

const collaborationStore = useCollaborationStore()
const { activityLog } = storeToRefs(collaborationStore)

const displayLimit = ref(20)

const displayedActivities = computed(() => {
  return activityLog.value.slice(0, displayLimit.value)
})

const hasMore = computed(() => {
  return activityLog.value.length > displayLimit.value
})

function loadMore() {
  displayLimit.value += 20
}

function clearActivity() {
  if (confirm('Clear all activity history?')) {
    activityLog.value.length = 0
  }
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

function getActivityDescription(entry: ActivityLogEntry): string {
  const descriptions: Record<ActivityAction, string> = {
    user_joined: 'joined the project',
    user_left: 'left the project',
    object_added: `added a ${entry.targetType || 'object'}`,
    object_modified: `modified a ${entry.targetType || 'object'}`,
    object_deleted: `deleted a ${entry.targetType || 'object'}`,
    comment_added: 'added a comment',
    comment_resolved: 'resolved a comment',
    background_changed: 'changed the background',
    layer_reordered: 'reordered layers',
  }
  
  let description = descriptions[entry.action] || 'performed an action'
  
  if (entry.details) {
    description += ` - ${entry.details}`
  }
  
  return description
}

function getUserColor(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return USER_COLORS[hash % USER_COLORS.length]
}

function formatTime(timestamp: Date): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'
  if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago'
  
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.activity-feed {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 16px;
  color: #333;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 320px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.feed-header h3 {
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

.clear-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  border-radius: 8px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.clear-btn svg {
  width: 16px;
  height: 16px;
}

.activity-list {
  flex: 1;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
  animation: slideIn 0.3s ease-out;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateX(4px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.activity-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.user-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 10px;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  /* Keeping overflow: hidden for text truncation with ellipsis - this is intentional */
  text-overflow: ellipsis;
}

.activity-description {
  font-size: 13px;
  color: #555;
  margin-bottom: 4px;
  line-height: 1.4;
}

.activity-time {
  font-size: 11px;
  color: #999;
}

/* Activity type specific colors */
.activity-user_joined .activity-icon {
  background: rgba(16, 185, 129, 0.1);
}

.activity-user_left .activity-icon {
  background: rgba(239, 68, 68, 0.1);
}

.activity-object_added .activity-icon {
  background: rgba(59, 130, 246, 0.1);
}

.activity-object_modified .activity-icon {
  background: rgba(245, 158, 11, 0.1);
}

.activity-object_deleted .activity-icon {
  background: rgba(239, 68, 68, 0.1);
}

.activity-comment_added .activity-icon {
  background: rgba(139, 92, 246, 0.1);
}

.activity-comment_resolved .activity-icon {
  background: rgba(16, 185, 129, 0.1);
}

.activity-background_changed .activity-icon {
  background: rgba(236, 72, 153, 0.1);
}

.activity-layer_reordered .activity-icon {
  background: rgba(59, 130, 246, 0.1);
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #666;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state p {
  margin: 0 0 4px 0;
  font-weight: 600;
  font-size: 14px;
}

.empty-state span {
  font-size: 12px;
  opacity: 0.7;
}

.load-more {
  text-align: center;
  padding: 12px 0;
}

.load-more-btn {
  padding: 8px 20px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: #3b82f6;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

/* Scrollbar styling */
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>

