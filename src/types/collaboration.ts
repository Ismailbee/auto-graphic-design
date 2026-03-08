// Collaboration Types and Interfaces

export type UserRole = 'owner' | 'editor' | 'viewer'

export interface CollaboratorUser {
  id: string
  name: string
  email: string
  avatar?: string
  color: string // Unique color for cursor and presence
  role: UserRole
  isOnline: boolean
  lastSeen?: Date
}

export interface RemoteCursor {
  userId: string
  userName: string
  color: string
  x: number
  y: number
  timestamp: number
}

export interface Comment {
  id: string
  projectId: string
  userId: string
  userName: string
  userAvatar?: string
  x: number // Canvas position
  y: number // Canvas position
  content: string
  mentions: string[] // Array of mentioned user IDs
  replies: CommentReply[]
  resolved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CommentReply {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  mentions: string[]
  createdAt: Date
}

export interface ActivityLogEntry {
  id: string
  projectId: string
  userId: string
  userName: string
  userAvatar?: string
  action: ActivityAction
  targetType?: 'text' | 'image' | 'shape' | 'comment'
  targetId?: string
  details?: string
  timestamp: Date
}

export type ActivityAction =
  | 'user_joined'
  | 'user_left'
  | 'object_added'
  | 'object_modified'
  | 'object_deleted'
  | 'comment_added'
  | 'comment_resolved'
  | 'background_changed'
  | 'layer_reordered'

export interface ProjectCollaboration {
  projectId: string
  owner: CollaboratorUser
  collaborators: CollaboratorUser[]
  activeUsers: string[] // User IDs currently online
  permissions: Record<string, UserRole>
}

// WebSocket Event Payloads
export interface CanvasUpdatePayload {
  projectId: string
  userId: string
  updateType: 'add' | 'update' | 'delete'
  objectType: 'text' | 'image' | 'shape'
  objectId: string
  data: any
  timestamp: number
}

export interface CursorMovePayload {
  projectId: string
  userId: string
  userName: string
  color: string
  x: number
  y: number
  timestamp: number
}

export interface CommentPayload {
  projectId: string
  comment: Comment
  action: 'add' | 'update' | 'delete' | 'resolve'
}

export interface UserPresencePayload {
  projectId: string
  userId: string
  userName: string
  userAvatar?: string
  color: string
  role: UserRole
  action: 'join' | 'leave'
}

export interface ChatMessagePayload {
  projectId: string
  userId: string
  userName: string
  userAvatar?: string
  message: string
  timestamp: Date
}

// WebSocket Events
export enum CollaborationEvent {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_PROJECT = 'project:join',
  LEAVE_PROJECT = 'project:leave',
  
  // Canvas updates
  CANVAS_UPDATE = 'canvas:update',
  CANVAS_SYNC_REQUEST = 'canvas:sync:request',
  CANVAS_SYNC_RESPONSE = 'canvas:sync:response',
  
  // Cursor tracking
  CURSOR_MOVE = 'cursor:move',
  CURSOR_HIDE = 'cursor:hide',
  
  // Comments
  COMMENT_ADD = 'comment:add',
  COMMENT_UPDATE = 'comment:update',
  COMMENT_DELETE = 'comment:delete',
  COMMENT_RESOLVE = 'comment:resolve',
  
  // User presence
  USER_JOIN = 'user:join',
  USER_LEAVE = 'user:leave',
  USER_LIST = 'user:list',
  
  // Activity
  ACTIVITY_LOG = 'activity:log',
  
  // Chat (optional)
  CHAT_MESSAGE = 'chat:message',
  
  // Errors
  ERROR = 'error'
}

// Collaboration State
export interface CollaborationState {
  isConnected: boolean
  currentProjectId: string | null
  currentUser: CollaboratorUser | null
  activeUsers: Map<string, CollaboratorUser>
  remoteCursors: Map<string, RemoteCursor>
  comments: Comment[]
  activityLog: ActivityLogEntry[]
  permissions: UserRole | null
}

// Invitation
export interface CollaborationInvite {
  id: string
  projectId: string
  projectName: string
  invitedBy: string
  invitedByName: string
  invitedEmail: string
  role: UserRole
  token: string
  expiresAt: Date
  createdAt: Date
  status: 'pending' | 'accepted' | 'declined' | 'expired'
}

// API Request/Response Types
export interface InviteCollaboratorRequest {
  projectId: string
  email: string
  role: UserRole
  message?: string
}

export interface UpdateCollaboratorRoleRequest {
  projectId: string
  userId: string
  role: UserRole
}

export interface RemoveCollaboratorRequest {
  projectId: string
  userId: string
}

export interface GetCollaboratorsResponse {
  projectId: string
  owner: CollaboratorUser
  collaborators: CollaboratorUser[]
}

// Utility type for permission checks
export interface PermissionCheck {
  canEdit: boolean
  canComment: boolean
  canManageCollaborators: boolean
  canDelete: boolean
}

// Color palette for user cursors/presence
export const USER_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52B788', // Green
  '#E76F51', // Coral
  '#2A9D8F', // Dark Teal
  '#E9C46A', // Gold
  '#F4A261', // Sandy Brown
  '#264653', // Dark Blue
]

// Helper function to get a random color
export function getRandomUserColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
}

// Helper function to check permissions
export function checkPermissions(role: UserRole | null): PermissionCheck {
  if (!role) {
    return {
      canEdit: false,
      canComment: false,
      canManageCollaborators: false,
      canDelete: false,
    }
  }

  switch (role) {
    case 'owner':
      return {
        canEdit: true,
        canComment: true,
        canManageCollaborators: true,
        canDelete: true,
      }
    case 'editor':
      return {
        canEdit: true,
        canComment: true,
        canManageCollaborators: false,
        canDelete: false,
      }
    case 'viewer':
      return {
        canEdit: false,
        canComment: true,
        canManageCollaborators: false,
        canDelete: false,
      }
    default:
      return {
        canEdit: false,
        canComment: false,
        canManageCollaborators: false,
        canDelete: false,
      }
  }
}

