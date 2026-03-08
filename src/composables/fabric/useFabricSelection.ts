/**
 * Fabric.js v6 Selection Composable
 * Handles object selection, multi-selection, and operations
 */

import { ref, computed, shallowRef, watch } from 'vue'
import { FabricObject, ActiveSelection, Group } from 'fabric'
import type { UseFabricCanvasReturn } from './useFabricCanvas'

export function useFabricSelection(canvasComposable: UseFabricCanvasReturn) {
  const { canvas, on } = canvasComposable

  const selectedObjects = shallowRef<FabricObject[]>([])
  const activeObject = shallowRef<FabricObject | null>(null)

  const hasSelection = computed(() => selectedObjects.value.length > 0)
  const selectionCount = computed(() => selectedObjects.value.length)
  const isMultiSelection = computed(() => selectedObjects.value.length > 1)

  const updateSelection = () => {
    if (!canvas.value) {
      selectedObjects.value = []
      activeObject.value = null
      return
    }
    
    const active = canvas.value.getActiveObject()
    activeObject.value = active || null
    
    if (!active) {
      selectedObjects.value = []
    } else if (active instanceof ActiveSelection) {
      selectedObjects.value = active.getObjects()
    } else {
      selectedObjects.value = [active]
    }
  }

  const selectObject = (obj: FabricObject | string) => {
    if (!canvas.value) return
    const target = typeof obj === 'string' 
      ? canvas.value.getObjects().find(o => (o as any).id === obj)
      : obj
    if (target) {
      canvas.value.setActiveObject(target)
      canvas.value.requestRenderAll()
      updateSelection()
    }
  }

  const addToSelection = (obj: FabricObject) => {
    if (!canvas.value) return
    const current = canvas.value.getActiveObject()
    
    if (!current) {
      selectObject(obj)
      return
    }

    if (current instanceof ActiveSelection) {
      current.add(obj)
    } else {
      const selection = new ActiveSelection([current, obj], { canvas: canvas.value })
      canvas.value.setActiveObject(selection)
    }
    canvas.value.requestRenderAll()
    updateSelection()
  }

  const clearSelection = () => {
    if (!canvas.value) return
    canvas.value.discardActiveObject()
    canvas.value.requestRenderAll()
    updateSelection()
  }

  const selectAll = () => {
    if (!canvas.value) return
    const objects = canvas.value.getObjects().filter(o => o.selectable !== false)
    if (objects.length === 0) return
    if (objects.length === 1) {
      selectObject(objects[0])
      return
    }
    const selection = new ActiveSelection(objects, { canvas: canvas.value })
    canvas.value.setActiveObject(selection)
    canvas.value.requestRenderAll()
    updateSelection()
  }

  const deleteSelected = () => {
    if (!canvas.value || !hasSelection.value) return
    const toDelete = [...selectedObjects.value]
    canvas.value.discardActiveObject()
    toDelete.forEach(obj => canvas.value!.remove(obj))
    canvas.value.requestRenderAll()
    updateSelection()
  }

  const duplicateSelected = async () => {
    if (!canvas.value || !hasSelection.value) return
    const active = canvas.value.getActiveObject()
    if (!active) return

    try {
      const cloned = await active.clone()
      cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 })

      if (cloned instanceof ActiveSelection) {
        cloned.canvas = canvas.value
        cloned.getObjects().forEach(obj => canvas.value!.add(obj))
      } else {
        canvas.value.add(cloned)
      }

      canvas.value.setActiveObject(cloned)
      canvas.value.requestRenderAll()
      updateSelection()
    } catch (e) {
      console.error('Failed to duplicate:', e)
    }
  }

  const bringToFront = () => {
    if (!canvas.value || !hasSelection.value) return
    selectedObjects.value.forEach(obj => canvas.value!.bringObjectToFront(obj))
    canvas.value.requestRenderAll()
  }

  const sendToBack = () => {
    if (!canvas.value || !hasSelection.value) return
    selectedObjects.value.forEach(obj => canvas.value!.sendObjectToBack(obj))
    canvas.value.requestRenderAll()
  }

  const bringForward = () => {
    if (!canvas.value || !hasSelection.value) return
    selectedObjects.value.forEach(obj => canvas.value!.bringObjectForward(obj))
    canvas.value.requestRenderAll()
  }

  const sendBackward = () => {
    if (!canvas.value || !hasSelection.value) return
    selectedObjects.value.forEach(obj => canvas.value!.sendObjectBackwards(obj))
    canvas.value.requestRenderAll()
  }

  const flipHorizontal = () => {
    if (!activeObject.value || !canvas.value) return
    activeObject.value.set('flipX', !activeObject.value.flipX)
    canvas.value.requestRenderAll()
  }

  const flipVertical = () => {
    if (!activeObject.value || !canvas.value) return
    activeObject.value.set('flipY', !activeObject.value.flipY)
    canvas.value.requestRenderAll()
  }

  const rotate = (angle: number) => {
    if (!activeObject.value || !canvas.value) return
    activeObject.value.rotate((activeObject.value.angle || 0) + angle)
    canvas.value.requestRenderAll()
  }

  const groupSelected = () => {
    if (!canvas.value || selectedObjects.value.length < 2) return
    const active = canvas.value.getActiveObject()
    if (!(active instanceof ActiveSelection)) return

    const objects = active.getObjects()
    canvas.value.discardActiveObject()
    
    const group = new Group(objects)
    canvas.value.add(group)
    objects.forEach(obj => canvas.value!.remove(obj))
    canvas.value.setActiveObject(group)
    canvas.value.requestRenderAll()
    updateSelection()
  }

  const ungroupSelected = () => {
    if (!canvas.value || !activeObject.value) return
    if (!(activeObject.value instanceof Group)) return

    const group = activeObject.value
    const objects = group.getObjects()
    
    canvas.value.remove(group)
    objects.forEach(obj => canvas.value!.add(obj))

    const selection = new ActiveSelection(objects, { canvas: canvas.value })
    canvas.value.setActiveObject(selection)
    canvas.value.requestRenderAll()
    updateSelection()
  }

  // Setup listeners when canvas is ready
  watch(() => canvas.value, (c) => {
    if (c) {
      on('selection:created', updateSelection)
      on('selection:updated', updateSelection)
      on('selection:cleared', updateSelection)
    }
  }, { immediate: true })

  return {
    selectedObjects, activeObject, hasSelection, selectionCount, isMultiSelection,
    selectObject, addToSelection, clearSelection, selectAll,
    deleteSelected, duplicateSelected,
    bringToFront, sendToBack, bringForward, sendBackward,
    flipHorizontal, flipVertical, rotate,
    groupSelected, ungroupSelected,
    updateSelection
  }
}

export type UseFabricSelectionReturn = ReturnType<typeof useFabricSelection>
