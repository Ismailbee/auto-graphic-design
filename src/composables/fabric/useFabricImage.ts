/**
 * Fabric.js v6 Image Composable
 * Image loading, manipulation, and filtering
 */

import { ref, computed, watch } from 'vue'
import { FabricImage, filters, type TOptions } from 'fabric'
import type { UseFabricCanvasReturn } from './useFabricCanvas'
import type { UseFabricSelectionReturn } from './useFabricSelection'

// Available filters in Fabric v6
const {
  Brightness, Contrast, Saturation, Grayscale, Invert,
  Sepia, Blur, Noise, Pixelate, Convolute
} = filters

export interface ImageFilters {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  noise: number
  pixelate: number
  grayscale: boolean
  sepia: boolean
  invert: boolean
}

const DEFAULT_FILTERS: ImageFilters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  noise: 0,
  pixelate: 1,
  grayscale: false,
  sepia: false,
  invert: false
}

export function useFabricImage(
  canvasComposable: UseFabricCanvasReturn,
  selectionComposable: UseFabricSelectionReturn
) {
  const { canvas } = canvasComposable
  const { activeObject } = selectionComposable

  const isLoading = ref(false)
  const currentFilters = ref<ImageFilters>({ ...DEFAULT_FILTERS })

  const selectedImage = computed(() => {
    const obj = activeObject.value
    return obj instanceof FabricImage ? obj : null
  })

  const addImageFromURL = async (
    url: string,
    options: Partial<TOptions<FabricImage>> = {}
  ): Promise<FabricImage | null> => {
    if (!canvas.value) return null
    
    isLoading.value = true
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
      
      // Scale to fit canvas
      const maxWidth = canvas.value.width! * 0.8
      const maxHeight = canvas.value.height! * 0.8
      const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!, 1)
      
      img.set({
        left: canvas.value.width! / 2,
        top: canvas.value.height! / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        ...options
      })
      
      canvas.value.add(img)
      canvas.value.setActiveObject(img)
      canvas.value.requestRenderAll()
      
      return img
    } catch (e) {
      console.error('Failed to load image:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const addImageFromFile = async (file: File): Promise<FabricImage | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        if (e.target?.result) {
          const img = await addImageFromURL(e.target.result as string)
          resolve(img)
        } else {
          resolve(null)
        }
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }

  const addImageFromClipboard = async (): Promise<FabricImage | null> => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'))
        if (imageType) {
          const blob = await item.getType(imageType)
          const file = new File([blob], 'clipboard-image', { type: imageType })
          return addImageFromFile(file)
        }
      }
      return null
    } catch (e) {
      console.error('Failed to paste image:', e)
      return null
    }
  }

  const setBackgroundImage = async (url: string, options: any = {}): Promise<void> => {
    if (!canvas.value) return
    
    isLoading.value = true
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
      
      // Scale to cover canvas
      const scaleX = canvas.value.width! / img.width!
      const scaleY = canvas.value.height! / img.height!
      const scale = Math.max(scaleX, scaleY)
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center',
        left: canvas.value.width! / 2,
        top: canvas.value.height! / 2,
        ...options
      })
      
      canvas.value.backgroundImage = img
      canvas.value.requestRenderAll()
    } catch (e) {
      console.error('Failed to set background:', e)
    } finally {
      isLoading.value = false
    }
  }

  const removeBackground = () => {
    if (!canvas.value) return
    canvas.value.backgroundImage = undefined
    canvas.value.requestRenderAll()
  }

  const applyFilters = (filterConfig: Partial<ImageFilters> = currentFilters.value) => {
    const img = selectedImage.value
    if (!img || !canvas.value) return

    currentFilters.value = { ...currentFilters.value, ...filterConfig }
    const f = currentFilters.value
    
    const filterList: any[] = []

    if (f.brightness !== 0) {
      filterList.push(new Brightness({ brightness: f.brightness }))
    }
    if (f.contrast !== 0) {
      filterList.push(new Contrast({ contrast: f.contrast }))
    }
    if (f.saturation !== 0) {
      filterList.push(new Saturation({ saturation: f.saturation }))
    }
    if (f.blur > 0) {
      filterList.push(new Blur({ blur: f.blur }))
    }
    if (f.noise > 0) {
      filterList.push(new Noise({ noise: f.noise }))
    }
    if (f.pixelate > 1) {
      filterList.push(new Pixelate({ blocksize: f.pixelate }))
    }
    if (f.grayscale) {
      filterList.push(new Grayscale())
    }
    if (f.sepia) {
      filterList.push(new Sepia())
    }
    if (f.invert) {
      filterList.push(new Invert())
    }

    img.filters = filterList
    img.applyFilters()
    canvas.value.requestRenderAll()
  }

  const resetFilters = () => {
    currentFilters.value = { ...DEFAULT_FILTERS }
    applyFilters()
  }

  const setBrightness = (v: number) => applyFilters({ brightness: v })
  const setContrast = (v: number) => applyFilters({ contrast: v })
  const setSaturation = (v: number) => applyFilters({ saturation: v })
  const setBlur = (v: number) => applyFilters({ blur: v })
  const setNoise = (v: number) => applyFilters({ noise: v })
  const setPixelate = (v: number) => applyFilters({ pixelate: v })
  const toggleGrayscale = () => applyFilters({ grayscale: !currentFilters.value.grayscale })
  const toggleSepia = () => applyFilters({ sepia: !currentFilters.value.sepia })
  const toggleInvert = () => applyFilters({ invert: !currentFilters.value.invert })

  const cropToSelection = () => {
    const img = selectedImage.value
    if (!img || !canvas.value) return
    // Note: Crop functionality requires more complex implementation with clipping paths
    console.warn('Crop functionality not yet implemented')
  }

  const fitToCanvas = () => {
    const img = selectedImage.value
    if (!img || !canvas.value) return
    
    const scaleX = canvas.value.width! / img.width!
    const scaleY = canvas.value.height! / img.height!
    const scale = Math.min(scaleX, scaleY)
    
    img.set({
      scaleX: scale,
      scaleY: scale,
      left: canvas.value.width! / 2,
      top: canvas.value.height! / 2,
      originX: 'center',
      originY: 'center'
    })
    canvas.value.requestRenderAll()
  }

  const fillCanvas = () => {
    const img = selectedImage.value
    if (!img || !canvas.value) return
    
    const scaleX = canvas.value.width! / img.width!
    const scaleY = canvas.value.height! / img.height!
    const scale = Math.max(scaleX, scaleY)
    
    img.set({
      scaleX: scale,
      scaleY: scale,
      left: canvas.value.width! / 2,
      top: canvas.value.height! / 2,
      originX: 'center',
      originY: 'center'
    })
    canvas.value.requestRenderAll()
  }

  // Reset filters when image selection changes
  watch(selectedImage, (img) => {
    if (img) {
      // Try to extract current filter values
      currentFilters.value = { ...DEFAULT_FILTERS }
    }
  })

  return {
    isLoading,
    selectedImage,
    currentFilters,
    addImageFromURL,
    addImageFromFile,
    addImageFromClipboard,
    setBackgroundImage,
    removeBackground,
    applyFilters,
    resetFilters,
    setBrightness,
    setContrast,
    setSaturation,
    setBlur,
    setNoise,
    setPixelate,
    toggleGrayscale,
    toggleSepia,
    toggleInvert,
    cropToSelection,
    fitToCanvas,
    fillCanvas
  }
}

export type UseFabricImageReturn = ReturnType<typeof useFabricImage>
