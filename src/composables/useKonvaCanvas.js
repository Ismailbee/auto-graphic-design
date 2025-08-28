import { ref, onMounted } from 'vue';
import { useCanvasStore } from '@/stores/canvas-konva';
import { Konva } from '../lib/konva-init.js';

export function useKonvaCanvas() {
  const stage = ref(null);
  const layer = ref(null);
  const canvasStore = useCanvasStore();

  /**
   * Initialize a Konva stage and layer
   * @param {string} containerId - The ID of the container element for the stage
   * @param {Object} options - Stage initialization options
   * @returns {Object} - Object containing the initialized stage and layer
   */
  function initCanvas(containerId, options = {}) {
    if (!containerId) return null;

    // Set default options
    const defaultOptions = {
      width: 1200,
      height: 800,
      container: containerId
    };

    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Initialize Konva stage
    stage.value = new Konva.Stage(mergedOptions);
    
    // Create a layer to hold all shapes
    layer.value = new Konva.Layer();
    stage.value.add(layer.value);

    // Set up event handlers
    setupEventHandlers();

    return {
      stage: stage.value,
      layer: layer.value
    };
  }

  /**
   * Set up event handlers for the stage and layer
   */
  function setupEventHandlers() {
    if (!stage.value) return;

    // Handle selection events
    stage.value.on('click tap', (e) => {
      // If clicked on empty area - clear selection
      if (e.target === stage.value) {
        canvasStore.setActiveObject(null);
        return;
      }
      
      // Handle object selection
      if (e.target !== stage.value) {
        const clickedOnTransformer = e.target.getParent()?.className === 'Transformer';
        if (!clickedOnTransformer) {
          canvasStore.setActiveObject(e.target);
        }
      }
    });

    // Handle keyboard events
    document.addEventListener('keydown', handleKeyDown);
  }

  /**
   * Handle keyboard events
   */
  function handleKeyDown(e) {
    if (!stage.value) return;

    // If user is typing in an input, don't handle shortcuts
    const target = e.target;
    const isInput = target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || 
                   target.isContentEditable;
    if (isInput) return;

    // Delete selected object with Delete key
    if (e.key === 'Delete') {
      const activeObject = canvasStore.activeObject;
      if (activeObject) {
        activeObject.destroy();
        layer.value.draw();
        canvasStore.setActiveObject(null);
        canvasStore.saveState();
      }
    }

    // Copy with Ctrl+C
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      const activeObject = canvasStore.activeObject;
      if (activeObject) {
        try {
          // Store a clone of the object
          const clone = activeObject.clone();
          stage.value._clipboard = clone;
        } catch (err) {
          console.warn('Copy failed', err);
        }
      }
    }

    // Paste with Ctrl+V
    if (e.ctrlKey && e.key.toLowerCase() === 'v') {
      if (stage.value._clipboard) {
        try {
          const clone = stage.value._clipboard.clone();
          clone.x(clone.x() + 20);
          clone.y(clone.y() + 20);
          clone.draggable(true);
          
          // Add the cloned object to the layer
          layer.value.add(clone);
          layer.value.draw();
          
          // Select the pasted object
          canvasStore.setActiveObject(clone);
          canvasStore.saveState();
        } catch (err) {
          console.warn('Paste failed', err);
        }
      }
    }
  }

  /**
   * Clean up resources when component is unmounted
   */
  function disposeCanvas() {
    if (stage.value) {
      stage.value.destroy();
      document.removeEventListener('keydown', handleKeyDown);
    }
  }

  // Create a transformer for object manipulation
  function createTransformer(attachTo = null) {
    const tr = new Konva.Transformer({
      nodes: attachTo ? [attachTo] : [],
      anchorSize: 8,
      anchorCornerRadius: 4,
      anchorStrokeWidth: 2,
      anchorStroke: '#4f46e5',
      anchorFill: '#ffffff',
      borderStroke: '#4f46e5',
      borderStrokeWidth: 2,
      borderDash: [],
      rotateAnchorOffset: 20,
      rotationSnaps: [],
      boundBoxFunc: (oldBoundBox, newBoundBox) => {
        // Minimum size constraint
        if (newBoundBox.width < 5 || newBoundBox.height < 5) {
          return oldBoundBox;
        }
        return newBoundBox;
      }
    });
    
    if (attachTo) {
      layer.value.add(tr);
      tr.moveToTop();
    }
    
    return tr;
  }

  return {
    stage,
    layer,
    initCanvas,
    disposeCanvas,
    createTransformer
  };
}
