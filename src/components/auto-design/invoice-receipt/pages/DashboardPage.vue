<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- Pull to Refresh - Custom Styled -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)" pull-factor="0.5" pull-min="60" pull-max="120">
        <ion-refresher-content
          :pulling-icon="arrowDown"
          pulling-text=""
          refreshing-spinner="crescent"
          refreshing-text="">
        </ion-refresher-content>
      </ion-refresher>
      
      <!-- Custom Refresh Indicator Overlay -->
      <div v-if="isRefreshing" class="custom-refresh-overlay">
        <div class="refresh-indicator">
          <div class="refresh-spinner"></div>
          <p class="refresh-text">Refreshing data...</p>
        </div>
      </div>

      <div class="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900 pt-16 md:pt-10 py-10">
        <!-- Background Pattern -->
        <div class="fixed inset-0 opacity-5 pointer-events-none">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(16,185,129,0.3),_transparent_50%)]"></div>
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(6,182,212,0.2),_transparent_50%)]"></div>
        </div>

        <!-- Main Content -->
        <div class="relative min-h-full py-8 px-4 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="max-w-7xl mx-auto mb-8">
        <div class="text-center mb-8 relative">
          <div class="inline-flex items-center gap-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 text-emerald-700 dark:text-emerald-300 text-sm font-semibold uppercase tracking-wide mb-4">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {{ branchTitle }} Branch Dashboard
          </div>
          <h1 class="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome
          </h1>
          <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            The Institute of Chartered Accountants of Nigeria - {{ branchTitle }} Branch Management Portal
          </p>
        </div>
      </div>

      <!-- Stats Overview - Compact Summary -->
      <div class="max-w-7xl mx-auto mb-8">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Loading {{ branchTitle }} branch data...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <svg class="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-red-800 dark:text-red-200 font-semibold">{{ error }}</p>
        </div>
      </div>

      <!-- Main Actions Grid -->
      <div class="max-w-7xl mx-auto mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Create Invoice -->
          <div class="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative" @click="handleCreateInvoice">
            <div class="flex items-center space-x-4">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Create Invoice</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">Generate professional invoices</p>
              </div>
            </div>
          </div>

          <!-- Create Receipt -->
          <div class="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative" @click="handleCreateReceipt">
            <div class="flex items-center space-x-4">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Create Receipt</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">Issue payment receipts</p>
              </div>
            </div>
          </div>

          <!-- Reports & Analytics -->
          <div class="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" @click="handleReports">
            <div class="flex items-center space-x-4">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Reports & Analytics</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">Generate detailed reports</p>
              </div>
            </div>
          </div>
      
          <!-- Create Signature -->
          <div class="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" @click="handleSignature">
            <div class="flex items-center space-x-4">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Create Signature</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">Draw digital signatures</p>
              </div>
            </div>
          </div>

          <!-- Saved Invoices -->
          <div class="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" @click="handleSavedInvoices">
            <div class="flex items-center space-x-4">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Saved Invoices</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">View & manage your invoices</p>
              </div>
            </div>
          </div>

          <!-- Saved Receipts -->
          <div class="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer" @click="handleSavedReceipts">
            <div class="flex items-center space-x-4">
              <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Saved Receipts</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">View & manage your receipts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="max-w-7xl mx-auto mb-8">
        <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
            <div class="flex items-center gap-2">
              <button @click="refreshDashboard" class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300" title="Refresh dashboard data">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="recentActivities.length === 0" class="text-center py-8 text-slate-500 dark:text-slate-400">
            <svg class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No recent activities</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="activity in displayedActivities" :key="activity.id" class="flex items-center space-x-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div :class="getActivityIconClass(activity.action)">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="activity.action.includes('Login')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path v-else-if="activity.action.includes('Export')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  <path v-else-if="activity.action.includes('Invoice')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  <path v-else-if="activity.action.includes('Receipt')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ activity.action }}</p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ activity.memberName }}</span>
                  <span class="mx-1">•</span>
                  <span>{{ activity.branch }} branch</span>
                </p>
              </div>
              <span class="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ formatTimeAgo(activity.timestamp) }}</span>
            </div>
          </div>

          <!-- See More Button -->
          <div v-if="recentActivities.length > 3" class="mt-4 text-center">
            <button 
              @click="showAllActivities = !showAllActivities"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-200"
            >
              <span>{{ showAllActivities ? 'Show Less' : `See More (${recentActivities.length - 3} more)` }}</span>
              <svg 
                class="h-4 w-4 transition-transform duration-200" 
                :class="{ 'rotate-180': showAllActivities }"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="max-w-7xl mx-auto text-center">
        <BaseButton variant="outline" size="large" @click="handleGoBack" class="px-8 py-3">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Change Branch
        </BaseButton>
      </div>
    </div>
    </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, computed, ref, onMounted, onBeforeUnmount, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage, IonContent, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { arrowDown } from 'ionicons/icons';
import BaseButton from '@/components/ui/BaseButton.vue';
import { getDashboardData, getAllMembers, getActivities, getAllInvoices, getAllReceipts } from '../api-service';

export default defineComponent({
  name: 'DashboardPage',
  components: {
    BaseButton,
    IonPage,
    IonContent,
    IonRefresher,
    IonRefresherContent,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    // Branch-specific data
    const totalMembers = ref(0);
    const activeInvoices = ref(0);
    const activeReceipts = ref(0);
    const monthlyRevenue = ref('0');
    const pendingTasks = ref(0);
    const loading = ref(true);
    const error = ref(null);
    const recentActivities = ref([]);
    const showAllActivities = ref(false);
    const isRefreshing = ref(false);

    const branchTitle = computed(() => {
      const branch = route.query.branch;
      return branch ? `${branch}` : 'All Branches';
    });

    const branchName = computed(() => {
      // Try to get branch from route query first, then fallback to localStorage
      const routeBranch = route.query.branch;
      if (routeBranch) {
        // Save to localStorage for future reference
        localStorage.setItem('currentBranch', routeBranch);
        return routeBranch;
      }
      // Fallback to localStorage, or return empty string for "All Branches" mode
      return localStorage.getItem('currentBranch') || '';
    });

    // Computed property for displaying limited activities
    const displayedActivities = computed(() => {
      return showAllActivities.value ? recentActivities.value : recentActivities.value.slice(0, 3);
    });

    // Fetch branch-specific statistics
    const fetchBranchStats = async () => {
      // Allow empty branch - will load all data
      try {
        loading.value = true;
        error.value = null;

        console.log('🔥 Loading dashboard data from localStorage and SmartDesignPro Firebase...');
        console.log(`🔍 Loading dashboard data for branch: "${branchName.value || 'All Branches'}" (ID: ${branchName.value || 'all'})`);
        
        // Initialize counters with safe defaults
        let totalInvoiceCount = 0;
        let totalReceiptCount = 0;
        let totalRevenue = 0;
        let totalUsers = 0;
        let pendingTasksCount = 0;
        
        // Get data from localStorage (where preview pages store invoice/receipt data) in parallel with error handling
        const [dashResult, localStorageInvoices, localStorageReceipts] = await Promise.all([
          getDashboardData(branchName.value || 'All').catch(err => ({ success: false, error: err.message })),
          getAllInvoices(branchName.value || 'All').catch(err => ({ success: false, message: err.message, data: [] })),
          getAllReceipts(branchName.value || 'All').catch(err => ({ success: false, message: err.message, data: [] }))
        ]);
        
        // Process dashboard data
        if (dashResult.success && dashResult.data) {
          const dashboardData = dashResult.data;
          totalUsers = parseInt(dashboardData.totalUsers) || 0;
          pendingTasksCount = parseInt(dashboardData.pendingTasks) || 0;
        } else {
          console.warn('⚠️ Dashboard data not available:', dashResult.error || 'Unknown error');
        }
          
        // Add data from localStorage invoices (exported/created in PreviewInvoice.vue)
        if (localStorageInvoices.success && Array.isArray(localStorageInvoices.data)) {
          const validInvoices = localStorageInvoices.data.filter(inv => inv && typeof inv === 'object');
          totalInvoiceCount += validInvoices.length;
          
          // Calculate revenue from invoices
          const invoiceRevenue = validInvoices.reduce((sum, inv) => {
            const amount = parseFloat(inv.grandTotal || inv.totalAmount || inv.amount) || 0;
            return sum + amount;
          }, 0);
          totalRevenue += invoiceRevenue;
          
          console.log(`📄 Added ${validInvoices.length} invoices with revenue: ₦${invoiceRevenue.toLocaleString('en-NG')}`);
        } else {
          console.log('📄 No localStorage invoices found or error:', localStorageInvoices.message);
        }
        
        // Add data from localStorage receipts (exported/created in PreviewReceipt.vue)
        if (localStorageReceipts.success && Array.isArray(localStorageReceipts.data)) {
          const validReceipts = localStorageReceipts.data.filter(rec => rec && typeof rec === 'object');
          totalReceiptCount += validReceipts.length;
          
          // Calculate revenue from receipts
          const receiptRevenue = validReceipts.reduce((sum, rec) => {
            const amount = parseFloat(rec.grandTotal || rec.totalAmount || rec.amount || rec.naira) || 0;
            return sum + amount;
          }, 0);
          totalRevenue += receiptRevenue;
          
          console.log(`🧾 Added ${validReceipts.length} receipts with revenue: ₦${receiptRevenue.toLocaleString('en-NG')}`);
        } else {
          console.log('🧾 No localStorage receipts found or error:', localStorageReceipts.message);
        }
          
        // Set all dashboard values with validation
        totalMembers.value = Math.max(0, totalUsers);
        activeInvoices.value = Math.max(0, totalInvoiceCount);
        activeReceipts.value = Math.max(0, totalReceiptCount);
        monthlyRevenue.value = Math.max(0, totalRevenue).toLocaleString('en-NG');
        pendingTasks.value = Math.max(0, pendingTasksCount);
        
        console.log(`✅ Dashboard data loaded - Invoices: ${activeInvoices.value}, Receipts: ${activeReceipts.value}, Revenue: ${totalRevenue}`);

      } catch (err) {
        console.error('Error fetching branch statistics:', err);
        error.value = err?.message || 'Failed to load dashboard data';
        
        // Set safe default values
        activeInvoices.value = 0;
        activeReceipts.value = 0;
        monthlyRevenue.value = '0';
        pendingTasks.value = 0;
        totalMembers.value = 0;
      } finally {
        loading.value = false;
      }
    };

    // Watch for route changes to reload data when returning to dashboard
    watch(() => route.path, async (newPath) => {
      if (newPath === '/dashboard') {
        console.log('🔄 Dashboard route activated, reloading data...');
        await fetchBranchStats();
        loadActivities();
      }
    });

    // Reload activities when window gains focus (user comes back from another tab)
    let focusListener;
    
    onMounted(async () => {
      // Persist branch to localStorage when dashboard loads
      if (branchName.value) {
        localStorage.setItem('currentBranch', branchName.value);
      }
      
      // Load stats first, then activities to avoid simultaneous Firebase calls
      await fetchBranchStats();
      loadActivities();
      
      // Add focus listener to reload when user returns to the tab
      focusListener = () => {
        console.log('🔄 Window focused, reloading dashboard...');
        fetchBranchStats();
        loadActivities();
      };
      window.addEventListener('focus', focusListener);
    });
    
    onBeforeUnmount(() => {
      // Clean up focus listener
      if (focusListener) {
        window.removeEventListener('focus', focusListener);
      }
    });



    const loadActivities = async () => {
      // Load activities from main SmartDesignPro Firebase (localStorage)
      console.log('🔥 Loading activities from SmartDesignPro Firebase...');
      console.log(`🔍 Branch: "${branchName.value}"`);
      
      // Debug: Check all localStorage keys
      const allKeys = Object.keys(localStorage);
      const relevantKeys = allKeys.filter(key => 
        key.includes('activities') || key.includes('invoices') || key.includes('receipts')
      );
      console.log('🔍 Relevant storage keys:', relevantKeys);
      relevantKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            console.log(`  ${key}:`, Array.isArray(parsed) ? `Array(${parsed.length})` : typeof parsed);
          }
        } catch (e) {
          console.log(`  ${key}: [parse error]`);
        }
      });
      
      try {
        const activities = [];
        let exportActivitiesCount = 0;
        let invoiceActivitiesCount = 0;
        let receiptActivitiesCount = 0;
        
        // Get export activities from localStorage (logged by preview pages)
        try {
          const exportActivitiesResult = await getActivities(branchName.value, 50);
          console.log('📤 Export activities result:', exportActivitiesResult);
          if (exportActivitiesResult.success && Array.isArray(exportActivitiesResult.activities)) {
            console.log(`📤 Found ${exportActivitiesResult.activities.length} raw activities`);
            exportActivitiesResult.activities.forEach((activity, index) => {
              console.log(`  Activity ${index + 1}:`, {
                id: activity.id,
                action: activity.action,
                timestamp: activity.timestamp,
                memberName: activity.memberName,
                branch: activity.branch
              });
              if (activity && activity.id && activity.action && activity.timestamp) {
                activities.push({
                  id: activity.id || `export_${Date.now()}_${Math.random()}`,
                  action: activity.action || 'Export Activity',
                  memberName: activity.memberName || 'Unknown Member',
                  branch: activity.branch || branchName.value,
                  timestamp: activity.timestamp || new Date().toISOString(),
                  type: activity.type || 'export'
                });
                exportActivitiesCount++;
              }
            });
          }
          console.log(`📤 Loaded ${exportActivitiesCount} export activities`);
        } catch (exportErr) {
          console.warn('⚠️ Error loading export activities:', exportErr.message);
        }
        
        // Get invoices from main Firebase
        try {
          const invoicesResult = await getAllInvoices(branchName.value);
          console.log(`📄 Invoice Result:`, invoicesResult);
          if (invoicesResult.success && Array.isArray(invoicesResult.data)) {
            invoicesResult.data.forEach(invoice => {
              if (invoice && invoice.id) {
                activities.push({
                  id: `invoice_${invoice.id}`,
                  action: `Invoice Saved: ${invoice.name || invoice.invoiceNumber || invoice.organizationName || invoice.id}`,
                  memberName: invoice.createdBy || invoice.memberName || 'System User',
                  branch: branchName.value,
                  timestamp: invoice.createdAt || invoice.updatedAt || new Date().toISOString(),
                  type: 'invoice'
                });
                invoiceActivitiesCount++;
              }
            });
          }
          
          // Also check generic sdp_invoices key
          try {
            const genericInvoices = JSON.parse(localStorage.getItem('sdp_invoices') || '[]');
            console.log(`📄 Generic invoices found:`, genericInvoices.length);
            if (Array.isArray(genericInvoices)) {
              genericInvoices.forEach((invoice, idx) => {
                console.log(`  Invoice ${idx + 1}:`, {
                  id: invoice?.id,
                  name: invoice?.name,
                  branch: invoice?.branch,
                  createdAt: invoice?.createdAt,
                  updatedAt: invoice?.updatedAt,
                  hasId: !!invoice?.id
                });
                
                // Show all invoices regardless of branch (user wants to see all their saved work)
                if (invoice) {
                  const invoiceId = invoice.id || `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                  activities.push({
                    id: `invoice_generic_${invoiceId}`,
                    action: `Invoice Saved: ${invoice.name || invoice.invoiceNumber || invoice.organizationName || 'Untitled'}`,
                    memberName: invoice.createdBy || invoice.memberName || 'Unknown Member',
                    branch: invoice.branch || branchName.value,
                    timestamp: invoice.createdAt || invoice.updatedAt || new Date().toISOString(),
                    type: 'invoice'
                  });
                  invoiceActivitiesCount++;
                  console.log(`    ✅ Added invoice activity`);
                } else {
                  console.log(`    ❌ Skipped - branch mismatch or invalid invoice`);
                }
              });
            }
          } catch (e) {
            console.warn('⚠️ Error loading generic invoices:', e);
          }
          
          console.log(`📄 Loaded ${invoiceActivitiesCount} invoice creation activities`);
        } catch (invoiceErr) {
          console.warn('⚠️ Error loading invoice activities:', invoiceErr.message);
        }
        
        // Get receipts from main Firebase
        try {
          const receiptsResult = await getAllReceipts(branchName.value);
          console.log(`🧾 Receipt Result:`, receiptsResult);
          if (receiptsResult.success && Array.isArray(receiptsResult.data)) {
            receiptsResult.data.forEach(receipt => {
              if (receipt && receipt.id) {
                activities.push({
                  id: `receipt_${receipt.id}`,
                  action: `Receipt Saved: ${receipt.name || receipt.receiptNumber || receipt.organizationName || receipt.id}`,
                  memberName: receipt.createdBy || receipt.memberName || 'System User',
                  branch: branchName.value,
                  timestamp: receipt.createdAt || receipt.updatedAt || new Date().toISOString(),
                  type: 'receipt'
                });
                receiptActivitiesCount++;
              }
            });
          }
          
          // Also check generic sdp_receipts key
          try {
            const genericReceipts = JSON.parse(localStorage.getItem('sdp_receipts') || '[]');
            console.log(`🧾 Generic receipts found:`, genericReceipts.length);
            if (Array.isArray(genericReceipts)) {
              genericReceipts.forEach((receipt, idx) => {
                console.log(`  Receipt ${idx + 1}:`, {
                  id: receipt?.id,
                  name: receipt?.name,
                  branch: receipt?.branch,
                  createdAt: receipt?.createdAt,
                  updatedAt: receipt?.updatedAt,
                  hasId: !!receipt?.id
                });
                
                // Show all receipts regardless of branch (user wants to see all their saved work)
                if (receipt) {
                  const receiptId = receipt.id || `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                  activities.push({
                    id: `receipt_generic_${receiptId}`,
                    action: `Receipt Saved: ${receipt.name || receipt.receiptNumber || receipt.organizationName || 'Untitled'}`,
                    memberName: receipt.createdBy || receipt.memberName || 'Unknown Member',
                    branch: receipt.branch || branchName.value,
                    timestamp: receipt.createdAt || receipt.updatedAt || new Date().toISOString(),
                    type: 'receipt'
                  });
                  receiptActivitiesCount++;
                  console.log(`    ✅ Added receipt activity`);
                } else {
                  console.log(`    ❌ Skipped - branch mismatch or invalid receipt`);
                }
              });
            }
          } catch (e) {
            console.warn('⚠️ Error loading generic receipts:', e);
          }
          
          console.log(`🧾 Loaded ${receiptActivitiesCount} receipt creation activities`);
        } catch (receiptErr) {
          console.warn('⚠️ Error loading receipt activities:', receiptErr.message);
        }
        
        // Debug: Show all localStorage keys related to invoices/receipts
        console.log('🔍 Available localStorage keys:', Object.keys(localStorage).filter(key => 
          key.includes('invoices_') || key.includes('receipts_') || key.includes('sdp_activities_')
        ));
        
        console.log(`📊 Total activities collected: ${activities.length}`);
        console.log('📊 Activities breakdown:', {
          exports: exportActivitiesCount,
          invoices: invoiceActivitiesCount,
          receipts: receiptActivitiesCount
        });
        
        // Sort by timestamp (newest first) and limit to 10
        const validActivities = activities.filter(activity => 
          activity && activity.id && activity.timestamp
        );
        
        console.log(`✅ Valid activities after filtering: ${validActivities.length}`);
        
        validActivities.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeB - timeA; // Newest first
        });
        
        recentActivities.value = validActivities.slice(0, 10);
        
        console.log(`✅ Final activities to display (${recentActivities.value.length}):`, recentActivities.value.map(a => ({
          action: a.action,
          timestamp: a.timestamp,
          memberName: a.memberName,
          timeAgo: formatTimeAgo(a.timestamp)
        })));
        console.log(`✅ Loaded ${recentActivities.value.length} total activities from SmartDesignPro Firebase`);
      } catch (err) {
        console.error('❌ Error loading activities:', err);
        recentActivities.value = [];
      }
    };

    const refreshDashboard = async () => {
      console.log('🔄 Refreshing dashboard...');
      await fetchBranchStats();
      loadActivities();
    };

    // Handle pull-to-refresh
    const handleRefresh = async (event) => {
      console.log('🔄 Pull-to-refresh triggered...');
      isRefreshing.value = true;
      await refreshDashboard();
      setTimeout(() => {
        isRefreshing.value = false;
        event.target.complete();
      }, 500);
    };


    const formatTimeAgo = (timestamp) => {
      const now = new Date();
      const activityTime = new Date(timestamp);
      const diffMs = now - activityTime;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const getActivityIconClass = (action) => {
      const baseClass = 'h-8 w-8 rounded-full flex items-center justify-center';
      if (action.includes('Login')) {
        return `${baseClass} bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400`;
      } else if (action.includes('Export')) {
        return `${baseClass} bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400`;
      } else if (action.includes('Invoice')) {
        return `${baseClass} bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400`;
      } else if (action.includes('Receipt')) {
        return `${baseClass} bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400`;
      } else {
        return `${baseClass} bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400`;
      }
    };

    const handleGoBack = () => {
      router.replace({ name: 'Home' });
    };

    const handleCreateInvoice = () => {
      // Persist branch to localStorage
      localStorage.setItem('currentBranch', branchName.value);
      router.push({ name: 'Invoice', query: { branch: branchName.value } });
    };

    const handleCreateReceipt = () => {
      // Persist branch to localStorage
      localStorage.setItem('currentBranch', branchName.value);
      router.push({ name: 'Receipt', query: { branch: branchName.value } });
    };

    const handleViewStats = () => {
      // Navigate to Stats page
      router.push({ name: 'Stats', query: { branch: branchName.value } });
    };

    const handleBranchSettings = () => {
      try {
        router.push({ name: 'Settings', query: { branch: branchName.value } });
      } catch (error) {
        console.error('Error navigating to Settings:', error);
        router.push('/settings');
      }
    };

    const handleReports = () => {
      // Persist branch to localStorage
      localStorage.setItem('currentBranch', branchName.value);
      router.push({ name: 'Reports', query: { branch: branchName.value } });
    };

    const handleSignature = () => {
      // Persist branch to localStorage
      localStorage.setItem('currentBranch', branchName.value);
      router.push({ name: 'Signature', query: { branch: branchName.value } });
    };

    const handleSavedInvoices = () => {
      // Persist branch to localStorage
      localStorage.setItem('currentBranch', branchName.value);
      router.push({ name: 'SavedInvoices', query: { branch: branchName.value } });
    };

    const handleSavedReceipts = () => {
      // Persist branch to localStorage
      localStorage.setItem('currentBranch', branchName.value);
      router.push({ name: 'SavedReceipts', query: { branch: branchName.value } });
    };

    return {
      branchTitle,
      branchName,
      totalMembers,
      activeInvoices,
      activeReceipts,
      monthlyRevenue,
      pendingTasks,
      loading,
      error,
      recentActivities,
      showAllActivities,
      displayedActivities,
      handleGoBack,
      handleCreateInvoice,
      handleCreateReceipt,
      handleViewStats,
      handleBranchSettings,
      handleReports,
      handleSignature,
      handleSavedInvoices,
      handleSavedReceipts,
      refreshDashboard,
      handleRefresh,
      formatTimeAgo,
      getActivityIconClass,
      arrowDown,
      isRefreshing,
    };
  },
});
</script>

<style scoped>
/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.8);
}

/* Animation for cards */
.group:hover {
  transform: translateY(-2px);
}

/* Gradient animations */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

/* Custom Refresh Indicator Styles */
.custom-refresh-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  justify-content: center;
  padding-top: 20px;
  pointer-events: none;
}

.refresh-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 32px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease-out;
}

.dark .refresh-indicator {
  background: rgba(30, 41, 59, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.refresh-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.refresh-text {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
  text-align: center;
}

.dark .refresh-text {
  color: #34d399;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
