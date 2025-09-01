/**
 * Advanced Keyboard Shortcuts System for Canvas
 * 
 * Provides professional-grade keyboard shortcuts similar to design apps like Figma/Sketch
 */

import { ref, onMounted, onUnmounted, readonly } from 'vue';
import { useCanvasStore } from '../stores/canvas-konva';

export function useKeyboardShortcuts() {
  const canvasStore = useCanvasStore();
  const isEnabled = ref(true);
  const pressedKeys = ref(new Set());
  
  // Modifier key state
  const modifiers = ref({
    ctrl: false,
    shift: false,
    alt: false,
    meta: false
  });
  
  // Command registry
  const commands = new Map();
  
  /**
   * Register a keyboard shortcut
   * @param {string} key - Key combination (e.g., 'ctrl+c', 'shift+d')
   * @param {Function} handler - Function to execute
   * @param {Object} options - Additional options
   */
  function registerShortcut(key, handler, options = {}) {
    const normalizedKey = normalizeKeyCombo(key);
    commands.set(normalizedKey, {
      handler,
      description: options.description || '',
      category: options.category || 'general',
      preventDefault: options.preventDefault !== false
    });
  }
  
  /**
   * Normalize key combinations for consistent matching
   */
  function normalizeKeyCombo(keyCombo) {
    return keyCombo
      .toLowerCase()
      .split('+')
      .sort()
      .join('+');
  }
  
  /**
   * Check if a key combination matches current pressed keys
   */
  function matchesKeyCombo(keyCombo) {
    const parts = keyCombo.split('+');
    const requiredModifiers = [];
    let requiredKey = '';
    
    parts.forEach(part => {
      if (['ctrl', 'shift', 'alt', 'meta'].includes(part)) {
        requiredModifiers.push(part);
      } else {
        requiredKey = part;
      }
    });
    
    // Check all required modifiers are pressed
    const modifierMatch = requiredModifiers.every(mod => modifiers.value[mod]);
    
    // Check no extra modifiers are pressed
    const noExtraModifiers = Object.entries(modifiers.value).every(([key, pressed]) => {
      return !pressed || requiredModifiers.includes(key);
    });
    
    // Check the main key is pressed
    const keyMatch = pressedKeys.value.has(requiredKey);
    
    return modifierMatch && noExtraModifiers && keyMatch;
  }
  
  /**
   * Handle keydown events
   */
  function handleKeyDown(e) {
    if (!isEnabled.value) return;
    
    // Skip if typing in input fields
    if (isTypingInInput(e.target)) return;
    
    // Update modifier states
    modifiers.value.ctrl = e.ctrlKey;
    modifiers.value.shift = e.shiftKey;
    modifiers.value.alt = e.altKey;
    modifiers.value.meta = e.metaKey;
    
    // Add key to pressed set
    const key = e.key.toLowerCase();
    pressedKeys.value.add(key);
    
    // Build current key combination
    const keyCombo = buildCurrentKeyCombo(key);
    
    // Check for matching commands
    const command = commands.get(keyCombo);
    if (command) {
      if (command.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      try {
        command.handler(e);
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error);
      }
    }
  }
  
  /**
   * Handle keyup events
   */
  function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    pressedKeys.value.delete(key);
    
    // Update modifier states
    modifiers.value.ctrl = e.ctrlKey;
    modifiers.value.shift = e.shiftKey;
    modifiers.value.alt = e.altKey;
    modifiers.value.meta = e.metaKey;
  }
  
  /**
   * Build current key combination string
   */
  function buildCurrentKeyCombo(mainKey) {
    const parts = [];
    
    if (modifiers.value.ctrl) parts.push('ctrl');
    if (modifiers.value.shift) parts.push('shift');
    if (modifiers.value.alt) parts.push('alt');
    if (modifiers.value.meta) parts.push('meta');
    
    parts.push(mainKey);
    
    return parts.sort().join('+');
  }
  
  /**
   * Check if user is typing in an input field
   */
  function isTypingInInput(target) {
    const tagName = target.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    const isContentEditable = target.contentEditable === 'true';
    
    return inputTypes.includes(tagName) || isContentEditable;
  }
  
  /**
   * Enable/disable shortcuts
   */
  function setEnabled(enabled) {
    isEnabled.value = enabled;
  }
  
  /**
   * Get all registered shortcuts
   */
  function getShortcuts() {
    return Array.from(commands.entries()).map(([key, command]) => ({
      key,
      ...command
    }));
  }
  
  // Setup default canvas shortcuts
  function setupDefaultShortcuts() {
    // Selection and editing
    registerShortcut('ctrl+a', () => {
      // Select all objects
      if (canvasStore.layerInstance) {
        const allObjects = canvasStore.layerInstance.children.toArray();
        canvasStore.selectedObjects = allObjects;
        if (allObjects.length > 0) {
          canvasStore.setActiveObject(allObjects[0]);
        }
      }
    }, { description: 'Select all', category: 'selection' });
    
    registerShortcut('escape', () => {
      canvasStore.setActiveObject(null);
      canvasStore.selectedObjects = [];
    }, { description: 'Deselect all', category: 'selection' });
    
    // Copy/Paste/Duplicate
    registerShortcut('ctrl+c', () => {
      if (canvasStore.activeObject) {
        // Store object data for pasting
        const objectData = canvasStore.activeObject.toJSON();
        localStorage.setItem('canvas-clipboard', JSON.stringify(objectData));
      }
    }, { description: 'Copy', category: 'editing' });
    
    registerShortcut('ctrl+v', () => {
      const clipboardData = localStorage.getItem('canvas-clipboard');
      if (clipboardData) {
        try {
          const objectData = JSON.parse(clipboardData);
          // Paste with offset
          objectData.x = (objectData.x || 0) + 20;
          objectData.y = (objectData.y || 0) + 20;
          
          // Create new object from clipboard data
          canvasStore.addElement(objectData.className?.toLowerCase() || 'rect', objectData);
        } catch (error) {
          console.error('Error pasting object:', error);
        }
      }
    }, { description: 'Paste', category: 'editing' });
    
    registerShortcut('ctrl+d', () => {
      canvasStore.duplicateSelectedObject();
    }, { description: 'Duplicate', category: 'editing' });
    
    // Delete
    registerShortcut('delete', () => {
      canvasStore.deleteSelectedObject();
    }, { description: 'Delete selected', category: 'editing' });
    
    registerShortcut('backspace', () => {
      canvasStore.deleteSelectedObject();
    }, { description: 'Delete selected', category: 'editing' });
    
    // Undo/Redo
    registerShortcut('ctrl+z', () => {
      canvasStore.undo();
    }, { description: 'Undo', category: 'history' });
    
    registerShortcut('ctrl+shift+z', () => {
      canvasStore.redo();
    }, { description: 'Redo', category: 'history' });
    
    registerShortcut('ctrl+y', () => {
      canvasStore.redo();
    }, { description: 'Redo (alternative)', category: 'history' });
    
    // Tools
    registerShortcut('v', () => {
      canvasStore.setActiveTool('Select');
    }, { description: 'Select tool', category: 'tools' });
    
    registerShortcut('r', () => {
      canvasStore.addElement('rect');
    }, { description: 'Rectangle tool', category: 'tools' });
    
    registerShortcut('o', () => {
      canvasStore.addElement('circle');
    }, { description: 'Circle tool', category: 'tools' });
    
    registerShortcut('t', () => {
      canvasStore.addElement('text', { text: 'Text' });
    }, { description: 'Text tool', category: 'tools' });
    
    // Layers and arrangement
    registerShortcut('ctrl+shift+]', () => {
      if (canvasStore.activeObject) {
        canvasStore.activeObject.moveToTop();
        canvasStore.scheduleDraw();
      }
    }, { description: 'Bring to front', category: 'arrange' });
    
    registerShortcut('ctrl+]', () => {
      if (canvasStore.activeObject) {
        canvasStore.activeObject.moveUp();
        canvasStore.scheduleDraw();
      }
    }, { description: 'Bring forward', category: 'arrange' });
    
    registerShortcut('ctrl+[', () => {
      if (canvasStore.activeObject) {
        canvasStore.activeObject.moveDown();
        canvasStore.scheduleDraw();
      }
    }, { description: 'Send backward', category: 'arrange' });
    
    registerShortcut('ctrl+shift+[', () => {
      if (canvasStore.activeObject) {
        canvasStore.activeObject.moveToBottom();
        canvasStore.scheduleDraw();
      }
    }, { description: 'Send to back', category: 'arrange' });
    
    // Grouping
    registerShortcut('ctrl+g', () => {
      canvasStore.groupSelectedObjects();
    }, { description: 'Group selection', category: 'organize' });
    
    registerShortcut('ctrl+shift+g', () => {
      canvasStore.ungroupSelectedObjects();
    }, { description: 'Ungroup selection', category: 'organize' });
    
    // View controls
    registerShortcut('ctrl+0', () => {
      canvasStore.setZoomLevel(100);
    }, { description: 'Zoom to 100%', category: 'view' });
    
    registerShortcut('ctrl+-', () => {
      const currentZoom = canvasStore.zoomLevel;
      canvasStore.setZoomLevel(Math.max(10, currentZoom - 10));
    }, { description: 'Zoom out', category: 'view' });
    
    registerShortcut('ctrl+=', () => {
      const currentZoom = canvasStore.zoomLevel;
      canvasStore.setZoomLevel(Math.min(500, currentZoom + 10));
    }, { description: 'Zoom in', category: 'view' });
    
    // Grid and guides
    registerShortcut('ctrl+\\', () => {
      canvasStore.toggleGrid();
    }, { description: 'Toggle grid', category: 'view' });
    
    registerShortcut('ctrl+;', () => {
      canvasStore.toggleRulers();
    }, { description: 'Toggle rulers', category: 'view' });
    
    // Pages
    registerShortcut('ctrl+pagedown', () => {
      canvasStore.nextPage();
    }, { description: 'Next page', category: 'pages' });
    
    registerShortcut('ctrl+pageup', () => {
      canvasStore.prevPage();
    }, { description: 'Previous page', category: 'pages' });
    
    // Precision movement (arrow keys)
    registerShortcut('arrowleft', () => {
      moveActiveObject(-1, 0);
    }, { description: 'Move left 1px', category: 'movement' });
    
    registerShortcut('arrowright', () => {
      moveActiveObject(1, 0);
    }, { description: 'Move right 1px', category: 'movement' });
    
    registerShortcut('arrowup', () => {
      moveActiveObject(0, -1);
    }, { description: 'Move up 1px', category: 'movement' });
    
    registerShortcut('arrowdown', () => {
      moveActiveObject(0, 1);
    }, { description: 'Move down 1px', category: 'movement' });
    
    // Large movement (10px)
    registerShortcut('shift+arrowleft', () => {
      moveActiveObject(-10, 0);
    }, { description: 'Move left 10px', category: 'movement' });
    
    registerShortcut('shift+arrowright', () => {
      moveActiveObject(10, 0);
    }, { description: 'Move right 10px', category: 'movement' });
    
    registerShortcut('shift+arrowup', () => {
      moveActiveObject(0, -10);
    }, { description: 'Move up 10px', category: 'movement' });
    
    registerShortcut('shift+arrowdown', () => {
      moveActiveObject(0, 10);
    }, { description: 'Move down 10px', category: 'movement' });
  }
  
  /**
   * Move the active object by specified pixels
   */
  function moveActiveObject(deltaX, deltaY) {
    if (canvasStore.activeObject) {
      const newX = canvasStore.activeObject.x() + deltaX;
      const newY = canvasStore.activeObject.y() + deltaY;
      
      canvasStore.activeObject.x(newX);
      canvasStore.activeObject.y(newY);
      
      canvasStore.scheduleDraw();
      canvasStore.saveState();
    }
  }
  
  // Lifecycle management
  onMounted(() => {
    setupDefaultShortcuts();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  });
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
  });
  
  return {
    registerShortcut,
    setEnabled,
    getShortcuts,
    isEnabled,
    pressedKeys: readonly(pressedKeys),
    modifiers: readonly(modifiers)
  };
}
