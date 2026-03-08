/**
 * Element Explanations Configuration
 * Provides contextual help for all interactive elements in the app
 */

export interface ElementExplanation {
  title: string
  description: string
  example?: string
  tips?: string[]
  videoUrl?: string
}

export const elementExplanations: Record<string, ElementExplanation> = {
  // Description Field - Most Important
  'description-textarea': {
    title: '📝 Description Field - How to Use',
    description: 'This is where you describe your design. Use brackets to specify names that will appear on your sticker.',
    example: 'Congratulations on your wedding (John & Mary), 15th March 2025, courtesy: Smith Family',
    tips: [
      'Use parentheses ( ) or brackets [ ] to enclose names: (John & Mary) or [John and Mary]',
      'Separate names with "&" or "and": (John & Mary) or (John and Mary)',
      'Add dates in any format: 15th March 2025, March 15 2025, or 03/15/2025',
      'Add courtesy info: "courtesy: Smith Family" or "cut-cee: The Johnsons"',
      'Type "cour" + Space to auto-complete to "courtesy:"',
      'Keywords like "wedding", "nikkah", "ceremony" trigger special graphics'
    ]
  },

  // Smart Camera Input
  'smart-camera': {
    title: '📸 Smart Camera Input',
    description: 'Use your camera or upload an image to extract text automatically. AI will detect and parse the text for you.',
    tips: [
      'Take a photo of an invitation card to extract text',
      'Upload an image with clear text',
      'AI will auto-detect names, dates, and other details',
      'Review and edit the extracted text before using'
    ]
  },

  // Image Upload Zone
  'image-drop-zone': {
    title: '🖼️ Image Upload Area',
    description: 'Drag and drop your photos here or click to browse. Photos will be added to your sticker design.',
    tips: [
      'Supports PNG, JPG, JPEG, WEBP formats',
      'Maximum file size: 5MB',
      'Enable "Remove Background" for automatic background removal',
      'You can crop and edit images after upload'
    ]
  },

  // Background Removal Toggle
  'background-removal-toggle': {
    title: '✨ Auto Background Removal',
    description: 'When enabled, AI will automatically remove backgrounds from uploaded photos, leaving only the main subject.',
    tips: [
      'Uses advanced AI for clean cutouts',
      'Works best with clear photos',
      'Processing may take a few seconds',
      'Original image is used if removal fails'
    ]
  },

  // Category Pills
  'category-pill': {
    title: '🎨 Design Categories',
    description: 'Choose the type of sticker you want to create. Each category has specialized templates and features.',
    tips: [
      'Wedding: Wedding ceremony, nikkah, congratulations',
      'Naming: Baby naming ceremonies',
      'Graduation: Graduation celebrations',
      'Each category has unique design elements'
    ]
  },

  // Generate Button
  'generate-btn': {
    title: '🚀 Generate Design',
    description: 'Click here to generate your sticker design based on the information you provided.',
    tips: [
      'Make sure you\'ve filled in the description',
      'Upload images if needed',
      'Select your preferred sticker type',
      'Generation takes a few seconds'
    ]
  },

  // Export SVG Button
  'export-svg-btn': {
    title: '💾 Export as SVG',
    description: 'Download your design as an SVG file. SVG files are scalable and perfect for printing at any size.',
    tips: [
      'SVG files can be scaled infinitely without quality loss',
      'Perfect for professional printing',
      'Can be edited in design software',
      'Smaller file size than PNG'
    ]
  },

  // Export PNG Button
  'export-png-btn': {
    title: '💾 Export as PNG (300 DPI)',
    description: 'Download your design as a high-quality PNG image at 300 DPI, perfect for printing.',
    tips: [
      '300 DPI ensures professional print quality',
      'Compatible with all photo printing services',
      'Larger file size than SVG',
      'Cannot be resized without quality loss'
    ]
  },

  // Flip Image Button
  'flip-image-btn': {
    title: '🔄 Flip Image',
    description: 'Mirror your image horizontally. Useful for adjusting photo orientation.',
    tips: [
      'Click again to flip back to original',
      'Useful for selfies or mirrored text',
      'Does not affect image quality'
    ]
  },

  // Retouch Button
  'retouch-image-btn': {
    title: '✏️ Retouch Image',
    description: 'Open the cropping tool to adjust, crop, or reposition your image.',
    tips: [
      'Drag to select crop area',
      'Zoom in/out for precision',
      'Rotate if needed',
      'Original image is preserved'
    ]
  },

  // Sticker Type Checkboxes
  'sticker-checkbox': {
    title: '📐 Sticker Styles',
    description: 'Select the physical shape/style of your sticker. You can choose multiple options.',
    tips: [
      'Box Sticker: Square or rectangular shape',
      'Circle Sticker: Round shape',
      'Die-cut: Custom shape following your design',
      'Select multiple for variety'
    ]
  },

  // Custom Size Input
  'custom-size-input': {
    title: '📏 Custom Size',
    description: 'Specify the dimensions for your sticker in inches (e.g., 4x4, 3x5, 5x7).',
    example: '4x4, 3x5, 5x7, 6x9',
    tips: [
      'Format: width x height (e.g., 4x4)',
      'Measured in inches',
      'Common sizes: 3x3, 4x4, 5x5, 6x6',
      'Larger sizes cost more to print'
    ]
  },

  // Color Picker
  'color-input': {
    title: '🎨 Background Color',
    description: 'Choose a custom background color for your design.',
    tips: [
      'Click to open color picker',
      'Works best with "Remove Background" disabled',
      'Use brand colors for consistency',
      'White background is printer-friendly'
    ]
  },

  // Start Project Button (HomePage)
  'start-project-btn': {
    title: '🚀 Start Your Project',
    description: 'Begin creating your design! This will take you to the editor where you can create stickers, invitations, and more.',
    tips: [
      'Login for full access to features',
      'Save your designs to your account',
      'Access templates and AI tools'
    ]
  },

  // Login/Signup
  'auth-button': {
    title: '👤 Login / Sign Up',
    description: 'Create an account or login to save your designs, earn tokens, and access premium features.',
    tips: [
      'Free account includes tokens',
      'Save unlimited designs',
      'Access premium templates',
      'Earn tokens by referring friends'
    ]
  },

  // Template Cards
  'template-card': {
    title: '📋 Template Preview',
    description: 'Click to preview or use this template as a starting point for your design.',
    tips: [
      'Click "Edit" to customize',
      'Click "Preview" to view full size',
      'Templates are fully customizable',
      'Save your favorites'
    ]
  },

  // AI Chat Input
  'ai-chat-input': {
    title: '💬 AI Design Assistant',
    description: 'Chat with our AI to create your design! Just tell it what you want and watch the magic happen.',
    example: 'John & Mary, June 20 2025, courtesy: The Williams Family',
    tips: [
      'Tell me the couple names - e.g., "John and Mary"',
      'Include the wedding date in any format',
      'Add courtesy info - who the sticker is from',
      'Ask me anything about your design!',
      'Say "redo" or "start over" to begin fresh'
    ]
  },

  // Preview Panel
  'preview-panel': {
    title: '👁️ Design Preview',
    description: 'This is where your sticker design appears. You can see changes in real-time!',
    tips: [
      'The preview updates automatically',
      'Click and drag images to reposition',
      'Use pinch gestures to zoom on mobile',
      'The final export will be high quality'
    ]
  },

  // Voice Control Button
  'voice-control-btn': {
    title: '🎤 Voice Input',
    description: 'Speak to the AI instead of typing! Click to enable voice input.',
    tips: [
      'Speak clearly and naturally',
      'Works best in quiet environments',
      'Say the names, date, and courtesy info',
      'Click again to stop recording'
    ]
  },

  // Undo/Redo Buttons
  'undo-btn': {
    title: '↩️ Undo',
    description: 'Undo your last change. Keep clicking to go further back in history.',
    tips: [
      'Keyboard shortcut: Ctrl+Z (Cmd+Z on Mac)',
      'Works for all design changes',
      'Limited history - save often!'
    ]
  },

  'redo-btn': {
    title: '↪️ Redo',
    description: 'Redo a change you undid. Bring back your previous work.',
    tips: [
      'Keyboard shortcut: Ctrl+Y or Ctrl+Shift+Z',
      'Only available after using Undo'
    ]
  },

  // Clear/Reset Button
  'clear-btn': {
    title: '🗑️ Clear Design',
    description: 'Start fresh! This removes all content from your current design.',
    tips: [
      'Cannot be undone!',
      'Save your work first if needed',
      'Use for starting a completely new design'
    ]
  },

  // Auto Design Button
  'auto-design-btn': {
    title: '✨ Auto Design',
    description: 'Let AI create a beautiful design for you automatically based on your input.',
    tips: [
      'Fill in your description first',
      'Works best with complete information',
      'You can customize the result afterwards'
    ]
  },

  // Sticker Gallery
  'sticker-gallery': {
    title: '🖼️ Sticker Gallery',
    description: 'Browse pre-designed stickers you can customize.',
    tips: [
      'Click to select a sticker',
      'Each sticker can be fully customized',
      'New designs are added regularly'
    ]
  },

  // Print Settings
  'print-settings': {
    title: '🖨️ Print Settings',
    description: 'Configure print options for your design.',
    tips: [
      'Choose 300 DPI for professional printing',
      'Select correct paper size',
      'Use CMYK color mode for print shops'
    ]
  }
}

/**
 * Get explanation for an element based on its ID, class, or data attribute
 */
export function getExplanationForElement(element: HTMLElement): ElementExplanation | null {
  // Check by ID
  if (element.id && elementExplanations[element.id]) {
    return elementExplanations[element.id]
  }

  // Check by data-explain attribute
  const explainKey = element.getAttribute('data-explain')
  if (explainKey && elementExplanations[explainKey]) {
    return elementExplanations[explainKey]
  }

  // Check by class patterns
  const classList = Array.from(element.classList)
  
  if (classList.some(c => c.includes('category-pill'))) {
    return elementExplanations['category-pill']
  }
  
  if (classList.some(c => c.includes('generate-btn'))) {
    return elementExplanations['generate-btn']
  }
  
  if (classList.some(c => c.includes('export-svg-btn'))) {
    return elementExplanations['export-svg-btn']
  }
  
  if (classList.some(c => c.includes('export-png-btn'))) {
    return elementExplanations['export-png-btn']
  }
  
  if (classList.some(c => c.includes('flip-image-btn'))) {
    return elementExplanations['flip-image-btn']
  }
  
  if (classList.some(c => c.includes('retouch-image-btn'))) {
    return elementExplanations['retouch-image-btn']
  }
  
  if (classList.some(c => c.includes('sticker-checkbox'))) {
    return elementExplanations['sticker-checkbox']
  }
  
  if (classList.some(c => c.includes('custom-size-input'))) {
    return elementExplanations['custom-size-input']
  }
  
  if (classList.some(c => c.includes('color-input'))) {
    return elementExplanations['color-input']
  }
  
  if (classList.some(c => c.includes('image-drop-zone'))) {
    return elementExplanations['image-drop-zone']
  }

  if (classList.some(c => c.includes('ai-chat-input') || c.includes('chat-input'))) {
    return elementExplanations['ai-chat-input']
  }

  if (classList.some(c => c.includes('preview-panel') || c.includes('sticker-preview'))) {
    return elementExplanations['preview-panel']
  }

  if (classList.some(c => c.includes('voice-control') || c.includes('voice-btn'))) {
    return elementExplanations['voice-control-btn']
  }

  if (classList.some(c => c.includes('undo-btn'))) {
    return elementExplanations['undo-btn']
  }

  if (classList.some(c => c.includes('redo-btn'))) {
    return elementExplanations['redo-btn']
  }

  if (classList.some(c => c.includes('clear-btn') || c.includes('reset-btn'))) {
    return elementExplanations['clear-btn']
  }

  if (classList.some(c => c.includes('auto-design-btn'))) {
    return elementExplanations['auto-design-btn']
  }

  if (classList.some(c => c.includes('sticker-gallery'))) {
    return elementExplanations['sticker-gallery']
  }

  if (classList.some(c => c.includes('print-settings'))) {
    return elementExplanations['print-settings']
  }

  // Check parent elements
  const parent = element.parentElement
  if (parent) {
    const parentClasses = Array.from(parent.classList)

    if (parentClasses.some(c => c.includes('background-removal-toggle'))) {
      return elementExplanations['background-removal-toggle']
    }
  }

  return null
}
