# Text Editing Toolbar - Canva Style

This component provides a comprehensive text editing toolbar that appears when text objects are selected on the canvas, styled exactly like Canva's interface.

## Features

### 🎨 **Visual Design**
- **Full-width toolbar** positioned above selected text
- **Modern, clean design** with subtle shadows and rounded corners
- **Responsive layout** that adapts to different screen sizes
- **Smooth animations** for appearance/disappearance
- **Dark theme support** for consistent UI experience

### 🔤 **Font Controls**
- **Font Family Selector** with 20+ popular fonts including Google Fonts
- **Font Size Controls** with increment/decrement buttons and direct input
- **Text Formatting**: Bold, Italic, Underline toggle buttons
- **Text Alignment**: Left, Center, Right alignment options

### 🎨 **Styling Options**
- **Color Picker** with visual color preview
- **Letter Spacing** slider control (-50 to 200)
- **Line Height** adjustment (0.5x to 3x)
- **Text Effects** dropdown with Shadow, Outline, and Remove Effects options

### ⌨️ **Keyboard Shortcuts**
- `Ctrl/Cmd + B` - Toggle Bold
- `Ctrl/Cmd + I` - Toggle Italic  
- `Ctrl/Cmd + U` - Toggle Underline
- `T` - Switch to Text Tool (when canvas is focused)
- `V` - Switch to Select Tool

### 🎯 **Smart Positioning**
- **Automatic positioning** above selected text objects
- **Viewport-aware** positioning to stay within screen bounds
- **Zoom-level consideration** for accurate placement
- **Canvas transform compensation** for proper alignment

### 🔧 **Technical Implementation**
- **Fabric.js Integration** with real-time property synchronization
- **Vue 3 Composition API** for reactive state management
- **Pinia Store Integration** for canvas state management
- **Event-driven updates** that sync with canvas changes

## Usage

The toolbar automatically appears when:
1. A text object (`text`, `textbox`, or `i-text`) is selected
2. The object is visible on the canvas
3. The canvas is properly initialized

### Creating Text Objects
1. Click the **Text Tool** (T) in the main toolbar
2. Click anywhere on the canvas to create a new text object
3. Start typing immediately - the text toolbar will appear
4. Use the toolbar controls to style your text

### Editing Existing Text
1. Use the **Select Tool** (V) to select existing text
2. Double-click to enter edit mode
3. The text toolbar will appear automatically
4. Make styling changes in real-time

## Component Structure

```
TextToolbar.vue
├── Font Family Selector
├── Font Size Controls (-, input, +)
├── Format Buttons (B, I, U)
├── Alignment Buttons (Left, Center, Right)
├── Color Picker
├── Letter Spacing Slider
├── Line Height Slider
├── Effects Dropdown
└── More Options Button
```

## Styling Classes

- `.text-toolbar` - Main toolbar container
- `.toolbar-group` - Individual tool sections
- `.format-btn.active` - Active formatting state
- `.effects-dropdown` - Effects menu overlay
- `.toolbar-enter-active` - Animation classes

## Responsive Breakpoints

- **Desktop** (1200px+): Full toolbar with all controls
- **Tablet** (768px-1200px): Compact spacing, smaller inputs
- **Mobile** (768px-): Wrapped layout with reduced controls

The toolbar is designed to match Canva's professional design standards while providing smooth, intuitive text editing capabilities.
