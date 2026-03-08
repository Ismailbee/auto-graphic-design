/**
 * SmartDesignPro Invoice & Receipt Service - Firebase Integration
 * Independent backend service for SmartDesignPro invoice/receipt module
 * Uses main SmartDesignPro Firebase with 'sdp_' prefixed collections
 * Completely independent from any third-party micro-app
 */

// Import from MAIN SmartDesignPro Firebase config
import { app, auth, getDb, getStorageInstance } from '../../../../config/firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  limit as firestoreLimit,
  addDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore'

// Firestore collections - prefixed with 'sdp_' for SmartDesignPro data
const COLLECTIONS = {
  BRANCHES: 'sdp_branches',
  USERS: 'sdp_users',
  INVOICES: 'sdp_invoices',
  RECEIPTS: 'sdp_receipts',
  COUNTERS: 'sdp_counters',
  SIGNATURES: 'sdp_signatures',
  ACTIVITIES: 'sdp_activities'
};

console.log('✅ SmartDesignPro Invoice/Receipt Service initialized');
console.log('ℹ️ Waiting for Firebase to be initialized by main.js...');

// Get db instance lazily
let db = null;
const getDbInstance = async () => {
  if (!db) {
    db = await getDb();
  }
  return db;
};

// --- Helper Functions ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Check internet connectivity
const requireOnline = () => {
  if (!navigator.onLine) {
    console.warn('⚠️ No internet connection. Working in offline mode with local data.');
    return false;
  }
  return true;
};

// --- Seed Service ---
export const SeedService = {
  async seedDefaultBranches() {
    requireOnline();
    const dbInstance = await getDbInstance();
    const branchesRef = collection(dbInstance, COLLECTIONS.BRANCHES);
    const snapshot = await getDocs(branchesRef);
    
    if (snapshot.empty) {
      // Create a default "Main Branch" for SmartDesignPro
      const branchDoc = doc(dbInstance, COLLECTIONS.BRANCHES, 'branch_main');
      await setDoc(branchDoc, {
        id: 'branch_main',
        name: 'Main Branch',
        location: 'Main',
        createdAt: serverTimestamp(),
        isActive: true
      });
      return [{ id: 'branch_main', name: 'Main Branch', location: 'Main' }];
    }
  }
};

// --- Branch Service ---
export const BranchService = {
  async getAllBranches() {
    const isOnline = requireOnline();
    
    try {
      if (!isOnline) {
        console.log('📱 Offline mode: Loading branches from localStorage');
        const cached = localStorage.getItem('sdp_branches');
        if (cached) return JSON.parse(cached);
        return [];
      }
      
      const dbInstance = await getDbInstance();
      const branchesRef = collection(dbInstance, COLLECTIONS.BRANCHES);
      const snapshot = await getDocs(branchesRef);
      
      if (snapshot.empty) {
        console.log('📌 No branches found, seeding...');
        return await SeedService.seedDefaultBranches();
      }
      
      const branches = [];
      snapshot.forEach(doc => {
        branches.push({ id: doc.id, ...doc.data() });
      });
      
      localStorage.setItem('sdp_branches', JSON.stringify(branches));
      return branches;
    } catch (error) {
      console.error('❌ Error fetching branches:', error);
      const cached = localStorage.getItem('sdp_branches');
      if (cached) return JSON.parse(cached);
      throw new Error('Failed to load branches: ' + error.message);
    }
  },

  async verifyBranchCredentials(branchName, password) {
    const isOnline = requireOnline();
    if (!isOnline) return null;
    
    try {
      const dbInstance = await getDbInstance();
      const branchesRef = collection(dbInstance, COLLECTIONS.BRANCHES);
      const q = query(branchesRef, where('name', '==', branchName));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const branchData = snapshot.docs[0].data();
      if (branchData.password === password) {
        return { id: snapshot.docs[0].id, ...branchData };
      }
      return null;
    } catch (error) {
      console.error('❌ Error verifying credentials:', error);
      return null;
    }
  },

  async testFirebaseConnection() {
    requireOnline();
    try {
      const dbInstance = await getDbInstance();
      const testRef = collection(dbInstance, COLLECTIONS.BRANCHES);
      const snapshot = await getDocs(query(testRef, firestoreLimit(5)));
      return { success: true, count: snapshot.size };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// --- User Service ---
export const UserService = {
  async authenticateUser(email, branchId) {
    const isOnline = requireOnline();
    if (!isOnline) return null;
    
    try {
      const dbInstance = await getDbInstance();
      const usersRef = collection(dbInstance, COLLECTIONS.USERS);
      const q = query(usersRef, where('email', '==', email), where('branchId', '==', branchId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const userData = snapshot.docs[0].data();
      await updateDoc(snapshot.docs[0].ref, { lastLogin: serverTimestamp() });
      return { id: snapshot.docs[0].id, ...userData };
    } catch (error) {
      console.error('❌ Error authenticating user:', error);
      return null;
    }
  },

  async createUser(userData) {
    requireOnline();
    try {
      const dbInstance = await getDbInstance();
      const usersRef = collection(dbInstance, COLLECTIONS.USERS);
      const userRef = await addDoc(usersRef, {
        ...userData,
        createdAt: serverTimestamp()
      });
      return userRef.id;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  },

  async getUserByEmailAndBranch(email, branchId) {
    const isOnline = requireOnline();
    if (!isOnline) return null;
    
    try {
      const dbInstance = await getDbInstance();
      const usersRef = collection(dbInstance, COLLECTIONS.USERS);
      const q = query(usersRef, where('email', '==', email), where('branchId', '==', branchId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      console.error('❌ Error finding user:', error);
      return null;
    }
  },

  async getMembersByBranch(branchId) {
    const isOnline = requireOnline();
    if (!isOnline) return [];
    
    try {
      const dbInstance = await getDbInstance();
      const usersRef = collection(dbInstance, COLLECTIONS.USERS);
      const q = query(usersRef, where('branchId', '==', branchId), where('isMember', '==', true));
      const snapshot = await getDocs(q);
      
      const members = [];
      snapshot.forEach(doc => {
        members.push({ id: doc.id, ...doc.data() });
      });
      return members;
    } catch (error) {
      console.error('❌ Error fetching members:', error);
      return [];
    }
  },

  async logActivity(userId, activityData) {
    try {
      const dbInstance = await getDbInstance();
      const activitiesRef = collection(dbInstance, COLLECTIONS.ACTIVITIES);
      await addDoc(activitiesRef, {
        userId,
        ...activityData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('⚠️ Failed to log activity:', error.message);
    }
  }
};

// --- Counter Service ---
export const CounterService = {
  async getNextCounter(type, branchId) {
    requireOnline();
    try {
      const dbInstance = await getDbInstance();
      const counterKey = `${branchId}_${type}`;
      const counterRef = doc(dbInstance, COLLECTIONS.COUNTERS, counterKey);
      const counterDoc = await getDoc(counterRef);
      
      let nextValue = 1;
      if (counterDoc.exists()) {
        nextValue = (counterDoc.data().value || 0) + 1;
      }
      
      await setDoc(counterRef, { value: nextValue, lastUpdated: serverTimestamp() });
      return nextValue;
    } catch (error) {
      console.error('❌ Error getting counter:', error);
      throw new Error('Failed to get counter: ' + error.message);
    }
  },

  async getMemberCount(branchId) {
    requireOnline();
    try {
      const dbInstance = await getDbInstance();
      const usersRef = collection(dbInstance, COLLECTIONS.USERS);
      const q = query(usersRef, where('branchId', '==', branchId), where('isMember', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('❌ Error getting member count:', error);
      return 0;
    }
  }
};

// --- Invoice Service ---
export const InvoiceService = {
  async createInvoice(invoiceData) {
    requireOnline();
    try {
      const dbInstance = await getDbInstance();
      const id = invoiceData.id || `INV-${Date.now()}`;
      const invoiceRef = doc(dbInstance, COLLECTIONS.INVOICES, id);
      
      await setDoc(invoiceRef, { ...invoiceData, id, createdAt: serverTimestamp() });
      
      if (invoiceData.userId) {
        await UserService.logActivity(invoiceData.userId, {
          type: 'INVOICE_CREATED',
          timestamp: serverTimestamp(),
          details: { invoiceId: id, branch: invoiceData.branch, amount: invoiceData.totalAmount || 0 }
        });
      }
      
      console.log('✅ Invoice created:', id);
      return id;
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      throw new Error('Failed to create invoice: ' + error.message);
    }
  },

  async getInvoicesByBranch(branchId, limit = 50) {
    requireOnline();
    try {
      const dbInstance = await getDbInstance();
      const invoicesRef = collection(dbInstance, COLLECTIONS.INVOICES);
      const q = query(invoicesRef, where('branchId', '==', branchId));
      const snapshot = await getDocs(q);
      
      const invoices = [];
      snapshot.forEach(doc => { invoices.push({ id: doc.id, ...doc.data() }); });
      
      invoices.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      return invoices.slice(0, limit);
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      return [];
    }
  }
};

// --- Receipt Service ---
export const ReceiptService = {
  async createReceipt(receiptData) {
    requireOnline();
    try {
      const dbInstance = await getDbInstance();
      const id = receiptData.id || `REC-${Date.now()}`;
      const receiptRef = doc(dbInstance, COLLECTIONS.RECEIPTS, id);
      
      await setDoc(receiptRef, { ...receiptData, id, createdAt: serverTimestamp() });
      
      if (receiptData.userId) {
        await UserService.logActivity(receiptData.userId, {
          type: 'RECEIPT_CREATED',
          timestamp: serverTimestamp(),
          details: { receiptId: id, branch: receiptData.branch, amount: receiptData.amount || 0 }
        });
      }
      
      console.log('✅ Receipt created:', id);
      return id;
    } catch (error) {
      console.error('❌ Error creating receipt:', error);
      throw new Error('Failed to create receipt: ' + error.message);
    }
  },

  async getReceiptsByBranch(branchId, limit = 50) {
    requireOnline();
    try {
      const dbInstance = await getDbInstance();
      const receiptsRef = collection(dbInstance, COLLECTIONS.RECEIPTS);
      const q = query(receiptsRef, where('branchId', '==', branchId));
      const snapshot = await getDocs(q);
      
      const receipts = [];
      snapshot.forEach(doc => { receipts.push({ id: doc.id, ...doc.data() }); });
      
      receipts.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      return receipts.slice(0, limit);
    } catch (error) {
      console.error('❌ Error fetching receipts:', error);
      return [];
    }
  }
};

// --- Stats Service ---
export const StatsService = {
  async getBranchStatistics(branchId) {
    requireOnline();
    const invoices = await InvoiceService.getInvoicesByBranch(branchId, 10);
    const receipts = await ReceiptService.getReceiptsByBranch(branchId, 10);
    return { recentInvoices: invoices, recentReceipts: receipts };
  }
};

// Firebase service export
export const FirebaseService = {
  db,
  auth,
  collections: COLLECTIONS
};

// Export activity logging helper
export const logActivity = UserService.logActivity;

// Default export
export default {
  BranchService,
  UserService,
  SeedService,
  CounterService,
  InvoiceService,
  ReceiptService,
  StatsService,
  FirebaseService,
  logActivity
};
