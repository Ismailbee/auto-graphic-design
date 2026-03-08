/**
 * Payment Service
 * Handles Paystack integration and payment operations
 */

import { Capacitor } from '@capacitor/core'
// Lazy load Browser plugin - only needed when opening payment page
import { loadBrowser } from '@/composables/useCapacitorPlugins'
import { getPaymentApiBaseUrlOrThrow } from '@/config/apiUrls'
import type {
  InitializePaymentRequest,
  InitializePaymentResponse,
  VerifyPaymentResponse,
  PaymentHistory,
  PaymentConfig
} from '@/types/payment.types'

function getApiBase(): string {
  return getPaymentApiBaseUrlOrThrow('Payments')
}

/**
 * Initialize a payment with Paystack
 */
export async function initializePayment(
  request: InitializePaymentRequest
): Promise<InitializePaymentResponse> {
  const API_BASE_URL = getApiBase()

  // Firebase Functions endpoint (see functions/index.js: export const initializePayment)
  const response = await fetch(`${API_BASE_URL}/initializePayment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to initialize payment')
  }

  return response.json()
}

/**
 * Verify a payment
 */
export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
  const API_BASE_URL = getApiBase()

  // Firebase Functions endpoint (see functions/index.js: export const verifyPayment)
  const response = await fetch(`${API_BASE_URL}/verifyPayment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reference })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to verify payment')
  }

  const raw = await response.json()

  // Normalize multiple backend shapes into the app's VerifyPaymentResponse
  // Expected cloud function shape: { success, message, data: { status, amount, metadata, paidAt } }
  const paymentData = raw?.data || raw
  const metadata = paymentData?.metadata || {}

  return {
    status: paymentData?.status,
    amount: Number(paymentData?.amount ?? 0),
    type: metadata?.type,
    tokens: metadata?.tokens ? Number(metadata.tokens) : undefined,
    plan: metadata?.plan,
    verifiedAt: paymentData?.paidAt || paymentData?.verifiedAt
  } as VerifyPaymentResponse
}

/**
 * Get payment history for a user
 */
export async function getPaymentHistory(
  userId: string,
  filters?: {
    page?: number
    limit?: number
    type?: 'token_purchase' | 'plan_upgrade'
    startDate?: string
    endDate?: string
  }
): Promise<PaymentHistory> {
  const API_BASE_URL = getApiBase()
  const params = new URLSearchParams()
  
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.type) params.append('type', filters.type)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)

  const response = await fetch(
    `${API_BASE_URL}/api/users/${userId}/payments?${params.toString()}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch payment history')
  }

  return response.json()
}

/**
 * Open Paystack payment popup (Web) or redirect to payment page (Mobile)
 */
export async function openPaystackPopup(config: PaymentConfig): Promise<void> {
  const isNative = Capacitor.isNativePlatform()

  if (isNative) {
    // Mobile: Open Paystack payment page using authorization URL from Paystack API
    if (!config.authorizationUrl) {
      throw new Error('Authorization URL is required for mobile payment')
    }
    // Lazy load Browser plugin when needed
    const Browser = await loadBrowser()
    await Browser.open({ url: config.authorizationUrl })
    
    // Note: Payment verification needs to be handled via webhook or manual check
    console.log('Payment opened in browser. Reference:', config.reference)
  } else {
    // Web: Use Paystack popup
    // @ts-ignore - Paystack is loaded via script tag
    if (typeof PaystackPop === 'undefined') {
      throw new Error('Paystack library not loaded. Please refresh the page.')
    }

    // @ts-ignore
    const handler = PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: config.email,
      amount: config.amount * 100, // Convert to kobo
      ref: config.reference,
      metadata: config.metadata,
      onClose: () => {
        config.onCancel()
      },
      callback: (response: any) => {
        config.onSuccess(response)
      }
    })

    handler.openIframe()
  }
}

/**
 * Process token purchase
 * Returns the payment reference for mobile payment tracking
 */
export async function purchaseTokens(
  userId: string,
  email: string,
  name: string,
  amount: number,
  tokens: number,
  onSuccess: (response: any) => void,
  onCancel: () => void
): Promise<string> {
  try {
    // Initialize payment
    const response = await initializePayment({
      userId,
      email,
      name,
      amount,
      type: 'token_purchase',
      tokens
    })

    // Open Paystack popup
    await openPaystackPopup({
      email,
      amount,
      reference: response.reference,
      authorizationUrl: response.authorization_url,
      metadata: {
        userId,
        type: 'token_purchase',
        tokens
      },
      onSuccess,
      onCancel
    })
    
    // Return reference for mobile payment tracking
    return response.reference
  } catch (error) {
    console.error('Purchase tokens error:', error)
    throw error
  }
}

/**
 * Process plan upgrade
 * Returns the payment reference for mobile payment tracking
 */
export async function upgradePlan(
  userId: string,
  email: string,
  name: string,
  plan: 'Premium' | 'Pro',
  planId: string,
  amount: number,
  onSuccess: (response: any) => void,
  onCancel: () => void
): Promise<string> {
  try {
    // Initialize payment
    const response = await initializePayment({
      userId,
      email,
      name,
      amount,
      type: 'plan_upgrade',
      plan,
      planId
    })

    // Open Paystack popup
    await openPaystackPopup({
      email,
      amount,
      reference: response.reference,
      authorizationUrl: response.authorization_url,
      metadata: {
        userId,
        type: 'plan_upgrade',
        plan,
        planId
      },
      onSuccess,
      onCancel
    })
    
    // Return reference for mobile payment tracking
    return response.reference
  } catch (error) {
    console.error('Upgrade plan error:', error)
    throw error
  }
}

