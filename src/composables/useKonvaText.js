import { Konva } from '../lib/konva-init.js';

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Create an editable and draggable Konva Text object
 * This enhances the standard Konva.Text with double-click-to-edit functionality
 * 
 * @param {Object} stage - The Konva Stage instance
 * @param {Object} layer - The Konva Layer to add the text to
 * @param {Object} options - Text configuration options
 * @returns {Object} - The created Konva Text node
 */
export function createEditableText(stage, layer, options = {}) {
  // Default options
  const defaultOptions = {
    x: stage.width() / 2,
    y: stage.height() / 2,
    text: 'Type something...',
    fontSize: 48,
    fontFamily: 'Arial',
    fill: '#1e293b',
    align: 'center',
    draggable: true,
    padding: 10,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowBlur: 10,
    shadowOffset: { x: 5, y: 5 },
    shadowOpacity: 0.5
  };

  // Merge options
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Create text node
  const textNode = new Konva.Text(mergedOptions);
  
  // If text is empty, set a placeholder that's not visible but ensures the node has size
  const hasEmptyText = !mergedOptions.text || mergedOptions.text.trim() === '';
  if (hasEmptyText) {
    // Set a minimum width if not provided
    if (!mergedOptions.width) {
      textNode.width(150);
    }
    // Add a non-visible marker to ensure the node has height
    textNode.text(' ');
    // Store that this is meant to be empty for editing
    textNode.setAttr('emptyText', true);
  }
  
  // Center text
  textNode.offsetX(textNode.width() / 2);
  textNode.offsetY(textNode.height() / 2);
  
  // Add to layer
  layer.add(textNode);
  
  // Cache text for faster rendering when transformed
  try { textNode.cache(); } catch (_) {}

  // Setup double-click to edit
  textNode.on('dblclick dbltap', () => {
    // Create a textarea over the text node
    const textPosition = textNode.absolutePosition();
    const stageBox = stage.container().getBoundingClientRect();
    const scale = stage.scaleX();

    // Convert Konva coordinates to page pixels (taking scale into account)
    const areaPosition = {
      x: stageBox.left + (textPosition.x - textNode.offsetX()) * scale,
      y: stageBox.top + (textPosition.y - textNode.offsetY()) * scale
    };

    // Create textarea
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    // Check if this is an empty text node
    const isEmptyText = textNode.getAttr('emptyText');
    const initialText = isEmptyText ? '' : textNode.text();

    // Hide the Konva text while editing to avoid seeing double text
    textNode.visible(false);
    layer.batchDraw();

    // Position and style textarea in page pixels
    textarea.value = initialText;
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${Math.max(100, textNode.width() * scale) + 20}px`;
    textarea.style.height = `${Math.max(30, textNode.height() * scale) + 20}px`;
    textarea.style.fontSize = `${textNode.fontSize() * scale}px`;
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill();
    textarea.style.border = '2px solid #4f46e5';
    textarea.style.padding = '5px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'rgba(255, 255, 255, 0.95)';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = textNode.lineHeight() || 1.2;
    textarea.style.fontStyle = textNode.fontStyle();
    textarea.style.zIndex = 10000;

    // Focus and put caret at end for existing text (or show blinking cursor for empty)
    textarea.focus();
    const textLength = textarea.value.length;
    textarea.setSelectionRange(textLength, textLength);

  // Create a hidden DOM measurer to compute text width in pixels
    const measurer = document.createElement('span');
    measurer.style.position = 'absolute';
    measurer.style.top = '-9999px';
    measurer.style.left = '-9999px';
    measurer.style.whiteSpace = 'pre';
    measurer.style.fontSize = `${textNode.fontSize() * stage.scaleX()}px`;
    measurer.style.fontFamily = textNode.fontFamily() || 'Arial';
    measurer.style.fontStyle = textNode.fontStyle() || 'normal';
    document.body.appendChild(measurer);

  // No on-canvas blinking cursor to avoid continuous draws

  function removeTextarea() {
      if (textarea.parentNode) document.body.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleEnter);
      stage.on('click touchstart', handleStageClick);

      // Update Konva text once editing is finished and restore visibility
      const newText = textarea.value;
      textNode.text(newText);
      // clear emptyText flag if user typed something
      if (newText.trim() !== '') {
        textNode.setAttr('emptyText', false);
        textNode.visible(true);
      } else {
        // keep it hidden if empty to avoid clutter
        textNode.setAttr('emptyText', true);
        textNode.visible(false);
      }

  // Recenter and redraw
      textNode.offsetX(textNode.width() / 2);
      textNode.offsetY(textNode.height() / 2);
  layer.batchDraw();
  // cleanup measurer
  try { if (measurer && measurer.parentNode) measurer.parentNode.removeChild(measurer); } catch(_) {}
    }

    // Handle outside click
    function handleOutsideClick(e) {
      if (e.target !== textarea) {
        removeTextarea();
      }
    }

    // Handle Enter key
    function handleEnter(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        removeTextarea();
      }
      if (e.key === 'Escape') {
        // cancel editing, restore previous text
        textNode.visible(true);
        layer.batchDraw();
        removeTextarea();
      }
    }

    // Handle stage click (finish editing)
    function handleStageClick(e) {
      if (e.target !== textNode) {
        removeTextarea();
      }
    }

    // Disable stage click handler that may interfere
    stage.off('click touchstart', handleStageClick);

    // Add event listeners
    textarea.addEventListener('keydown', handleEnter);
    textarea.addEventListener('input', debounce(() => {
      // Auto resize the textarea based on content (in page pixels)
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      // Avoid drawing canvas on every keystroke; we'll update only on commit
    }, 100));

    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
      window.addEventListener('keydown', handleEnter);
    });

  // No-op
  });
  
  // Add cleanup handler to prevent memory leaks
  textNode.on('destroy', () => {
    // Clean up event listeners when text node is destroyed
    textNode.off('dblclick dbltap');
  });
  
  return textNode;
}

/**
 * Add a custom menu for text editing 
 * 
 * @param {Object} textNode - The Konva Text node to enhance
 * @param {Object} stage - The Konva Stage instance
 * @param {Object} layer - The Konva Layer the text belongs to
 */
export function addTextEditingControls(textNode, stage, layer) {
  // Create a group for the menu
  const menuGroup = new Konva.Group({
    visible: false,
    name: 'text-edit-menu'
  });
  
  // Add background
  const menuBg = new Konva.Rect({
    fill: 'white',
    cornerRadius: 5,
    shadowColor: 'black',
    shadowBlur: 10,
    shadowOffset: { x: 0, y: 3 },
    shadowOpacity: 0.3,
    stroke: '#ddd',
    strokeWidth: 1
  });
  menuGroup.add(menuBg);
  
  // Font buttons
  const menuButtons = [
    { name: 'bold', icon: '🅱️', action: () => toggleBold() },
    { name: 'italic', icon: '𝐼', action: () => toggleItalic() },
    { name: 'fontIncrease', icon: 'A+', action: () => changeFontSize(2) },
    { name: 'fontDecrease', icon: 'A-', action: () => changeFontSize(-2) }
  ];
  
  // Create buttons
  const buttons = [];
  menuButtons.forEach((btn, i) => {
    const button = new Konva.Group({
      x: 10 + i * 40,
      y: 10,
      name: btn.name,
      width: 30,
      height: 30
    });
    
    const buttonBg = new Konva.Rect({
      width: 30,
      height: 30,
      fill: '#f0f0f0',
      cornerRadius: 3,
      stroke: '#ddd',
      strokeWidth: 1
    });
    
    const buttonText = new Konva.Text({
      text: btn.icon,
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#333',
      width: 30,
      height: 30,
      align: 'center',
      verticalAlign: 'middle'
    });
    
    button.add(buttonBg);
    button.add(buttonText);
    
    button.on('mouseover', () => {
      buttonBg.fill('#e0e0e0');
      stage.container().style.cursor = 'pointer';
      layer.batchDraw();
    });
    
    button.on('mouseout', () => {
      buttonBg.fill('#f0f0f0');
      stage.container().style.cursor = 'default';
      layer.batchDraw();
    });
    
    button.on('click tap', btn.action);
    
    menuGroup.add(button);
    buttons.push(button);
  });
  
  // Size the background
  menuBg.width(menuButtons.length * 40 + 20);
  menuBg.height(50);
  
  // Add to layer
  layer.add(menuGroup);
  
  // Show menu on text select
  textNode.on('mousedown touchstart', () => {
    if (!textNode.draggable()) return;
    
    const pos = textNode.absolutePosition();
    menuGroup.position({
      x: pos.x - menuBg.width() / 2,
      y: pos.y - textNode.height() / 2 - menuBg.height() - 10
    });
    
    menuGroup.visible(true);
    layer.batchDraw();
  });
  
  // Hide menu when clicking elsewhere
  stage.on('click touchstart', (e) => {
    if (e.target !== textNode && !e.target.hasName('text-edit-menu') && 
        !e.target.parent?.hasName('text-edit-menu')) {
      menuGroup.visible(false);
      layer.batchDraw();
    }
  });
  
  // Text editing functions
  function toggleBold() {
    if (textNode.fontStyle().includes('bold')) {
      textNode.fontStyle(textNode.fontStyle().replace('bold', '').trim());
    } else {
      const currentStyle = textNode.fontStyle() || 'normal';
      textNode.fontStyle(`bold ${currentStyle}`);
    }
    layer.batchDraw();
  }
  
  function toggleItalic() {
    if (textNode.fontStyle().includes('italic')) {
      textNode.fontStyle(textNode.fontStyle().replace('italic', '').trim());
    } else {
      const currentStyle = textNode.fontStyle() || 'normal';
      textNode.fontStyle(`italic ${currentStyle}`);
    }
    layer.batchDraw();
  }
  
  function changeFontSize(delta) {
    const newSize = textNode.fontSize() + delta;
    if (newSize > 8) {
      textNode.fontSize(newSize);
      
      // Recenter
      textNode.offsetX(textNode.width() / 2);
      textNode.offsetY(textNode.height() / 2);
      
      layer.batchDraw();
    }
  }
  
  return menuGroup;
}
