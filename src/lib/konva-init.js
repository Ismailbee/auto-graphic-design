// Importing and initializing Konva.js
import Konva from 'konva';

// Configure Konva performance settings
Konva.showWarnings = false; // Disable warnings in production
Konva.pixelRatio = 1; // Lower pixel ratio for better performance
Konva.dragDistance = 3; // Increase drag distance to avoid accidental drags

// Performance optimizations
Konva.autoDrawEnabled = false; // Disable auto draws to use batch draws
Konva.listening = false; // Disable listening on shapes that don't need it

// Manually enable these only where needed
const enableListeningForEvents = (node) => {
  if (node) {
    node.listening(true);
  }
};

// Export Konva and helper functions
export { Konva, enableListeningForEvents };
