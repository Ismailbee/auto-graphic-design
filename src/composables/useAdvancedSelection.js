import { Konva } from '../lib/konva-init.js';

/**
 * Advanced Selection Manager for Konva Canvas
 * Handles multi-select, marquee selection, and advanced selection features
 */
export class SelectionManager {
  constructor(stage, layer) {
    this.stage = stage;
    this.layer = layer;
    this.selectedObjects = new Set();
    this.selectionRectangle = null;
    this.isSelecting = false;
    this.selectionStart = { x: 0, y: 0 };
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    // Handle marquee selection
    this.stage.on('mousedown touchstart', (e) => {
      if (e.target === this.stage) {
        this.startMarqueeSelection(e);
      }
    });
    
    // Handle click selection
    this.stage.on('click tap', (e) => {
      if (e.target !== this.stage) {
        this.handleObjectClick(e);
      } else {
        this.clearSelection();
      }
    });
  }
  
  startMarqueeSelection(e) {
    this.isSelecting = true;
    const pos = this.stage.getPointerPosition();
    this.selectionStart = { x: pos.x, y: pos.y };
    
    // Create selection rectangle
    this.selectionRectangle = new Konva.Rect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      fill: 'rgba(79, 70, 229, 0.1)',
      stroke: '#4f46e5',
      strokeWidth: 1,
      dash: [5, 5],
      listening: false
    });
    
    this.layer.add(this.selectionRectangle);
    
    // Mouse move handler
    const handleMouseMove = (e) => {
      if (!this.isSelecting) return;
      
      const pos = this.stage.getPointerPosition();
      const x = Math.min(this.selectionStart.x, pos.x);
      const y = Math.min(this.selectionStart.y, pos.y);
      const width = Math.abs(pos.x - this.selectionStart.x);
      const height = Math.abs(pos.y - this.selectionStart.y);
      
      this.selectionRectangle.setAttrs({ x, y, width, height });
      this.layer.batchDraw();
    };
    
    // Mouse up handler
    const handleMouseUp = () => {
      if (this.isSelecting) {
        this.finishMarqueeSelection();
      }
      
      this.stage.off('mousemove touchmove', handleMouseMove);
      this.stage.off('mouseup touchend', handleMouseUp);
    };
    
    this.stage.on('mousemove touchmove', handleMouseMove);
    this.stage.on('mouseup touchend', handleMouseUp);
  }
  
  finishMarqueeSelection() {
    if (!this.selectionRectangle) return;
    
    const selectionBox = this.selectionRectangle.getClientRect();
    const objectsInSelection = [];
    
    // Find objects within selection
    this.layer.children.forEach(child => {
      if (child === this.selectionRectangle || child.className === 'Transformer') return;
      
      const objectBox = child.getClientRect();
      
      // Check if object is within selection
      if (this.isIntersecting(selectionBox, objectBox)) {
        objectsInSelection.push(child);
      }
    });
    
    // Clean up selection rectangle
    this.selectionRectangle.destroy();
    this.selectionRectangle = null;
    this.isSelecting = false;
    
    // Set selection
    if (objectsInSelection.length > 0) {
      this.setSelection(objectsInSelection);
    } else {
      this.clearSelection();
    }
    
    this.layer.batchDraw();
  }
  
  handleObjectClick(e) {
    const clickedObject = e.target;
    
    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Multi-select with Ctrl/Cmd
      if (this.selectedObjects.has(clickedObject)) {
        this.removeFromSelection(clickedObject);
      } else {
        this.addToSelection(clickedObject);
      }
    } else {
      // Single select
      this.setSelection([clickedObject]);
    }
  }
  
  setSelection(objects) {
    this.clearSelection();
    objects.forEach(obj => this.addToSelection(obj));
    this.updateTransformer();
    this.emitSelectionChange();
  }
  
  addToSelection(object) {
    this.selectedObjects.add(object);
    this.highlightObject(object);
    this.updateTransformer();
    this.emitSelectionChange();
  }
  
  removeFromSelection(object) {
    this.selectedObjects.delete(object);
    this.unhighlightObject(object);
    this.updateTransformer();
    this.emitSelectionChange();
  }
  
  clearSelection() {
    this.selectedObjects.forEach(obj => this.unhighlightObject(obj));
    this.selectedObjects.clear();
    this.updateTransformer();
    this.emitSelectionChange();
  }
  
  selectAll() {
    const allObjects = this.layer.children.filter(child => 
      child.className !== 'Transformer' && 
      child !== this.selectionRectangle &&
      child.listening()
    );
    this.setSelection(allObjects);
  }
  
  highlightObject(object) {
    object.shadowEnabled(true);
    object.shadowColor('#4f46e5');
    object.shadowBlur(8);
    object.shadowOpacity(0.3);
  }
  
  unhighlightObject(object) {
    object.shadowEnabled(false);
    object.shadowBlur(0);
    object.shadowOpacity(0);
  }
  
  updateTransformer() {
    let transformer = this.layer.findOne('Transformer');
    
    if (!transformer) {
      transformer = new Konva.Transformer({
        anchorSize: 8,
        anchorCornerRadius: 4,
        anchorStrokeWidth: 2,
        anchorStroke: '#4f46e5',
        anchorFill: '#ffffff',
        borderStroke: '#4f46e5',
        borderStrokeWidth: 2,
        borderDash: [5, 5],
        rotateAnchorOffset: 20,
        enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 
                        'bottom-right', 'bottom-center', 'bottom-left', 'middle-left']
      });
      this.layer.add(transformer);
    }
    
    const selectedArray = Array.from(this.selectedObjects);
    transformer.nodes(selectedArray);
    transformer.getLayer().batchDraw();
  }
  
  isIntersecting(rect1, rect2) {
    return !(rect1.x > rect2.x + rect2.width || 
             rect1.x + rect1.width < rect2.x || 
             rect1.y > rect2.y + rect2.height || 
             rect1.y + rect1.height < rect2.y);
  }
  
  emitSelectionChange() {
    const event = new CustomEvent('selectionChange', {
      detail: {
        selectedObjects: Array.from(this.selectedObjects),
        count: this.selectedObjects.size
      }
    });
    window.dispatchEvent(event);
  }
  
  getSelection() {
    return Array.from(this.selectedObjects);
  }
  
  hasSelection() {
    return this.selectedObjects.size > 0;
  }
  
  destroy() {
    this.clearSelection();
    this.stage.off('mousedown touchstart');
    this.stage.off('click tap');
  }
}
