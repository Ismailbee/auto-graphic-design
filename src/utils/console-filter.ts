/**
 * Console filter to reduce development noise
 * Suppresses common expected errors and warnings
 */

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error
};

// Define patterns of messages to suppress or reduce
const suppressPatterns = [
  'Tracking Prevention blocked access to storage',
  'blocked access to storage for',
  'Paystack',
  'Datadog Browser SDK: No storage available',
  'Datadog Browser SDK: No storage available for session',
  'Explain Console errors by using Copilot in Edge',
  'GET https://paystack.com',
  'ERR_BLOCKED_BY_RESPONSE.NotSameOrigin',
  'Images loaded lazily and replaced with placeholders',
  'Storage access is disabled',
  'Failed to read the \'localStorage\' property',
  'Failed to read the \'sessionStorage\' property',
  'QuotaExceededError',
  'Storage quota has been exceeded',
  '[Intervention] Images loaded lazily',
  'Don\'t show again',
  'Learn more'
];

// Define patterns to show only once per session
const showOncePatterns = [
  'Firebase index required for notifications',
  'Backend server not available',
  'User service unavailable after all retries',
  'Firebase connection issues detected',
  'Storage access limited by browser',
  'Router navigation blocked',
  'Route not found',
  'Error captured by ErrorBoundary',
  'No match for',
  'Router error'
];

// Track messages shown once
const shownOnce = new Set();

// Create filtered console methods
function createFilteredMethod(originalMethod, type) {
  return function(...args) {
    const message = args.join(' ');
    
    // Check if message should be suppressed
    if (suppressPatterns.some(pattern => message.includes(pattern))) {
      return; // Suppress entirely
    }
    
    // Check if message should only be shown once
    const showOncePattern = showOncePatterns.find(pattern => message.includes(pattern));
    if (showOncePattern) {
      if (shownOnce.has(showOncePattern)) {
        return; // Already shown once
      }
      shownOnce.add(showOncePattern);
    }
    
    // Call original method with console-filter prefix for filtered messages
    if (type === 'log' && import.meta.env.DEV) {
      originalMethod.apply(console, ['🔧', ...args]);
    } else {
      originalMethod.apply(console, args);
    }
  };
}

// Additional browser-level warning suppression
function suppressBrowserWarnings() {
  // Override window.console if available
  if (typeof window !== 'undefined' && window.console) {
    const originalConsoleWarn = window.console.warn;
    const originalConsoleError = window.console.error;
    const originalConsoleLog = window.console.log;
    
    window.console.warn = function(...args) {
      const message = args.join(' ');
      if (!suppressPatterns.some(pattern => message.includes(pattern))) {
        originalConsoleWarn.apply(window.console, args);
      }
    };
    
    window.console.error = function(...args) {
      const message = args.join(' ');
      if (!suppressPatterns.some(pattern => message.includes(pattern))) {
        originalConsoleError.apply(window.console, args);
      }
    };
    
    window.console.log = function(...args) {
      const message = args.join(' ');
      if (!suppressPatterns.some(pattern => message.includes(pattern))) {
        originalConsoleLog.apply(window.console, ['🔧', ...args]);
      }
    };
  }
}

// Apply filters in development mode only
if (import.meta.env.DEV) {
  console.log = createFilteredMethod(originalConsole.log, 'log');
  console.warn = createFilteredMethod(originalConsole.warn, 'warn');
  console.error = createFilteredMethod(originalConsole.error, 'error');
  
  // Apply browser-level warning suppression
  suppressBrowserWarnings();
  
  // Add method to restore original console
  (window as any).restoreConsole = () => {
    Object.assign(console, originalConsole);
    console.log('🔧 Console filtering disabled - showing all messages');
  };
  
  // Add method to re-enable filtering
  (window as any).enableConsoleFilter = () => {
    console.log = createFilteredMethod(originalConsole.log, 'log');
    console.warn = createFilteredMethod(originalConsole.warn, 'warn');  
    console.error = createFilteredMethod(originalConsole.error, 'error');
    suppressBrowserWarnings();
    console.log('🔧 Console filtering enabled - suppressing noise');
  };
  
  console.log('🔧 Console filter active - use restoreConsole() to disable');
}

export default {
  enable: () => {
    if (typeof window !== 'undefined' && (window as any).enableConsoleFilter) {
      (window as any).enableConsoleFilter();
    }
  },
  disable: () => {
    if (typeof window !== 'undefined' && (window as any).restoreConsole) {
      (window as any).restoreConsole();
    }
  }
};