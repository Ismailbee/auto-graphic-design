import { ref, computed } from 'vue';
import { useCanvasStore } from '../stores/canvas-konva';

export function useTemplates() {
  const canvasStore = useCanvasStore();
  
  const templates = ref([
    {
      id: 'social-post-square',
      name: 'Instagram Post',
      category: 'social',
      size: { width: 1080, height: 1080 },
      thumbnail: '/templates/instagram-post.jpg',
      elements: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 1080,
          height: 1080,
          fill: '#4f46e5'
        },
        {
          type: 'text',
          x: 540,
          y: 400,
          text: 'Your Content Here',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: 'white',
          align: 'center'
        }
      ]
    },
    {
      id: 'story-vertical',
      name: 'Instagram Story',
      category: 'social',
      size: { width: 1080, height: 1920 },
      thumbnail: '/templates/instagram-story.jpg',
      elements: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          type: 'text',
          x: 540,
          y: 960,
          text: 'Your Story',
          fontSize: 64,
          fontFamily: 'Arial',
          fill: 'white',
          align: 'center'
        }
      ]
    },
    {
      id: 'facebook-cover',
      name: 'Facebook Cover',
      category: 'social',
      size: { width: 1640, height: 859 },
      thumbnail: '/templates/facebook-cover.jpg',
      elements: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 1640,
          height: 859,
          fill: '#1877f2'
        },
        {
          type: 'text',
          x: 820,
          y: 430,
          text: 'Welcome to Our Page',
          fontSize: 56,
          fontFamily: 'Arial',
          fill: 'white',
          align: 'center'
        }
      ]
    },
    {
      id: 'youtube-thumbnail',
      name: 'YouTube Thumbnail',
      category: 'social',
      size: { width: 1280, height: 720 },
      thumbnail: '/templates/youtube-thumbnail.jpg',
      elements: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 1280,
          height: 720,
          fill: '#ff0000'
        },
        {
          type: 'text',
          x: 640,
          y: 360,
          text: 'VIDEO TITLE',
          fontSize: 48,
          fontFamily: 'Arial Black',
          fill: 'white',
          align: 'center',
          stroke: 'black',
          strokeWidth: 2
        }
      ]
    },
    {
      id: 'business-card',
      name: 'Business Card',
      category: 'business',
      size: { width: 1050, height: 600 },
      thumbnail: '/templates/business-card.jpg',
      elements: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 1050,
          height: 600,
          fill: 'white',
          stroke: '#e5e7eb',
          strokeWidth: 2
        },
        {
          type: 'text',
          x: 50,
          y: 150,
          text: 'John Doe',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#1f2937',
          fontStyle: 'bold'
        },
        {
          type: 'text',
          x: 50,
          y: 200,
          text: 'Creative Director',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#6b7280'
        },
        {
          type: 'text',
          x: 50,
          y: 400,
          text: 'email@company.com',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#4f46e5'
        }
      ]
    },
    {
      id: 'flyer-a4',
      name: 'Event Flyer',
      category: 'print',
      size: { width: 2480, height: 3508 },
      thumbnail: '/templates/event-flyer.jpg',
      elements: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 2480,
          height: 3508,
          fill: 'white'
        },
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 2480,
          height: 800,
          fill: '#4f46e5'
        },
        {
          type: 'text',
          x: 1240,
          y: 400,
          text: 'EVENT NAME',
          fontSize: 72,
          fontFamily: 'Arial Black',
          fill: 'white',
          align: 'center'
        }
      ]
    },
    {
      id: 'presentation-slide',
      name: 'Presentation Slide',
      category: 'presentation',
      size: { width: 1920, height: 1080 },
      thumbnail: '/templates/presentation-slide.jpg',
      elements: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          fill: 'white'
        },
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: 1920,
          height: 120,
          fill: '#1f2937'
        },
        {
          type: 'text',
          x: 100,
          y: 60,
          text: 'Slide Title',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: 'white'
        }
      ]
    },
    {
      id: 'logo-template',
      name: 'Logo Design',
      category: 'branding',
      size: { width: 800, height: 800 },
      thumbnail: '/templates/logo-template.jpg',
      elements: [
        {
          type: 'circle',
          x: 400,
          y: 400,
          radius: 200,
          fill: '#4f46e5',
          stroke: '#1e40af',
          strokeWidth: 4
        },
        {
          type: 'text',
          x: 400,
          y: 400,
          text: 'LOGO',
          fontSize: 48,
          fontFamily: 'Arial Black',
          fill: 'white',
          align: 'center'
        }
      ]
    }
  ]);

  const categories = computed(() => {
    const cats = new Set(templates.value.map(t => t.category));
    return Array.from(cats).map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: templates.value.filter(t => t.category === cat).length
    }));
  });

  const popularTemplates = computed(() => {
    return templates.value.slice(0, 6);
  });

  function getTemplatesByCategory(category) {
    if (!category || category === 'all') {
      return templates.value;
    }
    return templates.value.filter(t => t.category === category);
  }

  function getTemplateById(id) {
    return templates.value.find(t => t.id === id);
  }

  async function applyTemplate(templateId) {
    const template = getTemplateById(templateId);
    if (!template) return;

    try {
      // Clear current canvas
      canvasStore.clearCanvas();
      
      // Set canvas size
      canvasStore.setCanvasSize(template.size.width, template.size.height);
      
      // Add template elements
      for (const element of template.elements) {
        await addTemplateElement(element);
      }
      
      // Fit canvas to view
      canvasStore.fitToScreen();
      
      // Save state
      canvasStore.saveState();
      
      return true;
    } catch (error) {
      console.error('Error applying template:', error);
      return false;
    }
  }

  async function addTemplateElement(element) {
    switch (element.type) {
      case 'rect':
        return canvasStore.addRectangle({
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth
        });
        
      case 'circle':
        return canvasStore.addCircle({
          x: element.x,
          y: element.y,
          radius: element.radius,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth
        });
        
      case 'text':
        return canvasStore.addText({
          text: element.text,
          x: element.x,
          y: element.y,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth,
          align: element.align,
          fontStyle: element.fontStyle
        });
        
      case 'image':
        if (element.src) {
          return canvasStore.addImage({
            src: element.src,
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height
          });
        }
        break;
        
      default:
        console.warn('Unknown template element type:', element.type);
    }
  }

  function createCustomTemplate(name, category = 'custom') {
    const canvas = canvasStore.stage;
    if (!canvas) return null;

    const elements = [];
    
    // Convert current canvas objects to template format
    canvasStore.objects.forEach(obj => {
      const element = convertObjectToTemplateElement(obj);
      if (element) {
        elements.push(element);
      }
    });

    const template = {
      id: `custom-${Date.now()}`,
      name: name,
      category: category,
      size: {
        width: canvasStore.canvasWidth,
        height: canvasStore.canvasHeight
      },
      thumbnail: generateThumbnail(),
      elements: elements,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    templates.value.push(template);
    saveCustomTemplates();
    
    return template;
  }

  function convertObjectToTemplateElement(obj) {
    const attrs = obj.attrs || {};
    
    if (obj.className === 'Rect') {
      return {
        type: 'rect',
        x: attrs.x || 0,
        y: attrs.y || 0,
        width: attrs.width || 100,
        height: attrs.height || 100,
        fill: attrs.fill,
        stroke: attrs.stroke,
        strokeWidth: attrs.strokeWidth
      };
    }
    
    if (obj.className === 'Circle') {
      return {
        type: 'circle',
        x: attrs.x || 0,
        y: attrs.y || 0,
        radius: attrs.radius || 50,
        fill: attrs.fill,
        stroke: attrs.stroke,
        strokeWidth: attrs.strokeWidth
      };
    }
    
    if (obj.className === 'Text') {
      return {
        type: 'text',
        x: attrs.x || 0,
        y: attrs.y || 0,
        text: attrs.text || '',
        fontSize: attrs.fontSize || 16,
        fontFamily: attrs.fontFamily || 'Arial',
        fill: attrs.fill,
        stroke: attrs.stroke,
        strokeWidth: attrs.strokeWidth,
        align: attrs.align,
        fontStyle: attrs.fontStyle
      };
    }
    
    if (obj.className === 'Image') {
      return {
        type: 'image',
        x: attrs.x || 0,
        y: attrs.y || 0,
        width: attrs.width,
        height: attrs.height,
        src: obj.image()?.src
      };
    }
    
    return null;
  }

  function generateThumbnail() {
    if (!canvasStore.stage) return null;
    
    try {
      return canvasStore.stage.toDataURL({
        width: 200,
        height: 150,
        quality: 0.8
      });
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  function deleteCustomTemplate(templateId) {
    const index = templates.value.findIndex(t => t.id === templateId);
    if (index > -1 && templates.value[index].isCustom) {
      templates.value.splice(index, 1);
      saveCustomTemplates();
    }
  }

  function saveCustomTemplates() {
    const customTemplates = templates.value.filter(t => t.isCustom);
    localStorage.setItem('custom-templates', JSON.stringify(customTemplates));
  }

  function loadCustomTemplates() {
    try {
      const saved = localStorage.getItem('custom-templates');
      if (saved) {
        const customTemplates = JSON.parse(saved);
        customTemplates.forEach(template => {
          if (!templates.value.find(t => t.id === template.id)) {
            templates.value.push(template);
          }
        });
      }
    } catch (error) {
      console.error('Error loading custom templates:', error);
    }
  }

  // Load custom templates on init
  loadCustomTemplates();

  return {
    templates: computed(() => templates.value),
    categories,
    popularTemplates,
    getTemplatesByCategory,
    getTemplateById,
    applyTemplate,
    createCustomTemplate,
    deleteCustomTemplate
  };
}
