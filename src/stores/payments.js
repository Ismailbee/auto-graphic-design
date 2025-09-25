import { defineStore } from 'pinia'

export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    paymentMethods: [
      { id: 'stripe', name: 'Stripe', types: ['card'], icon: 'card-outline' },
      { id: 'paystack', name: 'Paystack', types: ['card', 'bank_transfer'], icon: 'card-outline' }
    ],
    supportedCards: ['Visa', 'Mastercard', 'Verve'],
    transactions: [
      {
        id: 1,
        type: 'recharge',
        amount: 5000,
        currency: 'NGN',
        method: 'paystack',
        cardType: 'Visa',
        status: 'completed',
        date: '2024-01-15T10:30:00Z',
        reference: 'PAY001',
        description: 'MTN Data Recharge - 20GB Monthly'
      },
      {
        id: 2,
        type: 'subscription',
        amount: 2500,
        currency: 'NGN',
        method: 'stripe',
        cardType: 'Mastercard',
        status: 'failed',
        date: '2024-01-14T15:20:00Z',
        reference: 'PAY002',
        description: 'Premium Subscription - Monthly'
      }
    ],
    currentPayment: {
      amount: 0,
      currency: 'NGN',
      description: '',
      method: null,
      cardDetails: {
        number: '',
        expiry: '',
        cvv: '',
        name: ''
      }
    }
  }),

  getters: {
    recentTransactions: (state) => {
      return state.transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
    },

    successfulTransactions: (state) => {
      return state.transactions.filter(t => t.status === 'completed')
    },

    totalSpent: (state) => {
      return state.transactions
        .filter(t => t.status === 'completed')
        .reduce((total, t) => total + t.amount, 0)
    },

    getTransactionsByType: (state) => (type) => {
      return state.transactions.filter(t => t.type === type)
    }
  },

  actions: {
    setPaymentAmount(amount, currency = 'NGN', description = '') {
      this.currentPayment.amount = amount
      this.currentPayment.currency = currency
      this.currentPayment.description = description
    },

    setPaymentMethod(method) {
      this.currentPayment.method = method
    },

    setCardDetails(cardDetails) {
      this.currentPayment.cardDetails = { ...cardDetails }
    },

    async processPayment() {
      // Simulate payment processing
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const success = Math.random() > 0.15 // 85% success rate
          
          const transaction = {
            id: Date.now(),
            type: 'payment',
            amount: this.currentPayment.amount,
            currency: this.currentPayment.currency,
            method: this.currentPayment.method,
            cardType: this.getCardType(this.currentPayment.cardDetails.number),
            status: success ? 'completed' : 'failed',
            date: new Date().toISOString(),
            reference: `PAY${Date.now().toString().slice(-6)}`,
            description: this.currentPayment.description || 'Payment'
          }

          this.transactions.unshift(transaction)

          if (success) {
            resolve({
              success: true,
              transaction,
              message: 'Payment processed successfully!'
            })
          } else {
            reject({
              success: false,
              transaction,
              message: 'Payment failed. Please try again.'
            })
          }

          // Reset current payment
          this.resetCurrentPayment()
        }, 3000) // Simulate 3-second processing time
      })
    },

    async processStripePayment(paymentData) {
      // Simulate Stripe payment
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const success = Math.random() > 0.1
          
          if (success) {
            const transaction = {
              id: Date.now(),
              type: paymentData.type || 'payment',
              amount: paymentData.amount,
              currency: paymentData.currency || 'NGN',
              method: 'stripe',
              cardType: this.getCardType(paymentData.cardNumber),
              status: 'completed',
              date: new Date().toISOString(),
              reference: `STRIPE_${Date.now().toString().slice(-6)}`,
              description: paymentData.description
            }
            
            this.transactions.unshift(transaction)
            resolve({ success: true, transaction })
          } else {
            reject({ success: false, error: 'Stripe payment failed' })
          }
        }, 2500)
      })
    },

    async processPaystackPayment(paymentData) {
      // Simulate Paystack payment
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const success = Math.random() > 0.08
          
          if (success) {
            const transaction = {
              id: Date.now(),
              type: paymentData.type || 'payment',
              amount: paymentData.amount,
              currency: paymentData.currency || 'NGN',
              method: 'paystack',
              cardType: paymentData.paymentType === 'bank_transfer' ? 'Bank Transfer' : this.getCardType(paymentData.cardNumber),
              status: 'completed',
              date: new Date().toISOString(),
              reference: `PAYSTACK_${Date.now().toString().slice(-6)}`,
              description: paymentData.description
            }
            
            this.transactions.unshift(transaction)
            resolve({ success: true, transaction })
          } else {
            reject({ success: false, error: 'Paystack payment failed' })
          }
        }, 2000)
      })
    },

    getCardType(cardNumber) {
      if (!cardNumber) return 'Unknown'
      
      const number = cardNumber.replace(/\s/g, '')
      
      if (number.startsWith('4')) return 'Visa'
      if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard'
      if (number.startsWith('506')) return 'Verve'
      
      return 'Unknown Card'
    },

    resetCurrentPayment() {
      this.currentPayment = {
        amount: 0,
        currency: 'NGN',
        description: '',
        method: null,
        cardDetails: {
          number: '',
          expiry: '',
          cvv: '',
          name: ''
        }
      }
    },

    getTransactionById(id) {
      return this.transactions.find(t => t.id === parseInt(id))
    },

    formatCurrency(amount, currency = 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
      }).format(amount)
    }
  },

  persist: true
})