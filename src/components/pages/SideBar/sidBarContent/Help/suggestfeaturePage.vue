<template>
  <ion-page>
    <page-header label="Suggest a Feature" />

    <ion-content class="ion-padding">
      <div class="max-w-2xl mx-auto">
        
        <Breadcrumb
          prevPageName="Home"
          prevPageRoute="/home"
          currentPageName="Suggest a Feature"
          class="pb-6"
        />

        <div class="bg-white p-8 rounded-xl shadow-lg text-center">
          
          <ion-icon :icon="bulbOutline" class="text-5xl text-primary mb-4"></ion-icon>
          
          <h1 class="text-3xl font-bold text-gray-800">Have a great idea?</h1>
          <p class="text-gray-600 mt-2">
            We'd love to hear it! Share your suggestions to help us improve our app.
          </p>

          <form @submit.prevent="submitSuggestion" class="mt-8 text-left">
            <ion-item class="mb-4">
              <ion-label position="stacked">Feature Title</ion-label>
              <ion-input v-model="form.title" placeholder="e.g., Add a dark mode" required></ion-input>
            </ion-item>

            <ion-item class="mb-4">
              <ion-label position="stacked">Category</ion-label>
              <ion-select v-model="form.category" placeholder="Select a category" required>
                <ion-select-option value="ui">UI/UX Improvement</ion-select-option>
                <ion-select-option value="performance">Performance</ion-select-option>
                <ion-select-option value="new-tool">New Tool or Feature</ion-select-option>
                <ion-select-option value="integration">Integration</ion-select-option>
                <ion-select-option value="other">Other</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Describe your idea</ion-label>
              <ion-textarea 
                v-model="form.description" 
                :rows="6" 
                placeholder="Please describe your suggestion in detail. What problem does it solve?"
                required
              ></ion-textarea>
            </ion-item>

            <ion-button type="submit" expand="block" color="primary" class="mt-8">
              Submit Suggestion
            </ion-button>
          </form>
        </div>
      </div>
    </ion-content>
    <ion-toast
      :is-open="toast.isOpen"
      :message="toast.message"
      :duration="2500"
      @didDismiss="toast.isOpen = false"
    ></ion-toast>
  </ion-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonTextarea, 
  IonButton, 
  IonSelect, 
  IonSelectOption,
  IonIcon,
  IonToast
} from '@ionic/vue';
import { bulbOutline } from 'ionicons/icons';
import pageHeader from "../../../Header/pageHeader.vue";
import Breadcrumb from "@/components/pages/Breadcrumb.vue";

const router = useRouter();

const form = reactive({
  title: '',
  category: null,
  description: ''
});

const toast = reactive({
  isOpen: false,
  message: '',
});

const submitSuggestion = () => {
  if (!form.title || !form.category || !form.description) {
    toast.message = 'Please fill out all fields.';
    toast.isOpen = true;
    return;
  }

  console.log('Suggestion submitted:', form);
  
  toast.message = 'Thank you for your suggestion!';
  toast.isOpen = true;

  // Reset form
  Object.assign(form, {
    title: '',
    category: null,
    description: ''
  });

  setTimeout(() => {
    router.back();
  }, 2800);
};
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}

ion-item {
  --border-radius: 8px;
  --padding-start: 12px;
  --background: #ffffff;
  border: 1px solid #e0e0e0;
  margin-bottom: 1rem;
}
</style>
