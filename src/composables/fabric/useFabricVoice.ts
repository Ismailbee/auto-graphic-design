/**
 * AI Voice Control Composable
 * Voice commands for canvas editing using Web Speech API
 */

import { ref, computed, onUnmounted } from 'vue'
import type { UseFabricCanvasReturn } from './useFabricCanvas'
import type { UseFabricSelectionReturn } from './useFabricSelection'
import type { UseFabricHistoryReturn } from './useFabricHistory'
import type { UseFabricTextReturn } from './useFabricText'
import type { UseFabricShapesReturn } from './useFabricShapes'
import type { UseFabricImageReturn } from './useFabricImage'
import type { UseFabricAnimationReturn } from './useFabricAnimation'

export interface VoiceCommand {
  patterns: RegExp[]
  action: string
  handler: (match: RegExpMatchArray) => void
  examples: string[]
}

export interface VoiceFeedback {
  type: 'success' | 'error' | 'info' | 'listening'
  message: string
  timestamp: number
}

export function useFabricVoice(
  canvasComposable: UseFabricCanvasReturn,
  selectionComposable: UseFabricSelectionReturn,
  historyComposable: UseFabricHistoryReturn,
  textComposable: UseFabricTextReturn,
  shapesComposable: UseFabricShapesReturn,
  imageComposable: UseFabricImageReturn,
  animationComposable?: UseFabricAnimationReturn
) {
  const { canvas, setZoom, zoom } = canvasComposable
  const { deleteSelected, duplicateSelected, selectAll, clearSelection, bringToFront, sendToBack } = selectionComposable
  const { undo, redo } = historyComposable
  const { addText, addTextbox, setFontSize, setTextColor, toggleBold, toggleItalic } = textComposable
  const { addRect, addCircle, addTriangle, addStar, setFillColor, setStrokeColor } = shapesComposable

  // State
  const isListening = ref(false)
  const isSupported = ref(false)
  const transcript = ref('')
  const feedback = ref<VoiceFeedback[]>([])
  const lastCommand = ref('')
  const confidence = ref(0)
  const isSpeaking = ref(false)

  // Speech Recognition
  let recognition: any = null
  let synthesis: SpeechSynthesis | null = null

  // Check support
  const checkSupport = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    isSupported.value = !!SpeechRecognition && !!window.speechSynthesis
    
    if (isSupported.value) {
      recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      synthesis = window.speechSynthesis
    }
    
    return isSupported.value
  }

  // Color name to hex mapping
  const colorMap: Record<string, string> = {
    'red': '#ff0000', 'blue': '#0000ff', 'green': '#00ff00', 'yellow': '#ffff00',
    'orange': '#ffa500', 'purple': '#800080', 'pink': '#ffc0cb', 'black': '#000000',
    'white': '#ffffff', 'gray': '#808080', 'grey': '#808080', 'brown': '#a52a2a',
    'cyan': '#00ffff', 'magenta': '#ff00ff', 'navy': '#000080', 'teal': '#008080',
    'coral': '#ff7f50', 'salmon': '#fa8072', 'gold': '#ffd700', 'silver': '#c0c0c0'
  }

  // Voice commands definition
  const commands: VoiceCommand[] = [
    // Text commands
    {
      patterns: [/add (?:a )?text/i, /create (?:a )?text/i, /new text/i, /insert text/i],
      action: 'addText',
      handler: () => {
        addTextbox('New Text')
        speak('Text added')
      },
      examples: ['Add text', 'Create a text', 'New text']
    },
    {
      patterns: [/add (?:a )?(?:text )?(?:that )?says? ["\']?(.+?)["\']?$/i, /write ["\']?(.+?)["\']?$/i, /type ["\']?(.+?)["\']?$/i],
      action: 'addTextWithContent',
      handler: (match) => {
        const content = match[1]
        addTextbox(content)
        speak(`Added text: ${content}`)
      },
      examples: ['Add text that says Hello World', 'Write Welcome', 'Type your name here']
    },
    {
      patterns: [/make (?:it |text )?bold/i, /toggle bold/i],
      action: 'toggleBold',
      handler: () => {
        toggleBold()
        speak('Bold toggled')
      },
      examples: ['Make it bold', 'Toggle bold']
    },
    {
      patterns: [/make (?:it |text )?italic/i, /toggle italic/i],
      action: 'toggleItalic',
      handler: () => {
        toggleItalic()
        speak('Italic toggled')
      },
      examples: ['Make it italic', 'Toggle italic']
    },
    {
      patterns: [/(?:set |change |make )?(?:font )?size (?:to )?(\d+)/i, /(\d+) (?:pixel|px|point|pt)/i],
      action: 'setFontSize',
      handler: (match) => {
        const size = parseInt(match[1])
        setFontSize(size)
        speak(`Font size set to ${size}`)
      },
      examples: ['Set size to 24', 'Font size 36', '48 pixels']
    },

    // Shape commands
    {
      patterns: [/add (?:a )?(?:rect(?:angle)?|square|box)/i, /create (?:a )?(?:rect(?:angle)?|square|box)/i, /draw (?:a )?(?:rect(?:angle)?|square|box)/i],
      action: 'addRectangle',
      handler: () => {
        addRect()
        speak('Rectangle added')
      },
      examples: ['Add a rectangle', 'Create square', 'Draw a box']
    },
    {
      patterns: [/add (?:a )?circle/i, /create (?:a )?circle/i, /draw (?:a )?circle/i],
      action: 'addCircle',
      handler: () => {
        addCircle()
        speak('Circle added')
      },
      examples: ['Add a circle', 'Create circle', 'Draw a circle']
    },
    {
      patterns: [/add (?:a )?triangle/i, /create (?:a )?triangle/i, /draw (?:a )?triangle/i],
      action: 'addTriangle',
      handler: () => {
        addTriangle()
        speak('Triangle added')
      },
      examples: ['Add a triangle', 'Create triangle', 'Draw a triangle']
    },
    {
      patterns: [/add (?:a )?star/i, /create (?:a )?star/i, /draw (?:a )?star/i],
      action: 'addStar',
      handler: () => {
        addStar()
        speak('Star added')
      },
      examples: ['Add a star', 'Create star', 'Draw a star']
    },

    // Color commands
    {
      patterns: [/(?:change |set |make )?(?:fill )?colou?r (?:to )?(\w+)/i, /fill (?:with |it )?(\w+)/i, /make (?:it )?(\w+)/i],
      action: 'setColor',
      handler: (match) => {
        const colorName = match[1].toLowerCase()
        const color = colorMap[colorName] || colorName
        setFillColor(color)
        speak(`Color changed to ${colorName}`)
      },
      examples: ['Change color to red', 'Fill with blue', 'Make it green']
    },
    {
      patterns: [/(?:change |set )?(?:stroke|border|outline) (?:colou?r )?(?:to )?(\w+)/i],
      action: 'setStrokeColor',
      handler: (match) => {
        const colorName = match[1].toLowerCase()
        const color = colorMap[colorName] || colorName
        setStrokeColor(color)
        speak(`Stroke color changed to ${colorName}`)
      },
      examples: ['Change stroke to black', 'Set border color red']
    },

    // Selection commands
    {
      patterns: [/select (?:all|everything)/i],
      action: 'selectAll',
      handler: () => {
        selectAll()
        speak('All selected')
      },
      examples: ['Select all', 'Select everything']
    },
    {
      patterns: [/deselect|clear selection|unselect/i],
      action: 'clearSelection',
      handler: () => {
        clearSelection()
        speak('Selection cleared')
      },
      examples: ['Deselect', 'Clear selection']
    },
    {
      patterns: [/delete|remove|erase/i],
      action: 'delete',
      handler: () => {
        deleteSelected()
        speak('Deleted')
      },
      examples: ['Delete', 'Remove', 'Erase']
    },
    {
      patterns: [/duplicate|copy|clone/i],
      action: 'duplicate',
      handler: () => {
        duplicateSelected()
        speak('Duplicated')
      },
      examples: ['Duplicate', 'Copy', 'Clone']
    },

    // Layer commands
    {
      patterns: [/bring (?:to )?front|move (?:to )?front/i],
      action: 'bringToFront',
      handler: () => {
        bringToFront()
        speak('Brought to front')
      },
      examples: ['Bring to front', 'Move to front']
    },
    {
      patterns: [/send (?:to )?back|move (?:to )?back/i],
      action: 'sendToBack',
      handler: () => {
        sendToBack()
        speak('Sent to back')
      },
      examples: ['Send to back', 'Move to back']
    },

    // History commands
    {
      patterns: [/undo/i, /go back/i, /reverse/i],
      action: 'undo',
      handler: () => {
        undo()
        speak('Undone')
      },
      examples: ['Undo', 'Go back']
    },
    {
      patterns: [/redo/i, /go forward/i],
      action: 'redo',
      handler: () => {
        redo()
        speak('Redone')
      },
      examples: ['Redo', 'Go forward']
    },

    // Zoom commands
    {
      patterns: [/zoom in/i, /(?:make (?:it )?)?bigger/i],
      action: 'zoomIn',
      handler: () => {
        setZoom(zoom.value * 1.25)
        speak('Zoomed in')
      },
      examples: ['Zoom in', 'Make it bigger']
    },
    {
      patterns: [/zoom out/i, /(?:make (?:it )?)?smaller/i],
      action: 'zoomOut',
      handler: () => {
        setZoom(zoom.value / 1.25)
        speak('Zoomed out')
      },
      examples: ['Zoom out', 'Make it smaller']
    },
    {
      patterns: [/reset zoom|zoom (?:to )?100|actual size/i],
      action: 'resetZoom',
      handler: () => {
        setZoom(1)
        speak('Zoom reset')
      },
      examples: ['Reset zoom', 'Zoom to 100%', 'Actual size']
    },

    // Animation commands (if animation composable is provided)
    {
      patterns: [/animate (?:with )?fade in/i, /add fade in/i],
      action: 'animateFadeIn',
      handler: () => {
        if (animationComposable) {
          const obj = canvas.value?.getActiveObject()
          if (obj) {
            animationComposable.previewAnimation(obj, 'fade-in')
            speak('Fade in animation applied')
          }
        }
      },
      examples: ['Animate with fade in', 'Add fade in']
    },
    {
      patterns: [/animate (?:with )?slide (?:in )?(?:from )?up/i],
      action: 'animateSlideUp',
      handler: () => {
        if (animationComposable) {
          const obj = canvas.value?.getActiveObject()
          if (obj) {
            animationComposable.previewAnimation(obj, 'slide-up')
            speak('Slide up animation applied')
          }
        }
      },
      examples: ['Animate with slide up']
    },
    {
      patterns: [/animate (?:with )?bounce/i, /add bounce/i],
      action: 'animateBounce',
      handler: () => {
        if (animationComposable) {
          const obj = canvas.value?.getActiveObject()
          if (obj) {
            animationComposable.previewAnimation(obj, 'bounce-in')
            speak('Bounce animation applied')
          }
        }
      },
      examples: ['Animate with bounce', 'Add bounce']
    },
    {
      patterns: [/play (?:the )?animation/i, /preview/i],
      action: 'playAnimation',
      handler: () => {
        if (animationComposable) {
          animationComposable.play()
          speak('Playing animation')
        }
      },
      examples: ['Play animation', 'Preview']
    },

    // Help command
    {
      patterns: [/help|what can you do|commands/i],
      action: 'help',
      handler: () => {
        speak('I can help you with: adding text and shapes, changing colors, undo and redo, zoom, and animations. Try saying: add a circle, make it red, or animate with fade in.')
      },
      examples: ['Help', 'What can you do', 'Commands']
    }
  ]

  // Text-to-speech
  const speak = (text: string) => {
    if (!synthesis) return
    
    // Cancel any ongoing speech
    synthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.1
    utterance.pitch = 1
    utterance.volume = 0.8
    
    utterance.onstart = () => { isSpeaking.value = true }
    utterance.onend = () => { isSpeaking.value = false }
    
    synthesis.speak(utterance)
    
    addFeedback('success', text)
  }

  // Add feedback message
  const addFeedback = (type: VoiceFeedback['type'], message: string) => {
    feedback.value.push({ type, message, timestamp: Date.now() })
    // Keep only last 5 messages
    if (feedback.value.length > 5) {
      feedback.value.shift()
    }
  }

  // Process speech input
  const processCommand = (text: string): boolean => {
    const normalizedText = text.trim().toLowerCase()
    
    for (const command of commands) {
      for (const pattern of command.patterns) {
        const match = normalizedText.match(pattern)
        if (match) {
          lastCommand.value = command.action
          command.handler(match)
          return true
        }
      }
    }
    
    // No command matched
    addFeedback('error', `I didn't understand: "${text}"`)
    return false
  }

  // Start listening
  const startListening = () => {
    if (!recognition || isListening.value) return
    
    recognition.onstart = () => {
      isListening.value = true
      addFeedback('listening', 'Listening...')
    }
    
    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
          confidence.value = result[0].confidence
        } else {
          interimTranscript += result[0].transcript
        }
      }
      
      transcript.value = interimTranscript || finalTranscript
      
      if (finalTranscript) {
        processCommand(finalTranscript)
      }
    }
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      addFeedback('error', `Error: ${event.error}`)
      if (event.error !== 'no-speech') {
        isListening.value = false
      }
    }
    
    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (isListening.value) {
        try {
          recognition.start()
        } catch (e) {
          isListening.value = false
        }
      }
    }
    
    try {
      recognition.start()
    } catch (e) {
      console.error('Failed to start recognition:', e)
      addFeedback('error', 'Failed to start voice recognition')
    }
  }

  // Stop listening
  const stopListening = () => {
    if (!recognition) return
    isListening.value = false
    recognition.stop()
    addFeedback('info', 'Stopped listening')
  }

  // Toggle listening
  const toggleListening = () => {
    if (isListening.value) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Get all command examples
  const getCommandExamples = () => {
    return commands.map(c => ({
      action: c.action,
      examples: c.examples
    }))
  }

  // Initialize on first use
  checkSupport()

  // Cleanup
  onUnmounted(() => {
    stopListening()
    if (synthesis) {
      synthesis.cancel()
    }
  })

  return {
    // State
    isListening,
    isSupported,
    transcript,
    feedback,
    lastCommand,
    confidence,
    isSpeaking,
    
    // Methods
    startListening,
    stopListening,
    toggleListening,
    speak,
    processCommand,
    getCommandExamples,
    checkSupport
  }
}

export type UseFabricVoiceReturn = ReturnType<typeof useFabricVoice>
