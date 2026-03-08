/**
 * AI Helper Utilities
 */

import type { AITextResult, AIImageResult, AIBackgroundResult, AIQRCodeResult } from '@/types/ai'

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''))
}

/**
 * Format QR code data based on type
 */
export function formatQRData(data: string, type: string): string {
  switch (type) {
    case 'url':
      return data.startsWith('http') ? data : `https://${data}`
    case 'email':
      return `mailto:${data}`
    case 'phone':
      return `tel:${data}`
    case 'sms':
      const [phone, message] = data.split(':')
      return `sms:${phone}${message ? `?body=${encodeURIComponent(message)}` : ''}`
    case 'wifi':
      const [ssid, password] = data.split(':')
      return `WIFI:T:WPA;S:${ssid};P:${password};;`
    default:
      return data
  }
}

/**
 * Estimate text token count
 */
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4)
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Convert data URL to blob
 */
export function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(parts[1])
  const n = bstr.length
  const u8arr = new Uint8Array(n)
  
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }
  
  return new Blob([u8arr], { type: mime })
}

/**
 * Load image from URL
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * Resize image to fit dimensions
 */
export async function resizeImage(
  imageUrl: string,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  const img = await loadImage(imageUrl)
  
  let width = img.width
  let height = img.height
  
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width = width * ratio
    height = height * ratio
  }
  
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')
  
  ctx.drawImage(img, 0, 0, width, height)
  
  return canvas.toDataURL('image/png')
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  const img = await loadImage(url)
  return {
    width: img.width,
    height: img.height
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.'
    }
  }
  
  return { valid: true }
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(imageUrl: string, size: number = 200): Promise<string> {
  return resizeImage(imageUrl, size, size)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Parse WiFi credentials
 */
export function parseWiFiCredentials(data: string): { ssid: string; password: string } | null {
  const parts = data.split(':')
  if (parts.length !== 2) return null
  
  return {
    ssid: parts[0].trim(),
    password: parts[1].trim()
  }
}

/**
 * Parse vCard data
 */
export function parseVCard(data: string): Record<string, string> {
  const lines = data.split('\n')
  const vcard: Record<string, string> = {}
  
  for (const line of lines) {
    const [key, value] = line.split(':')
    if (key && value) {
      vcard[key.trim().toLowerCase()] = value.trim()
    }
  }
  
  return vcard
}

/**
 * Format vCard data
 */
export function formatVCard(data: Record<string, string>): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  
  if (data.name) lines.push(`FN:${data.name}`)
  if (data.email) lines.push(`EMAIL:${data.email}`)
  if (data.phone) lines.push(`TEL:${data.phone}`)
  if (data.organization) lines.push(`ORG:${data.organization}`)
  if (data.title) lines.push(`TITLE:${data.title}`)
  if (data.url) lines.push(`URL:${data.url}`)
  
  lines.push('END:VCARD')
  
  return lines.join('\n')
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(width, height)
  return `${width / divisor}:${height / divisor}`
}

/**
 * Get optimal dimensions for aspect ratio
 */
export function getOptimalDimensions(
  targetWidth: number,
  targetHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const ratio = targetWidth / targetHeight
  
  let width = targetWidth
  let height = targetHeight
  
  if (width > maxWidth) {
    width = maxWidth
    height = width / ratio
  }
  
  if (height > maxHeight) {
    height = maxHeight
    width = height * ratio
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  }
}

/**
 * Check if browser supports feature
 */
export function checkBrowserSupport(): {
  clipboard: boolean
  webShare: boolean
  fileAPI: boolean
} {
  return {
    clipboard: !!navigator.clipboard,
    webShare: !!navigator.share,
    fileAPI: !!(window.File && window.FileReader && window.FileList && window.Blob)
  }
}

/**
 * Show toast notification (simple implementation)
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  // This is a simple implementation
  // In a real app, you'd use a toast library or custom component
  console.log(`[${type.toUpperCase()}] ${message}`)
}

