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
          <p class="refresh-text">Refreshing statistics...</p>
        </div>
      </div>

  <div class="h-screen overflow-y-auto bg-slate-50 dark:bg-slate-900 pt-20 md:pt-12 px-4 pb-12">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header class="flex flex-col gap-2">
        <p class="text-sm font-semibold uppercase tracking-widest text-emerald-500">Branch Analytics</p>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Transaction Statistics</h1>
            <p class="max-w-xl text-sm text-slate-600 dark:text-slate-300">
              Review historic activity by filtering or searching through recorded transactions.
            </p>
          </div>
          <BaseButton variant="secondary" @click="handleBack">Back to Dashboard</BaseButton>
        </div>
      </header>

      <section class="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
          <!-- Search Input -->
          <div class="relative flex-1 w-full sm:min-w-[220px]">
            <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
              </svg>
            </span>
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Search by name or description"
              class="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-500"
            />
          </div>
          
          <!-- Date Range Filter -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-500 dark:text-slate-300 w-full sm:w-auto">
            <label class="font-medium">Date:</label>
            <div class="flex items-center gap-2">
              <input
                v-model="filters.start"
                type="date"
                class="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
              <span>—</span>
              <input
                v-model="filters.end"
                type="date"
                class="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          
          <!-- Type Filter -->
          <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300 w-full sm:w-auto">
            <label class="font-medium whitespace-nowrap">Type:</label>
            <select
              v-model="filters.type"
              class="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="all">All</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <!-- Clear Button -->
          <div class="w-full sm:w-auto">
            <BaseButton variant="secondary" @click="resetFilters" class="w-full sm:w-auto">Clear</BaseButton>
          </div>
        </div>

        <!-- Mobile Card View (visible on small screens) -->
        <div class="mt-4 block lg:hidden space-y-3">
          <div v-for="transaction in filteredTransactions" :key="transaction.id"
               class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
               :class="{ 'bg-amber-50/30 dark:bg-amber-900/10': transaction.isCorrected }">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {{ transaction.name }}
                  <span v-if="transaction.isCorrected" class="ml-2 text-xs text-amber-600 dark:text-amber-400 italic">
                    (Corrected)
                  </span>
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {{ formatDate(transaction.date) }}
                </p>
              </div>
              <span class="inline-flex rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap"
                :class="{
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300': transaction.type === 'invoice',
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300': transaction.type === 'receipt',
                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300': transaction.type === 'other'
                }">
                {{ transaction.type }}
              </span>
            </div>
            
            <p class="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
              {{ transaction.description }}
            </p>
            
            <div class="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
              <div class="text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ formatCurrency(transaction.amount) }}
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="!transaction.isMistake && !transaction.isCorrected"
                  @click="markAsMistake(transaction)"
                  title="Mark as Mistake"
                  class="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </button>
                
                <button
                  v-if="transaction.isMistake"
                  @click="openCorrectionModal(transaction)"
                  title="Correct this Entry"
                  class="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                <span v-if="transaction.isCorrected" class="text-amber-500 dark:text-amber-400" title="This entry has been corrected">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          
          <div v-if="filteredTransactions.length === 0"
               class="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
            <p class="text-sm text-slate-500 dark:text-slate-300">
              No transactions found for the selected filters.
            </p>
          </div>
        </div>

        <!-- Desktop Table View (visible on large screens) -->
        <div class="mt-4 hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead class="bg-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-700 dark:text-slate-300">
              <tr>
                <th scope="col" class="px-4 py-3 text-left">Date</th>
                <th scope="col" class="px-4 py-3 text-left">Name</th>
                <th scope="col" class="px-4 py-3 text-left">Description</th>
                <th scope="col" class="px-4 py-3 text-left">Type</th>
                <th scope="col" class="px-4 py-3 text-right">Amount</th>
                <th scope="col" class="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900">
              <tr v-for="transaction in filteredTransactions" :key="transaction.id" 
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  :class="{ 'bg-amber-50/30 dark:bg-amber-900/10': transaction.isCorrected }">
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {{ formatDate(transaction.date) }}
                </td>
                <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                  {{ transaction.name }}
                  <span v-if="transaction.isCorrected" class="ml-2 text-xs text-amber-600 dark:text-amber-400 italic">
                    (Corrected)
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {{ transaction.description }}
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    :class="{
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300': transaction.type === 'invoice',
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300': transaction.type === 'receipt',
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300': transaction.type === 'other'
                    }">
                    {{ transaction.type }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                  {{ formatCurrency(transaction.amount) }}
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <!-- Mark as Mistake Button -->
                    <button
                      v-if="!transaction.isMistake && !transaction.isCorrected"
                      @click="markAsMistake(transaction)"
                      title="Mark as Mistake"
                      class="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </button>

                    <!-- Correct Button (only shows if marked as mistake) -->
                    <button
                      v-if="transaction.isMistake"
                      @click="openCorrectionModal(transaction)"
                      title="Correct this Entry"
                      class="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>

                    <!-- Corrected Indicator -->
                    <span v-if="transaction.isCorrected" class="text-amber-500 dark:text-amber-400" title="This entry has been corrected">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-300">
                  No transactions found for the selected filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
              {{ filteredTransactions.length }} results
            </span>
            <span class="text-sm text-slate-600 dark:text-slate-300">
              Total Amount: <strong class="text-slate-900 dark:text-white">{{ formatCurrency(totalAmount) }}</strong>
            </span>
          </div>
          <div class="text-xs text-slate-400 dark:text-slate-500">
            Data is illustrative. Integrate with backend analytics when ready.
          </div>
        </footer>
      </section>

      <!-- Correction Modal -->
      <div v-if="showCorrectionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Correct Transaction Entry</h2>
            <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Replace the incorrect entry with the correct information
            </p>
          </div>

          <div class="p-6 space-y-6">
            <!-- Original (Mistake) Entry -->
            <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <h3 class="text-sm font-semibold text-red-800 dark:text-red-300 mb-3">❌ Original Entry (Mistake)</h3>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-slate-600 dark:text-slate-400">Name:</span>
                  <p class="font-medium text-slate-900 dark:text-white">{{ mistakeEntry?.name }}</p>
                </div>
                <div>
                  <span class="text-slate-600 dark:text-slate-400">Amount:</span>
                  <p class="font-medium text-slate-900 dark:text-white">{{ formatCurrency(mistakeEntry?.amount) }}</p>
                </div>
                <div class="col-span-2">
                  <span class="text-slate-600 dark:text-slate-400">Description:</span>
                  <p class="font-medium text-slate-900 dark:text-white">{{ mistakeEntry?.description }}</p>
                </div>
              </div>
            </div>

            <!-- Correct Entry Form -->
            <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <h3 class="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">✅ Correct Entry</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                  <input
                    v-model="correctionForm.name"
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    placeholder="Enter correct name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                  <input
                    v-model.number="correctionForm.amount"
                    type="number"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    placeholder="Enter correct amount"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    v-model="correctionForm.description"
                    rows="3"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    placeholder="Enter correct description"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correction Reason</label>
                  <input
                    v-model="correctionForm.reason"
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    placeholder="Why was this corrected?"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <BaseButton variant="ghost" @click="closeCorrectionModal">Cancel</BaseButton>
            <BaseButton variant="primary" @click="applyCorrection">Apply Correction</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { computed, defineComponent, reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonPage, IonContent, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { arrowDown } from 'ionicons/icons';
import BaseButton from '@/components/BaseButton.vue';
import { useFinanceStore } from '@/stores/finance';
import { getAllInvoices, getAllReceipts } from '../api-service';

const makeTransaction = (date, name, amount, description, type, id, isCorrected = false, isMistake = false, originalId = null) => ({
  id: id || `${date}-${name}-${amount}-${type}`,
  date,
  name,
  amount,
  description,
  type,
  isCorrected,
  isMistake,
  originalId,
});

export default defineComponent({
  name: 'StatsPage',
  components: {
    BaseButton,
    IonPage,
    IonContent,
    IonRefresher,
    IonRefresherContent
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const financeStore = useFinanceStore();

    const allTransactions = ref([]);
    const loading = ref(true);
    const isRefreshing = ref(false);
    const showCorrectionModal = ref(false);
    const mistakeEntry = ref(null);
    const correctionForm = reactive({
      name: '',
      amount: 0,
      description: '',
      reason: '',
    });

    // Get branch from route or authenticated member
    const branch = ref('');
    
    onMounted(async () => {
      // Get branch info
      const storedMember = localStorage.getItem('authenticatedMember');
      if (storedMember) {
        const member = JSON.parse(storedMember);
        branch.value = member.branch || route.query.branch || 'Unknown';
      } else {
        branch.value = route.query.branch || 'Unknown';
      }

      // Check if returning from correction (pendingCorrection was cleared)
      const urlParams = new URLSearchParams(window.location.search);
      const fromCorrection = urlParams.get('corrected');
      
      if (fromCorrection) {
        console.log('Reloading after correction...');
        // Remove the query parameter
        window.history.replaceState({}, '', window.location.pathname);
      }

      await loadAllTransactions();
    });

    // Load real data from Firebase
    const loadAllTransactions = async () => {
      loading.value = true;
      try {
        const transactionsList = [];

        // Load Invoices
        const invoicesResult = await getAllInvoices(branch.value);
        if (invoicesResult.success && invoicesResult.data.length > 0) {
          invoicesResult.data.forEach(invoice => {
            // Use grandTotal, or fall back to total, or subtotal
            const amount = invoice.grandTotal || invoice.total || invoice.subtotal || 0;
            
            transactionsList.push(makeTransaction(
              invoice.date || new Date().toISOString().split('T')[0],
              invoice.customerName || invoice.billTo || 'Unknown',
              amount,
              `Invoice #${invoice.invoiceNumber || invoice.receiptNumber || 'N/A'} - ${invoice.items?.length || 0} items`,
              'invoice',
              invoice.id,
              invoice.isCorrected || false,
              invoice.isMistake || false,
              invoice.originalId || null
            ));
          });
        }

        // Load Receipts
        const receiptsResult = await getAllReceipts(branch.value);
        if (receiptsResult.success && receiptsResult.data.length > 0) {
          receiptsResult.data.forEach(receipt => {
            transactionsList.push(makeTransaction(
              receipt.date || new Date().toISOString().split('T')[0],
              receipt.receivedFrom || 'Unknown',
              receipt.grandTotal || receipt.naira || 0,
              `Receipt #${receipt.receiptNumber || 'N/A'} - ${receipt.paymentFor || receipt.sumOf || 'Payment'}`,
              'receipt',
              receipt.id,
              receipt.isCorrected || false,
              receipt.isMistake || false,
              receipt.originalId || null
            ));
          });
        }

        // Sort by date (newest first)
        allTransactions.value = transactionsList.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );

      } catch (error) {
        console.error('Error loading transactions:', error);
        alert('Failed to load transactions. Please try again.');
      } finally {
        loading.value = false;
      }
    };

    const handleRefresh = async (event) => {
      console.log('🔄 Pull-to-refresh: Reloading statistics...');
      isRefreshing.value = true;
      await loadAllTransactions();
      setTimeout(() => {
        isRefreshing.value = false;
        event.target.complete();
      }, 500);
    };

    const transactions = computed(() => {
      if (allTransactions.value.length === 0) {
        // Fallback data if no real data
        return [
          makeTransaction('2025-10-18', 'No Data', 0, 'No transactions found. Create invoices or receipts to see them here.', 'other', 'fallback-1'),
        ];
      }
      return allTransactions.value;
    });

    const searchTerm = ref('');
    const filters = reactive({ start: '', end: '', type: 'all' });

    const matchesSearch = (transaction, query) => {
      if (!query) return true;
      const haystack = `${transaction.name} ${transaction.description}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    };

    const matchesDate = (transaction, { start, end }) => {
      if (!start && !end) return true;
      const txDate = new Date(transaction.date);
      if (start) {
        const from = new Date(start);
        if (txDate < from) return false;
      }
      if (end) {
        const to = new Date(end);
        if (txDate > to) return false;
      }
      return true;
    };

    const matchesType = (transaction, type) => type === 'all' || transaction.type === type;

    const filteredTransactions = computed(() =>
      transactions.value.filter((transaction) =>
        matchesSearch(transaction, searchTerm.value) &&
        matchesDate(transaction, filters) &&
        matchesType(transaction, filters.type)
      )
    );

    const totalAmount = computed(() =>
      filteredTransactions.value.reduce((sum, tx) => sum + tx.amount, 0)
    );

    const resetFilters = () => {
      searchTerm.value = '';
      filters.start = '';
      filters.end = '';
      filters.type = 'all';
    };

    // Mark transaction as mistake and redirect to correction page
    const markAsMistake = async (transaction) => {
      if (!confirm(`Mark "${transaction.name}" as a mistake?\n\nYou will be redirected to the ${transaction.type === 'invoice' ? 'Invoice' : 'Receipt'} page to redo the work.`)) {
        return;
      }

      try {
        // Store mistake information in localStorage for the target page to pick up
        const mistakeData = {
          id: transaction.id,
          type: transaction.type,
          originalData: transaction,
          timestamp: Date.now(),
          branch: branch.value
        };
        
        localStorage.setItem('pendingCorrection', JSON.stringify(mistakeData));
        
        // Redirect to appropriate page based on transaction type
        if (transaction.type === 'invoice') {
          router.push({ 
            name: 'Invoice', 
            query: { 
              branch: branch.value,
              correction: transaction.id 
            }
          });
        } else if (transaction.type === 'receipt') {
          router.push({ 
            name: 'Receipt', 
            query: { 
              branch: branch.value,
              correction: transaction.id 
            }
          });
        } else {
          alert('Cannot correct this type of transaction.');
        }
      } catch (error) {
        console.error('Error marking as mistake:', error);
        alert('Failed to process correction. Please try again.');
      }
    };

    // Open correction - now just redirects (kept for backward compatibility)
    const openCorrectionModal = (transaction) => {
      markAsMistake(transaction);
    };

    // Not used anymore but kept for compatibility
    const closeCorrectionModal = () => {
      showCorrectionModal.value = false;
    };

    const applyCorrection = () => {
      // Not used anymore - corrections happen on Invoice/Receipt pages
    };

    const formatCurrency = (value) =>
      new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value || 0);

    const formatDate = (value) =>
      new Intl.DateTimeFormat('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(value));

    const handleBack = () => {
      router.push({ name: 'Dashboard' });
    };

    return {
      transactions,
      searchTerm,
      filters,
      filteredTransactions,
      totalAmount,
      loading,
      isRefreshing,
      handleRefresh,
      arrowDown,
      resetFilters,
      formatCurrency,
      formatDate,
      handleBack,
      // Correction functionality
      showCorrectionModal,
      mistakeEntry,
      correctionForm,
      markAsMistake,
      openCorrectionModal,
      closeCorrectionModal,
      applyCorrection,
    };
  },
});
</script>

<style scoped>
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
