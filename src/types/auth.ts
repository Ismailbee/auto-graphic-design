/**
 * Authentication Type Definitions
 */

// User Roles
export type UserRole = 'user' | 'designer' | 'moderator' | 'admin'

// User Status
export type UserStatus = 'active' | 'suspended' | 'pending'

// User Interface
export interface User {
  id: string
  email: string
  username?: string
  name?: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  createdAt: string
  updatedAt?: string
  lastLoginAt?: string
}

// Registration Data
export interface RegisterData {
  email: string
  password: string
  username?: string
  firstName?: string
  lastName?: string
}

// Login Data
export interface LoginData {
  email: string
  password: string
  rememberMe?: boolean
}

// Auth Response
export interface AuthResponse {
  message: string
  user: User
  accessToken: string
  refreshToken: string
}

// Token Refresh Response
export interface RefreshResponse {
  accessToken: string
}

// Password Reset Request
export interface PasswordResetRequest {
  email: string
}

// Password Reset Confirm
export interface PasswordResetConfirm {
  token: string
  newPassword: string
}

// Password Change
export interface PasswordChange {
  currentPassword: string
  newPassword: string
}

// Auth State
export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Validation Error
export interface ValidationError {
  msg: string
  param: string
  location: string
}

// API Error Response
export interface ApiErrorResponse {
  message: string
  errors?: ValidationError[]
  error?: string
}

// Auth Modal View
export type AuthModalView = 'login' | 'register' | 'forgot-password' | 'reset-password'

// Auth Modal State
export interface AuthModalState {
  isOpen: boolean
  view: AuthModalView
  resetToken?: string
}

// User Settings Types
export interface UserSettings {
  // Privacy Settings
  privacy: {
    profileVisibility: 'public' | 'private'
    showEmail: boolean
    activityVisibility: 'public' | 'friends' | 'private'
    dataSharing: boolean
  }

  // Notification Settings
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    designComments: boolean
    designLikes: boolean
    newFollowers: boolean
    marketplaceUpdates: boolean
    systemAnnouncements: boolean
  }

  // Preferences
  preferences: {
    language: string
    timezone: string
    theme: 'light' | 'dark' | 'auto'
    autoSave: boolean
    defaultCanvasSize: string
  }
}

// Profile Update Data
export interface ProfileUpdateData {
  name?: string
  username?: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
}

