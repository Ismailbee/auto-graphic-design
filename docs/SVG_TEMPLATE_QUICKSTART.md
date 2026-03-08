# SVG Template Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide shows you how to use the professional SVG layering system with your exported background.

---

## 📁 Files Created

```
src/
├── services/
│   ├── svg-layout.service.ts          # Core layout manager
│   ├── text-editing.service.ts        # Inline text editing
│   └── wedding-template.preset.ts     # Pre-configured templates
├── components/
│   └── WeddingTemplateCanvas.vue      # Example component
docs/
├── PROFESSIONAL_LAYERING_GUIDE.md     # Best practices
└── SVG_TEMPLATE_QUICKSTART.md         # This file
```

---

## 🎨 Basic Usage

### 1. Import the Services

```typescript
import { SvgLayoutManager } from '@/services/svg-layout.service'
import { TextEditingService } from '@/services/text-editing.service'
import { createWeddingTemplate } from '@/services/wedding-template.preset'
```

### 2. Initialize in Your Component

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Konva from 'konva'

const stageRef = ref<any>(null)
let layoutManager: SvgLayoutManager | null = null
let textEditor: TextEditingService | null = null

onMounted(async () => {
  const stage = stageRef.value.getNode() as Konva.Stage
  
  // Create layout manager
  layoutManager = new SvgLayoutManager(stage, {
    width: 1024,
    height: 576,
    backgroundColor: '#f5f5f5'
  })
  
  // Enable text editing
  textEditor = new TextEditingService(stage)
  textEditor.enableTransformer(layoutManager.getLayers().text)
  
  // Load your SVG background
  await layoutManager.loadSvgBackground('/your-background.svg', 'cover')
  
  // Add text placeholders
  layoutManager.addTextPlaceholder({
    id: 'main_text',
    text: 'Alhamdulillah on your wedding',
    x: 0.5,  // Center horizontally
    y: 0.3,  // 30% from top
    fontSize: 48,
    fill: '#183C54',
    align: 'center'
  })
})
</script>

<template>
  <v-stage ref="stageRef" :config="{ width: 1024, height: 576 }" />
</template>
```

---

## 🎯 Using Pre-built Templates

### Wedding Template

```typescript
await createWeddingTemplate(layoutManager, {
  backgroundUrl: '/templates/freedom-ceremony-preview.svg',
  mainMessage: 'Alhamdulillah on your wedding',
  coupleName: 'HANNATU MUSA',
  date: '28 September, 2025',
  outCeeName: 'OUT-CEE: MAI JAMA\'A FAMILY'
})
```

### Freedom Ceremony Template

```typescript
await createFreedomCeremonyTemplate(layoutManager, {
  backgroundUrl: '/templates/freedom-ceremony-preview.svg',
  coupleName: 'HANNATU MUSA',
  date: '28th SEPTEMBER 2025',
  outCeeName: 'MAI JAMA\'A FAMILY'
})
```

---

## 🖼️ Adding Your SVG Background

### Step 1: Export Your SVG

Save your design background as an SVG file:
- `public/templates/my-background.svg`

### Step 2: Load It

```typescript
await layoutManager.loadSvgBackground(
  '/templates/my-background.svg',
  'cover'  // or 'contain' or 'fill'
)
```

### Object-Fit Options:

- **`cover`**: Fill entire canvas (crop if needed) - **Recommended**
- **`contain`**: Fit inside canvas (show all content)
- **`fill`**: Stretch to fit

---

## ✍️ Adding Text Elements

### Basic Text

```typescript
layoutManager.addTextPlaceholder({
  id: 'my_text',           // Unique ID
  text: 'Hello World',     // Initial text
  x: 0.5,                  // 0-1 (0.5 = center)
  y: 0.5,                  // 0-1 (0.5 = middle)
  fontSize: 32,
  fill: '#000000',
  align: 'center'
})
```

### Styled Text

```typescript
layoutManager.addTextPlaceholder({
  id: 'couple_name',
  text: 'HANNATU & MUSA',
  x: 0.5,
  y: 0.5,
  fontSize: 64,
  fontFamily: 'Arial Black',
  fontStyle: 'bold',
  fill: '#FFFFFF',
  align: 'center',
  width: 800,              // Fixed width
  draggable: true,         // Can be moved
  editable: true           // Can be edited
})
```

### Positioning Guide

```
x: 0.0 = Left edge
x: 0.5 = Center
x: 1.0 = Right edge

y: 0.0 = Top edge
y: 0.5 = Middle
y: 1.0 = Bottom edge
```

---

## 🎨 Adding Decorative Assets

### SVG Icons, Ribbons, Stickers

```typescript
await layoutManager.addSvgAsset({
  id: 'ribbon',
  url: '/assets/ribbon.svg',
  x: 0.5,                  // Center horizontally
  y: 0.8,                  // Near bottom
  scale: 0.5,              // 50% size
  rotation: 15,            // 15 degrees
  draggable: true
})
```

### Multiple Assets

```typescript
const assets = [
  { id: 'star1', url: '/assets/star.svg', x: 0.2, y: 0.3, scale: 0.3 },
  { id: 'star2', url: '/assets/star.svg', x: 0.8, y: 0.3, scale: 0.3 },
  { id: 'heart', url: '/assets/heart.svg', x: 0.5, y: 0.9, scale: 0.4 }
]

for (const asset of assets) {
  await layoutManager.addSvgAsset(asset)
}
```

---

## 🎛️ Interactive Features

### Text Editing

- **Double-click** any text to edit
- **Escape** to cancel
- **Ctrl+Enter** to save
- **Click outside** to auto-save

### Dragging

- **Click and drag** text or assets to reposition
- Positions are automatically saved in normalized coordinates

### Selection

- **Single click** to select (shows resize handles)
- **Drag handles** to resize text width

---

## 📐 Alignment Guides

### Show/Hide Guides

```typescript
layoutManager.toggleGuides(true)   // Show
layoutManager.toggleGuides(false)  // Hide
```

Guides show:
- Vertical center line
- Horizontal center line

---

## 💾 Export & Save

### Export Layout as JSON

```typescript
const layout = layoutManager.exportLayout()
console.log(layout)

// Save to file
const json = JSON.stringify(layout, null, 2)
const blob = new Blob([json], { type: 'application/json' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'my-template.json'
a.click()
```

### Export as Image

```typescript
const stage = layoutManager.stage

// PNG export
const dataURL = stage.toDataURL({
  pixelRatio: 3,           // 3x resolution
  mimeType: 'image/png'
})

// Download
const link = document.createElement('a')
link.download = 'design.png'
link.href = dataURL
link.click()
```

---

## 🔧 Advanced Features

### Update Text Programmatically

```typescript
layoutManager.updateText('main_text', 'New text content')
```

### Get Text Node

```typescript
const textNode = layoutManager.getTextNode('main_text')
textNode?.fontSize(64)
textNode?.fill('#FF0000')
```

### Clear Everything

```typescript
layoutManager.clear()
```

### Access Layers

```typescript
const layers = layoutManager.getLayers()
layers.background  // Background layer
layers.assets      // Assets layer
layers.text        // Text layer
layers.guides      // Guides layer
```

---

## 📱 Responsive Design

The layout automatically adapts to different canvas sizes because it uses **normalized coordinates** (0-1).

```typescript
// Resize canvas
layoutManager.stage.width(1920)
layoutManager.stage.height(1080)

// Text positions automatically adjust!
```

---

## 🎨 Color Palette (From Your Design)

```typescript
const colors = {
  darkBlue: '#183C54',    // Main blue from waves
  teal: '#2C7A8C',        // Lighter wave
  yellow: '#FFD700',      // Accent color
  white: '#FFFFFF',       // Text on dark areas
  red: '#DC143C'          // Ceremony text
}
```

---

## 📝 Complete Example

```vue
<template>
  <div class="canvas-wrapper">
    <button @click="toggleGuides">Toggle Guides</button>
    <button @click="exportImage">Export PNG</button>
    <v-stage ref="stageRef" :config="stageConfig" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SvgLayoutManager } from '@/services/svg-layout.service'
import { TextEditingService } from '@/services/text-editing.service'

const stageRef = ref<any>(null)
const stageConfig = { width: 1024, height: 576 }

let layoutManager: SvgLayoutManager
let textEditor: TextEditingService

onMounted(async () => {
  const stage = stageRef.value.getNode()
  
  layoutManager = new SvgLayoutManager(stage, stageConfig)
  textEditor = new TextEditingService(stage)
  textEditor.enableTransformer(layoutManager.getLayers().text)
  
  // Load background
  await layoutManager.loadSvgBackground('/templates/my-bg.svg', 'cover')
  
  // Add text
  layoutManager.addTextPlaceholder({
    id: 'title',
    text: 'Alhamdulillah',
    x: 0.5,
    y: 0.3,
    fontSize: 48,
    fill: '#183C54',
    align: 'center'
  })
})

function toggleGuides() {
  layoutManager.toggleGuides(true)
}

function exportImage() {
  const dataURL = stageRef.value.getNode().toDataURL({ pixelRatio: 3 })
  const link = document.createElement('a')
  link.download = 'design.png'
  link.href = dataURL
  link.click()
}
</script>
```

---

## 🆘 Troubleshooting

### SVG Not Loading

- Check file path is correct
- Ensure SVG is in `public/` folder
- Check browser console for CORS errors

### Text Not Editable

- Make sure `TextEditingService` is initialized
- Check `editable: true` in text config
- Verify double-click event is working

### Positioning Issues

- Use normalized coordinates (0-1)
- Check `align: 'center'` for centered text
- Verify `offsetX` is set for centering

---

## 📚 Next Steps

1. ✅ Load your SVG background
2. ✅ Add text placeholders
3. ✅ Test editing and dragging
4. ✅ Add decorative assets
5. ✅ Export your design

**Read the full guide**: `docs/PROFESSIONAL_LAYERING_GUIDE.md`

---

## 🎉 You're Ready!

Your professional SVG layering system is ready to use. Start creating beautiful designs!

