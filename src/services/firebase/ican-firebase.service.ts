/**
 * ICAN Firebase Service
 * Migrated from local backend to SmartDesignPro Firebase
 * Provides all ICAN functionality using Firestore
 */

import {
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
  increment,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

// ============================================================================
// TYPES
// ============================================================================

export interface ICANBranch {
  id: string
  name: string
  manager: string
  password: string
  maxUsers: number
  registrationEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ICANUser {
  id: string
  email: string
  name: string
  password?: string
  branchId: string
  branch?: string
  role: 'user' | 'admin' | 'manager'
  createdAt: Date
  lastLogin?: Date
  loginCount?: number
  isActive: boolean
  passwordResetBy?: string
  passwordResetAt?: Date
  updatedAt?: Date
}

export interface ICANInvoice {
  id: string
  number: string
  branchId: string
  date: string
  total: number
  items: any[]
  customerInfo: any
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ICANReceipt {
  id: string
  number: string
  branchId: string
  date: string
  amount: number
  customerInfo: any
  paymentMethod: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ICANCounter {
  id: string
  key: string
  value: number
  branchId?: string
  lastUpdated: Date
}

// ============================================================================
// FIREBASE COLLECTIONS
// ============================================================================

const COLLECTIONS = {
  BRANCHES: 'ican_branches',
  USERS: 'ican_users',
  INVOICES: 'ican_invoices',
  RECEIPTS: 'ican_receipts',
  COUNTERS: 'ican_counters',
  STATISTICS: 'ican_statistics'
}

// ============================================================================
// BRANCH OPERATIONS
// ============================================================================

export const ICANBranchService = {
  /**
   * Get all branches
   */
  async getAllBranches(): Promise<ICANBranch[]> {
    try {
      const branchesRef = collection(db, COLLECTIONS.BRANCHES)
      const snapshot = await getDocs(query(branchesRef, orderBy('name')))
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as any)?.toDate?.() || new Date(),
        updatedAt: (doc.data().updatedAt as any)?.toDate?.() || new Date(),
      } as ICANBranch))
    } catch (error) {
      console.error('Error fetching branches:', error)
      throw new Error('Failed to fetch branches')
    }
  },

  /**
   * Create a new branch
   */
  async createBranch(branchData: Omit<ICANBranch, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const branchRef = doc(collection(db, COLLECTIONS.BRANCHES))
      const newBranch = {
        ...branchData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      
      await setDoc(branchRef, newBranch)
      return branchRef.id
    } catch (error) {
      console.error('Error creating branch:', error)
      throw new Error('Failed to create branch')
    }
  },

  /**
   * Verify branch credentials
   */
  async verifyBranchCredentials(name: string, password: string): Promise<ICANBranch | null> {
    try {
      const branchesRef = collection(db, COLLECTIONS.BRANCHES)
      const q = query(branchesRef, where('name', '==', name))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }
      
      const branchDoc = snapshot.docs[0]
      const branch = branchDoc.data() as ICANBranch
      
      // In a real app, you'd hash passwords
      if (branch.password === password) {
        return {
          id: branchDoc.id,
          ...branch,
          createdAt: (branch.createdAt as any)?.toDate?.() || new Date(),
          updatedAt: (branch.updatedAt as any)?.toDate?.() || new Date(),
        }
      }
      
      return null
    } catch (error) {
      console.error('Error verifying branch credentials:', error)
      throw new Error('Failed to verify credentials')
    }
  },

  /**
   * Update branch
   */
  async updateBranch(id: string, updates: Partial<ICANBranch>): Promise<void> {
    try {
      const branchRef = doc(db, COLLECTIONS.BRANCHES, id)
      await updateDoc(branchRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating branch:', error)
      throw new Error('Failed to update branch')
    }
  }
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const ICANUserService = {
  /**
   * Create a new user
   */
  async createUser(userData: Omit<ICANUser, 'id' | 'createdAt'>): Promise<string> {
    try {
      const userRef = doc(collection(db, COLLECTIONS.USERS))
      const newUser = {
        ...userData,
        createdAt: serverTimestamp(),
        isActive: true
      }
      
      await setDoc(userRef, newUser)
      return userRef.id
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  },

  /**
   * Get users by branch
   */
  async getUsersByBranch(branchId: string): Promise<ICANUser[]> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(usersRef, where('branchId', '==', branchId), where('isActive', '==', true))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as any)?.toDate?.() || new Date(),
        lastLogin: (doc.data().lastLogin as any)?.toDate?.(),
      } as ICANUser))
    } catch (error) {
      console.error('Error fetching users:', error)
      throw new Error('Failed to fetch users')
    }
  },

  /**
   * Authenticate user with member password
   */
  async authenticateUser(email: string, branchId: string, memberPassword?: string): Promise<ICANUser | null> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(
        usersRef, 
        where('email', '==', email), 
        where('branchId', '==', branchId),
        where('isActive', '==', true)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }
      
      const userDoc = snapshot.docs[0]
      const user = userDoc.data() as ICANUser
      
      // If user has a password set, verify it
      if (user.password && memberPassword) {
        if (user.password !== memberPassword) {
          throw new Error('Incorrect member password')
        }
      } else if (user.password && !memberPassword) {
        throw new Error('Member password required')
      }
      
      // Update last login and increment login count
      const currentLoginCount = (user.loginCount || 0) + 1
      await updateDoc(userDoc.ref, {
        lastLogin: serverTimestamp(),
        loginCount: increment(1)
      })
      
      return {
        id: userDoc.id,
        ...user,
        createdAt: (user.createdAt as any)?.toDate?.() || new Date(),
        lastLogin: new Date(),
        loginCount: currentLoginCount
      }
    } catch (error) {
      console.error('Error authenticating user:', error)
      throw error // Re-throw to preserve error message
    }
  },

  /**
   * Check if user exists (for branch access without member password)
   */
  async findUser(email: string, branchId: string): Promise<ICANUser | null> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(
        usersRef, 
        where('email', '==', email), 
        where('branchId', '==', branchId),
        where('isActive', '==', true)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }
      
      const userDoc = snapshot.docs[0]
      const user = userDoc.data() as ICANUser
      
      return {
        id: userDoc.id,
        ...user,
        createdAt: (user.createdAt as any)?.toDate?.() || new Date(),
        lastLogin: (user.lastLogin as any)?.toDate?.()
      }
    } catch (error) {
      console.error('Error finding user:', error)
      throw new Error('Failed to find user')
    }
  },

  /**
   * Update user information
   */
  async updateUser(userId: string, updateData: Partial<Omit<ICANUser, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(userRef, updatePayload)
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error('Failed to update user')
    }
  },

  /**
   * Reset user password (admin function)
   */
  async resetUserPassword(userId: string, newPassword: string, adminUserId: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      
      // Update user with new password and track who reset it
      await updateDoc(userRef, {
        password: newPassword,
        passwordResetBy: adminUserId,
        passwordResetAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error resetting password:', error)
      throw new Error('Failed to reset password')
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ICANUser | null> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        return null
      }
      
      const userData = userDoc.data()
      return {
        id: userDoc.id,
        ...userData,
        createdAt: (userData.createdAt as any)?.toDate?.() || new Date(),
        lastLogin: (userData.lastLogin as any)?.toDate?.(),
      } as ICANUser
    } catch (error) {
      console.error('Error getting user:', error)
      throw new Error('Failed to get user')
    }
  },

  /**
   * Get user by email and branch
   */
  async getUserByEmailAndBranch(email: string, branchId: string): Promise<ICANUser | null> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(
        usersRef, 
        where('email', '==', email), 
        where('branchId', '==', branchId),
        where('isActive', '==', true)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }
      
      const userDoc = snapshot.docs[0]
      const userData = userDoc.data()
      
      return {
        id: userDoc.id,
        ...userData,
        createdAt: (userData.createdAt as any)?.toDate?.() || new Date(),
        lastLogin: (userData.lastLogin as any)?.toDate?.(),
      } as ICANUser
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw new Error('Failed to get user by email')
    }
  },

  /**
   * Check if email is used for branch login (admin access)
   * Returns true if email exists with currentBranch field (indicating it's a branch login account)
   */
  async isEmailUsedForBranchLogin(email: string): Promise<boolean> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(
        usersRef, 
        where('email', '==', email),
        where('isActive', '==', true)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return false
      }
      
      // Check if any user with this email has currentBranch field (branch login)
      for (const doc of snapshot.docs) {
        const userData = doc.data()
        if (userData.currentBranch || userData.currentBranchId) {
          return true // Email is used for branch login
        }
      }
      
      return false
    } catch (error) {
      console.error('Error checking email for branch login:', error)
      throw new Error('Failed to check email')
    }
  },

  /**
   * Delete a user by ID
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await deleteDoc(userRef)
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new Error('Failed to delete user')
    }
  },

  /**
   * Delete all members from a specific branch
   * @param branchId - Branch ID to delete members from
   * @returns Number of members deleted
   */
  async deleteAllMembersFromBranch(branchId: string): Promise<number> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(
        usersRef,
        where('branchId', '==', branchId),
        where('isMember', '==', true)
      )
      const snapshot = await getDocs(q)
      
      let deletedCount = 0
      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(docSnapshot.ref)
        deletedCount++
      }

      // Reset member counter for this branch
      if (deletedCount > 0) {
        await ICANCounterService.resetMemberCount(branchId)
      }
      
      return deletedCount
    } catch (error) {
      console.error('Error deleting all members:', error)
      throw new Error('Failed to delete all members')
    }
  },

  /**
   * Delete all members across all branches (use with caution!)
   * @returns Number of members deleted
   */
  async deleteAllMembers(): Promise<number> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(usersRef, where('isMember', '==', true))
      const snapshot = await getDocs(q)
      
      let deletedCount = 0
      const branchIds = new Set<string>()

      for (const docSnapshot of snapshot.docs) {
        const userData = docSnapshot.data()
        if (userData.branchId) {
          branchIds.add(userData.branchId)
        }
        await deleteDoc(docSnapshot.ref)
        deletedCount++
      }

      // Reset member counters for all affected branches
      for (const branchId of branchIds) {
        await ICANCounterService.resetMemberCount(branchId).catch(err => {
          console.warn(`Failed to reset counter for branch ${branchId}:`, err)
        })
      }
      
      return deletedCount
    } catch (error) {
      console.error('Error deleting all members:', error)
      throw new Error('Failed to delete all members')
    }
  }
}

// ============================================================================
// INVOICE OPERATIONS
// ============================================================================

export const ICANInvoiceService = {
  /**
   * Create invoice
   */
  async createInvoice(invoiceData: Omit<ICANInvoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const invoiceRef = doc(collection(db, COLLECTIONS.INVOICES))
      
      // Generate invoice number if not provided
      if (!invoiceData.number) {
        const counter = await ICANCounterService.getNextCounter('invoice', invoiceData.branchId)
        invoiceData.number = `INV-${String(counter).padStart(6, '0')}`
      }
      
      const newInvoice = {
        ...invoiceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await setDoc(invoiceRef, newInvoice)
      return invoiceRef.id
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw new Error('Failed to create invoice')
    }
  },

  /**
   * Get invoices by branch
   */
  async getInvoicesByBranch(branchId: string, limitCount = 50): Promise<ICANInvoice[]> {
    try {
      const invoicesRef = collection(db, COLLECTIONS.INVOICES)
      
      // Use a simple query without orderBy to avoid index requirements
      const simpleQuery = query(
        invoicesRef,
        where('branchId', '==', branchId),
        limit(limitCount)
      )
      
      const snapshot = await getDocs(simpleQuery)
      
      if (snapshot.empty) {
        return []
      }
      
      const invoices = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as ICANInvoice
      })
      
      // Sort manually by creation date (most recent first)
      return invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
    } catch (error) {
      console.warn('Error fetching invoices, returning empty array:', error)
      return []
    }
  },
  
  /**
   * Get invoice count for statistics (lightweight query)
   */
  async getInvoiceCount(branchId: string): Promise<number> {
    try {
      const invoicesRef = collection(db, COLLECTIONS.INVOICES)
      const countQuery = query(invoicesRef, where('branchId', '==', branchId))
      const snapshot = await getDocs(countQuery)
      return snapshot.size
    } catch (error) {
      console.warn('Error getting invoice count:', error)
      return 0
    }
  }
}

// ============================================================================
// RECEIPT OPERATIONS
// ============================================================================

export const ICANReceiptService = {
  /**
   * Create receipt
   */
  async createReceipt(receiptData: Omit<ICANReceipt, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const receiptRef = doc(collection(db, COLLECTIONS.RECEIPTS))
      
      // Generate receipt number if not provided
      if (!receiptData.number) {
        const counter = await ICANCounterService.getNextCounter('receipt', receiptData.branchId)
        receiptData.number = `REC-${String(counter).padStart(6, '0')}`
      }
      
      const newReceipt = {
        ...receiptData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await setDoc(receiptRef, newReceipt)
      return receiptRef.id
    } catch (error) {
      console.error('Error creating receipt:', error)
      throw new Error('Failed to create receipt')
    }
  },

  /**
   * Get receipts by branch
   */
  async getReceiptsByBranch(branchId: string, limitCount = 50): Promise<ICANReceipt[]> {
    try {
      const receiptsRef = collection(db, COLLECTIONS.RECEIPTS)
      
      // Use a simple query without orderBy to avoid index requirements
      const simpleQuery = query(
        receiptsRef,
        where('branchId', '==', branchId),
        limit(limitCount)
      )
      
      const snapshot = await getDocs(simpleQuery)
      
      if (snapshot.empty) {
        return []
      }
      
      const receipts = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as ICANReceipt
      })
      
      // Sort manually by creation date (most recent first)
      return receipts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
    } catch (error) {
      console.warn('Error fetching receipts, returning empty array:', error)
      return []
    }
  },
  
  /**
   * Get receipt count for statistics (lightweight query)
   */
  async getReceiptCount(branchId: string): Promise<number> {
    try {
      const receiptsRef = collection(db, COLLECTIONS.RECEIPTS)
      const countQuery = query(receiptsRef, where('branchId', '==', branchId))
      const snapshot = await getDocs(countQuery)
      return snapshot.size
    } catch (error) {
      console.warn('Error getting receipt count:', error)
      return 0
    }
  }
}

// ============================================================================
// COUNTER OPERATIONS
// ============================================================================

export const ICANCounterService = {
  /**
   * Get next counter value
   */
  async getNextCounter(type: string, branchId?: string): Promise<number> {
    try {
      const counterId = branchId ? `${type}_${branchId}` : type
      const counterRef = doc(db, COLLECTIONS.COUNTERS, counterId)
      const counterDoc = await getDoc(counterRef)
      
      if (counterDoc.exists()) {
        await updateDoc(counterRef, {
          value: increment(1),
          lastUpdated: serverTimestamp()
        })
        return counterDoc.data().value + 1
      } else {
        await setDoc(counterRef, {
          key: type,
          value: 1,
          branchId: branchId || null,
          lastUpdated: serverTimestamp()
        })
        return 1
      }
    } catch (error) {
      console.error('Error getting counter:', error)
      throw new Error('Failed to get counter')
    }
  },

  /**
   * Get member count for a branch
   */
  async getMemberCount(branchId: string): Promise<number> {
    try {
      const counterId = `members_${branchId}`
      const counterRef = doc(db, COLLECTIONS.COUNTERS, counterId)
      const counterDoc = await getDoc(counterRef)
      
      if (counterDoc.exists()) {
        return counterDoc.data().value || 0
      } else {
        // Initialize counter if it doesn't exist
        await setDoc(counterRef, {
          key: 'members',
          value: 0,
          branchId: branchId,
          lastUpdated: serverTimestamp()
        })
        return 0
      }
    } catch (error) {
      console.error('Error getting member count:', error)
      return 0
    }
  },

  /**
   * Increment member count for a branch
   */
  async incrementMemberCount(branchId: string): Promise<number> {
    try {
      const counterId = `members_${branchId}`
      const counterRef = doc(db, COLLECTIONS.COUNTERS, counterId)
      const counterDoc = await getDoc(counterRef)
      
      if (counterDoc.exists()) {
        await updateDoc(counterRef, {
          value: increment(1),
          lastUpdated: serverTimestamp()
        })
        return (counterDoc.data().value || 0) + 1
      } else {
        // Initialize counter with 1
        await setDoc(counterRef, {
          key: 'members',
          value: 1,
          branchId: branchId,
          lastUpdated: serverTimestamp()
        })
        return 1
      }
    } catch (error) {
      console.error('Error incrementing member count:', error)
      throw new Error('Failed to increment member count')
    }
  },

  /**
   * Decrement member count for a branch (for deletion)
   */
  async decrementMemberCount(branchId: string): Promise<number> {
    try {
      const counterId = `members_${branchId}`
      const counterRef = doc(db, COLLECTIONS.COUNTERS, counterId)
      const counterDoc = await getDoc(counterRef)
      
      if (counterDoc.exists()) {
        const currentValue = counterDoc.data().value || 0
        const newValue = Math.max(0, currentValue - 1) // Don't go below 0
        
        await updateDoc(counterRef, {
          value: newValue,
          lastUpdated: serverTimestamp()
        })
        return newValue
      } else {
        // Initialize counter with 0 if it doesn't exist
        await setDoc(counterRef, {
          key: 'members',
          value: 0,
          branchId: branchId,
          lastUpdated: serverTimestamp()
        })
        return 0
      }
    } catch (error) {
      console.error('Error decrementing member count:', error)
      throw new Error('Failed to decrement member count')
    }
  },

  /**
   * Reset member count for a branch to 0
   */
  async resetMemberCount(branchId: string): Promise<void> {
    try {
      const counterId = `members_${branchId}`
      const counterRef = doc(db, COLLECTIONS.COUNTERS, counterId)
      
      await setDoc(counterRef, {
        key: 'members',
        value: 0,
        branchId: branchId,
        lastUpdated: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error resetting member count:', error)
      throw new Error('Failed to reset member count')
    }
  },

  /**
   * Get all counters
   */
  async getAllCounters(): Promise<ICANCounter[]> {
    try {
      const countersRef = collection(db, COLLECTIONS.COUNTERS)
      const snapshot = await getDocs(countersRef)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: (doc.data().lastUpdated as any)?.toDate?.() || new Date(),
      } as ICANCounter))
    } catch (error) {
      console.error('Error fetching counters:', error)
      throw new Error('Failed to fetch counters')
    }
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

export const ICANStatsService = {
  /**
   * Get branch statistics
   */
  async getBranchStatistics(branchId: string) {
    try {
      let users = []
      let invoices = []
      let receipts = []
      
      try {
        // Get user count with error handling
        users = await ICANUserService.getUsersByBranch(branchId)
      } catch (userError) {
        console.warn('Failed to load users for statistics:', userError)
      }
      
      try {
        // Get recent invoices with error handling
        invoices = await ICANInvoiceService.getInvoicesByBranch(branchId, 10)
      } catch (invoiceError) {
        console.warn('Failed to load invoices for statistics:', invoiceError)
      }
      
      try {
        // Get recent receipts with error handling
        receipts = await ICANReceiptService.getReceiptsByBranch(branchId, 10)
      } catch (receiptError) {
        console.warn('Failed to load receipts for statistics:', receiptError)
      }
      
      // Calculate totals
      const totalInvoices = invoices.length
      const totalReceipts = receipts.length
      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
      const totalPayments = receipts.reduce((sum, rec) => sum + rec.amount, 0)
      
      return {
        userCount: users.length,
        totalInvoices,
        totalReceipts,
        totalRevenue,
        totalPayments,
        recentInvoices: invoices.slice(0, 5),
        recentReceipts: receipts.slice(0, 5)
      }
    } catch (error) {
      console.error('Error getting branch statistics:', error)
      // Return default statistics instead of throwing
      return {
        userCount: 0,
        totalInvoices: 0,
        totalReceipts: 0,
        totalRevenue: 0,
        totalPayments: 0,
        recentInvoices: [],
        recentReceipts: []
      }
    }
  }
}

// ============================================================================
// SEED DATA
// ============================================================================

export const ICANSeedService = {
  /**
   * Clear all existing branches (for reseeding)
   */
  async clearAllBranches() {
    try {
      console.log('🧹 Clearing existing branches...')
      const branchesRef = collection(db, COLLECTIONS.BRANCHES)
      const snapshot = await getDocs(branchesRef)
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      console.log(`✅ Cleared ${snapshot.docs.length} existing branches`)
    } catch (error) {
      console.error('Error clearing branches:', error)
    }
  },

  /**
   * Initialize all Nigerian states and FCT as branches
   */
  async seedDefaultBranches() {
    try {
      const branches = await ICANBranchService.getAllBranches()
      
      if (branches.length === 0) {
        console.log('🌱 Seeding all Nigerian states as ICAN branches...')
        
        // All 36 Nigerian states + FCT Abuja
        const nigerianStates = [
          // North Central
          { name: 'Benue', capital: 'Makurdi' },
          { name: 'FCT Abuja', capital: 'Abuja' },
          { name: 'Kogi', capital: 'Lokoja' },
          { name: 'Kwara', capital: 'Ilorin' },
          { name: 'Nasarawa', capital: 'Lafia' },
          { name: 'Niger', capital: 'Minna' },
          { name: 'Plateau', capital: 'Jos' },
          
          // North East
          { name: 'Adamawa', capital: 'Yola' },
          { name: 'Bauchi', capital: 'Bauchi' },
          { name: 'Borno', capital: 'Maiduguri' },
          { name: 'Gombe', capital: 'Gombe' },
          { name: 'Taraba', capital: 'Jalingo' },
          { name: 'Yobe', capital: 'Damaturu' },
          
          // North West
          { name: 'Jigawa', capital: 'Dutse' },
          { name: 'Kaduna', capital: 'Kaduna' },
          { name: 'Kano', capital: 'Kano' },
          { name: 'Katsina', capital: 'Katsina' },
          { name: 'Kebbi', capital: 'Birnin Kebbi' },
          { name: 'Sokoto', capital: 'Sokoto' },
          { name: 'Zamfara', capital: 'Gusau' },
          
          // South East
          { name: 'Abia', capital: 'Umuahia' },
          { name: 'Anambra', capital: 'Awka' },
          { name: 'Ebonyi', capital: 'Abakaliki' },
          { name: 'Enugu', capital: 'Enugu' },
          { name: 'Imo', capital: 'Owerri' },
          
          // South South
          { name: 'Akwa Ibom', capital: 'Uyo' },
          { name: 'Bayelsa', capital: 'Yenagoa' },
          { name: 'Cross River', capital: 'Calabar' },
          { name: 'Delta', capital: 'Asaba' },
          { name: 'Edo', capital: 'Benin City' },
          { name: 'Rivers', capital: 'Port Harcourt' },
          
          // South West
          { name: 'Ekiti', capital: 'Ado Ekiti' },
          { name: 'Lagos', capital: 'Ikeja' },
          { name: 'Ogun', capital: 'Abeokuta' },
          { name: 'Ondo', capital: 'Akure' },
          { name: 'Osun', capital: 'Osogbo' },
          { name: 'Oyo', capital: 'Ibadan' }
        ]
        
        for (const state of nigerianStates) {
          const branchData = {
            name: `${state.name} State`,
            manager: `${state.name} State Manager`,
            password: `${state.name.toLowerCase()}123`, // Simple password pattern
            maxUsers: 50,
            registrationEnabled: true
          }
          
          await ICANBranchService.createBranch(branchData)
        }
        
        console.log('✅ All 37 Nigerian branches created (36 states + FCT)')
      }
    } catch (error) {
      console.error('Error seeding Nigerian states:', error)
    }
  },

  /**
   * Force reseed all Nigerian states (clears existing and creates new)
   */
  async forceReseedAllNigerianStates() {
    try {
      await this.clearAllBranches()
      await this.seedDefaultBranches()
      console.log('🎉 Successfully reseeded all 37 Nigerian state branches!')
    } catch (error) {
      console.error('Error reseeding branches:', error)
      throw error
    }
  }
}