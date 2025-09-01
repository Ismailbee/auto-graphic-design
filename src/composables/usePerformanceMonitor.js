/**
 * Real-time Performance Monitoring Dashboard
 * 
 * Provides live performance metrics and optimization suggestions
 */

import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';

export function usePerformanceMonitor() {
  const isEnabled = ref(false);
  const isVisible = ref(false);
  
  // Performance metrics
  const metrics = reactive({
    fps: 0,
    avgFps: 0,
    memory: {
      used: 0,
      total: 0,
      limit: 0
    },
    renderTime: 0,
    avgRenderTime: 0,
    objectCount: 0,
    layerCount: 0,
    eventListeners: 0,
    lastUpdate: Date.now()
  });
  
  // Performance history for charts
  const fpsHistory = ref([]);
  const memoryHistory = ref([]);
  const renderTimeHistory = ref([]);
  
  // Performance warnings and suggestions
  const warnings = ref([]);
  const suggestions = ref([]);
  
  // Monitoring intervals
  let fpsMonitor = null;
  let memoryMonitor = null;
  let performanceAnalyzer = null;
  
  // FPS calculation
  let frameCount = 0;
  let lastTime = performance.now();
  let fpsSum = 0;
  let fpsReadings = 0;
  
  const maxHistoryLength = 60; // Keep 60 data points
  
  /**
   * Start performance monitoring
   */
  function startMonitoring() {
    if (isEnabled.value) return;
    
    isEnabled.value = true;
    console.log('🔍 Performance Monitor Started');
    
    // FPS monitoring
    fpsMonitor = requestAnimationFrame(measureFPS);
    
    // Memory monitoring (every 2 seconds)
    memoryMonitor = setInterval(measureMemory, 2000);
    
    // Performance analysis (every 5 seconds)
    performanceAnalyzer = setInterval(analyzePerformance, 5000);
    
    // Initial measurements
    measureMemory();
    measureObjectCounts();
  }
  
  /**
   * Stop performance monitoring
   */
  function stopMonitoring() {
    if (!isEnabled.value) return;
    
    isEnabled.value = false;
    console.log('🛑 Performance Monitor Stopped');
    
    // Clear intervals
    if (fpsMonitor) {
      cancelAnimationFrame(fpsMonitor);
      fpsMonitor = null;
    }
    
    if (memoryMonitor) {
      clearInterval(memoryMonitor);
      memoryMonitor = null;
    }
    
    if (performanceAnalyzer) {
      clearInterval(performanceAnalyzer);
      performanceAnalyzer = null;
    }
    
    // Reset data
    resetMetrics();
  }
  
  /**
   * Toggle monitor visibility
   */
  function toggleVisibility() {
    isVisible.value = !isVisible.value;
  }
  
  /**
   * Measure FPS
   */
  function measureFPS() {
    if (!isEnabled.value) return;
    
    const now = performance.now();
    const delta = now - lastTime;
    
    if (delta >= 1000) { // Calculate FPS every second
      const currentFps = Math.round((frameCount * 1000) / delta);
      
      metrics.fps = currentFps;
      fpsSum += currentFps;
      fpsReadings++;
      metrics.avgFps = Math.round(fpsSum / fpsReadings);
      
      // Add to history
      fpsHistory.value.push({
        time: now,
        value: currentFps
      });
      
      // Keep history length manageable
      if (fpsHistory.value.length > maxHistoryLength) {
        fpsHistory.value.shift();
      }
      
      frameCount = 0;
      lastTime = now;
    } else {
      frameCount++;
    }
    
    fpsMonitor = requestAnimationFrame(measureFPS);
  }
  
  /**
   * Measure memory usage
   */
  function measureMemory() {
    if (!isEnabled.value) return;
    
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      
      metrics.memory = {
        used: Math.round(memory.usedJSHeapSize / (1024 * 1024)), // MB
        total: Math.round(memory.totalJSHeapSize / (1024 * 1024)), // MB
        limit: Math.round(memory.jsHeapSizeLimit / (1024 * 1024)) // MB
      };
      
      // Add to history
      memoryHistory.value.push({
        time: Date.now(),
        value: metrics.memory.used
      });
      
      // Keep history length manageable
      if (memoryHistory.value.length > maxHistoryLength) {
        memoryHistory.value.shift();
      }
    }
  }\n  \n  /**\n   * Measure object and layer counts\n   */\n  function measureObjectCounts() {\n    // This would integrate with your canvas store\n    // For now, we'll use placeholder values\n    metrics.objectCount = 0;\n    metrics.layerCount = 0;\n    metrics.eventListeners = 0;\n    \n    // You can integrate this with your actual canvas store:\n    // const canvasStore = useCanvasStore();\n    // metrics.objectCount = canvasStore.totalObjects;\n    // metrics.layerCount = canvasStore.layers.length;\n  }\n  \n  /**\n   * Measure render time for operations\n   */\n  function measureRenderTime(operation) {\n    const startTime = performance.now();\n    \n    return {\n      end: () => {\n        const endTime = performance.now();\n        const renderTime = endTime - startTime;\n        \n        metrics.renderTime = renderTime;\n        \n        // Calculate average\n        if (!metrics.avgRenderTime) {\n          metrics.avgRenderTime = renderTime;\n        } else {\n          metrics.avgRenderTime = (metrics.avgRenderTime * 0.9) + (renderTime * 0.1);\n        }\n        \n        // Add to history\n        renderTimeHistory.value.push({\n          time: Date.now(),\n          value: renderTime,\n          operation\n        });\n        \n        if (renderTimeHistory.value.length > maxHistoryLength) {\n          renderTimeHistory.value.shift();\n        }\n        \n        return renderTime;\n      }\n    };\n  }\n  \n  /**\n   * Analyze performance and generate warnings/suggestions\n   */\n  function analyzePerformance() {\n    if (!isEnabled.value) return;\n    \n    warnings.value = [];\n    suggestions.value = [];\n    \n    // FPS warnings\n    if (metrics.fps < 30) {\n      warnings.value.push({\n        type: 'fps',\n        level: 'high',\n        message: `Low FPS detected: ${metrics.fps} fps`,\n        time: Date.now()\n      });\n      \n      suggestions.value.push({\n        category: 'performance',\n        message: 'Consider reducing object count or enabling object culling',\n        priority: 'high'\n      });\n    } else if (metrics.fps < 45) {\n      warnings.value.push({\n        type: 'fps',\n        level: 'medium',\n        message: `Moderate FPS: ${metrics.fps} fps`,\n        time: Date.now()\n      });\n    }\n    \n    // Memory warnings\n    const memoryUsagePercent = (metrics.memory.used / metrics.memory.limit) * 100;\n    \n    if (memoryUsagePercent > 80) {\n      warnings.value.push({\n        type: 'memory',\n        level: 'high',\n        message: `High memory usage: ${memoryUsagePercent.toFixed(1)}%`,\n        time: Date.now()\n      });\n      \n      suggestions.value.push({\n        category: 'memory',\n        message: 'Consider implementing object pooling or garbage collection optimization',\n        priority: 'high'\n      });\n    } else if (memoryUsagePercent > 60) {\n      warnings.value.push({\n        type: 'memory',\n        level: 'medium',\n        message: `Moderate memory usage: ${memoryUsagePercent.toFixed(1)}%`,\n        time: Date.now()\n      });\n    }\n    \n    // Render time warnings\n    if (metrics.avgRenderTime > 16.67) { // 60fps = 16.67ms per frame\n      warnings.value.push({\n        type: 'render',\n        level: 'medium',\n        message: `Slow render time: ${metrics.avgRenderTime.toFixed(2)}ms`,\n        time: Date.now()\n      });\n      \n      suggestions.value.push({\n        category: 'rendering',\n        message: 'Consider using batch drawing or reducing visual effects',\n        priority: 'medium'\n      });\n    }\n    \n    // Object count warnings\n    if (metrics.objectCount > 500) {\n      warnings.value.push({\n        type: 'objects',\n        level: 'medium',\n        message: `High object count: ${metrics.objectCount}`,\n        time: Date.now()\n      });\n      \n      suggestions.value.push({\n        category: 'optimization',\n        message: 'Consider implementing view culling for better performance',\n        priority: 'medium'\n      });\n    }\n    \n    metrics.lastUpdate = Date.now();\n  }\n  \n  /**\n   * Reset all metrics\n   */\n  function resetMetrics() {\n    Object.assign(metrics, {\n      fps: 0,\n      avgFps: 0,\n      memory: { used: 0, total: 0, limit: 0 },\n      renderTime: 0,\n      avgRenderTime: 0,\n      objectCount: 0,\n      layerCount: 0,\n      eventListeners: 0,\n      lastUpdate: Date.now()\n    });\n    \n    fpsHistory.value = [];\n    memoryHistory.value = [];\n    renderTimeHistory.value = [];\n    warnings.value = [];\n    suggestions.value = [];\n    \n    frameCount = 0;\n    fpsSum = 0;\n    fpsReadings = 0;\n  }\n  \n  /**\n   * Get performance score (0-100)\n   */\n  const performanceScore = computed(() => {\n    let score = 100;\n    \n    // FPS impact\n    if (metrics.fps < 30) score -= 30;\n    else if (metrics.fps < 45) score -= 15;\n    else if (metrics.fps < 55) score -= 5;\n    \n    // Memory impact\n    const memoryUsagePercent = (metrics.memory.used / metrics.memory.limit) * 100;\n    if (memoryUsagePercent > 80) score -= 25;\n    else if (memoryUsagePercent > 60) score -= 10;\n    else if (memoryUsagePercent > 40) score -= 5;\n    \n    // Render time impact\n    if (metrics.avgRenderTime > 33) score -= 20; // 30fps\n    else if (metrics.avgRenderTime > 16.67) score -= 10; // 60fps\n    \n    return Math.max(0, Math.min(100, score));\n  });\n  \n  /**\n   * Export performance report\n   */\n  function exportReport() {\n    const report = {\n      timestamp: new Date().toISOString(),\n      metrics: { ...metrics },\n      history: {\n        fps: [...fpsHistory.value],\n        memory: [...memoryHistory.value],\n        renderTime: [...renderTimeHistory.value]\n      },\n      warnings: [...warnings.value],\n      suggestions: [...suggestions.value],\n      score: performanceScore.value\n    };\n    \n    const blob = new Blob([JSON.stringify(report, null, 2)], {\n      type: 'application/json'\n    });\n    \n    const url = URL.createObjectURL(blob);\n    const a = document.createElement('a');\n    a.href = url;\n    a.download = `performance-report-${Date.now()}.json`;\n    a.click();\n    \n    URL.revokeObjectURL(url);\n  }\n  \n  // Lifecycle\n  onMounted(() => {\n    // Auto-start in development mode\n    if (import.meta.env.DEV) {\n      console.log('🔧 Performance Monitor available in development mode');\n    }\n  });\n  \n  onUnmounted(() => {\n    stopMonitoring();\n  });\n  \n  return {\n    // State\n    isEnabled,\n    isVisible,\n    metrics,\n    fpsHistory,\n    memoryHistory,\n    renderTimeHistory,\n    warnings,\n    suggestions,\n    performanceScore,\n    \n    // Methods\n    startMonitoring,\n    stopMonitoring,\n    toggleVisibility,\n    measureRenderTime,\n    measureObjectCounts,\n    resetMetrics,\n    exportReport\n  };\n}
