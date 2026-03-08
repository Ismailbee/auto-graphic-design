/**
 * SmartDesignPro Invoice & Receipt API Service
 * Independent service using SmartDesignPro's own Firebase backend
 * Uses 'sdp_' prefixed Firestore collections
 */

import { 
  BranchService, 
  UserService, 
  SeedService,
  CounterService,
  InvoiceService,
  ReceiptService,
  StatsService
} from './services/invoice-receipt-service.js'

// ============================================================================
// LEGACY API COMPATIBILITY LAYER
// Provides the same interface as the old API but uses SmartDesignPro's own Firebase
// ============================================================================

// Branch cache for performance optimization
let branchCache: { [key: string]: any } = {}
let branchCacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getBranchByName(branchName: string) {
  const now = Date.now()
  if (now - branchCacheTime > CACHE_DURATION) {
    const branches = await BranchService.getAllBranches()
    branchCache = {}
    branches.forEach(branch => { branchCache[branch.name] = branch })
    branchCacheTime = now
  }
  return branchCache[branchName] || null
}

export async function getBranches() {
  try {
    await SeedService.seedDefaultBranches()
    const branches = await BranchService.getAllBranches()
    return { success: true, data: branches.map(branch => branch.name), message: 'Branches loaded successfully' }
  } catch (error) {
    return { success: false, data: [], message: error.message }
  }
}

export async function authenticateUser(email: string, password: string, branchName: string) {
  try {
    const branch = await BranchService.verifyBranchCredentials(branchName, password)
    if (!branch) throw new Error('Incorrect branch password')
    let user = await UserService.authenticateUser(email, branch.id)
    if (!user) {
      const userId = await UserService.createUser({
        email, name: email.split('@')[0], branchId: branch.id, branch: branch.name,
        role: 'user', lastLogin: new Date(), isActive: true
      })
      user = { id: userId, email, name: email.split('@')[0], branch: branch.name, branchId: branch.id, role: 'user' }
    }
    return { success: true, data: { user, branch: branch.name }, message: 'Authentication successful' }
  } catch (error) {
    return { success: false, data: null, message: error.message }
  }
}

export async function getDashboardData(branchName: string) {
  try {
    const branch = await getBranchByName(branchName)
    if (!branch) return { success: false, data: null, message: 'Branch not found' }
    const [invoices, receipts] = await Promise.all([
      InvoiceService.getInvoicesByBranch(branch.id, 10),
      ReceiptService.getReceiptsByBranch(branch.id, 10)
    ])
    const memberCount = await CounterService.getMemberCount(branch.id)
    return {
      success: true,
      data: {
        totalInvoices: invoices.length, totalReceipts: receipts.length, totalMembers: memberCount,
        recentInvoices: invoices.slice(0, 5), recentReceipts: receipts.slice(0, 5)
      }
    }
  } catch (error) {
    return { success: false, data: null, message: error.message }
  }
}

export async function createInvoice(invoiceData: any) {
  try {
    const id = await InvoiceService.createInvoice(invoiceData)
    return { success: true, data: { id }, message: 'Invoice created' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function getNextInvoiceNumber(branchId: string) {
  try {
    const next = await CounterService.getNextCounter('invoice', branchId)
    return { success: true, data: next }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function createReceipt(receiptData: any) {
  try {
    const id = await ReceiptService.createReceipt(receiptData)
    return { success: true, data: { id }, message: 'Receipt created' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function getNextReceiptNumber(branchId: string) {
  try {
    const next = await CounterService.getNextCounter('receipt', branchId)
    return { success: true, data: next }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function getInvoices(branchId: string, limit = 50) {
  try {
    const invoices = await InvoiceService.getInvoicesByBranch(branchId, limit)
    return { success: true, data: invoices }
  } catch (error) {
    return { success: false, data: [], message: error.message }
  }
}

export async function getReceipts(branchId: string, limit = 50) {
  try {
    const receipts = await ReceiptService.getReceiptsByBranch(branchId, limit)
    return { success: true, data: receipts }
  } catch (error) {
    return { success: false, data: [], message: error.message }
  }
}

export async function verifyPassword(branchName: string, password: string) {
  try {
    const branch = await BranchService.verifyBranchCredentials(branchName, password)
    return { success: !!branch, data: branch }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export const API_BASE = 'sdp-firebase-service'

export function getCurrentUser() {
  try {
    const memberData = localStorage.getItem('sdp_authenticated_member')
    if (memberData) return JSON.parse(memberData)
    const altData = localStorage.getItem('authenticatedMember')
    if (altData) return JSON.parse(altData)
    return null
  } catch { return null }
}

export async function getAllMembers(branchName: string) {
  try {
    const branch = await getBranchByName(branchName)
    if (!branch) return { success: false, data: [], message: 'Branch not found' }
    const members = await UserService.getMembersByBranch(branch.id)
    return { success: true, data: members }
  } catch (error) {
    return { success: false, data: [], message: error.message }
  }
}

export async function getAllInvoices(branchName: string, limit = 50) {
  try {
    const branch = await getBranchByName(branchName)
    if (!branch) return { success: false, data: [], message: 'Branch not found' }
    const invoices = await InvoiceService.getInvoicesByBranch(branch.id, limit)
    return { success: true, data: invoices }
  } catch (error) {
    return { success: false, data: [], message: error.message }
  }
}

export async function getAllReceipts(branchName: string, limit = 50) {
  try {
    const branch = await getBranchByName(branchName)
    if (!branch) return { success: false, data: [], message: 'Branch not found' }
    const receipts = await ReceiptService.getReceiptsByBranch(branch.id, limit)
    return { success: true, data: receipts }
  } catch (error) {
    return { success: false, data: [], message: error.message }
  }
}

// ============================================================================
// SIGNATURE MANAGEMENT
// ============================================================================

interface SignatureData {
  id: string; name: string; dataURL: string; isPrimary: boolean; createdAt: string;
}

function getSignatureStorageKey(branchName: string): string {
  return `signatures_${branchName}`;
}

export async function saveSignature(branchName: string, signatureData: Omit<SignatureData, 'id'>) {
  try {
    const storageKey = getSignatureStorageKey(branchName)
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newSig: SignatureData = { id, ...signatureData }
    if (newSig.isPrimary) existing.forEach((s: SignatureData) => s.isPrimary = false)
    existing.push(newSig)
    localStorage.setItem(storageKey, JSON.stringify(existing))
    return { success: true, data: newSig }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getAllSignatures(branchName: string) {
  try {
    const storageKey = getSignatureStorageKey(branchName)
    const signatures = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return { success: true, data: signatures, signatures }
  } catch (error) {
    return { success: false, data: [], error: error.message }
  }
}

export async function getPrimarySignature(branchName: string) {
  try {
    const storageKey = getSignatureStorageKey(branchName)
    const signatures = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return { success: true, data: signatures.find((s: SignatureData) => s.isPrimary) || null }
  } catch (error) {
    return { success: false, data: null, error: error.message }
  }
}

export async function updateSignature(branchName: string, signatureId: string, updateData: Partial<SignatureData>) {
  try {
    const storageKey = getSignatureStorageKey(branchName)
    const signatures = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const index = signatures.findIndex((s: SignatureData) => s.id === signatureId)
    if (index === -1) throw new Error('Signature not found')
    if (updateData.isPrimary) signatures.forEach((s: SignatureData) => s.isPrimary = false)
    signatures[index] = { ...signatures[index], ...updateData }
    localStorage.setItem(storageKey, JSON.stringify(signatures))
    return { success: true, data: signatures[index] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function deleteSignatureFromDB(branchName: string, signatureId: string) {
  try {
    const storageKey = getSignatureStorageKey(branchName)
    const signatures = JSON.parse(localStorage.getItem(storageKey) || '[]')
    localStorage.setItem(storageKey, JSON.stringify(signatures.filter((s: SignatureData) => s.id !== signatureId)))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deleteSignature = deleteSignatureFromDB

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

export interface ActivityLog {
  id: string; action: string; memberName: string; branch: string; timestamp: string;
  type: 'invoice' | 'receipt' | 'export' | 'login' | 'other';
  details?: { documentNumber?: string; exportFormat?: 'pdf' | 'jpeg'; exportType?: 'current' | 'all'; pageCount?: number; }
}

export async function logActivityRecord(branchName: string, activity: Omit<ActivityLog, 'id' | 'timestamp' | 'branch'>) {
  try {
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const fullActivity: ActivityLog = { ...activity, id: activityId, branch: branchName, timestamp: new Date().toISOString() }
    const storageKey = `sdp_activities_${branchName}`
    const activities = JSON.parse(localStorage.getItem(storageKey) || '[]')
    activities.unshift(fullActivity)
    localStorage.setItem(storageKey, JSON.stringify(activities.slice(0, 50)))
    return { success: true, activityId }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Alias for backward compatibility - pages import this as logActivity
export const logActivity = logActivityRecord

export async function getActivities(branchName: string, limit = 10) {
  try {
    const storageKey = `sdp_activities_${branchName}`
    const activities = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return { success: true, activities: activities.slice(0, limit) }
  } catch (error) {
    return { success: false, error: error.message, activities: [] }
  }
}

