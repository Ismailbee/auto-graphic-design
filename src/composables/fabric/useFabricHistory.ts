/**
 * Fabric.js v6 History Composable
 * Undo/Redo functionality with state management
 */

import { ref, computed, watch } from 'vue'
import type { Canvas, FabricObject } from 'fabric'
import type { UseFabricCanvasReturn } from './useFabricCanvas'

interface HistoryState {
  json: string
  timestamp: number
}

export function useFabricHistory(canvasComposable: UseFabricCanvasReturn, maxStates = 50) {
  const { canvas, on } = canvasComposable

  const undoStack = ref<HistoryState[]>([])
  const redoStack = ref<HistoryState[]>([])
  const isRecording = ref(true)
  const isProcessing = ref(false)
  const lastSavedState = ref<string>('')

  const canUndo = computed(() => undoStack.value.length > 1)
  const canRedo = computed(() => redoStack.value.length > 0)
  const hasUnsavedChanges = computed(() => {
    if (undoStack.value.length === 0) return false
    return undoStack.value[undoStack.value.length - 1].json !== lastSavedState.value
  })

  const getStateJSON = (): string => {
    if (!canvas.value) return '{}'
    // In Fabric v6, use toObject with propertiesToInclude
    const obj = canvas.value.toObject(['id', 'name', 'selectable', 'evented', 'locked'])
    return JSON.stringify(obj)
  }

  const saveState = (force = false) => {
    if (!canvas.value || (!isRecording.value && !force) || isProcessing.value) return
    
    const json = getStateJSON()
    
    // Skip if state unchanged
    if (undoStack.value.length > 0 && undoStack.value[undoStack.value.length - 1].json === json) {
      return
    }

    undoStack.value.push({ json, timestamp: Date.now() })
    
    // Limit stack size
    if (undoStack.value.length > maxStates) {
      undoStack.value.shift()
    }
    
    // Clear redo on new action
    redoStack.value = []
  }

  const restoreState = async (json: string) => {
    if (!canvas.value) return
    
    isProcessing.value = true
    try {
      await canvas.value.loadFromJSON(json)
      canvas.value.requestRenderAll()
    } catch (e) {
      console.error('Failed to restore state:', e)
    } finally {
      isProcessing.value = false
    }
  }

  const undo = async () => {
    if (!canUndo.value || isProcessing.value) return
    
    // Current state goes to redo
    const current = undoStack.value.pop()
    if (current) redoStack.value.push(current)
    
    // Restore previous state
    const prev = undoStack.value[undoStack.value.length - 1]
    if (prev) {
      await restoreState(prev.json)
    }
  }

  const redo = async () => {
    if (!canRedo.value || isProcessing.value) return
    
    const state = redoStack.value.pop()
    if (state) {
      undoStack.value.push(state)
      await restoreState(state.json)
    }
  }

  const clearHistory = () => {
    undoStack.value = []
    redoStack.value = []
    saveState(true)
  }

  const markSaved = () => {
    lastSavedState.value = getStateJSON()
  }

  const pauseRecording = () => { isRecording.value = false }
  const resumeRecording = () => { isRecording.value = true }

  const withoutRecording = async <T>(fn: () => Promise<T> | T): Promise<T> => {
    pauseRecording()
    try {
      return await fn()
    } finally {
      resumeRecording()
    }
  }

  // Debounced save for object modifications
  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  const debouncedSave = () => {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => saveState(), 100)
  }

  // Setup canvas event listeners
  watch(() => canvas.value, (c) => {
    if (c) {
      // Save initial state
      saveState(true)
      
      // Track changes
      on('object:added', debouncedSave)
      on('object:removed', debouncedSave)
      on('object:modified', debouncedSave)
    }
  }, { immediate: true })

  return {
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    hasUnsavedChanges,
    isRecording,
    isProcessing,
    undo,
    redo,
    saveState,
    clearHistory,
    markSaved,
    pauseRecording,
    resumeRecording,
    withoutRecording
  }
}

export type UseFabricHistoryReturn = ReturnType<typeof useFabricHistory>
