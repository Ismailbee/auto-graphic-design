/**
 * Memory monitoring and optimization utility
 * This helps prevent memory leaks and provides monitoring capabilities
 */

// Weak references to prevent memory leaks
const objectReferences = new Map();
const layerReferences = new Map();
const stageReferences = new Map();

// Counter for objects to identify trends
let objectCount = 0;
let layerCount = 0;

// Track memory usage
let lastMemoryUsage = 0;
let memoryCheckInterval = null;

/**
 * Register a Konva object for tracking
 * @param {Object} obj - The Konva object to track
 * @param {string} type - Object type for categorization
 * @returns {string} - Unique ID for the object
 */
export function trackObject(obj, type = 'generic') {
  if (!obj) return null;
  
  // Generate a tracking ID if not already present
  const trackingId = obj.id() || `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Set ID on object if not already set
  if (!obj.id()) {
    obj.id(trackingId);
  }
  
  // Store weak reference to prevent memory leaks
  objectReferences.set(trackingId, new WeakRef(obj));
  objectCount++;
  
  // Add destroy handler for cleanup
  obj.on('destroy', () => {
    objectReferences.delete(trackingId);
    objectCount--;
  });
  
  return trackingId;
}

/**
 * Register a Konva stage for tracking
 * @param {Object} stage - The Konva stage to track
 * @returns {string} - Unique ID for the stage
 */
export function trackStage(stage) {
  if (!stage) return null;
  
  const stageId = `stage-${Date.now()}`;
  stageReferences.set(stageId, new WeakRef(stage));
  
  return stageId;
}

/**
 * Register a Konva layer for tracking
 * @param {Object} layer - The Konva layer to track
 * @returns {string} - Unique ID for the layer
 */
export function trackLayer(layer) {
  if (!layer) return null;
  
  const layerId = `layer-${Date.now()}`;
  layerReferences.set(layerId, new WeakRef(layer));
  layerCount++;
  
  // Add destroy handler for cleanup
  layer.on('destroy', () => {
    layerReferences.delete(layerId);
    layerCount--;
  });
  
  return layerId;
}

/**
 * Start memory usage monitoring
 * @param {number} interval - Check interval in milliseconds
 */
export function startMemoryMonitoring(interval = 5000) {
  if (memoryCheckInterval) {
    clearInterval(memoryCheckInterval);
  }
  
  memoryCheckInterval = setInterval(() => {
    // Check for memory leaks
    checkMemoryUsage();
    
    // Clean up weak references
    performReferenceCleanup();
  }, interval);
}

/**
 * Stop memory usage monitoring
 */
export function stopMemoryMonitoring() {
  if (memoryCheckInterval) {
    clearInterval(memoryCheckInterval);
    memoryCheckInterval = null;
  }
}

/**
 * Check current memory usage for significant changes
 */
function checkMemoryUsage() {
  // Only available in Chrome/Edge
  if (window.performance && window.performance.memory) {
    const currentUsage = window.performance.memory.usedJSHeapSize;
    const usageMB = Math.round(currentUsage / (1024 * 1024));
    
    // Detect significant increases
    if (lastMemoryUsage > 0) {
      const increase = currentUsage - lastMemoryUsage;
      const percentIncrease = (increase / lastMemoryUsage) * 100;
      
      if (percentIncrease > 20) {
        console.warn(`[Memory Monitor] Significant memory increase detected: ${Math.round(percentIncrease)}% (${usageMB}MB)`);
        console.log(`[Memory Monitor] Current object counts - Objects: ${objectCount}, Layers: ${layerCount}`);
      }
    }
    
    lastMemoryUsage = currentUsage;
  }
}

/**
 * Clean up unreferenced objects
 */
function performReferenceCleanup() {
  // Clean up object references
  for (const [id, ref] of objectReferences.entries()) {
    if (!ref.deref()) {
      objectReferences.delete(id);
      objectCount--;
    }
  }
  
  // Clean up layer references
  for (const [id, ref] of layerReferences.entries()) {
    if (!ref.deref()) {
      layerReferences.delete(id);
      layerCount--;
    }
  }
  
  // Clean up stage references
  for (const [id, ref] of stageReferences.entries()) {
    if (!ref.deref()) {
      stageReferences.delete(id);
    }
  }
}

/**
 * Get current memory statistics
 * @returns {Object} - Memory statistics
 */
export function getMemoryStats() {
  return {
    objectCount,
    layerCount,
    objectReferenceCount: objectReferences.size,
    layerReferenceCount: layerReferences.size,
    stageReferenceCount: stageReferences.size,
    heapSize: window.performance && window.performance.memory ? 
      Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024)) : 'Not available'
  };
}

/**
 * Force garbage collection cleanup (only for debugging)
 */
export function forceCleanup() {
  performReferenceCleanup();
  
  if (window.gc) {
    try {
      window.gc();
    } catch (e) {
      console.log('[Memory Monitor] Manual GC not available');
    }
  }
}
