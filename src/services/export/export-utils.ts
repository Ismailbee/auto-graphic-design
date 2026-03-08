/**
 * Export Utility Functions
 * Client-side export helpers for canvas/image export
 */

import type { ExportOptions, ExportFormat } from '@/types/export'
import { RESOLUTION_PRESETS } from '@/types/export'

/**
 * Get export dimensions based on options
 */
export function getExportDimensions(
  baseWidth: number,
  baseHeight: number,
  options: ExportOptions
): { width: number; height: number } {
  if (options.customWidth && options.customHeight) {
    return { width: options.customWidth, height: options.customHeight }
  }

  if (options.preset && RESOLUTION_PRESETS[options.preset]) {
    const preset = RESOLUTION_PRESETS[options.preset]
    return { width: preset.width, height: preset.height }
  }

  return { width: baseWidth, height: baseHeight }
}

/**
 * Get pixel ratio for export
 */
export function getPixelRatio(options: ExportOptions): number {
  if (options.pixelRatio) {
    return options.pixelRatio
  }

  if (options.preset && RESOLUTION_PRESETS[options.preset]) {
    return RESOLUTION_PRESETS[options.preset].pixelRatio
  }

  return 1
}

/**
 * Get mime type for format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'png':
      return 'image/png'
    case 'jpeg':
      return 'image/jpeg'
    case 'svg':
      return 'image/svg+xml'
    case 'pdf':
      return 'application/pdf'
    default:
      return 'image/png'
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
  URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Download data URL as file
 */
export function downloadDataURL(dataURL: string, fileName: string): void {
  const a = document.createElement('a')
  a.href = dataURL
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * Get file name for export
 */
export function getExportFileName(
  projectName: string,
  format: ExportFormat,
  timestamp: boolean = true
): string {
  const sanitized = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const time = timestamp ? `_${Date.now()}` : ''
  const extension = format === 'jpeg' ? 'jpg' : format

  return `${sanitized}${time}.${extension}`
}

/**
 * Estimate file size
 */
export function estimateFileSize(
  width: number,
  height: number,
  format: ExportFormat,
  quality: number = 0.9
): number {
  const pixels = width * height

  switch (format) {
    case 'png':
      // PNG: ~4 bytes per pixel (RGBA)
      return pixels * 4
    case 'jpeg':
      // JPEG: varies by quality, rough estimate
      return pixels * quality * 0.5
    case 'svg':
      // SVG: depends on complexity, rough estimate
      return pixels * 0.1
    case 'pdf':
      // PDF: similar to JPEG
      return pixels * quality * 0.6
    default:
      return pixels * 2
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

/**
 * Convert canvas to blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ExportFormat = 'png',
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = getMimeType(format)
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      },
      mimeType,
      quality
    )
  })
}

/**
 * Convert canvas to data URL
 */
export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  format: ExportFormat = 'png',
  quality: number = 0.9
): string {
  const mimeType = getMimeType(format)
  return canvas.toDataURL(mimeType, quality)
}

/**
 * Export Fabric.js canvas to blob
 */
export async function exportFabricToBlob(
  canvas: any, // fabric.Canvas
  format: ExportFormat = 'png',
  quality: number = 0.9,
  multiplier: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const dataURL = canvas.toDataURL({
      format: format === 'jpeg' ? 'jpeg' : 'png',
      quality,
      multiplier
    })
    
    // Convert data URL to blob
    fetch(dataURL)
      .then(res => res.blob())
      .then(resolve)
      .catch(reject)
  })
}

/**
 * Export Fabric.js canvas to data URL
 */
export function exportFabricToDataURL(
  canvas: any, // fabric.Canvas
  format: ExportFormat = 'png',
  quality: number = 0.9,
  multiplier: number = 1
): string {
  return canvas.toDataURL({
    format: format === 'jpeg' ? 'jpeg' : 'png',
    quality,
    multiplier
  })
}

