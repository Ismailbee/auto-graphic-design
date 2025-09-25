import { defineStore } from 'pinia'
import { networkPlans } from '../data/mockData.js'

export const useRechargeStore = defineStore('recharge', {
  state: () => ({
    networks: ['MTN', 'Airtel', 'Glo', '9Mobile'],
    plans: networkPlans,
    transactions: [
      {
        id: 1,
        network: 'MTN',
        plan: '20GB Monthly',
        amount: 5000,
        phone: '08012345678',
        status: 'completed',
        date: '2024-01-15T10:30:00Z',
        reference: 'TXN001'
      },
      {
        id: 2,
        network: 'Airtel',
        plan: '6GB Weekly',
        amount: 1200,
        phone: '08087654321',
        status: 'pending',
        date: '2024-01-14T15:20:00Z',
        reference: 'TXN002'
      },
      {
        id: 3,
        network: 'Glo',
        plan: '1.2GB Daily',
        amount: 200,
        phone: '08011223344',
        status: 'failed',
        date: '2024-01-13T09:15:00Z',
        reference: 'TXN003'
      }
    ],
    currentRecharge: {
      network: '',
      planType: '',
      selectedPlan: null,
      phoneNumber: '',
      amount: 0
    }
  }),

  getters: {
    getPlansForNetwork: (state) => (network, planType) => {
      return state.plans[network]?.[planType] || []
    },

    recentTransactions: (state) => {
      return state.transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
    },

    totalSpent: (state) => {
      return state.transactions
        .filter(t => t.status === 'completed')
        .reduce((total, t) => total + t.amount, 0)
    },

    successfulTransactions: (state) => {
      return state.transactions.filter(t => t.status === 'completed').length
    }
  },

  actions: {
    setRechargeNetwork(network) {
      this.currentRecharge.network = network
      this.currentRecharge.selectedPlan = null
      this.currentRecharge.amount = 0
    },

    setPlanType(planType) {
      this.currentRecharge.planType = planType
      this.currentRecharge.selectedPlan = null
      this.currentRecharge.amount = 0
    },

    selectPlan(plan) {
      this.currentRecharge.selectedPlan = plan
      this.currentRecharge.amount = plan.price
    },

    setPhoneNumber(phone) {
      this.currentRecharge.phoneNumber = phone
    },

    async processRecharge() {
      // Simulate API call
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const success = Math.random() > 0.1 // 90% success rate
          
          const transaction = {
            id: Date.now(),
            network: this.currentRecharge.network,
            plan: this.currentRecharge.selectedPlan.name,
            amount: this.currentRecharge.amount,
            phone: this.currentRecharge.phoneNumber,
            status: success ? 'completed' : 'failed',
            date: new Date().toISOString(),
            reference: `TXN${Date.now().toString().slice(-6)}`
          }

          this.transactions.unshift(transaction)

          if (success) {
            resolve(transaction)
          } else {
            reject(new Error('Transaction failed. Please try again.'))
          }

          // Reset current recharge
          this.resetCurrentRecharge()
        }, 2000) // Simulate 2-second processing time
      })
    },

    resetCurrentRecharge() {
      this.currentRecharge = {
        network: '',
        planType: '',
        selectedPlan: null,
        phoneNumber: '',
        amount: 0
      }
    },

    getTransactionById(id) {
      return this.transactions.find(t => t.id === parseInt(id))
    },

    retryTransaction(transactionId) {
      const transaction = this.getTransactionById(transactionId)
      if (transaction && transaction.status === 'failed') {
        this.currentRecharge = {
          network: transaction.network,
          planType: this.getplanTypeFromPlan(transaction.plan),
          selectedPlan: this.findPlanByName(transaction.network, transaction.plan),
          phoneNumber: transaction.phone,
          amount: transaction.amount
        }
      }
    },

    getplanTypeFromPlan(planName) {
      // Helper method to determine plan type from plan name
      if (planName.includes('Daily')) return 'daily'
      if (planName.includes('Weekly')) return 'weekly'
      if (planName.includes('Monthly')) return 'monthly'
      if (planName.includes('Yearly')) return 'yearly'
      return 'monthly'
    },

    findPlanByName(network, planName) {
      // Helper method to find plan object by name
      const networkPlans = this.plans[network]
      if (!networkPlans) return null

      for (const planType of Object.keys(networkPlans)) {
        const plan = networkPlans[planType].find(p => p.name === planName)
        if (plan) return plan
      }
      return null
    }
  },

  persist: true
})