/**
 * Fabric.js v6 Animation Composable
 * Advanced animations system with presets, timeline, and keyframes
 */

import { ref, reactive, computed, watch } from 'vue'
import { FabricObject, util } from 'fabric'
import type { Canvas } from 'fabric'
import type { UseFabricCanvasReturn } from './useFabricCanvas'

export type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'easeInQuad' | 'easeOutQuad' | 
  'easeInCubic' | 'easeOutCubic' | 'easeInBounce' | 'easeOutBounce' | 'easeInElastic' | 'easeOutElastic'

export type AnimationType = 'entrance' | 'emphasis' | 'exit' | 'motion-path'

export interface AnimationPreset {
  id: string
  name: string
  type: AnimationType
  icon: string
  duration: number
  easing: EasingFunction
  properties: Record<string, { from: any; to: any }>
}

export interface ObjectAnimation {
  id: string
  objectId: string
  preset: AnimationPreset
  delay: number
  duration: number
  easing: EasingFunction
  repeat: number
  yoyo: boolean
}

export interface TimelineMarker {
  time: number
  animations: ObjectAnimation[]
}

// Pre-built animation presets like Canva
export const ANIMATION_PRESETS: AnimationPreset[] = [
  // Entrance Animations
  {
    id: 'fade-in',
    name: 'Fade In',
    type: 'entrance',
    icon: '✨',
    duration: 500,
    easing: 'easeOut',
    properties: { opacity: { from: 0, to: 1 } }
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    type: 'entrance',
    icon: '⬆️',
    duration: 600,
    easing: 'easeOutCubic',
    properties: { 
      opacity: { from: 0, to: 1 },
      top: { from: 'current+100', to: 'current' }
    }
  },
  {
    id: 'slide-down',
    name: 'Slide Down',
    type: 'entrance',
    icon: '⬇️',
    duration: 600,
    easing: 'easeOutCubic',
    properties: { 
      opacity: { from: 0, to: 1 },
      top: { from: 'current-100', to: 'current' }
    }
  },
  {
    id: 'slide-left',
    name: 'Slide Left',
    type: 'entrance',
    icon: '⬅️',
    duration: 600,
    easing: 'easeOutCubic',
    properties: { 
      opacity: { from: 0, to: 1 },
      left: { from: 'current+100', to: 'current' }
    }
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    type: 'entrance',
    icon: '➡️',
    duration: 600,
    easing: 'easeOutCubic',
    properties: { 
      opacity: { from: 0, to: 1 },
      left: { from: 'current-100', to: 'current' }
    }
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    type: 'entrance',
    icon: '🔍',
    duration: 500,
    easing: 'easeOutCubic',
    properties: { 
      opacity: { from: 0, to: 1 },
      scaleX: { from: 0.5, to: 1 },
      scaleY: { from: 0.5, to: 1 }
    }
  },
  {
    id: 'pop',
    name: 'Pop',
    type: 'entrance',
    icon: '💥',
    duration: 400,
    easing: 'easeOutElastic',
    properties: { 
      opacity: { from: 0, to: 1 },
      scaleX: { from: 0, to: 1 },
      scaleY: { from: 0, to: 1 }
    }
  },
  {
    id: 'bounce-in',
    name: 'Bounce In',
    type: 'entrance',
    icon: '⚡',
    duration: 800,
    easing: 'easeOutBounce',
    properties: { 
      opacity: { from: 0, to: 1 },
      scaleX: { from: 0.3, to: 1 },
      scaleY: { from: 0.3, to: 1 }
    }
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    type: 'entrance',
    icon: '🔄',
    duration: 600,
    easing: 'easeOutCubic',
    properties: { 
      opacity: { from: 0, to: 1 },
      angle: { from: -180, to: 0 }
    }
  },
  {
    id: 'flip-in',
    name: 'Flip In',
    type: 'entrance',
    icon: '🎴',
    duration: 600,
    easing: 'easeOutCubic',
    properties: { 
      opacity: { from: 0, to: 1 },
      scaleX: { from: 0, to: 1 }
    }
  },

  // Emphasis Animations
  {
    id: 'pulse',
    name: 'Pulse',
    type: 'emphasis',
    icon: '💓',
    duration: 500,
    easing: 'easeInOut',
    properties: { 
      scaleX: { from: 1, to: 1.1 },
      scaleY: { from: 1, to: 1.1 }
    }
  },
  {
    id: 'shake',
    name: 'Shake',
    type: 'emphasis',
    icon: '📳',
    duration: 500,
    easing: 'linear',
    properties: { 
      left: { from: 'current', to: 'current+10' }
    }
  },
  {
    id: 'wiggle',
    name: 'Wiggle',
    type: 'emphasis',
    icon: '〰️',
    duration: 400,
    easing: 'easeInOut',
    properties: { 
      angle: { from: -5, to: 5 }
    }
  },
  {
    id: 'flash',
    name: 'Flash',
    type: 'emphasis',
    icon: '⚡',
    duration: 300,
    easing: 'linear',
    properties: { 
      opacity: { from: 1, to: 0.3 }
    }
  },
  {
    id: 'rubber-band',
    name: 'Rubber Band',
    type: 'emphasis',
    icon: '🎯',
    duration: 600,
    easing: 'easeOutElastic',
    properties: { 
      scaleX: { from: 1, to: 1.25 },
      scaleY: { from: 1, to: 0.75 }
    }
  },
  {
    id: 'float',
    name: 'Float',
    type: 'emphasis',
    icon: '🎈',
    duration: 1500,
    easing: 'easeInOut',
    properties: { 
      top: { from: 'current', to: 'current-20' }
    }
  },

  // Exit Animations
  {
    id: 'fade-out',
    name: 'Fade Out',
    type: 'exit',
    icon: '👋',
    duration: 500,
    easing: 'easeIn',
    properties: { opacity: { from: 1, to: 0 } }
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    type: 'exit',
    icon: '🔎',
    duration: 500,
    easing: 'easeInCubic',
    properties: { 
      opacity: { from: 1, to: 0 },
      scaleX: { from: 1, to: 0.5 },
      scaleY: { from: 1, to: 0.5 }
    }
  },
  {
    id: 'slide-out-up',
    name: 'Slide Out Up',
    type: 'exit',
    icon: '⬆️',
    duration: 500,
    easing: 'easeInCubic',
    properties: { 
      opacity: { from: 1, to: 0 },
      top: { from: 'current', to: 'current-100' }
    }
  },
  {
    id: 'slide-out-down',
    name: 'Slide Out Down',
    type: 'exit',
    icon: '⬇️',
    duration: 500,
    easing: 'easeInCubic',
    properties: { 
      opacity: { from: 1, to: 0 },
      top: { from: 'current', to: 'current+100' }
    }
  },
  {
    id: 'shrink',
    name: 'Shrink',
    type: 'exit',
    icon: '🔻',
    duration: 400,
    easing: 'easeInCubic',
    properties: { 
      opacity: { from: 1, to: 0 },
      scaleX: { from: 1, to: 0 },
      scaleY: { from: 1, to: 0 }
    }
  }
]

// Easing functions map
const EASING_FUNCTIONS: Record<EasingFunction, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInBounce: (t) => 1 - EASING_FUNCTIONS.easeOutBounce(1 - t),
  easeOutBounce: (t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
  },
  easeInElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3),
  easeOutElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1
}

export function useFabricAnimation(canvasComposable: UseFabricCanvasReturn) {
  const { canvas } = canvasComposable

  // State
  const animations = ref<Map<string, ObjectAnimation>>(new Map())
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const currentTime = ref(0)
  const totalDuration = ref(5000) // 5 seconds default timeline
  const playbackSpeed = ref(1)
  
  // Active animation handles
  const activeAnimations = new Map<string, number>()

  // Get presets by type
  const entrancePresets = computed(() => ANIMATION_PRESETS.filter(p => p.type === 'entrance'))
  const emphasisPresets = computed(() => ANIMATION_PRESETS.filter(p => p.type === 'emphasis'))
  const exitPresets = computed(() => ANIMATION_PRESETS.filter(p => p.type === 'exit'))

  // Parse property value (handles 'current+X' syntax)
  const parsePropertyValue = (value: any, currentValue: number): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      if (value === 'current') return currentValue
      if (value.startsWith('current+')) return currentValue + parseFloat(value.slice(8))
      if (value.startsWith('current-')) return currentValue - parseFloat(value.slice(8))
    }
    return currentValue
  }

  // Animate a single object with a preset
  const animateObject = (
    obj: FabricObject,
    preset: AnimationPreset,
    options: { delay?: number; duration?: number; easing?: EasingFunction; onComplete?: () => void } = {}
  ): Promise<void> => {
    return new Promise((resolve) => {
      if (!canvas.value) {
        resolve()
        return
      }

      const duration = options.duration ?? preset.duration
      const easing = EASING_FUNCTIONS[options.easing ?? preset.easing]
      const delay = options.delay ?? 0

      // Store original values and calculate targets
      const originalValues: Record<string, number> = {}
      const fromValues: Record<string, number> = {}
      const toValues: Record<string, number> = {}

      for (const [prop, values] of Object.entries(preset.properties)) {
        const current = (obj as any)[prop] ?? 0
        originalValues[prop] = current
        fromValues[prop] = parsePropertyValue(values.from, current)
        toValues[prop] = parsePropertyValue(values.to, current)
      }

      // Set initial values
      for (const [prop, value] of Object.entries(fromValues)) {
        (obj as any)[prop] = value
      }
      canvas.value.requestRenderAll()

      // Animation loop
      const startTime = performance.now() + delay
      let animationId: number

      const animate = (currentTime: number) => {
        if (!canvas.value) {
          resolve()
          return
        }

        const elapsed = currentTime - startTime
        
        if (elapsed < 0) {
          animationId = requestAnimationFrame(animate)
          return
        }

        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easing(progress)

        for (const [prop, fromValue] of Object.entries(fromValues)) {
          const toValue = toValues[prop]
          const currentValue = fromValue + (toValue - fromValue) * easedProgress
          ;(obj as any)[prop] = currentValue
        }

        canvas.value.requestRenderAll()

        if (progress < 1) {
          animationId = requestAnimationFrame(animate)
        } else {
          options.onComplete?.()
          resolve()
        }
      }

      setTimeout(() => {
        animationId = requestAnimationFrame(animate)
        activeAnimations.set(obj.toString(), animationId)
      }, 0)
    })
  }

  // Add animation to object
  const addAnimation = (objectId: string, presetId: string, options: Partial<ObjectAnimation> = {}) => {
    const preset = ANIMATION_PRESETS.find(p => p.id === presetId)
    if (!preset) return null

    const animation: ObjectAnimation = {
      id: `anim_${Date.now()}`,
      objectId,
      preset,
      delay: options.delay ?? 0,
      duration: options.duration ?? preset.duration,
      easing: options.easing ?? preset.easing,
      repeat: options.repeat ?? 1,
      yoyo: options.yoyo ?? false
    }

    animations.value.set(animation.id, animation)
    return animation
  }

  // Remove animation
  const removeAnimation = (animationId: string) => {
    animations.value.delete(animationId)
  }

  // Get animations for object
  const getObjectAnimations = (objectId: string) => {
    return Array.from(animations.value.values()).filter(a => a.objectId === objectId)
  }

  // Play all animations
  const play = async () => {
    if (!canvas.value || isPlaying.value) return
    
    isPlaying.value = true
    isPaused.value = false
    currentTime.value = 0

    const objects = canvas.value.getObjects()
    const animationPromises: Promise<void>[] = []

    for (const [id, animation] of animations.value) {
      const obj = objects.find(o => (o as any).id === animation.objectId)
      if (!obj) continue

      const promise = animateObject(obj, animation.preset, {
        delay: animation.delay,
        duration: animation.duration,
        easing: animation.easing
      })
      animationPromises.push(promise)
    }

    await Promise.all(animationPromises)
    isPlaying.value = false
  }

  // Pause animations
  const pause = () => {
    isPaused.value = true
    activeAnimations.forEach((id) => cancelAnimationFrame(id))
    activeAnimations.clear()
  }

  // Stop all animations
  const stop = () => {
    isPlaying.value = false
    isPaused.value = false
    currentTime.value = 0
    activeAnimations.forEach((id) => cancelAnimationFrame(id))
    activeAnimations.clear()
  }

  // Preview animation on object
  const previewAnimation = async (obj: FabricObject, presetId: string) => {
    const preset = ANIMATION_PRESETS.find(p => p.id === presetId)
    if (!preset || !canvas.value) return

    // Store original state
    const originalState: Record<string, any> = {}
    for (const prop of Object.keys(preset.properties)) {
      originalState[prop] = (obj as any)[prop]
    }

    // Play animation
    await animateObject(obj, preset)

    // For emphasis, restore original state
    if (preset.type === 'emphasis') {
      await animateObject(obj, {
        ...preset,
        properties: Object.fromEntries(
          Object.entries(preset.properties).map(([k, v]) => [k, { from: v.to, to: v.from }])
        )
      })
    }

    // For entrance/exit, optionally restore
    if (preset.type === 'exit') {
      for (const [prop, value] of Object.entries(originalState)) {
        (obj as any)[prop] = value
      }
      canvas.value.requestRenderAll()
    }
  }

  // Export timeline data
  const exportTimeline = () => {
    return {
      duration: totalDuration.value,
      animations: Array.from(animations.value.values())
    }
  }

  // Import timeline data
  const importTimeline = (data: { duration: number; animations: ObjectAnimation[] }) => {
    totalDuration.value = data.duration
    animations.value.clear()
    data.animations.forEach(a => animations.value.set(a.id, a))
  }

  return {
    // State
    animations,
    isPlaying,
    isPaused,
    currentTime,
    totalDuration,
    playbackSpeed,
    
    // Presets
    entrancePresets,
    emphasisPresets,
    exitPresets,
    allPresets: ANIMATION_PRESETS,
    
    // Methods
    animateObject,
    addAnimation,
    removeAnimation,
    getObjectAnimations,
    play,
    pause,
    stop,
    previewAnimation,
    exportTimeline,
    importTimeline
  }
}

export type UseFabricAnimationReturn = ReturnType<typeof useFabricAnimation>
