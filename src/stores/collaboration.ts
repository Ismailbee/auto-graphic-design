import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collaborationSocket } from '@/services/socket/collaboration-socket'
import { CollaborationEvent } from '@/types/collaboration'
import type {
  CollaboratorUser,
  RemoteCursor,
  Comment,
  ActivityLogEntry,
  UserRole,
  CanvasUpdatePayload,
  CursorMovePayload,
  CommentPayload,
  UserPresencePayload,
} from '@/types/collaboration'

export const useCollaborationStore = defineStore('collaboration', () => {
  // State
  const isConnected = ref(false)
  const currentProjectId = ref<string | null>(null)
  const currentUser = ref<CollaboratorUser | null>(null)
  const activeUsers = ref<Map<string, CollaboratorUser>>(new Map())
  const remoteCursors = ref<Map<string, RemoteCursor>>(new Map())
  const comments = ref<Comment[]>([])
  const activityLog = ref<ActivityLogEntry[]>([])
  const userRole = ref<UserRole | null>(null)
  const isInitialized = ref(false)

  // Computed
  const activeUsersList = computed(() => Array.from(activeUsers.value.values()))
  const remoteCursorsList = computed(() => Array.from(remoteCursors.value.values()))
  const unresolvedComments = computed(() => comments.value.filter(c => !c.resolved))
  const myComments = computed(() => 
    comments.value.filter(c => c.userId === currentUser.value?.id)
  )
  const mentionedComments = computed(() =>
    comments.value.filter(c => 
      currentUser.value && c.mentions.includes(currentUser.value.id)
    )
  )

  const canEdit = computed(() => {
    return userRole.value === 'owner' || userRole.value === 'editor'
  })

  const canManageCollaborators = computed(() => {
    return userRole.value === 'owner'
  })

  // Actions
  async function initialize(serverUrl?: string) {
    if (isInitialized.value) return

    try {
      await collaborationSocket.connect(serverUrl)
      isConnected.value = true
      setupEventListeners()
      isInitialized.value = true
      console.log('✅ Collaboration initialized')
    } catch (error) {
      console.error('❌ Failed to initialize collaboration:', error)
      throw error
    }
  }

  function setupEventListeners() {
    // Connection events
    collaborationSocket.on(CollaborationEvent.CONNECT, () => {
      isConnected.value = true
      console.log('✅ Connected to collaboration server')
      
      // Re-join project if we were in one
      if (currentProjectId.value && currentUser.value) {
        joinProject(currentProjectId.value, currentUser.value)
      }
    })

    collaborationSocket.on(CollaborationEvent.DISCONNECT, () => {
      isConnected.value = false
      console.warn('⚠️ Disconnected from collaboration server')
    })

    // User presence
    collaborationSocket.on(CollaborationEvent.USER_JOIN, (payload: UserPresencePayload) => {
      const user: CollaboratorUser = {
        id: payload.userId,
        name: payload.userName,
        email: '', // Will be populated from API
        avatar: payload.userAvatar,
        color: payload.color,
        role: payload.role,
        isOnline: true,
      }
      
      activeUsers.value.set(payload.userId, user)
      
      // Add activity log
      addActivityLog({
        id: `activity-${Date.now()}`,
        projectId: payload.projectId,
        userId: payload.userId,
        userName: payload.userName,
        userAvatar: payload.userAvatar,
        action: 'user_joined',
        timestamp: new Date(),
      })
      
      console.log(`👤 User joined: ${payload.userName}`)
    })

    collaborationSocket.on(CollaborationEvent.USER_LEAVE, (payload: UserPresencePayload) => {
      activeUsers.value.delete(payload.userId)
      remoteCursors.value.delete(payload.userId)
      
      // Add activity log
      addActivityLog({
        id: `activity-${Date.now()}`,
        projectId: payload.projectId,
        userId: payload.userId,
        userName: payload.userName,
        userAvatar: payload.userAvatar,
        action: 'user_left',
        timestamp: new Date(),
      })
      
      console.log(`👤 User left: ${payload.userName}`)
    })

    collaborationSocket.on(CollaborationEvent.USER_LIST, (users: CollaboratorUser[]) => {
      activeUsers.value.clear()
      users.forEach(user => {
        if (user.id !== currentUser.value?.id) {
          activeUsers.value.set(user.id, user)
        }
      })
      console.log(`👥 Active users: ${users.length}`)
    })

    // Cursor tracking
    collaborationSocket.on(CollaborationEvent.CURSOR_MOVE, (payload: CursorMovePayload) => {
      // Don't show our own cursor
      if (payload.userId === currentUser.value?.id) return

      remoteCursors.value.set(payload.userId, {
        userId: payload.userId,
        userName: payload.userName,
        color: payload.color,
        x: payload.x,
        y: payload.y,
        timestamp: payload.timestamp,
      })
    })

    collaborationSocket.on(CollaborationEvent.CURSOR_HIDE, (data: { userId: string }) => {
      remoteCursors.value.delete(data.userId)
    })

    // Canvas updates - will be handled by whiteboard store
    collaborationSocket.on(CollaborationEvent.CANVAS_UPDATE, (payload: CanvasUpdatePayload) => {
      // This will be handled by the whiteboard store
      console.log('📝 Canvas update received:', payload)
    })

    // Comments
    collaborationSocket.on(CollaborationEvent.COMMENT_ADD, (payload: CommentPayload) => {
      comments.value.push(payload.comment)
      
      addActivityLog({
        id: `activity-${Date.now()}`,
        projectId: payload.projectId,
        userId: payload.comment.userId,
        userName: payload.comment.userName,
        userAvatar: payload.comment.userAvatar,
        action: 'comment_added',
        targetType: 'comment',
        targetId: payload.comment.id,
        timestamp: new Date(),
      })
    })

    collaborationSocket.on(CollaborationEvent.COMMENT_UPDATE, (payload: CommentPayload) => {
      const index = comments.value.findIndex(c => c.id === payload.comment.id)
      if (index !== -1) {
        comments.value[index] = payload.comment
      }
    })

    collaborationSocket.on(CollaborationEvent.COMMENT_DELETE, (payload: CommentPayload) => {
      const index = comments.value.findIndex(c => c.id === payload.comment.id)
      if (index !== -1) {
        comments.value.splice(index, 1)
      }
    })

    collaborationSocket.on(CollaborationEvent.COMMENT_RESOLVE, (payload: CommentPayload) => {
      const comment = comments.value.find(c => c.id === payload.comment.id)
      if (comment) {
        comment.resolved = true
        
        addActivityLog({
          id: `activity-${Date.now()}`,
          projectId: payload.projectId,
          userId: payload.comment.userId,
          userName: payload.comment.userName,
          userAvatar: payload.comment.userAvatar,
          action: 'comment_resolved',
          targetType: 'comment',
          targetId: payload.comment.id,
          timestamp: new Date(),
        })
      }
    })

    // Activity log
    collaborationSocket.on(CollaborationEvent.ACTIVITY_LOG, (entry: ActivityLogEntry) => {
      addActivityLog(entry)
    })
  }

  function joinProject(projectId: string, user: CollaboratorUser) {
    currentProjectId.value = projectId
    currentUser.value = user
    userRole.value = user.role
    
    collaborationSocket.joinProject(projectId, user)
  }

  function leaveProject() {
    if (currentProjectId.value) {
      collaborationSocket.leaveProject(currentProjectId.value)
    }
    
    currentProjectId.value = null
    currentUser.value = null
    userRole.value = null
    activeUsers.value.clear()
    remoteCursors.value.clear()
    comments.value = []
    activityLog.value = []
  }

  function updateCursorPosition(x: number, y: number) {
    collaborationSocket.broadcastCursorMove(x, y)
  }

  function hideCursor() {
    collaborationSocket.hideCursor()
  }

  function addComment(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!currentProjectId.value) return

    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const payload: CommentPayload = {
      projectId: currentProjectId.value,
      comment: newComment,
      action: 'add',
    }

    collaborationSocket.addComment(payload)
  }

  function resolveComment(commentId: string) {
    const comment = comments.value.find(c => c.id === commentId)
    if (!comment || !currentProjectId.value) return

    comment.resolved = true

    const payload: CommentPayload = {
      projectId: currentProjectId.value,
      comment,
      action: 'resolve',
    }

    collaborationSocket.resolveComment(payload)
  }

  function addActivityLog(entry: ActivityLogEntry) {
    activityLog.value.unshift(entry)
    
    // Keep only last 100 entries
    if (activityLog.value.length > 100) {
      activityLog.value = activityLog.value.slice(0, 100)
    }
  }

  function cleanup() {
    leaveProject()
    collaborationSocket.disconnect()
    isInitialized.value = false
    isConnected.value = false
  }

  return {
    // State
    isConnected,
    currentProjectId,
    currentUser,
    activeUsers,
    remoteCursors,
    comments,
    activityLog,
    userRole,
    isInitialized,
    
    // Computed
    activeUsersList,
    remoteCursorsList,
    unresolvedComments,
    myComments,
    mentionedComments,
    canEdit,
    canManageCollaborators,
    
    // Actions
    initialize,
    joinProject,
    leaveProject,
    updateCursorPosition,
    hideCursor,
    addComment,
    resolveComment,
    addActivityLog,
    cleanup,
  }
})

