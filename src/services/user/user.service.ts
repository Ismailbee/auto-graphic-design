/**
 * User Service
 * Handles user data and token operations
 */

import type { User, DeductTokensRequest, DeductTokensResponse } from '@/types/payment.types'
import { getPaymentApiBaseUrlOrThrow } from '@/config/apiUrls'

const isDevelopment = import.meta.env.DEV

function getApiBase(): string {
  return getPaymentApiBaseUrlOrThrow('Tokens')
}

function normalizeUser(raw: any): User {
  // Backend historically used planExpiry; UI expects planExpiryDate.
  if (raw && raw.planExpiry && !raw.planExpiryDate) {
    raw.planExpiryDate = raw.planExpiry
  }
  return raw as User
}

/**
 * Get user data
 */
export async function getUser(userId: string, email?: string, name?: string): Promise<User> {
  const isDevelopment = import.meta.env.DEV
  const API_BASE_URL = getApiBase()
  
  // In development mode, if backend is not available, return mock data
  if (isDevelopment) {
    try {
      const maxRetries = 1 // Reduced retries for development
      const retryDelay = 500 // Reduced delay for development
  
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const params = new URLSearchParams()
          if (email) params.append('email', email)
          if (name) params.append('name', name)

          const url = `${API_BASE_URL}/api/users/${userId}${params.toString() ? '?' + params.toString() : ''}`
          const response = await fetch(url, {
            signal: AbortSignal.timeout(2000) // Shorter timeout for development
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to fetch user data')
          }

          return normalizeUser(await response.json())
          
        } catch (error: any) {
          // In development, fail fast and use mock data
          if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
            console.log('🔧 Backend unavailable in development - using mock user data')
            return {
              id: userId,
              email: email || 'user@example.com',
              name: name || 'Development User',
              tokens: 100,
              subscription: 'basic',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as User
          }
          throw error
        }
      }
    } catch (error: any) {
      // Fallback to mock data in development
      console.log('🔧 Using mock user data for development')
      return {
        id: userId,
        email: email || 'user@example.com',
        name: name || 'Development User', 
        tokens: 100,
        subscription: 'basic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as User
    }
  }

  // Production mode - original retry logic
  const maxRetries = 3
  const retryDelay = 1000 // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const params = new URLSearchParams()
      if (email) params.append('email', email)
      if (name) params.append('name', name)

      const url = `${API_BASE_URL}/api/users/${userId}${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000) // 15 second timeout for Firestore
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch user data')
      }

      return normalizeUser(await response.json())
      
    } catch (error: any) {
      // Only log the first attempt and final failure to reduce noise
      if (attempt === 1 || attempt === maxRetries) {
        console.warn(`👤 User service attempt ${attempt}/${maxRetries} failed:`, error.message)
      }
      
      // If it's a connection/fetch error and we have more attempts, retry
      if ((error.name === 'TypeError' || error.name === 'AbortError') && attempt < maxRetries) {
        if (attempt === 1) {
          console.log(`🔄 Retrying user fetch in ${retryDelay}ms...`)
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        continue
      }
      
      // Last attempt or non-retryable error
      if (attempt === maxRetries) {
        console.log('🚫 User service unavailable after all retries. Using offline mode.')
      }
      
      throw error
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('Maximum retries exceeded')
}

/**
 * Deduct tokens from user balance
 */
export async function deductTokens(
  userId: string,
  amount: number
): Promise<DeductTokensResponse> {
  const API_BASE_URL = getApiBase()

  // Backend endpoint implemented in functions/index.js (api): POST /api/users/:userId/deduct-tokens
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/deduct-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount } as unknown as DeductTokensRequest)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to deduct tokens')
  }

  const data = await response.json()
  // Normalize possible response shapes
  if (typeof data?.tokens === 'number') {
    return data as DeductTokensResponse
  }
  if (typeof data?.newBalance === 'number') {
    return {
      tokens: data.newBalance,
      totalDesignsGenerated: data.totalDesignsGenerated ?? 0
    }
  }
  throw new Error('Unexpected deduct tokens response')
}

