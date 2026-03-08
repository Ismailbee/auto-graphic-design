import { ref } from 'vue';
import { useCanvasStore } from '../stores/canvas-konva';

export function useExport() {
  const canvasStore = useCanvasStore();
  const isExporting = ref(false);

  const exportFormats = [
    {
      id: 'png',
      name: 'PNG',
      extension: '.png',
      mimeType: 'image/png',
      quality: 1.0,
      transparent: true,
      description: 'High quality with transparency support'
    },
    {
      id: 'jpg',
      name: 'JPEG',
      extension: '.jpg',
      mimeType: 'image/jpeg',
      quality: 0.9,
      transparent: false,
      description: 'Compressed format, smaller file size'
    },
    {
      id: 'webp',
      name: 'WebP',
      extension: '.webp',
      mimeType: 'image/webp',
      quality: 0.9,
      transparent: true,
      description: 'Modern format with excellent compression'
    },
    {
      id: 'svg',
      name: 'SVG',
      extension: '.svg',
      mimeType: 'image/svg+xml',
      quality: 1.0,
      transparent: true,
      description: 'Vector format, scalable without quality loss'
    },
    {
      id: 'pdf',
      name: 'PDF',
      extension: '.pdf',
      mimeType: 'application/pdf',
      quality: 1.0,
      transparent: false,
      description: 'Document format, perfect for printing'
    }
  ];

  const exportSizes = [
    {
      id: 'original',
      name: 'Original Size',
      multiplier: 1,
      description: 'Canvas dimensions'
    },
    {
      id: 'thumbnail',
      name: 'Thumbnail',
      width: 300,
      height: 200,
      description: 'Small preview size'
    },
    {
      id: 'web',
      name: 'Web (1920px)',
      width: 1920,
      description: 'Optimized for web display'
    },
    {
      id: 'print-300dpi',
      name: 'Print (300 DPI)',
      multiplier: 3.75, // 300/80 = 3.75 (80 DPI is web standard)
      description: 'High resolution for printing'
    },
    {
      id: 'social-square',
      name: 'Social Square',
      width: 1080,
      height: 1080,
      description: 'Instagram post format'
    },
    {
      id: 'social-story',
      name: 'Social Story',
      width: 1080,
      height: 1920,
      description: 'Instagram story format'
    },
    {
      id: 'custom',
      name: 'Custom Size',
      description: 'Specify dimensions manually'
    }
  ];

  const qualityOptions = [
    { value: 1.0, label: 'Maximum (100%)', fileSize: 'Largest' },
    { value: 0.9, label: 'High (90%)', fileSize: 'Large' },
    { value: 0.8, label: 'Good (80%)', fileSize: 'Medium' },
    { value: 0.7, label: 'Standard (70%)', fileSize: 'Small' },
    { value: 0.5, label: 'Low (50%)', fileSize: 'Smallest' }
  ];

  async function exportCanvas(options = {}) {
    if (!canvasStore.stage) {
      throw new Error('No canvas available for export');
    }

    isExporting.value = true;

    try {
      const {
        format = 'png',
        quality = 1.0,
        width,
        height,
        multiplier = 1,
        transparent = true,
        filename = 'design'
      } = options;

      // Calculate export dimensions
      const exportDimensions = calculateExportDimensions(width, height, multiplier);
      
      // Export based on format
      let dataUrl;
      let blob;

      switch (format) {
        case 'svg':
          blob = await exportAsSVG(exportDimensions);
          break;
        case 'pdf':
          blob = await exportAsPDF(exportDimensions);
          break;
        default:
          dataUrl = await exportAsImage(format, quality, exportDimensions, transparent);
          blob = dataUrlToBlob(dataUrl);
      }

      // Generate filename
      const formatInfo = exportFormats.find(f => f.id === format);
      const finalFilename = `${filename}${formatInfo.extension}`;

      // Download the file
      downloadBlob(blob, finalFilename);

      return {
        success: true,
        filename: finalFilename,
        size: blob.size,
        dimensions: exportDimensions
      };

    } catch (error) {
      console.error('Export error:', error);
      throw error;
    } finally {
      isExporting.value = false;
    }
  }

  function calculateExportDimensions(width, height, multiplier) {
    if (width && height) {
      return { width, height };
    }

    const canvasWidth = canvasStore.canvasWidth;
    const canvasHeight = canvasStore.canvasHeight;

    if (width && !height) {
      const aspectRatio = canvasHeight / canvasWidth;
      return { width, height: width * aspectRatio };
    }

    if (height && !width) {
      const aspectRatio = canvasWidth / canvasHeight;
      return { width: height * aspectRatio, height };
    }

    return {
      width: canvasWidth * multiplier,
      height: canvasHeight * multiplier
    };
  }

  async function exportAsImage(format, quality, dimensions, transparent) {
    const { width, height } = dimensions;
    
    return canvasStore.stage.toDataURL({
      mimeType: `image/${format}`,
      quality: quality,
      width: width,
      height: height,
      pixelRatio: 1
    });
  }

  async function exportAsSVG(dimensions) {
    // For SVG export, we need to recreate the canvas content as SVG
    const svg = createSVGFromCanvas(dimensions);
    return new Blob([svg], { type: 'image/svg+xml' });
  }

  function createSVGFromCanvas(dimensions) {
    const { width, height } = dimensions;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Convert each canvas object to SVG
    canvasStore.objects.forEach(obj => {
      svg += convertObjectToSVG(obj);
    });
    
    svg += '</svg>';
    return svg;
  }

  function convertObjectToSVG(obj) {
    const attrs = obj.attrs || {};
    
    if (obj.className === 'Rect') {
      return `<rect x="${attrs.x || 0}" y="${attrs.y || 0}" width="${attrs.width || 0}" height="${attrs.height || 0}" fill="${attrs.fill || 'transparent'}" stroke="${attrs.stroke || 'none'}" stroke-width="${attrs.strokeWidth || 0}" />`;
    }
    
    if (obj.className === 'Circle') {
      return `<circle cx="${attrs.x || 0}" cy="${attrs.y || 0}" r="${attrs.radius || 0}" fill="${attrs.fill || 'transparent'}" stroke="${attrs.stroke || 'none'}" stroke-width="${attrs.strokeWidth || 0}" />`;
    }
    
    if (obj.className === 'Text') {
      return `<text x="${attrs.x || 0}" y="${attrs.y || 0}" font-family="${attrs.fontFamily || 'Arial'}" font-size="${attrs.fontSize || 16}" fill="${attrs.fill || 'black'}" text-anchor="${attrs.align === 'center' ? 'middle' : 'start'}">${attrs.text || ''}</text>`;
    }
    
    if (obj.className === 'Image' && obj.image()) {
      return `<image x="${attrs.x || 0}" y="${attrs.y || 0}" width="${attrs.width || 0}" height="${attrs.height || 0}" href="${obj.image().src}" />`;
    }
    
    return '';
  }

  async function exportAsPDF(dimensions) {
    // For PDF export, we'll use jsPDF library
    // This is a simplified implementation - you'd need to install jsPDF
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const ctx = canvas.getContext('2d');
    
    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Get canvas as image and convert to PDF
    const imageData = canvasStore.stage.toDataURL({
      width: dimensions.width,
      height: dimensions.height,
      pixelRatio: 1
    });
    
    // For now, we'll just export as PNG and let the user handle PDF conversion
    // In a real implementation, you'd use jsPDF here
    return dataUrlToBlob(imageData);
  }

  function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(',');
    const mimeType = parts[0].match(/:(.*?);/)[1];
    const binaryString = atob(parts[1]);
    const arrayBuffer = new ArrayBuffer(binaryString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    return new Blob([arrayBuffer], { type: mimeType });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function exportMultiple(exports) {
    const results = [];
    
    for (const exportConfig of exports) {
      try {
        const result = await exportCanvas(exportConfig);
        results.push({ ...result, config: exportConfig });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message, 
          config: exportConfig 
        });
      }
    }
    
    return results;
  }

  function getOptimalFormat(useCase) {
    switch (useCase) {
      case 'web':
        return 'webp';
      case 'print':
        return 'pdf';
      case 'social':
        return 'jpg';
      case 'transparent':
        return 'png';
      case 'vector':
        return 'svg';
      default:
        return 'png';
    }
  }

  function estimateFileSize(format, quality, dimensions) {
    const { width, height } = dimensions;
    const pixels = width * height;
    
    // Rough estimates in bytes
    switch (format) {
      case 'png':
        return pixels * 4; // 4 bytes per pixel (RGBA)
      case 'jpg':
        return pixels * quality * 0.5; // Compressed
      case 'webp':
        return pixels * quality * 0.3; // Better compression
      case 'svg':
        return canvasStore.objects.length * 200; // Rough estimate
      case 'pdf':
        return pixels * 2; // Depends on content
      default:
        return pixels * 3;
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return {
    exportFormats,
    exportSizes,
    qualityOptions,
    isExporting,
    exportCanvas,
    exportMultiple,
    getOptimalFormat,
    estimateFileSize,
    formatFileSize
  };
}
