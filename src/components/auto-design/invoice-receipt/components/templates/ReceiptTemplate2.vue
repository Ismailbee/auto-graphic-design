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
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }"
  >
    <!-- Image Background Watermark -->
    <div
      v-if="enableTextBackground && watermarkVisible && (watermarkType === 'organization' || watermarkType === 'both')"
      class="absolute inset-0 overflow-hidden pointer-events-none"
      :style="{
        zIndex: 1,
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
        boxSizing: 'border-box'
      }"
    >
      <img
        src="/images/watamark-text.jpg"
        alt="Watermark Background"
        class="w-full h-full object-cover"
        :style="{
          opacity: watermarkOpacity,
          userSelect: 'none',
          pointerEvents: 'none'
        }"
      />
    </div>

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
          opacity: 0.05,
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
      <div
        class="invoice-content-wrapper flex flex-col h-full w-full"
        :style="{ paddingTop: '0.1in', paddingBottom: '0.1in', paddingLeft: '0.15in', paddingRight: '0.15in', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }"
      >
        <!-- Header -->
        <div class="text-center flex-shrink-0" :style="{ marginBottom: '0.02in' }">
          <div class="flex gap-3 items-start justify-center">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center justify-center">
              <div v-if="!logoDataUrl" class="text-xs text-gray-500 border border-gray-400 p-1">No Logo</div>
              <img
                v-if="logoDataUrl"
                :src="logoDataUrl"
                alt="Logo"
                class="object-contain"
                :style="{ height: `${logoHeight}px` }"
                @error="$emit('logo-error')"
              />
            </div>

            <!-- Organization Info -->
            <div style="flex: 1; text-align: center;">
              <h2
                v-if="organizationName?.trim()"
                class="organization-name"
                style="font-size: 20px !important; font-weight: 700; margin: 0; padding: 0; line-height: 1.2; -webkit-text-size-adjust: 100%; text-size-adjust: 100%;"
                :style="{ color: '#C80032', textTransform: 'uppercase' }"
              >
                {{ organizationName }}
              </h2>

              <p
                v-if="organizationSubName?.trim()"
                style="font-size: 14px !important; font-weight: 400; margin: 2px 0 0 0; padding: 0; line-height: 1.3;"
              >
                {{ organizationSubName }}
              </p>

              <p
                v-if="organizationReceiptSubName?.trim()"
                style="font-size: 14px !important; font-weight: 700; margin: 2px 0 0 0; padding: 0; line-height: 1.2; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px;"
              >
                {{ organizationReceiptSubName }}
              </p>
            </div>
          </div>
        </div>

        <!-- Head Office Address and Receipt Title -->
        <div class="flex justify-center items-center flex-shrink-0" :style="{ marginTop: '0.01in', marginBottom: '0.05in' }">
          <div v-if="headOfficeAddress?.trim() || headOfficePhone?.trim()" class="max-w-[280px] text-center" style="margin: 0; padding: 0;">
            <div v-if="headOfficeAddress?.trim()" class="text-left" style="line-height: 1.0;">
              <strong class="text-slate-900" :style="{ fontSize: '11px', display: 'block', marginBottom: '1px' }">Head Office Address:</strong>
            </div>
            <div v-if="headOfficeAddress?.trim()" class="text-left" style="line-height: 1.0;">
              <span class="text-slate-900" :style="{ fontSize: '11.5px', wordWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal', display: 'block' }">{{ headOfficeAddress }}</span>
            </div>
            <div v-if="headOfficePhone?.trim()" class="text-left mt-0" style="line-height: 1.0;">
              <strong class="font-bold text-slate-900" :style="{ fontSize: '11px', whiteSpace: 'normal' }">Tel:</strong>
              <span class="font-bold text-slate-900 ml-1" :style="{ fontSize: '11.5px', whiteSpace: 'pre-wrap', display: 'inline-block', maxWidth: '100%' }">{{ headOfficePhone }}</span>
            </div>
          </div>

          <!-- Receipt Title Banner -->
          <div class="flex justify-center items-center w-full">
            <p
              class="text-lg font-semibold inline-flex items-center justify-center px-3 py-2 rounded"
              :style="{
                background: '#C80032',
                color: '#FFFFFF',
                lineHeight: '1.2',
                minHeight: '24px',
                fontSize: '14px'
              }"
            >
              OFFICIAL CASH RECEIPT
            </p>
          </div>
        </div>

        <!-- Body -->
        <div
          class="flex-1 flex flex-col justify-between border-2 rounded-[30px] border-black"
          :style="{ padding: '0.15in 0.15in 0.2in 0.15in', boxSizing: 'border-box', minHeight: '0' }"
        >
          <div class="flex flex-col flex-shrink-0" :style="{ gap: '2px' }">
            <!-- Date and No. -->
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-1">
                <span class="font-medium" style="font-size: 14px;">Date:</span>
                <div
                  class="bg-transparent border-b-2 border-dotted border-black focus:outline-none min-w-[100px] h-[20px] flex items-center"
                  style="font-family: Georgia, serif; font-size: 16px; font-style: italic;"
                >
                  <span v-if="autoDate">{{ new Date().toLocaleDateString() }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1 mr-20">
                <span class="font-medium" style="font-size: 14px;">No.:</span>
                <div v-if="showPageNumbers" class="text-center text-base">{{ currentInvoiceNumber }}</div>
              </div>
            </div>

            <!-- Received From -->
            <div class="flex items-center gap-1" style="margin-top: 3px;">
              <span class="font-medium" style="font-size: 16px;">Received From:</span>
              <input
                ref="receivedFromInput"
                v-model="localReceivedFrom"
                class="flex-1 bg-transparent border-b-2 border-solid border-black focus:outline-none"
                style="font-family: Georgia, serif; font-size: 16px; font-weight: 700; font-style: italic; color: #000;"
              />
            </div>

            <!-- Sum of Line 1 -->
            <div class="flex items-center gap-1" style="margin-top: 1.5px;">
              <span class="font-medium" style="font-size: 16px;">The Sum of:</span>
              <input
                ref="sumOfInput1"
                v-model="localSumOf"
                @input="$emit('sum-of-overflow')"
                placeholder=" "
                class="flex-1 bg-transparent border-b-2 border-solid border-black focus:outline-none"
                style="font-family: Georgia, serif; font-size: 16px; font-weight: 700; font-style: italic; color: #000; width: 100%; min-width: 0;"
              />
            </div>

            <!-- Sum of Line 2 -->
            <div class="flex items-center gap-2" style="margin-top: 1.5px;">
              <input
                ref="sumOfInput2"
                v-model="localSumOf2"
                @input="$emit('sum-of2-input')"
                placeholder=" "
                class="flex-1 bg-transparent border-b-2 border-solid border-black focus:outline-none"
                style="font-family: Georgia, serif; font-size: 16px; font-weight: 700; font-style: italic; color: #000; width: 100%; min-width: 0;"
              />
              <div class="flex items-center gap-1 pt-3">
                <span class="font-medium" style="font-size: 16px;">Naira</span>
                <div class="w-14 bg-transparent border-b-2 mt-3 border-solid border-black flex items-center justify-center text-center">
                  <span class="font-medium" style="font-size: 14px;"></span>
                </div>
                <span class="font-medium" style="font-size: 16px;">Kobo</span>
              </div>
            </div>

            <!-- Being Payment For Line 1 -->
            <div class="flex items-center gap-1" style="margin-top: 1.5px;">
              <span class="font-medium" style="font-size: 16px;">Being Payment for:</span>
              <input
                ref="paymentForInput1"
                v-model="localPaymentFor"
                @input="$emit('payment-for-overflow')"
                class="flex-1 bg-transparent border-b-2 border-solid border-black focus:outline-none"
                style="font-family: Georgia, serif; font-size: 16px; font-weight: 700; font-style: italic; color: #000;"
              />
            </div>

            <!-- Being Payment For Line 2 -->
            <div class="flex items-center gap-2" style="margin-top: 1.5px;">
              <input
                ref="paymentForInput2"
                v-model="localPaymentFor2"
                @input="$emit('payment-for2-input')"
                class="flex-1 bg-transparent border-b-2 border-solid border-black focus:outline-none"
                style="font-family: Georgia, serif; font-size: 16px; font-weight: 700; font-style: italic; color: #000;"
              />
            </div>
          </div>

          <!-- Signature Section -->
          <div class="flex justify-between items-end flex-shrink-0 -mt-2">
            <!-- Signature 1 -->
            <div class="flex flex-col items-center" :style="{ gap: '2px', flex: '0 0 auto', minWidth: '90px' }">
              <div v-if="signatureImage1" class="flex items-end justify-center" :style="{ height: '0.5in', marginBottom: '0in' }">
                <img :src="signatureImage1" alt="Signature 1" class="w-auto object-contain object-bottom" :style="{ maxHeight: '0.5in', maxWidth: '1.8in' }" />
              </div>
              <div v-else class="flex items-center justify-center" :style="{ height: '0.5in', width: '1.5in' }"></div>
              <div class="w-full border-t-2 border-black text-center" :style="{ paddingTop: '0px' }">
                <p class="italic" :style="{ fontSize: '12px', lineHeight: '1.2' }">Signature</p>
              </div>
            </div>

            <!-- Amount in figures -->
            <div class="flex flex-col items-center justify-end" :style="{ flex: '1 1 auto', maxWidth: '40%' }">
              <div class="border-2 border-yellow-400 bg-yellow-50" :style="{ padding: '0in', minWidth: '1.5in', minHeight: '0.4in', display: 'flex', justifyContent: 'center', alignItems: 'center' }">
                <span v-if="naira && naira > 0" class="font-bold" :style="{ fontSize: '18px' }">₦{{ formattedNaira }}</span>
              </div>
            </div>

            <!-- Signature 2 -->
            <div class="flex flex-col items-center" :style="{ gap: '2px', flex: '0 0 auto', minWidth: '90px' }">
              <div v-if="signatureImage2" class="flex items-end justify-center" :style="{ height: '0.5in', marginBottom: '0in' }">
                <img :src="signatureImage2" alt="Signature 2" class="w-auto object-contain object-bottom" :style="{ maxHeight: '0.5in', maxWidth: '1.8in' }" />
              </div>
              <div v-else class="flex items-center justify-center" :style="{ height: '0.5in', width: '1.5in' }"></div>
              <div class="w-full border-t-2 border-black text-center" :style="{ paddingTop: '0px' }">
                <p class="italic" :style="{ fontSize: '12px', lineHeight: '1.2' }">Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'ReceiptTemplate2',

  props: {
    // Dimensions
    invoiceWidth: { type: Number, required: true },
    invoiceHeight: { type: Number, required: true },

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

    // Receipt info
    showPageNumbers: { type: Boolean, default: true },
    currentInvoiceNumber: { type: [String, Number], default: '' },
    autoDate: { type: Boolean, default: false },

    // Amount
    naira: { type: [Number, String], default: 0 },
    formattedNaira: { type: String, default: '' },

    // Colors – accepted but 2-color overrides accent to #C80032
    colorStyles: { type: Object, default: () => ({ accentColor: '#C80032', headerText: '#ffffff' }) },

    // Signatures
    signatureImage1: { type: String, default: null },
    signatureImage2: { type: String, default: null },

    // v-model fields
    receivedFrom: { type: String, default: '' },
    sumOf: { type: String, default: '' },
    sumOf2: { type: String, default: '' },
    paymentFor: { type: String, default: '' },
    paymentFor2: { type: String, default: '' },
  },

  emits: [
    'update:receivedFrom',
    'update:sumOf',
    'update:sumOf2',
    'update:paymentFor',
    'update:paymentFor2',
    'sum-of-overflow',
    'sum-of2-input',
    'payment-for-overflow',
    'payment-for2-input',
    'logo-error',
  ],

  setup(props, { emit, expose }) {
    const invoiceRef = ref(null);
    const contentWrapperRef = ref(null);
    const receivedFromInput = ref(null);
    const sumOfInput1 = ref(null);
    const sumOfInput2 = ref(null);
    const paymentForInput1 = ref(null);
    const paymentForInput2 = ref(null);

    const localReceivedFrom = computed({
      get: () => props.receivedFrom,
      set: (val) => emit('update:receivedFrom', val),
    });

    const localSumOf = computed({
      get: () => props.sumOf,
      set: (val) => emit('update:sumOf', val),
    });

    const localSumOf2 = computed({
      get: () => props.sumOf2,
      set: (val) => emit('update:sumOf2', val),
    });

    const localPaymentFor = computed({
      get: () => props.paymentFor,
      set: (val) => emit('update:paymentFor', val),
    });

    const localPaymentFor2 = computed({
      get: () => props.paymentFor2,
      set: (val) => emit('update:paymentFor2', val),
    });

    expose({
      invoiceRef,
      contentWrapperRef,
      sumOfInput1,
      sumOfInput2,
      paymentForInput1,
      paymentForInput2,
    });

    return {
      invoiceRef,
      contentWrapperRef,
      receivedFromInput,
      sumOfInput1,
      sumOfInput2,
      paymentForInput1,
      paymentForInput2,
      localReceivedFrom,
      localSumOf,
      localSumOf2,
      localPaymentFor,
      localPaymentFor2,
    };
  },
});
</script>

<style scoped>
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

#meblink-invoice {
  font-family: 'Arial', sans-serif;
  font-display: swap;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#meblink-invoice * {
  font-family: inherit;
}

@media screen {
  .print-only { display: none !important; }
}

@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
}
</style>
