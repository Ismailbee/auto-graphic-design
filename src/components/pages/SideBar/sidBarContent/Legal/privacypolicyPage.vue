<template>
  <ion-page>
    <page-header label="Privacy Policy" />
    <ion-content>
      <div class="bg-secondary min-h-screen w-full px-6 pb-24 sm:px-24 py-10">
        <div class="mx-auto max-w-3xl bg-white rounded-2xl shadow-lg p-8">
          <h1 class="text-3xl font-extrabold text-primary mb-6 text-center">Privacy Policy</h1>
          <p class="text-gray-700 mb-6 text-center">
            Last updated: August 22, 2025
          </p>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">1. Introduction</h2>
            <p class="text-gray-700">
              Golden Printer ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">2. Information We Collect</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li><b>Personal Information:</b> Name, email address, profile image, and other information you provide when registering.</li>
              <li><b>Usage Data:</b> Pages visited, features used, and actions taken within the app.</li>
              <li><b>Device Information:</b> Device type, operating system, browser type, and IP address.</li>
              <li><b>Cookies & Tracking:</b> We use cookies and similar technologies to enhance your experience.</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">3. How We Use Your Information</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>To provide and maintain our services</li>
              <li>To personalize your experience</li>
              <li>To communicate with you (support, updates, marketing)</li>
              <li>To improve our platform and develop new features</li>
              <li>To ensure security and prevent fraud</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">4. Sharing Your Information</h2>
            <p class="text-gray-700">
              We do not sell your personal information. We may share your data with trusted third-party service providers for purposes such as hosting, analytics, and customer support, but only as necessary and with appropriate safeguards.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">5. Data Security</h2>
            <p class="text-gray-700">
              We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">6. Your Rights & Choices</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>Access, update, or delete your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Adjust your privacy settings in the app</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">7. Children's Privacy</h2>
            <p class="text-gray-700">
              Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">8. Changes to This Policy</h2>
            <p class="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the date at the top of this page.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-primary mb-2">9. Contact Us</h2>
            <p class="text-gray-700">
              If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:support@goldenprinter.com" class="text-contrast underline">support@goldenprinter.com</a>.
            </p>
          </section>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import pageHeader from "../../../Header/pageHeader.vue";
</script>

<style scoped>
.bg-secondary {
  background-color: #f8f9fa;
}
.text-primary {
  color: #502800;
}
.text-contrast {
  color: #BA6900;
}
</style>