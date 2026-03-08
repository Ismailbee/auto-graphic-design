# Konva.js Implementation for Audio Graphic Design

This folder contains an alternative implementation of the canvas drawing functionality using Konva.js instead of Fabric.js.

## What is Konva.js?

Konva is a HTML5 Canvas JavaScript framework that enables high-performance animations, transitions, node nesting, layering, filtering, caching, event handling for desktop and mobile applications, and much more.

Unlike Fabric.js which provides a more abstracted API focused on interactive object manipulation, Konva uses a Stage and Layer system that can provide better performance for complex applications.

## Key Files

1. `src/lib/konva-init.js` - Initializes Konva.js
2. `src/composables/useKonvaCanvas.js` - Composable to manage Konva Stage and Layer
3. `src/stores/canvas-konva.js` - Pinia store adapted for Konva
4. `src/components/pages/Designer/CanvaArea-Konva.vue` - Canvas area component using Konva
5. `src/views/DesignerView-Konva.vue` - Designer view using Konva components
6. `src/main-konva.js` - Main entry point for Konva implementation
7. `konva-test.html` - HTML entry point for testing Konva implementation

## How to Test

To test the Konva implementation, run:

```bash
npm run konva-dev
```

This will start a development server using the Konva implementation. Open your browser to the displayed URL to see the Konva-based designer.

## Differences from Fabric.js

Konva.js has a different architecture than Fabric.js:

1. **Stage and Layer**: Konva uses a Stage (container) with multiple Layers, while Fabric uses a single Canvas.
2. **Event Handling**: Konva has a more direct event system tied to nodes.
3. **Transformations**: Konva uses a dedicated Transformer node rather than built-in controls.
4. **Object Model**: Konva has shapes like Rect, Circle, etc. similar to Fabric, but with different APIs.
5. **Performance**: Konva can be more performant for certain use cases due to its layer system.

## Implementation Notes

- This implementation maintains the same functionality as the Fabric.js version.
- The store API has been kept similar for compatibility, but internal implementation differs.
- Some features like multi-select may behave slightly differently due to Konva's architecture.

## Benefits of Konva

1. Better performance for complex applications due to layer system
2. More direct access to canvas properties and methods
3. Simpler animation system
4. Strong community and documentation
5. Actively maintained project

## Future Enhancements

1. Add caching for better performance
2. Implement custom shapes
3. Optimize event handling
4. Add WebGL support for complex graphics
