// src/stores/autoDesign.ts
import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth'
import { useEditorStore } from './editor'
import * as autoDesignApi from '@/services/api/auto-design-api'
import { getTemplate } from '@/data/templates'
import { backgroundRemovalService } from '@/services/background/background-removal.service'
import { aiTextLayoutService } from '@/services/ai/ai-text-layout.service'
import type { AutoDesignProject, Template, FormData } from '@/types/auto-design'

export const useAutoDesignStore = defineStore('autoDesign', () => {
  const router = useRouter()
  const authStore = useAuthStore()
  const editorStore = useEditorStore()

  // State
  const selectedCategory = ref<string | null>(null)
  const selectedTemplate = ref<Template | null>(null)
  
  const formData = ref<FormData>({
    text: {
      title: '',
      subtitle: '',
      description: '',
      childName: '',
      childFullName: '',
      date: '',
      month: '',
      year: '',
      courtesy: ''
    },
    colors: {
      primary: '#FFD700',
      secondary: '#0891b2',
      background: '#8b1538',
      accent: '#DAA520'
    },
    size: 'A4',
    customDimensions: null,
    options: {
      removeBackground: false,
      backgroundType: 'default',
      customBackground: null
    }
  })

  const uploadedFiles = ref<{
    logo: File | null
    images: File[]
  }>({
    logo: null,
    images: []
  })

  const isGenerating = ref(false)
  const generationProgress = ref(0)
  const currentProject = ref<AutoDesignProject | null>(null)

  const projects = ref<AutoDesignProject[]>([])
  const projectsLoading = ref(false)
  const projectsTotal = ref(0)
  const projectsHasMore = ref(false)

  const showPreviewModal = ref(false)
  const showHistoryPanel = ref(false)

  const error = ref<string | null>(null)

  // AI Processing state
  const isProcessingAI = ref(false)
  const aiProgress = ref(0)
  const aiStatus = ref<string>('')

  // Computed
  const hasUnsavedChanges = computed(() => {
    return Object.keys(formData.value.text).length > 0 ||
           uploadedFiles.value.logo !== null ||
           uploadedFiles.value.images.length > 0
  })

  // Actions

  /**
   * Set selected category
   */
  function setCategory(category: string) {
    selectedCategory.value = category
    resetFormData()
  }

  /**
   * Set selected template
   */
  function setTemplate(template: Template) {
    selectedTemplate.value = template
  }

  /**
   * Update form data field
   */
  function updateFormData(field: string, value: any) {
    if (field.startsWith('text.')) {
      const textField = field.replace('text.', '')
      formData.value.text[textField] = value
    } else if (field.startsWith('colors.')) {
      const colorField = field.replace('colors.', '') as 'primary' | 'secondary'
      formData.value.colors[colorField] = value
    } else if (field === 'size') {
      formData.value.size = value
    } else if (field.startsWith('options.')) {
      const optionField = field.replace('options.', '')
      ;(formData.value.options as any)[optionField] = value
    }
  }

  /**
   * Reset form data
   */
  function resetFormData() {
    formData.value = {
      text: {},
      colors: {
        primary: '#06b6d4',
        secondary: '#0891b2'
      },
      size: 'A4',
      customDimensions: null,
      options: {
        removeBackground: false,
        backgroundType: 'default',
        customBackground: null
      }
    }
    uploadedFiles.value = {
      logo: null,
      images: []
    }
  }

  /**
   * Set logo file
   */
  function setLogo(file: File) {
    uploadedFiles.value.logo = file
  }

  /**
   * Add images
   */
  function addImages(files: File[]) {
    const currentCount = uploadedFiles.value.images.length
    const maxFiles = 99
    const availableSlots = maxFiles - currentCount
    
    if (availableSlots <= 0) {
      authStore.showNotification({
        title: 'Maximum Images Reached',
        message: `You can only upload up to ${maxFiles} images`,
        type: 'error'
      })
      return
    }

    const filesToAdd = files.slice(0, availableSlots)
    uploadedFiles.value.images.push(...filesToAdd)

    if (files.length > availableSlots) {
      authStore.showNotification({
        title: 'Some Images Skipped',
        message: `Only ${availableSlots} images were added due to the limit`,
        type: 'info'
      })
    }
  }

  /**
   * Remove image at index
   */
  function removeImage(index: number) {
    uploadedFiles.value.images.splice(index, 1)
  }

  /**
   * Initialize design store (no-op, socket removed)
   */
  function initializeSocket() {
    // Socket.io removed - generation now works via REST API polling or direct response
  }

  /**
   * Cleanup design store (no-op, socket removed)
   */
  function cleanupSocket() {
    // Socket.io removed
  }

  /**
   * Process images with AI (background removal)
   */
  async function processImagesWithAI(images: File[]): Promise<File[]> {
    if (!formData.value.options.removeBackground) {
      return images // No processing needed
    }

    isProcessingAI.value = true
    aiProgress.value = 0
    aiStatus.value = 'Removing backgrounds...'

    const processedImages: File[] = []

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i]

        // Update progress
        aiProgress.value = Math.round((i / images.length) * 100)
        aiStatus.value = `Processing image ${i + 1} of ${images.length}...`

        // Remove background
        const result = await backgroundRemovalService.removeBackground(image, {
          size: 'auto',
          type: 'auto'
        })

        if (result.success && result.imageBlob) {
          // Convert blob to File
          const processedFile = new File(
            [result.imageBlob],
            `processed-${image.name}`,
            { type: 'image/png' }
          )
          processedImages.push(processedFile)
        } else {
          // If processing fails, use original
          processedImages.push(image)
        }
      }

      aiProgress.value = 100
      aiStatus.value = 'Background removal complete!'

      return processedImages
    } catch (error: any) {
      console.error('AI processing error:', error)
      aiStatus.value = 'Processing failed, using original images'
      return images // Return originals on error
    } finally {
      isProcessingAI.value = false
    }
  }

  /**
   * Generate design with real API and AI processing
   */
  async function generateDesign() {
    if (!selectedCategory.value) {
      throw new Error('No category selected')
    }

    if (!authStore.user) {
      throw new Error('User not authenticated')
    }

    try {
      isGenerating.value = true
      generationProgress.value = 0
      error.value = null

      // Socket removed - design generation via REST API

      // Get template for category
      const template = getTemplate(selectedCategory.value)
      selectedTemplate.value = template

      // Process images with AI if background removal is enabled
      let imagesToUpload = uploadedFiles.value.images
      if (formData.value.options.removeBackground && imagesToUpload.length > 0) {
        imagesToUpload = await processImagesWithAI(imagesToUpload)
      }

      // Upload files
      const uploadedLogo = uploadedFiles.value.logo
        ? await autoDesignApi.uploadFile(uploadedFiles.value.logo, 'logo')
        : null

      const uploadedImages = await Promise.all(
        imagesToUpload.map(file => autoDesignApi.uploadFile(file, 'image'))
      )

      // Prepare request
      const request = {
        userId: authStore.user.id,
        category: selectedCategory.value,
        inputs: formData.value,
        files: {
          logo: uploadedLogo ? { url: uploadedLogo.url } : undefined,
          images: uploadedImages.map(img => ({ url: img.url }))
        }
      }

      // Call API to generate design
      const response = await autoDesignApi.generateDesign(request)

      if (response.success && response.project) {
        // Direct response - no socket needed
        console.log('Design generation complete:', response.projectId)
        currentProject.value = response.project
        isGenerating.value = false
        generationProgress.value = 100

        authStore.showNotification({
          title: 'Design Complete!',
          message: 'Your design has been generated successfully',
          type: 'success'
        })

        showPreviewModal.value = true
      } else if (response.success) {
        console.log('Design generation started:', response.projectId)
        // For async generation, poll for status or handle via callback
        isGenerating.value = false
      } else {
        throw new Error('Failed to start design generation')
      }

    } catch (err: any) {
      error.value = err.message || 'Failed to generate design'
      isGenerating.value = false
      throw err
    }
  }

  /**
   * Open preview modal
   */
  function openPreview(project: AutoDesignProject) {
    currentProject.value = project
    showPreviewModal.value = true
  }

  /**
   * Close preview modal
   */
  function closePreview() {
    showPreviewModal.value = false
  }

  /**
   * Send design to editor
   */
  function sendToEditor(project: AutoDesignProject) {
    if (!project.design.fullUrl) return

    // Add design as image to canvas
    editorStore.addObject({
      id: `design-${Date.now()}`,
      type: 'image',
      src: project.design.fullUrl,
      x: 0,
      y: 0,
      width: project.design.dimensions.width,
      height: project.design.dimensions.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: editorStore.canvasState.objects.length
    })

    // Navigate to editor-pro
    router.push('/editor-pro')

    authStore.showNotification({
      title: 'Sent to Editor',
      message: 'Design has been added to the canvas',
      type: 'success'
    })
  }

  /**
   * Toggle history panel
   */
  function toggleHistoryPanel() {
    showHistoryPanel.value = !showHistoryPanel.value
  }

  /**
   * Load user projects
   */
  async function loadProjects() {
    if (!authStore.user) return

    try {
      projectsLoading.value = true
      const response = await autoDesignApi.getProjects(authStore.user.id, {
        limit: 20,
        offset: 0
      })

      projects.value = response.projects
      projectsTotal.value = response.total
      projectsHasMore.value = response.hasMore
    } catch (err: any) {
      console.error('Failed to load projects:', err)
    } finally {
      projectsLoading.value = false
    }
  }

  /**
   * Delete project
   */
  async function deleteProject(projectId: string) {
    try {
      await autoDesignApi.deleteProject(projectId)
      projects.value = projects.value.filter(p => p.id !== projectId)

      authStore.showNotification({
        title: 'Project Deleted',
        message: 'Design project has been deleted',
        type: 'success'
      })
    } catch (err: any) {
      authStore.showNotification({
        title: 'Delete Failed',
        message: err.message || 'Failed to delete project',
        type: 'error'
      })
    }
  }

  /**
   * Set error
   */
  function setError(errorMessage: string | null) {
    error.value = errorMessage
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cleanupSocket()
  })

  return {
    // State
    selectedCategory,
    selectedTemplate,
    formData,
    uploadedFiles,
    isGenerating,
    generationProgress,
    currentProject,
    projects,
    projectsLoading,
    projectsTotal,
    projectsHasMore,
    showPreviewModal,
    showHistoryPanel,
    error,
    isProcessingAI,
    aiProgress,
    aiStatus,

    // Computed
    hasUnsavedChanges,

    // Actions
    setCategory,
    setTemplate,
    updateFormData,
    resetFormData,
    setLogo,
    addImages,
    removeImage,
    initializeSocket,
    cleanupSocket,
    processImagesWithAI,
    generateDesign,
    loadProjects,
    deleteProject,
    openPreview,
    closePreview,
    sendToEditor,
    toggleHistoryPanel,
    setError
  }
})

