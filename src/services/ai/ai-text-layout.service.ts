// src/services/ai-text-layout.service.ts

/**
 * AI Text Layout Service
 * Intelligently positions and sizes text based on design rules and content
 */

export interface TextElement {
  id: string
  text: string
  type: 'title' | 'subtitle' | 'body' | 'caption' | 'label'
  priority: number // 1-10, higher = more important
}

export interface LayoutConstraints {
  width: number
  height: number
  padding: number
  minFontSize: number
  maxFontSize: number
  lineHeight: number
  fontFamily: string
}

export interface LayoutResult {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontWeight: string
  lineHeight: number
  align: 'left' | 'center' | 'right'
  color: string
}

export interface AILayoutOptions {
  style?: 'modern' | 'classic' | 'minimal' | 'bold'
  alignment?: 'left' | 'center' | 'right'
  colorScheme?: {
    primary: string
    secondary: string
    text: string
  }
}

class AITextLayoutService {
  /**
   * Generate optimal text layout using AI-inspired rules
   */
  generateLayout(
    elements: TextElement[],
    constraints: LayoutConstraints,
    options: AILayoutOptions = {}
  ): LayoutResult[] {
    const results: LayoutResult[] = []
    const { width, height, padding, minFontSize, maxFontSize, lineHeight, fontFamily } = constraints
    const style = options.style || 'modern'
    const alignment = options.alignment || 'center'

    // Sort elements by priority (highest first)
    const sortedElements = [...elements].sort((a, b) => b.priority - a.priority)

    // Calculate available space
    const availableWidth = width - padding * 2
    const availableHeight = height - padding * 2

    // Track vertical position
    let currentY = padding

    // Layout each element
    for (const element of sortedElements) {
      const layout = this.layoutElement(
        element,
        {
          x: padding,
          y: currentY,
          width: availableWidth,
          maxHeight: availableHeight - (currentY - padding)
        },
        {
          minFontSize,
          maxFontSize,
          lineHeight,
          fontFamily,
          style,
          alignment,
          colorScheme: options.colorScheme
        }
      )

      if (layout) {
        results.push(layout)
        currentY = layout.y + layout.height + this.getSpacing(element.type, style)
      }
    }

    return results
  }

  /**
   * Layout a single text element
   */
  private layoutElement(
    element: TextElement,
    bounds: { x: number; y: number; width: number; maxHeight: number },
    options: {
      minFontSize: number
      maxFontSize: number
      lineHeight: number
      fontFamily: string
      style: string
      alignment: 'left' | 'center' | 'right'
      colorScheme?: { primary: string; secondary: string; text: string }
    }
  ): LayoutResult | null {
    // Calculate optimal font size based on element type and priority
    const fontSize = this.calculateFontSize(element, options)

    // Calculate text dimensions
    const textMetrics = this.measureText(element.text, fontSize, options.fontFamily)
    const textHeight = textMetrics.height * options.lineHeight

    // Check if text fits in available space
    if (textHeight > bounds.maxHeight) {
      return null // Skip if doesn't fit
    }

    // Calculate position based on alignment
    let x = bounds.x
    if (options.alignment === 'center') {
      x = bounds.x + (bounds.width - textMetrics.width) / 2
    } else if (options.alignment === 'right') {
      x = bounds.x + bounds.width - textMetrics.width
    }

    // Get color based on element type
    const color = this.getTextColor(element.type, options.colorScheme)

    // Get font weight based on element type
    const fontWeight = this.getFontWeight(element.type, options.style)

    return {
      id: element.id,
      text: element.text,
      x,
      y: bounds.y,
      width: textMetrics.width,
      height: textHeight,
      fontSize,
      fontWeight,
      lineHeight: options.lineHeight,
      align: options.alignment,
      color
    }
  }

  /**
   * Calculate optimal font size for element
   */
  private calculateFontSize(
    element: TextElement,
    options: { minFontSize: number; maxFontSize: number; style: string }
  ): number {
    const { minFontSize, maxFontSize, style } = options

    // Base font sizes by type
    const baseSizes: Record<string, number> = {
      title: maxFontSize,
      subtitle: maxFontSize * 0.6,
      body: maxFontSize * 0.4,
      caption: maxFontSize * 0.3,
      label: maxFontSize * 0.35
    }

    // Style multipliers
    const styleMultipliers: Record<string, number> = {
      modern: 1.0,
      classic: 0.9,
      minimal: 0.85,
      bold: 1.2
    }

    let fontSize = baseSizes[element.type] || maxFontSize * 0.5
    fontSize *= styleMultipliers[style] || 1.0

    // Apply priority adjustment
    fontSize *= 0.8 + (element.priority / 10) * 0.4

    // Clamp to min/max
    return Math.max(minFontSize, Math.min(maxFontSize, Math.round(fontSize)))
  }

  /**
   * Measure text dimensions (approximate)
   */
  private measureText(
    text: string,
    fontSize: number,
    fontFamily: string
  ): { width: number; height: number } {
    // Create temporary canvas for measurement
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      // Fallback to approximate calculation
      return {
        width: text.length * fontSize * 0.6,
        height: fontSize
      }
    }

    ctx.font = `${fontSize}px ${fontFamily}`
    const metrics = ctx.measureText(text)

    return {
      width: metrics.width,
      height: fontSize // Approximate height
    }
  }

  /**
   * Get spacing between elements based on type and style
   */
  private getSpacing(type: string, style: string): number {
    const baseSpacing: Record<string, number> = {
      title: 40,
      subtitle: 30,
      body: 20,
      caption: 15,
      label: 10
    }

    const styleMultipliers: Record<string, number> = {
      modern: 1.2,
      classic: 1.0,
      minimal: 1.5,
      bold: 0.8
    }

    const spacing = baseSpacing[type] || 20
    return spacing * (styleMultipliers[style] || 1.0)
  }

  /**
   * Get text color based on element type
   */
  private getTextColor(
    type: string,
    colorScheme?: { primary: string; secondary: string; text: string }
  ): string {
    if (!colorScheme) {
      return '#000000'
    }

    switch (type) {
      case 'title':
        return colorScheme.primary
      case 'subtitle':
        return colorScheme.secondary
      case 'body':
      case 'caption':
      case 'label':
        return colorScheme.text
      default:
        return colorScheme.text
    }
  }

  /**
   * Get font weight based on element type and style
   */
  private getFontWeight(type: string, style: string): string {
    const weights: Record<string, Record<string, string>> = {
      modern: {
        title: 'bold',
        subtitle: '600',
        body: 'normal',
        caption: 'normal',
        label: '500'
      },
      classic: {
        title: 'bold',
        subtitle: 'bold',
        body: 'normal',
        caption: 'normal',
        label: 'normal'
      },
      minimal: {
        title: '300',
        subtitle: '300',
        body: '300',
        caption: '300',
        label: '300'
      },
      bold: {
        title: 'bold',
        subtitle: 'bold',
        body: '600',
        caption: '500',
        label: '600'
      }
    }

    return weights[style]?.[type] || 'normal'
  }

  /**
   * Optimize layout for readability
   * Adjusts spacing, alignment, and sizing for better visual hierarchy
   */
  optimizeLayout(layouts: LayoutResult[], constraints: LayoutConstraints): LayoutResult[] {
    const optimized = [...layouts]

    // Ensure proper vertical rhythm
    for (let i = 1; i < optimized.length; i++) {
      const prev = optimized[i - 1]
      const current = optimized[i]

      // Minimum spacing between elements
      const minSpacing = 20
      const expectedY = prev.y + prev.height + minSpacing

      if (current.y < expectedY) {
        current.y = expectedY
      }
    }

    // Ensure all elements fit within bounds
    const totalHeight = optimized.reduce((sum, layout) => 
      Math.max(sum, layout.y + layout.height), 0
    )

    if (totalHeight > constraints.height - constraints.padding) {
      // Scale down if content doesn't fit
      const scale = (constraints.height - constraints.padding * 2) / totalHeight
      optimized.forEach(layout => {
        layout.y *= scale
        layout.height *= scale
        layout.fontSize *= scale
      })
    }

    return optimized
  }

  /**
   * Generate layout suggestions based on content analysis
   */
  suggestLayout(text: string, constraints: LayoutConstraints): AILayoutOptions {
    const wordCount = text.split(/\s+/).length
    const hasLongWords = text.split(/\s+/).some(word => word.length > 12)

    // Suggest style based on content
    let style: 'modern' | 'classic' | 'minimal' | 'bold' = 'modern'
    
    if (wordCount < 10) {
      style = 'bold' // Short text = bold style
    } else if (wordCount > 50) {
      style = 'minimal' // Long text = minimal style for readability
    } else if (hasLongWords) {
      style = 'classic' // Complex words = classic style
    }

    // Suggest alignment based on content length
    let alignment: 'left' | 'center' | 'right' = 'center'
    
    if (wordCount > 30) {
      alignment = 'left' // Long text = left align for readability
    }

    return {
      style,
      alignment
    }
  }
}

// Export singleton instance
export const aiTextLayoutService = new AITextLayoutService()

