<template>
  <div
    id="meblink-invoice"
    ref="invoiceRef"
    class="relative bg-white mx-auto"
    style="z-index: 1 !important;"
    :style="{
      width: `${invoiceWidth}in`,
      height: `${invoiceHeight}in`,
      padding: '0.4in',
      boxShadow: `0 0 15px rgba(128, 128, 128, 0.1)`,
      fontFamily: 'Arial, sans-serif',
      fontSize: baseFontSize + 'px',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }"
  >
      
    <!-- Logo Background Watermark -->
    <div 
      v-if="enableTextBackground && watermarkVisible && (watermarkType === 'logo' || watermarkType === 'both') && logoDataUrl"
      class="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
      :style="{
        zIndex: 1,
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
        boxSizing: 'border-box'
      }"
    >
      <div
        class="w-full h-full flex items-center justify-center"
        :style="{
          opacity: 0.06,
          userSelect: 'none',
          position: 'absolute',
          width: '100%',
          height: '100%',
          padding: '0.0in'
        }"
      >
        <img 
          :src="logoDataUrl" 
          alt="Logo Watermark" 
          class="object-contain"
          :style="{ 
            height: '40%',
            width: 'auto',
            maxWidth: '40%',
            minHeight: '100px',
            minWidth: '100px'
          }"
        />
      </div>
    </div>
    
    <div 
      ref="contentWrapperRef"
      class="relative bg-transparent overflow-visible"
      :style="{ 
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
        zIndex: 2
      }"
    >
      <div class="invoice-content-wrapper flex flex-col justify-between h-full w-full" :style="{ paddingTop: `calc(${dynamicPadding} + 4px)`, paddingBottom: `calc(${dynamicPadding} + 2px)`, paddingLeft: dynamicPadding, paddingRight: dynamicPadding, minHeight: '100%', gap: '2px' }">
   <!-- Header -->
  <div class="text-center  flex-shrink-0" :style="{ paddingBottom: '4px' }">
    <!-- Layout with Logo -->
    <div class="flex gap-3 items-start">
      <!-- Logo on left side -->
      <div class="flex-shrink-0 flex items-center justify-center">
        <!-- Debug: Show if logo path is set -->
        <div v-if="!logoDataUrl" class="text-xs text-red-500 border border-red-300 p-1">
          No Logo
        </div>
        <img 
          v-if="logoDataUrl"
          :src="logoDataUrl" 
          alt="Logo" 
          class="object-contain" 
          :style="{ 
            height: `${logoHeight}px`
          }"
          @load="console.log('Logo loaded successfully:', logoDataUrl)"
          @error="$emit('logo-error')" 
        />
      </div>
      
      <!-- Organization Info -->
      <div class="flex-1">
       
        
        <h2 
          class="organization-name"
          :style="{ 
            color: colorStyles.accentColor,
            fontSize: organizationNameFontSize,
          }"
        >
          {{ organizationName || 'YOUR COMPANY NAME' }}
        </h2>
        
        <p 
          v-if="organizationSubName?.trim()"
          class="text-center m-0"
          :style="{ 
            fontSize: organizationSubFontSize,
            lineHeight: '1.25',
            color: '#1f2937',
            fontWeight: '700',
            marginTop: '2px',
            marginBottom: '2px'
          }"
        >
          {{ organizationSubName }}
        </p>
        
        <!-- Receipt-specific sub-name - Big and Bold -->
        <p 
          v-if="organizationReceiptSubName?.trim()"
          class="text-center m-0"
          :style="{ 
            fontSize: '12px',
            lineHeight: '1.2',
            color: 'red',
            fontWeight: '900',
            marginTop: '3px',
            marginBottom: '2px',
            textTransform: 'uppercase !important',
            letterSpacing: '0.5px'
          }"
        >
          {{ organizationReceiptSubName }}
        </p>
      </div>
    </div>
    
    <!-- Address Section - Only show if ANY address or phone info exists -->
    <div v-if="headOfficeAddress?.trim() || headOfficePhone?.trim()" class="flex items-start justify-center mt-1 gap-6">
     
      <!-- Head Office Address -->
      <div v-if="headOfficeAddress?.trim() || headOfficePhone?.trim()" class="max-w-[400px] text-left" style="margin: 0; padding: 0;">
        <!-- Head Office Address -->
        <div v-if="headOfficeAddress?.trim()" class="text-left" style="line-height: 1.1;">
          <strong 
            class="text-slate-900 dark:text-slate-100"
            :style="{ 
              fontSize: addressFontSize,
              wordWrap: 'break-word', 
              wordBreak: 'break-word', 
              whiteSpace: 'normal' 
            }"
          >Head Office Address:</strong>
          <span 
            class="text-slate-900 dark:text-slate-100 ml-1"
            :style="{ 
              fontSize: addressFontSize,
              wordWrap: 'break-word', 
              wordBreak: 'break-word', 
              whiteSpace: 'normal' 
            }"
          >{{ headOfficeAddress }}</span>
        </div>
      </div>
      <!-- Head Office Phone -->
      <div 
        v-if="headOfficePhone?.trim()"
        class="text-left mt-0 min-w-[110px] border-l border-black pl-3"
        style="line-height: 1.1;"
      >
        <div class="flex flex-col">
          <strong 
            class="font-bold text-slate-900 dark:text-slate-100"
            :style="{ 
              fontSize: phoneFontSize,
              whiteSpace: 'normal',
              marginBottom: '2px'
            }"
          >Tel:</strong>
          <span 
            class="font-bold text-slate-900 dark:text-slate-100"
            :style="{ 
              fontSize: phoneFontSize,
              whiteSpace: 'pre-wrap',
              display: 'block',
              maxWidth: '100%'
            }"
          >{{ headOfficePhone }}</span>
        </div>
      </div>
      
    </div>

   
  </div>
 
  
    <!-- Receipt Title -->
    <div class="flex justify-center items-center my-1">
      <div class="flex items-center justify-center gap-4">
        <div class="flex justify-start">
          <p
          class="text-sm font-semibold inline-flex items-center justify-center px-3 py-1 rounded"
          :style="{
            background: colorStyles.accentColor,
            color: colorStyles.headerText,
            lineHeight: '1.2',
            minHeight: '24px'
          }"
        >
          CASH/CREDIT INVOICE
        </p>
        </div>              
        <div class="flex items-center gap-1">
          <span class="text-base font-bold">No.:</span>
          <div v-if="showPageNumbers" class="text-center text-lg font-bold">
            {{ currentInvoiceNumber }}
          </div>
        </div>
      </div>
    </div>

  <!-- Customer details -->
  <div class="my-0 grid gap-1" :class="invoiceWidth >= 4.5 ? 'grid-cols-3' : 'grid-cols-1'" :style="{ paddingLeft: '0px', paddingRight: '0px' }">
    <div 
      :class="invoiceWidth >= 4.5 ? 'col-span-2' : 'col-span-1'"
      class="rounded-xl border-black"
      :style="{ border: `1.5px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, padding: invoiceWidth >= 4 ? '4px' : '3px' }"
    >
      <div class="flex items-center gap-0.5" :class="invoiceWidth < 4 ? 'flex-col items-start gap-0' : ''">
      <span class="font-medium text-black whitespace-nowrap" :style="{ fontSize: customerDetailsFontSize }">Name:</span>
      <div class="print-only flex-1 border-b border-dotted border-black" :style="{ borderBottom: '1px dotted #000000 !important', fontSize: customerDetailsFontSize, width: '100%' }">{{ localCustomerName || '-' }}</div>
      <input
        v-model="localCustomerName"
        placeholder=" "
        class="no-print flex-1 bg-transparent border-b border-dotted border-black focus:outline-none"
        :style="{ fontSize: customerDetailsFontSize, width: '100%', minWidth: '0' }"
      />
    </div>

    <div class="flex items-center gap-0.5 mt-0.5" :class="invoiceWidth < 4 ? 'flex-col items-start gap-0' : ''">
      <span class="font-medium text-black whitespace-nowrap" :style="{ fontSize: customerDetailsFontSize }">Address:</span>
      <div class="print-only flex-1 border-b border-dotted border-black" :style="{ borderBottom: '1px dotted #000000 !important', fontSize: customerDetailsFontSize, width: '100%' }">{{ localCustomerAddress || '-' }}</div>
      <input
        v-model="localCustomerAddress"
        placeholder=" "
        class="no-print flex-1 bg-transparent border-b border-dotted border-black focus:outline-none"
        :style="{ fontSize: customerDetailsFontSize, width: '100%', minWidth: '0' }"
      />
    </div>

    <!-- Address Line 2 (continuation) -->
    <div class="flex items-center gap-0.5 mt-0.5" :class="invoiceWidth < 4 ? 'flex-col items-start gap-0' : ''">
      <div class="print-only flex-1 border-b border-dotted border-black" :style="{ borderBottom: '1px dotted #000000 !important', fontSize: customerDetailsFontSize, width: '100%' }">{{ localCustomerAddress2 || '-' }}</div>
      <input
        v-model="localCustomerAddress2"
        placeholder=" "
        class="no-print flex-1 bg-transparent border-b border-dotted border-black focus:outline-none"
        :style="{ fontSize: customerDetailsFontSize, width: '100%', minWidth: '0' }"
      />
    </div>
    </div>

    <div 
      class="rounded-xl border-black"
      :style="{ border: `1.5px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, padding: invoiceWidth >= 4 ? '4px' : '3px' }"
    >
      <div class="flex items-center gap-0.5" :class="invoiceWidth < 4 ? 'flex-col items-start gap-0' : ''">
     <span class="font-medium text-black whitespace-nowrap" :style="{ fontSize: customerDetailsFontSize }">Date:</span>
     <div class="print-only w-full border-b border-dotted border-black" :style="{ borderBottom: `1px dotted ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)} !important`, fontSize: customerDetailsFontSize }">
       <span v-if="autoDate">{{ new Date().toLocaleDateString() }}</span>
       <span v-else>{{ localDate || '-' }}</span>
     </div>
     <div class="no-print w-full">
       <div 
         v-if="autoDate" 
         class="w-full bg-transparent border-b mt-4 border-dotted border-black flex items-center"
         :style="{ fontSize: customerDetailsFontSize, minWidth: '0', height: '24px' }"
       >
         <span>{{ new Date().toLocaleDateString() }}</span>
       </div>
       <input
         v-else
         v-model="localDate"
         type="text"
         placeholder=" "
         class="w-full bg-transparent border-b border-dotted border-black focus:outline-none"
         :style="{ fontSize: customerDetailsFontSize, minWidth: '0' }"
       />
     </div>
    </div>

    <div class="flex items-center gap-0.5 mt-2" :class="invoiceWidth < 4 ? 'flex-col items-start gap-0' : ''">
      <span class="font-medium text-black whitespace-nowrap" :style="{ fontSize: customerDetailsFontSize }">L.P.O No.:</span>
      <div class="print-only w-full border-b border-dotted border-black" :style="{ borderBottom: `1px dotted ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)} !important`, fontSize: customerDetailsFontSize }">{{ localLpo || '-' }}</div>
      <input
        v-model="localLpo"
        placeholder=" "
        class="no-print w-full bg-transparent border-b border-dotted border-black focus:outline-none"
        :style="{ fontSize: customerDetailsFontSize, minWidth: '0' }"
      />
    </div>
    </div>


   
  </div>

  <!-- Table -->
  <div class="flex-grow overflow-visible rounded relative isolate" :style="{ marginTop: dynamicSpacing, minHeight: 'fit-content', paddingLeft: '0px', paddingRight: '0px', paddingBottom: '0px' }">
    <table class="w-full text-xs table-fixed border-collapse overflow-visible relative" style="table-layout: fixed; position: relative;">
      <thead 
        class="uppercase"
        :style="{
          background: colorStyles.accentColor,
          color: colorStyles.headerText
        }"
      >
        <tr>
          <th 
            :class="invoiceData.taxEnabled ? 'w-[8.5%]' : 'w-[9.1%]'" 
            class="px-1.5 py-2 text-center" 
            data-text-id="table-header-qty"
            :style="{ 
              borderTop: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderRight: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderBottom: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderLeft: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`,
              fontSize: tableHeaderFontSize,
              whiteSpace: tableHeaderFontSize <= '8px' ? 'normal' : 'nowrap',
              wordBreak: tableHeaderFontSize <= '8px' ? 'break-word' : 'normal',
              lineHeight: '1.2'
            }"
          >
            QTY
          </th>
          <th 
            :class="invoiceData.taxEnabled ? 'w-[45%]' : 'w-[52%]'" 
            class="px-1.5 py-2 text-left" 
            data-text-id="table-header-description"
            :style="{ 
              borderTop: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderRight: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderBottom: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderLeft: `1px solid ${cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k)}`,
              fontSize: tableHeaderFontSize,
              whiteSpace: tableHeaderFontSize <= '8px' ? 'normal' : 'nowrap',
              wordBreak: tableHeaderFontSize <= '8px' ? 'break-word' : 'normal',
              lineHeight: '1.2'
            }"
          >
            DESCRIPTION OF GOODS
          </th>
          <th 
            :class="invoiceData.taxEnabled ? 'w-[9%]' : 'w-[16%]'" 
            class="px-1.5 py-3 text-center" 
            data-text-id="table-header-rate"
            :style="{ 
              borderTop: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderRight: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderBottom: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderLeft: `1px solid ${cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k)}`,
              fontSize: tableHeaderFontSize,
              whiteSpace: tableHeaderFontSize <= '8px' ? 'normal' : 'nowrap',
              wordBreak: tableHeaderFontSize <= '8px' ? 'break-word' : 'normal',
              lineHeight: '1.2'
            }"
          >
            RATE
          </th>
          <th 
            v-if="invoiceData.taxEnabled" 
            class="w-[7%] px-1.5 py-2 text-center" 
            data-text-id="table-header-tax"
            :style="{ 
              borderTop: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderRight: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderBottom: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderLeft: `1px solid ${cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k)}`,
              fontSize: tableHeaderFontSize,
              whiteSpace: tableHeaderFontSize <= '8px' ? 'normal' : 'nowrap',
              wordBreak: tableHeaderFontSize <= '8px' ? 'break-word' : 'normal',
              lineHeight: '1.2'
            }"
          >
            TAX%
          </th>
          <th 
            class="w-[50%] text-center p-0" 
            data-text-id="table-header-amount"
            :style="{ 
              width: amountColumnWidth,
              borderTop: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderRight: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderBottom: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, 
              borderLeft: `1px solid ${cmykToRgbCss(cmykColors.white.c, cmykColors.white.m, cmykColors.white.y, cmykColors.white.k)}`,
              fontSize: tableHeaderFontSize,
              whiteSpace: tableHeaderFontSize <= '8px' ? 'normal' : 'nowrap',
              wordBreak: tableHeaderFontSize <= '8px' ? 'break-word' : 'normal',
              lineHeight: '1.2'
            }"
          >
            AMOUNT
            <div class="flex items-center p-0 justify-between border-t border-white">
              <span class="flex-1">&#8358; (N)</span>
              <div class="border-l border-1 border-white w-[25%] h-full flex items-center justify-center">(K)</div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody style="position: relative; z-index: 1;">
        <tr v-for="(item, index) in items" :key="item.id" class="border-t border-black group relative" :style="{ height: tableRowHeight }">
          <td class="px-1.5 py-0.1 text-center align-middle border-black" :style="{ height: tableRowHeight, border: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}` }">
            <div 
              class="w-full h-auto text-center bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded text-[11px] leading-tight px-1 py-0.5"
              data-text-id="table-cell-qty"
              contenteditable="true"
              @blur="handleCellEdit(index, 'quantity', $event)"
              @keydown.enter.prevent="$event.target.blur()"
            >{{ item.quantity != null && item.quantity !== 0 && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : '' }}</div>
          </td>
          <td class="px-1.5 py-0.1 align-middle border-black" :style="{ height: tableRowHeight, border: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}` }">
            <div 
              class="w-full h-auto bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded text-[11px] leading-tight px-1 py-0.5"
              data-text-id="table-cell-description"
              contenteditable="true"
              @blur="handleCellEdit(index, 'description', $event)"
              @keydown.enter.prevent="$emit('add-item-after', index)"
            >{{ item.description || '' }}</div>
          </td>
          <td class="px-1.5 py-0.1 text-right align-middle border-black" :style="{ height: tableRowHeight, border: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}` }">
            <div 
              class="w-full h-auto text-right bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded text-[11px] leading-tight px-1 py-0.5"
              data-text-id="table-cell-rate"
              contenteditable="true"
              @blur="handleCellEdit(index, 'price', $event)"
              @keydown.enter.prevent="$event.target.blur()"
            >{{ item.price != null && item.price !== 0 && !isNaN(item.price) ? Number(item.price).toFixed(2) : '' }}</div>
          </td>
          <td v-if="invoiceData.taxEnabled" class="px-1.5 py-0.1 text-center align-middle border-black" :style="{ height: tableRowHeight, border: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}` }">
            <div 
              class="w-full h-auto text-center bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded text-[11px] leading-tight px-1 py-0.5"
              data-text-id="table-cell-tax"
              contenteditable="true"
              @blur="handleCellEdit(index, 'tax', $event)"
              @keydown.enter.prevent="$event.target.blur()"
            >{{ item.tax != null && item.tax !== 0 && !isNaN(item.tax) ? item.tax : '' }}</div>
          </td>
          <td class="px-0 py-0.1 align-middle border-black relative" :style="{ height: tableRowHeight, border: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}` }">
            <div class="flex h-full">
              <!-- Naira Cell (Whole Number) -->
              <div class="flex-1 px-1.5 py-0.1 border-r border-black flex items-center justify-center" style="background-color: #E0F2FE;">
                <span class="text-[11px]">{{ getItemAmount(item) > 0 ? Math.floor(getItemAmount(item)) : '' }}</span>
              </div>
              <!-- Kobo Cell (Decimal Part) -->
              <div :style="{ width: koboColumnWidth }" class="px-1.5 py-0.1 flex items-center justify-center" style="background-color: #E0F2FE;">
                <span class="text-[11px]">{{ getItemAmount(item) > 0 ? Math.round((getItemAmount(item) % 1) * 100) : '' }}</span>
              </div>
            </div>
            <!-- Delete button absolutely positioned on right edge -->
            <button 
              v-if="items.length > 1"
              class="absolute right-[-8px] top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 w-4 h-4 flex items-center justify-center text-sm font-bold hover:scale-110 bg-white rounded-full shadow-md border border-red-200"
              style="z-index: 9999;"
              title="Remove item"
              @click="$emit('remove-item', item.id)"
            >
              ×
            </button>
          </td>
        </tr>
      </tbody>


    </table>
    <!-- Total -->
    <div class="flex relative font-bold text-slate-900 text-base">
      
      <!-- Add button absolutely positioned at bottom left -->
      <button 
        :disabled="items.length >= maxItems"
        class="absolute left-[-8px] top-[-20px] translate-y-1/2 text-emerald-500 hover:text-emerald-600 disabled:text-gray-300 disabled:cursor-not-allowed opacity-0 hover:opacity-100 transition-all duration-200 w-5 h-5 flex items-center justify-center text-base font-bold hover:scale-110 bg-white rounded-full shadow-md border border-emerald-300 disabled:border-gray-300"
        style="z-index: 9999;"
        :title="items.length >= maxItems ? `Maximum ${maxItems} items allowed` : 'Add new item'"
        @click="$emit('add-item')"
      >
        +
      </button>
      
      
    <div class="flex-1 justify-end flex">
      <span class="mr-2 flex items-center px-1.5 py-1 font-black align-middle text-[13px]" data-text-id="total-label" :style="{ height: tableRowHeight }">TOTAL:</span>
      <!-- Combined Total Box with Naira and Kobo sections -->
      <div class="px-0 py-0.1 font-semibold align-middle relative overflow-visible text-[11px] border-black" :style="{ height: tableRowHeight, border: `1px solid ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)}`, width: totalBoxWidth, minWidth: totalBoxMinWidth }">
        <div class="flex h-full">
          <!-- Naira Total -->
          <div class="flex-1 px-1.5 py-0.1 flex items-center justify-center border-r border-black" style="background-color: #E0F2FE;">
            <span class="font-bold text-sm">{{ totalNaira > 0 && !isNaN(totalNaira) ? '₦' + Number(totalNaira) : '' }}</span>
          </div>
          <!-- Kobo Total -->
          <div :style="{ width: koboTotalWidth }" class="px-1.5 py-0.1 flex items-center justify-center" style="background-color: #E0F2FE;">
            <span class="font-bold text-sm">{{ totalKobo > 0 && !isNaN(totalKobo) ? Number(totalKobo) : '' }}</span>
          </div>
        </div>
      </div>
    </div>  
    </div>
    
   
  </div>


  <!-- Footer -->
  <div class="mt-auto" :style="{ fontSize: footerFontSize }">

    <div>
      <div class="flex items-center gap-1">
      <span class="flex whitespace-nowrap font-medium" data-text-id="amount-in-words-label">Amount in words:</span>
      <div class="print-only flex-1 border-b border-dotted border-black" :style="{ borderBottom: `1px dotted ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)} !important`, fontSize: '1.2em', fontFamily: 'Montserrat, sans-serif', fontWeight: '700', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }">{{ localSumOf ? localSumOf + ' Only' : '' }}</div>
      <input
        ref="sumOfInput1"
        v-model="localSumOf"
        class="no-print flex-1 bg-transparent border-b border-dotted border-black focus:outline-none"
        :style="{ fontSize: '1.2em', fontFamily: 'Montserrat, sans-serif', fontWeight: '700', wordWrap: 'break-word' }"
        @input="$emit('sum-of-overflow')"
        
      />
    </div>

    <div class="flex items-center h-7 gap-2">
      <div class="print-only flex-1 border-b border-dotted border-black" :style="{ borderBottom: `1px dotted ${cmykToRgbCss(cmykColors.black.c, cmykColors.black.m, cmykColors.black.y, cmykColors.black.k)} !important`, fontSize: '1.2em', fontFamily: 'Montserrat, sans-serif', fontWeight: '700', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }">{{ localSumOf2 ? localSumOf2 + ' Only' : '' }}</div>
      <input
        ref="sumOfInput2"
        v-model="localSumOf2"
        type="text"
        class="no-print flex-1 bg-transparent border-b border-dotted border-black focus:outline-none"
        :style="{ fontSize: '1.2em', fontFamily: 'Montserrat, sans-serif', fontWeight: '700', wordWrap: 'break-word' }"
        @input="$emit('sum-of2-input')"
        
      />
      <span class="whitespace-nowrap font-medium inline-flex items-baseline" :style="{ fontSize: footerFontSize, lineHeight: 1 }">Naira</span>
      <div class="w-14 bg-transparent border-b border-dotted border-black flex items-center justify-center text-center" style="min-height: 20px; line-height: 1;">
      </div>
      <span class="whitespace-nowrap font-medium inline-flex items-baseline" :style="{ fontSize: footerFontSize, lineHeight: 1 }">Kobo</span>
    </div>

    </div>

     <div class="flex justify-between items-start" :style="{ marginTop: '2px', minHeight: 0, flex: '0 0 auto' }">
     
      <!-- Signature 1 -->
      <div class="flex flex-col items-center gap-1 mt-[-15px]">
        <!-- Signature 1 Image -->
        <div v-if="signatureImage1" class="flex items-center" :style="{ height: signatureHeight }">
          <img :src="signatureImage1" alt="Signature 1" class="w-auto object-contain" :style="{ height: signatureImageHeight, maxWidth: '120px' }" />
        </div>

        <div v-else class="flex items-center justify-center" :style="{ height: signatureHeight, width: '7rem' }">
          <!-- Empty space for signature -->
        </div>

       <div class="w-full border-t border-black text-center mt-[-28px]">
         <p class="italic text-[10px]">Manager's Sign</p>
       </div> 
      </div>

      <!-- Thanks for your patronage -->
       <div class="mt-2 text-center font-medium text-[13px]" :style="{ color: colorStyles.primaryText }">Thanks for your patronage</div>

    <!-- Signature 2 -->
      <div class="flex flex-col items-center gap-1 mt-[-15px]">
        <!-- Signature 2 Image -->
        <div v-if="signatureImage2" class="flex items-center" :style="{ height: signatureHeight }">
          <img :src="signatureImage2" alt="Signature 2" class="w-auto object-contain" :style="{ height: signatureImageHeight, maxWidth: '120px' }" />
        </div>

        <div v-else class="flex items-center justify-center" :style="{ height: signatureHeight, width: '7rem' }">
          <!-- Empty space for signature -->
        </div>

       <div class="w-full border-t border-black text-center mt-[-28px]">
         <p class="italic text-[10px]">Customer's Sign</p>
       </div> 
      </div>
      
    </div>
  </div>
  <!-- End of Footer -->

    </div>
    <!-- End of invoice-content-wrapper -->
  </div>
  <!-- End of contentWrapperRef -->
</div>
<!-- End of meblink-invoice -->
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue';

export default defineComponent({
  name: 'InvoiceTemplate3',

  props: {
    // Dimensions
    invoiceWidth: { type: Number, required: true },
    invoiceHeight: { type: Number, required: true },

    // Font sizes (all computed in parent)
    baseFontSize: { type: [Number, String], required: true },
    organizationNameFontSize: { type: String, default: '16px' },
    organizationSubFontSize: { type: String, default: '11px' },
    addressFontSize: { type: String, default: '10px' },
    phoneFontSize: { type: String, default: '10px' },
    customerDetailsFontSize: { type: String, default: '11px' },
    tableHeaderFontSize: { type: String, default: '10px' },
    tableRowHeight: { type: String, default: '24px' },
    footerFontSize: { type: String, default: '10px' },
    signatureHeight: { type: String, default: '50px' },
    signatureImageHeight: { type: String, default: '40px' },

    // Spacing (computed in parent)
    dynamicPadding: { type: String, default: '8px' },
    dynamicSpacing: { type: String, default: '4px' },

    // Column widths (computed in parent)
    amountColumnWidth: { type: String, default: '30%' },
    koboColumnWidth: { type: String, default: '25%' },
    koboTotalWidth: { type: String, default: '25%' },
    totalBoxWidth: { type: String, default: '200px' },
    totalBoxMinWidth: { type: String, default: '150px' },

    // Watermark
    enableTextBackground: { type: Boolean, default: false },
    watermarkVisible: { type: Boolean, default: false },
    watermarkType: { type: String, default: 'organization' },
    watermarkOpacity: { type: Number, default: 0.1 },

    // Organization info
    logoDataUrl: { type: String, default: null },
    logoHeight: { type: Number, default: 60 },
    organizationName: { type: String, default: '' },
    organizationSubName: { type: String, default: '' },
    organizationReceiptSubName: { type: String, default: '' },
    headOfficeAddress: { type: String, default: '' },
    headOfficePhone: { type: String, default: '' },

    // Invoice info
    showPageNumbers: { type: Boolean, default: true },
    currentInvoiceNumber: { type: [String, Number], default: '' },
    autoDate: { type: Boolean, default: false },

    // Items & invoice data
    items: { type: Array, required: true },
    invoiceData: { type: Object, required: true },
    maxItems: { type: Number, default: 20 },

    // Totals (computed in parent)
    totalNaira: { type: Number, default: 0 },
    totalKobo: { type: Number, default: 0 },

    // Colors
    cmykColors: { type: Object, required: true },
    colorStyles: { type: Object, required: true },

    // Signatures
    signatureImage1: { type: String, default: null },
    signatureImage2: { type: String, default: null },

    // v-model fields
    customerName: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    customerAddress2: { type: String, default: '' },
    date: { type: String, default: '' },
    lpo: { type: String, default: '' },
    sumOf: { type: String, default: '' },
    sumOf2: { type: String, default: '' },
  },

  emits: [
    'update:customerName',
    'update:customerAddress',
    'update:customerAddress2',
    'update:date',
    'update:lpo',
    'update:sumOf',
    'update:sumOf2',
    'save-invoice-data',
    'add-item',
    'add-item-after',
    'remove-item',
    'sum-of-overflow',
    'sum-of2-input',
    'logo-error',
    'cell-edit',
  ],

  setup(props, { emit, expose }) {
    // Template refs
    const invoiceRef = ref(null);
    const contentWrapperRef = ref(null);
    const sumOfInput1 = ref(null);
    const sumOfInput2 = ref(null);

    // Local writeable computed for v-model fields
    const localCustomerName = computed({
      get: () => props.customerName,
      set: (val) => emit('update:customerName', val),
    });

    const localCustomerAddress = computed({
      get: () => props.customerAddress,
      set: (val) => emit('update:customerAddress', val),
    });

    const localCustomerAddress2 = computed({
      get: () => props.customerAddress2,
      set: (val) => emit('update:customerAddress2', val),
    });

    const localDate = computed({
      get: () => props.date,
      set: (val) => emit('update:date', val),
    });

    const localLpo = computed({
      get: () => props.lpo,
      set: (val) => emit('update:lpo', val),
    });

    const localSumOf = computed({
      get: () => props.sumOf,
      set: (val) => emit('update:sumOf', val),
    });

    const localSumOf2 = computed({
      get: () => props.sumOf2,
      set: (val) => emit('update:sumOf2', val),
    });

    // Internal helper – CMYK to RGB CSS
    const cmykToRgbCss = (c, m, y, k) => {
      const cN = c / 100;
      const mN = m / 100;
      const yN = y / 100;
      const kN = k / 100;
      const r = Math.round(255 * (1 - cN) * (1 - kN));
      const g = Math.round(255 * (1 - mN) * (1 - kN));
      const b = Math.round(255 * (1 - yN) * (1 - kN));
      return `rgb(${r}, ${g}, ${b})`;
    };

    // Internal helper – calculate item amount
    const getItemAmount = (item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const baseAmount = quantity * price;

      if (props.invoiceData.taxEnabled) {
        const taxAmount = baseAmount * ((item.tax || 0) / 100);
        return baseAmount + taxAmount;
      }
      return baseAmount;
    };

    // Handle cell edit from contenteditable and notify parent
    const handleCellEdit = (index, field, event) => {
      const rawValue = event.target.textContent;
      let value;
      if (field === 'description') {
        value = rawValue;
      } else {
        value = parseFloat(rawValue) || 0;
      }
      emit('cell-edit', { index, field, value });
      emit('save-invoice-data');
    };

    // Expose refs so parent can access for export / PDF / resize observer
    expose({
      invoiceRef,
      contentWrapperRef,
      sumOfInput1,
      sumOfInput2,
    });

    return {
      invoiceRef,
      contentWrapperRef,
      sumOfInput1,
      sumOfInput2,
      localCustomerName,
      localCustomerAddress,
      localCustomerAddress2,
      localDate,
      localLpo,
      localSumOf,
      localSumOf2,
      cmykToRgbCss,
      getItemAmount,
      handleCellEdit,
    };
  },
});
</script>

<style scoped>
/* Organization name - APK & PDF safe */
.organization-name {
  font-family: 'Arial Black', 'Arial Bold', Arial, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.25;
  text-align: center;
  white-space: normal;
  word-break: normal;
  overflow-wrap: anywhere;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}

/* Invoice preview styling */
#meblink-invoice {
  font-family: 'Arial', sans-serif;
}

#meblink-invoice table {
  border-collapse: collapse;
}

#meblink-invoice table td,
#meblink-invoice table th {
  border: 1px solid #d1d5db;
}

/* Mobile touch and scroll optimization */
@media (max-width: 768px) {
  .relative.min-h-screen {
    touch-action: pan-x pan-y pinch-zoom;
    -webkit-overflow-scrolling: touch;
  }

  section.w-full.overflow-auto {
    overflow-x: auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y pinch-zoom;
  }

  #meblink-invoice {
    touch-action: pan-x pan-y pinch-zoom;
  }
}

/* Font loading optimization */
#meblink-invoice {
  font-display: swap;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Fallback font for better compatibility */
#meblink-invoice * {
  font-family: inherit;
}

/* Print/No-Print classes for interactive editing */
@media screen {
  .print-only {
    display: none !important;
  }
}

@media print {
  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }
}
</style>
