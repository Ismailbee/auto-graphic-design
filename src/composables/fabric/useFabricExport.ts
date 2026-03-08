/**
 * Fabric.js v6 Export Composable
 * Export canvas to various formats
 */

import { ref, computed } from 'vue'
import type { Canvas } from 'fabric'
import type { UseFabricCanvasReturn } from './useFabricCanvas'

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'svg' | 'json'
  quality: number
  multiplier: number
  backgroundColor?: string
  includeBackground: boolean
}

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'png',
  quality: 1,
  multiplier: 1,
  backgroundColor: '#ffffff',
  includeBackground: true
}

export function useFabricExport(canvasComposable: UseFabricCanvasReturn) {
  const { canvas } = canvasComposable

  const isExporting = ref(false)
  const exportProgress = ref(0)

  const toDataURL = (options: Partial<ExportOptions> = {}): string => {
    if (!canvas.value) return ''
    
    const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options }
    
    return canvas.value.toDataURL({
      format: opts.format === 'jpeg' ? 'jpeg' : 'png',
      quality: opts.quality,
      multiplier: opts.multiplier
    })
  }

  const toBlob = async (options: Partial<ExportOptions> = {}): Promise<Blob | null> => {
    const dataURL = toDataURL(options)
    if (!dataURL) return null
    
    try {
      const response = await fetch(dataURL)
      return response.blob()
    } catch (e) {
      console.error('Failed to create blob:', e)
      return null
    }
  }

  const toSVG = (): string => {
    if (!canvas.value) return ''
    return canvas.value.toSVG()
  }

  const toJSON = (properties?: string[]): object => {
    if (!canvas.value) return {}
    const defaultProps = ['id', 'name', 'selectable', 'evented', 'locked']
    // In Fabric v6, use toObject instead of toJSON with properties
    return canvas.value.toObject([...defaultProps, ...(properties || [])])
  }

  const downloadImage = async (
    filename = 'design',
    options: Partial<ExportOptions> = {}
  ): Promise<boolean> => {
    isExporting.value = true
    exportProgress.value = 0
    
    try {
      const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options }
      const extension = opts.format === 'jpeg' ? 'jpg' : opts.format
      const dataURL = opts.format === 'svg' ? `data:image/svg+xml,${encodeURIComponent(toSVG())}` : toDataURL(opts)
      
      if (!dataURL) return false
      
      exportProgress.value = 50
      
      const link = document.createElement('a')
      link.href = dataURL
      link.download = `${filename}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      exportProgress.value = 100
      return true
    } catch (e) {
      console.error('Download failed:', e)
      return false
    } finally {
      isExporting.value = false
    }
  }

  const downloadJSON = (filename = 'design'): boolean => {
    try {
      const json = JSON.stringify(toJSON(), null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      return true
    } catch (e) {
      console.error('JSON download failed:', e)
      return false
    }
  }

  const copyToClipboard = async (options: Partial<ExportOptions> = {}): Promise<boolean> => {
    try {
      const blob = await toBlob(options)
      if (!blob) return false
      
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      return true
    } catch (e) {
      console.error('Copy to clipboard failed:', e)
      return false
    }
  }

  const loadFromJSON = async (json: string | object): Promise<boolean> => {
    if (!canvas.value) return false
    
    isExporting.value = true
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json
      await canvas.value.loadFromJSON(data)
      canvas.value.requestRenderAll()
      return true
    } catch (e) {
      console.error('Failed to load JSON:', e)
      return false
    } finally {
      isExporting.value = false
    }
  }

  const getCanvasSize = (): { width: number; height: number } => {
    return {
      width: canvas.value?.width || 0,
      height: canvas.value?.height || 0
    }
  }

  const exportPresets = {
    instagram: { width: 1080, height: 1080, multiplier: 1 },
    instagramStory: { width: 1080, height: 1920, multiplier: 1 },
    facebook: { width: 1200, height: 630, multiplier: 1 },
    twitter: { width: 1200, height: 675, multiplier: 1 },
    youtube: { width: 1280, height: 720, multiplier: 1 },
    a4Portrait: { width: 2480, height: 3508, multiplier: 1 },
    a4Landscape: { width: 3508, height: 2480, multiplier: 1 },
    hd: { width: 1920, height: 1080, multiplier: 1 },
    '4k': { width: 3840, height: 2160, multiplier: 1 }
  }

  const exportWithPreset = async (
    preset: keyof typeof exportPresets,
    filename = 'design',
    options: Partial<ExportOptions> = {}
  ): Promise<boolean> => {
    // Note: For proper export with size, you'd need to resize canvas temporarily
    // This is a simplified version
    const presetOpts = exportPresets[preset]
    return downloadImage(filename, { ...options, multiplier: presetOpts.multiplier })
  }

  return {
    isExporting,
    exportProgress,
    toDataURL,
    toBlob,
    toSVG,
    toJSON,
    downloadImage,
    downloadJSON,
    copyToClipboard,
    loadFromJSON,
    getCanvasSize,
    exportPresets,
    exportWithPreset
  }
}

export type UseFabricExportReturn = ReturnType<typeof useFabricExport>
