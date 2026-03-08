/**
 * Performance monitoring utility for development use
 * This can be used to identify performance bottlenecks in the application
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { getMemoryStats } from './memoryMonitor';

// Performance metrics
const fps = ref(0);
const frameTime = ref(0);
const memoryUsage = ref({});
const isMonitoring = ref(false);

// FPS counter variables
let frameCount = 0;
let lastFpsUpdate = 0;
let fpsUpdateInterval = 1000; // Update FPS every second
let rafId = null;
let lastFrameTime = 0;

/**
 * Start monitoring performance
 */
export function startPerformanceMonitoring() {
  if (isMonitoring.value) return;
  
  isMonitoring.value = true;
  frameCount = 0;
  lastFpsUpdate = performance.now();
  lastFrameTime = performance.now();
  
  // Start RAF loop for FPS counting
  requestAnimationFrame(updateFps);
  
  // Start memory monitoring
  updateMemoryStats();
}

/**
 * Stop performance monitoring
 */
export function stopPerformanceMonitoring() {
  isMonitoring.value = false;
  
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Update FPS counter
 */
function updateFps(timestamp) {
  if (!isMonitoring.value) return;
  
  // Calculate frame time
  const elapsed = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  frameTime.value = elapsed.toFixed(2);
  
  // Increment frame count
  frameCount++;
  
  // Update FPS every second
  if (timestamp - lastFpsUpdate >= fpsUpdateInterval) {
    fps.value = Math.round((frameCount * 1000) / (timestamp - lastFpsUpdate));
    frameCount = 0;
    lastFpsUpdate = timestamp;
    
    // Update memory stats with FPS
    updateMemoryStats();
  }
  
  // Continue loop
  rafId = requestAnimationFrame(updateFps);
}

/**
 * Update memory statistics
 */
function updateMemoryStats() {
  memoryUsage.value = getMemoryStats();
}

/**
 * Vue composable for performance monitoring
 */
export function usePerformanceMonitor(autoStart = false) {
  onMounted(() => {
    if (autoStart) {
      startPerformanceMonitoring();
    }
  });
  
  onUnmounted(() => {
    stopPerformanceMonitoring();
  });
  
  return {
    fps,
    frameTime,
    memoryUsage,
    isMonitoring,
    startMonitoring: startPerformanceMonitoring,
    stopMonitoring: stopPerformanceMonitoring
  };
}

/**
 * Measure execution time of a function
 * @param {Function} fn - Function to measure
 * @param {Array} args - Arguments to pass to the function
 * @returns {Object} - Execution result and timing
 */
export function measureExecutionTime(fn, ...args) {
  if (typeof fn !== 'function') {
    throw new Error('First argument must be a function');
  }
  
  const start = performance.now();
  let result;
  
  try {
    result = fn(...args);
    const end = performance.now();
    const duration = end - start;
    
    return { result, duration, success: true };
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    return { error, duration, success: false };
  }
}

/**
 * Create a performance debug overlay
 */
export function createPerformanceOverlay() {
  if (document.getElementById('performance-overlay')) {
    return;
  }
  
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'performance-overlay';
  overlay.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    pointer-events: none;
    user-select: none;
  `;
  
  // Create FPS display
  const fpsDisplay = document.createElement('div');
  fpsDisplay.id = 'fps-display';
  overlay.appendChild(fpsDisplay);
  
  // Create memory display
  const memoryDisplay = document.createElement('div');
  memoryDisplay.id = 'memory-display';
  overlay.appendChild(memoryDisplay);
  
  // Add to document
  document.body.appendChild(overlay);
  
  // Start monitoring
  startPerformanceMonitoring();
  
  // Update overlay
  function updateOverlay() {
    if (!document.getElementById('performance-overlay')) {
      return;
    }
    
    fpsDisplay.textContent = `FPS: ${fps.value} | Frame: ${frameTime.value}ms`;
    
    const mem = memoryUsage.value;
    memoryDisplay.textContent = `Mem: ${mem.heapSize}MB | Obj: ${mem.objectCount}`;
    
    requestAnimationFrame(updateOverlay);
  }
  
  updateOverlay();
  
  // Return function to remove overlay
  return () => {
    if (document.getElementById('performance-overlay')) {
      document.body.removeChild(overlay);
    }
    stopPerformanceMonitoring();
  };
}

// Export for development use
export const PerformanceMonitor = {
  start: startPerformanceMonitoring,
  stop: stopPerformanceMonitoring,
  showOverlay: createPerformanceOverlay,
  measure: measureExecutionTime,
  getStats: () => ({
    fps: fps.value,
    frameTime: frameTime.value,
    memory: memoryUsage.value
  })
};
