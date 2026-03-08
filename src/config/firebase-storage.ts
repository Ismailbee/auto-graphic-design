/**
 * Firebase Storage - Lazy Loaded Module
 * This module is loaded on-demand to reduce initial bundle size
 */

import { app } from './firebase'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

let _storage: FirebaseStorage | null = null

/**
 * Get Storage instance (lazy initialized)
 */
export function getStorageInstance(): FirebaseStorage {
  if (!_storage) {
    _storage = getStorage(app)
  }
  return _storage
}

// Re-export Storage functions for convenience
export {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type UploadTask
} from 'firebase/storage'
