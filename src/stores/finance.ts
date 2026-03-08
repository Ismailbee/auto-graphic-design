import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFinanceStore = defineStore('finance', () => {
  // Receipt number management
  const receiptNumber = ref(1);
  const autoReceiptNumber = ref(true);

  // Invoice number management
  const invoiceNumber = ref(1);
  const autoInvoiceNumber = ref(true);

  // Actions
  const setReceiptNumber = (num: number) => {
    receiptNumber.value = Math.max(1, num);
  };

  const incrementReceiptNumber = () => {
    if (autoReceiptNumber.value) {
      receiptNumber.value += 1;
    }
  };

  const setInvoiceNumber = (num: number) => {
    invoiceNumber.value = Math.max(1, num);
  };

  const incrementInvoiceNumber = () => {
    if (autoInvoiceNumber.value) {
      invoiceNumber.value += 1;
    }
  };

  const resetReceiptNumber = () => {
    receiptNumber.value = 1;
  };

  const resetInvoiceNumber = () => {
    invoiceNumber.value = 1;
  };

  return {
    // Receipt state
    receiptNumber,
    autoReceiptNumber,
    
    // Invoice state
    invoiceNumber,
    autoInvoiceNumber,

    // Receipt actions
    setReceiptNumber,
    incrementReceiptNumber,
    resetReceiptNumber,

    // Invoice actions
    setInvoiceNumber,
    incrementInvoiceNumber,
    resetInvoiceNumber
  };
});
