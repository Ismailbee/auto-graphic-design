<template>
  <ion-page>
    <page-header label="Help Center" />

    <ion-content class="ion-padding">
      <div class="max-w-4xl mx-auto">
        
        <!-- Welcome and Search Section -->
        <section class="text-center bg-white p-8 rounded-lg shadow-md">
          <ion-icon :icon="helpCircleOutline" class="text-5xl text-primary mb-4"></ion-icon>
          <h1 class="text-3xl font-bold text-gray-800">How can we help?</h1>
          <p class="text-gray-600 mt-2 mb-6">
            Find answers to your questions, browse our articles, or contact support.
          </p>
          <div class="max-w-lg mx-auto">
            <ion-searchbar
              v-model="searchQuery"
              placeholder="Search for articles..."
              @ionInput="handleSearch"
              class="custom-searchbar"
            ></ion-searchbar>
          </div>
        </section>

        <!-- Categories Section -->
        <section class="mt-8">
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Browse by Category</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div v-for="category in categories" :key="category.title" class="bg-white p-6 rounded-lg text-center transition-transform hover:scale-105 cursor-pointer shadow-sm">
              <ion-icon :icon="category.icon" class="text-3xl text-primary"></ion-icon>
              <h3 class="font-semibold mt-2">{{ category.title }}</h3>
              <p class="text-sm text-gray-500">{{ category.description }}</p>
            </div>
          </div>
        </section>

        <!-- FAQ Section -->
        <section class="mt-8">
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Frequently Asked Questions</h2>
          <ion-list>
            <div v-for="(faq, index) in faqs" :key="index" class="bg-white mb-2 rounded-lg overflow-hidden shadow-sm">
              <ion-item lines="full" @click="toggleAccordion(index)" button>
                <ion-label class="font-medium">{{ faq.question }}</ion-label>
                <ion-icon :icon="openAccordion === index ? chevronUp : chevronDown" name="end"></ion-icon>
              </ion-item>
              <div v-if="openAccordion === index" class="p-4 bg-gray-50 text-gray-700">
                {{ faq.answer }}
              </div>
            </div>
          </ion-list>
        </section>

        <!-- Contact Support Section -->
        <section class="mt-8 text-center bg-white p-8 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold text-gray-800">Still Need Help?</h2>
          <p class="text-gray-600 mt-2 mb-6">
            Our support team is here to assist you. Get in touch with us for personalized help.
          </p>
          <ion-button @click="goToContactPage" expand="block" color="primary" class="max-w-xs mx-auto">
            Contact Support
          </ion-button>
        </section>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonContent, 
  IonSearchbar, 
  IonIcon, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonButton 
} from '@ionic/vue';
import { 
  helpCircleOutline, 
  bookOutline, 
  personCircleOutline, 
  cardOutline, 
  settingsOutline,
  chevronDown,
  chevronUp
} from 'ionicons/icons';
import pageHeader from '../../../Header/pageHeader.vue';

const router = useRouter();
const searchQuery = ref('');
const openAccordion = ref(null);

const categories = ref([
  { title: 'Getting Started', description: 'Learn the basics of our app.', icon: bookOutline },
  { title: 'Account & Profile', description: 'Manage your account settings.', icon: personCircleOutline },
  { title: 'Billing & Subscriptions', description: 'Handle payments and plans.', icon: cardOutline },
  { title: 'Features & Tools', description: 'Explore all the features.', icon: settingsOutline },
]);

const faqs = ref([
  { question: 'How do I reset my password?', answer: 'You can reset your password by going to the login page and clicking "Forgot Password". Follow the instructions sent to your email.' },
  { question: 'How do I update my billing information?', answer: 'Navigate to Account > Billing and you will find options to update your payment method.' },
  { question: 'Can I cancel my subscription at any time?', answer: 'Yes, you can cancel your subscription at any time from your account settings. Your subscription will remain active until the end of the current billing period.' },
  { question: 'How do I contact customer support?', answer: 'You can contact us via the "Contact Support" button on this page or by emailing support@example.com.' },
]);

const handleSearch = (event) => {
  console.log('Searching for:', event.detail.value);
  // Implement search logic here
};

const toggleAccordion = (index) => {
  openAccordion.value = openAccordion.value === index ? null : index;
};

const goToContactPage = () => {
  router.push('/contact'); // Adjust the route as needed
};
</script>

<style scoped>
ion-content {
  --background: #f4f5f8;
}

.text-primary {
  color: var(--ion-color-primary);
}

.custom-searchbar {
  --border-radius: 12px;
  --box-shadow: none;
  border: 1px solid #e0e0e0;
}
</style>