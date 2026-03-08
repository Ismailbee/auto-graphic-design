/**
 * Admin Dashboard Type Definitions
 */

// User Management Types
export type UserRole = 'user' | 'designer' | 'moderator' | 'admin'
export type UserStatus = 'active' | 'suspended' | 'banned'
export type UserPlan = 'free' | 'standard' | 'pro'

export interface AdminUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  status: UserStatus
  plan: UserPlan
  joinedDate: string
  lastActive: string
  designsCreated: number
  templatesUploaded: number
  totalSpent: number
}

export interface UserActivity {
  id: string
  userId: string
  type: 'design_created' | 'template_uploaded' | 'purchase' | 'login' | 'logout'
  description: string
  timestamp: string
  metadata?: any
}

// Template Management Types
export type TemplateStatus = 'published' | 'draft' | 'pending' | 'rejected'
export type TemplateAccessLevel = 'free' | 'premium' | 'exclusive'

export interface AdminTemplate {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  creator: {
    id: string
    name: string
    email: string
  }
  status: TemplateStatus
  accessLevel: TemplateAccessLevel
  price: number
  downloads: number
  likes: number
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string
  fileUrl?: string
}

export interface TemplateApproval {
  templateId: string
  action: 'approve' | 'reject'
  reason?: string
  feedback?: string
}

// Payment & Transaction Types
export type TransactionStatus = 'success' | 'failed' | 'refunded' | 'pending'
export type PaymentMethod = 'card' | 'paypal' | 'bank_transfer'

export interface Transaction {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  currency: string
  plan: UserPlan
  status: TransactionStatus
  paymentMethod: PaymentMethod
  transactionDate: string
  refundedAt?: string
  refundReason?: string
}

export interface Subscription {
  id: string
  userId: string
  plan: UserPlan
  status: 'active' | 'cancelled' | 'expired'
  startDate: string
  endDate: string
  autoRenew: boolean
  price: number
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  limits: {
    designs: number
    storage: number // in MB
    exports: number
    aiCredits: number
  }
}

// Analytics Types
export interface AnalyticsOverview {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  totalDesigns: number
  newUsersToday: number
  revenueToday: number
  designsToday: number
  conversionRate: number
}

export interface UserGrowthData {
  date: string
  newUsers: number
  activeUsers: number
  churnedUsers: number
}

export interface RevenueData {
  date: string
  amount: number
  plan: UserPlan
}

export interface TemplateUsageData {
  category: string
  downloads: number
  revenue: number
}

export interface FeatureUsageData {
  feature: string
  usageCount: number
  uniqueUsers: number
}

// System Monitoring Types
export interface SystemHealth {
  cpu: number // percentage
  memory: number // percentage
  disk: number // percentage
  apiResponseTime: number // milliseconds
  activeConnections: number
  uptime: number // seconds
  status: 'healthy' | 'warning' | 'critical'
}

export interface ErrorLog {
  id: string
  timestamp: string
  severity: 'error' | 'warning' | 'info'
  message: string
  stackTrace?: string
  userId?: string
  endpoint?: string
  userAgent?: string
}

export interface BackgroundJob {
  id: string
  type: 'export' | 'ai_render' | 'email' | 'cleanup'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number // 0-100
  startedAt?: string
  completedAt?: string
  error?: string
  metadata?: any
}

// Admin Settings Types
export interface AdminSettings {
  siteName: string
  siteUrl: string
  supportEmail: string
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
  maxUploadSize: number // in MB
  enableAI: boolean
  defaultUserPlan: UserPlan
  sessionTimeout: number // in minutes
}

// Admin State
export interface AdminState {
  isAuthenticated: boolean
  adminUser: AdminUser | null
  users: AdminUser[]
  templates: AdminTemplate[]
  pendingTemplates: AdminTemplate[]
  transactions: Transaction[]
  analytics: AnalyticsOverview | null
  systemHealth: SystemHealth | null
  settings: AdminSettings | null
  loading: boolean
  error: string | null
}

// API Request/Response Types
export interface PaginatedRequest {
  page: number
  limit: number
  search?: string
  filters?: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Filter Types
export interface UserFilters {
  role?: UserRole
  status?: UserStatus
  plan?: UserPlan
  search?: string
}

export interface TemplateFilters {
  category?: string
  status?: TemplateStatus
  accessLevel?: TemplateAccessLevel
  search?: string
}

export interface TransactionFilters {
  status?: TransactionStatus
  plan?: UserPlan
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Audit Log Types
export interface AuditLog {
  id: string
  adminId: string
  adminName: string
  action: string
  targetType: 'user' | 'template' | 'payment' | 'system'
  targetId?: string
  changes?: Record<string, any>
  timestamp: string
  ipAddress?: string
}

// Dashboard Stats Card
export interface StatCard {
  title: string
  value: string | number
  change: number // percentage change
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: string
  color: string
}

// Chart Data Types
export interface ChartDataPoint {
  label: string
  value: number
}

export interface LineChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}

export interface PieChartData {
  labels: string[]
  datasets: {
    data: number[]
    backgroundColor: string[]
  }[]
}

// Navigation Types
export interface AdminNavItem {
  id: string
  label: string
  icon: string
  route: string
  badge?: number
  children?: AdminNavItem[]
}

// Bulk Action Types
export type BulkAction = 'suspend' | 'delete' | 'export' | 'approve' | 'reject'

export interface BulkActionRequest {
  action: BulkAction
  ids: string[]
  reason?: string
}

// Export Types
export type ExportFormat = 'csv' | 'xlsx' | 'pdf'

export interface ExportRequest {
  type: 'users' | 'templates' | 'transactions' | 'analytics'
  format: ExportFormat
  filters?: Record<string, any>
  dateRange?: {
    from: string
    to: string
  }
}

// Notification Types
export interface AdminNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

// Constants
export const USER_ROLES: Record<UserRole, { label: string; color: string }> = {
  user: { label: 'User', color: '#6b7280' },
  designer: { label: 'Designer', color: '#8b5cf6' },
  moderator: { label: 'Moderator', color: '#f59e0b' },
  admin: { label: 'Admin', color: '#ef4444' }
}

export const USER_STATUSES: Record<UserStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: '#10b981' },
  suspended: { label: 'Suspended', color: '#f59e0b' },
  banned: { label: 'Banned', color: '#ef4444' }
}

export const USER_PLANS: Record<UserPlan, { label: string; color: string }> = {
  free: { label: 'Free', color: '#6b7280' },
  standard: { label: 'Standard', color: '#3b82f6' },
  pro: { label: 'Pro', color: '#8b5cf6' }
}

export const TEMPLATE_STATUSES: Record<TemplateStatus, { label: string; color: string }> = {
  published: { label: 'Published', color: '#10b981' },
  draft: { label: 'Draft', color: '#6b7280' },
  pending: { label: 'Pending', color: '#f59e0b' },
  rejected: { label: 'Rejected', color: '#ef4444' }
}

export const TRANSACTION_STATUSES: Record<TransactionStatus, { label: string; color: string }> = {
  success: { label: 'Success', color: '#10b981' },
  failed: { label: 'Failed', color: '#ef4444' },
  refunded: { label: 'Refunded', color: '#f59e0b' },
  pending: { label: 'Pending', color: '#6b7280' }
}

