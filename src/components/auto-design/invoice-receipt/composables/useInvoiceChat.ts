/**
 * Invoice Chat Composable
 * Handles the conversational flow for creating invoices with item details
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

export interface InvoiceItem {
  id: number
  description: string
  quantity: number
  price: number
  tax: number
}

export interface ExtractedInvoiceInfo {
  organizationName?: string
  organizationSubName?: string
  headOfficeAddress?: string
  headOfficePhone?: string
  branchAddress1?: string
  branch1Phone?: string
  branchAddress2?: string
  branch2Phone?: string
  logoDataUrl?: string
  customerName?: string
  customerAddress?: string
  date?: string
  lpo?: string
  items?: InvoiceItem[]
  taxEnabled?: boolean
  taxRate?: number
  sumOf?: string
  sumOf2?: string
  selectedTemplate?: 'template1' | 'template2' | 'template3'
  accentColor?: string
}

export type InvoiceConversationStep = 
  | 'initial'
  | 'asking_input_method'
  | 'waiting_bulk_input'
  | 'reviewing_bulk_input'
  | 'editing_field'
  | 'asking_logo'
  | 'waiting_logo_upload'
  | 'asking_organization'
  | 'asking_address'
  | 'asking_customer_name'
  | 'asking_customer_address'
  | 'asking_lpo'
  | 'asking_date'
  | 'asking_want_items'       // Ask if user wants to add item details
  | 'showing_items_form'      // Show the items form for manual entry
  | 'asking_item_description'
  | 'asking_item_quantity'
  | 'asking_item_price'
  | 'asking_more_items'
  | 'asking_tax'

  | 'ready_to_generate'
  | 'complete'

export interface UseInvoiceChatOptions {
  extractedInfo: Ref<ExtractedInvoiceInfo>
  chatMessages: Ref<ChatMessage[]>
  isAnalyzing: Ref<boolean>
  hasLogo?: Ref<boolean>
  showItemsForm: Ref<boolean>  // Controls visibility of items form
  onGenerate: () => void
  onScrollToBottom: () => void
  onUploadLogo?: () => void
  onOpenEditModal?: () => void
}

export function useInvoiceChat(options: UseInvoiceChatOptions) {
  const { extractedInfo, chatMessages, isAnalyzing, hasLogo, showItemsForm, onGenerate, onScrollToBottom, onUploadLogo } = options
  
  const currentStep = ref<InvoiceConversationStep>('initial')
  const currentItem = ref<Partial<InvoiceItem>>({})

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
      text: 'Welcome! Let\'s create your invoice. 🧾\n\nYou can either:\n• Paste all your invoice information at once\n• Or click "Step-by-Step" to fill in each field',
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
        const hasBulkIndicators = lines.length > 2 || 
          /(organization|company|customer|address|lpo|invoice|amount):/i.test(message)
        
        if (hasBulkIndicators) {
          currentStep.value = 'waiting_bulk_input'
          await parseBulkInput(message)
        } else if (lowerMsg.includes('paste') || lowerMsg.includes('bulk') || lowerMsg.includes('all')) {
          currentStep.value = 'waiting_bulk_input'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Great! Please paste all your invoice information below.\n\n**Recommended Format:**\nOrganization Name\nHead Office Address\nPhone: 08012345678\nCustomer: John Doe\nCustomer Address: 123 Main Street\nLPO: LPO-12345\nDate: 15th December 2026\n\nI\'ll automatically detect and organize everything!',
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
          await askAboutItems()
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
        await askForCustomerName()
        break

      case 'asking_customer_name':
        extractedInfo.value.customerName = message.trim()
        await askForCustomerAddress()
        break

      case 'asking_customer_address':
        extractedInfo.value.customerAddress = message.trim()
        await askForLPO()
        break

      case 'asking_lpo':
        extractedInfo.value.lpo = message.trim()
        await askForDate()
        break

      case 'asking_date':
        extractedInfo.value.date = message.trim()
        await askAboutItems()
        break

      case 'asking_want_items':
        if (lowerMsg.includes('yes') || lowerMsg.includes('add') || lowerMsg.includes('item')) {
          await showItemsSection()
        } else {
          await showFinalReview()
        }
        break

      case 'showing_items_form':
        // Items form is shown - user interacts with UI directly
        break

      case 'asking_item_description':
        currentItem.value.description = message.trim()
        await askItemQuantity()
        break

      case 'asking_item_quantity':
        const qty = parseInt(message)
        if (!isNaN(qty)) {
          currentItem.value.quantity = qty
        }
        await askItemPrice()
        break

      case 'asking_item_price':
        const price = parseFloat(message.replace(/[^0-9.]/g, ''))
        if (!isNaN(price)) {
          currentItem.value.price = price
        }
        await addItemToList()
        break

      case 'asking_more_items':
        if (lowerMsg.includes('yes') || lowerMsg.includes('add') || lowerMsg.includes('another')) {
          await askItemDescription()
        } else {
          await askAboutTax()
        }
        break

      case 'asking_tax':
        if (lowerMsg.includes('yes') || lowerMsg.includes('enable')) {
          extractedInfo.value.taxEnabled = true
          const taxMatch = message.match(/(\d+(?:\.\d+)?)\s*%?/)
          if (taxMatch) {
            extractedInfo.value.taxRate = parseFloat(taxMatch[1])
          } else {
            extractedInfo.value.taxRate = 7.5 // Default VAT rate
          }
        } else {
          extractedInfo.value.taxEnabled = false
        }
        await showFinalReview()
        break

      case 'ready_to_generate':
        if (lowerMsg.includes('generate') || lowerMsg.includes('yes') || lowerMsg.includes('preview')) {
          await generateInvoice()
        }
        break

      case 'complete':
        addMessage({
          id: Date.now(),
          text: 'Your invoice has been generated! Would you like to create another one?',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'restart', label: '🔄 Create New Invoice', variant: 'primary' }
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

  async function askForCustomerName() {
    currentStep.value = 'asking_customer_name'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'What is the customer\'s name? 👤',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function askForCustomerAddress() {
    currentStep.value = 'asking_customer_address'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'What is the customer\'s address? 📍',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function askForLPO() {
    currentStep.value = 'asking_lpo'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'Do you have an LPO/Reference number? (or type "skip") 📋',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function askForDate() {
    currentStep.value = 'asking_date'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'What is the invoice date? 📅\n(e.g., "15th December 2026" or type "today")',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  // KEY FEATURE: Ask if user wants to add item details
  async function askAboutItems() {
    currentStep.value = 'asking_want_items'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: '📦 Would you like to add item details (products/services with quantities and prices)?\n\nThis will show a form where you can add:\n• Item descriptions\n• Quantities\n• Prices\n• Tax (optional)',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'yes_items', label: '✅ Yes, Add Items', variant: 'primary' },
        { type: 'no_items', label: '❌ No, Skip Items', variant: 'secondary' }
      ]
    })
  }

  // Show the items form section
  async function showItemsSection() {
    currentStep.value = 'showing_items_form'
    showItemsForm.value = true  // This triggers the items form to show in the UI
    
    await delay(500)
    addMessage({
      id: Date.now(),
      text: '📝 **Item Details Form**\n\nUse the form below to add your invoice items. You can:\n• Add multiple items\n• Set quantity and price for each\n• Enable tax if needed\n\nClick "Done Adding Items" when you\'re finished.',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'done_items', label: '✅ Done Adding Items', variant: 'primary' }
      ]
    })
  }

  async function askItemDescription() {
    currentStep.value = 'asking_item_description'
    currentItem.value = { id: Date.now() }
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'What is the item/service description? 📝',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function askItemQuantity() {
    currentStep.value = 'asking_item_quantity'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'What is the quantity? 🔢',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function askItemPrice() {
    currentStep.value = 'asking_item_price'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'What is the unit price (₦)? 💰',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function addItemToList() {
    if (!extractedInfo.value.items) {
      extractedInfo.value.items = []
    }
    
    extractedInfo.value.items.push({
      id: currentItem.value.id || Date.now(),
      description: currentItem.value.description || '',
      quantity: currentItem.value.quantity || 1,
      price: currentItem.value.price || 0,
      tax: 0
    })

    currentItem.value = {}
    currentStep.value = 'asking_more_items'
    
    await delay(500)
    addMessage({
      id: Date.now(),
      text: `✅ Item added! (${extractedInfo.value.items.length} item(s) total)\n\nWould you like to add another item?`,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'add_another_item', label: '➕ Add Another Item', variant: 'primary' },
        { type: 'done_adding_items', label: '✅ Done Adding Items', variant: 'secondary' }
      ]
    })
  }

  async function askAboutTax() {
    currentStep.value = 'asking_tax'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'Would you like to enable tax for this invoice? 💰\n\nIf yes, type the tax rate (e.g., "7.5%") or just "yes" for default 7.5% VAT.',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'enable_tax', label: '✅ Enable Tax (7.5%)', variant: 'primary' },
        { type: 'no_tax', label: '❌ No Tax', variant: 'secondary' }
      ]
    })
  }

  async function showFinalReview() {
    currentStep.value = 'ready_to_generate'
    await delay(500)
    
    const info = extractedInfo.value
    let reviewText = `✅ **Invoice Information Ready!**\n\n`
    reviewText += `🏢 Organization: ${info.organizationName || '(Not provided)'}\n`
    if (info.organizationSubName) reviewText += `   Sub-name: ${info.organizationSubName}\n`
    reviewText += `📍 Address: ${info.headOfficeAddress || '(Not provided)'}\n`
    if (info.headOfficePhone) reviewText += `📞 Phone: ${info.headOfficePhone}\n`
    reviewText += `\n👤 Customer: ${info.customerName || '(Not provided)'}\n`
    reviewText += `📍 Customer Address: ${info.customerAddress || '(Not provided)'}\n`
    if (info.lpo) reviewText += `📋 LPO: ${info.lpo}\n`
    reviewText += `📅 Date: ${info.date || 'Today'}\n`
    
    if (info.items && info.items.length > 0) {
      reviewText += `\n📦 **Items (${info.items.length}):**\n`
      let total = 0
      info.items.forEach((item, idx) => {
        const amount = item.quantity * item.price
        total += amount
        reviewText += `  ${idx + 1}. ${item.description} - Qty: ${item.quantity} × ₦${item.price.toLocaleString()} = ₦${amount.toLocaleString()}\n`
      })
      if (info.taxEnabled && info.taxRate) {
        const taxAmount = total * (info.taxRate / 100)
        reviewText += `\n💰 Subtotal: ₦${total.toLocaleString()}\n`
        reviewText += `📊 Tax (${info.taxRate}%): ₦${taxAmount.toLocaleString()}\n`
        reviewText += `💵 **Total: ₦${(total + taxAmount).toLocaleString()}**\n`
      } else {
        reviewText += `\n💵 **Total: ₦${total.toLocaleString()}**\n`
      }
    }
    
    reviewText += `\nSelect color preference and generate your invoice!`

    addMessage({
      id: Date.now(),
      text: reviewText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showColorDropdown: true,
      actions: [
        { type: 'review_edit', label: '📝 Review & Edit', variant: 'secondary' },
        { type: 'generate_now', label: '✨ Generate Invoice', variant: 'primary' }
      ]
    })
  }

  async function generateInvoice() {
    currentStep.value = 'complete'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: '🎉 Generating your invoice now...',
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

    console.log('=== PARSING INVOICE INPUT ===')
    console.log('Lines:', lines)

    // Extract fields from lines
    const contentLines = lines.filter(line => 
      !/(organization|company|customer|address|phone|lpo|date|sub-?name):/i.test(line)
    )
    
    if (contentLines.length >= 1) {
      extractedInfo.value.organizationName = contentLines[0]
    }
    if (contentLines.length >= 2 && !contentLines[1].includes(',')) {
      extractedInfo.value.organizationSubName = contentLines[1]
    }

    // Parse labeled fields
    for (const line of lines) {
      if (/(organization|company)\s*:/i.test(line)) {
        extractedInfo.value.organizationName = line.replace(/(organization|company)\s*:/i, '').trim()
      }
      if (/sub-?name\s*:/i.test(line)) {
        extractedInfo.value.organizationSubName = line.replace(/sub-?name\s*:/i, '').trim()
      }
      if (/^address\s*:/i.test(line) || /head\s*office\s*address\s*:/i.test(line)) {
        extractedInfo.value.headOfficeAddress = line.replace(/(head\s*office\s*)?address\s*:/i, '').trim()
      }
      if (/phone\s*:/i.test(line)) {
        extractedInfo.value.headOfficePhone = line.replace(/phone\s*:/i, '').trim()
      }
      if (/customer\s*(name)?\s*:/i.test(line)) {
        extractedInfo.value.customerName = line.replace(/customer\s*(name)?\s*:/i, '').trim()
      }
      if (/customer\s*address\s*:/i.test(line)) {
        extractedInfo.value.customerAddress = line.replace(/customer\s*address\s*:/i, '').trim()
      }
      if (/lpo\s*:/i.test(line) || /reference\s*:/i.test(line)) {
        extractedInfo.value.lpo = line.replace(/(lpo|reference)\s*:/i, '').trim()
      }
      if (/date\s*:/i.test(line)) {
        extractedInfo.value.date = line.replace(/date\s*:/i, '').trim()
      }
    }

    isAnalyzing.value = false
    currentStep.value = 'reviewing_bulk_input'

    // Show initial review then ask about items
    await delay(500)
    const info = extractedInfo.value
    let reviewText = `✅ **Information Extracted!**\n\n`
    reviewText += `🏢 Organization: ${info.organizationName || '(Not provided)'}\n`
    reviewText += `📍 Address: ${info.headOfficeAddress || '(Not provided)'}\n`
    reviewText += `👤 Customer: ${info.customerName || '(Not provided)'}\n`
    reviewText += `📅 Date: ${info.date || 'Today'}\n\n`
    reviewText += `Does this look correct?`

    addMessage({
      id: Date.now(),
      text: reviewText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'continue_to_items', label: '✅ Yes, Continue', variant: 'primary' },
        { type: 'review_edit', label: '📝 Edit Info', variant: 'secondary' }
      ]
    })
  }

  async function handleFieldEdit(message: string) {
    const fieldBeingEdited = (window as any).__editingInvoiceField
    if (fieldBeingEdited) {
      (extractedInfo.value as any)[fieldBeingEdited] = message.trim()
      delete (window as any).__editingInvoiceField
      
      currentStep.value = 'ready_to_generate'
      await delay(500)
      addMessage({
        id: Date.now(),
        text: `✅ Updated ${fieldBeingEdited}!`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      await showFinalReview()
    }
  }

  async function handleAction(action: string) {
    switch (action) {
      case 'bulk_input':
        currentStep.value = 'waiting_bulk_input'
        await delay(500)
        addMessage({
          id: Date.now(),
          text: 'Please paste all your invoice information below.\n\n**Example Format:**\nOrganization: ABC Company Ltd\nAddress: 123 Main Street, Lagos\nPhone: 08012345678\nCustomer: John Doe\nCustomer Address: 456 Other Street\nLPO: LPO-12345\nDate: 15th December 2026',
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

      case 'continue_to_items':
        await askAboutItems()
        break

      case 'yes_items':
        await showItemsSection()
        break

      case 'no_items':
        await showFinalReview()
        break

      case 'done_items':
        showItemsForm.value = false
        await askAboutTax()
        break

      case 'add_another_item':
        await askItemDescription()
        break

      case 'done_adding_items':
        await askAboutTax()
        break

      case 'enable_tax':
        extractedInfo.value.taxEnabled = true
        extractedInfo.value.taxRate = 7.5
        await showFinalReview()
        break

      case 'no_tax':
        extractedInfo.value.taxEnabled = false
        await showFinalReview()
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

      case 'review_edit':
        options.onOpenEditModal?.()
        break

      case 'generate_now':
        await generateInvoice()
        break

      case 'restart':
        currentStep.value = 'initial'
        chatMessages.value = []
        extractedInfo.value = {}
        showItemsForm.value = false
        await startConversation()
        break

      case 'edit_organization':
        currentStep.value = 'editing_field'
        ;(window as any).__editingInvoiceField = 'organizationName'
        addMessage({
          id: Date.now(),
          text: 'Please type the new Organization Name:',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break

      case 'edit_customer':
        currentStep.value = 'editing_field'
        ;(window as any).__editingInvoiceField = 'customerName'
        addMessage({
          id: Date.now(),
          text: 'Please type the new Customer Name:',
          sender: 'ai',
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

  // Called when items are updated from the form
  function onItemsUpdated(items: InvoiceItem[]) {
    extractedInfo.value.items = items
  }

  return {
    currentStep,
    showItemsForm,
    startConversation,
    processMessage,
    handleAction,
    onLogoUploaded,
    onItemsUpdated
  }
}
