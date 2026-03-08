# Professional SVG Layering & Text Positioning Guide

## How Professional Design Editors Handle SVG Backgrounds

This guide documents best practices from Canva, Fotor, Adobe Express, and other professional design tools.

---

## 1. Layer Architecture

### Professional Layer Stack (Bottom to Top)

```
┌─────────────────────────────────┐
│  Guides Layer (Optional)        │  ← Alignment guides, rulers
├─────────────────────────────────┤
│  Text Layer                     │  ← All text elements
├─────────────────────────────────┤
│  Assets Layer                   │  ← Icons, stickers, decorations
├─────────────────────────────────┤
│  Background Layer (Locked)      │  ← SVG/image background
└─────────────────────────────────┘
```

### Key Principles:

1. **Background Layer**
   - Always locked (listening: false)
   - Non-interactive
   - Fills entire canvas using object-fit: cover
   - Can be swapped without affecting other layers

2. **Assets Layer**
   - Draggable decorative elements
   - SVG icons, ribbons, shapes
   - Each asset centered on its anchor point
   - Supports rotation and scaling

3. **Text Layer**
   - All text elements
   - Fully interactive (draggable, editable, resizable)
   - Uses Transformer for selection handles
   - Supports inline editing on double-click

4. **Guides Layer**
   - Toggle-able alignment guides
   - Center lines (vertical/horizontal)
   - Safe margins
   - Snap-to-guide functionality

---

## 2. Coordinate System

### Normalized Coordinates (0-1)

Professional editors use **normalized coordinates** for positioning:

```typescript
// Instead of absolute pixels:
text.x(512)  // ❌ Breaks on resize

// Use normalized coordinates:
text.x(stage.width() * 0.5)  // ✅ Always centered
```

### Benefits:
- **Responsive**: Layout adapts to canvas size
- **Portable**: Same layout works at any resolution
- **Scalable**: Easy to export at different sizes

### Implementation:

```typescript
interface NormalizedPosition {
  x: number  // 0.0 = left, 0.5 = center, 1.0 = right
  y: number  // 0.0 = top, 0.5 = middle, 1.0 = bottom
}

function positionElement(element: Konva.Node, pos: NormalizedPosition) {
  element.x(stage.width() * pos.x)
  element.y(stage.height() * pos.y)
}
```

---

## 3. SVG Background Handling

### Object-Fit Modes

Professional editors support CSS-like object-fit:

#### Cover (Most Common)
```typescript
// Fill entire canvas, crop if needed
const scale = Math.max(
  stageWidth / imgWidth,
  stageHeight / imgHeight
)
```
**Use case**: Backgrounds, hero images

#### Contain
```typescript
// Fit inside canvas, show all content
const scale = Math.min(
  stageWidth / imgWidth,
  stageHeight / imgHeight
)
```
**Use case**: Logos, product images

#### Fill
```typescript
// Stretch to fit (different X/Y scales)
scaleX = stageWidth / imgWidth
scaleY = stageHeight / imgHeight
```
**Use case**: Patterns, textures

---

## 4. Text Editing UX

### Professional Text Editing Flow

1. **Single Click**: Select text (show transformer)
2. **Double Click**: Enter edit mode (show textarea)
3. **Escape**: Cancel editing
4. **Ctrl+Enter**: Commit changes
5. **Click Outside**: Auto-commit

### Implementation Details:

```typescript
// Canva-style inline editing
class TextEditor {
  private textarea: HTMLTextAreaElement
  
  startEditing(textNode: Konva.Text) {
    // 1. Hide original text
    textNode.hide()
    
    // 2. Position textarea overlay
    const pos = textNode.getAbsolutePosition()
    this.textarea.style.left = pos.x + 'px'
    this.textarea.style.top = pos.y + 'px'
    
    // 3. Match text styling
    this.textarea.style.fontSize = textNode.fontSize() + 'px'
    this.textarea.style.fontFamily = textNode.fontFamily()
    this.textarea.style.color = textNode.fill()
    
    // 4. Show and focus
    this.textarea.value = textNode.text()
    this.textarea.style.display = 'block'
    this.textarea.focus()
    this.textarea.select()
  }
}
```

---

## 5. Transformer & Selection

### Professional Selection Handles

```typescript
const transformer = new Konva.Transformer({
  nodes: [textNode],
  
  // Only horizontal resize for text
  enabledAnchors: ['middle-left', 'middle-right'],
  
  // Keep aspect ratio for images
  keepRatio: false,
  
  // Minimum size constraint
  boundBoxFunc: (oldBox, newBox) => {
    if (newBox.width < 50) return oldBox
    return newBox
  }
})
```

### Selection Behavior:
- **Text**: Horizontal resize only (width)
- **Images**: All corners + rotation
- **Shapes**: All corners + rotation
- **Groups**: Bounding box of all children

---

## 6. Alignment & Snapping

### Smart Guides (Like Canva)

```typescript
// Show guide when element aligns with center
const centerX = stage.width() / 2
const elementCenterX = element.x() + element.width() / 2

if (Math.abs(elementCenterX - centerX) < 5) {
  showVerticalGuide(centerX)
  snapElement(element, centerX)
}
```

### Snap Targets:
- Canvas center (vertical/horizontal)
- Other elements (edges and centers)
- Safe margins (print bleed area)
- Grid lines (if enabled)

---

## 7. Safe Margins & Print Bleed

### Professional Print Setup

```typescript
interface PrintConfig {
  width: 10.24      // inches
  height: 5.76      // inches
  dpi: 300          // dots per inch
  bleed: 0.125      // inches (standard bleed)
  safeMargin: 0.25  // inches (safe text area)
}

// Calculate pixel dimensions
const pixelWidth = width * dpi   // 3072px
const pixelHeight = height * dpi  // 1728px
const bleedPx = bleed * dpi       // 37.5px
const safePx = safeMargin * dpi   // 75px
```

### Visual Guides:
```
┌─────────────────────────────────┐
│ Bleed Area (0.125")             │
│  ┌───────────────────────────┐  │
│  │ Safe Area (0.25")         │  │
│  │  ┌─────────────────────┐  │  │
│  │  │  Text goes here     │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 8. Performance Optimization

### Layer Caching

```typescript
// Cache static layers
backgroundLayer.cache()
backgroundLayer.listening(false)

// Only redraw changed layers
textLayer.batchDraw()  // Not stage.draw()
```

### Lazy Loading

```typescript
// Load images on demand
async function loadAssetWhenVisible(asset: SvgAsset) {
  if (isInViewport(asset)) {
    await loadImage(asset.url)
  }
}
```

---

## 9. Export & Download

### Professional Export Options

```typescript
interface ExportConfig {
  format: 'png' | 'jpg' | 'svg' | 'pdf'
  quality: number        // 0.1 - 1.0
  scale: number          // 1x, 2x, 3x
  includeBackground: boolean
  transparentBg: boolean
}

// High-quality export
const dataURL = stage.toDataURL({
  pixelRatio: 3,        // 3x resolution
  mimeType: 'image/png',
  quality: 1.0
})
```

---

## 10. Undo/Redo System

### State Management

```typescript
class HistoryManager {
  private history: string[] = []
  private currentIndex = -1
  
  saveState(stage: Konva.Stage) {
    const json = stage.toJSON()
    this.history = this.history.slice(0, this.currentIndex + 1)
    this.history.push(json)
    this.currentIndex++
  }
  
  undo(stage: Konva.Stage) {
    if (this.currentIndex > 0) {
      this.currentIndex--
      stage.destroy()
      stage = Konva.Node.create(this.history[this.currentIndex])
    }
  }
}
```

---

## 11. Accessibility

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Delete` | Delete selected |
| `Ctrl+D` | Duplicate |
| `Ctrl+G` | Group |
| `Ctrl+Shift+G` | Ungroup |
| `Arrow Keys` | Nudge 1px |
| `Shift+Arrow` | Nudge 10px |

---

## 12. Our Implementation

### What We've Built

✅ **Layer Architecture**: Background, Assets, Text, Guides  
✅ **Normalized Coordinates**: Responsive positioning  
✅ **Object-Fit Cover**: Professional background scaling  
✅ **Inline Text Editing**: Double-click to edit  
✅ **Transformer**: Selection handles  
✅ **Alignment Guides**: Center lines  
✅ **Modular Design**: Easy to add assets  
✅ **Export System**: JSON layout export  

### Next Steps

🔲 **Snap-to-Guide**: Magnetic alignment  
🔲 **Undo/Redo**: History management  
🔲 **Keyboard Shortcuts**: Power user features  
🔲 **Safe Margins**: Print bleed guides  
🔲 **Layer Panel**: Visual layer management  
🔲 **Asset Library**: Drag-and-drop decorations  

---

## Usage Example

```typescript
import { SvgLayoutManager } from './services/svg-layout.service'
import { TextEditingService } from './services/text-editing.service'
import { createWeddingTemplate } from './services/wedding-template.preset'

// 1. Initialize
const layoutManager = new SvgLayoutManager(stage, {
  width: 1024,
  height: 576
})

// 2. Enable text editing
const textEditor = new TextEditingService(stage)
textEditor.enableTransformer(layoutManager.getLayers().text)

// 3. Load template
await createWeddingTemplate(layoutManager, {
  backgroundUrl: '/your-svg-background.svg',
  mainMessage: 'Alhamdulillah on your wedding',
  coupleName: 'HANNATU MUSA',
  date: '28 September, 2025'
})

// 4. Add decorative assets
await layoutManager.addSvgAsset({
  id: 'ribbon',
  url: '/assets/ribbon.svg',
  x: 0.5,
  y: 0.8,
  scale: 0.5
})
```

---

## Conclusion

This implementation follows industry best practices from Canva, Fotor, and Adobe Express. The modular architecture makes it easy to extend with additional features while maintaining professional-grade UX.

