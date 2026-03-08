<template>
  <div class="fixed inset-0 overflow-y-auto">
   
    <div class="min-h-screen flex flex-col gap-2 items-center bg-slate-100 dark:bg-slate-900 pt-[90px] md:pt-6 pb-4 px-3">
     <!-- Control  Panel Section -->
      <section class="w-full max-w-4xl bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg">
        <div class="flex items-center justify-between flex-wrap gap-2.5">
          <!-- Title -->
          <div class="flex items-center gap-2.5">
             <!-- Back Button -->
          <button
            class="hidden md:flex w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full items-center justify-center transition-colors"
            title="Go Back to Dashboard"
            @click="$router.push({ name: 'Dashboard', query: $route.query })"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
            <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Generate Invoice
              </h1>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Quick invoice with organization details</p>
            </div>
          </div>

          <!-- Mode Toggle (Chat/Form) -->
          <div class="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
            <button
              @click="viewMode = 'chat'"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                viewMode === 'chat' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              AI Chat
            </button>
            <button
              @click="viewMode = 'form'"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                viewMode === 'form' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Form
            </button>
          </div>
          
           <!-- Invoices Dropdown Button -->
            <div class="relative">
              <button
                class="flex items-center gap-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg border border-blue-300 dark:border-blue-600 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                title="Save or view invoices"
                @click="toggleInvoiceMenu"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Invoices</span>
                <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': showInvoiceMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown Menu -->
              <div v-if="showInvoiceMenu" class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                <button
                  @click="handleSaveInvoice"
                  class="w-full text-left px-3 py-2 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors rounded-t-lg flex items-center gap-2"
                >
                  <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Current Invoice
                </button>
                <button
                  @click="handleViewSavedInvoices"
                  class="w-full text-left px-3 py-2 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors rounded-b-lg flex items-center gap-2"
                >
                  <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Saved Invoices
                </button>
              </div>
            </div>

            
          <!-- Navigation Buttons -->
          <div class="flex gap-2">
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              title="Create a new invoice"
              @click="createNewInvoice"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Invoice
            </button>
          </div>

          <!-- Multiple Copies Controls -->
          <div class="flex items-center gap-2.5">
            <!-- Copies Input -->
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded p-0.5">
              <span class="text-[10px] font-medium text-slate-700 dark:text-slate-300 px-1">Copies:</span>
              <input
                v-model.number="totalCopies"
                type="number"
                min="1"
                max="100"
                step="1"
                class="w-12 h-6 text-[10px] text-center bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Number of copies to generate"
                @input="validateCopiesInput"
                @blur="validateCopiesInput"
              />
            </div>
            
            <!-- Page Navigation -->
            <div class="flex items-center gap-1">
              <div class="text-[9px] text-slate-500 dark:text-slate-400 px-1">
                Page {{ currentPage }} of {{ totalCopies }}
              </div>
              <div class="flex items-center gap-0.5">
                <button
                  :disabled="currentPage <= 1"
                  class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Page"
                  @click="goToPreviousPage"
                >
                  <svg class="w-2.5 h-2.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  :disabled="currentPage >= totalCopies"
                  class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Page"
                  @click="goToNextPage"
                >
                  <svg class="w-2.5 h-2.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Settings Panel -->
        <div class="mt-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-700">
          <div class="relative">
            <!-- Swiper Container -->
            <div
              ref="swiperContainer"
              class="swiper overflow-hidden rounded-lg bg-slate-50/50 dark:bg-slate-700/30 p-2"
            >
              <div class="swiper-wrapper">
                <div 
                  v-for="setting in settingsItems" 
                  :key="setting.id"
                  class="swiper-slide"
                >
                  <label class="flex items-center gap-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    <input 
                      type="checkbox" 
                      v-model="setting.model.value" 
                      class="rounded border-gray-300 cursor-pointer accent-emerald-600"
                    />
                    <span>{{ setting.label }}</span>
                    <span 
                      v-if="setting.badge" 
                      class="text-[8px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded"
                    >
                      {{ setting.badge }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Chat Section (AI Chat Mode) -->
      <section v-show="viewMode === 'chat'" class="w-full max-w-4xl">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Chat Header -->
          <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
            <h2 class="text-white font-semibold flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Invoice Assistant
            </h2>
            <p class="text-emerald-100 text-xs mt-0.5">Let me help you create your invoice</p>
          </div>

          <!-- Chat Messages Container -->
          <div ref="chatContainer" class="h-[400px] overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
            <!-- Welcome Message (when no messages) -->
            <div v-if="chatMessages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
              <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Welcome to Invoice Assistant</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-sm">
                I'll help you create a professional invoice quickly. Just click "Start" to begin!
              </p>
              <button
                @click="startChatConversation"
                class="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md"
              >
                Start Creating Invoice
              </button>
            </div>

            <!-- Chat Messages -->
            <template v-for="(message, index) in chatMessages" :key="index">
              <!-- Assistant Message -->
              <div v-if="message.role === 'assistant'" class="flex gap-3">
                <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap" v-html="formatChatMessage(message.content)"></p>
                    <!-- Color Selector Dropdown -->
                    <div v-if="message.colorSelector" class="mt-3">
                      <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Pick accent color (for 2-color option):</label>
                      <select 
                        class="w-full px-3 py-2 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                        @change="handleAccentColorChange($event)"
                      >
                        <option value="#10b981">🟢 Green</option>
                        <option value="#3b82f6">🔵 Blue</option>
                        <option value="#8b5cf6">🟣 Purple</option>
                        <option value="#f59e0b">🟠 Orange</option>
                        <option value="#ef4444">🔴 Red</option>
                        <option value="#06b6d4">🔵 Cyan</option>
                        <option value="#ec4899">🩷 Pink</option>
                      </select>
                    </div>
                    <!-- Action Buttons -->
                    <div v-if="message.actions && message.actions.length > 0" class="flex flex-wrap gap-2 mt-3">
                      <button
                        v-for="action in message.actions"
                        :key="action.id"
                        @click="handleChatAction(action)"
                        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                        :class="action.primary 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'"
                      >
                        {{ action.label }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- User Message -->
              <div v-else class="flex gap-3 justify-end">
                <div class="flex-1 max-w-[80%]">
                  <div class="bg-emerald-600 text-white rounded-lg p-3 ml-auto">
                    <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
                  </div>
                </div>
                <div class="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </template>

            <!-- Typing Indicator -->
            <div v-if="isAnalyzingChat" class="flex gap-3">
              <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="flex gap-1">
                  <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Input Area -->
          <div class="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-slate-800">
            <div class="flex gap-2">
              <textarea
                v-model="chatInputText"
                rows="1"
                placeholder="Type your response... (Shift+Enter for new line)"
                class="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none overflow-hidden"
                @keydown="handleChatKeyDown"
                @input="autoResizeTextarea"
                :disabled="chatMessages.length === 0 || isAnalyzingChat"
              ></textarea>
              <button
                @click="sendChatMessage"
                :disabled="!chatInputText.trim() || isAnalyzingChat"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Organization Details Form (Form Mode) -->
      <section v-show="viewMode === 'form'" class="w-full max-w-4xl">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <!-- Logo Upload Section -->
          <div class="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Organization Logo
            </h3>
            <div class="flex items-center gap-3">
              <!-- Logo Preview / Upload Area -->
              <div 
                @click="$refs.logoInput.click()"
                class="relative w-20 h-20 rounded-lg border-2 border-dashed cursor-pointer transition-all flex items-center justify-center overflow-hidden group"
                :class="logoDataUrl 
                  ? 'border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-700' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500 bg-gray-50 dark:bg-slate-700/50'"
              >
                <img 
                  v-if="logoDataUrl" 
                  :src="logoDataUrl" 
                  alt="Logo" 
                  class="w-full h-full object-contain"
                />
                <div v-else class="text-center">
                  <svg class="w-6 h-6 mx-auto text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span class="text-[9px] text-gray-400 dark:text-gray-500">Add Logo</span>
                </div>
                <!-- Hover overlay on existing logo -->
                <div v-if="logoDataUrl" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  </svg>
                </div>
              </div>
              <!-- Info & Actions -->
              <div class="flex-1">
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  {{ logoDataUrl ? 'Logo uploaded' : 'Upload your organization logo' }}
                </p>
                <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">PNG, JPG up to 5MB</p>
                <div class="flex items-center gap-2 mt-1.5">
                  <button
                    @click.stop="$refs.logoInput.click()"
                    class="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    {{ logoDataUrl ? 'Change' : 'Upload' }}
                  </button>
                  <button
                    v-if="logoDataUrl"
                    @click.stop="removeLogo"
                    class="text-[10px] font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            <!-- Hidden file input -->
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleLogoUpload"
            />
          </div>

          <!-- Image Cropper Modal -->
          <LogoCropper
            :is-open="showImageCropper"
            :image-url="tempImageUrl"
            @crop="handleCroppedImage"
            @close="handleCropperClose"
          />

          <!-- Customer Details Section -->
          <div class="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Details
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <!-- Customer Name -->
              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                  Customer Name
                </label>
                <input
                  v-model="customerName"
                  type="text"
                  placeholder="Enter customer name"
                  class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <!-- Customer Address -->
              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                  Customer Address
                </label>
                <input
                  v-model="customerAddress"
                  type="text"
                  placeholder="Enter customer address"
                  class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <!-- LPO Number -->
              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                  L.P.O No.
                </label>
                <input
                  v-model="lpo"
                  type="text"
                  placeholder="Enter LPO number"
                  class="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <!-- Invoice Items -->
            <div class="md:col-span-2">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Invoice Items
                </label>
                
              </div>

              <!-- Items List -->
              <div ref="itemsContainer" class="space-y-3 max-h-[400px] overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-700">
                <div 
                  v-for="(item, index) in items" 
                  :key="item.id"
                  class="invoice-item bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 relative"
                >
                  <!-- Delete Button -->
                  <button
                    v-if="items.length > 1"
                    @click="removeItem(item.id)"
                    class="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Remove item"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <div class="grid grid-cols-1 md:grid-cols-4 gap-2 pr-8">
                    <!-- Quantity -->
                    <div>
                      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                        Quantity
                      </label>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <!-- Rate -->
                    <div>
                      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                        Rate (₦)
                      </label>
                      <input
                        v-model.number="item.price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <!-- Tax -->
                    <div v-if="taxEnabled">
                      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                        Tax (%)
                      </label>
                      <input
                        v-model.number="item.tax"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0.0"
                        class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <!-- Calculated Amount (Read-only) -->
                    <div>
                      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                        Amount
                      </label>
                      <div class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-slate-600 text-slate-900 dark:text-white font-semibold">
                        {{ toCurrency(getItemAmount(item)) }}
                      </div>
                    </div>

                    <!-- Description -->
                    <div class="md:col-span-4">
                      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                        Description
                      </label>
                      <textarea
                        v-model="item.description"
                        placeholder="Enter item description"
                        @keydown.enter.prevent="addItemAfter(index)"
                        rows="2"
                        class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                        @input="autoResize"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

               <div class=" mt-2">
                <button
                     @click="addItem"
                     :disabled="items.length >= MAX_ITEMS"
                     class="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                     :title="items.length >= MAX_ITEMS ? `Maximum ${MAX_ITEMS} items allowed` : 'Add new item'"
                   >
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                     </svg>
                     Add Item
                </button>
              </div>
            </div>
  
            <!-- Tax Settings -->
            <div v-if="taxEnabled" class="md:col-span-2 flex items-center gap-6 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="taxEnabled" 
                  class="rounded border-gray-300 cursor-pointer accent-emerald-600"
                />
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Tax</span>
              </label>
              
              <div class="flex items-center gap-2 flex-1">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tax Rate (%):
                </label>
                <input
                  v-model.number="taxRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  class="w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <span class="text-sm text-slate-600 dark:text-slate-400">
                  (Tax: {{ toCurrency(taxAmount) }})
                </span>
              </div>
            </div>
          </div>
  
          <!-- Summary -->
          <div class="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                Total Amount:
              </span>
              <span class="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {{ toCurrency(grandTotal) }}
              </span>
            </div>
          </div>
  
         
          <!-- Preview Button -->
          <div class="mt-2">
            <button
              class="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
              @click="handlePreviewClick"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview Invoice</span>
            </button>
          </div>
        </div>
      </section>

    </div>

    <!-- Edit Invoice/Org Modal (Popup) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="showEditModal = false">
          <!-- Overlay -->
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <!-- Modal Container -->
          <div class="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden" style="animation: modalSlideIn 0.3s ease-out">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 flex items-center justify-between">
              <h2 class="text-white font-semibold flex items-center gap-2 text-base">
                📝 {{ editModalContext === 'org' ? 'Edit Organization Details' : 'Review & Edit Invoice' }}
              </h2>
              <button @click="showEditModal = false" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors text-lg">
                ✕
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <!-- Organization Section -->
              <div class="space-y-3">
                <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">🏢 Organization</h3>
                <!-- Logo Upload -->
                <div>
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">Organization Logo</label>
                  <div class="flex items-center gap-3">
                    <div 
                      @click="$refs.modalLogoInput.click()"
                      class="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all overflow-hidden"
                    >
                      <img v-if="editModalData.orgLogo" :src="editModalData.orgLogo" alt="Logo" class="w-full h-full object-contain" />
                      <span v-else class="text-2xl">📷</span>
                    </div>
                    <div class="flex-1">
                      <button @click="$refs.modalLogoInput.click()" class="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                        {{ editModalData.orgLogo ? '🔄 Change Logo' : '📤 Upload Logo' }}
                      </button>
                      <button v-if="editModalData.orgLogo" @click="removeModalLogo" class="ml-3 text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
                        🗑️ Remove
                      </button>
                      <p class="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      ref="modalLogoInput"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleModalLogoUpload"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Organization Name *</label>
                  <input v-model="editModalData.orgName" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter organization name..." />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Subtitle / Tagline</label>
                  <input v-model="editModalData.orgSubtitle" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="e.g., Come to Pick Maxrange..." />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Address *</label>
                  <input v-model="editModalData.orgAddress" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter address..." />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Phone / Tel *</label>
                  <input v-model="editModalData.orgPhone" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter phone number..." />
                </div>
              </div>

              <!-- Customer Section (only in full review) -->
              <div v-if="editModalContext === 'invoice'" class="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">👤 Customer Details</h3>
                <div>
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Customer Name *</label>
                  <input v-model="editModalData.customerName" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter customer name..." />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Customer Address</label>
                  <input v-model="editModalData.customerAddress" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter customer address..." />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Date</label>
                    <input v-model="editModalData.date" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="e.g., 08/02/2026" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">LPO Number</label>
                    <input v-model="editModalData.lpo" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter LPO..." />
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="border-t border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button @click="showEditModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                Cancel
              </button>
              <button v-if="editModalContext === 'org'" @click="saveEditModalOrg" class="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">
                ✅ Save & Continue
              </button>
              <button v-else @click="saveEditModalInvoice" class="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">
                ✨ Save & Generate
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Save Invoice Modal -->
    <div v-if="showSaveModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="cancelSave"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  Save Invoice
                </h3>
                <div class="mt-4">
                  <label for="invoice-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Invoice Name
                  </label>
                  <input
                    id="invoice-name"
                    v-model="invoiceName"
                    type="text"
                    placeholder="Enter invoice name..."
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    @keydown.enter="saveInvoice"
                    @keydown.escape="cancelSave"
                  />
                  <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Give your invoice a memorable name for easy identification.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              :disabled="isSaving"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              @click="saveInvoice"
            >
              <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSaving ? 'Saving...' : 'Save Invoice' }}
            </button>
            <button
              type="button"
              :disabled="isSaving"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-600 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              @click="cancelSave"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import LogoCropper from '@/components/image/LogoCropper.vue';
// import Swiper JS
import Swiper from 'swiper';
// import Swiper styles
import 'swiper/css';


import { useRouter, useRoute } from 'vue-router';
import { safeLocalStorage } from '@/utils/storage.utils';

export default defineComponent({
  name: 'GenerateInvoicePage',
  components: { 
    LogoCropper
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    // Swiper instance reference
    const swiperInstance = ref(null);
    const swiperContainer = ref(null);
    
    // Password verification state
    const showSaveModal = ref(false);
    const invoiceName = ref('');
    const isSaving = ref(false);
    const showInvoiceMenu = ref(false);
    const showSettingsPanel = ref(false);
    
    // Chat Mode State
    const viewMode = ref('chat'); // 'chat' or 'form'
    const chatMessages = ref([]);
    const chatInputText = ref('');
    const isAnalyzingChat = ref(false);
    const chatContainer = ref(null);
    const chatStep = ref('initial'); // initial, asking_input_method, waiting_bulk_input, asking_customer_name, asking_customer_address, asking_date, asking_lpo, asking_want_items, asking_items, ready_to_generate, complete, editing_field
    const showItemsForm = ref(false);
    const editingFieldName = ref(''); // Track which field is being edited
    const showEditModal = ref(false);
    const editModalContext = ref('org'); // 'org' or 'invoice'
    const editModalData = ref({
      orgName: '',
      orgSubtitle: '',
      orgAddress: '',
      orgPhone: '',
      orgLogo: '',
      customerName: '',
      customerAddress: '',
      date: '',
      lpo: ''
    });
    const modalLogoInput = ref(null);

    const openEditModal = (context) => {
      editModalContext.value = context;
      editModalData.value = {
        orgName: chatInvoiceData.value.orgName,
        orgSubtitle: chatInvoiceData.value.orgSubtitle,
        orgAddress: chatInvoiceData.value.orgAddress,
        orgPhone: chatInvoiceData.value.orgPhone,
        orgLogo: logoDataUrl.value || '',
        customerName: chatInvoiceData.value.customerName,
        customerAddress: chatInvoiceData.value.customerAddress,
        date: chatInvoiceData.value.date,
        lpo: chatInvoiceData.value.lpo
      };
      showEditModal.value = true;
    };

    const saveEditModalOrg = () => {
      chatInvoiceData.value.orgName = editModalData.value.orgName;
      chatInvoiceData.value.orgSubtitle = editModalData.value.orgSubtitle;
      chatInvoiceData.value.orgAddress = editModalData.value.orgAddress;
      chatInvoiceData.value.orgPhone = editModalData.value.orgPhone;
      logoDataUrl.value = editModalData.value.orgLogo || '';
      showEditModal.value = false;
      saveFormData();
      addChatMessage('assistant', '✅ Organization details updated!');
      showOrgReview();
    };

    const saveEditModalInvoice = () => {
      chatInvoiceData.value.orgName = editModalData.value.orgName;
      chatInvoiceData.value.orgSubtitle = editModalData.value.orgSubtitle;
      chatInvoiceData.value.orgAddress = editModalData.value.orgAddress;
      chatInvoiceData.value.orgPhone = editModalData.value.orgPhone;
      logoDataUrl.value = editModalData.value.orgLogo || '';
      chatInvoiceData.value.customerName = editModalData.value.customerName;
      chatInvoiceData.value.customerAddress = editModalData.value.customerAddress;
      chatInvoiceData.value.date = editModalData.value.date;
      chatInvoiceData.value.lpo = editModalData.value.lpo;
      showEditModal.value = false;
      saveFormData();
      addChatMessage('assistant', '✅ Invoice details updated! Generating...');
      generateFromChat();
    };
    const chatInvoiceData = ref({
      customerName: '',
      customerAddress: '',
      date: '',
      lpo: '',
      items: [],
      // Organization details
      orgName: '',
      orgSubtitle: '',
      orgAddress: '',
      orgPhone: '',
      // Template preference
      selectedTemplate: 'template1',
      accentColor: '#10b981'
    });
    
    // Quick Fill Form
    const showQuickFillForm = ref(false);
    const customerName = ref('');
    const customerAddress = ref('');
    const date = ref('');
    const lpo = ref('');
    
    // Form fields
    const organizationName = ref('');
    const organizationSubName = ref('');
    const businessNumber = ref('');
    const headOfficeAddress = ref('');
    const headOfficePhone = ref('');
    const branchAddress1 = ref('');
    const branch1Phone = ref('');
    const branchAddress2 = ref('');
    const branch2Phone = ref('');
    const logoDataUrl = ref('');
    const autoReceiptNumber = ref(true);
    const autoDate = ref(true);
    const taxEnabled = ref(false); // Tax column enable/disable toggle (OFF by default)
    const showPageNumbers = ref(true); // Show page/copy numbers toggle (ON by default)
    
    // Dynamic Branches Management
    const additionalBranches = ref([]);
    
    // Invoice Items Management
    const MAX_ITEMS = 20;
    const itemsContainer = ref(null);
    const items = ref([
      {
        id: 1,
        quantity: 0,
        price: 0,
        tax: 0,
        description: ''
      }
    ]);
    
    const taxRate = ref(0);
    const sumOf = ref('');
    const sumOf2 = ref('');
    const sumOfInput1 = ref(null);
    const sumOfInput2 = ref(null);
    
    // Signature Management
    const savedSignatures = ref([]);
    const selectedSignature1 = ref('');
    const selectedSignature2 = ref('');
    const signatureImage1 = ref('');
    const signatureImage2 = ref('');
    
    // Shared signature state - synchronized across main and preview pages
    const SHARED_SIGNATURE_KEY = 'sdp_invoice_shared_signatures';
    
    const loadSharedSignatureState = () => {
      try {
        const sharedData = localStorage.getItem(SHARED_SIGNATURE_KEY);
        if (sharedData) {
          const parsed = JSON.parse(sharedData);
          selectedSignature1.value = parsed.selectedSignature1 || '';
          selectedSignature2.value = parsed.selectedSignature2 || '';
          signatureImage1.value = parsed.signatureImage1 || '';
          signatureImage2.value = parsed.signatureImage2 || '';
          console.log('📋 Loaded shared signature state for invoice:', parsed);
        }
      } catch (error) {
        console.error('❌ Error loading shared signature state:', error);
      }
    };
    
    const saveSharedSignatureState = () => {
      try {
        const sharedData = {
          selectedSignature1: selectedSignature1.value,
          selectedSignature2: selectedSignature2.value,
          signatureImage1: signatureImage1.value,
          signatureImage2: signatureImage2.value,
          timestamp: Date.now()
        };
        localStorage.setItem(SHARED_SIGNATURE_KEY, JSON.stringify(sharedData));
        console.log('💾 Saved shared signature state for invoice:', sharedData);
      } catch (error) {
        console.error('❌ Error saving shared signature state:', error);
      }
    };
    
    // Load signatures from Firebase
    const loadSignatures = async () => {
      try {
        console.log('🔍 SIGNATURE LOADING DEBUG START');
        console.log('='.repeat(40));
        
        // Get authenticated member's branch - check both keys
        let memberData = localStorage.getItem('sdp_authenticated_member');
        
        // If sdp_authenticated_member doesn't exist, check authenticatedMember
        if (!memberData) {
          const altMemberData = localStorage.getItem('authenticatedMember');
          if (altMemberData) {
            console.log('🔄 Copying authenticatedMember to sdp_authenticated_member for consistency');
            localStorage.setItem('sdp_authenticated_member', altMemberData);
            memberData = altMemberData;
          }
        }
        
        console.log('👤 Raw member data:', memberData);
        
        let branchToUse = 'default';
        
        if (memberData) {
          try {
            const member = JSON.parse(memberData);
            branchToUse = member.branch || 'default';
            console.log('🏢 Parsed member:', member);
            console.log('🌿 Branch to use:', branchToUse);
          } catch (parseError) {
            console.warn('❌ Failed to parse member data, using default branch:', parseError);
          }
        } else {
          console.warn('⚠️ No authenticated member data found, using default branch');
        }
        
        // Check localStorage directly
        const signatureStorageKey = `signatures_${branchToUse}`;
        const directSignatures = localStorage.getItem(signatureStorageKey);
        console.log(`🗄️ Direct localStorage check for "${signatureStorageKey}":`, directSignatures);
        
        console.log('📡 Loading signatures via getAllSignatures function...');
        const { getAllSignatures } = await import('@/firebase/database');
        const result = await getAllSignatures(branchToUse);
        console.log('📊 Full getAllSignatures result:', result);
        
        if (result.success) {
          savedSignatures.value = result.signatures || result.data || [];
          console.log('✅ Signatures loaded successfully!');
          console.log('📈 Signature count:', savedSignatures.value.length);
          console.log('📝 Signature details:', savedSignatures.value.map(s => ({ id: s.id, name: s.name })));
          
          if (savedSignatures.value.length === 0) {
            console.log('⚠️ No signatures found - this is why dropdown shows "No signature"');
          }
        } else {
          console.error('❌ Failed to load signatures:', result.error);
          savedSignatures.value = [];
        }
        
        console.log('🔍 SIGNATURE LOADING DEBUG END');
        console.log('='.repeat(40));
      } catch (error) {
        console.error('💥 Critical error loading signatures:', error);
        savedSignatures.value = [];
      }
    };
    
    // UI State
    const showPreview = ref(false);
    
    // Settings panel configuration
    const settingsItems = computed(() => [
      {
        id: 'autoReceipt',
        model: autoReceiptNumber,
        label: 'Auto Receipt #',
        description: 'Generate automatically',
        color: 'emerald',
        icon: '🧾'
      },
      {
        id: 'autoDate',
        model: autoDate,
        label: 'Auto Date',
        description: 'Set current date',
        color: 'blue',
        icon: '📅'
      },
      {
        id: 'taxEnabled',
        model: taxEnabled,
        label: 'Enable Tax',
        description: 'Add tax calculations',
        color: 'purple',
        icon: '💰'
      },
      {
        id: 'showPageNumbers',
        model: showPageNumbers,
        label: 'Show Page #',
        description: 'Display page numbers',
        color: 'indigo',
        icon: '🔢',
        badge: showPageNumbers.value ? displayPageNumber.value : null
      }
    ]);
    
    // Branch Management Methods
    const addNewBranch = () => {
      // If there are existing branch values in the old fields, migrate them first
      if (branchAddress1.value || branch1Phone.value) {
        additionalBranches.value.push({
          address: branchAddress1.value,
          phone: branch1Phone.value
        });
        branchAddress1.value = '';
        branch1Phone.value = '';
      }
      
      if (branchAddress2.value || branch2Phone.value) {
        additionalBranches.value.push({
          address: branchAddress2.value,
          phone: branch2Phone.value
        });
        branchAddress2.value = '';
        branch2Phone.value = '';
      }
      
      // Add new empty branch
      additionalBranches.value.push({
        address: '',
        phone: ''
      });
    };
    
    const removeBranch = (index) => {
      if (additionalBranches.value.length > 0) {
        additionalBranches.value.splice(index, 1);
      }
    };
    
    // Multiple pages/copies functionality
    const totalCopies = ref(1);
    const currentPage = ref(1);
    
    // Image cropper state
    const showImageCropper = ref(false);
    const tempImageUrl = ref('');
    const logoInput = ref(null);

    // Removed parser variables (kept as placeholders to prevent template errors)
    const smartTextInput = ref('');
    const showFormatGuide = ref(false);
    const showManualGuide = ref(false);
    const showParsedPreview = ref(false);
    const validationErrors = ref([]);
    const parsedData = ref({});
    const smartInputPlaceholder = '';
    const manualInputPlaceholder = '';
    const parseSmartText = () => {}; // Empty function
    const handlePaste = () => {}; // Empty function

    // Business Number Quick Fill
    const showBNDropdown = ref(false);
    
    // Predefined business numbers for quick fill
    const businessNumberOptions = ref([
      { id: 1, number: '123456789RT0001', description: 'Sample Corporation BN' },
      { id: 2, number: '987654321RT0001', description: 'Example Business BN' },
      { id: 3, number: '555666777RT0001', description: 'Demo Company BN' },
      { id: 4, number: '111222333RT0001', description: 'Test Enterprise BN' }
    ]);

    // Business number format templates
    const bnTemplates = ref([
      { id: 1, format: 'XXXXXXXXX RT 0001', description: 'Canadian Standard Format' },
      { id: 2, format: 'XX-XXXXXXX', description: 'US EIN Format' },
      { id: 3, format: 'XXXXXXXXX', description: 'Simple 9-digit Format' },
      { id: 4, format: 'XXX-XXX-XXX', description: 'Hyphenated Format' }
    ]);




    
    // Page navigation methods
    const goToPreviousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value = currentPage.value - 1;
        saveFormData(); // Save after navigation
      }
    };
    
    const goToNextPage = () => {
      if (currentPage.value < totalCopies.value) {
        currentPage.value = currentPage.value + 1;
        saveFormData(); // Save after navigation
      }
    };
    
    const goToPage = (pageNumber) => {
      const page = Math.max(1, Math.min(totalCopies.value, pageNumber));
      currentPage.value = page;
    };
    
    // Input validation methods
    const validateCopiesInput = () => {
      const value = parseInt(totalCopies.value);
      if (isNaN(value) || value < 1) {
        totalCopies.value = 1;
      } else if (value > 100) {
        totalCopies.value = 100;
      } else {
        totalCopies.value = value;
      }
      saveFormData(); // Save after validation
    };
    
    // Computed for displaying page numbers
    const displayPageNumber = computed(() => {
      if (!showPageNumbers.value) return '';
      return `${String(currentPage.value).padStart(3, '0')}`;
    });

    // Component lifecycle moved below to consolidate with other lifecycle hook
    
    // Watch for changes in total copies to adjust current page
    watch(totalCopies, (newTotal) => {
      // Ensure totalCopies is within valid range
      if (newTotal < 1) {
        totalCopies.value = 1;
        return;
      }
      if (newTotal > 100) {
        totalCopies.value = 100;
        return;
      }
      
      // Adjust current page if it exceeds new total
      if (currentPage.value > newTotal) {
        currentPage.value = Math.max(1, newTotal);
      }
    });
    
    // Watch for changes in current page to ensure it's valid
    watch(currentPage, (newPage) => {
      if (newPage < 1) {
        currentPage.value = 1;
      } else if (newPage > totalCopies.value) {
        currentPage.value = totalCopies.value;
      }
      saveFormData(); // Save when current page changes
    });
    
    // Watch for changes in showPageNumbers to auto-save (debounced)
    watch(showPageNumbers, () => {
      debouncedSaveFormData();
    });

    // Watch all form fields for changes and auto-save (debounced to reduce writes)
    watch([
      organizationName, 
      organizationSubName, 
      businessNumber, 
      headOfficeAddress, 
      headOfficePhone, 
      branchAddress1, 
      branch1Phone, 
      branchAddress2, 
      branch2Phone, 
      logoDataUrl, 
      autoReceiptNumber, // Add this to watch for changes
      autoDate, // Add this to watch for changes
      taxEnabled,
      smartTextInput,
      additionalBranches,
      items,
      taxRate,
      sumOf,
      sumOf2,
      selectedSignature1,
      selectedSignature2,
      // Quick Fill Form fields
      customerName,
      customerAddress,
      date,
      lpo
    ], () => {
      debouncedSaveFormData();
    }, { deep: true });

    // Logo upload handler
    const handleLogoUpload = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Please upload an image file (PNG, JPG, etc.)');
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          tempImageUrl.value = e.target?.result;
          showImageCropper.value = true;
        };
        reader.readAsDataURL(file);
      }
      
      if (event.target) {
        event.target.value = '';
      }
    };
    
    const handleCroppedImage = (croppedDataUrl) => {
      logoDataUrl.value = croppedDataUrl;
      showImageCropper.value = false;
      tempImageUrl.value = '';
      
      // Save to localStorage
      saveFormData();
    };
    
    const handleCropperClose = () => {
      showImageCropper.value = false;
      tempImageUrl.value = '';
    };

    const removeLogo = () => {
      logoDataUrl.value = '';
      saveFormData();
    };

    // Modal logo upload handler
    const handleModalLogoUpload = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Please upload an image file (PNG, JPG, etc.)');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB');
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          editModalData.value.orgLogo = e.target?.result || '';
        };
        reader.readAsDataURL(file);
      }
      if (event.target) {
        event.target.value = '';
      }
    };

    const removeModalLogo = () => {
      editModalData.value.orgLogo = '';
    };

    // Invoice Items Methods
    const addItem = async () => {
      if (items.value.length >= MAX_ITEMS) return;
      
      const newItem = {
        id: Date.now(),
        quantity: 0,
        price: 0,
        tax: 0,
        description: ''
      };
      items.value.push(newItem);
      
      // Scroll to the newly added item
      await nextTick();
      if (itemsContainer.value) {
        itemsContainer.value.scrollTop = itemsContainer.value.scrollHeight;
      }
    };
    
    const removeItem = (itemId) => {
      if (items.value.length <= 1) return; // Keep at least one item
      items.value = items.value.filter(item => item.id !== itemId);
    };
    
    const addItemAfter = async (index) => {
      if (items.value.length >= MAX_ITEMS) return;
      
      const newItem = {
        id: Date.now(),
        quantity: 0,
        price: 0,
        tax: 0,
        description: ''
      };
      items.value.splice(index + 1, 0, newItem);
      
      // Scroll to show the newly added item
      await nextTick();
      if (itemsContainer.value) {
        const itemElements = itemsContainer.value.querySelectorAll('.invoice-item');
        const newItemElement = itemElements[index + 1];
        if (newItemElement) {
          newItemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };
    
    const getItemAmount = (item) => {
      const subtotal = (item.quantity || 0) * (item.price || 0);
      const taxAmount = subtotal * ((item.tax || 0) / 100);
      return subtotal + taxAmount;
    };
    
    const autoResize = (event) => {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    };
    
    // Computed properties for totals
    const subtotal = computed(() => {
      return items.value.reduce((sum, item) => {
        return sum + ((item.quantity || 0) * (item.price || 0));
      }, 0);
    });
    
    const taxAmount = computed(() => {
      if (!taxEnabled.value) return 0;
      return subtotal.value * ((taxRate.value || 0) / 100);
    });
    
    const grandTotal = computed(() => {
      return subtotal.value + taxAmount.value;
    });

    // Display total for summary (same as grand total for invoices)
    const displayTotal = computed(() => {
      return grandTotal.value;
    });
    
    // Currency formatter
    const toCurrency = (amount) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0);
    };
    
    // Amount in words functionality
    const updateAmountInWords = () => {
      const total = grandTotal.value;
      const words = numberToWords(total);
      
      // Split words into two lines if too long
      const MAX_CHARS_PER_LINE = 60;
      if (words.length > MAX_CHARS_PER_LINE) {
        const words_array = words.split(' ');
        let line1 = '';
        let line2 = '';
        
        for (const word of words_array) {
          if ((line1 + word).length <= MAX_CHARS_PER_LINE) {
            line1 += (line1 ? ' ' : '') + word;
          } else {
            line2 += (line2 ? ' ' : '') + word;
          }
        }
        
        sumOf.value = line1;
        sumOf2.value = line2;
      } else {
        sumOf.value = words;
        sumOf2.value = '';
      }
    };
    
    const numberToWords = (amount) => {
      const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
      
      const convertHundreds = (num) => {
        let result = '';
        
        if (num >= 100) {
          result += ones[Math.floor(num / 100)] + ' hundred ';
          num %= 100;
        }
        
        if (num >= 20) {
          result += tens[Math.floor(num / 10)];
          if (num % 10 !== 0) {
            result += ' ' + ones[num % 10];
          }
        } else if (num >= 10) {
          result += teens[num - 10];
        } else if (num > 0) {
          result += ones[num];
        }
        
        return result.trim();
      };
      
      if (amount === 0) return 'Zero naira only';
      
      const naira = Math.floor(amount);
      const kobo = Math.round((amount - naira) * 100);
      
      let result = '';
      let remainingNaira = naira;
      
      if (remainingNaira >= 1000000) {
        result += convertHundreds(Math.floor(remainingNaira / 1000000)) + ' million ';
        remainingNaira %= 1000000;
      }
      
      if (remainingNaira >= 1000) {
        result += convertHundreds(Math.floor(remainingNaira / 1000)) + ' thousand ';
        remainingNaira %= 1000;
      }
      
      if (remainingNaira > 0) {
        result += convertHundreds(remainingNaira) + ' ';
      }
      
      result += 'naira';
      
      if (kobo > 0) {
        result += ' and ' + convertHundreds(kobo) + ' kobo';
      }
      
      return (result + ' only').replace(/\s+/g, ' ').trim();
    };
    
    const handleSumOfOverflow = () => {
      const input1 = sumOfInput1.value;
      if (input1 && input1.scrollWidth > input1.clientWidth) {
        // Input is overflowing, update the automatic generation
        updateAmountInWords();
      }
    };
    
    const handleSumOf2Input = () => {
      // Allow manual editing of second line
    };
    
    // Signature Methods
    const handleCreateSignature = () => {
      // Store return path for navigation after signature creation
      localStorage.setItem('signatureReturnPath', router.currentRoute.value.fullPath);
      localStorage.setItem('signatureReturnType', 'invoice');
      router.push('/signature');
    };
    
    const handleSignature1Change = () => {
      console.log('🖊️ Signature 1 changed to:', selectedSignature1.value);
      console.log('📋 Available signatures:', savedSignatures.value.map(s => ({ id: s.id, name: s.name })));
      const signature = savedSignatures.value.find(sig => sig.id === selectedSignature1.value);
      signatureImage1.value = signature ? (signature.dataURL || signature.imageData || '') : '';
      console.log('🖼️ Signature 1 image set:', signatureImage1.value ? 'Has image' : 'No image');
      
      // Save to both form data and shared state
      saveFormData();
      saveSharedSignatureState();
    };
    
    const handleSignature2Change = () => {
      console.log('🖊️ Signature 2 changed to:', selectedSignature2.value);
      console.log('📋 Available signatures:', savedSignatures.value.map(s => ({ id: s.id, name: s.name })));
      const signature = savedSignatures.value.find(sig => sig.id === selectedSignature2.value);
      signatureImage2.value = signature ? (signature.dataURL || signature.imageData || '') : '';
      console.log('🖼️ Signature 2 image set:', signatureImage2.value ? 'Has image' : 'No image');
      
      // Save to both form data and shared state
      saveFormData();
      saveSharedSignatureState();
    };
    
    // Watch for changes in total copies to adjust current page
    watch(totalCopies, (newTotal) => {
      if (currentPage.value > newTotal) {
        currentPage.value = newTotal;
      }
    });

    // Debounced save to reduce storage writes
    let saveFormDataTimeout = null;
    const debouncedSaveFormData = (immediate = false) => {
      if (immediate) {
        // Save immediately if requested (e.g., before navigation)
        if (saveFormDataTimeout) clearTimeout(saveFormDataTimeout);
        saveFormData();
        return;
      }
      
      // Clear existing timeout
      if (saveFormDataTimeout) clearTimeout(saveFormDataTimeout);
      
      // Set new timeout for debounced save
      saveFormDataTimeout = setTimeout(() => {
        saveFormData();
        saveFormDataTimeout = null;
      }, 500); // Wait 500ms after last change
    };

    const saveFormData = () => {
      const formData = {
        organizationName: organizationName.value,
        organizationSubName: organizationSubName.value,
        businessNumber: businessNumber.value,
        headOfficeAddress: headOfficeAddress.value,
        headOfficePhone: headOfficePhone.value,
        branchAddress1: branchAddress1.value,
        branch1Phone: branch1Phone.value,
        branchAddress2: branchAddress2.value,
        branch2Phone: branch2Phone.value,
        logoDataUrl: logoDataUrl.value,
        autoReceiptNumber: autoReceiptNumber.value, // Save auto receipt number toggle state
        autoDate: autoDate.value, // Save auto date toggle state
        taxEnabled: taxEnabled.value,
        showPageNumbers: showPageNumbers.value,
        totalCopies: totalCopies.value,
        currentPage: currentPage.value,
        // Invoice Items Data
        items: items.value,
        taxRate: taxRate.value,
        sumOf: sumOf.value,
        sumOf2: sumOf2.value,
        selectedSignature1: selectedSignature1.value,
        selectedSignature2: selectedSignature2.value,
        signatureImage1: signatureImage1.value,
        signatureImage2: signatureImage2.value,
        additionalBranches: additionalBranches.value, // Save dynamic branches
        // Quick Fill Form data
        customerName: customerName.value,
        customerAddress: customerAddress.value,
        date: date.value,
        lpo: lpo.value,
        timestamp: Date.now() // Add timestamp for data validation
      };
      
      // Use safe localStorage with automatic cleanup and fallback
      const success = safeLocalStorage.setItem('generateInvoiceFormData', JSON.stringify(formData), { 
        fallbackToMemory: true,
        maxSize: 1 // Limit to 1MB to prevent huge form data
      });
      
      if (!success) {
        console.warn('Form data could not be saved to storage, using memory fallback');
      }
    };

    const loadFormData = () => {
      try {
        const savedData = safeLocalStorage.getItem('generateInvoiceFormData');
        if (savedData) {
          const formData = JSON.parse(savedData);
          
          // Load all form fields
          organizationName.value = formData.organizationName || '';
          organizationSubName.value = formData.organizationSubName || '';
          businessNumber.value = formData.businessNumber || '';
          headOfficeAddress.value = formData.headOfficeAddress || '';
          headOfficePhone.value = formData.headOfficePhone || '';
          branchAddress1.value = formData.branchAddress1 || '';
          branch1Phone.value = formData.branch1Phone || '';
          branchAddress2.value = formData.branchAddress2 || '';
          branch2Phone.value = formData.branch2Phone || '';
          logoDataUrl.value = formData.logoDataUrl || '';
          taxEnabled.value = formData.taxEnabled !== undefined ? formData.taxEnabled : true;
          showPageNumbers.value = formData.showPageNumbers || false;
          totalCopies.value = formData.totalCopies || 1;
          currentPage.value = formData.currentPage || 1;
          
          // Load invoice items data
          if (formData.items && Array.isArray(formData.items)) {
            items.value = formData.items;
          }
          taxRate.value = formData.taxRate || 0;
          sumOf.value = formData.sumOf || '';
          sumOf2.value = formData.sumOf2 || '';
          selectedSignature1.value = formData.selectedSignature1 || '';
          selectedSignature2.value = formData.selectedSignature2 || '';
          signatureImage1.value = formData.signatureImage1 || '';
          signatureImage2.value = formData.signatureImage2 || '';
          autoReceiptNumber.value = formData.autoReceiptNumber !== undefined ? formData.autoReceiptNumber : true;
          autoDate.value = formData.autoDate !== undefined ? formData.autoDate : true;
          
          // Load Quick Fill Form data
          customerName.value = formData.customerName || '';
          customerAddress.value = formData.customerAddress || '';
          date.value = formData.date || '';
          lpo.value = formData.lpo || '';
          
          // Restore dynamic branches if available
          if (formData.additionalBranches && Array.isArray(formData.additionalBranches)) {
            additionalBranches.value = formData.additionalBranches;
          }
          
          // Form data loaded successfully
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        // Don't show alert on load error, just log it
      }
    };

    const handlePreviewClick = async () => {
      try {
        console.log('🔍 Starting preview preparation...');
        
        // Force immediate save before navigation
        debouncedSaveFormData(true);
        
        // Validate items data
        if (!items.value || items.value.length === 0) {
          alert('⚠️ Please add at least one item before previewing.');
          return;
        }
        
        // Prepare preview data with items and transaction data
        const previewData = {
          taxEnabled: Boolean(taxEnabled.value),
          totalCopies: Math.max(1, Math.min(100, parseInt(totalCopies.value) || 1)),
          currentPage: Math.max(1, parseInt(currentPage.value) || 1),
          showPageNumbers: Boolean(showPageNumbers.value),
          // Include items data for table
          items: items.value || [],
          taxRate: taxRate.value || 0,
          sumOf: sumOf.value || '',
          sumOf2: sumOf2.value || '',
          // Include signature data
          selectedSignature1: selectedSignature1.value || '',
          selectedSignature2: selectedSignature2.value || '',
          signatureImage1: signatureImage1.value || '',
          signatureImage2: signatureImage2.value || '',
          autoDate: autoDate.value, // Pass auto date toggle state
          // Organization data (user-provided)
          logoDataUrl: logoDataUrl.value || '',
          organizationName: organizationName.value || '',
          organizationSubName: organizationSubName.value || '',
          businessNumber: businessNumber.value || '',
          headOfficeAddress: headOfficeAddress.value || '',
          headOfficePhone: headOfficePhone.value || '',
          branchAddress1: branchAddress1.value || '',
          branch1Phone: branch1Phone.value || '',
          branchAddress2: branchAddress2.value || '',
          branch2Phone: branch2Phone.value || '',
          additionalBranches: additionalBranches.value || [],
          // Quick Fill Form data
          customerName: customerName.value || '',
          customerAddress: customerAddress.value || '',
          invoiceDate: date.value || '',
          lpo: lpo.value || '',
          // Set formMode to 'generate' so preview loads organization data
          formMode: 'generate',
          fromQuickFill: true,
          timestamp: Date.now(),
          // Template preference from chat color selection
          selectedTemplate: chatInvoiceData.value.selectedTemplate || 'template1',
          accentColor: chatInvoiceData.value.accentColor || '#10b981'
        };
        
        console.log('📦 Preview data prepared:', { itemsCount: previewData.items.length });
        
        // Clear any existing corrupted data first
        try {
          localStorage.removeItem('invoicePreviewData');
        } catch (clearError) {
          console.warn('⚠️ Could not clear old preview data:', clearError);
        }
        
        // Save with error handling - try multiple methods
        try {
          const serializedData = JSON.stringify(previewData);
          console.log('📝 Serialized data size:', serializedData.length, 'bytes');
          
          // Try localStorage first
          localStorage.setItem('invoicePreviewData', serializedData);
          console.log('✅ Preview data saved to localStorage');
        } catch (storageError) {
          console.error('❌ localStorage failed:', storageError);
          // Try sessionStorage as fallback
          try {
            sessionStorage.setItem('invoicePreviewData', JSON.stringify(previewData));
            console.log('✅ Preview data saved to sessionStorage (fallback)');
          } catch (sessionError) {
            console.error('❌ sessionStorage also failed:', sessionError);
            throw new Error('Cannot save preview data. Storage might be full.');
          }
        }
        
        // Get branch from route query
        const branch = route.query.branch || '';
        console.log('🌿 Branch for preview:', branch);
        
        // Navigate to preview page with branch context
        router.push({
          name: 'invoice-preview',
          query: { branch }
        });
        
      } catch (error) {
        console.error('❌ Error preparing preview data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Error preparing preview: ${errorMessage}\n\nPlease try:\n1. Reducing the number of items\n2. Removing uploaded images\n3. Clearing browser data`);
      }
    };

    const handleRefreshForm = () => {
      // Check if there's any data to clear
      const hasData = organizationName.value || organizationSubName.value || businessNumber.value || 
                     headOfficeAddress.value || smartTextInput.value || logoDataUrl.value;
      
      if (!hasData) {
        alert('ℹ️ Form is already empty!');
        return;
      }
      
      if (confirm('🗑️ Clear All Data\n\nAre you sure you want to clear all form data and start fresh?\n\nThis will remove:\n• Organization details\n• Logo\n• All settings\n\nThis action cannot be undone.')) {
        // Clear all form fields
        organizationName.value = '';
        organizationSubName.value = '';
        businessNumber.value = '';
        headOfficeAddress.value = '';
        headOfficePhone.value = '';
        branchAddress1.value = '';
        branch1Phone.value = '';
        branchAddress2.value = '';
        branch2Phone.value = '';
        logoDataUrl.value = '';
        taxEnabled.value = true;
        totalCopies.value = 1;
        currentPage.value = 1;
        showPageNumbers.value = false;
        
        // Clear dynamic branches
        additionalBranches.value = [];
        
        // Clear smart text parser
        smartTextInput.value = '';
        validationErrors.value = [];
        parsedData.value = { organizationName: '', subtitle: '', addresses: [], phones: [], parseMethod: 'none' };
        
        // Clear localStorage
        localStorage.removeItem('generateInvoiceFormData');
        
        alert('✅ Form cleared successfully! Ready for new data.');
      }
    };

    // Business Number Quick Fill Methods
    const selectBusinessNumber = (bn) => {
      businessNumber.value = bn.number;
      showBNDropdown.value = false;
      saveFormData(); // Save to localStorage when business number is selected
    };

    const selectBNTemplate = (template) => {
      businessNumber.value = template.format;
      showBNDropdown.value = false;
      saveFormData(); // Save to localStorage when template is selected
    };

    const clearBusinessNumber = () => {
      businessNumber.value = '';
      showBNDropdown.value = false;
      saveFormData(); // Save to localStorage when cleared
    };



    // Save Invoice Functions
    const toggleInvoiceMenu = () => {
      showInvoiceMenu.value = !showInvoiceMenu.value;
    };

    // Swiper initialization
    const initializeSwiper = () => {
      if (!swiperContainer.value || swiperInstance.value) return;
      
      try {
        swiperInstance.value = new Swiper(swiperContainer.value, {
          slidesPerView: 2,
          spaceBetween: 12,
          grabCursor: true,
          breakpoints: {
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 4 }
          }
        });
        console.log('✅ Swiper initialized');
      } catch (error) {
        console.error('❌ Swiper error:', error);
      }
    };

    // Swiper cleanup
    const destroySwiper = () => {
      if (swiperInstance.value) {
        try {
          swiperInstance.value.destroy(true, true);
          swiperInstance.value = null;
          console.log('✅ Swiper destroyed successfully');
        } catch (error) {
          console.error('❌ Error destroying swiper:', error);
        }
      }
    };

    const handleSaveInvoice = () => {
      showInvoiceMenu.value = false;
      showSaveDialog();
    };

    const handleViewSavedInvoices = () => {
      showInvoiceMenu.value = false;
      viewSavedInvoices();
    };

    const showSaveDialog = () => {
      // Generate a default invoice name based on organization and date
      const orgName = organizationName.value || 'Invoice';
      const date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-');
      
      invoiceName.value = `${orgName} - ${date}`;
      showSaveModal.value = true;
    };

    const cancelSave = () => {
      showSaveModal.value = false;
      invoiceName.value = '';
    };

    const saveInvoice = async () => {
      if (!invoiceName.value.trim()) {
        alert('Please enter a name for your invoice');
        return;
      }

      isSaving.value = true;
      
      try {
        // Get current member/branch info
        const memberData = localStorage.getItem('sdp_authenticated_member');
        if (!memberData) {
          alert('Please login first to save invoices');
          isSaving.value = false;
          return;
        }

        const member = JSON.parse(memberData);
        if (!member.branch) {
          alert('No branch information found. Please contact support.');
          isSaving.value = false;
          return;
        }

        // Prepare invoice data
        const invoiceData = {
          name: invoiceName.value.trim(),
          organizationName: organizationName.value,
          organizationSubName: organizationSubName.value,
          businessNumber: businessNumber.value,
          headOfficeAddress: headOfficeAddress.value,
          headOfficePhone: headOfficePhone.value,
          branchAddress1: branchAddress1.value,
          branch1Phone: branch1Phone.value,
          branchAddress2: branchAddress2.value,
          branch2Phone: branch2Phone.value,
          logoDataUrl: logoDataUrl.value,
          items: items.value,
          taxEnabled: taxEnabled.value,
          taxRate: taxRate.value,
          totalAmount: displayTotal.value,
          type: 'invoice'
        };

        // Save using the proper database service
        const { saveInvoice: dbSaveInvoice } = await import('@/firebase/database');
        const result = await dbSaveInvoice(member.branch, invoiceData);

        if (result.success) {
          // Close modal and reset form
          showSaveModal.value = false;
          invoiceName.value = '';
          
          // Show success toast
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity flex items-center gap-2';
          toast.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Invoice "${invoiceData.name}" saved successfully!
          `;
          document.body.appendChild(toast);
          
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
              if (document.body.contains(toast)) {
                document.body.removeChild(toast);
              }
            }, 300);
          }, 3000);

        } else {
          throw new Error(result.error || 'Failed to save invoice');
        }

      } catch (error) {
        console.error('Error saving invoice:', error);
        alert(`Error saving invoice: ${error.message}. Please try again.`);
      } finally {
        isSaving.value = false;
      }
    };

    // Navigation functions
    const viewSavedInvoices = () => {
      router.push({ name: 'SavedInvoices', query: route.query });
    };

    // Component lifecycle
    // Watch for route changes to reload form data when returning from preview or signature page
    watch(() => route.path, (newPath, oldPath) => {
      // If we're coming back from the preview page, reload form data
      if (oldPath && oldPath.includes('preview') && newPath.includes('invoice')) {
        setTimeout(() => {
          loadFormData();
        }, 100); // Small delay to ensure component is ready
      }
      
      // If we're coming back from the signature page, reload signatures
      if (oldPath && oldPath.includes('signature') && newPath.includes('invoice')) {
        console.log('🔄 Returning from signature page, reloading signatures...');
        setTimeout(async () => {
          await loadSignatures();
          loadFormData(); // Also reload form data to get any signature selections
        }, 100);
      }
    });

    onMounted(async () => {
      // Load shared signature state first
      loadSharedSignatureState();
      
      // Load saved form data on component mount
      loadFormData();
      
      // Load signatures from Firebase
      await loadSignatures();
      
      // Initialize Swiper since panel is always visible
      await nextTick();
      initializeSwiper();

      // Save data when the user is about to leave the page
      window.addEventListener('beforeunload', saveFormData);
      
      // Add storage event listener for real-time sync with preview page
      window.addEventListener('storage', handleStorageChange);

      // Add visibility change listener to reload form data when tab becomes visible
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          // Tab became visible, reload form data in case user navigated back
          setTimeout(async () => {
            await loadSignatures(); // Reload signatures first
            loadFormData(); // Then reload form data
          }, 100);
        }
      });
    });
    
    // Handle storage changes for real-time sync
    const handleStorageChange = (event) => {
      if (event.key === SHARED_SIGNATURE_KEY && event.newValue) {
        try {
          const newData = JSON.parse(event.newValue);
          console.log('🔄 Detected signature state change from preview page:', newData);
          
          selectedSignature1.value = newData.selectedSignature1 || '';
          selectedSignature2.value = newData.selectedSignature2 || '';
          signatureImage1.value = newData.signatureImage1 || '';
          signatureImage2.value = newData.signatureImage2 || '';
        } catch (error) {
          console.error('❌ Error handling storage change:', error);
        }
      }
    };

    // Cleanup and save before unmount
    onBeforeUnmount(async () => {
      window.removeEventListener('beforeunload', saveFormData);
      window.removeEventListener('storage', handleStorageChange);
      
      // Clear pending debounced save and save immediately
      if (saveFormDataTimeout) {
        clearTimeout(saveFormDataTimeout);
        saveFormDataTimeout = null;
      }
      
      // Destroy swiper instance
      destroySwiper();
      
      // Save form data immediately when navigating away
      saveFormData();
      
      // Clean up large data to free memory
      additionalBranches.value = [];
    });

    const createNewInvoice = () => {
      // Check if there's any invoice item data that would be lost
      const hasInvoiceData = items.value.some(item => 
        item.quantity > 0 || item.price > 0 || item.description.trim() !== ''
      );
      
      if (hasInvoiceData) {
        // Only ask for confirmation if there's actual invoice data
        if (!confirm('🆕 Create New Invoice\n\nThis will clear current invoice items and create a fresh invoice.\n\nProceed?')) {
          return;
        }
      }
      
      // Reset invoice items to fresh state
      items.value = [{
        id: Date.now(),
        quantity: '',
        price: '',
        tax: '',
        description: ''
      }];
      
      // Reset invoice-specific fields
      taxRate.value = 0;
      sumOf.value = '';
      sumOf2.value = '';
      
      // Reset page settings
      totalCopies.value = 1;
      currentPage.value = 1;
      
      // Auto-generate receipt number if enabled
      if (autoReceiptNumber.value) {
        generateReceiptNumber();
      }
      
      // Auto-set date if enabled
      if (autoDate.value) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        // Update date field if it exists
      }
      
      // Clear invoice preview data
      localStorage.removeItem('invoicePreviewData');
      
      // Show success message
      const message = hasInvoiceData ? '✅ New invoice created!' : '✅ Fresh invoice ready!';
      
      // Use a toast-style notification instead of alert for better UX
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
    };

    // Helper function for receipt number generation
    const generateReceiptNumber = () => {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `INV-${timestamp}-${random}`;
    };

    // Chat Helper Functions
    const formatChatMessage = (content) => {
      return content.replace(/\n/g, '<br>');
    };

    const scrollChatToBottom = () => {
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      });
    };

    const addChatMessage = (role, content, actions = [], colorSelector = false) => {
      chatMessages.value.push({ role, content, actions, colorSelector });
      scrollChatToBottom();
    };

    const startChatConversation = () => {
      chatMessages.value = [];
      chatStep.value = 'asking_input_method';
      addChatMessage('assistant', 
        '👋 Let\'s create your invoice!\n\nHow would you like to enter the details?',
        [
          { id: 'bulk', label: '📝 Enter All at Once', primary: true },
          { id: 'step', label: '👣 Step by Step', primary: false }
        ]
      );
    };

    const handleChatAction = (action) => {
      if (action.id === 'bulk') {
        addChatMessage('user', 'I\'ll enter all details at once');
        chatStep.value = 'waiting_bulk_input';
        addChatMessage('assistant', 
          '📝 Great! Please enter the invoice details in this format:\n\n' +
          '**Organization Name:** [your company name]\n' +
          '**Organization Address:** [address]\n' +
          '**Organization Phone:** [phone]\n' +
          '**Customer Name:** [name]\n' +
          '**Customer Address:** [address]\n' +
          '**Date:** [date]\n' +
          '**LPO:** [lpo number] (optional)\n\n' +
          'You can paste all the information together!'
        );
      } else if (action.id === 'step') {
        addChatMessage('user', 'I\'ll go step by step');
        askOrgName();
      } else if (action.id === 'yes_items') {
        addChatMessage('user', 'Yes, I want to add items');
        showItemsForm.value = true;
        chatStep.value = 'asking_items';
        addChatMessage('assistant', 
          '📦 Great! The items form is now available above. Add your items with quantity, description, and price.\n\n' +
          'When you\'re done, click the button below to continue.',
          [
            { id: 'items_done', label: '✅ Done Adding Items', primary: true }
          ]
        );
      } else if (action.id === 'no_items') {
        addChatMessage('user', 'No items needed');
        showItemsForm.value = false;
        showReview();
      } else if (action.id === 'items_done') {
        addChatMessage('user', 'Done adding items');
        showReview();
      } else if (action.id === 'confirm') {
        addChatMessage('user', 'Generate my invoice!');
        generateFromChat();
      } else if (action.id === 'edit') {
        addChatMessage('user', 'I want to make changes');
        viewMode.value = 'form';
        addChatMessage('assistant', 
          '✏️ Switched to form mode. Make your edits and use the Preview button when ready.\n\n' +
          'You can switch back to chat mode anytime using the toggle above.'
        );
      } else if (action.id === 'new') {
        chatInvoiceData.value = { customerName: '', customerAddress: '', date: '', lpo: '', items: [], orgName: '', orgSubtitle: '', orgAddress: '', orgPhone: '', selectedTemplate: 'template1', accentColor: '#10b981' };
        showItemsForm.value = false;
        startChatConversation();
      } else if (action.id === 'color_1') {
        chatInvoiceData.value.selectedTemplate = 'template2';
        addChatMessage('user', '🖤 1 Color selected');
        showReview();
      } else if (action.id === 'color_2') {
        chatInvoiceData.value.selectedTemplate = 'template3';
        addChatMessage('user', '🎨 2 Color selected');
        showReview();
      } else if (action.id === 'color_3') {
        chatInvoiceData.value.selectedTemplate = 'template1';
        addChatMessage('user', '🌈 3 Color selected');
        showReview();
      } else if (action.id === 'generate_org') {
        addChatMessage('user', 'Generate');
        generateOrgPreview();
      } else if (action.id === 'continue_to_customer') {
        addChatMessage('user', 'Continue to customer details');
        askCustomerName();
      } else if (action.id === 'review_edit_org') {
        addChatMessage('user', 'Review & Edit');
        openEditModal('org');
      } else if (action.id === 'review_edit_invoice') {
        addChatMessage('user', 'Review & Edit');
        openEditModal('invoice');
      } else if (action.id === 'edit_customer_name') {
        chatStep.value = 'editing_field';
        editingFieldName.value = 'customerName';
        addChatMessage('user', 'Edit Customer Name');
        addChatMessage('assistant', '👤 Please type the new Customer Name:');
      } else if (action.id === 'edit_customer_address') {
        chatStep.value = 'editing_field';
        editingFieldName.value = 'customerAddress';
        addChatMessage('user', 'Edit Customer Address');
        addChatMessage('assistant', '📍 Please type the new Customer Address:');
      } else if (action.id === 'edit_date') {
        chatStep.value = 'editing_field';
        editingFieldName.value = 'date';
        addChatMessage('user', 'Edit Date');
        addChatMessage('assistant', '📅 Please type the new Date:');
      } else if (action.id === 'edit_lpo') {
        chatStep.value = 'editing_field';
        editingFieldName.value = 'lpo';
        addChatMessage('user', 'Edit LPO');
        addChatMessage('assistant', '📋 Please type the new LPO number (or "skip"):');
      }
    };

    const askOrgName = () => {
      chatStep.value = 'asking_org_name';
      addChatMessage('assistant', '🏢 What is your **organization/company name**?\n\n💡 _Tip: You can paste all org details at once using Shift+Enter between lines, or use labeled format like:_\n`Organization Name: ... Subtitle: ... Address: ... Tel: ...`');
    };

    const askOrgSubtitle = () => {
      chatStep.value = 'asking_org_subtitle';
      addChatMessage('assistant', '📝 What is your **organization subtitle/tagline**?\n\n(e.g., "Come to Pick Maxrange Enterprises" or type "skip" to leave blank)');
    };

    const askOrgAddress = () => {
      chatStep.value = 'asking_org_address';
      addChatMessage('assistant', '📍 What is your **organization\'s address**?');
    };

    const askOrgPhone = () => {
      chatStep.value = 'asking_org_phone';
      addChatMessage('assistant', '📞 What is your **organization\'s phone number**?');
    };

    // Show organization summary after collecting org details
    const showOrgReview = () => {
      chatStep.value = 'reviewing_org';
      const subtitleLine = chatInvoiceData.value.orgSubtitle ? `📝 **Subtitle:** ${chatInvoiceData.value.orgSubtitle}\n` : '';
      addChatMessage('assistant', 
        '🏢 **Organization Details Summary:**\n\n' +
        `🏢 **Name:** ${chatInvoiceData.value.orgName}\n` +
        subtitleLine +
        `📍 **Address:** ${chatInvoiceData.value.orgAddress}\n` +
        `📞 **Phone:** ${chatInvoiceData.value.orgPhone}\n\n` +
        'Does this look correct?',
        [
          { id: 'generate_org', label: '✨ Generate', primary: true },
          { id: 'review_edit_org', label: '📝 Review & Edit', primary: false }
        ]
      );
    };

    // Generate preview with just org data, then offer to continue to customer details
    const generateOrgPreview = () => {
      isAnalyzingChat.value = true;
      
      // Apply organization data to form fields
      organizationName.value = chatInvoiceData.value.orgName;
      organizationSubName.value = chatInvoiceData.value.orgSubtitle;
      headOfficeAddress.value = chatInvoiceData.value.orgAddress;
      headOfficePhone.value = chatInvoiceData.value.orgPhone;
      
      setTimeout(() => {
        isAnalyzingChat.value = false;
        addChatMessage('assistant', 
          '🎉 **Organization details applied!**\n\n' +
          'Your invoice preview is ready with the organization info.\n\n' +
          'Would you like to continue adding customer details?',
          [
            { id: 'continue_to_customer', label: '👤 Continue to Customer Details', primary: true },
            { id: 'review_edit_org', label: '📝 Review & Edit', primary: false },
            { id: 'new', label: '🔄 Start Over', primary: false }
          ]
        );
        
        // Trigger preview
        handlePreviewClick();
      }, 800);
    };

    const askCustomerName = () => {
      chatStep.value = 'asking_customer_name';
      addChatMessage('assistant', '\n👤 Now let\'s get the **customer details**...\n\nWhat is the customer\'s name?');
    };

    const askCustomerAddress = () => {
      chatStep.value = 'asking_customer_address';
      addChatMessage('assistant', '📍 What is the customer\'s address?');
    };

    const askDate = () => {
      chatStep.value = 'asking_date';
      const today = new Date().toLocaleDateString();
      addChatMessage('assistant', `📅 What date should be on the invoice?\n\n(Type "today" for ${today})`);
    };

    const askLpo = () => {
      chatStep.value = 'asking_lpo';
      addChatMessage('assistant', '📋 Enter the LPO number (or type "skip" to leave it blank):');
    };

    const askWantItems = () => {
      chatStep.value = 'asking_want_items';
      addChatMessage('assistant', 
        '📦 Would you like to add item details to this invoice?\n\n' +
        '(Items include quantity, description, and price)',
        [
          { id: 'yes_items', label: '✅ Yes, Add Items', primary: true },
          { id: 'no_items', label: '⏭️ Skip Items', primary: false }
        ]
      );
    };

    const handleAccentColorChange = (event) => {
      chatInvoiceData.value.accentColor = event.target.value;
    };

    const showReview = () => {
      chatStep.value = 'ready_to_generate';
      const itemsText = showItemsForm.value ? `\n📦 **Items:** (${items.value.filter(i => i.description).length} items added)` : '';
      
      const subtitleLine = chatInvoiceData.value.orgSubtitle ? `📝 **Subtitle:** ${chatInvoiceData.value.orgSubtitle}\n` : '';
      
      const templateLabels = {
        'template1': '🌈 3 Color (Full Color)',
        'template2': '🖤 1 Color (Black & White)',
        'template3': '🎨 2 Color'
      };
      const templateLine = `\n🎨 **Template:** ${templateLabels[chatInvoiceData.value.selectedTemplate] || templateLabels['template1']}`;
      
      addChatMessage('assistant', 
        '📋 **Invoice Summary:**\n\n' +
        '**Organization:**\n' +
        `🏢 **Name:** ${chatInvoiceData.value.orgName}\n` +
        subtitleLine +
        `📍 **Address:** ${chatInvoiceData.value.orgAddress}\n` +
        `📞 **Phone:** ${chatInvoiceData.value.orgPhone}\n\n` +
        '**Customer:**\n' +
        `👤 **Name:** ${chatInvoiceData.value.customerName}\n` +
        `📍 **Address:** ${chatInvoiceData.value.customerAddress}\n` +
        `📅 **Date:** ${chatInvoiceData.value.date}\n` +
        `📋 **LPO:** ${chatInvoiceData.value.lpo || 'N/A'}` +
        itemsText +
        templateLine + '\n\n' +
        '**Choose color style:**',
        [
          { id: 'color_1', label: '🖤 1 Color', primary: chatInvoiceData.value.selectedTemplate === 'template2' },
          { id: 'color_2', label: '🎨 2 Color', primary: chatInvoiceData.value.selectedTemplate === 'template3' },
          { id: 'color_3', label: '🌈 3 Color', primary: chatInvoiceData.value.selectedTemplate === 'template1' },
          { id: 'confirm', label: '✅ Generate Invoice', primary: true },
          { id: 'review_edit_invoice', label: '📝 Review & Edit', primary: false },
          { id: 'new', label: '🔄 Start Over', primary: false }
        ],
        true // colorSelector flag for accent color dropdown
      );
    };

    const generateFromChat = () => {
      isAnalyzingChat.value = true;
      
      // Apply chat data to form fields
      customerName.value = chatInvoiceData.value.customerName;
      customerAddress.value = chatInvoiceData.value.customerAddress;
      date.value = chatInvoiceData.value.date;
      lpo.value = chatInvoiceData.value.lpo;
      
      // Apply organization data to form fields
      organizationName.value = chatInvoiceData.value.orgName;
      organizationSubName.value = chatInvoiceData.value.orgSubtitle;
      headOfficeAddress.value = chatInvoiceData.value.orgAddress;
      headOfficePhone.value = chatInvoiceData.value.orgPhone;
      
      setTimeout(() => {
        isAnalyzingChat.value = false;
        chatStep.value = 'complete';
        addChatMessage('assistant', 
          '🎉 **Invoice Generated!**\n\n' +
          'Your invoice is ready for preview. Click the Preview button to see it.\n\n' +
          'What would you like to do next?',
          [
            { id: 'new', label: '➕ Create New Invoice', primary: false }
          ]
        );
        
        // Trigger preview
        handlePreviewClick();
      }, 800);
    };

    const parseBulkInput = (text) => {
      const data = {
        customerName: '',
        customerAddress: '',
        date: '',
        lpo: '',
        orgName: '',
        orgSubtitle: '',
        orgAddress: '',
        orgPhone: ''
      };
      
      // Check for labeled format (contains known "label:" patterns)
      const hasLabels = /(?:organization\s*name|org\s*name|company\s*name|subtitle|sub\s*title|address|tel|telephone|phone|customer\s*name|date|lpo)\s*:/i.test(text);
      
      if (hasLabels) {
        // Split into segments: by newlines, or by period before a label keyword
        let segments;
        if (text.includes('\n')) {
          segments = text.split('\n').map(s => s.trim()).filter(Boolean);
        } else {
          // Period-separated: split by "." followed by a known label
          const labelSplitPattern = /\.\s*(?=(?:organization\s*name|org\s*name|company\s*name|subtitle|sub\s*title|address|tel|telephone|phone\s*number|phone|customer\s*name|customer\s*address|date|lpo)\s*:)/gi;
          segments = text.split(labelSplitPattern).map(s => s.trim()).filter(Boolean);
        }
        
        // Collect unlabeled lines for hybrid format (lines without a "label:" pattern)
        const unlabeledLines = [];
        
        for (const seg of segments) {
          if (/^(?:organization\s*name|org\s*name|company\s*name)\s*:/i.test(seg)) {
            data.orgName = seg.replace(/^(?:organization\s*name|org\s*name|company\s*name)\s*:\s*/i, '').replace(/\.\s*$/, '').trim();
          } else if (/^(?:subtitle|sub\s*title|sub\s*name|tagline|slogan)\s*:/i.test(seg)) {
            data.orgSubtitle = seg.replace(/^(?:subtitle|sub\s*title|sub\s*name|tagline|slogan)\s*:\s*/i, '').replace(/\.\s*$/, '').trim();
          } else if (/^(?:customer\s*address)\s*:/i.test(seg)) {
            data.customerAddress = seg.replace(/^(?:customer\s*address)\s*:\s*/i, '').replace(/\.\s*$/, '').trim();
          } else if (/^(?:organization\s*address|org\s*address|company\s*address|address)\s*:/i.test(seg)) {
            if (!data.orgAddress) {
              data.orgAddress = seg.replace(/^(?:organization\s*address|org\s*address|company\s*address|address)\s*:\s*/i, '').replace(/\.\s*$/, '').trim();
            } else {
              data.customerAddress = seg.replace(/^(?:address)\s*:\s*/i, '').replace(/\.\s*$/, '').trim();
            }
          } else if (/^(?:tel|telephone|phone\s*number\/tel|phone\s*number|phone|organization\s*phone|org\s*phone)\s*:?\s*/i.test(seg)) {
            data.orgPhone = seg.replace(/^(?:tel|telephone|phone\s*number\/tel|phone\s*number|phone|organization\s*phone|org\s*phone)\s*:?\s*/i, '').replace(/\.\s*$/, '').trim();
          } else if (/^(?:customer\s*name|name)\s*:/i.test(seg)) {
            data.customerName = seg.replace(/^(?:customer\s*name|name)\s*:\s*/i, '').replace(/\.\s*$/, '').trim();
          } else if (/^date\s*:/i.test(seg)) {
            data.date = seg.replace(/^date\s*:\s*/i, '').replace(/\.\s*$/, '').trim();
          } else if (/^lpo\s*:/i.test(seg)) {
            data.lpo = seg.replace(/^lpo\s*:\s*/i, '').replace(/\.\s*$/, '').trim();
          } else {
            // Line doesn't match any label — collect for positional fallback
            unlabeledLines.push(seg.replace(/\.\s*$/, '').trim());
          }
        }
        
        // Hybrid fallback: use unlabeled lines for org name / subtitle if not already set
        if (unlabeledLines.length > 0 && !data.orgName) {
          data.orgName = unlabeledLines[0];
        }
        if (unlabeledLines.length > 1 && !data.orgSubtitle) {
          data.orgSubtitle = unlabeledLines[1];
        }
      } else {
        // No labels found - positional parsing from multi-line input
        const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
        if (lines.length >= 4) {
          // 4+ lines: name, subtitle, address, phone
          data.orgName = lines[0];
          data.orgSubtitle = lines[1];
          data.orgAddress = lines[2];
          data.orgPhone = lines[3];
        } else if (lines.length === 3) {
          // 3 lines: name, address, phone
          data.orgName = lines[0];
          data.orgAddress = lines[1];
          data.orgPhone = lines[2];
        } else if (lines.length === 2) {
          data.orgName = lines[0];
          data.orgAddress = lines[1];
        }
      }
      
      return data;
    };

    const sendChatMessage = () => {
      if (!chatInputText.value.trim()) return;
      
      const userMessage = chatInputText.value.trim();
      addChatMessage('user', userMessage);
      chatInputText.value = '';
      
      isAnalyzingChat.value = true;
      
      setTimeout(() => {
        isAnalyzingChat.value = false;
        
        switch (chatStep.value) {
          case 'asking_input_method':
            // Auto-detect bulk input if message has multiple lines or labeled fields
            const hasBulkIndicators = userMessage.includes('\n') || 
              /(?:organization\s*name|subtitle|address|tel|telephone|phone|customer|date|lpo)\s*:/i.test(userMessage);
            
            if (hasBulkIndicators) {
              chatStep.value = 'waiting_bulk_input';
              const parsed = parseBulkInput(userMessage);
              chatInvoiceData.value = { ...chatInvoiceData.value, ...parsed };
              
              if (parsed.orgName || parsed.customerName) {
                const subtitleInfo = parsed.orgSubtitle ? `📝 Subtitle: ${parsed.orgSubtitle}\n` : '';
                addChatMessage('assistant', 
                  '✅ Got it! Here\'s what I captured:\n\n' +
                  '**Organization:**\n' +
                  `🏢 Name: ${parsed.orgName || '(not provided)'}\n` +
                  subtitleInfo +
                  `📍 Address: ${parsed.orgAddress || '(not provided)'}\n` +
                  `📞 Phone: ${parsed.orgPhone || '(not provided)'}\n\n` +
                  '**Customer:**\n' +
                  `👤 Name: ${parsed.customerName || '(not provided)'}\n` +
                  `📍 Address: ${parsed.customerAddress || '(not provided)'}\n` +
                  `📅 Date: ${parsed.date || '(not provided)'}\n` +
                  `📋 LPO: ${parsed.lpo || '(not provided)'}`
                );
                showReview();
              } else {
                addChatMessage('assistant', 
                  '🤔 I couldn\'t find the labeled fields. Let me try using what you typed.\n\n' +
                  'Let\'s go step by step instead.'
                );
                chatInvoiceData.value.orgName = userMessage;
                askOrgSubtitle();
              }
            } else {
              // Single-line input, treat as step-by-step
              addChatMessage('assistant', 'Let\'s go step by step. I\'ll help you fill in the details.');
              askOrgName();
            }
            break;
            
          case 'waiting_bulk_input':
            const parsed = parseBulkInput(userMessage);
            chatInvoiceData.value = { ...chatInvoiceData.value, ...parsed };
            
            if (parsed.orgName || parsed.customerName) {
              addChatMessage('assistant', 
                '✅ Got it! Here\'s what I captured:\n\n' +
                '**Organization:**\n' +
                `🏢 Name: ${parsed.orgName || '(not provided)'}\n` +
                `📍 Address: ${parsed.orgAddress || '(not provided)'}\n` +
                `📞 Phone: ${parsed.orgPhone || '(not provided)'}\n\n` +
                '**Customer:**\n' +
                `👤 Name: ${parsed.customerName || '(not provided)'}\n` +
                `📍 Address: ${parsed.customerAddress || '(not provided)'}\n` +
                `📅 Date: ${parsed.date || '(not provided)'}\n` +
                `📋 LPO: ${parsed.lpo || '(not provided)'}`
              );
              showReview();
            } else {
              addChatMessage('assistant', 
                '🤔 I couldn\'t find the labeled fields. Let me try using what you typed.\n\n' +
                'Let\'s go step by step instead.'
              );
              chatInvoiceData.value.orgName = userMessage;
              askOrgAddress();
            }
            break;
          
          case 'asking_org_name':
            // Smart detection: check if user pasted all org details at once
            const orgHasLines = userMessage.includes('\n');
            const orgHasLabels = /(?:subtitle|sub\s*title|address|tel|telephone|phone)\s*:/i.test(userMessage);
            
            if (orgHasLines || orgHasLabels) {
              // Parse all org details from input
              const orgParsed = parseBulkInput(userMessage);
              if (orgParsed.orgName) chatInvoiceData.value.orgName = orgParsed.orgName;
              if (orgParsed.orgSubtitle) chatInvoiceData.value.orgSubtitle = orgParsed.orgSubtitle;
              if (orgParsed.orgAddress) chatInvoiceData.value.orgAddress = orgParsed.orgAddress;
              if (orgParsed.orgPhone) chatInvoiceData.value.orgPhone = orgParsed.orgPhone;
              
              addChatMessage('assistant', '✅ Got it! I detected your organization details.');
              showOrgReview();
            } else {
              // Single line - just the org name
              chatInvoiceData.value.orgName = userMessage;
              addChatMessage('assistant', `✅ Organization: **${userMessage}**`);
              askOrgSubtitle();
            }
            break;
          
          case 'asking_org_subtitle':
            if (userMessage.toLowerCase() === 'skip') {
              chatInvoiceData.value.orgSubtitle = '';
              addChatMessage('assistant', '✅ No subtitle added');
            } else {
              chatInvoiceData.value.orgSubtitle = userMessage;
              addChatMessage('assistant', `✅ Subtitle: **${userMessage}**`);
            }
            askOrgAddress();
            break;
            
          case 'asking_org_address':
            chatInvoiceData.value.orgAddress = userMessage;
            addChatMessage('assistant', `✅ Address: **${userMessage}**`);
            askOrgPhone();
            break;
            
          case 'asking_org_phone':
            chatInvoiceData.value.orgPhone = userMessage;
            addChatMessage('assistant', `✅ Phone: **${userMessage}**`);
            showOrgReview();
            break;
            
          case 'asking_customer_name':
            chatInvoiceData.value.customerName = userMessage;
            addChatMessage('assistant', `✅ Customer name: **${userMessage}**`);
            askCustomerAddress();
            break;
            
          case 'asking_customer_address':
            chatInvoiceData.value.customerAddress = userMessage;
            addChatMessage('assistant', `✅ Address: **${userMessage}**`);
            askDate();
            break;
            
          case 'asking_date':
            const dateValue = userMessage.toLowerCase() === 'today' 
              ? new Date().toLocaleDateString() 
              : userMessage;
            chatInvoiceData.value.date = dateValue;
            addChatMessage('assistant', `✅ Date: **${dateValue}**`);
            askLpo();
            break;
            
          case 'asking_lpo':
            const lpoValue = userMessage.toLowerCase() === 'skip' ? '' : userMessage;
            chatInvoiceData.value.lpo = lpoValue;
            addChatMessage('assistant', lpoValue ? `✅ LPO: **${lpoValue}**` : '✅ No LPO added');
            showReview();
            break;
            
          case 'editing_field':
            // Update the field being edited
            if (editingFieldName.value) {
              const fieldName = editingFieldName.value;
              chatInvoiceData.value[fieldName] = userMessage;
              addChatMessage('assistant', `✅ Updated **${fieldName}** to: **${userMessage}**`);
              const isOrgField = ['orgName', 'orgSubtitle', 'orgAddress', 'orgPhone'].includes(fieldName);
              editingFieldName.value = '';
              setTimeout(() => {
                if (isOrgField && chatStep.value === 'editing_field') {
                  showOrgReview();
                } else {
                  addChatMessage('assistant', 'Here\'s your updated invoice summary:');
                  showReview();
                }
              }, 800);
            }
            break;
            
          default:
            addChatMessage('assistant', 
              'I\'m not sure how to process that. Please use the buttons above or start a new conversation.'
            );
        }
      }, 500);
    };

    const autoResizeTextarea = (event) => {
      const el = event.target;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    const handleChatKeyDown = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
        // Reset textarea height after sending
        const el = event.target;
        if (el) {
          setTimeout(() => { el.style.height = 'auto'; }, 50);
        }
      }
    };

    return {
      organizationName,
      organizationSubName,
      businessNumber,
      headOfficeAddress,
      headOfficePhone,
      branchAddress1,
      branch1Phone,
      branchAddress2,
      branch2Phone,
      logoDataUrl,
      autoReceiptNumber,
      autoDate,
      taxEnabled,
      showPageNumbers,
      // Multiple pages/copies
      totalCopies,
      currentPage,
      displayPageNumber,
      goToPreviousPage,
      goToNextPage,
      goToPage,
      validateCopiesInput,
      showImageCropper,
      tempImageUrl,
      logoInput,
      // Business Number Quick Fill
      showBNDropdown,
      businessNumberOptions,
      bnTemplates,
      selectBusinessNumber,
      selectBNTemplate,
      clearBusinessNumber,
      // Dynamic Branch Management
      additionalBranches,
      addNewBranch,
      removeBranch,
      // Invoice Items Management
      MAX_ITEMS,
      items,
      itemsContainer,
      taxRate,
      sumOf,
      sumOf2,
      sumOfInput1,
      sumOfInput2,
      addItem,
      removeItem,
      addItemAfter,
      getItemAmount,
      autoResize,
      subtotal,
      taxAmount,
      grandTotal,
      displayTotal,
      toCurrency,
      updateAmountInWords,
      handleSumOfOverflow,
      handleSumOf2Input,
      // Signature Management
      savedSignatures,
      selectedSignature1,
      selectedSignature2,
      signatureImage1,
      signatureImage2,
      handleCreateSignature,
      handleSignature1Change,
      handleSignature2Change,
      loadSignatures,
      // UI State
      showPreview,
      // Parser placeholders (removed functionality)
      smartTextInput,
      showFormatGuide,
      showManualGuide,
      showParsedPreview,
      validationErrors,
      parsedData,
      smartInputPlaceholder,
      manualInputPlaceholder,
      parseSmartText,
      handlePaste,
      // Methods
      handleLogoUpload,
      handleCroppedImage,
      handleCropperClose,
      removeLogo,
      handlePreviewClick,
      handleRefreshForm,
      saveFormData,
      loadFormData,
      viewSavedInvoices,
      toggleInvoiceMenu,
      handleSaveInvoice,
      handleViewSavedInvoices,
      showInvoiceMenu,
      showSettingsPanel,
      settingsItems,
      swiperContainer,
      swiperInstance,
      initializeSwiper,
      destroySwiper,
      showSaveDialog,
      cancelSave,
      saveInvoice,
      showSaveModal,
      invoiceName,
      isSaving,
      createNewInvoice,
      generateReceiptNumber,
      // Quick Fill Form
      showQuickFillForm,
      customerName,
      customerAddress,
      date,
      lpo,
      // Chat Mode
      viewMode,
      chatMessages,
      chatInputText,
      isAnalyzingChat,
      chatContainer,
      showItemsForm,
      formatChatMessage,
      startChatConversation,
      handleChatAction,
      sendChatMessage,
      handleChatKeyDown,
      autoResizeTextarea,
      handleAccentColorChange,
      // Edit Modal
      showEditModal,
      editModalContext,
      editModalData,
      openEditModal,
      saveEditModalOrg,
      saveEditModalInvoice,
      modalLogoInput,
      handleModalLogoUpload,
      removeModalLogo
    };
  },
});
</script>

<style scoped>
/* Simple Swiper styles for settings panel */
.swiper {
  width: 100%;
  padding: 4px;
}

.swiper-wrapper {
  display: flex;
}

.swiper-slide {
  width: 100%;
  flex: 0 0 auto;
  display: flex;
}

.swiper-slide label {
  width: 100%;
  display: flex;
}

/* Hide all Swiper navigation elements */
.swiper-button-prev,
.swiper-button-next {
  display: none !important;
}

.swiper-button-prev::after,
.swiper-button-next::after {
  display: none !important;
}

/* Responsive slide widths */
@media (min-width: 768px) {
  .swiper-slide {
    width: 50%; /* 2 slides on tablet */
  }
}

@media (min-width: 1024px) {
  .swiper-slide {
    width: 25%; /* 4 slides on desktop */
  }
}
/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
