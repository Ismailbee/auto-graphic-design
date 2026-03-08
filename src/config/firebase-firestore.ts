/**
 * Firebase Firestore - Lazy Loaded Module
 * This module is loaded on-demand to reduce initial bundle size
 */

import { app } from './firebase'
import { 
  type Firestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  initializeFirestore,
  getFirestore
} from 'firebase/firestore'

let _db: Firestore | null = null
let _initPromise: Promise<Firestore> | null = null

/**
 * Get Firestore instance (lazy initialized)
 */
export async function getDb(): Promise<Firestore> {
  if (_db) return _db
  
  if (_initPromise) return _initPromise
  
  _initPromise = (async () => {
    try {
      // Try to initialize with persistent cache
      _db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      })
    } catch (error: any) {
      // If already initialized, get existing instance
      if (error.code === 'failed-precondition' || error.message?.includes('already been called')) {
        _db = getFirestore(app)
      } else {
        throw error
      }
    }
    return _db!
  })()
  
  return _initPromise
}

// Re-export Firestore functions for convenience
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  onSnapshot,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe
} from 'firebase/firestore'
