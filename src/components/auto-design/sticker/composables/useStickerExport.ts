/**
 * Sticker Export Composable
 * Handles exporting wedding stickers to PNG, PDF, and other formats
 */

import { ref } from 'vue'
import { useDynamicSVG } from './useDynamicSVG'

export interface ExportOptions {
  format: 'png' | 'pdf' | 'svg'
  quality?: number
  dpi?: number
  filename?: string
}

export function useStickerExport() {
  const { calculateDimensions, validateForExport, PRINT_DPI, SCREEN_DPI } = useDynamicSVG()
  
  const isExporting = ref(false)
  const exportProgress = ref(0)
  const exportError = ref<string | null>(null)
  
  /**
   * Export SVG element to PNG
   */
  async function exportToPng(
    svgElement: SVGSVGElement, 
    options: ExportOptions = { format: 'png' }
  ): Promise<string | null> {
    isExporting.value = true
    exportProgress.value = 0
    exportError.value = null
    
    try {
      // Get SVG dimensions
      const viewBox = svgElement.getAttribute('viewBox')
      let width = 1600
      let height = 1600
      
      if (viewBox) {
        const parts = viewBox.split(' ').map(Number)
        if (parts.length === 4) {
          width = parts[2]
          height = parts[3]
        }
      }
      
      // Calculate export dimensions
      const dpi = options.dpi || PRINT_DPI
      const scale = dpi / SCREEN_DPI
      const exportWidth = width * scale
      const exportHeight = height * scale
      
      exportProgress.value = 20
      
      // Clone SVG for export
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement
      svgClone.setAttribute('width', String(exportWidth))
      svgClone.setAttribute('height', String(exportHeight))
      
      // Inline all styles
      await inlineStyles(svgClone)
      
      exportProgress.value = 40
      
      // Convert to data URL
      const svgString = new XMLSerializer().serializeToString(svgClone)
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      
      exportProgress.value = 60
      
      // Render to canvas
      const canvas = document.createElement('canvas')
      canvas.width = exportWidth
      canvas.height = exportHeight
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }
      
      // Load and draw image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      const result = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, exportWidth, exportHeight)
          ctx.drawImage(img, 0, 0, exportWidth, exportHeight)
          
          exportProgress.value = 80
          
          const quality = options.quality || 0.92
          const dataUrl = canvas.toDataURL('image/png', quality)
          
          URL.revokeObjectURL(svgUrl)
          exportProgress.value = 100
          
          resolve(dataUrl)
        }
        
        img.onerror = () => {
          URL.revokeObjectURL(svgUrl)
          reject(new Error('Failed to load SVG for export'))
        }
        
        img.src = svgUrl
      })
      
      isExporting.value = false
      return result
      
    } catch (error) {
      exportError.value = error instanceof Error ? error.message : 'Export failed'
      isExporting.value = false
      return null
    }
  }
  
  /**
   * Download exported image - works on both web and mobile/native platforms
   */
  async function downloadImage(dataUrl: string, filename: string) {
    // Check if we're on a native Capacitor platform
    const isNativePlatform = typeof (window as any).Capacitor !== 'undefined' && 
      (window as any).Capacitor.isNativePlatform && 
      (window as any).Capacitor.isNativePlatform()
    
    console.log('📥 Sticker download initiated:', { filename, isNativePlatform })
    
    if (isNativePlatform) {
      // For native Capacitor apps, save to device storage using Filesystem
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem')
        const { Share } = await import('@capacitor/share')
        
        // Extract base64 data (remove data URL prefix)
        const base64Data = dataUrl.split(',')[1] || dataUrl
        
        // Generate unique filename with timestamp
        const timestamp = Date.now()
        const uniqueFilename = filename.replace(/(\.[^.]+)$/, `-${timestamp}$1`)
        
        // Save to Pictures folder so it appears in Gallery
        let savedFile
        try {
          // First try Pictures/SmartDesignPro (appears in Gallery)
          savedFile = await Filesystem.writeFile({
            path: `Pictures/SmartDesignPro/${uniqueFilename}`,
            data: base64Data,
            directory: Directory.ExternalStorage,
            recursive: true
          })
          console.log('✅ Sticker saved to Pictures (Gallery):', savedFile.uri)
        } catch (picturesError) {
          console.warn('Pictures folder failed, trying DCIM:', picturesError)
          try {
            // Fallback to DCIM/SmartDesignPro (also appears in Gallery)
            savedFile = await Filesystem.writeFile({
              path: `DCIM/SmartDesignPro/${uniqueFilename}`,
              data: base64Data,
              directory: Directory.ExternalStorage,
              recursive: true
            })
            console.log('✅ Sticker saved to DCIM (Gallery):', savedFile.uri)
          } catch (dcimError) {
            console.warn('DCIM failed, trying External:', dcimError)
            // Final fallback to External directory
            savedFile = await Filesystem.writeFile({
              path: `SmartDesignPro/${uniqueFilename}`,
              data: base64Data,
              directory: Directory.External,
              recursive: true
            })
            console.log('✅ Sticker saved to External storage:', savedFile.uri)
          }
        }
        
        // Trigger media scanner to make image appear in gallery immediately
        try {
          // @ts-ignore - Native bridge call
          if ((window as any).Capacitor?.Plugins?.MediaScanner) {
            await (window as any).Capacitor.Plugins.MediaScanner.scanFile({ path: savedFile.uri })
          }
        } catch (scanError) {
          console.log('Media scan not available, image will appear in gallery after refresh')
        }
        
        // Show success alert with option to share
        const confirmShare = confirm(`✅ Sticker saved to Gallery!\n\nFile: ${uniqueFilename}\n\nCheck your Photos/Gallery app.\n\nWould you like to share it?`)
        
        if (confirmShare) {
          await Share.share({
            title: filename,
            text: 'My wedding sticker design from SmartDesignPro',
            url: savedFile.uri,
            dialogTitle: 'Share Your Sticker'
          })
          console.log('✅ Sticker shared successfully')
        }
        
        return
      } catch (error) {
        console.error('Native save failed:', error)
        alert('❌ Failed to save sticker. Please check app storage permissions and try again.')
        return
      }
    }
    
    // For web/desktop, use standard download
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  /**
   * Export and download in one step
   */
  async function exportAndDownload(
    svgElement: SVGSVGElement,
    filename: string = 'wedding-sticker.png',
    options: ExportOptions = { format: 'png' }
  ): Promise<boolean> {
    const dataUrl = await exportToPng(svgElement, options)
    
    if (dataUrl) {
      await downloadImage(dataUrl, filename)
      return true
    }
    
    return false
  }
  
  /**
   * Inline CSS styles into SVG elements
   */
  async function inlineStyles(svgElement: SVGSVGElement): Promise<void> {
    const elements = svgElement.querySelectorAll('*')
    
    elements.forEach(el => {
      if (el instanceof SVGElement || el instanceof HTMLElement) {
        const computed = window.getComputedStyle(el)
        const importantStyles = [
          'fill', 'stroke', 'stroke-width', 'font-family', 'font-size',
          'font-weight', 'text-anchor', 'dominant-baseline', 'opacity'
        ]
        
        importantStyles.forEach(prop => {
          const value = computed.getPropertyValue(prop)
          if (value && value !== 'none' && value !== 'initial') {
            (el as SVGElement).style.setProperty(prop, value)
          }
        })
      }
    })
  }
  
  /**
   * Convert images in SVG to data URLs for export
   */
  async function embedImages(svgElement: SVGSVGElement): Promise<void> {
    const images = svgElement.querySelectorAll('image')
    
    await Promise.all(Array.from(images).map(async img => {
      const href = img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
      
      if (href && !href.startsWith('data:')) {
        try {
          const response = await fetch(href)
          const blob = await response.blob()
          const dataUrl = await blobToDataUrl(blob)
          
          img.setAttribute('href', dataUrl)
          img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl)
        } catch (error) {
          console.warn('Failed to embed image:', href)
        }
      }
    }))
  }
  
  /**
   * Convert blob to data URL
   */
  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
  
  /**
   * Generate filename with timestamp
   */
  function generateFilename(baseName: string = 'wedding-sticker', ext: string = 'png'): string {
    const timestamp = new Date().toISOString().slice(0, 10)
    return `${baseName}-${timestamp}.${ext}`
  }

  return {
    // State
    isExporting,
    exportProgress,
    exportError,
    
    // Methods
    exportToPng,
    downloadImage,
    exportAndDownload,
    inlineStyles,
    embedImages,
    generateFilename,
    
    // Constants
    PRINT_DPI,
    SCREEN_DPI
  }
}
