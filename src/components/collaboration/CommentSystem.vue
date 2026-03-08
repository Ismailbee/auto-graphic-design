<template>
  <div class="comment-system">
    <!-- Comment Markers on Canvas -->
    <div class="comment-markers">
      <div
        v-for="comment in visibleComments"
        :key="comment.id"
        class="comment-marker"
        :style="{
          left: `${comment.x}px`,
          top: `${comment.y}px`,
        }"
        :class="{ resolved: comment.resolved }"
        @click="openComment(comment.id)"
      >
        <div class="marker-icon">
          <svg v-if="!comment.resolved" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <svg v-else fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="marker-count">{{ comment.replies.length + 1 }}</div>
      </div>
    </div>

    <!-- Comments Sidebar -->
    <Teleport to="body">
      <div v-if="showSidebar" class="comments-sidebar">
        <div class="sidebar-header">
          <h3>Comments</h3>
          <button @click="closeSidebar" class="close-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button
            :class="{ active: filter === 'all' }"
            @click="filter = 'all'"
          >
            All ({{ comments.length }})
          </button>
          <button
            :class="{ active: filter === 'unresolved' }"
            @click="filter = 'unresolved'"
          >
            Open ({{ unresolvedComments.length }})
          </button>
          <button
            :class="{ active: filter === 'mentions' }"
            @click="filter = 'mentions'"
          >
            Mentions ({{ mentionedComments.length }})
          </button>
        </div>

        <!-- Comments List -->
        <div class="comments-list">
          <div
            v-for="comment in filteredComments"
            :key="comment.id"
            class="comment-thread"
            :class="{ active: activeCommentId === comment.id }"
          >
            <!-- Main Comment -->
            <div class="comment-item">
              <div class="comment-avatar" :style="{ backgroundColor: getUserColor(comment.userId) }">
                {{ comment.userName?.charAt(0).toUpperCase() }}
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.userName }}</span>
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
                <div class="comment-text" v-html="formatCommentText(comment.content)"></div>
                
                <!-- Comment Actions -->
                <div class="comment-actions">
                  <button @click="toggleReply(comment.id)" class="action-btn">
                    Reply
                  </button>
                  <button
                    v-if="!comment.resolved && canEdit"
                    @click="resolveComment(comment.id)"
                    class="action-btn"
                  >
                    Resolve
                  </button>
                  <button
                    v-if="comment.userId === currentUser?.id"
                    @click="deleteComment(comment.id)"
                    class="action-btn danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <!-- Replies -->
            <div v-if="comment.replies.length > 0" class="replies">
              <div
                v-for="reply in comment.replies"
                :key="reply.id"
                class="comment-item reply"
              >
                <div class="comment-avatar" :style="{ backgroundColor: getUserColor(reply.userId) }">
                  {{ reply.userName?.charAt(0).toUpperCase() }}
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ reply.userName }}</span>
                    <span class="comment-time">{{ formatTime(reply.createdAt) }}</span>
                  </div>
                  <div class="comment-text" v-html="formatCommentText(reply.content)"></div>
                </div>
              </div>
            </div>

            <!-- Reply Input -->
            <div v-if="replyingTo === comment.id" class="reply-input">
              <textarea
                v-model="replyText"
                placeholder="Write a reply... (use @ to mention)"
                @keydown.enter.ctrl="submitReply(comment.id)"
                @input="handleMentionInput"
                rows="2"
              ></textarea>
              <div class="reply-actions">
                <button @click="cancelReply" class="btn-secondary">Cancel</button>
                <button @click="submitReply(comment.id)" class="btn-primary">Reply</button>
              </div>
            </div>
          </div>

          <div v-if="filteredComments.length === 0" class="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No comments yet</p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add Comment Mode Indicator -->
    <div v-if="isAddingComment" class="add-comment-indicator">
      <p>Click on the canvas to place a comment</p>
      <button @click="cancelAddComment" class="btn-secondary">Cancel</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCollaborationStore } from '@/stores/collaboration'
import { storeToRefs } from 'pinia'
import type { Comment } from '@/types/collaboration'
import { USER_COLORS } from '@/types/collaboration'

const collaborationStore = useCollaborationStore()
const {
  comments,
  unresolvedComments,
  mentionedComments,
  currentUser,
  canEdit,
} = storeToRefs(collaborationStore)

const showSidebar = ref(false)
const filter = ref<'all' | 'unresolved' | 'mentions'>('all')
const activeCommentId = ref<string | null>(null)
const replyingTo = ref<string | null>(null)
const replyText = ref('')
const isAddingComment = ref(false)

const emit = defineEmits<{
  'add-comment': [x: number, y: number]
  'comment-clicked': [commentId: string]
}>()

const filteredComments = computed(() => {
  switch (filter.value) {
    case 'unresolved':
      return unresolvedComments.value
    case 'mentions':
      return mentionedComments.value
    default:
      return comments.value
  }
})

const visibleComments = computed(() => {
  return comments.value.filter(c => !c.resolved || filter.value === 'all')
})

function openComment(commentId: string) {
  activeCommentId.value = commentId
  showSidebar.value = true
  emit('comment-clicked', commentId)
}

function closeSidebar() {
  showSidebar.value = false
  activeCommentId.value = null
}

function toggleReply(commentId: string) {
  replyingTo.value = replyingTo.value === commentId ? null : commentId
  replyText.value = ''
}

function cancelReply() {
  replyingTo.value = null
  replyText.value = ''
}

function submitReply(commentId: string) {
  if (!replyText.value.trim()) return

  // TODO: Implement reply submission
  console.log('Submit reply to', commentId, replyText.value)
  
  replyText.value = ''
  replyingTo.value = null
}

function resolveComment(commentId: string) {
  collaborationStore.resolveComment(commentId)
}

function deleteComment(commentId: string) {
  // TODO: Implement delete
  console.log('Delete comment', commentId)
}

function handleMentionInput(e: Event) {
  const text = (e.target as HTMLTextAreaElement).value
  // TODO: Implement @mention autocomplete
  if (text.includes('@')) {
    console.log('Show mention suggestions')
  }
}

function formatCommentText(text: string): string {
  // Escape HTML and convert @mentions to highlighted spans
  const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(/@(\w+)/g, '<span class="mention">@$1</span>')
}

function getUserColor(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return USER_COLORS[hash % USER_COLORS.length]
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'
  return new Date(date).toLocaleDateString()
}

function startAddComment() {
  isAddingComment.value = true
}

function cancelAddComment() {
  isAddingComment.value = false
}

defineExpose({
  showSidebar: () => showSidebar.value = true,
  startAddComment,
})
</script>

<style scoped>
.comment-markers {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
}

.comment-marker {
  position: absolute;
  width: 32px;
  height: 32px;
  pointer-events: all;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: transform 0.2s;
}

.comment-marker:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.marker-icon {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.comment-marker.resolved .marker-icon {
  background: #10b981;
}

.marker-icon svg {
  width: 18px;
  height: 18px;
}

.marker-count {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
}

.comments-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 20px;
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
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.filter-tabs button {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tabs button.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.comment-thread {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.comment-thread.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-item.reply {
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid rgba(0, 0, 0, 0.1);
}

.comment-avatar {
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

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 600;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #666;
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
  word-wrap: break-word;
}

.comment-text :deep(.mention) {
  color: #3b82f6;
  font-weight: 600;
}

.comment-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #3b82f6;
}

.action-btn.danger:hover {
  color: #ef4444;
}

.reply-input {
  margin-top: 12px;
  padding-left: 48px;
}

.reply-input textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 8px;
}

.reply-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-secondary,
.btn-primary {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover {
  background: #2563eb;
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
  opacity: 0.5;
}

.add-comment-indicator {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(59, 130, 246, 0.95);
  backdrop-filter: blur(10px);
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  z-index: 10001;
  display: flex;
  align-items: center;
  gap: 16px;
}

.add-comment-indicator p {
  margin: 0;
  font-weight: 600;
}

.add-comment-indicator .btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
</style>

