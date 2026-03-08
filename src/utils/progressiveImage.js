/**
 * Progressive Image Loading Utility
 * 
 * This utility implements progressive image loading techniques to improve perceived performance.
 * It loads a low-quality placeholder first, then loads the high-quality image in the background.
 */

/**
 * Create a low-quality placeholder from an image
 * 
 * @param {File|Blob|String} imageSource - Image source (File, Blob, or URL)
 * @param {Object} options - Options for placeholder generation
 * @returns {Promise<string>} - Data URL of the low quality placeholder
 */
export async function createImagePlaceholder(imageSource, options = {}) {
  const {
    width = 20,      // Tiny width for placeholder
    quality = 0.1,   // Very low quality
    blur = 10        // Blur amount in pixels
  } = options;
  
  // Create an image element
  const img = await loadImage(imageSource);
  
  // Calculate aspect ratio
  const aspectRatio = img.width / img.height;
  const height = Math.round(width / aspectRatio);
  
  // Create a tiny version
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  
  // Create data URL
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Load an image from various sources
 * 
 * @param {File|Blob|String} source - Image source
 * @returns {Promise<HTMLImageElement>} - Loaded image element
 */
function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    
    if (typeof source === 'string') {
      // Source is already a URL
      img.src = source;
    } else if (source instanceof File || source instanceof Blob) {
      // Source is a File or Blob, create object URL
      img.src = URL.createObjectURL(source);
    } else {
      reject(new Error('Invalid image source'));
    }
  });
}

/**
 * Load an image progressively with a placeholder
 * 
 * @param {File|Blob|String} imageSource - Image source
 * @param {Function} onPlaceholder - Callback when placeholder is ready
 * @param {Function} onFull - Callback when full image is ready
 * @param {Object} options - Options for placeholder generation
 */
export function loadProgressiveImage(imageSource, onPlaceholder, onFull, options = {}) {
  // Generate placeholder
  createImagePlaceholder(imageSource, options)
    .then(placeholderUrl => {
      // Call placeholder callback
      if (onPlaceholder) onPlaceholder(placeholderUrl);
      
      // For File/Blob sources, we need to convert to URL
      let fullImageUrl;
      if (typeof imageSource === 'string') {
        fullImageUrl = imageSource;
      } else if (imageSource instanceof File || imageSource instanceof Blob) {
        fullImageUrl = URL.createObjectURL(imageSource);
      }
      
      // Preload the full image
      const fullImg = new Image();
      fullImg.onload = () => {
        if (onFull) onFull(fullImageUrl);
        
        // Cleanup any object URLs we created
        if (imageSource instanceof File || imageSource instanceof Blob) {
          // Set a timeout to ensure the image has been painted
          setTimeout(() => URL.revokeObjectURL(fullImageUrl), 1000);
        }
      };
      fullImg.src = fullImageUrl;
    })
    .catch(err => {
      console.error('Error creating image placeholder:', err);
      
      // Fallback to direct loading
      if (onFull) {
        if (typeof imageSource === 'string') {
          onFull(imageSource);
        } else if (imageSource instanceof File || imageSource instanceof Blob) {
          const url = URL.createObjectURL(imageSource);
          onFull(url);
        }
      }
    });
}

/**
 * Create CSS for a blurred placeholder
 * 
 * @param {string} url - Placeholder image URL
 * @param {number} blur - Blur amount in pixels
 * @returns {string} - CSS style string
 */
export function createBlurredPlaceholderCSS(url, blur = 10) {
  return `
    background-image: url(${url});
    background-size: cover;
    background-position: center;
    filter: blur(${blur}px);
  `;
}

/**
 * Create a Vue directive for progressive image loading
 * 
 * @returns {Object} - Vue directive
 */
export function createProgressiveImageDirective() {
  return {
    mounted(el, binding) {
      // Add placeholder class
      el.classList.add('progressive-image-container');
      
      // Create placeholder and full image elements
      const placeholder = document.createElement('div');
      placeholder.className = 'progressive-image-placeholder';
      
      const fullImage = document.createElement('img');
      fullImage.className = 'progressive-image-full';
      fullImage.style.opacity = 0;
      
      // Add elements to container
      el.appendChild(placeholder);
      el.appendChild(fullImage);
      
      // Load progressively
      loadProgressiveImage(
        binding.value,
        (placeholderUrl) => {
          // Apply placeholder
          placeholder.style.backgroundImage = `url(${placeholderUrl})`;
          placeholder.style.filter = 'blur(10px)';
        },
        (fullUrl) => {
          // Load full image
          fullImage.onload = () => {
            // Fade in full image
            fullImage.style.transition = 'opacity 0.3s ease';
            fullImage.style.opacity = 1;
            
            // Fade out placeholder
            setTimeout(() => {
              placeholder.style.opacity = 0;
            }, 300);
          };
          fullImage.src = fullUrl;
        }
      );
    }
  };
}

/**
 * Vue composable for using progressive images
 */
export function useProgressiveImage() {
  return {
    createImagePlaceholder,
    loadProgressiveImage,
    createBlurredPlaceholderCSS
  };
}
