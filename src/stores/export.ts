/**
 * Export Store
 * Manages export and sharing state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ExportOptions,
  ExportResult,
  ExportProgress,
  ExportFormat,
  ResolutionPreset,
  BackgroundType,
  ShareLink,
  ShareOptions,
  SharePermission,
} from '@/types/export'
import {
  exportProject,
  getExportStatus,
  downloadExport,
  createShareLink,
  getProjectShareLinks,
  revokeShareLink,
} from '@/services/api/export-api'

export const useExportStore = defineStore('export', () => {
  // State
  const isExporting = ref(false)
  const currentExport = ref<ExportResult | null>(null)
  const exportProgress = ref<ExportProgress | null>(null)
  const exportHistory = ref<ExportResult[]>([])
  const shareLinks = ref<ShareLink[]>([])
  const error = ref<string | null>(null)

  // Export options state
  const selectedFormat = ref<ExportFormat>('png')
  const selectedResolution = ref<ResolutionPreset>('medium')
  const customWidth = ref<number>(1920)
  const customHeight = ref<number>(1080)
  const selectedDpi = ref<number>(150)
  const selectedBackground = ref<BackgroundType>('canvas')
  const backgroundColor = ref<string>('#ffffff')
  const quality = ref<number>(0.9)
  const transparent = ref<boolean>(false)
  const includeBleed = ref<boolean>(false)
  const embedFonts = ref<boolean>(true)

  // Share options state
  const sharePermission = ref<SharePermission>('view')
  const shareExpiration = ref<Date | null>(null)
  const sharePassword = ref<string>('')

  // Computed
  const hasActiveExport = computed(() => {
    return isExporting.value || (exportProgress.value?.status === 'processing')
  })

  const canExport = computed(() => {
    return !hasActiveExport.value
  })

  const activeShareLinks = computed(() => {
    return shareLinks.value.filter(link => link.isActive)
  })

  // Actions
  async function startExport(projectId: string, stageName?: string): Promise<ExportResult | null> {
    try {
      isExporting.value = true
      error.value = null

      const options: ExportOptions = {
        projectId,
        format: selectedFormat.value,
        resolution: selectedResolution.value,
        customWidth: selectedResolution.value === 'custom' ? customWidth.value : undefined,
        customHeight: selectedResolution.value === 'custom' ? customHeight.value : undefined,
        dpi: selectedDpi.value,
        background: selectedBackground.value,
        backgroundColor: backgroundColor.value,
        quality: quality.value,
        transparent: transparent.value,
        includeBleed: includeBleed.value,
        embedFonts: embedFonts.value,
      }

      const result = await exportProject(options)
      currentExport.value = result
      exportHistory.value.unshift(result)

      // Poll for status if processing
      if (result.status === 'processing') {
        pollExportStatus(result.exportId)
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Export failed'
      console.error('Export error:', err)
      return null
    } finally {
      isExporting.value = false
    }
  }

  async function pollExportStatus(exportId: string): Promise<void> {
    const maxAttempts = 60 // 5 minutes max (5s intervals)
    let attempts = 0

    const poll = async () => {
      try {
        const progress = await getExportStatus(exportId)
        exportProgress.value = progress

        if (progress.status === 'complete') {
          // Update current export
          if (currentExport.value?.exportId === exportId) {
            currentExport.value.status = 'complete'
            currentExport.value.downloadUrl = progress.message // Assuming message contains URL
          }
          return
        }

        if (progress.status === 'error') {
          error.value = progress.message
          return
        }

        // Continue polling
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          error.value = 'Export timeout'
        }
      } catch (err) {
        console.error('Poll error:', err)
        error.value = 'Failed to check export status'
      }
    }

    poll()
  }

  async function downloadCurrentExport(): Promise<void> {
    if (!currentExport.value) {
      throw new Error('No export to download')
    }

    try {
      await downloadExport(currentExport.value.exportId, currentExport.value.fileName)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Download failed'
      throw err
    }
  }

  async function generateShareLink(projectId: string): Promise<ShareLink | null> {
    try {
      const options: ShareOptions = {
        projectId,
        permission: sharePermission.value,
        expiresAt: shareExpiration.value || undefined,
        password: sharePassword.value || undefined,
        allowDownload: sharePermission.value !== 'view',
      }

      const link = await createShareLink(options)
      shareLinks.value.unshift(link)
      return link
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create share link'
      console.error('Share link error:', err)
      return null
    }
  }

  async function loadShareLinks(projectId: string): Promise<void> {
    try {
      const links = await getProjectShareLinks(projectId)
      shareLinks.value = links
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load share links'
      console.error('Load share links error:', err)
    }
  }

  async function deleteShareLink(shareId: string): Promise<void> {
    try {
      await revokeShareLink(shareId)
      shareLinks.value = shareLinks.value.filter(link => link.shareId !== shareId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete share link'
      throw err
    }
  }

  function setFormat(format: ExportFormat): void {
    selectedFormat.value = format

    // Auto-adjust settings based on format
    if (format === 'jpeg') {
      transparent.value = false
    }

    if (format === 'svg') {
      selectedResolution.value = 'custom'
    }
  }

  function setResolution(resolution: ResolutionPreset): void {
    selectedResolution.value = resolution

    // Update DPI based on preset
    const { RESOLUTION_PRESETS } = require('@/types/export')
    const preset = RESOLUTION_PRESETS[resolution]
    if (preset) {
      selectedDpi.value = preset.dpi
      if (resolution !== 'custom') {
        customWidth.value = preset.width
        customHeight.value = preset.height
      }
    }
  }

  function setCustomDimensions(width: number, height: number): void {
    customWidth.value = width
    customHeight.value = height
    selectedResolution.value = 'custom'
  }

  function setBackground(type: BackgroundType, color?: string): void {
    selectedBackground.value = type
    if (color) {
      backgroundColor.value = color
    }
  }

  function setQuality(value: number): void {
    quality.value = Math.max(0.1, Math.min(1.0, value))
  }

  function setTransparent(value: boolean): void {
    transparent.value = value
    if (value) {
      selectedFormat.value = 'png'
    }
  }

  function setSharePermission(permission: SharePermission): void {
    sharePermission.value = permission
  }

  function setShareExpiration(date: Date | null): void {
    shareExpiration.value = date
  }

  function setSharePassword(password: string): void {
    sharePassword.value = password
  }

  function resetExportOptions(): void {
    selectedFormat.value = 'png'
    selectedResolution.value = 'medium'
    customWidth.value = 1920
    customHeight.value = 1080
    selectedDpi.value = 150
    selectedBackground.value = 'canvas'
    backgroundColor.value = '#ffffff'
    quality.value = 0.9
    transparent.value = false
    includeBleed.value = false
    embedFonts.value = true
  }

  function resetShareOptions(): void {
    sharePermission.value = 'view'
    shareExpiration.value = null
    sharePassword.value = ''
  }

  function clearError(): void {
    error.value = null
  }

  function clearCurrentExport(): void {
    currentExport.value = null
    exportProgress.value = null
  }

  return {
    // State
    isExporting,
    currentExport,
    exportProgress,
    exportHistory,
    shareLinks,
    error,
    selectedFormat,
    selectedResolution,
    customWidth,
    customHeight,
    selectedDpi,
    selectedBackground,
    backgroundColor,
    quality,
    transparent,
    includeBleed,
    embedFonts,
    sharePermission,
    shareExpiration,
    sharePassword,

    // Computed
    hasActiveExport,
    canExport,
    activeShareLinks,

    // Actions
    startExport,
    pollExportStatus,
    downloadCurrentExport,
    generateShareLink,
    loadShareLinks,
    deleteShareLink,
    setFormat,
    setResolution,
    setCustomDimensions,
    setBackground,
    setQuality,
    setTransparent,
    setSharePermission,
    setShareExpiration,
    setSharePassword,
    resetExportOptions,
    resetShareOptions,
    clearError,
    clearCurrentExport,
  }
})

