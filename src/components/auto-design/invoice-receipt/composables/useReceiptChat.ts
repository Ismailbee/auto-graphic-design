/**
 * Receipt Chat Composable
 * Handles the conversational flow for creating receipts (similar to useTagChat)
 */

import { ref, type Ref } from 'vue'

export interface ChatMessage {
  id: number
  text: string
  sender: 'user' | 'ai'
  time: string
  actions?: ChatAction[]
  showColorDropdown?: boolean
}

export interface ChatAction {
  type: string
  label: string
  variant: 'primary' | 'secondary' | 'danger'
}

export interface ExtractedReceiptInfo {
  organizationName?: string
  organizationSubName?: string
  headOfficeAddress?: string
  headOfficePhone?: string
  branchAddress1?: string
  branch1Phone?: string
  branchAddress2?: string
  branch2Phone?: string
  logoDataUrl?: string
  receivedFrom?: string
  paymentFor?: string
  paymentFor2?: string
  naira?: number
  sumOf?: string
  sumOf2?: string
  date?: string
  selectedTemplate?: string
}

export type ReceiptConversationStep = 
  | 'initial'
  | 'asking_input_method'
  | 'waiting_bulk_input'
  | 'reviewing_bulk_input'
  | 'editing_field'
  | 'asking_logo'
  | 'waiting_logo_upload'
  | 'asking_organization'
  | 'asking_address'
  | 'asking_received_from'
  | 'asking_payment_for'
  | 'asking_amount'
  | 'asking_date'
  | 'ready_to_generate'
  | 'complete'

export interface UseReceiptChatOptions {
  extractedInfo: Ref<ExtractedReceiptInfo>
  chatMessages: Ref<ChatMessage[]>
  isAnalyzing: Ref<boolean>
  hasLogo?: Ref<boolean>
  onGenerate: () => void
  onScrollToBottom: () => void
  onUploadLogo?: () => void
  onOpenEditModal?: () => void
}

export function useReceiptChat(options: UseReceiptChatOptions) {
  const { extractedInfo, chatMessages, isAnalyzing, hasLogo, onGenerate, onScrollToBottom, onUploadLogo } = options
  
  const currentStep = ref<ReceiptConversationStep>('initial')

  function addMessage(message: ChatMessage) {
    chatMessages.value.push(message)
    onScrollToBottom()
  }

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function startConversation() {
    currentStep.value = 'asking_input_method'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'Welcome! Let\'s create your receipt. 🧾\n\nYou can either:\n• Paste all your receipt information at once\n• Or click "Step-by-Step" to fill in each field',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'bulk_input', label: '📋 Paste All Info', variant: 'primary' },
        { type: 'step_by_step', label: '📝 Step-by-Step', variant: 'secondary' }
      ]
    })
  }

  async function processMessage(message: string): Promise<boolean> {
    const lowerMsg = message.trim().toLowerCase()
    const lines = message.split('\n').filter(l => l.trim().length > 0)

    if (currentStep.value === 'initial') {
      await startConversation()
      return true
    }

    switch (currentStep.value) {
      case 'asking_input_method':
        // Auto-detect input type based on content
        const hasBulkIndicators = lines.length > 2 || 
          /(organization|company|received from|payment for|amount|naira|address):/i.test(message)
        
        if (hasBulkIndicators) {
          currentStep.value = 'waiting_bulk_input'
          await parseBulkInput(message)
        } else if (lowerMsg.includes('paste') || lowerMsg.includes('bulk') || lowerMsg.includes('all')) {
          currentStep.value = 'waiting_bulk_input'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Great! Please paste all your receipt information below.\n\n**Recommended Format:**\nOrganization Name\nSub-name (optional)\nHead Office Address\nPhone: 08012345678\nReceived From: Customer Name\nPayment For: Service description\nAmount: 50000\nDate: 15th December 2026\n\nI\'ll automatically detect and organize everything!',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        } else if (lowerMsg.includes('step') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
          await askForLogo()
        }
        break

      case 'waiting_bulk_input':
        await parseBulkInput(message)
        break

      case 'reviewing_bulk_input':
        if (lowerMsg.includes('generate') || lowerMsg.includes('looks good') || lowerMsg.includes('correct') || lowerMsg.includes('yes')) {
          await generateReceipt()
        }
        break

      case 'editing_field':
        await handleFieldEdit(message)
        break

      case 'asking_logo':
        if (lowerMsg.includes('yes') || lowerMsg.includes('upload')) {
          currentStep.value = 'waiting_logo_upload'
          onUploadLogo?.()
        } else {
          await askForOrganization()
        }
        break

      case 'waiting_logo_upload':
        // Wait for logo upload callback
        break

      case 'asking_organization':
        extractedInfo.value.organizationName = message.trim()
        await askForAddress()
        break

      case 'asking_address':
        extractedInfo.value.headOfficeAddress = message.trim()
        await askForReceivedFrom()
        break

      case 'asking_received_from':
        extractedInfo.value.receivedFrom = message.trim()
        await askForPaymentFor()
        break

      case 'asking_payment_for':
        extractedInfo.value.paymentFor = message.trim()
        await askForAmount()
        break

      case 'asking_amount':
        const amount = parseFloat(message.replace(/[^0-9.]/g, ''))
        if (!isNaN(amount)) {
          extractedInfo.value.naira = amount
        }
        await askForDate()
        break

      case 'asking_date':
        extractedInfo.value.date = message.trim()
        await showReview()
        break

      case 'ready_to_generate':
        if (lowerMsg.includes('generate') || lowerMsg.includes('yes') || lowerMsg.includes('preview')) {
          await generateReceipt()
        }
        break

      case 'complete':
        addMessage({
          id: Date.now(),
          text: 'Your receipt has been generated! Would you like to create another one?',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'restart', label: '🔄 Create New Receipt', variant: 'primary' }
          ]
        })
        break
    }

    return true
  }

  async function askForLogo() {
    currentStep.value = 'asking_logo'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'Let\'s start! Do you have a company logo to upload? 🖼️',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'upload_logo', label: '📤 Upload Logo', variant: 'primary' },
        { type: 'skip_logo', label: 'Skip for now', variant: 'secondary' }
      ]
    })
  }

  async function askForOrganization() {
    currentStep.value = 'asking_organization'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'What is your organization/company name? 🏢',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function askForAddress() {
    currentStep.value = 'asking_address'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'Great! What is your head office address? 📍',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function askForReceivedFrom() {
    currentStep.value = 'asking_received_from'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'Who is this receipt for? (Received From) 👤',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function askForPaymentFor() {
    currentStep.value = 'asking_payment_for'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'What is the payment for? 📝',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function askForAmount() {
    currentStep.value = 'asking_amount'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'What is the amount in Naira (₦)? 💰',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function askForDate() {
    currentStep.value = 'asking_date'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'What is the date for this receipt? 📅\n(e.g., "15th December 2026" or leave blank for today)',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function showReview() {
    currentStep.value = 'ready_to_generate'
    await delay(500)
    
    const info = extractedInfo.value
    let reviewText = `✅ **Receipt Information Ready!**\n\n`
    reviewText += `🏢 Organization: ${info.organizationName || '(Not provided)'}\n`
    if (info.organizationSubName) reviewText += `   Sub-name: ${info.organizationSubName}\n`
    reviewText += `📍 Address: ${info.headOfficeAddress || '(Not provided)'}\n`
    if (info.headOfficePhone) reviewText += `📞 Phone: ${info.headOfficePhone}\n`
    reviewText += `👤 Received From: ${info.receivedFrom || '(Not provided)'}\n`
    reviewText += `📝 Payment For: ${info.paymentFor || '(Not provided)'}\n`
    reviewText += `💰 Amount: ₦${(info.naira || 0).toLocaleString()}\n`
    reviewText += `📅 Date: ${info.date || 'Today'}\n\n`
    reviewText += `\nSelect color preference and generate your receipt!`

    addMessage({
      id: Date.now(),
      text: reviewText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showColorDropdown: true,
      actions: [
        { type: 'color_1', label: '🖤 1 Color', variant: 'secondary' },
        { type: 'color_2', label: '🎨 2 Color', variant: 'secondary' },
        { type: 'color_3', label: '🌈 3 Color', variant: 'secondary' },
        { type: 'review_edit', label: '📝 Review & Edit', variant: 'secondary' },
        { type: 'generate_now', label: '✨ Generate Receipt', variant: 'primary' }
      ]
    })
  }

  async function generateReceipt() {
    currentStep.value = 'complete'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: '🎉 Generating your receipt now...',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    await delay(800)
    onGenerate()
  }

  async function parseBulkInput(message: string) {
    isAnalyzing.value = true
    await delay(1000)

    const lines = message.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    const fullText = message.toLowerCase()

    console.log('=== PARSING RECEIPT INPUT ===')
    console.log('Lines:', lines)

    // Extract organization name (first non-labeled line)
    const contentLines = lines.filter(line => 
      !/(organization|company|received from|payment for|amount|naira|address|phone|date|sub-?name):/i.test(line)
    )
    
    if (contentLines.length >= 1) {
      extractedInfo.value.organizationName = contentLines[0]
    }
    if (contentLines.length >= 2) {
      // Check if second line looks like a sub-name or address
      if (contentLines[1].length < 50 && !contentLines[1].includes(',')) {
        extractedInfo.value.organizationSubName = contentLines[1]
      } else {
        extractedInfo.value.headOfficeAddress = contentLines[1]
      }
    }

    // Parse labeled fields
    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      
      if (/(organization|company)\s*:/i.test(line)) {
        extractedInfo.value.organizationName = line.replace(/(organization|company)\s*:/i, '').trim()
      }
      if (/sub-?name\s*:/i.test(line)) {
        extractedInfo.value.organizationSubName = line.replace(/sub-?name\s*:/i, '').trim()
      }
      if (/address\s*:/i.test(line)) {
        extractedInfo.value.headOfficeAddress = line.replace(/address\s*:/i, '').trim()
      }
      if (/phone\s*:/i.test(line)) {
        extractedInfo.value.headOfficePhone = line.replace(/phone\s*:/i, '').trim()
      }
      if (/received\s*from\s*:/i.test(line)) {
        extractedInfo.value.receivedFrom = line.replace(/received\s*from\s*:/i, '').trim()
      }
      if (/payment\s*for\s*:/i.test(line)) {
        extractedInfo.value.paymentFor = line.replace(/payment\s*for\s*:/i, '').trim()
      }
      if (/(amount|naira|₦)\s*:/i.test(line)) {
        const amountStr = line.replace(/(amount|naira|₦)\s*:/i, '').trim()
        const amount = parseFloat(amountStr.replace(/[^0-9.]/g, ''))
        if (!isNaN(amount)) {
          extractedInfo.value.naira = amount
        }
      }
      if (/date\s*:/i.test(line)) {
        extractedInfo.value.date = line.replace(/date\s*:/i, '').trim()
      }
    }

    isAnalyzing.value = false
    currentStep.value = 'reviewing_bulk_input'

    // Show review
    await showReview()
  }

  async function handleFieldEdit(message: string) {
    const fieldBeingEdited = (window as any).__editingReceiptField
    if (fieldBeingEdited) {
      (extractedInfo.value as any)[fieldBeingEdited] = message.trim()
      delete (window as any).__editingReceiptField
      
      currentStep.value = 'ready_to_generate'
      await delay(500)
      addMessage({
        id: Date.now(),
        text: `✅ Updated ${fieldBeingEdited}!`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      await showReview()
    }
  }

  async function handleAction(action: string) {
    switch (action) {
      case 'bulk_input':
        currentStep.value = 'waiting_bulk_input'
        await delay(500)
        addMessage({
          id: Date.now(),
          text: 'Please paste all your receipt information below.\n\n**Example Format:**\nOrganization: ABC Company Ltd\nAddress: 123 Main Street, Lagos\nPhone: 08012345678\nReceived From: John Doe\nPayment For: Consulting Services\nAmount: 150000\nDate: 15th December 2026',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break

      case 'step_by_step':
        await askForLogo()
        break

      case 'upload_logo':
        currentStep.value = 'waiting_logo_upload'
        onUploadLogo?.()
        break

      case 'skip_logo':
        await askForOrganization()
        break

      case 'review_edit':
        options.onOpenEditModal?.()
        break

      case 'generate_now':
        await generateReceipt()
        break

      case 'restart':
        currentStep.value = 'initial'
        chatMessages.value = []
        extractedInfo.value = {}
        await startConversation()
        break

      case 'edit_organization':
        currentStep.value = 'editing_field'
        ;(window as any).__editingReceiptField = 'organizationName'
        addMessage({
          id: Date.now(),
          text: 'Please type the new Organization Name:',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break

      case 'edit_received_from':
        currentStep.value = 'editing_field'
        ;(window as any).__editingReceiptField = 'receivedFrom'
        addMessage({
          id: Date.now(),
          text: 'Please type the new Received From:',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break

      case 'edit_payment_for':
        currentStep.value = 'editing_field'
        ;(window as any).__editingReceiptField = 'paymentFor'
        addMessage({
          id: Date.now(),
          text: 'Please type the new Payment For:',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break

      case 'edit_amount':
        currentStep.value = 'editing_field'
        ;(window as any).__editingReceiptField = 'naira'
        addMessage({
          id: Date.now(),
          text: 'Please type the new Amount (₦):',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break

      case 'color_1':
        extractedInfo.value.selectedTemplate = 'template1'
        addMessage({
          id: Date.now(),
          text: '🖤 Selected: 1 Color (Black & White)',
          sender: 'user',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break

      case 'color_2':
        extractedInfo.value.selectedTemplate = 'template2'
        addMessage({
          id: Date.now(),
          text: '🎨 Selected: 2 Color',
          sender: 'user',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break

      case 'color_3':
        extractedInfo.value.selectedTemplate = 'template3'
        addMessage({
          id: Date.now(),
          text: '🌈 Selected: 3 Color (Full Color)',
          sender: 'user',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break
    }
  }

  // Called when logo upload is complete
  function onLogoUploaded(logoUrl: string) {
    extractedInfo.value.logoDataUrl = logoUrl
    addMessage({
      id: Date.now(),
      text: '✅ Logo uploaded successfully!',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    askForOrganization()
  }

  return {
    currentStep,
    startConversation,
    processMessage,
    handleAction,
    onLogoUploaded
  }
}
