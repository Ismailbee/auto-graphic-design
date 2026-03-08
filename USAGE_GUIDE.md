# Audio Graphic Design Tool

## Features Implemented

### Canvas Functionality
- Interactive canvas with selection, drag and drop, and object manipulation
- Support for various shapes, text, and images
- Image editing tools (filters, transformations)
- Group and ungroup objects
- Undo/redo history
- Grid and ruler support
- Zoom controls

### Design Tools
- Templates panel with pre-designed templates
- Elements panel with shapes and lines
- Text panel with typography options
- Uploads panel for user media
- Image editing with filters and adjustments

### UI Components
- Dark/light theme toggle
- Toast notifications system
- Responsive design
- Intuitive sidebar navigation

## Usage Guide

### Getting Started
1. Select a template or start with a blank canvas
2. Add elements using the sidebar panels
3. Customize properties using the property panel
4. Save or export your design

### Keyboard Shortcuts
- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo
- **Ctrl+C/Ctrl+V**: Copy/Paste
- **Ctrl+D**: Duplicate selected object
- **Ctrl+G**: Group selected objects
- **Ctrl+Shift+G**: Ungroup objects
- **Ctrl+A**: Select all objects
- **Delete**: Remove selected object
- **+/-**: Zoom in/out
- **Ctrl+0**: Reset zoom to 100%
- **Ctrl+S**: Save design

### Tools
- **V**: Selection tool
- **H**: Hand tool (pan)
- **Text tool**: Add text to the canvas
- **Shape tools**: Add shapes to the canvas
- **Upload tool**: Add your own images

## Development
This application uses:
- Vue 3 with Composition API
- Konva.js for canvas manipulation (project migrated from Fabric.js)
- Tailwind CSS for styling
- Vite as the build tool

To run the development server:
```
npm run dev
```

To build for production:
```
npm run build
```

## Troubleshooting
If you encounter any issues:
1. Check browser console for errors
2. Verify the canvas and Konva stage are initialized (look for Konva-related errors)
3. Verify that all panels are correctly rendering
4. Ensure the canvas has proper dimensions
