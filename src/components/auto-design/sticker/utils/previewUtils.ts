/**
 * Preview Generation Utilities
 * 
 * Extracted from StickerTemplatePanel.vue for better maintainability.
 * Handles wedding sticker preview generation, regeneration, and chat preview updates.
 */

import { nextTick, type Ref, type ComputedRef } from 'vue'
import type { ChatMessage, ExtractedInfo } from '../types'
import type { BackgroundItem } from '@/services/background/background.types'

// Re-export for backward compatibility
export type { ChatMessage, ExtractedInfo }

export interface GenerationContext {
  // Refs
  weddingPreviewContainer: Ref<HTMLDivElement | null>
  chatPreviewContainer: ComputedRef<HTMLElement | HTMLElement[] | null>
  showWeddingStickerPreview: Ref<boolean>
  isGeneratingPreview: Ref<boolean>
  generatingStep: Ref<number>
  generatingMessage: Ref<string>
  chatMessages: Ref<ChatMessage[]>
  formData: { description: string; customSize?: string }
  accumulatedDescription: Ref<string>
  extractedInfo: Ref<ExtractedInfo>
  validationWarnings: Ref<string[]>
  isDescriptionVisible: Ref<boolean>
  hasDesignBeenGenerated: Ref<boolean>
  preGeneratedImageFile: Ref<File | null>
  autoRemoveBackground: Ref<boolean>
  sizeStepComplete: Ref<boolean>
  awaitingSizeDecision: Ref<boolean>
  isAnalyzing: Ref<boolean>
  currentBackgroundFileName: Ref<string>
  availableBackgrounds: Ref<BackgroundItem[]>

  // Token costs
  TOKEN_COST_GENERATE_DESIGN: number

  // Functions
  scrollToBottom: () => void
  loadWeddingBackgroundManifest: () => Promise<void>
  getPersistedWeddingBackground: () => string | null
  getRandomBackground: () => BackgroundItem | null
  setPersistedWeddingBackground: (bg: string) => void
  loadWeddingStickerTemplate: () => Promise<void>
  processDescriptionInput: () => Promise<void>
  applyNewBackground: (bg: BackgroundItem) => Promise<void>
  updateChatPreviewSVG: () => void
  handleSizeChange: (w: number, h: number) => Promise<void>
  updateSVGWithImages: () => void
  makeSVGImageDraggable: (el: SVGImageElement, id: string) => void
  extractNames: (desc: string) => { name1: string | null; name2: string | null }
  deductTokensForAction: (amount: number, reason: string) => Promise<boolean>
  updateValidationWarnings: (data: any) => void
  updateStickerText: (desc: string, options: any) => Promise<any>

  // SVG Image Manager
  svgImageManager: {
    images: Ref<Array<{ id: string; dataUrl: string }>>
    addImage: (file: File, svg: SVGSVGElement) => Promise<{ id: string; dataUrl: string } | null>
  }

  // Background removal
  removeBackground: (file: File, options: any) => Promise<{ blob: Blob }>
  isBackgroundRemovalSupported: () => boolean

  // Auth store
  authStore: {
    isAuthenticated: boolean
    user: { id?: string } | null
    showNotification: (opts: { title: string; message: string; type: string }) => void
  }
}

// Generating messages for loading animation
export const GENERATING_MESSAGES = [
  'Creating your beautiful design...',
  'Preparing your wedding sticker...',
  'Adding the finishing touches...',
  'Almost there...',
  'Making it perfect for you...'
]

let generatingMessageInterval: ReturnType<typeof setInterval> | null = null

/**
 * Start cycling through generating messages for loading animation
 */
export function startGeneratingMessages(generatingMessage: Ref<string>): void {
  let index = 0
  generatingMessage.value = GENERATING_MESSAGES[0]
  generatingMessageInterval = setInterval(() => {
    index = (index + 1) % GENERATING_MESSAGES.length
    generatingMessage.value = GENERATING_MESSAGES[index]
  }, 2000)
}

/**
 * Stop the generating messages cycle
 */
export function stopGeneratingMessages(): void {
  if (generatingMessageInterval) {
    clearInterval(generatingMessageInterval)
    generatingMessageInterval = null
  }
}

/**
 * Check if user has confirmed wedding size
 */
export function hasConfirmedWeddingSize(
  extractedInfo: Ref<ExtractedInfo>,
  sizeStepComplete: Ref<boolean>
): boolean {
  const size = String(extractedInfo.value?.size ?? '').trim()
  return !!sizeStepComplete.value || !!size
}

/**
 * Prompt user for wedding sticker size
 */
export function promptForWeddingSize(
  awaitingSizeDecision: Ref<boolean>,
  isAnalyzing: Ref<boolean>,
  chatMessages: Ref<ChatMessage[]>,
  scrollToBottom: () => void
): void {
  if (awaitingSizeDecision.value) return
  awaitingSizeDecision.value = true
  isAnalyzing.value = false

  chatMessages.value.push({
    id: Date.now(),
    text: "What size would you like the sticker? (e.g., '3x3' or type 'default' for 4x4 inches)",
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
}

/**
 * Parse size string to width and height in inches
 */
export function parseSizeToInches(size: string): { w: number; h: number } | null {
  const match = size.match(/(\d+(?:\.\d+)?)\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)/i)
  if (match) {
    return { w: parseFloat(match[1]), h: parseFloat(match[2]) }
  }
  return null
}

/**
 * Set wedding sticker size and apply if preview exists
 */
export function setWeddingSize(
  sizeRaw: string,
  extractedInfo: Ref<ExtractedInfo>,
  formData: { customSize?: string },
  sizeStepComplete: Ref<boolean>,
  awaitingSizeDecision: Ref<boolean>,
  showWeddingStickerPreview: Ref<boolean>,
  handleSizeChange: (w: number, h: number) => Promise<void>,
  syncWeddingDescriptionFromState?: () => void
): void {
  const normalized = String(sizeRaw ?? '').trim()
  extractedInfo.value.size = normalized || null
  formData.customSize = normalized
  sizeStepComplete.value = !!normalized
  awaitingSizeDecision.value = false

  // Keep chat summary in sync
  if (syncWeddingDescriptionFromState) {
    try {
      syncWeddingDescriptionFromState()
    } catch {
      // no-op
    }
  }

  // If preview already exists, apply the resize immediately
  if (showWeddingStickerPreview.value) {
    const parsed = parseSizeToInches(normalized)
    if (parsed) {
      handleSizeChange(parsed.w, parsed.h)
    }
  }
}

/**
 * Generate wedding sticker preview
 */
export async function generateWeddingPreviewUtil(ctx: GenerationContext): Promise<void> {
  // Check if user is logged in FIRST
  if (!ctx.authStore.isAuthenticated || !ctx.authStore.user?.id) {
    ctx.authStore.showNotification({
      title: 'Login Required',
      message: 'Please login or create an account to generate designs.',
      type: 'info'
    })
    ctx.chatMessages.value.push({
      id: Date.now(),
      text: "Hold on!\n\nYou need to login or create a free account to generate your design.\n\nWhy sign up?\n💎 Get 100 FREE tokens instantly!\n💾 Save and download your designs\n🎨 Access premium features",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'login', label: 'Login to Continue', variant: 'primary' }
      ]
    })
    ctx.scrollToBottom()
    return
  }

  // Resolve description
  const resolvedDescription = (ctx.formData.description || '').trim() || (ctx.accumulatedDescription.value || '').trim()

  if (!resolvedDescription) {
    ctx.chatMessages.value.push({
      id: Date.now(),
      text: "Please provide your details first.\n\nExample:\n(John & Mary) 8th March 2025 courtesy: Smith family",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    ctx.scrollToBottom()
    return
  }

  ctx.formData.description = resolvedDescription
  ctx.accumulatedDescription.value = resolvedDescription

  // Require size confirmation
  if (!hasConfirmedWeddingSize(ctx.extractedInfo, ctx.sizeStepComplete)) {
    promptForWeddingSize(
      ctx.awaitingSizeDecision,
      ctx.isAnalyzing,
      ctx.chatMessages,
      ctx.scrollToBottom
    )
    return
  }

  // Check requirements: Must have names OR a picture
  const { name1, name2 } = ctx.extractNames(ctx.formData.description)
  const hasNames = !!(name1 || name2)
  const hasPicture = !!ctx.preGeneratedImageFile.value

  if (!hasNames && !hasPicture) {
    ctx.authStore.showNotification({
      title: 'Missing Information',
      message: 'Please include at least a Name in the description or upload a Picture to generate the preview.',
      type: 'info'
    })
    
    // Update validation warnings
    const data = await ctx.updateStickerText(ctx.formData.description, {} as any)
    ctx.updateValidationWarnings(data)
    return
  }

  // Deduct tokens for initial design generation
  if (!ctx.hasDesignBeenGenerated.value) {
    const canProceed = await ctx.deductTokensForAction(ctx.TOKEN_COST_GENERATE_DESIGN, 'Generate initial design')
    if (!canProceed) return
    ctx.hasDesignBeenGenerated.value = true
  }

  ctx.isGeneratingPreview.value = true
  ctx.generatingStep.value = 1
  startGeneratingMessages(ctx.generatingMessage)
  ctx.showWeddingStickerPreview.value = true

  try {
    await ctx.loadWeddingBackgroundManifest()
    await nextTick()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 1000))

    ctx.generatingStep.value = 2

    // Apply custom size if specified
    if (ctx.formData.customSize) {
      const sizeMatch = ctx.formData.customSize.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)/i)
      if (sizeMatch && ctx.weddingPreviewContainer.value) {
        const w = parseFloat(sizeMatch[1])
        const h = parseFloat(sizeMatch[2])
        await ctx.handleSizeChange(w, h)
      }
    }

    // Choose background
    // getPersistedWeddingBackground() returns a persist key like "bundled:filename"
    // We need to find the matching BackgroundItem from availableBackgrounds
    const persistedKey = ctx.getPersistedWeddingBackground()
    let initialBackground: BackgroundItem | null = null
    
    if (persistedKey) {
      // Find background item matching the persisted key
      initialBackground = ctx.availableBackgrounds.value.find(bg => {
        const bgKey = `${bg.src.type}:${bg.id}`
        return bgKey === persistedKey || bg.id === persistedKey || bg.fileName === persistedKey
      }) || null
    }
    
    // If no persisted background found, get a random one
    if (!initialBackground) {
      initialBackground = ctx.getRandomBackground()
    }

    if (initialBackground) {
      ctx.currentBackgroundFileName.value = initialBackground.fileName || initialBackground.id
      ctx.setPersistedWeddingBackground(`${initialBackground.src.type}:${initialBackground.id}`)
    }

    await ctx.loadWeddingStickerTemplate()
    await ctx.processDescriptionInput()

    if (initialBackground) {
      await ctx.applyNewBackground(initialBackground)
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    ctx.formData.description = ''

    // Handle pre-uploaded image
    if (ctx.preGeneratedImageFile.value) {
      ctx.generatingStep.value = 3
      await nextTick()

      if (!ctx.weddingPreviewContainer.value) return

      const svgElement = ctx.weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
      if (svgElement) {
        let fileToProcess = ctx.preGeneratedImageFile.value

        if (ctx.autoRemoveBackground.value && ctx.isBackgroundRemovalSupported()) {
          try {
            const result = await ctx.removeBackground(fileToProcess, {
              quality: 'high',
              outputFormat: 'image/png',
              maxDimensions: 2048
            })
            fileToProcess = new File([result.blob], fileToProcess.name.replace(/\.[^/.]+$/, '.png'), {
              type: 'image/png',
              lastModified: Date.now()
            })
          } catch (error) {
            // Continue with original image
          }
        }

        const addedImage = await ctx.svgImageManager.addImage(fileToProcess, svgElement)
        console.log('📸 Image added to svgImageManager:', {
          addedImage: !!addedImage,
          imagesCount: ctx.svgImageManager.images.value.length,
          dataUrlLength: ctx.svgImageManager.images.value[0]?.dataUrl?.length || 0
        })
        
        ctx.updateSVGWithImages()
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 800))

        // Ensure correct z-order and opacity
        const imgElement = svgElement.querySelector('#userImage, #placeholder-image') as SVGImageElement
        if (imgElement) {
          console.log('📸 Found image element:', {
            id: imgElement.id,
            href: imgElement.getAttribute('href')?.substring(0, 50) || 'none',
            opacity: imgElement.getAttribute('opacity')
          })
          
          const bgImage = svgElement.querySelector('#background-image')
          if (bgImage && bgImage.parentNode === imgElement.parentNode) {
            const children = Array.from(svgElement.children)
            const bgIndex = children.indexOf(bgImage)
            const userIndex = children.indexOf(imgElement)
            if (userIndex < bgIndex) {
              bgImage.after(imgElement)
            }
          }

          if (!imgElement.getAttribute('opacity') || imgElement.getAttribute('opacity') === '0') {
            imgElement.setAttribute('opacity', '1')
          }

          const currentHref = imgElement.getAttribute('href')
          if (!currentHref || currentHref === '') {
            const latestImage = ctx.svgImageManager.images.value[ctx.svgImageManager.images.value.length - 1]
            if (latestImage?.dataUrl) {
              console.log('📸 Setting href from svgImageManager:', latestImage.dataUrl.substring(0, 50))
              imgElement.setAttribute('href', latestImage.dataUrl)
              imgElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', latestImage.dataUrl)
            }
          }
          
          // Force visibility
          imgElement.style.display = 'block'
          imgElement.style.visibility = 'visible'
          imgElement.removeAttribute('display')
        } else {
          console.warn('⚠️ No image element found in SVG after updateSVGWithImages')
        }
      }
    }

    ctx.generatingStep.value = 4

    if (ctx.validationWarnings.value.length > 0) {
      ctx.authStore.showNotification({
        title: 'Preview Generated',
        message: 'Preview ready, but some details are missing. Please check the warnings below.',
        type: 'info'
      })
    } else {
      if (!ctx.showWeddingStickerPreview.value) {
        ctx.authStore.showNotification({
          title: 'Preview Generated',
          message: 'Your wedding sticker preview is ready!',
          type: 'success'
        })
      }
    }

    ctx.isDescriptionVisible.value = false
    ctx.showWeddingStickerPreview.value = true

    // Add preview message
    ctx.chatMessages.value.push({
      id: Date.now(),
      text: '',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'preview'
    })

    ctx.chatMessages.value.push({
      id: Date.now() + 1,
      text: "Your design is ready! Looking great! 🎉\n\n💡 **Tip:** You can drag the image to reposition it. Click 'Edit' for more options!",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    await nextTick()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 500))

    // Use the proper updateChatPreviewSVG to clone master SVG to chat preview
    // This ensures both background and user image are present in the visible preview
    ctx.updateChatPreviewSVG()

    ctx.scrollToBottom()

  } catch (error) {
    ctx.showWeddingStickerPreview.value = false
    ctx.authStore.showNotification({
      title: 'Generation Failed',
      message: 'Something went wrong. Please try again.',
      type: 'error'
    })
  } finally {
    ctx.isGeneratingPreview.value = false
    ctx.generatingStep.value = 0
    stopGeneratingMessages()
    setTimeout(() => ctx.scrollToBottom(), 100)
  }
}

/**
 * Handle generate more - regenerate with new random background
 */
export async function handleGenerateMoreUtil(
  chatMessages: Ref<ChatMessage[]>,
  isGeneratingPreview: Ref<boolean>,
  generatingMessage: Ref<string>,
  getRandomBackground: () => BackgroundItem | null,
  applyNewBackground: (bg: BackgroundItem) => Promise<void>,
  updateChatPreviewSVG: () => void,
  scrollToBottom: () => void
): Promise<void> {
  chatMessages.value.push({
    id: Date.now(),
    text: "Generate another design",
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  isGeneratingPreview.value = true
  generatingMessage.value = 'Creating a fresh design...'

  const newBackground = getRandomBackground()
  if (newBackground) {
    await new Promise(resolve => setTimeout(resolve, 500))
    generatingMessage.value = 'Applying new style...'

    await applyNewBackground(newBackground)

    await new Promise(resolve => setTimeout(resolve, 300))
    generatingMessage.value = 'Updating preview...'

    await nextTick()
    await nextTick()

    updateChatPreviewSVG()
    isGeneratingPreview.value = false

    chatMessages.value.push({
      id: Date.now() + 1,
      text: "Here's a new design variation! 🎨 Like this one better?",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    scrollToBottom()
  } else {
    isGeneratingPreview.value = false
  }
}

/**
 * Handle generate new - updates ALL existing previews with new design
 */
export async function handleGenerateNewUtil(
  weddingPreviewContainer: Ref<HTMLDivElement | null>,
  chatPreviewContainer: ComputedRef<HTMLElement | HTMLElement[] | null>,
  chatMessages: Ref<ChatMessage[]>,
  isGeneratingPreview: Ref<boolean>,
  generatingMessage: Ref<string>,
  getRandomBackground: () => BackgroundItem | null,
  applyNewBackground: (bg: BackgroundItem) => Promise<void>,
  scrollToBottom: () => void
): Promise<void> {
  isGeneratingPreview.value = true
  generatingMessage.value = 'Creating new design...'

  const newBackground = getRandomBackground()
  if (newBackground) {
    await new Promise(resolve => setTimeout(resolve, 800))
    generatingMessage.value = 'Applying new style...'

    await applyNewBackground(newBackground)

    await new Promise(resolve => setTimeout(resolve, 400))
    generatingMessage.value = 'Finalizing design...'

    await nextTick()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 200))

    // Update ALL existing preview containers
    if (weddingPreviewContainer.value) {
      const masterSvg = weddingPreviewContainer.value.querySelector('svg')
      if (masterSvg) {
        const previewContainers = Array.isArray(chatPreviewContainer.value)
          ? chatPreviewContainer.value
          : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])

        previewContainers.forEach((container) => {
          if (container) {
            const existingSvg = container.querySelector('svg')
            if (existingSvg) existingSvg.remove()

            const loadingPlaceholder = container.querySelector('.preview-loading-placeholder')
            if (loadingPlaceholder) loadingPlaceholder.remove()

            const clonedSvg = masterSvg.cloneNode(true) as SVGSVGElement

            const viewBox = clonedSvg.getAttribute('viewBox')
            if (viewBox) {
              const parts = viewBox.split(/\s+|,/)
              if (parts.length >= 4) {
                const vbWidth = parseFloat(parts[2])
                const vbHeight = parseFloat(parts[3])
                container.style.aspectRatio = String(vbWidth / vbHeight)
              }
            }

            clonedSvg.style.display = 'block'
            clonedSvg.style.width = '100%'
            clonedSvg.style.maxWidth = '100%'
            clonedSvg.style.height = 'auto'
            clonedSvg.removeAttribute('width')
            clonedSvg.removeAttribute('height')

            container.appendChild(clonedSvg)
          }
        })
      }
    }

    chatMessages.value.push({
      id: Date.now(),
      text: "Your design has been updated with a fresh new look! ✨🎨",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    isGeneratingPreview.value = false
  } else {
    isGeneratingPreview.value = false
  }

  scrollToBottom()
}
