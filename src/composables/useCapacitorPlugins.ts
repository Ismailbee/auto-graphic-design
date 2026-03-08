/**
 * Lazy-loaded Capacitor plugins composable
 * These plugins are loaded only when needed to reduce initial bundle size
 */

// Lazy-loaded Filesystem plugin
let FilesystemModule: typeof import('@capacitor/filesystem') | null = null;

export const loadFilesystem = async () => {
  if (!FilesystemModule) {
    FilesystemModule = await import('@capacitor/filesystem');
  }
  return {
    Filesystem: FilesystemModule.Filesystem,
    Directory: FilesystemModule.Directory
  };
};

// Lazy-loaded Share plugin
let SharePlugin: typeof import('@capacitor/share').Share | null = null;

export const loadShare = async () => {
  if (!SharePlugin) {
    const module = await import('@capacitor/share');
    SharePlugin = module.Share;
  }
  return SharePlugin;
};

// Lazy-loaded Camera plugin
let CameraModule: typeof import('@capacitor/camera') | null = null;

export const loadCamera = async () => {
  if (!CameraModule) {
    CameraModule = await import('@capacitor/camera');
  }
  return {
    Camera: CameraModule.Camera,
    CameraResultType: CameraModule.CameraResultType,
    CameraSource: CameraModule.CameraSource
  };
};

// Lazy-loaded Browser plugin
let BrowserPlugin: typeof import('@capacitor/browser').Browser | null = null;

export const loadBrowser = async () => {
  if (!BrowserPlugin) {
    const module = await import('@capacitor/browser');
    BrowserPlugin = module.Browser;
  }
  return BrowserPlugin;
};

// Lazy-loaded Text-to-Speech plugin
let TextToSpeechPlugin: typeof import('@capacitor-community/text-to-speech').TextToSpeech | null = null;

export const loadTextToSpeech = async () => {
  if (!TextToSpeechPlugin) {
    const module = await import('@capacitor-community/text-to-speech');
    TextToSpeechPlugin = module.TextToSpeech;
  }
  return TextToSpeechPlugin;
};

// Lazy-loaded App plugin (for hardware back button, etc)
let AppPlugin: typeof import('@capacitor/app').App | null = null;

export const loadApp = async () => {
  if (!AppPlugin) {
    const module = await import('@capacitor/app');
    AppPlugin = module.App;
  }
  return AppPlugin;
};
