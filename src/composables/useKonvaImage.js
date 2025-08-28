import { Konva } from '../lib/konva-init.js';

/**
 * Create an enhanced Konva Image with move and resize capabilities
 * 
 * @param {Object} stage - The Konva Stage instance
 * @param {Object} layer - The Konva Layer to add the image to
 * @param {Object} options - Image configuration options
 * @returns {Promise<Object>} - Promise resolving to the created Konva Image node
 */
export function createEnhancedImage(stage, layer, options = {}) {
  return new Promise((resolve, reject) => {
    // Default options
    const defaultOptions = {
      x: stage.width() / 2,
      y: stage.height() / 2,
      draggable: true,
      strokeWidth: 0,
      shadowColor: 'rgba(0,0,0,0.2)',
      shadowBlur: 10,
      shadowOffset: { x: 5, y: 5 },
      shadowOpacity: 0.5
    };

    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Create image object
    const imageObj = new Image();
    
    imageObj.onload = () => {
      // Create Konva image
      const konvaImg = new Konva.Image({
        ...mergedOptions,
        image: imageObj
      });
      
      // Center image
      konvaImg.offsetX(imageObj.width / 2);
      konvaImg.offsetY(imageObj.height / 2);
      
      // Scale down if too large
      if (imageObj.width > 300) {
        const scale = 300 / imageObj.width;
        konvaImg.scaleX(scale);
        konvaImg.scaleY(scale);
      }
      
      // Ensure the image will be positioned inside the stage bounds when later added
        // Apply a sensible default scale (already applied above for very wide images)
        const finalWidth = konvaImg.width() * konvaImg.scaleX();
        const finalHeight = konvaImg.height() * konvaImg.scaleY();

        // Clamp position so image center stays within the stage
        const minX = finalWidth / 2;
        const minY = finalHeight / 2;
        const maxX = Math.max(minX, stage.width() - finalWidth / 2);
        const maxY = Math.max(minY, stage.height() - finalHeight / 2);

        const clampedX = Math.min(maxX, Math.max(minX, konvaImg.x()));
        const clampedY = Math.min(maxY, Math.max(minY, konvaImg.y()));
        konvaImg.position({ x: clampedX, y: clampedY });

        // Resolve the created Konva.Image without adding it to the layer. The caller
        // (canvas store) will add the image to the proper layer so selection/undo
        // logic remains centralized.
        resolve(konvaImg);
    };
    
    imageObj.onerror = (e) => {
      reject(new Error('Failed to load image: ' + e.message));
    };
    
    // Load the image
    imageObj.src = options.src;
  });
}

/**
 * Add resize anchors to an image
 * @param {Object} image - The Konva Image node
 * @param {Object} stage - The Konva Stage
 * @param {Object} layer - The Konva Layer
 */
export function addResizeAnchors(image, stage, layer) {
  const anchors = {
    topLeft: createAnchor('topLeft'),
    topRight: createAnchor('topRight'),
    bottomRight: createAnchor('bottomRight'),
    bottomLeft: createAnchor('bottomLeft')
  };
  
  // Add anchors to layer
  Object.values(anchors).forEach(anchor => {
    layer.add(anchor);
  });
  
  // Update anchor positions based on image
  updateAnchors(image, anchors);
  
  // Make anchors follow image movement
  image.on('dragmove transform', () => {
    updateAnchors(image, anchors);
  });
  
  // Hide anchors when image not selected
  const showAnchors = (visible) => {
    Object.values(anchors).forEach(anchor => {
      anchor.visible(visible);
    });
    layer.draw();
  };
  
  // Hide anchors initially
  showAnchors(false);
  
  // Show anchors on select, hide on deselect
  image.on('mousedown touchstart', () => {
    showAnchors(true);
    
    // Emit a custom event to notify the canvas store
    const event = new CustomEvent('konva:select', {
      detail: { target: image }
    });
    window.dispatchEvent(event);
  });
  
  // Listen for selection changes from the canvas store
  const selectHandler = (e) => {
    if (e.detail && e.detail.target === image) {
      showAnchors(true);
    } else {
      showAnchors(false);
    }
  };
  
  // Add event listeners
  window.addEventListener('konva:select', selectHandler);
  window.addEventListener('konva:deselect', () => showAnchors(false));
  
  // Clean up on image destroy
  image.on('destroy', () => {
    window.removeEventListener('konva:select', selectHandler);
    window.removeEventListener('konva:deselect', () => showAnchors(false));
  });
  
  stage.on('click touchstart', (e) => {
    if (e.target !== image && !Object.values(anchors).includes(e.target)) {
      showAnchors(false);
    }
  });
  
  // Implement resize drag behavior
  Object.entries(anchors).forEach(([position, anchor]) => {
    anchor.on('dragmove', () => {
      resizeImageWithAnchor(image, anchor, position);
      updateAnchors(image, anchors, position);
      layer.draw();
    });
  });
}

/**
 * Create a resize anchor
 * @param {string} name - Anchor position name for identification
 * @returns {Object} - Konva Circle anchor
 */
function createAnchor(name) {
  return new Konva.Circle({
    name: name,
    radius: 8,
    fill: '#ffffff',
    stroke: '#4f46e5',
    strokeWidth: 2,
    draggable: true,
    visible: false
  });
}

/**
 * Update anchor positions based on image position and size
 * @param {Object} image - The Konva Image
 * @param {Object} anchors - The anchor objects
 * @param {string} exceptPosition - Optional position to skip updating
 */
function updateAnchors(image, anchors, exceptPosition) {
  // Get image transform info
  const imageX = image.x();
  const imageY = image.y();
  const imageWidth = image.width() * image.scaleX();
  const imageHeight = image.height() * image.scaleY();
  const offsetX = image.offsetX() * image.scaleX();
  const offsetY = image.offsetY() * image.scaleY();
  const rotation = image.rotation();
  
  // Calculate actual corners based on offset
  const topLeft = {
    x: imageX - offsetX,
    y: imageY - offsetY
  };
  const topRight = {
    x: imageX - offsetX + imageWidth,
    y: imageY - offsetY
  };
  const bottomRight = {
    x: imageX - offsetX + imageWidth,
    y: imageY - offsetY + imageHeight
  };
  const bottomLeft = {
    x: imageX - offsetX,
    y: imageY - offsetY + imageHeight
  };
  
  // Function to rotate a point around a center
  const rotatePoint = (point, center, angle) => {
    const angleRad = (angle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const x = center.x + (point.x - center.x) * cos - (point.y - center.y) * sin;
    const y = center.y + (point.x - center.x) * sin + (point.y - center.y) * cos;
    return { x, y };
  };
  
  // Apply rotation if needed
  const center = { x: imageX, y: imageY };
  const positions = {
    topLeft: rotation ? rotatePoint(topLeft, center, rotation) : topLeft,
    topRight: rotation ? rotatePoint(topRight, center, rotation) : topRight,
    bottomRight: rotation ? rotatePoint(bottomRight, center, rotation) : bottomRight,
    bottomLeft: rotation ? rotatePoint(bottomLeft, center, rotation) : bottomLeft
  };
  
  // Update anchor positions
  Object.entries(positions).forEach(([pos, point]) => {
    if (pos !== exceptPosition && anchors[pos]) {
      anchors[pos].position({ x: point.x, y: point.y });
    }
  });
}

/**
 * Resize image based on anchor dragging
 * @param {Object} image - The Konva Image
 * @param {Object} anchor - The anchor being dragged
 * @param {string} position - The anchor's position name
 */
function resizeImageWithAnchor(image, anchor, position) {
  // Current image properties
  const imageX = image.x();
  const imageY = image.y();
  const width = image.width() * image.scaleX();
  const height = image.height() * image.scaleY();
  const offsetX = image.offsetX() * image.scaleX();
  const offsetY = image.offsetY() * image.scaleY();
  
  // Get anchor position
  const anchorX = anchor.x();
  const anchorY = anchor.y();
  
  // Calculate new width and height based on anchor position
  let newWidth = width;
  let newHeight = height;
  let newX = imageX;
  let newY = imageY;
  
  // Handle each corner differently
  switch (position) {
    case 'topLeft':
      newWidth = (imageX - offsetX + width) - anchorX;
      newHeight = (imageY - offsetY + height) - anchorY;
      newX = anchorX + offsetX;
      newY = anchorY + offsetY;
      break;
    case 'topRight':
      newWidth = anchorX - (imageX - offsetX);
      newHeight = (imageY - offsetY + height) - anchorY;
      newY = anchorY + offsetY;
      break;
    case 'bottomRight':
      newWidth = anchorX - (imageX - offsetX);
      newHeight = anchorY - (imageY - offsetY);
      break;
    case 'bottomLeft':
      newWidth = (imageX - offsetX + width) - anchorX;
      newHeight = anchorY - (imageY - offsetY);
      newX = anchorX + offsetX;
      break;
  }
  
  // Ensure minimum size
  if (newWidth < 20) newWidth = 20;
  if (newHeight < 20) newHeight = 20;
  
  // Update image properties
  image.position({ x: newX, y: newY });
  
  // Calculate scale factors based on original size
  const scaleX = newWidth / image.width();
  const scaleY = newHeight / image.height();
  
  image.scale({ x: scaleX, y: scaleY });
}

/**
 * Apply image transformations (flip, rotate)
 * @param {Object} image - The Konva Image
 * @param {Object} options - Transformation options
 */
export function transformImage(image, options = {}) {
  if (!image) return;
  
  // Flip horizontally
  if (options.flipX !== undefined) {
    image.scaleX(image.scaleX() * (options.flipX ? -1 : 1));
  }
  
  // Flip vertically
  if (options.flipY !== undefined) {
    image.scaleY(image.scaleY() * (options.flipY ? -1 : 1));
  }
  
  // Rotate
  if (options.rotate !== undefined) {
    image.rotate(image.rotation() + options.rotate);
  }
}

/**
 * Apply image filters
 * @param {Object} image - The Konva Image
 * @param {string} filterType - The type of filter to apply
 * @param {Object} options - Filter options
 */
export function applyImageFilter(image, filterType, options = {}) {
  if (!image) return;
  
  // Reset filters if type is 'none'
  if (filterType === 'none') {
    image.filters([]);
    image.cache();
    return;
  }
  
  // Apply the filter based on type
  let filter;
  
  switch (filterType) {
    case 'grayscale':
      filter = Konva.Filters.Grayscale;
      break;
    case 'blur':
      filter = Konva.Filters.Blur;
      image.blurRadius(options.blur || 10);
      break;
    case 'brighten':
      filter = Konva.Filters.Brighten;
      image.brightness(options.value || 0.1);
      break;
    case 'contrast':
      filter = Konva.Filters.Contrast;
      image.contrast(options.value || 10);
      break;
    case 'emboss':
      filter = Konva.Filters.Emboss;
      image.embossStrength(options.strength || 0.5);
      image.embossWhiteLevel(options.whiteLevel || 0.5);
      image.embossDirection(options.direction || 'top-left');
      image.embossBlend(options.blend || false);
      break;
    case 'enhance':
      filter = Konva.Filters.Enhance;
      image.enhance(options.value || 0.5);
      break;
    case 'noise':
      filter = Konva.Filters.Noise;
      image.noise(options.noise || 0.2);
      break;
    case 'pixelate':
      filter = Konva.Filters.Pixelate;
      image.pixelSize(options.pixelSize || 10);
      break;
    case 'threshold':
      filter = Konva.Filters.Threshold;
      image.threshold(options.threshold || 0.5);
      break;
    case 'rgb':
      filter = Konva.Filters.RGB;
      image.red(options.red !== undefined ? options.red : 1);
      image.green(options.green !== undefined ? options.green : 1);
      image.blue(options.blue !== undefined ? options.blue : 1);
      break;
    case 'hsv':
      filter = Konva.Filters.HSV;
      image.hue(options.hue || 0);
      image.saturation(options.saturation || 0);
      image.value(options.value || 0);
      break;
    case 'sepia':
      // Simulate sepia with multiple filters
      image.filters([Konva.Filters.Sepia]);
      image.cache();
      return;
    default:
      console.warn(`Filter type '${filterType}' not supported`);
      return;
  }
  
  // Get current filters
  const filters = image.filters() || [];
  
  // Check if filter already exists
  const filterExists = filters.indexOf(filter) !== -1;
  
  // If filter doesn't exist, add it
  if (!filterExists) {
    filters.push(filter);
    image.filters(filters);
  }
  
  // Cache the image to apply filters
  image.cache();
}
