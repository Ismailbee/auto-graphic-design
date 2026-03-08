/**
 * Fabric.js Canvas Composable
 * 
 * This composable provides functions for initializing and managing Fabric.js canvas
 */

import { fabric } from 'fabric'
import { useCanvasStore } from '../stores/canvas-fabric'

export function useFabricCanvas() {
  const canvasStore = useCanvasStore()
  
  // Initialize Fabric.js canvas
  const initCanvas = (element, options = {}) => {
    try {
      const canvas = new fabric.Canvas(element, {
        width: options.width || 800,
        height: options.height || 600,
        backgroundColor: 'white',
        selection: true,
        preserveObjectStacking: true,
        ...options
      })
      
      // Set up event listeners to sync with store
      canvas.on('selection:created', (e) => {
        console.log('Object selected:', e.target)
        canvasStore.setActiveObject(e.target)
      })
      
      canvas.on('selection:updated', (e) => {
        console.log('Selection updated:', e.target)
        canvasStore.setActiveObject(e.target)
      })
      
      canvas.on('selection:cleared', () => {
        console.log('Selection cleared')
        canvasStore.setActiveObject(null)
      })
      
      canvas.on('object:modified', (e) => {
        console.log('Object modified:', e.target)
        canvasStore.saveState()
      })
      
      canvas.on('object:added', () => {
        canvasStore.saveState()
      })
      
      canvas.on('object:removed', () => {
        canvasStore.saveState()
      })
      
      return canvas
    } catch (error) {
      console.error('Failed to initialize Fabric.js canvas:', error)
      return null
    }
  }

  // Dispose canvas
  const disposeCanvas = (canvas) => {
    if (canvas) {
      canvas.dispose()
    }
  }

  // Add text object
  const addText = (canvas, text, options = {}) => {
    const textObj = new fabric.Text(text, {
      left: options.left || 50,
      top: options.top || 50,
      fontFamily: options.fontFamily || 'Arial',
      fontSize: options.fontSize || 20,
      fill: options.fill || '#000000',
      ...options
    })
    
    canvas.add(textObj)
    canvas.setActiveObject(textObj)
    canvas.renderAll()
    return textObj
  }

  // Add rectangle
  const addRect = (canvas, options = {}) => {
    const rect = new fabric.Rect({
      left: options.left || 50,
      top: options.top || 50,
      width: options.width || 100,
      height: options.height || 100,
      fill: options.fill || '#ff0000',
      ...options
    })
    
    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
    return rect
  }

  // Add circle
  const addCircle = (canvas, options = {}) => {
    const circle = new fabric.Circle({
      left: options.left || 50,
      top: options.top || 50,
      radius: options.radius || 50,
      fill: options.fill || '#00ff00',
      ...options
    })
    
    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
    return circle
  }

  // Add image
  const addImage = (canvas, url, options = {}) => {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(url, (img) => {
        img.set({
          left: options.left || 50,
          top: options.top || 50,
          ...options
        })
        
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
        resolve(img)
      }, {
        crossOrigin: 'anonymous',
        ...options
      })
    })
  }

  return {
    initCanvas,
    disposeCanvas,
    addText,
    addRect,
    addCircle,
    addImage
  }
}