import { ref, computed, watch } from 'vue';
import { useCanvasStore } from '../stores/canvas-konva';

/**
 * View culling composable - improves performance by only rendering objects 
 * that are visible in the current viewport
 */
export function useViewCulling() {
  const canvasStore = useCanvasStore();
  
  // Track viewport boundaries (in stage coordinates)
  const viewport = ref({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  
  // A safety margin (in pixels) to prevent popping at edges
  const CULLING_MARGIN = 100;
  
  // Update viewport boundaries based on stage scroll/zoom
  function updateViewport() {
    if (!canvasStore.stageInstance) return;
    
    const stage = canvasStore.stageInstance;
    const scale = stage.scaleX();
    const pos = stage.position();
    
    // Calculate viewport in stage coordinates
    viewport.value = {
      x: -pos.x / scale,
      y: -pos.y / scale,
      width: stage.width() / scale,
      height: stage.height() / scale
    };
  }
  
  // Check if an object is in the current viewport (with margin)
  function isInViewport(obj) {
    if (!obj) return false;
    
    // Skip culling for very small canvases or non-draggable stage (no scroll)
    if (canvasStore.stageInstance && 
        (canvasStore.stageInstance.width() < 800 || 
         canvasStore.stageInstance.height() < 600)) {
      return true;
    }
    
    // Get object bounds
    const x = obj.x();
    const y = obj.y();
    let width = obj.width();
    let height = obj.height();
    
    // Account for scaling
    if (obj.scaleX) {
      width *= obj.scaleX();
      height *= obj.scaleY();
    }
    
    // Add safety margin
    const objBounds = {
      left: x - width/2 - CULLING_MARGIN,
      top: y - height/2 - CULLING_MARGIN,
      right: x + width/2 + CULLING_MARGIN,
      bottom: y + height/2 + CULLING_MARGIN
    };
    
    // Check if object intersects viewport
    return !(objBounds.right < viewport.value.x || 
             objBounds.left > viewport.value.x + viewport.value.width ||
             objBounds.bottom < viewport.value.y || 
             objBounds.top > viewport.value.y + viewport.value.height);
  }
  
  // Apply culling to all objects in the layer
  function cullObjects() {
    if (!canvasStore.layerInstance) return;
    
    updateViewport();
    
    // Skip culling for small canvases
    if (canvasStore.canvasSize.width < 1000 && canvasStore.canvasSize.height < 1000) {
      // Make all objects visible
      canvasStore.layerInstance.children.forEach(obj => {
        if (obj.className !== 'Transformer') {
          obj.visible(true);
        }
      });
      return;
    }
    
    // Apply culling to each object
    canvasStore.layerInstance.children.forEach(obj => {
      // Skip transformer
      if (obj.className === 'Transformer') return;
      
      // Set visibility based on viewport intersection
      obj.visible(isInViewport(obj));
    });
    
    // Always ensure active object is visible
    if (canvasStore.activeObject.value) {
      canvasStore.activeObject.value.visible(true);
    }
    
    // Schedule a draw to update visibility
    canvasStore.scheduleDraw();
  }
  
  // Set up stage event listeners
  function setupCullingEvents() {
    if (!canvasStore.stageInstance) return;
    
    // Update culling on stage events that change the viewport
    canvasStore.stageInstance.on('dragmove', cullObjects);
    canvasStore.stageInstance.on('wheel', cullObjects);
    canvasStore.stageInstance.on('scaleChange', cullObjects);
    
    // Initial culling
    cullObjects();
    
    // Return cleanup function
    return () => {
      if (canvasStore.stageInstance) {
        canvasStore.stageInstance.off('dragmove', cullObjects);
        canvasStore.stageInstance.off('wheel', cullObjects);
        canvasStore.stageInstance.off('scaleChange', cullObjects);
      }
    };
  }
  
  return {
    updateViewport,
    isInViewport,
    cullObjects,
    setupCullingEvents
  };
}
