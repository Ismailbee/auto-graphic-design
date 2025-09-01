/**
 * Enhanced Selection System for Konva Canvas
 * 
 * Provides advanced selection feedback, hover states, and interaction enhancements
 */

import { Konva } from '../lib/konva-init.js';

// Selection state management
const selectionState = new Map();
let hoverTimeout = null;

/**
 * Enhanced selection feedback with animations and better visual cues
 * @param {Konva.Node} node - The Konva node to enhance
 * @param {Object} options - Customization options
 */
export function enhanceSelectionFeedback(node, options = {}) {
  if (!node) return;
  
  const config = {
    selectionColor: '#4f46e5',
    hoverColor: '#6366f1',
    selectionShadowBlur: 12,
    hoverShadowBlur: 8,
    selectionOpacity: 0.4,
    hoverOpacity: 0.25,
    animationDuration: 0.15,
    pulseEnabled: true,
    scaleOnHover: true,
    ...options
  };
  
  // Store original properties more comprehensively
  const originalProps = {
    shadowEnabled: node.shadowEnabled(),
    shadowColor: node.shadowColor(),
    shadowBlur: node.shadowBlur(),
    shadowOpacity: node.shadowOpacity(),
    shadowOffsetX: node.shadowOffsetX(),
    shadowOffsetY: node.shadowOffsetY(),
    strokeWidth: node.strokeWidth ? node.strokeWidth() : 0,
    stroke: node.stroke ? node.stroke() : null,
    scaleX: node.scaleX(),
    scaleY: node.scaleY(),
    opacity: node.opacity()
  };
  
  // Enhanced storage with unique ID
  const nodeId = node.id() || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  if (!node.id()) node.id(nodeId);
  
  selectionState.set(nodeId, {
    original: originalProps,
    isSelected: false,
    isHovered: false,
    animations: new Set()
  });
  
  // Enhanced selection methods with animations
  node.showSelection = function(animated = true) {
    const state = selectionState.get(this.id());
    if (!state || state.isSelected) return this;
    
    state.isSelected = true;
    
    if (animated) {
      // Animate selection appearance
      const tween = new Konva.Tween({
        node: this,
        duration: config.animationDuration,
        shadowEnabled: true,
        shadowColor: config.selectionColor,
        shadowBlur: config.selectionShadowBlur,
        shadowOpacity: config.selectionOpacity,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        easing: Konva.Easings.EaseOut
      });
      
      state.animations.add(tween);
      tween.play();
      
      // Add pulse effect if enabled
      if (config.pulseEnabled) {
        this.startPulse();
      }
    } else {
      this.shadowEnabled(true);
      this.shadowColor(config.selectionColor);
      this.shadowBlur(config.selectionShadowBlur);
      this.shadowOpacity(config.selectionOpacity);
      this.shadowOffsetX(2);
      this.shadowOffsetY(2);
    }
    
    // Enhanced stroke for selection
    if (this.stroke || this.strokeWidth) {
      const currentStroke = this.stroke();
      const currentStrokeWidth = this.strokeWidth();
      
      if (currentStroke) {
        this.stroke(config.selectionColor);
        this.strokeWidth(Math.max(currentStrokeWidth + 1, 2));
      } else {
        this.stroke(config.selectionColor);
        this.strokeWidth(2);
      }
    }
    
    this.moveToTop();
    this.getLayer()?.batchDraw();
    return this;
  };
  
  node.hideSelection = function(animated = true) {
    const state = selectionState.get(this.id());
    if (!state || !state.isSelected) return this;
    
    state.isSelected = false;
    this.stopPulse();
    
    // Stop any running animations
    state.animations.forEach(tween => tween.destroy());
    state.animations.clear();
    
    if (animated && state.original) {
      const tween = new Konva.Tween({
        node: this,
        duration: config.animationDuration,
        ...state.original,
        easing: Konva.Easings.EaseOut
      });
      
      tween.play();
    } else if (state.original) {
      Object.entries(state.original).forEach(([key, value]) => {
        if (typeof this[key] === 'function') {
          this[key](value);
        }
      });
    }
    
    this.getLayer()?.batchDraw();
    return this;
  };
  
  // Add hover effects
  node.showHover = function() {
    const state = selectionState.get(this.id());
    if (!state || state.isHovered || state.isSelected) return this;
    
    state.isHovered = true;
    
    if (config.scaleOnHover) {
      new Konva.Tween({
        node: this,
        duration: 0.1,
        scaleX: state.original.scaleX * 1.02,
        scaleY: state.original.scaleY * 1.02,
        easing: Konva.Easings.EaseOut
      }).play();
    }
    
    this.shadowEnabled(true);
    this.shadowColor(config.hoverColor);
    this.shadowBlur(config.hoverShadowBlur);
    this.shadowOpacity(config.hoverOpacity);
    
    this.getLayer()?.batchDraw();
    return this;
  };
  
  node.hideHover = function() {
    const state = selectionState.get(this.id());
    if (!state || !state.isHovered) return this;
    
    state.isHovered = false;
    
    if (config.scaleOnHover) {
      new Konva.Tween({
        node: this,
        duration: 0.1,
        scaleX: state.original.scaleX,
        scaleY: state.original.scaleY,
        easing: Konva.Easings.EaseOut
      }).play();
    }
    
    if (!state.isSelected) {
      new Konva.Tween({
        node: this,
        duration: 0.1,
        shadowEnabled: state.original.shadowEnabled,
        shadowColor: state.original.shadowColor,
        shadowBlur: state.original.shadowBlur,
        shadowOpacity: state.original.shadowOpacity,
        easing: Konva.Easings.EaseOut
      }).play();
    }
    
    this.getLayer()?.batchDraw();
    return this;
  };
  
  // Pulse animation for selected objects
  node.startPulse = function() {
    if (this._pulseAnimation) return;
    
    this._pulseAnimation = new Konva.Animation((frame) => {
      const period = 2000; // 2 second pulse
      const scale = 1 + 0.05 * Math.sin((frame.time * 2 * Math.PI) / period);
      
      this.shadowBlur(config.selectionShadowBlur * scale);
      this.shadowOpacity(config.selectionOpacity * (0.7 + 0.3 * scale));
    }, this.getLayer());
    
    this._pulseAnimation.start();
    return this;
  };
  
  node.stopPulse = function() {
    if (this._pulseAnimation) {
      this._pulseAnimation.stop();
      this._pulseAnimation = null;
    }
    return this;
  };
  
  // Auto-attach hover events
  node.on('mouseenter', function() {
    clearTimeout(hoverTimeout);
    this.showHover();
  });
  
  node.on('mouseleave', function() {
    hoverTimeout = setTimeout(() => {
      this.hideHover();
    }, 50); // Small delay to prevent flickering
  });
  
  // Cleanup on destroy
  node.on('destroy', function() {
    this.stopPulse();
    const state = selectionState.get(this.id());
    if (state) {
      state.animations.forEach(tween => tween.destroy());
      selectionState.delete(this.id());
    }
  });
  
  return node;
}

/**
 * Enhanced transformer with advanced interaction features
 * @param {Konva.Transformer} transformer - The transformer to enhance
 * @param {Object} options - Custom options for the transformer
 */
export function enhanceTransformer(transformer, options = {}) {
  if (!transformer) return;
  
  const config = {
    anchorSize: 12,
    anchorCornerRadius: 6,
    anchorStrokeWidth: 2,
    anchorStroke: '#4f46e5',
    anchorFill: '#ffffff',
    borderStroke: '#4f46e5',
    borderStrokeWidth: 2,
    borderDash: [8, 4],
    padding: 8,
    rotateAnchorOffset: 25,
    enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 
                     'bottom-right', 'bottom-center', 'bottom-left', 'middle-left'],
    rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315], // Snap to these angles
    centeredScaling: false,
    flipEnabled: true,
    ...options
  };
  
  // Apply configuration
  Object.keys(config).forEach(key => {
    if (typeof transformer[key] === 'function') {
      transformer[key](config[key]);
    }
  });
  
  // Enhanced anchor hover effects with smooth scaling
  let anchorAnimations = new Map();
  
  transformer.on('mouseenter', function(e) {
    if (e.target.hasName('anchor')) {
      const anchor = e.target;
      const anchorId = anchor._id || Date.now();
      
      // Stop any existing animation
      if (anchorAnimations.has(anchorId)) {
        anchorAnimations.get(anchorId).destroy();
      }
      
      const animation = new Konva.Tween({
        node: anchor,
        duration: 0.15,
        scaleX: 1.3,
        scaleY: 1.3,
        shadowEnabled: true,
        shadowColor: config.anchorStroke,
        shadowBlur: 4,
        shadowOpacity: 0.3,
        easing: Konva.Easings.EaseOut
      });
      
      anchorAnimations.set(anchorId, animation);
      animation.play();
    }
    
    // Show rotation snap indicators
    if (e.target.hasName('rotater')) {
      this.showRotationSnaps();
    }
  });
  
  transformer.on('mouseleave', function(e) {
    if (e.target.hasName('anchor')) {
      const anchor = e.target;
      const anchorId = anchor._id || Date.now();
      
      // Stop any existing animation
      if (anchorAnimations.has(anchorId)) {
        anchorAnimations.get(anchorId).destroy();
      }
      
      const animation = new Konva.Tween({
        node: anchor,
        duration: 0.15,
        scaleX: 1,
        scaleY: 1,
        shadowEnabled: false,
        easing: Konva.Easings.EaseOut
      });
      
      anchorAnimations.set(anchorId, animation);
      animation.play();
    }
    
    // Hide rotation snap indicators
    if (e.target.hasName('rotater')) {
      this.hideRotationSnaps();
    }
  });
  
  // Enhanced rotation with snap indicators
  transformer.showRotationSnaps = function() {
    if (this._snapIndicators) return;
    
    const layer = this.getLayer();
    if (!layer) return;
    
    this._snapIndicators = new Konva.Group({
      listening: false
    });
    
    const centerX = this.x() + this.width() / 2;
    const centerY = this.y() + this.height() / 2;
    const radius = Math.max(this.width(), this.height()) / 2 + 40;
    
    config.rotationSnaps.forEach(angle => {
      const radian = (angle * Math.PI) / 180;
      const x = centerX + radius * Math.cos(radian);
      const y = centerY + radius * Math.sin(radian);
      
      const indicator = new Konva.Circle({
        x,
        y,
        radius: 3,
        fill: config.anchorStroke,
        opacity: 0.6,
        strokeWidth: 1,
        stroke: '#ffffff'
      });
      
      this._snapIndicators.add(indicator);
    });
    
    layer.add(this._snapIndicators);
    layer.batchDraw();
  };
  
  transformer.hideRotationSnaps = function() {
    if (this._snapIndicators) {
      this._snapIndicators.destroy();
      this._snapIndicators = null;
      this.getLayer()?.batchDraw();
    }
  };
  
  // Enhanced rotation snapping
  let originalBoundBoxFunc = transformer.boundBoxFunc();
  transformer.boundBoxFunc(function(oldBoundBox, newBoundBox) {
    // Apply original constraints first
    if (originalBoundBoxFunc) {
      newBoundBox = originalBoundBoxFunc(oldBoundBox, newBoundBox);
    }
    
    // Minimum size constraints
    const minSize = 10;
    if (newBoundBox.width < minSize) {
      newBoundBox.width = minSize;
    }
    if (newBoundBox.height < minSize) {
      newBoundBox.height = minSize;
    }
    
    return newBoundBox;
  });
  
  // Add keyboard shortcuts for precise control
  transformer.on('transform', function() {
    const node = this.nodes()[0];
    if (!node) return;
    
    // Snap rotation to predefined angles
    const currentRotation = node.rotation();
    const snapThreshold = 5; // degrees
    
    for (const snapAngle of config.rotationSnaps) {
      const diff = Math.abs(currentRotation - snapAngle);
      if (diff < snapThreshold || diff > 360 - snapThreshold) {
        node.rotation(snapAngle);
        break;
      }
    }
  });
  
  // Add context menu capabilities
  transformer.on('contextmenu', function(e) {
    e.evt.preventDefault();
    
    // Dispatch custom event for context menu
    const customEvent = new CustomEvent('transformer:contextmenu', {
      detail: {
        transformer: this,
        node: this.nodes()[0],
        position: { x: e.evt.clientX, y: e.evt.clientY }
      }
    });
    
    window.dispatchEvent(customEvent);
  });
  
  // Cleanup on destroy
  transformer.on('destroy', function() {
    anchorAnimations.forEach(animation => animation.destroy());
    anchorAnimations.clear();
    this.hideRotationSnaps();
  });
  
  return transformer;
}

/**
 * Multi-selection transformer with group handling
 * @param {Array} nodes - Array of Konva nodes to select
 * @param {Konva.Layer} layer - The layer to add transformer to
 * @param {Object} options - Transformer options
 */
export function createMultiSelectTransformer(nodes, layer, options = {}) {
  if (!nodes.length || !layer) return null;
  
  const transformer = new Konva.Transformer({
    nodes: nodes,
    centeredScaling: false,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    boundBoxFunc: (oldBoundBox, newBoundBox) => {
      // Prevent negative scaling
      if (Math.abs(newBoundBox.width) < 5 || Math.abs(newBoundBox.height) < 5) {
        return oldBoundBox;
      }
      return newBoundBox;
    },
    ...options
  });
  
  // Enhance the multi-select transformer
  enhanceTransformer(transformer, {
    borderDash: [12, 6],
    borderStroke: '#e11d48',
    anchorStroke: '#e11d48'
  });
  
  layer.add(transformer);
  transformer.moveToTop();
  
  return transformer;
}

/**
 * Smart alignment guides for transformers
 * @param {Konva.Transformer} transformer - The transformer to add guides to
 * @param {Konva.Stage} stage - The stage for positioning
 */
export function addAlignmentGuides(transformer, stage) {
  if (!transformer || !stage) return;
  
  let guides = null;
  
  transformer.on('dragmove transform', function() {
    if (guides) {
      guides.destroy();
      guides = null;
    }
    
    const node = this.nodes()[0];
    if (!node) return;
    
    const layer = this.getLayer();
    if (!layer) return;
    
    guides = new Konva.Group({
      listening: false
    });
    
    const stageWidth = stage.width();
    const stageHeight = stage.height();
    const nodeBox = node.getClientRect();
    
    // Center guides
    const centerX = stageWidth / 2;
    const centerY = stageHeight / 2;
    
    const snapThreshold = 5;
    
    // Vertical center guide
    if (Math.abs(nodeBox.x + nodeBox.width / 2 - centerX) < snapThreshold) {
      const line = new Konva.Line({
        points: [centerX, 0, centerX, stageHeight],
        stroke: '#ff4444',
        strokeWidth: 1,
        dash: [4, 4],
        opacity: 0.8
      });
      guides.add(line);
    }
    
    // Horizontal center guide
    if (Math.abs(nodeBox.y + nodeBox.height / 2 - centerY) < snapThreshold) {
      const line = new Konva.Line({
        points: [0, centerY, stageWidth, centerY],
        stroke: '#ff4444',
        strokeWidth: 1,
        dash: [4, 4],
        opacity: 0.8
      });
      guides.add(line);
    }
    
    layer.add(guides);
    layer.batchDraw();
  });
  
  transformer.on('dragend transformend', function() {
    if (guides) {
      guides.destroy();
      guides = null;
      this.getLayer()?.batchDraw();
    }
  });
}
