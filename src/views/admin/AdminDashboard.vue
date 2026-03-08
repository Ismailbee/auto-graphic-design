<template>
  <div class="admin-dashboard">
    <!-- Admin Layout -->
    <AdminSidebar :collapsed="adminStore.sidebarCollapsed" />
    
    <div class="admin-main" :class="{ 'sidebar-collapsed': adminStore.sidebarCollapsed }">
      <AdminHeader />
      
      <div class="admin-content" @click="closeSidebarOnMobile">
        <!-- Dashboard Header with Quick Stats -->
        <div class="dashboard-header">
          <div class="header-content">
            <div>
              <h1 class="dashboard-title">Dashboard Overview</h1>
              <p class="dashboard-subtitle">
                Welcome back, {{ authStore.user?.name || 'Admin' }}! Here's your business analytics at a glance.
              </p>
            </div>
            <div class="header-actions">
              <button @click="refreshData" class="action-btn refresh-btn" :class="{ spinning: isRefreshing }">
                <span class="btn-icon">🔄</span>
                <span>Refresh</span>
              </button>
              <button @click="exportReport" class="action-btn export-btn">
                <span class="btn-icon">📊</span>
                <span>Export Report</span>
              </button>
              <select v-model="timeRange" class="time-range-select">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Key Metrics Grid -->
        <div class="metrics-section">
          <h2 class="section-title">
            <span class="title-icon">📈</span>
            Key Performance Indicators
          </h2>
          <div class="stats-grid">
            <StatsCard
              title="Total Users"
              :value="adminStore.stats?.totalUsers || 0"
              icon="👥"
              :change="adminStore.stats?.newUsersToday || 0"
              changeLabel="new today"
              color="blue"
            />
            <StatsCard
              title="Active Users"
              :value="adminStore.stats?.activeUsers || 0"
              icon="✨"
              :change="calculateActivePercentage()"
              changeLabel="of total"
              color="green"
              :isPercentage="true"
            />
            <StatsCard
              title="Total Revenue"
              :value="formatCurrency(adminStore.stats?.totalRevenue || 0)"
              icon="💰"
              :change="adminStore.stats?.revenueToday || 0"
              changeLabel="today"
              color="purple"
              :isCurrency="true"
            />
            <StatsCard
              title="Total Designs"
              :value="adminStore.stats?.totalDesigns || 0"
              icon="🎨"
              :change="adminStore.stats?.designsToday || 0"
              changeLabel="created today"
              color="pink"
            />
          </div>
        </div>

        <!-- Additional Mini Stats -->
        <div class="mini-stats-row">
          <div class="mini-stat-card">
            <span class="mini-stat-icon">⚡</span>
            <div class="mini-stat-content">
              <p class="mini-stat-value">{{ calculateEngagementRate() }}%</p>
              <p class="mini-stat-label">Engagement Rate</p>
            </div>
          </div>
          <div class="mini-stat-card">
            <span class="mini-stat-icon">💎</span>
            <div class="mini-stat-content">
              <p class="mini-stat-value">{{ adminStore.stats?.premiumUsers || 0 }}</p>
              <p class="mini-stat-label">Premium Users</p>
            </div>
          </div>
          <div class="mini-stat-card">
            <span class="mini-stat-icon">📄</span>
            <div class="mini-stat-content">
              <p class="mini-stat-value">{{ adminStore.stats?.totalTemplates || 0 }}</p>
              <p class="mini-stat-label">Total Templates</p>
            </div>
          </div>
          <div class="mini-stat-card">
            <span class="mini-stat-icon">⏱️</span>
            <div class="mini-stat-content">
              <p class="mini-stat-value">{{ calculateAvgSessionTime() }}</p>
              <p class="mini-stat-label">Avg. Session</p>
            </div>
          </div>
        </div>

        <!-- Analytics Charts Section -->
        <div class="analytics-section">
          <h2 class="section-title">
            <span class="title-icon">📊</span>
            Analytics & Insights
          </h2>
          
          <!-- Charts Row -->
          <div class="charts-row">
            <!-- User Growth Chart -->
            <div class="chart-card elevated">
              <div class="chart-header">
                <div class="chart-title-group">
                  <h3>User Growth Trend</h3>
                  <p class="chart-subtitle">Track user acquisition over time</p>
                </div>
                <select v-model="userGrowthPeriod" class="period-select modern">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div class="chart-container">
                <canvas ref="userGrowthChart"></canvas>
              </div>
              <div class="chart-insights">
                <div class="insight-item">
                  <span class="insight-label">Avg Growth:</span>
                  <span class="insight-value positive">+12.5%</span>
                </div>
                <div class="insight-item">
                  <span class="insight-label">Peak Day:</span>
                  <span class="insight-value">Monday</span>
                </div>
              </div>
            </div>

            <!-- Plan Distribution Chart -->
            <div class="chart-card elevated">
              <div class="chart-header">
                <div class="chart-title-group">
                  <h3>Subscription Plans</h3>
                  <p class="chart-subtitle">User distribution by plan type</p>
                </div>
              </div>
              <div class="chart-container">
                <canvas ref="planDistributionChart"></canvas>
              </div>
              <div class="plan-legend">
                <div class="legend-item">
                  <span class="legend-color" style="background: #0ea5e9"></span>
                  <span class="legend-label">Free</span>
                  <span class="legend-value">{{ getPlanPercentage('free') }}%</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background: #06b6d4"></span>
                  <span class="legend-label">Standard</span>
                  <span class="legend-value">{{ getPlanPercentage('standard') }}%</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background: #10b981"></span>
                  <span class="legend-label">Pro</span>
                  <span class="legend-value">{{ getPlanPercentage('pro') }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Revenue Chart -->
          <div class="chart-card full-width elevated">
            <div class="chart-header">
              <div class="chart-title-group">
                <h3>Revenue Overview</h3>
                <p class="chart-subtitle">Financial performance tracking</p>
              </div>
              <div class="chart-controls">
                <button 
                  v-for="type in ['bar', 'line', 'area']" 
                  :key="type"
                  @click="revenueChartType = type"
                  class="chart-type-btn"
                  :class="{ active: revenueChartType === type }"
                >
                  {{ type }}
                </button>
                <select v-model="revenuePeriod" class="period-select modern">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div class="chart-container large">
              <canvas ref="revenueChart"></canvas>
            </div>
            <div class="revenue-summary">
              <div class="summary-item">
                <span class="summary-icon">💵</span>
                <div class="summary-content">
                  <p class="summary-label">Total Revenue</p>
                  <p class="summary-value">{{ formatCurrency(adminStore.stats?.totalRevenue || 0) }}</p>
                </div>
              </div>
              <div class="summary-item">
                <span class="summary-icon">📈</span>
                <div class="summary-content">
                  <p class="summary-label">Growth Rate</p>
                  <p class="summary-value positive">+18.2%</p>
                </div>
              </div>
              <div class="summary-item">
                <span class="summary-icon">🎯</span>
                <div class="summary-content">
                  <p class="summary-label">Target Achievement</p>
                  <p class="summary-value">87%</p>
                </div>
              </div>
              <div class="summary-item">
                <span class="summary-icon">💳</span>
                <div class="summary-content">
                  <p class="summary-label">Avg. Transaction</p>
                  <p class="summary-value">$49.99</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row: Activity & Quick Actions -->
        <div class="bottom-section">
          <!-- Recent Activity -->
          <div class="activity-card elevated">
            <div class="activity-header">
              <div>
                <h3>Recent Activity</h3>
                <p class="activity-subtitle">Live updates from your platform</p>
              </div>
              <router-link to="/admin/users" class="view-all-link">View All →</router-link>
            </div>
            <div class="activity-list">
              <div v-if="recentActivity.length === 0" class="empty-state">
                <span class="empty-icon">📭</span>
                <p>No recent activity</p>
              </div>
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="activity-item enhanced"
              >
                <div class="activity-icon-wrapper" :class="getActivityType(activity.type)">
                  <span class="activity-icon">{{ getActivityIcon(activity.type) }}</span>
                </div>
                <div class="activity-content">
                  <p class="activity-description">{{ activity.description }}</p>
                  <p class="activity-time">{{ formatTime(activity.timestamp) }}</p>
                </div>
                <div class="activity-status">
                  <span class="status-badge" :class="getStatusClass(activity.type)">
                    {{ getStatusLabel(activity.type) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Links & System Status -->
          <div class="side-panel">
            <!-- Quick Links -->
            <div class="quick-links-card elevated">
              <h3 class="card-title">Quick Actions</h3>
              <div class="quick-links-grid">
                <router-link to="/admin/users" class="quick-link-item">
                  <span class="link-icon">👥</span>
                  <span class="link-label">Manage Users</span>
                  <span class="link-arrow">→</span>
                </router-link>
                <router-link to="/admin/templates" class="quick-link-item">
                  <span class="link-icon">📄</span>
                  <span class="link-label">Templates</span>
                  <span class="link-arrow">→</span>
                </router-link>
                <router-link to="/admin/payments" class="quick-link-item">
                  <span class="link-icon">💳</span>
                  <span class="link-label">Payments</span>
                  <span class="link-arrow">→</span>
                </router-link>
                <router-link to="/admin/analytics" class="quick-link-item">
                  <span class="link-icon">📈</span>
                  <span class="link-label">Analytics</span>
                  <span class="link-arrow">→</span>
                </router-link>
              </div>
            </div>

            <!-- System Status -->
            <div class="system-status-card elevated">
              <h3 class="card-title">System Health</h3>
              <div class="status-items">
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-label">Server Status</span>
                    <span class="status-indicator online"></span>
                  </div>
                  <span class="status-value">Online</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-label">CPU Usage</span>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: 45%"></div>
                    </div>
                  </div>
                  <span class="status-value">45%</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-label">Memory</span>
                    <div class="progress-bar">
                      <div class="progress-fill warning" style="width: 72%"></div>
                    </div>
                  </div>
                  <span class="status-value">72%</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-label">Storage</span>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: 58%"></div>
                    </div>
                  </div>
                  <span class="status-value">58%</span>
                </div>
              </div>
              <router-link to="/admin/system" class="view-details-link">
                View System Details →
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import StatsCard from '@/components/admin/StatsCard.vue'
import type { UserActivity } from '@/types/admin'

// Lazy load Chart.js - only loaded when dashboard is viewed
let ChartJS: typeof import('chart.js/auto').default | null = null
const loadChartJS = async () => {
  if (!ChartJS) {
    const module = await import('chart.js/auto')
    ChartJS = module.default
  }
  return ChartJS
}

const adminStore = useAdminStore()
const authStore = useAuthStore()

// Chart refs
const userGrowthChart = ref<HTMLCanvasElement | null>(null)
const planDistributionChart = ref<HTMLCanvasElement | null>(null)
const revenueChart = ref<HTMLCanvasElement | null>(null)

// Chart instances (typed as any since Chart is lazy loaded)
let userGrowthChartInstance: any = null
let planDistributionChartInstance: any = null
let revenueChartInstance: any = null

// State
const userGrowthPeriod = ref<'daily' | 'weekly' | 'monthly'>('daily')
const revenuePeriod = ref<'daily' | 'weekly' | 'monthly'>('monthly')
const revenueChartType = ref<'bar' | 'line' | 'area'>('bar')
const timeRange = ref<'today' | 'week' | 'month' | 'year'>('month')
const isRefreshing = ref(false)

// Recent activity (enhanced mock data)
const recentActivity = ref<UserActivity[]>([
  {
    id: '1',
    userId: 'user1',
    type: 'design_created',
    description: 'John Doe created a new design "Summer Poster"',
    timestamp: new Date().toISOString(),
    metadata: {}
  },
  {
    id: '2',
    userId: 'user2',
    type: 'template_uploaded',
    description: 'Jane Smith uploaded a new template to marketplace',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    metadata: {}
  },
  {
    id: '3',
    userId: 'user3',
    type: 'purchase',
    description: 'Mike Johnson upgraded to Pro plan ($99/year)',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    metadata: {}
  },
  {
    id: '4',
    userId: 'user4',
    type: 'login',
    description: 'Sarah Wilson logged in from new device',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    metadata: {}
  },
  {
    id: '5',
    userId: 'user5',
    type: 'design_created',
    description: 'Tom Brown created "Business Card Template"',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    metadata: {}
  }
])

// Load dashboard data
onMounted(async () => {
  await adminStore.loadDashboardStats()
  await adminStore.loadAnalytics()
  
  // Initialize charts
  setTimeout(() => {
    initializeCharts()
  }, 100)
})

// Watch for period changes
watch(userGrowthPeriod, () => {
  updateUserGrowthChart()
})

watch(revenuePeriod, () => {
  updateRevenueChart()
})

watch(revenueChartType, () => {
  updateRevenueChart()
})

// Initialize charts with enhanced styling - lazy loads Chart.js
async function initializeCharts() {
  const Chart = await loadChartJS()
  
  if (userGrowthChart.value) {
    userGrowthChartInstance = new Chart(userGrowthChart.value, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'New Users',
          data: [120, 190, 250, 310, 390, 450, 520, 580, 650, 720, 800, 890],
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointBackgroundColor: '#0ea5e9',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderColor: '#0ea5e9',
            borderWidth: 1,
            titleColor: '#fff',
            bodyColor: '#fff',
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        }
      }
    })
  }

  if (planDistributionChart.value) {
    planDistributionChartInstance = new Chart(planDistributionChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Free', 'Standard', 'Pro'],
        datasets: [{
          data: [450, 250, 180],
          backgroundColor: ['#0ea5e9', '#06b6d4', '#10b981'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderColor: '#0ea5e9',
            borderWidth: 1
          }
        }
      }
    })
  }

  if (revenueChart.value) {
    revenueChartInstance = new Chart(revenueChart.value, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue',
          data: [12500, 18900, 25000, 31000, 39000, 45000, 52000, 58000, 65000, 72000, 80000, 89000],
          backgroundColor: 'rgba(14, 165, 233, 0.8)',
          borderColor: '#0ea5e9',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: '#0ea5e9'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderColor: '#0ea5e9',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `Revenue: $${context.parsed.y.toLocaleString()}`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return '$' + (value as number / 1000) + 'k'
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        }
      }
    })
  }
}

// Update charts
function updateUserGrowthChart() {
  if (!userGrowthChartInstance) return
  
  const data = adminStore.userGrowthData || []
  if (data.length > 0) {
    userGrowthChartInstance.data.labels = data.map(d => d.date)
    userGrowthChartInstance.data.datasets[0].data = data.map(d => d.users)
  }
  userGrowthChartInstance.update()
}

function updateRevenueChart() {
  if (!revenueChartInstance) return
  
  const data = adminStore.revenueData || []
  if (data.length > 0) {
    revenueChartInstance.data.labels = data.map(d => d.date)
    revenueChartInstance.data.datasets[0].data = data.map(d => d.revenue)
  }
  
  // Update chart type
  if (revenueChartType.value === 'line') {
    revenueChartInstance.config.type = 'line'
    revenueChartInstance.data.datasets[0].tension = 0.4
    revenueChartInstance.data.datasets[0].fill = false
  } else if (revenueChartType.value === 'area') {
    revenueChartInstance.config.type = 'line'
    revenueChartInstance.data.datasets[0].tension = 0.4
    revenueChartInstance.data.datasets[0].fill = true
  } else {
    revenueChartInstance.config.type = 'bar'
  }
  
  revenueChartInstance.update()
}

// Helper functions
function calculateActivePercentage(): number {
  const total = adminStore.stats?.totalUsers || 0
  const active = adminStore.stats?.activeUsers || 0
  return total > 0 ? Math.round((active / total) * 100) : 0
}

function calculateEngagementRate(): number {
  return 78 // Mock data
}

function calculateAvgSessionTime(): string {
  return '24m' // Mock data
}

function getPlanPercentage(plan: string): number {
  // Mock calculation - replace with actual data
  const totals: Record<string, number> = {
    free: 450,
    standard: 250,
    pro: 180
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0)
  return Math.round((totals[plan] / sum) * 100)
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    design_created: '🎨',
    template_uploaded: '📄',
    purchase: '💳',
    login: '🔐',
    logout: '👋',
    user_registered: '👤'
  }
  return icons[type] || '📌'
}

function getActivityType(type: string): string {
  const types: Record<string, string> = {
    design_created: 'success',
    template_uploaded: 'info',
    purchase: 'premium',
    login: 'neutral',
    logout: 'neutral',
    user_registered: 'success'
  }
  return types[type] || 'neutral'
}

function getStatusClass(type: string): string {
  const classes: Record<string, string> = {
    design_created: 'success',
    template_uploaded: 'info',
    purchase: 'premium',
    login: 'neutral'
  }
  return classes[type] || 'neutral'
}

function getStatusLabel(type: string): string {
  const labels: Record<string, string> = {
    design_created: 'Created',
    template_uploaded: 'Uploaded',
    purchase: 'Purchased',
    login: 'Login'
  }
  return labels[type] || 'Activity'
}

async function refreshData() {
  isRefreshing.value = true
  await adminStore.loadDashboardStats()
  await adminStore.loadAnalytics()
  updateUserGrowthChart()
  updateRevenueChart()
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

function exportReport() {
  console.log('Exporting report...')
  // Implement export functionality
  alert('Export feature coming soon!')
}

function closeSidebarOnMobile() {
  // Close sidebar on mobile when clicking content
  if (window.innerWidth <= 1024 && !adminStore.sidebarCollapsed) {
    adminStore.toggleSidebar()
  }
}
</script>

<style scoped>
/* Enhanced Dashboard Styles */

.admin-content {
  padding: 32px;
  background: transparent;
}

/* Dashboard Header */
.dashboard-header {
  margin-bottom: 40px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.dashboard-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #111827;
}

.dashboard-subtitle {
  font-size: 16px;
  color: #4b5563;
  margin: 0;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.refresh-btn.spinning .btn-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.export-btn {
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  border: none;
}

.export-btn:hover {
  background: linear-gradient(135deg, #0284c7, #0891b2);
}

.time-range-select {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.time-range-select:hover {
  background: rgba(255, 255, 255, 1);
}

/* Section Titles */
.metrics-section,
.analytics-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 24px 0;
}

.title-icon {
  font-size: 28px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* Mini Stats Row */
.mini-stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.mini-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.mini-stat-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.mini-stat-icon {
  font-size: 32px;
  line-height: 1;
}

.mini-stat-content {
  flex: 1;
}

.mini-stat-value {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.mini-stat-label {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Charts */
.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 28px;
  transition: all 0.3s ease;
}

.chart-card.elevated {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.chart-card.elevated:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}

.chart-title-group h3 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.chart-subtitle {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-type-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: capitalize;
}

.chart-type-btn:hover {
  background: rgba(255, 255, 255, 1);
  color: #111827;
}

.chart-type-btn.active {
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  border-color: transparent;
  color: #fff;
}

.period-select.modern {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  color: #111827;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.period-select.modern:hover {
  background: rgba(255, 255, 255, 1);
}

.chart-container {
  height: 300px;
  position: relative;
}

.chart-container.large {
  height: 350px;
}

/* Chart Insights */
.chart-insights {
  display: flex;
  gap: 24px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.insight-label {
  font-size: 13px;
  color: #6b7280;
}

.insight-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.insight-value.positive {
  color: #22c55e;
}

/* Plan Legend */
.plan-legend {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-label {
  flex: 1;
  font-size: 14px;
  color: #4b5563;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

/* Revenue Summary */
.revenue-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  font-size: 28px;
}

.summary-content {
  flex: 1;
}

.summary-label {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.summary-value.positive {
  color: #22c55e;
}

/* Bottom Section */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
}

/* Activity Card */
.activity-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 28px;
}

.activity-card.elevated {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.activity-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.activity-header h3 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.activity-subtitle {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.view-all-link {
  color: #0ea5e9;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-all-link:hover {
  color: #06b6d4;
  transform: translateX(4px);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Custom scrollbar */
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.activity-item.enhanced {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.activity-item.enhanced:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.activity-icon-wrapper {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 20px;
}

.activity-icon-wrapper.success {
  background: rgba(34, 197, 94, 0.15);
}

.activity-icon-wrapper.info {
  background: rgba(102, 126, 234, 0.15);
}

.activity-icon-wrapper.premium {
  background: rgba(240, 147, 251, 0.15);
}

.activity-icon-wrapper.neutral {
  background: rgba(255, 255, 255, 0.1);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-description {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  /* Keeping overflow: hidden for text truncation with ellipsis - this is intentional */
  text-overflow: ellipsis;
}

.activity-time {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.activity-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge.info {
  background: rgba(14, 165, 233, 0.2);
  color: #0ea5e9;
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.status-badge.premium {
  background: rgba(240, 147, 251, 0.2);
  color: #f093fb;
  border: 1px solid rgba(240, 147, 251, 0.3);
}

.status-badge.neutral {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Side Panel */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Quick Links Card */
.quick-links-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 24px;
}

.quick-links-card.elevated {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.quick-links-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  text-decoration: none;
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.quick-link-item:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.15);
  transform: translateX(4px);
}

.link-icon {
  font-size: 20px;
}

.link-label {
  flex: 1;
}

.link-arrow {
  color: #9ca3af;
  transition: transform 0.3s ease;
}

.quick-link-item:hover .link-arrow {
  transform: translateX(4px);
}

/* System Status Card */
.system-status-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 24px;
}

.system-status-card.elevated {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.status-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-label {
  font-size: 13px;
  color: #4b5563;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-left: 8px;
}

.status-indicator.online {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling */
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9, #06b6d4);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-fill.warning {
  background: linear-gradient(90deg, #f59e0b, #ef4444);
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  min-width: 45px;
  text-align: right;
}

.view-details-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #0ea5e9;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.view-details-link:hover {
  color: #06b6d4;
  transform: translateX(4px);
}

/* Responsive Design */
@media (max-width: 1400px) {
  .bottom-section {
    grid-template-columns: 1fr 350px;
  }
}

@media (max-width: 1200px) {
  .bottom-section {
    grid-template-columns: 1fr;
  }
  
  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-content {
    padding: 20px;
  }
  
  .dashboard-header {
    padding: 24px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .action-btn {
    flex: 1;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .mini-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .revenue-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .mini-stats-row {
    grid-template-columns: 1fr;
  }
  
  .revenue-summary {
    grid-template-columns: 1fr;
  }
  
  .chart-controls {
    flex-direction: column;
    width: 100%;
  }
  
  .chart-type-btn,
  .period-select.modern {
    width: 100%;
  }
}
</style>
