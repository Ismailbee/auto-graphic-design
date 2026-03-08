// src/data/templates.ts
import type { Template } from '@/types/auto-design'

/**
 * Template definitions for Auto Design
 * These define the structure and layout for each design category
 */

export const templates: Record<string, Template> = {
  'business-card': {
    id: 'business-card',
    name: 'Business Card',
    category: 'business-card',
    dimensions: {
      width: 3.5,
      height: 2,
      unit: 'in',
      dpi: 300
    },
    fields: [
      { name: 'name', type: 'text', label: 'Name', placeholder: 'John Doe', required: true },
      { name: 'title', type: 'text', label: 'Job Title', placeholder: 'CEO', required: true },
      { name: 'company', type: 'text', label: 'Company', placeholder: 'Company Name', required: true },
      { name: 'phone', type: 'text', label: 'Phone', placeholder: '+1 234 567 8900', required: false },
      { name: 'email', type: 'text', label: 'Email', placeholder: 'john@company.com', required: false },
      { name: 'website', type: 'text', label: 'Website', placeholder: 'www.company.com', required: false },
      { name: 'logo', type: 'image', label: 'Logo', required: false },
      { name: 'primaryColor', type: 'color', label: 'Primary Color', required: true },
      { name: 'secondaryColor', type: 'color', label: 'Secondary Color', required: true }
    ],
    layout: {
      layers: [
        {
          type: 'background',
          id: 'bg',
          x: 0,
          y: 0,
          width: 1050,
          height: 600,
          properties: { fill: 'primaryColor' }
        },
        {
          type: 'image',
          id: 'logo',
          x: 50,
          y: 50,
          width: 150,
          height: 150,
          properties: { src: 'logo', fit: 'contain' }
        },
        {
          type: 'text',
          id: 'name',
          x: 50,
          y: 250,
          width: 950,
          height: 80,
          properties: { 
            text: 'name', 
            fontSize: 48, 
            fontWeight: 'bold', 
            color: '#ffffff',
            align: 'left'
          }
        },
        {
          type: 'text',
          id: 'title',
          x: 50,
          y: 340,
          width: 950,
          height: 40,
          properties: { 
            text: 'title', 
            fontSize: 24, 
            color: 'secondaryColor',
            align: 'left'
          }
        },
        {
          type: 'text',
          id: 'contact',
          x: 50,
          y: 450,
          width: 950,
          height: 100,
          properties: { 
            text: 'phone | email | website', 
            fontSize: 18, 
            color: '#ffffff',
            align: 'left'
          }
        }
      ]
    },
    assets: {
      backgrounds: [],
      fonts: ['Arial', 'Helvetica', 'Roboto']
    },
    published: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'flyer': {
    id: 'flyer',
    name: 'Flyer',
    category: 'flyer',
    dimensions: {
      width: 8.5,
      height: 11,
      unit: 'in',
      dpi: 300
    },
    fields: [
      { name: 'title', type: 'text', label: 'Title', placeholder: 'Event Title', required: true },
      { name: 'subtitle', type: 'text', label: 'Subtitle', placeholder: 'Event Subtitle', required: false },
      { name: 'description', type: 'text', label: 'Description', placeholder: 'Event details...', required: true },
      { name: 'date', type: 'text', label: 'Date', placeholder: 'January 1, 2024', required: false },
      { name: 'location', type: 'text', label: 'Location', placeholder: 'Event Location', required: false },
      { name: 'image', type: 'image', label: 'Main Image', required: false },
      { name: 'logo', type: 'image', label: 'Logo', required: false },
      { name: 'primaryColor', type: 'color', label: 'Primary Color', required: true },
      { name: 'secondaryColor', type: 'color', label: 'Secondary Color', required: true }
    ],
    layout: {
      layers: [
        {
          type: 'background',
          id: 'bg',
          x: 0,
          y: 0,
          width: 2550,
          height: 3300,
          properties: { fill: '#ffffff' }
        },
        {
          type: 'image',
          id: 'mainImage',
          x: 0,
          y: 0,
          width: 2550,
          height: 1650,
          properties: { src: 'image', fit: 'cover' }
        },
        {
          type: 'shape',
          id: 'colorBar',
          x: 0,
          y: 1650,
          width: 2550,
          height: 200,
          properties: { fill: 'primaryColor' }
        },
        {
          type: 'text',
          id: 'title',
          x: 100,
          y: 1900,
          width: 2350,
          height: 200,
          properties: { 
            text: 'title', 
            fontSize: 96, 
            fontWeight: 'bold', 
            color: 'primaryColor',
            align: 'center'
          }
        },
        {
          type: 'text',
          id: 'subtitle',
          x: 100,
          y: 2150,
          width: 2350,
          height: 100,
          properties: { 
            text: 'subtitle', 
            fontSize: 48, 
            color: 'secondaryColor',
            align: 'center'
          }
        },
        {
          type: 'text',
          id: 'description',
          x: 200,
          y: 2350,
          width: 2150,
          height: 600,
          properties: { 
            text: 'description', 
            fontSize: 36, 
            color: '#333333',
            align: 'left'
          }
        },
        {
          type: 'image',
          id: 'logo',
          x: 1050,
          y: 3000,
          width: 450,
          height: 200,
          properties: { src: 'logo', fit: 'contain' }
        }
      ]
    },
    assets: {
      backgrounds: [],
      fonts: ['Arial', 'Helvetica', 'Roboto', 'Montserrat']
    },
    published: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'sticker': {
    id: 'sticker',
    name: 'Sticker',
    category: 'sticker',
    dimensions: {
      width: 3,
      height: 3,
      unit: 'in',
      dpi: 300
    },
    fields: [
      { name: 'text', type: 'text', label: 'Text', placeholder: 'Sticker Text', required: true },
      { name: 'image', type: 'image', label: 'Image', required: false },
      { name: 'primaryColor', type: 'color', label: 'Primary Color', required: true },
      { name: 'secondaryColor', type: 'color', label: 'Secondary Color', required: true }
    ],
    layout: {
      layers: [
        {
          type: 'background',
          id: 'bg',
          x: 0,
          y: 0,
          width: 900,
          height: 900,
          properties: { fill: 'primaryColor' }
        },
        {
          type: 'image',
          id: 'image',
          x: 150,
          y: 150,
          width: 600,
          height: 400,
          properties: { src: 'image', fit: 'contain' }
        },
        {
          type: 'text',
          id: 'text',
          x: 50,
          y: 600,
          width: 800,
          height: 250,
          properties: {
            text: 'text',
            fontSize: 72,
            fontWeight: 'bold',
            color: '#ffffff',
            align: 'center'
          }
        }
      ]
    },
    assets: {
      backgrounds: [],
      fonts: ['Arial', 'Helvetica', 'Roboto']
    },
    published: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'naming-ceremony': {
    id: 'naming-ceremony',
    name: 'Naming Ceremony',
    category: 'sticker',
    dimensions: {
      width: 10.24,
      height: 5.76,
      unit: 'in',
      dpi: 300
    },
    fields: [
      { name: 'subtitle', type: 'text', label: 'Subtitle', placeholder: 'Alhamdulillah on your', required: true },
      { name: 'title', type: 'text', label: 'Title', placeholder: 'Naming ceremony', required: true },
      { name: 'childName', type: 'text', label: 'Child Name (First)', placeholder: 'MUHAMMAD', required: true },
      { name: 'childFullName', type: 'text', label: 'Child Full Name', placeholder: 'AL-AMIN AHMAD', required: true },
      { name: 'date', type: 'text', label: 'Date', placeholder: '5TH', required: true },
      { name: 'month', type: 'text', label: 'Month', placeholder: 'OCTOBER', required: true },
      { name: 'year', type: 'text', label: 'Year', placeholder: '2025', required: true },
      { name: 'courtesy', type: 'text', label: 'Courtesy Text', placeholder: 'COURTESY: MUM', required: false },
      { name: 'babyImage', type: 'image', label: 'Baby Photo', required: true },
      { name: 'backgroundColor', type: 'color', label: 'Background Color', required: true },
      { name: 'primaryColor', type: 'color', label: 'Primary Color (Yellow)', required: true },
      { name: 'accentColor', type: 'color', label: 'Accent Color (Gold)', required: true }
    ],
    layout: {
      layers: [
        // Background - Maroon/Burgundy gradient
        {
          type: 'background',
          id: 'bg',
          x: 0,
          y: 0,
          width: 3072,
          height: 1728,
          properties: {
            fill: 'backgroundColor',
            gradient: {
              type: 'radial',
              colors: ['backgroundColor', '#5a1a2e'],
              stops: [0, 1]
            }
          }
        },

        // Decorative wave shapes (bottom left)
        {
          type: 'shape',
          id: 'wave1',
          x: -200,
          y: 1200,
          width: 1500,
          height: 600,
          properties: {
            shape: 'wave',
            fill: 'rgba(139, 0, 0, 0.3)',
            rotation: -15
          }
        },

        // Decorative wave shapes (bottom right - gold)
        {
          type: 'shape',
          id: 'wave2',
          x: 2000,
          y: 1100,
          width: 1200,
          height: 700,
          properties: {
            shape: 'wave',
            fill: 'accentColor',
            opacity: 0.8,
            rotation: 10
          }
        },

        // Stars decoration (top)
        {
          type: 'text',
          id: 'stars',
          x: 240,
          y: 80,
          width: 400,
          height: 60,
          properties: {
            text: '⭐ ⭐ ⭐ ⭐ ⭐',
            fontSize: 36,
            color: 'primaryColor',
            align: 'left'
          }
        },

        // Subtitle - "Alhamdulillah on your"
        {
          type: 'text',
          id: 'subtitle',
          x: 60,
          y: 150,
          width: 1200,
          height: 80,
          properties: {
            text: 'subtitle',
            fontSize: 64,
            fontWeight: '400',
            fontFamily: 'Brush Script MT, cursive',
            color: '#ffffff',
            align: 'left',
            fontStyle: 'italic'
          }
        },

        // Title - "Naming" (Yellow)
        {
          type: 'text',
          id: 'titlePart1',
          x: 60,
          y: 240,
          width: 1000,
          height: 150,
          properties: {
            text: 'title',
            fontSize: 120,
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black',
            color: 'primaryColor',
            align: 'left',
            textTransform: 'capitalize',
            letterSpacing: '2px'
          }
        },

        // Star decoration (after title)
        {
          type: 'text',
          id: 'starDecor',
          x: 220,
          y: 420,
          width: 100,
          height: 60,
          properties: {
            text: '⭐',
            fontSize: 48,
            color: 'primaryColor',
            align: 'center'
          }
        },

        // Child Name (First) - "MUHAMMAD" (White, Large)
        {
          type: 'text',
          id: 'childName',
          x: 60,
          y: 500,
          width: 1100,
          height: 120,
          properties: {
            text: 'childName',
            fontSize: 96,
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black',
            color: '#ffffff',
            align: 'left',
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }
        },

        // Child Full Name - "AL-AMIN AHMAD" (Yellow)
        {
          type: 'text',
          id: 'childFullName',
          x: 60,
          y: 630,
          width: 1100,
          height: 100,
          properties: {
            text: 'childFullName',
            fontSize: 72,
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black',
            color: 'primaryColor',
            align: 'left',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }
        },

        // Date Circle Background (White)
        {
          type: 'shape',
          id: 'dateCircle',
          x: 200,
          y: 800,
          width: 280,
          height: 280,
          properties: {
            shape: 'circle',
            fill: '#ffffff',
            stroke: 'accentColor',
            strokeWidth: 8,
            strokeDashArray: [15, 10]
          }
        },

        // Date - "5TH" (Orange/Red)
        {
          type: 'text',
          id: 'date',
          x: 200,
          y: 900,
          width: 280,
          height: 100,
          properties: {
            text: 'date',
            fontSize: 72,
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black',
            color: '#ff4500',
            align: 'center',
            textTransform: 'uppercase'
          }
        },

        // Month - "OCTOBER"
        {
          type: 'text',
          id: 'month',
          x: 200,
          y: 980,
          width: 280,
          height: 50,
          properties: {
            text: 'month',
            fontSize: 28,
            fontWeight: 'bold',
            fontFamily: 'Arial Black',
            color: '#000000',
            align: 'center',
            textTransform: 'uppercase'
          }
        },

        // Year - "2025"
        {
          type: 'text',
          id: 'year',
          x: 200,
          y: 1030,
          width: 280,
          height: 50,
          properties: {
            text: 'year',
            fontSize: 32,
            fontWeight: 'bold',
            fontFamily: 'Arial Black',
            color: '#000000',
            align: 'center'
          }
        },

        // Baby Photo - Circular frame with floral decoration
        {
          type: 'shape',
          id: 'photoFrame',
          x: 1600,
          y: 200,
          width: 900,
          height: 900,
          properties: {
            shape: 'circle',
            fill: '#ffffff',
            stroke: 'accentColor',
            strokeWidth: 12
          }
        },

        // Baby Photo
        {
          type: 'image',
          id: 'babyImage',
          x: 1650,
          y: 250,
          width: 800,
          height: 800,
          properties: {
            src: 'babyImage',
            fit: 'cover',
            borderRadius: '50%',
            clipPath: 'circle(50%)'
          }
        },

        // Floral decoration (top right of photo)
        {
          type: 'text',
          id: 'floral1',
          x: 2200,
          y: 150,
          width: 300,
          height: 200,
          properties: {
            text: '🌸',
            fontSize: 120,
            align: 'center',
            rotation: 25
          }
        },

        // Floral decoration (bottom left of photo)
        {
          type: 'text',
          id: 'floral2',
          x: 1500,
          y: 950,
          width: 300,
          height: 200,
          properties: {
            text: '🌺',
            fontSize: 100,
            align: 'center',
            rotation: -15
          }
        },

        // Courtesy text - "COURTESY: MUM" (Red on Yellow background)
        {
          type: 'shape',
          id: 'courtesyBg',
          x: 1400,
          y: 1350,
          width: 900,
          height: 120,
          properties: {
            shape: 'rect',
            fill: 'primaryColor',
            borderRadius: 10
          }
        },

        {
          type: 'text',
          id: 'courtesy',
          x: 1400,
          y: 1380,
          width: 900,
          height: 80,
          properties: {
            text: 'courtesy',
            fontSize: 48,
            fontWeight: 'bold',
            fontFamily: 'Arial Black',
            color: '#8b0000',
            align: 'center',
            textTransform: 'uppercase'
          }
        },

        // Decorative Islamic pattern (bottom right corner)
        {
          type: 'text',
          id: 'islamicPattern',
          x: 2700,
          y: 1400,
          width: 300,
          height: 300,
          properties: {
            text: '☪',
            fontSize: 80,
            color: 'accentColor',
            align: 'center',
            opacity: 0.3
          }
        }
      ]
    },
    assets: {
      backgrounds: [
        { id: 'default', url: '', color: '#8b1538' },
        { id: 'maroon', url: '', color: '#800020' },
        { id: 'burgundy', url: '', color: '#8b0000' },
        { id: 'wine', url: '', color: '#722f37' }
      ],
      fonts: ['Impact', 'Arial Black', 'Brush Script MT', 'Georgia']
    },
    published: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'default': {
    id: 'default',
    name: 'Default Template',
    category: 'default',
    dimensions: {
      width: 8.5,
      height: 11,
      unit: 'in',
      dpi: 300
    },
    fields: [
      { name: 'title', type: 'text', label: 'Title', placeholder: 'Title', required: true },
      { name: 'subtitle', type: 'text', label: 'Subtitle', placeholder: 'Subtitle', required: false },
      { name: 'description', type: 'text', label: 'Description', placeholder: 'Description', required: false },
      { name: 'primaryColor', type: 'color', label: 'Primary Color', required: true },
      { name: 'secondaryColor', type: 'color', label: 'Secondary Color', required: true }
    ],
    layout: {
      layers: [
        {
          type: 'background',
          id: 'bg',
          x: 0,
          y: 0,
          width: 2550,
          height: 3300,
          properties: { fill: '#ffffff' }
        },
        {
          type: 'text',
          id: 'title',
          x: 200,
          y: 500,
          width: 2150,
          height: 300,
          properties: { 
            text: 'title', 
            fontSize: 120, 
            fontWeight: 'bold', 
            color: 'primaryColor',
            align: 'center'
          }
        }
      ]
    },
    assets: {
      backgrounds: [],
      fonts: ['Arial']
    },
    published: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'freedom-ceremony': {
    id: 'freedom-ceremony',
    name: 'Freedom Ceremony',
    category: 'sticker',
    dimensions: {
      width: 10.24,
      height: 5.76,
      unit: 'in',
      dpi: 300
    },
    fields: [
      { name: 'firstName', type: 'text', label: 'First Name', placeholder: 'HANNATU', required: true },
      { name: 'lastName', type: 'text', label: 'Last Name', placeholder: 'MUSA', required: true },
      { name: 'date', type: 'text', label: 'Date', placeholder: '28th', required: true },
      { name: 'month', type: 'text', label: 'Month', placeholder: 'SEPTEMBER', required: true },
      { name: 'year', type: 'text', label: 'Year', placeholder: '2025', required: true },
      { name: 'outCee', type: 'text', label: 'Out-Cee', placeholder: 'MAI JAMA\'A FAMILY', required: true },
      { name: 'personImage', type: 'image', label: 'Person Photo', required: true },
      { name: 'primaryColor', type: 'color', label: 'Primary Color (Blue)', required: true },
      { name: 'accentColor', type: 'color', label: 'Accent Color (Yellow)', required: true },
      { name: 'redColor', type: 'color', label: 'Red Color', required: true }
    ],
    layout: {
      layers: [
        // Background - White
        {
          type: 'background',
          id: 'bg',
          x: 0,
          y: 0,
          width: 3072,
          height: 1728,
          properties: {
            fill: '#f5f5f5'
          }
        },

        // Dark blue wave shape (bottom left)
        {
          type: 'shape',
          id: 'waveBlue1',
          x: -100,
          y: 400,
          width: 2000,
          height: 1400,
          properties: {
            shape: 'custom',
            fill: '#2c5f7c',
            path: 'M 0,200 Q 500,100 1000,200 T 2000,200 L 2000,1400 L 0,1400 Z'
          }
        },

        // Teal wave shape (middle)
        {
          type: 'shape',
          id: 'waveTeal',
          x: -50,
          y: 500,
          width: 2200,
          height: 1300,
          properties: {
            shape: 'custom',
            fill: '#3d7a8f',
            path: 'M 0,300 Q 600,200 1200,300 T 2200,300 L 2200,1300 L 0,1300 Z'
          }
        },

        // Dark teal wave shape (bottom)
        {
          type: 'shape',
          id: 'waveDarkTeal',
          x: 0,
          y: 600,
          width: 2400,
          height: 1200,
          properties: {
            shape: 'custom',
            fill: '#1e4d5f',
            path: 'M 0,400 Q 700,300 1400,400 T 2400,400 L 2400,1200 L 0,1200 Z'
          }
        },

        // Yellow circular accent (top right)
        {
          type: 'shape',
          id: 'yellowCircle',
          x: 2200,
          y: -200,
          width: 1000,
          height: 1000,
          properties: {
            shape: 'circle',
            fill: 'accentColor',
            opacity: 0.9
          }
        },

        // Stars decoration
        {
          type: 'text',
          id: 'stars',
          x: 240,
          y: 320,
          width: 300,
          height: 50,
          properties: {
            text: '⭐ ⭐ ⭐',
            fontSize: 32,
            color: 'accentColor',
            align: 'left'
          }
        },

        // "Alhamdulillah" - Script font
        {
          type: 'text',
          id: 'alhamdulillah',
          x: 100,
          y: 80,
          width: 900,
          height: 100,
          properties: {
            text: 'Alhamdulillah',
            fontSize: 72,
            fontWeight: '400',
            fontFamily: 'Brush Script MT, cursive',
            color: '#2c5f7c',
            align: 'left',
            fontStyle: 'italic'
          }
        },

        // "ON YOUR" - Small text
        {
          type: 'text',
          id: 'onYour',
          x: 270,
          y: 140,
          width: 400,
          height: 50,
          properties: {
            text: 'ON YOUR',
            fontSize: 32,
            fontWeight: '600',
            fontFamily: 'Arial, sans-serif',
            color: '#2c5f7c',
            align: 'left',
            letterSpacing: 2
          }
        },

        // "FREEDOM" - Large blue text
        {
          type: 'text',
          id: 'freedom',
          x: 120,
          y: 180,
          width: 900,
          height: 120,
          properties: {
            text: 'FREEDOM',
            fontSize: 96,
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: 'primaryColor',
            align: 'left',
            letterSpacing: 3
          }
        },

        // "CEREMONY" - Large red text
        {
          type: 'text',
          id: 'ceremony',
          x: 175,
          y: 280,
          width: 900,
          height: 100,
          properties: {
            text: 'CEREMONY',
            fontSize: 80,
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: 'redColor',
            align: 'left',
            letterSpacing: 3
          }
        },

        // First Name - "HANNATU" (white)
        {
          type: 'text',
          id: 'firstName',
          x: 100,
          y: 380,
          width: 800,
          height: 120,
          properties: {
            text: 'firstName',
            fontSize: 88,
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: '#ffffff',
            align: 'left',
            letterSpacing: 2
          }
        },

        // Last Name - "MUSA" (yellow)
        {
          type: 'text',
          id: 'lastName',
          x: 160,
          y: 460,
          width: 800,
          height: 100,
          properties: {
            text: 'lastName',
            fontSize: 88,
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: 'accentColor',
            align: 'left',
            letterSpacing: 2,
            stroke: '#2c5f7c',
            strokeWidth: 2
          }
        },

        // Date badge background circle
        {
          type: 'shape',
          id: 'dateBadgeCircle',
          x: 450,
          y: 420,
          width: 280,
          height: 280,
          properties: {
            shape: 'circle',
            fill: '#ffffff',
            stroke: 'accentColor',
            strokeWidth: 8
          }
        },

        // Date badge - "28th"
        {
          type: 'text',
          id: 'date',
          x: 470,
          y: 460,
          width: 240,
          height: 70,
          properties: {
            text: 'date',
            fontSize: 56,
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: '#2c5f7c',
            align: 'center'
          }
        },

        // Date badge - "SEPTEMBER,"
        {
          type: 'text',
          id: 'month',
          x: 470,
          y: 530,
          width: 240,
          height: 50,
          properties: {
            text: 'month,',
            fontSize: 24,
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            color: '#2c5f7c',
            align: 'center'
          }
        },

        // Date badge - "2025"
        {
          type: 'text',
          id: 'year',
          x: 470,
          y: 580,
          width: 240,
          height: 50,
          properties: {
            text: 'year',
            fontSize: 32,
            fontWeight: 'bold',
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: '#2c5f7c',
            align: 'center'
          }
        },

        // Decorative line above date badge
        {
          type: 'shape',
          id: 'dateLine',
          x: 500,
          y: 520,
          width: 180,
          height: 3,
          properties: {
            shape: 'rectangle',
            fill: 'accentColor'
          }
        },

        // "OUT-CEE:" label
        {
          type: 'text',
          id: 'outCeeLabel',
          x: 200,
          y: 520,
          width: 300,
          height: 50,
          properties: {
            text: 'OUT-CEE:',
            fontSize: 28,
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'left',
            letterSpacing: 1
          }
        },

        // "MAI JAMA'A FAMILY"
        {
          type: 'text',
          id: 'outCee',
          x: 130,
          y: 560,
          width: 700,
          height: 60,
          properties: {
            text: 'outCee',
            fontSize: 36,
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'left',
            letterSpacing: 2
          }
        },

        // Person's photo (right side)
        {
          type: 'image',
          id: 'personImage',
          x: 1800,
          y: 200,
          width: 1100,
          height: 1400,
          properties: {
            src: 'personImage',
            fit: 'cover',
            clipPath: 'circle'
          }
        }
      ]
    },
    assets: {
      backgrounds: [
        { id: 'default', url: '', color: '#f5f5f5' }
      ],
      fonts: ['Impact', 'Arial Black', 'Brush Script MT', 'Arial']
    },
    published: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

/**
 * Get template by category
 */
export function getTemplate(category: string): Template {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')
  return templates[normalizedCategory] || templates['default']
}

/**
 * Get all templates
 */
export function getAllTemplates(): Template[] {
  return Object.values(templates)
}

