/**
 * Lazy-loaded Speech Module
 * 
 * This module wraps the speech-to-text composable and provides
 * on-demand initialization to reduce initial bundle size.
 * 
 * Usage:
 *   const speech = await loadSpeechModule()
 *   speech.init(options)
 */

import type { Ref } from 'vue'

export interface SpeechModuleOptions {
  chatInputText: Ref<string>
  chatMessages: Ref<any[]>
  selectedCategory: Ref<string | null>
  sendMessage: () => void
  scrollToBottom: () => void
  showNotification: (opts: { title: string; message: string; type: 'info' | 'error' | 'success' }) => void
}

export interface SpeechModule {
  // State
  isRecording: Ref<boolean>
  isVoiceEnabled: Ref<boolean>
  isMobileDevice: Ref<boolean>
  interimTranscript: Ref<string>
  
  // Methods
  toggleVoiceInput: () => void
  toggleVoice: () => void
  stopVoiceRecording: () => void
  stopVoiceRecordingAndSend: () => void
  speakMessage: (text: string) => void
  stopAllSpeech: () => void
  initializeVoice: () => void
  setupAutoSpeakWatcher: () => void
  showChatHelp: () => void
}

let speechModule: SpeechModule | null = null

/**
 * Lazy load the speech module
 * Only loads the speech composable when first needed
 */
export async function loadSpeechModule(): Promise<SpeechModule | null> {
  if (speechModule) return speechModule
  
  try {
    const { useSpeechToText } = await import('./composables/useSpeechToText')
    return { useSpeechToText }
  } catch (e) {
    console.warn('Speech module failed to load:', e)
    return null
  }
}

/**
 * Initialize speech functionality with the given options
 * Call this after the component is mounted
 */
export function initSpeechModule(options: SpeechModuleOptions): SpeechModule | null {
  // Dynamic import happens in loadSpeechModule
  // This function just provides type safety for initialization
  return null
}
