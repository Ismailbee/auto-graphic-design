/**
 * Browser Warning Suppressor
 * Aggressively suppresses browser-level tracking prevention warnings
 */

// Store original console methods before any other modifications
const originalBrowserConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console)
};

// Patterns to aggressively suppress
const aggressiveSuppressionPatterns = [
  'Tracking Prevention blocked access to storage',
  'blocked access to storage for',
  'Datadog Browser SDK',
  'No storage available',
  'Images loaded lazily',
  'Explain Console errors by using Copilot',
  'Don\'t show again',
  'Learn more',
  'go.microsoft.com',
  '[Intervention]'
];

/**
 * Create a suppression wrapper for any console method
 */
function createAggressiveSuppressor(originalMethod, methodName) {
  return function(...args) {
    const message = String(args.join(' '));
    
    // Check if message should be suppressed
    const shouldSuppress = aggressiveSuppressionPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (!shouldSuppress) {
      // Only show non-suppressed messages
      if (methodName === 'log' && import.meta.env.DEV) {
        originalMethod.call(console, '🔧', ...args);
      } else {
        originalMethod.apply(console, args);
      }
    }
    // Suppressed messages are completely ignored
  };
}

/**
 * Override browser-level console methods
 */
function overrideBrowserConsole() {
  if (typeof window !== 'undefined') {
    // Override all console methods
    console.log = createAggressiveSuppressor(originalBrowserConsole.log, 'log');
    console.warn = createAggressiveSuppressor(originalBrowserConsole.warn, 'warn');
    console.error = createAggressiveSuppressor(originalBrowserConsole.error, 'error');
    console.info = createAggressiveSuppressor(originalBrowserConsole.info, 'info');
    console.debug = createAggressiveSuppressor(originalBrowserConsole.debug, 'debug');
    
    // Override window.console if it exists and is different
    if (window.console && window.console !== console) {
      window.console.log = console.log;
      window.console.warn = console.warn;
      window.console.error = console.error;
      window.console.info = console.info;
      window.console.debug = console.debug;
    }
  }
}

/**
 * Restore original console methods
 */
function restoreBrowserConsole() {
  if (typeof window !== 'undefined') {
    Object.assign(console, originalBrowserConsole);
    if (window.console && window.console !== console) {
      Object.assign(window.console, originalBrowserConsole);
    }
  }
}

// Auto-initialize in development mode
if (import.meta.env.DEV) {
  overrideBrowserConsole();
  
  // Expose control functions globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).restoreBrowserConsole = restoreBrowserConsole;
    (window as any).overrideBrowserConsole = overrideBrowserConsole;
  }
}

export {
  overrideBrowserConsole,
  restoreBrowserConsole,
  originalBrowserConsole
};