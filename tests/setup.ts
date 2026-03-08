/**
 * Vitest Setup File
 * Runs before all tests
 */

import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables
process.env.VITE_FIREBASE_API_KEY = 'test-api-key'
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com'
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project'
process.env.VITE_FIREBASE_STORAGE_BUCKET = 'test-project.firebasestorage.app'
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = '123456789'
process.env.VITE_FIREBASE_APP_ID = '1:123456789:web:abcdef'

// Mock Firebase
vi.mock('@/config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

