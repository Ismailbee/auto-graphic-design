/**
 * Fabric.js v6 Text Composable
 * Text creation and editing functionality
 */

import { ref, shallowRef, computed, watch } from 'vue'
import { IText, Textbox, FabricText, type TOptions } from 'fabric'
import type { UseFabricCanvasReturn } from './useFabricCanvas'
import type { UseFabricSelectionReturn } from './useFabricSelection'

interface TextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: string | number
  fontStyle: string
  fill: string
  textAlign: string
  underline: boolean
  linethrough: boolean
  charSpacing: number
  lineHeight: number
}

const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Arial',
  fontSize: 24,
  fontWeight: 'normal',
  fontStyle: 'normal',
  fill: '#000000',
  textAlign: 'left',
  underline: false,
  linethrough: false,
  charSpacing: 0,
  lineHeight: 1.2
}

export function useFabricText(
  canvasComposable: UseFabricCanvasReturn,
  selectionComposable: UseFabricSelectionReturn
) {
  const { canvas, on } = canvasComposable
  const { activeObject, selectedObjects } = selectionComposable

  const isEditing = ref(false)
  const currentStyle = ref<TextStyle>({ ...DEFAULT_TEXT_STYLE })
  const editingText = shallowRef<IText | Textbox | null>(null)

  const isTextObject = (obj: any): obj is IText | Textbox => {
    return obj instanceof IText || obj instanceof Textbox
  }

  const selectedTextObject = computed(() => {
    const obj = activeObject.value
    return obj && isTextObject(obj) ? obj : null
  })

  const addText = (text = 'Double-click to edit', options: Partial<TOptions<IText>> = {}) => {
    if (!canvas.value) return null
    
    const textObj = new IText(text, {
      left: canvas.value.width! / 2,
      top: canvas.value.height! / 2,
      originX: 'center',
      originY: 'center',
      ...currentStyle.value,
      ...options
    })

    canvas.value.add(textObj)
    canvas.value.setActiveObject(textObj)
    canvas.value.requestRenderAll()
    return textObj
  }

  const addTextbox = (text = 'Type your text here...', options: Partial<TOptions<Textbox>> = {}) => {
    if (!canvas.value) return null
    
    const textbox = new Textbox(text, {
      left: canvas.value.width! / 2,
      top: canvas.value.height! / 2,
      originX: 'center',
      originY: 'center',
      width: 200,
      ...currentStyle.value,
      ...options
    })

    canvas.value.add(textbox)
    canvas.value.setActiveObject(textbox)
    canvas.value.requestRenderAll()
    return textbox
  }

  const addHeading = (level: 1 | 2 | 3 = 1) => {
    const sizes = { 1: 48, 2: 36, 3: 28 }
    return addText('Heading', {
      fontSize: sizes[level],
      fontWeight: 'bold'
    })
  }

  const updateStyle = (style: Partial<TextStyle>) => {
    currentStyle.value = { ...currentStyle.value, ...style }
    
    if (selectedTextObject.value) {
      const textObj = selectedTextObject.value
      
      // Apply to entire object or selected text
      if (textObj.isEditing && textObj.getSelectedText?.()) {
        // Apply to selection only
        Object.entries(style).forEach(([key, value]) => {
          textObj.setSelectionStyles({ [key]: value })
        })
      } else {
        // Apply to entire object
        textObj.set(style as any)
      }
      
      canvas.value?.requestRenderAll()
    }
  }

  const setFontFamily = (fontFamily: string) => updateStyle({ fontFamily })
  const setFontSize = (fontSize: number) => updateStyle({ fontSize })
  const setFontWeight = (fontWeight: string | number) => updateStyle({ fontWeight })
  const setFontStyle = (fontStyle: string) => updateStyle({ fontStyle })
  const setTextColor = (fill: string) => updateStyle({ fill })
  const setTextAlign = (textAlign: string) => updateStyle({ textAlign })
  const setUnderline = (underline: boolean) => updateStyle({ underline })
  const setLinethrough = (linethrough: boolean) => updateStyle({ linethrough })
  const setCharSpacing = (charSpacing: number) => updateStyle({ charSpacing })
  const setLineHeight = (lineHeight: number) => updateStyle({ lineHeight })

  const toggleBold = () => {
    const current = selectedTextObject.value?.fontWeight || currentStyle.value.fontWeight
    updateStyle({ fontWeight: current === 'bold' ? 'normal' : 'bold' })
  }

  const toggleItalic = () => {
    const current = selectedTextObject.value?.fontStyle || currentStyle.value.fontStyle
    updateStyle({ fontStyle: current === 'italic' ? 'normal' : 'italic' })
  }

  const toggleUnderline = () => {
    const current = selectedTextObject.value?.underline ?? currentStyle.value.underline
    updateStyle({ underline: !current })
  }

  const toggleStrikethrough = () => {
    const current = selectedTextObject.value?.linethrough ?? currentStyle.value.linethrough
    updateStyle({ linethrough: !current })
  }

  const getSelectedStyle = (): Partial<TextStyle> => {
    const obj = selectedTextObject.value
    if (!obj) return currentStyle.value
    
    return {
      fontFamily: obj.fontFamily as string,
      fontSize: obj.fontSize as number,
      fontWeight: obj.fontWeight as string | number,
      fontStyle: obj.fontStyle as string,
      fill: obj.fill as string,
      textAlign: obj.textAlign as string,
      underline: obj.underline as boolean,
      linethrough: obj.linethrough as boolean,
      charSpacing: obj.charSpacing as number,
      lineHeight: obj.lineHeight as number
    }
  }

  const enterEditMode = () => {
    if (selectedTextObject.value) {
      selectedTextObject.value.enterEditing()
      canvas.value?.requestRenderAll()
    }
  }

  const exitEditMode = () => {
    if (selectedTextObject.value) {
      selectedTextObject.value.exitEditing()
      canvas.value?.requestRenderAll()
    }
  }

  // Update current style when text selection changes
  watch(selectedTextObject, (obj) => {
    if (obj) {
      currentStyle.value = getSelectedStyle() as TextStyle
    }
  })

  // Track editing state
  watch(() => canvas.value, (c) => {
    if (c) {
      on('text:editing:entered', (e: any) => {
        isEditing.value = true
        editingText.value = e.target
      })
      on('text:editing:exited', () => {
        isEditing.value = false
        editingText.value = null
      })
    }
  }, { immediate: true })

  return {
    isEditing,
    currentStyle,
    selectedTextObject,
    editingText,
    addText,
    addTextbox,
    addHeading,
    updateStyle,
    setFontFamily,
    setFontSize,
    setFontWeight,
    setFontStyle,
    setTextColor,
    setTextAlign,
    setUnderline,
    setLinethrough,
    setCharSpacing,
    setLineHeight,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrikethrough,
    getSelectedStyle,
    enterEditMode,
    exitEditMode
  }
}

export type UseFabricTextReturn = ReturnType<typeof useFabricText>
