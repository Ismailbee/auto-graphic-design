import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useReceiptStore = defineStore('receipt', () => {
  // Receipt form fields
  const date = ref(new Date().toISOString().split('T')[0]);
  const autoDate = ref(true);
  const receivedFrom = ref('');
  const sumOf = ref('');
  const naira = ref('');
  const kobo = ref('');
  const paymentFor = ref('');
  const signatureName = ref('');

  // Amount in words computed
  const amountInWords = computed(() => {
    const nairaVal = parseFloat(naira.value || '0');
    const koboVal = parseFloat(kobo.value || '0');
    const total = nairaVal + koboVal / 100;
    return {
      words: convertNumberToWords(total),
      amount: total
    };
  });

  // Actions
  const incrementReceiptNumber = () => {
    // This will be handled by financeStore
    return true;
  };

  const ensureRanges = () => {
    // Ensure numeric values are within valid ranges
    if (naira.value) {
      naira.value = Math.max(0, parseFloat(naira.value) || 0).toString();
    }
    if (kobo.value) {
      const koboNum = Math.max(0, Math.min(99, parseFloat(kobo.value) || 0));
      kobo.value = koboNum.toString();
    }
  };

  const resetForm = () => {
    date.value = new Date().toISOString().split('T')[0];
    autoDate.value = true;
    receivedFrom.value = '';
    sumOf.value = '';
    naira.value = '';
    kobo.value = '';
    paymentFor.value = '';
    signatureName.value = '';
  };

  return {
    // State
    date,
    autoDate,
    receivedFrom,
    sumOf,
    naira,
    kobo,
    paymentFor,
    signatureName,
    amountInWords,

    // Actions
    incrementReceiptNumber,
    ensureRanges,
    resetForm
  };
});

// Helper function to convert numbers to words
function convertNumberToWords(num) {
  if (num === 0) return 'Zero Naira Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  function convertLessThanThousand(n) {
    if (n === 0) return '';
    
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result;
  }

  let result = '';
  let nairaAmount = Math.floor(num);
  const kobo = Math.round((num - nairaAmount) * 100);

  if (nairaAmount >= 1000000000) {
    result += convertLessThanThousand(Math.floor(nairaAmount / 1000000000)) + 'Billion ';
    nairaAmount %= 1000000000;
  }

  if (nairaAmount >= 1000000) {
    result += convertLessThanThousand(Math.floor(nairaAmount / 1000000)) + 'Million ';
    nairaAmount %= 1000000;
  }

  if (nairaAmount >= 1000) {
    result += convertLessThanThousand(Math.floor(nairaAmount / 1000)) + 'Thousand ';
    nairaAmount %= 1000;
  }

  if (nairaAmount > 0) {
    result += convertLessThanThousand(nairaAmount);
  }

  result += 'Naira';

  if (kobo > 0) {
    result += ' and ' + convertLessThanThousand(kobo) + 'Kobo';
  }

  return result.trim() + ' Only';
}
