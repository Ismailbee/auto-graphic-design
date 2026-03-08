/**
 * Admin API Service
 * API calls for admin dashboard
 */

import type {
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
  AdminUser,
  UserFilters,
  AdminTemplate,
  TemplateFilters,
  Transaction,
  PaymentFilters,
  UserGrowthData,
  RevenueData,
  PlanDistribution,
  TemplateUsageData,
  PopularTemplate,
  AnalyticsDateRange,
  ServerHealth,
  SystemLog,
  LogFilters,
  BackgroundJob,
  PricingPlan,
  AdminSettings
} from '@/types/admin'

const API_BASE_URL = 'http://localhost:3006/api/admin'

/**
 * Helper function to get auth headers
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

/**
 * Helper function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json()
}

// ============================================================
// Dashboard APIs
// ============================================================

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    headers: getAuthHeaders()
  })
  return handleResponse<DashboardStats>(response)
}

// ============================================================
// User Management APIs
// ============================================================

export async function getUsers(filters: UserFilters): Promise<PaginatedResponse<AdminUser>> {
  const params = new URLSearchParams()
  if (filters.search) params.append('search', filters.search)
  if (filters.role && filters.role !== 'all') params.append('role', filters.role)
  if (filters.status && filters.status !== 'all') params.append('status', filters.status)
  if (filters.plan && filters.plan !== 'all') params.append('plan', filters.plan)
  params.append('page', filters.page.toString())
  params.append('limit', filters.limit.toString())

  const response = await fetch(`${API_BASE_URL}/users?${params}`, {
    headers: getAuthHeaders()
  })
  return handleResponse<PaginatedResponse<AdminUser>>(response)
}

export async function getUserDetails(userId: string): Promise<ApiResponse<AdminUser>> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: getAuthHeaders()
  })
  return handleResponse<AdminUser>(response)
}

export async function updateUser(userId: string, updates: Partial<AdminUser>): Promise<ApiResponse<AdminUser>> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  })
  return handleResponse<AdminUser>(response)
}

export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return handleResponse<void>(response)
}

export async function suspendUser(userId: string, reason: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/suspend`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason })
  })
  return handleResponse<void>(response)
}

export async function resetUserPassword(userId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  return handleResponse<void>(response)
}

// ============================================================
// Template Management APIs
// ============================================================

export async function getTemplates(filters: TemplateFilters): Promise<PaginatedResponse<AdminTemplate>> {
  const params = new URLSearchParams()
  if (filters.search) params.append('search', filters.search)
  if (filters.category && filters.category !== 'all') params.append('category', filters.category)
  if (filters.status && filters.status !== 'all') params.append('status', filters.status)
  if (filters.accessLevel && filters.accessLevel !== 'all') params.append('accessLevel', filters.accessLevel)
  params.append('page', filters.page.toString())
  params.append('limit', filters.limit.toString())

  const response = await fetch(`${API_BASE_URL}/templates?${params}`, {
    headers: getAuthHeaders()
  })
  return handleResponse<PaginatedResponse<AdminTemplate>>(response)
}

export async function getPendingTemplates(): Promise<ApiResponse<AdminTemplate[]>> {
  const response = await fetch(`${API_BASE_URL}/templates/pending`, {
    headers: getAuthHeaders()
  })
  return handleResponse<AdminTemplate[]>(response)
}

export async function getTemplateDetails(templateId: string): Promise<ApiResponse<AdminTemplate>> {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
    headers: getAuthHeaders()
  })
  return handleResponse<AdminTemplate>(response)
}

export async function updateTemplate(templateId: string, updates: Partial<AdminTemplate>): Promise<ApiResponse<AdminTemplate>> {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  })
  return handleResponse<AdminTemplate>(response)
}

export async function approveTemplate(templateId: string, feedback?: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ feedback })
  })
  return handleResponse<void>(response)
}

export async function rejectTemplate(templateId: string, reason: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason })
  })
  return handleResponse<void>(response)
}

export async function deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return handleResponse<void>(response)
}

// ============================================================
// Payment Management APIs
// ============================================================

export async function getPayments(filters: PaymentFilters): Promise<PaginatedResponse<Transaction>> {
  const params = new URLSearchParams()
  if (filters.search) params.append('search', filters.search)
  if (filters.status && filters.status !== 'all') params.append('status', filters.status)
  if (filters.plan && filters.plan !== 'all') params.append('plan', filters.plan)
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.append('dateTo', filters.dateTo)
  params.append('page', filters.page.toString())
  params.append('limit', filters.limit.toString())

  const response = await fetch(`${API_BASE_URL}/payments?${params}`, {
    headers: getAuthHeaders()
  })
  return handleResponse<PaginatedResponse<Transaction>>(response)
}

export async function getPaymentDetails(transactionId: string): Promise<ApiResponse<Transaction>> {
  const response = await fetch(`${API_BASE_URL}/payments/${transactionId}`, {
    headers: getAuthHeaders()
  })
  return handleResponse<Transaction>(response)
}

export async function refundPayment(transactionId: string, reason: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/payments/${transactionId}/refund`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason })
  })
  return handleResponse<void>(response)
}

// ============================================================
// Analytics APIs
// ============================================================

export async function getUserGrowthData(dateRange: AnalyticsDateRange): Promise<ApiResponse<UserGrowthData[]>> {
  const params = new URLSearchParams()
  params.append('from', dateRange.from)
  params.append('to', dateRange.to)
  params.append('period', dateRange.period)

  const response = await fetch(`${API_BASE_URL}/analytics/users?${params}`, {
    headers: getAuthHeaders()
  })
  return handleResponse<UserGrowthData[]>(response)
}

export async function getRevenueData(dateRange: AnalyticsDateRange): Promise<ApiResponse<RevenueData[]>> {
  const params = new URLSearchParams()
  params.append('from', dateRange.from)
  params.append('to', dateRange.to)
  params.append('period', dateRange.period)

  const response = await fetch(`${API_BASE_URL}/analytics/revenue?${params}`, {
    headers: getAuthHeaders()
  })
  return handleResponse<RevenueData[]>(response)
}

export async function getPlanDistribution(): Promise<ApiResponse<PlanDistribution[]>> {
  const response = await fetch(`${API_BASE_URL}/analytics/plans`, {
    headers: getAuthHeaders()
  })
  return handleResponse<PlanDistribution[]>(response)
}

export async function getTemplateUsage(): Promise<ApiResponse<TemplateUsageData[]>> {
  const response = await fetch(`${API_BASE_URL}/analytics/templates`, {
    headers: getAuthHeaders()
  })
  return handleResponse<TemplateUsageData[]>(response)
}

export async function getPopularTemplates(): Promise<ApiResponse<PopularTemplate[]>> {
  const response = await fetch(`${API_BASE_URL}/analytics/popular-templates`, {
    headers: getAuthHeaders()
  })
  return handleResponse<PopularTemplate[]>(response)
}

// ============================================================
// System Monitoring APIs
// ============================================================

export async function getSystemHealth(): Promise<ApiResponse<ServerHealth>> {
  const response = await fetch(`${API_BASE_URL}/system/health`, {
    headers: getAuthHeaders()
  })
  return handleResponse<ServerHealth>(response)
}

export async function getSystemLogs(filters: LogFilters): Promise<ApiResponse<SystemLog[]>> {
  const params = new URLSearchParams()
  if (filters.level && filters.level !== 'all') params.append('level', filters.level)
  if (filters.search) params.append('search', filters.search)
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.append('dateTo', filters.dateTo)
  params.append('page', filters.page.toString())
  params.append('limit', filters.limit.toString())

  const response = await fetch(`${API_BASE_URL}/system/logs?${params}`, {
    headers: getAuthHeaders()
  })
  return handleResponse<SystemLog[]>(response)
}

export async function getBackgroundJobs(): Promise<ApiResponse<BackgroundJob[]>> {
  const response = await fetch(`${API_BASE_URL}/system/jobs`, {
    headers: getAuthHeaders()
  })
  return handleResponse<BackgroundJob[]>(response)
}

export async function retryJob(jobId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/system/jobs/${jobId}/retry`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  return handleResponse<void>(response)
}

// ============================================================
// Settings APIs
// ============================================================

export async function getPricingPlans(): Promise<ApiResponse<PricingPlan[]>> {
  const response = await fetch(`${API_BASE_URL}/pricing`, {
    headers: getAuthHeaders()
  })
  return handleResponse<PricingPlan[]>(response)
}

export async function updatePricingPlans(plans: PricingPlan[]): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/pricing`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ plans })
  })
  return handleResponse<void>(response)
}

export async function getAdminSettings(): Promise<ApiResponse<AdminSettings>> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    headers: getAuthHeaders()
  })
  return handleResponse<AdminSettings>(response)
}

export async function updateAdminSettings(settings: Partial<AdminSettings>): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings)
  })
  return handleResponse<void>(response)
}

