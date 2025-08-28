<template>
  <ion-page>
    <page-header label="Rate Our App" />

    <ion-content class="ion-padding">
      <div class="flex flex-col items-center justify-center h-full text-center">
        <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
          
          <ion-icon :icon="starHalfOutline" class="text-5xl text-yellow-400 mb-4"></ion-icon>

          <h2 class="text-2xl font-bold text-gray-800">Enjoying Our App?</h2>
          <p class="text-gray-600 mt-2">
            Your feedback helps us improve. Please take a moment to rate your experience.
          </p>

          <div class="my-6">
            <h3 class="font-semibold text-lg mb-3">Your Rating</h3>
            <div class="flex justify-center items-center space-x-2">
              <ion-icon
                v-for="star in 5"
                :key="star"
                :icon="rating >= star ? starIcon : starOutlineIcon"
                @click="setRating(star)"
                class="text-4xl cursor-pointer text-yellow-400 transition-transform hover:scale-110"
                :aria-label="`Rate ${star} star`"
              ></ion-icon>
            </div>
          </div>

          <div class="w-full">
            <ion-item lines="none" class="rounded-lg border border-gray-200">
              <ion-label position="stacked" class="ml-2 mb-1 font-medium">Share your thoughts (optional)</ion-label>
              <ion-textarea
                v-model="feedback"
                :rows="4"
                placeholder="Tell us what you liked or what could be better..."
                class="p-2"
              ></ion-textarea>
            </ion-item>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row gap-3 w-full">
            <ion-button @click="submitFeedback" expand="block" color="primary" class="flex-1">
              Submit Feedback
            </ion-button>
            <ion-button @click="dismiss" expand="block" fill="outline" color="medium" class="flex-1">
              Not Now
            </ion-button>
          </div>

        </div>
      </div>
    </ion-content>
    <ion-toast
        :is-open="toast.isOpen"
        :message="toast.message"
        :duration="2000"
        @didDismiss="toast.isOpen = false"
      ></ion-toast>
  </ion-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonTextarea, IonButton, IonLabel, IonItem, IonToast } from '@ionic/vue';
import { star as starIcon, starOutline as starOutlineIcon, starHalfOutline } from 'ionicons/icons';
import pageHeader from '../../../Header/pageHeader.vue';

const router = useRouter();

const rating = ref(0);
const feedback = ref('');
const toast = reactive({
  isOpen: false,
  message: '',
});

const setRating = (value) => {
  rating.value = value;
};

const submitFeedback = () => {
  if (rating.value === 0) {
    toast.message = 'Please select a rating before submitting.';
    toast.isOpen = true;
    return;
  }
  
  console.log('Rating:', rating.value);
  console.log('Feedback:', feedback.value);

  // Here you would typically send the feedback to a server
  
  toast.message = 'Thank you for your feedback!';
  toast.isOpen = true;

  setTimeout(() => {
    router.back();
  }, 2200);
};

const dismiss = () => {
  router.back();
};
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}
</style>