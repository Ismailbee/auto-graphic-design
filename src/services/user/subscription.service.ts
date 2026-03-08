/**
 * Subscription Service
 * Handles all subscription-related API calls
 */

import axios from 'axios'
import type {
  SubscriptionPlansResponse,
  SubscriptionStatus
} from '@/types/payment.types'

const API_BASE_URL = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:3006'

/**
 * Get all available subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlansResponse> {
  try {
    const response = await axios.get<SubscriptionPlansResponse>(
      `${API_BASE_URL}/api/subscription/plans`
    )
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to fetch subscription plans')
    }
    throw new Error('Network error. Please try again.')
  }
}

/**
 * Get user's current subscription status
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    const response = await axios.get<SubscriptionStatus>(
      `${API_BASE_URL}/api/subscription/status/${userId}`
    )
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to fetch subscription status')
    }
    throw new Error('Network error. Please try again.')
  }
}

