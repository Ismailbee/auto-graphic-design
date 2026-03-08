/**
 * Admin Store
 * Pinia store for admin dashboard state management
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  AdminState,
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
  AdminSettings,
  PaginationMeta
} from '@/types/admin'
import * as adminApi from '@/services/api/admin-api'

export const useAdminStore = defineStore('admin', () => {
  // ============================================================
  // State
  // ============================================================

  // Dashboard
  const stats = ref<DashboardStats | null>(null)
  const isLoadingStats = ref(false)

  // Users
  const users = ref<AdminUser[]>([])
  const selectedUser = ref<AdminUser | null>(null)
  const userFilters = ref<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    plan: 'all',
    page: 1,
    limit: 20
  })
  const usersPagination = ref<PaginationMeta | null>(null)
  const isLoadingUsers = ref(false)

  // Templates
  const templates = ref<AdminTemplate[]>([])
  const pendingTemplates = ref<AdminTemplate[]>([])
  const selectedTemplate = ref<AdminTemplate | null>(null)
  const templateFilters = ref<TemplateFilters>({
    search: '',
    category: 'all',
    status: 'all',
    accessLevel: 'all',
    page: 1,
    limit: 20
  })
  const templatesPagination = ref<PaginationMeta | null>(null)
  const isLoadingTemplates = ref(false)

  // Payments
  const transactions = ref<Transaction[]>([])
  const selectedTransaction = ref<Transaction | null>(null)
  const paymentFilters = ref<PaymentFilters>({
    search: '',
    status: 'all',
    plan: 'all',
    page: 1,
    limit: 20
  })
  const paymentsPagination = ref<PaginationMeta | null>(null)
  const isLoadingPayments = ref(false)

  // Analytics
  const userGrowthData = ref<UserGrowthData[]>([])
  const revenueData = ref<RevenueData[]>([])
  const planDistribution = ref<PlanDistribution[]>([])
  const templateUsage = ref<TemplateUsageData[]>([])
  const popularTemplates = ref<PopularTemplate[]>([])
  const analyticsDateRange = ref<AnalyticsDateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    period: 'daily'
  })
  const isLoadingAnalytics = ref(false)

  // System
  const serverHealth = ref<ServerHealth | null>(null)
  const systemLogs = ref<SystemLog[]>([])
  const backgroundJobs = ref<BackgroundJob[]>([])
  const logFilters = ref<LogFilters>({
    level: 'all',
    search: '',
    page: 1,
    limit: 50
  })
  const isLoadingSystem = ref(false)

  // Settings
  const pricingPlans = ref<PricingPlan[]>([])
  const adminSettings = ref<AdminSettings | null>(null)
  const isLoadingSettings = ref(false)

  // UI State
  const sidebarCollapsed = ref(true) // Start collapsed by default
  const darkMode = ref(localStorage.getItem('admin-dark-mode') === 'true')
  const error = ref<string | null>(null)

  // ============================================================
  // Computed
  // ============================================================

  const hasError = computed(() => error.value !== null)

  // ============================================================
  // Actions - Dashboard
  // ============================================================

  async function loadDashboardStats() {
    isLoadingStats.value = true
    error.value = null
    
    try {
      const response = await adminApi.getDashboardStats()
      stats.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to load dashboard stats'
      console.error('Error loading dashboard stats:', err)
    } finally {
      isLoadingStats.value = false
    }
  }

  // ============================================================
  // Actions - Users
  // ============================================================

  async function loadUsers() {
    isLoadingUsers.value = true
    error.value = null
    
    try {
      const response = await adminApi.getUsers(userFilters.value)
      users.value = response.data
      usersPagination.value = response.meta
    } catch (err: any) {
      error.value = err.message || 'Failed to load users'
      console.error('Error loading users:', err)
    } finally {
      isLoadingUsers.value = false
    }
  }

  async function loadUserDetails(userId: string) {
    isLoadingUsers.value = true
    error.value = null
    
    try {
      const response = await adminApi.getUserDetails(userId)
      selectedUser.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to load user details'
      console.error('Error loading user details:', err)
    } finally {
      isLoadingUsers.value = false
    }
  }

  async function updateUser(userId: string, updates: Partial<AdminUser>) {
    try {
      const response = await adminApi.updateUser(userId, updates)
      
      // Update in list
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...updates }
      }
      
      // Update selected user
      if (selectedUser.value?.id === userId) {
        selectedUser.value = { ...selectedUser.value, ...updates }
      }
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to update user'
      throw err
    }
  }

  async function deleteUser(userId: string) {
    try {
      await adminApi.deleteUser(userId)
      
      // Remove from list
      users.value = users.value.filter(u => u.id !== userId)
      
      // Clear selected user if deleted
      if (selectedUser.value?.id === userId) {
        selectedUser.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete user'
      throw err
    }
  }

  // ============================================================
  // Actions - Templates
  // ============================================================

  async function loadTemplates() {
    isLoadingTemplates.value = true
    error.value = null
    
    try {
      const response = await adminApi.getTemplates(templateFilters.value)
      templates.value = response.data
      templatesPagination.value = response.meta
    } catch (err: any) {
      error.value = err.message || 'Failed to load templates'
      console.error('Error loading templates:', err)
    } finally {
      isLoadingTemplates.value = false
    }
  }

  async function loadPendingTemplates() {
    isLoadingTemplates.value = true
    error.value = null
    
    try {
      const response = await adminApi.getPendingTemplates()
      pendingTemplates.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to load pending templates'
      console.error('Error loading pending templates:', err)
    } finally {
      isLoadingTemplates.value = false
    }
  }

  async function approveTemplate(templateId: string, feedback?: string) {
    try {
      await adminApi.approveTemplate(templateId, feedback)
      
      // Remove from pending list
      pendingTemplates.value = pendingTemplates.value.filter(t => t.id !== templateId)
      
      // Reload templates
      await loadTemplates()
    } catch (err: any) {
      error.value = err.message || 'Failed to approve template'
      throw err
    }
  }

  async function rejectTemplate(templateId: string, reason: string) {
    try {
      await adminApi.rejectTemplate(templateId, reason)
      
      // Remove from pending list
      pendingTemplates.value = pendingTemplates.value.filter(t => t.id !== templateId)
    } catch (err: any) {
      error.value = err.message || 'Failed to reject template'
      throw err
    }
  }

  // ============================================================
  // Actions - Payments
  // ============================================================

  async function loadPayments() {
    isLoadingPayments.value = true
    error.value = null
    
    try {
      const response = await adminApi.getPayments(paymentFilters.value)
      transactions.value = response.data
      paymentsPagination.value = response.meta
    } catch (err: any) {
      error.value = err.message || 'Failed to load payments'
      console.error('Error loading payments:', err)
    } finally {
      isLoadingPayments.value = false
    }
  }

  async function refundPayment(transactionId: string, reason: string) {
    try {
      await adminApi.refundPayment(transactionId, reason)
      
      // Update transaction status
      const transaction = transactions.value.find(t => t.id === transactionId)
      if (transaction) {
        transaction.status = 'refunded'
        transaction.refundReason = reason
        transaction.refundedDate = new Date().toISOString()
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to refund payment'
      throw err
    }
  }

  // ============================================================
  // Actions - Analytics
  // ============================================================

  async function loadAnalytics() {
    isLoadingAnalytics.value = true
    error.value = null
    
    try {
      const [userGrowth, revenue, plans, usage, popular] = await Promise.all([
        adminApi.getUserGrowthData(analyticsDateRange.value),
        adminApi.getRevenueData(analyticsDateRange.value),
        adminApi.getPlanDistribution(),
        adminApi.getTemplateUsage(),
        adminApi.getPopularTemplates()
      ])
      
      userGrowthData.value = userGrowth.data
      revenueData.value = revenue.data
      planDistribution.value = plans.data
      templateUsage.value = usage.data
      popularTemplates.value = popular.data
    } catch (err: any) {
      error.value = err.message || 'Failed to load analytics'
      console.error('Error loading analytics:', err)
    } finally {
      isLoadingAnalytics.value = false
    }
  }

  // ============================================================
  // Actions - System
  // ============================================================

  async function loadSystemHealth() {
    isLoadingSystem.value = true
    error.value = null
    
    try {
      const response = await adminApi.getSystemHealth()
      serverHealth.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to load system health'
      console.error('Error loading system health:', err)
    } finally {
      isLoadingSystem.value = false
    }
  }

  async function loadSystemLogs() {
    isLoadingSystem.value = true
    error.value = null
    
    try {
      const response = await adminApi.getSystemLogs(logFilters.value)
      systemLogs.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to load system logs'
      console.error('Error loading system logs:', err)
    } finally {
      isLoadingSystem.value = false
    }
  }

  // ============================================================
  // Actions - UI
  // ============================================================

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    localStorage.setItem('admin-dark-mode', darkMode.value.toString())
    
    // Apply dark mode class to body
    if (darkMode.value) {
      document.body.classList.add('admin-dark-mode')
    } else {
      document.body.classList.remove('admin-dark-mode')
    }
  }

  function clearError() {
    error.value = null
  }

  // ============================================================
  // Return
  // ============================================================

  return {
    // State
    stats,
    isLoadingStats,
    users,
    selectedUser,
    userFilters,
    usersPagination,
    isLoadingUsers,
    templates,
    pendingTemplates,
    selectedTemplate,
    templateFilters,
    templatesPagination,
    isLoadingTemplates,
    transactions,
    selectedTransaction,
    paymentFilters,
    paymentsPagination,
    isLoadingPayments,
    userGrowthData,
    revenueData,
    planDistribution,
    templateUsage,
    popularTemplates,
    analyticsDateRange,
    isLoadingAnalytics,
    serverHealth,
    systemLogs,
    backgroundJobs,
    logFilters,
    isLoadingSystem,
    pricingPlans,
    adminSettings,
    isLoadingSettings,
    sidebarCollapsed,
    darkMode,
    error,
    
    // Computed
    hasError,
    
    // Actions
    loadDashboardStats,
    loadUsers,
    loadUserDetails,
    updateUser,
    deleteUser,
    loadTemplates,
    loadPendingTemplates,
    approveTemplate,
    rejectTemplate,
    loadPayments,
    refundPayment,
    loadAnalytics,
    loadSystemHealth,
    loadSystemLogs,
    toggleSidebar,
    toggleDarkMode,
    clearError
  }
})

