<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
          {{ documentType }} History
        </h2>
        <button
          @click="handleClose"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="flex flex-col items-center gap-3">
            <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-slate-600 dark:text-slate-400">Loading documents...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!documents || documents.length === 0" class="flex flex-col items-center justify-center py-12">
          <svg class="w-20 h-20 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg font-medium text-slate-600 dark:text-slate-400">No saved documents</p>
          <p class="text-sm text-slate-500 dark:text-slate-500 mt-1">Your saved {{ documentType.toLowerCase() }}s will appear here</p>
        </div>

        <!-- Documents List -->
        <div v-else class="grid gap-4">
          <div
            v-for="doc in documents"
            :key="doc.id"
            class="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-all"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Document Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                    {{ documentType }} #{{ doc.receiptNumber || doc.number || 'N/A' }}
                  </h3>
                  <span v-if="doc.isCorrected" class="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded">
                    Corrected
                  </span>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div class="text-slate-600 dark:text-slate-400">
                    <span class="font-medium">Date:</span> {{ formatDate(doc.date) }}
                  </div>
                  <div class="text-slate-600 dark:text-slate-400">
                    <span class="font-medium">Customer:</span> {{ doc.customerName || doc.receivedFrom || 'N/A' }}
                  </div>
                  <div class="text-slate-600 dark:text-slate-400">
                    <span class="font-medium">Total:</span> {{ formatCurrency(doc.total || doc.amount) }}
                  </div>
                  <div class="text-slate-600 dark:text-slate-400">
                    <span class="font-medium">Created:</span> {{ formatDateTime(doc.createdAt) }}
                  </div>
                </div>

                <div v-if="doc.notes" class="mt-2 text-sm text-slate-500 dark:text-slate-400 italic">
                  "{{ doc.notes }}"
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col gap-2">
                <button
                  @click="handleLoad(doc)"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Load
                </button>
                <button
                  @click="handleDelete(doc)"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
        <p class="text-sm text-slate-600 dark:text-slate-400">
          Total: <strong>{{ documents?.length || 0 }}</strong> document{{ documents?.length !== 1 ? 's' : '' }}
        </p>
        <button
          @click="handleClose"
          class="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DocumentHistoryModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    documents: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    documentType: {
      type: String,
      default: 'Document'
    }
  },
  emits: ['close', 'load', 'delete'],
  setup(props, { emit }) {
    const handleClose = () => {
      emit('close');
    };

    const handleLoad = (doc) => {
      emit('load', doc);
    };

    const handleDelete = (doc) => {
      if (confirm(`Are you sure you want to delete ${props.documentType} #${doc.receiptNumber || doc.number}?`)) {
        emit('delete', doc);
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch (e) {
        return dateString;
      }
    };

    const formatDateTime = (timestamp) => {
      if (!timestamp) return 'N/A';
      try {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return timestamp;
      }
    };

    const formatCurrency = (amount) => {
      if (amount === null || amount === undefined) return 'N/A';
      try {
        return new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN'
        }).format(amount);
      } catch (e) {
        return `₦${amount.toLocaleString()}`;
      }
    };

    return {
      handleClose,
      handleLoad,
      handleDelete,
      formatDate,
      formatDateTime,
      formatCurrency
    };
  }
});
</script>

<style scoped>
/* Backdrop blur effect */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Animation for modal */
.fixed {
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
