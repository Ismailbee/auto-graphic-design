/**
 * Firebase Configuration
 * Initialize Firebase services using environment variables
 *
 * Environment variables are loaded from .env file
 * Make sure to add .env to .gitignore to keep your keys secure!
 * 
 * PERFORMANCE: Only Firebase Auth is loaded synchronously.
 * Firestore and Storage are lazy-loaded when first needed.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

// Validate environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

const missingVars: string[] = []
for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    missingVars.push(envVar)
  }
}

if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:', missingVars)
  console.error('📝 Please check your .env file and restart the dev server')
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

// Firebase configuration from environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional
}

// Initialize Firebase App and Auth only (minimal startup)
let app: FirebaseApp
let auth: Auth

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  
  // Set Firebase Auth persistence to LOCAL (persists across app restarts)
  // This is CRITICAL for APK - browserLocalPersistence persists even after app closes
  import('firebase/auth').then(({ browserLocalPersistence, setPersistence }) => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('✅ Firebase Auth persistence set to LOCAL (APK-compatible)')
      })
      .catch((error) => {
        console.error('❌ Failed to set auth persistence:', error)
      })
  })

  console.log('✅ Firebase initialized successfully')
  console.log('📊 Project ID:', firebaseConfig.projectId)
} catch (error) {
  console.error('❌ Firebase initialization error:', error)
  throw error
}

// Export Firebase App and Auth (loaded synchronously)
export { app, auth }

// LAZY-LOADED: Firestore and Storage
// Import from firebase-firestore.ts and firebase-storage.ts when needed
// This saves ~200KB from initial bundle

// Lazy Firestore getter
let _db: any = null
let _dbPromise: Promise<any> | null = null

export async function getDb() {
  if (_db) return _db
  if (_dbPromise) return _dbPromise
  
  _dbPromise = import('firebase/firestore').then(async ({ 
    initializeFirestore, 
    getFirestore,
    persistentLocalCache, 
    persistentMultipleTabManager 
  }) => {
    try {
      _db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      })
    } catch (e: any) {
      // Already initialized
      if (e.code === 'failed-precondition' || e.message?.includes('already been called')) {
        _db = getFirestore(app)
      } else {
        throw e
      }
    }
    return _db
  })
  
  return _dbPromise
}

// Synchronous db getter for backward compatibility (initializes on first access)
// WARNING: This will trigger Firestore module load
let _dbSync: any = null
export const db = new Proxy({} as any, {
  get(_, prop) {
    if (!_dbSync) {
      // Lazy init on first property access
      const { initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager } = require('firebase/firestore')
      try {
        _dbSync = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
          })
        })
      } catch (e: any) {
        _dbSync = getFirestore(app)
      }
    }
    return _dbSync[prop]
  }
})

// Lazy Storage getter  
let _storage: any = null
export function getStorageInstance() {
  if (!_storage) {
    const { getStorage } = require('firebase/storage')
    _storage = getStorage(app)
  }
  return _storage
}

// Backward compatible storage export
export const storage = new Proxy({} as any, {
  get(_, prop) {
    return getStorageInstance()[prop]
  }
})

// Export Firebase SDK functions for convenience
export {
  // Auth functions
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  browserLocalPersistence,
  setPersistence,
  type User as FirebaseUser
} from 'firebase/auth'

export {
  // Firestore functions
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
  type DocumentData,
  type QuerySnapshot
} from 'firebase/firestore'

export {
  // Storage functions
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type UploadTask
} from 'firebase/storage'

