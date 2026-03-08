/**
 * Export API Service
 * Handles all export-related API calls
 */

import type {
  ExportOptions,
  ExportResult,
  ExportProgress,
  ShareOptions,
  ShareLink,
  EmailShareOptions,
  SocialShareOptions
} from '@/types/export'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Export project to specified format
 */
export async function exportProject(options: ExportOptions): Promise<ExportResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Export failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Export error:', error)
    throw error
  }
}

/**
 * Get export status
 */
export async function getExportStatus(exportId: string): Promise<ExportProgress> {
  try {
    const response = await fetch(`${API_BASE_URL}/export/${exportId}/status`)

    if (!response.ok) {
      throw new Error('Failed to get export status')
    }

    return await response.json()
  } catch (error) {
    console.error('Get export status error:', error)
    throw error
  }
}

/**
 * Download exported file
 */
export async function downloadExport(exportId: string, fileName?: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/export/${exportId}/download`)

    if (!response.ok) {
      throw new Error('Failed to download export')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || `export-${exportId}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Download export error:', error)
    throw error
  }
}

/**
 * Get export blob (for sharing)
 */
export async function getExportBlob(exportId: string): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/export/${exportId}/download`)

    if (!response.ok) {
      throw new Error('Failed to get export blob')
    }

    return await response.blob()
  } catch (error) {
    console.error('Get export blob error:', error)
    throw error
  }
}

/**
 * Create shareable link
 */
export async function createShareLink(options: ShareOptions): Promise<ShareLink> {
  try {
    const response = await fetch(`${API_BASE_URL}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create share link')
    }

    return await response.json()
  } catch (error) {
    console.error('Create share link error:', error)
    throw error
  }
}

/**
 * Get share link details
 */
export async function getShareLink(shareId: string, password?: string): Promise<ShareLink> {
  try {
    const url = new URL(`${API_BASE_URL}/share/${shareId}`)
    if (password) {
      url.searchParams.append('password', password)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get share link')
    }

    return await response.json()
  } catch (error) {
    console.error('Get share link error:', error)
    throw error
  }
}

/**
 * Revoke share link
 */
export async function revokeShareLink(shareId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/share/${shareId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to revoke share link')
    }
  } catch (error) {
    console.error('Revoke share link error:', error)
    throw error
  }
}

/**
 * Get all share links for a project
 */
export async function getProjectShareLinks(projectId: string): Promise<ShareLink[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/share/project/${projectId}`)

    if (!response.ok) {
      throw new Error('Failed to get project share links')
    }

    return await response.json()
  } catch (error) {
    console.error('Get project share links error:', error)
    throw error
  }
}

/**
 * Send email with shared design
 */
export async function sendEmailShare(options: EmailShareOptions): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/share/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email')
    }
  } catch (error) {
    console.error('Send email share error:', error)
    throw error
  }
}

/**
 * Share to social media platform
 */
export async function shareToSocial(options: SocialShareOptions): Promise<void> {
  const { platform } = options

  // Use Web Share API if available and supported
  if (navigator.share && (platform === 'whatsapp' || platform === 'instagram')) {
    try {
      await navigator.share({
        title: 'Check out my design!',
        text: options.caption || '',
        url: options.url || '',
      })
      return
    } catch (error) {
      console.log('Web Share API not available, falling back to platform URL')
    }
  }

  // Fallback to platform-specific share URLs
  const { SOCIAL_PLATFORMS } = await import('@/types/export')
  const platformConfig = SOCIAL_PLATFORMS[platform]

  if (!platformConfig) {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  const shareUrl = platformConfig.shareUrl(options)

  if (!shareUrl) {
    throw new Error(`Platform ${platform} requires native app`)
  }

  // Open share URL in new window
  const width = 600
  const height = 400
  const left = (window.innerWidth - width) / 2
  const top = (window.innerHeight - height) / 2

  window.open(
    shareUrl,
    'share',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no`
  )
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  } catch (error) {
    console.error('Copy to clipboard error:', error)
    throw error
  }
}

/**
 * Track share analytics
 */
export async function trackShare(shareId: string, action: 'view' | 'download'): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/share/${shareId}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    })
  } catch (error) {
    // Don't throw error for analytics tracking
    console.error('Track share error:', error)
  }
}

