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
              <h1 class="text-lg font-bold text-slate-900 dark:text-white truncate">Saved Receipts</h1>
              <p class="text-xs text-slate-600 dark:text-slate-400 truncate">
                Branch: {{ currentBranch }}
              </p>
            </div>
          </div>
          
          <!-- Bottom Row: Action Buttons -->
          <div class="flex gap-2">
            <button
              @click="refreshReceipts"
              :disabled="isLoading"
              class="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm flex-1"
            >
              <svg class="w-4 h-4" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="hidden xs:inline">{{ isLoading ? 'Loading...' : 'Refresh' }}</span>
            </button>
            
            <button
              @click="createNewReceipt"
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
              <h1 class="text-xl font-bold text-slate-900 dark:text-white">Saved Receipts</h1>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Manage your saved receipts • Branch: {{ currentBranch }}
              </p>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button
              @click="refreshReceipts"
              :disabled="isLoading"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <svg class="w-4 h-4" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ isLoading ? 'Loading...' : 'Refresh' }}
            </button>
            
            <button
              @click="createNewReceipt"
              class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Receipt
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="max-w-7xl mx-auto mb-6">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700">
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">Total Receipts</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ filteredReceipts.length }}</p>
            </div>
            <div class="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">This Month</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ receiptsThisMonth }}</p>
            </div>
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">₦{{ totalAmount.toLocaleString() }}</p>
            </div>
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          
          <div class="p-4 flex items-center justify-between">
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
                placeholder="Search receipts by customer name, receipt number, or description..."
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
              <option value="receiptNumber">Receipt Number</option>
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
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Receipts Grid -->
    <div class="max-w-7xl mx-auto">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <svg class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Loading receipts...
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredReceipts.length === 0" class="text-center py-12">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
            <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Receipts Found</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-6">
            {{ searchQuery ? 'No receipts match your search criteria.' : 'You haven\'t created any receipts yet.' }}
          </p>
          <button
            @click="createNewReceipt"
            class="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Receipt
          </button>
        </div>

        <!-- Receipts Grid -->
        <div v-else class="grid grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            v-for="receipt in paginatedReceipts"
            :key="receipt.id"
            class="group cursor-pointer border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-lg transition-all duration-200 overflow-hidden bg-white dark:bg-slate-700"
            @click="viewReceipt(receipt)"
          >
            <!-- Receipt Preview -->
            <div class="relative p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
              <div class="aspect-[3/4] bg-white rounded-lg shadow-sm overflow-hidden">
                <!-- Mini Receipt Preview -->
                <div class="p-3 text-xs">
                  <div class="text-center mb-2">
                    <div v-if="receipt.organizationName" class="font-bold text-slate-800">{{ receipt.organizationName }}</div>
                    <div v-if="receipt.organizationSubName" class="text-slate-600">{{ receipt.organizationSubName }}</div>
                    <div class="text-xs text-slate-500 mt-1">Branch: {{ receipt.branch || currentBranch }}</div>
                  </div>
                  
                  <div class="border-t border-b border-slate-200 py-1 mb-2">
                    <div class="text-center font-semibold">RECEIPT #{{ formatReceiptNumber(receipt.receiptNumber) }}</div>
                  </div>
                  
                  <div class="space-y-1 text-slate-600">
                    <div><strong>From:</strong> {{ receipt.receivedFrom || 'N/A' }}</div>
                    <div><strong>Date:</strong> {{ formatDate(receipt.date) }}</div>
                    <div><strong>Payment For:</strong> {{ receipt.paymentFor || 'N/A' }}</div>
                    <div><strong>Amount:</strong> {{ formatCurrency(receipt.naira || 0) }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Quick Actions Overlay -->
              <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div class="flex gap-2">
                  <button
                    @click.stop="editReceipt(receipt)"
                    class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Edit Receipt"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    @click.stop="duplicateReceipt(receipt)"
                    class="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    title="Duplicate Receipt"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  <button
                    @click.stop="deleteReceipt(receipt)"
                    class="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete Receipt"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Receipt Info -->
            <div class="p-3">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-slate-900 dark:text-white truncate">
                  {{ receipt.receivedFrom || 'Unnamed Receipt' }}
                </h3>
                <span class="text-xs text-slate-500 dark:text-slate-400">{{ getTimeAgo(receipt.createdAt) }}</span>
              </div>
              
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Receipt #{{ formatReceiptNumber(receipt.receiptNumber) }}
              </p>
              
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {{ formatCurrency(receipt.naira || 0) }}
                </span>
                <span class="text-xs text-slate-500 dark:text-slate-400">
                  {{ formatDate(receipt.date) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-600 dark:text-slate-400">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredReceipts.length) }} of {{ filteredReceipts.length }} receipts
            </span>
          </div>
          
          <div class="flex items-center gap-2">
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
const receipts = ref([])
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
  
  loadReceipts()
})



// Load receipts from Firebase/localStorage
const loadReceipts = async () => {
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
        alert('Please log in to view saved receipts')
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
      const { getReceipts } = await import('@/firebase/database')
      const result = await getReceipts(member.branch)
      if (result.success) {
        receipts.value = result.receipts || []
      } else {
        console.error('Firebase error:', result.error)
        // Fallback to localStorage
        const localReceipts = localStorage.getItem(`sdp_receipts_${member.branch}`)
        if (localReceipts) {
          receipts.value = JSON.parse(localReceipts)
        }
      }
    } catch (error) {
      console.error('Error loading from Firebase:', error)
      // Fallback to localStorage
      const localReceipts = localStorage.getItem(`sdp_receipts_${member.branch}`)
      if (localReceipts) {
        receipts.value = JSON.parse(localReceipts)
      }
    }
  } catch (error) {
    console.error('Error loading receipts:', error)
    alert('Error loading receipts. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// Refresh receipts
const refreshReceipts = () => {
  loadReceipts()
}

// Computed properties
const filteredReceipts = computed(() => {
  let filtered = [...receipts.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(receipt => 
      (receipt.receivedFrom || '').toLowerCase().includes(query) ||
      (receipt.organizationName || '').toLowerCase().includes(query) ||
      (receipt.paymentFor || '').toLowerCase().includes(query) ||
      (receipt.receiptNumber || '').toString().includes(query)
    )
  }

  // Apply date filter
  if (filterPeriod.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    filtered = filtered.filter(receipt => {
      const receiptDate = new Date(receipt.date || receipt.createdAt)
      const diffMs = now.getTime() - receiptDate.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      switch (filterPeriod.value) {
        case 'today':
          return receiptDate >= today
        case 'week':
          return diffDays <= 7
        case 'month':
          return diffDays <= 30
        case 'quarter':
          return diffDays <= 90
        case 'year':
          return diffDays <= 365
        default:
          return true
      }
    })
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'dateDesc':
        return new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
      case 'dateAsc':
        return new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime()
      case 'customerName':
        return (a.receivedFrom || '').localeCompare(b.receivedFrom || '')
      case 'receiptNumber':
        return (a.receiptNumber || 0) - (b.receiptNumber || 0)
      default:
        return 0
    }
  })

  return filtered
})

// Pagination computed properties
const totalPages = computed(() => Math.ceil(filteredReceipts.value.length / itemsPerPage.value))
const paginatedReceipts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredReceipts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  const maxVisible = 5
  
  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Stats computed properties
const receiptsThisMonth = computed(() => {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return receipts.value.filter(receipt => {
    const receiptDate = new Date(receipt.createdAt || receipt.date)
    return receiptDate >= firstDayOfMonth
  }).length
})

const totalAmount = computed(() => {
  return receipts.value.reduce((sum, receipt) => {
    return sum + (parseFloat(receipt.naira) || 0)
  }, 0)
})

const storageUsed = computed(() => {
  const sizeBytes = JSON.stringify(receipts.value).length
  return (sizeBytes / (1024 * 1024)).toFixed(2)
})

// Actions
const createNewReceipt = () => {
  router.push({ path: '/receipt', query: { branch: currentBranch.value } })
}

const viewReceipt = (receipt) => {
  router.push({ 
    path: '/receipt-preview', 
    query: { 
      branch: currentBranch.value,
      receiptId: receipt.id 
    } 
  })
}

const editReceipt = (receipt) => {
  router.push({ 
    path: '/receipt', 
    query: { 
      branch: currentBranch.value,
      edit: receipt.id 
    } 
  })
}

const duplicateReceipt = async (receipt) => {
  try {
    const duplicatedReceipt = {
      ...receipt,
      id: undefined,
      receiptNumber: undefined, // Will get auto-generated
      createdAt: new Date().toISOString(),
      receivedFrom: `${receipt.receivedFrom} (Copy)`
    }

    const memberData = localStorage.getItem('authenticatedMember')
    if (memberData) {
      const member = JSON.parse(memberData)
      
      // Try Firebase first
      try {
        const { saveReceipt } = await import('@/firebase/database')
        const result = await saveReceipt(member.branch, duplicatedReceipt)
        if (result.success) {
          await loadReceipts()
          alert('Receipt duplicated successfully!')
          return
        }
      } catch (error) {
        console.error('Firebase save failed:', error)
      }

      // Fallback to localStorage
      const localReceipts = JSON.parse(localStorage.getItem(`sdp_receipts_${member.branch}`) || '[]')
      duplicatedReceipt.id = Date.now().toString()
      duplicatedReceipt.receiptNumber = localReceipts.length + 1
      localReceipts.push(duplicatedReceipt)
      localStorage.setItem(`sdp_receipts_${member.branch}`, JSON.stringify(localReceipts))
      await loadReceipts()
      alert('Receipt duplicated successfully!')
    }
  } catch (error) {
    console.error('Error duplicating receipt:', error)
    alert('Error duplicating receipt. Please try again.')
  }
}

const deleteReceipt = async (receipt) => {
  if (!confirm(`Are you sure you want to delete receipt #${formatReceiptNumber(receipt.receiptNumber)}?`)) {
    return
  }

  try {
    const memberData = localStorage.getItem('authenticatedMember')
    if (memberData) {
      const member = JSON.parse(memberData)
      
      // Try Firebase first
      try {
        // TODO: Implement deleteReceipt in @/firebase/database
        // const { deleteReceipt: deleteFromFirebase } = await import('@/firebase/database')
        // const result = await deleteFromFirebase(member.branch, receipt.id)
        console.log('Firebase delete not yet implemented for receipt:', receipt.id)
      } catch (error) {
        console.error('Firebase delete failed:', error)
      }

      // Fallback to localStorage
      const localReceipts = JSON.parse(localStorage.getItem(`sdp_receipts_${member.branch}`) || '[]')
      const filteredReceipts = localReceipts.filter(r => r.id !== receipt.id)
      localStorage.setItem(`sdp_receipts_${member.branch}`, JSON.stringify(filteredReceipts))
      await loadReceipts()
      
      // Log delete activity
      await logActivity(member.branch, {
        action: `Receipt Deleted`,
        memberName: member.name || 'Unknown Member',
        type: 'other',
        details: {
          documentNumber: receipt.receiptNumber || receipt.id,
          amount: receipt.naira || receipt.amount || '0'
        }
      });
      
      alert('Receipt deleted successfully!')
    }
  } catch (error) {
    console.error('Error deleting receipt:', error)
    alert('Error deleting receipt. Please try again.')
  }
}

// Utility functions
const formatReceiptNumber = (number) => {
  return number ? number.toString().padStart(4, '0') : '0001'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatCurrency = (amount) => {
  return `₦${parseFloat(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const getTimeAgo = (dateStr) => {
  if (!dateStr) return 'Unknown'
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}
</script>

<style scoped>
/* Additional styles if needed */
</style>