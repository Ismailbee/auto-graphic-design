/**
 * Export & Sharing Type Definitions
 */

// Export formats
export type ExportFormat = 'jpeg' | 'png' | 'pdf' | 'svg' | 'mp4' | 'gif'

// Resolution presets
export type ResolutionPreset = 'low' | 'medium' | 'high' | 'custom'

// Background types
export type BackgroundType = 'transparent' | 'solid' | 'canvas'

// Share permissions
export type SharePermission = 'view' | 'download' | 'edit'

// Export status
export type ExportStatus = 'idle' | 'preparing' | 'processing' | 'complete' | 'error'

// Social media platforms
export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'whatsapp' | 'pinterest'

/**
 * Export Options Interface
 */
export interface ExportOptions {
  projectId: string
  format: ExportFormat
  resolution: ResolutionPreset
  customWidth?: number
  customHeight?: number
  dpi?: number
  background: BackgroundType
  backgroundColor?: string
  quality?: number // 0.1 - 1.0 for JPEG
  transparent?: boolean // PNG only
  pages?: number[] // For multi-page export
  includeBleed?: boolean // PDF only
  embedFonts?: boolean // PDF/SVG
  compression?: number // 0-100
}

/**
 * Export Result Interface
 */
export interface ExportResult {
  exportId: string
  status: ExportStatus
  downloadUrl?: string
  fileSize?: number
  fileName?: string
  format: ExportFormat
  createdAt: Date
  expiresAt?: Date
  error?: string
}

/**
 * Export Progress Interface
 */
export interface ExportProgress {
  exportId: string
  status: ExportStatus
  progress: number // 0-100
  message: string
  estimatedTimeRemaining?: number // seconds
}

/**
 * Share Options Interface
 */
export interface ShareOptions {
  projectId: string
  permission: SharePermission
  expiresAt?: Date
  password?: string
  allowDownload?: boolean
  message?: string
}

/**
 * Share Link Interface
 */
export interface ShareLink {
  shareId: string
  shareUrl: string
  projectId: string
  permission: SharePermission
  createdAt: Date
  expiresAt?: Date
  hasPassword: boolean
  views: number
  downloads: number
  isActive: boolean
}

/**
 * Email Share Options
 */
export interface EmailShareOptions {
  recipients: string[]
  subject?: string
  message?: string
  attachmentUrl?: string
  projectName?: string
}

/**
 * Social Share Options
 */
export interface SocialShareOptions {
  platform: SocialPlatform
  imageUrl: string
  caption?: string
  hashtags?: string[]
  url?: string
}

/**
 * Resolution Preset Configuration
 */
export interface ResolutionConfig {
  preset: ResolutionPreset
  width: number
  height: number
  dpi: number
  label: string
  description: string
}

/**
 * Export Format Configuration
 */
export interface ExportFormatConfig {
  format: ExportFormat
  label: string
  icon: string
  mimeType: string
  extension: string
  supportsTransparency: boolean
  supportsQuality: boolean
  supportsMultiPage: boolean
  description: string
}

/**
 * Predefined Resolution Presets
 */
export const RESOLUTION_PRESETS: Record<ResolutionPreset, ResolutionConfig> = {
  low: {
    preset: 'low',
    width: 1280,
    height: 720,
    dpi: 72,
    label: 'Low (Web)',
    description: 'Optimized for web and social media'
  },
  medium: {
    preset: 'medium',
    width: 1920,
    height: 1080,
    dpi: 150,
    label: 'Medium (General)',
    description: 'Good balance of quality and file size'
  },
  high: {
    preset: 'high',
    width: 3840,
    height: 2160,
    dpi: 300,
    label: 'High (Print)',
    description: 'Professional print quality'
  },
  custom: {
    preset: 'custom',
    width: 0,
    height: 0,
    dpi: 0,
    label: 'Custom',
    description: 'Define your own dimensions'
  }
}

/**
 * Export Format Configurations
 */
export const EXPORT_FORMATS: Record<ExportFormat, ExportFormatConfig> = {
  jpeg: {
    format: 'jpeg',
    label: 'JPEG',
    icon: 'mdi:file-jpg-box',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    supportsTransparency: false,
    supportsQuality: true,
    supportsMultiPage: false,
    description: 'Compressed image format, best for photos'
  },
  png: {
    format: 'png',
    label: 'PNG',
    icon: 'mdi:file-png-box',
    mimeType: 'image/png',
    extension: 'png',
    supportsTransparency: true,
    supportsQuality: false,
    supportsMultiPage: false,
    description: 'Lossless format with transparency support'
  },
  pdf: {
    format: 'pdf',
    label: 'PDF',
    icon: 'mdi:file-pdf-box',
    mimeType: 'application/pdf',
    extension: 'pdf',
    supportsTransparency: false,
    supportsQuality: true,
    supportsMultiPage: true,
    description: 'Print-ready document format'
  },
  svg: {
    format: 'svg',
    label: 'SVG',
    icon: 'mdi:svg',
    mimeType: 'image/svg+xml',
    extension: 'svg',
    supportsTransparency: true,
    supportsQuality: false,
    supportsMultiPage: false,
    description: 'Scalable vector graphics'
  },
  mp4: {
    format: 'mp4',
    label: 'MP4 Video',
    icon: 'mdi:file-video',
    mimeType: 'video/mp4',
    extension: 'mp4',
    supportsTransparency: false,
    supportsQuality: true,
    supportsMultiPage: false,
    description: 'Video format for animations'
  },
  gif: {
    format: 'gif',
    label: 'GIF',
    icon: 'mdi:file-gif-box',
    mimeType: 'image/gif',
    extension: 'gif',
    supportsTransparency: true,
    supportsQuality: false,
    supportsMultiPage: false,
    description: 'Animated image format'
  }
}

/**
 * Social Platform Configurations
 */
export interface SocialPlatformConfig {
  platform: SocialPlatform
  label: string
  icon: string
  color: string
  shareUrl: (options: SocialShareOptions) => string
  supportsNativeShare: boolean
}

export const SOCIAL_PLATFORMS: Record<SocialPlatform, SocialPlatformConfig> = {
  facebook: {
    platform: 'facebook',
    label: 'Facebook',
    icon: 'mdi:facebook',
    color: '#1877F2',
    shareUrl: (options) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(options.url || '')}`,
    supportsNativeShare: false
  },
  twitter: {
    platform: 'twitter',
    label: 'Twitter',
    icon: 'mdi:twitter',
    color: '#1DA1F2',
    shareUrl: (options) => {
      const text = options.caption || ''
      const hashtags = options.hashtags?.join(',') || ''
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${hashtags}&url=${encodeURIComponent(options.url || '')}`
    },
    supportsNativeShare: false
  },
  instagram: {
    platform: 'instagram',
    label: 'Instagram',
    icon: 'mdi:instagram',
    color: '#E4405F',
    shareUrl: () => '', // Instagram doesn't support web sharing
    supportsNativeShare: true
  },
  linkedin: {
    platform: 'linkedin',
    label: 'LinkedIn',
    icon: 'mdi:linkedin',
    color: '#0A66C2',
    shareUrl: (options) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(options.url || '')}`,
    supportsNativeShare: false
  },
  whatsapp: {
    platform: 'whatsapp',
    label: 'WhatsApp',
    icon: 'mdi:whatsapp',
    color: '#25D366',
    shareUrl: (options) => `https://wa.me/?text=${encodeURIComponent((options.caption || '') + ' ' + (options.url || ''))}`,
    supportsNativeShare: true
  },
  pinterest: {
    platform: 'pinterest',
    label: 'Pinterest',
    icon: 'mdi:pinterest',
    color: '#E60023',
    shareUrl: (options) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(options.url || '')}&media=${encodeURIComponent(options.imageUrl)}&description=${encodeURIComponent(options.caption || '')}`,
    supportsNativeShare: false
  }
}

/**
 * Helper function to get format config
 */
export function getFormatConfig(format: ExportFormat): ExportFormatConfig {
  return EXPORT_FORMATS[format]
}

/**
 * Helper function to get resolution config
 */
export function getResolutionConfig(preset: ResolutionPreset): ResolutionConfig {
  return RESOLUTION_PRESETS[preset]
}

/**
 * Helper function to validate export options
 */
export function validateExportOptions(options: ExportOptions): string[] {
  const errors: string[] = []
  
  if (!options.projectId) {
    errors.push('Project ID is required')
  }
  
  if (options.resolution === 'custom') {
    if (!options.customWidth || options.customWidth <= 0) {
      errors.push('Custom width must be greater than 0')
    }
    if (!options.customHeight || options.customHeight <= 0) {
      errors.push('Custom height must be greater than 0')
    }
    if (options.customWidth && options.customWidth > 8000) {
      errors.push('Width cannot exceed 8000px')
    }
    if (options.customHeight && options.customHeight > 8000) {
      errors.push('Height cannot exceed 8000px')
    }
  }
  
  if (options.quality && (options.quality < 0.1 || options.quality > 1.0)) {
    errors.push('Quality must be between 0.1 and 1.0')
  }
  
  return errors
}

