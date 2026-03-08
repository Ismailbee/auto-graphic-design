/**
 * Admin Dashboard Server
 * Express server for admin dashboard API endpoints
 * Port: 3006
 */

import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Memory optimization settings
const MEMORY_LIMITS = {
  MAX_USERS: 1000,
  MAX_TEMPLATES: 500,
  MAX_ANALYTICS_ENTRIES: 1000,
  CLEANUP_INTERVAL: 5 * 60 * 1000 // 5 minutes
}

const app = express()
const PORT = 3006

// Memory management functions
const cleanupMemory = () => {
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
    console.log('🧹 Admin Server: Memory cleanup executed')
  }
  
  // Log memory usage
  const memUsage = process.memoryUsage()
  console.log('📊 Admin Server Memory:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
  })
}

const cleanupOldData = () => {
  console.log('🗑️ Admin Server: Cleaning up old data...')
  // This would clean up old entries if using actual storage
  // For now, just log the action
}

// Set up memory monitoring
const memoryInterval = setInterval(() => {
  cleanupMemory()
  cleanupOldData()
}, MEMORY_LIMITS.CLEANUP_INTERVAL)

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' })) // Limit request size

// ============================================================
// Mock Data
// ============================================================

const mockStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalRevenue: 45678,
  totalDesigns: 5432,
  newUsersToday: 23,
  revenueToday: 1234,
  designsToday: 156,
  templatesUploaded: 234
}

const mockUserGrowthData = [
  { date: '2025-01-01', users: 100, activeUsers: 75 },
  { date: '2025-01-02', users: 120, activeUsers: 90 },
  { date: '2025-01-03', users: 150, activeUsers: 110 },
  { date: '2025-01-04', users: 180, activeUsers: 135 },
  { date: '2025-01-05', users: 200, activeUsers: 150 }
]

const mockRevenueData = [
  { date: '2025-01-01', revenue: 1000, transactions: 10 },
  { date: '2025-01-02', revenue: 1500, transactions: 15 },
  { date: '2025-01-03', revenue: 2000, transactions: 20 },
  { date: '2025-01-04', revenue: 1800, transactions: 18 },
  { date: '2025-01-05', revenue: 2200, transactions: 22 }
]

const mockPlanDistribution = [
  { plan: 'free', count: 800, percentage: 64 },
  { plan: 'standard', count: 300, percentage: 24 },
  { plan: 'pro', count: 147, percentage: 12 }
]

// ============================================================
// Health Check
// ============================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Admin Dashboard Server',
    version: '1.0.0',
    port: PORT
  })
})

// ============================================================
// Dashboard Stats
// ============================================================

app.get('/api/admin/stats', (req, res) => {
  res.json({
    success: true,
    data: mockStats
  })
})

// ============================================================
// User Management
// ============================================================

app.get('/api/admin/users', (req, res) => {
  const { page = 1, limit = 20 } = req.query
  
  // Mock users
  const users = Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    avatar: null,
    role: i < 5 ? 'admin' : i < 15 ? 'designer' : 'user',
    status: i % 10 === 0 ? 'suspended' : 'active',
    plan: i % 3 === 0 ? 'pro' : i % 2 === 0 ? 'standard' : 'free',
    joinedDate: new Date(Date.now() - i * 86400000).toISOString(),
    lastActive: new Date(Date.now() - i * 3600000).toISOString(),
    designsCreated: Math.floor(Math.random() * 100),
    templatesUploaded: Math.floor(Math.random() * 20),
    totalPurchases: Math.floor(Math.random() * 500)
  }))
  
  const start = (page - 1) * limit
  const end = start + parseInt(limit)
  const paginatedUsers = users.slice(start, end)
  
  res.json({
    data: paginatedUsers,
    meta: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(users.length / limit),
      totalItems: users.length,
      itemsPerPage: parseInt(limit),
      hasNextPage: end < users.length,
      hasPreviousPage: page > 1
    }
  })
})

app.get('/api/admin/users/:id', (req, res) => {
  const { id } = req.params
  
  res.json({
    success: true,
    data: {
      id,
      name: 'John Doe',
      email: 'john@example.com',
      avatar: null,
      role: 'user',
      status: 'active',
      plan: 'pro',
      joinedDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      designsCreated: 45,
      templatesUploaded: 12,
      totalPurchases: 299
    }
  })
})

app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params
  const updates = req.body
  
  res.json({
    success: true,
    data: { id, ...updates },
    message: 'User updated successfully'
  })
})

app.delete('/api/admin/users/:id', (req, res) => {
  res.json({
    success: true,
    message: 'User deleted successfully'
  })
})

// ============================================================
// Template Management
// ============================================================

app.get('/api/admin/templates', (req, res) => {
  const { page = 1, limit = 20 } = req.query
  
  const templates = Array.from({ length: 30 }, (_, i) => ({
    id: `template-${i + 1}`,
    title: `Template ${i + 1}`,
    description: `Description for template ${i + 1}`,
    category: ['Stickers', 'Receipts', 'Flyers'][i % 3],
    tags: ['design', 'template'],
    creator: {
      id: `user-${i + 1}`,
      name: `Creator ${i + 1}`,
      email: `creator${i + 1}@example.com`
    },
    status: i % 5 === 0 ? 'pending' : 'published',
    accessLevel: i % 3 === 0 ? 'premium' : 'free',
    price: i % 3 === 0 ? 9.99 : 0,
    thumbnailUrl: `https://via.placeholder.com/300x400?text=Template+${i + 1}`,
    fileUrl: `/templates/template-${i + 1}.json`,
    downloads: Math.floor(Math.random() * 1000),
    likes: Math.floor(Math.random() * 500),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }))
  
  const start = (page - 1) * limit
  const end = start + parseInt(limit)
  const paginatedTemplates = templates.slice(start, end)
  
  res.json({
    data: paginatedTemplates,
    meta: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(templates.length / limit),
      totalItems: templates.length,
      itemsPerPage: parseInt(limit),
      hasNextPage: end < templates.length,
      hasPreviousPage: page > 1
    }
  })
})

app.get('/api/admin/templates/pending', (req, res) => {
  const pendingTemplates = Array.from({ length: 5 }, (_, i) => ({
    id: `pending-${i + 1}`,
    title: `Pending Template ${i + 1}`,
    description: `Awaiting approval`,
    category: 'Stickers',
    tags: ['pending'],
    creator: {
      id: `user-${i + 1}`,
      name: `Creator ${i + 1}`,
      email: `creator${i + 1}@example.com`
    },
    status: 'pending',
    accessLevel: 'free',
    price: 0,
    thumbnailUrl: `https://via.placeholder.com/300x400?text=Pending+${i + 1}`,
    fileUrl: `/templates/pending-${i + 1}.json`,
    downloads: 0,
    likes: 0,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  }))
  
  res.json({
    success: true,
    data: pendingTemplates
  })
})

app.post('/api/admin/templates/:id/approve', (req, res) => {
  res.json({
    success: true,
    message: 'Template approved successfully'
  })
})

app.post('/api/admin/templates/:id/reject', (req, res) => {
  res.json({
    success: true,
    message: 'Template rejected successfully'
  })
})

// ============================================================
// Analytics
// ============================================================

app.get('/api/admin/analytics/users', (req, res) => {
  res.json({
    success: true,
    data: mockUserGrowthData
  })
})

app.get('/api/admin/analytics/revenue', (req, res) => {
  res.json({
    success: true,
    data: mockRevenueData
  })
})

app.get('/api/admin/analytics/plans', (req, res) => {
  res.json({
    success: true,
    data: mockPlanDistribution
  })
})

app.get('/api/admin/analytics/templates', (req, res) => {
  res.json({
    success: true,
    data: [
      { category: 'Stickers', downloads: 1200, revenue: 0 },
      { category: 'Receipts', downloads: 800, revenue: 150 },
      { category: 'Flyers', downloads: 600, revenue: 300 }
    ]
  })
})

app.get('/api/admin/analytics/popular-templates', (req, res) => {
  res.json({
    success: true,
    data: Array.from({ length: 10 }, (_, i) => ({
      id: `template-${i + 1}`,
      title: `Popular Template ${i + 1}`,
      category: 'Stickers',
      downloads: 1000 - i * 100,
      revenue: (1000 - i * 100) * 0.5,
      thumbnailUrl: `https://via.placeholder.com/300x400?text=Popular+${i + 1}`
    }))
  })
})

// ============================================================
// System Monitoring
// ============================================================

app.get('/api/admin/system/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      cpu: {
        usage: 45,
        cores: 8
      },
      memory: {
        used: 4096,
        total: 16384,
        percentage: 25
      },
      disk: {
        used: 102400,
        total: 512000,
        percentage: 20
      },
      uptime: 86400,
      activeConnections: 42,
      apiResponseTime: 120
    }
  })
})

// ============================================================
// Start Server
// ============================================================

// Clean up on exit
process.on('SIGTERM', () => {
  console.log('👋 Admin Server: SIGTERM received, shutting down gracefully...')
  clearInterval(memoryInterval)
  cleanupMemory()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('👋 Admin Server: SIGINT received, shutting down gracefully...')
  clearInterval(memoryInterval)
  cleanupMemory()
  process.exit(0)
})

app.listen(PORT, () => {
  console.log('============================================================')
  console.log('✨ Admin Dashboard Server (Memory Optimized)')
  console.log('============================================================')
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log('🧠 Memory limits:', MEMORY_LIMITS)
  console.log('============================================================')
  console.log('Endpoints:')
  console.log('  GET    /api/admin/stats')
  console.log('  GET    /api/admin/users')
  console.log('  GET    /api/admin/templates')
  console.log('  GET    /api/admin/analytics/*')
  console.log('  GET    /api/admin/system/health')
  console.log('============================================================')
})

