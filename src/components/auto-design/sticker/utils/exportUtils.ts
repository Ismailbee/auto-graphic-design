/**
 * Export Utilities
 * 
 * Handles wedding sticker export functionality (SVG/PNG).
 * Extracted from StickerTemplatePanel.vue for file size reduction.
 */

import type { Ref } from 'vue'

// ============================================================================
// Types
// ============================================================================

export interface SVGImage {
  id: string
  dataUrl: string
  file: File
  x: number
  y: number
  width: number
  height: number
  scale: number
  flipX: boolean
  flipY: boolean
}

export interface ExportContext {
  weddingPreviewContainer: Ref<HTMLDivElement | null>
  svgImageManager: {
    images: Ref<SVGImage[]>
  }
  exportSVG: (
    svgElement: SVGSVGElement,
    images: SVGImage[],
    options: { filename: string; format: 'svg' | 'png'; pngResolution: number }
  ) => Promise<void>
  validateForExport: (svgElement: SVGSVGElement) => { valid: boolean; warnings: string[] }
  PRINT_DPI: number
  showNotification: (opts: { title: string; message: string; type: string }) => void
}

// ============================================================================
// Export Wedding Sticker
// ============================================================================

/**
 * Export the wedding sticker as SVG or PNG
 */
export async function exportWeddingStickerUtil(
  format: 'svg' | 'png',
  ctx: ExportContext
): Promise<void> {
  const {
    weddingPreviewContainer,
    svgImageManager,
    exportSVG,
    validateForExport,
    PRINT_DPI,
    showNotification
  } = ctx

  if (!weddingPreviewContainer.value) {
    showNotification({
      title: 'Export Error',
      message: 'No sticker to export',
      type: 'error'
    })
    return
  }

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) {
    showNotification({
      title: 'Export Error',
      message: 'SVG element not found',
      type: 'error'
    })
    return
  }

  try {
    const filename = `wedding-sticker-${new Date().toISOString().split('T')[0]}`

    // Validate SVG is properly configured for export
    validateForExport(svgElement)

    // Get stored export dimensions (set by handleSizeChange)
    const exportWidthPx = svgElement.getAttribute('data-export-width-px')
    const exportHeightPx = svgElement.getAttribute('data-export-height-px')
    const exportWidth = svgElement.getAttribute('data-export-width')
    const exportHeight = svgElement.getAttribute('data-export-height')
    const originalStyleWidth = svgElement.style.width
    const originalStyleHeight = svgElement.style.height

    // Apply pixel dimensions for canvas export (critical for PNG)
    if (exportWidthPx && exportHeightPx) {
      svgElement.setAttribute('width', exportWidthPx)
      svgElement.setAttribute('height', exportHeightPx)
      // Remove CSS constraints that might interfere with the export canvas sizing
      svgElement.style.width = ''
      svgElement.style.height = ''
    } else if (exportWidth && exportHeight) {
      // Fallback to inch dimensions
      svgElement.setAttribute('width', exportWidth)
      svgElement.setAttribute('height', exportHeight)
      svgElement.style.width = ''
      svgElement.style.height = ''
    } else {
      // No custom size set - calculate from viewBox to preserve aspect ratio
      const viewBox = svgElement.getAttribute('viewBox')?.split(/\s+|,/).map(Number)
      if (viewBox && viewBox.length >= 4) {
        const vbWidth = viewBox[2]
        const vbHeight = viewBox[3]
        // Calculate high-res export dimensions at 300 DPI equivalent
        const scale = PRINT_DPI / 96
        const calculatedWidth = Math.round(vbWidth * scale)
        const calculatedHeight = Math.round(vbHeight * scale)
        svgElement.setAttribute('width', String(calculatedWidth))
        svgElement.setAttribute('height', String(calculatedHeight))
        svgElement.style.width = ''
        svgElement.style.height = ''
      }
    }

    // Ensure preserveAspectRatio is set for distortion-free export
    if (!svgElement.getAttribute('preserveAspectRatio')) {
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    }

    await exportSVG(svgElement, svgImageManager.images.value, {
      filename: format === 'svg' ? `${filename}.svg` : `${filename}.png`,
      format,
      pngResolution: PRINT_DPI
    })

    // Restore responsive display settings
    if (exportWidthPx || exportWidth) {
      svgElement.setAttribute('width', '100%')
      svgElement.removeAttribute('height')
      svgElement.style.width = originalStyleWidth || '100%'
      svgElement.style.height = originalStyleHeight || 'auto'
    }

    showNotification({
      title: 'Download Successful',
      message: `Sticker downloaded as ${format.toUpperCase()}`,
      type: 'success'
    })
  } catch (error) {
    showNotification({
      title: 'Export Failed',
      message: error instanceof Error ? error.message : 'Failed to export sticker',
      type: 'error'
    })
  }
}
