<template>
  <ion-page>
    <page-header label="Contact Support" />

    <ion-content>
      <div class="bg-secondary min-h-screen w-full px-6 pb-[150px] sm:pb-0 sm:px-[80px] py-8">
        <!-- Breadcrumb -->
        <Breadcrumb
          prevPageName="Home"
          prevPageRoute="/home"
          currentPageName="Contact Support"
          class="pb-3"
        />

        <div class="mx-auto max-w-4xl">
          <div class="mb-8 text-center">
            <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl">Contact Us</h1>
            <p class="max-w-xl mx-auto mt-4 text-md text-gray-500">
              Need help or have a question? Reach out to our support team and we’ll get back to you as soon as possible.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <!-- Contact Form -->
            <form @submit.prevent="submitForm" class="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
              <ion-item lines="none">
                <ion-label position="floating">Your Name</ion-label>
                <ion-input v-model="form.name" required />
              </ion-item>
              <ion-item lines="none">
                <ion-label position="floating">Your Email</ion-label>
                <ion-input v-model="form.email" type="email" required />
              </ion-item>
              <ion-item lines="none">
                <ion-label position="floating">Message</ion-label>
                <ion-textarea v-model="form.message" rows="5" required />
              </ion-item>
              <ion-button expand="block" type="submit" color="primary">Send Message</ion-button>
              <div v-if="submitted" class="text-green-600 text-center mt-2">Thank you! We'll get back to you soon.</div>
            </form>

            <!-- Contact Info -->
            <div class="flex flex-col gap-6 justify-center">
              <div class="bg-white rounded-2xl shadow p-6">
                <h2 class="text-lg font-semibold mb-2">Contact Information</h2>
                <div class="flex items-center gap-2 mb-2">
                  <ion-icon name="mail-outline" class="text-primary"></ion-icon>
                  <span>support@goldenprinter.com</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <ion-icon name="call-outline" class="text-primary"></ion-icon>
                  <span>+1 (800) 123-4567</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <ion-icon name="location-outline" class="text-primary"></ion-icon>
                  <span>123 Golden Ave, Suite 100, Lagos, Nigeria</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <ion-icon name="time-outline" class="text-primary"></ion-icon>
                  <span>Support Hours: Mon-Fri, 9am - 6pm (WAT)</span>
                </div>
              </div>
              <div class="bg-white rounded-2xl shadow p-6">
                <h2 class="text-lg font-semibold mb-2">Follow Us</h2>
                <div class="flex gap-4">
                  <a href="https://twitter.com/goldenprinter" target="_blank" aria-label="Twitter">
                    <ion-icon name="logo-twitter" class="text-2xl text-blue-400 hover:text-blue-600"></ion-icon>
                  </a>
                  <a href="https://facebook.com/goldenprinter" target="_blank" aria-label="Facebook">
                    <ion-icon name="logo-facebook" class="text-2xl text-blue-600 hover:text-blue-800"></ion-icon>
                  </a>
                  <a href="https://instagram.com/goldenprinter" target="_blank" aria-label="Instagram">
                    <ion-icon name="logo-instagram" class="text-2xl text-pink-500 hover:text-pink-700"></ion-icon>
                  </a>
                  <a href="https://linkedin.com/company/goldenprinter" target="_blank" aria-label="LinkedIn">
                    <ion-icon name="logo-linkedin" class="text-2xl text-blue-700 hover:text-blue-900"></ion-icon>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import Breadcrumb from "@/components/pages/Breadcrumb.vue";
import pageHeader from "../../../Header/pageHeader.vue";

const form = ref({
  name: '',
  email: '',
  message: ''
})
const submitted = ref(false)

function submitForm() {
  // Here you would send the form data to your backend or email service
  submitted.value = true
  setTimeout(() => {
    submitted.value = false
    form.value = { name: '', email: '', message: '' }
  }, 4000)
}
</script>

<style scoped>
.bg-secondary {
  background-color: #f8f9fa;
}

.min-h-screen {
  min-height: 100vh;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.pb-150px {
  padding-bottom: 150px;
}

.sm\:pb-0 {
  padding-bottom: 0;
}

/* 
  The following selector is invalid in scoped CSS.
  If you want to apply these paddings, use Tailwind classes in your template,
  or move this to a global CSS file and use `.sm\:px-[80px]` as a selector there.
  Alternatively, you can use a media query here for the same effect:
*/
@media (min-width: 640px) {
  .px-80 {
    padding-left: 20rem;
    padding-right: 20rem;
  }
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.pb-3 {
  padding-bottom: 0.75rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.max-w-4xl {
  max-width: 56rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.text-center {
  text-align: center;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.font-extrabold {
  font-weight: 800;
}

.text-gray-900 {
  color: #111827;
}

.sm\:text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.max-w-xl {
  max-width: 36rem;
}

.mt-4 {
  margin-top: 1rem;
}

.text-md {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-gray-500 {
  color: #6b7280;
}

.grid {
  display: grid;
}

.md\:grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-8 {
  gap: 2rem;
}

.bg-white {
  background-color: #ffffff;
}

.rounded-2xl {
  border-radius: 1rem;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1);
}

.p-6 {
  padding: 1.5rem;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.gap-4 {
  gap: 1rem;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}
</style>