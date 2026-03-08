/**
 * Speech-to-Text (STT) Composable
 * 
 * Handles voice input, text-to-speech output, and speech recognition
 * for the wedding sticker chat interface.
 * 
 * Features:
 * - Web Speech API support (browsers)
 * - Capacitor native TTS support (mobile)
 * - Auto-send after voice recognition
 * - Mobile-optimized settings
 */

import { ref, watch, onMounted, type Ref } from 'vue'

// Types
export interface SpeechToTextOptions {
  /** Reference to the chat input text */
  chatInputText: Ref<string>
  /** Reference to chat messages array */
  chatMessages: Ref<ChatMessage[]>
  /** Function to send a message */
  sendMessage: () => void
  /** Function to scroll chat to bottom */
  scrollToBottom: () => void
  /** Function to show notifications */
  showNotification: (options: { title: string; message: string; type: 'info' | 'error' | 'success' }) => void
  /** Selected category (voice only works for 'wedding') */
  selectedCategory: Ref<string>
}

// Import shared ChatMessage type
import type { ChatMessage } from '../types'
export type { ChatMessage }

// Lazy-load TextToSpeech module for Capacitor - only on native platforms
let TextToSpeech: any = null
const loadTextToSpeech = async () => {
  // Only load on actual native platforms (APK/IPA), not web
  const isNativePlatform = typeof window !== 'undefined' &&
                            (window as any).Capacitor?.isNativePlatform &&
                            (window as any).Capacitor.isNativePlatform()
  
  if (!isNativePlatform) {
    // Return null on web to prevent "not implemented" errors
    return null
  }
  
  if (!TextToSpeech) {
    try {
      const module = await import('@capacitor-community/text-to-speech')
      TextToSpeech = module.TextToSpeech
    } catch (e) {
      console.warn('TextToSpeech module not available:', e)
      return null
    }
  }
  return TextToSpeech
}

/**
 * Composable for Speech-to-Text and Text-to-Speech functionality
 */
export function useSpeechToText(options: SpeechToTextOptions) {
  const { chatInputText, chatMessages, sendMessage, scrollToBottom, showNotification, selectedCategory } = options

  // ============================================================================
  // STATE
  // ============================================================================
  const isRecording = ref(false)
  const speechRecognition = ref<any>(null)
  const interimTranscript = ref('')
  const isMobileDevice = ref(false)
  const voiceMessageSent = ref(false) // Flag to prevent duplicate sends
  const isVoiceEnabled = ref(true) // TTS enabled by default

  // Track last spoken message to prevent duplicates
  let lastSpokenMessageId: number | null = null
  let speakTimeout: ReturnType<typeof setTimeout> | null = null

  // ============================================================================
  // MOBILE DETECTION
  // ============================================================================
  function checkIfMobile(): boolean {
    // Check for Capacitor native platform
    const isCapacitor = typeof (window as any).Capacitor !== 'undefined' && 
                        (window as any).Capacitor.isNativePlatform && 
                        (window as any).Capacitor.isNativePlatform()
    
    // Also check user agent for mobile browsers
    const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    return isCapacitor || isMobileBrowser
  }

  // ============================================================================
  // SPEECH RECOGNITION (STT)
  // ============================================================================
  
  /**
   * Initialize the Speech Recognition API
   */
  function initSpeechRecognition() {
    isMobileDevice.value = checkIfMobile()
    
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('🎤 Speech Recognition not supported in this browser/device')
      return null
    }
    
    const recognition = new SpeechRecognition()
    
    // Configuration - optimized for mobile
    recognition.continuous = !isMobileDevice.value // On mobile, single utterance works better
    recognition.interimResults = true // Show results as user speaks
    recognition.lang = 'en-US' // Default language (supports multiple languages)
    recognition.maxAlternatives = 1
    
    // Event: When speech is recognized
    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interim = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interim += transcript
        }
      }
      
      // Update input with interim results (shows text as user speaks)
      if (interim) {
        interimTranscript.value = interim
        // Show interim in input field - but don't duplicate
        const baseText = chatInputText.value.replace(interimTranscript.value, '').trim()
        chatInputText.value = baseText ? `${baseText} ${interim}`.trim() : interim
      }
      
      // When speech is final, add to input
      if (finalTranscript) {
        const baseText = chatInputText.value.replace(interimTranscript.value, '').trim()
        chatInputText.value = baseText ? `${baseText} ${finalTranscript}`.trim() : finalTranscript
        interimTranscript.value = ''
        console.log('🎤 Recognized:', finalTranscript)
        
        // Auto-stop and auto-send after recognition
        voiceMessageSent.value = false // Reset flag
        setTimeout(() => {
          stopVoiceRecordingAndSend()
        }, 300) // Quick send after speech ends
      }
    }
    
    // Event: Recognition started
    recognition.onstart = () => {
      console.log('🎤 Voice recognition started')
      isRecording.value = true
      voiceMessageSent.value = false // Reset the sent flag when starting new recording
    }
    
    // Event: Recognition ended
    recognition.onend = () => {
      console.log('🎤 Voice recognition ended')
      isRecording.value = false
      
      // Remove any listening messages
      const listeningMsgIndex = chatMessages.value.findIndex(m => m.isLoading && m.text.includes('Listening'))
      if (listeningMsgIndex !== -1) {
        chatMessages.value.splice(listeningMsgIndex, 1)
      }
      
      // Auto-send if there's text AND we haven't already sent it
      if (chatInputText.value.trim() && !voiceMessageSent.value) {
        voiceMessageSent.value = true
        setTimeout(() => {
          sendMessage()
        }, 100) // Fast send
      }
    }
    
    // Event: Error occurred
    recognition.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error)
      isRecording.value = false
      
      // Remove listening message on error
      const listeningMsgIndex = chatMessages.value.findIndex(m => m.isLoading && m.text.includes('Listening'))
      if (listeningMsgIndex !== -1) {
        chatMessages.value.splice(listeningMsgIndex, 1)
      }
      
      let errorMessage = 'Voice input error'
      switch (event.error) {
        case 'no-speech':
          errorMessage = "I didn't hear anything. Tap the mic and try again!"
          break
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your device settings.'
          break
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permission in your device settings.'
          break
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.'
          break
        case 'aborted':
          // User stopped recording - no need to show error
          return
        case 'service-not-allowed':
          errorMessage = 'Speech service not available. Please try again later.'
          break
        default:
          errorMessage = `Voice error: ${event.error}`
      }
      
      showNotification({
        title: 'Voice Input',
        message: errorMessage,
        type: 'error'
      })
    }
    
    return recognition
  }

  /**
   * Toggle voice input - start/stop recording
   */
  function toggleVoiceInput() {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    // Detect if on mobile
    const isMobile = checkIfMobile()
    
    // Haptic feedback for mobile (vibrate on tap)
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(50) // Short vibration
    }
    
    if (!SpeechRecognition) {
      // On mobile, provide more helpful message
      if (isMobile) {
        showNotification({
          title: 'Voice Input',
          message: 'Voice input requires microphone permission. Please allow access in your device settings.',
          type: 'info'
        })
      } else {
        showNotification({
          title: 'Voice Input Not Supported',
          message: 'Your browser does not support voice input. Please try Chrome, Edge, or Safari.',
          type: 'error'
        })
      }
      return
    }
    
    // If already recording, stop it
    if (isRecording.value && speechRecognition.value) {
      speechRecognition.value.stop()
      isRecording.value = false
      
      // Haptic feedback when stopping
      if (isMobile && navigator.vibrate) {
        navigator.vibrate(100) // Longer vibration to indicate stop
      }
      
      // Remove listening message
      const listeningMsgIndex = chatMessages.value.findIndex(m => m.isLoading && m.text.includes('Listening'))
      if (listeningMsgIndex !== -1) {
        chatMessages.value.splice(listeningMsgIndex, 1)
      }
      
      // Auto-send if text was captured AND not already sent
      if (chatInputText.value.trim() && !voiceMessageSent.value) {
        voiceMessageSent.value = true // Mark as sent
        
        // Auto-send immediately
        setTimeout(() => {
          sendMessage()
        }, 50) // Almost instant
      }
      return
    }
    
    // Initialize recognition if not already done
    if (!speechRecognition.value) {
      speechRecognition.value = initSpeechRecognition()
    }
    
    if (!speechRecognition.value) {
      showNotification({
        title: 'Voice Input Error',
        message: isMobile 
          ? 'Could not access microphone. Please check app permissions in your device settings.'
          : 'Could not initialize voice recognition. Please try again.',
        type: 'error'
      })
      return
    }
    
    // Start recording
    try {
      speechRecognition.value.start()
      
      // Haptic feedback when recording starts
      if (isMobile && navigator.vibrate) {
        navigator.vibrate([50, 30, 50]) // Double vibration pattern
      }
      
      // Show toast notification - different message for mobile
      showNotification({
        title: '🎤 Listening...',
        message: isMobile ? 'Speak clearly into your phone!' : 'Speak now! Say your message clearly.',
        type: 'info'
      })
      
      // Add a listening indicator to chat
      chatMessages.value.push({
        id: Date.now(),
        text: isMobile ? '🎤 Listening... Speak into your phone!' : '🎤 Listening... Speak now!',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLoading: true
      })
      scrollToBottom()
      
      // On mobile, set a timeout to auto-stop if user doesn't speak (prevent hanging)
      if (isMobile) {
        setTimeout(() => {
          if (isRecording.value && !chatInputText.value.trim()) {
            stopVoiceRecording()
            showNotification({
              title: 'Voice Timeout',
              message: "I didn't hear anything. Tap the mic and try again!",
              type: 'info'
            })
          }
        }, 10000) // 10 second timeout on mobile
      }
      
    } catch (error) {
      console.error('Failed to start voice recognition:', error)
      showNotification({
        title: 'Voice Input Error',
        message: isMobile 
          ? 'Microphone access denied. Please allow microphone permission in Settings > Apps > [This App] > Permissions.'
          : 'Could not start voice recognition. Please check microphone permissions.',
        type: 'error'
      })
    }
  }

  /**
   * Stop voice recording and remove listening message
   */
  function stopVoiceRecording() {
    if (speechRecognition.value && isRecording.value) {
      speechRecognition.value.stop()
      isRecording.value = false
    }
    
    // Remove the "Listening..." message
    const listeningMsgIndex = chatMessages.value.findIndex(m => m.isLoading && m.text.includes('Listening'))
    if (listeningMsgIndex !== -1) {
      chatMessages.value.splice(listeningMsgIndex, 1)
    }
  }

  /**
   * Stop voice recording AND automatically send the message
   */
  function stopVoiceRecordingAndSend() {
    if (speechRecognition.value && isRecording.value) {
      speechRecognition.value.stop()
      isRecording.value = false
    }
    
    // Remove the "Listening..." message
    const listeningMsgIndex = chatMessages.value.findIndex(m => m.isLoading && m.text.includes('Listening'))
    if (listeningMsgIndex !== -1) {
      chatMessages.value.splice(listeningMsgIndex, 1)
    }
    
    // Auto-send if there's text AND we haven't already sent
    if (chatInputText.value.trim() && !voiceMessageSent.value) {
      voiceMessageSent.value = true // Mark as sent to prevent duplicates
      
      // Haptic feedback before sending
      if (navigator.vibrate) {
        navigator.vibrate(30) // Quick single vibration
      }
      
      // Send immediately
      setTimeout(() => {
        sendMessage()
      }, 50) // Almost instant
    }
  }

  // ============================================================================
  // TEXT-TO-SPEECH (TTS)
  // ============================================================================

  /**
   * Toggle voice/TTS on or off
   */
  function toggleVoice() {
    isVoiceEnabled.value = !isVoiceEnabled.value
    if (isVoiceEnabled.value) {
      // Announce voice is on
      speakMessage("Voice guidance enabled. I will read my messages to you.")
    } else {
      // Stop any ongoing speech safely
      stopAllSpeech()
    }
  }

  /**
   * Stop all ongoing speech (web and native)
   */
  function stopAllSpeech() {
    try {
      // Stop web speech synthesis
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      // Stop native TTS (Capacitor) only on actual native platform
      const isNative = (window as any).Capacitor?.isNativePlatform?.()
      if (isNative) {
        loadTextToSpeech().then(TTS => TTS?.stop?.()).catch(() => {})
      }
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Speak a message using TTS
   */
  function speakMessage(text: string) {
    if (!isVoiceEnabled.value) return
    
    // Cancel any ongoing speech first to prevent overlap/duplicates
    stopAllSpeech()
    
    // Remove emojis and special characters before speaking
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
      .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical Symbols
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes Extended
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental Arrows-C
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols (sun, moon, etc)
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
      .replace(/[\u{1F000}-\u{1F02F}]/gu, '') // Mahjong Tiles
      .replace(/[\u{1F0A0}-\u{1F0FF}]/gu, '') // Playing Cards
      .replace(/\*\*/g, '')                    // Remove markdown bold markers
      .replace(/\s+/g, ' ')                    // Clean up extra whitespace
      .trim()
    
    // Only use Capacitor TTS on actual native platform (APK/IPA), not web
    // Checking isNativePlatform() to avoid "not implemented on web" errors
    const isNativePlatform = typeof window !== 'undefined' &&
                              (window as any).Capacitor?.isNativePlatform &&
                              (window as any).Capacitor.isNativePlatform()
    
    if (isNativePlatform) {
      // Try native TTS on actual Capacitor app
      tryNativeTTS(cleanText).catch(() => {
        // Fallback to web speech if native TTS fails
        console.log('Native TTS failed, trying web speech...')
        tryWebSpeech(cleanText)
      })
    } else {
      // On web/desktop, use web speech synthesis
      tryWebSpeech(cleanText)
    }
  }

  /**
   * Try native TTS via Capacitor
   */
  async function tryNativeTTS(text: string) {
    try {
      console.log('🔊 Attempting native TTS...')
      const TTS = await loadTextToSpeech()
      if (!TTS) throw new Error('TTS not available')
      
      await TTS.speak({
        text: text,
        lang: 'en-US',
        rate: 0.95,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient'
      })
      console.log('✅ Native TTS successful')
    } catch (error) {
      console.warn('❌ Native TTS failed:', error)
      // Not available, will fallback to web speech
      throw error
    }
  }

  /**
   * Try web-based speech synthesis
   */
  function tryWebSpeech(text: string) {
    // Check if speechSynthesis is available
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not available')
      return
    }
    
    try {
      // Cancel any current speech safely
      if (window.speechSynthesis?.speaking || window.speechSynthesis?.pending) {
        window.speechSynthesis?.cancel()
      }
      
      // Small delay to ensure cancellation is processed
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text)
          
          // Get voices safely
          const voices = window.speechSynthesis?.getVoices() || []
          
          // If no voices yet, try to wait for them (but don't break if not supported)
          if (voices.length === 0) {
            const voicesHandler = () => {
              try {
                const loadedVoices = window.speechSynthesis?.getVoices() || []
                if (loadedVoices.length > 0) {
                  setVoiceAndSpeak(utterance, loadedVoices)
                } else {
                  // Just speak with default voice
                  window.speechSynthesis?.speak(utterance)
                }
              } catch (err) {
                console.warn('Voice loading error:', err)
              }
            }
            
            if (window.speechSynthesis?.addEventListener) {
              window.speechSynthesis?.addEventListener('voiceschanged', voicesHandler, { once: true })
              // Fallback timeout in case voiceschanged never fires
              setTimeout(() => {
                window.speechSynthesis?.removeEventListener('voiceschanged', voicesHandler)
                window.speechSynthesis?.speak(utterance)
              }, 1000)
            } else {
              window.speechSynthesis?.speak(utterance)
            }
          } else {
            setVoiceAndSpeak(utterance, voices)
          }
        } catch (error) {
          console.warn('Speech synthesis error:', error)
        }
      }, 100)
    } catch (error) {
      console.warn('Speech synthesis not available:', error)
    }
  }

  /**
   * Set voice preferences and speak
   */
  function setVoiceAndSpeak(utterance: SpeechSynthesisUtterance, voices: SpeechSynthesisVoice[]) {
    try {
      // Prefer a clear English voice
      const preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Samantha'))
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0]
      
      if (preferredVoice) utterance.voice = preferredVoice
      
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      if (window.speechSynthesis) {
        window.speechSynthesis?.speak(utterance)
      }
    } catch (error) {
      console.warn('Speech synthesis error:', error)
    }
  }

  // ============================================================================
  // AUTO-SPEAK WATCHER
  // ============================================================================
  
  /**
   * Setup watcher to auto-speak AI messages
   * IMPORTANT: This is the ONLY place that should trigger voice announcements
   */
  function setupAutoSpeakWatcher() {
    watch(() => chatMessages.value.length, (newLen, oldLen) => {
      if (newLen > oldLen && isVoiceEnabled.value && selectedCategory.value === 'wedding') {
        const lastMsg = chatMessages.value[newLen - 1]
        // Prevent duplicate announcements by tracking the last spoken message ID
        if (lastMsg.sender === 'ai' && lastMsg.id !== lastSpokenMessageId) {
          // Clear any pending speech timeout to prevent duplicates
          if (speakTimeout) {
            clearTimeout(speakTimeout)
            speakTimeout = null
          }
          
          // Mark this message as the one we're about to speak
          lastSpokenMessageId = lastMsg.id
          
          // Use a timeout to debounce rapid message additions
          speakTimeout = setTimeout(() => {
            // Only speak if this is still the most recent message we want to speak
            if (lastSpokenMessageId === lastMsg.id && !lastMsg.isLoading) {
              speakMessage(lastMsg.text)
            }
            speakTimeout = null
          }, 300) // 300ms debounce to prevent rapid-fire speaking
        }
      }
    })
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  /**
   * Initialize TTS on mount
   */
  function initializeVoice() {
    try {
      // Wait for voices to load - but don't break if not supported
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis?.onvoiceschanged !== undefined) {
          window.speechSynthesis!.onvoiceschanged = () => {
            // Voices loaded
          }
        }
      }
    } catch (error) {
      console.warn('Speech synthesis initialization failed:', error)
    }
  }

  // Return all public methods and state
  return {
    // State
    isRecording,
    isVoiceEnabled,
    isMobileDevice,
    interimTranscript,
    
    // Speech-to-Text (STT) methods
    toggleVoiceInput,
    stopVoiceRecording,
    stopVoiceRecordingAndSend,
    initSpeechRecognition,
    checkIfMobile,
    
    // Text-to-Speech (TTS) methods
    toggleVoice,
    speakMessage,
    stopAllSpeech,
    
    // Initialization
    initializeVoice,
    setupAutoSpeakWatcher,
  }
}
