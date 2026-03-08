/**
 * Referral Service
 * Handles all referral-related API calls
 */

import axios from 'axios'
import type {
  ReferralStats,
  ValidateReferralRequest,
  ValidateReferralResponse,
  ApplyReferralRequest,
  ApplyReferralResponse
} from '@/types/payment.types'

const API_BASE_URL = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:3006'

/**
 * Validate a referral code
 */
export async function validateReferralCode(referralCode: string): Promise<ValidateReferralResponse> {
  try {
    const response = await axios.post<ValidateReferralResponse>(
      `${API_BASE_URL}/api/referral/validate`,
      { referralCode } as ValidateReferralRequest
    )
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to validate referral code')
    }
    throw new Error('Network error. Please try again.')
  }
}

/**
 * Apply a referral code during signup
 */
export async function applyReferralCode(
  referralCode: string,
  userId: string,
  email: string,
  name?: string
): Promise<ApplyReferralResponse> {
  try {
    const response = await axios.post<ApplyReferralResponse>(
      `${API_BASE_URL}/api/referral/apply`,
      {
        referralCode,
        userId,
        email,
        name
      } as ApplyReferralRequest
    )
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to apply referral code')
    }
    throw new Error('Network error. Please try again.')
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  try {
    const response = await axios.get<ReferralStats>(
      `${API_BASE_URL}/api/referral/stats/${userId}`
    )
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to fetch referral statistics')
    }
    throw new Error('Network error. Please try again.')
  }
}

/**
 * Get user's unique referral code
 */
export async function getReferralCode(userId: string): Promise<string> {
  try {
    const response = await axios.get<{ referralCode: string }>(
      `${API_BASE_URL}/api/referral/code/${userId}`
    )
    return response.data.referralCode
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'Failed to fetch referral code')
    }
    throw new Error('Network error. Please try again.')
  }
}

