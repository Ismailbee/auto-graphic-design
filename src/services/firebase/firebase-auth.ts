/**
 * Firebase Authentication Service
 * Handles all Firebase authentication operations
 */

import { Capacitor } from '@capacitor/core'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'

import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  type FirebaseUser,
  db,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from '@/config/firebase'

import type { User, RegisterData, LoginData } from '@/types/auth'

/**
 * Convert Firebase User to our User type
 */
function convertFirebaseUser(firebaseUser: FirebaseUser, additionalData?: any): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || additionalData?.name || '',
    username: additionalData?.username || firebaseUser.email?.split('@')[0] || '',
    firstName: additionalData?.firstName || '',
    lastName: additionalData?.lastName || '',
    avatar: firebaseUser.photoURL || additionalData?.avatar || '',
    role: additionalData?.role || 'user',
    status: additionalData?.status || 'active',
    emailVerified: firebaseUser.emailVerified,
    createdAt: additionalData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }
}

/**
 * Register a new user with email and password
 */
export async function registerWithEmail(data: RegisterData): Promise<User> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    )

    const firebaseUser = userCredential.user

    // Update profile with display name
    const displayName = data.username || data.firstName || data.email.split('@')[0]
    await updateProfile(firebaseUser, {
      displayName
    })

    // Create user document in Firestore with FREE STARTER TOKENS
    const userData = {
      email: data.email,
      username: data.username || '',
      name: displayName,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      role: 'user',
      status: 'active',
      emailVerified: false,
      tokens: 100, // FREE starting tokens for new users!
      plan: 'Basic',
      totalDesignsGenerated: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), userData)

    // Convert to our User type
    return convertFirebaseUser(firebaseUser, userData)
  } catch (error: any) {
    console.error('Registration error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Login with email and password
 */
export async function loginWithEmail(data: LoginData): Promise<User> {
  try {
    console.log('🔐 Attempting login for:', data.email)

    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    )

    const firebaseUser = userCredential.user
    console.log('✅ Firebase authentication successful')

    try {
      // Get user data from Firestore with timeout
      const userDocPromise = getDoc(doc(db, 'users', firebaseUser.uid))
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore timeout')), 5000)
      )
      
      const userDoc = await Promise.race([userDocPromise, timeoutPromise]) as any
      let userData = userDoc.exists() ? userDoc.data() : {}

      console.log('📄 User document exists:', userDoc.exists())

      // If user document doesn't exist, create it with FREE STARTER TOKENS
      if (!userDoc.exists()) {
        console.log('📝 Creating user document in Firestore...')
        userData = {
          email: firebaseUser.email || '',
          username: firebaseUser.email?.split('@')[0] || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          avatar: firebaseUser.photoURL || '',
          role: 'user',
          status: 'active',
          emailVerified: firebaseUser.emailVerified,
          tokens: 100, // FREE starting tokens for new users!
          plan: 'Basic',
          totalDesignsGenerated: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        }

        await setDoc(doc(db, 'users', firebaseUser.uid), userData)
        console.log('✅ User document created with 100 FREE tokens')
      } else {
        // Update last login
        await setDoc(
          doc(db, 'users', firebaseUser.uid),
          { lastLoginAt: serverTimestamp() },
          { merge: true }
        )
        console.log('✅ Last login updated')
      }

      const user = convertFirebaseUser(firebaseUser, userData)
      console.log('✅ Login successful for:', user.email)
      return user
    } catch (firestoreError: any) {
      console.warn('⚠️ Firestore error, proceeding with auth data only:', firestoreError.message)
      // Still return user data from Firebase Auth
      const userData = {
        email: firebaseUser.email || '',
        username: firebaseUser.email?.split('@')[0] || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        avatar: firebaseUser.photoURL || '',
        role: 'user',
        status: 'active',
        emailVerified: firebaseUser.emailVerified,
      }
      const user = convertFirebaseUser(firebaseUser, userData)
      console.log('✅ Login successful (offline mode) for:', user.email)
      return user
    }
  } catch (error: any) {
    console.error('❌ Login error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Login with Google
 */
export async function loginWithGoogle(): Promise<User> {
  try {
    let firebaseUser: FirebaseUser

    if (Capacitor.isNativePlatform()) {
      console.log('📱 Starting native Google Login...')
      const result = await FirebaseAuthentication.signInWithGoogle()
      const credential = GoogleAuthProvider.credential(result.credential?.idToken)
      const userCredential = await signInWithCredential(auth, credential)
      firebaseUser = userCredential.user
    } else {
      console.log('🌐 Starting web Google Login...')
      const provider = new GoogleAuthProvider()
      try {
        // Try popup first
        const userCredential = await signInWithPopup(auth, provider)
        firebaseUser = userCredential.user
      } catch (popupError: any) {
        // If popup fails due to CORS, use redirect
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          console.log('Popup blocked, using redirect...')
          await signInWithRedirect(auth, provider)
          return null as any // Will complete on redirect
        }
        throw popupError
      }
    }

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    
    let userData
    if (!userDoc.exists()) {
      // Create new user document with FREE STARTER TOKENS
      userData = {
        email: firebaseUser.email || '',
        username: firebaseUser.email?.split('@')[0] || '',
        name: firebaseUser.displayName || '',
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        avatar: firebaseUser.photoURL || '',
        role: 'user',
        status: 'active',
        emailVerified: firebaseUser.emailVerified,
        tokens: 100, // FREE starting tokens for new users!
        plan: 'Basic',
        totalDesignsGenerated: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }
      await setDoc(doc(db, 'users', firebaseUser.uid), userData)
    } else {
      userData = userDoc.data()
      // Update last login
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        { lastLoginAt: serverTimestamp() },
        { merge: true }
      )
    }

    return convertFirebaseUser(firebaseUser, userData)
  } catch (error: any) {
    console.error('Google login error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Logout current user
 */
/**
 * Check for redirect result (Google Sign-In)
 */
export async function checkRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth)
    if (result && result.user) {
      console.log('✅ Redirect login successful')
      const firebaseUser = result.user
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      let userData
      if (!userDoc.exists()) {
        // Create new user document
        userData = {
          email: firebaseUser.email || '',
          username: firebaseUser.email?.split('@')[0] || '',
          name: firebaseUser.displayName || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          avatar: firebaseUser.photoURL || '',
          role: 'user',
          status: 'active',
          emailVerified: firebaseUser.emailVerified,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        }
        await setDoc(doc(db, 'users', firebaseUser.uid), userData)
      } else {
        userData = userDoc.data()
        // Update last login
        await setDoc(
          doc(db, 'users', firebaseUser.uid),
          { lastLoginAt: serverTimestamp() },
          { merge: true }
        )
      }
      
      return convertFirebaseUser(firebaseUser, userData)
    }
    return null
  } catch (error: any) {
    console.error('Redirect result error:', error)
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error: any) {
    console.error('Logout error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    console.error('Password reset error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Get user data from Firestore with timeout
        const userDocPromise = getDoc(doc(db, 'users', firebaseUser.uid))
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firestore timeout')), 5000)
        )
        
        const userDoc = await Promise.race([userDocPromise, timeoutPromise]) as any
        const userData = userDoc.exists() ? userDoc.data() : {}
        callback(convertFirebaseUser(firebaseUser, userData))
      } catch (error: any) {
        console.warn('⚠️ Could not fetch user data from Firestore, using auth data only:', error.message)
        // Still callback with user data from Firebase Auth
        callback(convertFirebaseUser(firebaseUser, {}))
      }
    } else {
      callback(null)
    }
  })
}

/**
 * Get current user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser
}

/**
 * Update the authenticated user's avatar
 * Compresses and stores avatar in Firestore (for development/quick setup)
 * For production, consider using Firebase Storage with proper CORS config
 */
export async function updateUserAvatar(photoDataUrl: string): Promise<User> {
  const firebaseUser = getCurrentUser()
  if (!firebaseUser) {
    throw new Error('No authenticated user')
  }

  try {
    let finalAvatarUrl = photoDataUrl

    // If it's a large data URL, compress it
    if (photoDataUrl.startsWith('data:') && photoDataUrl.length > 100000) {
      console.log('� Compressing large avatar (', photoDataUrl.length, 'bytes)...')
      
      // Create an image element to get dimensions
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = photoDataUrl
      })

      // Create canvas for compression
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Resize to max 400x400 while maintaining aspect ratio
      const maxSize = 400
      let width = img.width
      let height = img.height
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width
        width = maxSize
      } else if (height > maxSize) {
        width = (width * maxSize) / height
        height = maxSize
      }
      
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Compress to JPEG with 0.8 quality
      finalAvatarUrl = canvas.toDataURL('image/jpeg', 0.8)
      console.log('✅ Compressed to', finalAvatarUrl.length, 'bytes')
    }

    // Update Firestore user document with avatar
    console.log('🔄 Updating Firestore document...')
    await setDoc(
      doc(db, 'users', firebaseUser.uid),
      { avatar: finalAvatarUrl, updatedAt: serverTimestamp() },
      { merge: true }
    )

    console.log('✅ Avatar update complete')

    // Read back user document to include any extra fields
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    const userData = userDoc.exists() ? userDoc.data() : {}
    return convertFirebaseUser(firebaseUser, userData)
  } catch (err: any) {
    console.error('updateUserAvatar error:', err)
    throw err
  }
}

/**
 * Get Firebase error message
 */
function getFirebaseErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password is too weak (minimum 6 characters)',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/popup-closed-by-user': 'Sign-in popup was closed',
    'auth/cancelled-popup-request': 'Sign-in was cancelled',
    'unavailable': 'Service temporarily unavailable. Working in offline mode.',
    'failed-precondition': 'Cannot complete request. Working in offline mode.'
  }

  return errorMessages[errorCode] || 'An error occurred. Please try again'
}

/**
 * Get user data from Firestore
 */
export async function getUserData(userId: string): Promise<any> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    return userDoc.exists() ? userDoc.data() : null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

/**
 * Update user data in Firestore
 */
export async function updateUserData(userId: string, data: any): Promise<void> {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        ...data,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error updating user data:', error)
    throw error
  }
}

/**
 * Get linked authentication providers for current user
 * @returns Array of provider IDs (e.g., ['google.com', 'password'])
 */
export async function getLinkedProviders(): Promise<string[]> {
  const currentUser = auth.currentUser
  if (!currentUser) {
    return []
  }
  return currentUser.providerData.map(provider => provider.providerId)
}

/**
 * Check if email/password is linked to the current account
 */
export async function hasPasswordProvider(): Promise<boolean> {
  const providers = await getLinkedProviders()
  return providers.includes('password')
}

/**
 * Check if Google is linked to the current account
 */
export async function hasGoogleProvider(): Promise<boolean> {
  const providers = await getLinkedProviders()
  return providers.includes('google.com')
}

/**
 * Link email/password to existing account (for Google users who want to add password login)
 * @param password - The new password to set for email/password login
 */
export async function linkEmailPassword(password: string): Promise<void> {
  const currentUser = auth.currentUser

  if (!currentUser) {
    throw new Error('No user is currently logged in')
  }

  if (!currentUser.email) {
    throw new Error('Current user does not have an email address')
  }

  // Check if password is already linked
  const hasPassword = await hasPasswordProvider()
  if (hasPassword) {
    throw new Error('Email/password authentication is already linked to this account')
  }

  // Validate password
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long')
  }

  try {
    // Create email/password credential
    const credential = EmailAuthProvider.credential(currentUser.email, password)

    // Link the credential to the current user
    await linkWithCredential(currentUser, credential)

    console.log('✅ Email/password linked successfully')
  } catch (error: any) {
    console.error('❌ Error linking email/password:', error)

    // Handle specific error codes
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('For security, please log out and log back in with Google, then try again')
    } else if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already linked to another account')
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use a stronger password')
    } else if (error.code === 'auth/provider-already-linked') {
      throw new Error('Email/password is already linked to this account')
    }

    throw error
  }
}

/**
 * Get sign-in methods available for an email
 * @param email - Email to check
 * @returns Array of sign-in methods
 */
export async function getSignInMethodsForEmail(email: string): Promise<string[]> {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email)
    return methods
  } catch (error) {
    console.error('Error fetching sign-in methods:', error)
    return []
  }
}

