/**
 * Tag Chat Composable
 * Handles the conversational flow for creating tags
 */

import { ref, type Ref } from 'vue'
import type { ChatMessage, ExtractedTagInfo } from '../types'

export type ConversationStep = 
  | 'initial'
  | 'asking_input_method'
  | 'waiting_bulk_input'
  | 'reviewing_bulk_input'
  | 'editing_field'
  | 'asking_logo'
  | 'waiting_logo_upload'
  | 'waiting_logo_upload_bulk'  // New: waiting for logo upload after bulk input
  | 'asking_logo_title'
  | 'asking_logo_title_bulk'    // New: asking logo title after bulk input logo upload
  | 'waiting_logo_title'
  | 'waiting_logo_title_bulk'   // New: waiting for logo title after bulk input
  | 'asking_tag_title'
  | 'asking_theme'
  | 'asking_event_type'
  | 'asking_event_details'
  | 'ready_to_generate'         // New: all info collected, ready to generate
  | 'complete'

export interface UseTagChatOptions {
  extractedInfo: Ref<ExtractedTagInfo>
  chatMessages: Ref<ChatMessage[]>
  isAnalyzing: Ref<boolean>
  hasImage?: Ref<boolean>
  onGenerate: () => void
  onRegenerate?: () => void
  onScrollToBottom: () => void
  onUploadImage?: () => void
  onOpenEditModal?: () => void
  onResetSession?: () => void
}

export function useTagChat(options: UseTagChatOptions) {
  const { extractedInfo, chatMessages, isAnalyzing, hasImage, onGenerate, onRegenerate, onScrollToBottom, onUploadImage } = options
  
  const currentStep = ref<ConversationStep>('initial')

  function addMessage(message: ChatMessage) {
    chatMessages.value.push(message)
    onScrollToBottom()
  }

  async function startConversation() {
    currentStep.value = 'asking_input_method'
    await delay(500)
    addMessage({
      id: Date.now(),
      text: 'Welcome! Let\'s create your event tag. 🏷️\n\nYou can either:\n• Paste all your event information at once\n• Or type "hello" to start step-by-step',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }

  async function processMessage(message: string): Promise<boolean> {
    const lowerMsg = message.trim().toLowerCase()
    const lines = message.split('\n').filter(l => l.trim().length > 0)

    if (currentStep.value === 'initial' && (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('start'))) {
      await startConversation()
      return true
    }

    switch (currentStep.value) {
      case 'initial':
        await startConversation()
        break

      case 'asking_input_method':
        // Auto-detect input type based on content
        // If multi-line with keywords, treat as bulk input
        const hasBulkIndicators = lines.length > 2 || 
          /\b(OFFICIAL|CONFERENCE|SEMINAR|WORKSHOP|MEETING)\b/i.test(message) ||
          /(date|time|venue):/i.test(message)
        
        if (hasBulkIndicators) {
          // Automatically parse as bulk input
          currentStep.value = 'waiting_bulk_input'
          await parseBulkInput(message)
        } else if (lowerMsg.includes('paste') || lowerMsg.includes('bulk') || lowerMsg.includes('all')) {
          // User explicitly requested bulk input
          currentStep.value = 'waiting_bulk_input'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Great! Please paste all your information below.\n\n**Recommended Format:**\nLogo Title (optional - first line)\nOrganization Name (second line)\nTheme/Description (third line)\nOFFICIAL (or CONFERENCE, SEMINAR, etc.)\ndate: Sunday 15th December 2026\ntime: 10:00 AM\nvenue: Your venue name and address\n\n**Tips:**\n• Logo title is optional (for small text above org name)\n• Put organization name after logo title\n• Theme on next line\n• Use labels like "date:", "time:", "venue:"\n• Event type in CAPS (OFFICIAL, CONFERENCE, etc.)\n\nI\'ll automatically detect and organize everything!',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        } else {
          currentStep.value = 'asking_logo'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Perfect! Let\'s go step-by-step. 👍\n\nFirst, do you have a logo you\'d like to upload?',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [
              { type: 'yes_logo', label: 'Yes, I have a logo', variant: 'primary' },
              { type: 'no_logo', label: 'No, skip logo', variant: 'secondary' }
            ]
          })
        }
        break

      case 'waiting_bulk_input':
        await parseBulkInput(message)
        break

      case 'reviewing_bulk_input': {
        // Check if user pasted completely new tag info instead of confirming
        const reviewLines = message.split('\n').filter(l => l.trim().length > 0)
        const hasNewBulk = reviewLines.length > 2 || 
          /\b(OFFICIAL|CONFERENCE|SEMINAR|WORKSHOP|MEETING)\b/i.test(message) ||
          /(date|time|venue):/i.test(message)
        
        if (hasNewBulk) {
          // New tag info — reset and parse fresh
          extractedInfo.value = {}
          options.onResetSession?.()
          currentStep.value = 'waiting_bulk_input'
          await delay(300)
          addMessage({
            id: Date.now(),
            text: '🆕 New tag information detected! Processing...',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          await parseBulkInput(message)
        } else if (lowerMsg.includes('generate') || lowerMsg.includes('looks good') || lowerMsg.includes('correct')) {
          currentStep.value = 'complete'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Perfect! Generating your event tag now... 🎉',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          await delay(800)
          onGenerate()
        }
        break
      }

      case 'editing_field':
        // Get which field we're editing from the global state
        const fieldBeingEdited = (window as any).__editingField
        if (fieldBeingEdited) {
          // Update the field value
          const fieldKey = fieldBeingEdited as keyof ExtractedTagInfo
          ;(extractedInfo.value as any)[fieldKey] = message.trim()
          
          // Clear the editing field
          delete (window as any).__editingField
          
          // Go back to reviewing bulk input state
          currentStep.value = 'reviewing_bulk_input'
          
          // Show updated review
          await delay(500)
          let reviewText = `✅ **Updated ${fieldBeingEdited}!**\n\nHere's your updated information:\n\n`
          
          if (extractedInfo.value.logoTitle) {
            reviewText += `🏷️ Logo Title: ${extractedInfo.value.logoTitle}\n`
          }
          
          reviewText += `📝 Organization: ${extractedInfo.value.tagTitle}\n` +
            `🎯 Theme: ${extractedInfo.value.theme}\n` +
            `🏷️ Event Type: ${extractedInfo.value.eventType}\n` +
            `📅 Date: ${extractedInfo.value.date || '(Not provided)'}\n` +
            `⏰ Time: ${extractedInfo.value.time || '(Not provided)'}\n` +
            `📍 Venue: ${extractedInfo.value.venue || '(Not provided)'}\n\n` +
            `Please review your information and make any changes if needed!`

          addMessage({
            id: Date.now(),
            text: reviewText,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [
              { type: 'review_edit', label: '📝 Review & Edit', variant: 'primary' }
            ]
          })
        }
        break

      case 'asking_logo':
        if (lowerMsg.includes('yes') || lowerMsg.includes('have') || lowerMsg.includes('upload')) {
          extractedInfo.value.hasLogo = true
          currentStep.value = 'waiting_logo_upload'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Great! Please upload your logo now.',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [{ type: 'upload', label: 'Upload Logo', variant: 'primary' }]
          })
        } else {
          extractedInfo.value.hasLogo = false
          currentStep.value = 'asking_tag_title'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'No problem! What\'s the main title for your tag?',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        }
        break

      case 'waiting_logo_upload':
        if (hasImage?.value || lowerMsg.includes('uploaded')) {
          currentStep.value = 'asking_logo_title'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Perfect! Logo uploaded. 📸\n\nWould you like to add a title under the logo?',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [
              { type: 'yes_title', label: 'Yes, add title', variant: 'primary' },
              { type: 'no_title', label: 'No, skip title', variant: 'secondary' }
            ]
          })
        } else {
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Please click the "Upload Logo" button to upload your logo.',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [{ type: 'upload', label: 'Upload Logo', variant: 'primary' }]
          })
        }
        break

      case 'asking_logo_title':
        if (lowerMsg.includes('yes') || lowerMsg.includes('add')) {
          currentStep.value = 'waiting_logo_title'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Please type the title for your logo:',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        } else {
          currentStep.value = 'asking_tag_title'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Okay! Now, what\'s the Organization Name? (Type "skip" to skip this)',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        }
        break

      case 'waiting_logo_title':
        extractedInfo.value.logoTitle = message.trim()
        currentStep.value = 'asking_tag_title'
        await delay(500)
        addMessage({
          id: Date.now(),
          text: `Got it! Logo title: "${message}"\n\nNow, what's the Organization Name? (Type "skip" to skip this)`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break

      // New: Handle logo upload after bulk input
      case 'waiting_logo_upload_bulk':
        if (hasImage?.value || lowerMsg.includes('uploaded')) {
          // Check if logo title already exists from bulk input
          if (extractedInfo.value.logoTitle) {
            // Logo title already provided, skip asking and go to generate
            currentStep.value = 'ready_to_generate'
            await delay(500)
            addMessage({
              id: Date.now(),
              text: `Perfect! Logo uploaded successfully. 📸\n\nUsing logo title: "${extractedInfo.value.logoTitle}"\n\nAll your information is ready. Click the button below to generate your tag! 🎉`,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [{ type: 'generate_now', label: 'Generate Tag ✨', variant: 'primary' }]
            })
          } else {
            // No logo title provided, ask for it
            currentStep.value = 'asking_logo_title_bulk'
            await delay(500)
            addMessage({
              id: Date.now(),
              text: 'Perfect! Logo uploaded successfully. 📸\n\nWould you like to add a logo title? (Type your title directly, or say "no" to skip)',
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [
                { type: 'yes_title_bulk', label: 'Yes, add title', variant: 'primary' },
                { type: 'no_title_bulk', label: 'No, skip title', variant: 'secondary' }
              ]
            })
          }
        } else {
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Please upload your logo using the "📎 Upload" button or click the button below.',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [{ type: 'upload', label: '📸 Upload Logo', variant: 'primary' }]
          })
        }
        break

      // New: Handle asking for logo title after bulk input logo upload
      case 'asking_logo_title_bulk':
        if (lowerMsg === 'no' || lowerMsg === 'skip' || lowerMsg.includes('no title') || lowerMsg.includes('skip title')) {
          // User wants to skip logo title
          currentStep.value = 'ready_to_generate'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'No problem! All your information is ready. Click the button below to generate your tag! 🎉',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [{ type: 'generate_now', label: 'Generate Tag ✨', variant: 'primary' }]
          })
        } else if (lowerMsg === 'yes' || lowerMsg.includes('add title') || lowerMsg.includes('yes')) {
          // User wants to add title, wait for them to type it
          currentStep.value = 'waiting_logo_title_bulk'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Please type the logo title:',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        } else {
          // User typed the title directly - recognize it as logo title
          extractedInfo.value.logoTitle = message.trim()
          currentStep.value = 'ready_to_generate'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: `Got it! Logo title: "${message.trim()}"\n\nAll your information is ready. Click the button below to generate your tag! 🎉`,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [{ type: 'generate_now', label: 'Generate Tag ✨', variant: 'primary' }]
          })
        }
        break

      // New: Waiting for logo title input after bulk input
      case 'waiting_logo_title_bulk':
        extractedInfo.value.logoTitle = message.trim()
        currentStep.value = 'ready_to_generate'
        await delay(500)
        addMessage({
          id: Date.now(),
          text: `Got it! Logo title: "${message.trim()}"\n\nAll your information is ready. Click the button below to generate your tag! 🎉`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [{ type: 'generate_now', label: 'Generate Tag ✨', variant: 'primary' }]
        })
        break

      // New: Ready to generate state
      case 'ready_to_generate':
        if (lowerMsg.includes('generate') || lowerMsg.includes('create') || lowerMsg.includes('make')) {
          currentStep.value = 'complete'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Perfect! Generating your event tag now... 🎉',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          await delay(800)
          onGenerate()
        } else {
          // Any other message, remind them they can generate
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Your tag is ready to be generated! Click the button below to create it.',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [{ type: 'generate_now', label: 'Generate Tag ✨', variant: 'primary' }]
          })
        }
        break

      case 'asking_tag_title':
        if (lowerMsg === 'skip') {
          extractedInfo.value.tagTitle = ''
        } else {
          extractedInfo.value.tagTitle = message.trim()
        }
        currentStep.value = 'asking_theme'
        await delay(500)
        addMessage({
          id: Date.now(),
          text: lowerMsg === 'skip' 
            ? `Skipped Organization Name.\n\nWhat's the THEME or description for your event?`
            : `Excellent! Organization Name: "${message}"\n\nWhat's the THEME or description for your event?`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break

      case 'asking_theme':
        extractedInfo.value.theme = message.trim()
        currentStep.value = 'asking_event_type'
        await delay(500)
        addMessage({
          id: Date.now(),
          text: `Great theme! "${message}"\n\nWhat's the EVENT TYPE? (e.g., OFFICIAL, CONFERENCE, etc.)`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        break

      case 'asking_event_type':
        extractedInfo.value.eventType = message.trim().toUpperCase()
        currentStep.value = 'asking_event_details'
        await delay(500)
        addMessage({
          id: Date.now(),
          text: `Perfect! Event Type: "${message.toUpperCase()}"\n\nNow, would you like to add event details? You can provide:\n• Date (e.g., "January 15, 2026")\n• Time (e.g., "9:00 AM")\n• Venue (e.g., "Conference Hall A")\n\nType them in any format, or type "skip" to generate the tag now.`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'skip_details', label: 'Skip & Generate', variant: 'secondary' }
          ]
        })
        break

      case 'asking_event_details':
        if (lowerMsg === 'skip' || lowerMsg === 'done' || lowerMsg === 'generate') {
          currentStep.value = 'complete'
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'All details captured! 🎉 Generating your event tag...',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          await delay(800)
          onGenerate()
        } else {
          // Parse the message for date, time, venue
          const parsed = parseEventDetails(message)
          let confirmationParts: string[] = []
          
          if (parsed.date) {
            extractedInfo.value.date = parsed.date
            confirmationParts.push(`Date: ${parsed.date}`)
          }
          if (parsed.time) {
            extractedInfo.value.time = parsed.time
            confirmationParts.push(`Time: ${parsed.time}`)
          }
          if (parsed.venue) {
            extractedInfo.value.venue = parsed.venue
            confirmationParts.push(`Venue: ${parsed.venue}`)
          }
          
          if (confirmationParts.length > 0) {
            await delay(500)
            addMessage({
              id: Date.now(),
              text: `Got it! ✅\n${confirmationParts.join('\n')}\n\nWould you like to add more details, or generate the tag now?`,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [
                { type: 'generate_now', label: 'Generate Tag', variant: 'primary' },
                { type: 'add_more', label: 'Add More Details', variant: 'secondary' }
              ]
            })
          } else {
            await delay(500)
            addMessage({
              id: Date.now(),
              text: 'I couldn\'t detect specific details. Please try:\n• "Date: January 15, 2026"\n• "Time: 9:00 AM"\n• "Venue: Conference Hall"\n\nOr type "skip" to generate the tag.',
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
          }
        }
        break

      case 'complete': {
        // Check if user pasted new tag info — auto-detect bulk input
        const lines = message.split('\n').filter(l => l.trim().length > 0)
        const hasBulkIndicators = lines.length > 2 || 
          /\b(OFFICIAL|CONFERENCE|SEMINAR|WORKSHOP|MEETING)\b/i.test(message) ||
          /(date|time|venue):/i.test(message)
        
        if (hasBulkIndicators || lines.length >= 2) {
          // New tag info detected — reset and parse
          extractedInfo.value = {}
          options.onResetSession?.()
          currentStep.value = 'waiting_bulk_input'
          await delay(300)
          addMessage({
            id: Date.now(),
            text: '🆕 New tag information detected! Processing...',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          await parseBulkInput(message)
        } else {
          await delay(500)
          addMessage({
            id: Date.now(),
            text: 'Your tags are ready! You can:\n• Paste new event information to create a different tag\n• Download any tag using the buttons above\n• Click "Start Over" to reset everything',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [
              { type: 'restart', label: 'Start Over', variant: 'secondary' }
            ]
          })
        }
        break
      }
    }

    return true
  }

  async function handleAction(action: string) {
    if (action === 'bulk_input') {
      await processMessage('paste')
    } else if (action === 'step_by_step') {
      // Reset to step-by-step flow directly
      currentStep.value = 'asking_logo'
      await delay(500)
      addMessage({
        id: Date.now(),
        text: 'No problem! Let\'s go step-by-step instead. 👍\n\nFirst, do you have a logo you\'d like to upload?',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { type: 'yes_logo', label: 'Yes, I have a logo', variant: 'primary' },
          { type: 'no_logo', label: 'No, skip logo', variant: 'secondary' }
        ]
      })
      return
    } else if (action === 'review_edit') {
      // Open the edit modal
      options.onOpenEditModal?.()
    } else if (action === 'edit_logo_title') {
      currentStep.value = 'editing_field'
      addMessage({
        id: Date.now(),
        text: 'Please type the new Logo Title:',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      ;(window as any).__editingField = 'logoTitle'
    } else if (action === 'edit_organization') {
      currentStep.value = 'editing_field'
      addMessage({
        id: Date.now(),
        text: 'Please type the new Organization Name:',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      // Store which field we're editing
      ;(window as any).__editingField = 'tagTitle'
    } else if (action === 'edit_theme') {
      currentStep.value = 'editing_field'
      addMessage({
        id: Date.now(),
        text: 'Please type the new Theme:',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      ;(window as any).__editingField = 'theme'
    } else if (action === 'edit_event_type') {
      currentStep.value = 'editing_field'
      addMessage({
        id: Date.now(),
        text: 'Please type the new Event Type (e.g., OFFICIAL, CONFERENCE):',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      ;(window as any).__editingField = 'eventType'
    } else if (action === 'edit_date') {
      currentStep.value = 'editing_field'
      addMessage({
        id: Date.now(),
        text: 'Please type the new Date:',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      ;(window as any).__editingField = 'date'
    } else if (action === 'edit_time') {
      currentStep.value = 'editing_field'
      addMessage({
        id: Date.now(),
        text: 'Please type the new Time:',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      ;(window as any).__editingField = 'time'
    } else if (action === 'edit_venue') {
      currentStep.value = 'editing_field'
      addMessage({
        id: Date.now(),
        text: 'Please type the new Venue:',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      ;(window as any).__editingField = 'venue'
    } else if (action === 'yes_logo') {
      await processMessage('yes')
    } else if (action === 'no_logo') {
      await processMessage('no')
    } else if (action === 'upload') {
      // Trigger upload and if in bulk review mode, switch to waiting for logo upload
      if (currentStep.value === 'reviewing_bulk_input') {
        currentStep.value = 'waiting_logo_upload_bulk'
      }
      onUploadImage?.()
    } else if (action === 'yes_title') {
      await processMessage('yes')
    } else if (action === 'no_title') {
      await processMessage('no')
    } else if (action === 'yes_title_bulk') {
      // User clicked yes to add logo title after bulk upload
      currentStep.value = 'waiting_logo_title_bulk'
      addMessage({
        id: Date.now(),
        text: 'Please type the logo title:',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
    } else if (action === 'no_title_bulk') {
      // User skipped logo title after bulk upload
      currentStep.value = 'ready_to_generate'
      addMessage({
        id: Date.now(),
        text: 'No problem! All your information is ready. Click the button below to generate your tag! 🎉',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [{ type: 'generate_now', label: 'Generate Tag ✨', variant: 'primary' }]
      })
    } else if (action === 'skip_details' || action === 'generate_now') {
      if (currentStep.value === 'reviewing_bulk_input' || currentStep.value === 'ready_to_generate') {
        // Generate directly from bulk review or ready state
        currentStep.value = 'complete'
        await delay(500)
        addMessage({
          id: Date.now(),
          text: 'Perfect! Generating your event tag now... 🎉',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        await delay(800)
        onGenerate()
      } else {
        await processMessage('skip')
      }
    } else if (action === 'add_more') {
      addMessage({
        id: Date.now(),
        text: 'Please type the additional details (Date, Time, or Venue):',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
    } else if (action === 'restart') {
      currentStep.value = 'initial'
      chatMessages.value = []
      extractedInfo.value = {}
      options.onResetSession?.()
      await startConversation()
    } else if (action === 'regenerate') {
      // Regenerate with a different template using the same data
      await delay(500)
      addMessage({
        id: Date.now(),
        text: '🔄 Regenerating with a different template style...',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      await delay(800)
      onRegenerate?.()
    } else if (action === 'open_window') {
      // Handle preview window opening
      console.log('Open preview window')
    }
  }

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Parse bulk input and extract all fields
   */
  async function parseBulkInput(message: string) {
    isAnalyzing.value = true
    await delay(1000)

    const lines = message.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    const fullText = message.toLowerCase()

    // DEBUG: Log what we received
    console.log('=== PARSING INPUT ===')
    console.log('Total lines:', lines.length)
    console.log('Lines:', lines)

    // Find where event type appears (OFFICIAL, CONFERENCE, etc.)
    let eventTypeLineIndex = -1
    for (let i = 0; i < lines.length; i++) {
      if (/^(OFFICIAL|CONFERENCE|SEMINAR|WORKSHOP|MEETING|CEREMONY|CELEBRATION)$/i.test(lines[i])) {
        eventTypeLineIndex = i
        console.log('Found event type at index:', i, '=', lines[i])
        break
      }
    }

    // Extract fields based on position relative to event type
    let startIndex = 0
    
    // Helper: classify remaining lines into subtheme and baseText
    function classifyRemainingLines(remaining: string[]) {
      if (remaining.length === 0) return
      
      // Lines with phone numbers or contact-related keywords → baseText
      // Other descriptive/sentence lines → subtheme
      const baseTextLines: string[] = []
      const subthemeLines: string[] = []
      
      for (const line of remaining) {
        const hasPhone = /\d{5,}/.test(line.replace(/[\s.\-()]/g, ''))
        const hasContactKeyword = /\b(call|contact|phone|found|doubt|dial|reach|whatsapp|sms|text)\b/i.test(line)
        if (hasPhone || hasContactKeyword) {
          baseTextLines.push(line)
        } else {
          subthemeLines.push(line)
        }
      }
      
      if (subthemeLines.length > 0) {
        extractedInfo.value.subtheme = subthemeLines.join('\n')
        console.log('Set subtheme:', extractedInfo.value.subtheme)
      }
      if (baseTextLines.length > 0) {
        extractedInfo.value.baseText = baseTextLines.join('\n')
        console.log('Set baseText:', extractedInfo.value.baseText)
      }
      // If all lines went to one bucket and none to the other,
      // and there are 2+ lines, split: first to subtheme, rest to baseText
      if (subthemeLines.length > 0 && baseTextLines.length === 0 && subthemeLines.length >= 2) {
        extractedInfo.value.subtheme = subthemeLines[0]
        extractedInfo.value.baseText = subthemeLines.slice(1).join('\n')
        console.log('Re-split — subtheme:', extractedInfo.value.subtheme, 'baseText:', extractedInfo.value.baseText)
      }
    }

    // If we found event type, everything before it should be logo/org/theme
    if (eventTypeLineIndex > 0) {
      const beforeEventType = lines.slice(0, eventTypeLineIndex)
      const afterEventType = lines.slice(eventTypeLineIndex + 1)
      console.log('Lines before event type:', beforeEventType)
      console.log('Lines after event type:', afterEventType)
      
      // Filter out lines with date/time/venue labels
      const contentLines = beforeEventType.filter(line => 
        !/(date|time|venue|location):/i.test(line) && line.length > 0
      )
      console.log('Content lines after filtering:', contentLines)
      console.log('Content lines count:', contentLines.length)
      
      if (contentLines.length === 1) {
        // Only one line - it's the organization name
        extractedInfo.value.tagTitle = contentLines[0]
        console.log('Set tagTitle (1 line):', contentLines[0])
      } else if (contentLines.length === 2) {
        // Two lines - org name and theme
        extractedInfo.value.tagTitle = contentLines[0]
        extractedInfo.value.theme = contentLines[1]
        console.log('Set tagTitle (2 lines):', contentLines[0])
        console.log('Set theme (2 lines):', contentLines[1])
      } else if (contentLines.length >= 3) {
        // Three or more - first is logo title, second is org, third is theme
        extractedInfo.value.logoTitle = contentLines[0]
        extractedInfo.value.tagTitle = contentLines[1]
        extractedInfo.value.theme = contentLines[2]
        console.log('Set logoTitle (3+ lines):', contentLines[0])
        console.log('Set tagTitle (3+ lines):', contentLines[1])
        console.log('Set theme (3+ lines):', contentLines[2])
        // Remaining lines before event type → subtheme/baseText
        if (contentLines.length > 3) {
          classifyRemainingLines(contentLines.slice(3))
        }
      }
      
      // Lines after event type that are NOT date/time/venue → subtheme/baseText too
      const afterContentLines = afterEventType.filter(line =>
        !/(date|time|venue|location):/i.test(line) &&
        !/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(line) &&
        !/\d{1,2}[:\.]\ ?\d{2}\s*(am|pm)/i.test(line) &&
        !/\b(hall|room|center|centre|auditorium)\b/i.test(line) &&
        line.length > 0
      )
      if (afterContentLines.length > 0 && !extractedInfo.value.subtheme && !extractedInfo.value.baseText) {
        classifyRemainingLines(afterContentLines)
      }
    } else {
      console.log('No event type found, using fallback parsing')
      // No event type found — parse lines by position
      const contentLines = lines.filter(line => 
        !/(date|time|venue|location):/i.test(line) && 
        !/^(OFFICIAL|CONFERENCE|SEMINAR|WORKSHOP|MEETING|CEREMONY|CELEBRATION)$/i.test(line)
      )
      
      if (contentLines.length === 1) {
        // Single line — treat as organization name
        extractedInfo.value.tagTitle = contentLines[0]
      } else if (contentLines.length === 2) {
        // Two lines — org name + theme
        extractedInfo.value.tagTitle = contentLines[0]
        extractedInfo.value.theme = contentLines[1]
      } else if (contentLines.length >= 3) {
        // 3+ lines — first is org name, second is theme
        extractedInfo.value.tagTitle = contentLines[0]
        extractedInfo.value.theme = contentLines[1]
        // Remaining lines → classify into subtheme and baseText
        classifyRemainingLines(contentLines.slice(2))
        console.log('Fallback: classified extra lines:', contentLines.slice(2))
      }
    }

    console.log('=== FINAL VALUES ===')
    console.log('logoTitle:', extractedInfo.value.logoTitle)
    console.log('tagTitle:', extractedInfo.value.tagTitle)
    console.log('theme:', extractedInfo.value.theme)
    console.log('eventType:', extractedInfo.value.eventType)

    // Extract event type (look for keywords)
    const eventTypeMatch = message.match(/\b(OFFICIAL|CONFERENCE|SEMINAR|WORKSHOP|MEETING|CEREMONY|CELEBRATION)\b/i)
    if (eventTypeMatch) {
      extractedInfo.value.eventType = eventTypeMatch[1].toUpperCase()
    }

    // Parse event details (date, time, venue)
    const details = parseEventDetails(message)
    if (details.date) extractedInfo.value.date = details.date
    if (details.time) extractedInfo.value.time = details.time
    if (details.venue) extractedInfo.value.venue = details.venue

    isAnalyzing.value = false

    // Validate critical fields — only tagTitle is truly required
    // If tagTitle is missing, we can't proceed at all
    if (!extractedInfo.value.tagTitle) {
      currentStep.value = 'waiting_bulk_input'
      await delay(500)
      addMessage({
        id: Date.now(),
        text: `⚠️ **Couldn't detect Organization Name**\n\nPlease paste your information again. The first line should be the Organization/Company name.\n\n**Example:**\nAchievers Spelling Bee\nAsk Me\nThis is to identify the person with this tag\nOFFICIAL`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { type: 'step_by_step', label: 'Use Step-by-Step Instead', variant: 'secondary' }
        ]
      })
      return
    }

    // eventType left empty if not detected — user can add it in Review & Edit

    currentStep.value = 'reviewing_bulk_input'

    // Show review message with edit buttons
    await delay(500)
    let reviewText = `✅ **Information Successfully Extracted!**\n\n`
    
    if (extractedInfo.value.logoTitle) {
      reviewText += `🏷️ Logo Title: ${extractedInfo.value.logoTitle}\n`
    }
    
    reviewText += `📝 Organization: ${extractedInfo.value.tagTitle}\n` +
      `🎯 Theme: ${extractedInfo.value.theme || '(Not provided)'}\n`
    
    if (extractedInfo.value.subtheme) {
      reviewText += `📌 Subtheme: ${extractedInfo.value.subtheme}\n`
    }
    
    if (extractedInfo.value.eventType) {
      reviewText += `🏷️ Event Type: ${extractedInfo.value.eventType}\n`
    }
    
    if (extractedInfo.value.baseText) {
      reviewText += `📄 Base Text: ${extractedInfo.value.baseText}\n`
    }
    
    reviewText += `📅 Date: ${extractedInfo.value.date || '(Not provided)'}\n` +
      `⏰ Time: ${extractedInfo.value.time || '(Not provided)'}\n` +
      `📍 Venue: ${extractedInfo.value.venue || '(Not provided)'}\n\n` +
      `Please review your information and make any changes if needed!`

    addMessage({
      id: Date.now(),
      text: reviewText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'review_edit', label: '📝 Review & Edit', variant: 'primary' }
      ]
    })
  }

  /**
   * Parse event details from user message
   * Looks for labeled fields: date, time, venue
   * Supports formats like:
   * - date: "01 january, 2026" time: "10:00 pm" venue: "..."
   * - date: 01 january, 2026
   * - Date "01 january, 2026"
   * - date 01 january time 10:00am venue Conference Hall
   */
  function parseEventDetails(message: string): { date?: string; time?: string; venue?: string } {
    const result: { date?: string; time?: string; venue?: string } = {}
    
    // Normalize the message - remove outer parentheses if present
    let text = message.trim()
    if (text.startsWith('(') && text.endsWith(')')) {
      text = text.slice(1, -1).trim()
    }
    
    // Define the label patterns (case-insensitive)
    const labels = ['date', 'time', 'venue', 'location', 'place']
    const labelPattern = new RegExp(`\\b(${labels.join('|')})\\s*:?\\s*`, 'gi')
    
    // Find all label positions
    const matches: { label: string; index: number; endIndex: number }[] = []
    let match
    while ((match = labelPattern.exec(text)) !== null) {
      matches.push({
        label: match[1].toLowerCase(),
        index: match.index,
        endIndex: match.index + match[0].length
      })
    }
    
    // If we found labels, extract content between them
    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i]
        const nextMatch = matches[i + 1]
        
        // Get the content from after this label to before the next label (or end of string)
        const startPos = currentMatch.endIndex
        const endPos = nextMatch ? nextMatch.index : text.length
        let content = text.substring(startPos, endPos).trim()
        
        // Remove surrounding quotes if present
        if ((content.startsWith('"') && content.endsWith('"')) || 
            (content.startsWith("'") && content.endsWith("'"))) {
          content = content.slice(1, -1).trim()
        }
        // Also handle quoted content that may have trailing content
        const quotedMatch = content.match(/^["']([^"']+)["']/)
        if (quotedMatch) {
          content = quotedMatch[1].trim()
        }
        
        // Clean up trailing punctuation
        content = content.replace(/[,;]+$/, '').trim()
        
        // Assign to appropriate field
        const label = currentMatch.label
        if (label === 'date' && content) {
          result.date = content
        } else if (label === 'time' && content) {
          result.time = content
        } else if ((label === 'venue' || label === 'location' || label === 'place') && content) {
          result.venue = content
        }
      }
    } else {
      // Fallback: try line-by-line parsing for formats without labels
      const lines = text.split(/[\n]+/).map(l => l.trim())
      
      for (const line of lines) {
        // Check for date patterns (month names or date formats)
        if (/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(line) && /\d{1,2}/.test(line) && !result.date) {
          result.date = line.trim()
        } else if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(line) && !result.date) {
          result.date = line.trim()
        }
        
        // Check for time patterns
        if (/\d{1,2}:\d{2}\s*(am|pm)?/i.test(line) && !result.time) {
          const timeMatch = line.match(/\d{1,2}:\d{2}\s*(am|pm)?/i)
          if (timeMatch) result.time = timeMatch[0].trim()
        } else if (/\d{1,2}\s*(am|pm)/i.test(line) && !result.time) {
          const timeMatch = line.match(/\d{1,2}\s*(am|pm)/i)
          if (timeMatch) result.time = timeMatch[0].trim()
        }
        
        // Check for venue patterns (keywords)
        if (/hall|room|center|centre|auditorium|building|campus|hotel|conference|road|street|avenue/i.test(line) && !result.venue) {
          result.venue = line.trim()
        }
      }
    }
    
    console.log('📋 Parsed event details:', result)
    return result
  }

  return {
    startConversation,
    processMessage,
    handleAction
  }
}
