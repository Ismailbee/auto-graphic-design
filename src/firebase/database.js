// Firebase Database Functions
// This module provides database operations for invoices, receipts, and related data

/**
 * Save an invoice to the database
 * @param {string} branch - The branch name
 * @param {object} invoiceData - The invoice data to save
 * @returns {Promise<object>} Result with success status and invoice ID
 */
export const saveInvoice = async (branch, invoiceData) => {
  try {
    // For now, using localStorage as a simple storage solution
    const storageKey = `invoices_${branch}`;
    const existingInvoices = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const invoice = {
      ...invoiceData,
      id: invoiceData.id || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: invoiceData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      branch
    };
    
    existingInvoices.push(invoice);
    localStorage.setItem(storageKey, JSON.stringify(existingInvoices));
    
    return { success: true, id: invoice.id, invoice };
  } catch (error) {
    console.error('Error saving invoice:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all invoices for a branch
 * @param {string} branch - The branch name
 * @returns {Promise<object>} Result with invoices array
 */
export const getAllInvoices = async (branch) => {
  try {
    const storageKey = `invoices_${branch}`;
    const invoices = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Sort by creation date (newest first)
    invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return { success: true, invoices };
  } catch (error) {
    console.error('Error getting invoices:', error);
    return { success: false, error: error.message, invoices: [] };
  }
};

/**
 * Delete an invoice
 * @param {string} branch - The branch name
 * @param {string} invoiceId - The invoice ID to delete
 * @returns {Promise<object>} Result with success status
 */
export const deleteInvoice = async (branch, invoiceId) => {
  try {
    const storageKey = `invoices_${branch}`;
    const invoices = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const filteredInvoices = invoices.filter(inv => inv.id !== invoiceId);
    localStorage.setItem(storageKey, JSON.stringify(filteredInvoices));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing invoice
 * @param {string} branch - The branch name
 * @param {string} invoiceId - The invoice ID to update
 * @param {object} updateData - The data to update
 * @returns {Promise<object>} Result with success status
 */
export const updateInvoice = async (branch, invoiceId, updateData) => {
  try {
    const storageKey = `invoices_${branch}`;
    const invoices = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const index = invoices.findIndex(inv => inv.id === invoiceId);
    if (index !== -1) {
      invoices[index] = {
        ...invoices[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(invoices));
      return { success: true, invoice: invoices[index] };
    }
    
    return { success: false, error: 'Invoice not found' };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save a receipt to the database
 * @param {string} branch - The branch name
 * @param {object} receiptData - The receipt data to save
 * @returns {Promise<object>} Result with success status and receipt ID
 */
export const saveReceipt = async (branch, receiptData) => {
  try {
    const storageKey = `receipts_${branch}`;
    const existingReceipts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const receipt = {
      ...receiptData,
      id: receiptData.id || `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: receiptData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      branch
    };
    
    existingReceipts.push(receipt);
    localStorage.setItem(storageKey, JSON.stringify(existingReceipts));
    
    return { success: true, id: receipt.id, receipt };
  } catch (error) {
    console.error('Error saving receipt:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all receipts for a branch
 * @param {string} branch - The branch name
 * @returns {Promise<object>} Result with receipts array
 */
export const getAllReceipts = async (branch) => {
  try {
    const storageKey = `receipts_${branch}`;
    const receipts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Sort by creation date (newest first)
    receipts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return { success: true, receipts };
  } catch (error) {
    console.error('Error getting receipts:', error);
    return { success: false, error: error.message, receipts: [] };
  }
};

/**
 * Delete a receipt
 * @param {string} branch - The branch name
 * @param {string} receiptId - The receipt ID to delete
 * @returns {Promise<object>} Result with success status
 */
export const deleteReceipt = async (branch, receiptId) => {
  try {
    const storageKey = `receipts_${branch}`;
    const receipts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const filteredReceipts = receipts.filter(rcp => rcp.id !== receiptId);
    localStorage.setItem(storageKey, JSON.stringify(filteredReceipts));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing receipt
 * @param {string} branch - The branch name
 * @param {string} receiptId - The receipt ID to update
 * @param {object} updateData - The data to update
 * @returns {Promise<object>} Result with success status
 */
export const updateReceipt = async (branch, receiptId, updateData) => {
  try {
    const storageKey = `receipts_${branch}`;
    const receipts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const index = receipts.findIndex(rcp => rcp.id === receiptId);
    if (index !== -1) {
      receipts[index] = {
        ...receipts[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(receipts));
      return { success: true, receipt: receipts[index] };
    }
    
    return { success: false, error: 'Receipt not found' };
  } catch (error) {
    console.error('Error updating receipt:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save member activity log
 * @param {string} branch - The branch name
 * @param {object} activityData - The activity data to save
 * @returns {Promise<object>} Result with success status
 */
export const saveMemberActivity = async (branch, activityData) => {
  try {
    const storageKey = `activities_${branch}`;
    const existingActivities = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const activity = {
      ...activityData,
      id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      branch
    };
    
    existingActivities.push(activity);
    
    // Keep only last 1000 activities to prevent storage bloat
    if (existingActivities.length > 1000) {
      existingActivities.shift();
    }
    
    localStorage.setItem(storageKey, JSON.stringify(existingActivities));
    
    return { success: true, id: activity.id };
  } catch (error) {
    console.error('Error saving member activity:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all signatures for a branch
 * @param {string} branch - The branch name
 * @returns {Promise<object>} Result with signatures array
 */
export const getAllSignatures = async (branch) => {
  try {
    const storageKey = `signatures_${branch}`;
    const signatures = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    return { success: true, data: signatures, signatures }; // Return both for compatibility
  } catch (error) {
    console.error('Error getting signatures:', error);
    return { success: false, error: error.message, data: [], signatures: [] };
  }
};

/**
 * Save a signature
 * @param {string} branch - The branch name
 * @param {object} signatureData - The signature data to save
 * @returns {Promise<object>} Result with success status
 */
export const saveSignature = async (branch, signatureData) => {
  try {
    const storageKey = `signatures_${branch}`;
    const existingSignatures = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const signature = {
      ...signatureData,
      id: signatureData.id || `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      branch
    };
    
    existingSignatures.push(signature);
    localStorage.setItem(storageKey, JSON.stringify(existingSignatures));
    
    return { success: true, id: signature.id, signature };
  } catch (error) {
    console.error('Error saving signature:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a signature
 * @param {string} branch - The branch name
 * @param {string} signatureId - The signature ID to delete
 * @returns {Promise<object>} Result with success status
 */
export const deleteSignature = async (branch, signatureId) => {
  try {
    const storageKey = `signatures_${branch}`;
    const signatures = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const filteredSignatures = signatures.filter(sig => sig.id !== signatureId);
    localStorage.setItem(storageKey, JSON.stringify(filteredSignatures));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting signature:', error);
    return { success: false, error: error.message };
  }
};
