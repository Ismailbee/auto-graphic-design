/**
 * Vue Router Configuration
 * Main routing setup for the application
 */

import { createRouter, createWebHistory, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Capacitor } from '@capacitor/core'

// Use hash history on native platforms (Capacitor) for file:// protocol support
const isNative = Capacitor.isNativePlatform()

// Lazy load components for better performance
const HomePage = () => import('@/components/home/HomePage.vue')

// Auth Pages
const LoginPage = () => import('@/views/auth/LoginPage.vue')
const RegisterPage = () => import('@/views/auth/RegisterPage.vue')

// User Pages
const UserSettings = () => import('@/views/user/UserSettings.vue')
const TokensAndPlans = () => import('@/views/user/TokensAndPlans.vue')
const ReferralPage = () => import('@/views/user/ReferralPage.vue')
const SubscriptionPage = () => import('@/views/user/SubscriptionPage.vue')
const PrivacySettings = () => import('@/views/user/PrivacySettings.vue')
const NotificationsPage = () => import('@/views/user/NotificationsPage.vue')

// Auto-Design Pages (all design tools)
const AutoDesignPage = () => import('@/components/auto-design/AutoDesignPage.vue')

// Letterhead
const ConversationalLetterHeadPage = () => import('@/components/auto-design/letterhead/ConversationalLetterHeadPage.vue')

// Invoice/Receipt Dashboard Pages
const InvoiceReceiptDashboard = () => import('@/components/auto-design/invoice-receipt/pages/DashboardPage.vue')
const InvoicePage = () => import('@/components/auto-design/invoice-receipt/pages/Invoice/InvoicePage.vue')
const ReceiptPage = () => import('@/components/auto-design/invoice-receipt/pages/Receipt/ReceiptPage.vue')
const PreviewInvoice = () => import('@/components/auto-design/invoice-receipt/pages/Invoice/PreviewInvoice.vue')
const PreviewReceipt = () => import('@/components/auto-design/invoice-receipt/pages/Receipt/PreviewReceipt.vue')
const InvoiceStatsPage = () => import('@/components/auto-design/invoice-receipt/pages/StatsPage.vue')
const SavedInvoicesPage = () => import('@/components/auto-design/invoice-receipt/pages/Invoice/SavedInvoicesPage.vue')
const SavedReceiptsPage = () => import('@/components/auto-design/invoice-receipt/pages/Receipt/SavedReceiptsPage.vue')
const ReportsAnalyticsPage = () => import('@/components/auto-design/invoice-receipt/pages/ReportsAnalyticsPage.vue')
// Chat-based Invoice/Receipt Pages
const InvoiceChatPage = () => import('@/components/auto-design/invoice-receipt/pages/Invoice/InvoiceChatPage.vue')
const ReceiptChatPage = () => import('@/components/auto-design/invoice-receipt/pages/Receipt/ReceiptChatPage.vue')

// Mockup, Imposition, Signature, Scheduling
const MockupPage = () => import('@/components/auto-design/mockup/MockupPage.vue')
const ImpositionPage = () => import('@/components/auto-design/imposition/ImpositionPage.vue')
const SignaturePage = () => import('@/components/auto-design/signature/SignaturePage.vue')
const SchedulingPage = () => import('@/components/auto-design/scheduling/SchedulingPage.vue')

// Info Pages
const HelpCenterPage = () => import('@/views/info/HelpCenterPage.vue')
const SupportPage = () => import('@/views/info/SupportPage.vue')
const FAQPage = () => import('@/views/info/FAQPage.vue')
const AboutPage = () => import('@/views/info/AboutPage.vue')
const CookiesPage = () => import('@/views/info/CookiesPage.vue')
const SuggestFeaturePage = () => import('@/views/info/SuggestFeaturePage.vue')

// Misc Pages
const VideosPage = () => import('@/views/misc/VideosPage.vue')

// Legal Pages
const PrivacyPolicy = () => import('@/views/legal/PrivacyPolicy.vue')
const TermsOfService = () => import('@/views/legal/TermsOfService.vue')

// Admin Components
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue')
const UserManagement = () => import('@/views/admin/UserManagement.vue')
const UserDetail = () => import('@/views/admin/UserDetail.vue')
const TemplateManagement = () => import('@/views/admin/TemplateManagement.vue')
const PendingApprovals = () => import('@/views/admin/PendingApprovals.vue')
const PaymentManagement = () => import('@/views/admin/PaymentManagement.vue')
const PaymentDetail = () => import('@/views/admin/PaymentDetail.vue')
const Analytics = () => import('@/views/admin/Analytics.vue')
const SystemMonitoring = () => import('@/views/admin/SystemMonitoring.vue')
const AdminSettings = () => import('@/views/admin/AdminSettings.vue')

/**
 * Route definitions
 */
const routes: RouteRecordRaw[] = [
  // ============================================================
  // Public Routes
  // ============================================================
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: {
      title: 'Login - SmartDesignPro',
      requiresAuth: false,
      redirectIfAuth: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: {
      title: 'Create Account - SmartDesignPro',
      requiresAuth: false
    }
  },

  // ============================================================
  // Authenticated Routes
  // ============================================================
  {
    path: '/home',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'Home - SmartDesignPro',
      requiresAuth: false  // Changed to false to make home page public
    }
  },

  {
    path: '/settings',
    name: 'settings',
    component: UserSettings,
    meta: {
      title: 'Settings - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/auto-design',
    name: 'auto-design',
    component: AutoDesignPage,
    meta: {
      title: 'Auto Design - SmartDesignPro',
      requiresAuth: false  // Temporarily disabled for testing
    }
  },

  {
    path: '/invoice-receipt',
    name: 'invoice-receipt',
    alias: '/dashboard',
    component: InvoiceReceiptDashboard,
    meta: {
      title: 'Invoice & Receipt Dashboard - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/dashboard',
    name: 'Dashboard',
    component: InvoiceReceiptDashboard,
    meta: {
      title: 'Dashboard - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/invoice',
    name: 'Invoice',
    component: InvoicePage,
    meta: {
      title: 'Create Invoice - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/invoice-chat',
    name: 'InvoiceChat',
    component: InvoiceChatPage,
    meta: {
      title: 'AI Invoice Generator - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/invoice-preview',
    name: 'invoice-preview',
    component: PreviewInvoice,
    meta: {
      title: 'Preview Invoice - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/receipt',
    name: 'Receipt',
    component: ReceiptPage,
    meta: {
      title: 'Create Receipt - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/receipt-chat',
    name: 'ReceiptChat',
    component: ReceiptChatPage,
    meta: {
      title: 'AI Receipt Generator - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/receipt-preview',
    name: 'receipt-preview',
    component: PreviewReceipt,
    meta: {
      title: 'Preview Receipt - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/stats',
    name: 'Stats',
    component: InvoiceStatsPage,
    meta: {
      title: 'Statistics - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/saved-invoices',
    name: 'SavedInvoices',
    component: SavedInvoicesPage,
    meta: {
      title: 'Saved Invoices - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/saved-receipts',
    name: 'SavedReceipts',
    component: SavedReceiptsPage,
    meta: {
      title: 'Saved Receipts - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/reports',
    name: 'Reports',
    component: ReportsAnalyticsPage,
    meta: {
      title: 'Reports & Analytics - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/signature',
    name: 'Signature',
    component: SignaturePage,
    meta: {
      title: 'Signature Generator - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/letterhead',
    name: 'letterhead',
    component: ConversationalLetterHeadPage,
    meta: {
      title: 'Letter Head Designer - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/tokens-and-plans',
    name: 'tokens-and-plans',
    component: TokensAndPlans,
    meta: {
      title: 'Tokens & Plans - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/referral',
    name: 'referral',
    component: ReferralPage,
    meta: {
      title: 'Refer & Earn - SmartDesignPro',
      requiresAuth: true
    }
  },

  {
    path: '/subscription',
    name: 'subscription',
    component: SubscriptionPage,
    meta: {
      title: 'Upgrade Plan - SmartDesignPro',
      requiresAuth: true
    }
  },

  // ============================================================
  // User Pages
  // ============================================================
  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationsPage,
    meta: {
      title: 'Notifications - SmartDesignPro',
      requiresAuth: true
    }
  },

  // ============================================================
  // Service Routes
  // ============================================================
  {
    path: '/scheduling',
    name: 'scheduling',
    component: SchedulingPage,
    meta: {
      title: 'Scheduling - SmartDesignPro',
      requiresAuth: false
    }
  },

  {
    path: '/imposition',
    name: 'imposition',
    component: ImpositionPage,
    meta: {
      title: 'Imposition - SmartDesignPro',
      requiresAuth: false
    }
  },

  {
    path: '/mockup',
    name: 'mockup',
    component: MockupPage,
    meta: {
      title: 'Mockup - SmartDesignPro',
      requiresAuth: false
    }
  },

  {
    path: '/videos',
    name: 'videos',
    component: VideosPage,
    meta: {
      title: 'Videos - SmartDesignPro',
      requiresAuth: false
    }
  },



  // ============================================================
  // Legal Routes
  // ============================================================
  {
    path: '/legal/privacy-policy',
    name: 'privacy-policy',
    component: PrivacyPolicy,
    meta: {
      title: 'Privacy Policy - SmartDesignPro',
      requiresAuth: false
    }
  },

  {
    path: '/legal/terms-of-service',
    name: 'terms-of-service',
    component: TermsOfService,
    meta: {
      title: 'Terms of Service - SmartDesignPro',
      requiresAuth: false
    }
  },

  {
    path: '/privacy-settings',
    name: 'privacy-settings',
    component: PrivacySettings,
    meta: {
      title: 'Privacy Settings - SmartDesignPro',
      requiresAuth: false
    }
  },

    // ============================================================
    // Help & Support Routes
    // ============================================================
    {
      path: '/help-center',
      name: 'help-center',
      component: HelpCenterPage,
      meta: {
        title: 'Help Center - SmartDesignPro',
        requiresAuth: false
      }
    },

    {
      path: '/support',
      name: 'support',
      component: SupportPage,
      meta: {
        title: 'Contact Support - SmartDesignPro',
        requiresAuth: false
      }
    },

    {
      path: '/faq',
      name: 'faq',
      component: FAQPage,
      meta: {
        title: 'FAQ - SmartDesignPro',
        requiresAuth: false
      }
    },

    {
      path: '/about',
      name: 'about',
      component: AboutPage,
      meta: {
        title: 'About Us - SmartDesignPro',
        requiresAuth: false
      }
    },

    {
      path: '/cookies',
      name: 'cookies',
      component: CookiesPage,
      meta: {
        title: 'Cookie Policy - SmartDesignPro',
        requiresAuth: false
      }
    },

    {
      path: '/feedback/suggest',
      name: 'suggest-feature',
      component: SuggestFeaturePage,
      meta: {
        title: 'Suggest a Feature - SmartDesignPro',
        requiresAuth: false
      }
    },

    // Aliases for compatibility
    { path: '/legal/cookies', name: 'legal-cookies', component: CookiesPage, meta: { title: 'Cookie Policy - SmartDesignPro', requiresAuth: false } },
    { path: '/help', name: 'help', component: HelpCenterPage, meta: { title: 'Help Center - SmartDesignPro', requiresAuth: false } },
    { path: '/schedule', name: 'schedule', component: SchedulingPage, meta: { title: 'Scheduling - SmartDesignPro', requiresAuth: false } },
    { path: '/legal/terms', name: 'terms', component: TermsOfService, meta: { title: 'Terms of Service - SmartDesignPro', requiresAuth: false } },
    { path: '/legal/privacy', name: 'privacy', component: PrivacyPolicy, meta: { title: 'Privacy Policy - SmartDesignPro', requiresAuth: false } },

  // ============================================================
  // Admin Routes (Requires Admin Role)
  // ============================================================
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/dashboard',
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    },
    children: [
      // Dashboard Home
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: {
          title: 'Admin Dashboard',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // User Management
      {
        path: 'users',
        name: 'admin-users',
        component: UserManagement,
        meta: {
          title: 'User Management - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'users/:id',
        name: 'admin-user-detail',
        component: UserDetail,
        meta: {
          title: 'User Details - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // Template Management
      {
        path: 'templates',
        name: 'admin-templates',
        component: TemplateManagement,
        meta: {
          title: 'Template Management - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'templates/pending',
        name: 'admin-templates-pending',
        component: PendingApprovals,
        meta: {
          title: 'Pending Approvals - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'templates/:id',
        name: 'admin-template-detail',
        component: TemplateManagement, // Reuse with edit mode
        meta: {
          title: 'Template Details - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // Payment Management
      {
        path: 'payments',
        name: 'admin-payments',
        component: PaymentManagement,
        meta: {
          title: 'Payment Management - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'payments/:id',
        name: 'admin-payment-detail',
        component: PaymentDetail,
        meta: {
          title: 'Payment Details - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // Analytics
      {
        path: 'analytics',
        name: 'admin-analytics',
        component: Analytics,
        meta: {
          title: 'Analytics - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // System Monitoring
      {
        path: 'system',
        name: 'admin-system',
        component: SystemMonitoring,
        meta: {
          title: 'System Monitoring - Admin',
          requiresAuth: true,
          requiresAdmin: true
        }
      },

      // Settings
      {
        path: 'settings',
        name: 'admin-settings',
        component: AdminSettings,
        meta: {
          title: 'Admin Settings',
          requiresAuth: true,
          requiresAdmin: true
        }
      }
    ]
  },

  // ============================================================
  // 404 Not Found
  // ============================================================
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/misc/NotFound.vue'),
    meta: {
      title: '404 - Page Not Found'
    }
  }
]

/**
 * Create router instance
 * Use hash history on native platforms for file:// protocol support
 */
const router = createRouter({
  history: isNative ? createWebHashHistory() : createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * Navigation Guards
 */
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Update document title
  document.title = (to.meta.title as string) || 'SmartDesignPro'

  // Wait for auth initialization before making routing decisions
  if (!authStore.authInitialized) {
    // Wait for Firebase auth to initialize
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max wait
    while (!authStore.authInitialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }

  // Debug logs removed to satisfy lint rules

  // If user is authenticated and trying to access login page, redirect to home
  if (to.meta.redirectIfAuth && authStore.isAuthenticated) {
  // User authenticated, redirect to home
    next({ name: 'home' })
    return
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Allow navigation if user is authenticated OR in dev bypass mode
    if (!authStore.isAuthenticated) {
  // Route requires auth, redirect to login page
      // Store intended route for redirect after login
      sessionStorage.setItem('intendedRoute', to.fullPath)

      // Redirect to login page
      next({ name: 'login' })
      return
    }
  }

  // Check if route requires admin role
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
  // Admin route requires auth
      sessionStorage.setItem('intendedRoute', to.fullPath)
      next({ name: 'login' })
      return
    }

    // Check if user has admin or moderator role
    const userRole = authStore.user?.role || 'user'
    const isDevelopment = import.meta.env.DEV

    // In development, allow bypass with environment variable
    const allowDevBypass = isDevelopment && import.meta.env.VITE_ALLOW_ADMIN_BYPASS === 'true'

    if (allowDevBypass) {
  // DEV MODE: Admin bypass enabled (set VITE_ALLOW_ADMIN_BYPASS=false to disable)
      next()
      return
    }

    if (userRole !== 'admin' && userRole !== 'moderator') {
      // Redirect to home page with error message
  // Access denied: Admin privileges required
  // User role: ' + userRole
      next({ name: 'home' })
      return
    }
  }

  // Check if route requires special access (for micro-apps)
  if (to.meta.requiresSpecialAccess) {
    if (!authStore.isAuthenticated) {
      // Special access requires authentication
      sessionStorage.setItem('intendedRoute', to.fullPath)
      next({ name: 'welcome' })
      return
    }

    // Check if user has special access permission
    const userRole = authStore.user?.role || 'user'
    const hasSpecialAccess = userRole === 'admin' || 
                            userRole === 'moderator' || 
                            userRole === 'special' ||
                            (authStore.user as any)?.hasSpecialAccess === true

    const isDevelopment = import.meta.env.DEV
    const allowDevBypass = isDevelopment && import.meta.env.VITE_ALLOW_MICROAPP_BYPASS === 'true'

    if (allowDevBypass) {
      // DEV MODE: Micro-app access bypass enabled
      next()
      return
    }

    if (!hasSpecialAccess) {
      // Redirect to home with access denied message
      // Could show a modal here explaining how to get access
      next({ name: 'home', query: { error: 'special_access_required' } })
      return
    }
  }

  // Allow navigation
  next()
})

/**
 * After navigation hook
 */
router.afterEach((_to, _from) => {
  // Log navigation for analytics
  // Navigation complete
})

export default router

