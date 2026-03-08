<template>
  <div class="h-screen overflow-y-auto bg-slate-100 dark:bg-slate-900 pt-3 md:pt-4 px-4 pb-4">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-3">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
        <!-- Mobile Layout -->
        <div class="flex flex-col gap-3 sm:hidden">
          <!-- Top Row: Back Button + Title -->
          <div class="flex items-center gap-2">
            <button
              @click="$router.push({ name: 'Dashboard', query: { branch: currentBranch } })"
              class="hidden p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors flex-shrink-0"
              title="Go Back"
            >
              <svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div class="flex-1 min-w-0">
              <h1 class="text-lg font-bold text-slate-900 dark:text-white truncate">Saved Invoices</h1>
              <p class="text-xs text-slate-600 dark:text-slate-400 truncate">
                Branch: {{ currentBranch }}
              </p>
            </div>
          </div>
          
          <!-- Bottom Row: Action Buttons -->
          <div class="flex gap-2">
            <button
              @click="refreshInvoices"
              :disabled="isLoading"
              class="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm flex-1"
            >
              <svg class="w-4 h-4" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="hidden xs:inline">{{ isLoading ? 'Loading...' : 'Refresh' }}</span>
            </button>
            
            <button
              @click="createNewInvoice"
              class="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm flex-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden xs:inline">Create New</span>
            </button>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden sm:flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              @click="$router.push({ name: 'Dashboard', query: { branch: currentBranch } })"
              class="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors"
              title="Go Back"
            >
              <svg class="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 class="text-xl font-bold text-slate-900 dark:text-white">Saved Invoices</h1>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Manage your saved invoices • Branch: {{ currentBranch }}
              </p>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button
              @click="refreshInvoices"
              :disabled="isLoading"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <svg class="w-4 h-4" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ isLoading ? 'Loading...' : 'Refresh' }}
            </button>
            
            <button
              @click="createNewInvoice"
              class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Invoice
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">Total Invoices</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ invoices.length }}</p>
            </div>
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">This Month</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ monthlyCount }}</p>
            </div>
            <div class="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">Recent Activity</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ recentCount }}</p>
            </div>
            <div class="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">Storage Used</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ storageUsed }}MB</p>
            </div>
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="max-w-7xl mx-auto mb-6">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search invoices by customer name, invoice number, or description..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          
          <!-- Filters -->
          <div class="flex gap-2">
            <select
              v-model="sortBy"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="dateDesc">Newest First</option>
              <option value="dateAsc">Oldest First</option>
              <option value="customerName">Customer Name</option>
              <option value="invoiceNumber">Invoice Number</option>
            </select>
            
            <select
              v-model="filterPeriod"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoices Grid -->
    <div class="max-w-7xl mx-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading invoices...
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="paginatedInvoices.length === 0" class="text-center py-12">
        <div class="mx-auto h-24 w-24 text-slate-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">No invoices found</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-4">
          {{ searchQuery ? 'No invoices match your search criteria.' : 'You haven\'t created any invoices yet.' }}
        </p>
        <button
          @click="createNewInvoice"
          class="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Invoice
        </button>
      </div>

      <!-- Invoices Grid -->
      <div v-else class="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        <div
          v-for="invoice in paginatedInvoices"
          :key="invoice.id"
          class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 overflow-hidden group"
        >
          <!-- Invoice Preview -->
          <div class="relative p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
            <div class="aspect-[3/4] bg-white rounded-lg shadow-sm overflow-hidden">
              <!-- Mini Invoice Preview -->
              <div class="p-3 text-xs">
                <div class="text-center mb-2">
                  <div v-if="invoice.organizationName" class="font-bold text-slate-800">{{ invoice.organizationName }}</div>
                  <div v-if="invoice.organizationSubName" class="text-slate-600">{{ invoice.organizationSubName }}</div>
                  <div class="text-xs text-slate-500 mt-1">Branch: {{ invoice.branch || currentBranch }}</div>
                </div>
                
                <div class="border-t border-b border-slate-200 py-1 mb-2">
                  <div class="text-center font-semibold">INVOICE #{{ formatInvoiceNumber(invoice.invoiceNumber) }}</div>
                </div>
                
                <div class="space-y-1 text-slate-600">
                  <div><strong>Customer:</strong> {{ invoice.customerName || 'N/A' }}</div>
                  <div><strong>Date:</strong> {{ formatDate(invoice.invoiceDate) }}</div>
                  <div><strong>Items:</strong> {{ getItemCount(invoice.items) }}</div>
                  <div><strong>Total:</strong> {{ formatCurrency(calculateTotal(invoice.items)) }}</div>
                </div>
              </div>
            </div>
            
            <!-- Quick Actions Overlay -->
            <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div class="flex gap-2">
                <button
                  @click="editInvoice(invoice)"
                  class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Edit Invoice"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                
                <button
                  @click="duplicateInvoice(invoice)"
                  class="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  title="Duplicate Invoice"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <button
                  @click="deleteInvoice(invoice)"
                  class="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Delete Invoice"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Invoice Details -->
          <div class="p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-semibold text-slate-900 dark:text-white">
                  {{ invoice.name || 'Unnamed Invoice' }}
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                  Invoice #{{ formatInvoiceNumber(invoice.invoiceNumber) }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-slate-900 dark:text-white">
                  {{ formatCurrency(calculateTotal(invoice.items)) }}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  {{ formatDate(invoice.invoiceDate) }}
                </div>
              </div>
            </div>
            
            <!-- Status and Metadata -->
            <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
              <span>Items: {{ getItemCount(invoice.items) }}</span>
              <span>{{ formatDate(invoice.createdAt, true) }}</span>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button
                @click="editInvoice(invoice)"
                class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Edit
              </button>
              
              <button
                @click="duplicateInvoice(invoice)"
                class="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors text-sm font-medium"
              >
                Copy
              </button>
              
              <button
                @click="showInvoiceMenu(invoice)"
                class="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="max-w-7xl mx-auto mt-8">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-600 dark:text-slate-400">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredInvoices.length) }} of {{ filteredInvoices.length }} invoices
          </div>
          
          <div class="flex gap-2">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:disabled:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div class="flex gap-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-2 rounded-lg transition-colors',
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 dark:disabled:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { logActivity } from '../../api-service'

// Reactive data
const router = useRouter()
const invoices = ref([])
const isLoading = ref(false)
const searchQuery = ref('')
const sortBy = ref('dateDesc')
const filterPeriod = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const currentBranch = ref('')

// Load current branch
onMounted(async () => {
  // Try multiple localStorage keys for member data
  const memberData = localStorage.getItem('authenticatedMember') || 
                     localStorage.getItem('sdp_authenticated_member') ||
                     localStorage.getItem('sdp_member_data')
  
  if (memberData) {
    try {
      const member = JSON.parse(memberData)
      currentBranch.value = member.branch || 'Unknown'
      console.log('✅ Loaded member branch:', currentBranch.value)
    } catch (e) {
      console.error('❌ Error parsing member data:', e)
      currentBranch.value = 'Unknown'
    }
  } else {
    console.warn('⚠️ No member data found in localStorage')
    currentBranch.value = 'Unknown'
  }
  
  loadInvoices()
})



// Load invoices from Firebase/localStorage
const loadInvoices = async () => {
  isLoading.value = true
  try {
    // Try multiple localStorage keys for member data
    let memberData = localStorage.getItem('authenticatedMember') || 
                     localStorage.getItem('sdp_authenticated_member') ||
                     localStorage.getItem('sdp_member_data')
    
    if (!memberData) {
      console.warn('⚠️ No member data found in localStorage, using current branch from component state')
      // Use the branch from component state as fallback
      if (!currentBranch.value || currentBranch.value === 'Unknown') {
        alert('Please log in to view saved invoices')
        return
      }
      // Create temporary member data from current branch
      memberData = JSON.stringify({ branch: currentBranch.value, name: 'User', role: 'member' })
    }

    const member = JSON.parse(memberData)
    if (!member.branch) {
      console.error('No branch information found')
      return
    }

    // Load from Firebase first
    try {
      const { getInvoices } = await import('@/firebase/database')
      const result = await getInvoices(member.branch)
      if (result.success) {
        invoices.value = result.invoices || []
      } else {
        console.error('Firebase error:', result.error)
        // Fallback to localStorage
        const localInvoices = localStorage.getItem(`sdp_invoices_${member.branch}`)
        if (localInvoices) {
          invoices.value = JSON.parse(localInvoices)
        }
      }
    } catch (error) {
      console.error('Error loading from Firebase:', error)
      // Fallback to localStorage
      const localInvoices = localStorage.getItem(`sdp_invoices_${member.branch}`)
      if (localInvoices) {
        invoices.value = JSON.parse(localInvoices)
      }
    }
  } catch (error) {
    console.error('Error loading invoices:', error)
    alert('Error loading invoices. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// Refresh invoices
const refreshInvoices = () => {
  loadInvoices()
}

// Computed properties
const filteredInvoices = computed(() => {
  let filtered = [...invoices.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(invoice => 
      (invoice.customerName || '').toLowerCase().includes(query) ||
      (invoice.organizationName || '').toLowerCase().includes(query) ||
      String(invoice.invoiceNumber || '').toLowerCase().includes(query) ||
      (invoice.items || []).some(item => 
        (item.description || '').toLowerCase().includes(query)
      )
    )
  }

  // Apply date filter
  if (filterPeriod.value !== 'all') {
    const now = new Date()
    const filterDate = new Date()

    switch (filterPeriod.value) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        filterDate.setDate(now.getDate() - 7)
        break
      case 'month':
        filterDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3)
        break
    }

    filtered = filtered.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt || invoice.invoiceDate)
      return invoiceDate >= filterDate
    })
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'dateDesc':
        return new Date(b.createdAt || b.invoiceDate).getTime() - new Date(a.createdAt || a.invoiceDate).getTime()
      case 'dateAsc':
        return new Date(a.createdAt || a.invoiceDate).getTime() - new Date(b.createdAt || b.invoiceDate).getTime()
      case 'customerName':
        return (a.customerName || '').localeCompare(b.customerName || '')
      case 'invoiceNumber':
        return String(a.invoiceNumber || '').localeCompare(String(b.invoiceNumber || ''))
      default:
        return 0
    }
  })

  return filtered
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredInvoices.value.length / itemsPerPage.value))
const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredInvoices.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Stats
const monthlyCount = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return invoices.value.filter(invoice => {
    const invoiceDate = new Date(invoice.createdAt || invoice.invoiceDate)
    return invoiceDate >= startOfMonth
  }).length
})

const recentCount = computed(() => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return invoices.value.filter(invoice => {
    const invoiceDate = new Date(invoice.createdAt || invoice.invoiceDate)
    return invoiceDate >= sevenDaysAgo
  }).length
})

const storageUsed = computed(() => {
  const dataSize = JSON.stringify(invoices.value).length
  return (dataSize / (1024 * 1024)).toFixed(2) // Convert to MB
})

// Actions
const createNewInvoice = () => {
  // Clear any existing invoice data
  localStorage.removeItem('invoicePreviewData')
  localStorage.removeItem('generateInvoiceFormData')
  localStorage.removeItem('invoiceQuickSettings')
  
  // Navigate to new invoice creation
  router.push({ path: '/invoice', query: { branch: currentBranch.value } })
}

const editInvoice = (invoice) => {
  // Set the invoice data for editing
  const editData = {
    ...invoice,
    fromSavedInvoice: true
  }
  
  localStorage.setItem('invoicePreviewData', JSON.stringify(editData))
  
  // Navigate to invoice preview for editing
  router.push({ path: '/invoice-preview', query: { branch: currentBranch.value } })
}

const duplicateInvoice = (invoice) => {
  const duplicateData = {
    ...invoice,
    id: undefined,
    invoiceNumber: (invoice.invoiceNumber || 1) + 1000, // Add large number to avoid conflicts
    customerName: `${invoice.customerName || 'Customer'} (Copy)`,
    createdAt: new Date().toISOString(),
    fromSavedInvoice: true
  }
  
  localStorage.setItem('invoicePreviewData', JSON.stringify(duplicateData))
  router.push({ path: '/invoice-preview', query: { branch: currentBranch.value } })
}

const deleteInvoice = async (invoice) => {
  if (!confirm(`Are you sure you want to delete invoice #${formatInvoiceNumber(invoice.invoiceNumber)}?`)) {
    return
  }

  try {
    const memberData = localStorage.getItem('authenticatedMember')
    if (!memberData) return

    const member = JSON.parse(memberData)
    
    // Delete from Firebase
    try {
      // TODO: Implement deleteInvoice in @/firebase/database
      // const { deleteInvoice: deleteFromFirebase } = await import('@/firebase/database')
      // await deleteFromFirebase(member.branch, invoice.id)
      console.log('Firebase delete not yet implemented for invoice:', invoice.id)
    } catch (error) {
      console.error('Error deleting from Firebase:', error)
    }

    // Remove from local array
    invoices.value = invoices.value.filter(inv => inv.id !== invoice.id)
    
    // Update localStorage backup
    localStorage.setItem(`sdp_invoices_${member.branch}`, JSON.stringify(invoices.value))
    
    // Log delete activity
    await logActivity(member.branch, {
      action: `Invoice Deleted`,
      memberName: member.name || 'Unknown Member',
      type: 'other',
      details: {
        documentNumber: invoice.invoiceNumber || invoice.id,
        amount: invoice.grandTotal || '0'
      }
    });
    
    alert('Invoice deleted successfully!')
  } catch (error) {
    console.error('Error deleting invoice:', error)
    alert('Error deleting invoice. Please try again.')
  }
}

const showInvoiceMenu = (invoice) => {
  // For now, just show a simple context menu
  const action = prompt('Choose action:\n1. Edit\n2. Duplicate\n3. Delete\n\nEnter number (1-3):')
  
  switch (action) {
    case '1':
      editInvoice(invoice)
      break
    case '2':
      duplicateInvoice(invoice)
      break
    case '3':
      deleteInvoice(invoice)
      break
  }
}

// Utility functions
const formatDate = (dateStr, relative = false) => {
  if (!dateStr) return 'N/A'
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Invalid Date'
  
  if (relative) {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }
  
  return date.toLocaleDateString()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount || 0)
}

const formatInvoiceNumber = (number) => {
  return String(number || 1).padStart(4, '0')
}

const calculateTotal = (items) => {
  if (!Array.isArray(items)) return 0
  return items.reduce((total, item) => {
    const quantity = parseFloat(item.quantity) || 0
    const price = parseFloat(item.price) || 0
    const tax = parseFloat(item.tax) || 0
    return total + (quantity * price) + tax
  }, 0)
}

const getItemCount = (items) => {
  if (!Array.isArray(items)) return 0
  return items.filter(item => item.description?.trim()).length
}
</script>

<style scoped>
/* Add any custom styles here */
</style>