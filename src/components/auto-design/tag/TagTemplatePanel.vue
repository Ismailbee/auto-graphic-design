<template>
  <div class="tag-template-panel">
    <!-- Chat Interface -->
    <TagChatPanel
      ref="chatPanelRef"
      :messages="chatMessages"
      @send="handleSendMessage"
      @upload="triggerImageUpload"
      @action="handleAction"
    />

    <!-- Edit Modal -->
    <TagEditModal
      v-model="showEditModal"
      :data="extractedInfo"
      :has-logo="hasUserImage"
      :logo-src="userImageSrc"
      :mode="editModalMode"
      @save="handleModalSave"
    />

    <!-- Hidden file input -->
    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleImageUpload"
    />

    <!-- Hidden container for SVG manipulation -->
    <div ref="hiddenContainer" style="position: absolute; left: -9999px; top: -9999px;"></div>
    <div ref="previewContainer" style="display: none;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import TagChatPanel from './TagChatPanel.vue'
import TagEditModal from './TagEditModal.vue'
import { useTagChat } from './composables/useTagChat'
import { 
  loadTagTemplate, 
  TAG_TEMPLATES, 
  getNextTemplate,
  getRandomTemplate, 
  type TagTemplateType
} from './utils/tagTemplateUtils'
import { generateTagPreview, getTemplateDisplayName, hasMoreBackgrounds, getRemainingBackgroundCount, getTotalBackgroundCount, resetUsedBackgrounds } from './generators'
import type { ChatMessage, ExtractedTagInfo, TagFormData } from './types'
import { DEFAULT_FIELD_ORDER } from './types'

// Refs
const chatMessages = ref<ChatMessage[]>([])
const extractedInfo = ref<ExtractedTagInfo>({})
const formData = ref<TagFormData>({})
const isAnalyzing = ref(false)
const hasUserImage = ref(false)
const userImageSrc = ref<string | null>(null)
const currentTemplate = ref<TagTemplateType>('tag.svg')

const chatPanelRef = ref<InstanceType<typeof TagChatPanel> | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const hiddenContainer = ref<HTMLElement | null>(null)
const previewContainer = ref<HTMLElement | null>(null)
const usedTemplates = ref<Set<TagTemplateType>>(new Set())  // Track used templates to prevent duplicates
const showEditModal = ref(false)  // Control edit modal visibility
const editModalMode = ref<'generate' | 'confirm'>('generate')  // Modal button mode

// Chat composable
const { startConversation, processMessage, handleAction: chatHandleAction } = useTagChat({
  extractedInfo,
  chatMessages,
  isAnalyzing,
  hasImage: hasUserImage,
  onGenerate: () => {
    // Pick random template from unused templates
    const availableTemplates = TAG_TEMPLATES.filter(t => !usedTemplates.value.has(t))
    if (availableTemplates.length === 0) {
      // All templates used - notify user
      chatMessages.value.push({
        id: Date.now(),
        text: '✅ You\'ve seen all available template styles! Each template has been shown once.',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }
    const randomIndex = Math.floor(Math.random() * availableTemplates.length)
    currentTemplate.value = availableTemplates[randomIndex]
    usedTemplates.value.add(currentTemplate.value)  // Mark as used
    console.log(`🎲 Randomly selected template: ${currentTemplate.value} (${usedTemplates.value.size}/${TAG_TEMPLATES.length} used)`)
    generatePreview(currentTemplate.value)
  },
  onRegenerate: regenerateWithNextTemplate,
  onScrollToBottom: scrollToBottom,
  onUploadImage: triggerImageUpload,
  onOpenEditModal: () => {
    editModalMode.value = 'generate'
    showEditModal.value = true
  },
  onResetSession: () => {
    usedTemplates.value.clear()
    resetUsedBackgrounds()
    console.log('🔄 Session reset — templates and backgrounds cleared')
  }
})

// Regenerate with a different template
function regenerateWithNextTemplate() {
  // Special handling for tag8 - allow it to repeat with different backgrounds
  if (currentTemplate.value === 'tag8.svg' && hasMoreBackgrounds()) {
    // Stay on tag8 but generate with a new background
    console.log(`🖼️ Tag8: Generating with new background (${getRemainingBackgroundCount()} remaining)`)
    generatePreview(currentTemplate.value)
    return
  }
  
  // Pick a DIFFERENT random template from unused templates
  // For tag8, only mark as used when all backgrounds are exhausted
  let availableTemplates = TAG_TEMPLATES.filter(t => {
    if (t === 'tag8.svg') {
      // Tag8 is available if it has unused backgrounds
      return hasMoreBackgrounds() || !usedTemplates.value.has(t)
    }
    return !usedTemplates.value.has(t)
  })
  
  if (availableTemplates.length === 0) {
    // All templates have been used - notify user
    chatMessages.value.push({
      id: Date.now(),
      text: `✅ You've seen all available template styles including all ${getTotalBackgroundCount()} background variations! You can download any of the previews above.`,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }
  
  const randomIndex = Math.floor(Math.random() * availableTemplates.length)
  currentTemplate.value = availableTemplates[randomIndex]
  
  // Only mark tag8 as fully used when all backgrounds are exhausted
  if (currentTemplate.value !== 'tag8.svg') {
    usedTemplates.value.add(currentTemplate.value)
  } else if (!hasMoreBackgrounds()) {
    usedTemplates.value.add(currentTemplate.value)
  }
  
  console.log(`🔄 Randomly switching to template: ${currentTemplate.value} (${usedTemplates.value.size}/${TAG_TEMPLATES.length} used)`)
  
  generatePreview(currentTemplate.value)
}

// Lifecycle
onMounted(() => {
  startConversation()
})

// Methods
function scrollToBottom() {
  nextTick(() => {
    chatPanelRef.value?.scrollToBottom()
  })
}

async function handleSendMessage(message: string) {
  // Add user message
  chatMessages.value.push({
    id: Date.now(),
    text: message,
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()

  isAnalyzing.value = true
  await processMessage(message)
  isAnalyzing.value = false
}

function handleAction(action: string, messageId?: number) {
  if (action === 'download') {
    downloadSvg(messageId)
  } else if (action === 'open_window') {
    openPreviewWindow(messageId)
  } else if (action === 'edit_tag') {
    editModalMode.value = 'confirm'
    showEditModal.value = true
  } else {
    chatHandleAction(action)
  }
}

/**
 * Handle save from edit modal
 */
async function handleModalSave(data: ExtractedTagInfo, logoSrc: string | null) {
  // Update extracted info with edited data
  extractedInfo.value = { ...data }
  
  // Update logo if provided
  if (logoSrc) {
    userImageSrc.value = logoSrc
    hasUserImage.value = true
  }

  // Re-render all previously generated previews with updated data
  await reRenderPreviousPreviews()
  
  // In confirm mode (hover edit), only update existing tags — don't generate new ones
  if (editModalMode.value === 'confirm') {
    scrollToBottom()
    return
  }

  // Generate a new preview with a new template
  const availableTemplates = TAG_TEMPLATES.filter(t => !usedTemplates.value.has(t))
  if (availableTemplates.length === 0) {
    chatMessages.value.push({
      id: Date.now(),
      text: '✅ You\'ve seen all available template styles! Each template has been shown once.',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }
  const randomIndex = Math.floor(Math.random() * availableTemplates.length)
  currentTemplate.value = availableTemplates[randomIndex]
  usedTemplates.value.add(currentTemplate.value)
  generatePreview(currentTemplate.value)
}

/**
 * Re-render all previously generated preview messages with updated extractedInfo/formData
 */
async function reRenderPreviousPreviews() {
  // Map formData from extractedInfo
  formData.value = {
    tagTitle: extractedInfo.value.tagTitle || '',
    theme: extractedInfo.value.theme || '',
    eventType: extractedInfo.value.eventType || '',
    logoTitle: extractedInfo.value.logoTitle || ''
  }

  const previewMessages = chatMessages.value.filter(m => m.type === 'preview' && m.templateName)
  for (const msg of previewMessages) {
    try {
      const templateName = msg.templateName as TagTemplateType
      const svg = await loadTagTemplate(hiddenContainer.value, templateName)
      if (!svg) continue

      await generateTagPreview(
        templateName,
        svg,
        formData.value,
        extractedInfo.value,
        hasUserImage.value,
        userImageSrc.value
      )
      await nextTick()

      if (hiddenContainer.value) {
        // Update the stored preview HTML in the chat message
        msg.text = hiddenContainer.value.innerHTML
        hiddenContainer.value.innerHTML = ''
      }
    } catch (err) {
      console.warn(`⚠️ Failed to re-render preview for ${msg.templateName}:`, err)
    }
  }
  console.log(`🔄 Re-rendered ${previewMessages.length} previous preview(s) with updated data`)
}

/**
 * Download the SVG as PNG
 * @param messageId - Optional message ID to download a specific preview
 */
function downloadSvg(messageId?: number) {
  // Find the latest preview SVG from chat messages
  const previewMessages = chatMessages.value.filter(m => m.type === 'preview')
  if (previewMessages.length === 0) {
    console.error('No preview found to download')
    return
  }
  
  // Get the specific preview by message ID, or use the latest if no ID provided
  const targetPreview = messageId 
    ? previewMessages.find(msg => msg.id === messageId)
    : previewMessages[previewMessages.length - 1]
  
  if (!targetPreview) {
    console.error('Could not find the selected preview')
    return
  }
  
  const latestPreview = targetPreview
  const parser = new DOMParser()
  const doc = parser.parseFromString(latestPreview.text, 'text/html')
  const svg = doc.querySelector('svg')
  
  if (!svg) {
    console.error('No SVG found in preview')
    return
  }
  
  // Clone SVG for export
  const svgClone = svg.cloneNode(true) as SVGSVGElement
  
  // Target physical size: 4.076 x 5.765 inches at 150 DPI (right size for screen/print)
  const targetWidthInches = 4.076
  const targetHeightInches = 5.765
  const dpi = 150
  const width = Math.round(targetWidthInches * dpi)   // 611 pixels
  const height = Math.round(targetHeightInches * dpi)  // 865 pixels
  
  // Set explicit width and height on SVG for proper scaling
  svgClone.setAttribute('width', String(width))
  svgClone.setAttribute('height', String(height))
  
  // Create a canvas with the calculated dimensions
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { alpha: false })
  
  if (!ctx) {
    console.error('Failed to get canvas context')
    return
  }
  
  // Fill canvas with white background to preserve colors
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)
  
  // Convert SVG to data URL
  const svgData = new XMLSerializer().serializeToString(svgClone)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  
  // Draw on canvas and download
  const img = new Image()
  img.onload = () => {
    // Draw image to fill the entire canvas (scales from viewBox to target dimensions)
    ctx.drawImage(img, 0, 0, width, height)
    URL.revokeObjectURL(url)
    
    // Download as PNG with maximum quality
    const link = document.createElement('a')
    // Use the template name stored in the preview message, not the current global template
    const templateForFilename = latestPreview.templateName || currentTemplate.value
    const filename = `tag-${templateForFilename.replace('.svg', '')}-${Date.now()}.png`
    link.download = filename
    link.href = canvas.toDataURL('image/png', 1.0)  // Quality 1.0 for best output
    link.click()
    
    // Add success message
    chatMessages.value.push({
      id: Date.now(),
      text: `✅ Downloaded: ${filename}`,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }
  img.onerror = () => {
    console.error('Failed to load SVG for export')
    URL.revokeObjectURL(url)
  }
  img.src = url
}

/**
 * Open preview in a new window
 * @param messageId - Optional message ID to open a specific preview
 */
function openPreviewWindow(messageId?: number) {
  // Find the preview SVG from chat messages
  const previewMessages = chatMessages.value.filter(m => m.type === 'preview')
  if (previewMessages.length === 0) {
    console.error('No preview found to open')
    return
  }
  
  // Get the specific preview by message ID, or use the latest if no ID provided
  const targetPreview = messageId 
    ? previewMessages.find(msg => msg.id === messageId)
    : previewMessages[previewMessages.length - 1]
  
  if (!targetPreview) {
    console.error('Could not find the selected preview')
    return
  }
  
  const latestPreview = targetPreview
  
  // Create a new window with the SVG
  const newWindow = window.open('', '_blank', 'width=800,height=1100')
  if (!newWindow) {
    console.error('Failed to open preview window - popup blocked?')
    chatMessages.value.push({
      id: Date.now(),
      text: '⚠️ Could not open preview window. Please allow popups for this site.',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }
  
  // Build the download function as a string with fixed physical dimensions
  const downloadFn = [
    'function downloadPNG() {',
    '  const svg = document.querySelector("svg");',
    '  if (!svg) return;',
    '  const svgClone = svg.cloneNode(true);',
    '  // Target physical size: 4.076 x 5.765 inches at 150 DPI (right size for screen/print)',
    '  const targetWidthInches = 4.076;',
    '  const targetHeightInches = 5.765;',
    '  const dpi = 150;',
    '  const width = Math.round(targetWidthInches * dpi);   // 611 pixels',
    '  const height = Math.round(targetHeightInches * dpi);  // 865 pixels',
    '  // Set explicit width and height on SVG for proper scaling',
    '  svgClone.setAttribute("width", String(width));',
    '  svgClone.setAttribute("height", String(height));',
    '  const canvas = document.createElement("canvas");',
    '  canvas.width = width;',
    '  canvas.height = height;',
    '  const ctx = canvas.getContext("2d", { alpha: false });',
    '  if (!ctx) return;',
    '  // Fill canvas with white background to preserve colors',
    '  ctx.fillStyle = "#FFFFFF";',
    '  ctx.fillRect(0, 0, width, height);',
    '  const svgData = new XMLSerializer().serializeToString(svgClone);',
    '  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });',
    '  const url = URL.createObjectURL(svgBlob);',
    '  const img = new Image();',
    '  img.onload = () => {',
    '    ctx.drawImage(img, 0, 0, width, height);',
    '    URL.revokeObjectURL(url);',
    '    const link = document.createElement("a");',
    '    link.download = "tag-preview-" + Date.now() + ".png";',
    '    link.href = canvas.toDataURL("image/png", 1.0);',
    '    link.click();',
    '  };',
    '  img.src = url;',
    '}'
  ].join('\n')
  
  // Write the preview content using DOM methods
  newWindow.document.write('<!DOCTYPE html><html><head>')
  const previewTemplateName = latestPreview.templateName || currentTemplate.value
  newWindow.document.write('<title>Tag Preview - ' + previewTemplateName + '</title>')
  newWindow.document.write('<style>')
  newWindow.document.write('body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; background: #f0f0f0; }')
  newWindow.document.write('.preview-container { background: white; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border-radius: 8px; }')
  newWindow.document.write('svg { max-width: 100%; height: auto; display: block; }')
  newWindow.document.write('.controls { position: fixed; top: 20px; right: 20px; display: flex; gap: 10px; }')
  newWindow.document.write('button { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; }')
  newWindow.document.write('.download-btn { background: #4CAF50; color: white; }')
  newWindow.document.write('.download-btn:hover { background: #45a049; }')
  newWindow.document.write('.print-btn { background: #2196F3; color: white; }')
  newWindow.document.write('.print-btn:hover { background: #1976D2; }')
  newWindow.document.write('</style></head><body>')
  newWindow.document.write('<div class="controls">')
  newWindow.document.write('<button class="download-btn" onclick="downloadPNG()">Download PNG</button>')
  newWindow.document.write('<button class="print-btn" onclick="window.print()">Print</button>')
  newWindow.document.write('</div>')
  newWindow.document.write('<div class="preview-container">')
  newWindow.document.write(latestPreview.text)
  newWindow.document.write('</div>')
  newWindow.document.write('</body></html>')
  newWindow.document.close()
  
  // Add the download function after document is written
  const scriptEl = newWindow.document.createElement('script')
  scriptEl.textContent = downloadFn
  newWindow.document.head.appendChild(scriptEl)
}

function triggerImageUpload() {
  imageInput.value?.click()
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    userImageSrc.value = e.target?.result as string
    hasUserImage.value = true

    chatMessages.value.push({
      id: Date.now(),
      text: '✅ Image uploaded successfully!',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()

    await processMessage('Image uploaded')
  }
  reader.readAsDataURL(file)
}

/**
 * Generate preview using the appropriate template generator
 */
async function generatePreview(templateName: TagTemplateType = 'tag.svg') {
  console.log(`🎨 Generating preview with template: ${templateName}...`)


  // Map formData directly from extractedInfo fields.
  // subtheme & baseText are rendered via extractedInfo in dedicated generator sections,
  // so they must NOT be included in the 3 main formData slots (tagTitle, theme, eventType).
  formData.value = {
    tagTitle: extractedInfo.value.tagTitle || '',
    theme: extractedInfo.value.theme || '',
    eventType: extractedInfo.value.eventType || '',
    logoTitle: extractedInfo.value.logoTitle || ''
  }
  
  console.log('📋 FormData - tagTitle:', formData.value.tagTitle, 'theme:', formData.value.theme, 'eventType:', formData.value.eventType)
  console.log('📋 ExtractedInfo - eventType:', extractedInfo.value.eventType)

  try {
    // Load template SVG (for tag.svg, it will use the current background)
    const svg = await loadTagTemplate(hiddenContainer.value, templateName)
    if (!svg) throw new Error('Failed to load template')

    // Generate preview using the appropriate generator
    await generateTagPreview(
      templateName,
      svg,
      formData.value,
      extractedInfo.value,
      hasUserImage.value,
      userImageSrc.value
    )

    await nextTick()

    // Move to preview container and show in chat
    if (previewContainer.value && hiddenContainer.value) {
      previewContainer.value.innerHTML = hiddenContainer.value.innerHTML
      hiddenContainer.value.innerHTML = ''

      // Create display name
      const templateDisplayName = getTemplateDisplayName(templateName)
      
      // Create preview message with regenerate button
      chatMessages.value.push({
        id: Date.now(),
        text: previewContainer.value.innerHTML,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'preview',
        templateName: templateName,  // Store which template generated this preview
        actions: [
          { type: 'regenerate', label: 'Try Different Style', variant: 'secondary' },
          { type: 'open_window', label: 'Open Preview', variant: 'primary' },
          { type: 'download', label: 'Download', variant: 'secondary' }
        ]
      })
      
      // Add message about template style
      chatMessages.value.push({
        id: Date.now() + 1,
        text: `Template: ${templateDisplayName}\n\nLike this design? You can download it, or click "Try Different Style" to see another template with the same content.`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      
      scrollToBottom()
    }

    console.log(`✅ Preview generated successfully with template: ${templateName}`)
  } catch (error) {
    console.error('❌ Error generating preview:', error)
    chatMessages.value.push({
      id: Date.now(),
      text: '❌ Failed to generate preview. Please try again.',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }
}
</script>

<style scoped>
.tag-template-panel {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
