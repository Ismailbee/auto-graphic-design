// src/types/auto-design.ts
import type { Timestamp } from 'firebase/firestore'

export interface AutoDesignProject {
  id: string
  userId: string
  category: string
  subCategory?: string
  templateId?: string

  inputs: {
    text: Record<string, string>
    colors: {
      primary: string
      secondary: string
      background?: string
      accent?: string
    }
    size: string
    customDimensions?: {
      width: number
      height: number
      unit: 'in' | 'cm' | 'px'
    }
    options: {
      removeBackground: boolean
      backgroundType: 'default' | 'custom' | 'online'
      customBackground?: string
    }
  }

  files: {
    logo?: {
      url: string
      originalName: string
      size: number
      processedUrl?: string
    }
    images: Array<{
      url: string
      originalName: string
      size: number
      processedUrl?: string
    }>
  }

  design: {
    previewUrl?: string
    fullUrl?: string
    pdfUrl?: string
    dimensions: {
      width: number
      height: number
      dpi: number
    }
  }

  status: 'draft' | 'processing' | 'completed' | 'failed'
  progress?: number
  error?: string

  metadata?: {
    variations?: string[]
    originalId?: string
    retouchedFrom?: string
  }

  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface Template {
  id: string
  name: string
  category: string
  subCategory?: string

  dimensions: {
    width: number
    height: number
    unit: 'in' | 'cm' | 'px'
    dpi: number
  }

  fields: Array<{
    name: string
    type: 'text' | 'image' | 'color'
    label: string
    placeholder?: string
    required: boolean
    maxLength?: number
  }>

  layout: {
    layers: Array<{
      type: 'text' | 'image' | 'shape' | 'background'
      id: string
      x: number
      y: number
      width: number
      height: number
      properties: any
    }>
  }

  assets: {
    backgrounds?: string[]
    fonts?: string[]
  }

  published: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface FormData {
  text: Record<string, string>
  colors: {
    primary: string
    secondary: string
    background?: string
    accent?: string
  }
  size: string
  customDimensions: {
    width: number
    height: number
    unit: 'in' | 'cm' | 'px'
  } | null
  options: {
    removeBackground: boolean
    backgroundType: 'default' | 'custom' | 'online'
    customBackground: string | null
  }
}

export interface DesignCategory {
  id: string
  name: string
  icon?: string
  description?: string
  subCategories?: string[]
}

export interface GenerateDesignRequest {
  userId: string
  category: string
  inputs: FormData
  files: {
    logo?: { url: string }
    images?: Array<{ url: string }>
  }
}

export interface GenerateDesignResponse {
  success: boolean
  projectId: string
  status: 'processing' | 'completed'
  project?: AutoDesignProject
}

export interface GetProjectsResponse {
  success: boolean
  projects: AutoDesignProject[]
  total: number
  hasMore: boolean
}

