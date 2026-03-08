/**
 * Firebase Notification Service
 * 
 * Handles real-time notifications stored in Firestore
 * Provides methods for creating, reading, updating, and listening to notifications
 */

// Lazy load Firebase to reduce initial bundle size
let firebaseLoaded = false
let firebaseModule: any = null
let dbInstance: any = null

const getFirebase = async () => {
  if (!firebaseLoaded) {
    const [firestoreModule, configModule] = await Promise.all([
      import('firebase/firestore'),
      import('@/config/firebase')
    ])
    firebaseModule = firestoreModule
    dbInstance = configModule.db
    firebaseLoaded = true
  }
  return { firestore: firebaseModule, db: dbInstance }
}

// Type imports only (no runtime cost)
import type { Timestamp, Unsubscribe } from 'firebase/firestore'

export interface NotificationData {
  id: string
  userId: string
  title: string
  message?: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Timestamp | Date
  link?: string
  metadata?: Record<string, unknown>
}

export interface CreateNotificationInput {
  userId: string
  title: string
  message?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  link?: string
  metadata?: Record<string, unknown>
}

const NOTIFICATIONS_COLLECTION = 'notifications'

/**
 * Create a new notification for a user
 */
export async function createNotification(input: CreateNotificationInput): Promise<string> {
  const { firestore, db } = await getFirebase()
  const { collection, addDoc, serverTimestamp } = firestore
  
  try {
    const notificationData = {
      userId: input.userId,
      title: input.title,
      message: input.message || '',
      type: input.type || 'info',
      read: false,
      createdAt: serverTimestamp(),
      link: input.link || '',
      metadata: input.metadata || {}
    }

    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationData)
    return docRef.id
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    )

    const snapshot = await getDocs(q)
    const batch = writeBatch(db)

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      })
    })

    await batch.commit()
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

/**
 * Subscribe to real-time notifications for a user
 * Returns an unsubscribe function
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: NotificationData[]) => void,
  maxLimit: number = 50
): Unsubscribe {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxLimit)
    )

    return onSnapshot(q, (snapshot) => {
      const notifications: NotificationData[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          read: data.read,
          createdAt: data.createdAt,
          link: data.link,
          metadata: data.metadata
        }
      })

      callback(notifications)
    }, (error) => {
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        console.log('🔧 Firebase index required for notifications. This is expected on first run.')
        
        // Extract and clean up the URL
        const indexUrl = error.message?.match(/https:\/\/[^\s]+/)?.[0]
        if (indexUrl) {
          console.log('📋 Index URL:', indexUrl)
        }
        
        // Return empty array instead of error to prevent console noise
        callback([])
        return
      }
      
      console.error('🚫 Error in notifications subscription:', error)
    })
  } catch (error: any) {
    if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
      console.warn('🔍 Firebase index required for notifications subscription.')
      console.log('📋 Please create the required index in Firebase Console')
    } else {
      console.error('🚫 Error subscribing to notifications:', error)
    }
    // Return a no-op unsubscribe function
    return () => {}
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    )

    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

/**
 * Delete old read notifications (for cleanup)
 * @param userId User ID
 * @param daysOld Delete notifications older than this many days (default: 30)
 */
export async function deleteOldNotifications(userId: string, daysOld: number = 30): Promise<void> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', true),
      where('createdAt', '<', Timestamp.fromDate(cutoffDate))
    )

    const snapshot = await getDocs(q)
    const batch = writeBatch(db)

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
  } catch (error) {
    console.error('Error deleting old notifications:', error)
    throw error
  }
}

/**
 * Helper: Send notification to multiple users
 */
export async function sendBulkNotifications(
  userIds: string[],
  notification: Omit<CreateNotificationInput, 'userId'>
): Promise<string[]> {
  try {
    const promises = userIds.map(userId => 
      createNotification({ ...notification, userId })
    )
    return await Promise.all(promises)
  } catch (error) {
    console.error('Error sending bulk notifications:', error)
    throw error
  }
}

/**
 * Helper: Format Firestore timestamp to ISO string
 */
export function formatTimestamp(timestamp: Timestamp | Date | undefined): string {
  if (!timestamp) return new Date().toISOString()
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString()
  }
  
  return timestamp.toISOString()
}
