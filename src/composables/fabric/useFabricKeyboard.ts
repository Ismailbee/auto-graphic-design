/**
 * Fabric.js v6 Keyboard Composable
 * Keyboard shortcuts and hotkeys
 */

import { ref, watch, onUnmounted } from 'vue'
import type { UseFabricCanvasReturn } from './useFabricCanvas'
import type { UseFabricSelectionReturn } from './useFabricSelection'
import type { UseFabricHistoryReturn } from './useFabricHistory'
import type { UseFabricTextReturn } from './useFabricText'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: string
  handler: () => void
}

export function useFabricKeyboard(
  canvasComposable: UseFabricCanvasReturn,
  selectionComposable: UseFabricSelectionReturn,
  historyComposable: UseFabricHistoryReturn,
  textComposable: UseFabricTextReturn
) {
  const { canvas, setZoom, zoom, setPan, panX, panY } = canvasComposable
  const { 
    deleteSelected, duplicateSelected, selectAll, clearSelection,
    bringToFront, sendToBack, bringForward, sendBackward,
    activeObject
  } = selectionComposable
  const { undo, redo } = historyComposable
  const { isEditing } = textComposable

  const isEnabled = ref(true)
  const modifiers = ref({ ctrl: false, shift: false, alt: false, meta: false })

  const shortcuts: KeyboardShortcut[] = [
    // History
    { key: 'z', ctrl: true, action: 'Undo', handler: () => undo() },
    { key: 'z', ctrl: true, shift: true, action: 'Redo', handler: () => redo() },
    { key: 'y', ctrl: true, action: 'Redo', handler: () => redo() },
    
    // Selection
    { key: 'a', ctrl: true, action: 'Select All', handler: () => selectAll() },
    { key: 'Escape', action: 'Deselect', handler: () => clearSelection() },
    { key: 'Delete', action: 'Delete', handler: () => deleteSelected() },
    { key: 'Backspace', action: 'Delete', handler: () => deleteSelected() },
    
    // Duplicate
    { key: 'd', ctrl: true, action: 'Duplicate', handler: () => duplicateSelected() },
    
    // Layer order
    { key: ']', ctrl: true, action: 'Bring Forward', handler: () => bringForward() },
    { key: '[', ctrl: true, action: 'Send Backward', handler: () => sendBackward() },
    { key: ']', ctrl: true, shift: true, action: 'Bring to Front', handler: () => bringToFront() },
    { key: '[', ctrl: true, shift: true, action: 'Send to Back', handler: () => sendToBack() },
    
    // Zoom
    { key: '=', ctrl: true, action: 'Zoom In', handler: () => setZoom(zoom.value * 1.2) },
    { key: '+', ctrl: true, action: 'Zoom In', handler: () => setZoom(zoom.value * 1.2) },
    { key: '-', ctrl: true, action: 'Zoom Out', handler: () => setZoom(zoom.value / 1.2) },
    { key: '0', ctrl: true, action: 'Reset Zoom', handler: () => { setZoom(1); setPan(0, 0) } },
    
    // Movement with arrows
    { key: 'ArrowUp', action: 'Move Up', handler: () => moveSelected(0, -1) },
    { key: 'ArrowDown', action: 'Move Down', handler: () => moveSelected(0, 1) },
    { key: 'ArrowLeft', action: 'Move Left', handler: () => moveSelected(-1, 0) },
    { key: 'ArrowRight', action: 'Move Right', handler: () => moveSelected(1, 0) },
    { key: 'ArrowUp', shift: true, action: 'Move Up 10px', handler: () => moveSelected(0, -10) },
    { key: 'ArrowDown', shift: true, action: 'Move Down 10px', handler: () => moveSelected(0, 10) },
    { key: 'ArrowLeft', shift: true, action: 'Move Left 10px', handler: () => moveSelected(-10, 0) },
    { key: 'ArrowRight', shift: true, action: 'Move Right 10px', handler: () => moveSelected(10, 0) },
  ]

  const moveSelected = (dx: number, dy: number) => {
    if (!activeObject.value || !canvas.value) return
    activeObject.value.set({
      left: (activeObject.value.left || 0) + dx,
      top: (activeObject.value.top || 0) + dy
    })
    canvas.value.requestRenderAll()
  }

  const matchesShortcut = (e: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    const key = e.key.toLowerCase() === shortcut.key.toLowerCase() || e.key === shortcut.key
    const ctrl = (shortcut.ctrl ?? false) === (e.ctrlKey || e.metaKey)
    const shift = (shortcut.shift ?? false) === e.shiftKey
    const alt = (shortcut.alt ?? false) === e.altKey
    
    return key && ctrl && shift && alt
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isEnabled.value) return
    
    // Update modifiers
    modifiers.value = {
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey
    }
    
    // Don't handle shortcuts when editing text (except Escape)
    if (isEditing.value && e.key !== 'Escape') return
    
    // Check if typing in input
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }
    
    for (const shortcut of shortcuts) {
      if (matchesShortcut(e, shortcut)) {
        e.preventDefault()
        shortcut.handler()
        return
      }
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    modifiers.value = {
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey
    }
  }

  const setupKeyboardListeners = () => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  }

  const removeKeyboardListeners = () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  }

  const enable = () => { isEnabled.value = true }
  const disable = () => { isEnabled.value = false }

  const addShortcut = (shortcut: KeyboardShortcut) => {
    shortcuts.push(shortcut)
  }

  const removeShortcut = (action: string) => {
    const index = shortcuts.findIndex(s => s.action === action)
    if (index !== -1) shortcuts.splice(index, 1)
  }

  const getShortcutList = () => {
    return shortcuts.map(s => ({
      action: s.action,
      keys: [
        s.ctrl ? 'Ctrl' : '',
        s.shift ? 'Shift' : '',
        s.alt ? 'Alt' : '',
        s.key
      ].filter(Boolean).join(' + ')
    }))
  }

  // Setup on mount
  watch(() => canvas.value, (c) => {
    if (c) {
      setupKeyboardListeners()
    }
  }, { immediate: true })

  onUnmounted(() => {
    removeKeyboardListeners()
  })

  return {
    isEnabled,
    modifiers,
    shortcuts,
    enable,
    disable,
    addShortcut,
    removeShortcut,
    getShortcutList,
    setupKeyboardListeners,
    removeKeyboardListeners
  }
}

export type UseFabricKeyboardReturn = ReturnType<typeof useFabricKeyboard>
