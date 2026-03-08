/**
 * Notification Helper Utilities
 * 
 * Convenient wrapper functions for creating common notification types
 * Import and use these throughout your app to send notifications easily
 */

import { createNotification, type CreateNotificationInput } from '@/services/user/notification.service'
import { useAuthStore } from '@/stores/auth'

/**
 * Send notification to the current authenticated user
 */
export async function notifyCurrentUser(
  title: string,
  message?: string,
  options?: {
    type?: 'info' | 'success' | 'warning' | 'error'
    link?: string
    metadata?: Record<string, unknown>
  }
): Promise<string | null> {
  const authStore = useAuthStore()
  
  if (!authStore.user?.id) {
    console.warn('Cannot send notification: No authenticated user')
    return null
  }

  return await createNotification({
    userId: authStore.user.id,
    title,
    message,
    type: options?.type || 'info',
    link: options?.link,
    metadata: options?.metadata
  })
}

/**
 * Send success notification
 */
export async function notifySuccess(
  userId: string,
  title: string,
  message?: string,
  link?: string
): Promise<string> {
  return await createNotification({
    userId,
    title,
    message,
    type: 'success',
    link
  })
}

/**
 * Send error notification
 */
export async function notifyError(
  userId: string,
  title: string,
  message?: string,
  link?: string
): Promise<string> {
  return await createNotification({
    userId,
    title,
    message,
    type: 'error',
    link
  })
}

/**
 * Send warning notification
 */
export async function notifyWarning(
  userId: string,
  title: string,
  message?: string,
  link?: string
): Promise<string> {
  return await createNotification({
    userId,
    title,
    message,
    type: 'warning',
    link
  })
}

/**
 * Send info notification
 */
export async function notifyInfo(
  userId: string,
  title: string,
  message?: string,
  link?: string
): Promise<string> {
  return await createNotification({
    userId,
    title,
    message,
    type: 'info',
    link
  })
}

// ========== PRESET NOTIFICATIONS ==========

/**
 * Notify user about design approval
 */
export async function notifyDesignApproved(
  userId: string,
  designName: string,
  designId?: string
): Promise<string> {
  return await notifySuccess(
    userId,
    'Design Approved! ✅',
    `Your design "${designName}" has been approved and is ready to use.`,
    designId ? `/designs/${designId}` : undefined
  )
}

/**
 * Notify user about design rejection
 */
export async function notifyDesignRejected(
  userId: string,
  designName: string,
  reason?: string
): Promise<string> {
  return await notifyError(
    userId,
    'Design Rejected',
    reason ? `Your design "${designName}" was rejected: ${reason}` : `Your design "${designName}" needs revision.`
  )
}

/**
 * Notify user about successful token purchase
 */
export async function notifyTokenPurchase(
  userId: string,
  amount: number,
  tokensAdded: number
): Promise<string> {
  return await notifySuccess(
    userId,
    'Tokens Purchased Successfully! 💎',
    `${tokensAdded} tokens have been added to your account. Payment of $${amount.toFixed(2)} received.`,
    '/tokens'
  )
}

/**
 * Notify user about low token balance
 */
export async function notifyLowTokens(
  userId: string,
  remainingTokens: number
): Promise<string> {
  return await notifyWarning(
    userId,
    'Low Token Balance ⚠️',
    `You have only ${remainingTokens} tokens remaining. Purchase more to continue using premium features.`,
    '/tokens/purchase'
  )
}

/**
 * Notify user about monthly token credit
 */
export async function notifyMonthlyTokens(
  userId: string,
  tokensAdded: number
): Promise<string> {
  return await notifySuccess(
    userId,
    'Monthly Tokens Credited! 🎁',
    `Your subscription includes ${tokensAdded} tokens. They have been added to your account.`,
    '/tokens'
  )
}

/**
 * Notify user about new comment on their design
 */
export async function notifyNewComment(
  userId: string,
  commenterName: string,
  designName: string,
  designId?: string
): Promise<string> {
  return await notifyInfo(
    userId,
    'New Comment 💬',
    `${commenterName} commented on your design "${designName}".`,
    designId ? `/designs/${designId}` : undefined
  )
}

/**
 * Notify user about collaboration invite
 */
export async function notifyCollaborationInvite(
  userId: string,
  inviterName: string,
  projectName: string,
  projectId?: string
): Promise<string> {
  return await notifyInfo(
    userId,
    'Collaboration Invite 🤝',
    `${inviterName} invited you to collaborate on "${projectName}".`,
    projectId ? `/collaboration/${projectId}` : undefined
  )
}

/**
 * Notify user about upload failure
 */
export async function notifyUploadFailed(
  userId: string,
  fileName: string,
  reason?: string
): Promise<string> {
  return await notifyError(
    userId,
    'Upload Failed',
    reason ? `Failed to upload "${fileName}": ${reason}` : `Failed to upload "${fileName}". Please try again.`,
    '/designs/upload'
  )
}

/**
 * Notify user about auto-design completion
 */
export async function notifyAutoDesignComplete(
  userId: string,
  designName: string,
  designId?: string
): Promise<string> {
  return await notifySuccess(
    userId,
    'Auto Design Complete! 🎨',
    `Your auto-generated design "${designName}" is ready for review.`,
    designId ? `/designs/${designId}` : undefined
  )
}

/**
 * Notify user about subscription renewal
 */
export async function notifySubscriptionRenewed(
  userId: string,
  planName: string,
  nextBillingDate: string
): Promise<string> {
  return await notifyInfo(
    userId,
    'Subscription Renewed 🔄',
    `Your ${planName} subscription has been renewed. Next billing date: ${nextBillingDate}.`,
    '/account/subscription'
  )
}

/**
 * Notify user about payment failure
 */
export async function notifyPaymentFailed(
  userId: string,
  reason?: string
): Promise<string> {
  return await notifyError(
    userId,
    'Payment Failed',
    reason || 'Your recent payment could not be processed. Please update your payment method.',
    '/account/billing'
  )
}

/**
 * Notify user about account verification
 */
export async function notifyAccountVerified(userId: string): Promise<string> {
  return await notifySuccess(
    userId,
    'Account Verified! ✨',
    'Your account has been verified. You now have access to all premium features.',
    '/account/settings'
  )
}

/**
 * Notify user about role update
 */
export async function notifyRoleUpdated(
  userId: string,
  newRole: string
): Promise<string> {
  return await notifyInfo(
    userId,
    'Role Updated',
    `Your role has been changed to ${newRole}.`,
    '/account/settings'
  )
}

/**
 * Notify user about welcome (first login)
 */
export async function notifyWelcome(
  userId: string,
  userName?: string
): Promise<string> {
  return await notifySuccess(
    userId,
    `Welcome to SmartDesignPro${userName ? ', ' + userName : ''}! 🎉`,
    'Thank you for joining! Explore our templates and start creating amazing designs.',
    '/home'
  )
}
