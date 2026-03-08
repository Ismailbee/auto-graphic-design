/**
 * AI Integration Type Definitions
 */

// Text Generation Types
export type AITextType = 'headline' | 'caption' | 'description' | 'ad-copy' | 'social-post'
export type AITone = 'friendly' | 'professional' | 'playful' | 'formal' | 'casual' | 'persuasive'
export type AITextLength = 'short' | 'medium' | 'long'
export type AITextAction = 'rephrase' | 'shorten' | 'expand' | 'simplify' | 'professional'
export type AILanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar'

// Image Generation Types
export type AIImageStyle = 
  | 'illustration' 
  | 'realistic' 
  | 'render-3d' 
  | 'vector' 
  | 'watercolor' 
  | 'oil-painting'
  | 'sketch'
  | 'anime'
  | 'cyberpunk'
  | 'retro'

export type AIImageResolution = 'low' | 'medium' | 'high' | 'custom'

// Background Removal Types
export type AIBackgroundOutputType = 'transparent' | 'solid' | 'blur' | 'ai-generated'

// QR Code Types
export type QRCodeType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'event'
export type QRDotStyle = 'square' | 'rounded' | 'circular' | 'diamond'
export type QRCornerStyle = 'square' | 'rounded' | 'extra-rounded'
export type QRErrorCorrection = 'L' | 'M' | 'Q' | 'H'

// AI Tab Types
export type AITabType = 'text' | 'image' | 'background' | 'qrcode'

/**
 * Text Generation Options
 */
export interface AITextGenerateOptions {
  prompt: string
  type: AITextType
  tone: AITone
  language: AILanguage
  length: AITextLength
  variations?: number // Number of variations to generate (default: 3)
}

/**
 * Text Rewrite Options
 */
export interface AITextRewriteOptions {
  text: string
  action: AITextAction
  tone?: AITone
  targetLanguage?: AILanguage
}

/**
 * Text Translation Options
 */
export interface AITextTranslateOptions {
  text: string
  sourceLanguage: AILanguage
  targetLanguage: AILanguage
}

/**
 * Image Generation Options
 */
export interface AIImageGenerateOptions {
  prompt: string
  negativePrompt?: string
  style: AIImageStyle
  resolution: AIImageResolution
  width?: number // For custom resolution
  height?: number // For custom resolution
  seed?: number // For reproducible results
  guidanceScale?: number // 1-20, default 7.5
  steps?: number // 20-100, default 50
  batchSize?: number // 1-4, default 1
}

/**
 * Background Removal Options
 */
export interface AIBackgroundRemoveOptions {
  imageUrl: string
  imageId?: string
  outputType: AIBackgroundOutputType
  backgroundColor?: string
  blurAmount?: number // 0-50px
  aiPrompt?: string // For AI-generated background
  edgeRefinement?: number // 0-10
  feathering?: number // 0-10px
}

/**
 * QR Code Generation Options
 */
export interface AIQRCodeOptions {
  data: string
  type: QRCodeType
  size: number // 256, 512, 1024, 2048
  foregroundColor: string
  backgroundColor: string
  gradient?: {
    enabled: boolean
    type: 'linear' | 'radial'
    colors: string[]
  }
  logoUrl?: string
  logoSize?: number // Percentage of QR size (10-30%)
  logoBackground?: string
  dotStyle: QRDotStyle
  cornerStyle: QRCornerStyle
  errorCorrection: QRErrorCorrection
  frame?: {
    enabled: boolean
    style: 'none' | 'circle' | 'rounded-square'
    color?: string
  }
}

/**
 * AI Text Result
 */
export interface AITextResult {
  id: string
  text: string
  prompt: string
  type: AITextType
  tone: AITone
  language: AILanguage
  createdAt: Date
  tokens?: number
  cost?: number
}

/**
 * AI Image Result
 */
export interface AIImageResult {
  id: string
  imageUrl: string
  thumbnailUrl?: string
  prompt: string
  negativePrompt?: string
  style: AIImageStyle
  width: number
  height: number
  seed?: number
  createdAt: Date
  status: 'processing' | 'complete' | 'failed'
  estimatedTime?: number
  cost?: number
}

/**
 * AI Background Removal Result
 */
export interface AIBackgroundResult {
  id: string
  originalImageUrl: string
  processedImageUrl: string
  outputType: AIBackgroundOutputType
  createdAt: Date
  processingTime?: number
  cost?: number
}

/**
 * AI QR Code Result
 */
export interface AIQRCodeResult {
  id: string
  qrCodeUrl: string
  qrCodeSvg?: string
  data: string
  type: QRCodeType
  size: number
  createdAt: Date
}

/**
 * AI Generation Status
 */
export interface AIGenerationStatus {
  id: string
  status: 'pending' | 'processing' | 'complete' | 'failed'
  progress: number // 0-100
  message: string
  estimatedTimeRemaining?: number // seconds
  error?: string
}

/**
 * AI Usage Statistics
 */
export interface AIUsageStats {
  textGenerations: number
  imageGenerations: number
  backgroundRemovals: number
  qrCodesGenerated: number
  totalCost: number
  creditsRemaining?: number
  resetDate?: Date
}

/**
 * Language Configuration
 */
export interface LanguageConfig {
  code: AILanguage
  name: string
  nativeName: string
  flag: string
}

/**
 * Style Preset Configuration
 */
export interface StylePresetConfig {
  style: AIImageStyle
  name: string
  description: string
  icon: string
  examplePrompt: string
}

/**
 * Resolution Preset Configuration
 */
export interface ResolutionPresetConfig {
  resolution: AIImageResolution
  width: number
  height: number
  label: string
  description: string
}

/**
 * Predefined Language Configurations
 */
export const LANGUAGES: Record<AILanguage, LanguageConfig> = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' }
}

/**
 * Predefined Style Presets
 */
export const STYLE_PRESETS: Record<AIImageStyle, StylePresetConfig> = {
  illustration: {
    style: 'illustration',
    name: 'Illustration',
    description: 'Flat design, vector-like',
    icon: '🎨',
    examplePrompt: 'flat illustration of a mountain landscape'
  },
  realistic: {
    style: 'realistic',
    name: 'Realistic Photo',
    description: 'Photorealistic, high detail',
    icon: '📷',
    examplePrompt: 'photorealistic portrait of a person'
  },
  'render-3d': {
    style: 'render-3d',
    name: '3D Render',
    description: 'Blender-style, volumetric',
    icon: '🎲',
    examplePrompt: '3d render of a futuristic car'
  },
  vector: {
    style: 'vector',
    name: 'Vector Style',
    description: 'Clean lines, minimal',
    icon: '📐',
    examplePrompt: 'vector art of a coffee cup'
  },
  watercolor: {
    style: 'watercolor',
    name: 'Watercolor',
    description: 'Soft, artistic painting',
    icon: '🖌️',
    examplePrompt: 'watercolor painting of flowers'
  },
  'oil-painting': {
    style: 'oil-painting',
    name: 'Oil Painting',
    description: 'Classic oil painting style',
    icon: '🖼️',
    examplePrompt: 'oil painting of a sunset'
  },
  sketch: {
    style: 'sketch',
    name: 'Sketch',
    description: 'Hand-drawn pencil sketch',
    icon: '✏️',
    examplePrompt: 'pencil sketch of a building'
  },
  anime: {
    style: 'anime',
    name: 'Anime',
    description: 'Japanese animation style',
    icon: '🎌',
    examplePrompt: 'anime character with blue hair'
  },
  cyberpunk: {
    style: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon, futuristic, dystopian',
    icon: '🌃',
    examplePrompt: 'cyberpunk city at night'
  },
  retro: {
    style: 'retro',
    name: 'Retro',
    description: 'Vintage 80s/90s aesthetic',
    icon: '📼',
    examplePrompt: 'retro 80s poster design'
  }
}

/**
 * Resolution Presets
 */
export const RESOLUTION_PRESETS: Record<AIImageResolution, ResolutionPresetConfig> = {
  low: {
    resolution: 'low',
    width: 512,
    height: 512,
    label: 'Low (512×512)',
    description: 'Fast generation, lower quality'
  },
  medium: {
    resolution: 'medium',
    width: 1024,
    height: 1024,
    label: 'Medium (1024×1024)',
    description: 'Balanced quality and speed'
  },
  high: {
    resolution: 'high',
    width: 2048,
    height: 2048,
    label: 'High (2048×2048)',
    description: 'Best quality, slower'
  },
  custom: {
    resolution: 'custom',
    width: 1024,
    height: 1024,
    label: 'Custom',
    description: 'Define your own dimensions'
  }
}

/**
 * Helper function to get language config
 */
export function getLanguageConfig(code: AILanguage): LanguageConfig {
  return LANGUAGES[code]
}

/**
 * Helper function to get style preset config
 */
export function getStylePresetConfig(style: AIImageStyle): StylePresetConfig {
  return STYLE_PRESETS[style]
}

/**
 * Helper function to get resolution preset config
 */
export function getResolutionPresetConfig(resolution: AIImageResolution): ResolutionPresetConfig {
  return RESOLUTION_PRESETS[resolution]
}

/**
 * Helper function to estimate image generation cost
 */
export function estimateImageCost(options: AIImageGenerateOptions): number {
  const basePrice = 0.02 // $0.02 per image
  const resolutionMultiplier = options.resolution === 'high' ? 2 : options.resolution === 'medium' ? 1.5 : 1
  const batchMultiplier = options.batchSize || 1
  return basePrice * resolutionMultiplier * batchMultiplier
}

/**
 * Helper function to estimate text generation cost
 */
export function estimateTextCost(options: AITextGenerateOptions): number {
  const basePrice = 0.001 // $0.001 per generation
  const lengthMultiplier = options.length === 'long' ? 2 : options.length === 'medium' ? 1.5 : 1
  const variationsMultiplier = options.variations || 3
  return basePrice * lengthMultiplier * variationsMultiplier
}

