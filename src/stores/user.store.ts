/**
 * User Store
 * Manages user state, tokens, and plan information
 * Supports offline mode for mobile apps
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, PlanType, ReferralStats, TierColor } from '@/types/payment.types'
import { getUser, deductTokens } from '@/services/user/user.service'
import { getReferralStats, applyReferralCode as applyReferral } from '@/services/user/referral.service'
import { FEATURES, OFFLINE_USER } from '@/config/environment'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const referralStats = ref<ReferralStats | null>(null)

  // Getters - Always have tokens in offline mode
  const hasTokens = computed(() => {
    if (!FEATURES.TOKENS_ENABLED) return true // Always have tokens in offline mode
    return user.value ? user.value.tokens > 0 : false
  })

  const isPremium = computed(() => {
    return user.value?.plan === 'Premium'
  })

  const isPro = computed(() => {
    return user.value?.plan === 'Pro'
  })

  const daysUntilExpiry = computed(() => {
    if (!user.value?.planExpiryDate) return null
    
    const expiryDate = new Date(user.value.planExpiryDate)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  })

  const planExpired = computed(() => {
    if (!user.value?.planExpiryDate) return false

    const expiryDate = new Date(user.value.planExpiryDate)
    const now = new Date()

    return now > expiryDate
  })

  const tierColor = computed<TierColor>(() => {
    console.log('🎨 tierColor computed - user:', user.value)
    console.log('🎨 tierColor computed - plan:', user.value?.plan)
    console.log('🎨 tierColor computed - planExpiryDate:', user.value?.planExpiryDate)
    console.log('🎨 tierColor computed - planExpired:', planExpired.value)

    if (!user.value) {
      console.log('🎨 tierColor: blue (no user)')
      return 'blue'
    }

    if (planExpired.value) {
      console.log('🎨 tierColor: blue (plan expired)')
      return 'blue'
    }

    let color: TierColor
    switch (user.value.plan) {
      case 'Premium':
        color = 'gold'
        break
      case 'Pro':
        color = 'red'
        break
      default:
        color = 'blue'
        break
    }

    console.log('🎨 tierColor result:', color)
    return color
  })

  const isBasic = computed(() => {
    return user.value?.plan === 'Basic' || planExpired.value
  })

  // Actions
  async function fetchUser(userId: string, email?: string, name?: string) {
    console.log('👤 fetchUser called with:', { userId, email, name })
    
    // In offline mode, create a local user without API call
    if (!FEATURES.TOKENS_ENABLED) {
      console.log('📱 Offline mode: Creating local user')
      user.value = {
        id: userId,
        email: email || OFFLINE_USER.email,
        name: name || OFFLINE_USER.displayName,
        photoUrl: null,
        plan: 'Premium' as PlanType,
        planExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        tokens: OFFLINE_USER.tokens,
        referralCode: 'OFFLINE',
        totalDesignsGenerated: 0,
        createdAt: OFFLINE_USER.createdAt,
        updatedAt: OFFLINE_USER.createdAt
      }
      loading.value = false
      return
    }
    
    loading.value = true
    error.value = null

    try {
      const fetchedUser = await getUser(userId, email, name)
      console.log('👤 fetchUser response:', fetchedUser)
      user.value = fetchedUser
      console.log('👤 user.value updated:', user.value)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user data'
      error.value = message
      console.error('❌ Fetch user error:', err)
    } finally {
      loading.value = false
    }
  }

  function updateTokens(amount: number) {
    if (user.value) {
      user.value.tokens += amount
    }
  }

  async function deductUserTokens(userId: string, amount: number) {
    // In offline mode, skip token deduction
    if (!FEATURES.TOKENS_ENABLED) {
      console.log('📱 Offline mode: Skipping token deduction')
      return { tokens: OFFLINE_USER.tokens, totalDesignsGenerated: 0 }
    }
    
    if (!user.value) {
      throw new Error('User not loaded')
    }

    if (user.value.tokens < amount) {
      throw new Error('Insufficient tokens')
    }

    try {
      const response = await deductTokens(userId, amount)
      
      // Update local state
      user.value.tokens = response.tokens
      user.value.totalDesignsGenerated = response.totalDesignsGenerated
      
      return response
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to deduct tokens'
      error.value = message
      throw err
    }
  }

  function upgradePlan(plan: PlanType, expiryDate: string, freeTokens: number) {
    if (user.value) {
      user.value.plan = plan
      user.value.planExpiryDate = expiryDate
      user.value.tokens += freeTokens
    }
  }

  function resetUser() {
    user.value = null
    error.value = null
    referralStats.value = null
  }

  async function fetchReferralStats(userId: string) {
    loading.value = true
    error.value = null

    try {
      referralStats.value = await getReferralStats(userId)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch referral statistics'
      error.value = message
      console.error('Fetch referral stats error:', err)
    } finally {
      loading.value = false
    }
  }

  async function applyReferralCode(referralCode: string, userId: string, email: string, name?: string) {
    loading.value = true
    error.value = null

    try {
      const response = await applyReferral(referralCode, userId, email, name)

      // Update user tokens with referee reward
      if (user.value) {
        user.value.tokens += response.rewards.referee.tokensAwarded
        user.value.referredBy = response.rewards.referrer.id
      }

      return response
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to apply referral code'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    loading,
    error,
    referralStats,

    // Getters
    hasTokens,
    isPremium,
    isPro,
    isBasic,
    daysUntilExpiry,
    planExpired,
    tierColor,

    // Actions
    fetchUser,
    updateTokens,
    deductUserTokens,
    upgradePlan,
    resetUser,
    fetchReferralStats,
    applyReferralCode
  }
})

