# Tiptap Integration Guide

## Overview
This guide explains how to use the integrated Tiptap editor within your canvas design application. Tiptap is now available in two locations:

1. **Property Panel** - For editing text content when a text element is selected
2. **Floating TextToolbar** - For quick inline text editing

## Features

### TiptapEditor Component (`src/components/common/TiptapEditor.vue`)
A reusable rich text editor component with the following features:

**Formatting Options:**
- Bold, Italic, Underline, Strikethrough
- Text alignment (left, center, right, justify)
- Bullet and numbered lists (in full mode)

**Configuration:**
- **Compact Mode**: Minimal interface for inline editing
- **Full Mode**: Complete editing experience with all features
- **Editable**: Can be set to read-only mode
- **Custom Placeholder**: Configurable placeholder text

### Property Panel Integration

**Location:** `src/components/pages/Designer/propertypanel/TextPanel.vue`

**Usage:**
1. Select a text element on the canvas
2. The property panel will show a "Content" section with the Tiptap editor
3. Edit text content directly with rich formatting
4. Changes are automatically synced to the Fabric.js canvas

**Features in Property Panel:**
- Real-time text content editing
- Converts HTML to plain text for Fabric.js compatibility
- Compact editor interface optimized for sidebar use
- Maintains text formatting while editing

### Floating TextToolbar Integration

**Location:** `src/components/pages/Designer/TextToolbar.vue`

**Usage:**
1. Click on a text element to show the floating toolbar
2. Click the text editor toggle button (three lines icon)
3. A compact Tiptap editor appears for quick text editing
4. Click the expand button to collapse the editor

**Features in TextToolbar:**
- Inline text editing without leaving the canvas view
- Compact interface that doesn't obstruct the design
- Toggle on/off for space efficiency
- Real-time sync with canvas text objects

## Technical Implementation

### Text Synchronization
Both implementations use bidirectional text synchronization:

```javascript
// From Tiptap to Fabric.js
function updateTextContent(html) {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  const plainText = tempDiv.textContent || tempDiv.innerText || ''
  
  if (canvasStore.activeObject && plainText !== canvasStore.activeObject.text) {
    canvasStore.activeObject.set('text', plainText)
    canvasStore.fabricCanvas.renderAll()
    canvasStore.saveState()
  }
}

// From Fabric.js to Tiptap
watch(() => canvasStore.activeObject?.text, (newText) => {
  if (newText !== undefined && newText !== textContent.value) {
    textContent.value = newText
  }
}, { immediate: true })
```

### HTML to Plain Text Conversion
Since Fabric.js works with plain text, HTML from Tiptap is automatically converted:
- Bold/italic formatting is removed but the text content is preserved
- Lists are flattened to plain text
- HTML tags are stripped completely

### Event Handling
- **Focus/Blur**: Proper event handling for editor state
- **Real-time Updates**: Changes are immediately reflected on canvas
- **Keyboard Shortcuts**: Standard shortcuts (Ctrl+B, Ctrl+I, etc.) work within the editor

## Usage Examples

### Adding Text with Tiptap Editing
1. Click "Add Text" in the sidebar
2. Text appears on canvas
3. Select the text to open the property panel
4. Use the "Content" section to edit with rich formatting
5. Or use the floating toolbar's text editor toggle

### Editing Existing Text
1. Click any text element on the canvas
2. The property panel shows current text content
3. Edit in the Tiptap editor with formatting
4. Changes automatically sync to canvas

### Quick Inline Editing
1. Select text element
2. In floating toolbar, click the text editor toggle button
3. Edit directly in the compact editor
4. Click expand button to close when done

## Styling and Customization

### Compact Mode
- Minimal toolbar with essential formatting
- Smaller editor area optimized for inline use
- Reduced padding and margins

### Full Mode
- Complete toolbar with all formatting options
- Larger editing area
- Lists and advanced formatting available

### CSS Customization
Main style classes:
- `.tiptap-editor` - Main editor container
- `.tiptap-editor.compact` - Compact mode modifications
- `.editor-toolbar` - Toolbar container
- `.toolbar-btn` - Individual toolbar buttons

## Best Practices

1. **Property Panel**: Use for detailed text editing and content creation
2. **Floating Toolbar**: Use for quick text corrections and minor edits
3. **Text Formatting**: Apply most formatting through the traditional Fabric.js controls in the property panel
4. **Content Editing**: Use Tiptap for text content, use Fabric.js controls for visual styling

## Troubleshooting

### Text Not Syncing
- Ensure the text object is properly selected
- Check that the canvas store is properly connected
- Verify the active object is a text type

### Editor Not Appearing
- Confirm the text element is selected
- Check that the Tiptap extensions are properly loaded
- Verify component imports are correct

### Formatting Lost
- This is expected behavior - Tiptap HTML is converted to plain text for Fabric.js
- Use Fabric.js property controls for visual formatting
- Use Tiptap for content editing only

## API Reference

### TiptapEditor Props
```javascript
{
  modelValue: String,      // Text content (v-model)
  placeholder: String,     // Placeholder text
  isCompact: Boolean,      // Enable compact mode
  showToolbar: Boolean,    // Show/hide toolbar
  editable: Boolean        // Enable/disable editing
}
```

### TiptapEditor Events
```javascript
{
  'update:modelValue': String,  // Text content changed
  'focus': Editor,              // Editor gained focus
  'blur': Editor,               // Editor lost focus
  'selectionUpdate': Editor     // Selection changed
}
```

### Exposed Methods
```javascript
{
  getEditor: () => Editor,      // Get Tiptap editor instance
  focus: () => void,            // Focus the editor
  blur: () => void,             // Blur the editor
  selectAll: () => void,        // Select all text
  getHTML: () => String,        // Get HTML content
  getText: () => String,        // Get plain text
  isEmpty: () => Boolean        // Check if empty
}
```
