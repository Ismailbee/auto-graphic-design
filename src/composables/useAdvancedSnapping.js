/**
 * Advanced Snapping and Alignment System
 * 
 * Provides smart snapping to objects, grid, guides, and canvas edges
 */

import { ref, computed } from 'vue';
import { Konva } from '../lib/konva-init.js';

export function useSnapping(stage, layer) {
  const snapEnabled = ref(true);
  const snapToObjects = ref(true);
  const snapToGrid = ref(true);
  const snapToGuides = ref(true);
  const snapToCanvas = ref(true);
  const snapThreshold = ref(5);
  
  // Guide lines
  const guides = ref([]);
  const temporaryGuides = ref([]);
  
  // Snap indicators
  let snapIndicators = null;
  
  /**
   * Smart snap calculation for object positioning
   * @param {Object} targetObject - The object being moved
   * @param {Object} targetRect - The target position/size rect
   * @param {Array} otherObjects - Other objects to snap to
   * @returns {Object} - Snapped position and snap lines
   */
  function calculateSnap(targetObject, targetRect, otherObjects = []) {
    if (!snapEnabled.value) {
      return { x: targetRect.x, y: targetRect.y, snapLines: [] };
    }
    
    const snapLines = [];
    let snappedX = targetRect.x;
    let snappedY = targetRect.y;
    let hasSnappedX = false;
    let hasSnappedY = false;
    
    const threshold = snapThreshold.value;
    
    // Snap to grid
    if (snapToGrid.value) {
      const gridSize = 20; // Get from canvas store
      const gridSnapX = Math.round(targetRect.x / gridSize) * gridSize;
      const gridSnapY = Math.round(targetRect.y / gridSize) * gridSize;
      
      if (Math.abs(targetRect.x - gridSnapX) <= threshold && !hasSnappedX) {
        snappedX = gridSnapX;
        hasSnappedX = true;
      }
      
      if (Math.abs(targetRect.y - gridSnapY) <= threshold && !hasSnappedY) {
        snappedY = gridSnapY;
        hasSnappedY = true;
      }
    }
    
    // Snap to canvas edges and center
    if (snapToCanvas.value && stage.value) {
      const stageWidth = stage.value.width();
      const stageHeight = stage.value.height();
      
      // Canvas edges
      const canvasSnapPoints = {
        x: [0, stageWidth / 2, stageWidth],
        y: [0, stageHeight / 2, stageHeight]
      };
      
      // Object edges and center for snapping
      const objSnapPoints = {
        x: [targetRect.x, targetRect.x + targetRect.width / 2, targetRect.x + targetRect.width],
        y: [targetRect.y, targetRect.y + targetRect.height / 2, targetRect.y + targetRect.height]
      };
      
      // Check X snaps
      if (!hasSnappedX) {
        for (const canvasX of canvasSnapPoints.x) {
          for (let i = 0; i < objSnapPoints.x.length; i++) {
            const objX = objSnapPoints.x[i];
            const offset = objX - targetRect.x;
            const snapX = canvasX - offset;
            
            if (Math.abs(objX - canvasX) <= threshold) {
              snappedX = snapX;
              hasSnappedX = true;
              
              snapLines.push({
                type: 'vertical',
                position: canvasX,
                color: '#ff4444',
                full: true
              });
              break;
            }
          }
          if (hasSnappedX) break;
        }
      }
      
      // Check Y snaps
      if (!hasSnappedY) {
        for (const canvasY of canvasSnapPoints.y) {
          for (let i = 0; i < objSnapPoints.y.length; i++) {
            const objY = objSnapPoints.y[i];
            const offset = objY - targetRect.y;
            const snapY = canvasY - offset;
            
            if (Math.abs(objY - canvasY) <= threshold) {
              snappedY = snapY;
              hasSnappedY = true;
              
              snapLines.push({
                type: 'horizontal',
                position: canvasY,
                color: '#ff4444',
                full: true
              });
              break;
            }
          }
          if (hasSnappedY) break;
        }
      }
    }
    
    // Snap to other objects
    if (snapToObjects.value && otherObjects.length > 0) {
      const snapResult = snapToOtherObjects(targetRect, otherObjects, threshold, hasSnappedX, hasSnappedY);
      
      if (snapResult.snappedX !== null) {
        snappedX = snapResult.snappedX;
        hasSnappedX = true;
      }
      
      if (snapResult.snappedY !== null) {
        snappedY = snapResult.snappedY;
        hasSnappedY = true;
      }
      
      snapLines.push(...snapResult.snapLines);
    }
    
    // Snap to custom guides
    if (snapToGuides.value && guides.value.length > 0) {
      const guideSnapResult = snapToCustomGuides(targetRect, guides.value, threshold, hasSnappedX, hasSnappedY);
      
      if (guideSnapResult.snappedX !== null) {
        snappedX = guideSnapResult.snappedX;
      }
      
      if (guideSnapResult.snappedY !== null) {
        snappedY = guideSnapResult.snappedY;
      }
      
      snapLines.push(...guideSnapResult.snapLines);
    }
    
    return {
      x: snappedX,
      y: snappedY,
      snapLines,
      hasSnapped: hasSnappedX || hasSnappedY
    };
  }
  
  /**
   * Snap to other objects (edges, centers, spacing)
   */
  function snapToOtherObjects(targetRect, otherObjects, threshold, hasSnappedX, hasSnappedY) {
    const snapLines = [];
    let snappedX = null;
    let snappedY = null;
    
    for (const obj of otherObjects) {
      const objRect = obj.getClientRect();
      
      // Object snap points (edges and center)
      const objSnapPoints = {
        x: [objRect.x, objRect.x + objRect.width / 2, objRect.x + objRect.width],
        y: [objRect.y, objRect.y + objRect.height / 2, objRect.y + objRect.height]
      };
      
      const targetSnapPoints = {
        x: [targetRect.x, targetRect.x + targetRect.width / 2, targetRect.x + targetRect.width],
        y: [targetRect.y, targetRect.y + targetRect.height / 2, targetRect.y + targetRect.height]
      };
      
      // Check X alignment
      if (!hasSnappedX && snappedX === null) {
        for (const objX of objSnapPoints.x) {
          for (let i = 0; i < targetSnapPoints.x.length; i++) {
            const targetX = targetSnapPoints.x[i];
            const offset = targetX - targetRect.x;
            const snapX = objX - offset;
            
            if (Math.abs(targetX - objX) <= threshold) {
              snappedX = snapX;
              
              snapLines.push({
                type: 'vertical',
                position: objX,
                color: '#00ff00',
                start: Math.min(objRect.y, targetRect.y) - 20,
                end: Math.max(objRect.y + objRect.height, targetRect.y + targetRect.height) + 20
              });
              break;
            }
          }
          if (snappedX !== null) break;
        }
      }
      
      // Check Y alignment
      if (!hasSnappedY && snappedY === null) {
        for (const objY of objSnapPoints.y) {
          for (let i = 0; i < targetSnapPoints.y.length; i++) {
            const targetY = targetSnapPoints.y[i];
            const offset = targetY - targetRect.y;
            const snapY = objY - offset;
            
            if (Math.abs(targetY - objY) <= threshold) {
              snappedY = snapY;
              
              snapLines.push({
                type: 'horizontal',
                position: objY,
                color: '#00ff00',
                start: Math.min(objRect.x, targetRect.x) - 20,
                end: Math.max(objRect.x + objRect.width, targetRect.x + targetRect.width) + 20
              });
              break;
            }
          }
          if (snappedY !== null) break;
        }
      }
      
      // Equal spacing detection
      if (otherObjects.length >= 2) {
        const spacingSnap = detectEqualSpacing(targetRect, otherObjects, threshold);
        if (spacingSnap.snappedX !== null && snappedX === null) {
          snappedX = spacingSnap.snappedX;
          snapLines.push(...spacingSnap.snapLines);
        }
        if (spacingSnap.snappedY !== null && snappedY === null) {
          snappedY = spacingSnap.snappedY;
          snapLines.push(...spacingSnap.snapLines);
        }
      }
    }
    
    return { snappedX, snappedY, snapLines };
  }
  
  /**
   * Detect equal spacing between objects
   */
  function detectEqualSpacing(targetRect, otherObjects, threshold) {
    const snapLines = [];
    let snappedX = null;
    let snappedY = null;
    
    // Sort objects by position for spacing calculation
    const sortedByX = [...otherObjects].sort((a, b) => a.getClientRect().x - b.getClientRect().x);
    const sortedByY = [...otherObjects].sort((a, b) => a.getClientRect().y - b.getClientRect().y);
    
    // Check for equal horizontal spacing
    if (sortedByX.length >= 2) {
      const spacings = [];
      for (let i = 1; i < sortedByX.length; i++) {
        const prev = sortedByX[i - 1].getClientRect();
        const curr = sortedByX[i].getClientRect();
        spacings.push(curr.x - (prev.x + prev.width));
      }
      
      // Find most common spacing
      const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
      
      // Try to place target object with equal spacing
      for (let i = 0; i < sortedByX.length; i++) {
        const objRect = sortedByX[i].getClientRect();
        
        // Before this object
        const beforeX = objRect.x - avgSpacing - targetRect.width;
        if (Math.abs(targetRect.x - beforeX) <= threshold) {
          snappedX = beforeX;
          snapLines.push({
            type: 'spacing',
            direction: 'horizontal',
            objects: [targetRect, objRect],
            spacing: avgSpacing,
            color: '#00aaff'
          });
          break;
        }
        
        // After this object
        const afterX = objRect.x + objRect.width + avgSpacing;
        if (Math.abs(targetRect.x - afterX) <= threshold) {
          snappedX = afterX;
          snapLines.push({
            type: 'spacing',
            direction: 'horizontal',
            objects: [objRect, targetRect],
            spacing: avgSpacing,
            color: '#00aaff'
          });
          break;
        }
      }
    }
    
    // Similar logic for vertical spacing
    if (sortedByY.length >= 2) {
      const spacings = [];
      for (let i = 1; i < sortedByY.length; i++) {
        const prev = sortedByY[i - 1].getClientRect();
        const curr = sortedByY[i].getClientRect();
        spacings.push(curr.y - (prev.y + prev.height));
      }
      
      const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
      
      for (let i = 0; i < sortedByY.length; i++) {
        const objRect = sortedByY[i].getClientRect();
        
        const beforeY = objRect.y - avgSpacing - targetRect.height;
        if (Math.abs(targetRect.y - beforeY) <= threshold) {
          snappedY = beforeY;
          snapLines.push({
            type: 'spacing',
            direction: 'vertical',
            objects: [targetRect, objRect],
            spacing: avgSpacing,
            color: '#00aaff'
          });
          break;
        }
        
        const afterY = objRect.y + objRect.height + avgSpacing;
        if (Math.abs(targetRect.y - afterY) <= threshold) {
          snappedY = afterY;
          snapLines.push({
            type: 'spacing',
            direction: 'vertical',
            objects: [objRect, targetRect],
            spacing: avgSpacing,
            color: '#00aaff'
          });
          break;
        }
      }
    }
    
    return { snappedX, snappedY, snapLines };
  }
  
  /**
   * Snap to custom guides
   */
  function snapToCustomGuides(targetRect, guides, threshold, hasSnappedX, hasSnappedY) {
    const snapLines = [];
    let snappedX = null;
    let snappedY = null;
    
    for (const guide of guides) {
      if (guide.type === 'vertical' && !hasSnappedX && snappedX === null) {
        if (Math.abs(targetRect.x - guide.position) <= threshold) {
          snappedX = guide.position;
          snapLines.push({
            type: 'vertical',
            position: guide.position,
            color: '#ff00ff',
            full: true
          });
        }
      }
      
      if (guide.type === 'horizontal' && !hasSnappedY && snappedY === null) {
        if (Math.abs(targetRect.y - guide.position) <= threshold) {
          snappedY = guide.position;
          snapLines.push({
            type: 'horizontal',
            position: guide.position,
            color: '#ff00ff',
            full: true
          });
        }
      }
    }
    
    return { snappedX, snappedY, snapLines };
  }
  
  /**
   * Display snap indicators on the canvas
   */
  function showSnapIndicators(snapLines) {
    hideSnapIndicators();
    
    if (!layer.value || snapLines.length === 0) return;
    
    snapIndicators = new Konva.Group({
      listening: false
    });
    
    snapLines.forEach(snapLine => {
      if (snapLine.type === 'vertical') {
        const line = new Konva.Line({
          points: [
            snapLine.position, 
            snapLine.full ? 0 : (snapLine.start || 0),
            snapLine.position, 
            snapLine.full ? stage.value.height() : (snapLine.end || stage.value.height())
          ],
          stroke: snapLine.color || '#ff0000',
          strokeWidth: 1,
          dash: [4, 4],
          opacity: 0.8,
          listening: false
        });
        snapIndicators.add(line);
      } else if (snapLine.type === 'horizontal') {
        const line = new Konva.Line({
          points: [
            snapLine.full ? 0 : (snapLine.start || 0),
            snapLine.position,
            snapLine.full ? stage.value.width() : (snapLine.end || stage.value.width()),
            snapLine.position
          ],
          stroke: snapLine.color || '#ff0000',
          strokeWidth: 1,
          dash: [4, 4],
          opacity: 0.8,
          listening: false
        });
        snapIndicators.add(line);
      } else if (snapLine.type === 'spacing') {
        // Draw spacing indicators
        const { objects, spacing, direction, color } = snapLine;
        
        if (direction === 'horizontal' && objects.length >= 2) {
          const obj1 = objects[0];
          const obj2 = objects[1];
          const y = Math.max(obj1.y, obj2.y) + Math.max(obj1.height || 0, obj2.height || 0) + 10;
          
          // Double arrow line
          const line = new Konva.Line({
            points: [obj1.x + (obj1.width || 0), y, obj2.x, y],
            stroke: color,
            strokeWidth: 1,
            listening: false
          });
          snapIndicators.add(line);
          
          // Spacing text
          const text = new Konva.Text({
            x: (obj1.x + (obj1.width || 0) + obj2.x) / 2 - 15,
            y: y - 8,
            text: `${Math.round(spacing)}px`,
            fontSize: 12,
            fill: color,
            listening: false
          });
          snapIndicators.add(text);
        }
      }
    });
    
    layer.value.add(snapIndicators);
    snapIndicators.moveToTop();
    layer.value.batchDraw();
  }
  
  /**
   * Hide snap indicators
   */
  function hideSnapIndicators() {
    if (snapIndicators) {
      snapIndicators.destroy();
      snapIndicators = null;
      layer.value?.batchDraw();
    }
  }
  
  /**
   * Add a custom guide
   */
  function addGuide(type, position) {
    guides.value.push({ type, position, id: Date.now() });
  }
  
  /**
   * Remove a guide
   */
  function removeGuide(id) {
    guides.value = guides.value.filter(guide => guide.id !== id);
  }
  
  /**
   * Clear all guides
   */
  function clearGuides() {
    guides.value = [];
  }
  
  return {
    // State
    snapEnabled,
    snapToObjects,
    snapToGrid,
    snapToGuides,
    snapToCanvas,
    snapThreshold,
    guides,
    
    // Methods
    calculateSnap,
    showSnapIndicators,
    hideSnapIndicators,
    addGuide,
    removeGuide,
    clearGuides
  };
}
