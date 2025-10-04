<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>Export Settings</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="dismissModal()">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <p>Configure the imposition settings for your editor content.</p>
    <ion-list>
      <ion-item>
        <ion-select label="Imposition Type" label-placement="stacked" v-model="impositionType">
          <ion-select-option value="booklet">Booklet</ion-select-option>
          <ion-select-option value="2up">2-Up</ion-select-option>
          <ion-select-option value="4up">4-Up</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-select label="Sheet Size" label-placement="stacked" v-model="pageSize">
          <ion-select-option value="A4">A4</ion-select-option>
          <ion-select-option value="A3">A3</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-toggle v-model="addBlankPages">Add blank pages</ion-toggle>
      </ion-item>
    </ion-list>

    <div v-if="isProcessing" class="ion-text-center ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Processing your document...</p>
    </div>

    <ion-button 
      expand="block" 
      @click="handleConfirm" 
      :disabled="isProcessing"
      class="ion-margin-top">
      <ion-icon slot="start" :icon="cogOutline"></ion-icon>
      Confirm and Generate
    </ion-button>

    <ion-toast
      :is-open="!!errorMessage"
      :message="errorMessage"
      :duration="5000"
      @didDismiss="errorMessage = ''"
      color="danger"
      position="top"
    ></ion-toast>
  </ion-content>
</template>

<script setup>
import { ref } from 'vue';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
  IonList, IonItem, IonSelect, IonSelectOption, IonToggle, IonSpinner, IonToast,
  modalController
} from '@ionic/vue';
import { cogOutline } from 'ionicons/icons';
import { jsPDF } from 'jspdf';
import { backendApi } from '@/services/backendApi.js';

// Props passed from the editor page
const props = defineProps({
  editorCanvas: Object
});

const impositionType = ref('booklet');
const pageSize = ref('A4');
const addBlankPages = ref(true);
const isProcessing = ref(false);
const errorMessage = ref('');

const dismissModal = (data = null) => {
  modalController.dismiss(data);
};

const handleConfirm = async () => {
  if (!props.editorCanvas) {
    errorMessage.value = "Editor canvas was not provided.";
    return;
  }

  isProcessing.value = true;
  errorMessage.value = '';

  try {
    // 1. Convert canvas to a PDF file
    const doc = new jsPDF({
      orientation: props.editorCanvas.width > props.editorCanvas.height ? 'l' : 'p',
      unit: 'pt',
      format: [props.editorCanvas.width, props.editorCanvas.height]
    });
    doc.addImage(props.editorCanvas.toDataURL('image/png'), 'PNG', 0, 0, props.editorCanvas.width, props.editorCanvas.height);
    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], "editor-export.pdf", { type: "application/pdf" });

    // 2. Send to backend
    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('type', impositionType.value);
    formData.append('pageSize', pageSize.value);
    formData.append('addBlankPages', addBlankPages.value);

    const resultBlob = await backendApi.impose(formData);
    
    // 3. Dismiss modal and return the result
    dismissModal({ imposedPdfBlob: resultBlob });

  } catch (error) {
    errorMessage.value = `Error: ${error.message}`;
  } finally {
    isProcessing.value = false;
  }
};
</script>