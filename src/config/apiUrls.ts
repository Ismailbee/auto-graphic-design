import { isNativePlatform } from '@/config/environment'

const LOCALHOST_RE = /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

/**
 * Returns the base URL to your deployed backend used for payments/users/referrals.
 *
 * Preferred:
 * - VITE_PAYMENT_API_URL (e.g. Firebase Functions base: https://us-central1-<project>.cloudfunctions.net)
 *
 * Fallback:
 * - Derive Firebase Functions URL from VITE_FIREBASE_PROJECT_ID.
 */
export function getPaymentApiBaseUrl(): string {
  const explicit = (import.meta.env.VITE_PAYMENT_API_URL || '').trim()
  if (explicit) return stripTrailingSlash(explicit)

  const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim()
  if (!projectId) return ''

  const region = (import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1').trim()
  return `https://${region}-${projectId}.cloudfunctions.net`
}

/**
 * Throws a clear error if API base URL is missing or unusable on native builds.
 */
export function getPaymentApiBaseUrlOrThrow(featureName: string): string {
  const base = getPaymentApiBaseUrl()

  if (!base) {
    throw new Error(
      `${featureName} is not configured. Set VITE_PAYMENT_API_URL (recommended) ` +
        `or VITE_FIREBASE_PROJECT_ID/VITE_FIREBASE_FUNCTIONS_REGION in your env.`
    )
  }

  if (isNativePlatform() && LOCALHOST_RE.test(base)) {
    throw new Error(
      `${featureName} cannot use localhost on Android/iOS. ` +
        `Set VITE_PAYMENT_API_URL to your deployed server (https://...).`
    )
  }

  return base
}
