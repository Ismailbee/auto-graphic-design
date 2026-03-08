/**
 * Authentication API Service
 */

import type {
  RegisterData,
  LoginData,
  AuthResponse,
  RefreshResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  PasswordChange,
  User,
  ApiErrorResponse
} from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3003/api/auth'
const AUTH_SERVER_URL = API_BASE_URL.replace(/\/api\/auth\/?$/, '')

/**
 * Handle API errors
 */
function handleApiError(error: any): never {
  if (error.response) {
    // Server responded with error
    const data = error.response.data as ApiErrorResponse
    throw new Error(data.message || 'An error occurred')
  } else if (error.request) {
    // Request made but no response
    throw new Error('No response from server. Please check your connection.')
  } else {
    // Something else happened
    throw new Error(error.message || 'An unexpected error occurred')
  }
}

/**
 * Make API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json()

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data
        }
      }
    }

    return data
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/register', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/login', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * Logout user
 */
export async function logout(refreshToken: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  })
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
  return apiRequest<RefreshResponse>('/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  })
}

/**
 * Get current user profile
 */
export async function getCurrentUser(accessToken: string): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
}

/**
 * Request password reset
 */
export async function requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string; resetToken?: string }> {
  return apiRequest<{ message: string; resetToken?: string }>('/password-reset/request', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * Confirm password reset
 */
export async function confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * Change password (authenticated)
 */
export async function changePassword(data: PasswordChange, accessToken: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/password-change', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
}

/**
 * Check if server is healthy
 */
export async function checkHealth(): Promise<{ status: string; service: string; timestamp: string }> {
  const response = await fetch(`${AUTH_SERVER_URL}/health`)
  return response.json()
}

