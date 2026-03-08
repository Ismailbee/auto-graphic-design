import { ref, onMounted } from 'vue';
import { useCanvasStore } from '../stores/canvas-konva';
import { Konva } from '../lib/konva-init.js';
import { trackStage, trackLayer, startMemoryMonitoring, stopMemoryMonitoring } from '../utils/memoryMonitor.js';
import { enhanceTransformer } from '../utils/selectionEnhancer.js';

export function useKonvaCanvas() {
  const stage = ref(null);
  const layer = ref(null);
  const canvasStore = useCanvasStore();

  /**
   * Initialize a Konva stage and layer
   * @param {string|HTMLElement} container - The container element or ID for the stage
   * @param {Object} options - Stage initialization options
   * @returns {Object} - Object containing the initialized stage and layer
   */
  function initCanvas(container, options = {}) {
    if (!container) {
      console.error("initCanvas: No container provided");
      return null;
    }

    // Set default options
    const defaultOptions = {
      width: 1200,
      height: 800
    };

    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Handle both element and ID
    let containerElement;
    if (typeof container === 'string') {
      containerElement = document.getElementById(container);
      if (!containerElement) {
        console.error(`initCanvas: Container element with id '${container}' not found in DOM`);
        return null;
      }
      mergedOptions.container = container;
    } else {
      // If it's an element, set an ID if it doesn't have one
      if (!container.id) {
        container.id = 'konva-canvas-' + Date.now();
      }
      containerElement = container;
      mergedOptions.container = container.id;
    }
    
    console.log("Initializing Konva stage with options:", mergedOptions);
    
    try {
      // Initialize Konva stage
      stage.value = new Konva.Stage(mergedOptions);
      
      // Create a layer to hold all shapes
      layer.value = new Konva.Layer();
      stage.value.add(layer.value);

      // Track for memory monitoring
      trackStage(stage.value);
      trackLayer(layer.value);
      
      // Start memory monitoring in development
      if (import.meta.env.DEV) {
        startMemoryMonitoring(10000); // Check every 10 seconds
      }

      // Set up event handlers
      setupEventHandlers();

      return {
        stage: stage.value,
        layer: layer.value
      };
    } catch (error) {
      console.error("Error initializing Konva canvas:", error);
      return null;
    }
  }

  /**
   * Set up event handlers for the stage and layer
   */
  function setupEventHandlers() {
    if (!stage.value) return;
    
    // Use function references to make cleanup easier
    const canvasStore = useCanvasStore();
    
    // Throttle for click events
    let lastClickTime = 0;
    const CLICK_THROTTLE = 30; // ms - reduced throttle time for more responsive selection

    // Handle selection events
    const handleStageClick = (e) => {
      // Throttle clicks
      const now = Date.now();
      if (now - lastClickTime < CLICK_THROTTLE) return;
      lastClickTime = now;
      
      // If clicked on empty area - clear selection
      if (e.target === stage.value) {
        canvasStore.setActiveObject(null);
        return;
      }
      
      // Handle object selection
      if (e.target !== stage.value) {
        const clickedOnTransformer = e.target.getParent()?.className === 'Transformer';
        if (!clickedOnTransformer) {
          // Ensure the object is selectable
          canvasStore.setActiveObject(e.target);
          // Force redraw to show selection immediately
          layer.value.draw();
        }
      }
    };
    
    // Mouse down for more responsive selection
    const handleMouseDown = (e) => {
      if (e.target !== stage.value) {
        const clickedOnTransformer = e.target.getParent()?.className === 'Transformer';
        if (!clickedOnTransformer) {
          // Quick visual feedback on mousedown
          e.target.shadowEnabled(true);
          e.target.shadowColor('#4f46e5');
          e.target.shadowBlur(10);
          e.target.shadowOpacity(0.3);
          e.target.draw();
        }
      }
    };
    
    // Attach the handlers
    stage.value.on('click tap', handleStageClick);
    stage.value.on('mousedown', handleMouseDown);
    
    // Return handlers for cleanup
    return { handleStageClick, handleMouseDown };
  }

  /**
   * Clean up resources when component is unmounted
   */
  function disposeCanvas() {
    if (stage.value) {
      // Stop memory monitoring
      stopMemoryMonitoring();
      
      // Remove all event handlers
      stage.value.off('click tap');
      stage.value.off('dragstart dragmove dragend');
      stage.value.off('mousedown mouseup mousemove');
      stage.value.off('touchstart touchmove touchend');
      
      // Destroy the stage and reset refs
      stage.value.destroy();
      stage.value = null;
      layer.value = null;
    }
  }

  // Create a transformer for object manipulation
  function createTransformer(attachTo = null) {
    const tr = new Konva.Transformer({
      nodes: attachTo ? [attachTo] : [],
      anchorSize: 10,
      anchorCornerRadius: 4,
      anchorStrokeWidth: 2,
      anchorStroke: '#4f46e5',
      anchorFill: '#ffffff',
      borderStroke: '#4f46e5',
      borderStrokeWidth: 2,
      borderDash: [5, 5],
      borderEnabled: true,
      enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 
                       'bottom-right', 'bottom-center', 'bottom-left', 'middle-left'],
      rotateAnchorOffset: 20,
      rotationSnaps: [],
      padding: 5,
      keepRatio: false,
      boundBoxFunc: (oldBoundBox, newBoundBox) => {
        // Minimum size constraint
        if (newBoundBox.width < 5 || newBoundBox.height < 5) {
          return oldBoundBox;
        }
        return newBoundBox;
      }
    });
    
    // Enhance the transformer with better visual feedback
    enhanceTransformer(tr);
    
    if (attachTo) {
      layer.value.add(tr);
      tr.moveToTop();
      layer.value.draw(); // Force immediate render
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
